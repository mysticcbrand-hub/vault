import useStore from '../store/index.js'
import { computeE1RM } from '../utils/oneRepMax.js'

export function usePRDetection() {
  const prs = useStore(s => s.prs)

  const checkIsPR = (exerciseId, weight, reps) => {
    if (!exerciseId || !weight || !reps) return false
    const w = parseFloat(weight)
    const r = parseInt(reps)
    if (!w || !r) return false
    const e1rm = r === 1 ? w : w * 36 / (37 - Math.min(r, 36))
    const current = prs[exerciseId]
    return !current || e1rm > current.e1rm
  }

  const getExercisePR = (exerciseId) => prs[exerciseId] || null

  return { checkIsPR, getExercisePR, prs }
}
