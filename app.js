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

// ESTADO GLOBAL COMPARTIDO
let appData = {
    users: {
        ana: { calories: 0, weight: 60, streak: 0, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
        nestor: { calories: 0, weight: 85, streak: 0, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200" }
    },
    shared: {
        calendar: {},
        viewYear: 2026, viewMonth: 3,
        notes: [
            { day: "20", monthYear: "ABR 2026", title: "Análisis de Fatiga", content: "Buenas sensaciones compartidas.", tags: ["Dúo"] }
        ]
    }
};

// SINCRONIZACIÓN LIVE
db.ref('kinetic_v2').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        appData = data;
        if (currentUser) renderAll();
    }
});

function sync() {
    db.ref('kinetic_v2').set(appData);
}

// LÓGICA DE PERFILES
function selectUser(user) {
    currentUser = user;
    localStorage.setItem('kinetic_user', user);
    document.getElementById('profile-selector').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    renderAll();
}

function logout() {
    localStorage.removeItem('kinetic_user');
    location.reload();
}

// RENDERIZADO
function renderAll() {
    const user = appData.users[currentUser];
    // Header & Profile
    document.getElementById('header-avatar').src = user.avatar;
    document.getElementById('user-display-name').innerText = currentUser === 'ana' ? 'Ana' : 'Néstor';
    document.getElementById('profile-avatar-big').src = user.avatar;
    document.getElementById('profile-name-big').innerText = currentUser === 'ana' ? 'Ana' : 'Néstor';

    // Dashboard
    document.getElementById('dash-active-cals').innerText = user.calories;
    document.getElementById('dash-current-weight').innerText = user.weight.toFixed(1);
    document.getElementById('dash-streak').innerText = `${user.streak} DÍAS`;
    const goal = 1650;
    document.getElementById('dash-rem-cals').innerText = Math.max(0, goal - user.calories);
    const p = Math.min(100, (user.calories / goal) * 100);
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";

    renderCalendar();
    renderWorkout();
    renderNotes();
}

function editStat(type) {
    const val = prompt(`Actualizar ${type}:`, appData.users[currentUser][type]);
    if(val !== null && !isNaN(val)) {
        appData.users[currentUser][type] = parseFloat(val);
        sync();
    }
}

// CALENDARIO DÚO
let currentTool = null;
function setDuoTool(tool) {
    currentTool = (currentTool === tool) ? null : tool;
    ['you', 'synced'].forEach(t => {
        document.getElementById(`tool-${t}`).style.borderColor = (currentTool === t) ? '#0047ff' : 'transparent';
    });
}

function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    const { viewYear: y, viewMonth: m } = appData.shared;
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerText = `${months[m]} ${y}`;
    
    let html = '';
    const days = new Date(y, m + 1, 0).getDate();
    for(let i = 1; i <= days; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appData.shared.calendar[key];
        let marker = '';
        if(status === 'ana') marker = '<div class="w-2 h-2 bg-kin-blue rounded-full mx-auto mt-1"></div>';
        if(status === 'nestor') marker = '<div class="w-2 h-2 bg-kin-brown rounded-full mx-auto mt-1"></div>';
        if(status === 'synced') marker = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-kin-blue rounded-full"></div><div class="w-1.5 h-1.5 bg-kin-brown rounded-full"></div></div>';
        
        html += `<div onclick="clickDay(${i})" class="p-4 rounded-2xl bg-white shadow-sm cursor-pointer"><span class="text-xs font-black">${i}</span>${marker}</div>`;
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

// RELLENO ESTÉTICO
function renderWorkout() {
    const groups = [{t:"EMPUJE", n:4}, {t:"TIRÓN", n:5}, {t:"PIERNAS", n:4}];
    document.getElementById('workout-groups-container').innerHTML = groups.map(g => `
        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 flex justify-between items-center">
            <div><h3 class="text-2xl font-black italic">${g.t}</h3><p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">${g.n} EJERCICIOS</p></div>
            <i class="ph ph-barbell text-slate-100 text-5xl"></i>
        </div>`).join('');
}

function renderNotes() {
    document.getElementById('notes-container').innerHTML = appData.shared.notes.map(n => `
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <p class="text-kin-blue font-black text-3xl mb-1">${n.day}</p>
            <p class="text-[10px] font-black text-slate-300 uppercase mb-4">${n.monthYear}</p>
            <h4 class="font-black text-xl mb-2 italic">${n.title}</h4>
            <p class="text-slate-500 text-sm mb-4">${n.content}</p>
        </div>`).join('');
}

function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${id}`).classList.add('active');
    document.getElementById(`tab-${id}`).classList.add('active');
}

window.onload = () => {
    if(currentUser) {
        document.getElementById('profile-selector').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        renderAll();
    }
};
