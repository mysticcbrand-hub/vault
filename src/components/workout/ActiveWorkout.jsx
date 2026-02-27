import { useState } from 'react'
import { ExerciseCard } from './ExerciseCard.jsx'
import { RestTimerBar } from './RestTimer.jsx'
import { WorkoutComplete } from './WorkoutComplete.jsx'
import { ExercisePicker } from './ExercisePicker.jsx'
import { useWorkoutTimer, useRestTimer } from '../../hooks/useActiveWorkout.js'
import { formatDurationMmSs } from '../../utils/dates.js'
import { formatVolumeExact } from '../../utils/volume.js'
import useStore from '../../store/index.js'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

export function ActiveWorkout() {
  const activeWorkout = useStore(s => s.activeWorkout)
  const settings = useStore(s => s.settings)
  const addExercise = useStore(s => s.addExerciseToWorkout)
  const removeExercise = useStore(s => s.removeExerciseFromWorkout)
  const addSet = useStore(s => s.addSet)
  const removeSet = useStore(s => s.removeSet)
  const updateSet = useStore(s => s.updateSet)
  const completeSet = useStore(s => s.completeSet)
  const cancelWorkout = useStore(s => s.cancelWorkout)
  const finishWorkout = useStore(s => s.finishWorkout)
  const updateWorkoutName = useStore(s => s.updateWorkoutName)

  const [showPicker, setShowPicker] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [completedSession, setCompletedSession] = useState(null)
  const [newPRs, setNewPRs] = useState({})
  const [editingName, setEditingName] = useState(false)

  const elapsed = useWorkoutTimer()
  const restTimer = useRestTimer(settings.restTimerDefault || 90)

  if (!activeWorkout) return null

  const totalVolume = activeWorkout.exercises.reduce((t, ex) =>
    t + ex.sets.reduce((s, set) =>
      s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0), 0)

  const [mm, ss] = formatDurationMmSs(elapsed).split(':')

  const handleCompleteSet = (exerciseId, setId) => {
    const result = completeSet(exerciseId, setId)
    if (result?.isPR && result.exerciseId) {
      setNewPRs(prev => ({ ...prev, [result.exerciseId]: result }))
    }
    return result
  }

  const handleFinish = () => {
    const session = finishWorkout('')
    if (session) {
      session.duration = elapsed
      session.totalVolume = Math.round(totalVolume)
      setCompletedSession(session)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
        {/* Top bar */}
        <div style={{
          flexShrink: 0, padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <input
                autoFocus
                value={activeWorkout.name}
                onChange={e => updateWorkoutName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                style={{
                  background: 'none', border: 'none', borderBottom: '1px solid var(--accent)',
                  fontSize: 18, fontWeight: 700, color: 'var(--text)',
                  outline: 'none', width: '100%', padding: '2px 0',
                }}
              />
            ) : (
              <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{activeWorkout.name}</p>
              </button>
            )}
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: 'var(--green)', fontWeight: 600, fontFamily: 'monospace', fontSize: 14 }}>
                {mm}<span className="colon-blink">:</span>{ss}
              </span>
              <span style={{ marginLeft: 8 }}>{formatVolumeExact(totalVolume)} kg</span>
            </p>
          </div>
          <button
            onClick={() => setShowCancel(true)}
            style={{ padding: '8px 12px', borderRadius: 10, background: 'none', border: '1px solid var(--border)', color: 'var(--text3)', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleFinish}
            className="pressable"
            style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
          >
            <CheckIcon /> Finalizar
          </button>
        </div>

        {/* Exercises */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 'calc(100px + env(safe-area-inset-bottom,0px))' }}>
          {activeWorkout.exercises.map((exercise, i) => (
            <div key={exercise.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <ExerciseCard
                exercise={exercise}
                onAddSet={addSet}
                onRemoveExercise={() => removeExercise(exercise.id)}
                onCompleteSet={handleCompleteSet}
                onUpdateSet={updateSet}
                onRemoveSet={removeSet}
                restTimer={restTimer}
              />
            </div>
          ))}

          {/* Add exercise */}
          <button
            className="pressable"
            onClick={() => setShowPicker(true)}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 16,
              border: '1.5px dashed rgba(124,111,247,0.3)',
              background: 'rgba(124,111,247,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlusIcon />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>Añadir ejercicio</span>
          </button>
        </div>
      </div>

      {/* Rest timer bar */}
      <RestTimerBar timer={restTimer} />

      {/* Exercise picker */}
      <ExercisePicker open={showPicker} onClose={() => setShowPicker(false)} onSelect={id => { addExercise(id); setShowPicker(false) }} />

      {/* Cancel dialog */}
      {showCancel && (
        <>
          <div onClick={() => setShowCancel(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 60 }} />
          <div style={{
            position: 'fixed', inset: '0 24px', margin: 'auto',
            width: 'calc(100% - 48px)', maxWidth: 340,
            height: 'fit-content',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 24, padding: 24, zIndex: 61,
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>¿Cancelar entrenamiento?</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>Se perderán todos los datos de esta sesión.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCancel(false)} className="pressable" style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Continuar</button>
              <button onClick={() => { cancelWorkout(); setShowCancel(false) }} className="pressable" style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(244,96,96,0.3)', color: 'var(--red)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar sesión</button>
            </div>
          </div>
        </>
      )}

      {/* Workout complete */}
      {completedSession && (
        <WorkoutComplete session={completedSession} newPRs={newPRs} onSave={() => { setCompletedSession(null); setNewPRs({}) }} />
      )}
    </>
  )
}
