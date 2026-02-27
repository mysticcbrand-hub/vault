import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, Plus, X, Check } from 'lucide-react'
import { EXERCISES, MUSCLE_NAMES, ALL_MUSCLES, getAllExercises, getExerciseById } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import { Sheet } from '../layout/Sheet.jsx'

// ─── Custom exercise creator ──────────────────────────────────────────────────

const EQUIPMENT_OPTIONS = [
  { id: 'barbell',    label: 'Barra' },
  { id: 'dumbbell',   label: 'Mancuernas' },
  { id: 'cable',      label: 'Polea' },
  { id: 'machine',    label: 'Máquina' },
  { id: 'bodyweight', label: 'Peso corporal' },
  { id: 'other',      label: 'Otro' },
]

function CustomExerciseCreator({ open, onClose, onCreated }) {
  const [name, setName]           = useState('')
  const [muscle, setMuscle]       = useState('')
  const [equipment, setEquipment] = useState('barbell')
  const [error, setError]         = useState('')

  useEffect(() => {
    if (open) { setName(''); setMuscle(''); setEquipment('barbell'); setError('') }
  }, [open])

  const handleCreate = () => {
    if (!name.trim() || name.trim().length < 2) { setError('El nombre debe tener al menos 2 caracteres'); return }
    if (!muscle) { setError('Selecciona un grupo muscular'); return }

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

    onCreated(newEx)
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 91,
        maxHeight: '88dvh',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(16,13,9,0.92)',
        backdropFilter: 'blur(56px) saturate(220%)',
        WebkitBackdropFilter: 'blur(56px) saturate(220%)',
        borderRadius: '32px 32px 0 0',
        boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
        animation: 'sheetIn 0.3s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Handle */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0', flexShrink: 0 }} />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>Crear ejercicio</p>

          {/* Name */}
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

          {/* Muscle */}
          <div style={{ marginBottom: 16 }}>
            <p className="t-label" style={{ marginBottom: 8 }}>Grupo muscular</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_MUSCLES.map(m => {
                const mv = getMuscleVars(m)
                const selected = muscle === m
                return (
                  <button key={m} onClick={() => { setMuscle(m); setError('') }} className="pressable" style={{
                    padding: '7px 13px', borderRadius: 'var(--r-pill)',
                    background: selected ? mv.dim : 'var(--surface2)',
                    border: `1px solid ${selected ? mv.color + '55' : 'var(--border)'}`,
                    color: selected ? mv.color : 'var(--text2)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    {MUSCLE_NAMES[m]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Equipment */}
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
      </div>
    </>
  )
}

// ─── Main ExercisePicker ──────────────────────────────────────────────────────

export function ExercisePicker({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState(null)
  const [showCreator, setShowCreator] = useState(false)
  const [customExercises, setCustomExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]') } catch { return [] }
  })
  const searchRef = useRef(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch('')
      setFilterMuscle(null)
      // Reload custom exercises
      try { setCustomExercises(JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]')) } catch {}
      setTimeout(() => searchRef.current?.focus(), 300)
    }
  }, [open])

  const allExercises = useMemo(() => [...EXERCISES, ...customExercises], [customExercises])

  const filtered = useMemo(() => {
    return allExercises.filter(ex => {
      const matchMuscle = !filterMuscle || ex.muscle === filterMuscle
      const matchSearch = !search.trim() || ex.name.toLowerCase().includes(search.toLowerCase())
      return matchMuscle && matchSearch
    })
  }, [allExercises, filterMuscle, search])

  // Group by muscle
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(ex => {
      if (!groups[ex.muscle]) groups[ex.muscle] = []
      groups[ex.muscle].push(ex)
    })
    return groups
  }, [filtered])

  const deleteCustom = (id) => {
    try {
      const updated = customExercises.filter(e => e.id !== id)
      localStorage.setItem('graw_custom_exercises', JSON.stringify(updated))
      setCustomExercises(updated)
    } catch {}
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'fadeIn 0.22s ease' }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 81,
        height: '92dvh', display: 'flex', flexDirection: 'column',
        background: 'rgba(16,13,9,0.88)',
        backdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
        borderRadius: '32px 32px 0 0',
        boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
        animation: 'sheetIn 0.36s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Handle */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Añadir ejercicio</p>
            <button onClick={onClose} className="pressable" style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,235,200,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="var(--text2)" />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={15} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 'var(--r-sm)', fontSize: 16, color: 'var(--text)',
                outline: 'none', WebkitUserSelect: 'text', userSelect: 'text',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Muscle filter */}
          <div style={{ overflowX: 'auto', display: 'flex', gap: 6, paddingBottom: 8 }}>
            <button onClick={() => setFilterMuscle(null)} className="pressable" style={{
              padding: '5px 12px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap', flexShrink: 0,
              background: !filterMuscle ? 'var(--accent-dim)' : 'var(--surface2)',
              border: `1px solid ${!filterMuscle ? 'var(--accent-border)' : 'var(--border)'}`,
              color: !filterMuscle ? 'var(--accent)' : 'var(--text2)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>Todos</button>
            {ALL_MUSCLES.map(m => {
              const mv = getMuscleVars(m)
              const active = filterMuscle === m
              return (
                <button key={m} onClick={() => setFilterMuscle(active ? null : m)} className="pressable" style={{
                  padding: '5px 12px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap', flexShrink: 0,
                  background: active ? mv.dim : 'var(--surface2)',
                  border: `1px solid ${active ? mv.color + '55' : 'var(--border)'}`,
                  color: active ? mv.color : 'var(--text2)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  {MUSCLE_NAMES[m]}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', flexShrink: 0 }} />

        {/* Exercise list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>Sin resultados. Prueba otro término.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([muscle, exercises]) => {
              const mv = getMuscleVars(muscle)
              return (
                <div key={muscle}>
                  <div style={{ padding: '10px 20px 4px', position: 'sticky', top: 0, background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 2 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: mv.color }}>
                      {MUSCLE_NAMES[muscle] || muscle}
                    </span>
                  </div>
                  {exercises.map(ex => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => { onSelect(ex.id); onClose() }}
                        className="pressable"
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: 12,
                          padding: '13px 20px', background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left',
                          borderBottom: '1px solid rgba(255,235,200,0.04)',
                        }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: mv.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ex.name}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>
                            {ex.equipment}{ex.isCustom ? ' · Propio' : ''}
                          </p>
                        </div>
                        {ex.isCustom && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)', flexShrink: 0 }}>
                            PROPIO
                          </span>
                        )}
                      </button>
                      {/* Delete custom exercise */}
                      {ex.isCustom && (
                        <button
                          onClick={() => deleteCustom(ex.id)}
                          style={{ padding: '0 16px', height: 48, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            })
          )}

          {/* Create custom exercise CTA */}
          <button
            onClick={() => setShowCreator(true)}
            className="pressable"
            style={{
              width: 'calc(100% - 40px)', margin: '12px 20px',
              padding: '14px 16px', borderRadius: 'var(--r)',
              border: '1.5px dashed rgba(232,146,74,0.25)',
              background: 'rgba(232,146,74,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Crear ejercicio propio</span>
          </button>

          <div style={{ height: 'calc(24px + env(safe-area-inset-bottom, 0px))' }} />
        </div>
      </div>

      {/* Custom exercise creator */}
      <CustomExerciseCreator
        open={showCreator}
        onClose={() => setShowCreator(false)}
        onCreated={(ex) => {
          setCustomExercises(prev => [...prev, ex])
          onSelect(ex.id)
          setShowCreator(false)
          onClose()
        }}
      />
    </>
  )
}
