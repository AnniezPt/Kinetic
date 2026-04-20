// 1. CARGA DE DATOS LOCALES
const savedSets = JSON.parse(localStorage.getItem('kinetic_workout_sets'));
const savedHydration = JSON.parse(localStorage.getItem('kinetic_hydration'));
const savedMeals = JSON.parse(localStorage.getItem('kinetic_meals'));
const savedGoals = JSON.parse(localStorage.getItem('kinetic_goals'));
const savedNotes = JSON.parse(localStorage.getItem('kinetic_notes'));
const savedShared = JSON.parse(localStorage.getItem('kinetic_shared'));
const savedGroups = JSON.parse(localStorage.getItem('kinetic_groups'));
const savedDashboard = JSON.parse(localStorage.getItem('kinetic_dashboard'));

// 2. ESTADO GLOBAL
const appState = {
    profileName: localStorage.getItem('k_v26_pname') || "Marcus Sterling",
    dashboard: savedDashboard || {
        calories: 1240, 
        dailyCalorieGoal: 1650,
        weight: 85.4,
        totalVolumeKg: 152000, 
        peakSetKg: 185,
        sessionsCompleted: 18
    },
    currentGroupView: 'push', 
    groups: savedGroups || [
        { id: 'push', title: "EMPUJE", exercises: [{ name: "Press Inclinado", focus: "Pecho", sets: 4, reps: 10, rest: 90 }] },
        { id: 'pull', title: "TIRÓN", exercises: [{ name: "Dominadas", focus: "Espalda", sets: 4, reps: 8, rest: 120 }] },
        { id: 'legs', title: "PIERNAS", exercises: [{ name: "Sentadilla", focus: "Cuádriceps", sets: 4, reps: 8, rest: 120 }] }
    ],
    workout: {
        sets: savedSets || [
            { id: 1, weight: 100, reps: 10, done: false },
            { id: 2, weight: 100, reps: 8, done: false },
            { id: 3, weight: 100, reps: 8, done: false }
        ]
    },
    nutrition: {
        hydration: savedHydration || [true, true, true, false, false],
        dailyGoalKcal: 2500, 
        macroGoals: { p: 180, c: 230, f: 85 }, 
        meals: savedMeals || [
            { id: 1, type: "Desayuno", name: "Avena con whey", kcal: 450, p: 35, c: 50, f: 12, img: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1406&auto=format&fit=crop" }
        ]
    },
    journal: {
        goals: savedGoals || [{ id: 1, title: "Deadlift 230kg", done: true }, { id: 2, title: "Muscle Up", done: false }],
        notes: savedNotes || [{ day: "20", monthYear: "ABR 2026", title: "Entrenamiento completado", content: "Buenas sensaciones hoy.", tags: ["Entreno"] }]
    },
    shared: savedShared || {
        myAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=100",
        partnerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
        upcoming: [],
        calendar: {},
        selectedDay: new Date().getDate()
    },
    timer: { timeLeft: 74, interval: null },
    currentGroupIndex: -1
};

// 3. PERSISTENCIA
function saveState() {
    localStorage.setItem('kinetic_dashboard', JSON.stringify(appState.dashboard));
    localStorage.setItem('kinetic_groups', JSON.stringify(appState.groups));
    localStorage.setItem('kinetic_workout_sets', JSON.stringify(appState.workout.sets));
    localStorage.setItem('kinetic_nutrition', JSON.stringify(appState.nutrition));
    localStorage.setItem('kinetic_journal', JSON.stringify(appState.journal));
    localStorage.setItem('kinetic_shared', JSON.stringify(appState.shared));
    localStorage.setItem('k_v26_pname', appState.profileName);
}

// 4. NAVEGACIÓN
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        const icon = el.querySelector('i');
        if(icon) icon.classList.replace('ph-fill', 'ph');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.add('active');

    const tab = document.getElementById(`tab-${tabId}`);
    if (tab) {
        tab.classList.add('active');
        const icon = tab.querySelector('i');
        if(icon) icon.classList.replace('ph', 'ph-fill');
    }

    const header = document.getElementById('global-header');
    header.style.display = (['profile', 'shared', 'group-detail', 'workout-active'].includes(tabId)) ? 'none' : 'flex';

    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'workout') renderGroups();
    if(tabId === 'shared') renderCalendar();
    if(tabId === 'notes') { renderGoals(); renderNotes(); }
    if(tabId === 'nutrition') renderNutrition();
}

// 5. PANEL
function renderDashboard() {
    const d = appState.dashboard;
    document.getElementById('dash-active-cals').innerText = d.calories.toLocaleString();
    document.getElementById('dash-rem-cals').innerText = (d.dailyCalorieGoal - d.calories).toLocaleString();
    const p = Math.min(100, (d.calories / d.dailyCalorieGoal) * 100);
    document.getElementById('dash-cal-percent').innerText = Math.round(p) + "%";
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${p}, 100`);
    document.getElementById('dash-current-weight').innerText = d.weight;
    document.getElementById('dash-total-volume').innerText = (d.totalVolumeKg / 1000).toFixed(1);
}

function promptEditStat(type) {
    const val = prompt(`Actualizar ${type}:`, type === 'weight' ? appState.dashboard.weight : appState.dashboard.calories);
    if(val && !isNaN(val)) {
        if(type === 'weight') appState.dashboard.weight = parseFloat(val);
        else appState.dashboard.calories = parseInt(val);
        saveState(); renderDashboard();
    }
}

// 6. NOTIFICACIONES
function requestOneSignalPush() { 
    OneSignalDeferred.push(function(OneSignal) {
        OneSignal.Slidedown.promptPush(); 
    });
    const badge = document.getElementById('bell-badge');
    if(badge) badge.style.display = 'none';
}

// 7. ENTRENAMIENTOS
function renderGroups() {
    const cont = document.getElementById('workout-groups-container');
    if(!cont) return;
    cont.innerHTML = appState.groups.map((g, i) => `
        <div onclick="openGroupDetail(${i})" class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-50 text-kin-blue rounded-2xl flex items-center justify-center text-3xl">
                        <i class="ph-fill ph-lightning"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-black uppercase tracking-tighter">${g.title}</h3>
                        <p class="text-[9px] font-black text-slate-300 uppercase mt-1">${g.exercises.length} Ejercicios</p>
                    </div>
                </div>
                <i class="ph ph-barbell text-slate-100 text-5xl"></i>
            </div>
        </div>`).join('');
}

function openGroupDetail(index) {
    appState.currentGroupIndex = index;
    switchTab('group-detail');
    const g = appState.groups[index];
    document.getElementById('detail-group-title').innerText = g.title;
    renderExercises();
}

function renderExercises() {
    const cont = document.getElementById('detail-exercises-container');
    const g = appState.groups[appState.currentGroupIndex];
    cont.innerHTML = g.exercises.map((ex, i) => `
        <div class="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50 relative group">
            <h4 class="font-black text-xl mb-6 uppercase italic text-slate-700">${ex.name}</h4>
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-slate-50 p-4 rounded-2xl text-center"><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Sets</p><p class="font-black text-2xl text-kin-blue">${ex.sets}</p></div>
                <div class="bg-slate-50 p-4 rounded-2xl text-center"><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Reps</p><p class="font-black text-2xl text-kin-blue">${ex.reps}</p></div>
                <div class="bg-slate-50 p-4 rounded-2xl text-center"><p class="text-[9px] font-black text-slate-400 uppercase mb-1">Rest</p><p class="font-black text-2xl text-kin-blue">${ex.rest}s</p></div>
            </div>
        </div>`).join('');
}

// 8. DIETA
function renderNutrition() {
    let sum = 0;
    const cont = document.getElementById('meals-container');
    if(!cont) return;
    cont.innerHTML = appState.nutrition.meals.map(m => `
        <div class="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <div class="flex justify-between mb-2">
                <h4 class="font-black text-xs uppercase text-slate-400">${m.type}</h4>
                <span class="font-black">${m.kcal} KCAL</span>
            </div>
            <p class="font-bold text-slate-700">${m.name}</p>
        </div>`).join('');
    
    document.getElementById('nutrition-rem-kcal').innerText = (appState.nutrition.dailyGoalKcal - sum);
    const drops = document.getElementById('hydration-drops');
    drops.innerHTML = [1,2,3,4,5].map((_, i) => `<i onclick="toggleHydration(${i})" class="ph-fill ph-drop text-2xl cursor-pointer ${i < appState.nutrition.hydration ? 'text-kin-blue':'text-slate-100'}"></i>`).join('');
}

function toggleHydration(i) { appState.nutrition.hydration = i+1; saveState(); renderNutrition(); }

// 9. DIARIO
function renderGoals() {
    const cont = document.getElementById('goals-container');
    if(!cont) return;
    cont.innerHTML = appState.journal.goals.map((g, i) => `
        <div class="flex items-center gap-4 mb-4 cursor-pointer" onclick="appState.journal.goals[${i}].done = !appState.journal.goals[${i}].done; saveState(); renderGoals();">
            <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center ${g.done ? 'bg-kin-blue border-kin-blue text-white' : 'border-slate-200'}">
                ${g.done ? '<i class="ph-bold ph-check"></i>' : ''}
            </div>
            <span class="font-bold ${g.done ? 'line-through text-slate-300' : 'text-slate-700'}">${g.title}</span>
        </div>`).join('');
}

function renderNotes() {
    const cont = document.getElementById('notes-container');
    if(!cont) return;
    cont.innerHTML = appState.journal.notes.map(n => `
        <div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 mb-6">
            <p class="text-kin-blue font-black text-3xl mb-1">${n.day}</p>
            <p class="text-[10px] font-black text-slate-300 uppercase mb-4">${n.monthYear}</p>
            <h4 class="font-black text-xl mb-2">${n.title}</h4>
            <p class="text-slate-500 text-sm">${n.content}</p>
        </div>`).join('');
}

// 10. CALENDARIO DÚO
function renderCalendar() {
    const cont = document.getElementById('calendar-grid');
    if(!cont) return;
    let html = '';
    for(let i=1; i<=30; i++) {
        const isSelected = appState.shared.selectedDay === i;
        html += `<div onclick="appState.shared.selectedDay=${i}; renderCalendar();" class="calendar-day p-4 rounded-2xl bg-white shadow-sm cursor-pointer ${isSelected ? 'selected' : ''}">${i}</div>`;
    }
    cont.innerHTML = html;
    document.getElementById('calendar-month-title').innerText = "Abril 2026";
}

// INICIALIZADOR
window.onload = () => {
    // Sincronizar imágenes de perfil al cargar
    const headerImg = document.getElementById('header-avatar-img');
    const profileImg = document.getElementById('profile-avatar-img');
    if(headerImg) headerImg.src = appState.shared.myAvatar;
    if(profileImg) profileImg.src = appState.shared.myAvatar;
    
    switchTab('dashboard'); 
};

// Funciones para abrir modales (necesarias para el HTML)
function openGroupModal() { document.getElementById('group-modal').classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openNoteModal() { document.getElementById('note-modal').classList.remove('hidden'); }
function openMealModal() { document.getElementById('meal-modal').classList.remove('hidden'); }
function editProfileName() {
    const n = prompt("Nuevo nombre:", appState.profileName);
    if(n) { appState.profileName = n; saveState(); document.getElementById('profile-name-text').innerText = n; }
}
