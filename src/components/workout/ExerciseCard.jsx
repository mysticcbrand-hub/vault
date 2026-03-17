import { memo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Plus, Info, X, GripVertical, StickyNote, ChevronDown } from 'lucide-react'
import { SetRow } from './SetRow.jsx'
import { getExerciseById, MUSCLE_NAMES } from '../../data/exercises.js'
import { getMuscleVars, relativeDate } from '../../utils/format.js'
import useStore from '../../store/index.js'

const FORM_TIPS = {
  'squat':       ['Rodillas en línea con los pies', 'Pecho arriba, mirada al frente', 'Desciende hasta paralelo o más'],
  'deadlift':    ['Barra sobre el mediopié', 'Espalda recta, cadera atrás', 'Empuja el suelo, no tires de la barra'],
  'bench':       ['Retracción escapular', 'Muñecas neutras, codos a 75°', 'Barra a la línea del pectoral bajo'],
  'ohp':         ['Core activado, glúteos apretados', 'Barra sobre los trapecios', 'Cabeza atrás al subir'],
  'barbell-row': ['Torso a 45°', 'Codos al cuerpo, no hacia afuera', 'Omóplatos juntos en la contracción'],
}

function FormTipSheet({ exerciseName, tips, onClose }) {
  return createPortal(
    <>
      <motion.div key="ftb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)' }} />
      <motion.div key="fts" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 101, background: 'rgba(16,13,9,0.92)', backdropFilter: 'blur(48px) saturate(220%)', WebkitBackdropFilter: 'blur(48px) saturate(220%)', borderRadius: '28px 28px 0 0', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1)', padding: '20px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom,0px))' }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Tips: {exerciseName}</p>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,235,200,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color="var(--text2)" /></button>
        </div>
        {tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < tips.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)' }}>{i + 1}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{tip}</p>
          </div>
        ))}
      </motion.div>
    </>,
    document.body
  )
}

export const ExerciseCard = memo(function ExerciseCard({
  exercise, onAddSet, onRemoveExercise, onCompleteSet, onUpdateSet, onRemoveSet,
  onAddDropset, onOpenNote,
  restTimer, isResting,
  dragHandlers, isDragging, isDraggable,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [restOverrideOpen, setRestOverrideOpen] = useState(false)
  const [formTipOpen, setFormTipOpen] = useState(false)
  const sessions = useStore(s => s.sessions)
  const prs = useStore(s => s.prs)

  const settings = useStore(s => s.settings)
  const user = useStore(s => s.user)
  const exData = getExerciseById(exercise.exerciseId)
  const mv = getMuscleVars(exData?.muscle)
  const currentPR = prs[exercise.exerciseId]
  const repRangeRaw = settings?.repRangeGuidance || null
  const repRange = typeof repRangeRaw === 'string'
    ? { range: repRangeRaw, color: 'var(--text3)' }
    : repRangeRaw
  const showFormTip = user?.level === 'principiante' && !!FORM_TIPS[exercise.exerciseId]

  // Last session data for this exercise
  const lastSession = (() => {
    for (const s of sessions) {
      const ex = s.exercises?.find(e => e.exerciseId === exercise.exerciseId)
      if (ex) {
        const done = (ex.sets || []).filter(s => s.completed && s.reps > 0)
        if (done.length) return { sets: done, date: s.date }
      }
    }
    return null
  })()

  const todayMaxWeight = Math.max(
    ...exercise.sets.filter(s => s.completed && s.weight > 0).map(s => parseFloat(s.weight) || 0),
    0
  )
  const lastMaxWeight = lastSession
    ? Math.max(...lastSession.sets.map(s => parseFloat(s.weight) || 0), 0)
    : 0
  const beating = todayMaxWeight > 0 && lastMaxWeight > 0 && todayMaxWeight > lastMaxWeight

  const allDone = exercise.sets.length > 0 && exercise.sets.every(s => s.completed)
  const nextIncomplete = exercise.sets.findIndex(s => !s.completed)

  const handleComplete = useCallback((setId) => {
    // Determine haptic type: check current state
    const currentSet = exercise.sets.find(s => s.id === setId)
    try {
      navigator.vibrate(currentSet?.completed ? 6 : 12)
    } catch (e) {}
    return onCompleteSet(exercise.id, setId)
  }, [exercise.id, exercise.sets, onCompleteSet])

  const REST_PRESETS = [45, 60, 90, 120, 180]

  const borderColor = isResting
    ? 'rgba(232,146,74,0.4)'
    : allDone
      ? 'rgba(52,199,123,0.25)'
      : 'rgba(255,235,200,0.07)'

  return (
    <div style={{
      background: 'rgba(18,15,10,0.70)',
      backdropFilter: 'blur(28px) saturate(190%)',
      WebkitBackdropFilter: 'blur(28px) saturate(190%)',
      border: `0.5px solid ${borderColor}`,
      borderRadius: 'var(--r)',
      overflow: 'hidden',
      boxShadow: isDragging
        ? '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,200,0.1)'
        : `inset 0 1px 0 rgba(255,235,200,0.07), 0 2px 12px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,235,200,0.06)`,
      transition: 'border-color 0.4s ease, box-shadow 0.25s ease',
      animation: isResting ? 'cardRestPulse 2s ease-in-out infinite' : 'none',
      opacity: isDragging ? 0.5 : 1,
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    }}>

      {/* Header */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>

        {/* Drag grip — only for draggable (pending) exercises */}
        {isDraggable && dragHandlers && (
          <div
            onPointerDown={dragHandlers.onPointerDown}
            onPointerMove={dragHandlers.onPointerMove}
            onPointerUp={dragHandlers.onPointerUp}
            onPointerCancel={dragHandlers.onPointerCancel}
            style={{
              width: 24, height: 24, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'grab', flexShrink: 0, marginTop: 3,
              color: isDragging ? 'var(--accent)' : 'rgba(245,239,230,0.18)',
              transition: 'color 0.15s ease',
              touchAction: 'none', userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <GripVertical size={14} strokeWidth={1.8} />
          </div>
        )}

        {/* Muscle color dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: mv.color, flexShrink: 0, marginTop: 5 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Exercise name — full width, no truncation competition */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exData?.name || exercise.exerciseId}
            </p>
            {exercise.note && (
              <StickyNote size={11} color="rgba(245,158,11,0.55)" style={{ flexShrink: 0 }} />
            )}
            {showFormTip && (
              <button onClick={() => setFormTipOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Info size={13} color="var(--text3)" />
              </button>
            )}
          </div>

          {/* Meta row — muscle tag, rep range, last session */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '1.5px 5px', borderRadius: 4,
              background: mv.dim, color: mv.color,
            }}>
              {MUSCLE_NAMES[exData?.muscle] || exData?.muscle}
            </span>
            {repRange && (
              <span style={{
                fontSize: 10, padding: '1.5px 5px', borderRadius: 4,
                border: '0.5px solid var(--border2)',
                color: repRange.color || 'var(--text3)',
                background: 'transparent',
                fontFamily: 'DM Mono, monospace', fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {repRange.range || repRange.label}
              </span>
            )}
            {lastSession ? (
              <span style={{
                fontSize: 10.5, fontFamily: 'DM Mono, monospace',
                color: beating ? 'var(--green)' : 'var(--text3)',
                letterSpacing: '-0.01em',
              }}>
                {beating ? '↑ ' : ''}
                {lastSession.sets.slice(0, 3).map(s => `${s.weight}×${s.reps}`).join(', ')}
              </span>
            ) : (
              <span style={{ fontSize: 10.5, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                Primera vez
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
            >
              <MoreHorizontal size={16} color="var(--text3)" />
            </button>
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: 36, zIndex: 20,
                  background: 'rgba(16,13,9,0.96)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                  border: '0.5px solid rgba(255,235,200,0.12)',
                  borderRadius: 14, overflow: 'hidden', minWidth: 180,
                  boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.08), 0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  {currentPR && (
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 10.5, color: 'var(--text3)', marginBottom: 2 }}>Récord personal</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>
                        {currentPR.weight}kg × {currentPR.reps}
                      </p>
                    </div>
                  )}
                  {/* Note option */}
                  <button
                    onClick={() => { setMenuOpen(false); onOpenNote?.(exercise.id, exData?.name || exercise.exerciseId, exercise.note || '') }}
                    style={{ width: '100%', padding: '12px 14px', textAlign: 'left', fontSize: 14, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <StickyNote size={14} color="var(--text3)" />
                    {exercise.note ? 'Editar nota' : 'Añadir nota'}
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setRestOverrideOpen(true) }}
                    style={{ width: '100%', padding: '12px 14px', textAlign: 'left', fontSize: 14, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  >
                    Cambiar descanso
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onRemoveExercise() }}
                    style={{ width: '100%', padding: '12px 14px', textAlign: 'left', fontSize: 14, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Eliminar ejercicio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 4px' }}>
        <div style={{ width: 28, textAlign: 'center', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.05em', fontWeight: 600 }}>S</div>
        <div style={{ width: 80, textAlign: 'center', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.05em', fontWeight: 600 }}>PESO</div>
        <div style={{ width: 22 }} />
        <div style={{ width: 64, textAlign: 'center', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.05em', fontWeight: 600 }}>REPS</div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 44 }} />
      </div>

      {/* Sets */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column' }}>
        {exercise.sets.map((set, i) => {
          const w = parseFloat(set.weight) || 0
          const r = parseInt(set.reps) || 0
          const e1rm = r > 0 && w > 0 ? (r === 1 ? w : w * 36 / (37 - Math.min(r, 36))) : 0
          const isPR = set.completed && e1rm > 0 && (!currentPR || e1rm > currentPR.e1rm)
          const isDropset = set.type === 'dropset'

          // Check if next set is a dropset (for + Drop button logic)
          const nextSet = exercise.sets[i + 1]
          const hasFollowingDropset = nextSet?.type === 'dropset'
          const showDropButton = set.completed && !isDropset && !hasFollowingDropset

          return (
            <div key={set.id}>
              <SetRow
                set={set}
                setIndex={i}
                isPR={isPR}
                isNext={i === nextIncomplete}
                isDropset={isDropset}
                onUpdate={data => onUpdateSet(exercise.id, set.id, data)}
                onComplete={() => handleComplete(set.id)}
                onDelete={exercise.sets.length > 1 ? (() => onRemoveSet(exercise.id, set.id)) : null}
              />
              {/* + Drop button after completed normal sets */}
              {showDropButton && (
                <button
                  onClick={() => onAddDropset?.(exercise.id, set.id)}
                  className="pressable"
                  style={{
                    margin: '2px 0 2px 32px',
                    padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(245,158,11,0.08)',
                    border: '0.5px solid rgba(245,158,11,0.18)',
                    color: 'rgba(245,158,11,0.70)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <ChevronDown size={10} />
                  + Drop
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Add set */}
      <button
        onClick={() => onAddSet(exercise.id)}
        className="pressable"
        style={{
          width: 'calc(100% - 16px)', margin: '0 8px 10px',
          height: 40, borderRadius: 10,
          background: 'none', border: '1px dashed rgba(255,255,255,0.09)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: 'var(--text3)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >
        <Plus size={13} />
        Añadir serie
      </button>

      {/* Form tip sheet */}
      <AnimatePresence>
        {formTipOpen && showFormTip && (
          <FormTipSheet
            exerciseName={exData?.name || exercise.exerciseId}
            tips={FORM_TIPS[exercise.exerciseId]}
            onClose={() => setFormTipOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Rest override sheet */}
      <AnimatePresence>
        {restOverrideOpen && createPortal(
        <>
          <motion.div key="ro-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)' }} onClick={() => setRestOverrideOpen(false)} />
          <motion.div key="ro-sh" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: 'rgba(16,13,9,0.88)',
            backdropFilter: 'blur(56px) saturate(220%)',
            WebkitBackdropFilter: 'blur(56px) saturate(220%)',
            borderRadius: '32px 32px 0 0',
            boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
            padding: '20px 20px',
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom,0px))',
          }}>
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16, textAlign: 'center' }}>
              Tiempo de descanso
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {REST_PRESETS.map(secs => {
                const label = secs < 60 ? `${secs}s` : `${secs / 60}:00`
                return (
                  <button
                    key={secs}
                    onClick={() => {
                      restTimer.start(secs)
                      setRestOverrideOpen(false)
                    }}
                    className="pressable"
                    style={{
                      height: 44, padding: '0 16px', borderRadius: 'var(--r-pill)',
                      background: secs === 120 ? 'var(--accent-dim)' : 'var(--surface2)',
                      border: `1px solid ${secs === 120 ? 'var(--accent-border)' : 'var(--border2)'}`,
                      color: secs === 120 ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'DM Mono, monospace',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>,
        document.body
        )}
      </AnimatePresence>
    </div>
  )
})
