import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Sheet } from '../layout/Sheet.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { ExercisePicker } from '../workout/ExercisePicker.jsx'
import { EXERCISES, MUSCLE_NAMES, MUSCLE_COLORS } from '../../data/exercises.js'
import useStore from '../../store/index.js'

const ALL_MUSCLES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core']

export function TemplateEditor({ open, onClose, template }) {
  const createTemplate = useStore(s => s.createTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)

  const [name, setName] = useState(template?.name || '')
  const [muscles, setMuscles] = useState(template?.muscles || [])
  const [exercises, setExercises] = useState((template?.exercises || []).map((e, i) => ({ ...e, _id: i })))
  const [notes, setNotes] = useState(template?.notes || '')
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState('')

  const toggleMuscle = (m) => setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const addExercise = (exerciseId) => {
    setExercises(prev => [...prev, { _id: Date.now(), exerciseId, sets: 3, reps: 10, weight: 0 }])
  }

  const removeExercise = (id) => setExercises(prev => prev.filter(e => e._id !== id))

  const updateExercise = (id, field, value) => {
    setExercises(prev => prev.map(e => e._id === id ? { ...e, [field]: value } : e))
  }

  const handleSave = () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    if (!exercises.length) { setError('Añade al menos un ejercicio'); return }
    const data = {
      name: name.trim(),
      muscles,
      notes,
      exercises: exercises.map(({ _id, ...rest }) => rest),
    }
    if (template?.id) updateTemplate(template.id, data)
    else createTemplate(data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={template ? 'Editar Template' : 'Nuevo Template'} fullHeight>
      <div style={{ padding: '16px 20px 110px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Nombre del template" placeholder="Ej: Push" value={name} onChange={e => { setName(e.target.value); setError('') }} />
        {error && !name.trim() && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}

        {/* Muscle multi-select */}
        <div>
          <label className="t-label" style={{ marginBottom: 8, display: 'block' }}>Grupos musculares</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_MUSCLES.map(m => {
              const colors = MUSCLE_COLORS[m]
              const active = muscles.includes(m)
              return (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  className="pressable"
                  style={{
                    padding: '6px 10px', borderRadius: 'var(--r-xs)',
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                    background: active ? colors.bg : 'var(--surface2)',
                    color: active ? colors.text : 'var(--text2)',
                    border: `1px solid ${active ? colors.border : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {MUSCLE_NAMES[m]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="t-label">Ejercicios</label>
            {error && exercises.length === 0 && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exercises.map((ex) => {
              const exData = EXERCISES.find(e => e.id === ex.exerciseId)
              return (
                <div key={ex._id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <GripVertical size={14} color="var(--text3)" />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{exData?.name || ex.exerciseId}</span>
                    <button onClick={() => removeExercise(ex._id)} className="pressable" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={12} color="var(--red)" />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[['Series','sets'],['Reps','reps'],['Peso','weight']].map(([label, field]) => (
                      <div key={field}>
                        <label className="t-label" style={{ marginBottom: 6, display: 'block' }}>{label}</label>
                        <input
                          type="number" inputMode="decimal"
                          value={ex[field]}
                          onChange={e => updateExercise(ex._id, field, parseFloat(e.target.value) || 0)}
                          className="input"
                          style={{ textAlign: 'center', fontFamily: 'DM Mono,monospace' }}
                          onFocus={e => e.target.select()}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={() => setShowPicker(true)} className="pressable" style={{
            marginTop: 10, width: '100%', height: 44,
            borderRadius: 'var(--r-sm)', border: '1px dashed var(--accent-border)',
            background: 'var(--surface2)', color: 'var(--accent)', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Plus size={14} /> Añadir ejercicio
          </button>
        </div>

        <Input label="Notas" placeholder="Opcional" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: 'var(--surface3)', borderTop: '1px solid var(--border)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom,0px))' }}>
        <Button onClick={handleSave} size="lg" className="pressable" style={{ width: '100%' }}>Guardar template</Button>
      </div>

      <ExercisePicker open={showPicker} onClose={() => setShowPicker(false)} onSelect={addExercise} />
    </Sheet>
  )
}
