// ─── CreateExerciseSheet ──────────────────────────────────────────────────────
// Sheet premium para crear ejercicios personalizados.
// Diseño: minimalista, progresivo, natural. Nombre → Músculo → Equipo → Crear.
// Persiste en Zustand store (fuente de verdad única, sobrevive refresh/reinstall).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { ALL_MUSCLES, MUSCLE_NAMES } from '../../data/exercises.js'
import { getMuscleVars } from '../../utils/format.js'
import useStore from '../../store/index.js'

// ─── Data ─────────────────────────────────────────────────────────────────────

const EQUIPMENT = [
  { id: 'barbell',    label: 'Barra' },
  { id: 'dumbbell',  label: 'Mancuernas' },
  { id: 'cable',     label: 'Polea' },
  { id: 'machine',   label: 'Máquina' },
  { id: 'bodyweight',label: 'Peso corporal' },
  { id: 'kettlebell',label: 'Kettlebell' },
  { id: 'bands',     label: 'Bandas' },
  { id: 'other',     label: 'Otro' },
]

const MUSCLE_EMOJI = {
  chest: '🫁', back: '🔙', shoulders: '💫',
  arms: '💪', forearms: '🦾', legs: '🦵',
  calves: '🦶', core: '⚡',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateExerciseSheet({ open, onClose, onCreated }) {
  const [name, setName]           = useState('')
  const [muscle, setMuscle]       = useState(null)
  const [equipment, setEquipment] = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const nameRef                   = useRef(null)
  const saveCustomExercise        = useStore(s => s.saveCustomExercise)

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setName('')
      setMuscle(null)
      setEquipment(null)
      setError('')
      setSuccess(false)
      // Focus al input después de que la animación termine
      setTimeout(() => nameRef.current?.focus(), 380)
    }
  }, [open])

  const canCreate = name.trim().length >= 2 && muscle !== null

  const handleCreate = () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) { setError('Escribe al menos 2 caracteres'); return }
    if (!muscle) { setError('Elige un grupo muscular'); return }

    const newEx = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      muscle,
      equipment: equipment ?? 'other',
      difficulty: 'principiante',
      isCustom: true,
    }

    // Fuente de verdad: Zustand (persist middleware → localStorage automático)
    saveCustomExercise(newEx)

    // Flash de éxito
    setSuccess(true)
    setTimeout(() => {
      onCreated?.(newEx)
      onClose?.()
    }, 520)
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
    if (error) setError('')
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ces-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 1100,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            key="ces-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 1 }}
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1101,
              maxHeight: '92dvh',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(14,11,8,0.97)',
              backdropFilter: 'blur(60px) saturate(240%)',
              WebkitBackdropFilter: 'blur(60px) saturate(240%)',
              borderRadius: '28px 28px 0 0',
              boxShadow: [
                'inset 0 1px 0 rgba(255,235,200,0.12)',
                '0 -2px 0 rgba(232,146,74,0.08)',
                '0 -24px 80px rgba(0,0,0,0.7)',
              ].join(', '),
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              overflow: 'hidden',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 100,
              background: 'rgba(245,239,230,0.16)',
              margin: '12px auto 0', flexShrink: 0,
            }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px 12px', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#F5EFE6', letterSpacing: '-0.02em' }}>
                  Ejercicio propio
                </div>
                <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.35)', marginTop: 2 }}>
                  Se guarda en tu cuenta
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: 15,
                  background: 'rgba(255,235,200,0.07)',
                  border: '0.5px solid rgba(255,235,200,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={14} color="rgba(245,239,230,0.5)" />
              </button>
            </div>

            {/* Scrollable form */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 28px' }}>

              {/* ── Nombre ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
                  textTransform: 'uppercase', color: 'rgba(245,239,230,0.35)',
                  marginBottom: 8,
                }}>Nombre</div>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Ej: Curl con cuerda en polea"
                  maxLength={60}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(28,22,14,0.85)',
                    border: `1.5px solid ${name.trim().length >= 2 ? 'rgba(232,146,74,0.45)' : 'rgba(255,235,200,0.1)'}`,
                    borderRadius: 13, padding: '14px 15px',
                    fontSize: 16, fontWeight: 600, color: '#F5EFE6',
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              </div>

              {/* ── Grupo muscular ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
                  textTransform: 'uppercase', color: 'rgba(245,239,230,0.35)',
                  marginBottom: 10,
                }}>Grupo muscular</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                }}>
                  {ALL_MUSCLES.map(m => {
                    const mv = getMuscleVars(m)
                    const selected = muscle === m
                    return (
                      <button
                        key={m}
                        onClick={() => { setMuscle(m); if (error) setError('') }}
                        style={{
                          height: 58, borderRadius: 14,
                          background: selected
                            ? `${mv.dim}`
                            : 'rgba(255,235,200,0.03)',
                          border: `1px solid ${selected ? mv.color + '55' : 'rgba(255,235,200,0.07)'}`,
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: 3,
                          transition: 'all 0.15s ease',
                          WebkitTapHighlightColor: 'transparent',
                          position: 'relative',
                          boxShadow: selected ? `0 0 16px ${mv.color}22` : 'none',
                        }}
                      >
                        {selected && (
                          <div style={{
                            position: 'absolute', top: 5, right: 5,
                            width: 14, height: 14, borderRadius: 7,
                            background: mv.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Check size={8} color="#fff" strokeWidth={3} />
                          </div>
                        )}
                        <span style={{ fontSize: 18, lineHeight: 1 }}>
                          {MUSCLE_EMOJI[m] ?? '💪'}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: selected ? mv.color : 'rgba(245,239,230,0.38)',
                          letterSpacing: '0.03em', textTransform: 'uppercase',
                          lineHeight: 1,
                        }}>
                          {MUSCLE_NAMES[m] ?? m}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Equipamiento (opcional) ── */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
                  textTransform: 'uppercase', color: 'rgba(245,239,230,0.35)',
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Equipamiento
                  <span style={{
                    fontSize: 9, color: 'rgba(245,239,230,0.22)',
                    fontWeight: 500, letterSpacing: '0.05em', textTransform: 'none',
                  }}>— opcional</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {EQUIPMENT.map(eq => {
                    const selected = equipment === eq.id
                    return (
                      <button
                        key={eq.id}
                        onClick={() => setEquipment(selected ? null : eq.id)}
                        style={{
                          height: 32, padding: '0 14px',
                          borderRadius: 100,
                          background: selected ? 'rgba(232,146,74,0.14)' : 'rgba(255,235,200,0.04)',
                          border: `0.5px solid ${selected ? 'rgba(232,146,74,0.4)' : 'rgba(255,235,200,0.08)'}`,
                          color: selected ? '#E8924A' : 'rgba(245,239,230,0.4)',
                          fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s ease',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        {eq.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontSize: 12, color: '#E55B4B',
                      marginBottom: 14, fontWeight: 500,
                    }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.button
                onClick={handleCreate}
                disabled={!canCreate}
                animate={{
                  scale: success ? [1, 1.04, 1] : 1,
                  background: success
                    ? 'linear-gradient(135deg, #34C77B, #25A563)'
                    : canCreate
                      ? 'linear-gradient(135deg, #E8924A, #C9712D)'
                      : 'rgba(255,235,200,0.06)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '100%', height: 54,
                  borderRadius: 16, border: 'none',
                  color: canCreate ? '#fff' : 'rgba(245,239,230,0.2)',
                  fontSize: 16, fontWeight: 800,
                  cursor: canCreate ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  boxShadow: canCreate && !success
                    ? '0 4px 24px rgba(232,146,74,0.28)'
                    : success
                      ? '0 4px 24px rgba(52,199,123,0.3)'
                      : 'none',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}
              >
                {success ? (
                  <>
                    <Check size={18} strokeWidth={2.5} />
                    Guardado
                  </>
                ) : (
                  'Crear ejercicio'
                )}
              </motion.button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
