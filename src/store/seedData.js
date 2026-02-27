export const SEED_PROGRAMS = [
  {
    id: 'ppl',
    name: 'PPL (Push Pull Legs)',
    description: 'Push, Pull, Legs — estructura clásica 3 días.',
    totalWeeks: 12,
    days: [
      { id: 'ppl-push', name: 'Push', templateId: 'push', muscles: ['chest','shoulders','arms'] },
      { id: 'ppl-pull', name: 'Pull', templateId: 'pull', muscles: ['back','arms'] },
      { id: 'ppl-legs', name: 'Legs', templateId: 'legs', muscles: ['legs','core'] },
    ],
  },
]

export const SEED_TEMPLATES = [
  {
    id: 'push',
    name: 'Push',
    muscles: ['chest','shoulders','arms'],
    notes: '',
    exercises: [
      { exerciseId: 'bench', sets: 4, reps: 8, weight: 0 },
      { exerciseId: 'incline-bench', sets: 3, reps: 10, weight: 0 },
      { exerciseId: 'db-ohp', sets: 3, reps: 10, weight: 0 },
      { exerciseId: 'lateral-raise', sets: 3, reps: 15, weight: 0 },
      { exerciseId: 'tricep-pushdown', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    id: 'pull',
    name: 'Pull',
    muscles: ['back','arms'],
    notes: '',
    exercises: [
      { exerciseId: 'pullup', sets: 4, reps: 8, weight: 0 },
      { exerciseId: 'barbell-row', sets: 4, reps: 8, weight: 0 },
      { exerciseId: 'lat-pulldown', sets: 3, reps: 10, weight: 0 },
      { exerciseId: 'face-pull', sets: 3, reps: 15, weight: 0 },
      { exerciseId: 'db-curl', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    id: 'legs',
    name: 'Legs',
    muscles: ['legs','core'],
    notes: '',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: 6, weight: 0 },
      { exerciseId: 'rdl', sets: 3, reps: 8, weight: 0 },
      { exerciseId: 'leg-press', sets: 3, reps: 12, weight: 0 },
      { exerciseId: 'leg-curl', sets: 3, reps: 12, weight: 0 },
      { exerciseId: 'calf-raise', sets: 3, reps: 15, weight: 0 },
    ],
  },
]
