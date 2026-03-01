import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { ALL_BADGES } from '../data/badges.js'
import { personalizeFromOnboarding } from '../data/presetPrograms.js'
import useStore from '../store/index.js'

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } },
}

const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner',
    label: 'Menos de 1 año',
    sub: 'Aprendiendo los fundamentos',
    icon: '🌱',
    defaultSets: 3,
    defaultReps: 10,
    programType: 'full_body',
    showFormTips: true,
    exerciseFilter: 'beginner',
  },
  {
    id: 'intermediate',
    label: 'De 1 a 3 años',
    sub: 'Base sólida, buscando progresar',
    icon: '🔥',
    defaultSets: 4,
    defaultReps: 8,
    programType: 'upper_lower',
    showFormTips: false,
    exerciseFilter: 'intermediate',
  },
  {
    id: 'advanced',
    label: 'Más de 3 años',
    sub: 'Técnica pulida, periodización',
    icon: '⚡',
    defaultSets: 4,
    defaultReps: 6,
    programType: 'ppl',
    showFormTips: false,
    exerciseFilter: 'all',
  },
]

const GOAL_OPTIONS = [
  {
    id: 'strength',
    label: 'Ganar fuerza',
    sub: 'Pesos más altos. 1RM máximo.',
    icon: '🏋️',
    restTimer: 180,
    repRange: '3–6 reps',
    programTag: 'strength',
    statPriority: ['1rm', 'volume', 'sessions'],
    chartDefault: '1rm',
    bodyGoal: false,
    badgeTheme: 'power',
  },
  {
    id: 'muscle',
    label: 'Ganar músculo',
    sub: 'Más masa. Mayor volumen.',
    icon: '💪',
    restTimer: 120,
    repRange: '8–12 reps',
    programTag: 'volume',
    statPriority: ['volume', 'sessions', '1rm'],
    chartDefault: 'volume',
    bodyGoal: true,
    bodyGoalType: 'gain',
    badgeTheme: 'growth',
  },
  {
    id: 'fat_loss',
    label: 'Bajar grasa',
    sub: 'Perder grasa, preservar músculo.',
    icon: '🔥',
    restTimer: 75,
    repRange: '12–20 reps',
    programTag: 'cut',
    statPriority: ['sessions', 'streak', 'volume'],
    chartDefault: 'bodyweight',
    bodyGoal: true,
    bodyGoalType: 'loss',
    badgeTheme: 'fire',
  },
  {
    id: 'maintenance',
    label: 'Mantenerme',
    sub: 'Salud y forma a largo plazo.',
    icon: '🛡️',
    restTimer: 90,
    repRange: '10–15 reps',
    programTag: 'maintenance',
    statPriority: ['sessions', 'streak', '1rm'],
    chartDefault: 'volume',
    bodyGoal: true,
    bodyGoalType: 'maintain',
    badgeTheme: 'shield',
  },
]

function ProgressBar({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 36 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            flex: i + 1 === step ? 2.5 : 1,
            background: i < step ? '#E8924A' : 'rgba(255,235,200,0.1)',
          }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          style={{ height: 4, borderRadius: 2 }}
        />
      ))}
    </div>
  )
}

function SelectCard({ option, selected, onSelect }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(option.id)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 18,
        background: selected === option.id ? 'rgba(232,146,74,0.10)' : 'rgba(26,20,12,0.75)',
        border: `1px solid ${selected === option.id ? 'rgba(232,146,74,0.38)' : 'rgba(255,235,200,0.08)'}`,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        width: 44, height: 44,
        borderRadius: 13,
        background: selected === option.id ? 'rgba(232,146,74,0.14)' : 'rgba(255,235,200,0.05)',
        border: `1px solid ${selected === option.id ? 'rgba(232,146,74,0.25)' : 'rgba(255,235,200,0.07)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
        transition: 'all 0.15s ease',
      }}>
        {option.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#F5EFE6', marginBottom: 2 }}>
          {option.label}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.42)' }}>
          {option.sub}
        </div>
      </div>
      <motion.div
        initial={false}
        animate={{ scale: selected === option.id ? 1 : 0.5, opacity: selected === option.id ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <Check size={16} color="#E8924A" />
      </motion.div>
    </motion.button>
  )
}

function WeightInput({ label, value, onChange, unit }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'rgba(245,239,230,0.38)',
        marginBottom: 10,
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        borderBottom: `1.5px solid ${value ? 'rgba(232,146,74,0.45)' : 'rgba(255,235,200,0.14)'}`,
        paddingBottom: 8,
        transition: 'border-color 0.2s ease',
      }}>
        <input
          type="number"
          inputMode="decimal"
          placeholder="—"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none', outline: 'none',
            fontSize: 36, fontWeight: 800,
            letterSpacing: '-0.03em',
            color: value ? '#F5EFE6' : 'rgba(245,239,230,0.2)',
            fontFamily: 'DM Mono, monospace',
          }}
        />
        <span style={{
          fontSize: 16, fontWeight: 600,
          color: 'rgba(245,239,230,0.35)',
          marginBottom: 4,
        }}>
          {unit}
        </span>
      </div>
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  useEffect(() => {
    document.body.style.setProperty('overflow', 'auto', 'important')
    document.body.style.setProperty('background-color', '#0C0A09', 'important')
    document.documentElement.style.setProperty('overflow', 'auto', 'important')
    return () => {
      setTimeout(() => {
        document.body.style.removeProperty('overflow')
        document.documentElement.style.removeProperty('overflow')
      }, 100)
    }
  }, [])

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [completing, setCompleting] = useState(false)
  const [data, setData] = useState({
    name: '',
    experience: null,
    goal: null,
    currentWeight: '',
    goalWeight: '',
    unit: 'kg',
  })

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }))

  const canProceed2 = data.name.trim().length >= 2
  const canProceed5 = data.currentWeight && parseFloat(data.currentWeight) > 0 && parseFloat(data.currentWeight) < 500

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, 5)) }
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)) }

  const handleCardSelect = (setter) => (value) => {
    setter(value)
    setTimeout(() => { setDirection(1); setStep(s => s + 1) }, 280)
  }

  const firstName = useMemo(() => (data.name.trim().split(' ')[0] || ''), [data.name])

  const handleComplete = async () => {
    if (completing) return
    setCompleting(true)

    await new Promise(r => setTimeout(r, 150))

    const goalCfg = GOAL_OPTIONS.find(g => g.id === data.goal)
    const expCfg = EXPERIENCE_OPTIONS.find(e => e.id === data.experience)

    const userData = {
      name: data.name.trim(),
      firstName: firstName,
      level: data.experience === 'beginner' ? 'principiante' : data.experience === 'intermediate' ? 'intermedio' : 'avanzado',
      experience: data.experience,
      goal: data.goal === 'strength' ? 'fuerza' : data.goal === 'muscle' ? 'volumen' : data.goal === 'fat_loss' ? 'bajar_grasa' : 'mantenimiento',
      unit: data.unit,
      currentWeight: data.currentWeight ? parseFloat(data.currentWeight) : null,
      goalWeight: data.goalWeight ? parseFloat(data.goalWeight) : null,
      restTimerDefault: goalCfg?.restTimer ?? 120,
      repRange: goalCfg?.repRange ?? '8–12 reps',
      statPriority: goalCfg?.statPriority ?? ['volume', 'sessions', '1rm'],
      chartDefault: goalCfg?.chartDefault ?? 'volume',
      badgeTheme: goalCfg?.badgeTheme ?? 'growth',
      showFormTips: expCfg?.showFormTips ?? false,
      exerciseFilter: expCfg?.exerciseFilter ?? 'all',
      defaultSets: expCfg?.defaultSets ?? 3,
      defaultReps: expCfg?.defaultReps ?? 10,
      onboardingDate: new Date().toISOString(),
      onboardingComplete: true,
    }

    try {
      const existing = JSON.parse(localStorage.getItem('graw_store') || '{"state":{}}')
      existing.state.user = userData
      localStorage.setItem('graw_store', JSON.stringify(existing))
    } catch {}

    try {
      const existing = JSON.parse(localStorage.getItem('liftvault-storage') || '{"state":{}}')
      existing.state.user = userData
      localStorage.setItem('liftvault-storage', JSON.stringify(existing))
    } catch {}

    const store = useStore.getState()
    store.updateUser(userData)

    try {
      personalizeFromOnboarding(userData.level, userData.goal, store)
      store.updateSettings({ restTimerDefault: goalCfg?.restTimer ?? 120, weightUnit: data.unit })
    } catch {}

    if (userData.currentWeight) {
      store.addBodyMetric({ weight: userData.currentWeight, date: new Date().toISOString(), source: 'onboarding' })
    }

    const firstBadge = ALL_BADGES.find(b => b.id === 'first_login')
    if (firstBadge) {
      store.unlockBadges([{ ...firstBadge, unlockedAt: new Date().toISOString() }])
    }

    onComplete?.(userData)
  }

  const showStickyButton = step === 1 || step === 2 || step === 5
  const ctaLabel = step === 1 ? 'Empezar' : step === 5 ? 'Empezar en GRAW' : 'Continuar'
  const ctaDisabled = step === 1 ? false : step === 2 ? !canProceed2 : step === 5 ? !canProceed5 : false

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 9999,
      backgroundColor: '#0C0A09',
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ maxWidth: 420, margin: '0 auto', padding: '64px 24px 0', minHeight: '100vh' }}>
        {step > 1 && (
          <button
            onClick={goBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(245,239,230,0.45)', fontSize: 15, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '8px 0', minHeight: 44, fontFamily: 'inherit',
              marginBottom: 8,
            }}
          >
            ← Atrás
          </button>
        )}

        <AnimatePresence custom={direction} mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={variants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ width: '100%' }}>
                <motion.div variants={itemVariants} style={{ marginTop: 60 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(232,146,74,0.12)',
                    border: '1px solid rgba(232,146,74,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 0 32px rgba(232,146,74,0.18)',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#E8924A', letterSpacing: '-0.04em' }}>G</span>
                  </div>
                </motion.div>
                <motion.p variants={itemVariants} style={{ marginTop: 24, fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: '#F5EFE6' }}>GRAW</motion.p>
                <motion.p variants={itemVariants} style={{ marginTop: 8, fontSize: 14, letterSpacing: '0.04em', color: 'var(--text3)' }}>Entrena. Progresa. Domina.</motion.p>
                <motion.div variants={itemVariants} style={{ marginTop: 48, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['⚡ Programas inteligentes', '🏆 Logros y rachas', '📊 Progreso real'].map(label => (
                    <div key={label} style={{
                      height: 32, padding: '0 12px', borderRadius: 100,
                      background: 'rgba(255,235,200,0.06)',
                      border: '0.5px solid rgba(255,235,200,0.1)',
                      fontSize: 12, fontWeight: 500,
                      color: 'rgba(245,239,230,0.55)',
                      display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
                    }}>{label}</div>
                  ))}
                </motion.div>
                <motion.p variants={itemVariants} style={{ marginTop: 48, fontSize: 15, color: 'rgba(245,239,230,0.6)' }}>Vamos a personalizar tu experiencia.</motion.p>
                <motion.p variants={itemVariants} style={{ marginTop: 6, fontSize: 13, color: 'rgba(245,239,230,0.35)' }}>Solo tarda 1 minuto.</motion.p>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={variants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            >
              <ProgressBar step={1} total={4} />
              <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>¿Cómo te llamas?</h1>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 32 }}>Así sabremos a quién entrenar.</p>
              <input
                type="text"
                autoComplete="given-name"
                autoCapitalize="words"
                placeholder="Tu nombre"
                value={data.name}
                onChange={e => update('name', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canProceed2 && goNext()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(28,22,14,0.8)',
                  border: `1.5px solid ${data.name.trim().length >= 2 ? 'rgba(232,146,74,0.45)' : 'rgba(255,235,200,0.1)'}`,
                  borderRadius: 16,
                  padding: '18px 20px',
                  fontSize: 20, fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: '#F5EFE6', outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                }}
              />
              {data.name.trim().length >= 2 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: 13, color: 'rgba(232,146,74,0.7)', marginTop: 10, fontWeight: 500 }}
                >
                  Hola, {firstName} 👋
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={variants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            >
              <ProgressBar step={2} total={4} />
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>¿Cuánto llevas entrenando?</h1>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 28 }}>Elegiremos el programa más adecuado.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {EXPERIENCE_OPTIONS.map(option => (
                  <SelectCard
                    key={option.id}
                    option={option}
                    selected={data.experience === option.id}
                    onSelect={handleCardSelect((id) => update('experience', id))}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              variants={variants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            >
              <ProgressBar step={3} total={4} />
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
                {firstName || 'Atleta'}, ¿cuál es tu objetivo?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 28 }}>Ajustaremos todo para que consigas tu meta.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOAL_OPTIONS.map(option => (
                  <SelectCard
                    key={option.id}
                    option={option}
                    selected={data.goal === option.id}
                    onSelect={handleCardSelect((id) => update('goal', id))}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-5"
              variants={variants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            >
              <ProgressBar step={4} total={4} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(232,146,74,0.8)', textTransform: 'uppercase', marginBottom: 8 }}>Último paso</p>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 6 }}>Cuéntanos sobre tu cuerpo.</h1>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 28 }}>Para medir tu progreso real.</p>

              <div style={{ display: 'flex', background: 'rgba(255,235,200,0.05)', border: '0.5px solid rgba(255,235,200,0.1)', borderRadius: 12, padding: 3, width: 120, marginBottom: 28 }}>
                {['kg', 'lbs'].map(u => (
                  <button
                    key={u}
                    onClick={() => update('unit', u)}
                    style={{
                      flex: 1, height: 32, borderRadius: 9,
                      border: 'none',
                      background: data.unit === u ? 'rgba(232,146,74,0.18)' : 'transparent',
                      color: data.unit === u ? '#E8924A' : 'rgba(245,239,230,0.35)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                  >{u}</button>
                ))}
              </div>

              <WeightInput label="Peso actual" value={data.currentWeight} onChange={v => update('currentWeight', v)} unit={data.unit} />

              <AnimatePresence>
                {GOAL_OPTIONS.find(g => g.id === data.goal)?.bodyGoal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 28 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <WeightInput
                      label={data.goal === 'fat_loss' ? 'Peso objetivo' : 'Peso que quieres alcanzar'}
                      value={data.goalWeight}
                      onChange={v => update('goalWeight', v)}
                      unit={data.unit}
                    />
                    {data.currentWeight && data.goalWeight && (() => {
                      const diff = Math.abs(parseFloat(data.goalWeight) - parseFloat(data.currentWeight))
                      const weeks = Math.ceil(diff / (data.goal === 'fat_loss' ? 0.5 : 0.3))
                      return (
                        <p style={{ fontSize: 12, color: 'rgba(245,239,230,0.35)', marginTop: 8 }}>
                          A un ritmo saludable: ~{weeks} semanas
                        </p>
                      )
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, textAlign: 'center' }}>
                Puedes cambiar esto en tu perfil después.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showStickyButton && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent, #0C0A09 28px)',
          padding: '28px 24px',
          paddingBottom: 'max(env(safe-area-inset-bottom), 28px)',
          maxWidth: 420,
          margin: '0 auto',
        }}>
          <button
            onClick={step === 5 ? handleComplete : goNext}
            disabled={ctaDisabled}
            style={{
              width: '100%', height: 56,
              borderRadius: 14, border: 'none',
              background: !ctaDisabled
                ? 'linear-gradient(135deg, #E8924A, #C9712D)'
                : 'rgba(255,235,200,0.08)',
              color: !ctaDisabled ? 'rgba(255,245,235,0.95)' : 'rgba(245,239,230,0.25)',
              fontSize: 16, fontWeight: 700,
              cursor: !ctaDisabled ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export { EXPERIENCE_OPTIONS, GOAL_OPTIONS }
