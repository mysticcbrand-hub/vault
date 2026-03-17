import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/index.js'
import { formatRest } from '../../utils/format.js'

// ─── Live elapsed timer ───────────────────────────────────────────────────────
function useElapsed(startTime) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startTime) return
    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startTime])
  return elapsed
}

function formatElapsed(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}



// ─── Focus Nav — replaces bottom nav during workout ──────────────────────────
function FocusNav({ activeWorkout, onFinish }) {
  const elapsed = useElapsed(activeWorkout?.startTime)
  const exercises = activeWorkout?.exercises || []

  const completedSets = exercises.reduce((acc, ex) =>
    acc + (ex.sets || []).filter(s => s.completed).length, 0)
  const allDone = exercises.length > 0 && exercises.every(ex =>
    ex.sets?.length > 0 && ex.sets.every(s => s.completed)
  )

  // Live volume
  const currentVolume = exercises.reduce((total, ex) =>
    total + (ex.sets || []).reduce((s, set) =>
      s + (set.completed ? (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0) : 0), 0
    ), 0)

  const fmtVol = (v) => {
    if (!v) return '0 kg'
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k kg`
    return `${Math.round(v)} kg`
  }

  // "All done" haptic — fires once
  const [hapticked, setHapticked] = useState(false)
  useEffect(() => {
    if (allDone && !hapticked) {
      try { navigator.vibrate([100, 50, 100, 50, 200]) } catch (e) {}
      setHapticked(true)
    }
  }, [allDone, hapticked])

  return (
    <motion.div
      key="focus-nav"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 420, damping: 42 }}
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(10,8,6,0.90)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderTop: '0.5px solid rgba(255,235,200,0.08)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        paddingTop: 12,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        maxWidth: 440,
        margin: '0 auto',
      }}>
        {/* Elapsed timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 72 }}>
          <div style={{
            fontSize: 22, fontWeight: 800,
            fontFamily: 'DM Mono, monospace',
            color: '#F5EFE6',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {formatElapsed(elapsed)}
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700,
            color: 'rgba(245,239,230,0.35)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginTop: 3,
          }}>
            En curso
          </div>
        </div>

        {/* FINALIZAR / GUARDAR button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onFinish}
          style={{
            height: 50, padding: '0 26px',
            borderRadius: 16, border: 'none',
            background: allDone
              ? 'linear-gradient(135deg, #34C77B, #28A863)'
              : 'linear-gradient(135deg, rgba(229,83,75,0.92), rgba(185,48,43,0.92))',
            color: 'rgba(255,245,235,0.96)',
            fontSize: 14, fontWeight: 800,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: allDone
              ? '0 4px 20px rgba(52,199,123,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
              : '0 4px 20px rgba(229,83,75,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
            transition: 'background 0.28s ease, box-shadow 0.28s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {allDone ? '✓ Guardar sesión' : 'Finalizar'}
        </motion.button>

        {/* Live volume */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 72 }}>
          <div style={{
            fontSize: 18, fontWeight: 800,
            fontFamily: 'DM Mono, monospace',
            color: '#E8924A',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {fmtVol(currentVolume)}
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700,
            color: 'rgba(245,239,230,0.35)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginTop: 3,
          }}>
            Volumen
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main FocusMode — renders bottom nav via portal ──────────────────────────
export function FocusMode({ onFinish }) {
  const activeWorkout = useStore(s => s.activeWorkout)
  const isActive = !!activeWorkout

  if (!isActive) return null

  return createPortal(
    <AnimatePresence>
      {isActive && (
        <FocusNav activeWorkout={activeWorkout} onFinish={onFinish} />
      )}
    </AnimatePresence>,
    document.body
  )
}
