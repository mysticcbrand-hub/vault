import { useState, useEffect, useRef } from 'react'
import { Check, Sprout, Flame, Zap, Dumbbell, TrendingUp, Shield, ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { GOAL_CONFIG, LEVEL_CONFIG } from '../data/presetPrograms.js'

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

// Unit conversion helpers
const KG_TO_LBS = 2.20462
const LBS_TO_KG = 0.453592
function toKg(value, unit) { return unit === 'lbs' ? value * LBS_TO_KG : value }
function toLbs(value) { return value * KG_TO_LBS }
function roundHalf(n) { return Math.round(n * 2) / 2 }

const LEVELS = [
  {
    id: 'principiante',
    label: 'Menos de 1 año',
    sublabel: 'Aprendiendo los fundamentos',
    freqHint: '3 días/semana recomendados',
    Icon: Sprout,
  },
  {
    id: 'intermedio',
    label: 'De 1 a 3 años',
    sublabel: 'Base sólida, buscando progresar',
    freqHint: '4 días/semana recomendados',
    Icon: Flame,
  },
  {
    id: 'avanzado',
    label: 'Más de 3 años',
    sublabel: 'Entrenamiento periodizado y técnica pulida',
    freqHint: '5–6 días/semana recomendados',
    Icon: Zap,
  },
]

const GOALS = [
  {
    id: 'fuerza',
    label: 'Ganar fuerza',
    sublabel: 'Levantar más. 1RM más alto.',
    Icon: Dumbbell,
    color: 'var(--red)',
    colorDim: 'var(--red-dim)',
  },
  {
    id: 'volumen',
    label: 'Ganar músculo',
    sublabel: 'Más masa. Más volumen de entrenamiento.',
    Icon: TrendingUp,
    color: 'var(--accent)',
    colorDim: 'var(--accent-dim)',
  },
  {
    id: 'bajar_grasa',
    label: 'Bajar grasa',
    sublabel: 'Perder grasa preservando el músculo.',
    Icon: Flame,
    color: 'var(--green)',
    colorDim: 'var(--green-dim)',
  },
  {
    id: 'mantenimiento',
    label: 'Mantenerme',
    sublabel: 'Mantener forma y salud a largo plazo.',
    Icon: Shield,
    color: '#5B9CF6',
    colorDim: 'rgba(91,156,246,0.12)',
  },
]

const TIMEFRAMES = [
  { id: '1m',  label: '1 mes',    weeks: 4.3  },
  { id: '3m',  label: '3 meses',  weeks: 13   },
  { id: '6m',  label: '6 meses',  weeks: 26   },
  { id: '12m', label: '1 año',    weeks: 52   },
]

// Dots progress indicator — 5 steps, in-flow
function Dots({ step, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 5, borderRadius: 3,
          width: i === step ? 20 : 5,
          background: i < step
            ? 'rgba(232,146,74,0.45)'
            : i === step
              ? 'var(--accent)'
              : 'rgba(255,235,200,0.13)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      ))}
    </div>
  )
}

// Level card with frequency hint
function LevelCard({ id, label, sublabel, freqHint, Icon, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(id)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 18px', borderRadius: 'var(--r)',
      background: selected ? 'var(--accent-dim)' : 'rgba(22,18,12,0.65)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
      boxShadow: selected ? 'inset 0 1px 0 rgba(255,235,200,0.08), 0 0 0 1px var(--accent-border)' : 'inset 0 1px 0 rgba(255,235,200,0.06)',
      cursor: 'pointer', textAlign: 'left',
      transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    }}
      onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.opacity = '0.85' }}
      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
    >
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{sublabel}</p>
        <p style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 5, fontWeight: 500 }}>{freqHint}</p>
      </div>
      <Check size={18} color="var(--accent)" style={{
        flexShrink: 0, opacity: selected ? 1 : 0,
        transform: selected ? 'scale(1)' : 'scale(0.5)',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  )
}

// Goal card with per-goal accent color
function GoalCard({ id, label, sublabel, Icon, color, colorDim, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(id)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 18px', borderRadius: 'var(--r)',
      background: selected ? (colorDim || 'var(--accent-dim)') : 'rgba(22,18,12,0.65)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: `1px solid ${selected ? (color || 'var(--accent)') + '44' : 'var(--border)'}`,
      boxShadow: selected ? `inset 0 1px 0 rgba(255,235,200,0.08), 0 0 0 1px ${(color || 'var(--accent)')}33` : 'inset 0 1px 0 rgba(255,235,200,0.06)',
      cursor: 'pointer', textAlign: 'left',
      transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    }}
      onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.opacity = '0.85' }}
      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: selected ? (colorDim || 'var(--accent-dim)') : 'var(--surface2)',
        border: `1px solid ${selected ? (color || 'var(--accent)') + '44' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? (color || 'var(--accent)') : 'var(--text2)',
        transition: 'all 0.18s ease',
      }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>{sublabel}</p>
      </div>
      <Check size={18} color={color || 'var(--accent)'} style={{
        flexShrink: 0, opacity: selected ? 1 : 0,
        transform: selected ? 'scale(1)' : 'scale(0.5)',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  )
}

// (legacy SelectCard removed — using LevelCard and GoalCard above)

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

// Animated check SVG for confirmation cards
function AnimCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--green)" strokeWidth="1.5" opacity="0.3" />
      <polyline points="7 12 10 15 17 9" stroke="var(--green)" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="14" strokeDashoffset="14"
        style={{ animation: 'checkDraw 0.35s ease-out forwards' }} />
    </svg>
  )
}

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [level, setLevel] = useState(null)
  const [goal, setGoal] = useState(null)
  // Step 4 — body metrics
  const [unit, setUnit] = useState('kg')
  const [currentWeightRaw, setCurrentWeightRaw] = useState('')
  const [goalWeightRaw, setGoalWeightRaw] = useState('')
  const [timeframe, setTimeframe] = useState(null)
  // Step 5 — confirmation
  const [showCompletion, setShowCompletion] = useState(false)
  const [confirmCardsShown, setConfirmCardsShown] = useState(0)
  const inputRef = useRef(null)

  const goalCfg = GOAL_CONFIG[goal] || {}
  const needsBodyGoal = goalCfg.bodyGoal !== false
  const needsTimeframe = goal === 'bajar_grasa' || goal === 'volumen'

  // Parse weights in kg internally
  const currentWeightKg = currentWeightRaw !== '' ? toKg(parseFloat(currentWeightRaw) || 0, unit) : null
  const goalWeightKg = goalWeightRaw !== '' ? toKg(parseFloat(goalWeightRaw) || 0, unit) : null

  // Weekly target calculation
  const weeklyTarget = (() => {
    if (!currentWeightKg || !goalWeightKg || !timeframe) return null
    const tf = TIMEFRAMES.find(t => t.id === timeframe)
    if (!tf) return null
    return Math.abs(goalWeightKg - currentWeightKg) / tf.weeks
  })()

  const weeklyWarning = (() => {
    if (!weeklyTarget) return null
    if (goal === 'bajar_grasa' && weeklyTarget > 1.0) return '⚠️ Muy agresivo'
    if (goal === 'volumen' && weeklyTarget > 0.5) return '⚠️ Demasiado rápido'
    if (weeklyTarget < 0.05) return '✓ Sostenible'
    return '✓ Realista'
  })()

  // Toggle unit — convert displayed values
  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return
    if (currentWeightRaw !== '') {
      const kg = toKg(parseFloat(currentWeightRaw) || 0, unit)
      setCurrentWeightRaw(newUnit === 'lbs' ? String(Math.round(toLbs(kg))) : String(roundHalf(kg)))
    }
    if (goalWeightRaw !== '') {
      const kg = toKg(parseFloat(goalWeightRaw) || 0, unit)
      setGoalWeightRaw(newUnit === 'lbs' ? String(Math.round(toLbs(kg))) : String(roundHalf(kg)))
    }
    setUnit(newUnit)
  }

  // Validation for step 4
  const currentWeightValid = currentWeightKg !== null && currentWeightKg >= 30 && currentWeightKg <= 300
  const goalWeightValid = !needsBodyGoal || !needsBodyGoal
    ? true
    : goalWeightKg !== null && goalWeightKg >= 30 && goalWeightKg <= 300
  const step4Valid = (() => {
    if (!currentWeightValid) return false
    if (needsBodyGoal && goalWeightKg === null) return false
    if (needsTimeframe && !timeframe) return false
    return true
  })()

  // Auto-focus input on step 0
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => inputRef.current?.focus(), 600)
      return () => clearTimeout(t)
    }
  }, [step])

  // Auto-advance after level selection (step 1 → 2)
  useEffect(() => {
    if (level && step === 1) {
      const t = setTimeout(() => setStep(2), 300)
      return () => clearTimeout(t)
    }
  }, [level, step])

  // Auto-advance after goal selection (step 2 → 3)
  useEffect(() => {
    if (goal && step === 2) {
      const t = setTimeout(() => setStep(3), 280)
      return () => clearTimeout(t)
    }
  }, [goal, step])

  // Stagger confirmation cards on step 4
  useEffect(() => {
    if (step === 4) {
      setConfirmCardsShown(0)
      const timers = [0, 120, 240, 360].map((delay, i) =>
        setTimeout(() => setConfirmCardsShown(i + 1), delay + 200)
      )
      // After all cards, fire completion
      const done = setTimeout(() => setShowCompletion(true), 1800)
      return () => { timers.forEach(clearTimeout); clearTimeout(done) }
    }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire onComplete after completion animation — wait 1800ms so user reads all cards
  useEffect(() => {
    if (showCompletion) {
      const finalData = {
        name: name.trim() || 'Atleta',
        level,
        goal,
        currentWeight: currentWeightKg,
        goalWeight: needsBodyGoal ? goalWeightKg : null,
        goalTimeframe: timeframe,
        weeklyTarget: weeklyTarget ? roundHalf(weeklyTarget * 10) / 10 : null,
        onboardingDate: new Date().toISOString(),
        unit,
      }
      const t = setTimeout(() => onComplete(finalData), 1800)
      return () => clearTimeout(t)
    }
  }, [showCompletion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 5 — personalization confirmation screen
  if (showCompletion) {
    const programName = (() => {
      const goalToProgram = { fuerza: 'fuerza', volumen: 'volumen', bajar_grasa: 'definicion', mantenimiento: 'definicion' }
      const programGoal = goalToProgram[goal] || goal
      const presets = {
        fuerza:    { principiante: 'StrongLifts 5×5', intermedio: '5/3/1 Wendler', avanzado: 'PPL Fuerza' },
        volumen:   { principiante: 'Full Body 3×', intermedio: 'PPL Hipertrofia', avanzado: 'PPL Hipertrofia' },
        definicion:{ principiante: 'Circuito Metabólico', intermedio: 'Fuerza + Cardio', avanzado: 'PPL Definición' },
      }
      return presets[programGoal]?.[level] || 'PPL Hipertrofia'
    })()
    const cfg = GOAL_CONFIG[goal] || {}
    const restLabel = cfg.restTimer ? `${Math.floor(cfg.restTimer / 60)}:${String(cfg.restTimer % 60).padStart(2,'0')} min` : '2:00 min'
    const repLabel = cfg.repRange?.range ? `${cfg.repRange.range} repeticiones` : '8–12 repeticiones'
    const cards = [
      { title: 'Programa seleccionado', body: programName, sub: 'Recomendado para tu nivel y objetivo' },
      { title: 'Descanso entre series', body: restLabel, sub: cfg.restMessage || '' },
      currentWeightKg && goalWeightKg && needsBodyGoal
        ? { title: 'Objetivo de peso', body: `${roundHalf(currentWeightKg)} kg → ${roundHalf(goalWeightKg)} kg`, sub: weeklyTarget ? `Ritmo: ~${weeklyTarget.toFixed(2)} kg/semana` : '' }
        : null,
      { title: 'Rango de repeticiones', body: repLabel, sub: cfg.repRange?.label || 'Hipertrofia' },
    ].filter(Boolean)
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)', display: 'flex', flexDirection: 'column', padding: '0 24px', paddingTop: 'calc(env(safe-area-inset-top,0px) + 56px)', paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 32px)', overflowY: 'auto' }}
      >
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(232,146,74,0.16) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.34,1.56,0.64,1] }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(232,146,74,0.12)', border: '1px solid rgba(232,146,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 48px rgba(232,146,74,0.2)' }}>
            <GrawMark size={44} />
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.32 }}
          style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4, textAlign: 'center' }}>
          Todo listo, {name.trim() || 'Atleta'}.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.28 }}
          style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center', marginBottom: 28 }}>
          Así hemos configurado tu experiencia:
        </motion.p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: confirmCardsShown > i ? 1 : 0, y: confirmCardsShown > i ? 0 : 14 }}
              transition={{ duration: 0.32, ease: [0.32,0.72,0,1] }}
              style={{ background: 'rgba(22,18,12,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid var(--border2)', borderLeft: '3px solid var(--green)', borderRadius: 'var(--r-sm)', padding: '14px 16px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                {confirmCardsShown > i && <AnimCheck />}
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)' }}>{card.title}</p>
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 2 }}>{card.body}</p>
              {card.sub && <p style={{ fontSize: 12, color: 'var(--text2)' }}>{card.sub}</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // shared input style
  const inputSt = { width: '100%', background: 'rgba(24,21,16,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)', padding: '16px 18px', fontSize: 32, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: 'var(--text)', letterSpacing: '-0.02em', outline: 'none', textAlign: 'center', WebkitUserSelect: 'text', userSelect: 'text', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'var(--bg)',
      overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
    }}>
      {/* Ambient glow — pointer-events none, fixed so it doesn't scroll */}
      <div style={{ position: 'fixed', top: -80, left: '50%', transform: 'translateX(-50%)', width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse, rgba(232,146,74,0.16) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Scrollable content wrapper */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        padding: '0 24px',
        paddingTop: 'calc(env(safe-area-inset-top,0px) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom,0px) + 32px)',
      }}>
        {/* Fixed header bar — dots + back button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, marginBottom: 8, flexShrink: 0, position: 'relative' }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ position: 'absolute', left: 0, width: 40, height: 40, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
              <ChevronLeft size={22} />
            </button>
          )}
          <Dots step={step} total={5} />
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 0: Name ── */}
          {step === 0 && (
            <motion.div key="s0" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><GrawMark size={48} /></div>
              <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Bienvenido a GRAW</p>
              <p style={{ textAlign: 'center', fontSize: 'clamp(24px, 7vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 8, lineHeight: 1.1 }}>¿Cómo te llamas?</p>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>Así personalizaremos tu experiencia.</p>
            <input ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && name.trim().length >= 2) setStep(1) }} placeholder="Tu nombre" autoComplete="given-name"
              style={{ width: '100%', background: 'rgba(24,21,16,0.70)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid var(--border2)', borderRadius: 'var(--r-sm)', padding: '18px 20px', fontSize: 20, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', color: 'var(--text)', letterSpacing: '-0.01em', outline: 'none', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', WebkitUserSelect: 'text', userSelect: 'text' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-border)'; e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,235,200,0.06), 0 0 0 3px var(--accent-dim)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,235,200,0.06)' }}
            />
              <div style={{ flex: 1, minHeight: 24 }} />
              <CTAButton label="Continuar" disabled={name.trim().length < 2} onClick={() => setStep(1)} />
            </motion.div>
          )}

          {/* ── STEP 1: Level ── */}
          {step === 1 && (
            <motion.div key="s1" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
              <p style={{ fontSize: 'clamp(22px, 6vw, 26px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>{name.trim() || 'Hola'} 👋</p>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>¿Cuánto tiempo llevas entrenando?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LEVELS.map(l => <LevelCard key={l.id} {...l} selected={level === l.id} onSelect={setLevel} />)}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Goal ── */}
          {step === 2 && (
            <motion.div key="s2" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
              <p style={{ fontSize: 'clamp(22px, 6vw, 26px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>{name.trim()}, ¿cuál es tu objetivo?</p>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>Esto guiará tus recomendaciones.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map(g => <GoalCard key={g.id} {...g} selected={goal === g.id} onSelect={setGoal} />)}
              </div>
            </motion.div>
          )}
          {/* ── STEP 3: Body metrics ── */}
          {step === 3 && (
            <motion.div key="s3" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
              <p style={{ fontSize: 'clamp(22px, 6vw, 26px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Casi listo, {name.trim()}.</p>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
              {goal === 'fuerza' ? '¿Cuánto pesas actualmente?' : goal === 'bajar_grasa' ? 'Vamos a establecer tu objetivo.' : 'Para calcular tu progreso correctamente.'}
            </p>
            {/* Unit toggle */}
            <div style={{ display: 'flex', gap: 0, background: 'var(--surface2)', borderRadius: 'var(--r-pill)', padding: 3, marginBottom: 20, alignSelf: 'center' }}>
              {['kg', 'lbs'].map(u => (
                <button key={u} onClick={() => handleUnitToggle(u)} style={{ height: 34, padding: '0 20px', borderRadius: 'var(--r-pill)', background: unit === u ? 'var(--surface3)' : 'transparent', border: unit === u ? '1px solid var(--border2)' : 'none', color: unit === u ? 'var(--text)' : 'var(--text3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}>{u}</button>
              ))}
            </div>
            {/* Current weight */}
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>Peso actual</p>
            <div style={{ position: 'relative', marginBottom: 6 }}>
              <input type="number" inputMode="decimal" value={currentWeightRaw} onChange={e => setCurrentWeightRaw(e.target.value)} placeholder={unit === 'kg' ? '75' : '165'} style={{ ...inputSt }} onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }} onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }} />
              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 600, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{unit}</span>
            </div>
            {currentWeightRaw && (parseFloat(currentWeightRaw) < (unit === 'kg' ? 30 : 66) || parseFloat(currentWeightRaw) > (unit === 'kg' ? 300 : 660)) && (
              <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>Introduce un peso válido</p>
            )}
            {/* Goal weight — shown if needed */}
            {needsBodyGoal && currentWeightValid && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 16, marginBottom: 4 }}>
                  {goal === 'bajar_grasa' ? '¿Cuál es tu peso objetivo?' : goal === 'volumen' ? '¿Cuánto quieres pesar?' : 'Peso objetivo (opcional)'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
                  {goal === 'bajar_grasa' ? 'Recomendamos no más de 0.5–1 kg por semana' : goal === 'volumen' ? 'Ganar 0.5 kg/mes es un ritmo excelente' : 'Puedes dejarlo igual a tu peso actual'}
                </p>
                <div style={{ position: 'relative', marginBottom: 6 }}>
                  <input type="number" inputMode="decimal" value={goalWeightRaw} onChange={e => setGoalWeightRaw(e.target.value)} placeholder={unit === 'kg' ? '70' : '154'} style={{ ...inputSt }} onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }} onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none' }} />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 600, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{unit}</span>
                </div>
              </motion.div>
            )}
            {/* Timeframe — shown if needed */}
            {needsTimeframe && currentWeightValid && goalWeightKg !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 20, marginBottom: 10 }}>¿En cuánto tiempo quieres conseguirlo?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {TIMEFRAMES.map(tf => (
                    <button key={tf.id} onClick={() => setTimeframe(tf.id)} style={{ height: 52, borderRadius: 'var(--r-sm)', background: timeframe === tf.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${timeframe === tf.id ? 'var(--accent-border)' : 'var(--border)'}`, color: timeframe === tf.id ? 'var(--accent)' : 'var(--text2)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}>{tf.label}</button>
                  ))}
                </div>
                {weeklyTarget !== null && weeklyWarning && (
                  <div style={{ background: weeklyWarning.startsWith('⚠️') ? 'rgba(229,83,75,0.08)' : 'rgba(52,199,123,0.08)', border: `1px solid ${weeklyWarning.startsWith('⚠️') ? 'rgba(229,83,75,0.25)' : 'rgba(52,199,123,0.25)'}`, borderRadius: 10, padding: '10px 14px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: weeklyWarning.startsWith('⚠️') ? 'var(--red)' : 'var(--green)' }}>
                      {weeklyWarning} — {weeklyTarget.toFixed(2)} kg/semana
                    </p>
                  </div>
                )}
              </motion.div>
            )}
              <div style={{ flex: 1, minHeight: 24 }} />
              <CTAButton label="Continuar" disabled={!step4Valid} onClick={() => setStep(4)} />
            </motion.div>
          )}

          {/* ── STEP 4: Confirmation cards — handled by showCompletion guard above ── */}
        </AnimatePresence>
      </div>
    </div>
  )
}
