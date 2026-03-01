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

const MIN_DISPLAY_MS = 2200
const QUOTE_APPEAR_DELAY = 420

export function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('logo') // 'logo' → 'quote' → 'exit'
  const quote = getDailyQuote()

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('quote'), QUOTE_APPEAR_DELAY)
    const t2 = setTimeout(() => setPhase('exit'), MIN_DISPLAY_MS)
    const t3 = setTimeout(onComplete, MIN_DISPLAY_MS + 580)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1, filter: 'blur(0px)' }}
      animate={{
        opacity: phase === 'exit' ? 0 : 1,
        filter: phase === 'exit' ? 'blur(6px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 36px',
        background: `
          radial-gradient(
            ellipse 70% 45% at 50% 38%,
            rgba(232,146,74,0.10) 0%,
            transparent 70%
          ),
          #0C0A09
        `,
      }}
    >
      {/* Logo mark + wordmark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.52, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          marginBottom: 60,
        }}
      >
        {/* GRAW icon mark */}
        <div style={{
          width: 64, height: 64,
          borderRadius: 20,
          background: 'linear-gradient(145deg, rgba(232,146,74,0.18), rgba(201,113,45,0.08))',
          border: '0.5px solid rgba(232,146,74,0.28)',
          boxShadow: '0 0 40px rgba(232,146,74,0.12), inset 0 1px 0 rgba(255,235,200,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect x="4" y="14" width="26" height="6" rx="3" fill="#E8924A" opacity="0.9"/>
            <rect x="1" y="11" width="7" height="12" rx="3" fill="#E8924A" opacity="0.7"/>
            <rect x="26" y="11" width="7" height="12" rx="3" fill="#E8924A" opacity="0.7"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: '#F5EFE6',
          textTransform: 'uppercase',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          GRAW
        </div>
      </motion.div>

      {/* Daily quote — appears after logo settles */}
      <AnimatePresence>
        {phase !== 'logo' && (
          <motion.div
            initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.52, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'absolute',
              bottom: 'max(env(safe-area-inset-bottom, 0px), 48px)',
              left: 36,
              right: 36,
              textAlign: 'center',
            }}
          >
            {/* Amber divider */}
            <div style={{
              width: 28, height: 1.5,
              background: 'rgba(232,146,74,0.4)',
              borderRadius: 1,
              margin: '0 auto 20px',
            }} />
            <p style={{
              fontSize: 13,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(245,239,230,0.52)',
              lineHeight: 1.65,
              letterSpacing: '0.01em',
              margin: 0,
            }}>
              "{quote.text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'logo' ? 0 : 0.45 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 'max(env(safe-area-inset-bottom, 0px), 22px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
        }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              delay: i * 0.22,
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
