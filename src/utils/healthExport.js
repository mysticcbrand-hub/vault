import { getExerciseById } from '../data/exercises.js'

/**
 * Estimates calories burned during a strength workout.
 * Uses a simplified MET-based formula (MET ≈ 5 for moderate lifting).
 * @param {number} durationMin - Workout duration in minutes
 * @param {number} volumeKg - Total volume lifted in kg
 * @returns {number} Estimated calories (kcal)
 */
export function estimateCalories(durationMin, volumeKg) {
  // Base MET for strength training: 5.0 (moderate), scale up slightly with volume
  const baseMET = 5.0
  const volumeBonus = Math.min(volumeKg / 10000, 1.5) // Up to +1.5 MET for high volume
  const met = baseMET + volumeBonus
  // Assume avg body weight of 75kg if not provided (conservative estimate)
  const weightKg = 75
  // Calories = MET × weight(kg) × duration(hours)
  return Math.round(met * weightKg * (durationMin / 60))
}

/**
 * Builds the JSON payload for the iOS Shortcut.
 * @param {object} session - Completed session from the store
 * @param {object} user - User profile from the store
 * @returns {object} Payload object ready to be JSON-stringified
 */
export function buildHealthPayload(session, user) {
  const durationMin = Math.round((session.duration || 0) / 60)
  const volumeKg = session.totalVolume || 0
  const calories = estimateCalories(durationMin, volumeKg)

  const exercises = (session.exercises || []).map(ex => {
    const exData = getExerciseById(ex.exerciseId)
    const completedSets = (ex.sets || []).filter(s => s.completed)
    return {
      name: exData?.name || ex.exerciseId,
      muscle: exData?.muscle || null,
      sets: completedSets.map(s => ({
        weight_kg: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps) || 0,
      })),
    }
  }).filter(ex => ex.sets.length > 0)

  return {
    source: 'LiftVault',
    workout_name: session.name || 'Entrenamiento',
    date: session.startTime || session.date,
    duration_min: durationMin,
    total_volume_kg: volumeKg,
    calories_estimated: calories,
    muscles: session.muscles || [],
    exercises,
    notes: session.notes || '',
    user_name: user?.name || '',
  }
}

/**
 * Exports workout data to Apple Health via:
 * 1. Copies JSON payload to clipboard
 * 2. Opens iOS Shortcuts URL scheme to run the "LiftVault Health" shortcut
 *
 * @param {object} payload - Built via buildHealthPayload()
 * @returns {Promise<'clipboard'|'shortcut'|'error'>}
 */
export async function exportToHealth(payload) {
  const jsonStr = JSON.stringify(payload, null, 2)

  // Step 1: Copy to clipboard
  try {
    await navigator.clipboard.writeText(jsonStr)
  } catch (e) {
    console.warn('Clipboard write failed, trying fallback:', e)
    // Fallback for older iOS
    try {
      const ta = document.createElement('textarea')
      ta.value = jsonStr
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      return 'error'
    }
  }

  // Step 2: Open Shortcuts URL scheme
  // The shortcut name must match exactly what the user creates: "LiftVault Health"
  const shortcutName = encodeURIComponent('LiftVault Health')
  const shortcutsUrl = `shortcuts://run-shortcut?name=${shortcutName}&input=clipboard`

  // Small delay to ensure clipboard write completes before switching apps
  await new Promise(r => setTimeout(r, 150))
  window.location.href = shortcutsUrl

  return 'shortcut'
}
