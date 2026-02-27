import { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { Sheet } from '../layout/Sheet.jsx'
import useStore from '../../store/index.js'

// Standalone full-screen program editor — ZERO connection to workout store
export function ProgramEditor({ open, onClose, program }) {
  const addProgram = useStore(s => s.addProgram)
  const updateProgram = useStore(s => s.updateProgram)
  const templates = useStore(s => s.templates)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [totalWeeks, setTotalWeeks] = useState('')
  const [days, setDays] = useState([])
  const [errors, setErrors] = useState({})
  const [dirty, setDirty] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const [pickerDayIdx, setPickerDayIdx] = useState(null) // which day is picking a template

  useEffect(() => {
    if (!open) return
    if (program) {
      setName(program.name || '')
      setDescription(program.description || '')
      setTotalWeeks(program.totalWeeks ? String(program.totalWeeks) : '')
      setDays((program.days || []).map(d => ({ ...d, id: d.id || crypto.randomUUID() })))
    } else {
      setName('')
      setDescription('')
      setTotalWeeks('')
      setDays([{ id: crypto.randomUUID(), name: 'Día 1', templateId: null }])
    }
    setErrors({})
    setDirty(false)
  }, [open, program])

  if (!open) return null

  const mark = () => setDirty(true)

  const addDay = () => {
    setDays(prev => [...prev, { id: crypto.randomUUID(), name: `Día ${prev.length + 1}`, templateId: null }])
    mark()
  }

  const removeDay = (id) => {
    setDays(prev => prev.filter(d => d.id !== id))
    mark()
  }

  const updateDay = (id, field, value) => {
    setDays(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
    mark()
  }

  const validate = () => {
    const errs = {}
    if (!name.trim() || name.trim().length < 3) errs.name = 'El nombre debe tener al menos 3 caracteres'
    if (days.length === 0) errs.days = 'Añade al menos un día'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const data = {
      name: name.trim(),
      description: description.trim(),
      totalWeeks: totalWeeks ? Number(totalWeeks) : null,
      days: days.map(d => ({
        id: d.id,
        name: d.name,
        templateId: d.templateId || null,
      })),
    }
    if (program?.id) {
      updateProgram(program.id, data)
    } else {
      addProgram(data)
    }
    onClose()
  }

  const handleBack = () => {
    if (dirty) setShowDiscard(true)
    else onClose()
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
          {program ? 'Editar programa' : 'Nuevo programa'}
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

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: 'calc(40px + env(safe-area-inset-bottom,0px))', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Name */}
        <div>
          <p className="t-label" style={{ marginBottom: 8 }}>Nombre del programa</p>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); mark() }}
            placeholder="Ej: PPL, Upper/Lower..."
            className="input"
            style={{ fontSize: 16 }}
          />
          {errors.name && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <p className="t-label" style={{ marginBottom: 8 }}>Descripción (opcional)</p>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); mark() }}
            placeholder="Describe el programa..."
            rows={2}
            className="input"
            style={{ fontSize: 16, resize: 'none' }}
          />
        </div>

        {/* Total weeks */}
        <div>
          <p className="t-label" style={{ marginBottom: 8 }}>Semanas totales (opcional)</p>
          <input
            type="number"
            value={totalWeeks}
            onChange={e => { setTotalWeeks(e.target.value); mark() }}
            placeholder="12"
            min="1"
            className="input"
            style={{ fontSize: 16, width: 120 }}
          />
        </div>

        {/* Training days */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p className="t-label">Días de entrenamiento</p>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{days.length} días</span>
          </div>
          {errors.days && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{errors.days}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {days.map((day, i) => {
              const tpl = templates.find(t => t.id === day.templateId)
              return (
                <div key={day.id} style={{
                  background: 'rgba(22,18,12,0.68)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '0.5px solid rgba(255,235,200,0.07)',
                  borderRadius: 'var(--r)',
                  padding: '14px',
                  boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'var(--surface3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text2)' }}>{i + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={day.name}
                      onChange={e => updateDay(day.id, 'name', e.target.value)}
                      style={{
                        flex: 1, background: 'none', border: 'none',
                        borderBottom: '1px solid var(--border2)',
                        fontSize: 15, fontWeight: 600, color: 'var(--text)',
                        outline: 'none', padding: '2px 0', fontFamily: 'inherit',
                      }}
                    />
                    {days.length > 1 && (
                      <button onClick={() => removeDay(day.id)} className="pressable" style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}>
                        <X size={13} color="var(--red)" />
                      </button>
                    )}
                  </div>

                  {/* Template picker */}
                  <button
                    onClick={() => setPickerDayIdx(i)}
                    className="pressable"
                    style={{
                      width: '100%', padding: '11px 14px',
                      borderRadius: 12,
                      background: tpl ? 'var(--accent-dim)' : 'var(--surface3)',
                      border: `1px solid ${tpl ? 'var(--accent-border)' : 'var(--border2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: tpl ? 600 : 400, color: tpl ? 'var(--accent)' : 'var(--text3)' }}>
                      {tpl ? tpl.name : 'Seleccionar template...'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>▾</span>
                  </button>
                </div>
              )
            })}
          </div>

          <button onClick={addDay} className="pressable" style={{
            marginTop: 10, width: '100%', padding: '14px',
            borderRadius: 'var(--r)',
            border: '1.5px dashed rgba(232,146,74,0.2)',
            background: 'rgba(232,146,74,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
          }}>
            <Plus size={16} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Añadir día</span>
          </button>
        </div>
      </div>

      {/* Template picker sheet */}
      <Sheet
        open={pickerDayIdx !== null}
        onClose={() => setPickerDayIdx(null)}
        title="Seleccionar template"
      >
        <div style={{ padding: '12px 20px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom,0px))' }}>
          {/* Rest day option */}
          <button
            onClick={() => { updateDay(days[pickerDayIdx]?.id, 'templateId', null); setPickerDayIdx(null) }}
            className="pressable"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14, marginBottom: 8,
              background: !days[pickerDayIdx]?.templateId ? 'var(--surface3)' : 'var(--surface2)',
              border: `1px solid ${!days[pickerDayIdx]?.templateId ? 'var(--border2)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>Descanso</span>
          </button>

          {templates.map(t => {
            const selected = days[pickerDayIdx]?.templateId === t.id
            return (
              <button
                key={t.id}
                onClick={() => { updateDay(days[pickerDayIdx]?.id, 'templateId', t.id); setPickerDayIdx(null) }}
                className="pressable"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14, marginBottom: 8,
                  background: selected ? 'var(--accent-dim)' : 'var(--surface2)',
                  border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{(t.exercises || []).length} ejercicios</p>
                </div>
                {selected && <span style={{ fontSize: 16, color: 'var(--accent)' }}>✓</span>}
              </button>
            )
          })}

          {templates.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>No hay templates. Crea uno primero.</p>
            </div>
          )}
        </div>
      </Sheet>

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
