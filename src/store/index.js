import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SEED_PROGRAMS, SEED_TEMPLATES } from './seedData.js'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function calcSessionVolume(exercises) {
  return exercises.reduce((t, ex) =>
    t + (ex.sets || []).reduce((s, set) =>
      s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0), 0)
}

function computeE1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0
  if (reps === 1) return weight
  return weight * 36 / (37 - Math.min(reps, 36))
}

const initialState = () => ({
  user: { name: 'Atleta', startDate: new Date().toISOString(), unit: 'kg' },
  programs: SEED_PROGRAMS,
  activeProgram: 'ppl',
  templates: SEED_TEMPLATES,
  sessions: [],
  activeWorkout: null,
  prs: {},
  bodyMetrics: [],
  settings: { unit: 'kg', theme: 'dark', restTimerDefault: 120 },
  toasts: [],
})

const useStore = create(
  persist(
    (set, get) => ({
      ...initialState(),

      // ── USER ──────────────────────────────────────────────────────────────
      updateUser: (data) => set(s => ({ user: { ...s.user, ...data } })),

      // ── SETTINGS ──────────────────────────────────────────────────────────
      updateSettings: (data) => set(s => ({ settings: { ...s.settings, ...data } })),

      // ── PROGRAMS ──────────────────────────────────────────────────────────
      createProgram: (data) => set(s => ({
        programs: [...s.programs, { id: uid(), days: [], ...data }]
      })),
      updateProgram: (id, data) => set(s => ({
        programs: s.programs.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProgram: (id) => set(s => ({
        programs: s.programs.filter(p => p.id !== id),
        activeProgram: s.activeProgram === id ? null : s.activeProgram,
      })),
      setActiveProgram: (id) => set({ activeProgram: id }),

      // ── TEMPLATES ─────────────────────────────────────────────────────────
      createTemplate: (data) => {
        const id = uid()
        set(s => ({ templates: [...s.templates, { id, exercises: [], muscles: [], ...data }] }))
        return id
      },
      updateTemplate: (id, data) => set(s => ({
        templates: s.templates.map(t => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTemplate: (id) => set(s => ({
        templates: s.templates.filter(t => t.id !== id)
      })),

      // ── ACTIVE WORKOUT ────────────────────────────────────────────────────
      startWorkout: ({ templateId, programId, name }) => {
        const { templates } = get()
        const template = templates.find(t => t.id === templateId)
        let exercises = []

        if (template) {
          exercises = template.exercises.map(ex => ({
            id: uid(),
            exerciseId: ex.exerciseId,
            sets: Array.from({ length: ex.sets }, (_, i) => ({
              id: uid(),
              weight: ex.weight || 0,
              reps: ex.reps || 0,
              completed: false,
              setNumber: i + 1,
            })),
          }))
        }

        set({
          activeWorkout: {
            id: uid(),
            templateId: templateId || null,
            programId: programId || null,
            name: name || 'Entrenamiento',
            startTime: new Date().toISOString(),
            exercises,
          }
        })
      },

      startEmptyWorkout: () => {
        set({
          activeWorkout: {
            id: uid(),
            templateId: null,
            programId: null,
            name: 'Entrenamiento libre',
            startTime: new Date().toISOString(),
            exercises: [],
          }
        })
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      updateWorkoutName: (name) => set(s => ({
        activeWorkout: s.activeWorkout ? { ...s.activeWorkout, name } : null
      })),

      addExerciseToWorkout: (exerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        const newExercise = {
          id: uid(),
          exerciseId,
          sets: [{ id: uid(), weight: 0, reps: 0, completed: false, setNumber: 1 }],
        }
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: [...s.activeWorkout.exercises, newExercise],
          }
        }
      }),

      removeExerciseFromWorkout: (exerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.filter(e => e.id !== exerciseId),
          }
        }
      }),

      addSet: (exerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex
              const lastSet = ex.sets[ex.sets.length - 1]
              return {
                ...ex,
                sets: [...ex.sets, {
                  id: uid(),
                  weight: lastSet?.weight || 0,
                  reps: lastSet?.reps || 0,
                  completed: false,
                  setNumber: ex.sets.length + 1,
                }]
              }
            })
          }
        }
      }),

      removeSet: (exerciseId, setId) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex
              const newSets = ex.sets.filter(st => st.id !== setId)
                .map((st, i) => ({ ...st, setNumber: i + 1 }))
              return { ...ex, sets: newSets }
            })
          }
        }
      }),

      updateSet: (exerciseId, setId, data) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex
              return {
                ...ex,
                sets: ex.sets.map(st => st.id === setId ? { ...st, ...data } : st)
              }
            })
          }
        }
      }),

      completeSet: (exerciseId, setId) => {
        const { activeWorkout, prs } = get()
        if (!activeWorkout) return { isPR: false }

        const ex = activeWorkout.exercises.find(e => e.id === exerciseId)
        const set_ = ex?.sets.find(s => s.id === setId)
        if (!set_) return { isPR: false }

        const weight = parseFloat(set_.weight) || 0
        const reps = parseInt(set_.reps) || 0
        const e1rm = computeE1RM(weight, reps)
        const currentPR = prs[ex.exerciseId]
        const isPR = e1rm > 0 && (!currentPR || e1rm > currentPR.e1rm)

        set(s => {
          const newPRs = { ...s.prs }
          if (isPR) {
            newPRs[ex.exerciseId] = {
              weight, reps, e1rm,
              date: new Date().toISOString()
            }
          }
          return {
            prs: newPRs,
            activeWorkout: {
              ...s.activeWorkout,
              exercises: s.activeWorkout.exercises.map(e => {
                if (e.id !== exerciseId) return e
                return {
                  ...e,
                  sets: e.sets.map(st =>
                    st.id === setId ? { ...st, completed: true } : st
                  )
                }
              })
            }
          }
        })

        return { isPR, e1rm, exerciseId: ex.exerciseId, weight, reps }
      },

      finishWorkout: (notes = '') => {
        const { activeWorkout } = get()
        if (!activeWorkout) return null

        const endTime = new Date()
        const startTime = new Date(activeWorkout.startTime)
        const duration = Math.floor((endTime - startTime) / 1000)
        const totalVolume = calcSessionVolume(activeWorkout.exercises)

        const session = {
          id: uid(),
          templateId: activeWorkout.templateId,
          programId: activeWorkout.programId,
          name: activeWorkout.name,
          date: activeWorkout.startTime,
          duration,
          exercises: activeWorkout.exercises,
          totalVolume: Math.round(totalVolume),
          notes,
          muscles: [...new Set(activeWorkout.exercises.map(ex => {
            // will be resolved in component
            return ex.exerciseId
          }))],
        }

        set(s => ({
          sessions: [session, ...s.sessions],
          activeWorkout: null,
        }))

        return session
      },

      // ── SESSIONS ──────────────────────────────────────────────────────────
      deleteSession: (id) => set(s => ({
        sessions: s.sessions.filter(s2 => s2.id !== id)
      })),

      updateSessionNotes: (id, notes) => set(s => ({
        sessions: s.sessions.map(s2 => s2.id === id ? { ...s2, notes } : s2)
      })),

      // ── BODY METRICS ──────────────────────────────────────────────────────
      addBodyMetric: (data) => set(s => ({
        bodyMetrics: [
          { id: uid(), date: new Date().toISOString(), ...data },
          ...s.bodyMetrics,
        ]
      })),

      // ── TOASTS ────────────────────────────────────────────────────────────
      addToast: (toast) => {
        const id = uid()
        set(s => ({ toasts: [...s.toasts, { id, ...toast }] }))
        setTimeout(() => {
          set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
        }, toast.duration || 3500)
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
    }),
    {
      name: 'liftvault-storage',
      storage: createJSONStorage(() => {
        try {
          return localStorage
        } catch {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
      }),
      partialize: (state) => ({
        user: state.user,
        programs: state.programs,
        activeProgram: state.activeProgram,
        templates: state.templates,
        sessions: state.sessions,
        activeWorkout: state.activeWorkout,
        prs: state.prs,
        bodyMetrics: state.bodyMetrics,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('Failed to rehydrate store:', error)
      },
    }
  )
)

export default useStore
