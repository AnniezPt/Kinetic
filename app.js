// CONFIGURACIÓN FIREBASE (Tus claves reales de Bélgica)
const firebaseConfig = {
    apiKey: "AIzaSyAspSyjZo2yPxEdTj-i3S8w8q1V4kqwEe8",
    authDomain: "kinetic-6bfb2.firebaseapp.com",
    databaseURL: "https://kinetic-6bfb2-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "kinetic-6bfb2",
    storageBucket: "kinetic-6bfb2.firebasestorage.app",
    messagingSenderId: "789239934405",
    appId: "1:789239934405:web:ea2f4e3ffba4cefaac2fac"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ESTADO INICIAL
let appState = {
    dashboard: { myCalories: 0, partnerCalories: 0, myWeight: 80.0, partnerWeight: 80.0, dailyGoal: 1650 },
    shared: {
        myAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=100",
        partnerAvatar: "https://images.unsplash.com/photo-1570295999919-51ceb5ecca61?auto=format&fit=crop&q=80&w=100",
        calendar: {},
        viewYear: 2026,
        viewMonth: 3, // Abril
        selectedDate: `2026-3-20`,
        upcoming: []
    }
};

// ESCUCHA EN TIEMPO REAL
db.ref('kinetic_v1').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        appState = data;
        renderAll();
        document.getElementById('sync-status').innerText = "Sincronizado";
        document.getElementById('sync-status').classList.replace('text-slate-400', 'text-green-500');
    }
});

function sync() {
    db.ref('kinetic_v1').set(appState);
}

// RENDERIZADO
function renderAll() {
    renderDashboard();
    renderCalendar();
    document.getElementById('header-avatar-img').src = appState.shared.myAvatar;
    document.getElementById('duo-my-img').src = appState.shared.myAvatar;
    document.getElementById('duo-partner-img').src = appState.shared.partnerAvatar;
}

function renderDashboard() {
    const d = appState.dashboard;
    document.getElementById('dash-my-active-cals').innerText = d.myCalories;
    document.getElementById('dash-my-weight').innerText = d.myWeight.toFixed(1);
    const myP = Math.min(100, (d.myCalories / d.dailyGoal) * 100);
    document.getElementById('dash-my-cal-svg').setAttribute('stroke-dasharray', `${myP}, 100`);
    document.getElementById('dash-my-cal-text').innerText = Math.round(myP) + "%";

    document.getElementById('dash-partner-active-cals').innerText = d.partnerCalories;
    document.getElementById('dash-partner-weight').innerText = d.partnerWeight.toFixed(1);
    const partP = Math.min(100, (d.partnerCalories / d.dailyGoal) * 100);
    document.getElementById('dash-partner-cal-svg').setAttribute('stroke-dasharray', `${partP}, 100`);
    document.getElementById('dash-partner-cal-text').innerText = Math.round(partP) + "%";
}

function promptEditStat(type) {
    const val = prompt(`Actualizar ${type}:`, appState.dashboard[type]);
    if(val !== null && !isNaN(val)) {
        appState.dashboard[type] = parseFloat(val);
        sync();
    }
}

// CALENDARIO PINCEL
function setDuoTool(tool) {
    appState.currentTool = (appState.currentTool === tool) ? null : tool;
    ['you', 'partner', 'synced'].forEach(t => {
        const btn = document.getElementById(`tool-${t}`);
        btn.style.borderColor = (appState.currentTool === t) ? '#0047ff' : 'transparent';
        btn.style.backgroundColor = (appState.currentTool === t) ? '#eff6ff' : 'white';
    });
}

function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    if(!cont) return;
    const { viewYear: y, viewMonth: m } = appState.shared;
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendar-month-title').innerText = `${names[m]} ${y}`;
    
    let html = '';
    const days = new Date(y, m + 1, 0).getDate();
    for(let i = 1; i <= days; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appState.shared.calendar[key];
        let marker = '';
        if(status === 'you') marker = '<div class="w-2 h-2 bg-kin-blue rounded-full mx-auto mt-1"></div>';
        if(status === 'partner') marker = '<div class="w-2 h-2 bg-kin-brown rounded-full mx-auto mt-1"></div>';
        if(status === 'synced') marker = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-kin-blue rounded-full"></div><div class="w-1.5 h-1.5 bg-kin-brown rounded-full"></div></div>';
        html += `<div onclick="clickDay(${i})" class="p-4 rounded-2xl bg-white shadow-sm cursor-pointer border-2 border-transparent"><span class="text-xs font-black">${i}</span>${marker}</div>`;
    }
    cont.innerHTML = html;
}

function clickDay(day) {
    const key = `${appState.shared.viewYear}-${appState.shared.viewMonth}-${day}`;
    if(appState.currentTool) {
        if(appState.shared.calendar[key] === appState.currentTool) delete appState.shared.calendar[key];
        else appState.shared.calendar[key] = appState.currentTool;
        sync();
    }
}

function changeMonth(dir) {
    appState.shared.viewMonth += dir;
    if(appState.shared.viewMonth > 11) { appState.shared.viewMonth = 0; appState.shared.viewYear++; }
    if(appState.shared.viewMonth < 0) { appState.shared.viewMonth = 11; appState.shared.viewYear--; }
    sync();
}

function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${id}`).classList.add('active');
    document.getElementById(`tab-${id}`).classList.add('active');
    document.getElementById('global-header').style.display = (id === 'profile') ? 'none' : 'flex';
}

function changeAvatar(target) {
    const up = document.getElementById('avatar-upload');
    up.onchange = (e) => {
        const r = new FileReader();
        r.onload = (ev) => {
            if(target === 'my') appState.shared.myAvatar = ev.target.result;
            else appState.shared.partnerAvatar = ev.target.result;
            sync();
        };
        r.readAsDataURL(e.target.files[0]);
    };
    up.click();
}

function requestOneSignalPush() {
    OneSignalDeferred.push(function(OneSignal) { OneSignal.Slidedown.promptPush(); });
}

window.onload = () => { switchTab('dashboard'); };
