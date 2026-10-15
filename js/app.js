// =============================================================================
// APLICACIÓN PRINCIPAL: MATEMÁTICAS 4.º · TEMA 1
// Páginas 6 a 9: Numeración, Aproximación, Romanos y Ordinales
// Compatible con iPad iOS 12.5.8+ y Safari Legacy
// =============================================================================

// Helper seguro para localStorage en iPad / Safari (evita excepciones en modo privado)
var safeStorage = {
  get: function(key, defaultVal) {
    try {
      var val = localStorage.getItem(key);
      return val !== null ? val : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  },
  set: function(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }
};

function getInputValue(id, container) {
  var el = container ? container.querySelector(id) : document.getElementById(id);
  return el ? el.value : '';
}

class MathApp {
  constructor() {
    this.currentTab = 'home';
    this.studentName = safeStorage.get('olivia_math_name', 'Olivia');
    this.stars = parseInt(safeStorage.get('olivia_math_stars', '0'), 10);
    this.activeScenarioIndex = 0; // Por defecto Aventura 1 (Andalucía)
    this.scenario = MathData.scenarios[0];

    // Estados de retos y tests
    this.expressScore = 0;
    this.expressCurrent = 0;
    this.expressQuestions = [];
    this.arcadeScore = 0;
    this.arcadeStreak = 0;
    this.arcadeCurrentQuestion = null;

    // Estado del simulador de colas
    this.simSelectedA = 3;
    this.simSelectedB = 14;
    this.simTotalKids = 30;

    this.init();
  }

  init() {
    this.updateUserUI();
    this.renderScenarioSelector();
    this.bindGlobalEvents();
    this.navigate('home');
  }

  // ---------------------------------------------------------------------------
  // GESTIÓN DE USUARIO Y PUNTUACIÓN
  // ---------------------------------------------------------------------------
  updateUserUI() {
    const starsEl = document.getElementById('header-stars');
    const nameEl = document.getElementById('header-student-name');
    if (starsEl) starsEl.textContent = this.stars;
    if (nameEl) nameEl.textContent = this.studentName;
  }

  addStars(count = 1) {
    this.stars += count;
    safeStorage.set('olivia_math_stars', this.stars);
    this.updateUserUI();
    if (window.sound) sound.playCorrect();
  }

  setStudentName(name) {
    this.studentName = name || 'Olivia';
    safeStorage.set('olivia_math_name', this.studentName);
    this.updateUserUI();
  }

  // ---------------------------------------------------------------------------
  // NAVEGACIÓN ENTRE PESTAÑAS
  // ---------------------------------------------------------------------------
  navigate(tabId) {
    this.currentTab = tabId;
    if (window.sound) sound.playClick();

    // Actualizar botones de navegación
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-target');
      if (target === tabId) {
        btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-200');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'hover:bg-slate-200');
      }
    });

    // Ocultar todas las secciones
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    // Mostrar sección activa
    const activeSec = document.getElementById(`view-${tabId}`);
    if (activeSec) {
      activeSec.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Renderizar vistas dinámicas según corresponda
    if (tabId === 'base') {
      this.renderBaseMission();
    } else if (tabId === 'detective') {
      this.renderDetectiveMission();
    } else if (tabId === 'express') {
      this.startExpressChallenge();
    } else if (tabId === 'arcade') {
      this.startArcadeGame();
    } else if (tabId === 'queue_sim') {
      this.renderQueueSimulator();
    } else if (tabId === 'study') {
      this.renderStudyGuide();
    } else if (tabId === 'diploma') {
      this.renderDiploma();
    }
  }

  // ---------------------------------------------------------------------------
  // SELECTOR Y GENERADOR DE CASUÍSTICA (NUNCA LOS MISMOS NÚMEROS / CIUDADES)
  // ---------------------------------------------------------------------------
  renderScenarioSelector() {
    const container = document.getElementById('scenario-selector-container');
    if (!container) return;

    let html = `
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 mb-8 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white uppercase tracking-wider mb-2">
              🎲 Escenario Activo
            </span>
            <h3 class="text-xl font-black text-slate-900">${this.scenario.name || this.scenario.title}</h3>
            <p class="text-xs md:text-sm text-slate-600 mt-1">${this.scenario.description || 'Casuística temática para practicar todos los conceptos del libro sin repetir siempre los mismos datos.'}</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button id="btn-generate-random" class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs md:text-sm font-black rounded-2xl shadow-md transition transform active:scale-95 flex items-center gap-2">
              <span>✨ Generar Nueva Casuística Aleatoria</span>
            </button>
          </div>
        </div>

        <!-- Botones de selección de escenarios predefinidos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-blue-200/60">
    `;

    MathData.scenarios.forEach((sc, idx) => {
      const isSelected = this.scenario.id === sc.id;
      html += `
        <button class="scenario-pill-btn text-left p-3 rounded-2xl border transition text-xs font-bold ${
          isSelected
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
        }" data-index="${idx}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}">
              ${sc.badge}
            </span>
            ${isSelected ? '<span>✓ Activo</span>' : ''}
          </div>
          <div class="font-black text-xs truncate">${sc.name}</div>
        </button>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Eventos
    container.querySelectorAll('.scenario-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.setScenario(MathData.scenarios[idx]);
      });
    });

    const btnRandom = container.getElementById ? container.querySelector('#btn-generate-random') : document.getElementById('btn-generate-random');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        const dynamic = MathUtils.generateDynamicScenario();
        dynamic.badge = "Generado Aleatorio";
        dynamic.name = dynamic.title;
        dynamic.description = `Casuística generada al vuelo en ${dynamic.location} con números aleatorios únicos.`;
        this.setScenario(dynamic);
      });
    }
  }

  setScenario(sc) {
    this.scenario = sc;
    if (window.sound) sound.playClick();
    this.renderScenarioSelector();
    // Volver a renderizar la sección si estamos en base o detective
    if (this.currentTab === 'base') this.renderBaseMission();
    if (this.currentTab === 'detective') this.renderDetectiveMission();
  }

  // ---------------------------------------------------------------------------
  // PARTE 1: MISIÓN BASE (INSPIRADA EN MODELO B - PÁGINAS 6 Y 7)
  // ---------------------------------------------------------------------------
  renderBaseMission() {
    const container = document.getElementById('base-mission-content');
    if (!container) return;

    const v = this.scenario.visitors;
    const m = this.scenario.monuments;
    const q = this.scenario.queue;

    const dec2020 = MathUtils.decompose(v[2020]);
    const dec2021 = MathUtils.decompose(v[2021]);
    const dec2022 = MathUtils.decompose(v[2022]);
    const dec2019 = MathUtils.decompose(v[2019]);

    let html = `
      <!-- Cabecera de datos contextuales -->
      <div class="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span class="px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-blue-200 text-xs font-black uppercase tracking-wider">
              Prueba de Evaluación · Modelo B (Páginas 6 y 7)
            </span>
            <button class="btn-speak-scenario px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5" data-text="${this.scenario.contextLabel}. En 2019: ${v[2019]}. En 2020: ${v[2020]}. En 2021: ${v[2021]}. En 2022: ${v[2022]}">
              <span>🔊 Escuchar datos</span>
            </button>
          </div>
          <h2 class="text-xl md:text-2xl font-black text-white mb-4">
            ${this.scenario.contextLabel}
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div class="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center">
              <span class="text-xs text-blue-200 font-bold block mb-1">📅 Año 2019</span>
              <span class="text-xl md:text-2xl font-black text-amber-300 font-display">${MathUtils.formatNumber(v[2019])}</span>
              <span class="text-[10px] text-blue-200 block mt-1">visitantes</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center">
              <span class="text-xs text-blue-200 font-bold block mb-1">📅 Año 2020</span>
              <span class="text-xl md:text-2xl font-black text-emerald-300 font-display">${MathUtils.formatNumber(v[2020])}</span>
              <span class="text-[10px] text-blue-200 block mt-1">visitantes</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center">
              <span class="text-xs text-blue-200 font-bold block mb-1">📅 Año 2021</span>
              <span class="text-xl md:text-2xl font-black text-cyan-300 font-display">${MathUtils.formatNumber(v[2021])}</span>
              <span class="text-[10px] text-blue-200 block mt-1">visitantes</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center">
              <span class="text-xs text-blue-200 font-bold block mb-1">📅 Año 2022</span>
              <span class="text-xl md:text-2xl font-black text-purple-300 font-display">${MathUtils.formatNumber(v[2022])}</span>
              <span class="text-[10px] text-blue-200 block mt-1">visitantes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- EJERCICIO 1: DESCOMPÓN Y ESCRIBE CÓMO SE LEE (PÁGINA 6) -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">1</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Descompón y escribe cómo se lee</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Descompón por orden de unidades, en suma de valores y escribe con letras el número de visitantes de 2020, 2021 y 2022.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 1: Descompón y escribe cómo se lee el número de personas que visitaron la provincia en el mes de mayo en 2020, 2021 y 2022.">
            🔊 Leer
          </button>
        </div>

        <div class="space-y-6">
          <!-- Bloque Año 2020 -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5" id="ex1-block-2020">
            <div class="flex items-center justify-between mb-3">
              <span class="font-black text-slate-800 text-base">🟢 Año 2020: <span class="text-blue-700">${MathUtils.formatNumber(v[2020])}</span></span>
              <button class="btn-peek-hint text-xs font-bold text-blue-600 hover:underline" data-target="hint-2020">💡 Ver chuleta / pistas</button>
            </div>
            <div id="hint-2020" class="hidden text-xs bg-blue-50 text-blue-800 p-3 rounded-xl mb-3 border border-blue-200">
              📌 <strong>Por órdenes:</strong> ${dec2020.orderText}<br>
              📌 <strong>En valores:</strong> ${dec2020.valuesText}<br>
              📌 <strong>Se lee:</strong> ${dec2020.wordsText}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Descomposición por órdenes:</label>
                <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${dec2020.orderText}" id="input-base-orders-2020">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">En suma de valores (unidades):</label>
                <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${dec2020.valuesText}" id="input-base-values-2020">
              </div>
              <div class="md:col-span-2">
                <label class="block font-bold text-slate-700 mb-1">Se lee (con letras):</label>
                <div class="flex gap-2">
                  <input type="text" class="w-full px-3 py-2 border rounded-xl text-xs md:text-sm" placeholder="Escribe aquí con palabras..." id="input-base-words-2020">
                  <button class="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl btn-listen-word" data-text="${dec2020.wordsText}" title="Escuchar pronunciación correcta">🔊</button>
                </div>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <button class="btn-check-ex1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs" data-year="2020">
                ✓ Comprobar 2020
              </button>
              <div id="feedback-ex1-2020" class="text-xs font-bold"></div>
            </div>
          </div>

          <!-- Bloque Año 2021 -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5" id="ex1-block-2021">
            <div class="flex items-center justify-between mb-3">
              <span class="font-black text-slate-800 text-base">🔵 Año 2021: <span class="text-blue-700">${MathUtils.formatNumber(v[2021])}</span></span>
              <button class="btn-peek-hint text-xs font-bold text-blue-600 hover:underline" data-target="hint-2021">💡 Ver chuleta / pistas</button>
            </div>
            <div id="hint-2021" class="hidden text-xs bg-blue-50 text-blue-800 p-3 rounded-xl mb-3 border border-blue-200">
              📌 <strong>Por órdenes:</strong> ${dec2021.orderText}<br>
              📌 <strong>En valores:</strong> ${dec2021.valuesText}<br>
              📌 <strong>Se lee:</strong> ${dec2021.wordsText}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Descomposición por órdenes:</label>
                <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${dec2021.orderText}" id="input-base-orders-2021">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">En suma de valores (unidades):</label>
                <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${dec2021.valuesText}" id="input-base-values-2021">
              </div>
              <div class="md:col-span-2">
                <label class="block font-bold text-slate-700 mb-1">Se lee (con letras):</label>
                <div class="flex gap-2">
                  <input type="text" class="w-full px-3 py-2 border rounded-xl text-xs md:text-sm" placeholder="Escribe aquí con palabras..." id="input-base-words-2021">
                  <button class="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl btn-listen-word" data-text="${dec2021.wordsText}">🔊</button>
                </div>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <button class="btn-check-ex1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs" data-year="2021">
                ✓ Comprobar 2021
              </button>
              <div id="feedback-ex1-2021" class="text-xs font-bold"></div>
            </div>
          </div>

          <!-- Bloque Año 2022 -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5" id="ex1-block-2022">
            <div class="flex items-center justify-between mb-3">
              <span class="font-black text-slate-800 text-base">🟣 Año 2022: <span class="text-blue-700">${MathUtils.formatNumber(v[2022])}</span></span>
              <button class="btn-peek-hint text-xs font-bold text-blue-600 hover:underline" data-target="hint-2022">💡 Ver chuleta / pistas</button>
            </div>
            <div id="hint-2022" class="hidden text-xs bg-blue-50 text-blue-800 p-3 rounded-xl mb-3 border border-blue-200">
              📌 <strong>Por órdenes:</strong> ${dec2022.orderText}<br>
              📌 <strong>En valores:</strong> ${dec2022.valuesText}<br>
              📌 <strong>Se lee:</strong> ${dec2022.wordsText}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Descomposición por órdenes:</label>
                <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${dec2022.orderText}" id="input-base-orders-2022">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">En suma de valores (unidades):</label>
                <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${dec2022.valuesText}" id="input-base-values-2022">
              </div>
              <div class="md:col-span-2">
                <label class="block font-bold text-slate-700 mb-1">Se lee (con letras):</label>
                <div class="flex gap-2">
                  <input type="text" class="w-full px-3 py-2 border rounded-xl text-xs md:text-sm" placeholder="Escribe aquí con palabras..." id="input-base-words-2022">
                  <button class="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl btn-listen-word" data-text="${dec2022.wordsText}">🔊</button>
                </div>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <button class="btn-check-ex1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs" data-year="2022">
                ✓ Comprobar 2022
              </button>
              <div id="feedback-ex1-2022" class="text-xs font-bold"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- EJERCICIO 2: COMPARACIÓN Y ORDENACIÓN (PÁGINA 6) -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">2</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Lee, compara y ordena</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Compara los años y ordena de menor a mayor los visitantes recibidos.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 2: ¿En qué año hubo más visitantes: en 2020 o en 2021? ¿Y en 2019 o en 2022? Ordena de menor a mayor el número de personas.">
            🔊 Leer
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Pregunta A -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="font-bold text-slate-800 text-xs md:text-sm block mb-3">
              ¿En qué año hubo <strong>MÁS</strong> visitantes: en 2020 (${MathUtils.formatNumber(v[2020])}) o en 2021 (${MathUtils.formatNumber(v[2021])})?
            </span>
            <div class="flex gap-3">
              <button class="btn-choice-cmp px-4 py-2.5 rounded-xl border font-black text-xs flex-1 transition hover:bg-blue-50" data-group="q1" data-val="2020">En 2020</button>
              <button class="btn-choice-cmp px-4 py-2.5 rounded-xl border font-black text-xs flex-1 transition hover:bg-blue-50" data-group="q1" data-val="2021">En 2021</button>
            </div>
            <div id="feedback-cmp-q1" class="text-xs font-bold mt-2"></div>
          </div>

          <!-- Pregunta B -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="font-bold text-slate-800 text-xs md:text-sm block mb-3">
              ¿Y en 2019 (${MathUtils.formatNumber(v[2019])}) o en 2022 (${MathUtils.formatNumber(v[2022])})?
            </span>
            <div class="flex gap-3">
              <button class="btn-choice-cmp px-4 py-2.5 rounded-xl border font-black text-xs flex-1 transition hover:bg-blue-50" data-group="q2" data-val="2019">En 2019</button>
              <button class="btn-choice-cmp px-4 py-2.5 rounded-xl border font-black text-xs flex-1 transition hover:bg-blue-50" data-group="q2" data-val="2022">En 2022</button>
            </div>
            <div id="feedback-cmp-q2" class="text-xs font-bold mt-2"></div>
          </div>
        </div>

        <!-- Pregunta C: Ordenar de menor a mayor -->
        <div class="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200">
          <span class="font-black text-indigo-950 text-sm block mb-2">
            Ordena de MENOR a MAYOR el número de visitantes:
          </span>
          <p class="text-xs text-indigo-700 mb-4">Haz clic en los números en el orden correcto (del más pequeño al más grande):</p>

          <div class="flex items-center gap-2 flex-wrap mb-4" id="order-source-chips">
            <!-- Chips barajados -->
          </div>

          <div class="p-3 bg-white border-2 border-dashed border-indigo-300 rounded-2xl min-h-[56px] flex items-center gap-2 flex-wrap" id="order-target-slots">
            <span class="text-xs text-slate-400 font-bold" id="order-placeholder">Selecciona los números en orden...</span>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <button id="btn-reset-order" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700">
              ↺ Reiniciar orden
            </button>
            <button id="btn-check-order" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs">
              ✓ Comprobar ordenación
            </button>
          </div>
          <div id="feedback-order" class="text-xs font-bold mt-2"></div>
        </div>
      </div>

      <!-- EJERCICIO 3: TABLA DE APROXIMACIÓN Y REDONDEO (PÁGINA 7) -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">3</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Aproxima y completa la tabla (Página 7)</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Aproxima el número de personas que visitaron la provincia al orden indicado.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 3: Aproxima el número de personas que visitaron la provincia al orden indicado y completa la tabla. A los millares, a las centenas y a las decenas.">
            🔊 Leer
          </button>
        </div>

        <div class="overflow-x-auto mb-6">
          <table class="w-full text-xs md:text-sm text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300">
                <th class="p-3 font-black text-slate-800">Año y Dato Real</th>
                <th class="p-3 font-black text-purple-800 bg-purple-50/70">A los millares (UM)</th>
                <th class="p-3 font-black text-blue-800 bg-blue-50/70">A las centenas (C)</th>
                <th class="p-3 font-black text-emerald-800 bg-emerald-50/70">A las decenas (D)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${[2019, 2020, 2021, 2022].map(year => {
                const val = v[year];
                return `
                  <tr class="hover:bg-slate-50/80">
                    <td class="p-3 font-bold text-slate-900">
                      <div>${year}</div>
                      <span class="text-xs text-blue-600 font-black font-mono">${MathUtils.formatNumber(val)}</span>
                    </td>
                    <td class="p-2.5 bg-purple-50/30">
                      <input type="text" class="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs input-round" data-year="${year}" data-order="UM" placeholder="Ej: ${MathUtils.formatNumber(MathUtils.roundNumber(val, 'UM'))}">
                    </td>
                    <td class="p-2.5 bg-blue-50/30">
                      <input type="text" class="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs input-round" data-year="${year}" data-order="C" placeholder="Ej: ${MathUtils.formatNumber(MathUtils.roundNumber(val, 'C'))}">
                    </td>
                    <td class="p-2.5 bg-emerald-50/30">
                      <input type="text" class="w-full px-2.5 py-1.5 border rounded-lg font-mono text-xs input-round" data-year="${year}" data-order="D" placeholder="Ej: ${MathUtils.formatNumber(MathUtils.roundNumber(val, 'D'))}">
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between mb-6">
          <button id="btn-check-rounding-table" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm rounded-xl shadow-xs">
            ✓ Comprobar Tabla de Redondeo
          </button>
          <div id="feedback-rounding-table" class="text-xs font-bold"></div>
        </div>

        <!-- Pregunta reflexiva -->
        <div class="p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <span class="font-black text-amber-950 text-sm block mb-1">
            🤔 Pregunta de Razonamiento del Libro:
          </span>
          <p class="text-xs text-amber-900 mb-3">
            ¿Qué orden de aproximación te parece más adecuado para cada dato? ¿Por qué?
          </p>
          <div class="space-y-2 text-xs text-slate-700">
            <label class="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-amber-200 cursor-pointer hover:bg-amber-100/50">
              <input type="radio" name="reflexive_round" value="correct" class="mt-0.5">
              <span><strong>Explicación correcta:</strong> Para los números de 5 cifras (como ${MathUtils.formatNumber(v[2019])} o ${MathUtils.formatNumber(v[2022])}) es más adecuado aproximar a los <em>millares</em> para hacernos una idea rápida sin perder sentido. En cambio, para un número de 3 cifras (como ${MathUtils.formatNumber(v[2020])}), aproximar a las <em>centenas o decenas</em> es mucho mejor porque aproximar a los millares lo cambiaría demasiado.</span>
            </label>
            <label class="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-amber-200 cursor-pointer hover:bg-amber-100/50">
              <input type="radio" name="reflexive_round" value="wrong" class="mt-0.5">
              <span>Todos los números deben aproximarse siempre a las decenas de millar obligatoriamente.</span>
            </label>
          </div>
          <div id="feedback-reflexive" class="text-xs font-bold mt-2"></div>
        </div>
      </div>

      <!-- EJERCICIO 4: NÚMEROS ROMANOS (PÁGINA 7) -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">4</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Números Romanos y Monumentos (Página 7)</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Indica en qué año se comenzaron a construir estos monumentos de la historia.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 4: Indica en qué año se comenzaron a construir estos monumentos históricos escritos en números romanos.">
            🔊 Leer
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          ${m.map((mon, idx) => `
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-slate-500 uppercase block mb-1">Monumento ${idx + 1}</span>
                <h4 class="font-black text-slate-900 text-sm mb-2">${mon.name}</h4>
                <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center mb-3">
                  <span class="text-lg font-black font-mono text-amber-900 tracking-widest">${mon.startRoman}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Año en números arábigos:</label>
                <div class="flex gap-2">
                  <input type="text" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm input-roman" data-expected="${mon.startYear}" placeholder="Ej: ${mon.startYear}">
                  <button class="btn-check-roman-single px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl" data-expected="${mon.startYear}">✓</button>
                </div>
                <div class="feedback-roman-single text-xs font-bold mt-1"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- EJERCICIO 5: NÚMEROS ORDINALES EN LA COLA (PÁGINA 7) -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">5</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Números Ordinales y Fila del Museo (Página 7)</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Para entrar al museo hay una cola formada por <strong>${q.total} personas</strong>.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 5: Lee y escribe la posición de cada persona con un número ordinal. Para entrar al museo hay una cola formada por ${q.total} personas. Alba está ${q.albaOffset} lugares por detrás de Miguel, que está el ${MathUtils.getOrdinal(q.miguelPos).word}. ¿En qué posición está Alba? Félix es el último. ¿Cuántos lugares por delante de él está Alba?">
            🔊 Leer
          </button>
        </div>

        <!-- Muestra de niños y posiciones -->
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
          <span class="text-xs font-black text-slate-700 block mb-2">👥 Niños y niñas en la cola:</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            ${q.sampleKids.map(k => `
              <div class="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <span class="font-bold text-slate-800">${k.name}</span>
                <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-black">${k.pos}.º</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="space-y-4">
          <!-- Subpregunta A -->
          <div class="p-5 rounded-2xl bg-blue-50/40 border border-blue-200">
            <span class="font-bold text-slate-800 text-xs md:text-sm block mb-2">
              Alba está <strong>${q.albaOffset} lugares por detrás</strong> de Miguel, que está en el <strong>${MathUtils.getOrdinal(q.miguelPos).num} lugar</strong> (${MathUtils.getOrdinal(q.miguelPos).word}). ¿En qué posición está Alba?
            </span>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-xs text-slate-600">Operación: ${q.miguelPos} + ${q.albaOffset} =</span>
              <input type="text" id="input-ord-alba" class="w-24 px-3 py-1.5 border rounded-xl font-bold text-xs" placeholder="Ej: ${q.albaPos}.º">
              <button id="btn-check-ord-alba" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl">✓ Comprobar</button>
              <span id="feedback-ord-alba" class="text-xs font-bold"></span>
            </div>
          </div>

          <!-- Subpregunta B -->
          <div class="p-5 rounded-2xl bg-purple-50/40 border border-purple-200">
            <span class="font-bold text-slate-800 text-xs md:text-sm block mb-2">
              Félix es el último de la cola (${q.total}.º). ¿Cuántos lugares <strong>por delante de él</strong> está Alba (que está en el ${q.albaPos}.º lugar)?
            </span>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-xs text-slate-600">Operación: ${q.total} - ${q.albaPos} =</span>
              <input type="text" id="input-ord-felix" class="w-24 px-3 py-1.5 border rounded-xl font-bold text-xs" placeholder="Ej: ${q.felixAheadOfAlba}">
              <span class="text-xs text-slate-600">lugares por delante</span>
              <button id="btn-check-ord-felix" class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl">✓ Comprobar</button>
              <span id="feedback-ord-felix" class="text-xs font-bold"></span>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <button class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs md:text-sm rounded-2xl shadow-md transition" onclick="app.navigate('queue_sim')">
            🚶‍♀️ Ver esta fila animada en el Simulador de Fila ➡️
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.bindBaseMissionEvents();
  }

  bindBaseMissionEvents() {
    const v = this.scenario.visitors;
    const q = this.scenario.queue;

    // Toggle de pistas
    document.querySelectorAll('.btn-peek-hint').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.getAttribute('data-target');
        const hintEl = document.getElementById(tid);
        if (hintEl) hintEl.classList.toggle('hidden');
      });
    });

    // Escuchar texto con voz
    document.querySelectorAll('.btn-speak-scenario, .btn-voice-read').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text') || btn.getAttribute('data-speak');
        if (window.sound && text) sound.speakText(text, true);
      });
    });

    document.querySelectorAll('.btn-listen-word').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        if (window.sound && text) sound.speakText(text, true);
      });
    });

    // Comprobar Ejercicio 1 (2020, 2021, 2022)
    document.querySelectorAll('.btn-check-ex1').forEach(btn => {
      btn.addEventListener('click', () => {
        const year = btn.getAttribute('data-year');
        const val = v[year];
        const dec = MathUtils.decompose(val);

        const inOrders = getInputValue(`input-base-orders-${year}`);
        const inValues = getInputValue(`input-base-values-${year}`);
        const inWords  = getInputValue(`input-base-words-${year}`);
        const fb = document.getElementById(`feedback-ex1-${year}`);

        // Verificaciones
        const okOrders = MathUtils.isAnswerCorrect(inOrders, [dec.orderText, dec.orderTextFull]);
        const okValues = MathUtils.isAnswerCorrect(inValues, [dec.valuesText, dec.valuesText.replace(/\./g, '')]);
        const okWords  = MathUtils.isAnswerCorrect(inWords, [dec.wordsText]);

        if (okOrders || okValues || okWords) {
          this.addStars(1);
          fb.innerHTML = `<span class="text-emerald-600">🎉 ¡Genial! Has acertado conceptos de ${year}.</span>`;
          if (window.sound) sound.playCorrect();
        } else {
          fb.innerHTML = `<span class="text-amber-700">💡 Revisa las respuestas. Puedes pulsar en "Ver chuleta / pistas" arriba.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    });

    // Ejercicio 2: Preguntas de comparación
    const correctCmp = {
      q1: (v[2021] > v[2020]) ? '2021' : '2020',
      q2: (v[2019] > v[2022]) ? '2019' : '2022'
    };

    document.querySelectorAll('.btn-choice-cmp').forEach(btn => {
      btn.addEventListener('click', () => {
        const grp = btn.getAttribute('data-group');
        const val = btn.getAttribute('data-val');
        const fb = document.getElementById(`feedback-cmp-${grp}`);

        if (val === correctCmp[grp]) {
          btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Correcto! Hubo más en ${val}.</span>`;
          this.addStars(1);
        } else {
          btn.classList.add('bg-rose-100', 'text-rose-800', 'border-rose-300');
          fb.innerHTML = `<span class="text-rose-600">✕ No fue en ${val}. Compara las cifras de millar.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    });

    // Ejercicio 2C: Ordenación de menor a mayor
    const orderedNumbers = [v[2019], v[2020], v[2021], v[2022]].sort((a, b) => a - b);
    const chipsContainer = document.getElementById('order-source-chips');
    const targetSlots = document.getElementById('order-target-slots');
    const placeholder = document.getElementById('order-placeholder');
    let currentSelection = [];

    if (chipsContainer) {
      chipsContainer.innerHTML = '';
      const shuffled = [v[2019], v[2020], v[2021], v[2022]].sort(() => 0.5 - Math.random());
      shuffled.forEach(num => {
        const chip = document.createElement('button');
        chip.className = "px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 rounded-xl font-mono font-bold text-xs shadow-xs transition";
        chip.textContent = MathUtils.formatNumber(num);
        chip.addEventListener('click', () => {
          if (currentSelection.includes(num)) return;
          currentSelection.push(num);
          chip.disabled = true;
          chip.classList.add('opacity-40');
          renderTargetSlots();
        });
        chipsContainer.appendChild(chip);
      });
    }

    const renderTargetSlots = () => {
      if (!targetSlots) return;
      if (currentSelection.length === 0) {
        targetSlots.innerHTML = '<span class="text-xs text-slate-400 font-bold" id="order-placeholder">Selecciona los números en orden...</span>';
        return;
      }
      targetSlots.innerHTML = currentSelection.map((num, i) => `
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-xl font-mono font-bold text-xs">
          ${MathUtils.formatNumber(num)}
        </span>
        ${i < currentSelection.length - 1 ? '<span class="font-black text-indigo-600">&lt;</span>' : ''}
      `).join('');
    };

    const btnResetOrder = document.getElementById('btn-reset-order');
    if (btnResetOrder) {
      btnResetOrder.addEventListener('click', () => {
        currentSelection = [];
        renderTargetSlots();
        chipsContainer.querySelectorAll('button').forEach(b => {
          b.disabled = false;
          b.classList.remove('opacity-40');
        });
        document.getElementById('feedback-order').textContent = '';
      });
    }

    const btnCheckOrder = document.getElementById('btn-check-order');
    if (btnCheckOrder) {
      btnCheckOrder.addEventListener('click', () => {
        const fb = document.getElementById('feedback-order');
        if (currentSelection.length < 4) {
          fb.innerHTML = '<span class="text-amber-700">⚠️ Debes colocar los 4 números para ordenar.</span>';
          return;
        }
        const isOk = currentSelection.every((val, idx) => val === orderedNumbers[idx]);
        if (isOk) {
          fb.innerHTML = `<span class="text-emerald-600">🎉 ¡PERFECTO! Orden correcto: ${orderedNumbers.map(n => MathUtils.formatNumber(n)).join(' < ')}</span>`;
          this.addStars(2);
          if (window.sound) sound.playSuperCorrect();
        } else {
          fb.innerHTML = '<span class="text-rose-600">✕ El orden no es correcto. Recuerda que primero van los de 3 cifras y luego de 5 cifras de menor a mayor.</span>';
          if (window.sound) sound.playWrong();
        }
      });
    }

    // Ejercicio 3: Comprobar Tabla de Redondeo
    const btnCheckRound = document.getElementById('btn-check-rounding-table');
    if (btnCheckRound) {
      btnCheckRound.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.input-round');
        let allOk = true;
        let countOk = 0;

        inputs.forEach(inp => {
          const year = inp.getAttribute('data-year');
          const order = inp.getAttribute('data-order');
          const val = v[year];
          const expected = MathUtils.roundNumber(val, order);
          const userVal = MathUtils.parseNumber(inp.value);

          if (userVal === expected) {
            inp.classList.remove('border-rose-400', 'bg-rose-50');
            inp.classList.add('border-emerald-400', 'bg-emerald-50');
            countOk++;
          } else {
            allOk = false;
            inp.classList.remove('border-emerald-400', 'bg-emerald-50');
            inp.classList.add('border-rose-400', 'bg-rose-50');
          }
        });

        const fb = document.getElementById('feedback-rounding-table');
        if (allOk) {
          fb.innerHTML = '<span class="text-emerald-600">🎉 ¡Sobresaliente! Has completado todas las aproximaciones a la perfección (+3 ⭐).</span>';
          this.addStars(3);
          if (window.sound) sound.playSuperCorrect();
        } else {
          fb.innerHTML = `<span class="text-amber-700">Llevas ${countOk} de 12 aciertos. Las casillas en rojo necesitan revisión.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }

    // Pregunta reflexiva de redondeo
    document.querySelectorAll('input[name="reflexive_round"]').forEach(rad => {
      rad.addEventListener('change', () => {
        const fb = document.getElementById('feedback-reflexive');
        if (rad.value === 'correct') {
          fb.innerHTML = '<span class="text-emerald-600">✓ ¡Exacto! Muy buen razonamiento matemático.</span>';
          this.addStars(1);
        } else {
          fb.innerHTML = '<span class="text-rose-600">✕ Piénsalo bien: redondear un número pequeño a millares le haría perder su precisión.</span>';
        }
      });
    });

    // Ejercicio 4: Comprobar Números Romanos Individuales
    document.querySelectorAll('.btn-check-roman-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const expected = parseInt(btn.getAttribute('data-expected'), 10);
        const card = btn.closest('div');
        const input = card.querySelector('.input-roman');
        const fb = card.querySelector('.feedback-roman-single');
        const userVal = MathUtils.parseNumber(input.value);

        if (userVal === expected) {
          input.classList.add('border-emerald-400', 'bg-emerald-50');
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Correcto! Año ${expected}.</span>`;
          this.addStars(1);
        } else {
          input.classList.add('border-rose-400', 'bg-rose-50');
          fb.innerHTML = `<span class="text-rose-600">✕ Inténtalo de nuevo.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    });

    // Ejercicio 5: Ordinales
    const btnAlba = document.getElementById('btn-check-ord-alba');
    if (btnAlba) {
      btnAlba.addEventListener('click', () => {
        const val = MathUtils.parseNumber(getInputValue('input-ord-alba'));
        const fb = document.getElementById('feedback-ord-alba');
        if (val === q.albaPos) {
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Correcto! ${q.albaPos}.º (${MathUtils.getOrdinal(q.albaPos).femWord}).</span>`;
          this.addStars(1);
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Recuerda sumar ${q.miguelPos} + ${q.albaOffset}.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }

    const btnFelix = document.getElementById('btn-check-ord-felix');
    if (btnFelix) {
      btnFelix.addEventListener('click', () => {
        const val = MathUtils.parseNumber(getInputValue('input-ord-felix'));
        const fb = document.getElementById('feedback-ord-felix');
        if (val === q.felixAheadOfAlba) {
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Correcto! ${q.felixAheadOfAlba} lugares por delante.</span>`;
          this.addStars(1);
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Resta: ${q.total} - ${q.albaPos}.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // PARTE 2: MISIÓN DETECTIVE (INSPIRADA EN MODELO A - PÁGINAS 8 Y 9)
  // ---------------------------------------------------------------------------
  renderDetectiveMission() {
    const container = document.getElementById('detective-mission-content');
    if (!container) return;

    const v = this.scenario.visitors;
    const m = this.scenario.monuments;
    const aq = this.scenario.advancedQueue;
    const approxVal = this.scenario.approx2023;

    const dec2019 = MathUtils.decompose(v[2019]);
    const dec2020 = MathUtils.decompose(v[2020]);
    const dec2021 = MathUtils.decompose(v[2021]);
    const dec2022 = MathUtils.decompose(v[2022]);

    let html = `
      <div class="bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span class="px-3 py-1 bg-purple-500/30 border border-purple-400/40 rounded-full text-purple-200 text-xs font-black uppercase tracking-wider">
            Prueba de Evaluación Avanzada · Modelo A (Páginas 8 y 9)
          </span>
          <button class="btn-voice-read px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition" data-speak="Misión Detective: En este reto resolverás deducciones inversas, rangos de estimación, cálculos con números romanos y problemas de colas dinámicas.">
            🔊 Escuchar instrucciones
          </button>
        </div>
        <h2 class="text-xl md:text-2xl font-black text-white mb-2">
          🔍 Misión Detective Matemático
        </h2>
        <p class="text-xs md:text-sm text-purple-200 max-w-2xl">
          Averigua los datos ocultos a partir de pistas, descomposiciones inversas y cálculos de tiempo histórico.
        </p>
      </div>

      <!-- EJERCICIO 1 (MODELO A - PÁG 8): DEDUCCIÓN INVERSA -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">1</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Averigua el año y completa cada descomposición</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              A partir de la pista dada, deduce el número en cifras, su lectura o el año al que corresponde.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 1: Averigua el año al que corresponde cada descomposición o lectura y completa.">
            🔊 Leer
          </button>
        </div>

        <div class="space-y-6">
          <!-- Tarjeta 1: Se da la descomposición en órdenes de 2021 -->
          <div class="p-5 rounded-2xl bg-purple-50/50 border border-purple-200">
            <span class="text-xs font-black text-purple-800 uppercase block mb-1">Pista 1: Por órdenes de unidades</span>
            <div class="p-3 bg-white rounded-xl font-mono font-bold text-sm text-purple-900 mb-3 border border-purple-200">
              ${dec2021.orderText} =
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm mb-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">En unidades:</label>
                <input type="text" id="det-val-2021" class="w-full px-3 py-2 border rounded-xl font-mono text-xs" placeholder="Ej: ${dec2021.valuesText}">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Número en cifras:</label>
                <input type="text" id="det-num-2021" class="w-full px-3 py-2 border rounded-xl font-mono text-xs" placeholder="Ej: ${MathUtils.formatNumber(v[2021])}">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">¿Qué año es?</label>
                <select id="det-year-2021" class="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white">
                  <option value="">Selecciona año...</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <button class="btn-check-det-card px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl" data-card="2021">
                ✓ Comprobar Pista 1
              </button>
              <span id="feedback-det-2021" class="text-xs font-bold"></span>
            </div>
          </div>

          <!-- Tarjeta 2: Se da la lectura de 2020 -->
          <div class="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <span class="text-xs font-black text-emerald-800 uppercase block mb-1">Pista 2: Por cómo se lee</span>
            <div class="p-3 bg-white rounded-xl font-bold text-sm text-emerald-900 mb-3 border border-emerald-200">
              «${dec2020.wordsText}»
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm mb-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Por órdenes:</label>
                <input type="text" id="det-ord-2020" class="w-full px-3 py-2 border rounded-xl font-mono text-xs" placeholder="Ej: ${dec2020.orderText}">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Número en cifras:</label>
                <input type="text" id="det-num-2020" class="w-full px-3 py-2 border rounded-xl font-mono text-xs" placeholder="Ej: ${v[2020]}">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">¿Qué año es?</label>
                <select id="det-year-2020" class="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white">
                  <option value="">Selecciona año...</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <button class="btn-check-det-card px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl" data-card="2020">
                ✓ Comprobar Pista 2
              </button>
              <span id="feedback-det-2020" class="text-xs font-bold"></span>
            </div>
          </div>

          <!-- Tarjeta 3: Se da la suma de valores de 2022 -->
          <div class="p-5 rounded-2xl bg-blue-50/50 border border-blue-200">
            <span class="text-xs font-black text-blue-800 uppercase block mb-1">Pista 3: En suma de valores</span>
            <div class="p-3 bg-white rounded-xl font-mono font-bold text-sm text-blue-900 mb-3 border border-blue-200">
              ${dec2022.valuesText} =
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm mb-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Por órdenes:</label>
                <input type="text" id="det-ord-2022" class="w-full px-3 py-2 border rounded-xl font-mono text-xs" placeholder="Ej: ${dec2022.orderText}">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Número en cifras:</label>
                <input type="text" id="det-num-2022" class="w-full px-3 py-2 border rounded-xl font-mono text-xs" placeholder="Ej: ${MathUtils.formatNumber(v[2022])}">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">¿Qué año es?</label>
                <select id="det-year-2022" class="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white">
                  <option value="">Selecciona año...</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <button class="btn-check-det-card px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl" data-card="2022">
                ✓ Comprobar Pista 3
              </button>
              <span id="feedback-det-2022" class="text-xs font-bold"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- EJERCICIO 2 (MODELO A - PÁG 8): RANGO Y ESTIMACIÓN INTERMEDIA -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">2</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Razonamiento y Rango de Visitantes</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Analiza las visitas extremas y calcula un valor posible intermedio.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 2: ¿Qué año fueron menos personas? ¿Y más? En mayo de 2018 visitaron menos personas que en 2019 pero más que en 2022. ¿Cuántas personas pudieron ser?">
            🔊 Leer
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label class="block font-bold text-xs md:text-sm text-slate-800 mb-2">¿Qué año fueron MENOS personas?</label>
            <select id="det-min-year" class="w-full p-2.5 border rounded-xl text-xs font-bold bg-white">
              <option value="">Selecciona...</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label class="block font-bold text-xs md:text-sm text-slate-800 mb-2">¿Qué año fueron MÁS personas?</label>
            <select id="det-max-year" class="w-full p-2.5 border rounded-xl text-xs font-bold bg-white">
              <option value="">Selecciona...</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        <!-- Problema de rango intermedio (Año 2018) -->
        <div class="p-5 rounded-2xl bg-amber-50 border border-amber-200 mb-4">
          <span class="font-black text-amber-950 text-sm block mb-1">
            🎯 El Enigma de mayo de 2018:
          </span>
          <p class="text-xs text-amber-900 mb-3">
            En mayo de 2018 visitaron la provincia <strong>menos personas que en 2019 (${MathUtils.formatNumber(v[2019])})</strong>, pero <strong>más que en 2022 (${MathUtils.formatNumber(v[2022])})</strong>. ¿Cuántas personas pudieron ser?
          </p>
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-xs text-slate-600 font-bold">Propón un número válido:</span>
            <input type="text" id="det-input-range-2018" class="px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: entre ${MathUtils.formatNumber(v[2022])} y ${MathUtils.formatNumber(v[2019])}">
            <button id="btn-check-range-2018" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl">
              ✓ Comprobar número
            </button>
            <span id="feedback-range-2018" class="text-xs font-bold"></span>
          </div>
        </div>
      </div>

      <!-- EJERCICIO 3 (MODELO A - PÁG 9): ESTIMACIÓN Y APROXIMACIONES ABIERTAS -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">3</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Estimación y Aproximación de 2023 (Página 9)</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              En el mes de mayo de 2023 se esperan aproximadamente <strong>${MathUtils.formatNumber(approxVal)} visitantes</strong>.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 3: En el mes de mayo de 2023 se esperan aproximadamente ${approxVal} visitantes. ¿Cuántas personas podrían ir? Escribe un número menor y otro mayor que la aproximación.">
            🔊 Leer
          </button>
        </div>

        <div class="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200">
          <p class="text-xs md:text-sm text-indigo-950 font-bold mb-3">
            Escribe un número <strong>MENOR</strong> y otro <strong>MAYOR</strong> que al redondear a las decenas de millar den exactamente <strong>${MathUtils.formatNumber(approxVal)}</strong>:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-white rounded-xl border border-indigo-200">
              <label class="block text-xs font-bold text-slate-700 mb-1">Número menor que ${MathUtils.formatNumber(approxVal)}:</label>
              <input type="text" id="det-approx-lower" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${MathUtils.formatNumber(approxVal - 1500)}">
              <span class="text-[10px] text-slate-400 block mt-1">Debe estar entre ${MathUtils.formatNumber(approxVal - 5000)} y ${MathUtils.formatNumber(approxVal - 1)}</span>
            </div>
            <div class="p-3 bg-white rounded-xl border border-indigo-200">
              <label class="block text-xs font-bold text-slate-700 mb-1">Número mayor que ${MathUtils.formatNumber(approxVal)}:</label>
              <input type="text" id="det-approx-higher" class="w-full px-3 py-2 border rounded-xl font-mono text-xs md:text-sm" placeholder="Ej: ${MathUtils.formatNumber(approxVal + 1500)}">
              <span class="text-[10px] text-slate-400 block mt-1">Debe estar entre ${MathUtils.formatNumber(approxVal + 1)} y ${MathUtils.formatNumber(approxVal + 4999)}</span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <button id="btn-check-approx-range" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs md:text-sm rounded-xl">
              ✓ Comprobar Números de Aproximación
            </button>
            <span id="feedback-approx-range" class="text-xs font-bold"></span>
          </div>
        </div>
      </div>

      <!-- EJERCICIO 4 (MODELO A - PÁG 9): DURACIÓN DE CONSTRUCCIÓN CON NÚMEROS ROMANOS -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">4</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Años que tardaron en construirse (Página 9)</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              Observa el año de inicio y finalización de cada edificio y averigua cuántos años tardaron en construir cada uno.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 4: Observa el año de inicio y finalización en números romanos de cada edificio y averigua cuántos años tardaron en construir cada uno.">
            🔊 Leer
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${[m[0], m[1] || m[0]].map((mon, idx) => `
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 class="font-black text-slate-900 text-sm mb-2">Edificio ${idx + 1}: ${mon.name}</h4>
              <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center mb-3">
                <span class="text-sm font-black font-mono text-amber-900">
                  ${mon.startRoman} (${mon.startYear}) a ${mon.endRoman} (${mon.endYear})
                </span>
              </div>
              <div class="space-y-2 text-xs md:text-sm">
                <label class="block font-bold text-slate-700">Resta (Año final - Año inicio):</label>
                <div class="flex items-center gap-2">
                  <input type="text" class="w-28 px-3 py-2 border rounded-xl font-mono text-xs input-duration" data-expected="${mon.duration}" placeholder="Ej: ${mon.duration}">
                  <span class="text-xs text-slate-600">años tardaron</span>
                  <button class="btn-check-duration px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl" data-expected="${mon.duration}">✓</button>
                </div>
                <div class="feedback-duration text-xs font-bold mt-1"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- EJERCICIO 5 (MODELO A - PÁG 9): RETOS AVANZADOS DE NÚMEROS ORDINALES -->
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">5</span>
              <h3 class="text-lg md:text-xl font-black text-slate-900">Retos con Números Ordinales (Página 9)</h3>
            </div>
            <p class="text-xs md:text-sm text-slate-600">
              En la cola para el museo A hay <strong>${aq.colaA} personas</strong>, y para el museo B hay <strong>${aq.colaB}</strong>.
            </p>
          </div>
          <button class="btn-voice-read px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold" data-speak="Ejercicio 5: Lee y contesta utilizando números ordinales. ¿Qué posición ocupa la persona que está en el último lugar en cada cola? Escríbelo con un ordinal y con letras.">
            🔊 Leer
          </button>
        </div>

        <div class="space-y-6">
          <!-- Pregunta A: Último lugar en cada cola -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="font-black text-slate-900 text-xs md:text-sm block mb-3">
              ¿Qué posición ocupa la persona que está en el <strong>ÚLTIMO LUGAR</strong> en cada cola? Escríbelo con ordinal (ej: 35.º) y con letras:
            </span>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div class="p-4 bg-white rounded-xl border border-slate-200">
                <span class="font-bold text-blue-700 block mb-2">${this.scenario.museumA} (${aq.colaA} personas):</span>
                <div class="space-y-2">
                  <input type="text" id="det-ord-num-a" class="w-full px-3 py-2 border rounded-xl text-xs" placeholder="Ordinal (ej: ${aq.colaA}.º)">
                  <input type="text" id="det-ord-txt-a" class="w-full px-3 py-2 border rounded-xl text-xs" placeholder="Con letras (ej: ${MathUtils.getOrdinal(aq.colaA).word})">
                </div>
              </div>
              <div class="p-4 bg-white rounded-xl border border-slate-200">
                <span class="font-bold text-purple-700 block mb-2">${this.scenario.museumB} (${aq.colaB} personas):</span>
                <div class="space-y-2">
                  <input type="text" id="det-ord-num-b" class="w-full px-3 py-2 border rounded-xl text-xs" placeholder="Ordinal (ej: ${aq.colaB}.º)">
                  <input type="text" id="det-ord-txt-b" class="w-full px-3 py-2 border rounded-xl text-xs" placeholder="Con letras (ej: ${MathUtils.getOrdinal(aq.colaB).word})">
                </div>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <button id="btn-check-last-places" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl">
                ✓ Comprobar Últimos Puestos
              </button>
              <span id="feedback-last-places" class="text-xs font-bold"></span>
            </div>
          </div>

          <!-- Pregunta B: Paola y Juan -->
          <div class="p-5 rounded-2xl bg-blue-50/50 border border-blue-200">
            <span class="font-black text-blue-950 text-xs md:text-sm block mb-2">
              👥 Paola está en el lugar <strong>${MathUtils.getOrdinal(aq.paolaPos).word} (${aq.paolaPos}.º)</strong> y Juan está <strong>${aq.juanOffset} lugares por detrás de ella</strong>. Si Juan es el último, ¿cuántas personas tiene la cola ahora?
            </span>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-xs text-slate-600">Operación: ${aq.paolaPos} + ${aq.juanOffset} =</span>
              <input type="text" id="det-input-juan-total" class="w-24 px-3 py-1.5 border rounded-xl font-bold text-xs" placeholder="Ej: ${aq.colaFinalGreco}">
              <span class="text-xs text-slate-600">personas en total</span>
              <button id="btn-check-juan-total" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl">✓ Comprobar</button>
              <span id="feedback-juan-total" class="text-xs font-bold"></span>
            </div>
          </div>

          <!-- Pregunta C: Iván y el avance de cola -->
          <div class="p-5 rounded-2xl bg-purple-50/50 border border-purple-200">
            <span class="font-black text-purple-950 text-xs md:text-sm block mb-2">
              🚪 Iván estaba en el lugar <strong>${MathUtils.getOrdinal(aq.ivanPos).word} (${aq.ivanPos}.º)</strong>. Si <strong>entraron ${aq.personasEntraron} personas</strong>, ¿en qué posición está ahora?
            </span>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-xs text-slate-600">Operación: ${aq.ivanPos} - ${aq.personasEntraron} =</span>
              <input type="text" id="det-input-ivan-pos" class="w-24 px-3 py-1.5 border rounded-xl font-bold text-xs" placeholder="Ej: ${aq.ivanNuevaPos}.º">
              <span class="text-xs text-slate-600">lugar (${MathUtils.getOrdinal(aq.ivanNuevaPos).word})</span>
              <button id="btn-check-ivan-pos" class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl">✓ Comprobar</button>
              <span id="feedback-ivan-pos" class="text-xs font-bold"></span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.bindDetectiveMissionEvents();
  }

  bindDetectiveMissionEvents() {
    const v = this.scenario.visitors;
    const aq = this.scenario.advancedQueue;
    const approxVal = this.scenario.approx2023;

    // Escuchar texto
    document.querySelectorAll('.btn-voice-read').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-speak');
        if (window.sound && text) sound.speakText(text, true);
      });
    });

    // Comprobar tarjetas de deducción (Ejercicio 1)
    document.querySelectorAll('.btn-check-det-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const cardYear = btn.getAttribute('data-card');
        const numVal = MathUtils.parseNumber(getInputValue(`det-num-${cardYear}`));
        const selectedYear = getInputValue(`det-year-${cardYear}`);
        const fb = document.getElementById(`feedback-det-${cardYear}`);

        const expectedNum = v[cardYear];
        if (numVal === expectedNum && selectedYear === cardYear) {
          fb.innerHTML = `<span class="text-emerald-600">🎉 ¡Correcto! Año ${cardYear} con ${MathUtils.formatNumber(expectedNum)} (+2 ⭐).</span>`;
          this.addStars(2);
          if (window.sound) sound.playCorrect();
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Revisa el número en cifras y el año correspondiente.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    });

    // Ejercicio 2: Menos y más personas
    const minYear = Object.keys(v).reduce((a, b) => v[a] < v[b] ? a : b);
    const maxYear = Object.keys(v).reduce((a, b) => v[a] > v[b] ? a : b);

    // Ejercicio 2: Rango de 2018
    const btnRange = document.getElementById('btn-check-range-2018');
    if (btnRange) {
      btnRange.addEventListener('click', () => {
        const userVal = MathUtils.parseNumber(getInputValue('det-input-range-2018'));
        const fb = document.getElementById('feedback-range-2018');
        const lower = v[2022];
        const upper = v[2019];

        if (userVal > lower && userVal < upper) {
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Perfecto! ${MathUtils.formatNumber(userVal)} está entre ${MathUtils.formatNumber(lower)} y ${MathUtils.formatNumber(upper)} (+2 ⭐).</span>`;
          this.addStars(2);
          if (window.sound) sound.playCorrect();
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Debe ser mayor que ${MathUtils.formatNumber(lower)} y menor que ${MathUtils.formatNumber(upper)}.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }

    // Ejercicio 3: Aproximación 2023
    const btnApprox = document.getElementById('btn-check-approx-range');
    if (btnApprox) {
      btnApprox.addEventListener('click', () => {
        const low = MathUtils.parseNumber(getInputValue('det-approx-lower'));
        const high = MathUtils.parseNumber(getInputValue('det-approx-higher'));
        const fb = document.getElementById('feedback-approx-range');

        const roundLow = MathUtils.roundNumber(low, 'DM');
        const roundHigh = MathUtils.roundNumber(high, 'DM');

        if (low < approxVal && high > approxVal && roundLow === approxVal && roundHigh === approxVal) {
          fb.innerHTML = `<span class="text-emerald-600">🎉 ¡Excelente! Ambos números redondean a ${MathUtils.formatNumber(approxVal)} (+2 ⭐).</span>`;
          this.addStars(2);
          if (window.sound) sound.playSuperCorrect();
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Uno de los números no redondea a ${MathUtils.formatNumber(approxVal)} a las decenas de millar.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }

    // Ejercicio 4: Duración de construcción
    document.querySelectorAll('.btn-check-duration').forEach(btn => {
      btn.addEventListener('click', () => {
        const expected = parseInt(btn.getAttribute('data-expected'), 10);
        const card = btn.closest('div');
        const input = card.querySelector('.input-duration');
        const fb = card.querySelector('.feedback-duration');
        const userVal = MathUtils.parseNumber(input.value);

        if (userVal === expected) {
          input.classList.add('border-emerald-400', 'bg-emerald-50');
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Exacto! Tardaron ${expected} años.</span>`;
          this.addStars(1);
        } else {
          input.classList.add('border-rose-400', 'bg-rose-50');
          fb.innerHTML = `<span class="text-rose-600">✕ Revisa la resta entre los años.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    });

    // Ejercicio 5: Últimos lugares
    const btnLast = document.getElementById('btn-check-last-places');
    if (btnLast) {
      btnLast.addEventListener('click', () => {
        const numA = MathUtils.parseNumber(getInputValue('det-ord-num-a'));
        const numB = MathUtils.parseNumber(getInputValue('det-ord-num-b'));
        const fb = document.getElementById('feedback-last-places');

        if (numA === aq.colaA && numB === aq.colaB) {
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Correcto! ${aq.colaA}.º y ${aq.colaB}.º (+2 ⭐).</span>`;
          this.addStars(2);
          if (window.sound) sound.playCorrect();
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Revisa los puestos finales de cada fila.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }

    // Ejercicio 5B: Juan total
    const btnJuan = document.getElementById('btn-check-juan-total');
    if (btnJuan) {
      btnJuan.addEventListener('click', () => {
        const val = MathUtils.parseNumber(getInputValue('det-input-juan-total'));
        const fb = document.getElementById('feedback-juan-total');
        if (val === aq.colaFinalGreco) {
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Exacto! ${aq.colaFinalGreco} personas (+1 ⭐).</span>`;
          this.addStars(1);
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Suma ${aq.paolaPos} + ${aq.juanOffset}.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }

    // Ejercicio 5C: Iván nueva posición
    const btnIvan = document.getElementById('btn-check-ivan-pos');
    if (btnIvan) {
      btnIvan.addEventListener('click', () => {
        const val = MathUtils.parseNumber(getInputValue('det-input-ivan-pos'));
        const fb = document.getElementById('feedback-ivan-pos');
        if (val === aq.ivanNuevaPos) {
          fb.innerHTML = `<span class="text-emerald-600">✓ ¡Correcto! Ahora está en el ${aq.ivanNuevaPos}.º lugar (+1 ⭐).</span>`;
          this.addStars(1);
        } else {
          fb.innerHTML = `<span class="text-rose-600">✕ Resta ${aq.ivanPos} - ${aq.personasEntraron}.</span>`;
          if (window.sound) sound.playWrong();
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // PARTE 3: DESAFÍO EXPRESS (TEST INFINITO RÁPIDO)
  // ---------------------------------------------------------------------------
  startExpressChallenge() {
    this.expressScore = 0;
    this.expressCurrent = 0;
    // Seleccionar 10 preguntas aleatorias del banco ampliado
    const pool = [...MathData.expressQuestionsPool];
    this.expressQuestions = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
    this.renderExpressQuestion();
  }

  renderExpressQuestion() {
    const container = document.getElementById('express-content');
    if (!container) return;

    if (this.expressCurrent >= this.expressQuestions.length) {
      this.renderExpressResults();
      return;
    }

    const q = this.expressQuestions[this.expressCurrent];
    const total = this.expressQuestions.length;
    const progress = ((this.expressCurrent + 1) / total) * 100;

    let html = `
      <div class="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <!-- Progreso -->
        <div class="flex items-center justify-between text-xs font-black text-slate-500 mb-2">
          <span>Pregunta ${this.expressCurrent + 1} de ${total}</span>
          <span>Aciertos: ${this.expressScore} ⭐</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
          <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
        </div>

        <!-- Enunciado -->
        <div class="flex items-start justify-between gap-4 mb-6">
          <h3 class="text-base md:text-lg font-black text-slate-900 leading-snug">
            ${q.question}
          </h3>
          <button class="btn-voice-read px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shrink-0" data-speak="${q.question}">
            🔊
          </button>
        </div>

        <!-- Opciones -->
        <div class="space-y-3 mb-6" id="express-options-container">
          ${q.options.map((opt, idx) => `
            <button class="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 font-bold text-xs md:text-sm text-slate-800 transition transform active:scale-98 flex items-center justify-between btn-express-option" data-index="${idx}">
              <span>${opt}</span>
              <span class="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-400 option-badge">
                ${['A', 'B', 'C', 'D'][idx]}
              </span>
            </button>
          `).join('')}
        </div>

        <div id="express-feedback" class="hidden p-4 rounded-2xl mb-4 text-xs font-bold"></div>

        <div class="flex items-center justify-end">
          <button id="btn-next-express" class="hidden px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm rounded-xl shadow-xs">
            Siguiente Pregunta ➡️
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Eventos
    container.querySelectorAll('.btn-express-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.getAttribute('data-index'), 10);
        this.checkExpressAnswer(chosen);
      });
    });

    const btnNext = container.querySelector('#btn-next-express');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.expressCurrent++;
        this.renderExpressQuestion();
      });
    }

    const btnSpeak = container.querySelector('.btn-voice-read');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        if (window.sound) sound.speakText(q.question, true);
      });
    }
  }

  checkExpressAnswer(chosenIdx) {
    const q = this.expressQuestions[this.expressCurrent];
    const isCorrect = (chosenIdx === q.correct);
    const optionsContainer = document.getElementById('express-options-container');
    const fb = document.getElementById('express-feedback');
    const btnNext = document.getElementById('btn-next-express');

    // Deshabilitar todos los botones
    optionsContainer.querySelectorAll('.btn-express-option').forEach((b, idx) => {
      b.disabled = true;
      if (idx === q.correct) {
        b.classList.remove('border-slate-200', 'hover:bg-blue-50/50');
        b.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-900');
        b.querySelector('.option-badge').textContent = '✓';
        b.querySelector('.option-badge').classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
      } else if (idx === chosenIdx) {
        b.classList.remove('border-slate-200');
        b.classList.add('bg-rose-100', 'border-rose-400', 'text-rose-900');
        b.querySelector('.option-badge').textContent = '✕';
        b.querySelector('.option-badge').classList.add('bg-rose-500', 'text-white', 'border-rose-500');
      }
    });

    if (isCorrect) {
      this.expressScore++;
      this.addStars(1);
      fb.className = "p-4 rounded-2xl mb-4 text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 block";
      fb.innerHTML = `🎉 <strong>¡Correcto!</strong> ${q.explanation}`;
      if (window.sound) sound.playCorrect();
    } else {
      fb.className = "p-4 rounded-2xl mb-4 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 block";
      fb.innerHTML = `💡 <strong>Explicación:</strong> ${q.explanation}`;
      if (window.sound) sound.playWrong();
    }

    if (btnNext) btnNext.classList.remove('hidden');
  }

  renderExpressResults() {
    const container = document.getElementById('express-content');
    if (!container) return;

    const total = this.expressQuestions.length;
    const pct = Math.round((this.expressScore / total) * 10);

    if (pct >= 8 && typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      if (window.sound) sound.playFanfare();
    }

    let html = `
      <div class="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center text-4xl mb-4 shadow-xs">
          ${pct >= 9 ? '🏆' : pct >= 7 ? '⭐' : '💪'}
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-1">¡Desafío Completado!</h3>
        <p class="text-xs text-slate-500 mb-6">Resultado oficial de ${this.studentName}</p>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
          <div class="text-4xl font-black text-blue-600 font-display">${this.expressScore} / ${total}</div>
          <span class="text-xs text-slate-600 font-bold block mt-1">Nota equivalente: ${pct} sobre 10</span>
        </div>

        <div class="flex flex-col gap-2">
          <button class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm rounded-xl shadow-xs transition" onclick="app.startExpressChallenge()">
            🔄 Jugar Otro Desafío (Preguntas Nuevas)
          </button>
          <button class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs md:text-sm rounded-xl transition" onclick="app.navigate('diploma')">
            🎓 Ver mi Diploma Oficial
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // PARTE 4: EL SIMULADOR DE LA FILA (LABORATORIO VISUAL DE ORDINALES)
  // ---------------------------------------------------------------------------
  renderQueueSimulator() {
    const container = document.getElementById('queue-sim-content');
    if (!container) return;

    let html = `
      <div class="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 class="text-xl font-black text-slate-900">🚶‍♀️ Simulador Interactivo de Colas y Ordinales</h3>
            <p class="text-xs md:text-sm text-slate-600">
              Haz clic en cualquier persona para ver su número ordinal en cifras y en letras.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-sim-advance" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition">
              ⏩ Entran 5 personas
            </button>
            <button id="btn-sim-reset" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
              ↺ Reiniciar
            </button>
          </div>
        </div>

        <!-- Visor de la persona seleccionada -->
        <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="sim-selected-card">
          <div>
            <span class="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-900">Persona Seleccionada</span>
            <div class="text-lg font-black text-indigo-950 mt-1" id="sim-info-title">Puesto 14.º</div>
            <div class="text-xs text-indigo-700 font-bold" id="sim-info-desc">Decimocuarto lugar (14.º) · Faltan 16 personas para el final</div>
          </div>
          <button id="sim-btn-speak" class="px-3 py-2 bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold shrink-0">
            🔊 Escuchar lectura
          </button>
        </div>

        <!-- Cuadrícula de avatares en fila -->
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div class="flex items-center justify-between text-xs font-black text-slate-500 mb-3">
            <span>🚪 TAQUILLA DEL MUSEO (Comienzo)</span>
            <span>FINAL DE LA COLA (${this.simTotalKids}.º) 🚶</span>
          </div>

          <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2" id="sim-grid-kids">
            <!-- Renderizado dinámico -->
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderQueueGrid();

    const btnAdv = container.querySelector('#btn-sim-advance');
    if (btnAdv) {
      btnAdv.addEventListener('click', () => {
        if (this.simTotalKids > 10) {
          this.simTotalKids -= 5;
          this.renderQueueGrid();
          if (window.sound) sound.playClick();
        }
      });
    }

    const btnRes = container.querySelector('#btn-sim-reset');
    if (btnRes) {
      btnRes.addEventListener('click', () => {
        this.simTotalKids = 30;
        this.simSelectedA = 14;
        this.renderQueueGrid();
        if (window.sound) sound.playClick();
      });
    }

    const btnSpeak = container.querySelector('#sim-btn-speak');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        const ord = MathUtils.getOrdinal(this.simSelectedA);
        if (window.sound) sound.speakText(`Puesto número ${ord.num}, se lee ${ord.word}.`, true);
      });
    }
  }

  renderQueueGrid() {
    const grid = document.getElementById('sim-grid-kids');
    if (!grid) return;

    grid.innerHTML = '';
    const avatars = ['👧', '👦', '🧒', '👧🏻', '👦🏽', '👧🏼', '👦🏾'];

    for (let i = 1; i <= this.simTotalKids; i++) {
      const isSelected = (i === this.simSelectedA);
      const isLast = (i === this.simTotalKids);
      const ord = MathUtils.getOrdinal(i);

      const cell = document.createElement('button');
      cell.className = `p-2 rounded-xl border flex flex-col items-center justify-center transition transform active:scale-90 ${
        isSelected
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
          : isLast
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
      }`;

      cell.innerHTML = `
        <span class="text-xl mb-0.5">${avatars[(i - 1) % avatars.length]}</span>
        <span class="text-[11px] font-black font-mono leading-none">${i}.º</span>
        <span class="text-[9px] font-bold opacity-80 truncate max-w-[48px]">${ord.word}</span>
      `;

      cell.addEventListener('click', () => {
        this.simSelectedA = i;
        this.updateSimulatorInfo();
        this.renderQueueGrid();
        if (window.sound) sound.playClick();
      });

      grid.appendChild(cell);
    }

    this.updateSimulatorInfo();
  }

  updateSimulatorInfo() {
    const titleEl = document.getElementById('sim-info-title');
    const descEl = document.getElementById('sim-info-desc');
    if (!titleEl || !descEl) return;

    const pos = this.simSelectedA;
    const ord = MathUtils.getOrdinal(pos);
    const ahead = pos - 1;
    const behind = this.simTotalKids - pos;

    titleEl.textContent = `Puesto ${ord.num} · ${ord.word.toUpperCase()}`;
    descEl.textContent = `Tiene a ${ahead} personas por delante hacia la taquilla y a ${behind} personas por detrás hasta el final.`;
  }

  // ---------------------------------------------------------------------------
  // PARTE 5: EL TEMPLO ROMANO (MINI-JUEGO ARCADE)
  // ---------------------------------------------------------------------------
  startArcadeGame() {
    this.arcadeScore = 0;
    this.arcadeStreak = 0;
    this.nextArcadeQuestion();
  }

  nextArcadeQuestion() {
    const container = document.getElementById('arcade-content');
    if (!container) return;

    // Generar número interesante (siglos históricos, años o números clave)
    const testNums = [999, 1000, 1226, 1355, 1493, 1220, 1238, 1588, 1808, 1969, 1999, 2024, 754, 48, 89];
    const target = testNums[Math.floor(Math.random() * testNums.length)];
    const roman = MathUtils.intToRoman(target);

    // Modo 1: Arábigo a Romano, Modo 2: Romano a Arábigo
    const isToRoman = Math.random() > 0.5;

    // Generar opciones falsas
    const wrongOptions = new Set();
    while (wrongOptions.size < 3) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 10 : -10);
      const fake = target + delta;
      if (fake > 0 && fake !== target) {
        wrongOptions.add(isToRoman ? MathUtils.intToRoman(fake) : fake);
      }
    }

    const options = [isToRoman ? roman : target, ...Array.from(wrongOptions)].sort(() => 0.5 - Math.random());
    const correctIdx = options.indexOf(isToRoman ? roman : target);

    let html = `
      <div class="max-w-md mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md text-center">
        <!-- Marcador Arcade -->
        <div class="flex items-center justify-between text-xs font-black text-slate-500 mb-6">
          <div class="flex items-center gap-1">
            <span>🔥 Racha:</span>
            <span class="text-amber-600 font-display text-sm">${this.arcadeStreak}</span>
          </div>
          <div class="flex items-center gap-1">
            <span>Puntos:</span>
            <span class="text-blue-600 font-display text-sm">${this.arcadeScore}</span>
          </div>
        </div>

        <span class="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 tracking-wider">
          🏛️ Templo Romano Express
        </span>

        <h3 class="text-xs font-bold text-slate-500 mt-3 mb-1">
          ${isToRoman ? '¿Cómo se escribe en números romanos?' : '¿Qué número arábigo representa este número romano?'}
        </h3>

        <!-- Tarjeta del número objetivo -->
        <div class="my-6 p-6 bg-gradient-to-tr from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl shadow-xs">
          <span class="text-3xl md:text-4xl font-black font-mono tracking-widest text-amber-950">
            ${isToRoman ? MathUtils.formatNumber(target) : roman}
          </span>
        </div>

        <!-- Opciones -->
        <div class="grid grid-cols-2 gap-3 mb-6" id="arcade-options">
          ${options.map((opt, idx) => `
            <button class="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 font-mono font-black text-xs md:text-sm text-slate-800 transition transform active:scale-95 btn-arcade-opt" data-index="${idx}">
              ${typeof opt === 'number' ? MathUtils.formatNumber(opt) : opt}
            </button>
          `).join('')}
        </div>

        <div id="arcade-feedback" class="text-xs font-bold min-h-[20px]"></div>
      </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.btn-arcade-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.getAttribute('data-index'), 10);
        this.checkArcadeAnswer(chosen === correctIdx, btn);
      });
    });
  }

  checkArcadeAnswer(isCorrect, btn) {
    const fb = document.getElementById('arcade-feedback');
    if (isCorrect) {
      this.arcadeScore += 10 + (this.arcadeStreak * 2);
      this.arcadeStreak++;
      this.addStars(1);
      btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
      fb.innerHTML = '<span class="text-emerald-600">✓ ¡CORRECTO! +1 ⭐</span>';
      if (window.sound) sound.playCorrect();
      setTimeout(() => this.nextArcadeQuestion(), 900);
    } else {
      this.arcadeStreak = 0;
      btn.classList.add('bg-rose-500', 'text-white', 'border-rose-500');
      fb.innerHTML = '<span class="text-rose-600">✕ ¡Oh no! Racha reiniciada.</span>';
      if (window.sound) sound.playWrong();
      setTimeout(() => this.nextArcadeQuestion(), 1400);
    }
  }

  // ---------------------------------------------------------------------------
  // PARTE 6: GUÍA RESUMEN DE ESTUDIO (CHULETA IMPRIMIBLE)
  // ---------------------------------------------------------------------------
  renderStudyGuide() {
    const container = document.getElementById('study-guide-content');
    if (!container) return;

    const sg = MathData.studyGuide;

    let html = `
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Barra de impresión -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 class="font-black text-slate-900 text-base">📚 Chuleta Oficial de Matemáticas · Tema 1</h3>
            <p class="text-xs text-slate-500">Diseñada para repasar los 4 conceptos clave antes del control escolar.</p>
          </div>
          <button class="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5" onclick="window.print()">
            <span>🖨️ Imprimir / Guardar en PDF</span>
          </button>
        </div>

        <!-- Bloque 1: Valor Posicional -->
        <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">${sg.blocks[0].icon}</span>
            <h4 class="text-lg font-black text-slate-900">${sg.blocks[0].title}</h4>
          </div>
          <p class="text-xs md:text-sm text-slate-600 mb-4">${sg.blocks[0].summary}</p>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
            ${sg.blocks[0].table.map(item => `
              <div class="p-3 rounded-2xl border ${item.color} text-center">
                <span class="text-lg font-black font-mono block">${item.order}</span>
                <span class="text-xs font-bold block">${item.name}</span>
                <span class="text-[10px] opacity-80 block mt-1">${item.value}</span>
              </div>
            `).join('')}
          </div>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span class="font-bold text-slate-700 block mb-1">Ejemplo de desglose de <strong>${sg.blocks[0].example.num}</strong>:</span>
            <ul class="space-y-1 text-slate-600">
              <li>• <strong>Por órdenes:</strong> ${sg.blocks[0].example.byOrder}</li>
              <li>• <strong>En suma de unidades:</strong> ${sg.blocks[0].example.byValues}</li>
              <li>• <strong>Se lee:</strong> «${sg.blocks[0].example.reading}»</li>
            </ul>
          </div>
        </div>

        <!-- Bloque 2: Redondeo -->
        <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">${sg.blocks[1].icon}</span>
            <h4 class="text-lg font-black text-slate-900">${sg.blocks[1].title}</h4>
          </div>
          <p class="text-xs md:text-sm text-slate-600 mb-4">${sg.blocks[1].summary}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-bold">
              ${sg.blocks[1].rules[0]}
            </div>
            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold">
              ${sg.blocks[1].rules[1]}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            ${sg.blocks[1].examples.map(ex => `
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span class="font-black text-slate-900">${ex.num}:</span>
                <span class="text-slate-500 block text-[11px]">${ex.target}</span>
                <span class="font-bold text-blue-600 mt-1 block">Resultado: ${ex.res}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Bloque 3: Romanos -->
        <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">${sg.blocks[2].icon}</span>
            <h4 class="text-lg font-black text-slate-900">${sg.blocks[2].title}</h4>
          </div>
          <p class="text-xs md:text-sm text-slate-600 mb-4">${sg.blocks[2].summary}</p>

          <div class="grid grid-cols-7 gap-2 mb-6">
            ${sg.blocks[2].letters.map(l => `
              <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span class="text-lg font-black font-mono text-amber-900 block">${l.letter}</span>
                <span class="text-xs font-bold text-amber-700 block">${l.val}</span>
              </div>
            `).join('')}
          </div>

          <div class="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            ${sg.blocks[2].keyRules.map(r => `<div class="font-medium">${r}</div>`).join('')}
          </div>
        </div>

        <!-- Bloque 4: Ordinales -->
        <div class="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">${sg.blocks[3].icon}</span>
            <h4 class="text-lg font-black text-slate-900">${sg.blocks[3].title}</h4>
          </div>
          <p class="text-xs md:text-sm text-slate-600 mb-4">${sg.blocks[3].summary}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
            ${sg.blocks[3].queueRules.map(qr => `
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                ${qr}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // PARTE 7: DIPLOMA OFICIAL IMPRIMIBLE PARA OLIVIA
  // ---------------------------------------------------------------------------
  renderDiploma() {
    const container = document.getElementById('diploma-content');
    if (!container) return;

    const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    let html = `
      <div class="max-w-3xl mx-auto">
        <!-- Barra de impresión -->
        <div class="no-print flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-600">Nombre del alumno/a:</span>
            <input type="text" id="diploma-input-name" class="px-3 py-1.5 border rounded-xl text-xs font-black text-slate-800" value="${this.studentName}">
            <button id="btn-save-diploma-name" class="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold">Guardar</button>
          </div>
          <button class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs md:text-sm rounded-xl shadow-md transition flex items-center gap-1.5" onclick="window.print()">
            <span>🖨️ Imprimir Diploma</span>
          </button>
        </div>

        <!-- Certificado oficial imprimible -->
        <div class="bg-amber-50/60 p-8 md:p-12 rounded-3xl border-8 border-double border-amber-300 shadow-2xl relative text-center print:border-4 print:p-6 print:shadow-none bg-[radial-gradient(#fef3c7_1px,transparent_1px)] [background-size:16px_16px]">
          <!-- Sello y emblema -->
          <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white flex items-center justify-center text-4xl shadow-md mb-4">
            📐
          </div>

          <span class="text-xs font-black uppercase tracking-widest text-amber-800 block mb-1">
            DIPLOMA DE HONOR Y EXCELENCIA MATEMÁTICA
          </span>
          <h2 class="text-2xl md:text-3xl font-black font-display text-slate-900 tracking-tight mb-2">
            Especialista en Numeración y Cálculo
          </h2>
          <p class="text-xs text-slate-500 font-bold mb-6">
            4.º de Educación Primaria · Tema 1: Números de 5 cifras, Aproximación, Romanos y Ordinales
          </p>

          <span class="text-xs text-slate-600 block mb-1">Se otorga con orgullo y felicitación a:</span>
          <div class="text-3xl md:text-4xl font-black font-display text-blue-700 underline decoration-amber-400 decoration-wavy decoration-2 underline-offset-8 mb-6" id="diploma-display-name">
            ${this.studentName}
          </div>

          <p class="text-xs md:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed mb-8">
            Por haber demostrado un dominio sobresaliente descomponiendo números de hasta cinco cifras, aproximando a los millares, centenas y decenas, traduciendo fechas en números romanos y resolviendo con brillantez los problemas de números ordinales.
          </p>

          <!-- Estrellas y Fecha -->
          <div class="flex items-center justify-around border-t-2 border-b-2 border-amber-200/80 py-4 mb-8">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-black block">Estrellas Ganadas</span>
              <span class="text-xl font-black text-amber-600 font-display">⭐ ${this.stars}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-black block">Calificación</span>
              <span class="text-xl font-black text-emerald-600 font-display">Sobresaliente (10)</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-black block">Fecha Oficial</span>
              <span class="text-xs font-black text-slate-700">${today}</span>
            </div>
          </div>

          <!-- Firmas -->
          <div class="flex items-center justify-between px-6 pt-4 text-center">
            <div>
              <div class="font-serif italic text-base text-slate-800 border-b border-slate-300 pb-1 mb-1">Equipo Pedagógico</div>
              <span class="text-[9px] text-slate-400 uppercase font-bold">Profesor/a de Matemáticas</span>
            </div>
            <div class="w-16 h-16 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center text-[9px] font-black text-amber-800 rotate-12">
              SELLO<br>OFICIAL
            </div>
            <div>
              <div class="font-serif italic text-base text-blue-800 border-b border-slate-300 pb-1 mb-1">${this.studentName}</div>
              <span class="text-[9px] text-slate-400 uppercase font-bold">Matemática Oficial</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const btnSave = container.querySelector('#btn-save-diploma-name');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const inputName = getInputValue('#diploma-input-name', container);
        this.setStudentName(inputName);
        const displayName = container.querySelector('#diploma-display-name');
        if (displayName) displayName.textContent = this.studentName;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // EVENTOS GLOBALES
  // ---------------------------------------------------------------------------
  bindGlobalEvents() {
    // Botón de sonido
    const btnSound = document.getElementById('toggle-sound-btn');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        if (window.sound) {
          const enabled = sound.toggleSound();
          btnSound.textContent = enabled ? '🔊' : '🔇';
        }
      });
    }

    // Botones de navegación de pestañas
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target) this.navigate(target);
      });
    });
  }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MathApp();
});
