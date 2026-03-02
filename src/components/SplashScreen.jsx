import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DAILY_QUOTES = [
  "El hierro no miente. Tú sí puedes.",
  "Nadie recuerda el día que descansaron de más.",
  "Duele ahora. Pesa menos después.",
  "El que para, oxida.",
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
  "El dolor de hoy es el orgullo de mañana.",
  "Tres series más y ya eres otro.",
  "Trabaja en silencio. Los resultados hacen ruido solos.",
  "Sal mejor de lo que entraste.",
  "El hierro revela quién eres cuando nadie mira.",
  "Hoy también.",
]

function getDailyQuote() {
  const now = new Date()
  const day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return DAILY_QUOTES[day % DAILY_QUOTES.length]
}

// G mark inline — transparente, sin fondo, flota solo
function GrawMark({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sp_ring" x1="120" y1="140" x2="392" y2="372" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F5A76A"/>
          <stop offset="1" stopColor="#C9712D"/>
        </linearGradient>
        <radialGradient id="sp_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#E8924A" stopOpacity="0.10"/>
          <stop offset="1" stopColor="#E8924A" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#sp_glow)"/>
      <circle cx="256" cy="256" r="82" stroke="rgba(232,146,74,0.16)" strokeWidth="10"/>
      <circle cx="256" cy="256" r="110" stroke="url(#sp_ring)" strokeWidth="32" strokeLinecap="round"/>
      <rect x="306" y="241" width="74" height="22" rx="11" fill="url(#sp_ring)"/>
    </svg>
  )
}

const EO = [0.16, 1, 0.3, 1] // ease-out expressive

export function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter') // enter → quote → exit
  const quote = getDailyQuote()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('quote'), 1000)
    const t2 = setTimeout(() => setPhase('exit'),  3000)
    const t3 = setTimeout(onComplete, 3650)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const exiting = phase === 'exit'

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0C0A09',
        overflow: 'hidden',
      }}
      animate={{
        opacity: exiting ? 0 : 1,
        filter: exiting ? 'blur(8px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.65, ease: EO }}
    >
      {/* Ambient glow — emerge lento */}
      <motion.div
        style={{
          position: 'absolute',
          width: 480, height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,146,74,0.10) 0%, rgba(200,90,20,0.03) 55%, transparent 70%)',
          top: '50%', left: '50%',
          x: '-50%', y: '-54%',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.0, ease: EO }}
      />

      {/* ── Logo mark — entra con fade + scale suave ── */}
      <motion.div
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
        initial={{ opacity: 0, scale: 0.80, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: EO }}
      >
        {/* Breathing glow detrás del mark */}
        <motion.div
          style={{
            position: 'absolute',
            width: 130, height: 130,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,146,74,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.10, 0.95] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
        />
        <GrawMark size={72} />
      </motion.div>

      {/* ── Wordmark — fade puro ── */}
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: EO }}
      >
        <div style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '0.22em',
          color: '#F5EFE6',
          textTransform: 'uppercase',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: 1,
        }}>
          GRAW
        </div>
      </motion.div>

      {/* ── Línea separadora amber — aparece después del wordmark ── */}
      <motion.div
        style={{
          width: 20, height: '0.5px',
          background: 'rgba(232,146,74,0.45)',
          borderRadius: 1,
          marginTop: 16,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.75, ease: EO }}
      />

      {/* ── Quote ── */}
      <AnimatePresence>
        {phase === 'quote' && (
          <motion.p
            key="quote"
            style={{
              position: 'absolute',
              bottom: 'max(env(safe-area-inset-bottom, 0px), 56px)',
              left: 48, right: 48,
              textAlign: 'center',
              fontSize: 12.5,
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'rgba(245,239,230,0.36)',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
            }}
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.65, ease: EO }}
          >
            "{quote}"
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Dots ── */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 'max(env(safe-area-inset-bottom, 0px), 28px)',
          left: '50%', x: '-50%',
          display: 'flex', gap: 5, alignItems: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'enter' ? 0 : 0.4 }}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 3, height: 3, borderRadius: '50%', background: '#E8924A' }}
            animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut', repeatType: 'mirror' }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
