import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DAILY_QUOTES = [
  { text: "La consistencia vence al talento cuando el talento no es consistente." },
  { text: "No cuentes los días. Haz que los días cuenten." },
  { text: "El dolor que sientes hoy es la fuerza que sentirás mañana." },
  { text: "Un rep más. Siempre hay un rep más." },
  { text: "Los campeones se construyen cuando nadie está mirando." },
  { text: "No entrenes para verte bien en el espejo. Entrena para ser irrompible." },
  { text: "La diferencia entre quien eres y quien quieres ser está en lo que haces." },
  { text: "El cuerpo logra lo que la mente cree." },
  { text: "Cada vez que levantaste cuando no querías — eso te define." },
  { text: "No busques el día perfecto. Haz el día perfecto." },
  { text: "La disciplina es elegir entre lo que quieres ahora y lo que quieres más." },
  { text: "La fuerza no viene de ganar. Viene de las veces que no te rendiste." },
  { text: "Sé el atleta que tu yo de hace un año no podría creer que serías." },
  { text: "El esfuerzo que nadie ve produce los resultados que todos quieren." },
  { text: "Pequeño progreso cada día suma grandes resultados." },
  { text: "No te rindas. El comienzo siempre es lo más difícil." },
  { text: "Tu único competidor eres tú ayer." },
  { text: "La motivación te arranca. El hábito te mantiene." },
  { text: "Haz hoy lo que otros no harán. Vive mañana como otros no podrán." },
  { text: "No hay atajos hacia ningún lugar que valga la pena." },
  { text: "Carga el peso. Afronta el día." },
  { text: "Cada serie es una promesa que te haces a ti mismo." },
  { text: "El gym no te cambia el cuerpo. Te cambia la mente." },
  { text: "Entrena duro, recupera bien, repite siempre." },
  { text: "Lo que hagas en los momentos difíciles define lo que serás." },
  { text: "La única mala sesión es la que no existe." },
  { text: "Más fuerte que ayer. Más sabio que siempre." },
  { text: "El hierro no miente. Solo revela." },
  { text: "Cada día es otra oportunidad de ser mejor." },
  { text: "Construye el cuerpo. Forja el carácter." },
  { text: "La grandeza no se ruega. Se trabaja." },
]

function getDailyQuote() {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  )
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}

// Inline canonical G mark — always crisp, no img/network dependency
function GrawMark({ size = 88 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="sp_mesh1" cx="0" cy="0" r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(150 140) rotate(45) scale(280)">
          <stop offset="0" stopColor="#E8924A" stopOpacity="0.22"/>
          <stop offset="1" stopColor="#0C0A09" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sp_mesh2" cx="0" cy="0" r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(372 300) rotate(20) scale(280)">
          <stop offset="0" stopColor="#A37FD4" stopOpacity="0.18"/>
          <stop offset="1" stopColor="#0C0A09" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sp_mesh3" cx="0" cy="0" r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(280 420) rotate(0) scale(260)">
          <stop offset="0" stopColor="#E8924A" stopOpacity="0.14"/>
          <stop offset="1" stopColor="#0C0A09" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="sp_ring" x1="120" y1="140" x2="392" y2="372" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F0A55E"/>
          <stop offset="1" stopColor="#C9712D"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="115" fill="#0C0A09"/>
      <rect width="512" height="512" rx="115" fill="url(#sp_mesh1)"/>
      <rect width="512" height="512" rx="115" fill="url(#sp_mesh2)"/>
      <rect width="512" height="512" rx="115" fill="url(#sp_mesh3)"/>
      <circle cx="256" cy="256" r="82" stroke="#E8924A" strokeOpacity="0.15" strokeWidth="12"/>
      <circle cx="256" cy="256" r="110" stroke="url(#sp_ring)" strokeWidth="34" strokeLinecap="round"/>
      <rect x="304" y="240" width="76" height="24" rx="12" fill="url(#sp_ring)"/>
    </svg>
  )
}

const SETTLE = [0.32, 0.72, 0, 1]
const BOUNCE = [0.34, 1.56, 0.64, 1]

const MIN_DISPLAY_MS = 2600
const QUOTE_APPEAR_DELAY = 700

export function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter') // 'enter' → 'quote' → 'exit'
  const quote = getDailyQuote()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('quote'), QUOTE_APPEAR_DELAY)
    const t2 = setTimeout(() => setPhase('exit'), MIN_DISPLAY_MS)
    const t3 = setTimeout(onComplete, MIN_DISPLAY_MS + 620)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const isExiting = phase === 'exit'

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1, filter: isExiting ? 'blur(12px)' : 'blur(0px)' }}
      transition={{ duration: 0.6, ease: SETTLE }}
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
      {/* ── Background ambient glow ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: SETTLE }}
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,146,74,0.13) 0%, transparent 68%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -58%)',
          pointerEvents: 'none',
        }}
      />
      {/* Secondary purple ambient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.3, ease: SETTLE }}
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(163,127,212,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-20%, -30%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Glass card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.78, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.62, delay: 0.08, ease: BOUNCE }}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: '36px 40px 32px',
          borderRadius: 32,
          // Glassmorphism
          background: 'linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.022) 100%)',
          backdropFilter: 'blur(28px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
          border: '1px solid rgba(232,146,74,0.18)',
          boxShadow: `
            0 0 0 1px rgba(255,235,200,0.06) inset,
            0 1px 0 0 rgba(255,235,200,0.10) inset,
            0 32px 64px rgba(0,0,0,0.55),
            0 0 80px rgba(232,146,74,0.08)
          `,
          marginBottom: 48,
        }}
      >
        {/* Shimmer sweep on enter */}
        <motion.div
          initial={{ x: '-110%', opacity: 0.7 }}
          animate={{ x: '110%', opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 32,
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,235,200,0.10) 50%, transparent 70%)',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        />

        {/* G mark — pulsing glow ring */}
        <div style={{ position: 'relative' }}>
          {/* Outer glow pulse */}
          <motion.div
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -14,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,146,74,0.22) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          {/* Inner crisp glow ring */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              boxShadow: '0 0 24px rgba(232,146,74,0.28)',
              pointerEvents: 'none',
            }}
          />
          {/* The mark itself */}
          <motion.div
            initial={{ scale: 0.72, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.58, delay: 0.18, ease: BOUNCE }}
          >
            <GrawMark size={96} />
          </motion.div>
        </div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.46, delay: 0.44, ease: SETTLE }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: '#F5EFE6',
            textTransform: 'uppercase',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1,
          }}>
            GRAW
          </div>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.38, delay: 0.62, ease: SETTLE }}
            style={{
              marginTop: 8,
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: '0.28em',
              color: 'rgba(232,146,74,0.7)',
              textTransform: 'uppercase',
              fontFamily: 'DM Mono, monospace',
            }}
          >
            Track the weight
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Daily quote ── */}
      <AnimatePresence>
        {phase === 'quote' && (
          <motion.div
            key="quote"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.54, ease: SETTLE }}
            style={{
              position: 'absolute',
              bottom: 'max(env(safe-area-inset-bottom, 0px), 52px)',
              left: 40,
              right: 40,
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 24, height: 1.5,
              background: 'linear-gradient(90deg, transparent, rgba(232,146,74,0.5), transparent)',
              borderRadius: 1,
              margin: '0 auto 16px',
            }} />
            <p style={{
              fontSize: 12.5,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(245,239,230,0.45)',
              lineHeight: 1.7,
              letterSpacing: '0.015em',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              "{quote.text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading dots ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'enter' ? 0 : 0.5 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          position: 'absolute',
          bottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
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
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
            style={{
              width: 4, height: 4,
              borderRadius: '50%',
              background: '#E8924A',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
