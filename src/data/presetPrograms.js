// PRESET_PROGRAMS — hardcoded, read-only
// When user activates one, a COPY is written to their graw_store
// The originals here are NEVER mutated

export const PRESET_PROGRAMS = [

  // ─── FUERZA ──────────────────────────────────────────────────
  {
    id: 'preset-sl5x5',
    name: 'StrongLifts 5×5',
    description: 'El programa de fuerza más probado del mundo. Compuestos pesados, progresión lineal cada sesión. Ideal para construir una base sólida.',
    goal: 'fuerza',
    level: 'principiante',
    daysPerWeek: 3,
    weeks: 12,
    tags: ['Fuerza', 'Compuestos', '3 días'],
    days: [
      {
        id: 'sl-a',
        name: 'Entrenamiento A',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',       sets: 5, reps: 5, restSeconds: 180 },
          { exerciseId: 'bench',       sets: 5, reps: 5, restSeconds: 180 },
          { exerciseId: 'barbell-row', sets: 5, reps: 5, restSeconds: 180 },
        ]
      },
      {
        id: 'sl-b',
        name: 'Entrenamiento B',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',    sets: 5, reps: 5, restSeconds: 180 },
          { exerciseId: 'ohp',      sets: 5, reps: 5, restSeconds: 180 },
          { exerciseId: 'deadlift', sets: 1, reps: 5, restSeconds: 240 },
        ]
      },
    ],
    schedule: ['A', 'rest', 'B', 'rest', 'A', 'rest', 'rest'],
  },

  {
    id: 'preset-531',
    name: '5/3/1 Wendler',
    description: 'Ciclos de 4 semanas progresando en los 4 grandes levantamientos. Filosofía: ir despacio para ir lejos.',
    goal: 'fuerza',
    level: 'intermedio',
    daysPerWeek: 4,
    weeks: 16,
    tags: ['Fuerza', 'Ciclos', '4 días'],
    days: [
      {
        id: '531-ohp',
        name: 'Press Militar',
        templateId: null,
        exercises: [
          { exerciseId: 'ohp',          sets: 3, reps: 5,  restSeconds: 180 },
          { exerciseId: 'db-ohp',       sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'lat-pulldown', sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'face-pull',    sets: 3, reps: 15, restSeconds: 60  },
        ]
      },
      {
        id: '531-dl',
        name: 'Peso Muerto',
        templateId: null,
        exercises: [
          { exerciseId: 'deadlift', sets: 3, reps: 5,  restSeconds: 240 },
          { exerciseId: 'leg-press',sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'leg-curl', sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'plank',    sets: 3, reps: 60, restSeconds: 60  },
        ]
      },
      {
        id: '531-bench',
        name: 'Press Banca',
        templateId: null,
        exercises: [
          { exerciseId: 'bench',       sets: 3, reps: 5,  restSeconds: 180 },
          { exerciseId: 'db-incline',  sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'db-row',      sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'tricep-push', sets: 3, reps: 12, restSeconds: 60  },
        ]
      },
      {
        id: '531-squat',
        name: 'Sentadilla',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',        sets: 3, reps: 5,  restSeconds: 180 },
          { exerciseId: 'rdl',          sets: 3, reps: 8,  restSeconds: 120 },
          { exerciseId: 'leg-ext',      sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'standing-calf',sets: 3, reps: 15, restSeconds: 60  },
        ]
      },
    ],
    schedule: ['A', 'rest', 'B', 'rest', 'C', 'rest', 'D'],
  },

  {
    id: 'preset-ppl-strength',
    name: 'PPL Fuerza',
    description: 'Push Pull Legs orientado a fuerza máxima. Rangos de repetición bajos, pesos altos, descansos largos.',
    goal: 'fuerza',
    level: 'avanzado',
    daysPerWeek: 6,
    weeks: 12,
    tags: ['Fuerza', 'PPL', '6 días'],
    days: [
      {
        id: 'ppl-str-push',
        name: 'Push — Fuerza',
        templateId: null,
        exercises: [
          { exerciseId: 'bench',        sets: 5, reps: 3, restSeconds: 240 },
          { exerciseId: 'ohp',          sets: 4, reps: 4, restSeconds: 180 },
          { exerciseId: 'incline-bench',sets: 3, reps: 5, restSeconds: 180 },
          { exerciseId: 'tricep-push',  sets: 3, reps: 8, restSeconds: 90  },
        ]
      },
      {
        id: 'ppl-str-pull',
        name: 'Pull — Fuerza',
        templateId: null,
        exercises: [
          { exerciseId: 'deadlift',     sets: 4, reps: 3, restSeconds: 300 },
          { exerciseId: 'barbell-row',  sets: 4, reps: 4, restSeconds: 180 },
          { exerciseId: 'pullup',       sets: 3, reps: 5, restSeconds: 180 },
          { exerciseId: 'barbell-curl', sets: 3, reps: 6, restSeconds: 90  },
        ]
      },
      {
        id: 'ppl-str-legs',
        name: 'Legs — Fuerza',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',        sets: 5, reps: 3, restSeconds: 300 },
          { exerciseId: 'rdl',          sets: 4, reps: 4, restSeconds: 180 },
          { exerciseId: 'leg-press',    sets: 3, reps: 6, restSeconds: 180 },
          { exerciseId: 'standing-calf',sets: 4, reps: 8, restSeconds: 90  },
        ]
      },
    ],
    schedule: ['A', 'B', 'C', 'rest', 'A', 'B', 'C'],
  },

  // ─── VOLUMEN / MASA ───────────────────────────────────────────

  {
    id: 'preset-ppl-volume',
    name: 'PPL Hipertrofia',
    description: 'Push Pull Legs clásico para máxima ganancia muscular. Alto volumen, rangos de 8-15 repeticiones, técnica perfecta.',
    goal: 'volumen',
    level: 'intermedio',
    daysPerWeek: 6,
    weeks: 12,
    tags: ['Volumen', 'PPL', '6 días'],
    days: [
      {
        id: 'ppl-vol-push',
        name: 'Push — Pecho / Hombros / Tríceps',
        templateId: null,
        exercises: [
          { exerciseId: 'bench',         sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'db-incline',    sets: 4, reps: 10, restSeconds: 90  },
          { exerciseId: 'db-ohp',        sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'lateral-raise', sets: 4, reps: 15, restSeconds: 60  },
          { exerciseId: 'cable-fly-low', sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'tricep-push',   sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'overhead-tri',  sets: 3, reps: 12, restSeconds: 60  },
        ]
      },
      {
        id: 'ppl-vol-pull',
        name: 'Pull — Espalda / Bíceps',
        templateId: null,
        exercises: [
          { exerciseId: 'pullup',        sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'cable-row',     sets: 4, reps: 10, restSeconds: 90  },
          { exerciseId: 'lat-pulldown',  sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'face-pull',     sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'barbell-curl',  sets: 4, reps: 10, restSeconds: 60  },
          { exerciseId: 'hammer-curl',   sets: 3, reps: 12, restSeconds: 60  },
        ]
      },
      {
        id: 'ppl-vol-legs',
        name: 'Legs — Cuádriceps / Isquios / Glúteos',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',         sets: 4, reps: 8,  restSeconds: 150 },
          { exerciseId: 'leg-press',     sets: 4, reps: 12, restSeconds: 120 },
          { exerciseId: 'rdl',           sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'leg-curl',      sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'leg-ext',       sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'hip-thrust',    sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'standing-calf', sets: 4, reps: 15, restSeconds: 60  },
        ]
      },
    ],
    schedule: ['A', 'B', 'C', 'rest', 'A', 'B', 'C'],
  },

  {
    id: 'preset-upper-lower',
    name: 'Upper / Lower',
    description: 'Entrenamiento dividido en tren superior e inferior. 4 días a la semana, balance perfecto entre frecuencia y recuperación.',
    goal: 'volumen',
    level: 'principiante',
    daysPerWeek: 4,
    weeks: 10,
    tags: ['Volumen', 'Upper/Lower', '4 días'],
    days: [
      {
        id: 'ul-ua',
        name: 'Upper A — Empuje',
        templateId: null,
        exercises: [
          { exerciseId: 'bench',         sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'db-row',        sets: 4, reps: 10, restSeconds: 90  },
          { exerciseId: 'db-ohp',        sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'lat-pulldown',  sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'lateral-raise', sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'barbell-curl',  sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'tricep-push',   sets: 3, reps: 12, restSeconds: 60  },
        ]
      },
      {
        id: 'ul-la',
        name: 'Lower A — Cuádriceps',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',         sets: 4, reps: 8,  restSeconds: 150 },
          { exerciseId: 'leg-press',     sets: 3, reps: 12, restSeconds: 120 },
          { exerciseId: 'rdl',           sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'leg-curl',      sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'leg-ext',       sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'standing-calf', sets: 4, reps: 15, restSeconds: 60  },
        ]
      },
      {
        id: 'ul-ub',
        name: 'Upper B — Tracción',
        templateId: null,
        exercises: [
          { exerciseId: 'barbell-row',   sets: 4, reps: 8,  restSeconds: 120 },
          { exerciseId: 'incline-bench', sets: 4, reps: 10, restSeconds: 90  },
          { exerciseId: 'chinup',        sets: 3, reps: 8,  restSeconds: 120 },
          { exerciseId: 'db-ohp',        sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'db-fly',        sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'hammer-curl',   sets: 3, reps: 12, restSeconds: 60  },
          { exerciseId: 'skull-crusher', sets: 3, reps: 10, restSeconds: 60  },
        ]
      },
      {
        id: 'ul-lb',
        name: 'Lower B — Isquios / Glúteos',
        templateId: null,
        exercises: [
          { exerciseId: 'rdl',          sets: 4, reps: 8,  restSeconds: 150 },
          { exerciseId: 'hip-thrust',   sets: 4, reps: 10, restSeconds: 120 },
          { exerciseId: 'leg-curl',     sets: 4, reps: 12, restSeconds: 90  },
          { exerciseId: 'hack-squat',   sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'lunge',        sets: 3, reps: 12, restSeconds: 90  },
          { exerciseId: 'seated-calf',  sets: 4, reps: 15, restSeconds: 60  },
        ]
      },
    ],
    schedule: ['A', 'B', 'rest', 'C', 'D', 'rest', 'rest'],
  },

  {
    id: 'preset-fullbody',
    name: 'Full Body 3×',
    description: 'Cuerpo completo tres veces por semana. La opción más eficiente para ganar músculo siendo principiante o con tiempo limitado.',
    goal: 'volumen',
    level: 'principiante',
    daysPerWeek: 3,
    weeks: 8,
    tags: ['Volumen', 'Full Body', '3 días'],
    days: [
      {
        id: 'fb-a',
        name: 'Full Body A',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',        sets: 3, reps: 8,  restSeconds: 150 },
          { exerciseId: 'bench',        sets: 3, reps: 8,  restSeconds: 120 },
          { exerciseId: 'barbell-row',  sets: 3, reps: 8,  restSeconds: 120 },
          { exerciseId: 'db-ohp',       sets: 3, reps: 10, restSeconds: 90  },
          { exerciseId: 'rdl',          sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'barbell-curl', sets: 2, reps: 12, restSeconds: 60  },
          { exerciseId: 'tricep-push',  sets: 2, reps: 12, restSeconds: 60  },
        ]
      },
      {
        id: 'fb-b',
        name: 'Full Body B',
        templateId: null,
        exercises: [
          { exerciseId: 'deadlift',      sets: 3, reps: 5,  restSeconds: 180 },
          { exerciseId: 'db-bench',      sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'lat-pulldown',  sets: 3, reps: 10, restSeconds: 120 },
          { exerciseId: 'lateral-raise', sets: 3, reps: 15, restSeconds: 60  },
          { exerciseId: 'leg-press',     sets: 3, reps: 12, restSeconds: 120 },
          { exerciseId: 'hammer-curl',   sets: 2, reps: 12, restSeconds: 60  },
          { exerciseId: 'skull-crusher', sets: 2, reps: 10, restSeconds: 60  },
        ]
      },
    ],
    schedule: ['A', 'rest', 'B', 'rest', 'A', 'rest', 'rest'],
  },

  // ─── DEFINICIÓN ───────────────────────────────────────────────

  {
    id: 'preset-hiit-strength',
    name: 'Fuerza + Cardio',
    description: 'Entrenamiento de fuerza combinado con intervalos de alta intensidad. Preserva el músculo mientras reduces grasa.',
    goal: 'definicion',
    level: 'intermedio',
    daysPerWeek: 4,
    weeks: 8,
    tags: ['Definición', 'HIIT', '4 días'],
    days: [
      {
        id: 'hiit-upper',
        name: 'Superior + Core',
        templateId: null,
        exercises: [
          { exerciseId: 'bench',         sets: 4, reps: 10, restSeconds: 90 },
          { exerciseId: 'barbell-row',   sets: 4, reps: 10, restSeconds: 90 },
          { exerciseId: 'db-ohp',        sets: 3, reps: 12, restSeconds: 75 },
          { exerciseId: 'cable-fly-low', sets: 3, reps: 15, restSeconds: 60 },
          { exerciseId: 'cable-row',     sets: 3, reps: 15, restSeconds: 60 },
          { exerciseId: 'plank',         sets: 3, reps: 45, restSeconds: 45 },
          { exerciseId: 'russian-twist', sets: 3, reps: 20, restSeconds: 45 },
        ]
      },
      {
        id: 'hiit-lower',
        name: 'Inferior + Core',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',         sets: 4, reps: 10, restSeconds: 90 },
          { exerciseId: 'rdl',           sets: 4, reps: 12, restSeconds: 90 },
          { exerciseId: 'leg-press',     sets: 3, reps: 15, restSeconds: 75 },
          { exerciseId: 'hip-thrust',    sets: 3, reps: 15, restSeconds: 75 },
          { exerciseId: 'leg-curl',      sets: 3, reps: 15, restSeconds: 60 },
          { exerciseId: 'leg-raise',     sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'standing-calf', sets: 4, reps: 20, restSeconds: 45 },
        ]
      },
    ],
    schedule: ['A', 'rest', 'B', 'rest', 'A', 'rest', 'B'],
  },

  {
    id: 'preset-circuit',
    name: 'Circuito Metabólico',
    description: 'Alta intensidad, descansos cortos, máximo gasto calórico. Mantiene y tonifica el músculo en déficit calórico.',
    goal: 'definicion',
    level: 'principiante',
    daysPerWeek: 3,
    weeks: 6,
    tags: ['Definición', 'Circuito', '3 días'],
    days: [
      {
        id: 'circ-a',
        name: 'Circuito Total A',
        templateId: null,
        exercises: [
          { exerciseId: 'goblet-squat',  sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'pushup',        sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'db-row',        sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'lunge',         sets: 3, reps: 12, restSeconds: 45 },
          { exerciseId: 'db-ohp',        sets: 3, reps: 12, restSeconds: 45 },
          { exerciseId: 'plank',         sets: 3, reps: 40, restSeconds: 30 },
        ]
      },
      {
        id: 'circ-b',
        name: 'Circuito Total B',
        templateId: null,
        exercises: [
          { exerciseId: 'rdl-db',        sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'db-bench',      sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'lat-pulldown',  sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'step-up',       sets: 3, reps: 12, restSeconds: 45 },
          { exerciseId: 'lateral-raise', sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'dead-bug',      sets: 3, reps: 10, restSeconds: 30 },
        ]
      },
    ],
    schedule: ['A', 'rest', 'B', 'rest', 'A', 'rest', 'rest'],
  },

  {
    id: 'preset-ppl-cut',
    name: 'PPL Definición',
    description: 'PPL con mayor volumen de repeticiones y descansos reducidos. Mantiene masa muscular durante un corte.',
    goal: 'definicion',
    level: 'avanzado',
    daysPerWeek: 6,
    weeks: 10,
    tags: ['Definición', 'PPL', '6 días'],
    days: [
      {
        id: 'ppl-cut-push',
        name: 'Push — Definición',
        templateId: null,
        exercises: [
          { exerciseId: 'bench',          sets: 4, reps: 12, restSeconds: 75 },
          { exerciseId: 'db-incline',     sets: 3, reps: 15, restSeconds: 60 },
          { exerciseId: 'cable-fly-high', sets: 3, reps: 15, restSeconds: 60 },
          { exerciseId: 'lateral-raise',  sets: 4, reps: 20, restSeconds: 45 },
          { exerciseId: 'overhead-cable', sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'rope-pushdown',  sets: 3, reps: 15, restSeconds: 45 },
        ]
      },
      {
        id: 'ppl-cut-pull',
        name: 'Pull — Definición',
        templateId: null,
        exercises: [
          { exerciseId: 'pullup',       sets: 4, reps: 10, restSeconds: 75 },
          { exerciseId: 'cable-row',    sets: 4, reps: 12, restSeconds: 60 },
          { exerciseId: 'straight-arm', sets: 3, reps: 15, restSeconds: 60 },
          { exerciseId: 'face-pull',    sets: 4, reps: 20, restSeconds: 45 },
          { exerciseId: 'cable-curl',   sets: 3, reps: 15, restSeconds: 45 },
          { exerciseId: 'hammer-curl',  sets: 3, reps: 15, restSeconds: 45 },
        ]
      },
      {
        id: 'ppl-cut-legs',
        name: 'Legs — Definición',
        templateId: null,
        exercises: [
          { exerciseId: 'squat',         sets: 4, reps: 12, restSeconds: 90 },
          { exerciseId: 'rdl',           sets: 3, reps: 15, restSeconds: 75 },
          { exerciseId: 'leg-press',     sets: 3, reps: 15, restSeconds: 75 },
          { exerciseId: 'leg-curl',      sets: 4, reps: 15, restSeconds: 60 },
          { exerciseId: 'glute-kick',    sets: 3, reps: 20, restSeconds: 45 },
          { exerciseId: 'standing-calf', sets: 4, reps: 20, restSeconds: 45 },
        ]
      },
    ],
    schedule: ['A', 'B', 'C', 'rest', 'A', 'B', 'C'],
  },
]

// ─── Goal / level consequence maps ────────────────────────────────────────────

export const GOAL_CONFIG = {
  fuerza: {
    restTimer:       180,
    repRange:        { label: 'Fuerza', range: '3–6', color: 'var(--red)' },
    statPriority:    ['1rm', 'volume', 'sessions'],
    progressDefault: '1rm',
    programFilter:   'fuerza',
    todayHint:       'Calienta bien. Pesos pesados hoy.',
    restMessage:     'Los descansos largos son parte del entrenamiento de fuerza.',
    bodyGoal:        false,
  },
  volumen: {
    restTimer:       120,
    repRange:        { label: 'Hipertrofia', range: '8–12', color: 'var(--accent)' },
    statPriority:    ['volume', 'sessions', '1rm'],
    progressDefault: 'volume',
    programFilter:   'volumen',
    todayHint:       'Lleva cada serie cerca del fallo.',
    restMessage:     '2 minutos. Suficiente para recuperarte, no tanto para enfriarte.',
    bodyGoal:        true,
  },
  bajar_grasa: {
    restTimer:       75,
    repRange:        { label: 'Resistencia metabólica', range: '12–20', color: 'var(--green)' },
    statPriority:    ['sessions', 'volume', 'bodyweight'],
    progressDefault: 'bodyweight',
    programFilter:   'definicion',
    todayHint:       'Consistencia > intensidad. Aparece cada día.',
    restMessage:     'Descansos cortos = más calorías quemadas.',
    bodyGoal:        true,
  },
  mantenimiento: {
    restTimer:       90,
    repRange:        { label: 'Mantenimiento', range: '10–15', color: 'var(--text2)' },
    statPriority:    ['sessions', 'volume', '1rm'],
    progressDefault: 'volume',
    programFilter:   'definicion',
    todayHint:       'Mantener es también progresar.',
    restMessage:     '90 segundos. Equilibrio entre fuerza y resistencia.',
    bodyGoal:        true,
  },
  // Legacy support
  definicion: {
    restTimer:       75,
    repRange:        { label: 'Resistencia', range: '12–20', color: 'var(--green)' },
    statPriority:    ['sessions', 'volume', 'bodyweight'],
    progressDefault: 'bodyweight',
    programFilter:   'definicion',
    todayHint:       'Consistencia > intensidad. Aparece cada día.',
    restMessage:     'Descansos cortos = más calorías quemadas.',
    bodyGoal:        true,
  },
}

export const LEVEL_CONFIG = {
  principiante: {
    defaultSets:       3,
    defaultReps:       10,
    showFormTips:      true,
    exerciseFilter:    'principiante',
    programComplexity: 'simple',
    freqHint:          '3 días/semana recomendados',
  },
  intermedio: {
    defaultSets:       4,
    defaultReps:       8,
    showFormTips:      false,
    exerciseFilter:    'principiante|intermedio',
    programComplexity: 'moderate',
    freqHint:          '4 días/semana recomendados',
  },
  avanzado: {
    defaultSets:       4,
    defaultReps:       6,
    showFormTips:      false,
    exerciseFilter:    'all',
    programComplexity: 'advanced',
    freqHint:          '5–6 días/semana recomendados',
  },
}

// Personalization — run once after onboarding completes
export function personalizeFromOnboarding(level, goal, store) {
  // Map new goal ids to program filter tags
  const goalToProgram = {
    fuerza:        'fuerza',
    volumen:       'volumen',
    bajar_grasa:   'definicion',
    mantenimiento: 'definicion',
    definicion:    'definicion',
  }
  const programGoal = goalToProgram[goal] || goal

  // 1. Find the best matching preset
  const match =
    PRESET_PROGRAMS.find(p => p.level === level && p.goal === programGoal) ||
    PRESET_PROGRAMS.find(p => p.goal === programGoal) ||
    PRESET_PROGRAMS.find(p => p.id === 'preset-ppl-volume')

  if (match) {
    const userCopy = {
      ...match,
      id: `user-${Date.now()}`,
      isPreset: false,
      presetId: match.id,
      createdAt: new Date().toISOString(),
    }
    store.addProgram(userCopy)
    store.setActiveProgram(userCopy.id)
  }

  // 2. Rest timer + rep range by goal
  const cfg = GOAL_CONFIG[goal] || GOAL_CONFIG['volumen']
  store.updateSettings({
    restTimerDefault:    cfg.restTimer,
    repRangeGuidance:    cfg.repRange,
    progressDefaultChart: cfg.progressDefault,
  })
}

// Returns the preset that best matches user's level + goal (for "Para ti" badge)
export function getRecommendedPreset(level, goal) {
  const goalToProgram = {
    fuerza: 'fuerza', volumen: 'volumen',
    bajar_grasa: 'definicion', mantenimiento: 'definicion', definicion: 'definicion',
  }
  const programGoal = goalToProgram[goal] || goal
  return (
    PRESET_PROGRAMS.find(p => p.level === level && p.goal === programGoal) ||
    PRESET_PROGRAMS.find(p => p.goal === programGoal) ||
    null
  )
}
