// ─── ProgramEditor.jsx ───────────────────────────────────────────────────────
// PLANNING TOOL ONLY. Zero connection to workout session/activeWorkout.
// Full-screen portal. Tab-based day navigation. Apple-quality UX.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Plus, X, Search, Check, ChevronLeft, GripVertical, Dumbbell, Clock, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Sheet, ConfirmDialog } from '../ui/Sheet.jsx'
import { EXERCISES, MUSCLE_NAMES, ALL_MUSCLES } from '../../data/exercises.js'
import useStore from '../../store/index.js'
import { useDragToReorder } from '../../hooks/useDragToReorder.js'
import { ensureProgramTemplates } from '../../utils/programs.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = [
  { id: 'all',       label: 'Todos' },
  { id: 'chest',     label: 'Pecho' },
  { id: 'back',      label: 'Espalda' },
  { id: 'shoulders', label: 'Hombros' },
  { id: 'arms',      label: 'Brazos' },
  { id: 'forearms',  label: 'Antebrazos' },
  { id: 'legs',      label: 'Piernas' },
  { id: 'calves',    label: 'Gemelos' },
  { id: 'core',      label: 'Core' },
]

const MUSCLE_HEX = {
  chest:     '#E8924A',
  back:      '#5B9CF6',
  shoulders: '#A37FD4',
  arms:      '#D4A843',
  forearms:  '#7EB8A0',
  legs:      '#34C77B',
  calves:    '#9B8EC4',
  core:      '#C46B3A',
}

const getMHex = (m) => MUSCLE_HEX[m] ?? 'rgba(245,239,230,0.35)'

// ─── REST OPTIONS ─────────────────────────────────────────────────────────────
const REST_OPTIONS = [
  { value: 30,  label: '0:30' },
  { value: 45,  label: '0:45' },
  { value: 60,  label: '1:00' },
  { value: 90,  label: '1:30' },
  { value: 120, label: '2:00' },
  { value: 150, label: '2:30' },
  { value: 180, label: '3:00' },
  { value: 240, label: '4:00' },
]

const EQUIPMENT_OPTIONS = [
  { id: 'barbell',    label: 'Barra' },
  { id: 'dumbbell',   label: 'Mancuernas' },
  { id: 'cable',      label: 'Polea' },
  { id: 'machine',    label: 'Máquina' },
  { id: 'bodyweight', label: 'Peso corporal' },
  { id: 'other',      label: 'Otro' },
]

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'rgba(245,239,230,0.35)',
      marginBottom: 8, paddingLeft: 2,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {children}
    </div>
  )
}

// ─── DayTabStrip ──────────────────────────────────────────────────────────────
// Horizontal scrollable tab strip. Each day is a pill tab.
// Active day highlighted with amber. + button adds a new day.
function DayTabStrip({ days, activeDayId, onSelect, onAdd, onDelete }) {
  const scrollRef = useRef(null)

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return
    const active = scrollRef.current.querySelector('[data-active="true"]')
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeDayId])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginBottom: 16,
      borderBottom: '0.5px solid rgba(255,235,200,0.07)',
    }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 12,
          paddingTop: 4,
        }}
      >
        {days.map((day, i) => {
          const isActive = day.id === activeDayId
          const hasExercises = day.exercises.length > 0
          return (
            <div key={day.id} style={{ position: 'relative', flexShrink: 0 }}>
              <motion.button
                data-active={isActive}
                onClick={() => onSelect(day.id)}
                whileTap={{ scale: 0.94 }}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 100,
                  border: 'none',
                  background: isActive
                    ? 'rgba(232,146,74,0.18)'
                    : 'rgba(255,235,200,0.05)',
                  color: isActive ? '#E8924A' : 'rgba(245,239,230,0.45)',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'background 0.18s ease, color 0.18s ease',
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                  outline: isActive ? '1.5px solid rgba(232,146,74,0.35)' : 'none',
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: isActive ? 'rgba(232,146,74,0.22)' : 'rgba(255,235,200,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800,
                  color: isActive ? '#E8924A' : 'rgba(245,239,230,0.35)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                {day.name}
                {/* Green dot if has exercises */}
                {hasExercises && (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#34C77B',
                    flexShrink: 0,
                    boxShadow: '0 0 4px rgba(52,199,123,0.6)',
                  }} />
                )}
              </motion.button>
              {/* Delete button — only show on hover/long-press, as a badge */}
              {days.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); onDelete(day.id) }}
                  style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'rgba(229,83,75,0.85)',
                    border: '1.5px solid #0C0A09',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10,
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <X size={8} color="white" strokeWidth={3} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Add day button */}
      {days.length < 7 && (
        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.88 }}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(232,146,74,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, marginLeft: 8, marginBottom: 12,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Plus size={16} color="#E8924A" strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  )
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────
// Premium exercise card for the day view. Much cleaner than the old row.
// Shows: muscle dot + name + muscle label | sets stepper | × | reps stepper | rest | delete
function ExerciseCard({ exercise, index, onRemove, onUpdate, dragHandlers, isDragging, isOver }) {
  const accent = getMHex(exercise.muscle)
  const muscleName = MUSCLE_NAMES[exercise.muscle] || exercise.muscle

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{
        opacity: isDragging ? 0.45 : 1,
        y: 0,
        scale: isDragging ? 1.03 : 1,
        boxShadow: isDragging
          ? '0 16px 48px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,235,200,0.12)'
          : isOver
            ? '0 0 0 1.5px rgba(232,146,74,0.45), inset 0 1px 0 rgba(255,235,200,0.06)'
            : '0 2px 8px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,235,200,0.05)',
      }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 480, damping: 36, mass: 0.9 }}
      style={{
        borderRadius: 16,
        background: 'rgba(22,18,12,0.82)',
        border: `0.5px solid ${isOver ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
        overflow: 'hidden',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {/* Muscle color left bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${accent}, ${accent}80)`,
        borderRadius: '16px 0 0 16px',
      }} />

      <div style={{ padding: '14px 14px 14px 18px' }}>
        {/* Top row: grip + name + muscle chip + delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {/* Grip handle */}
          <div
            {...dragHandlers}
            style={{
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'grab', flexShrink: 0,
              color: isDragging ? accent : 'rgba(245,239,230,0.22)',
              transition: 'color 0.15s ease',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            <GripVertical size={14} strokeWidth={1.8} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: '#F5EFE6',
              lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {exercise.name}
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(245,239,230,0.38)',
              marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: accent,
                display: 'inline-block', flexShrink: 0,
              }} />
              {muscleName}
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(229,83,75,0.08)',
              border: '0.5px solid rgba(229,83,75,0.15)',
              color: 'rgba(229,83,75,0.55)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.12s ease',
            }}
            onTouchStart={e => {
              e.currentTarget.style.background = 'rgba(229,83,75,0.18)'
              e.currentTarget.style.color = '#E5534B'
            }}
            onTouchEnd={e => {
              e.currentTarget.style.background = 'rgba(229,83,75,0.08)'
              e.currentTarget.style.color = 'rgba(229,83,75,0.55)'
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Bottom row: sets × reps + rest */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,235,200,0.03)',
          borderRadius: 10, padding: '8px 10px',
          border: '0.5px solid rgba(255,235,200,0.06)',
        }}>
          {/* Sets */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)' }}>
              Series
            </span>
            <StepperButton value={exercise.sets} min={1} max={10} onChange={v => onUpdate('sets', v)} />
          </div>

          <div style={{ fontSize: 16, color: 'rgba(245,239,230,0.15)', fontWeight: 300, flexShrink: 0 }}>×</div>

          {/* Reps */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)' }}>
              Reps
            </span>
            <StepperButton value={exercise.reps} min={1} max={50} onChange={v => onUpdate('reps', v)} />
          </div>

          <div style={{ width: 0.5, height: 32, background: 'rgba(255,235,200,0.08)', flexShrink: 0 }} />

          {/* Rest */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1.2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={8} /> Descanso
            </span>
            <select
              value={exercise.restSeconds}
              onChange={e => { e.stopPropagation(); onUpdate('restSeconds', parseInt(e.target.value)) }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'none', border: 'none',
                color: '#F5EFE6', fontSize: 13, fontWeight: 700,
                fontFamily: 'DM Mono, monospace',
                outline: 'none', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none',
                textAlign: 'center', width: '100%',
              }}
            >
              {REST_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── StepperButton ────────────────────────────────────────────────────────────
function StepperButton({ value, min, max, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
    }}>
      <button
        onClick={e => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
        style={{
          width: 28, height: 28, borderRadius: '8px 0 0 8px',
          background: 'rgba(255,235,200,0.06)',
          border: '0.5px solid rgba(255,235,200,0.1)',
          borderRight: 'none',
          color: 'rgba(245,239,230,0.55)', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.12)' }}
        onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.06)' }}
      >−</button>
      <div style={{
        width: 32, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,235,200,0.04)',
        border: '0.5px solid rgba(255,235,200,0.1)',
        fontSize: 13, fontWeight: 800, color: '#F5EFE6',
        fontFamily: 'DM Mono, monospace', userSelect: 'none',
      }}>
        {value}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
        style={{
          width: 28, height: 28, borderRadius: '0 8px 8px 0',
          background: 'rgba(255,235,200,0.06)',
          border: '0.5px solid rgba(255,235,200,0.1)',
          borderLeft: 'none',
          color: 'rgba(245,239,230,0.55)', fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.12)' }}
        onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.06)' }}
      >+</button>
    </div>
  )
}

// ─── SortableExerciseList ─────────────────────────────────────────────────────
// Uses useDragToReorder (Y-position based, works on iOS Safari).
// Renders ExerciseCard items with grip handles.
function SortableExerciseList({ exercises, onRemove, onUpdate, onReorder }) {
  const { containerRef, dragIndex, overIndex, isDragging, gripHandlers, containerHandlers } = useDragToReorder({
    onReorder: (from, to) => {
      const next = [...exercises]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      onReorder(next)
    },
  })

  return (
    <div
      ref={containerRef}
      {...containerHandlers}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        touchAction: isDragging ? 'none' : 'pan-y',
      }}
    >
      <AnimatePresence initial={false}>
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={`${ex.exerciseId}-${i}`}
            exercise={ex}
            index={i}
            isDragging={dragIndex === i}
            isOver={overIndex === i && dragIndex !== null && dragIndex !== i}
            dragHandlers={gripHandlers(i)}
            onRemove={() => onRemove(i)}
            onUpdate={(field, val) => onUpdate(i, field, val)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── DayNameInput ─────────────────────────────────────────────────────────────
function DayNameInput({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select()
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false) }}
        style={{
          background: 'transparent', border: 'none',
          borderBottom: '1.5px solid rgba(232,146,74,0.5)',
          color: '#F5EFE6', fontSize: 18, fontWeight: 800,
          letterSpacing: '-0.02em',
          outline: 'none', fontFamily: 'inherit',
          padding: '1px 0', width: '100%',
        }}
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{
        fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
        color: '#F5EFE6', cursor: 'text',
        display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      {value}
      <span style={{ fontSize: 12, color: 'rgba(245,239,230,0.2)', fontWeight: 400 }}>✎</span>
    </div>
  )
}

// ─── CustomExerciseCreator ───────────────────────────────────────────────────
function CustomExerciseCreator({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState('')
  const [equipment, setEquipment] = useState('barbell')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setMuscle('')
      setEquipment('barbell')
      setError('')
    }
  }, [open])

  const handleCreate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (!muscle) {
      setError('Selecciona un grupo muscular')
      return
    }

    const newEx = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      name: name.trim(),
      muscle,
      equipment,
      difficulty: 'principiante',
      isCustom: true,
    }

    try {
      const existing = JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]')
      localStorage.setItem('graw_custom_exercises', JSON.stringify([...existing, newEx]))
    } catch (e) {}

    onCreated?.(newEx)
    onClose?.()
  }

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,0.6)' }}
          />
          <motion.div
            key="cc-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 121,
              maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
              background: 'rgba(16,13,9,0.95)',
              backdropFilter: 'blur(56px) saturate(220%)',
              WebkitBackdropFilter: 'blur(56px) saturate(220%)',
              borderRadius: '32px 32px 0 0',
              boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0' }} />

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>Crear ejercicio propio</p>

              <div style={{ marginBottom: 16 }}>
                <p className="t-label" style={{ marginBottom: 8 }}>Nombre</p>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="Ej: Curl con Cuerda"
                  className="input"
                  style={{ fontSize: 16 }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <p className="t-label" style={{ marginBottom: 8 }}>Grupo muscular</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ALL_MUSCLES.map(m => {
                    const selected = muscle === m
                    return (
                      <button key={m} onClick={() => { setMuscle(m); setError('') }} className="pressable" style={{
                        padding: '7px 13px', borderRadius: 'var(--r-pill)',
                        background: selected ? 'rgba(232,146,74,0.14)' : 'var(--surface2)',
                        border: `1px solid ${selected ? 'rgba(232,146,74,0.35)' : 'var(--border)'}`,
                        color: selected ? '#E8924A' : 'var(--text2)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        {MUSCLE_NAMES[m]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <p className="t-label" style={{ marginBottom: 8 }}>Equipamiento</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <button key={eq.id} onClick={() => setEquipment(eq.id)} className="pressable" style={{
                      padding: '7px 13px', borderRadius: 'var(--r-pill)',
                      background: equipment === eq.id ? 'var(--accent-dim)' : 'var(--surface2)',
                      border: `1px solid ${equipment === eq.id ? 'var(--accent-border)' : 'var(--border)'}`,
                      color: equipment === eq.id ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>
                      {eq.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} className="pressable" style={{ flex: 1, height: 52, borderRadius: 14, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleCreate} className="pressable" style={{ flex: 2, height: 52, borderRadius: 14, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Crear ejercicio
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── ExercisePickerSheet ──────────────────────────────────────────────────────
function ExercisePickerSheet({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showCreator, setShowCreator] = useState(false)
  const [customExercises, setCustomExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]') } catch { return [] }
  })

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setMuscleFilter('all')
      try { setCustomExercises(JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]')) } catch {}
    }
  }, [isOpen])

  const exercises = [...EXERCISES, ...customExercises]

  const filtered = exercises.filter(ex => {
    const matchMuscle = muscleFilter === 'all' || ex.muscle === muscleFilter
    const matchQuery  = !query || ex.name.toLowerCase().includes(query.toLowerCase())
    return matchMuscle && matchQuery
  })

  const grouped = filtered.reduce((acc, ex) => {
    const key = ex.muscle ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(ex)
    return acc
  }, {})

  const deleteCustom = (id) => {
    try {
      const updated = customExercises.filter(e => e.id !== id)
      localStorage.setItem('graw_custom_exercises', JSON.stringify(updated))
      setCustomExercises(updated)
    } catch {}
  }

  const handleSelect = (exercise) => {
    setSelected(exercise.id)
    setTimeout(() => {
      onSelect(exercise)
      setSelected(null)
      setQuery('')
      setMuscleFilter('all')
    }, 160)
  }

  return (
    <Sheet isOpen={isOpen} onClose={() => { setQuery(''); setMuscleFilter('all'); onClose() }} size="full" title="Añadir ejercicio">
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={14} color="rgba(245,239,230,0.3)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(26,20,12,0.8)',
            border: '0.5px solid rgba(255,235,200,0.1)',
            borderRadius: 12, padding: '12px 14px 12px 36px',
            fontSize: 16, color: '#F5EFE6',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Muscle filter pills */}
      <div style={{
        display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 16, scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {MUSCLE_GROUPS.map(m => (
          <button
            key={m.id}
            onClick={() => setMuscleFilter(m.id)}
            style={{
              height: 30, padding: '0 12px', borderRadius: 100, border: 'none',
              background: muscleFilter === m.id ? 'rgba(232,146,74,0.16)' : 'rgba(255,235,200,0.06)',
              color: muscleFilter === m.id ? '#E8924A' : 'rgba(245,239,230,0.45)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Exercise list grouped by muscle */}
      {Object.entries(grouped).map(([muscle, exList]) => (
        <div key={muscle} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)',
            marginBottom: 7, paddingLeft: 2,
          }}>
            {MUSCLE_NAMES[muscle] || muscle}
          </div>
          <div style={{
            borderRadius: 14, background: 'rgba(22,18,12,0.7)',
            border: '0.5px solid rgba(255,235,200,0.07)', overflow: 'hidden',
          }}>
            {exList.map((ex, i) => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.button
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleSelect(ex)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    padding: '12px 14px',
                    background: selected === ex.id ? 'rgba(232,146,74,0.1)' : 'transparent',
                    border: 'none',
                    borderTop: i > 0 ? '0.5px solid rgba(255,235,200,0.05)' : 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'background 0.12s ease',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: getMHex(ex.muscle), marginRight: 10,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F5EFE6', lineHeight: 1.2 }}>
                      {ex.name}
                    </div>
                    {ex.equipment && (
                      <div style={{ fontSize: 11, color: 'rgba(245,239,230,0.28)', marginTop: 2 }}>
                        {ex.equipment}{ex.isCustom ? ' · Propio' : ''}
                      </div>
                    )}
                  </div>
                  {ex.isCustom && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)', flexShrink: 0 }}>
                      PROPIO
                    </span>
                  )}
                  <AnimatePresence>
                    {selected === ex.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{ marginLeft: 8, flexShrink: 0 }}
                      >
                        <Check size={16} color="#E8924A" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {ex.isCustom && (
                  <button
                    onClick={() => deleteCustom(ex.id)}
                    style={{ padding: '0 14px', height: 48, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(245,239,230,0.28)', fontSize: 14 }}>
          Sin resultados{query ? ` para "${query}"` : ''}
        </div>
      )}

      {/* Create custom exercise CTA */}
      <button
        onClick={() => setShowCreator(true)}
        style={{
          width: '100%', height: 48, marginTop: 8,
          borderRadius: 14,
          border: '1.5px dashed rgba(232,146,74,0.25)',
          background: 'rgba(232,146,74,0.04)',
          color: '#E8924A', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Plus size={14} /> Crear ejercicio propio
      </button>

      <CustomExerciseCreator
        open={showCreator}
        onClose={() => setShowCreator(false)}
        onCreated={(ex) => {
          setCustomExercises(prev => [...prev, ex])
          handleSelect(ex)
          setShowCreator(false)
        }}
      />
    </Sheet>
  )
}
// ─── ProgramEditor — full-screen, tab-based ───────────────────────────────────
// Rendered into portal. Apple-quality. Tab strip for day navigation.
// No bottom sheet. No swipe-to-dismiss. Drag-to-reorder works perfectly.
// ─────────────────────────────────────────────────────────────────────────────
export function ProgramEditor({ open, onClose, program: existingProgram = null }) {
  const isEditing         = !!existingProgram
  const saveCustomProgram = useStore(s => s.saveCustomProgram)
  const updateProgram     = useStore(s => s.updateProgram)
  const setActiveProgram  = useStore(s => s.setActiveProgram)
  const createTemplate    = useStore(s => s.createTemplate)
  const updateTemplate    = useStore(s => s.updateTemplate)
  const addToast          = useStore(s => s.addToast)

  // ── Helpers ────────────────────────────────────────────────────────────────
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const makeDay = (name = 'Día 1') => ({ id: `day-${uid()}`, name, exercises: [] })

  const hydrateDay = (d) => ({
    id: d.id || `day-${uid()}`,
    name: d.name || 'Día',
    exercises: (d.exercises || []).map(ex => ({
      exerciseId: ex.exerciseId,
      name: ex.name || EXERCISES.find(e => e.id === ex.exerciseId)?.name || ex.exerciseId,
      muscle: ex.muscle || EXERCISES.find(e => e.id === ex.exerciseId)?.muscle || 'chest',
      sets: ex.sets ?? 3,
      reps: ex.reps ?? 10,
      restSeconds: ex.restSeconds ?? 120,
    })),
  })

  // ── State ──────────────────────────────────────────────────────────────────
  const [progName, setProgName]        = useState('')
  const [days, setDays]                = useState([])
  const [activeDayId, setActiveDayId]  = useState(null)
  const [pickerDayId, setPickerId]     = useState(null)
  const [confirmExit, setConfirmExit]  = useState(false)
  const originalRef                    = useRef(null)
  const bodyRef                        = useRef(null)

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (existingProgram) {
      const hydrated = (existingProgram.days ?? []).map(hydrateDay)
      setProgName(existingProgram.name ?? '')
      setDays(hydrated)
      setActiveDayId(hydrated[0]?.id ?? null)
      originalRef.current = JSON.stringify({ name: existingProgram.name, days: hydrated })
    } else {
      const first = makeDay('Día 1')
      setProgName('')
      setDays([first])
      setActiveDayId(first.id)
      originalRef.current = JSON.stringify({ name: '', days: [first] })
    }
    setPickerId(null)
    setConfirmExit(false)
  }, [open, existingProgram?.id])

  // ── Dirty check ────────────────────────────────────────────────────────────
  const isDirty = () => JSON.stringify({ name: progName, days }) !== originalRef.current

  const handleBack = () => {
    if (isDirty()) setConfirmExit(true)
    else onClose()
  }

  // ── Day CRUD ───────────────────────────────────────────────────────────────
  const addDay = () => {
    const d = makeDay(`Día ${days.length + 1}`)
    setDays(prev => [...prev, d])
    setActiveDayId(d.id)
    // Scroll body to bottom after add
    setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, 100)
  }

  const deleteDay = (dayId) => {
    setDays(prev => {
      const next = prev.filter(d => d.id !== dayId)
      if (activeDayId === dayId) setActiveDayId(next[0]?.id ?? null)
      return next
    })
  }

  const renameActiveDay = (newName) => {
    setDays(prev => prev.map(d => d.id === activeDayId ? { ...d, name: newName } : d))
  }

  // ── Exercise CRUD ──────────────────────────────────────────────────────────
  const addExercise = (exercise) => {
    setDays(prev => prev.map(d =>
      d.id !== activeDayId ? d : {
        ...d,
        exercises: [...d.exercises, {
          exerciseId: exercise.id,
          name: exercise.name,
          muscle: exercise.muscle,
          sets: 3, reps: 10, restSeconds: 120,
        }],
      }
    ))
  }

  const removeExercise = (exIndex) => {
    setDays(prev => prev.map(d =>
      d.id !== activeDayId ? d : {
        ...d, exercises: d.exercises.filter((_, i) => i !== exIndex),
      }
    ))
  }

  const updateExercise = (exIndex, field, value) => {
    setDays(prev => prev.map(d =>
      d.id !== activeDayId ? d : {
        ...d,
        exercises: d.exercises.map((ex, i) => i !== exIndex ? ex : { ...ex, [field]: value }),
      }
    ))
  }

  const reorderExercises = (newList) => {
    setDays(prev => prev.map(d =>
      d.id !== activeDayId ? d : { ...d, exercises: newList }
    ))
  }

  // ── Validation & save ──────────────────────────────────────────────────────
  const activeDay = days.find(d => d.id === activeDayId)
  const isValid = progName.trim().length >= 2
    && days.length >= 1
    && days.every(d => d.exercises.length >= 1)

  const handleSave = () => {
    if (!isValid) return
    const payload = { name: progName.trim(), days, source: 'user', daysPerWeek: days.length }

    if (isEditing) {
      const normalized = ensureProgramTemplates(
        { ...existingProgram, ...payload, updatedAt: new Date().toISOString() },
        { createTemplate, updateTemplate }
      )
      updateProgram(existingProgram.id, normalized)
      setActiveProgram(existingProgram.id)
      addToast({ message: 'Programa actualizado ✓', type: 'success' })
    } else {
      const programId = `user-${uid()}`
      const normalized = ensureProgramTemplates(
        { ...payload, id: programId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { createTemplate, updateTemplate }
      )
      saveCustomProgram(normalized)
      setActiveProgram(programId)
      addToast({ message: 'Programa creado ✓', type: 'success' })
    }
    onClose()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!open) return null

  return createPortal(
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          FULL SCREEN EDITOR
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        key="pe-screen"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 38, mass: 1 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: '#0C0A09',
          display: 'flex', flexDirection: 'column',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          overscrollBehavior: 'none',
        }}
      >
        {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56, paddingLeft: 4, paddingRight: 16, flexShrink: 0,
          background: 'rgba(12,10,9,0.92)',
          backdropFilter: 'blur(40px) saturate(220%)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%)',
          borderBottom: '0.5px solid rgba(255,235,200,0.07)',
          position: 'relative', zIndex: 10,
        }}>
          <button
            onClick={handleBack}
            style={{
              minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', color: 'rgba(245,239,230,0.55)',
              fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              paddingLeft: 12, WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => { e.currentTarget.style.opacity = '0.5' }}
            onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            Cancelar
          </button>

          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#F5EFE6',
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            {isEditing ? 'Editar programa' : 'Nuevo programa'}
          </div>

          <motion.button
            onClick={handleSave}
            disabled={!isValid}
            animate={{ opacity: isValid ? 1 : 0.3, scale: isValid ? 1 : 0.95 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{
              height: 36, padding: '0 18px', borderRadius: 100, border: 'none',
              background: 'linear-gradient(135deg, #E8924A, #C9712D)',
              color: '#FFF8F2', fontSize: 14, fontWeight: 700,
              cursor: isValid ? 'pointer' : 'default', fontFamily: 'inherit',
              boxShadow: isValid ? '0 2px 14px rgba(232,146,74,0.38)' : 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => { if (isValid) e.currentTarget.style.opacity = '0.78' }}
            onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
          >
            Guardar
          </motion.button>
        </div>

        {/* ── SCROLLABLE BODY ──────────────────────────────────────────────── */}
        <div
          ref={bodyRef}
          style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* ── PROGRAM NAME ────────────────────────────────────────────── */}
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)', marginBottom: 8 }}>
              Nombre del programa
            </div>
            <input
              type="text"
              value={progName}
              onChange={e => setProgName(e.target.value)}
              placeholder="Ej: Mi PPL personalizado"
              maxLength={48}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(28,22,14,0.9)',
                border: `1.5px solid ${progName.length >= 2 ? 'rgba(232,146,74,0.45)' : 'rgba(255,235,200,0.08)'}`,
                borderRadius: 16, padding: '14px 16px',
                fontSize: 16, fontWeight: 600, color: '#F5EFE6',
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.22s ease',
              }}
            />
          </div>

          {/* ── DAY TABS ────────────────────────────────────────────────── */}
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)', marginBottom: 12 }}>
              Días de entrenamiento — {days.length}/7
            </div>
            <DayTabStrip
              days={days}
              activeDayId={activeDayId}
              onSelect={setActiveDayId}
              onAdd={addDay}
              onDelete={deleteDay}
            />
          </div>

          {/* ── ACTIVE DAY VIEW ─────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {activeDay && (
              <motion.div
                key={activeDay.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                style={{ padding: '0 16px' }}
              >
                {/* Day name editable */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                  <DayNameInput
                    value={activeDay.name}
                    onChange={renameActiveDay}
                  />
                  <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.25)', fontWeight: 500 }}>
                    {activeDay.exercises.length} ejercicio{activeDay.exercises.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Exercise list */}
                {activeDay.exercises.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      borderRadius: 20,
                      background: 'rgba(255,235,200,0.02)',
                      border: '1.5px dashed rgba(255,235,200,0.08)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🏋️</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(245,239,230,0.45)', marginBottom: 6 }}>
                      Sin ejercicios
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(245,239,230,0.25)', lineHeight: 1.5 }}>
                      Añade ejercicios para diseñar este día
                    </div>
                  </motion.div>
                ) : (
                  <SortableExerciseList
                    exercises={activeDay.exercises}
                    onReorder={reorderExercises}
                    onRemove={removeExercise}
                    onUpdate={updateExercise}
                  />
                )}

                {/* Add exercise button */}
                <motion.button
                  onClick={() => setPickerId(activeDayId)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', height: 52, marginTop: 12, marginBottom: 8,
                    borderRadius: 16,
                    background: 'rgba(232,146,74,0.07)',
                    border: '1px solid rgba(232,146,74,0.2)',
                    color: '#E8924A', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 0.15s ease, border-color 0.15s ease',
                  }}
                  onTouchStart={e => {
                    e.currentTarget.style.background = 'rgba(232,146,74,0.13)'
                    e.currentTarget.style.borderColor = 'rgba(232,146,74,0.38)'
                  }}
                  onTouchEnd={e => {
                    e.currentTarget.style.background = 'rgba(232,146,74,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(232,146,74,0.2)'
                  }}
                >
                  <Dumbbell size={16} strokeWidth={2} />
                  Añadir ejercicio
                </motion.button>

                {/* Validation hint for this day */}
                {activeDay.exercises.length === 0 && progName.trim().length >= 2 && (
                  <p style={{
                    fontSize: 11, textAlign: 'center',
                    color: 'rgba(245,239,230,0.22)',
                    marginTop: 4, lineHeight: 1.5,
                  }}>
                    Este día necesita al menos un ejercicio
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── COMPLETION PROGRESS ─────────────────────────────────────── */}
          {days.length > 0 && (
            <div style={{ padding: '12px 16px 0' }}>
              <div style={{
                borderRadius: 14, padding: '12px 16px',
                background: 'rgba(255,235,200,0.03)',
                border: '0.5px solid rgba(255,235,200,0.07)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'rgba(245,239,230,0.35)', marginBottom: 6 }}>
                    Progreso del programa
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {days.map(d => (
                      <motion.div
                        key={d.id}
                        animate={{
                          background: d.exercises.length > 0
                            ? '#34C77B'
                            : d.id === activeDayId
                              ? 'rgba(232,146,74,0.5)'
                              : 'rgba(255,235,200,0.1)',
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          flex: 1, height: 4, borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,239,230,0.6)', fontFamily: 'DM Mono, monospace' }}>
                  {days.filter(d => d.exercises.length > 0).length}/{days.length}
                </div>
              </div>
            </div>
          )}

          {/* ── SAVE BUTTON ─────────────────────────────────────────────── */}
          <div style={{ padding: '20px 16px 0' }}>
            <motion.button
              onClick={handleSave}
              disabled={!isValid}
              animate={{ opacity: isValid ? 1 : 0.3, y: isValid ? 0 : 3 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              style={{
                width: '100%', height: 56, borderRadius: 18, border: 'none',
                background: 'linear-gradient(135deg, #E8924A 0%, #C9712D 100%)',
                color: '#FFF8F2', fontSize: 16, fontWeight: 800,
                letterSpacing: '-0.02em',
                cursor: isValid ? 'pointer' : 'default', fontFamily: 'inherit',
                boxShadow: isValid
                  ? '0 4px 28px rgba(232,146,74,0.32), inset 0 1px 0 rgba(255,255,255,0.14)'
                  : 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              onTouchStart={e => { if (isValid) e.currentTarget.style.opacity = '0.82' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
            >
              {isEditing ? 'Guardar cambios' : 'Crear programa'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── EXERCISE PICKER ───────────────────────────────────────────────── */}
      <ExercisePickerSheet
        isOpen={!!pickerDayId}
        onClose={() => setPickerId(null)}
        onSelect={exercise => {
          addExercise(exercise)
          setPickerId(null)
        }}
      />

      {/* ── DISCARD CONFIRM ───────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={() => { setConfirmExit(false); onClose() }}
        title="¿Descartar cambios?"
        message="Los cambios que hiciste no se guardarán si sales ahora."
        confirmLabel="Descartar"
        confirmDestructive
      />
    </>,
    document.body
  )
}
