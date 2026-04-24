import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus } from 'lucide-react'
import { getExerciseById, EXERCISES, ALL_MUSCLES, MUSCLE_NAMES, getExercisesByMuscle } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import useStore from '../../store/index.js'
import { CreateExerciseSheet } from '../programs/CreateExerciseSheet.jsx'

// ─── Main ExercisePicker ──────────────────────────────────────────────────────

export function ExercisePicker({ open, onClose, onSelect, excludeId }) {
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState(null)
  const [showCreator, setShowCreator]           = useState(false)
  const [showAllDifficulty, setShowAllDifficulty] = useState(false)
  const searchRef = useRef(null)
  const user            = useStore(s => s.user)
  const storeCustom     = useStore(s => s.customExercises ?? [])
  const deleteCustomExercise = useStore(s => s.deleteCustomExercise)
  const userLevel       = user?.level || 'avanzado'

  // Local mirror so we can add instantly without waiting for store re-render
  const [localNew, setLocalNew] = useState([])

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch('')
      setFilterMuscle(null)
      setLocalNew([])
      setTimeout(() => searchRef.current?.focus(), 300)
    }
  }, [open])

  // Merge store + any locally added this session (deduped by id)
  const customExercises = useMemo(() => {
    const ids = new Set(storeCustom.map(e => e.id))
    return [...storeCustom, ...localNew.filter(e => !ids.has(e.id))]
  }, [storeCustom, localNew])

  const allExercises = useMemo(() => [...EXERCISES, ...customExercises], [customExercises])

  const filtered = useMemo(() => {
    return allExercises.filter(ex => {
      if (excludeId && ex.id === excludeId) return false
      const matchMuscle = !filterMuscle || ex.muscle === filterMuscle
      const matchSearch = !search.trim() || ex.name.toLowerCase().includes(search.toLowerCase())
      const matchDifficulty = showAllDifficulty || search.trim() || (() => {
        if (userLevel === 'avanzado') return true
        if (userLevel === 'intermedio') return ex.difficulty !== 'avanzado'
        return ex.difficulty === 'principiante'
      })()
      return matchMuscle && matchSearch && matchDifficulty
    })
  }, [allExercises, filterMuscle, search, showAllDifficulty, userLevel, excludeId])

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
    // Eliminar del store (fuente de verdad)
    deleteCustomExercise(id)
    // Eliminar del mirror local si existe
    setLocalNew(prev => prev.filter(e => e.id !== id))
    // Limpiar legacy key también
    try {
      const prev = JSON.parse(localStorage.getItem('graw_custom_exercises') || '[]')
      localStorage.setItem('graw_custom_exercises', JSON.stringify(prev.filter(e => e.id !== id)))
    } catch {}
  }

  return createPortal(
    <AnimatePresence>
      {open && (
    <>
      <motion.div key="ep-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />

      {/* Sheet — left/right/bottom, NO centering transform */}
      <motion.div key="ep-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 1 }} style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 81,
        height: '92dvh', display: 'flex', flexDirection: 'column',
        background: 'rgba(16,13,9,0.88)',
        backdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
        borderRadius: '32px 32px 0 0',
        boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Handle */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{excludeId ? 'Cambiar ejercicio' : 'Añadir ejercicio'}</p>
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

          {/* Difficulty filter toggle — only for principiante/intermedio */}
          {userLevel !== 'avanzado' && (
            <div style={{ marginBottom: 8 }}>
              <button onClick={() => setShowAllDifficulty(v => !v)} style={{ padding: '4px 12px', borderRadius: 'var(--r-pill)', background: showAllDifficulty ? 'var(--surface3)' : 'var(--accent-dim)', border: `1px solid ${showAllDifficulty ? 'var(--border)' : 'var(--accent-border)'}`, color: showAllDifficulty ? 'var(--text2)' : 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {showAllDifficulty ? 'Filtro de nivel activo: No' : `Mostrando ejercicios para ${userLevel}`} {showAllDifficulty ? '— Ver todos' : '— Mostrar todos'}
              </button>
            </div>
          )}
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

          {/* ── Crear ejercicio — siempre visible al TOP ── */}
          <button
            onClick={() => setShowCreator(true)}
            className="pressable"
            style={{
              width: 'calc(100% - 32px)', margin: '12px 16px 4px',
              padding: '12px 16px', borderRadius: 14,
              border: '1px dashed rgba(232,146,74,0.35)',
              background: 'rgba(232,146,74,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} color="var(--accent)" strokeWidth={2.5}/>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Crear ejercicio personalizado</span>
          </button>

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

          <div style={{ height: 'calc(24px + env(safe-area-inset-bottom, 0px))' }} />
        </div>
      </motion.div>

      {/* Custom exercise creator */}
      <CreateExerciseSheet
        open={showCreator}
        onClose={() => setShowCreator(false)}
        onCreated={(ex) => {
          setLocalNew(prev => [...prev, ex])
          onSelect(ex.id)
          setShowCreator(false)
          onClose()
        }}
      />
    </>
      )}
    </AnimatePresence>,
    document.body
  )
}
