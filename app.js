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

// ESTADO INICIAL COMPLETO
let appData = {
    users: {
        ana: { calories: 0, weight: 62.4, streak: 0, hydration: 2, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
        nestor: { calories: 0, weight: 85.0, streak: 0, hydration: 3, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200" }
    },
    shared: {
        calendar: {},
        viewYear: 2026, viewMonth: 3, // Abril
        goals: [{ title: "Deadlift 230kg", done: true }, { title: "Muscle Up", done: false }],
        notes: [
            { day: "20", monthYear: "ABR 2026", title: "Análisis de Fatiga", content: "Buenas sensaciones compartidas.", tags: ["Dúo"] }
        ],
        workouts: [
            { id: 'w1', title: "EMPUJE", exercises: [{ name: "Press Banca", sets: 4, reps: "10" }, { name: "Press Militar", sets: 3, reps: "12" }] },
            { id: 'w2', title: "TIRÓN", exercises: [{ name: "Dominadas", sets: 4, reps: "8" }, { name: "Remo Barra", sets: 4, reps: "10" }] }
        ],
        meals: [
            { name: "Avena con whey", kcal: 450, type: "Desayuno" },
            { name: "Pollo con Quinoa", kcal: 620, type: "Comida" }
        ]
    }
};

// SYNC LIVE
db.ref('kinetic_v2026_final').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) { appData = data; if (currentUser) renderAll(); }
});

function sync() { db.ref('kinetic_v2026_final').set(appData); }

// LOGICA SESION
function selectUser(user) {
    currentUser = user;
    localStorage.setItem('kinetic_user', user);
    document.getElementById('profile-selector').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    renderAll();
}

function logout() { localStorage.removeItem('kinetic_user'); location.reload(); }

// RENDERIZADO
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

    // Workout
    document.getElementById('workout-groups-container').innerHTML = shared.workouts.map((g, i) => `
        <div class="bg-[#1c1f26] rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
            <div class="flex justify-between items-center mb-6">
                <div><h3 class="text-2xl font-black italic uppercase">${g.title}</h3><p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${g.exercises.length} EJERCICIOS</p></div>
                <div class="flex gap-2">
                    <button onclick="editWorkout(${i})" class="text-slate-500"><i class="ph ph-pencil-simple text-xl"></i></button>
                    <button onclick="deleteWorkout(${i})" class="text-red-900/50"><i class="ph ph-trash text-xl"></i></button>
                </div>
            </div>
            <div class="space-y-3">${g.exercises.map(ex => `<div class="bg-slate-900/50 p-4 rounded-2xl flex justify-between"><span class="font-bold text-slate-400 text-sm">${ex.name}</span><span class="text-xs font-black text-[#0047ff]">${ex.sets}x${ex.reps}</span></div>`).join('')}</div>
        </div>`).join('');

    // Dieta
    document.getElementById('nutrition-rem-kcal').innerText = (2500 - user.calories);
    const drops = document.getElementById('hydration-drops');
    drops.innerHTML = [1,2,3,4,5].map((_, i) => `<i onclick="setHydration(${i+1})" class="ph-fill ph-drop text-2xl cursor-pointer ${i < user.hydration ? 'text-[#0047ff]':'text-slate-800'}"></i>`).join('');
    document.getElementById('hydration-bar').style.width = (user.hydration / 5) * 100 + "%";
    document.getElementById('meals-container').innerHTML = shared.meals.map(m => `<div class="bg-[#1c1f26] rounded-3xl p-6 border border-slate-800 flex justify-between items-center"><div><h4 class="font-black text-[9px] text-slate-500 uppercase tracking-widest">${m.type}</h4><p class="font-bold text-slate-300 italic">${m.name}</p></div><span class="font-black text-[#0047ff]">${m.kcal} KCAL</span></div>`).join('');

    // Diario
    document.getElementById('goals-container').innerHTML = `<h4 class="font-black text-[10px] uppercase text-slate-500 mb-6 tracking-widest italic">Shared Goals</h4>` + shared.goals.map((g, i) => `<div onclick="toggleGoal(${i})" class="flex items-center gap-4 mb-4 cursor-pointer group"><div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center ${g.done ? 'bg-[#0047ff] border-[#0047ff]' : 'border-slate-800'}">${g.done ? '<i class="ph-bold ph-check text-xs"></i>' : ''}</div><span class="font-bold text-sm ${g.done ? 'line-through text-slate-600' : 'text-slate-300'}">${g.title}</span></div>`).join('');
    document.getElementById('notes-container').innerHTML = shared.notes.map(n => `<div class="bg-[#1c1f26] p-8 rounded-[2.5rem] border border-slate-800"><p class="text-[#0047ff] font-black text-4xl mb-1 italic">${n.day}</p><p class="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">${n.monthYear}</p><h4 class="font-black text-xl mb-3 text-slate-200">${n.title}</h4><p class="text-slate-500 text-sm leading-relaxed">${n.content}</p></div>`).join('');

    renderCalendar();
}

// EDITORES
function editStat(type) {
    const val = prompt(`Update ${type}:`, appData.users[currentUser][type]);
    if(val !== null) { 
        if(type === 'streak' || type === 'calories') appData.users[currentUser][type] = parseInt(val);
        else appData.users[currentUser][type] = parseFloat(val);
        sync(); 
    }
}
function setHydration(v) { appData.users[currentUser].hydration = v; sync(); }
function toggleGoal(i) { appData.shared.goals[i].done = !appData.shared.goals[i].done; sync(); }

// CALENDARIO
let currentTool = null;
function setDuoTool(tool) {
    currentTool = (currentTool === tool) ? null : tool;
    ['you', 'synced'].forEach(t => { 
        const btn = document.getElementById(`tool-${t}`);
        btn.style.borderColor = (currentTool === t) ? '#0047ff' : '#1e293b';
        btn.style.background = (currentTool === t) ? '#0047ff10' : '#1c1f26';
    });
}

function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    const { viewYear: y, viewMonth: m } = appData.shared;
    const today = new Date();
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerText = names[m];
    
    let html = ['L','M','X','J','V','S','D'].map(d => `<div class="text-[10px] font-black text-slate-700 uppercase">${d}</div>`).join('');
    const first = new Date(y, m, 1).getDay();
    const padding = first === 0 ? 6 : first - 1;
    const days = new Date(y, m + 1, 0).getDate();

    for(let i=0; i<padding; i++) html += `<div></div>`;

    for(let i = 1; i <= days; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appData.shared.calendar[key];
        const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === i;
        
        let mark = '';
        if(status === 'ana') mark = '<div class="w-2 h-2 bg-[#0047ff] rounded-full mx-auto mt-1 shadow-[0_0_5px_#0047ff]"></div>';
        if(status === 'nestor') mark = '<div class="w-2 h-2 bg-[#8b4513] rounded-full mx-auto mt-1"></div>';
        if(status === 'synced') mark = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-[#0047ff] rounded-full"></div><div class="w-1.5 h-1.5 bg-[#8b4513] rounded-full"></div></div>';
        
        html += `<div onclick="clickDay(${i})" class="calendar-day p-4 cursor-pointer active:scale-95 transition-all ${isToday ? 'border-[#0047ff] bg-[#0047ff]/5' : ''}">
            <span class="text-xs font-black text-slate-400">${i}</span>${mark}</div>`;
    }
    cont.innerHTML = html;
}

function clickDay(day) {
    const key = `${appData.shared.viewYear}-${appData.shared.viewMonth}-${day}`;
    if(currentTool) {
        if(currentTool === 'you') appData.shared.calendar[key] = currentUser;
        else appData.shared.calendar[key] = 'synced';
        sync();
    }
}

function changeMonth(dir) {
    appData.shared.viewMonth += dir;
    if(appData.shared.viewMonth > 11) { appData.shared.viewMonth = 0; appData.shared.viewYear++; }
    if(appData.shared.viewMonth < 0) { appData.shared.viewMonth = 11; appData.shared.viewYear--; }
    sync();
}

function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.querySelector('i')) n.querySelector('i').classList.replace('ph-fill', 'ph');
    });
    document.getElementById(`view-${id}`).classList.add('active');
    const tab = document.getElementById(`tab-${id}`);
    if(tab) {
        tab.classList.add('active');
        if(tab.querySelector('i')) tab.querySelector('i').classList.replace('ph', 'ph-fill');
    }
}

function addMeal() {
    const name = prompt("Nombre de la comida:");
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
    if(t && c) {
        appData.shared.notes.unshift({ day: new Date().getDate(), monthYear: "ABR 2026", title: t, content: c });
        sync();
    }
}

window.onload = () => { if(currentUser) selectUser(currentUser); };
