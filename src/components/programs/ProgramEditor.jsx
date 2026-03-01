// ─── ProgramEditor.jsx ───────────────────────────────────────────────────────
// PLANNING TOOL ONLY. Zero connection to workout session/activeWorkout.
// Reads/writes ONLY to the programs slice of the store.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronDown, Search, Check, GripVertical } from 'lucide-react'
import { Sheet } from '../ui/Sheet.jsx'
import { EXERCISES, MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

// ─── useDragReorder ───────────────────────────────────────────────────────────
// Pure pointer-event drag-to-reorder. Works on iOS Safari, no external deps.
// Returns { listRef, dragHandleProps, draggingIndex, overIndex }
// Call onReorder(fromIndex, toIndex) when drop completes.
function useDragReorder({ onReorder, itemHeightEstimate = 52 }) {
  const dragging   = useRef(null)   // { index, startY, currentY, el }
  const listRef    = useRef(null)
  const [dragState, setDragState] = useState({ active: null, over: null })

  const getTargetIndex = (clientY) => {
    if (!listRef.current) return dragging.current?.index ?? 0
    const items = Array.from(listRef.current.children)
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (clientY < rect.top + rect.height / 2) return i
    }
    return items.length - 1
  }

  const onPointerDown = useCallback((index, e) => {
    // Only single touch / left mouse
    if (e.button !== undefined && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = { index, startY: e.clientY, currentY: e.clientY }
    setDragState({ active: index, over: index })
    // Prevent scroll while dragging
    document.body.style.overflow = 'hidden'
    try { navigator.vibrate(10) } catch (_) {}
  }, [])

  const onPointerMove = useCallback((e) => {
    if (dragging.current === null) return
    dragging.current.currentY = e.clientY
    const over = getTargetIndex(e.clientY)
    setDragState(s => s.over === over ? s : { ...s, over })
  }, [])

  const onPointerUp = useCallback((e) => {
    if (dragging.current === null) return
    const from = dragging.current.index
    const to   = getTargetIndex(e.clientY)
    dragging.current = null
    document.body.style.overflow = ''
    setDragState({ active: null, over: null })
    if (from !== to) onReorder(from, to)
  }, [onReorder])

  const dragHandleProps = (index) => ({
    onPointerDown: (e) => onPointerDown(index, e),
    onPointerMove,
    onPointerUp,
    onPointerCancel: () => {
      dragging.current = null
      document.body.style.overflow = ''
      setDragState({ active: null, over: null })
    },
  })

  return { listRef, dragHandleProps, draggingIndex: dragState.active, overIndex: dragState.over }
}

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

// ─── InlineNumberInput — stepper ──────────────────────────────────────────────
function InlineNumberInput({ value, min, max, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'rgba(255,235,200,0.05)',
      border: '0.5px solid rgba(255,235,200,0.12)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      <button
        onClick={e => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
        style={{
          width: 24, height: 30, background: 'none', border: 'none',
          color: 'rgba(245,239,230,0.45)', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >−</button>
      <div style={{
        minWidth: 24, textAlign: 'center',
        fontSize: 12, fontWeight: 700,
        color: '#F5EFE6', fontFamily: 'DM Mono, monospace',
        userSelect: 'none',
      }}>
        {value}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
        style={{
          width: 24, height: 30, background: 'none', border: 'none',
          color: 'rgba(245,239,230,0.45)', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >+</button>
    </div>
  )
}

// ─── ExerciseRow ─────────────────────────────────────────────────────────────
function ExerciseRow({ exercise, isLast, onRemove, onUpdate, isDragging, isOver, dragHandleProps }) {
  const accentColor = getMHex(exercise.muscle)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '9px 12px', gap: 8,
      borderBottom: isLast ? 'none' : '0.5px solid rgba(255,235,200,0.05)',
      background: isDragging
        ? 'rgba(232,146,74,0.10)'
        : isOver
          ? 'rgba(232,146,74,0.04)'
          : 'transparent',
      opacity: isDragging ? 0.5 : 1,
      transition: 'background 0.12s ease, opacity 0.12s ease',
      touchAction: 'none',
    }}>
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        style={{
          width: 20, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'grab', touchAction: 'none',
          color: 'rgba(245,239,230,0.2)',
        }}
        onTouchStart={e => { e.currentTarget.style.color = 'rgba(245,239,230,0.5)' }}
        onTouchEnd={e => { e.currentTarget.style.color = 'rgba(245,239,230,0.2)' }}
      >
        <GripVertical size={14} />
      </div>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: accentColor, boxShadow: `0 0 5px ${accentColor}70`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#F5EFE6',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {exercise.name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(245,239,230,0.3)', marginTop: 1, textTransform: 'capitalize' }}>
          {MUSCLE_NAMES[exercise.muscle] || exercise.muscle}
        </div>
      </div>
      <InlineNumberInput value={exercise.sets} min={1} max={10} onChange={v => onUpdate('sets', v)} />
      <span style={{ fontSize: 11, color: 'rgba(245,239,230,0.25)', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>×</span>
      <InlineNumberInput value={exercise.reps} min={1} max={50} onChange={v => onUpdate('reps', v)} />
      <select
        value={exercise.restSeconds}
        onChange={e => onUpdate('restSeconds', parseInt(e.target.value))}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,235,200,0.05)', border: '0.5px solid rgba(255,235,200,0.1)',
          borderRadius: 7, color: 'rgba(245,239,230,0.5)',
          fontSize: 10, fontWeight: 600, padding: '3px 4px', cursor: 'pointer',
          fontFamily: 'DM Mono, monospace', outline: 'none',
          appearance: 'none', WebkitAppearance: 'none', flexShrink: 0,
        }}
      >
        <option value={45}>0:45</option>
        <option value={60}>1:00</option>
        <option value={90}>1:30</option>
        <option value={120}>2:00</option>
        <option value={150}>2:30</option>
        <option value={180}>3:00</option>
        <option value={240}>4:00</option>
      </select>
      <button
        onClick={onRemove}
        style={{
          width: 24, height: 24, borderRadius: 6, background: 'transparent', border: 'none',
          color: 'rgba(229,83,75,0.45)', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onTouchStart={e => { e.currentTarget.style.color = '#E5534B' }}
        onTouchEnd={e => { e.currentTarget.style.color = 'rgba(229,83,75,0.45)' }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── DayCard ──────────────────────────────────────────────────────────────────
function DayCard({
  day, dayIndex, isExpanded, onToggle, onRename, onRemove,
  onAddExercise, onRemoveExercise, onUpdateExercise, onReorderExercises,
  isDragging, isOver, dayDragHandleProps,
}) {
  const [editingName, setEditingName] = useState(false)

  const exDrag = useDragReorder({
    onReorder: onReorderExercises,
    itemHeightEstimate: 48,
  })

  return (
    <div style={{
      borderRadius: 18,
      background: isDragging ? 'rgba(232,146,74,0.08)' : 'rgba(22,18,12,0.78)',
      border: `0.5px solid ${isOver ? 'rgba(232,146,74,0.35)' : 'rgba(255,235,200,0.09)'}`,
      boxShadow: isDragging
        ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,200,0.08)'
        : 'inset 0 1px 0 rgba(255,235,200,0.05)',
      overflow: 'hidden',
      opacity: isDragging ? 0.55 : 1,
      transition: 'border-color 0.15s ease, opacity 0.15s ease, background 0.15s ease',
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '13px 14px', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent', userSelect: 'none',
        }}
      >
        {/* Day-level drag handle */}
        <div
          {...dayDragHandleProps}
          onClick={e => e.stopPropagation()}
          style={{
            width: 24, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginRight: 6, cursor: 'grab', touchAction: 'none',
            color: 'rgba(245,239,230,0.18)',
          }}
          onTouchStart={e => { e.currentTarget.style.color = 'rgba(245,239,230,0.5)' }}
          onTouchEnd={e => { e.currentTarget.style.color = 'rgba(245,239,230,0.18)' }}
        >
          <GripVertical size={15} />
        </div>

        {/* Day number */}
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0, marginRight: 10,
          background: 'rgba(232,146,74,0.12)', border: '0.5px solid rgba(232,146,74,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#E8924A',
        }}>
          {dayIndex + 1}
        </div>

        {/* Day name */}
        {editingName ? (
          <input
            autoFocus
            value={day.name}
            onChange={e => onRename(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false) }}
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              borderBottom: '1.5px solid rgba(232,146,74,0.5)',
              color: '#F5EFE6', fontSize: 14, fontWeight: 700,
              outline: 'none', fontFamily: 'inherit', padding: '1px 0',
            }}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F5EFE6' }}>{day.name}</span>
            <span
              onClick={e => { e.stopPropagation(); setEditingName(true) }}
              style={{ fontSize: 11, color: 'rgba(245,239,230,0.22)', cursor: 'text' }}
            >✎</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, flexShrink: 0 }}>
          {day.exercises.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(245,239,230,0.32)' }}>
              {day.exercises.length} ej.
            </span>
          )}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} color="rgba(245,239,230,0.28)" />
          </motion.div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{
            width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none',
            color: 'rgba(229,83,75,0.5)', cursor: 'pointer', marginLeft: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onTouchStart={e => { e.currentTarget.style.color = '#E5534B' }}
          onTouchEnd={e => { e.currentTarget.style.color = 'rgba(229,83,75,0.5)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '0.5px solid rgba(255,235,200,0.07)' }}>
              {day.exercises.length === 0 ? (
                <div style={{ padding: '18px 14px', textAlign: 'center', fontSize: 12, color: 'rgba(245,239,230,0.28)' }}>
                  Sin ejercicios — añade uno abajo
                </div>
              ) : (
                <div ref={exDrag.listRef}>
                  {day.exercises.map((ex, i) => (
                    <ExerciseRow
                      key={`${ex.exerciseId}-${i}`}
                      exercise={ex}
                      isLast={i === day.exercises.length - 1}
                      isDragging={exDrag.draggingIndex === i}
                      isOver={exDrag.overIndex === i && exDrag.draggingIndex !== null && exDrag.draggingIndex !== i}
                      dragHandleProps={exDrag.dragHandleProps(i)}
                      onRemove={() => onRemoveExercise(i)}
                      onUpdate={(field, val) => onUpdateExercise(i, field, val)}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={onAddExercise}
                style={{
                  width: '100%', height: 44, background: 'rgba(232,146,74,0.05)', border: 'none',
                  borderTop: day.exercises.length > 0 ? '0.5px solid rgba(255,235,200,0.06)' : 'none',
                  color: 'rgba(232,146,74,0.78)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  WebkitTapHighlightColor: 'transparent', transition: 'background 0.12s ease',
                }}
                onTouchStart={e => { e.currentTarget.style.background = 'rgba(232,146,74,0.1)' }}
                onTouchEnd={e => { e.currentTarget.style.background = 'rgba(232,146,74,0.05)' }}
              >
                <Plus size={13} /> Añadir ejercicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ExercisePickerSheet ──────────────────────────────────────────────────────
function ExercisePickerSheet({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const exercises = EXERCISES || []

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
              <motion.button
                key={ex.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleSelect(ex)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
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
                      {ex.equipment}
                    </div>
                  )}
                </div>
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
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(245,239,230,0.28)', fontSize: 14 }}>
          Sin resultados{query ? ` para "${query}"` : ''}
        </div>
      )}
    </Sheet>
  )
}

// ─── ProgramEditor — main export ─────────────────────────────────────────────
export function ProgramEditor({ open, onClose, program: existingProgram = null }) {
  const isEditing = !!existingProgram
  const saveCustomProgram = useStore(s => s.saveCustomProgram)
  const updateProgram     = useStore(s => s.updateProgram)
  const addToast          = useStore(s => s.addToast)

  const makeDay = (name, exercises = []) => ({
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    exercises,
  })

  const hydrateDay = (d) => ({
    id: d.id || `day-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

  const [name, setName]           = useState('')
  const [days, setDays]           = useState([])
  const [expandedDay, setExpanded] = useState(null)
  const [pickerDayId, setPickerId] = useState(null)

  // Reset state whenever the sheet opens or the target program changes
  useEffect(() => {
    if (!open) return
    if (existingProgram) {
      setName(existingProgram.name ?? '')
      const hydrated = (existingProgram.days ?? []).map(hydrateDay)
      setDays(hydrated)
      setExpanded(hydrated[0]?.id ?? null)
    } else {
      const firstDay = makeDay('Día 1')
      setName('')
      setDays([firstDay])
      setExpanded(firstDay.id)
    }
    setPickerId(null)
  }, [open, existingProgram?.id])

  // ── Day operations ────────────────────────────────────────────────────────
  const addDay = useCallback(() => {
    setDays(prev => {
      const d = makeDay(`Día ${prev.length + 1}`)
      setExpanded(d.id)
      return [...prev, d]
    })
  }, [])

  const removeDay = useCallback((dayId) => {
    setDays(prev => prev.filter(d => d.id !== dayId))
    setExpanded(prev => prev === dayId ? null : prev)
  }, [])

  const renameDay = useCallback((dayId, newName) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, name: newName } : d))
  }, [])

  // ── Reorder helpers ───────────────────────────────────────────────────────
  const reorder = (arr, from, to) => {
    const next = [...arr]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  }

  const reorderDays = useCallback((from, to) => {
    setDays(prev => reorder(prev, from, to))
  }, [])

  const reorderExercises = useCallback((dayId, from, to) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : { ...d, exercises: reorder(d.exercises, from, to) }
    ))
  }, [])

  // ── Day drag (initialized after reorderDays is defined) ───────────────────
  const dayDrag = useDragReorder({ onReorder: reorderDays })

  // ── Exercise operations ───────────────────────────────────────────────────
  const addExercise = useCallback((dayId, exercise) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        exercises: [...d.exercises, {
          exerciseId: exercise.id,
          name: exercise.name,
          muscle: exercise.muscle,
          sets: 3,
          reps: 10,
          restSeconds: 120,
        }],
      }
    ))
  }, [])

  const removeExercise = useCallback((dayId, exIndex) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        exercises: d.exercises.filter((_, i) => i !== exIndex),
      }
    ))
  }, [])

  const updateExerciseField = useCallback((dayId, exIndex, field, value) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        exercises: d.exercises.map((ex, i) => i !== exIndex ? ex : { ...ex, [field]: value }),
      }
    ))
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = name.trim().length >= 2
    && days.length >= 1
    && days.every(d => d.exercises.length >= 1)

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!isValid) return
    const program = {
      name: name.trim(),
      days,
      source: 'user',
      daysPerWeek: days.length,
    }
    if (isEditing) {
      updateProgram(existingProgram.id, {
        ...existingProgram,
        ...program,
        updatedAt: new Date().toISOString(),
      })
      addToast({ message: 'Programa actualizado ✓', type: 'success' })
    } else {
      saveCustomProgram({
        ...program,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      addToast({ message: 'Programa creado ✓', type: 'success' })
    }
    onClose()
  }

  return (
    <>
      <Sheet
        isOpen={open && !pickerDayId}
        onClose={onClose}
        size="full"
        title={isEditing ? 'Editar programa' : 'Nuevo programa'}
      >
        {/* ── Program name ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Nombre del programa</SectionLabel>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Mi PPL personalizado"
            maxLength={48}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(28,22,14,0.8)',
              border: `1.5px solid ${name.length >= 2 ? 'rgba(232,146,74,0.4)' : 'rgba(255,235,200,0.1)'}`,
              borderRadius: 14, padding: '14px 16px',
              fontSize: 16, fontWeight: 600, color: '#F5EFE6',
              outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>

        {/* ── Days ─────────────────────────────────────────────────────── */}
        <SectionLabel>
          Días de entrenamiento
          <span style={{ fontSize: 10, color: 'rgba(245,239,230,0.28)', fontWeight: 500 }}>
            {days.length}/7
          </span>
        </SectionLabel>

        <div ref={dayDrag.listRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {days.map((day, dayIndex) => (
            <DayCard
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              isExpanded={expandedDay === day.id}
              isDragging={dayDrag.draggingIndex === dayIndex}
              isOver={dayDrag.overIndex === dayIndex && dayDrag.draggingIndex !== null && dayDrag.draggingIndex !== dayIndex}
              dayDragHandleProps={dayDrag.dragHandleProps(dayIndex)}
              onToggle={() => setExpanded(expandedDay === day.id ? null : day.id)}
              onRename={newName => renameDay(day.id, newName)}
              onRemove={() => removeDay(day.id)}
              onAddExercise={() => { setExpanded(day.id); setPickerId(day.id) }}
              onRemoveExercise={i => removeExercise(day.id, i)}
              onUpdateExercise={(i, field, val) => updateExerciseField(day.id, i, field, val)}
              onReorderExercises={(from, to) => reorderExercises(day.id, from, to)}
            />
          ))}
        </div>

        {/* ── Add day ──────────────────────────────────────────────────── */}
        {days.length < 7 && (
          <button
            onClick={addDay}
            style={{
              width: '100%', height: 48, marginTop: 12,
              borderRadius: 14, background: 'rgba(255,235,200,0.04)',
              border: '1px dashed rgba(255,235,200,0.14)',
              color: 'rgba(232,146,74,0.72)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s ease', WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(232,146,74,0.07)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.04)' }}
          >
            <Plus size={15} color="rgba(232,146,74,0.72)" /> Añadir día
          </button>
        )}

        {/* ── Validation hint ───────────────────────────────────────────── */}
        {days.length > 0 && !isValid && name.trim().length >= 2 && (
          <p style={{
            fontSize: 12, textAlign: 'center',
            color: 'rgba(245,239,230,0.28)', marginTop: 12, lineHeight: 1.5,
          }}>
            Cada día necesita al menos un ejercicio
          </p>
        )}

        {/* ── Save button ───────────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={!isValid}
          style={{
            width: '100%', height: 52, marginTop: 24, marginBottom: 8,
            borderRadius: 14, border: 'none',
            background: isValid
              ? 'linear-gradient(135deg, #E8924A, #C9712D)'
              : 'rgba(255,235,200,0.06)',
            color: isValid ? 'rgba(255,245,235,0.96)' : 'rgba(245,239,230,0.2)',
            fontSize: 16, fontWeight: 700,
            cursor: isValid ? 'pointer' : 'default',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
            boxShadow: isValid ? '0 4px 20px rgba(232,146,74,0.25)' : 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={e => { if (isValid) e.currentTarget.style.opacity = '0.85' }}
          onTouchEnd={e => { e.currentTarget.style.opacity = '' }}
        >
          {isEditing ? 'Guardar cambios' : 'Crear programa'}
        </button>
      </Sheet>

      {/* ── Exercise picker — PLANNING ONLY, no workout connection ──────── */}
      <ExercisePickerSheet
        isOpen={!!pickerDayId}
        onClose={() => setPickerId(null)}
        onSelect={exercise => {
          if (pickerDayId) addExercise(pickerDayId, exercise)
          setPickerId(null)
        }}
      />
    </>
  )
}
