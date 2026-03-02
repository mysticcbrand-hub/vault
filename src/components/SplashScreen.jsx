import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

// G mark inline — sin fondo opaco, solo el mark puro sobre glass
function GrawMark({ size = 96 }) {
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
          <stop offset="0" stopColor="#F0A55E"/>
          <stop offset="1" stopColor="#C9712D"/>
        </linearGradient>
        <radialGradient id="sp_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E8924A" stopOpacity="0.18"/>
          <stop offset="1" stopColor="#E8924A" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Soft background glow inside the mark */}
      <circle cx="256" cy="256" r="200" fill="url(#sp_glow)"/>
      {/* Inner subtle ring */}
      <circle cx="256" cy="256" r="82" stroke="#E8924A" strokeOpacity="0.2" strokeWidth="10"/>
      {/* Main G ring */}
      <circle cx="256" cy="256" r="110" stroke="url(#sp_ring)" strokeWidth="34" strokeLinecap="round"/>
      {/* G cut bar */}
      <rect x="304" y="240" width="76" height="24" rx="12" fill="url(#sp_ring)"/>
    </svg>
  )
}

const SETTLE = [0.32, 0.72, 0, 1]
const BOUNCE = [0.34, 1.56, 0.64, 1]

const MIN_DISPLAY_MS = 2800
const QUOTE_APPEAR_DELAY = 900

export function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter')
  const quote = getDailyQuote()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('quote'), QUOTE_APPEAR_DELAY)
    const t2 = setTimeout(() => setPhase('exit'), MIN_DISPLAY_MS)
    const t3 = setTimeout(onComplete, MIN_DISPLAY_MS + 650)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const isExiting = phase === 'exit'

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        filter: isExiting ? 'blur(10px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.65, ease: SETTLE }}
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
    >
      {/* ── Ambient orb principal — amber ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: SETTLE }}
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,146,74,0.14) 0%, rgba(232,146,74,0.04) 50%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -54%)',
          pointerEvents: 'none',
        }}
      />
      {/* ── Orb secundario — violeta frio ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, delay: 0.4, ease: SETTLE }}
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(163,127,212,0.09) 0%, transparent 70%)',
          bottom: '20%',
          right: '-5%',
          pointerEvents: 'none',
        }}
      />

      {/* ══ GLASS CARD ══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.80, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.58, delay: 0.06, ease: BOUNCE }}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          padding: '40px 44px 34px',
          borderRadius: 36,
          /* Glassmorphism real */
          background: 'linear-gradient(160deg, rgba(255,255,255,0.072) 0%, rgba(255,255,255,0.018) 100%)',
          backdropFilter: 'blur(32px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
          border: '1px solid rgba(232,146,74,0.22)',
          boxShadow: [
            '0 0 0 1px rgba(255,230,180,0.07) inset',
            '0 1.5px 0 0 rgba(255,230,180,0.12) inset',
            '0 28px 56px rgba(0,0,0,0.6)',
            '0 0 100px rgba(232,146,74,0.07)',
          ].join(', '),
          marginBottom: 44,
          /* Shimmer via mask — no overflow issues */
          overflow: 'hidden',
        }}
      >
        {/* ── Shimmer sweep — contenido dentro del overflow:hidden de la card ── */}
        <motion.div
          initial={{ x: '-180%' }}
          animate={{ x: '180%' }}
          transition={{ duration: 1.1, delay: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '55%',
            background: 'linear-gradient(105deg, transparent 0%, rgba(255,230,180,0.11) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* ── G Mark con pulsing glow ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Glow respirando — capa exterior */}
          <motion.div
            animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.12, 1] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,146,74,0.28) 0%, transparent 68%)',
              pointerEvents: 'none',
            }}
          />
          {/* Glow interior más nítido */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: 'easeInOut', delay: 0.5, repeatType: 'mirror' }}
            style={{
              position: 'absolute',
              width: 108,
              height: 108,
              borderRadius: '50%',
              boxShadow: '0 0 32px rgba(232,146,74,0.32)',
              pointerEvents: 'none',
            }}
          />
          {/* El mark mismo */}
          <motion.div
            initial={{ scale: 0.65, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.62, delay: 0.14, ease: BOUNCE }}
          >
            <GrawMark size={100} />
          </motion.div>
        </div>

        {/* ── Wordmark + tagline ── */}
        <motion.div
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.42, ease: SETTLE }}
          style={{ textAlign: 'center' }}
        >
          {/* GRAW */}
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '0.22em',
            color: '#F5EFE6',
            textTransform: 'uppercase',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1,
          }}>
            GRAW
          </div>

          {/* Separador amber */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.60, ease: SETTLE }}
            style={{
              height: 1,
              width: 28,
              background: 'linear-gradient(90deg, transparent, rgba(232,146,74,0.6), transparent)',
              margin: '10px auto 9px',
              borderRadius: 1,
            }}
          />

          {/* Tagline en castellano — bold, directo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.38, delay: 0.68, ease: SETTLE }}
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: '0.32em',
              color: 'rgba(232,146,74,0.72)',
              textTransform: 'uppercase',
              fontFamily: 'DM Mono, monospace',
            }}
          >
            Pesa más. Sé más.
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Quote diaria ── */}
      <AnimatePresence>
        {phase === 'quote' && (
          <motion.div
            key="quote"
            initial={{ opacity: 0, y: 18, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.56, ease: SETTLE }}
            style={{
              position: 'absolute',
              bottom: 'max(env(safe-area-inset-bottom, 0px), 56px)',
              left: 40,
              right: 40,
              textAlign: 'center',
            }}
          >
            <p style={{
              fontSize: 13,
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'rgba(245,239,230,0.42)',
              lineHeight: 1.65,
              letterSpacing: '0.01em',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              "{quote}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dots de carga ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'enter' ? 0 : 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          position: 'absolute',
          bottom: 'max(env(safe-area-inset-bottom, 0px), 26px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.18, 1, 0.18], scale: [0.75, 1.25, 0.75] }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
              repeatType: 'mirror',
            }}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#E8924A',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
