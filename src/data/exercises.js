export const EXERCISES = [
  // CHEST
  { id: 'bench', name: 'Press Banca', muscle: 'chest', equipment: 'barbell' },
  { id: 'incline-bench', name: 'Press Banca Inclinado', muscle: 'chest', equipment: 'barbell' },
  { id: 'decline-bench', name: 'Press Banca Declinado', muscle: 'chest', equipment: 'barbell' },
  { id: 'db-fly', name: 'Apertura Mancuernas', muscle: 'chest', equipment: 'dumbbell' },
  { id: 'cable-fly', name: 'Cruces Polea', muscle: 'chest', equipment: 'cable' },
  { id: 'chest-dip', name: 'Fondos Pecho', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'pushup', name: 'Flexiones', muscle: 'chest', equipment: 'bodyweight' },
  // BACK
  { id: 'pullup', name: 'Dominadas', muscle: 'back', equipment: 'bodyweight' },
  { id: 'barbell-row', name: 'Remo Barra', muscle: 'back', equipment: 'barbell' },
  { id: 'db-row', name: 'Remo Mancuerna', muscle: 'back', equipment: 'dumbbell' },
  { id: 'cable-row', name: 'Remo Polea Baja', muscle: 'back', equipment: 'cable' },
  { id: 'lat-pulldown', name: 'Jalón al Pecho', muscle: 'back', equipment: 'cable' },
  { id: 'face-pull', name: 'Face Pull', muscle: 'back', equipment: 'cable' },
  { id: 'deadlift', name: 'Peso Muerto', muscle: 'back', equipment: 'barbell' },
  { id: 'rack-pull', name: 'Rack Pull', muscle: 'back', equipment: 'barbell' },
  { id: 't-bar-row', name: 'Remo T-Bar', muscle: 'back', equipment: 'barbell' },
  // SHOULDERS
  { id: 'ohp', name: 'Press Militar', muscle: 'shoulders', equipment: 'barbell' },
  { id: 'db-ohp', name: 'Press Hombro Mancuernas', muscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Elevaciones Laterales', muscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'front-raise', name: 'Elevaciones Frontales', muscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'upright-row', name: 'Remo al Mentón', muscle: 'shoulders', equipment: 'barbell' },
  { id: 'arnold-press', name: 'Press Arnold', muscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'shrug', name: 'Encogimientos', muscle: 'shoulders', equipment: 'barbell' },
  // ARMS
  { id: 'bicep-curl', name: 'Curl Bíceps', muscle: 'arms', equipment: 'barbell' },
  { id: 'db-curl', name: 'Curl Mancuerna', muscle: 'arms', equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Curl Martillo', muscle: 'arms', equipment: 'dumbbell' },
  { id: 'preacher-curl', name: 'Curl Predicador', muscle: 'arms', equipment: 'cable' },
  { id: 'incline-curl', name: 'Curl Inclinado', muscle: 'arms', equipment: 'dumbbell' },
  { id: 'tricep-pushdown', name: 'Extensión Tríceps Polea', muscle: 'arms', equipment: 'cable' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscle: 'arms', equipment: 'barbell' },
  { id: 'overhead-tri', name: 'Extensión Tríceps Overhead', muscle: 'arms', equipment: 'dumbbell' },
  { id: 'tricep-dip', name: 'Fondos Tríceps', muscle: 'arms', equipment: 'bodyweight' },
  // LEGS
  { id: 'squat', name: 'Sentadilla', muscle: 'legs', equipment: 'barbell' },
  { id: 'front-squat', name: 'Sentadilla Frontal', muscle: 'legs', equipment: 'barbell' },
  { id: 'hack-squat', name: 'Hack Squat', muscle: 'legs', equipment: 'machine' },
  { id: 'leg-press', name: 'Prensa de Piernas', muscle: 'legs', equipment: 'machine' },
  { id: 'rdl', name: 'Peso Muerto Rumano', muscle: 'legs', equipment: 'barbell' },
  { id: 'leg-curl', name: 'Curl Femoral', muscle: 'legs', equipment: 'machine' },
  { id: 'leg-extension', name: 'Extensión Cuádriceps', muscle: 'legs', equipment: 'machine' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'legs', equipment: 'barbell' },
  { id: 'bulgarian', name: 'Zancada Búlgara', muscle: 'legs', equipment: 'dumbbell' },
  { id: 'calf-raise', name: 'Elevación Gemelos', muscle: 'legs', equipment: 'machine' },
  { id: 'nordic-curl', name: 'Nordic Curl', muscle: 'legs', equipment: 'bodyweight' },
  { id: 'good-morning', name: 'Buenos Días', muscle: 'legs', equipment: 'barbell' },
  // CORE
  { id: 'plank', name: 'Plancha', muscle: 'core', equipment: 'bodyweight' },
  { id: 'crunch', name: 'Crunch', muscle: 'core', equipment: 'bodyweight' },
  { id: 'russian-twist', name: 'Rotación Rusa', muscle: 'core', equipment: 'bodyweight' },
  { id: 'hanging-leg-raise', name: 'Elevación Piernas Colgado', muscle: 'core', equipment: 'bodyweight' },
  { id: 'cable-crunch', name: 'Crunch Polea', muscle: 'core', equipment: 'cable' },
  { id: 'ab-rollout', name: 'Rueda Abdominales', muscle: 'core', equipment: 'other' },
  { id: 'back-extension', name: 'Extensión Lumbar', muscle: 'core', equipment: 'machine' },
]

export const MUSCLE_COLORS = {
  chest:     { bg: '#1E3A5F', text: '#60A5FA', border: '#2563EB' },
  back:      { bg: '#2D1B69', text: '#A78BFA', border: '#7C3AED' },
  shoulders: { bg: '#0F3D3D', text: '#34D399', border: '#059669' },
  arms:      { bg: '#3D1F00', text: '#FB923C', border: '#EA580C' },
  legs:      { bg: '#3D0F0F', text: '#F87171', border: '#DC2626' },
  core:      { bg: '#3D3000', text: '#FCD34D', border: '#D97706' },
}

export const MUSCLE_NAMES = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  arms: 'Brazos',
  legs: 'Piernas',
  core: 'Core',
}

export const MUSCLE_EMOJIS = {
  chest: '💪',
  back: '🔙',
  shoulders: '🏋️',
  arms: '💪',
  legs: '🦵',
  core: '⚡',
}

export function getExerciseById(id) {
  return EXERCISES.find(e => e.id === id) || null
}

export function getExercisesByMuscle(muscle) {
  return EXERCISES.filter(e => e.muscle === muscle)
}
