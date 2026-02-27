import { useState, useEffect, useRef } from 'react'
import { formatDuration } from '../../utils/dates.js'
import { formatKg } from '../../utils/format.js'
import { getExerciseById } from '../../data/exercises.js'

function useCountUp(target, duration = 800) {
  const [v, setV] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return v
}

export function WorkoutComplete({ session, newPRs, onSave }) {
  const [notes, setNotes] = useState('')
  if (!session) return null

  const setCount = session.exercises?.reduce((t, e) => t + e.sets.filter(s => s.completed).length, 0) || 0
  const prKeys = Object.keys(newPRs || {})
  const animVol = useCountUp(session.totalVolume || 0)
  const animSets = useCountUp(setCount)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 70,
      background: 'rgba(9,7,5,0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{ flex: 1, padding: '56px 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Success icon + title */}
        <div className="stagger-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'var(--green-dim)',
            border: '1px solid rgba(52,199,123,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <polyline
                points="8 21 17 30 32 12"
                stroke="var(--green)" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="40" strokeDashoffset="40"
                style={{ animation: 'checkDraw 0.5s 0.3s ease-out forwards' }}
              />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 6 }}>
              ¡Sesión completada!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text2)' }}>{session.name}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="stagger-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, animationDelay: '82ms' }}>
          {[
            { l: 'DURACIÓN', v: formatDuration(session.duration) },
            { l: 'VOLUMEN', v: `${formatKg(animVol)} kg` },
            { l: 'SERIES', v: animSets },
            { l: 'EJERCICIOS', v: session.exercises?.length || 0 },
          ].map(({ l, v }) => (
            <div key={l} style={{
              background: 'rgba(22,18,12,0.68)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: 16, padding: '16px 14px',
              border: '0.5px solid rgba(255,235,200,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)',
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', marginBottom: 6 }}>{v}</p>
              <p className="t-label">{l}</p>
            </div>
          ))}
        </div>

        {/* PRs — shown here ONLY, never mid-session */}
        {prKeys.length > 0 && (
          <div className="stagger-item" style={{
            background: 'rgba(232,146,74,0.08)',
            border: '1px solid rgba(232,146,74,0.22)',
            borderRadius: 16, padding: 16,
            animationDelay: '112ms',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🏆 {prKeys.length === 1 ? 'Nuevo récord personal' : `${prKeys.length} nuevos récords`}
            </p>
            {prKeys.map(id => {
              const ex = getExerciseById(id)
              const pr = newPRs[id]
              return (
                <div key={id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid rgba(232,146,74,0.12)',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ex?.name || id}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>
                    {pr.weight}kg × {pr.reps}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Notes */}
        <div className="stagger-item" style={{ animationDelay: '136ms' }}>
          <p className="t-label" style={{ marginBottom: 8 }}>Notas de la sesión</p>
          <textarea
            placeholder="¿Cómo fue la sesión? Observaciones, sensaciones..."
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, 280))}
            rows={3}
            className="input"
            style={{ fontSize: 16 }}
          />
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>
            {notes.length}/280
          </p>
        </div>
      </div>

      {/* Save button */}
      <div style={{
        flexShrink: 0, padding: '16px 24px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        borderTop: '1px solid rgba(255,235,200,0.07)',
        background: 'rgba(10,8,6,0.95)',
      }}>
        <button
          onClick={() => onSave(notes)}
          className="pressable"
          style={{
            width: '100%', height: 52, borderRadius: 14,
            background: 'var(--accent)', border: 'none',
            color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,146,74,0.3)',
          }}
        >
          Guardar sesión
        </button>
      </div>
    </div>
  )
}
