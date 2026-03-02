import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'

const DAILY_QUOTES = [
  "El hierro no miente. Tú sí puedes.",
  "Nadie recuerda el día que descansaron de más.",
  "Duele ahora. Pesa menos después.",
  "El que para, oxida.",
  "Hoy no. Mañana tampoco. Siempre.",
  "Lo que no te mata, te hace más grande.",
  "Cada kilo levantado es una deuda saldada contigo mismo.",
  "No viniste aquí a sobrevivir.",
  "El cuerpo sigue. La cabeza se rinde primero.",
  "Entrenas cuando quieres. Mejoras cuando no quieres.",
  "La barra no negocia.",
  "Un día más. Un rep más. Sin excusas.",
  "La consistencia es la única trampa que funciona.",
  "El progreso no avisa. Aparece.",
  "Nadie te regaló el físico que tienes. Ni el que quieres.",
  "Pesa el esfuerzo, no la opinión.",
  "Los que paran siempre tienen una razón. Los que siguen, también.",
  "Tu récord de ayer es tu mínimo de hoy.",
  "El gym perdona todo menos la ausencia.",
  "Primero el hábito. Luego la identidad.",
  "No es motivación. Es obligación contigo mismo.",
  "Cada sesión es un voto por quien quieres ser.",
  "Más peso. Menos ruido.",
  "El músculo se construye en el límite, no en la comodidad.",
  "Hay días que no apetece. Son los que más cuentan.",
  "La fuerza no se hereda. Se fabrica.",
  "Sal mejor de lo que entraste.",
  "El dolor de hoy es el orgullo de mañana.",
  "Tres series más y ya eres otro.",
  "Trabaja en silencio. Los resultados hacen ruido solos.",
]

function getDailyQuote() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}

// G mark puro — sin fondo, transparente, flota sobre glass
function GrawMark({ size = 108 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="sp_ring" x1="120" y1="140" x2="392" y2="372" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F5A76A"/>
          <stop offset="1" stopColor="#C9712D"/>
        </linearGradient>
        <radialGradient id="sp_inner" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E8924A" stopOpacity="0.12"/>
          <stop offset="1" stopColor="#E8924A" stopOpacity="0"/>
        </radialGradient>
        <filter id="sp_glow_f">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      {/* Inner ambient fill */}
      <circle cx="256" cy="256" r="180" fill="url(#sp_inner)"/>
      {/* Subtle inner ring */}
      <circle cx="256" cy="256" r="82" stroke="rgba(232,146,74,0.18)" strokeWidth="10"/>
      {/* Main G ring */}
      <circle cx="256" cy="256" r="110" stroke="url(#sp_ring)" strokeWidth="32" strokeLinecap="round"/>
      {/* G cut bar */}
      <rect x="306" y="241" width="74" height="22" rx="11" fill="url(#sp_ring)"/>
    </svg>
  )
}

// Curvas de animación
const SETTLE   = [0.32, 0.72, 0, 1]
const EASE_OUT = [0.16, 1, 0.3, 1]

const ENTER_DURATION_MS  = 3200
const QUOTE_DELAY_MS     = 1100
const EXIT_DELAY_MS      = 3200
const EXIT_DURATION_MS   = 700

export function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter') // enter → quote → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('quote'), QUOTE_DELAY_MS)
    const t2 = setTimeout(() => setPhase('exit'),  EXIT_DELAY_MS)
    const t3 = setTimeout(onComplete, EXIT_DELAY_MS + EXIT_DURATION_MS + 80)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const isExiting = phase === 'exit'
  const quote = getDailyQuote()

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0C0A09',
        overflow: 'hidden',
      }}
      animate={{
        opacity:  isExiting ? 0 : 1,
        filter:   isExiting ? 'blur(16px) brightness(0.6)' : 'blur(0px) brightness(1)',
      }}
      transition={{ duration: EXIT_DURATION_MS / 1000, ease: SETTLE }}
    >

      {/* ─────────────────────────────────────────────
          CAPA 1 — Ambient bloom: emerge muy lentamente
      ───────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,146,74,0.11) 0%, rgba(200,100,30,0.04) 45%, transparent 70%)',
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-56%',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: EASE_OUT }}
      />

      {/* Acento frío — bottom right */}
      <motion.div
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(140,110,220,0.07) 0%, transparent 70%)',
          bottom: '10%',
          right: '-8%',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.8, delay: 0.6, ease: EASE_OUT }}
      />

      {/* ─────────────────────────────────────────────
          CAPA 2 — Glass card
          Entra: escala desde 0.88, fade-in, sin rebote brusco
      ───────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '44px 52px 38px',
          borderRadius: 40,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.068) 0%, rgba(255,255,255,0.016) 100%)',
          backdropFilter: 'blur(36px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(36px) saturate(1.6)',
          border: '0.5px solid rgba(232,146,74,0.20)',
          boxShadow: [
            '0 0 0 0.5px rgba(255,225,170,0.08) inset',
            '0 1px 0 rgba(255,225,170,0.10) inset',
            '0 32px 80px rgba(0,0,0,0.65)',
            '0 0 120px rgba(232,146,74,0.06)',
          ].join(', '),
          overflow: 'hidden',
          marginBottom: 52,
        }}
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT }}
      >

        {/* ── Shimmer fino: una sola pasada, suave, angosto ── */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '38%',
            background: [
              'linear-gradient(',
              '108deg,',
              'transparent 0%,',
              'rgba(255,225,170,0.055) 45%,',
              'rgba(255,225,170,0.085) 50%,',
              'rgba(255,225,170,0.055) 55%,',
              'transparent 100%)',
            ].join(' '),
            pointerEvents: 'none',
            zIndex: 10,
          }}
          initial={{ x: '-120%', opacity: 1 }}
          animate={{ x: '280%',  opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* ── G Mark — entra con fade + escala suave, sin rotate ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Breathing glow exterior */}
          <motion.div
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,146,74,0.22) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
            animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
          />
          {/* G mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.76 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.22, ease: EASE_OUT }}
          >
            <GrawMark size={108} />
          </motion.div>
        </div>

        {/* ── Wordmark — fade + y sutil ── */}
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.52, ease: EASE_OUT }}
        >
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '0.24em',
            color: '#F5EFE6',
            textTransform: 'uppercase',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1,
          }}>
            GRAW
          </div>
        </motion.div>

      </motion.div>

      {/* ─────────────────────────────────────────────
          CAPA 3 — Quote diaria
      ───────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'quote' && (
          <motion.div
            key="quote"
            style={{
              position: 'absolute',
              bottom: 'max(env(safe-area-inset-bottom, 0px), 60px)',
              left: 44,
              right: 44,
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
            exit={{    opacity: 0,         filter: 'blur(6px)'  }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <p style={{
              fontSize: 13,
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'rgba(245,239,230,0.38)',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              "{quote}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          CAPA 4 — Dots de carga (minimalistas)
      ───────────────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 'max(env(safe-area-inset-bottom, 0px), 28px)',
          left: '50%',
          x: '-50%',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'enter' ? 0 : 0.45 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: '#E8924A' }}
            animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.3, 0.8] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.22,
              ease: 'easeInOut',
              repeatType: 'mirror',
            }}
          />
        ))}
      </motion.div>

    </motion.div>
  )
}
