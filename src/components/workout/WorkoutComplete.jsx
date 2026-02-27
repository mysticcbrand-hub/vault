import { useState, useEffect, useRef } from 'react'
import { formatDuration } from '../../utils/dates.js'
import { formatVolumeExact } from '../../utils/volume.js'
import { getExerciseById } from '../../data/exercises.js'

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * value))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value])
  return <>{display.toLocaleString('es-ES')}</>
}

function CheckSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <polyline points="8 21 17 30 32 12" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="40" strokeDashoffset="40"
        style={{ animation: 'checkDraw 0.5s 0.3s ease-out forwards' }}
      />
    </svg>
  )
}

export function WorkoutComplete({ session, newPRs, onSave }) {
  const [notes, setNotes] = useState('')
  if (!session) return null

  const setCount = session.exercises?.reduce((t, e) => t + e.sets.filter(s => s.completed).length, 0) || 0
  const prKeys = Object.keys(newPRs || {})

  const stats = [
    { label: 'DURACIÓN', value: formatDuration(session.duration) },
    { label: 'VOLUMEN', value: `${formatVolumeExact(session.totalVolume)} kg` },
    { label: 'SERIES', value: setCount },
    { label: 'EJERCICIOS', value: session.exercises?.length || 0 },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      background: 'rgba(8,8,15,0.97)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{ flex: 1, padding: '48px 24px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Check + title */}
        <div className="anim-scale-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(50,213,131,0.1)',
            border: '1px solid rgba(50,213,131,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckSVG />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 }}>¡Sesión completada!</h1>
            <p style={{ fontSize: 14, color: 'var(--text2)' }}>{session.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="anim-fade-up stagger-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {stats.map(({ label, value }, i) => (
            <div key={label} style={{
              background: 'var(--surface2)', borderRadius: 16, padding: '16px 14px',
              border: '1px solid var(--border)',
              animationDelay: `${0.3 + i * 0.05}s`,
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</p>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* PRs */}
        {prKeys.length > 0 && (
          <div className="anim-fade-up stagger-2" style={{
            background: 'var(--amber-dim)', border: '1px solid rgba(245,166,35,0.25)',
            borderRadius: 16, padding: '16px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🏆 {prKeys.length === 1 ? 'Nuevo récord personal' : `${prKeys.length} nuevos récords`}
            </p>
            {prKeys.map(id => {
              const ex = getExerciseById(id)
              const pr = newPRs[id]
              return (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(245,166,35,0.15)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ex?.name || id}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>{pr.weight}kg × {pr.reps}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Notes */}
        <div className="anim-fade-up stagger-3">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 8 }}>Notas</p>
          <textarea
            placeholder="¿Cómo fue el entrenamiento?"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="input-base"
            style={{ resize: 'none' }}
          />
        </div>
      </div>

      {/* Save button */}
      <div style={{
        flexShrink: 0, padding: '16px 24px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom,0px))',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <button onClick={() => onSave(notes)} className="pressable btn-shimmer" style={{
          width: '100%', height: 52, borderRadius: 14,
          background: 'var(--accent)', border: 'none',
          color: 'white', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', letterSpacing: '0.01em',
          boxShadow: '0 4px 20px var(--accent-glow)',
        }}>
          Guardar sesión
        </button>
      </div>
    </div>
  )
}
