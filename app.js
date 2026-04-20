// 1. ESTADO GLOBAL
const appState = {
    profileName: localStorage.getItem('k_v26_pname') || "Marcus Sterling",
    dashboard: JSON.parse(localStorage.getItem('k_v26_d')) || { calories: 0, dailyGoal: 1650, weight: 85.4, streak: 0 },
    groups: JSON.parse(localStorage.getItem('k_v26_g')) || [
        { id: 'push', title: "EMPUJE", exercises: [{ name: "Press Banca Inclinado", sets: 4, reps: 10, rest: 90 }, { name: "Press Militar", sets: 3, reps: 12, rest: 90 }] },
        { id: 'pull', title: "TIRÓN", exercises: [{ name: "Dominadas Lastradas", sets: 4, reps: 8, rest: 120 }, { name: "Remo con Barra", sets: 4, reps: 10, rest: 90 }] },
        { id: 'legs', title: "PIERNAS", exercises: [{ name: "Sentadilla Trasera", sets: 4, reps: 8, rest: 120 }, { name: "Peso Muerto Rumano", sets: 4, reps: 10, rest: 90 }] }
    ],
    nutrition: JSON.parse(localStorage.getItem('k_v26_n')) || {
        meals: [{ name: "Avena con whey", kcal: 450, type: "Desayuno" }],
        hydration: 2
    },
    journal: JSON.parse(localStorage.getItem('k_v26_j')) || {
        goals: [{ title: "Deadlift 230kg", done: true }, { title: "Dominar Muscle Up", done: false }],
        notes: [{ day: "20", monthYear: "ABR 2026", title: "Análisis de Fatiga", content: "Buenas sensaciones hoy.", tags: ["Entreno"] }]
    },
    shared: JSON.parse(localStorage.getItem('k_v26_s')) || {
        myAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=100",
        partnerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
        calendar: {}, // Almacena marcas: { "2026-3-20": "you" }
        viewYear: 2026,
        viewMonth: 3, // Abril
        selectedDate: `2026-3-${new Date().getDate()}`,
        upcoming: []
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
    if(tab) {
        tab.classList.add('active');
        if(tab.querySelector('i')) tab.querySelector('i').classList.replace('ph', 'ph-fill');
    }

    document.getElementById('global-header').style.display = (['profile', 'shared', 'group-detail'].includes(id)) ? 'none' : 'flex';

    if(id === 'dashboard') renderDashboard();
    if(id === 'workout') renderGroups();
    if(id === 'nutrition') renderNutrition();
    if(id === 'notes') { renderGoals(); renderNotes(); }
    if(id === 'shared') renderCalendar();
}

// 3. CALENDARIO DÚO (EL MOTOR)
function changeMonth(dir) {
    appState.shared.viewMonth += dir;
    if(appState.shared.viewMonth > 11) { appState.shared.viewMonth = 0; appState.shared.viewYear++; }
    if(appState.shared.viewMonth < 0) { appState.shared.viewMonth = 11; appState.shared.viewYear--; }
    sync(); renderCalendar();
}

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
    const { viewYear: y, viewMonth: m } = appState.shared;
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    document.getElementById('calendar-month-title').innerText = `${names[m]} ${y}`;
    
    const firstDay = new Date(y, m, 1).getDay();
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    let html = ['L','M','X','J','V','S','D'].map(d => `<div class="text-[10px] font-black text-slate-300 uppercase">${d}</div>`).join('');
    
    for(let i=0; i<padding; i++) html += `<div></div>`;

    for(let i=1; i<=daysInMonth; i++) {
        const key = `${y}-${m}-${i}`;
        const status = appState.shared.calendar[key];
        const isSelected = appState.shared.selectedDate === key;
        
        let marker = '';
        if(status === 'you') marker = '<div class="w-2 h-2 bg-kin-blue rounded-full mx-auto mt-1"></div>';
        else if(status === 'partner') marker = '<div class="w-2 h-2 bg-kin-brown rounded-full mx-auto mt-1"></div>';
        else if(status === 'synced') marker = '<div class="flex justify-center gap-0.5 mt-1"><div class="w-1.5 h-1.5 bg-kin-blue rounded-full"></div><div class="w-1.5 h-1.5 bg-kin-brown rounded-full"></div></div>';

        html += `
            <div onclick="clickCalendarDay(${i})" class="calendar-day p-4 rounded-2xl bg-white shadow-sm cursor-pointer border-2 ${isSelected ? 'border-kin-blue bg-blue-50' : 'border-transparent'}">
                <span class="text-xs font-black">${i}</span>
                ${marker}
            </div>`;
    }
    cont.innerHTML = html;
    
    const sel = appState.shared.selectedDate.split('-');
    document.getElementById('duo-selected-date').innerText = `${names[sel[1]].substring(0,3).toUpperCase()} ${sel[2]}`;
    renderUpcomingDuos();
}

function clickCalendarDay(day) {
    const key = `${appState.shared.viewYear}-${appState.shared.viewMonth}-${day}`;
    appState.shared.selectedDate = key;
    
    if(appState.currentTool) {
        if(appState.shared.calendar[key] === appState.currentTool) delete appState.shared.calendar[key];
        else appState.shared.calendar[key] = appState.currentTool;
        sync();
    }
    renderCalendar();
}

function scheduleNewDuo() {
    const t = document.getElementById('duo-session-title').value;
    if(!t) return;
    appState.shared.upcoming.unshift({ title: t.toUpperCase(), date: appState.shared.selectedDate });
    appState.shared.calendar[appState.shared.selectedDate] = 'synced';
    sync(); renderCalendar();
    document.getElementById('duo-session-title').value = '';
}

function renderUpcomingDuos() {
    const cont = document.getElementById('upcoming-duos-container');
    const names = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    cont.innerHTML = appState.shared.upcoming.map(s => {
        const parts = s.date.split('-');
        return `<div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
            <p class="text-[9px] font-black text-kin-blue uppercase mb-1">${parts[2]} ${names[parts[1]]}</p>
            <h4 class="font-black text-xl uppercase">${s.title}</h4>
        </div>`;
    }).join('');
}

// 4. OTRAS FUNCIONES (Manteniendo estética)
function renderDashboard() {
    const d = appState.dashboard;
    document.getElementById('dash-active-cals').innerText = d.calories;
    document.getElementById('dash-rem-cals').innerText = (d.dailyGoal - d.calories);
    const p = Math.min(100, (d.calories / d.dailyGoal) * 100);
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";
    document.getElementById('dash-current-weight').innerText = d.weight;
    document.getElementById('dash-streak').innerText = `${d.streak} DÍAS`;
}

function promptEditStat(type) {
    const val = prompt(`Nuevo valor para ${type}:`, appState.dashboard[type]);
    if(val !== null) { appState.dashboard[type] = parseFloat(val); sync(); renderDashboard(); }
}

function renderGroups() {
    const cont = document.getElementById('workout-groups-container');
    cont.innerHTML = appState.groups.map((g, i) => `<div onclick="openGroupDetail(${i})" class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 cursor-pointer"><div class="flex justify-between items-center"><div class="flex items-center gap-4"><div class="w-14 h-14 bg-blue-50 text-kin-blue rounded-2xl flex items-center justify-center text-3xl"><i class="ph-fill ph-lightning"></i></div><div><h3 class="text-2xl font-black uppercase">${g.title}</h3><p class="text-[9px] font-black text-slate-300 uppercase">${g.exercises.length} EJERCICIOS</p></div></div><i class="ph ph-barbell text-slate-100 text-5xl"></i></div></div>`).join('');
}

function openGroupDetail(i) {
    appState.currentGroupIndex = i; switchTab('group-detail');
    const g = appState.groups[i];
    document.getElementById('detail-group-title').innerText = g.title;
    document.getElementById('detail-exercises-container').innerHTML = g.exercises.map(ex => `<div class="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50"><h4 class="font-black text-xl mb-6 uppercase italic text-slate-700">${ex.name}</h4><div class="grid grid-cols-3 gap-4"><div class="bg-slate-50 p-4 rounded-2xl text-center"><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Sets</p><p class="font-black text-2xl text-kin-blue">${ex.sets}</p></div><div class="bg-slate-50 p-4 rounded-2xl text-center"><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Reps</p><p class="font-black text-2xl text-kin-blue">${ex.reps}</p></div><div class="bg-slate-50 p-4 rounded-2xl text-center"><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Rest</p><p class="font-black text-2xl text-kin-blue">${ex.rest}s</p></div></div></div>`).join('');
}

function renderNutrition() {
    const cont = document.getElementById('meals-container');
    cont.innerHTML = appState.nutrition.meals.map(m => `<div class="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center"><div><h4 class="font-black text-xs text-slate-400 uppercase">${m.type}</h4><p class="font-bold text-slate-700">${m.name}</p></div><span class="font-black text-kin-blue">${m.kcal} KCAL</span></div>`).join('');
    const drops = document.getElementById('hydration-drops');
    drops.innerHTML = [1,2,3,4,5].map((_, i) => `<i onclick="appState.nutrition.hydration=${i+1};sync();renderNutrition();" class="ph-fill ph-drop text-2xl cursor-pointer ${i < appState.nutrition.hydration ? 'text-kin-blue':'text-slate-100'}"></i>`).join('');
    document.getElementById('hydration-bar').style.width = (appState.nutrition.hydration / 5) * 100 + "%";
    document.getElementById('nutrition-rem-kcal').innerText = (2500 - appState.nutrition.meals.reduce((a,b)=>a+b.kcal,0));
}

function renderGoals() {
    const cont = document.getElementById('goals-container');
    cont.innerHTML = `<h4 class="font-black text-xs uppercase text-slate-400 mb-6">Metas Actuales</h4>` + appState.journal.goals.map((g, i) => `<div class="flex items-center gap-4 mb-4 cursor-pointer" onclick="appState.journal.goals[${i}].done=!g.done;sync();renderGoals();"><div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center ${g.done ? 'bg-kin-blue border-kin-blue text-white' : 'border-slate-200'}">${g.done ? '<i class="ph-bold ph-check"></i>' : ''}</div><span class="font-bold ${g.done ? 'line-through text-slate-300' : 'text-slate-700'}">${g.title}</span></div>`).join('');
}

function renderNotes() {
    const cont = document.getElementById('notes-container');
    cont.innerHTML = appState.journal.notes.map(n => `<div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50"><p class="text-kin-blue font-black text-3xl mb-1">${n.day}</p><p class="text-[10px] font-black text-slate-300 uppercase mb-4">${n.monthYear}</p><h4 class="font-black text-xl mb-2">${n.title}</h4><p class="text-slate-500 text-sm mb-4">${n.content}</p><div class="flex gap-2">${n.tags.map(t => `<span class="bg-slate-50 px-3 py-1 rounded-lg text-[9px] font-black text-slate-400 uppercase">#${t}</span>`).join('')}</div></div>`).join('');
}

// 5. PERFIL Y AVATAR
function changeAvatar(target) {
    const upload = document.getElementById('avatar-upload');
    upload.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if(target === 'my') {
                appState.shared.myAvatar = ev.target.result;
                document.getElementById('header-avatar-img').src = ev.target.result;
                document.getElementById('profile-avatar-img').src = ev.target.result;
                document.getElementById('duo-my-img').src = ev.target.result;
            } else {
                appState.shared.partnerAvatar = ev.target.result;
                document.getElementById('duo-partner-img').src = ev.target.result;
            }
            sync();
        };
        reader.readAsDataURL(e.target.files[0]);
    };
    upload.click();
}

function editProfileName() {
    const n = prompt("Nuevo nombre:", appState.profileName);
    if(n) { appState.profileName = n; sync(); document.getElementById('profile-name-text').innerText = n; }
}

function requestOneSignalPush() {
    OneSignalDeferred.push(function(OneSignal) { OneSignal.Slidedown.promptPush(); });
    document.getElementById('bell-badge').style.display = 'none';
}

// INICIALIZACIÓN
window.onload = () => {
    document.getElementById('header-avatar-img').src = appState.shared.myAvatar;
    document.getElementById('profile-avatar-img').src = appState.shared.myAvatar;
    document.getElementById('duo-my-img').src = appState.shared.myAvatar;
    document.getElementById('duo-partner-img').src = appState.shared.partnerAvatar;
    document.getElementById('profile-name-text').innerText = appState.profileName;
    switchTab('dashboard');
};

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openMealModal() { document.getElementById('meal-modal').classList.remove('hidden'); }
function saveNewMeal() {
    const n = document.getElementById('meal-name').value;
    const k = parseInt(document.getElementById('meal-kcal').value);
    if(n && k) { appState.nutrition.meals.unshift({name:n, kcal:k, type:"EXTRA"}); sync(); renderNutrition(); closeModal('meal-modal'); }
}
