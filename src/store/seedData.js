import { subDays, subWeeks, format } from 'date-fns'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function dateStr(d) {
  return d.toISOString()
}

const now = new Date()

// ─── PROGRAMS ───────────────────────────────────────────────────────────────

export const SEED_PROGRAMS = [
  {
    id: 'ppl',
    name: 'PPL (Push Pull Legs)',
    description: 'Programa clásico de 6 días: Push, Pull y Legs dos veces por semana.',
    totalWeeks: 12,
    days: [
      {
        id: 'ppl-push-a', name: 'Push A', templateId: 'push-a',
        muscles: ['chest', 'shoulders', 'arms'],
      },
      {
        id: 'ppl-pull-a', name: 'Pull A', templateId: 'pull-a',
        muscles: ['back', 'arms'],
      },
      {
        id: 'ppl-legs-a', name: 'Legs A', templateId: 'legs-a',
        muscles: ['legs', 'core'],
      },
      {
        id: 'ppl-push-b', name: 'Push B', templateId: 'push-b',
        muscles: ['chest', 'shoulders', 'arms'],
      },
      {
        id: 'ppl-pull-b', name: 'Pull B', templateId: 'pull-b',
        muscles: ['back', 'arms'],
      },
      {
        id: 'ppl-legs-b', name: 'Legs B', templateId: 'legs-b',
        muscles: ['legs', 'core'],
      },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower Split',
    description: 'Cuatro días de entrenamiento alternando tren superior e inferior.',
    totalWeeks: 8,
    days: [
      { id: 'ul-upper-a', name: 'Upper A', templateId: 'upper-a', muscles: ['chest', 'back', 'shoulders', 'arms'] },
      { id: 'ul-lower-a', name: 'Lower A', templateId: 'lower-a', muscles: ['legs', 'core'] },
      { id: 'ul-upper-b', name: 'Upper B', templateId: 'upper-b', muscles: ['chest', 'back', 'shoulders', 'arms'] },
      { id: 'ul-lower-b', name: 'Lower B', templateId: 'lower-b', muscles: ['legs', 'core'] },
    ],
  },
  {
    id: 'fullbody',
    name: 'Full Body 3x',
    description: 'Tres sesiones semanales de cuerpo completo. Ideal para maximizar frecuencia.',
    totalWeeks: 6,
    days: [
      { id: 'fb-a', name: 'Full Body A', templateId: 'fullbody-a', muscles: ['chest', 'back', 'legs', 'shoulders'] },
      { id: 'fb-b', name: 'Full Body B', templateId: 'fullbody-b', muscles: ['chest', 'back', 'legs', 'arms'] },
      { id: 'fb-c', name: 'Full Body C', templateId: 'fullbody-c', muscles: ['back', 'legs', 'shoulders', 'core'] },
    ],
  },
]

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

export const SEED_TEMPLATES = [
  {
    id: 'push-a',
    name: 'Push A',
    muscles: ['chest', 'shoulders', 'arms'],
    notes: 'Énfasis en press banca y hombros.',
    exercises: [
      { exerciseId: 'bench', sets: 4, reps: 5, weight: 90 },
      { exerciseId: 'incline-bench', sets: 3, reps: 8, weight: 72.5 },
      { exerciseId: 'db-ohp', sets: 3, reps: 10, weight: 28 },
      { exerciseId: 'lateral-raise', sets: 3, reps: 15, weight: 14 },
      { exerciseId: 'tricep-pushdown', sets: 3, reps: 12, weight: 32.5 },
      { exerciseId: 'skull-crusher', sets: 3, reps: 10, weight: 40 },
    ],
  },
  {
    id: 'pull-a',
    name: 'Pull A',
    muscles: ['back', 'arms'],
    notes: 'Dominadas y remo barra como movimientos principales.',
    exercises: [
      { exerciseId: 'pullup', sets: 4, reps: 8, weight: 0 },
      { exerciseId: 'barbell-row', sets: 4, reps: 6, weight: 80 },
      { exerciseId: 'lat-pulldown', sets: 3, reps: 10, weight: 70 },
      { exerciseId: 'cable-row', sets: 3, reps: 10, weight: 65 },
      { exerciseId: 'face-pull', sets: 3, reps: 15, weight: 25 },
      { exerciseId: 'db-curl', sets: 3, reps: 12, weight: 18 },
      { exerciseId: 'hammer-curl', sets: 3, reps: 12, weight: 18 },
    ],
  },
  {
    id: 'legs-a',
    name: 'Legs A',
    muscles: ['legs', 'core'],
    notes: 'Sentadilla y peso muerto rumano como base.',
    exercises: [
      { exerciseId: 'squat', sets: 5, reps: 5, weight: 120 },
      { exerciseId: 'rdl', sets: 3, reps: 8, weight: 100 },
      { exerciseId: 'leg-press', sets: 3, reps: 12, weight: 180 },
      { exerciseId: 'leg-curl', sets: 3, reps: 12, weight: 55 },
      { exerciseId: 'calf-raise', sets: 4, reps: 15, weight: 80 },
      { exerciseId: 'plank', sets: 3, reps: 60, weight: 0 },
    ],
  },
  {
    id: 'push-b',
    name: 'Push B',
    muscles: ['chest', 'shoulders', 'arms'],
    notes: 'Énfasis en press inclinado y hombros.',
    exercises: [
      { exerciseId: 'ohp', sets: 4, reps: 5, weight: 65 },
      { exerciseId: 'incline-bench', sets: 4, reps: 8, weight: 75 },
      { exerciseId: 'cable-fly', sets: 3, reps: 12, weight: 20 },
      { exerciseId: 'arnold-press', sets: 3, reps: 10, weight: 24 },
      { exerciseId: 'lateral-raise', sets: 4, reps: 15, weight: 14 },
      { exerciseId: 'overhead-tri', sets: 3, reps: 12, weight: 28 },
    ],
  },
  {
    id: 'pull-b',
    name: 'Pull B',
    muscles: ['back', 'arms'],
    notes: 'Peso muerto y remo como base.',
    exercises: [
      { exerciseId: 'deadlift', sets: 3, reps: 5, weight: 150 },
      { exerciseId: 'db-row', sets: 4, reps: 8, weight: 45 },
      { exerciseId: 't-bar-row', sets: 3, reps: 10, weight: 70 },
      { exerciseId: 'lat-pulldown', sets: 3, reps: 12, weight: 72.5 },
      { exerciseId: 'preacher-curl', sets: 3, reps: 10, weight: 35 },
      { exerciseId: 'incline-curl', sets: 3, reps: 12, weight: 16 },
    ],
  },
  {
    id: 'legs-b',
    name: 'Legs B',
    muscles: ['legs', 'core'],
    notes: 'Hack squat y hip thrust.',
    exercises: [
      { exerciseId: 'hack-squat', sets: 4, reps: 8, weight: 120 },
      { exerciseId: 'hip-thrust', sets: 4, reps: 10, weight: 130 },
      { exerciseId: 'bulgarian', sets: 3, reps: 10, weight: 30 },
      { exerciseId: 'leg-extension', sets: 3, reps: 15, weight: 60 },
      { exerciseId: 'leg-curl', sets: 3, reps: 12, weight: 55 },
      { exerciseId: 'hanging-leg-raise', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    id: 'upper-a',
    name: 'Upper A',
    muscles: ['chest', 'back', 'shoulders', 'arms'],
    notes: 'Tren superior con énfasis en fuerza.',
    exercises: [
      { exerciseId: 'bench', sets: 4, reps: 6, weight: 92.5 },
      { exerciseId: 'barbell-row', sets: 4, reps: 6, weight: 82.5 },
      { exerciseId: 'ohp', sets: 3, reps: 8, weight: 62.5 },
      { exerciseId: 'pullup', sets: 3, reps: 8, weight: 0 },
      { exerciseId: 'lateral-raise', sets: 3, reps: 15, weight: 14 },
      { exerciseId: 'bicep-curl', sets: 3, reps: 10, weight: 40 },
      { exerciseId: 'skull-crusher', sets: 3, reps: 10, weight: 42.5 },
    ],
  },
  {
    id: 'lower-a',
    name: 'Lower A',
    muscles: ['legs', 'core'],
    notes: 'Tren inferior con énfasis en fuerza.',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: 5, weight: 122.5 },
      { exerciseId: 'deadlift', sets: 3, reps: 5, weight: 152.5 },
      { exerciseId: 'leg-press', sets: 3, reps: 10, weight: 185 },
      { exerciseId: 'leg-curl', sets: 3, reps: 12, weight: 57.5 },
      { exerciseId: 'calf-raise', sets: 4, reps: 15, weight: 85 },
    ],
  },
  {
    id: 'upper-b',
    name: 'Upper B',
    muscles: ['chest', 'back', 'shoulders', 'arms'],
    notes: 'Tren superior con énfasis en hipertrofia.',
    exercises: [
      { exerciseId: 'incline-bench', sets: 4, reps: 10, weight: 72.5 },
      { exerciseId: 'lat-pulldown', sets: 4, reps: 10, weight: 72.5 },
      { exerciseId: 'db-ohp', sets: 3, reps: 12, weight: 28 },
      { exerciseId: 'cable-row', sets: 3, reps: 12, weight: 67.5 },
      { exerciseId: 'cable-fly', sets: 3, reps: 15, weight: 20 },
      { exerciseId: 'face-pull', sets: 3, reps: 20, weight: 27.5 },
      { exerciseId: 'db-curl', sets: 3, reps: 15, weight: 16 },
    ],
  },
  {
    id: 'lower-b',
    name: 'Lower B',
    muscles: ['legs', 'core'],
    notes: 'Tren inferior con énfasis en hipertrofia.',
    exercises: [
      { exerciseId: 'rdl', sets: 4, reps: 10, weight: 102.5 },
      { exerciseId: 'hip-thrust', sets: 4, reps: 12, weight: 132.5 },
      { exerciseId: 'leg-extension', sets: 3, reps: 15, weight: 62.5 },
      { exerciseId: 'leg-curl', sets: 3, reps: 15, weight: 52.5 },
      { exerciseId: 'bulgarian', sets: 3, reps: 12, weight: 28 },
      { exerciseId: 'cable-crunch', sets: 3, reps: 15, weight: 40 },
    ],
  },
  {
    id: 'fullbody-a',
    name: 'Full Body A',
    muscles: ['chest', 'back', 'legs', 'shoulders'],
    notes: 'Cuerpo completo con movimientos compuestos principales.',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: 5, weight: 120 },
      { exerciseId: 'bench', sets: 4, reps: 5, weight: 90 },
      { exerciseId: 'barbell-row', sets: 4, reps: 5, weight: 80 },
      { exerciseId: 'ohp', sets: 3, reps: 8, weight: 62.5 },
      { exerciseId: 'rdl', sets: 3, reps: 8, weight: 100 },
    ],
  },
  {
    id: 'fullbody-b',
    name: 'Full Body B',
    muscles: ['chest', 'back', 'legs', 'arms'],
    notes: 'Cuerpo completo con variantes secundarias.',
    exercises: [
      { exerciseId: 'deadlift', sets: 3, reps: 5, weight: 150 },
      { exerciseId: 'incline-bench', sets: 4, reps: 8, weight: 72.5 },
      { exerciseId: 'pullup', sets: 4, reps: 8, weight: 0 },
      { exerciseId: 'leg-press', sets: 3, reps: 12, weight: 180 },
      { exerciseId: 'db-curl', sets: 3, reps: 12, weight: 18 },
      { exerciseId: 'tricep-pushdown', sets: 3, reps: 12, weight: 30 },
    ],
  },
  {
    id: 'fullbody-c',
    name: 'Full Body C',
    muscles: ['back', 'legs', 'shoulders', 'core'],
    notes: 'Cuerpo completo con énfasis posterior.',
    exercises: [
      { exerciseId: 'hack-squat', sets: 4, reps: 8, weight: 120 },
      { exerciseId: 'db-row', sets: 4, reps: 10, weight: 44 },
      { exerciseId: 'hip-thrust', sets: 4, reps: 10, weight: 130 },
      { exerciseId: 'lateral-raise', sets: 4, reps: 15, weight: 14 },
      { exerciseId: 'face-pull', sets: 3, reps: 15, weight: 25 },
      { exerciseId: 'plank', sets: 3, reps: 60, weight: 0 },
    ],
  },
]

// ─── SESSION GENERATOR ────────────────────────────────────────────────────────

function makeSet(weight, reps, completed = true) {
  return { id: uid(), weight, reps, completed }
}

function makeExercise(exerciseId, sets) {
  return { id: uid(), exerciseId, sets }
}

function variance(base, pct = 0.03) {
  return base * (1 + (Math.random() - 0.5) * pct * 2)
}

// Generate 6 weeks of realistic sessions
export function generateSeedSessions() {
  const sessions = []

  // PPL rotation: Push Mon, Pull Tue, Legs Wed, rest Thu, Push Fri, Pull Sat, rest Sun
  // Week 1-6 ago with progressive overload

  const squatBase = 115
  const benchBase = 87.5
  const deadliftBase = 147.5
  const ohpBase = 60
  const rowBase = 77.5

  for (let week = 6; week >= 1; week--) {
    const prog = (7 - week) / 6 // 0 = 6 weeks ago, 1 = this week
    const squat = squatBase + prog * 7.5
    const bench = benchBase + prog * 5
    const dead = deadliftBase + prog * 10
    const ohp = ohpBase + prog * 2.5
    const row = rowBase + prog * 5

    const weekStart = subWeeks(now, week - 1)
    // Mon
    const mon = new Date(weekStart)
    mon.setDate(weekStart.getDate() - weekStart.getDay() + 1)

    const sessionDays = [
      { offset: 0, templateId: 'push-a', programId: 'ppl', name: 'Push A' },
      { offset: 1, templateId: 'pull-a', programId: 'ppl', name: 'Pull A' },
      { offset: 2, templateId: 'legs-a', programId: 'ppl', name: 'Legs A' },
      { offset: 4, templateId: 'push-b', programId: 'ppl', name: 'Push B' },
      { offset: 5, templateId: 'pull-b', programId: 'ppl', name: 'Pull B' },
    ]

    // Skip some days for realism (about 80% completion)
    for (const sd of sessionDays) {
      if (week === 1 && sd.offset >= 5) continue // don't log future days
      if (Math.random() < 0.15) continue // 15% skip

      const sessionDate = new Date(mon)
      sessionDate.setDate(mon.getDate() + sd.offset)
      if (sessionDate > now) continue

      sessionDate.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0)

      let exercises = []

      if (sd.templateId === 'push-a') {
        exercises = [
          makeExercise('bench', [
            makeSet(bench, 5), makeSet(bench, 5), makeSet(bench, 4), makeSet(bench, 4),
          ]),
          makeExercise('incline-bench', [
            makeSet(bench * 0.8, 8), makeSet(bench * 0.8, 8), makeSet(bench * 0.8, 7),
          ]),
          makeExercise('db-ohp', [
            makeSet(28, 10), makeSet(28, 10), makeSet(28, 9),
          ]),
          makeExercise('lateral-raise', [
            makeSet(14, 15), makeSet(14, 15), makeSet(14, 14),
          ]),
          makeExercise('tricep-pushdown', [
            makeSet(32.5, 12), makeSet(32.5, 12), makeSet(32.5, 10),
          ]),
        ]
      } else if (sd.templateId === 'pull-a') {
        exercises = [
          makeExercise('pullup', [
            makeSet(0, Math.round(7 + prog * 3)), makeSet(0, Math.round(7 + prog * 2)),
            makeSet(0, Math.round(6 + prog * 2)), makeSet(0, Math.round(5 + prog * 2)),
          ]),
          makeExercise('barbell-row', [
            makeSet(row, 6), makeSet(row, 6), makeSet(row, 5), makeSet(row, 5),
          ]),
          makeExercise('lat-pulldown', [
            makeSet(70, 10), makeSet(70, 10), makeSet(70, 9),
          ]),
          makeExercise('db-curl', [
            makeSet(18, 12), makeSet(18, 12), makeSet(18, 10),
          ]),
        ]
      } else if (sd.templateId === 'legs-a') {
        exercises = [
          makeExercise('squat', [
            makeSet(squat, 5), makeSet(squat, 5), makeSet(squat, 5),
            makeSet(squat, 4), makeSet(squat, 4),
          ]),
          makeExercise('rdl', [
            makeSet(squat * 0.85, 8), makeSet(squat * 0.85, 8), makeSet(squat * 0.85, 7),
          ]),
          makeExercise('leg-press', [
            makeSet(180, 12), makeSet(180, 12), makeSet(180, 10),
          ]),
          makeExercise('calf-raise', [
            makeSet(80, 15), makeSet(80, 15), makeSet(80, 15), makeSet(80, 12),
          ]),
        ]
      } else if (sd.templateId === 'push-b') {
        exercises = [
          makeExercise('ohp', [
            makeSet(ohp, 5), makeSet(ohp, 5), makeSet(ohp, 4), makeSet(ohp, 4),
          ]),
          makeExercise('incline-bench', [
            makeSet(bench * 0.82, 8), makeSet(bench * 0.82, 8),
            makeSet(bench * 0.82, 7), makeSet(bench * 0.82, 7),
          ]),
          makeExercise('cable-fly', [
            makeSet(20, 12), makeSet(20, 12), makeSet(20, 12),
          ]),
          makeExercise('lateral-raise', [
            makeSet(14, 15), makeSet(14, 15), makeSet(16, 12), makeSet(16, 10),
          ]),
        ]
      } else if (sd.templateId === 'pull-b') {
        exercises = [
          makeExercise('deadlift', [
            makeSet(dead, 5), makeSet(dead, 5), makeSet(dead, 4),
          ]),
          makeExercise('db-row', [
            makeSet(45, 8), makeSet(45, 8), makeSet(45, 8), makeSet(45, 7),
          ]),
          makeExercise('lat-pulldown', [
            makeSet(72.5, 10), makeSet(72.5, 10), makeSet(72.5, 9),
          ]),
          makeExercise('preacher-curl', [
            makeSet(35, 10), makeSet(35, 10), makeSet(35, 8),
          ]),
        ]
      }

      const totalVolume = exercises.reduce((t, ex) =>
        t + ex.sets.reduce((s, set) => s + (set.completed ? set.weight * set.reps : 0), 0), 0
      )
      const duration = 3000 + Math.floor(Math.random() * 1800)

      sessions.push({
        id: uid(),
        templateId: sd.templateId,
        programId: sd.programId,
        name: sd.name,
        date: sessionDate.toISOString(),
        duration,
        exercises,
        totalVolume: Math.round(totalVolume),
        notes: '',
        muscles: TEMPLATE_MUSCLES[sd.templateId] || [],
      })
    }
  }

  return sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
}

const TEMPLATE_MUSCLES = {
  'push-a': ['chest', 'shoulders', 'arms'],
  'pull-a': ['back', 'arms'],
  'legs-a': ['legs', 'core'],
  'push-b': ['chest', 'shoulders', 'arms'],
  'pull-b': ['back', 'arms'],
  'legs-b': ['legs', 'core'],
  'upper-a': ['chest', 'back', 'shoulders', 'arms'],
  'lower-a': ['legs', 'core'],
  'upper-b': ['chest', 'back', 'shoulders', 'arms'],
  'lower-b': ['legs', 'core'],
  'fullbody-a': ['chest', 'back', 'legs', 'shoulders'],
  'fullbody-b': ['chest', 'back', 'legs', 'arms'],
  'fullbody-c': ['back', 'legs', 'shoulders', 'core'],
}

// ─── PRs ──────────────────────────────────────────────────────────────────────

export function computePRsFromSessions(sessions) {
  return computePRsSync(sessions)
}

export function computePRsSync(sessions) {
  const prs = {}
  sessions.forEach(session => {
    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (!set.completed || !set.weight || !set.reps) return
        const reps = Math.min(set.reps, 36)
        const e1rm = reps === 1 ? set.weight : set.weight * 36 / (37 - reps)
        const key = ex.exerciseId
        if (!prs[key] || e1rm > prs[key].e1rm) {
          prs[key] = { weight: set.weight, reps: set.reps, date: session.date, e1rm }
        }
      })
    })
  })
  return prs
}

// ─── BODY METRICS ─────────────────────────────────────────────────────────────

export function generateBodyMetrics() {
  const metrics = []
  const baseWeight = 82
  for (let i = 28; i >= 0; i--) {
    if (i % 2 !== 0) continue
    const d = subDays(now, i)
    d.setHours(8, 0, 0, 0)
    const weight = baseWeight + (Math.random() - 0.5) * 1.5 + (28 - i) * 0.02
    metrics.push({
      id: uid(),
      date: d.toISOString(),
      weight: Math.round(weight * 10) / 10,
      bodyFat: null,
    })
  }
  return metrics
}
