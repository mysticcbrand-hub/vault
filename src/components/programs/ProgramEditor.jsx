// ─── ProgramEditor.jsx ───────────────────────────────────────────────────────
// PLANNING TOOL ONLY. Zero connection to workout session/activeWorkout.
// Reads/writes ONLY to the programs slice of the store.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronDown, Search, Check, ChevronLeft } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Sheet, ConfirmDialog } from '../ui/Sheet.jsx'
import { EXERCISES, MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'
import { SortableDayList } from './SortableDayList.jsx'
import { SortableExerciseList } from './SortableExerciseList.jsx'

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
// Clean — drag handle is owned by DraggableCard wrapper, not here.
function ExerciseRow({ exercise, isLast, onRemove, onUpdate }) {
  const accentColor = getMHex(exercise.muscle)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '9px 12px 9px 0', gap: 8,
      borderBottom: isLast ? 'none' : '0.5px solid rgba(255,235,200,0.05)',
    }}>
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
        onClick={e => { e.stopPropagation(); onRemove() }}
        style={{
          width: 28, height: 28, borderRadius: 7, background: 'transparent', border: 'none',
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
// Clean — drag handle is owned by DraggableCard wrapper above this.
// Exercise list uses SortableExerciseList for Apple-style sub-drag.
function DayCard({
  day, dayIndex, isExpanded, onToggle, onRename, onRemove,
  onAddExercise, onRemoveExercise, onUpdateExercise, onReorderExercises,
}) {
  const [editingName, setEditingName] = useState(false)

  return (
    <div style={{
      borderRadius: 18,
      background: 'rgba(22,18,12,0.78)',
      border: '0.5px solid rgba(255,235,200,0.09)',
      boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.05)',
      overflow: 'hidden',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '13px 14px', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent', userSelect: 'none',
        }}
      >
        {/* Day number badge */}
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0, marginRight: 10,
          background: 'rgba(232,146,74,0.12)', border: '0.5px solid rgba(232,146,74,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#E8924A',
        }}>
          {dayIndex + 1}
        </div>

        {/* Day name — tappable to edit inline */}
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
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, color: '#F5EFE6',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {day.name}
            </span>
            <span
              onClick={e => { e.stopPropagation(); setEditingName(true) }}
              style={{ fontSize: 11, color: 'rgba(245,239,230,0.22)', cursor: 'text', flexShrink: 0 }}
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
            width: 32, height: 32, borderRadius: 9, background: 'transparent', border: 'none',
            color: 'rgba(229,83,75,0.5)', cursor: 'pointer', marginLeft: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onTouchStart={e => { e.currentTarget.style.color = '#E5534B' }}
          onTouchEnd={e => { e.currentTarget.style.color = 'rgba(229,83,75,0.5)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Expanded body ───────────────────────────────────────────────────── */}
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
                <div style={{
                  padding: '20px 14px', textAlign: 'center',
                  fontSize: 12, color: 'rgba(245,239,230,0.28)', lineHeight: 1.6,
                }}>
                  Sin ejercicios — añade uno abajo
                </div>
              ) : (
                <SortableExerciseList
                  exercises={day.exercises}
                  onReorder={onReorderExercises}
                  onRemove={onRemoveExercise}
                  onUpdate={(i, field, val) => onUpdateExercise(i, field, val)}
                  ExerciseRowComponent={ExerciseRow}
                />
              )}
              <button
                onClick={e => { e.stopPropagation(); onAddExercise() }}
                style={{
                  width: '100%', height: 46, background: 'rgba(232,146,74,0.05)', border: 'none',
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
// ─── ProgramEditor — full-screen native view ──────────────────────────────────
// Rendered into a portal at document.body.
// No bottom-sheet, no swipe-to-dismiss — clean push navigation like UINavigationController.
// Drag-to-reorder works unobstructed because there is zero touch conflict.
// ─────────────────────────────────────────────────────────────────────────────
export function ProgramEditor({ open, onClose, program: existingProgram = null }) {
  const isEditing         = !!existingProgram
  const saveCustomProgram = useStore(s => s.saveCustomProgram)
  const updateProgram     = useStore(s => s.updateProgram)
  const addToast          = useStore(s => s.addToast)

  // ── Helpers ────────────────────────────────────────────────────────────────
  const makeDay = (name = 'Día 1', exercises = []) => ({
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    exercises,
  })

  const hydrateDay = (d) => ({
    id: d.id || `day-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
  const [name, setName]            = useState('')
  const [days, setDays]            = useState([])
  const [expandedDay, setExpanded] = useState(null)
  const [pickerDayId, setPickerId] = useState(null)
  const [dirty, setDirty]          = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  // Track original snapshot to detect real changes
  const originalRef = useRef(null)

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    if (existingProgram) {
      const hydrated = (existingProgram.days ?? []).map(hydrateDay)
      setName(existingProgram.name ?? '')
      setDays(hydrated)
      setExpanded(hydrated[0]?.id ?? null)
      originalRef.current = JSON.stringify({ name: existingProgram.name, days: hydrated })
    } else {
      const firstDay = makeDay('Día 1')
      setName('')
      setDays([firstDay])
      setExpanded(firstDay.id)
      originalRef.current = JSON.stringify({ name: '', days: [firstDay] })
    }
    setDirty(false)
    setPickerId(null)
    setConfirmExit(false)
  }, [open, existingProgram?.id])

  // ── Dirty tracking ─────────────────────────────────────────────────────────
  const mark = () => setDirty(true)

  // ── Back / Cancel ──────────────────────────────────────────────────────────
  const handleBack = () => {
    const current = JSON.stringify({ name, days })
    const changed = current !== originalRef.current
    if (changed) {
      setConfirmExit(true)
    } else {
      onClose()
    }
  }

  // ── Day operations ─────────────────────────────────────────────────────────
  const addDay = useCallback(() => {
    setDays(prev => {
      const d = makeDay(`Día ${prev.length + 1}`)
      setExpanded(d.id)
      return [...prev, d]
    })
    mark()
  }, [])

  const removeDay = useCallback((dayId) => {
    setDays(prev => prev.filter(d => d.id !== dayId))
    setExpanded(prev => prev === dayId ? null : prev)
    mark()
  }, [])

  const renameDay = useCallback((dayId, newName) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, name: newName } : d))
    mark()
  }, [])

  // ── Reorder ────────────────────────────────────────────────────────────────
  // SortableDayList / SortableExerciseList call these with the full new array.
  const reorderDays = useCallback((newDays) => {
    setDays(newDays)
    mark()
  }, [])

  const reorderExercisesInDay = useCallback((dayId, newExercises) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : { ...d, exercises: newExercises }
    ))
    mark()
  }, [])

  // ── Exercise operations ────────────────────────────────────────────────────
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
    mark()
  }, [])

  const removeExercise = useCallback((dayId, exIndex) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : { ...d, exercises: d.exercises.filter((_, i) => i !== exIndex) }
    ))
    mark()
  }, [])

  const updateExerciseField = useCallback((dayId, exIndex, field, value) => {
    setDays(prev => prev.map(d =>
      d.id !== dayId ? d : {
        ...d,
        exercises: d.exercises.map((ex, i) => i !== exIndex ? ex : { ...ex, [field]: value }),
      }
    ))
    mark()
  }, [])

  // ── Validation ─────────────────────────────────────────────────────────────
  const isValid = name.trim().length >= 2
    && days.length >= 1
    && days.every(d => d.exercises.length >= 1)

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!isValid) return
    const payload = {
      name: name.trim(),
      days,
      source: 'user',
      daysPerWeek: days.length,
    }
    if (isEditing) {
      updateProgram(existingProgram.id, {
        ...existingProgram,
        ...payload,
        updatedAt: new Date().toISOString(),
      })
      addToast({ message: 'Programa actualizado ✓', type: 'success' })
    } else {
      saveCustomProgram({
        ...payload,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      addToast({ message: 'Programa creado ✓', type: 'success' })
    }
    onClose()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!open) return null

  return createPortal(
    <>
      {/* ── Full-screen editor ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {!pickerDayId && (
          <motion.div
            key="editor-screen"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 40, mass: 1 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'var(--bg, #0C0A09)',
              display: 'flex',
              flexDirection: 'column',
              // iOS safe areas
              paddingTop: 'env(safe-area-inset-top, 0px)',
              overscrollBehavior: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* ── Top navigation bar ─────────────────────────────────────── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 56,
              paddingLeft: 4,
              paddingRight: 16,
              flexShrink: 0,
              background: 'rgba(12,10,9,0.88)',
              backdropFilter: 'blur(40px) saturate(220%) brightness(1.05)',
              WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(1.05)',
              borderBottom: '0.5px solid rgba(255,235,200,0.08)',
              boxShadow: 'inset 0 -1px 0 rgba(255,235,200,0.04)',
              zIndex: 1,
            }}>
              {/* Cancel button */}
              <button
                onClick={handleBack}
                style={{
                  minWidth: 44, minHeight: 44,
                  display: 'flex', alignItems: 'center', gap: 2,
                  background: 'none', border: 'none',
                  color: 'rgba(245,239,230,0.55)',
                  fontSize: 15, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  paddingLeft: 12, paddingRight: 8,
                  WebkitTapHighlightColor: 'transparent',
                }}
                onTouchStart={e => { e.currentTarget.style.opacity = '0.6' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
                Cancelar
              </button>

              {/* Title */}
              <div style={{
                position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em',
                color: '#F5EFE6', pointerEvents: 'none',
              }}>
                {isEditing ? 'Editar programa' : 'Nuevo programa'}
              </div>

              {/* Save button */}
              <motion.button
                onClick={handleSave}
                disabled={!isValid}
                animate={{ opacity: isValid ? 1 : 0.35, scale: isValid ? 1 : 0.97 }}
                transition={{ duration: 0.18 }}
                style={{
                  height: 36, padding: '0 16px',
                  borderRadius: 100,
                  background: isValid
                    ? 'linear-gradient(135deg, #E8924A, #C9712D)'
                    : 'rgba(255,235,200,0.08)',
                  border: 'none',
                  color: isValid ? '#FFF8F2' : 'rgba(245,239,230,0.4)',
                  fontSize: 14, fontWeight: 700,
                  cursor: isValid ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  boxShadow: isValid ? '0 2px 12px rgba(232,146,74,0.35)' : 'none',
                  transition: 'box-shadow 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onTouchStart={e => { if (isValid) e.currentTarget.style.opacity = '0.8' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
              >
                Guardar
              </motion.button>
            </div>

            {/* ── Scrollable body ────────────────────────────────────────── */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              padding: '24px 16px',
              paddingBottom: 'calc(48px + env(safe-area-inset-bottom, 0px))',
            }}>
              {/* Program name input */}
              <div style={{ marginBottom: 28 }}>
                <SectionLabel>Nombre del programa</SectionLabel>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); mark() }}
                  placeholder="Ej: Mi PPL personalizado"
                  maxLength={48}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(28,22,14,0.9)',
                    border: `1.5px solid ${name.length >= 2 ? 'rgba(232,146,74,0.45)' : 'rgba(255,235,200,0.09)'}`,
                    borderRadius: 16, padding: '15px 16px',
                    fontSize: 16, fontWeight: 600, color: '#F5EFE6',
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.22s ease',
                    boxShadow: name.length >= 2 ? 'inset 0 0 0 0.5px rgba(232,146,74,0.1)' : 'none',
                  }}
                />
              </div>

              {/* Days section */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <SectionLabel>
                  Días&nbsp;
                  <span style={{ fontWeight: 500, color: 'rgba(245,239,230,0.22)' }}>
                    {days.length}/7
                  </span>
                </SectionLabel>
                {days.length > 1 && (
                  <span style={{ fontSize: 11, color: 'rgba(245,239,230,0.22)', fontWeight: 500 }}>
                    ⠿ Arrastra para ordenar
                  </span>
                )}
              </div>

              {/* Day list — Apple-style drag-to-reorder */}
              <SortableDayList
                days={days}
                onReorder={reorderDays}
                DayCardComponent={DayCard}
                expandedDay={expandedDay}
                onToggle={(dayId) => setExpanded(expandedDay === dayId ? null : dayId)}
                onRename={(dayId, n) => renameDay(dayId, n)}
                onRemove={(dayId) => removeDay(dayId)}
                onAddExercise={(dayId) => { setExpanded(dayId); setPickerId(dayId) }}
                onRemoveExercise={(dayId, i) => removeExercise(dayId, i)}
                onUpdateExercise={(dayId, i, f, v) => updateExerciseField(dayId, i, f, v)}
                onReorderExercises={(dayId, newExs) => reorderExercisesInDay(dayId, newExs)}
              />

              {/* Add day */}
              {days.length < 7 && (
                <button
                  onClick={addDay}
                  style={{
                    width: '100%', height: 50, marginTop: 12,
                    borderRadius: 16,
                    background: 'rgba(255,235,200,0.03)',
                    border: '1.5px dashed rgba(232,146,74,0.2)',
                    color: 'rgba(232,146,74,0.7)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'all 0.16s ease', WebkitTapHighlightColor: 'transparent',
                  }}
                  onTouchStart={e => {
                    e.currentTarget.style.background = 'rgba(232,146,74,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(232,146,74,0.35)'
                  }}
                  onTouchEnd={e => {
                    e.currentTarget.style.background = 'rgba(255,235,200,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(232,146,74,0.2)'
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} /> Añadir día
                </button>
              )}

              {/* Validation hint */}
              <AnimatePresence>
                {days.length > 0 && !isValid && name.trim().length >= 2 && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontSize: 12, textAlign: 'center',
                      color: 'rgba(245,239,230,0.3)',
                      marginTop: 14, lineHeight: 1.6,
                    }}
                  >
                    Cada día necesita al menos un ejercicio
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Save button — also in body for reachability on small screens */}
              <motion.button
                onClick={handleSave}
                disabled={!isValid}
                animate={{
                  opacity: isValid ? 1 : 0.28,
                  y: isValid ? 0 : 4,
                }}
                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  width: '100%', height: 54, marginTop: 28,
                  borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, #E8924A 0%, #C9712D 100%)',
                  color: '#FFF8F2',
                  fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
                  cursor: isValid ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  boxShadow: isValid
                    ? '0 4px 24px rgba(232,146,74,0.30), inset 0 1px 0 rgba(255,255,255,0.12)'
                    : 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onTouchStart={e => { if (isValid) e.currentTarget.style.opacity = '0.82' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
              >
                {isEditing ? 'Guardar cambios' : 'Crear programa'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exercise picker — rendered on top of editor ─────────────────────── */}
      <ExercisePickerSheet
        isOpen={!!pickerDayId}
        onClose={() => setPickerId(null)}
        onSelect={exercise => {
          if (pickerDayId) addExercise(pickerDayId, exercise)
          setPickerId(null)
        }}
      />

      {/* ── Discard changes dialog ──────────────────────────────────────────── */}
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
