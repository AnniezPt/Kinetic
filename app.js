// 1. CARGA DE DATOS LOCALES
const savedSets = JSON.parse(localStorage.getItem('kinetic_workout_sets'));
const savedHydration = JSON.parse(localStorage.getItem('kinetic_hydration'));
const savedMeals = JSON.parse(localStorage.getItem('kinetic_meals'));
const savedGoals = JSON.parse(localStorage.getItem('kinetic_goals'));
const savedNotes = JSON.parse(localStorage.getItem('kinetic_notes'));
const savedShared = JSON.parse(localStorage.getItem('kinetic_shared'));
const savedGroups = JSON.parse(localStorage.getItem('kinetic_groups'));
const savedDashboard = JSON.parse(localStorage.getItem('kinetic_dashboard'));

// 2. ESTADO GLOBAL (BASE DE DATOS SIMULADA)
const appState = {
    dashboard: savedDashboard || {
        calories: 1240, 
        dailyCalorieGoal: 1650,
        weight: 85.4,
        totalVolumeKg: 152000, 
        peakSetKg: 185,
        sessionsCompleted: 18
    },
    currentGroupView: 'push', 
    groups: savedGroups || {
        push: { title: "EMPUJE", exercises: [{ name: "Press Banca Inclinado", focus: "Pecho • Hombros", sets: 4, reps: 10, rest: 90 }, { name: "Press Militar", focus: "Hombros • Tríceps", sets: 3, reps: 12, rest: 90 }, { name: "Extensiones Tríceps", focus: "Tríceps", sets: 3, reps: 15, rest: 60 }] },
        pull: { title: "TIRÓN", exercises: [{ name: "Dominadas Lastradas", focus: "Espalda • Bíceps", sets: 4, reps: 8, rest: 120 }, { name: "Remo con Barra", focus: "Dorsales", sets: 4, reps: 10, rest: 90 }, { name: "Face Pulls", focus: "Hombro Posterior", sets: 3, reps: 15, rest: 60 }] },
        legs: { title: "PIERNAS", exercises: [{ name: "Sentadilla Trasera", focus: "Quads • Glúteos", sets: 4, reps: 8, rest: 120 }, { name: "Peso Muerto Rumano", focus: "Isquiotibiales", sets: 4, reps: 10, rest: 90 }, { name: "Elevaciones Gemelos", focus: "Gemelos", sets: 4, reps: 20, rest: 60 }] }
    },
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
            { id: 1, type: "Desayuno", name: "Avena con whey y bayas", kcal: 450, p: 35, c: 50, f: 12, img: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1406&auto=format&fit=crop" },
            { id: 2, type: "Comida", name: "Pechuga de pollo a la plancha y quinoa", kcal: 620, p: 60, c: 75, f: 15, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1398&auto=format&fit=crop" }
        ]
    },
    journal: {
        goals: savedGoals || [
            { id: 1, title: "Lograr Peso Muerto 230kg", subtitle: "Meta Est.: Dic 2026", done: true },
            { id: 2, title: "Dominar Muscle Up", subtitle: "Enfoque en fuerza gimnástica", done: false }
        ],
        notes: savedNotes || [
            { id: 1, day: "20", monthYear: "ABR 2026", title: "Análisis de Fatiga Post-Día de Pierna", content: "El tren inferior se sintió sorprendentemente pesado. Noté una ligera inestabilidad en la rodilla izquierda. Mañana toca recuperación activa.", img: "", tags: ["Análisis", "Pierna"] },
            { id: 2, day: "18", monthYear: "ABR 2026", title: "Día de RP: Energía Cinética Pura", content: "Increíble sesión hoy. El press de banca se sintió como mover aire. Logré el single de 100kg con precisión técnica.", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1400", tags: ["RP", "Empuje"] }
        ]
    },
    shared: savedShared || {
        myAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=100",
        partnerAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
        upcoming: [
            { id: 1, dayStr: "Lun", dayNum: "20", title: "INTENSIDAD CUERPO COMPLETO", time: "07:00 AM — 08:30 AM" }
        ],
        past: [],
        calendar: { 20: 'synced' },
        selectedDay: 20
    },
    timer: {
        timeLeft: 74, 
        interval: null
    }
};

let currentDuoTool = null;

// 3. FUNCIÓN DE GUARDADO PERMANENTE
function saveState() {
    localStorage.setItem('kinetic_workout_sets', JSON.stringify(appState.workout.sets));
    localStorage.setItem('kinetic_hydration', JSON.stringify(appState.nutrition.hydration));
    localStorage.setItem('kinetic_meals', JSON.stringify(appState.nutrition.meals));
    localStorage.setItem('kinetic_goals', JSON.stringify(appState.journal.goals));
    localStorage.setItem('kinetic_notes', JSON.stringify(appState.journal.notes));
    localStorage.setItem('kinetic_shared', JSON.stringify(appState.shared));
    localStorage.setItem('kinetic_groups', JSON.stringify(appState.groups));
    localStorage.setItem('kinetic_dashboard', JSON.stringify(appState.dashboard));
}

// 4. LÓGICA DE NAVEGACIÓN
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        const icon = el.querySelector('i');
        if(icon) { icon.classList.remove('ph-fill'); icon.classList.add('ph'); }
    });
    document.getElementById(`view-${tabId}`).classList.add('active');
    const tab = document.getElementById(`tab-${tabId}`);
    if (tab) {
        tab.classList.add('active');
        const icon = tab.querySelector('i');
        if(icon) { icon.classList.remove('ph'); icon.classList.add('ph-fill'); }
    }
    const header = document.getElementById('global-header');
    if(tabId === 'profile' || tabId === 'shared') {
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
        header.style.position = 'absolute';
    } else {
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
        header.style.position = 'sticky';
    }
    if(tabId === 'shared') renderCalendar();
}

// 5. LÓGICA DEL PANEL (DASHBOARD)
function renderDashboard() {
    const dash = appState.dashboard;
    const remCals = Math.max(0, dash.dailyCalorieGoal - dash.calories);
    const percent = Math.min(100, Math.round((dash.calories / dash.dailyCalorieGoal) * 100));
    document.getElementById('dash-active-cals').innerText = dash.calories.toLocaleString();
    document.getElementById('dash-rem-cals').innerText = remCals.toLocaleString();
    document.getElementById('dash-cal-percent').innerText = `${percent}%`;
    document.getElementById('dash-cal-svg').setAttribute('stroke-dasharray', `${percent}, 100`);
    document.getElementById('dash-current-weight').innerText = parseFloat(dash.weight).toFixed(1);
    const tons = (dash.totalVolumeKg / 1000).toFixed(1);
    const avg = dash.sessionsCompleted > 0 ? Math.round(dash.totalVolumeKg / dash.sessionsCompleted) : 0;
    document.getElementById('dash-total-volume').innerText = tons;
    document.getElementById('dash-avg-session').innerText = avg.toLocaleString();
    document.getElementById('dash-peak-set').innerText = dash.peakSetKg;
}

function promptEditStat(type) {
    if (type === 'calories') {
        const newVal = prompt('¿Cuántas calorías activas llevas hoy?', appState.dashboard.calories);
        if (newVal !== null && !isNaN(newVal) && newVal.trim() !== '') {
            appState.dashboard.calories = parseInt(newVal);
            saveState();
            renderDashboard();
        }
    } else if (type === 'weight') {
        const newVal = prompt('Introduce tu peso actual (KG):', appState.dashboard.weight);
        if (newVal !== null && !isNaN(newVal) && newVal.trim() !== '') {
            appState.dashboard.weight = parseFloat(newVal);
            saveState();
            renderDashboard();
        }
    }
}

// 6. LÓGICA DE NOTIFICACIONES (ONESIGNAL)
function requestOneSignalPush() { 
    OneSignalDeferred.push(function(OneSignal) {
        OneSignal.Slidedown.promptPush(); 
    });
    const badge = document.getElementById('bell-badge');
    if(badge) badge.style.display = 'none';
}

// 7. LÓGICA DE ENTRENAMIENTOS
function openGroupDetail(groupId) {
    appState.currentGroupView = groupId;
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-group-detail').classList.add('active');
    document.getElementById('global-header').style.opacity = '0';
    document.getElementById('global-header').style.pointerEvents = 'none';
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        const icon = el.querySelector('i');
        if(icon) { icon.classList.remove('ph-fill'); icon.classList.add('ph'); }
    });
    const tab = document.getElementById('tab-workout');
    tab.classList.add('active');
    const tabIcon = tab.querySelector('i');
    if(tabIcon) { tabIcon.classList.remove('ph'); tabIcon.classList.add('ph-fill'); }
    renderGroupDetail();
}

function renderGroupDetail() {
    const group = appState.groups[appState.currentGroupView];
    document.getElementById('detail-group-title').innerText = group.title;
    const container = document.getElementById('detail-exercises-container');
    container.innerHTML = '';
    group.exercises.forEach((ex, index) => {
        container.innerHTML += `
        <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-black text-lg text-slate-800">${ex.name}</h4>
                <span class="text-kin-blue font-black opacity-20 text-2xl absolute right-5 top-4">0${index+1}</span>
            </div>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">${ex.focus}</p>
            <div class="grid grid-cols-3 gap-3">
                <div class="bg-kin-bg rounded-xl p-2 text-center border border-slate-100">
                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Series</p>
                    <input type="number" value="${ex.sets}" onchange="updateEx(${index}, 'sets', this.value)" class="w-full bg-transparent font-black text-xl text-center text-kin-blue focus:outline-none">
                </div>
                <div class="bg-kin-bg rounded-xl p-2 text-center border border-slate-100">
                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reps</p>
                    <input type="number" value="${ex.reps}" onchange="updateEx(${index}, 'reps', this.value)" class="w-full bg-transparent font-black text-xl text-center text-kin-blue focus:outline-none">
                </div>
                <div class="bg-kin-bg rounded-xl p-2 text-center border border-slate-100">
                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Desc (s)</p>
                    <input type="number" value="${ex.rest}" onchange="updateEx(${index}, 'rest', this.value)" class="w-full bg-transparent font-black text-xl text-center text-kin-blue focus:outline-none">
                </div>
            </div>
        </div>`;
    });
}

function updateEx(index, field, value) {
    appState.groups[appState.currentGroupView].exercises[index][field] = parseInt(value) || 0;
    saveState();
}

function startActiveWorkout() {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-workout-active').classList.add('active');
    document.getElementById('global-header').style.opacity = '1';
    document.getElementById('global-header').style.pointerEvents = 'auto';
    resetTimer();
}

function renderSets() {
    const container = document.getElementById('sets-container');
    container.innerHTML = '';
    let completedSets = 0;
    appState.workout.sets.forEach((set, index) => {
        if (set.done) completedSets++;
        const html = set.done ? `
        <div class="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm border border-slate-100 transition-all">
            <div class="w-1/4 text-xl font-black text-slate-800 ml-2">0${index + 1}</div>
            <div class="w-1/4 text-center font-black text-xl">${set.weight} <span class="text-xs font-bold text-slate-400 ml-1">KG</span></div>
            <div class="w-1/4 text-center font-black text-xl">${set.reps}</div>
            <div class="w-1/4 flex justify-end pr-2">
                <button onclick="toggleSet(${index})" class="w-8 h-8 bg-kin-blue rounded-full text-white flex items-center justify-center active:scale-90 transition-transform">
                    <i class="ph-bold ph-check"></i>
                </button>
            </div>
        </div>
        ` : `
        <div class="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm border-2 border-slate-100 transition-all">
            <div class="w-1/4 text-xl font-black text-kin-blue ml-2">0${index + 1}</div>
            <div class="w-1/4 flex justify-center">
                <input type="number" value="${set.weight}" onchange="updateSetData(${index}, 'weight', this.value)" class="w-16 bg-slate-200 font-black text-xl text-center rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-kin-blue">
            </div>
            <div class="w-1/4 flex justify-center">
                <input type="number" value="${set.reps}" onchange="updateSetData(${index}, 'reps', this.value)" class="w-16 bg-slate-200 font-black text-xl text-center rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-kin-blue">
            </div>
            <div class="w-1/4 flex justify-end pr-2">
                <button onclick="toggleSet(${index})" class="w-8 h-8 border-2 border-slate-300 rounded-full text-slate-400 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform">
                    <i class="ph-bold ph-plus"></i>
                </button>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
    const total = appState.workout.sets.length;
    const percentage = Math.round((completedSets / total) * 100);
    document.getElementById('workout-progress-text').innerText = `${completedSets} / ${total} COMPLETADAS`;
    document.getElementById('momentum-text').innerText = `${percentage}%`;
    document.getElementById('momentum-bar').style.width = `${percentage}%`;
    if(completedSets > 0 && percentage < 100) resetTimer();
}

function toggleSet(index) {
    appState.workout.sets[index].done = !appState.workout.sets[index].done;
    saveState();
    renderSets();
}

function updateSetData(index, field, value) {
    appState.workout.sets[index][field] = parseInt(value) || 0;
    saveState();
}

function finishSession() {
    if(confirm('¿Has terminado tu entrenamiento? Se sumará el volumen a tus estadísticas y se reiniciarán las series.')) {
        let sessionVolumeKg = 0;
        let sessionPeak = 0;
        appState.workout.sets.forEach(set => {
            if (set.done) {
                sessionVolumeKg += (set.weight * set.reps);
                if (set.weight > sessionPeak) sessionPeak = set.weight;
            }
        });
        if (sessionVolumeKg > 0) {
            appState.dashboard.totalVolumeKg += sessionVolumeKg;
            appState.dashboard.sessionsCompleted += 1;
            if (sessionPeak > appState.dashboard.peakSetKg) {
                appState.dashboard.peakSetKg = sessionPeak;
            }
        }
        appState.workout.sets = [
            { id: 1, weight: 100, reps: 10, done: false },
            { id: 2, weight: 100, reps: 8, done: false },
            { id: 3, weight: 100, reps: 8, done: false }
        ];
        saveState();
        renderSets();
        renderDashboard();
        switchTab('history');
    }
}

// 8. LÓGICA DE DIETA Y NUTRICIÓN
function renderHydration() {
    const container = document.getElementById('hydration-container');
    if(!container) return;
    container.innerHTML = '';
    let filledCount = 0;
    appState.nutrition.hydration.forEach((isFilled, index) => {
        if (isFilled) filledCount++;
        const html = isFilled 
            ? `<div onclick="toggleHydration(${index})" class="w-12 h-12 bg-kin-blue text-white rounded-xl flex items-center justify-center text-xl shadow-sm shadow-blue-500/20 cursor-pointer active:scale-90 transition-all"><i class="ph-fill ph-drop"></i></div>` 
            : `<div onclick="toggleHydration(${index})" class="w-12 h-12 bg-slate-100 text-slate-300 rounded-xl flex items-center justify-center text-xl cursor-pointer hover:bg-slate-200 active:scale-90 transition-all"><i class="ph-fill ph-drop"></i></div>`;
        container.innerHTML += html;
    });
    const liters = (filledCount * 0.7).toFixed(1);
    document.getElementById('hydration-text').innerText = `${liters}L / 3.5L`;
    const percentage = (filledCount / 5) * 100;
    const bar = document.getElementById('hydration-bar');
    if(bar) bar.style.width = `${percentage}%`;
}

function toggleHydration(index) {
    appState.nutrition.hydration[index] = !appState.nutrition.hydration[index];
    saveState();
    renderHydration();
}

function renderNutrition() {
    const goals = appState.nutrition.macroGoals;
    let sumKcal = 0, sumP = 0, sumC = 0, sumF = 0;
    const container = document.getElementById('meals-container');
    if(!container) return;
    container.innerHTML = '';
    appState.nutrition.meals.forEach((meal, index) => {
        sumKcal += meal.kcal;
        sumP += meal.p;
        sumC += meal.c;
        sumF += meal.f;
        container.innerHTML += `
        <div class="bg-white rounded-3xl p-4 shadow-sm mb-4 relative overflow-hidden group">
            <button onclick="deleteMeal(${index})" class="absolute top-6 right-6 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <i class="ph-bold ph-trash"></i>
            </button>
            <img src="${meal.img}" class="w-full h-24 object-cover rounded-2xl mb-3 grayscale mix-blend-multiply opacity-80" alt="${meal.name}">
            <div class="flex justify-between items-start mb-1">
                <h4 class="font-black text-sm uppercase">${meal.type}</h4>
                <span class="font-black text-sm">${meal.kcal} <span class="text-[8px] text-slate-400 uppercase">Kcal</span></span>
            </div>
            <p class="text-xs text-slate-500 font-medium mb-3">${meal.name}</p>
            <div class="flex gap-2">
                <span class="bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-1 rounded uppercase">P: ${meal.p}G</span>
                <span class="bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-1 rounded uppercase">C: ${meal.c}G</span>
                <span class="bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-1 rounded uppercase">G: ${meal.f}G</span>
            </div>
        </div>`;
    });
    const remKcal = Math.max(0, appState.nutrition.dailyGoalKcal - sumKcal);
    document.getElementById('nutrition-rem-kcal').innerText = remKcal.toLocaleString();
}

// 9. LÓGICA DE DÚO Y CALENDARIO
function renderCalendar() {
    const container = document.getElementById('calendar-grid');
    if(!container) return;
    let html = `
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lun</div>
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mar</div>
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mié</div>
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Jue</div>
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vie</div>
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sáb</div>
    <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dom</div>
    <div class="w-10 h-10 mx-auto"></div> 
    `;
    
    for(let i=1; i<=31; i++) {
        const status = appState.shared.calendar[i];
        let dotsHtml = '';
        if(status === 'you') dotsHtml = `<div class="absolute bottom-1 w-1.5 h-1.5 bg-kin-blue rounded-full"></div>`;
        else if(status === 'partner') dotsHtml = `<div class="absolute bottom-1 w-1.5 h-1.5 bg-kin-brown rounded-full"></div>`;
        else if(status === 'synced') dotsHtml = `<div class="absolute bottom-1 flex"><div class="w-1.5 h-1.5 bg-kin-blue rounded-full"></div><div class="w-1.5 h-1.5 bg-kin-brown rounded-full -ml-0.5"></div></div>`;
        
        const isSelected = (appState.shared.selectedDay === i);
        const selectedClass = isSelected ? 'border-2 border-kin-blue bg-blue-50 shadow-sm' : 'border border-transparent hover:border-slate-200';
        const textClass = isSelected ? 'text-kin-blue' : 'text-slate-800';
        
        html += `
        <div onclick="handleDayClick(${i})" class="w-10 h-10 flex flex-col items-center justify-center rounded-xl mx-auto cursor-pointer relative transition-all ${selectedClass}">
            <span class="font-bold text-sm ${textClass}">${i}</span>
            ${dotsHtml}
        </div>`;
    }
    
    container.innerHTML = html;
    document.getElementById('duo-selected-date').innerText = `ABR ${appState.shared.selectedDay}`;
}

function handleDayClick(day) {
    appState.shared.selectedDay = day;
    if (currentDuoTool) {
        if (appState.shared.calendar[day] === currentDuoTool) {
            delete appState.shared.calendar[day]; 
        } else {
            appState.shared.calendar[day] = currentDuoTool; 
        }
        saveState();
    }
    renderCalendar();
}

function setDuoTool(tool) {
    currentDuoTool = (currentDuoTool === tool) ? null : tool;
    ['you', 'partner', 'synced'].forEach(t => {
        const el = document.getElementById(`tool-${t}`);
        if(el) {
            if(currentDuoTool === t) {
                el.classList.add('border-kin-blue', 'ring-2', 'ring-kin-blue/20', 'bg-blue-50');
            } else {
                el.classList.remove('border-kin-blue', 'ring-2', 'ring-kin-blue/20', 'bg-blue-50');
            }
        }
    });
}

// 10. TEMPORIZADOR Y OTROS
function startTimer() {
    if(appState.timer.interval) clearInterval(appState.timer.interval);
    appState.timer.interval = setInterval(() => {
        const view = document.getElementById('view-workout-active');
        if (appState.timer.timeLeft > 0 && view && view.classList.contains('active')) {
            appState.timer.timeLeft--;
            const m = Math.floor(appState.timer.timeLeft / 60).toString().padStart(2, '0');
            const s = (appState.timer.timeLeft % 60).toString().padStart(2, '0');
            const display = document.getElementById('timer-display');
            if(display) display.innerText = `${m}:${s}`;
        }
    }, 1000);
}

function resetTimer() {
    appState.timer.timeLeft = 74; 
    const display = document.getElementById('timer-display');
    if(display) display.innerText = `01:14`;
    startTimer();
}

function renderSharedData() {
    const myImg = document.getElementById('my-avatar-img');
    const partImg = document.getElementById('partner-avatar-img');
    if(myImg) myImg.src = appState.shared.myAvatar;
    if(partImg) partImg.src = appState.shared.partnerAvatar;
}

function renderGoals() {
    const container = document.getElementById('goals-container');
    if(!container) return;
    container.innerHTML = '';
    appState.journal.goals.forEach((goal, index) => {
        const checkedAttr = goal.done ? 'checked' : '';
        const textColorClass = goal.done ? 'text-kin-blue line-through opacity-80' : 'text-slate-800';
        container.innerHTML += `
        <label class="flex items-start gap-3 mb-3 cursor-pointer">
            <input type="checkbox" ${checkedAttr} onchange="toggleGoal(${index})" class="mt-1 w-5 h-5 accent-kin-blue rounded-md border-slate-300">
            <div>
                <p class="font-bold ${textColorClass}">${goal.title}</p>
                <p class="text-xs text-slate-400 font-medium">${goal.subtitle || ''}</p>
            </div>
        </label>`;
    });
}

function toggleGoal(index) {
    appState.journal.goals[index].done = !appState.journal.goals[index].done;
    saveState();
    renderGoals();
}

function renderNotes() {
    const container = document.getElementById('notes-container');
    if(!container) return;
    container.innerHTML = '';
    appState.journal.notes.forEach((note, index) => {
        const tagsHtml = note.tags.map(tag => `<span class="bg-slate-100 text-slate-600 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase">#${tag}</span>`).join('');
        container.innerHTML += `
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            <p class="text-2xl font-black text-kin-blue leading-none mb-1">${note.day}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">${note.monthYear}</p>
            <h4 class="font-black text-xl mb-3 leading-tight">${note.title}</h4>
            <p class="text-sm text-slate-500 font-medium mb-4">${note.content}</p>
            <div class="flex flex-wrap gap-2">${tagsHtml}</div>
        </div>`;
}

// INICIALIZADOR
window.onload = () => {
    renderDashboard();
    renderSets();
    renderNutrition();
    renderHydration();
    renderGoals();
    renderNotes(); 
    renderSharedData();
    renderCalendar();
    startTimer();
};
