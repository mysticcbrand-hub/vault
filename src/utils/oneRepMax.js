// Brzycki formula: weight × (36 / (37 - reps))
export function brzycki(weight, reps) {
  if (!weight || !reps || reps <= 0 || reps > 36) return weight || 0
  if (reps === 1) return weight
  return weight * (36 / (37 - reps))
}

export function computeE1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0
  if (reps === 1) return weight
  return weight * 36 / (37 - Math.min(reps, 36))
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
