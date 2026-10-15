// =============================================================================
// UTILIDADES MATEMÁTICAS Y LINGÜÍSTICAS · MATEMÁTICAS 4.º PRIMARIA
// Algoritmos de numeración posicional, números romanos, redondeo y ordinales
// =============================================================================

const MathUtils = {
  // Formatea un número con puntos de miles para España (ej. 75787 -> 75.787)
  formatNumber(n) {
    if (n === null || n === undefined || isNaN(n)) return '';
    return Number(n).toLocaleString('es-ES');
  },

  // Parsea un string con puntos a número entero (tolerante a palabras adicionales como 'años')
  parseNumber(str) {
    if (typeof str === 'number') return str;
    if (!str) return NaN;
    const clean = String(str).replace(/\./g, '').trim();
    const match = clean.match(/-?\d+/);
    return match ? parseInt(match[0], 10) : NaN;
  },

  // ---------------------------------------------------------------------------
  // 1. CONVERTIDOR DE NÚMEROS A PALABRAS (ESPAÑOL HASTA 999.999)
  // Reglas RAE completas para 4.º de Primaria
  // ---------------------------------------------------------------------------
  numberToWordsSpanish(n) {
    n = Math.floor(Math.abs(n));
    if (n === 0) return 'cero';

    const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const ESPECIALES_10 = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const VEINTES = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
    const DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    function menor1000(num, esMiles = false) {
      if (num === 100) return 'cien';
      const partes = [];
      const c = Math.floor(num / 100);
      const d = Math.floor((num % 100) / 10);
      const u = num % 10;
      const du = num % 100;

      if (c > 0) {
        partes.push(CENTENAS[c]);
      }

      if (du >= 10 && du <= 19) {
        partes.push(ESPECIALES_10[du - 10]);
      } else if (du >= 20 && du <= 29) {
        if (esMiles && du === 21) {
          partes.push('veintiún');
        } else {
          partes.push(VEINTES[du - 20]);
        }
      } else {
        if (d > 0) {
          if (u > 0) {
            const uStr = (esMiles && u === 1) ? 'un' : UNIDADES[u];
            partes.push(`${DECENAS[d]} y ${uStr}`);
          } else {
            partes.push(DECENAS[d]);
          }
        } else if (u > 0) {
          if (esMiles && u === 1) {
            partes.push('un');
          } else {
            partes.push(u === 1 ? 'uno' : UNIDADES[u]);
          }
        }
      }
      return partes.join(' ');
    }

    if (n < 1000) {
      return menor1000(n, false);
    }

    const miles = Math.floor(n / 1000);
    const resto = n % 1000;

    let strMiles = '';
    if (miles === 1) {
      strMiles = 'mil';
    } else {
      strMiles = menor1000(miles, true) + ' mil';
    }

    if (resto === 0) {
      return strMiles;
    }
    return strMiles + ' ' + menor1000(resto, false);
  },

  // ---------------------------------------------------------------------------
  // 2. NÚMEROS ROMANOS (1 a 3999)
  // ---------------------------------------------------------------------------
  intToRoman(num) {
    if (!num || num < 1 || num > 3999) return '';
    const map = [
      { v: 1000, s: 'M' },
      { v: 900,  s: 'CM' },
      { v: 500,  s: 'D' },
      { v: 400,  s: 'CD' },
      { v: 100,  s: 'C' },
      { v: 90,   s: 'XC' },
      { v: 50,   s: 'L' },
      { v: 40,   s: 'XL' },
      { v: 10,   s: 'X' },
      { v: 9,    s: 'IX' },
      { v: 5,    s: 'V' },
      { v: 4,    s: 'IV' },
      { v: 1,    s: 'I' }
    ];
    let res = '';
    let n = num;
    for (let i = 0; i < map.length; i++) {
      while (n >= map[i].v) {
        res += map[i].s;
        n -= map[i].v;
      }
    }
    return res;
  },

  romanToInt(str) {
    if (!str) return 0;
    const clean = String(str).toUpperCase().replace(/[^IVXLCDM]/g, '');
    const map = { 'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000 };
    let total = 0;
    let prev = 0;
    for (let i = clean.length - 1; i >= 0; i--) {
      const val = map[clean[i]] || 0;
      if (val < prev) {
        total -= val;
      } else {
        total += val;
        prev = val;
      }
    }
    return total;
  },

  // ---------------------------------------------------------------------------
  // 3. DESCOMPOSICIÓN POSICIONAL Y ADITIVA
  // ---------------------------------------------------------------------------
  decompose(num) {
    const n = Math.floor(Math.abs(num));
    const dm = Math.floor(n / 10000);
    const um = Math.floor((n % 10000) / 1000);
    const c  = Math.floor((n % 1000) / 100);
    const d  = Math.floor((n % 100) / 10);
    const u  = n % 10;

    // Descomposición por órdenes omitiendo ceros (ej. 3 DM + 4 UM + 1 D + 6 U)
    const orderPartsNonZero = [];
    if (dm > 0) orderPartsNonZero.push(`${dm} DM`);
    if (um > 0) orderPartsNonZero.push(`${um} UM`);
    if (c > 0)  orderPartsNonZero.push(`${c} C`);
    if (d > 0)  orderPartsNonZero.push(`${d} D`);
    if (u > 0)  orderPartsNonZero.push(`${u} U`);

    // Descomposición por órdenes completa incluyendo ceros (ej. 3 DM + 4 UM + 0 C + 1 D + 6 U)
    const orderPartsFull = [];
    if (dm > 0) orderPartsFull.push(`${dm} DM`);
    if (dm > 0 || um > 0) orderPartsFull.push(`${um} UM`);
    if (dm > 0 || um > 0 || c > 0) orderPartsFull.push(`${c} C`);
    if (dm > 0 || um > 0 || c > 0 || d > 0) orderPartsFull.push(`${d} D`);
    orderPartsFull.push(`${u} U`);

    // Descomposición en unidades aditivas (ej. 30.000 + 4.000 + 10 + 6)
    const valueParts = [];
    if (dm > 0) valueParts.push(this.formatNumber(dm * 10000));
    if (um > 0) valueParts.push(this.formatNumber(um * 1000));
    if (c > 0)  valueParts.push(this.formatNumber(c * 100));
    if (d > 0)  valueParts.push(this.formatNumber(d * 10));
    if (u > 0)  valueParts.push(String(u));

    return {
      num: n,
      dm, um, c, d, u,
      orderText: orderPartsNonZero.join(' + '),
      orderTextFull: orderPartsFull.join(' + '),
      valuesText: valueParts.join(' + '),
      wordsText: this.numberToWordsSpanish(n)
    };
  },

  // ---------------------------------------------------------------------------
  // 4. APROXIMACIÓN Y REDONDEO
  // ---------------------------------------------------------------------------
  roundNumber(n, order) {
    const bases = { 'D': 10, 'C': 100, 'UM': 1000, 'DM': 10000 };
    const base = bases[order] || 10;
    const rem = n % base;
    const half = base / 2;
    if (rem >= half) {
      return n + (base - rem);
    } else {
      return n - rem;
    }
  },

  // ---------------------------------------------------------------------------
  // 5. NÚMEROS ORDINALES (1.º al 40.º)
  // ---------------------------------------------------------------------------
  ORDINAL_MAP: {
    1:  { num: "1.º", fem: "1.ª", word: "primero", femWord: "primera" },
    2:  { num: "2.º", fem: "2.ª", word: "segundo", femWord: "segunda" },
    3:  { num: "3.º", fem: "3.ª", word: "tercero", femWord: "tercera" },
    4:  { num: "4.º", fem: "4.ª", word: "cuarto", femWord: "cuarta" },
    5:  { num: "5.º", fem: "5.ª", word: "quinto", femWord: "quinta" },
    6:  { num: "6.º", fem: "6.ª", word: "sexto", femWord: "sexta" },
    7:  { num: "7.º", fem: "7.ª", word: "séptimo", femWord: "séptima" },
    8:  { num: "8.º", fem: "8.ª", word: "octavo", femWord: "octava" },
    9:  { num: "9.º", fem: "9.ª", word: "noveno", femWord: "novena" },
    10: { num: "10.º", fem: "10.ª", word: "décimo", femWord: "décima" },
    11: { num: "11.º", fem: "11.ª", word: "undécimo", femWord: "undécima", alt: "decimoprimero", altFem: "decimoprimera" },
    12: { num: "12.º", fem: "12.ª", word: "duodécimo", femWord: "duodécima", alt: "decimosegundo", altFem: "decimosegunda" },
    13: { num: "13.º", fem: "13.ª", word: "decimotercero", femWord: "decimotercera" },
    14: { num: "14.º", fem: "14.ª", word: "decimocuarto", femWord: "decimocuarta" },
    15: { num: "15.º", fem: "15.ª", word: "decimoquinto", femWord: "decimoquinta" },
    16: { num: "16.º", fem: "16.ª", word: "decimosexto", femWord: "decimosexta" },
    17: { num: "17.º", fem: "17.ª", word: "decimoséptimo", femWord: "decimoséptima" },
    18: { num: "18.º", fem: "18.ª", word: "decimoctavo", femWord: "decimoctava" },
    19: { num: "19.º", fem: "19.ª", word: "decimonoveno", femWord: "decimonovena" },
    20: { num: "20.º", fem: "20.ª", word: "vigésimo", femWord: "vigésima" },
    21: { num: "21.º", fem: "21.ª", word: "vigesimoprimero", femWord: "vigesimoprimera" },
    22: { num: "22.º", fem: "22.ª", word: "vigesimosegundo", femWord: "vigesimosegunda" },
    23: { num: "23.º", fem: "23.ª", word: "vigesimotercero", femWord: "vigesimotercera" },
    24: { num: "24.º", fem: "24.ª", word: "vigesimocuarto", femWord: "vigesimocuarta" },
    25: { num: "25.º", fem: "25.ª", word: "vigesimoquinto", femWord: "vigesimoquinta" },
    26: { num: "26.º", fem: "26.ª", word: "vigesimosexto", femWord: "vigesimosexta" },
    27: { num: "27.º", fem: "27.ª", word: "vigesimoséptimo", femWord: "vigesimoséptima" },
    28: { num: "28.º", fem: "28.ª", word: "vigesimoctavo", femWord: "vigesimoctava" },
    29: { num: "29.º", fem: "29.ª", word: "vigesimonoveno", femWord: "vigesimonovena" },
    30: { num: "30.º", fem: "30.ª", word: "trigésimo", femWord: "trigésima" },
    31: { num: "31.º", fem: "31.ª", word: "trigésimo primero", femWord: "trigésima primera" },
    32: { num: "32.º", fem: "32.ª", word: "trigésimo segundo", femWord: "trigésima segunda" },
    33: { num: "33.º", fem: "33.ª", word: "trigésimo tercero", femWord: "trigésima tercera" },
    34: { num: "34.º", fem: "34.ª", word: "trigésimo cuarto", femWord: "trigésima cuarta" },
    35: { num: "35.º", fem: "35.ª", word: "trigésimo quinto", femWord: "trigésima quinta" },
    36: { num: "36.º", fem: "36.ª", word: "trigésimo sexto", femWord: "trigésima sexta" },
    37: { num: "37.º", fem: "37.ª", word: "trigésimo séptimo", femWord: "trigésima séptima" },
    38: { num: "38.º", fem: "38.ª", word: "trigésimo octavo", femWord: "trigésima octava" },
    39: { num: "39.º", fem: "39.ª", word: "trigésimo noveno", femWord: "trigésima novena" },
    40: { num: "40.º", fem: "40.ª", word: "cuadragésimo", femWord: "cuadragésima" }
  },

  getOrdinal(pos) {
    if (this.ORDINAL_MAP[pos]) {
      return this.ORDINAL_MAP[pos];
    }
    return {
      num: `${pos}.º`,
      femNum: `${pos}.ª`,
      word: `${pos}.º lugar`,
      femWord: `${pos}.ª posición`
    };
  },

  // ---------------------------------------------------------------------------
  // 6. COMPARACIÓN Y VALIDACIÓN TOLERANTE (PARA LA ENTRADA DE TEXTO)
  // ---------------------------------------------------------------------------
  cleanText(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // sin tildes para comparación flexible
      .replace(/[ºª°\.]/g, '')
      .replace(/[\-–—_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  isAnswerCorrect(userInput, validAnswers) {
    if (!userInput) return false;
    const cleanUser = this.cleanText(userInput);
    const compactUser = cleanUser.replace(/\s+/g, '');
    if (!Array.isArray(validAnswers)) {
      validAnswers = [validAnswers];
    }
    return validAnswers.some(ans => {
      if (typeof ans === 'number') {
        const numUser = this.parseNumber(userInput);
        return numUser === ans;
      }
      const cleanExpected = this.cleanText(ans);
      if (cleanUser === cleanExpected) return true;
      if (compactUser === cleanExpected.replace(/\s+/g, '')) return true;
      return false;
    });
  },

  // Validador tolerante de descomposición por órdenes (DM, UM, C, D, U)
  // Acepta: "9 C + 4 d + 6 u", "9C+4d+6u", "9c + 4d + 6u", con o sin espacios,
  // con o sin ceros, en cualquier orden de sumandos, con palabras completas, etc.
  checkOrderDecomposition(userInput, targetNum) {
    if (!userInput || !targetNum) return false;
    const num = (typeof targetNum === 'object') ? targetNum.num : targetNum;
    const dec = (typeof targetNum === 'object') ? targetNum : this.decompose(num);

    const raw = String(userInput).trim();
    if (!raw) return false;

    // Normalizar a minúsculas y sin acentos
    let str = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Normalizar nombres largos de órdenes a abreviaturas estándar
    str = str.replace(/decenas?\s+de\s+millar/g, 'dm')
             .replace(/unidades?\s+de\s+millar/g, 'um')
             .replace(/centenas?/g, 'c')
             .replace(/decenas?/g, 'd')
             .replace(/unidades?/g, 'u');

    // Quitar puntos o comas que separen términos
    str = str.replace(/\./g, '').replace(/,/g, '+').replace(/\by\b/g, '+');

    // Quitar todos los espacios para comparación directa
    const compactUser = str.replace(/\s+/g, '');
    const compactExpected1 = dec.orderText.toLowerCase().replace(/[\.\s]/g, '');
    const compactExpected2 = dec.orderTextFull.toLowerCase().replace(/[\.\s]/g, '');

    // 1. Coincidencia directa sin espacios (ej. "9c+4d+6u" === "9c+4d+6u")
    if (compactUser === compactExpected1 || compactUser === compactExpected2) {
      return true;
    }

    // 2. Coincidencia matemática y de órdenes tolerante a cualquier orden de sumandos
    const regex = /(\d+)\s*(dm|um|c|d|u)/g;
    const foundOrders = {};
    let match;
    let tokenCount = 0;

    while ((match = regex.exec(str)) !== null) {
      tokenCount++;
      const val = parseInt(match[1], 10);
      const ord = match[2];
      foundOrders[ord] = (foundOrders[ord] || 0) + val;
    }

    if (tokenCount > 0) {
      const expectedDigits = {
        dm: dec.dm,
        um: dec.um,
        c: dec.c,
        d: dec.d,
        u: dec.u
      };

      const ordersList = ['dm', 'um', 'c', 'd', 'u'];
      for (let i = 0; i < ordersList.length; i++) {
        const ord = ordersList[i];
        const userOrdVal = foundOrders[ord] || 0;
        const expVal = expectedDigits[ord] || 0;
        if (userOrdVal !== expVal) {
          return false;
        }
      }
      return true;
    }

    return false;
  },

  // Validador tolerante de descomposición en suma de valores (unidades)
  // Acepta: "900 + 40 + 6", "900+40+6", "30.000 + 4.000 + 10 + 6", "30000+4000+10+6", etc.
  checkValuesDecomposition(userInput, targetNum) {
    if (!userInput || !targetNum) return false;
    const num = (typeof targetNum === 'object') ? targetNum.num : targetNum;
    const dec = (typeof targetNum === 'object') ? targetNum : this.decompose(num);

    const raw = String(userInput).trim();
    if (!raw) return false;

    // Quitar puntos de miles y todos los espacios
    const compactUser = raw.replace(/\./g, '').replace(/\s+/g, '');
    const compactExpected = dec.valuesText.replace(/\./g, '').replace(/\s+/g, '');

    // 1. Coincidencia directa sin espacios ni puntos
    if (compactUser === compactExpected) {
      return true;
    }

    // 2. Coincidencia matemática por sumandos
    const rawTokens = raw.replace(/\./g, '').split(/[+,]/);
    const parts = [];
    for (let i = 0; i < rawTokens.length; i++) {
      const parsed = parseInt(rawTokens[i].trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        parts.push(parsed);
      }
    }

    if (parts.length === 0) return false;

    const sum = parts.reduce((acc, v) => acc + v, 0);
    if (sum !== num) return false;

    const expectedValues = [
      dec.dm * 10000,
      dec.um * 1000,
      dec.c * 100,
      dec.d * 10,
      dec.u
    ].filter(v => v > 0);

    if (parts.length !== expectedValues.length) return false;

    const sortedParts = parts.slice().sort((a, b) => b - a);
    const sortedExpected = expectedValues.slice().sort((a, b) => b - a);

    for (let i = 0; i < sortedParts.length; i++) {
      if (sortedParts[i] !== sortedExpected[i]) return false;
    }

    return true;
  },

  // Validador tolerante de ordinales (tanto en cifras como en letras)
  checkOrdinal(userInput, expectedPos) {
    if (!userInput || !expectedPos) return false;
    const cleanUser = this.cleanText(userInput);
    const numVal = this.parseNumber(userInput);

    if (!isNaN(numVal) && numVal === expectedPos) {
      return true;
    }

    const ord = this.getOrdinal(expectedPos);
    const validWords = [
      ord.word,
      ord.femWord,
      ord.alt,
      ord.altFem,
      ord.num,
      ord.femNum
    ].filter(Boolean);

    return this.isAnswerCorrect(userInput, validWords);
  },

  // ---------------------------------------------------------------------------
  // 7. GENERADOR ALEATORIO DE CASUÍSTICA DINÁMICA (NUNCA SE REPITE)
  // ---------------------------------------------------------------------------
  generateDynamicScenario() {
    const themes = [
      {
        id: "asturias_parques",
        title: "🌲 Expedición por la Naturaleza y Parques de Asturias",
        location: "los Picos de Europa y Covadonga",
        contextLabel: "Número de senderistas y visitantes en mayo:",
        monuments: [
          { name: "Basílica de Covadonga", startYear: 1877, endYear: 1901 },
          { name: "Monasterio de San Pedro de Villanueva", startYear: 746, endYear: 1200 },
          { name: "Catedral de San Salvador de Oviedo", startYear: 1388, endYear: 1587 }
        ],
        museumA: "Museo Jurásico de Asturias (MUJA)",
        museumB: "Centro de la Fauna de los Picos"
      },
      {
        id: "sevilla_cordoba",
        title: "🏰 Misión Histórica por Sevilla y Córdoba",
        location: "los grandes monumentos andaluces",
        contextLabel: "Número de personas que visitaron la provincia en mayo:",
        monuments: [
          { name: "Torre del Oro de Sevilla", startYear: 1220, endYear: 1221 },
          { name: "La Giralda de Sevilla", startYear: 1184, endYear: 1198 },
          { name: "Mezquita-Catedral de Córdoba", startYear: 785, endYear: 987 }
        ],
        museumA: "Real Alcázar de Sevilla",
        museumB: "Museo de Bellas Artes"
      },
      {
        id: "ciencias_espacio",
        title: "🚀 Misión al Centro Espacial y de las Ciencias",
        location: "la Ciudad de las Artes y el Espacio",
        contextLabel: "Número de estudiantes e investigadores que asistieron en mayo:",
        monuments: [
          { name: "Observatorio Astronómico Histórico", startYear: 1790, endYear: 1808 },
          { name: "Gran Cúpula Planetaria", startYear: 1989, endYear: 1998 },
          { name: "Torre de Comunicaciones Espaciales", startYear: 1969, endYear: 1972 }
        ],
        museumA: "Simulador de Gravedad Cero",
        museumB: "Pabellón de la Cúpula Estelar"
      },
      {
        id: "granada_alhambra",
        title: "🌸 Viaje de Exploración por Granada y Sierra Nevada",
        location: "la provincia de Granada",
        contextLabel: "Número de viajeros que recorrieron la provincia en mayo:",
        monuments: [
          { name: "Palacio de Carlos V en La Alhambra", startYear: 1527, endYear: 1568 },
          { name: "La Alhambra (Palacios Nazaríes)", startYear: 1238, endYear: 1358 },
          { name: "Catedral de Granada", startYear: 1523, endYear: 1704 }
        ],
        museumA: "Parque de las Ciencias de Granada",
        museumB: "Museo Arqueológico de la Alhambra"
      }
    ];

    // Elegir tema aleatorio
    const theme = themes[Math.floor(Math.random() * themes.length)];

    // Generar años (2019, 2020, 2021, 2022)
    // 2020 suele ser más bajo por la casuística de confinamiento (3 cifras: 800 - 999)
    // Los otros son de 5 cifras variados entre 25.000 y 85.000
    const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const val2020 = randBetween(750, 995);
    const val2021 = randBetween(24000, 39900);
    const val2022 = randBetween(42000, 59000);
    const val2019 = randBetween(64000, 89000);

    const visitors = {
      2019: val2019,
      2020: val2020,
      2021: val2021,
      2022: val2022
    };

    // Monumentos con conversión romana
    const monumentData = theme.monuments.map(m => {
      const startRoman = this.intToRoman(m.startYear);
      const endRoman = this.intToRoman(m.endYear);
      const duration = m.endYear - m.startYear;
      return {
        name: m.name,
        startYear: m.startYear,
        endYear: m.endYear,
        startRoman,
        endRoman,
        duration
      };
    });

    // Colas con nombres variados
    const queueNames = [
      "Laura", "Pedro", "Yago", "Luisa", "Emma", "Omar", "Mía", "Blanca",
      "Lucas", "Sofía", "Martín", "Carmen", "Mateo", "Julia", "Leo", "Valeria",
      "Hugo", "Daniela", "Alejandro", "Paula", "Pablo", "Lucía", "Manuel", "Elena"
    ];
    // Barajar nombres
    const shuffledNames = [...queueNames].sort(() => 0.5 - Math.random());

    const queueTotal = randBetween(28, 35);
    const miguelPos = randBetween(2, 4); // Miguel está el 2º, 3º o 4º
    const albaOffset = randBetween(9, 13); // 11 lugares por detrás
    const albaPos = miguelPos + albaOffset;
    const felixAheadOfAlba = queueTotal - albaPos;

    // Para Modelo A de colas
    const colaSantaCruz = randBetween(32, 40);
    const colaGreco = randBetween(24, 30);
    const paolaPos = randBetween(14, 18);
    const juanOffset = randBetween(12, 18);
    const colaFinalGreco = paolaPos + juanOffset;
    const ivanPos = randBetween(30, 36);
    const personasEntraron = randBetween(7, 11);
    const ivanNuevaPos = ivanPos - personasEntraron;

    // Predicción de año 2023 con aproximación a las decenas de millar
    const approx2023 = (Math.floor(val2019 / 10000) + 1) * 10000; // e.g. 80.000 o 70.000

    return {
      themeId: theme.id,
      title: theme.title,
      location: theme.location,
      contextLabel: theme.contextLabel,
      visitors,
      monuments: monumentData,
      museumA: theme.museumA,
      museumB: theme.museumB,
      queue: {
        total: queueTotal,
        miguelPos,
        albaOffset,
        albaPos,
        felixAheadOfAlba,
        sampleKids: [
          { name: shuffledNames[0], pos: 7 },
          { name: shuffledNames[1], pos: queueTotal },
          { name: shuffledNames[2], pos: 21 },
          { name: shuffledNames[3], pos: 9 },
          { name: shuffledNames[4], pos: 15 },
          { name: shuffledNames[5], pos: queueTotal - 3 },
          { name: shuffledNames[6], pos: 26 },
          { name: shuffledNames[7], pos: 18 }
        ]
      },
      advancedQueue: {
        colaA: colaSantaCruz,
        colaB: colaGreco,
        paolaPos,
        juanOffset,
        colaFinalGreco,
        ivanPos,
        personasEntraron,
        ivanNuevaPos
      },
      approx2023
    };
  }
};

// Exportar globalmente
window.MathUtils = MathUtils;
