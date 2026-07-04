// e1RM — delega en prEngine (única fuente de verdad). Mantiene API pública.
export { computeE1RM } from './prEngine.js'

export function brzycki(weight, reps) {
  if (!weight || !reps || reps <= 0 || reps > 36) return weight || 0
  if (reps === 1) return weight
  return weight * (36 / (37 - reps))
}

export function estimatedReps(oneRM, weight) {
  if (!oneRM || !weight || weight >= oneRM) return 1
  const reps = 37 - (36 * weight / oneRM)
  return Math.max(1, Math.round(reps))
}

export function formatOneRM(value) {
  if (!value) return '0'
  return Math.round(value * 10) / 10
}
