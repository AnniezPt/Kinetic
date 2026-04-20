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

// DATOS ORIGINALES RESTAURADOS
let appData = {
    users: {
        ana: { calories: 0, weight: 62.4, streak: 0, hydration: 2, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
        nestor: { calories: 0, weight: 85.0, streak: 0, hydration: 3, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200" }
    },
    shared: {
        calendar: {},
        viewYear: 2026, viewMonth: 3, // Abril
        goals: [{ title: "Deadlift 230kg", done: true }, { title: "Dominar Muscle Up", done: false }, { title: "Sentadilla 180kg", done: false }],
        notes: [
            { day: "20", monthYear: "ABR 2026", title: "Análisis de Fatiga", content: "Buenas sensaciones compartidas.", tags: ["Dúo"] }
        ],
        workouts: [
            { title: "EMPUJE", exercises: [{ name: "Press Banca", sets: 4, reps: "10" }, { name: "Press Militar", sets: 3, reps: "12" }] },
            { title: "TIRÓN", exercises: [{ name: "Dominadas", sets: 4, reps: "8" }, { name: "Remo Barra", sets: 4, reps: "10" }] },
            { title: "PIERNAS", exercises: [{ name: "Sentadilla", sets: 4, reps: "8" }, { name: "Peso Muerto", sets: 4, reps: "10" }] }
        ],
        meals: [
            { name: "Avena con whey", kcal: 450, type: "Desayuno" },
            { name: "Pollo con Quinoa", kcal: 620, type: "Comida" }
        ]
    }
};

// SYNC LIVE
db.ref('kinetic_v2026_master').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) { appData = data; if (currentUser) renderAll(); }
});

function sync() { db.ref('kinetic_v2026_master').set(appData); }

// SELECCION PERFIL
function selectUser(user) {
    currentUser = user;
    localStorage.setItem('kinetic_user', user);
    document.getElementById('profile-selector').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    renderAll();
}

function logout() { localStorage.removeItem('kinetic_user'); location.reload(); }

// RENDER TOTAL
function renderAll() {
    const user = appData.users[currentUser];
    const shared = appData.shared;

    document.getElementById('header-avatar').src = user.avatar;
    document.getElementById('user-display-name').innerText = currentUser.toUpperCase();

    // Dash
    document.getElementById('dash-active-cals').innerText = user.calories;
    document.getElementById('dash-current-weight').innerText = user.weight.toFixed(1);
    document.getElementById('dash-streak').innerText = `${user.streak} DÍAS`;
    const goal = 1650;
    document.getElementById('dash-rem-cals').innerText = Math.max(0, goal - user.calories);
    const p = Math.min(100, (user.calories / goal) * 100);
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";

    // Entreno
    document.getElementById('workout-groups-container').innerHTML = shared.workouts.map((g, i) => `
        <div class="bg-[#1c1f26] rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
            <div class="flex justify-between items-center mb-8">
                <div><h3 class="text-3xl font-black italic uppercase tracking-tighter text-white">${g.title}</h3><p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${g.exercises.length} EJERCICIOS</p></div>
                <div class="flex gap-3">
                    <button onclick="editWorkoutGroup(${i})" class="text-[#0047ff]"><i class="ph ph-pencil-simple text-2xl"></i></button>
                    <button onclick="deleteWorkoutGroup(${i})" class="text-red-900/40"><i class="ph ph-trash text-2xl"></i></button>
                </div>
            </div>
            <div class="space-y-4">${g.exercises.map(ex => `<div class="bg-slate-900/40 p-5 rounded-2xl flex justify-between items-center"><span class="font-bold text-slate-400 italic">${ex.name}</span><span class="text-sm font-black text-[#0047ff]">${ex.sets}x${ex.reps}</span></div>`).join('')}</div>
        </div>`).join('');

    // Dieta
    document.getElementById('nutrition-rem-kcal').innerText = (2500 - user.calories);
    const drops = document.getElementById('hydration-drops');
    drops.innerHTML = [1,2,3,4,5].map((_, i) => `<i onclick="setHydration(${i+1})" class="ph-fill ph-drop text-3xl cursor-pointer ${i < user.hydration ? 'text-[#0047ff] shadow-[0_0_10px_#0047ff]':'text-slate-800'}"></i>`).join('');
    document.getElementById('hydration-bar').style.width = (user.hydration / 5) * 100 + "%";
    document.getElementById('meals-container').innerHTML = shared.meals.map((m, i) => `<div class="bg-[#1c1f26] rounded-[2rem] p-6 border border-slate-800 flex justify-between items-center"><div><h4 class="font-black text-[9px] text-slate-500 uppercase tracking-widest">${m.type}</h4><p class="font-bold text-slate-300 italic">${m.name}</p></div><div class="flex items-center gap-4"><span class="font-black text-[#0047ff]">${m.kcal} Kcal</span><button onclick="deleteMeal(${i})" class="text-slate-700"><i class="ph ph-x text-lg"></i></button></div></div>`).join('');

    // Diario
    document.getElementById('goals-container').innerHTML = `<h4 class="font-black text-[11px] uppercase text-slate-500 mb-8 tracking-widest italic border-b border-slate-800 pb-3">Shared Goals</h4>` + shared.goals.map((g, i) => `<div onclick="toggleGoal(${i})" class="flex items-center gap-5 mb-5 cursor-pointer group"><div class="w-7 h-7 rounded-xl border-2 flex items-center justify-center ${g.done ? 'bg-[#0047ff] border-[#0047ff] shadow-[0_0_10px_#0047ff]' : 'border-slate-800'}">${g.done ? '<i class="ph-bold ph-check text-xs text-white"></i>' : ''}</div><span class="font-black text-sm ${g.done ? 'line-through text-slate-700' : 'text-slate-300'}">${g.title}</span></div>`).join('');
    document.getElementById('notes-container').innerHTML = shared.notes.map(n => `<div class="bg-[#1c1f26] p-10 rounded-[3rem] border border-slate-800 shadow-2xl"><p class="text-[#0047ff] font-black text-5xl mb-2 italic tracking-tighter">${n.day}</p><p class="text-[10px] font-black text-slate-500 uppercase mb-5 tracking-widest">${n.monthYear}</p><h4 class="font-black text-2xl mb-4 text-slate-200">${n.title}</h4><p class="text-slate-500 text-sm leading-relaxed">${n.content}</p></div>`).join('');

    renderCalendar();
}

// EDITORES (LÁPICES)
function editStat(type) {
    const val = prompt(`Actualizar ${type}:`, appData.users[currentUser][type]);
    if(val !== null) {
        appData.users[currentUser][type] = (type === 'streak' || type === 'calories') ? parseInt(val) : parseFloat(val);
        sync();
    }
}
function setHydration(v) { appData.users[currentUser].hydration = v; sync(); }
function toggleGoal(i) { appData.shared.goals[i].done = !appData.shared.goals[i].done; sync(); }

// CALENDARIO DYNAMIC
let currentTool = null;
function setDuoTool(tool) {
    currentTool = (currentTool === tool) ? null : tool;
    ['you', 'synced'].forEach(t => { 
        document.getElementById(`tool-${t}`).style.borderColor = (currentTool === t) ? '#0047ff' : '#1e293b';
        document.getElementById(`tool-${t}`).style.background = (currentTool === t) ? 'rgba(0, 71, 255, 0.1)' : '#1c1f26';
    });
}
function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    const { viewYear: y, viewMonth: m } = appData.shared;
    const today = new Date();
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerText = names[m];
    let html = ['L','M','X','J','V','S','D'].map(d => `<div class="text-[10px] font-black text-slate-700 uppercase mb-2">${d}</div>`).join('');
    const first = new Date(y, m, 1).getDay();
    const padding = first === 0 ? 6 : first - 1;
    const days = new Date(y, m + 1, 0).getDate();
    for(let i=0; i<padding; i++) html += `<div></div>`;
    for(let i = 1; i <= days; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appData.shared.calendar[key];
        const isToday = today.getDate() === i && today.getMonth() === m && today.getFullYear() === y;
        let mark = '';
        if(status === 'ana') mark = '<div class="w-2 h-2 bg-[#0047ff] rounded-full mx-auto mt-1 shadow-[0_0_5px_#0047ff]"></div>';
        if(status === 'nestor') mark = '<div class="w-2 h-2 bg-[#8b4513] rounded-full mx-auto mt-1"></div>';
        if(status === 'synced') mark = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-[#0047ff] rounded-full"></div><div class="w-1.5 h-1.5 bg-[#8b4513] rounded-full"></div></div>';
        html += `<div onclick="clickDay(${i})" class="calendar-day p-4 cursor-pointer border-2 active:scale-90 transition-all ${isToday ? 'today' : 'border-transparent'}"><span class="text-xs font-black text-slate-500">${i}</span>${mark}</div>`;
    }
    cont.innerHTML = html;
}
function clickDay(day) {
    const key = `${appData.shared.viewYear}-${appData.shared.viewMonth}-${day}`;
    if(currentTool) {
        appData.shared.calendar[key] = (currentTool === 'you') ? currentUser : 'synced';
        sync();
    }
}
function changeMonth(dir) {
    appData.shared.viewMonth += dir;
    if(appData.shared.viewMonth > 11) { appData.shared.viewMonth = 0; appData.shared.viewYear++; }
    if(appData.shared.viewMonth < 0) { appData.shared.viewMonth = 11; appData.shared.viewYear--; }
    sync();
}

// FUNCIONES AÑADIR (BOTONES +)
function addWorkoutGroup() {
    const title = prompt("Nombre de la nueva rutina (ej: FULL BODY):");
    if(title) { appData.shared.workouts.push({ title: title.toUpperCase(), exercises: [] }); sync(); }
}
function addMeal() {
    const name = prompt("¿Qué has comido?");
    const kcal = prompt("Kcal:");
    if(name && kcal) { 
        appData.shared.meals.push({ name, kcal: parseInt(kcal), type: "EXTRA" });
        appData.users[currentUser].calories += parseInt(kcal);
        sync(); 
    }
}
function addNote() {
    const t = prompt("Título de la nota:");
    const c = prompt("Contenido:");
    if(t && c) { appData.shared.notes.unshift({ day: new Date().getDate(), monthYear: "ABR 2026", title: t, content: c }); sync(); }
}

function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${id}`).classList.add('active');
    document.getElementById(`tab-${id}`).classList.add('active');
}

window.onload = () => { if(currentUser) selectUser(currentUser); };
