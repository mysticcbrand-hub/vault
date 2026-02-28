import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sprout, Flame, Zap, Dumbbell, TrendingUp, Shield, ChevronLeft } from 'lucide-react'

// ── STEP 1 — Name ─────────────────────────────────────────────
function StepName({ name, setName, onNext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h1 style={{
        fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em',
        color: '#F5EFE6', marginBottom: 8, lineHeight: 1.2,
      }}>
        ¿Cómo te llamas?
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 32 }}>
        Personalizaremos GRAW para ti.
      </p>

      <input
        type="text"
        autoFocus
        autoComplete="given-name"
        placeholder="Tu nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim().length >= 2 && onNext()}
        style={{
          width: '100%',
          background: 'rgba(24,21,16,0.8)',
          border: '1px solid rgba(255,235,200,0.12)',
          borderRadius: 14,
          padding: '18px 20px',
          fontSize: 20,
          fontWeight: 600,
          color: '#F5EFE6',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          WebkitUserSelect: 'text',
          userSelect: 'text',
        }}
      />

      <div style={{ flex: 1, minHeight: 32 }} />

      <button
        onClick={onNext}
        disabled={name.trim().length < 2}
        style={{
          width: '100%',
          height: 56,
          borderRadius: 14,
          background: name.trim().length >= 2
            ? 'linear-gradient(135deg, #E8924A, #C9712D)'
            : 'rgba(255,235,200,0.08)',
          border: 'none',
          color: name.trim().length >= 2
            ? 'rgba(255,245,235,0.95)'
            : 'rgba(245,239,230,0.25)',
          fontSize: 16,
          fontWeight: 700,
          cursor: name.trim().length >= 2 ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
        }}
      >
        Continuar
      </button>
    </div>
  )
}

// ── STEP 2 — Level ────────────────────────────────────────────
const LEVELS = [
  { id: 'principiante', label: 'Menos de 1 año',  sub: 'Aprendiendo los fundamentos',              Icon: Sprout },
  { id: 'intermedio',   label: 'De 1 a 3 años',   sub: 'Base sólida, buscando progresar',          Icon: Flame  },
  { id: 'avanzado',     label: 'Más de 3 años',    sub: 'Técnica pulida, entrenamiento periodizado', Icon: Zap    },
]

function LevelCard({ id, label, sub, Icon, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px',
        borderRadius: 18,
        background: selected ? 'rgba(232,146,74,0.12)' : 'rgba(22,18,12,0.7)',
        border: `1px solid ${selected ? 'rgba(232,146,74,0.35)' : 'rgba(255,235,200,0.08)'}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: selected ? 'rgba(232,146,74,0.15)' : 'rgba(255,235,200,0.05)',
        border: `1px solid ${selected ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={selected ? '#E8924A' : 'rgba(245,239,230,0.4)'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#F5EFE6', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.45)' }}>{sub}</div>
      </div>
      {selected && <Check size={16} color="#E8924A" />}
    </button>
  )
}

function StepLevel({ level, setLevel, onNext }) {
  const select = (id) => { setLevel(id); setTimeout(onNext, 280) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
        ¿Cuánto llevas entrenando?
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 28 }}>
        Elegiremos el programa más adecuado.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEVELS.map(l => (
          <LevelCard key={l.id} {...l} selected={level === l.id} onSelect={select} />
        ))}
      </div>
    </div>
  )
}

// ── STEP 3 — Goal ─────────────────────────────────────────────
const GOALS = [
  { id: 'fuerza',        label: 'Ganar fuerza',  sub: 'Más peso. 1RM más alto.',              Icon: Dumbbell   },
  { id: 'volumen',       label: 'Ganar músculo', sub: 'Más masa. Mayor volumen.',              Icon: TrendingUp },
  { id: 'bajar_grasa',   label: 'Bajar grasa',   sub: 'Perder grasa, preservar músculo.',      Icon: Flame      },
  { id: 'mantenimiento', label: 'Mantenerme',    sub: 'Salud y forma a largo plazo.',          Icon: Shield     },
]

function GoalCard({ id, label, sub, Icon, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px',
        borderRadius: 18,
        background: selected ? 'rgba(232,146,74,0.12)' : 'rgba(22,18,12,0.7)',
        border: `1px solid ${selected ? 'rgba(232,146,74,0.35)' : 'rgba(255,235,200,0.08)'}`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: selected ? 'rgba(232,146,74,0.15)' : 'rgba(255,235,200,0.05)',
        border: `1px solid ${selected ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={selected ? '#E8924A' : 'rgba(245,239,230,0.4)'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#F5EFE6', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.45)' }}>{sub}</div>
      </div>
      {selected && <Check size={16} color="#E8924A" />}
    </button>
  )
}

function StepGoal({ goal, setGoal, onNext }) {
  const select = (id) => { setGoal(id); setTimeout(onNext, 280) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
        ¿Cuál es tu objetivo?
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 28 }}>
        Ajustaremos todo para que consigas tu meta.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GOALS.map(g => (
          <GoalCard key={g.id} {...g} selected={goal === g.id} onSelect={select} />
        ))}
      </div>
    </div>
  )
}

// ── STEP 4 — Body metrics ─────────────────────────────────────
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(24,21,16,0.8)',
  border: '1px solid rgba(255,235,200,0.12)',
  borderRadius: 14,
  padding: '16px 20px',
  fontSize: 20,
  fontWeight: 600,
  color: '#F5EFE6',
  outline: 'none',
  fontFamily: 'DM Mono, monospace',
  WebkitUserSelect: 'text',
  userSelect: 'text',
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(245,239,230,0.4)',
  marginBottom: 8,
}

function StepBody({ currentWeight, setCurrentWeight, goalWeight, setGoalWeight, unit, setUnit, goal, name, onComplete }) {
  const needsGoalWeight = goal !== 'fuerza'
  const canContinue = currentWeight && parseFloat(currentWeight) > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
        Casi listo, {name}.
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 28 }}>
        Estos datos nos ayudan a medir tu progreso real.
      </p>

      {/* Unit toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['kg', 'lbs'].map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            style={{
              flex: 1, height: 40, borderRadius: 10,
              background: unit === u ? 'rgba(232,146,74,0.15)' : 'rgba(255,235,200,0.05)',
              border: `1px solid ${unit === u ? 'rgba(232,146,74,0.4)' : 'rgba(255,235,200,0.08)'}`,
              color: unit === u ? '#E8924A' : 'rgba(245,239,230,0.4)',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Current weight */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Peso actual</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder={unit === 'kg' ? '75' : '165'}
          value={currentWeight}
          onChange={e => setCurrentWeight(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Goal weight — only if not fuerza */}
      {needsGoalWeight && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Peso objetivo (opcional)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder={unit === 'kg' ? '82' : '180'}
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      <div style={{ flex: 1, minHeight: 32 }} />

      <button
        onClick={onComplete}
        disabled={!canContinue}
        style={{
          width: '100%',
          height: 56,
          borderRadius: 14,
          background: canContinue
            ? 'linear-gradient(135deg, #E8924A, #C9712D)'
            : 'rgba(255,235,200,0.08)',
          border: 'none',
          color: canContinue ? 'rgba(255,245,235,0.95)' : 'rgba(245,239,230,0.25)',
          fontSize: 16,
          fontWeight: 700,
          cursor: canContinue ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
        }}
      >
        Empezar en GRAW
      </button>
    </div>
  )
}

// ── ROOT COMPONENT ─────────────────────────────────────────────
export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)   // 1–4
  const [name, setName] = useState('')
  const [level, setLevel] = useState(null)
  const [goal, setGoal] = useState(null)
  const [currentWeight, setCurrentWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [unit, setUnit] = useState('kg')
  const TOTAL_STEPS = 4

  // Allow body to scroll during onboarding
  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const goBack = () => setStep(s => Math.max(s - 1, 1))

  const handleComplete = () => {
    onComplete({
      name: name.trim() || 'Atleta',
      level,
      goal,
      currentWeight: parseFloat(currentWeight) || null,
      goalWeight: parseFloat(goalWeight) || null,
      unit,
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      backgroundColor: '#0C0A09',
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Inner wrapper — min-height forces full screen, can grow taller to enable scroll */}
      <div style={{
        minHeight: '100dvh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px 60px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        boxSizing: 'border-box',
        maxWidth: 480,
        margin: '0 auto',
      }}>

        {/* Back button row */}
        <div style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 8,
          flexShrink: 0,
        }}>
          {step > 1 && (
            <button
              onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(245,239,230,0.5)',
                fontSize: 15, fontWeight: 500,
                padding: '8px 0',
                minWidth: 44, minHeight: 44,
                fontFamily: 'inherit',
              }}
            >
              <ChevronLeft size={18} /> Atrás
            </button>
          )}
        </div>

        {/* Progress bar dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40, flexShrink: 0 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 4,
                borderRadius: 2,
                flex: i + 1 === step ? 2 : 1,
                background: i + 1 <= step
                  ? '#E8924A'
                  : 'rgba(255,235,200,0.12)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {step === 1 && (
              <StepName name={name} setName={setName} onNext={goNext} />
            )}
            {step === 2 && (
              <StepLevel level={level} setLevel={setLevel} onNext={goNext} />
            )}
            {step === 3 && (
              <StepGoal goal={goal} setGoal={setGoal} onNext={goNext} />
            )}
            {step === 4 && (
              <StepBody
                currentWeight={currentWeight}
                setCurrentWeight={setCurrentWeight}
                goalWeight={goalWeight}
                setGoalWeight={setGoalWeight}
                unit={unit}
                setUnit={setUnit}
                goal={goal}
                name={name.trim() || 'atleta'}
                onComplete={handleComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}

export default Onboarding
