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
  user: {
    name: null,
    startDate: null,
    unit: 'kg',
    level: null,
    goal: null,
    currentWeight: null,
    goalWeight: null,
    goalTimeframe: null,
    onboardingDate: null,
    weeklyTarget: null,
    avatarEmoji: null,
  },
  programs: SEED_PROGRAMS,
  activeProgram: 'ppl',
  templates: SEED_TEMPLATES,
  sessions: [],
  activeWorkout: null,
  prs: {},
  bodyMetrics: [],
  // Badge-specific counters — only incremented by intentional user actions
  userCreatedPrograms: 0,   // incremented by saveCustomProgram(), NOT addRecommendedProgram()
  manualWeightLogs: 0,      // incremented by addBodyMetric() when source !== 'onboarding'
  settings: {
    unit: 'kg',
    theme: 'dark',
    restTimerDefault: 120,
    repRangeGuidance: null,
    weightUnit: 'kg',
    progressDefaultChart: 'volume',
  },
  toasts: [],
  unlockedBadges: [],
  pendingBadgeToast: null,
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
      addProgram: (program) => set(s => ({
        programs: [...s.programs, program]
      })),
      createProgram: (data) => set(s => ({
        programs: [...s.programs, { id: uid(), days: [], ...data }]
      })),
      // saveCustomProgram — called from ProgramEditor when user taps "Guardar"
      // This is the ONLY action that increments userCreatedPrograms
      saveCustomProgram: (program) => set(s => ({
        programs: [...s.programs, {
          ...program,
          id: program.id || uid(),
          source: 'user',
          createdAt: program.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        userCreatedPrograms: s.userCreatedPrograms + 1,
      })),
      // addRecommendedProgram — called by personalizeFromOnboarding()
      // Does NOT increment userCreatedPrograms
      addRecommendedProgram: (program) => set(s => ({
        programs: [...s.programs, {
          ...program,
          source: 'recommended',
          createdAt: new Date().toISOString(),
        }],
      })),
      updateProgram: (id, data) => set(s => ({
        programs: s.programs.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
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

        const ts = Date.now()
        localStorage.setItem('graw_workout_start_ts', String(ts))
        set({
          activeWorkout: {
            id: uid(),
            templateId: templateId || null,
            programId: programId || null,
            name: name || 'Entrenamiento',
            startTime: new Date(ts).toISOString(),
            exercises,
          }
        })
      },

      startEmptyWorkout: () => {
        const ts = Date.now()
        localStorage.setItem('graw_workout_start_ts', String(ts))
        set({
          activeWorkout: {
            id: uid(),
            templateId: null,
            programId: null,
            name: 'Entrenamiento libre',
            startTime: new Date(ts).toISOString(),
            exercises: [],
          }
        })
      },

      cancelWorkout: () => {
        localStorage.removeItem('graw_workout_start_ts')
        set({ activeWorkout: null })
      },

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
        const { activeWorkout, prs } = get()
        if (!activeWorkout) return null

        const endTime = new Date()
        const startTime = new Date(activeWorkout.startTime)
        const duration = Math.floor((endTime - startTime) / 1000)
        const totalVolume = calcSessionVolume(activeWorkout.exercises)

        // Detect new PRs — compare e1RM of each completed set vs stored PRs
        const newPRs = {}
        activeWorkout.exercises.forEach(ex => {
          ex.sets.forEach(set => {
            if (!set.completed) return
            const w = parseFloat(set.weight) || 0
            const r = parseInt(set.reps) || 0
            if (!w || !r) return
            const e1rm = computeE1RM(w, r)
            const existing = prs[ex.exerciseId]
            if (e1rm > 0 && (!existing || e1rm > existing.e1rm)) {
              if (!newPRs[ex.exerciseId] || e1rm > newPRs[ex.exerciseId].e1rm) {
                newPRs[ex.exerciseId] = { weight: w, reps: r, e1rm, date: new Date().toISOString() }
              }
            }
          })
        })

        // Determine muscle groups from exercises (use muscle field if available)
        const muscles = [...new Set(
          activeWorkout.exercises
            .map(ex => {
              // Try to get muscle from exercise data — fallback to exerciseId
              const stored = activeWorkout.exercises.find(e => e.id === ex.id)
              return stored?.muscle || null
            })
            .filter(Boolean)
        )]

        const session = {
          id: uid(),
          templateId: activeWorkout.templateId,
          programId: activeWorkout.programId,
          name: activeWorkout.name,
          date: activeWorkout.startTime,
          startTime: activeWorkout.startTime,
          duration,
          exercises: activeWorkout.exercises,
          totalVolume: Math.round(totalVolume),
          notes,
          muscles,
        }

        localStorage.removeItem('graw_workout_start_ts')
        set(s => ({
          sessions: [session, ...s.sessions],
          activeWorkout: null,
          prs: { ...s.prs, ...newPRs },
        }))

        return { session, newPRs }
      },

      // ── SESSIONS ──────────────────────────────────────────────────────────
      deleteSession: (id) => set(s => ({
        sessions: s.sessions.filter(s2 => s2.id !== id)
      })),

      updateSessionNotes: (id, notes) => set(s => ({
        sessions: s.sessions.map(s2 => s2.id === id ? { ...s2, notes } : s2)
      })),

      updateSession: (id, data) => set(s => ({
        sessions: s.sessions.map(s2 => s2.id === id ? { ...s2, ...data } : s2)
      })),

      // ── BODY METRICS ──────────────────────────────────────────────────────
      addBodyMetric: (data) => set(s => {
        const isManual = data.source !== 'onboarding'
        return {
          bodyMetrics: [
            { id: uid(), date: new Date().toISOString(), ...data },
            ...s.bodyMetrics,
          ],
          manualWeightLogs: isManual ? s.manualWeightLogs + 1 : s.manualWeightLogs,
        }
      }),

      deleteBodyMetric: (id) => set(s => ({
        bodyMetrics: s.bodyMetrics.filter(m => m.id !== id)
      })),

      // ── BADGES ────────────────────────────────────────────────────────────
      unlockBadges: (badges) => set(s => ({
        unlockedBadges: [
          ...s.unlockedBadges,
          ...badges.filter(b => !s.unlockedBadges.find(u => u.id === b.id)),
        ]
      })),
      setPendingBadgeToast: (badge) => set({ pendingBadgeToast: badge }),
      clearPendingBadgeToast: () => set({ pendingBadgeToast: null }),

      // ── TOASTS ────────────────────────────────────────────────────────────
      // Accepts either a string or an object { message, type, duration }
      addToast: (toastOrMessage) => {
        const id = uid()
        const toast = typeof toastOrMessage === 'string'
          ? { message: toastOrMessage, type: 'default' }
          : toastOrMessage
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
        userCreatedPrograms: state.userCreatedPrograms,
        manualWeightLogs: state.manualWeightLogs,
        settings: state.settings,
        unlockedBadges: state.unlockedBadges,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('Failed to rehydrate store:', error)
      },
    }
  )
)

export default useStore
