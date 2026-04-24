import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { CheckCircle, TrendingUp, Zap, Clock, Dumbbell } from 'lucide-react'
import { haptics } from '../../utils/haptics.js'
import { getExerciseById } from '../../data/exercises.js'
import { formatKg } from '../../utils/format.js'

// ── Confetti particle ─────────────────────────────────────────────────────────
function Particle({ delay, x, color }) {
  return (
    <motion.div
      initial={{ y: 0, x, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight * 0.65 : 500,
        x: x + (Math.random() - 0.5) * 200,
        opacity: 0,
        scale: Math.random() * 0.5 + 0.5,
        rotate: Math.random() * 720 - 360,
      }}
      transition={{ duration: 1.6 + Math.random() * 0.8, delay, ease: [0.2, 0, 0.8, 1] }}
      style={{
        position: 'fixed',
        top: '15%',
        width: Math.random() > 0.5 ? 8 : 6,
        height: Math.random() > 0.5 ? 8 : 12,
        borderRadius: Math.random() > 0.5 ? '50%' : 2,
        background: color,
        pointerEvents: 'none',
        zIndex: 1001,
      }}
    />
  )
}

// ── Animated count-up number ──────────────────────────────────────────────────
function CountUp({ target, suffix = '', prefix = '', duration = 1200, delay = 0, style }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    let raf
    const from = 0
    const step = (ts) => {
      if (!start) start = ts + delay * 1000
      const elapsed = ts - start
      if (elapsed < 0) { raf = requestAnimationFrame(step); return }
      const p = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + ease * (target - from)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, delay])
  return <span style={style}>{prefix}{val.toLocaleString('es-ES')}{suffix}</span>
}

// ── Stat card with stagger ────────────────────────────────────────────────────
function SummaryStat({ icon: Icon, label, value, accent, delay, animate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.42, delay, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: 'rgba(22,18,12,0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `0.5px solid rgba(255,235,200,0.08)`,
        borderRadius: 20,
        padding: '18px 16px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
        position: 'relative', overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)',
      }}
    >
      {/* Accent top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 14, right: 14, height: 2,
        borderRadius: '0 0 3px 3px',
        background: accent,
        boxShadow: `0 0 12px ${accent}`,
        opacity: 0.8,
      }} />
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${accent}18`,
        border: `0.5px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={accent} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#F5EFE6', fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.38)', lineHeight: 1 }}>
        {label}
      </div>
    </motion.div>
  )
}

// ── PR Row ────────────────────────────────────────────────────────────────────
function PRRow({ exerciseId, pr, index, animate }) {
  const ex = getExerciseById(exerciseId)
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={animate ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay: 0.6 + index * 0.08, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: 'rgba(212,168,67,0.07)',
        border: '0.5px solid rgba(212,168,67,0.22)',
        borderRadius: 12,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'rgba(212,168,67,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14 }}>🏆</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F5EFE6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ex?.name || exerciseId}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(212,168,67,0.8)', fontFamily: 'DM Mono, monospace' }}>
          {pr.isRepPR && !pr.isE1rmPR
            ? `${pr.reps} reps × ${pr.weight} kg — Récord de reps`
            : `${pr.weight} kg × ${pr.reps} — Nuevo 1RM`
          }
        </p>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        background: 'rgba(212,168,67,0.15)',
        border: '0.5px solid rgba(212,168,67,0.35)',
        color: '#D4A843',
        padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase',
        flexShrink: 0,
      }}>PR</span>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function WorkoutComplete({ session, newPRs, onSave }) {
  const [showContent, setShowContent] = useState(false)
  const [particles, setParticles] = useState([])
  const [notesValue, setNotesValue] = useState('')
  const savedRef = useRef(false)

  const COLORS = ['#E8924A', '#34C77B', '#D4A843', '#A37FD4', '#E5534B', '#4DB896']
  const duration = session?.duration || 0
  const totalVolume = session?.totalVolume || 0
  const totalSets = (session?.exercises || []).reduce((t, ex) => t + (ex.sets || []).filter(s => s.completed).length, 0)
  const totalExercises = session?.exercises?.length || 0
  const durationMin = Math.floor(duration / 60)
  const durationSec = duration % 60
  const prEntries = Object.entries(newPRs || {}).filter(([, pr]) => pr.isE1rmPR || pr.isRepPR)

  useEffect(() => {
    // Haptic celebration
    haptics.success()

    // Spawn confetti particles
    const count = prEntries.length > 0 ? 40 : 24
    const p = Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.6,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 390),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
    setParticles(p)

    // Stagger content in
    const t = setTimeout(() => setShowContent(true), 150)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (savedRef.current) return
    savedRef.current = true
    haptics.medium()
    onSave(notesValue.trim())
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(8,6,4,0.97)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Confetti burst */}
      {particles.map(p => (
        <Particle key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(52,199,123,0.12) 0%, rgba(232,146,74,0.06) 50%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <div style={{
        flex: 1,
        padding: '0 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        display: 'flex', flexDirection: 'column', gap: 0,
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={showContent ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          {/* Check icon with glow */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(52,199,123,0.2), rgba(52,199,123,0.08))',
            border: '1.5px solid rgba(52,199,123,0.4)',
            boxShadow: '0 0 0 8px rgba(52,199,123,0.06), 0 8px 32px rgba(52,199,123,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={34} color="#34C77B" strokeWidth={2} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em',
              color: '#F5EFE6', marginBottom: 8, lineHeight: 1.1,
            }}
          >
            ¡Sesión completada!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.22 }}
            style={{ fontSize: 14, color: 'rgba(245,239,230,0.45)', lineHeight: 1.5 }}
          >
            {session?.name} · {new Date(session?.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </motion.p>
        </motion.div>

        {/* PRs section — shown first if there are any */}
        <AnimatePresence>
          {prEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.28 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>🏆</span>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#D4A843' }}>
                  {prEntries.length === 1 ? 'Nuevo récord' : `${prEntries.length} récords`}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prEntries.map(([exId, pr], i) => (
                  <PRRow key={exId} exerciseId={exId} pr={pr} index={i} animate={showContent} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.35 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}
        >
          <SummaryStat
            icon={Zap}
            label="Volumen total"
            value={<CountUp target={totalVolume} suffix=" kg" duration={1000} delay={0.4} />}
            accent="#E8924A"
            delay={0.38}
            animate={showContent}
          />
          <SummaryStat
            icon={Clock}
            label="Duración"
            value={`${durationMin}:${String(durationSec).padStart(2, '0')}`}
            accent="#34C77B"
            delay={0.44}
            animate={showContent}
          />
          <SummaryStat
            icon={Dumbbell}
            label="Series completadas"
            value={<CountUp target={totalSets} duration={900} delay={0.5} />}
            accent="#A37FD4"
            delay={0.50}
            animate={showContent}
          />
          <SummaryStat
            icon={TrendingUp}
            label="Ejercicios"
            value={<CountUp target={totalExercises} duration={700} delay={0.55} />}
            accent="#D4A843"
            delay={0.56}
            animate={showContent}
          />
        </motion.div>

        {/* Exercise breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.38, delay: 0.58 }}
          style={{ marginBottom: 20 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)', marginBottom: 10 }}>
            Resumen de ejercicios
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(session?.exercises || []).map((ex, i) => {
              const exData = getExerciseById(ex.exerciseId)
              const done = (ex.sets || []).filter(s => s.completed)
              if (!done.length) return null
              const vol = done.reduce((t, s) => t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0)
              const best = done.reduce((b, s) => Math.max(b, parseFloat(s.weight) || 0), 0)
              return (
                <motion.div
                  key={ex.id || i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={showContent ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.62 + i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '9px 12px', borderRadius: 12,
                    background: 'rgba(22,18,12,0.55)',
                    border: '0.5px solid rgba(255,235,200,0.06)',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#F5EFE6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {exData?.name || ex.exerciseId}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(245,239,230,0.35)', marginTop: 1 }}>
                      {done.length} series · {done.map(s => `${s.weight}×${s.reps}`).slice(0, 2).join(', ')}{done.length > 2 ? '…' : ''}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#F5EFE6', fontFamily: 'DM Mono, monospace', letterSpacing: '-0.02em' }}>
                      {formatKg(vol)}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(245,239,230,0.3)', marginTop: 1 }}>kg</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Notes input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.72 }}
          style={{ marginBottom: 24 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(245,239,230,0.3)', marginBottom: 8 }}>
            Notas (opcional)
          </p>
          <textarea
            value={notesValue}
            onChange={e => setNotesValue(e.target.value)}
            placeholder="¿Cómo te has sentido? ¿Alguna observación?"
            rows={2}
            className="input"
            style={{ fontSize: 15, lineHeight: 1.5, resize: 'none' }}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.42, delay: 0.78, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <button
            onClick={handleSave}
            className="pressable"
            style={{
              width: '100%', height: 58, borderRadius: 18,
              background: 'linear-gradient(135deg, #34C77B 0%, #2aae69 100%)',
              border: 'none', cursor: 'pointer',
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(52,199,123,0.35), inset 0 1.5px 0 rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <CheckCircle size={18} strokeWidth={2.5} />
            Guardar sesión
          </button>
        </motion.div>
      </div>
    </motion.div>,
    document.body
  )
}
