import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEED_PROGRAMS, SEED_TEMPLATES } from './seedData.js'
import { calcSessionVolume } from '../utils/volume.js'
import { computeE1RM } from '../utils/oneRepMax.js'
import { EXERCISES } from '../data/exercises.js'

// Helper — get exercise by id without a hook (pure function)
function getExById(id) {
  return EXERCISES.find(e => e.id === id) || null
}

const useStore = create(
  persist(
    (set, get) => ({

      // ── USER ────────────────────────────────────────────────────────────────
      user: { name: 'Atleta', startDate: new Date().toISOString(), unit: 'kg' },
      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),

      // ── SETTINGS ────────────────────────────────────────────────────────────
      settings: { restTimerDefault: 120, unit: 'kg', theme: 'dark' },
      updateSettings: (updates) => set(s => ({ settings: { ...s.settings, ...updates } })),

      // ── PROGRAMS ────────────────────────────────────────────────────────────
      programs: SEED_PROGRAMS,
      activeProgram: SEED_PROGRAMS[0]?.id || null,

      addProgram: (program) => set(s => ({
        programs: [...s.programs, { ...program, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateProgram: (id, updates) => set(s => ({
        programs: s.programs.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProgram: (id) => set(s => ({
        programs: s.programs.filter(p => p.id !== id),
        activeProgram: s.activeProgram === id ? null : s.activeProgram,
      })),
      setActiveProgram: (id) => set({ activeProgram: id }),

      // ── TEMPLATES ───────────────────────────────────────────────────────────
      templates: SEED_TEMPLATES,

      addTemplate: (template) => set(s => ({
        templates: [...s.templates, { ...template, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      updateTemplate: (id, updates) => set(s => ({
        templates: s.templates.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTemplate: (id) => set(s => ({ templates: s.templates.filter(t => t.id !== id) })),

      // ── SESSIONS ────────────────────────────────────────────────────────────
      sessions: [],

      addSession: (session) => set(s => ({
        sessions: [{ ...session, id: session.id || crypto.randomUUID(), createdAt: new Date().toISOString() }, ...s.sessions]
      })),
      updateSession: (id, updates) => set(s => ({
        sessions: s.sessions.map(sess => sess.id === id ? { ...sess, ...updates } : sess)
      })),
      deleteSession: (id) => set(s => ({ sessions: s.sessions.filter(s => s.id !== id) })),

      // ── ACTIVE WORKOUT ───────────────────────────────────────────────────────
      activeWorkout: null,

      startWorkout: ({ templateId, programId, name }) => {
        const { templates } = get()
        const template = templates.find(t => t.id === templateId)
        const exercises = (template?.exercises || []).map(ex => ({
          id: crypto.randomUUID(),
          exerciseId: ex.exerciseId || ex.id,
          sets: Array.from({ length: Number(ex.sets) || 3 }, () => ({
            id: crypto.randomUUID(),
            weight: ex.weight > 0 ? String(ex.weight) : '',
            reps: ex.reps ? String(ex.reps) : '',
            completed: false,
          })),
        }))
        // Stamp start time in localStorage for the Web Worker timer
        localStorage.setItem('graw_workout_start_ts', String(Date.now()))
        set({
          activeWorkout: {
            id: crypto.randomUUID(),
            name: name || template?.name || 'Entrenamiento',
            templateId: templateId || null,
            programId: programId || null,
            startTime: new Date().toISOString(),
            exercises,
          }
        })
      },

      startEmptyWorkout: () => {
        localStorage.setItem('graw_workout_start_ts', String(Date.now()))
        set({
          activeWorkout: {
            id: crypto.randomUUID(),
            name: 'Entrenamiento libre',
            templateId: null,
            programId: null,
            startTime: new Date().toISOString(),
            exercises: [],
          }
        })
      },

      cancelWorkout: () => {
        localStorage.removeItem('graw_workout_start_ts')
        set({ activeWorkout: null })
      },

      finishWorkout: (notes = '') => {
        const { activeWorkout, prs } = get()
        if (!activeWorkout) return null

        const startTs = localStorage.getItem('graw_workout_start_ts')
        const startTime = startTs ? Number(startTs) : new Date(activeWorkout.startTime).getTime()
        const duration = Math.floor((Date.now() - startTime) / 1000)
        const totalVolume = calcSessionVolume(activeWorkout.exercises)

        // Derive muscle groups from exercise data
        const muscles = [...new Set(
          activeWorkout.exercises
            .map(ex => getExById(ex.exerciseId)?.muscle)
            .filter(Boolean)
        )]

        const session = {
          id: crypto.randomUUID(),
          name: activeWorkout.name,
          templateId: activeWorkout.templateId,
          programId: activeWorkout.programId,
          date: new Date().toISOString(),
          duration,
          totalVolume: Math.round(totalVolume),
          exercises: activeWorkout.exercises,
          muscles,
          notes,
        }

        // PR detection
        const newPRs = {}
        const updatedPRs = { ...prs }
        activeWorkout.exercises.forEach(ex => {
          ex.sets
            .filter(s => s.completed && s.weight && s.reps)
            .forEach(s => {
              const w = parseFloat(s.weight)
              const r = parseInt(s.reps)
              if (!w || !r) return
              const e1rm = computeE1RM(w, r)
              const current = updatedPRs[ex.exerciseId]
              if (!current || e1rm > current.e1rm) {
                updatedPRs[ex.exerciseId] = { weight: w, reps: r, e1rm, date: new Date().toISOString() }
                newPRs[ex.exerciseId] = { weight: w, reps: r, e1rm, date: new Date().toISOString() }
              }
            })
        })

        localStorage.removeItem('graw_workout_start_ts')

        set(s => ({
          sessions: [session, ...s.sessions],
          activeWorkout: null,
          prs: updatedPRs,
        }))

        return { session, newPRs }
      },

      updateWorkoutName: (name) => set(s => ({
        activeWorkout: s.activeWorkout ? { ...s.activeWorkout, name } : null
      })),

      addExerciseToWorkout: (exerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        const newEx = {
          id: crypto.randomUUID(),
          exerciseId,
          sets: [
            { id: crypto.randomUUID(), weight: '', reps: '', completed: false },
            { id: crypto.randomUUID(), weight: '', reps: '', completed: false },
            { id: crypto.randomUUID(), weight: '', reps: '', completed: false },
          ],
        }
        return { activeWorkout: { ...s.activeWorkout, exercises: [...s.activeWorkout.exercises, newEx] } }
      }),

      removeExerciseFromWorkout: (exerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        return {
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.filter(e => e.id !== exerciseId)
          }
        }
      }),

      addSet: (exerciseId) => set(s => {
        if (!s.activeWorkout) return {}
        const exercises = s.activeWorkout.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex
          const last = ex.sets[ex.sets.length - 1]
          return {
            ...ex,
            sets: [
              ...ex.sets,
              { id: crypto.randomUUID(), weight: last?.weight || '', reps: last?.reps || '', completed: false }
            ]
          }
        })
        return { activeWorkout: { ...s.activeWorkout, exercises } }
      }),

      removeSet: (exerciseId, setId) => set(s => {
        if (!s.activeWorkout) return {}
        const exercises = s.activeWorkout.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex
          return { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        })
        return { activeWorkout: { ...s.activeWorkout, exercises } }
      }),

      updateSet: (exerciseId, setId, data) => set(s => {
        if (!s.activeWorkout) return {}
        const exercises = s.activeWorkout.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex
          return { ...ex, sets: ex.sets.map(set => set.id === setId ? { ...set, ...data } : set) }
        })
        return { activeWorkout: { ...s.activeWorkout, exercises } }
      }),

      completeSet: (exerciseId, setId) => {
        const { activeWorkout, prs } = get()
        if (!activeWorkout) return null

        const ex = activeWorkout.exercises.find(e => e.id === exerciseId)
        const targetSet = ex?.sets.find(s => s.id === setId)
        if (!targetSet) return null

        const w = parseFloat(targetSet.weight)
        const r = parseInt(targetSet.reps)
        let isPR = false

        if (w && r) {
          const e1rm = computeE1RM(w, r)
          const current = prs[ex.exerciseId]
          if (!current || e1rm > current.e1rm) isPR = true
        }

        const exercises = activeWorkout.exercises.map(e => {
          if (e.id !== exerciseId) return e
          return {
            ...e,
            sets: e.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
          }
        })

        useStore.setState({ activeWorkout: { ...activeWorkout, exercises } })
        return { isPR, exerciseId: ex.exerciseId }
      },

      // ── PRs ─────────────────────────────────────────────────────────────────
      prs: {},
      updatePR: (exerciseId, data) => set(s => ({ prs: { ...s.prs, [exerciseId]: data } })),

      // ── BODY METRICS ────────────────────────────────────────────────────────
      metrics: [],
      addMetric: (metric) => set(s => ({
        metrics: [
          ...s.metrics,
          { ...metric, id: crypto.randomUUID(), date: metric.date || new Date().toISOString() }
        ]
      })),
      deleteMetric: (id) => set(s => ({ metrics: s.metrics.filter(m => m.id !== id) })),

      // ── TOASTS ──────────────────────────────────────────────────────────────
      toasts: [],
      addToast: (message, type = 'info', duration = 3500) => {
        const id = crypto.randomUUID()
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
        setTimeout(() => {
          useStore.setState(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
        }, duration)
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

    }),
    {
      name: 'graw_store',
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        programs: state.programs,
        activeProgram: state.activeProgram,
        templates: state.templates,
        sessions: state.sessions,
        prs: state.prs,
        metrics: state.metrics,
        activeWorkout: state.activeWorkout,
        // toasts intentionally excluded — ephemeral, never persisted
      }),
      // Defensive merge — prevents null/undefined from old storage from crashing UI
      merge: (persisted, current) => {
        const p = persisted || {}
        const safeArray = (val, fallback) => Array.isArray(val) ? val : fallback
        const safeObject = (val, fallback) => (val && typeof val === 'object' && !Array.isArray(val)) ? val : fallback

        return {
          ...current,
          ...p,
          user: safeObject(p.user, current.user),
          settings: safeObject(p.settings, current.settings),
          programs: safeArray(p.programs, current.programs),
          templates: safeArray(p.templates, current.templates),
          sessions: safeArray(p.sessions, current.sessions),
          prs: safeObject(p.prs, current.prs),
          metrics: safeArray(p.metrics, current.metrics),
        }
      },
    }
  )
)

export default useStore
