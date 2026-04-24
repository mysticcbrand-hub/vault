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

// ── PR detection: weight PR OR reps-at-weight PR ─────────────────────────────
// prs[exerciseId] = { weight, reps, e1rm, date, repPRs: { [weight]: { reps, date } } }
function isPRSet(weight, reps, existingPR) {
  if (!weight || !reps) return { isE1rmPR: false, isRepPR: false }
  const e1rm = computeE1RM(weight, reps)
  const isE1rmPR = e1rm > 0 && (!existingPR || e1rm > existingPR.e1rm)
  // Rep PR: same weight, more reps than ever done at that weight
  const existingRepPR = existingPR?.repPRs?.[String(weight)]?.reps ?? 0
  const isRepPR = !isE1rmPR && reps > existingRepPR
  return { isE1rmPR, isRepPR, e1rm }
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
  userCreatedPrograms: 0,
  manualWeightLogs: 0,
  // ── Streak — program-cycle-based (NOT calendar-day) ──────────────────────
  // A "cycle" = completing ALL days of the active program once.
  // Streak increments each completed cycle. Window = days.length * 2 days to complete.
  streakCurrentStreak: 0,
  streakLongestStreak: 0,
  streakCycleStart: null,         // ISO date string — when current cycle started
  streakCompletedDays: [],        // program day IDs completed in current cycle
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
  customExercises: [],
})

const useStore = create(
  persist(
    (set, get) => ({
      ...initialState(),

      // ── CUSTOM EXERCISES ──────────────────────────────────────────────────
      saveCustomExercise: (exercise) => set(s => {
        const list = [...(s.customExercises ?? []), exercise]
        try { localStorage.setItem('graw_custom_exercises', JSON.stringify(list)) } catch (e) {}
        return { customExercises: list }
      }),
      deleteCustomExercise: (id) => set(s => ({
        customExercises: (s.customExercises ?? []).filter(e => e.id !== id),
      })),

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

      // ── SWAP EXERCISE IN WORKOUT — replace exerciseId, keep sets structure ─
      swapExerciseInWorkout: (exerciseId, newExerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, exerciseId: newExerciseId, note: '' }
                : ex
            ),
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
              if (ex.sets.length <= 1) return ex
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

      // ── COMPLETE SET — bidirectional + rep PR detection ───────────────────
      completeSet: (exerciseId, setId) => {
        const { activeWorkout, prs } = get()
        if (!activeWorkout) return { isPR: false, isRepPR: false, wasCompleted: false }

        const ex = activeWorkout.exercises.find(e => e.id === exerciseId)
        const set_ = ex?.sets.find(s => s.id === setId)
        if (!set_) return { isPR: false, isRepPR: false, wasCompleted: false }

        const wasCompleted = set_.completed
        const nowCompleted = !wasCompleted

        if (nowCompleted) {
          const weight = parseFloat(set_.weight) || 0
          const reps = parseInt(set_.reps) || 0
          const currentPR = prs[ex.exerciseId]
          const { isE1rmPR, isRepPR, e1rm } = isPRSet(weight, reps, currentPR)

          set(s => {
            const newPRs = { ...s.prs }
            if (isE1rmPR || isRepPR) {
              const existing = newPRs[ex.exerciseId] || {}
              const repPRs = { ...(existing.repPRs || {}) }
              // Always update per-weight rep record
              if (!repPRs[String(weight)] || reps > repPRs[String(weight)].reps) {
                repPRs[String(weight)] = { reps, date: new Date().toISOString() }
              }
              if (isE1rmPR) {
                newPRs[ex.exerciseId] = {
                  weight, reps, e1rm,
                  date: new Date().toISOString(),
                  repPRs,
                }
              } else {
                // Rep PR only — update repPRs but don't overwrite weight/e1rm PR
                newPRs[ex.exerciseId] = { ...existing, repPRs }
              }
            } else {
              // Still update per-weight rep record even if no PR
              const existing = newPRs[ex.exerciseId]
              if (existing) {
                const repPRs = { ...(existing.repPRs || {}) }
                if (!repPRs[String(weight)] || reps > repPRs[String(weight)].reps) {
                  repPRs[String(weight)] = { reps, date: new Date().toISOString() }
                  newPRs[ex.exerciseId] = { ...existing, repPRs }
                }
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

          return { isPR: isE1rmPR, isRepPR, e1rm, exerciseId: ex.exerciseId, weight, reps, wasCompleted: false }
        } else {
          // Uncomplete
          set(s => ({
            activeWorkout: {
              ...s.activeWorkout,
              exercises: s.activeWorkout.exercises.map(e => {
                if (e.id !== exerciseId) return e
                return {
                  ...e,
                  sets: e.sets.map(st =>
                    st.id === setId ? { ...st, completed: false } : st
                  )
                }
              })
            }
          }))
          return { isPR: false, isRepPR: false, wasCompleted: true }
        }
      },

      // Add dropset after a parent set
      addDropset: (exerciseId, parentSetId) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map(ex => {
              if (ex.id !== exerciseId) return ex
              const parentSet = ex.sets.find(st => st.id === parentSetId)
              if (!parentSet) return ex
              const dropset = {
                id: uid(),
                type: 'dropset',
                weight: Math.round((parseFloat(parentSet.weight) || 0) * 0.75),
                reps: (parseInt(parentSet.reps) || 0) + 2,
                completed: false,
                setNumber: 0,
              }
              const newSets = []
              for (const st of ex.sets) {
                newSets.push(st)
                if (st.id === parentSetId) newSets.push(dropset)
              }
              return { ...ex, sets: newSets.map((st, i) => ({ ...st, setNumber: i + 1 })) }
            })
          }
        }
      }),

      // Reorder exercises during workout
      reorderExercises: (fromIndex, toIndex) => set(s => {
        if (!s.activeWorkout) return {}
        const exercises = [...s.activeWorkout.exercises]
        const [item] = exercises.splice(fromIndex, 1)
        exercises.splice(toIndex, 0, item)
        return {
          activeWorkout: { ...s.activeWorkout, exercises }
        }
      }),

      // Add/update note on an exercise
      updateExerciseNote: (exerciseId, note) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, note } : ex
            )
          }
        }
      }),

      finishWorkout: (notes = '') => {
        const { activeWorkout, prs } = get()
        if (!activeWorkout) return null

        const endTime = new Date()
        const startTime = new Date(activeWorkout.startTime)
        const duration = Math.floor((endTime - startTime) / 1000)
        const totalVolume = calcSessionVolume(activeWorkout.exercises)

        // Detect new PRs — e1rm and rep PRs
        const newPRs = {}
        activeWorkout.exercises.forEach(ex => {
          ex.sets.forEach(set => {
            if (!set.completed) return
            const w = parseFloat(set.weight) || 0
            const r = parseInt(set.reps) || 0
            if (!w || !r) return
            const currentPR = prs[ex.exerciseId]
            const { isE1rmPR, isRepPR, e1rm } = isPRSet(w, r, currentPR)
            if (isE1rmPR || isRepPR) {
              if (!newPRs[ex.exerciseId]) newPRs[ex.exerciseId] = { isE1rmPR: false, isRepPR: false, weight: w, reps: r, e1rm: e1rm || 0 }
              if (isE1rmPR && e1rm > (newPRs[ex.exerciseId].e1rm || 0)) {
                newPRs[ex.exerciseId] = { ...newPRs[ex.exerciseId], isE1rmPR: true, weight: w, reps: r, e1rm, date: new Date().toISOString() }
              }
              if (isRepPR) {
                newPRs[ex.exerciseId] = { ...newPRs[ex.exerciseId], isRepPR: true }
              }
            }
          })
        })

        // Muscle groups
        const muscles = [...new Set(
          activeWorkout.exercises
            .map(ex => {
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

        // ── STREAK: program-cycle-based ──────────────────────────────────────
        // A cycle is complete when all program days have been done.
        // Window: days.length * 2 calendar days to avoid breaking streak on rest days.
        // Streak only increments when a full cycle is completed.
        const state = get()
        const program = state.programs.find(p => p.id === activeWorkout.programId)
        let streakUpdates = {}

        if (program?.days?.length) {
          const now = new Date()
          const cycleStart = state.streakCycleStart ? new Date(state.streakCycleStart) : null
          // Generous window: days * 2 days (e.g. 3-day program → 6-day window)
          const windowDays = Math.max(program.days.length * 2, 7)

          // Find which program day was completed
          const completedDayId = program.days.find(d => d.templateId === activeWorkout.templateId)?.id

          if (completedDayId) {
            let currentCompleted = [...(state.streakCompletedDays || [])]
            let currentCycleStart = cycleStart

            // Check if window expired — if so, reset cycle (but NOT streak count yet)
            if (currentCycleStart) {
              const daysSince = Math.floor((now - currentCycleStart) / (1000 * 60 * 60 * 24))
              if (daysSince > windowDays) {
                // Window expired — start a new cycle, streak is broken
                currentCompleted = []
                currentCycleStart = null
                streakUpdates.streakCurrentStreak = 0
              }
            }

            // Start cycle if not started
            if (!currentCycleStart) currentCycleStart = now

            // Add day (deduplicate by ID)
            if (!currentCompleted.includes(completedDayId)) {
              currentCompleted.push(completedDayId)
            }

            // Check if cycle complete — ALL program days done
            const allDone = program.days.every(d => currentCompleted.includes(d.id))
            if (allDone) {
              const prevStreak = streakUpdates.streakCurrentStreak ?? state.streakCurrentStreak
              const newStreak = prevStreak + 1
              streakUpdates = {
                streakCurrentStreak: newStreak,
                streakLongestStreak: Math.max(state.streakLongestStreak, newStreak),
                streakCycleStart: null,       // reset for next cycle
                streakCompletedDays: [],
              }
            } else {
              streakUpdates = {
                ...streakUpdates,
                streakCycleStart: currentCycleStart.toISOString(),
                streakCompletedDays: currentCompleted,
              }
            }
          }
        }

        // Merge PR updates from per-set tracking done in completeSet()
        // finishWorkout just records the session — PRs already persisted incrementally
        set(s => ({
          sessions: [session, ...s.sessions],
          activeWorkout: null,
          ...streakUpdates,
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

        const resolveDate = () => {
          if (data.date) {
            const d = new Date(data.date)
            if (!isNaN(d.getTime())) return d.toISOString()
          }
          const now = new Date()
          now.setHours(0, 0, 0, 0)
          return now.toISOString()
        }

        const metric = {
          id: uid(),
          date: resolveDate(),
          ...data,
          weight: typeof data.weight === 'string' ? parseFloat(data.weight) : data.weight,
        }

        return {
          bodyMetrics: [metric, ...s.bodyMetrics],
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
        streakCurrentStreak: state.streakCurrentStreak,
        streakLongestStreak: state.streakLongestStreak,
        streakCycleStart: state.streakCycleStart,
        streakCompletedDays: state.streakCompletedDays,
        settings: state.settings,
        unlockedBadges: state.unlockedBadges,
        customExercises: state.customExercises,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('Failed to rehydrate store:', error)
        // Check streak window on app open — reset if cycle window expired
        if (state?.streakCycleStart) {
          const now = new Date()
          const cycleStart = new Date(state.streakCycleStart)
          const program = state.programs?.find(p => p.id === state.activeProgram)
          const windowDays = Math.max((program?.days?.length || 3) * 2, 7)
          const daysSince = Math.floor((now - cycleStart) / (1000 * 60 * 60 * 24))
          if (daysSince > windowDays) {
            setTimeout(() => {
              useStore.setState({
                streakCurrentStreak: 0,
                streakCycleStart: null,
                streakCompletedDays: [],
              })
            }, 0)
          }
        }
      },
    }
  )
)

export default useStore
