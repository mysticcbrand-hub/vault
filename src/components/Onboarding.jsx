import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sprout, Flame, Zap, Dumbbell, TrendingUp, Shield } from 'lucide-react'

// ── STEP 1 — Name ─────────────────────────────────────────────
function NameContent({ name, setName }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
        autoComplete="given-name"
        placeholder="Tu nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim().length >= 2}
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
        }}
      />
    </div>
  )
}

// ── STEP 2 — Level ────────────────────────────────────────────
const LEVELS = [
  { id: 'principiante', label: 'Menos de 1 año',   sub: 'Aprendiendo los fundamentos',          Icon: Sprout },
  { id: 'intermedio',   label: 'De 1 a 3 años',    sub: 'Base sólida, buscando progresar',      Icon: Flame },
  { id: 'avanzado',     label: 'Más de 3 años',    sub: 'Técnica pulida, entrenamiento periodizado', Icon: Zap },
]

function LevelContent({ level, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
        ¿Cuánto llevas entrenando?
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 28 }}>
        Elegiremos el programa más adecuado.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEVELS.map(({ id, label, sub, Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              borderRadius: 18,
              background: level === id
                ? 'rgba(232,146,74,0.12)'
                : 'rgba(22,18,12,0.7)',
              border: `1px solid ${level === id
                ? 'rgba(232,146,74,0.35)'
                : 'rgba(255,235,200,0.08)'}`,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: level === id ? 'rgba(232,146,74,0.15)' : 'rgba(255,235,200,0.05)',
              border: `1px solid ${level === id ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={level === id ? '#E8924A' : 'rgba(245,239,230,0.4)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F5EFE6', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.45)' }}>{sub}</div>
            </div>
            {level === id && <Check size={16} color="#E8924A" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── STEP 3 — Goal ─────────────────────────────────────────────
const GOALS = [
  { id: 'fuerza',        label: 'Ganar fuerza',   sub: 'Más peso. 1RM más alto.',          Icon: Dumbbell },
  { id: 'volumen',       label: 'Ganar músculo',  sub: 'Más masa. Mayor volumen.',         Icon: TrendingUp },
  { id: 'bajar_grasa',   label: 'Bajar grasa',    sub: 'Perder grasa, preservar músculo.', Icon: Flame },
  { id: 'mantenimiento', label: 'Mantenerme',     sub: 'Salud y forma a largo plazo.',     Icon: Shield },
]

function GoalContent({ goal, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
        ¿Cuál es tu objetivo?
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 28 }}>
        Ajustaremos todo para que consigas tu meta.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GOALS.map(({ id, label, sub, Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              borderRadius: 18,
              background: goal === id ? 'rgba(232,146,74,0.12)' : 'rgba(22,18,12,0.7)',
              border: `1px solid ${goal === id ? 'rgba(232,146,74,0.35)' : 'rgba(255,235,200,0.08)'}`,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: goal === id ? 'rgba(232,146,74,0.15)' : 'rgba(255,235,200,0.05)',
              border: `1px solid ${goal === id ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={goal === id ? '#E8924A' : 'rgba(245,239,230,0.4)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F5EFE6', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.45)' }}>{sub}</div>
            </div>
            {goal === id && <Check size={16} color="#E8924A" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── STEP 4 — Body metrics ─────────────────────────────────────
function BodyContent({ currentWeight, setCurrentWeight, goalWeight, setGoalWeight, unit, setUnit, goal, name }) {
  const needsGoalWeight = goal !== 'fuerza'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#F5EFE6', marginBottom: 8 }}>
        Casi listo, {name}.
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(245,239,230,0.5)', marginBottom: 32 }}>
        Estos datos nos ayudan a medir tu progreso real.
      </p>

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

      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'rgba(245,239,230,0.4)', marginBottom: 8,
        }}>
          Peso actual
        </label>
        <input
          type="number"
          inputMode="decimal"
          placeholder={unit === 'kg' ? '75' : '165'}
          value={currentWeight}
          onChange={e => setCurrentWeight(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(24,21,16,0.8)',
            border: '1px solid rgba(255,235,200,0.12)',
            borderRadius: 14, padding: '16px 20px',
            fontSize: 20, fontWeight: 600,
            color: '#F5EFE6', outline: 'none',
            fontFamily: 'DM Mono, monospace',
          }}
        />
      </div>

      {needsGoalWeight && (
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'rgba(245,239,230,0.4)', marginBottom: 8,
          }}>
            Peso objetivo (opcional)
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder={unit === 'kg' ? '82' : '180'}
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(24,21,16,0.8)',
              border: '1px solid rgba(255,235,200,0.12)',
              borderRadius: 14, padding: '16px 20px',
              fontSize: 20, fontWeight: 600,
              color: '#F5EFE6', outline: 'none',
              fontFamily: 'DM Mono, monospace',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [level, setLevel] = useState(null)
  const [goal, setGoal] = useState(null)
  const [currentWeight, setCurrentWeight] = useState('')
  const [goalWeight, setGoalWeight] = useState('')
  const [unit, setUnit] = useState('kg')

  useEffect(() => {
    document.body.classList.add('onboarding-active')
  }, [])

  const canProceed = {
    1: name.trim().length >= 2,
    2: !!level,
    3: !!goal,
    4: !!currentWeight && parseFloat(currentWeight) > 0,
  }[step]

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1)
    else handleComplete()
  }

  const handleComplete = async () => {
    await new Promise(r => setTimeout(r, 200))
    onComplete({ name: name.trim(), level, goal, currentWeight, goalWeight, unit })
  }

  const buttonLabel = step === 4 ? 'Empezar en GRAW' : 'Continuar'

  const handleCardSelect = (setter, value) => {
    setter(value)
    setTimeout(() => setStep(s => s + 1), 280)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      backgroundColor: '#0C0A09',
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '56px 24px 0',
        boxSizing: 'border-box',
        minHeight: 'calc(100vh - 100px)',
      }}>
        <div style={{ height: 44, display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(245,239,230,0.45)', fontSize: 15, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '8px 0', minHeight: 44, fontFamily: 'inherit',
            }}>
              ← Atrás
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: 4, borderRadius: 2,
              flex: i === step ? 2 : 1,
              background: i <= step ? '#E8924A' : 'rgba(255,235,200,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <NameContent name={name} setName={setName} />}
            {step === 2 && <LevelContent level={level} onSelect={v => handleCardSelect(setLevel, v)} />}
            {step === 3 && <GoalContent goal={goal} onSelect={v => handleCardSelect(setGoal, v)} />}
            {step === 4 && (
              <BodyContent
                currentWeight={currentWeight} setCurrentWeight={setCurrentWeight}
                goalWeight={goalWeight} setGoalWeight={setGoalWeight}
                unit={unit} setUnit={setUnit}
                goal={goal} name={name}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ height: 24 }} />
      </div>

      {(step === 1 || step === 4) && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(12,10,9,0) 0%, #0C0A09 32px)',
          padding: '32px 24px 0',
          paddingBottom: 'max(env(safe-area-inset-bottom), 28px)',
        }}>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              height: 56,
              borderRadius: 14,
              border: 'none',
              background: canProceed
                ? 'linear-gradient(135deg, #E8924A, #C9712D)'
                : 'rgba(255,235,200,0.07)',
              color: canProceed
                ? 'rgba(255,245,235,0.95)'
                : 'rgba(245,239,230,0.2)',
              fontSize: 16, fontWeight: 700,
              cursor: canProceed ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export { Onboarding }
