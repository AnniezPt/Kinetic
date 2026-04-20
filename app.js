// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAspSyjZo2yPxEdTj-i3S8w8q1V4kqwEe8",
    authDomain: "kinetic-6bfb2.firebaseapp.com",
    databaseURL: "https://kinetic-6bfb2-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "kinetic-6bfb2",
    storageBucket: "kinetic-6bfb2.firebasestorage.app",
    messagingSenderId: "789239934405",
    appId: "1:789239934405:web:ea2f4e3ffba4cefaac2fac"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = localStorage.getItem('kinetic_user') || null;

let appData = {
    users: {
        ana: { calories: 0, weight: 62.4, streak: 0, hydration: 2, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
        nestor: { calories: 0, weight: 85.0, streak: 0, hydration: 3, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200" }
    },
    shared: {
        calendar: {}, viewYear: 2026, viewMonth: 3,
        workouts: [{ title: "EMPUJE", exercises: [{ name: "Press Banca", weight: 80, sets: 4, reps: 10, rest: "90s" }] }],
        mealsToday: [], mealsHistory: [],
        sessions: []
    }
};

db.ref('kinetic_v2026_master_final').on('value', (s) => {
    const d = s.val();
    if (d) { 
        appData = d; 
        if (currentUser) renderAll(); 
        else renderSelection();
    }
});

function sync() { db.ref('kinetic_v2026_master_final').set(appData); }

function selectUser(user) {
    currentUser = user; localStorage.setItem('kinetic_user', user);
    document.getElementById('profile-selector').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    renderAll();
}

function renderSelection() {
    document.getElementById('sel-img-ana').src = appData.users.ana.avatar;
    document.getElementById('sel-img-nestor').src = appData.users.nestor.avatar;
}

function renderAll() {
    const user = appData.users[currentUser];
    const shared = appData.shared;

    document.getElementById('header-avatar').src = user.avatar;
    document.getElementById('profile-img-big').src = user.avatar;
    document.getElementById('user-display-name').innerText = currentUser.toUpperCase();
    document.getElementById('profile-name-big').innerText = currentUser.toUpperCase();

    // Dash
    document.getElementById('dash-active-cals').innerText = user.calories;
    document.getElementById('dash-current-weight').innerText = user.weight.toFixed(1);
    document.getElementById('dash-streak').innerText = `${user.streak} DÍAS`;
    const goal = 1650;
    document.getElementById('dash-rem-cals').innerText = Math.max(0, goal - user.calories);
    const p = Math.min(100, (user.calories / goal) * 100);
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";

    // Entrenos (Editor Interno)
    document.getElementById('workout-container').innerHTML = shared.workouts.map((g, i) => `
        <div class="card-premium">
            <div class="flex justify-between items-center mb-8">
                <h3 class="text-3xl font-black italic uppercase tracking-tighter">${g.title}</h3>
                <div class="flex gap-4">
                    <button onclick="addExercise(${i})" class="text-[#0047ff]"><i class="ph ph-plus-circle text-2xl"></i></button>
                    <button onclick="deleteBlock(${i})" class="text-slate-800"><i class="ph ph-trash text-2xl"></i></button>
                </div>
            </div>
            <div class="space-y-4">${g.exercises.map((ex, j) => `
                <div class="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50">
                    <div class="flex justify-between mb-4">
                        <p class="font-black italic uppercase text-slate-300 text-sm">${ex.name}</p>
                        <button onclick="editExercise(${i}, ${j})" class="text-[#0047ff]"><i class="ph ph-pencil-simple"></i></button>
                    </div>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div><p class="text-[7px] font-black text-slate-600 uppercase">KG</p><p class="text-xs font-black">${ex.weight}</p></div>
                        <div><p class="text-[7px] font-black text-slate-600 uppercase">Sets</p><p class="text-xs font-black">${ex.sets}</p></div>
                        <div><p class="text-[7px] font-black text-slate-600 uppercase">Reps</p><p class="text-xs font-black">${ex.reps}</p></div>
                        <div><p class="text-[7px] font-black text-slate-600 uppercase">Rest</p><p class="text-xs font-black">${ex.rest}</p></div>
                    </div>
                </div>`).join('')}</div>
        </div>`).join('');

    // Dieta
    let sK=0, sP=0, sF=0;
    document.getElementById('today-meals').innerHTML = shared.mealsToday.map(m => {
        sK+=parseInt(m.kcal); sP+=parseInt(m.pro); sF+=parseInt(m.fat);
        return `<div class="bg-[#1c1f26] rounded-3xl p-6 border border-slate-800 flex items-center gap-6">
            <img src="${m.img || 'https://via.placeholder.com/100'}" class="w-16 h-16 rounded-2xl object-cover">
            <div class="flex-1"><p class="font-black text-slate-300 italic mb-1 uppercase text-sm">${m.name}</p>
            <p class="text-[9px] font-black text-[#0047ff] uppercase">${m.kcal} kcal • ${m.pro}g P • ${m.fat}g G</p></div></div>`;
    }).join('');
    document.getElementById('nut-total-kcal').innerText = sK;
    document.getElementById('nut-total-pro').innerText = sP;
    document.getElementById('nut-total-fat').innerText = sF;

    // Hidratación
    const drops = document.getElementById('hydration-drops');
    drops.innerHTML = [1,2,3,4,5].map((_, i) => `<i onclick="setHydration(${i+1})" class="ph-fill ph-drop text-3xl cursor-pointer ${i < user.hydration ? 'text-[#0047ff] shadow-[0_0_10px_#0047ff]':'text-slate-800'}"></i>`).join('');
    document.getElementById('hydration-bar').style.width = (user.hydration / 5) * 100 + "%";

    // Historial
    document.getElementById('history-meals').innerHTML = shared.mealsHistory.map(h => `
        <div class="bg-slate-900/30 p-6 rounded-3xl border border-slate-800/30">
            <p class="text-[9px] font-black text-slate-600 uppercase mb-2">${h.date}</p><p class="font-bold text-slate-400 italic text-sm">${h.summary}</p>
        </div>`).join('');

    // Dúo y Sesiones
    document.getElementById('sessions-container').innerHTML = shared.sessions.map(s => `
        <div class="bg-[#1c1f26] p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
            <div><p class="text-[9px] font-black text-slate-500 uppercase">${s.date}</p><p class="font-black italic">${s.start} - ${s.end}</p></div>
            <i class="ph ph-calendar-check text-2xl text-[#0047ff]"></i>
        </div>`).join('');

    renderCalendar();
}

// EDITORES
function editStat(type) {
    let val = prompt(`Actualizar ${type}:`, appData.users[currentUser][type]);
    if (val !== null) { appData.users[currentUser][type] = (type === 'streak' || type === 'calories') ? parseInt(val) : parseFloat(val); sync(); }
}
function setHydration(v) { appData.users[currentUser].hydration = v; sync(); }

// CALENDARIO PULIDO (ESTÉTICA ORIGINAL)
let currentTool = null;
function setTool(t) { currentTool = (currentTool === t) ? null : t; ['you', 'sync'].forEach(id => { document.getElementById(`tool-${id}`).style.borderColor = (currentTool === id) ? '#0047ff' : 'transparent'; }); }

function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    const { viewYear: y, viewMonth: m } = appData.shared;
    const today = new Date();
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('cal-title').innerText = names[m];
    let html = '';
    const days = new Date(y, m + 1, 0).getDate();
    for(let i = 1; i <= days; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appData.shared.calendar[key];
        const isToday = today.getDate() === i && today.getMonth() === m && today.getFullYear() === y;
        let mark = '';
        if(status === 'ana') mark = '<div class="w-2.5 h-2.5 bg-[#0047ff] rounded-full mx-auto mt-1 shadow-[0_0_8px_#0047ff]"></div>';
        if(status === 'nestor') mark = '<div class="w-2.5 h-2.5 bg-[#8b4513] rounded-full mx-auto mt-1"></div>';
        if(status === 'sync') mark = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-[#0047ff] rounded-full"></div><div class="w-1.5 h-1.5 bg-[#8b4513] rounded-full"></div></div>';
        html += `<div onclick="clickDay(${i})" class="calendar-day p-4 transition-all active:scale-90 border-2 ${isToday ? 'today' : 'border-transparent'}"><span class="text-xs font-black text-slate-500">${i}</span>${mark}</div>`;
    }
    cont.innerHTML = html;
}
function clickDay(day) { if (currentTool) { const key = `${appData.shared.viewYear}-${appData.shared.viewMonth}-${day}`; appData.shared.calendar[key] = (currentTool === 'you') ? currentUser : 'sync'; sync(); } }

// PERFIL: CAMBIO FOTO
document.getElementById('img-upload').onchange = (e) => {
    const r = new FileReader();
    r.onload = (ev) => { appData.users[currentUser].avatar = ev.target.result; sync(); };
    r.readAsDataURL(e.target.files[0]);
};

// DIETA PRO: FOTO Y GUARDADO
let tempMealImg = '';
document.getElementById('m-img-file').onchange = (e) => { const r = new FileReader(); r.onload = (ev) => { tempMealImg = ev.target.result; }; r.readAsDataURL(e.target.files[0]); };
function saveMeal() {
    const meal = { name: document.getElementById('m-name').value, kcal: document.getElementById('m-kcal').value || 0, pro: document.getElementById('m-pro').value || 0, fat: document.getElementById('m-fat').value || 0, img: tempMealImg };
    appData.shared.mealsToday.push(meal);
    appData.users[currentUser].calories += parseInt(meal.kcal);
    sync(); closeModal('modal-meal');
}

// ENTRENOS PRO
function addWorkoutBlock() { const title = prompt("Nombre rutina (ej: EMPUJE):"); if(title){ appData.shared.workouts.push({ title: title.toUpperCase(), exercises: [] }); sync(); } }
function addExercise(idx) { const name = prompt("Nombre ejercicio:"); if(name){ appData.shared.workouts[idx].exercises.push({ name, weight: 0, sets: 0, reps: 0, rest: "60s" }); sync(); } }
function editExercise(b, e) {
    const ex = appData.shared.workouts[b].exercises[e];
    ex.weight = prompt("Peso (kg):", ex.weight); ex.sets = prompt("Sets:", ex.sets); ex.reps = prompt("Reps:", ex.reps); ex.rest = prompt("Descanso:", ex.rest);
    sync();
}

// UTILS
function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${id}`).classList.add('active');
    document.getElementById(`tab-${id}`).classList.add('active');
}
function logout() { localStorage.removeItem('kinetic_user'); location.reload(); }
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function closeOverlay(e) { if(e.target.classList.contains('modal')) e.target.classList.remove('active'); }
function changeMonth(dir) { appData.shared.viewMonth += dir; if(appData.shared.viewMonth > 11){ appData.shared.viewMonth=0; appData.shared.viewYear++; } sync(); }
function saveSession() { appData.shared.sessions.push({ date: document.getElementById('s-date').value, start: document.getElementById('s-start').value, end: document.getElementById('s-end').value }); sync(); closeModal('modal-session'); }

window.onload = () => { if(currentUser) selectUser(currentUser); };
