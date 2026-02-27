import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X, GripVertical } from 'lucide-react'
import { ExercisePicker } from '../workout/ExercisePicker.jsx'
import { getExerciseById, MUSCLE_NAMES } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import useStore from '../../store/index.js'

const MUSCLES = ['chest','back','shoulders','arms','legs','core']

// Standalone full-screen editor — ZERO connection to workout store
export function TemplateEditor({ open, onClose, template }) {
  const addTemplate = useStore(s => s.addTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)

  const [name, setName] = useState('')
  const [muscles, setMuscles] = useState([])
  const [exercises, setExercises] = useState([])
  const [notes, setNotes] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)

  // Populate from template when editing
  useEffect(() => {
    if (!open) return
    if (template) {
      setName(template.name || '')
      setMuscles(template.muscles || [])
      setNotes(template.notes || '')
      setExercises((template.exercises || []).map(ex => ({
        id: crypto.randomUUID(),
        exerciseId: ex.exerciseId || ex.id,
        sets: ex.sets ?? 3,
        reps: ex.reps ?? 10,
        weight: ex.weight ?? 0,
      })))
    } else {
      setName('')
      setMuscles([])
      setNotes('')
      setExercises([])
    }
    setErrors({})
    setDirty(false)
  }, [open, template])

  if (!open) return null

  const mark = () => setDirty(true)

  const toggleMuscle = (m) => {
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
    mark()
  }

  const addExercise = (exerciseId) => {
    setExercises(prev => [...prev, {
      id: crypto.randomUUID(),
      exerciseId,
      sets: 3,
      reps: 10,
      weight: 0,
    }])
    mark()
  }

  const removeExercise = (id) => {
    setExercises(prev => prev.filter(e => e.id !== id))
    mark()
  }

  const updateExField = (id, field, value) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
    mark()
  }

  const validate = () => {
    const errs = {}
    if (!name.trim() || name.trim().length < 3) errs.name = 'El nombre debe tener al menos 3 caracteres'
    if (exercises.length === 0) errs.exercises = 'Añade al menos un ejercicio'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const data = {
      name: name.trim(),
      muscles,
      notes,
      exercises: exercises.map(e => ({
        exerciseId: e.exerciseId,
        sets: Number(e.sets) || 3,
        reps: Number(e.reps) || 10,
        weight: Number(e.weight) || 0,
      })),
    }
    if (template?.id) {
      updateTemplate(template.id, data)
    } else {
      addTemplate(data)
    }
    onClose()
  }

  const handleBack = () => {
    if (dirty) { setShowDiscard(true) } else { onClose() }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      animation: 'slideInRight 0.3s cubic-bezier(0.32,0.72,0,1)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,8,6,0.82)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        boxShadow: 'inset 0 -1px 0 rgba(255,235,200,0.06)',
        flexShrink: 0,
      }}>
        <button onClick={handleBack} className="pressable" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text2)', fontSize: 15, fontWeight: 500, padding: '8px 4px',
          minWidth: 44, minHeight: 44,
        }}>
          <ChevronLeft size={18} />
          Cancelar
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {template ? 'Editar template' : 'Nuevo template'}
        </p>
        <button onClick={handleSave} className="pressable" style={{
          padding: '8px 16px', borderRadius: 10,
          background: 'var(--accent)', border: 'none',
          color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          minHeight: 36,
        }}>
          Guardar
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Name */}
        <div>
          <p className="t-label" style={{ marginBottom: 8 }}>Nombre del template</p>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); mark() }}
            placeholder="Ej: Push Day, Piernas Fuerza..."
            className="input"
            style={{ fontSize: 16 }}
          />
          {errors.name && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{errors.name}</p>}
        </div>

        {/* Muscle chips */}
        <div>
          <p className="t-label" style={{ marginBottom: 10 }}>Grupos musculares</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MUSCLES.map(m => {
              const mv = getMuscleVars(m)
              const active = muscles.includes(m)
              return (
                <button key={m} onClick={() => toggleMuscle(m)} className="pressable" style={{
                  padding: '7px 14px', borderRadius: 'var(--r-pill)',
                  background: active ? mv.dim : 'var(--surface2)',
                  border: `1px solid ${active ? mv.color + '55' : 'var(--border)'}`,
                  color: active ? mv.color : 'var(--text2)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}>
                  {MUSCLE_NAMES[m] || m}
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="t-label">Ejercicios</p>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{exercises.length}</span>
          </div>
          {errors.exercises && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{errors.exercises}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exercises.map((ex, i) => {
              const exData = getExerciseById(ex.exerciseId)
              const mv = getMuscleVars(exData?.muscle)
              return (
                <div key={ex.id} style={{
                  background: 'rgba(22,18,12,0.68)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '0.5px solid rgba(255,235,200,0.07)',
                  borderRadius: 'var(--r)',
                  padding: '14px',
                  boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <GripVertical size={16} color="var(--text3)" style={{ flexShrink: 0 }} />
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: mv.color, flexShrink: 0,
                    }} />
                    <p style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      {exData?.name || ex.exerciseId}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 'var(--r-pill)',
                      background: mv.dim, color: mv.color,
                    }}>
                      {MUSCLE_NAMES[exData?.muscle] || exData?.muscle}
                    </span>
                    <button onClick={() => removeExercise(ex.id)} className="pressable" style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                    }}>
                      <X size={13} color="var(--red)" />
                    </button>
                  </div>

                  {/* Sets / Reps / Weight row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Series', field: 'sets', value: ex.sets },
                      { label: 'Reps', field: 'reps', value: ex.reps },
                      { label: 'Peso base (kg)', field: 'weight', value: ex.weight },
                    ].map(({ label, field, value }) => (
                      <div key={field}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
                        <input
                          type="number"
                          value={value}
                          onChange={e => updateExField(ex.id, field, e.target.value)}
                          min="0"
                          style={{
                            width: '100%', background: 'var(--surface3)',
                            border: '1px solid var(--border2)',
                            borderRadius: 10, padding: '8px 10px',
                            fontSize: 16, fontWeight: 700,
                            color: 'var(--text)', textAlign: 'center',
                            outline: 'none', fontFamily: 'DM Mono, monospace',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add exercise */}
          <button
            onClick={() => setShowPicker(true)}
            className="pressable"
            style={{
              marginTop: 10, width: '100%', padding: '14px',
              borderRadius: 'var(--r)',
              border: '1.5px dashed rgba(232,146,74,0.2)',
              background: 'rgba(232,146,74,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Añadir ejercicio</span>
          </button>
        </div>

        {/* Notes */}
        <div>
          <p className="t-label" style={{ marginBottom: 8 }}>Notas del template</p>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); mark() }}
            placeholder="Instrucciones, progresión, notas..."
            rows={3}
            className="input"
            style={{ fontSize: 16, resize: 'none' }}
          />
        </div>
      </div>

      {/* Exercise picker */}
      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={id => { addExercise(id); setShowPicker(false) }}
      />

      {/* Discard confirm */}
      {showDiscard && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 310 }} onClick={() => setShowDiscard(false)} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 'calc(100% - 40px)', maxWidth: 320,
            background: 'rgba(16,13,9,0.96)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '0.5px solid rgba(255,235,200,0.12)',
            borderRadius: 24, padding: 24, zIndex: 311,
            boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.08), 0 20px 60px rgba(0,0,0,0.7)',
          }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>¿Descartar cambios?</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.5 }}>Los cambios no guardados se perderán.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDiscard(false)} className="pressable" style={{ flex: 1, padding: 12, borderRadius: 12, background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Seguir editando
              </button>
              <button onClick={() => { setShowDiscard(false); onClose() }} className="pressable" style={{ flex: 1, padding: 12, borderRadius: 12, background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.3)', color: 'var(--red)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Descartar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
