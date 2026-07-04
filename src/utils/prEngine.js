// ─────────────────────────────────────────────────────────────────────────────
// PR ENGINE — única fuente de verdad para e1RM, PRs y su historial.
// Ningún componente debe reimplementar esta lógica.
// PR shape: { weight, reps, e1rm, date, repPRs: { [weight]: { reps, date } } }
// ─────────────────────────────────────────────────────────────────────────────

// Brzycki: w × 36/(37−reps). Cap a 36 reps para evitar división inestable.
export function computeE1RM(weight, reps) {
  const w = parseFloat(weight) || 0
  const r = parseInt(reps) || 0
  if (!w || r <= 0) return 0
  if (r === 1) return w
  return w * 36 / (37 - Math.min(r, 36))
}

// Evalúa un set contra un PR *previo* (snapshot antes de completar el set).
export function evaluateSet(weight, reps, pr) {
  const w = parseFloat(weight) || 0
  const r = parseInt(reps) || 0
  if (!w || !r) return { isE1rmPR: false, isRepPR: false, e1rm: 0 }
  const e1rm = computeE1RM(w, r)
  const isE1rmPR = e1rm > 0 && (!pr || e1rm > (pr.e1rm || 0))
  const prevRepsAtWeight = pr?.repPRs?.[String(w)]?.reps ?? 0
  const isRepPR = !isE1rmPR && r > prevRepsAtWeight
  return { isE1rmPR, isRepPR, e1rm }
}

// Aplica un set a un PR de forma inmutable. Devuelve el PR actualizado.
export function applySetToPR(pr, weight, reps, date) {
  const w = parseFloat(weight) || 0
  const r = parseInt(reps) || 0
  if (!w || !r) return pr
  const iso = date || new Date().toISOString()
  const { isE1rmPR, e1rm } = evaluateSet(w, r, pr)
  const repPRs = { ...(pr?.repPRs || {}) }
  const key = String(w)
  if (!repPRs[key] || r > repPRs[key].reps) repPRs[key] = { reps: r, date: iso }
  if (isE1rmPR) return { weight: w, reps: r, e1rm, date: iso, repPRs }
  return pr ? { ...pr, repPRs } : { weight: w, reps: r, e1rm, date: iso, repPRs }
}

// Reconstruye TODOS los PRs desde sessions (migración, deleteSession).
// Recorre en orden cronológico para que las fechas de PR sean correctas.
export function buildPRsFromSessions(sessions) {
  const prs = {}
  const ordered = [...(sessions || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
  for (const session of ordered) {
    for (const ex of session.exercises || []) {
      for (const set of ex.sets || []) {
        if (!set.completed) continue
        prs[ex.exerciseId] = applySetToPR(prs[ex.exerciseId], set.weight, set.reps, session.date)
      }
    }
  }
  return prs
}

// Mejor set (por e1RM) de una lista de sets completados.
export function bestCompletedSet(sets) {
  let best = null, bestE = 0
  for (const s of sets || []) {
    if (!s.completed) continue
    const e = computeE1RM(s.weight, s.reps)
    if (e > bestE) { bestE = e; best = { ...s, e1rm: e } }
  }
  return best
}

// Historial de e1RM por sesión para un ejercicio → [{ date, e1rm, weight, reps }]
// Derivado de sessions: una sola fuente de verdad, sin estado duplicado.
export function getE1RMHistory(sessions, exerciseId) {
  const out = []
  for (const session of sessions || []) {
    for (const ex of session.exercises || []) {
      if (ex.exerciseId !== exerciseId) continue
      const best = bestCompletedSet(ex.sets)
      if (best) out.push({ date: session.date, e1rm: best.e1rm, weight: parseFloat(best.weight) || 0, reps: parseInt(best.reps) || 0 })
    }
  }
  return out.sort((a, b) => new Date(a.date) - new Date(b.date))
}
