// ─── Rest time profiles for Smart Rest Timer ─────────────────────────────────
// Classifies every exercise by recovery demand, then picks the right rest time
// based on the weight used relative to the user's estimated 1RM.

const HEAVY_COMPOUNDS = new Set([
  'deadlift', 'sumo-dl', 'rack-pull',
  'squat', 'front-squat', 'hack-squat',
  'bench', 'ohp', 'push-press',
  'pendlay-row', 'barbell-row', 't-bar-row',
  'landmine-press',
])

const MODERATE_COMPOUNDS = new Set([
  'db-bench', 'incline-bench', 'decline-bench',
  'db-ohp', 'arnold-press',
  'db-row', 'chest-row', 'cable-row',
  'pullup', 'chinup', 'lat-pulldown',
  'hip-thrust', 'rdl', 'bulgarian',
  'leg-press', 'good-morning', 'nordic-curl',
  'dips', 'cable-fly', 'pec-deck',
  'face-pull', 'upright-row', 'shrug',
  'glute-bridge', 'step-up', 'lunge',
])

// Minimal-rest muscles: forearms and calves — never need more than 60s
const MINIMAL_REST = new Set([
  'wrist-curl', 'wrist-ext', 'reverse-curl', 'reverse-curl-db',
  'hammer-forearm', 'farmer-carry', 'plate-pinch', 'dead-hang',
  'standing-calf', 'seated-calf', 'leg-press-calf', 'db-calf', 'tibia-raise',
])

// General isolation exercises — 60-75s is enough
const ISOLATION = new Set([
  'db-curl', 'hammer-curl', 'incline-curl', 'conc-curl',
  'preacher-curl', 'cable-curl', 'spider-curl', 'cross-curl',
  'tricep-push', 'overhead-tri', 'overhead-cable', 'kickback',
  'rope-pushdown', 'skull-crusher',
  'lateral-raise', 'cable-lateral', 'front-raise',
  'cable-fly-low', 'cable-fly-high',
  'plank', 'side-plank', 'crunch', 'russian-twist',
  'leg-raise', 'bicycle-crunch', 'dead-bug', 'ab-wheel',
])

const HEAVY_THRESHOLD = 0.80 // 80%+ of ref 1RM = "heavy" set

/**
 * Returns the smart rest suggestion for a completed set.
 *
 * @param {string} exerciseId
 * @param {number} weight       — kg used
 * @param {number} reps         — reps completed
 * @param {object} userPRs      — store.prs: { [exerciseId]: { e1rm, weight, reps } }
 * @param {number} defaultRest  — user's default rest time in seconds
 * @returns {{ seconds: number, label: string|null, color: string|null }}
 */
export function getSmartRestSuggestion(exerciseId, weight, reps, userPRs, defaultRest = 120) {
  if (!exerciseId || !weight || !reps) {
    return { seconds: defaultRest, label: null, color: null }
  }

  // Forearms / calves — always 60s max
  if (MINIMAL_REST.has(exerciseId)) {
    return { seconds: 60, label: 'Músculo pequeño', color: '#34C77B' }
  }

  // Estimate intensity relative to known PR or self-estimated 1RM
  const estimated1RM = reps > 1 ? weight * (36 / (37 - Math.min(reps, 36))) : weight
  const pr = userPRs?.[exerciseId]
  const ref1RM = pr?.e1rm ?? estimated1RM
  const intensity = weight / ref1RM

  if (HEAVY_COMPOUNDS.has(exerciseId)) {
    if (intensity >= HEAVY_THRESHOLD) {
      return { seconds: 180, label: 'Carga alta', color: '#E5534B' }
    }
    return { seconds: 150, label: 'Compuesto pesado', color: '#E8924A' }
  }

  if (MODERATE_COMPOUNDS.has(exerciseId)) {
    if (intensity >= HEAVY_THRESHOLD) {
      return { seconds: 150, label: 'Serie intensa', color: '#E8924A' }
    }
    return { seconds: 120, label: 'Compuesto', color: '#E8924A' }
  }

  if (ISOLATION.has(exerciseId)) {
    return { seconds: 75, label: 'Aislamiento', color: '#34C77B' }
  }

  // Unknown exercise — return default without label (no pill shown)
  return { seconds: defaultRest, label: null, color: null }
}
