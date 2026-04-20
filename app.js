// CONFIGURACIÓN FIREBASE
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

// ESTADO GLOBAL CON TODO EL CONTENIDO ORIGINAL
let appData = {
    users: {
        ana: { calories: 0, weight: 62.4, streak: 0, hydration: 2, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
        nestor: { calories: 0, weight: 85.0, streak: 0, hydration: 3, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200" }
    },
    shared: {
        calendar: {},
        viewYear: 2026, viewMonth: 3, // Empezamos en Abril (índice 3)
        goals: [{ title: "Deadlift 230kg", done: true }, { title: "Dominar Muscle Up", done: false }, { title: "Sentadilla 180kg", done: false }],
        notes: [
            { day: "20", monthYear: "ABR 2026", title: "Análisis de Fatiga", content: "El tren inferior se sintió pesado hoy. Controlar volumen.", tags: ["Pierna", "Análisis"] },
            { day: "18", monthYear: "ABR 2026", title: "Día de RP: Energía Pura", content: "Increíble sesión de empuje. Fuerza máxima.", tags: ["RP", "Fuerza"] }
        ],
        workouts: [
            { title: "EMPUJE", exercises: [{ name: "Press Inclinado", sets: 4, reps: "8-10" }, { name: "Press Militar", sets: 3, reps: "12" }] },
            { title: "TIRÓN", exercises: [{ name: "Dominadas", sets: 4, reps: "8" }, { name: "Remo Barra", sets: 4, reps: "10" }] },
            { title: "PIERNAS", exercises: [{ name: "Sentadilla", sets: 4, reps: "8" }, { name: "Peso Muerto", sets: 4, reps: "10" }] }
        ],
        meals: [
            { name: "Avena con whey", kcal: 450, type: "Desayuno" },
            { name: "Pollo con Quinoa", kcal: 620, type: "Comida" }
        ]
    }
};

// SINCRONIZACIÓN LIVE
db.ref('kinetic_v4_final').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) { appData = data; if (currentUser) renderAll(); }
});

function sync() { db.ref('kinetic_v4_final').set(appData); }

// INICIO Y SESIÓN
function selectUser(user) {
    currentUser = user;
    localStorage.setItem('kinetic_user', user);
    document.getElementById('profile-selector').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    renderAll();
}

function logout() { localStorage.removeItem('kinetic_user'); location.reload(); }

// RENDERIZADO MAESTRO
function renderAll() {
    const user = appData.users[currentUser];
    const shared = appData.shared;

    // Header & Perfil
    document.getElementById('header-avatar').src = user.avatar;
    document.getElementById('profile-avatar-big').src = user.avatar;
    document.getElementById('profile-name-big').innerText = currentUser.toUpperCase();

    // Dashboard con Pincel/Lápiz
    document.getElementById('dash-active-cals').innerText = user.calories;
    document.getElementById('dash-current-weight').innerText = user.weight.toFixed(1);
    document.getElementById('dash-streak').innerText = `${user.streak} DÍAS`;
    const goal = 1650;
    document.getElementById('dash-rem-cals').innerText = Math.max(0, goal - user.calories);
    const p = Math.min(100, (user.calories / goal) * 100);
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";

    // Entreno (Cartas completas)
    document.getElementById('workout-groups-container').innerHTML = shared.workouts.map(g => `
        <div class="bg-white rounded-[2.8rem] p-8 shadow-sm border border-slate-50">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-black italic uppercase">${g.title}</h3>
                <i class="ph ph-barbell text-slate-100 text-5xl"></i>
            </div>
            <div class="space-y-3">${g.exercises.map(ex => `<div class="bg-slate-50 p-4 rounded-2xl flex justify-between"><span class="font-bold text-slate-600">${ex.name}</span><span class="text-xs font-black text-kin-blue">${ex.sets}x${ex.reps}</span></div>`).join('')}</div>
        </div>`).join('');

    // Dieta (Gotas y Comidas)
    document.getElementById('nutrition-rem-kcal').innerText = (2500 - user.calories);
    const drops = document.getElementById('hydration-drops');
    drops.innerHTML = [1,2,3,4,5].map((_, i) => `<i onclick="setHydration(${i+1})" class="ph-fill ph-drop text-2xl cursor-pointer ${i < user.hydration ? 'text-kin-blue':'text-slate-100'}"></i>`).join('');
    document.getElementById('hydration-bar').style.width = (user.hydration / 5) * 100 + "%";
    document.getElementById('meals-container').innerHTML = shared.meals.map(m => `<div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 flex justify-between items-center"><div><h4 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">${m.type}</h4><p class="font-bold text-slate-700">${m.name}</p></div><span class="font-black text-kin-blue">${m.kcal} KCAL</span></div>`).join('');

    // Diario (Metas y Notas)
    document.getElementById('goals-container').innerHTML = `<h4 class="font-black text-[10px] uppercase text-slate-300 mb-6 tracking-widest">Objetivos Compartidos</h4>` + shared.goals.map((g, i) => `<div onclick="toggleGoal(${i})" class="flex items-center gap-4 mb-4 cursor-pointer group"><div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center ${g.done ? 'bg-kin-blue border-kin-blue text-white' : 'border-slate-200 group-hover:border-kin-blue'}">${g.done ? '<i class="ph-bold ph-check text-xs"></i>' : ''}</div><span class="font-bold text-sm ${g.done ? 'line-through text-slate-300' : 'text-slate-700'}">${g.title}</span></div>`).join('');
    document.getElementById('notes-container').innerHTML = shared.notes.map(n => `<div class="bg-white p-8 rounded-[2.8rem] shadow-sm border border-slate-50"><p class="text-kin-blue font-black text-4xl mb-1">${n.day}</p><p class="text-[10px] font-black text-slate-300 uppercase mb-4 tracking-widest">${n.monthYear}</p><h4 class="font-black text-xl mb-3 italic">${n.title}</h4><p class="text-slate-500 text-sm leading-relaxed">${n.content}</p></div>`).join('');

    renderCalendar();
}

// FUNCIONES DE EDICIÓN (Lápices)
function editStat(type) {
    const val = prompt(`Actualizar ${type}:`, appData.users[currentUser][type]);
    if(val !== null && !isNaN(val)) { appData.users[currentUser][type] = parseFloat(val); sync(); }
}

function setHydration(val) { appData.users[currentUser].hydration = val; sync(); }
function toggleGoal(i) { appData.shared.goals[i].done = !appData.shared.goals[i].done; sync(); }

// CALENDARIO DINÁMICO E INTERACTIVO
let currentTool = null;
function setDuoTool(tool) {
    currentTool = (currentTool === tool) ? null : tool;
    ['you', 'synced'].forEach(t => { document.getElementById(`tool-${t}`).style.borderColor = (currentTool === t) ? '#0047ff' : 'transparent'; });
}

function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    const { viewYear: y, viewMonth: m } = appData.shared;
    const today = new Date();
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerText = `${names[m]} ${y}`;
    
    let html = ['L','M','X','J','V','S','D'].map(d => `<div class="text-[10px] font-black text-slate-300 uppercase">${d}</div>`).join('');
    
    const firstDay = new Date(y, m, 1).getDay();
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    const days = new Date(y, m + 1, 0).getDate();

    for(let i=0; i<padding; i++) html += `<div></div>`;

    for(let i = 1; i <= days; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appData.shared.calendar[key];
        const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === i;
        
        let marker = '';
        if(status === 'ana') marker = '<div class="w-2 h-2 bg-kin-blue rounded-full mx-auto mt-1"></div>';
        if(status === 'nestor') marker = '<div class="w-2 h-2 bg-kin-brown rounded-full mx-auto mt-1"></div>';
        if(status === 'synced') marker = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-kin-blue rounded-full"></div><div class="w-1.5 h-1.5 bg-kin-brown rounded-full"></div></div>';
        
        html += `<div onclick="clickDay(${i})" class="calendar-day p-4 bg-white shadow-sm cursor-pointer border-2 ${isToday ? 'today' : 'border-transparent'}">
            <span class="text-xs font-black">${i}</span>${marker}</div>`;
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

// NAVEGACIÓN
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
    document.getElementById('global-header').style.display = (id === 'profile') ? 'none' : 'flex';
}

window.onload = () => { if(currentUser) selectUser(currentUser); };
