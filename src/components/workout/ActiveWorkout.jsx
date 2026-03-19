import { useState, memo, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Plus } from 'lucide-react'
import { ExerciseCard } from './ExerciseCard.jsx'
import { RestTimerPill } from './RestTimer.jsx'
import { WorkoutComplete } from './WorkoutComplete.jsx'
import { ExercisePicker } from './ExercisePicker.jsx'
import { NoteSheet } from './NoteSheet.jsx'
import { useWorkoutTimer, useRestTimer, formatElapsed } from '../../hooks/useGrawTimer.js'
import { useDragToReorder } from '../../hooks/useDragToReorder.js'
import { formatKg } from '../../utils/format.js'
import { getExerciseById } from '../../data/exercises.js'
import { getSmartRestSuggestion } from '../../data/restProfiles.js'
import useStore from '../../store/index.js'

export const ActiveWorkout = memo(function ActiveWorkout() {
  const activeWorkout = useStore(s => s.activeWorkout)
  const settings = useStore(s => s.settings)
  const addExercise = useStore(s => s.addExerciseToWorkout)
  const addSet = useStore(s => s.addSet)
  const removeSet = useStore(s => s.removeSet)
  const updateSet = useStore(s => s.updateSet)
  const completeSet = useStore(s => s.completeSet)
  const cancelWorkout = useStore(s => s.cancelWorkout)
  const finishWorkout = useStore(s => s.finishWorkout)
  const removeExercise = useStore(s => s.removeExerciseFromWorkout)
  const updateWorkoutName = useStore(s => s.updateWorkoutName)
  const reorderExercises = useStore(s => s.reorderExercises)
  const addDropset = useStore(s => s.addDropset)
  const updateExerciseNote = useStore(s => s.updateExerciseNote)

  const [showPicker, setShowPicker] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showFinish, setShowFinish] = useState(false)
  const [completedData, setCompletedData] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [restingExerciseId, setRestingExerciseId] = useState(null)
  const [noteSheet, setNoteSheet] = useState(null) // { exerciseId, name, note }

  const { elapsed, start: startTimer, stop: stopTimer } = useWorkoutTimer()
  const restTimer = useRestTimer()

  // Start the Web Worker timer when workout mounts.
  useEffect(() => {
    if (!activeWorkout) return
    const saved = localStorage.getItem('graw_workout_start_ts')
    if (!saved) {
      const ts = new Date(activeWorkout.startTime).getTime()
      localStorage.setItem('graw_workout_start_ts', String(ts))
      startTimer(ts)
    }
  }, [activeWorkout?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag to reorder ────────────────────────────────────────────
  const exercises = activeWorkout?.exercises || []

  // Map draggable indices back to global indices for reorder
  const draggableGlobalIndices = exercises
    .map((ex, i) => ({ ex, i }))
    .filter(({ ex }) => !(ex.sets.length > 0 && ex.sets.every(s => s.completed)))
    .map(({ i }) => i)

  const { containerRef, dragIndex, overIndex, isDragging, gripHandlers, containerHandlers } = useDragToReorder({
    onReorder: (from, to) => {
      const globalFrom = draggableGlobalIndices[from]
      const globalTo = draggableGlobalIndices[to]
      if (globalFrom !== undefined && globalTo !== undefined) {
        reorderExercises(globalFrom, globalTo)
      }
    },
  })

  if (!activeWorkout) return null

  const totalVolume = exercises.reduce((t, ex) =>
    t + ex.sets.reduce((s, set) =>
      s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0), 0)

  const completedSets = exercises.reduce((t, ex) =>
    t + ex.sets.filter(s => s.completed).length, 0)

  const elapsedStr = formatElapsed(elapsed)
  const [mm, ss] = elapsedStr.split(':')

  // ── Toggle set complete — bidirectional ────────────────────────
  const handleCompleteSet = (exerciseId, setId) => {
    const result = completeSet(exerciseId, setId)

    // If we just uncompleted (wasCompleted=true), don't trigger rest timer
    if (result.wasCompleted) return result

    // Check if this was a regular set and the NEXT set is a dropset — skip rest
    const exercise = activeWorkout.exercises.find(ex => ex.id === exerciseId)
    if (exercise) {
      const setIdx = exercise.sets.findIndex(s => s.id === setId)
      const nextSet = exercise.sets[setIdx + 1]
      if (nextSet?.type === 'dropset' && !nextSet.completed) {
        // Dropset follows — no rest timer
        return result
      }
    }

    // Normal rest timer
    setRestingExerciseId(exerciseId)
    const set = exercise?.sets.find(s => s.id === setId)
    const prs = useStore.getState().prs
    const defaultRest = settings?.restTimerDefault || 120

    const suggestion = getSmartRestSuggestion(
      exerciseId,
      parseFloat(set?.weight) || 0,
      parseInt(set?.reps) || 0,
      prs,
      defaultRest
    )
    restTimer.start(suggestion.seconds)
    return result
  }

  // Listen for finish request from FocusMode nav button
  useEffect(() => {
    const handler = () => setShowFinish(true)
    window.addEventListener('graw:requestFinish', handler)
    return () => window.removeEventListener('graw:requestFinish', handler)
  }, [])

  const handleFinishConfirm = () => {
    setShowFinish(false)
    const result = finishWorkout('')
    if (result) {
      setCompletedData(result)
    }
  }

  const nextExercise = (() => {
    for (const ex of exercises) {
      if (ex.sets.some(s => !s.completed)) {
        return getExerciseById(ex.exerciseId)?.name || ex.exerciseId
      }
    }
    return null
  })()

  // Inline confirm dialogs — rendered via portal
  const ConfirmOverlay = ({ id, children, onDismiss }) => createPortal(
    <AnimatePresence>
      {true && (
        <>
          <motion.div
            key={`${id}-backdrop`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onDismiss}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          <motion.div
            key={`${id}-dialog`}
            initial={{ opacity: 0, scale: 0.92, x: '-50%', y: 'calc(-50% + 12px)' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 8px)' }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              width: 'calc(100% - 40px)', maxWidth: 340, zIndex: 61,
              background: 'rgba(16,13,9,0.96)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '0.5px solid rgba(255,235,200,0.12)',
              borderRadius: 24, padding: 24,
              boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.09), 0 20px 60px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>

        {/* Progress bar — below safe area, visible */}
        {(() => {
          const completedEx = exercises.filter(e => e.sets?.length > 0 && e.sets.every(s => s.completed)).length
          const pct = exercises.length > 0 ? (completedEx / exercises.length) * 100 : 0
          const allExDone = completedEx === exercises.length && exercises.length > 0
          return (
            <div style={{ position: 'fixed', top: 3, left: 0, right: 0, height: 2, zIndex: 200, background: 'rgba(255,235,200,0.06)' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: allExDone ? '#34C77B' : 'linear-gradient(90deg, #E8924A, #D4A843)',
                boxShadow: allExDone ? '0 0 8px rgba(52,199,123,0.7)' : '0 0 8px rgba(232,146,74,0.55)',
                borderRadius: '0 2px 2px 0',
                transition: 'width 0.55s cubic-bezier(0.32,0.72,0,1), background 0.4s ease',
              }} />
            </div>
          )
        })()}

        {/* ── Workout header — true frosted glass ── */}
        <div style={{
          flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(14,11,8,0.4)',
          backdropFilter: 'blur(32px) saturate(200%) brightness(1.15)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%) brightness(1.15)',
          borderBottom: '0.5px solid rgba(255,235,200,0.10)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          isolation: 'isolate',
          overflow: 'hidden',
        }}>
          {/* Noise texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundSize: '160px 160px',
            mixBlendMode: 'soft-light',
            opacity: 0.18,
            pointerEvents: 'none',
          }}/>
          {/* Light sheen */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,245,225,0.25) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}/>
          {/* Amber tint */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(232,146,74,0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}/>
          {/* Controls row */}
          <div style={{
            padding: '10px 16px',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 25px)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <button onClick={() => setShowCancel(true)} className="pressable" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, borderRadius: 10 }}>
              <ChevronLeft size={22} color="var(--text2)" />
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <input autoFocus value={activeWorkout.name} onChange={e => updateWorkoutName(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                  style={{ background: 'none', border: 'none', borderBottom: '1.5px solid var(--accent)', fontSize: 16, fontWeight: 600, color: 'var(--text)', outline: 'none', width: '100%', padding: '2px 0', fontFamily: 'inherit' }} />
              ) : (
                <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                    {activeWorkout.name}
                  </p>
                </button>
              )}
            </div>

            {/* Live timer */}
            <div style={{ fontSize: 17, fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.02em', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {mm}<span className="colon">:</span>{ss}
            </div>

            {/* Finish button */}
            <button onClick={() => setShowFinish(true)} className="pressable" style={{ height: 36, padding: '0 14px', borderRadius: 10, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
              Finalizar
            </button>
          </div>

          {/* Exercise dots + volume — integrated info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', height: 32,
            borderTop: '0.5px solid rgba(255,235,200,0.05)',
          }}>
            {/* Exercise dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {exercises.map((ex, i) => {
                const done = ex.sets?.length > 0 && ex.sets.every(s => s.completed)
                const completedCount = exercises.filter(e => e.sets?.length > 0 && e.sets.every(s => s.completed)).length
                const isCurrent = i === completedCount
                return (
                  <div
                    key={ex.id || i}
                    style={{
                      width: isCurrent ? 14 : 5,
                      height: 5,
                      borderRadius: 3,
                      background: done
                        ? '#34C77B'
                        : isCurrent
                          ? '#E8924A'
                          : 'rgba(255,235,200,0.14)',
                      transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.25s ease',
                    }}
                  />
                )
              })}
            </div>

            {/* Volume + sets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>
                {formatKg(totalVolume)} kg
              </span>
              <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>
                {completedSets} series
              </span>
            </div>
          </div>
        </div>

        {/* Rest timer pill */}
        <RestTimerPill timer={restTimer} />

        {/* Exercises scroll area */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
          paddingBottom: 'calc(var(--nav-h) + 80px)',
        }}>

          {/* All exercises in a single container — prevents scroll jump on set completion */}
          <div
            ref={containerRef}
            {...containerHandlers}
            style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              touchAction: isDragging ? 'none' : 'pan-y',
            }}
          >
            {exercises.map((exercise, i) => {
              const isLocked = exercise.sets.length > 0 && exercise.sets.every(s => s.completed)
              const draggableIdx = draggableGlobalIndices.indexOf(i)
              return (
                <div key={exercise.id} className="stagger-item" style={{ animationDelay: `${i * 40}ms` }}>
                  <ExerciseCard
                    exercise={exercise}
                    onAddSet={addSet}
                    onRemoveExercise={() => removeExercise(exercise.id)}
                    onCompleteSet={handleCompleteSet}
                    onUpdateSet={updateSet}
                    onRemoveSet={removeSet}
                    onAddDropset={addDropset}
                    onOpenNote={(id, name, note) => setNoteSheet({ exerciseId: id, name, note })}
                    restTimer={restTimer}
                    isResting={restingExerciseId === exercise.id && restTimer.isActive}
                    isDraggable={!isLocked}
                    isDragging={!isLocked && dragIndex === draggableIdx}
                    dragHandlers={!isLocked && draggableIdx >= 0 ? gripHandlers(draggableIdx) : undefined}
                  />
                </div>
              )
            })}
          </div>

          {/* Add exercise button */}
          <button
            className="pressable"
            onClick={() => setShowPicker(true)}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 'var(--r)',
              border: '1.5px dashed rgba(232,146,74,0.2)',
              background: 'rgba(232,146,74,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>Añadir ejercicio</span>
          </button>
        </div>

        {/* Next exercise hint bar */}
        {nextExercise && (
          <div style={{ flexShrink: 0, height: 36, display: 'flex', alignItems: 'center', padding: '0 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              Siguiente: <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{nextExercise}</span>
            </span>
          </div>
        )}
      </div>

      {/* Exercise picker */}
      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={id => { addExercise(id); setShowPicker(false) }}
      />

      {/* Note sheet */}
      <AnimatePresence>
        {noteSheet && (
          <NoteSheet
            exerciseId={noteSheet.exerciseId}
            exerciseName={noteSheet.name}
            existingNote={noteSheet.note}
            onSave={updateExerciseNote}
            onClose={() => setNoteSheet(null)}
          />
        )}
      </AnimatePresence>

      {/* Cancel confirm */}
      {showCancel && (
        <ConfirmOverlay id="cancel" onDismiss={() => setShowCancel(false)}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>¿Cancelar sesión?</p>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>Se perderán todos los datos de esta sesión.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowCancel(false)} className="pressable" style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Continuar</button>
            <button onClick={() => { cancelWorkout(); setShowCancel(false) }} className="pressable" style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.3)', color: 'var(--red)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar sesión</button>
          </div>
        </ConfirmOverlay>
      )}

      {/* Finish confirm */}
      {showFinish && (
        <ConfirmOverlay id="finish" onDismiss={() => setShowFinish(false)}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>Finalizar sesión</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'DURACIÓN', value: elapsedStr },
              { label: 'VOLUMEN', value: `${formatKg(totalVolume)} kg` },
              { label: 'SERIES', value: completedSets },
              { label: 'EJERCICIOS', value: exercises.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--surface3)', borderRadius: 12, padding: 12 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>{value}</p>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowFinish(false)} className="pressable" style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Volver</button>
            <button onClick={handleFinishConfirm} className="pressable" style={{ flex: 1, padding: 13, borderRadius: 12, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Guardar sesión</button>
          </div>
        </ConfirmOverlay>
      )}

      {/* Workout complete overlay */}
      {completedData && (
        <WorkoutComplete
          session={completedData.session}
          newPRs={completedData.newPRs}
          onSave={(notes) => {
            if (notes && completedData.session?.id) {
              useStore.getState().updateSession(completedData.session.id, { notes })
            }
            setCompletedData(null)
          }}
        />
      )}
    </>
  )
})
