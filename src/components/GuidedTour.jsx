import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { haptics } from '../utils/haptics.js'

// ─────────────────────────────────────────────────────────────────────────────
// GUIDED TOUR — coach marks sobre la UI real. Se muestra una vez tras el
// onboarding. Spotlight animado + tooltip. Saltable en todo momento.
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    tab: 'today', target: 'today-hero',
    title: 'Tu día, listo',
    text: 'GRAW sabe qué toca hoy según tu programa. Un tap en la card y a entrenar.',
  },
  {
    tab: 'today', target: 'streak-card',
    title: 'Semanas perfectas',
    text: 'Completa todos los días de tu programa y tu racha suma una semana perfecta. Las rachas desbloquean logros.',
  },
  {
    target: 'nav-workout',
    title: 'Entrenar',
    text: 'Registra peso, reps y RIR en cada serie. Toca el texto pequeño de un ejercicio para alternar entre tu última sesión, tu PR y tu objetivo.',
  },
  {
    target: 'nav-progress',
    title: 'Progreso',
    text: 'KPIs, volumen por músculo y fuerza por patrón. Cambia la ventana: semana, mes, 6 meses o año.',
  },
  {
    target: 'nav-history',
    title: 'Historial',
    text: 'Todas tus sesiones, agrupadas por semana. Repite cualquier entrenamiento con un tap.',
  },
  {
    target: 'nav-profile',
    title: 'Perfil',
    text: 'Logros, ajustes y copia de seguridad. Exporta tus datos cuando quieras — son tuyos.',
  },
]

const SETTLE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const PAD = 8

export function GuidedTour({ activeTab, onTabChange, onDone }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const current = STEPS[step]

  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tour="${STEPS[step].target}"]`)
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step])

  // Cambia de tab si el paso lo requiere, espera la transición y mide
  useEffect(() => {
    let t1, t2
    if (current.tab && current.tab !== activeTab) {
      onTabChange(current.tab)
      t1 = setTimeout(measure, 420)
    } else {
      t2 = setTimeout(measure, 60)
    }
    window.addEventListener('resize', measure)
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure) }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => {
    haptics.light?.()
    if (step < STEPS.length - 1) setStep(step + 1)
    else onDone()
  }

  if (!rect) return null

  const spotTop = rect.top - PAD
  const spotH = rect.height + PAD * 2
  const below = spotTop + spotH / 2 < window.innerHeight * 0.55
  const tooltipStyle = below
    ? { top: spotTop + spotH + 14 }
    : { bottom: window.innerHeight - spotTop + 14 }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 600 }} onClick={advance}>
      {/* Spotlight — el agujero lo dibuja la sombra */}
      <div style={{
        position: 'absolute',
        top: spotTop, left: rect.left - PAD,
        width: rect.width + PAD * 2, height: spotH,
        borderRadius: 22,
        boxShadow: '0 0 0 9999px rgba(6,5,3,0.82)',
        border: '1.5px solid rgba(232,146,74,0.45)',
        transition: `all 0.45s ${SETTLE}`,
        pointerEvents: 'none',
      }} />

      {/* Tooltip */}
      <div style={{
        position: 'absolute', left: 20, right: 20, ...tooltipStyle,
        background: 'rgba(20,16,11,0.96)',
        backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '0.5px solid rgba(255,235,200,0.14)',
        borderRadius: 20, padding: '18px 18px 14px',
        boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.08), 0 16px 48px rgba(0,0,0,0.6)',
        transition: `all 0.45s ${SETTLE}`,
        animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 }}>
          {current.title}
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 14 }}>
          {current.text}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Progreso */}
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 18 : 6, height: 6, borderRadius: 3,
                background: i === step ? 'var(--accent)' : i < step ? 'rgba(232,146,74,0.4)' : 'rgba(245,239,230,0.15)',
                transition: `all 0.3s ${SETTLE}`,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={e => { e.stopPropagation(); onDone() }}
              style={{
                height: 40, padding: '0 14px', borderRadius: 12,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: 'var(--text3)',
              }}
            >Saltar</button>
            <button
              onClick={e => { e.stopPropagation(); advance() }}
              className="pressable"
              style={{
                height: 40, padding: '0 18px', borderRadius: 12,
                background: 'var(--accent)', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 700, color: '#0C0A09',
                boxShadow: '0 4px 16px rgba(232,146,74,0.3)',
              }}
            >{step === STEPS.length - 1 ? 'Entendido' : 'Siguiente'}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
