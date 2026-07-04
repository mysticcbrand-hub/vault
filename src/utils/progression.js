// ─────────────────────────────────────────────────────────────────────────────
// PROGRESIÓN — doble progresión, plateau y deload. Lógica determinista.
// ─────────────────────────────────────────────────────────────────────────────
import { getE1RMHistory } from './prEngine.js'
import { getMovement } from '../data/movementPatterns.js'

const DAY = 86400000

// Rango de reps por defecto según patrón (compuesto vs aislamiento)
export function defaultRepRange(exerciseId) {
  const { pattern } = getMovement(exerciseId)
  return pattern === 'iso' || pattern === 'core'
    ? { min: 8, max: 12 }
    : { min: 6, max: 10 }
}

// ── DOBLE PROGRESIÓN ─────────────────────────────────────────────────────────
// Si la última sesión completó el tope del rango con RIR ≥ 1 → subir carga.
// Si no → mantener carga y sumar 1 rep. RIR 0 (fallo) nunca dispara subida.
export function suggestProgression(sessions, exerciseId, opts = {}) {
  const { min: repMin, max: repMax } = opts.repRange || defaultRepRange(exerciseId)
  const increment = opts.increment ?? 2.5

  for (const s of sessions || []) {
    const ex = s.exercises?.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    const done = (ex.sets || []).filter(st =>
      st.completed && st.type !== 'dropset' &&
      (parseFloat(st.weight) || 0) > 0 && (parseInt(st.reps) || 0) > 0
    )
    if (!done.length) continue

    const topWeight = Math.max(...done.map(st => parseFloat(st.weight)))
    const topSets = done.filter(st => parseFloat(st.weight) === topWeight)
    const minReps = Math.min(...topSets.map(st => parseInt(st.reps)))
    const atFailure = topSets.some(st => st.rir === 0)

    if (minReps >= repMax && !atFailure) {
      return { type: 'load', weight: +(topWeight + increment).toFixed(1), reps: repMin }
    }
    return { type: 'reps', weight: topWeight, reps: Math.min(minReps + 1, repMax) }
  }
  return null
}

// ── PLATEAU ──────────────────────────────────────────────────────────────────
// Sin mejora de e1RM en ~2 mesociclos (56 días) con datos suficientes.
export function detectPlateau(sessions, exerciseId, { windowDays = 56, minSessions = 5 } = {}) {
  const hist = getE1RMHistory(sessions, exerciseId)
  if (hist.length < minSessions + 1) return null
  const cutoff = Date.now() - windowDays * DAY
  const recent = hist.filter(h => new Date(h.date).getTime() >= cutoff)
  const before = hist.filter(h => new Date(h.date).getTime() < cutoff)
  if (recent.length < minSessions || !before.length) return null
  const bestRecent = Math.max(...recent.map(h => h.e1rm))
  const bestBefore = Math.max(...before.map(h => h.e1rm))
  if (bestRecent <= bestBefore * 1.01) {
    return { windowDays, bestBefore: +bestBefore.toFixed(1), bestRecent: +bestRecent.toFixed(1), sessions: recent.length }
  }
  return null
}

// ── DELOAD ───────────────────────────────────────────────────────────────────
// RIR medio semanal en descenso sostenido y última semana rozando el fallo.
export function detectDeloadNeed(sessions, { weeks = 3 } = {}) {
  const now = Date.now()
  const weekly = []
  for (let i = 0; i < weeks; i++) {
    const end = now - i * 7 * DAY
    const start = end - 7 * DAY
    const rirs = []
    for (const s of sessions || []) {
      const t = new Date(s.date).getTime()
      if (t < start || t >= end) continue
      for (const ex of s.exercises || [])
        for (const st of ex.sets || [])
          if (st.completed && st.rir != null) rirs.push(st.rir)
    }
    if (rirs.length < 5) return null // datos insuficientes
    weekly.unshift(rirs.reduce((a, b) => a + b, 0) / rirs.length)
  }
  const descending = weekly.every((v, i) => i === 0 || v <= weekly[i - 1] + 0.1)
  const lastWeek = weekly[weekly.length - 1]
  if (descending && lastWeek <= 1) {
    return { weeklyAvgRIR: weekly.map(v => +v.toFixed(2)), lastWeek: +lastWeek.toFixed(2) }
  }
  return null
}
