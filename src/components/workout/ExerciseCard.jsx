import { useState } from 'react'
import { SetRow } from './SetRow.jsx'
import { getExerciseById, MUSCLE_COLORS, MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="1.2" fill="var(--text3)"/>
      <circle cx="12" cy="12" r="1.2" fill="var(--text3)"/>
      <circle cx="12" cy="19" r="1.2" fill="var(--text3)"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

export function ExerciseCard({ exercise, onAddSet, onRemoveExercise, onCompleteSet, onUpdateSet, onRemoveSet, restTimer }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sessions = useStore(s => s.sessions)
  const prs = useStore(s => s.prs)
  const exData = getExerciseById(exercise.exerciseId)
  const colors = exData ? MUSCLE_COLORS[exData.muscle] : null

  const lastSessionData = (() => {
    for (const session of sessions) {
      const ex = session.exercises?.find(e => e.exerciseId === exercise.exerciseId)
      if (ex) {
        const done = (ex.sets || []).filter(s => s.completed && s.reps > 0)
        if (done.length) return { sets: done, date: session.date }
      }
    }
    return null
  })()

  const allDone = exercise.sets.length > 0 && exercise.sets.every(s => s.completed)
  const currentPR = prs[exercise.exerciseId]

  return (
    <div style={{
      background: 'var(--surface3)',
      border: `1px solid ${allDone ? 'rgba(50,213,131,0.25)' : 'var(--border)'}`,
      borderRadius: 20,
      overflow: 'hidden',
      transition: 'border-color 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Muscle color dot */}
        {colors && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.text, flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {exData?.name || exercise.exerciseId}
          </p>
        </div>
        {colors && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
            padding: '3px 8px', borderRadius: 6,
            background: colors.bg, color: colors.text,
            border: `1px solid ${colors.border}`,
            flexShrink: 0,
          }}>
            {MUSCLE_NAMES[exData?.muscle]}
          </span>
        )}
        {/* Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <MoreIcon />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 36, zIndex: 20,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 14, overflow: 'hidden', minWidth: 160,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {currentPR && (
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>PR actual</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>{currentPR.weight}kg × {currentPR.reps}</p>
                  </div>
                )}
                <button onClick={() => { setMenuOpen(false); onRemoveExercise() }}
                  style={{ width: '100%', padding: '12px 14px', textAlign: 'left', fontSize: 14, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Eliminar ejercicio
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Last session reference */}
      {lastSessionData && (
        <div style={{ margin: '0 16px 8px', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>
            Última vez: {lastSessionData.sets.slice(0, 4).map(s => `${s.weight}×${s.reps}`).join(', ')}
          </p>
        </div>
      )}

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', marginBottom: 2 }}>
        <div style={{ width: 28, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em' }}>#</div>
        <div style={{ width: 72, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em' }}>PESO</div>
        <div style={{ width: 16 }} />
        <div style={{ width: 72, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em' }}>REPS</div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 40 }} />
      </div>

      {/* Sets */}
      <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column' }}>
        {exercise.sets.map((set, i) => {
          const w = parseFloat(set.weight) || 0
          const r = parseInt(set.reps) || 0
          const e1rm = r > 0 && w > 0 ? (r === 1 ? w : w * 36 / (37 - Math.min(r, 36))) : 0
          const isPR = set.completed && e1rm > 0 && (!currentPR || e1rm > currentPR.e1rm)
          return (
            <SetRow
              key={set.id}
              set={set}
              setIndex={i}
              isPR={isPR}
              onUpdate={data => onUpdateSet(exercise.id, set.id, data)}
              onComplete={() => { onCompleteSet(exercise.id, set.id); if (!set.completed) restTimer.start() }}
              onDelete={() => onRemoveSet(exercise.id, set.id)}
            />
          )
        })}
      </div>

      {/* Add set */}
      <button
        onClick={() => onAddSet(exercise.id)}
        style={{
          width: 'calc(100% - 24px)', margin: '0 12px 12px',
          padding: '10px', borderRadius: 10,
          background: 'none',
          border: '1px dashed rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: 'var(--text3)', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text3)' }}
      >
        <PlusIcon /> Añadir serie
      </button>
    </div>
  )
}
