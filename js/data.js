// =============================================================================
// BANCO DE DATOS, CASUÍSTICAS Y GUÍA DE ESTUDIO · TEMA 1 MATEMÁTICAS 4.º
// Páginas 6 a 9: Numeración de hasta 5 cifras, Aproximación, Romanos y Ordinales
// =============================================================================

const MathData = {
  // ---------------------------------------------------------------------------
  // 1. ESCENARIOS PREDEFINIDOS CURADOS (CASUÍSTICAS RICAS Y VARIADAS)
  // ---------------------------------------------------------------------------
  scenarios: [
    {
      id: "andalucia_monumentos",
      name: "🏰 Aventura 1: Castillos y Monumentos de Andalucía",
      badge: "Recomendado",
      description: "Explora la Alhambra de Granada, la Torre del Oro de Sevilla y la Mezquita de Córdoba con sus visitantes y fechas históricas.",
      location: "los monumentos más célebres de Andalucía",
      contextLabel: "Número de personas que visitaron la provincia de Sevilla en mayo:",
      visitors: {
        2019: 68425,
        2020: 946,
        2021: 29014,
        2022: 53861
      },
      monuments: [
        { name: "Torre del Oro (Sevilla)", startYear: 1220, endYear: 1221, startRoman: "MCCXX", endRoman: "MCCXXI", duration: 1 },
        { name: "La Alhambra (Granada)", startYear: 1238, endYear: 1358, startRoman: "MCCXXXVIII", endRoman: "MCCCLVIII", duration: 120 },
        { name: "Mezquita de Córdoba", startYear: 785, endYear: 987, startRoman: "DCCLXXXV", endRoman: "CMLXXXVII", duration: 202 }
      ],
      museumA: "Taquillas de La Alhambra",
      museumB: "Taquillas del Real Alcázar",
      queue: {
        total: 30,
        miguelPos: 3,
        albaOffset: 11,
        albaPos: 14,
        felixAheadOfAlba: 16,
        sampleKids: [
          { name: "Laura", pos: 7 },
          { name: "Pedro", pos: 30 },
          { name: "Yago", pos: 21 },
          { name: "Luisa", pos: 9 },
          { name: "Emma", pos: 15 },
          { name: "Omar", pos: 27 },
          { name: "Mía", pos: 26 },
          { name: "Blanca", pos: 18 }
        ]
      },
      advancedQueue: {
        colaA: 35,
        colaB: 27,
        paolaPos: 16,
        juanOffset: 17,
        colaFinalGreco: 33,
        ivanPos: 34,
        personasEntraron: 9,
        ivanNuevaPos: 25
      },
      approx2023: 70000
    },
    {
      id: "espacio_ciencias",
      name: "🚀 Aventura 2: El Gran Parque de las Ciencias y el Espacio",
      badge: "Aventura Científica",
      description: "Descubre el número de visitantes del planetario, las fechas de los telescopios espaciales y las colas para el simulador estelar.",
      location: "la Ciudad de las Ciencias y el Planetario",
      contextLabel: "Número de jóvenes y exploradores que visitaron el Planetario en mayo:",
      visitors: {
        2019: 82340,
        2020: 875,
        2021: 41208,
        2022: 64192
      },
      monuments: [
        { name: "Primer Telescopio de Galileo", startYear: 1609, endYear: 1610, startRoman: "MDCIX", endRoman: "MDCX", duration: 1 },
        { name: "Gran Cúpula Astronómica", startYear: 1982, endYear: 1995, startRoman: "MCMLXXXII", endRoman: "MCMXCV", duration: 13 },
        { name: "Observatorio Real", startYear: 1790, endYear: 1808, startRoman: "MDCCXC", endRoman: "MDCCCVIII", duration: 18 }
      ],
      museumA: "Simulador Espacial 3D",
      museumB: "Cúpula del Planetario",
      queue: {
        total: 32,
        miguelPos: 4,
        albaOffset: 12,
        albaPos: 16,
        felixAheadOfAlba: 16,
        sampleKids: [
          { name: "Lucas", pos: 5 },
          { name: "Sofía", pos: 32 },
          { name: "Martín", pos: 22 },
          { name: "Carmen", pos: 11 },
          { name: "Mateo", pos: 14 },
          { name: "Julia", pos: 29 },
          { name: "Leo", pos: 25 },
          { name: "Valeria", pos: 19 }
        ]
      },
      advancedQueue: {
        colaA: 38,
        colaB: 29,
        paolaPos: 15,
        juanOffset: 16,
        colaFinalGreco: 31,
        ivanPos: 36,
        personasEntraron: 10,
        ivanNuevaPos: 26
      },
      approx2023: 90000
    },
    {
      id: "donana_naturaleza",
      name: "🐬 Aventura 3: La Gran Reserva Marina y Parque de Doñana",
      badge: "Naturaleza Viva",
      description: "Practica con los visitantes a la reserva natural, fechas de expediciones marítimas históricas y colas para ver linces y delfines.",
      location: "la Reserva Natural de Doñana y el Litoral",
      contextLabel: "Número de personas que visitaron la Reserva Natural en mayo:",
      visitors: {
        2019: 71530,
        2020: 764,
        2021: 36412,
        2022: 52980
      },
      monuments: [
        { name: "Faro Histórico de Chipiona", startYear: 1863, endYear: 1867, startRoman: "MDCCCLXIII", endRoman: "MDCCCLXVII", duration: 4 },
        { name: "Palacio de Doñana (Las Marismas)", startYear: 1599, endYear: 1600, startRoman: "MDXCIX", endRoman: "MDC", duration: 1 },
        { name: "Torre Almenara de la Costa", startYear: 1577, endYear: 1585, startRoman: "MDLXXVII", endRoman: "MDLXXXV", duration: 8 }
      ],
      museumA: "Centro de Visitantes El Acebuche",
      museumB: "Observatorio de Linces y Aves",
      queue: {
        total: 28,
        miguelPos: 2,
        albaOffset: 10,
        albaPos: 12,
        felixAheadOfAlba: 16,
        sampleKids: [
          { name: "Hugo", pos: 6 },
          { name: "Daniela", pos: 28 },
          { name: "Alejandro", pos: 20 },
          { name: "Paula", pos: 8 },
          { name: "Manuel", pos: 13 },
          { name: "Elena", pos: 25 },
          { name: "Pablo", pos: 24 },
          { name: "Lucía", pos: 17 }
        ]
      },
      advancedQueue: {
        colaA: 33,
        colaB: 25,
        paolaPos: 14,
        juanOffset: 15,
        colaFinalGreco: 29,
        ivanPos: 32,
        personasEntraron: 8,
        ivanNuevaPos: 24
      },
      approx2023: 80000
    },
    {
      id: "toledo_original",
      hidden: true,
      name: "📖 Toledo (Fiel al Libro de Respuestas Oficial)",
      badge: "Modelo Oficial",
      description: "Los mismos datos y monumentos del libro de evaluación de Santillana (Toledo, 75.787, 983, 34.016, 48.573, Catedral, Sinagoga, Mezquita).",
      location: "la provincia de Toledo",
      contextLabel: "NÚMERO DE PERSONAS QUE VISITARON LA PROVINCIA DE TOLEDO EN MAYO:",
      visitors: {
        2019: 75787,
        2020: 983,
        2021: 34016,
        2022: 48573
      },
      monuments: [
        { name: "Catedral Primada", startYear: 1226, endYear: 1493, startRoman: "MCCXXVI", endRoman: "MCDXCIII", duration: 267 },
        { name: "Sinagoga del Tránsito", startYear: 1355, endYear: 1357, startRoman: "MCCCLV", endRoman: "MCCCLVII", duration: 2 },
        { name: "Mezquita del Cristo de la Luz", startYear: 999, endYear: 1000, startRoman: "CMXCIX", endRoman: "M", duration: 1 }
      ],
      museumA: "Museo de Santa Cruz",
      museumB: "Museo del Greco",
      queue: {
        total: 30,
        miguelPos: 3,
        albaOffset: 11,
        albaPos: 14,
        felixAheadOfAlba: 16,
        sampleKids: [
          { name: "Laura", pos: 7 },
          { name: "Pedro", pos: 30 },
          { name: "Yago", pos: 21 },
          { name: "Luisa", pos: 9 },
          { name: "Emma", pos: 15 },
          { name: "Omar", pos: 27 },
          { name: "Mía", pos: 26 },
          { name: "Blanca", pos: 18 }
        ]
      },
      advancedQueue: {
        colaA: 35,
        colaB: 27,
        paolaPos: 16,
        juanOffset: 17,
        colaFinalGreco: 33,
        ivanPos: 34,
        personasEntraron: 9,
        ivanNuevaPos: 25
      },
      approx2023: 80000
    }
  ],

  // ---------------------------------------------------------------------------
  // 2. BANCO DE PREGUNTAS DEL DESAFÍO EXPRESS (REPASO ÁGIL INFINITO)
  // ---------------------------------------------------------------------------
  expressQuestionsPool: [
    {
      type: "position_value",
      question: "¿Cuántas unidades vale la cifra 5 en el número 48.573?",
      options: ["50 unidades", "500 unidades", "5.000 unidades", "50.000 unidades"],
      correct: 1,
      explanation: "El 5 ocupa el lugar de las centenas (5 C), y 5 centenas equivalen a 500 unidades."
    },
    {
      type: "position_value",
      question: "¿Qué cifra ocupa el lugar de las decenas de millar (DM) en el número 34.016?",
      options: ["La cifra 4", "La cifra 1", "La cifra 3", "La cifra 0"],
      correct: 2,
      explanation: "En 34.016: 3 es DM (decenas de millar), 4 es UM, 0 es C, 1 es D y 6 es U."
    },
    {
      type: "reading",
      question: "¿Cómo se escribe correctamente con letras el número 34.016?",
      options: [
        "Treinta y cuatro mil y dieciséis",
        "Treinta y cuatro mil dieciséis",
        "Treinta y cuatro mil diez y seis",
        "Treinticuatro mil dieciséis"
      ],
      correct: 1,
      explanation: "Se escribe 'treinta y cuatro mil dieciséis'. Recuerda que 'dieciséis' va en una sola palabra con tilde en la e."
    },
    {
      type: "reading",
      question: "¿Cómo se escribe con letras el número 983?",
      options: [
        "Novecientos ochenta y tres",
        "Nuevecientos ochenta y tres",
        "Novecientos y ochenta y tres",
        "Novecientos ochentaitrés"
      ],
      correct: 0,
      explanation: "Se dice y escribe 'novecientos' (no nuevecientos) y 'ochenta y tres' separados con y."
    },
    {
      type: "rounding",
      question: "¿Cuál es la aproximación a las decenas (D) del número 983?",
      options: ["980", "990", "1.000", "900"],
      correct: 0,
      explanation: "Para aproximar a las decenas miramos las unidades (3). Como 3 es menor que 5, dejamos 98 decenas: 980."
    },
    {
      type: "rounding",
      question: "¿Cuál es la aproximación a las centenas (C) del número 983?",
      options: ["900", "980", "1.000", "990"],
      correct: 2,
      explanation: "Para aproximar a las centenas miramos las decenas (8). Como 8 es 5 o mayor, sumamos 1 a las centenas: pasa de 9 a 10 centenas, es decir, 1.000."
    },
    {
      type: "rounding",
      question: "¿Cuál es la aproximación a los millares (UM) del número 48.573?",
      options: ["48.000", "49.000", "50.000", "48.600"],
      correct: 1,
      explanation: "Para aproximar a los millares miramos las centenas (5). Como es 5, redondeamos hacia arriba: 48 + 1 = 49 millares (49.000)."
    },
    {
      type: "rounding",
      question: "¿Cuál es la aproximación a las decenas de millar (DM) del número 75.787?",
      options: ["70.000", "75.000", "76.000", "80.000"],
      correct: 3,
      explanation: "Miramos las unidades de millar (5). Al ser 5 o mayor, se redondea hacia arriba: 7 DM pasa a 8 DM = 80.000."
    },
    {
      type: "romans",
      question: "¿Qué número representa en el sistema arábigo el número romano MCCXXVI?",
      options: ["1.226", "1.236", "1.126", "2.226"],
      correct: 0,
      explanation: "M = 1.000, CC = 200, XX = 20, VI = 6. Sumamos: 1.000 + 200 + 20 + 6 = 1.226."
    },
    {
      type: "romans",
      question: "¿Qué número representa el número romano CMXCIX?",
      options: ["1.119", "999", "1.099", "919"],
      correct: 1,
      explanation: "CM = 1.000 - 100 = 900. XC = 100 - 10 = 90. IX = 10 - 1 = 9. Total = 999."
    },
    {
      type: "romans",
      question: "¿Cómo se escribe el número 1.355 en números romanos?",
      options: ["MCCCLV", "MCCLV", "MDLV", "MCCCLIV"],
      correct: 0,
      explanation: "1.000 es M, 300 es CCC, 50 es L y 5 es V: MCCCLV."
    },
    {
      type: "romans",
      question: "La Mezquita comenzó a construirse en el año CMXCIX (999) y se finalizó en el año M (1000). ¿Cuántos años tardó su construcción?",
      options: ["1 año", "10 años", "100 años", "99 años"],
      correct: 0,
      explanation: "1.000 - 999 = 1 año."
    },
    {
      type: "ordinals",
      question: "Para entrar a una exposición hay una cola de 35 personas. ¿Qué posición ocupa la última persona?",
      options: ["Trigésimo quinto (35.º)", "Vigesimoquinto (25.º)", "Trigésimo cuarto (34.º)", "Cuadragésimo (40.º)"],
      correct: 0,
      explanation: "Como hay 35 personas, la última ocupa el lugar 35.º, que se escribe trigésimo quinto."
    },
    {
      type: "ordinals",
      question: "Alba está 11 lugares por detrás de Miguel, que está en el 3.º lugar. ¿En qué posición está Alba?",
      options: ["11.º (undécima)", "14.º (decimocuarta)", "13.º (decimotercera)", "15.º (decimoquinta)"],
      correct: 1,
      explanation: "Sumamos el puesto de Miguel (3) más los 11 lugares que hay hasta Alba: 3 + 11 = 14.º (decimocuarta)."
    },
    {
      type: "ordinals",
      question: "Félix es el último en una fila de 30 personas. Alba está en el puesto 14.º. ¿Cuántos lugares por delante de Félix está Alba?",
      options: ["14 lugares", "15 lugares", "16 lugares", "17 lugares"],
      correct: 2,
      explanation: "Félix está en el puesto 30. Restamos: 30 - 14 = 16 lugares por delante."
    },
    {
      type: "ordinals",
      question: "Iván estaba en el lugar 34.º de la fila. Si entran 9 personas al museo, ¿en qué posición queda Iván ahora?",
      options: ["25.º (vigesimoquinto)", "24.º (vigesimocuarto)", "26.º (vigesimosexto)", "43.º"],
      correct: 0,
      explanation: "Al entrar 9 personas la cola avanza: 34 - 9 = 25.º (vigesimoquinto)."
    },
    {
      type: "ordinals",
      question: "Paola está en el lugar 16.º de la cola y Juan está 17 lugares por detrás de ella. Si Juan es el último, ¿cuántas personas tiene la cola?",
      options: ["32 personas", "33 personas", "34 personas", "31 personas"],
      correct: 1,
      explanation: "Sumamos la posición de Paola más los que hay detrás hasta el final: 16 + 17 = 33 personas en total."
    },
    {
      type: "decomposition",
      question: "¿A qué número corresponde la descomposición: 4 DM + 8 UM + 5 C + 7 D + 3 U?",
      options: ["48.573", "48.753", "84.573", "48.537"],
      correct: 0,
      explanation: "4 DM (40.000) + 8 UM (8.000) + 5 C (500) + 7 D (70) + 3 U (3) = 48.573."
    },
    {
      type: "ordering",
      question: "¿Cuál de estos órdenes es el correcto de MENOR a MAYOR?",
      options: [
        "983 < 34.016 < 48.573 < 75.787",
        "75.787 < 48.573 < 34.016 < 983",
        "983 < 48.573 < 34.016 < 75.787",
        "34.016 < 983 < 48.573 < 75.787"
      ],
      correct: 0,
      explanation: "983 tiene solo 3 cifras. Los demás tienen 5 cifras: 34.016 < 48.573 < 75.787."
    }
  ],

  // ---------------------------------------------------------------------------
  // 3. GUÍA RESUMEN DE ESTUDIO (CHULETA OFICIAL PARA OLIVIA)
  // ---------------------------------------------------------------------------
  studyGuide: {
    blocks: [
      {
        id: "valor_posicional",
        title: "1. Valor Posicional y Descomposición",
        icon: "🧩",
        summary: "Nuestro sistema de numeración es decimal y posicional. El valor de cada cifra depende del lugar que ocupa en el número.",
        table: [
          { order: "DM", name: "Decenas de millar", value: "10.000 unidades", color: "bg-purple-100 text-purple-900 border-purple-300" },
          { order: "UM", name: "Unidades de millar", value: "1.000 unidades", color: "bg-blue-100 text-blue-900 border-blue-300" },
          { order: "C", name: "Centenas", value: "100 unidades", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
          { order: "D", name: "Decenas", value: "10 unidades", color: "bg-amber-100 text-amber-900 border-amber-300" },
          { order: "U", name: "Unidades", value: "1 unidad", color: "bg-rose-100 text-rose-900 border-rose-300" }
        ],
        example: {
          num: "48.573",
          byOrder: "4 DM + 8 UM + 5 C + 7 D + 3 U",
          byValues: "40.000 + 8.000 + 500 + 70 + 3",
          reading: "cuarenta y ocho mil quinientos setenta y tres"
        }
      },
      {
        id: "redondeo",
        title: "2. Reglas de Aproximación y Redondeo",
        icon: "🎯",
        summary: "Para aproximar un número a un orden, nos fijamos en la cifra del orden inmediatamente menor:",
        rules: [
          "🏔️ Si la cifra siguiente es MENOR QUE 5 (0, 1, 2, 3, 4): la cifra se QUEDA IGUAL y todas las siguientes se cambian por ceros.",
          "🚀 Si la cifra siguiente es 5 O MAYOR (5, 6, 7, 8, 9): se SUMA 1 a la cifra que queremos aproximar y las siguientes se cambian por ceros."
        ],
        examples: [
          { num: "983 a las decenas", target: "Miramos las U (3)", res: "980 (3 es menor que 5)" },
          { num: "983 a las centenas", target: "Miramos las D (8)", res: "1.000 (8 es 5 o mayor, sube)" },
          { num: "48.573 a los millares", target: "Miramos las C (5)", res: "49.000 (5 es 5 o mayor, sube)" },
          { num: "75.787 a las decenas de millar", target: "Miramos las UM (5)", res: "80.000 (5 sube a 8 DM)" }
        ]
      },
      {
        id: "romanos",
        title: "3. Sistema de Numeración Romano",
        icon: "🏛️",
        summary: "Los antiguos romanos utilizaban 7 letras mayúsculas con valores fijos:",
        letters: [
          { letter: "I", val: 1 },
          { letter: "V", val: 5 },
          { letter: "X", val: 10 },
          { letter: "L", val: 50 },
          { letter: "C", val: 100 },
          { letter: "D", val: 500 },
          { letter: "M", val: 1000 }
        ],
        keyRules: [
          "1. 🔁 REPETICIÓN: I, X, C y M se pueden repetir hasta 3 veces seguidas (III=3, XXX=30, CCC=300, MMM=3000). V, L y D ¡NUNCA se repiten!",
          "2. ➕ SUMA: Una letra de menor o igual valor situada a la derecha se SUMA (VI = 5+1 = 6; XI = 10+1 = 11; CL = 100+50 = 150).",
          "3. ➖ RESTA: Una letra menor a la izquierda se RESTA. Pero con reglas estrictas:",
          "   • I solo resta a V y X (IV = 4, IX = 9)",
          "   • X solo resta a L y C (XL = 40, XC = 90)",
          "   • C solo resta a D y M (CD = 400, CM = 900)",
          "   • V, L y D ¡NUNCA restan!"
        ]
      },
      {
        id: "ordinales",
        title: "4. Números Ordinales y Problemas de Filas",
        icon: "🚶‍♀️",
        summary: "Los números ordinales expresan el lugar o la posición que ocupa un elemento en una serie ordenada.",
        queueRules: [
          "📍 Lugar hacia atrás: Si estás en el puesto P y alguien está K lugares detrás de ti, su posición es P + K.",
          "⏩ Distancia al final: En una fila de N personas, la última persona está en el puesto N.º. Si estás en el puesto P, estás a (N - P) lugares por delante del último.",
          "🚪 Avance de turnos: Si entran K personas por delante, tu nueva posición será (P - K).",
          "👥 Longitud total: Si Paola está en el puesto P y Juan está K lugares detrás y es el último, la fila tiene (P + K) personas."
        ]
      }
    ]
  }
};

window.MathData = MathData;
