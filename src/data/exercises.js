export const EXERCISES = [
  // ── PECHO ──────────────────────────────────────────────────────
  { id: 'bench',          name: 'Press Banca',               muscle: 'chest',     equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'incline-bench',  name: 'Press Inclinado Barra',     muscle: 'chest',     equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'decline-bench',  name: 'Press Declinado Barra',     muscle: 'chest',     equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'db-bench',       name: 'Press Banca Mancuernas',    muscle: 'chest',     equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'db-incline',     name: 'Press Inclinado Mancuernas',muscle: 'chest',     equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'db-fly',         name: 'Aperturas Mancuernas',      muscle: 'chest',     equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'cable-fly-low',  name: 'Cruces Polea Baja',         muscle: 'chest',     equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'cable-fly-high', name: 'Cruces Polea Alta',         muscle: 'chest',     equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'chest-dip',      name: 'Fondos Pecho',              muscle: 'chest',     equipment: 'bodyweight', difficulty: 'intermedio'   },
  { id: 'pushup',         name: 'Flexiones',                 muscle: 'chest',     equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'pushup-wide',    name: 'Flexiones Agarre Ancho',    muscle: 'chest',     equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'pec-deck',       name: 'Pec Deck / Mariposa',       muscle: 'chest',     equipment: 'machine',    difficulty: 'principiante' },
  { id: 'chest-press-m',  name: 'Press Pecho Máquina',       muscle: 'chest',     equipment: 'machine',    difficulty: 'principiante' },
  { id: 'landmine-press', name: 'Landmine Press',            muscle: 'chest',     equipment: 'barbell',    difficulty: 'avanzado'     },

  // ── ESPALDA ────────────────────────────────────────────────────
  { id: 'deadlift',       name: 'Peso Muerto',               muscle: 'back',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'sumo-dl',        name: 'Peso Muerto Sumo',          muscle: 'back',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'rack-pull',      name: 'Rack Pull',                 muscle: 'back',      equipment: 'barbell',    difficulty: 'avanzado'     },
  { id: 'barbell-row',    name: 'Remo Barra',                muscle: 'back',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'pendlay-row',    name: 'Remo Pendlay',              muscle: 'back',      equipment: 'barbell',    difficulty: 'avanzado'     },
  { id: 't-bar-row',      name: 'Remo T-Bar',                muscle: 'back',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'db-row',         name: 'Remo Mancuerna',            muscle: 'back',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'chest-row',      name: 'Remo Pecho Apoyado',        muscle: 'back',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'cable-row',      name: 'Remo Polea Baja',           muscle: 'back',      equipment: 'cable',      difficulty: 'principiante' },
  { id: 'cable-row-wide', name: 'Remo Polea Agarre Ancho',   muscle: 'back',      equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'pullup',         name: 'Dominadas Pronadas',         muscle: 'back',      equipment: 'bodyweight', difficulty: 'intermedio'   },
  { id: 'chinup',         name: 'Dominadas Supinas',          muscle: 'back',      equipment: 'bodyweight', difficulty: 'intermedio'   },
  { id: 'lat-pulldown',   name: 'Jalón al Pecho',            muscle: 'back',      equipment: 'cable',      difficulty: 'principiante' },
  { id: 'lat-pull-wide',  name: 'Jalón Agarre Ancho',        muscle: 'back',      equipment: 'cable',      difficulty: 'principiante' },
  { id: 'straight-arm',   name: 'Pullover Polea',            muscle: 'back',      equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'face-pull',      name: 'Face Pull',                 muscle: 'back',      equipment: 'cable',      difficulty: 'principiante' },
  { id: 'seated-row-m',   name: 'Remo Máquina',              muscle: 'back',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'back-extension', name: 'Extensión Lumbar',          muscle: 'back',      equipment: 'machine',    difficulty: 'principiante' },

  // ── HOMBROS ────────────────────────────────────────────────────
  { id: 'ohp',             name: 'Press Militar Barra',       muscle: 'shoulders', equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'push-press',      name: 'Push Press',                muscle: 'shoulders', equipment: 'barbell',    difficulty: 'avanzado'     },
  { id: 'db-ohp',          name: 'Press Hombro Mancuernas',   muscle: 'shoulders', equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'arnold-press',    name: 'Press Arnold',              muscle: 'shoulders', equipment: 'dumbbell',   difficulty: 'intermedio'   },
  { id: 'lateral-raise',   name: 'Elevaciones Laterales',     muscle: 'shoulders', equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'cable-lateral',   name: 'Elevaciones Laterales Polea',muscle:'shoulders', equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'front-raise',     name: 'Elevaciones Frontales',     muscle: 'shoulders', equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'upright-row',     name: 'Remo al Mentón',            muscle: 'shoulders', equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'shrug',           name: 'Encogimientos Barra',       muscle: 'shoulders', equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'db-shrug',        name: 'Encogimientos Mancuernas',  muscle: 'shoulders', equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'machine-fly',     name: 'Pájaros Máquina',           muscle: 'shoulders', equipment: 'machine',    difficulty: 'principiante' },
  { id: 'shoulder-press-m',name: 'Press Hombro Máquina',      muscle: 'shoulders', equipment: 'machine',    difficulty: 'principiante' },

  // ── BRAZOS (Bíceps) ────────────────────────────────────────────
  { id: 'barbell-curl',  name: 'Curl Bíceps Barra',           muscle: 'arms',      equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'ez-curl',       name: 'Curl Barra EZ',               muscle: 'arms',      equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'db-curl',       name: 'Curl Mancuerna',              muscle: 'arms',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'hammer-curl',   name: 'Curl Martillo',               muscle: 'arms',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'incline-curl',  name: 'Curl Inclinado',              muscle: 'arms',      equipment: 'dumbbell',   difficulty: 'intermedio'   },
  { id: 'conc-curl',     name: 'Curl Concentrado',            muscle: 'arms',      equipment: 'dumbbell',   difficulty: 'intermedio'   },
  { id: 'preacher-curl', name: 'Curl Predicador',             muscle: 'arms',      equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'cable-curl',    name: 'Curl Polea Baja',             muscle: 'arms',      equipment: 'cable',      difficulty: 'principiante' },
  { id: 'spider-curl',   name: 'Spider Curl',                 muscle: 'arms',      equipment: 'barbell',    difficulty: 'avanzado'     },
  { id: 'cross-curl',    name: 'Curl Cruzado Polea',          muscle: 'arms',      equipment: 'cable',      difficulty: 'avanzado'     },

  // ── BRAZOS (Tríceps) ───────────────────────────────────────────
  { id: 'tricep-push',   name: 'Extensión Tríceps Polea',     muscle: 'arms',      equipment: 'cable',      difficulty: 'principiante' },
  { id: 'skull-crusher', name: 'Skull Crusher',               muscle: 'arms',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'ez-skull',      name: 'Skull Crusher EZ',            muscle: 'arms',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'overhead-tri',  name: 'Extensión Overhead',          muscle: 'arms',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'overhead-cable',name: 'Extensión Overhead Polea',    muscle: 'arms',      equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'tricep-dip',    name: 'Fondos Tríceps',              muscle: 'arms',      equipment: 'bodyweight', difficulty: 'intermedio'   },
  { id: 'close-bench',   name: 'Press Cerrado Barra',         muscle: 'arms',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'kickback',      name: 'Kickback Mancuerna',          muscle: 'arms',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'rope-pushdown', name: 'Polea Cuerda Tríceps',        muscle: 'arms',      equipment: 'cable',      difficulty: 'principiante' },

  // ── ANTEBRAZOS ─────────────────────────────────────────────────
  { id: 'wrist-curl',      name: 'Curl de Muñeca',            muscle: 'forearms',  equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'wrist-ext',       name: 'Extensión de Muñeca',       muscle: 'forearms',  equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'reverse-curl',    name: 'Curl Inverso',              muscle: 'forearms',  equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'reverse-curl-db', name: 'Curl Inverso Mancuerna',    muscle: 'forearms',  equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'hammer-forearm',  name: 'Curl Martillo Antebrazo',   muscle: 'forearms',  equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'farmer-carry',    name: 'Farmer Carry',              muscle: 'forearms',  equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'plate-pinch',     name: 'Pinch Grip Disco',          muscle: 'forearms',  equipment: 'other',      difficulty: 'intermedio'   },
  { id: 'dead-hang',       name: 'Dead Hang',                 muscle: 'forearms',  equipment: 'bodyweight', difficulty: 'principiante' },

  // ── PIERNAS ────────────────────────────────────────────────────
  { id: 'squat',         name: 'Sentadilla',                  muscle: 'legs',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'front-squat',   name: 'Sentadilla Frontal',          muscle: 'legs',      equipment: 'barbell',    difficulty: 'avanzado'     },
  { id: 'hack-squat',    name: 'Hack Squat',                  muscle: 'legs',      equipment: 'machine',    difficulty: 'intermedio'   },
  { id: 'goblet-squat',  name: 'Sentadilla Goblet',           muscle: 'legs',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'leg-press',     name: 'Prensa de Piernas',           muscle: 'legs',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'rdl',           name: 'Peso Muerto Rumano',          muscle: 'legs',      equipment: 'barbell',    difficulty: 'principiante' },
  { id: 'rdl-db',        name: 'Peso Muerto Rumano Mancuernas',muscle:'legs',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'leg-curl',      name: 'Curl Femoral Tumbado',        muscle: 'legs',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'leg-curl-seat', name: 'Curl Femoral Sentado',        muscle: 'legs',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'leg-ext',       name: 'Extensión de Cuádriceps',     muscle: 'legs',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'hip-thrust',    name: 'Hip Thrust',                  muscle: 'legs',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'hip-thrust-db', name: 'Hip Thrust Mancuerna',        muscle: 'legs',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'bulgarian',     name: 'Zancada Búlgara',             muscle: 'legs',      equipment: 'dumbbell',   difficulty: 'intermedio'   },
  { id: 'lunge',         name: 'Zancada',                     muscle: 'legs',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'nordic-curl',   name: 'Nordic Curl',                 muscle: 'legs',      equipment: 'bodyweight', difficulty: 'avanzado'     },
  { id: 'good-morning',  name: 'Buenos Días',                 muscle: 'legs',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'step-up',       name: 'Step Up',                     muscle: 'legs',      equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'sissy-squat',   name: 'Sissy Squat',                 muscle: 'legs',      equipment: 'bodyweight', difficulty: 'avanzado'     },
  { id: 'adductor-m',    name: 'Aductor Máquina',             muscle: 'legs',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'abductor-m',    name: 'Abductor Máquina',            muscle: 'legs',      equipment: 'machine',    difficulty: 'principiante' },
  { id: 'glute-kick',    name: 'Patada Glúteo Polea',         muscle: 'legs',      equipment: 'cable',      difficulty: 'principiante' },

  // ── GEMELOS ────────────────────────────────────────────────────
  { id: 'standing-calf',  name: 'Elevación Gemelos De Pie',   muscle: 'calves',    equipment: 'machine',    difficulty: 'principiante' },
  { id: 'seated-calf',    name: 'Elevación Gemelos Sentado',  muscle: 'calves',    equipment: 'machine',    difficulty: 'principiante' },
  { id: 'leg-press-calf', name: 'Gemelos en Prensa',          muscle: 'calves',    equipment: 'machine',    difficulty: 'principiante' },
  { id: 'db-calf',        name: 'Elevación Gemelos Mancuerna',muscle: 'calves',    equipment: 'dumbbell',   difficulty: 'principiante' },
  { id: 'tibia-raise',    name: 'Elevación Tibial',           muscle: 'calves',    equipment: 'bodyweight', difficulty: 'principiante' },

  // ── CORE ───────────────────────────────────────────────────────
  { id: 'plank',          name: 'Plancha',                    muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'side-plank',     name: 'Plancha Lateral',            muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'crunch',         name: 'Crunch',                     muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'cable-crunch',   name: 'Crunch Polea',               muscle: 'core',      equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'russian-twist',  name: 'Rotación Rusa',              muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'hanging-raise',  name: 'Elevación Piernas Colgado',  muscle: 'core',      equipment: 'bodyweight', difficulty: 'intermedio'   },
  { id: 'ab-wheel',       name: 'Rueda Abdominal',            muscle: 'core',      equipment: 'other',      difficulty: 'intermedio'   },
  { id: 'leg-raise',      name: 'Elevación Piernas Suelo',    muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'bicycle-crunch', name: 'Crunch Bicicleta',           muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
  { id: 'dragon-flag',    name: 'Dragon Flag',                muscle: 'core',      equipment: 'bodyweight', difficulty: 'avanzado'     },
  { id: 'pallof-press',   name: 'Pallof Press',               muscle: 'core',      equipment: 'cable',      difficulty: 'intermedio'   },
  { id: 'landmine-twist', name: 'Rotación Landmine',          muscle: 'core',      equipment: 'barbell',    difficulty: 'intermedio'   },
  { id: 'dead-bug',       name: 'Dead Bug',                   muscle: 'core',      equipment: 'bodyweight', difficulty: 'principiante' },
]

export const MUSCLE_NAMES = {
  chest:     'Pecho',
  back:      'Espalda',
  shoulders: 'Hombros',
  arms:      'Brazos',
  forearms:  'Antebrazos',
  legs:      'Piernas',
  calves:    'Gemelos',
  core:      'Core',
}

export const ALL_MUSCLES = ['chest','back','shoulders','arms','forearms','legs','calves','core']

export const MUSCLE_COLORS = {
  chest:     { bg: 'var(--chest-dim)',     text: 'var(--chest)',     border: 'rgba(232,146,74,0.35)'  },
  back:      { bg: 'var(--back-dim)',      text: 'var(--back)',      border: 'rgba(163,127,212,0.35)' },
  shoulders: { bg: 'var(--shoulders-dim)', text: 'var(--shoulders)', border: 'rgba(77,184,150,0.35)'  },
  arms:      { bg: 'var(--arms-dim)',      text: 'var(--arms)',      border: 'rgba(212,168,67,0.35)'  },
  forearms:  { bg: 'var(--forearms-dim)',  text: 'var(--forearms)',  border: 'rgba(126,184,160,0.35)' },
  legs:      { bg: 'var(--legs-dim)',      text: 'var(--legs)',      border: 'rgba(229,83,75,0.35)'   },
  calves:    { bg: 'var(--calves-dim)',    text: 'var(--calves)',    border: 'rgba(155,142,196,0.35)' },
  core:      { bg: 'var(--core-dim)',      text: 'var(--core)',      border: 'rgba(196,107,58,0.35)'  },
}

export function getExerciseById(id) {
  if (!id) return null
  // Check custom exercises first
  try {
    const custom = JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]')
    const found = custom.find(e => e.id === id)
    if (found) return found
  } catch (e) {}
  return EXERCISES.find(e => e.id === id) || null
}

export function getExercisesByMuscle(muscle) {
  return EXERCISES.filter(e => e.muscle === muscle)
}

export function getAllExercises() {
  try {
    const custom = JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]')
    return [...EXERCISES, ...custom]
  } catch (e) {
    return EXERCISES
  }
}
