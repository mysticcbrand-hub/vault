import { getExerciseById } from '../data/exercises.js'

// ─── ensureProgramTemplates ───────────────────────────────────────────────────
// For programs whose days contain exercises directly (no templateId),
// create templates and wire templateId so the rest of the app can consume them.
// If updateTemplate is provided, existing templateIds are synced too.
export function ensureProgramTemplates(program, { createTemplate, updateTemplate } = {}) {
  if (!program?.days?.length) return program

  const normalizedDays = program.days.map(day => {
    const rawExercises = day.exercises || []
    const normalizedExercises = rawExercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets ?? 3,
      reps: ex.reps ?? 10,
      restSeconds: ex.restSeconds ?? 120,
      weight: ex.weight ?? 0,
    }))

    const muscles = [...new Set(
      normalizedExercises.map(ex => getExerciseById(ex.exerciseId)?.muscle).filter(Boolean)
    )]

    if (day.templateId) {
      if (updateTemplate) {
        updateTemplate(day.templateId, {
          name: day.name,
          exercises: normalizedExercises,
          muscles,
        })
      }
      return { ...day, muscles }
    }

    if (normalizedExercises.length === 0 || !createTemplate) return day

    const templateId = createTemplate({
      name: day.name,
      exercises: normalizedExercises,
      muscles,
    })

    return { ...day, templateId, muscles }
  })

  return { ...program, days: normalizedDays }
}
