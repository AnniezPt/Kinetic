// 1. CARGA Y ESTADO
const appState = {
    profileName: localStorage.getItem('k_v26_pname') || "Marcus Sterling",
    dashboard: JSON.parse(localStorage.getItem('k_v26_d')) || { calories: 0, dailyGoal: 1650, weight: 80, totalVolume: 0 },
    groups: JSON.parse(localStorage.getItem('k_v26_g')) || [
        { id: 'push', title: "EMPUJE", exercises: [{ name: "Press Inclinado", sets: 4, reps: 10, rest: 90 }] },
        { id: 'pull', title: "TIRÓN", exercises: [{ name: "Dominadas", sets: 4, reps: 8, rest: 120 }] },
        { id: 'legs', title: "PIERNAS", exercises: [{ name: "Sentadilla", sets: 4, reps: 8, rest: 120 }] }
    ],
    nutrition: JSON.parse(localStorage.getItem('k_v26_n')) || { meals: [], hydration: 0 },
    journal: JSON.parse(localStorage.getItem('k_v26_j')) || { goals: [{ title: "Completar Fase Inicial", done: false }], notes: [] },
    shared: JSON.parse(localStorage.getItem('k_v26_s')) || {
        myAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=100",
        partnerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
        upcoming: [],
        calendar: {}, // Formato: { "2026-3-20": "synced" }
        selected: `2026-3-${new Date().getDate()}`
    },
    currentTool: null,
    currentGroupIndex: -1
};

function sync() {
    localStorage.setItem('k_v26_pname', appState.profileName);
    localStorage.setItem('k_v26_d', JSON.stringify(appState.dashboard));
    localStorage.setItem('k_v26_g', JSON.stringify(appState.groups));
    localStorage.setItem('k_v26_n', JSON.stringify(appState.nutrition));
    localStorage.setItem('k_v26_j', JSON.stringify(appState.journal));
    localStorage.setItem('k_v26_s', JSON.stringify(appState.shared));
}

// 2. NAVEGACIÓN
function switchTab(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        if(n.querySelector('i')) n.querySelector('i').classList.replace('ph-fill', 'ph');
    });

    const target = document.getElementById(`view-${id}`);
    if(target) target.classList.add('active');
    
    const tab = document.getElementById(`tab-${id}`);
    if(tab && tab.querySelector('i')) tab.querySelector('i').classList.replace('ph', 'ph-fill');
    if(tab) tab.classList.add('active');

    document.getElementById('global-header').style.display = (['profile', 'shared', 'group-detail'].includes(id)) ? 'none' : 'flex';

    if(id === 'dashboard') renderDashboard();
    if(id === 'shared') renderCalendar();
    if(id === 'workout') renderGroups();
    if(id === 'nutrition') renderNutrition();
    if(id === 'notes') { renderGoals(); renderNotes(); }
}

// 3. CALENDARIO DÚO (MOTOR DE PINTADO)
function setDuoTool(tool) {
    appState.currentTool = (appState.currentTool === tool) ? null : tool;
    ['you', 'partner', 'synced'].forEach(t => {
        const btn = document.getElementById(`tool-${t}`);
        if(appState.currentTool === t) {
            btn.style.borderColor = '#0047ff'; btn.style.backgroundColor = '#eff6ff';
        } else {
            btn.style.borderColor = 'transparent'; btn.style.backgroundColor = 'white';
        }
    });
}

function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    if(!cont) return;
    
    let html = '';
    const daysInMonth = 30; // Abril
    const year = 2026;
    const month = 3; // Índice 3 es Abril

    for(let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${year}-${month}-${i}`;
        const status = appState.shared.calendar[dateKey];
        const isSelected = appState.shared.selected === dateKey;
        
        let marker = '';
        if(status === 'you') marker = '<div class="w-2 h-2 bg-kin-blue rounded-full mx-auto mt-1"></div>';
        if(status === 'partner') marker = '<div class="w-2 h-2 bg-kin-brown rounded-full mx-auto mt-1"></div>';
        if(status === 'synced') marker = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-kin-blue rounded-full"></div><div class="w-1.5 h-1.5 bg-kin-brown rounded-full"></div></div>';

        html += `
            <div onclick="clickCalendarDay(${i})" class="calendar-day p-4 rounded-2xl bg-white shadow-sm cursor-pointer border-2 ${isSelected ? 'border-kin-blue bg-blue-50' : 'border-transparent'}">
                <span class="text-xs font-black">${i}</span>
                ${marker}
            </div>`;
    }
    cont.innerHTML = html;
    
    const sel = appState.shared.selected.split('-');
    document.getElementById('duo-selected-date').innerText = `ABR ${sel[2]}`;
    renderDuoImages();
    renderUpcomingDuos();
}

function clickCalendarDay(day) {
    const dateKey = `2026-3-${day}`;
    appState.shared.selected = dateKey;
    
    if(appState.currentTool) {
        if(appState.shared.calendar[dateKey] === appState.currentTool) delete appState.shared.calendar[dateKey];
        else appState.shared.calendar[dateKey] = appState.currentTool;
        sync();
    }
    renderCalendar();
}

function scheduleNewDuo() {
    const title = document.getElementById('duo-session-title').value;
    if(!title) return alert("Ponle un nombre a la sesión");
    
    appState.shared.upcoming.unshift({ title: title.toUpperCase(), date: appState.shared.selected });
    appState.shared.calendar[appState.shared.selected] = 'synced';
    sync(); renderCalendar();
    document.getElementById('duo-session-title').value = '';
}

// 4. EDICIÓN DE PERFIL Y AVATAR
let avatarTarget = 'my';
function changeAvatar(target) {
    avatarTarget = target;
    document.getElementById('avatar-upload').click();
}

function renderDuoImages() {
    document.getElementById('duo-my-img').src = appState.shared.myAvatar;
    document.getElementById('duo-partner-img').src = appState.shared.partnerAvatar;
}

// 5. OTRAS FUNCIONES (Dashboard, Nutrición, etc)
function renderDashboard() {
    const d = appState.dashboard;
    document.getElementById('dash-active-cals').innerText = d.calories;
    document.getElementById('dash-rem-cals').innerText = (d.dailyGoal - d.calories);
    const p = Math.min(100, (d.calories / d.dailyGoal) * 100);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-current-weight').innerText = d.weight;
}

function promptEditStat(type) {
    const val = prompt(`Nuevo valor para ${type}:`, appState.dashboard[type]);
    if(val) { appState.dashboard[type] = parseFloat(val); sync(); renderDashboard(); }
}

function renderUpcomingDuos() {
    const cont = document.getElementById('upcoming-duos-container');
    cont.innerHTML = appState.shared.upcoming.map(s => `
        <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
            <p class="text-[9px] font-black text-kin-blue uppercase mb-1">Confirmada • ${s.date}</p>
            <h4 class="font-black text-xl">${s.title}</h4>
        </div>`).join('');
}

// INICIALIZADOR
window.onload = () => {
    // Sincronizar imágenes al cargar
    document.getElementById('header-avatar-img').src = appState.shared.myAvatar;
    document.getElementById('profile-avatar-img').src = appState.shared.myAvatar;
    document.getElementById('profile-name-text').innerText = appState.profileName;

    document.getElementById('avatar-upload').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if(avatarTarget === 'my') {
                appState.shared.myAvatar = ev.target.result;
                document.getElementById('header-avatar-img').src = ev.target.result;
                document.getElementById('profile-avatar-img').src = ev.target.result;
            } else {
                appState.shared.partnerAvatar = ev.target.result;
            }
            sync(); renderCalendar();
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    switchTab('dashboard');
};

function editProfileName() {
    const n = prompt("Tu nombre:", appState.profileName);
    if(n) { appState.profileName = n; sync(); document.getElementById('profile-name-text').innerText = n; }
}

function requestOneSignalPush() {
    OneSignalDeferred.push(function(OneSignal) { OneSignal.Slidedown.promptPush(); });
    document.getElementById('bell-badge').style.display = 'none';
}

function renderGroups() { /* Lógica de grupos */ }
function renderNutrition() { /* Lógica nutrición */ }
function renderGoals() { /* Lógica metas */ }
function renderNotes() { /* Lógica notas */ }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
