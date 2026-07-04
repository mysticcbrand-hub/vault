// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS V2 — agregados por ventana temporal, volumen fraccional por músculo,
// adherencia, RIR y tendencias por patrón de movimiento.
// ─────────────────────────────────────────────────────────────────────────────
import { bestCompletedSet } from './prEngine.js'
import { getMovement, PATTERNS, TRACKABLE_PATTERNS } from '../data/movementPatterns.js'
import { getExerciseById } from '../data/exercises.js'
import { detectPlateau } from './progression.js'

const DAY = 86400000

export const WINDOWS = [
  { id: 'week',  days: 7,   label: 'S'  },
  { id: 'month', days: 30,  label: 'M'  },
  { id: 'half',  days: 182, label: '6M' },
  { id: 'year',  days: 365, label: 'A'  },
]

// Landmarks de volumen semanal por músculo [MEV, MRV] — aprox. Israetel (sets/semana)
export const VOLUME_LANDMARKS = {
  chest: [8, 22], back: [10, 25], shoulders: [8, 26], arms: [8, 26],
  forearms: [4, 20], legs: [8, 27], calves: [8, 20], core: [4, 25],
}

export function sessionsInWindow(sessions, days) {
  const cutoff = Date.now() - days * DAY
  return (sessions || []).filter(s => new Date(s.date).getTime() >= cutoff)
}

// Sets fraccionales de UNA sesión: 1 al músculo primario, +0.5 a secundarios
export function fractionalMuscleSets(session) {
  const out = {}
  for (const ex of session.exercises || []) {
    const primary = getExerciseById(ex.exerciseId)?.muscle
    if (!primary) continue
    const { secondary } = getMovement(ex.exerciseId)
    const n = (ex.sets || []).filter(st => st.completed).length
    if (!n) continue
    out[primary] = (out[primary] || 0) + n
    for (const m of secondary) out[m] = (out[m] || 0) + n * 0.5
  }
  return out
}

// Media de sets/semana por músculo dentro de la ventana
export function avgWeeklyMuscleSets(sessions, days) {
  const inWin = sessionsInWindow(sessions, days)
  const totals = {}
  for (const s of inWin) {
    const f = fractionalMuscleSets(s)
    for (const m in f) totals[m] = (totals[m] || 0) + f[m]
  }
  const weeks = Math.max(days / 7, 1)
  const out = {}
  for (const m in totals) out[m] = +(totals[m] / weeks).toFixed(1)
  return out
}

// Adherencia: sesiones reales vs esperadas (target semanal del usuario o días del programa)
export function getAdherence(sessions, expectedPerWeek, days) {
  if (!expectedPerWeek) return null
  const done = sessionsInWindow(sessions, days).length
  const expected = Math.round(expectedPerWeek * (days / 7))
  if (!expected) return null
  return { done, expected, pct: Math.min(100, Math.round((done / expected) * 100)) }
}

// RIR medio de la ventana (solo sets con RIR registrado) + % de sets con dato
export function rirStats(sessions, days) {
  let sum = 0, n = 0, total = 0
  for (const s of sessionsInWindow(sessions, days)) {
    for (const ex of s.exercises || []) {
      for (const st of ex.sets || []) {
        if (!st.completed) continue
        total++
        if (st.rir != null) { sum += st.rir; n++ }
      }
    }
  }
  if (!n) return null
  return { avg: +(sum / n).toFixed(1), coverage: Math.round((n / total) * 100) }
}

// Volumen total (kg) de la ventana
export function totalVolume(sessions, days) {
  return sessionsInWindow(sessions, days).reduce((t, s) => t + (s.totalVolume || 0), 0)
}

// Media móvil 7d del peso corporal + delta vs 7d anteriores
export function bodyweightTrend(bodyMetrics) {
  const sorted = [...(bodyMetrics || [])]
    .filter(m => m.weight > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  if (!sorted.length) return null
  const now = Date.now()
  const win = (from, to) => sorted.filter(m => {
    const t = new Date(m.date).getTime()
    return t >= now - from * DAY && t < now - to * DAY
  })
  const last7 = win(7, 0), prev7 = win(14, 7)
  const avg = arr => arr.length ? arr.reduce((t, m) => t + m.weight, 0) / arr.length : null
  const a = avg(last7)
  if (a == null) return { avg7: sorted[0].weight, delta: null, samples: 1 }
  const p = avg(prev7)
  return { avg7: +a.toFixed(1), delta: p != null ? +(a - p).toFixed(1) : null, samples: last7.length }
}

// Tendencia de e1RM por patrón: mejor e1RM por semana dentro de la ventana
export function patternTrends(sessions, days) {
  const inWin = sessionsInWindow(sessions, days)
  const byPattern = {}
  for (const s of inWin) {
    const week = Math.floor((Date.now() - new Date(s.date).getTime()) / (7 * DAY))
    for (const ex of s.exercises || []) {
      const { pattern } = getMovement(ex.exerciseId)
      if (!TRACKABLE_PATTERNS.includes(pattern)) continue
      const best = bestCompletedSet(ex.sets)
      if (!best) continue
      byPattern[pattern] = byPattern[pattern] || {}
      byPattern[pattern][week] = Math.max(byPattern[pattern][week] || 0, best.e1rm)
    }
  }
  return Object.entries(byPattern).map(([pattern, weeksMap]) => {
    const points = Object.entries(weeksMap)
      .map(([w, e1rm]) => ({ week: +w, e1rm: +e1rm.toFixed(1) }))
      .sort((a, b) => b.week - a.week) // más antiguo primero
    const first = points[0]?.e1rm, last = points[points.length - 1]?.e1rm
    const delta = first && last ? +((last - first) / first * 100).toFixed(1) : 0
    return { pattern, label: PATTERNS[pattern], points, delta }
  }).filter(p => p.points.length >= 2)
    .sort((a, b) => b.points.length - a.points.length)
}

// Plateaus en los ejercicios más frecuentes del usuario
export function plateauInsights(sessions, maxResults = 3) {
  const freq = {}
  for (const s of sessionsInWindow(sessions, 90)) {
    for (const ex of s.exercises || []) {
      if ((ex.sets || []).some(st => st.completed)) freq[ex.exerciseId] = (freq[ex.exerciseId] || 0) + 1
    }
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const out = []
  for (const [exerciseId] of top) {
    const p = detectPlateau(sessions, exerciseId)
    if (p) out.push({ exerciseId, name: getExerciseById(exerciseId)?.name || exerciseId, ...p })
    if (out.length >= maxResults) break
  }
  return out
}
