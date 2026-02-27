import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Sheet } from '../layout/Sheet.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { MuscleBadge } from '../ui/Badge.jsx'
import { ExercisePicker } from '../workout/ExercisePicker.jsx'
import { EXERCISES, MUSCLE_NAMES, MUSCLE_COLORS } from '../../data/exercises.js'
import useStore from '../../store/index.js'

const ALL_MUSCLES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core']

export function TemplateEditor({ open, onClose, template }) {
  const createTemplate = useStore(s => s.createTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)

  const [name, setName] = useState(template?.name || '')
  const [muscles, setMuscles] = useState(template?.muscles || [])
  const [exercises, setExercises] = useState(
    (template?.exercises || []).map((e, i) => ({ ...e, _id: i }))
  )
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
      <div className="px-4 py-4 flex flex-col gap-4 pb-32">
        <Input
          label="Nombre del template"
          placeholder="Ej: Push A, Full Body..."
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          error={error && !name.trim() ? error : ''}
        />

        {/* Muscle multi-select */}
        <div>
          <label className="text-sm font-medium text-[rgba(240,240,245,0.6)] block mb-2">Grupos musculares</label>
          <div className="flex flex-wrap gap-2">
            {ALL_MUSCLES.map(m => {
              const colors = MUSCLE_COLORS[m]
              const active = muscles.includes(m)
              return (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
                  style={active
                    ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }
                    : { backgroundColor: 'transparent', color: 'rgba(240,240,245,0.4)', borderColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  {MUSCLE_NAMES[m]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[rgba(240,240,245,0.6)]">Ejercicios</label>
            {error && exercises.length === 0 && <span className="text-xs text-[#F87171]">{error}</span>}
          </div>
          <div className="flex flex-col gap-2">
            {exercises.map((ex, i) => {
              const exData = EXERCISES.find(e => e.id === ex.exerciseId)
              return (
                <motion.div
                  key={ex._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-[#1A1A2E] border border-[rgba(255,255,255,0.08)] rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={14} className="text-[rgba(240,240,245,0.2)] flex-shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-[#F0F0F5] truncate">{exData?.name || ex.exerciseId}</span>
                    {exData && <MuscleBadge muscle={exData.muscle} />}
                    <button onClick={() => removeExercise(ex._id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[rgba(248,113,113,0.1)]">
                      <Trash2 size={12} className="text-[#F87171]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[['Series', 'sets', 1, 20], ['Reps', 'reps', 1, 100], ['Peso (kg)', 'weight', 0, 500]].map(([label, field, min, max]) => (
                      <div key={field}>
                        <label className="text-[10px] text-[rgba(240,240,245,0.35)] block mb-1">{label}</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={ex[field]}
                          onChange={e => updateExercise(ex._id, field, parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#111120] border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-2 text-sm text-center text-[#F0F0F5] focus:outline-none focus:border-[#6C63FF]"
                          min={min} max={max}
                          onFocus={e => e.target.select()}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[rgba(108,99,255,0.3)] text-[#6C63FF] text-sm font-semibold"
          >
            <Plus size={14} />Añadir ejercicio
          </button>
        </div>

        <Input label="Notas" placeholder="Instrucciones, consejos..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Fixed save */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#111120] border-t border-[rgba(255,255,255,0.06)]"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom,0px))' }}>
        <Button onClick={handleSave} size="lg" className="w-full">Guardar template</Button>
      </div>

      <ExercisePicker open={showPicker} onClose={() => setShowPicker(false)} onSelect={addExercise} />
    </Sheet>
  )
}
