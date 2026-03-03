// ─── ProgramEditor.jsx — Rewritten from scratch ──────────────────────────────
// Architecture: Program → Days → Exercise Blocks (3 levels, progressive disclosure)
// Fixes: warmup sets, day notes, scroll vs drag, crear ejercicio button at top
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronDown, GripVertical, Trash2, Clock, FileText } from 'lucide-react'
import { createPortal } from 'react-dom'
import { EXERCISES, MUSCLE_NAMES, ALL_MUSCLES } from '../../data/exercises.js'
import useStore from '../../store/index.js'
import { useDragToReorder } from '../../hooks/useDragToReorder.js'
import { ensureProgramTemplates } from '../../utils/programs.js'

// ─── Constants ────────────────────────────────────────────────────────────────

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

const REST_OPTS = [
  { v: 30,  l: '0:30' }, { v: 45,  l: '0:45' },
  { v: 60,  l: '1:00' }, { v: 90,  l: '1:30' },
  { v: 120, l: '2:00' }, { v: 150, l: '2:30' },
  { v: 180, l: '3:00' }, { v: 240, l: '4:00' },
  { v: 300, l: '5:00' },
]

const WEIGHT_PCT = [30, 40, 50, 60, 70, 75, 80, 85, 90]

const EQUIPMENT_OPTS = [
  { id: 'barbell',    label: 'Barra' },
  { id: 'dumbbell',   label: 'Mancuernas' },
  { id: 'cable',      label: 'Polea' },
  { id: 'machine',    label: 'Máquina' },
  { id: 'bodyweight', label: 'Peso corporal' },
  { id: 'other',      label: 'Otro' },
]

// ─── Style tokens ─────────────────────────────────────────────────────────────

const S = {
  input: (active) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(28,22,14,0.8)',
    border: `1.5px solid ${active ? 'rgba(232,146,74,0.4)' : 'rgba(255,235,200,0.1)'}`,
    borderRadius: 13, padding: '13px 15px',
    fontSize: 16, fontWeight: 600, color: '#F5EFE6',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  }),
  primaryBtn: (enabled) => ({
    width: '100%', height: 52,
    borderRadius: 14, border: 'none',
    background: enabled
      ? 'linear-gradient(135deg, #E8924A, #C9712D)'
      : 'rgba(255,235,200,0.06)',
    color: enabled ? 'rgba(255,245,235,0.95)' : 'rgba(245,239,230,0.2)',
    fontSize: 16, fontWeight: 700,
    cursor: enabled ? 'pointer' : 'default',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: enabled ? '0 4px 20px rgba(232,146,74,0.25)' : 'none',
  }),
  select: {
    background: 'rgba(255,235,200,0.06)',
    border: '0.5px solid rgba(255,235,200,0.12)',
    borderRadius: 7, color: 'rgba(245,239,230,0.75)',
    fontSize: 11, fontWeight: 600, padding: '4px 8px',
    cursor: 'pointer', fontFamily: 'DM Mono, monospace',
    outline: 'none', appearance: 'none', WebkitAppearance: 'none',
  },
  iconBtn: {
    width: 26, height: 26, borderRadius: 7,
    background: 'transparent', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  },
}

function Label({ children, dim }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color: dim ? 'rgba(245,239,230,0.28)' : 'rgba(245,239,230,0.38)',
      marginBottom: 6,
    }}>{children}</div>
  )
}

// ─── uid helper ───────────────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`


// ─── StepperButton ────────────────────────────────────────────────────────────
function StepperButton({ value, min, max, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button
        onClick={e => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
        style={{
          width: 28, height: 28, borderRadius: '8px 0 0 8px',
          background: 'rgba(255,235,200,0.06)', border: '0.5px solid rgba(255,235,200,0.1)',
          borderRight: 'none', color: 'rgba(245,239,230,0.55)', fontSize: 15,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, WebkitTapHighlightColor: 'transparent',
        }}
      >−</button>
      <div style={{
        width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,235,200,0.04)', border: '0.5px solid rgba(255,235,200,0.1)',
        fontSize: 13, fontWeight: 800, color: '#F5EFE6',
        fontFamily: 'DM Mono, monospace', userSelect: 'none',
      }}>{value}</div>
      <button
        onClick={e => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
        style={{
          width: 28, height: 28, borderRadius: '0 8px 8px 0',
          background: 'rgba(255,235,200,0.06)', border: '0.5px solid rgba(255,235,200,0.1)',
          borderLeft: 'none', color: 'rgba(245,239,230,0.55)', fontSize: 15,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, WebkitTapHighlightColor: 'transparent',
        }}
      >+</button>
    </div>
  )
}

// ─── WarmupSetRow ─────────────────────────────────────────────────────────────
function WarmupSetRow({ set, index, onUpdate, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(91,156,246,0.06)',
      border: '0.5px solid rgba(91,156,246,0.16)',
      borderRadius: 10, padding: '7px 10px',
    }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: '#5B9CF6', minWidth: 18, letterSpacing: '0.04em' }}>
        C{index + 1}
      </span>
      <select
        value={set.weightPercent}
        onChange={e => onUpdate('weightPercent', parseInt(e.target.value))}
        style={{ ...S.select, color: '#5B9CF6', background: 'rgba(91,156,246,0.08)', border: '0.5px solid rgba(91,156,246,0.2)' }}
      >
        {WEIGHT_PCT.map(p => <option key={p} value={p}>{p}%</option>)}
      </select>
      <span style={{ fontSize: 10, color: 'rgba(245,239,230,0.25)', flexShrink: 0 }}>del peso</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <StepperButton value={set.reps} min={1} max={20} onChange={v => onUpdate('reps', v)} />
        <span style={{ fontSize: 10, color: 'rgba(245,239,230,0.25)' }}>reps</span>
      </div>
      <button onClick={onRemove} style={S.iconBtn}>
        <X size={11} color="rgba(91,156,246,0.5)" />
      </button>
    </div>
  )
}

// ─── WorkingSetRow ────────────────────────────────────────────────────────────
function WorkingSetRow({ set, index, showRemove, onUpdate, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,235,200,0.035)',
      border: '0.5px solid rgba(255,235,200,0.07)',
      borderRadius: 10, padding: '8px 10px',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(232,146,74,0.55)', minWidth: 14 }}>{index + 1}</span>
      <StepperButton value={set.sets} min={1} max={10} onChange={v => onUpdate('sets', v)} />
      <span style={{ fontSize: 11, color: 'rgba(245,239,230,0.22)', flexShrink: 0 }}>×</span>
      <StepperButton value={set.reps} min={1} max={50} onChange={v => onUpdate('reps', v)} />
      <span style={{ fontSize: 11, color: 'rgba(245,239,230,0.22)', flexShrink: 0 }}>reps</span>
      <select
        value={set.restSeconds}
        onChange={e => onUpdate('restSeconds', parseInt(e.target.value))}
        style={{ ...S.select, marginLeft: 'auto' }}
      >
        {REST_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      {showRemove && (
        <button onClick={onRemove} style={S.iconBtn}>
          <X size={11} color="rgba(229,83,75,0.4)" />
        </button>
      )}
    </div>
  )
}

// ─── ExerciseBlock ────────────────────────────────────────────────────────────
function ExerciseBlock({ block, onUpdate, onRemove, isExpanded, onToggle, dragHandlers, isDragging, isOver }) {
  const [showNotes, setShowNotes] = useState(!!block.notes)
  const accent = getMHex(block.muscle)

  const updateWarmup = (i, field, val) => {
    const next = block.warmupSets.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    onUpdate('warmupSets', next)
  }
  const removeWarmup = (i) => onUpdate('warmupSets', block.warmupSets.filter((_, idx) => idx !== i))
  const addWarmup = () => onUpdate('warmupSets', [...block.warmupSets, { id: uid(), reps: 8, weightPercent: 50 }])

  const updateWorking = (i, field, val) => {
    const next = block.workingSets.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    onUpdate('workingSets', next)
  }
  const removeWorking = (i) => onUpdate('workingSets', block.workingSets.filter((_, idx) => idx !== i))
  const addWorking = () => onUpdate('workingSets', [
    ...block.workingSets,
    { id: uid(), sets: 3, reps: block.workingSets.at(-1)?.reps ?? 10, restSeconds: block.workingSets.at(-1)?.restSeconds ?? 120 },
  ])

  const summary = [
    block.warmupSets?.length > 0 ? `${block.warmupSets.length} cal.` : null,
    block.workingSets?.[0] ? `${block.workingSets[0].sets}×${block.workingSets[0].reps}` : '3×10',
    block.notes ? '📝' : null,
  ].filter(Boolean).join(' · ')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.4 : 1,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging
          ? '0 16px 48px rgba(0,0,0,0.7)'
          : isOver
            ? '0 0 0 1.5px rgba(232,146,74,0.45)'
            : '0 2px 8px rgba(0,0,0,0.28)',
      }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
      style={{
        borderRadius: 16,
        background: 'rgba(22,18,12,0.85)',
        border: `0.5px solid ${isOver ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Muscle bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${accent}, ${accent}60)`,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '11px 12px 11px 16px', gap: 10 }}>
        {/* Grip — touchAction:none ONLY here */}
        <div {...dragHandlers} style={{ ...dragHandlers.style, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, flexShrink: 0 }}>
          <GripVertical size={13} color={isDragging ? accent : 'rgba(245,239,230,0.2)'} strokeWidth={1.8} />
        </div>

        {/* Name + summary — tap to expand */}
        <div onClick={onToggle} style={{ flex: 1, cursor: 'pointer', userSelect: 'none', minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F5EFE6', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {block.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(245,239,230,0.32)', marginTop: 2 }}>{summary}</div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          onClick={onToggle}
          style={{ cursor: 'pointer', padding: 4, flexShrink: 0 }}
        >
          <ChevronDown size={13} color="rgba(245,239,230,0.25)" />
        </motion.div>

        {/* Remove */}
        <button onClick={e => { e.stopPropagation(); onRemove() }} style={{ ...S.iconBtn, background: 'rgba(229,83,75,0.07)', border: '0.5px solid rgba(229,83,75,0.15)' }}>
          <Trash2 size={11} color="rgba(229,83,75,0.5)" />
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '0.5px solid rgba(255,235,200,0.07)', padding: '12px 12px 8px 14px' }}>

              {/* Warm-up sets */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Label dim>Calentamiento</Label>
                  <button onClick={addWarmup} style={{
                    height: 22, padding: '0 9px', borderRadius: 6, border: 'none',
                    background: 'rgba(91,156,246,0.12)', color: '#5B9CF6',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>+ Añadir</button>
                </div>
                {block.warmupSets?.length === 0 ? (
                  <div style={{ fontSize: 11, color: 'rgba(245,239,230,0.22)', fontStyle: 'italic', paddingLeft: 2 }}>
                    Sin calentamiento — toca Añadir para agregar
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {block.warmupSets.map((wu, i) => (
                      <WarmupSetRow key={wu.id} set={wu} index={i}
                        onUpdate={(f, v) => updateWarmup(i, f, v)}
                        onRemove={() => removeWarmup(i)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Working sets */}
              <div style={{ marginBottom: 14 }}>
                <Label dim>Series de trabajo</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                  {block.workingSets.map((ws, i) => (
                    <WorkingSetRow key={ws.id} set={ws} index={i}
                      showRemove={block.workingSets.length > 1}
                      onUpdate={(f, v) => updateWorking(i, f, v)}
                      onRemove={() => removeWorking(i)} />
                  ))}
                </div>
                <button onClick={addWorking} style={{
                  width: '100%', height: 30, marginTop: 6,
                  borderRadius: 8, border: 'none',
                  background: 'rgba(255,235,200,0.04)',
                  color: 'rgba(245,239,230,0.35)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>+ Variante de series</button>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 4 }}>
                {!showNotes ? (
                  <button onClick={() => setShowNotes(true)} style={{
                    height: 28, padding: '0 8px', borderRadius: 7, border: 'none',
                    background: 'transparent', color: 'rgba(245,239,230,0.28)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <FileText size={11} /> Añadir nota
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <textarea
                      value={block.notes ?? ''}
                      onChange={e => onUpdate('notes', e.target.value)}
                      placeholder="Técnica, tempo, indicaciones..."
                      rows={2}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,235,200,0.04)',
                        border: '0.5px solid rgba(255,235,200,0.1)',
                        borderRadius: 10, padding: '9px 11px',
                        fontSize: 13, color: 'rgba(245,239,230,0.65)',
                        outline: 'none', fontFamily: 'inherit',
                        resize: 'none', lineHeight: 1.5,
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


// ─── SortableExerciseList ─────────────────────────────────────────────────────
// touchAction:'pan-y' en el container — scroll siempre disponible
// touchAction:'none' SOLO en el grip handle (via gripHandlers del hook)
function SortableExerciseList({ exercises, expandedId, onToggle, onRemove, onUpdate, onReorder }) {
  const { containerRef, dragIndex, overIndex, isDragging, gripHandlers, containerHandlers, isActive } = useDragToReorder({
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
        // CRITICAL: pan-y always; only grip blocks scroll
        touchAction: isActive ? 'none' : 'pan-y',
      }}
    >
      <AnimatePresence initial={false}>
        {exercises.map((block, i) => (
          <ExerciseBlock
            key={block.id || `${block.exerciseId}-${i}`}
            block={block}
            index={i}
            isDragging={dragIndex === i}
            isOver={overIndex === i && dragIndex !== null && dragIndex !== i}
            dragHandlers={gripHandlers(i)}
            isExpanded={expandedId === block.id}
            onToggle={() => onToggle(block.id)}
            onRemove={() => onRemove(i)}
            onUpdate={(field, val) => onUpdate(i, field, val)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── DayCard ──────────────────────────────────────────────────────────────────
function DayCard({ day, isExpanded, onToggle, onUpdateName, onUpdateNotes, onAddExercise, onRemoveExercise, onUpdateExercise, onReorderExercises, onDeleteDay, expandedExerciseId, onToggleExercise }) {
  const hasExercises = day.exercises.length > 0
  const nameRef = useRef(null)

  return (
    <div style={{
      borderRadius: 18,
      background: 'rgba(20,16,10,0.8)',
      border: `0.5px solid ${isExpanded ? 'rgba(232,146,74,0.18)' : 'rgba(255,235,200,0.07)'}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}>
      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '13px 14px', gap: 10 }}>
        {/* Expand/collapse */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          onClick={onToggle}
          style={{ cursor: 'pointer', flexShrink: 0, padding: 4 }}
        >
          <ChevronDown size={14} color={isExpanded ? '#E8924A' : 'rgba(245,239,230,0.3)'} style={{ transform: 'rotate(-90deg)' }} />
        </motion.div>

        {/* Editable day name */}
        <input
          ref={nameRef}
          value={day.name}
          onChange={e => onUpdateName(e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{
            flex: 1, background: 'transparent', border: 'none',
            fontSize: 14, fontWeight: 700, color: '#F5EFE6',
            outline: 'none', fontFamily: 'inherit',
            cursor: 'text', minWidth: 0,
          }}
          maxLength={30}
        />

        {/* Exercise count pill */}
        {hasExercises && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            padding: '2px 7px', borderRadius: 100,
            background: 'rgba(52,199,123,0.1)',
            color: '#34C77B',
            border: '0.5px solid rgba(52,199,123,0.25)',
            flexShrink: 0,
          }}>
            {day.exercises.length} ej.
          </span>
        )}

        {/* Delete day */}
        <button onClick={onDeleteDay} style={{ ...S.iconBtn, background: 'rgba(229,83,75,0.06)' }}>
          <Trash2 size={12} color="rgba(229,83,75,0.4)" />
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '0.5px solid rgba(255,235,200,0.07)', padding: '10px 12px 14px' }}>

              {/* Day notes — minimal textarea */}
              <textarea
                value={day.notes ?? ''}
                onChange={e => onUpdateNotes(e.target.value)}
                placeholder="Notas del día (opcional)..."
                rows={1}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'transparent', border: 'none',
                  borderBottom: '0.5px solid rgba(255,235,200,0.08)',
                  padding: '4px 2px 8px', marginBottom: 12,
                  fontSize: 12, color: 'rgba(245,239,230,0.4)',
                  outline: 'none', fontFamily: 'inherit',
                  resize: 'none', lineHeight: 1.4,
                }}
              />

              {/* Exercise blocks */}
              {day.exercises.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '20px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,235,200,0.02)',
                  border: '1px dashed rgba(255,235,200,0.08)',
                  marginBottom: 10,
                }}>
                  <div style={{ fontSize: 13, color: 'rgba(245,239,230,0.28)', lineHeight: 1.5 }}>
                    Sin ejercicios aún
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 10 }}>
                  <SortableExerciseList
                    exercises={day.exercises}
                    expandedId={expandedExerciseId}
                    onToggle={onToggleExercise}
                    onRemove={onRemoveExercise}
                    onUpdate={onUpdateExercise}
                    onReorder={onReorderExercises}
                  />
                </div>
              )}

              {/* Add exercise button */}
              <button
                onClick={onAddExercise}
                style={{
                  width: '100%', height: 40,
                  borderRadius: 11, border: '1px dashed rgba(232,146,74,0.28)',
                  background: 'rgba(232,146,74,0.05)',
                  color: '#E8924A', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={14} strokeWidth={2.5} /> Añadir ejercicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ─── Main Component ───────────────────────────────────────────────────────────
export function ProgramEditor({ programId, onClose }) {
  const {
    programs, updateProgram, saveCustomProgram,
    addToast,
  } = useStore(s => ({
    programs: s.programs,
    updateProgram: s.updateProgram,
    saveCustomProgram: s.saveCustomProgram,
    addToast: s.addToast,
  }))

  const existing = programs.find(p => p.id === programId) || { id: programId || null, name: '', days: [], source: 'user' }
  const [name, setName] = useState(existing.name || '')
  const [days, setDays] = useState(
    (existing.days || []).map(d => ({
      id: d.id || uid(),
      name: d.name || 'Día',
      notes: d.notes || '',
      exercises: (d.exercises || []).map(ex => ({
        id: ex.id || uid(),
        exerciseId: ex.exerciseId,
        name: ex.name || EXERCISES.find(e => e.id === ex.exerciseId)?.name || 'Ejercicio',
        muscle: ex.muscle || EXERCISES.find(e => e.id === ex.exerciseId)?.muscle || 'arms',
        notes: ex.notes || '',
        warmupSets: ex.warmupSets || [],
        workingSets: ex.workingSets || [ { id: uid(), sets: 3, reps: 10, restSeconds: 120 } ],
      }))
    }))
  )
  const [expandedDayId, setExpandedDayId] = useState(days[0]?.id || null)
  const [expandedExerciseId, setExpandedExerciseId] = useState(null)
  const [showPickerDay, setShowPickerDay] = useState(null)

  const canSave = name.trim().length >= 2 && days.length > 0 && days.every(d => d.exercises.length > 0)

  // Handlers
  const addDay = () => {
    const d = { id: uid(), name: `Día ${days.length + 1}`, notes: '', exercises: [] }
    setDays(prev => [...prev, d])
    setExpandedDayId(d.id)
  }
  const deleteDay = (id) => setDays(prev => prev.filter(d => d.id !== id))
  const updateDayName = (id, v) => setDays(prev => prev.map(d => d.id === id ? { ...d, name: v } : d))
  const updateDayNotes = (id, v) => setDays(prev => prev.map(d => d.id === id ? { ...d, notes: v } : d))

  const addExerciseToDay = (dayId, exerciseId) => {
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      const meta = EXERCISES.find(e => e.id === exerciseId)
      const block = {
        id: uid(),
        exerciseId,
        name: meta?.name || 'Ejercicio',
        muscle: meta?.muscle || 'arms',
        notes: '',
        warmupSets: [],
        workingSets: [ { id: uid(), sets: 3, reps: 10, restSeconds: 120 } ],
      }
      return { ...d, exercises: [...d.exercises, block] }
    }))
  }
  const removeExerciseAt = (dayId, index) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter((_, i) => i !== index) } : d))
  const updateExerciseAt = (dayId, index, field, val) => setDays(prev => prev.map(d => {
    if (d.id !== dayId) return d
    const exs = d.exercises.map((b, i) => i === index ? { ...b, [field]: val } : b)
    return { ...d, exercises: exs }
  }))
  const reorderExercises = (dayId, nextList) => setDays(prev => prev.map(d => d.id === dayId ? { ...d, exercises: nextList } : d))

  const handleSave = () => {
    const program = { id: existing.id || uid(), name: name.trim(), days }
    if (existing.id) {
      updateProgram(existing.id, program)
      addToast('Programa actualizado')
    } else {
      saveCustomProgram(program)
      addToast('Programa creado')
    }
    onClose?.()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        height: 52, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(18,14,10,0.85)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '0.5px solid rgba(255,235,200,0.08)'
      }}>
        <button onClick={onClose} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>← Mis programas</button>
        <button onClick={handleSave} disabled={!canSave} className="pressable" style={{
          height: 32, padding: '0 12px', borderRadius: 9, border: 'none', cursor: canSave ? 'pointer' : 'default',
          background: canSave ? 'linear-gradient(135deg, #E8924A, #C9712D)' : 'rgba(255,235,200,0.06)',
          color: canSave ? 'rgba(255,245,235,0.95)' : 'rgba(245,239,230,0.25)', fontSize: 12, fontWeight: 800,
        }}>Guardar</button>
      </div>

      {/* Scroll area */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', padding: 'calc(52px + 16px) 16px calc(var(--nav-h) + 20px)' }}>
        {/* Program name */}
        <div style={{ marginBottom: 16 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del programa" style={S.input(name.trim().length >= 2)} maxLength={30} />
        </div>

        {/* Days section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 2px 10px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.38)' }}>Días</div>
          <button onClick={addDay} className="pressable" style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', background: 'rgba(232,146,74,0.12)', color: '#E8924A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            + Añadir
          </button>
        </div>

        {/* Days list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence initial={false}>
            {days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                isExpanded={expandedDayId === day.id}
                onToggle={() => setExpandedDayId(expandedDayId === day.id ? null : day.id)}
                onUpdateName={(v) => updateDayName(day.id, v)}
                onUpdateNotes={(v) => updateDayNotes(day.id, v)}
                onAddExercise={() => setShowPickerDay(day.id)}
                onRemoveExercise={(i) => removeExerciseAt(day.id, i)}
                onUpdateExercise={(i, f, v) => updateExerciseAt(day.id, i, f, v)}
                onReorderExercises={(next) => reorderExercises(day.id, next)}
                onDeleteDay={() => deleteDay(day.id)}
                expandedExerciseId={expandedExerciseId}
                onToggleExercise={(bid) => setExpandedExerciseId(prev => prev === bid ? null : bid)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Global CTA: crear ejercicio personalizado */}
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setShowPickerDay(days[0]?.id || null)} className="pressable" style={{
            width: '100%', height: 44, borderRadius: 13, border: '1px dashed rgba(232,146,74,0.35)', background: 'rgba(232,146,74,0.06)',
            color: '#E8924A', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            + Añadir ejercicio personalizado
          </button>
        </div>
      </div>

      {/* Exercise Picker Sheet — reusa el existente */}
      {showPickerDay && (
        <ExercisePicker
          isOpen={!!showPickerDay}
          onClose={() => setShowPickerDay(null)}
          onSelect={(exerciseId) => {
            addExerciseToDay(showPickerDay, exerciseId)
            setShowPickerDay(null)
          }}
        />
      )}
    </div>
  )
}

