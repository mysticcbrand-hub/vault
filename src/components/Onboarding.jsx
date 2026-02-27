import { useState, useEffect, useRef } from 'react'
import { Check, Sprout, Flame, Zap, Dumbbell, TrendingUp, Target } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// GRAW mark inline — no network dep
function GrawMark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="rgba(232,146,74,0.15)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="rgba(232,146,74,0.3)" strokeWidth="1" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="DM Sans, -apple-system, sans-serif" fontWeight="800" fontSize="22"
        fill="#E8924A" letterSpacing="-1">G</text>
    </svg>
  )
}

const LEVELS = [
  { id: 'principiante', label: 'Principiante', desc: 'Menos de 1 año entrenando', Icon: Sprout },
  { id: 'intermedio',   label: 'Intermedio',   desc: '1 a 3 años de experiencia', Icon: Flame },
  { id: 'avanzado',     label: 'Avanzado',     desc: 'Más de 3 años, técnica sólida', Icon: Zap },
]

const GOALS = [
  { id: 'fuerza',     label: 'Fuerza',         desc: 'Levantar más peso, aumentar 1RM',    Icon: Dumbbell },
  { id: 'volumen',    label: 'Volumen / Masa',  desc: 'Ganar músculo y tamaño',             Icon: TrendingUp },
  { id: 'definicion', label: 'Definición',      desc: 'Mantener músculo, reducir grasa',    Icon: Target },
]

// Dots progress indicator
function Dots({ step }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 20px)', left: 0, right: 0 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          height: 6, borderRadius: 3,
          width: i === step ? 20 : 6,
          background: i === step ? 'var(--accent)' : 'rgba(255,235,200,0.15)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      ))}
    </div>
  )
}

// Selection card shared by Level and Goal steps
function SelectCard({ id, label, desc, Icon, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px', borderRadius: 'var(--r)',
        background: selected ? 'var(--accent-dim)' : 'rgba(22,18,12,0.65)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
        boxShadow: selected
          ? 'inset 0 1px 0 rgba(255,235,200,0.08), 0 0 0 1px var(--accent-border), 0 4px 16px rgba(232,146,74,0.12)'
          : 'inset 0 1px 0 rgba(255,235,200,0.06)',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.opacity = '0.85' }}
      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
    >
      {/* Icon circle */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: selected ? 'rgba(232,146,74,0.15)' : 'var(--surface2)',
        border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? 'var(--accent)' : 'var(--text2)',
        transition: 'all 0.18s ease',
      }}>
        <Icon size={20} />
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{desc}</p>
      </div>
      {/* Checkmark */}
      <Check size={18} color="var(--accent)" style={{
        flexShrink: 0, marginLeft: 'auto',
        opacity: selected ? 1 : 0,
        transform: selected ? 'scale(1)' : 'scale(0.5)',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  )
}

// Shared CTA button
function CTAButton({ label, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', height: 56, borderRadius: 'var(--r-sm)', border: 'none',
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
        boxShadow: disabled ? 'none' : 'inset 0 1.5px 0 rgba(255,235,200,0.2), 0 4px 20px var(--accent-glow), 0 8px 32px rgba(232,146,74,0.15)',
        fontSize: 16, fontWeight: 700, letterSpacing: '0.01em',
        color: 'rgba(255,245,235,0.95)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'opacity 0.2s ease, transform 0.12s ease, box-shadow 0.12s ease',
        marginTop: 'auto',
      }}
      onPointerDown={e => { if (!disabled) { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = '0 2px 10px var(--accent-glow)' } }}
      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {label}
    </button>
  )
}

const SLIDE = {
  initial: { opacity: 0, x: 40, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, x: -40, filter: 'blur(4px)' },
  transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
}

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [level, setLevel] = useState(null)
  const [goal, setGoal] = useState(null)
  const [showCompletion, setShowCompletion] = useState(false)
  const inputRef = useRef(null)

  // Auto-focus input AFTER animation (600ms delay)
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => inputRef.current?.focus(), 600)
      return () => clearTimeout(t)
    }
  }, [step])

  // Auto-advance after level selection
  useEffect(() => {
    if (level && step === 1) {
      const t = setTimeout(() => setStep(2), 300)
      return () => clearTimeout(t)
    }
  }, [level, step])

  // Auto-advance + complete after goal selection
  useEffect(() => {
    if (goal && step === 2) {
      const t = setTimeout(() => setShowCompletion(true), 300)
      return () => clearTimeout(t)
    }
  }, [goal, step])

  // Fire completion after completion screen shows
  useEffect(() => {
    if (showCompletion) {
      const t = setTimeout(() => {
        onComplete({ name: name.trim() || 'Atleta', level, goal })
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [showCompletion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Completion screen
  if (showCompletion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: 'rgba(232,146,74,0.12)',
            border: '1px solid rgba(232,146,74,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(232,146,74,0.2)',
          }}>
            <GrawMark size={48} />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}
        >
          Listo, {name.trim() || 'Atleta'}.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{ fontSize: 15, color: 'var(--text2)' }}
        >
          Tu journey empieza hoy.
        </motion.p>
      </motion.div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'stretch', justifyContent: 'flex-start',
      padding: '0 28px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
      overflow: 'hidden',
    }}>
      {/* Atmospheric glow */}
      <div style={{
        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse, rgba(232,146,74,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <Dots step={step} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" {...SLIDE}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0, position: 'relative', zIndex: 1 }}
          >
            {/* GRAW mark */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <GrawMark size={48} />
            </div>

            {/* Label */}
            <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>
              Bienvenido a GRAW
            </p>

            {/* Title */}
            <p style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 8, lineHeight: 1.1 }}>
              ¿Cómo te llamas?
            </p>

            {/* Subtitle */}
            <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text2)', marginBottom: 40, lineHeight: 1.5 }}>
              Así personalizaremos tu experiencia.
            </p>

            {/* Name input */}
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim().length >= 2) setStep(1) }}
              placeholder="Tu nombre"
              autoComplete="given-name"
              style={{
                width: '100%',
                background: 'rgba(24,21,16,0.70)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--r-sm)',
                padding: '18px 20px',
                fontSize: 20, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--text)',
                letterSpacing: '-0.01em', outline: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                WebkitUserSelect: 'text', userSelect: 'text',
                marginBottom: 'auto',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent-border)'
                e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,235,200,0.06), 0 0 0 3px var(--accent-dim)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border2)'
                e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,235,200,0.06)'
              }}
            />

            <div style={{ height: 24 }} />
            <CTAButton
              label="Continuar"
              disabled={name.trim().length < 2}
              onClick={() => setStep(1)}
            />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" {...SLIDE}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0, position: 'relative', zIndex: 1 }}
          >
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 6 }}>
              {name.trim() || 'Hola'} 👋
            </p>
            <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 32 }}>
              ¿Cuál es tu nivel?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LEVELS.map(l => (
                <SelectCard key={l.id} {...l} selected={level === l.id} onSelect={setLevel} />
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" {...SLIDE}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0, position: 'relative', zIndex: 1 }}
          >
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 6 }}>
              {name.trim()}, ¿cuál es tu objetivo?
            </p>
            <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 32 }}>
              Esto guiará tus recomendaciones.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GOALS.map(g => (
                <SelectCard key={g.id} {...g} selected={goal === g.id} onSelect={setGoal} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
