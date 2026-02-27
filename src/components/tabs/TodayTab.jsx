import { useMemo, useEffect, useRef, useState } from 'react'
import { getGreeting, formatDateHeader, getDayLabel, isSameDayAs, calculateStreak } from '../../utils/dates.js'
import { formatKg, getMuscleVars, getMuscleGradient, relativeDate } from '../../utils/format.js'
import { MUSCLE_NAMES, getExerciseById } from '../../data/exercises.js'
import useStore from '../../store/index.js'
import { useWeeklyStats } from '../../hooks/useWeeklyStats.js'

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(ease * target))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target])
  return value
}

function MusclePill({ muscle }) {
  const mv = getMuscleVars(muscle)
  return (
    <span className="muscle-pill" style={{ background: mv.dim, color: mv.color, border: `1px solid ${mv.color}28` }}>
      {MUSCLE_NAMES[muscle] || muscle}
    </span>
  )
}

function Sparkline({ data = [], color = 'var(--accent)' }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 46
    const y = 14 - (v / max) * 12
    return `${x},${y}`
  }).join(' ')
  const area = `${pts} 46,14 0,14`
  return (
    <svg width="48" height="16" viewBox="0 0 48 16" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace(/[^a-z]/gi,'')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TodayTab({ onStartWorkout, onOpenProfile }) {
  const user = useStore(s => s.user)
  const sessions = useStore(s => s.sessions)
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const activeProgram = useStore(s => s.activeProgram)
  const prs = useStore(s => s.prs)
  const { weekDays, thisWeekVolume, volumeChange, sessionCount } = useWeeklyStats()
  const streak = useMemo(() => calculateStreak(sessions), [sessions])

  const program = programs.find(p => p.id === activeProgram)
  const todayRec = useMemo(() => {
    if (!program?.days?.length) return null
    const recentIds = sessions.slice(0, program.days.length + 2).map(s => s.templateId)
    let idx = 0
    for (let i = program.days.length - 1; i >= 0; i--) {
      if (recentIds.includes(program.days[i].templateId)) { idx = (i + 1) % program.days.length; break }
    }
    const day = program.days[idx]
    const template = templates.find(t => t.id === day?.templateId)
    return { day, template, program }
  }, [program, sessions, templates])

  const todaySession = sessions.find(s => isSameDayAs(s.date, new Date()))
  const primaryMuscle = todayRec?.day?.muscles?.[0] || 'chest'
  const mv = getMuscleVars(primaryMuscle)

  const volCountUp = useCountUp(Math.round(thisWeekVolume / 1000 * 10) / 10 * 10, 700)
  const sessCountUp = useCountUp(sessionCount)
  const streakCountUp = useCountUp(streak.current)

  // Last 7 days volume for sparkline
  const last7Vol = useMemo(() => {
    return weekDays.map(d => {
      const daySessions = sessions.filter(s => isSameDayAs(s.date, d))
      return daySessions.reduce((t, s) => t + (s.totalVolume || 0), 0)
    })
  }, [sessions, weekDays])

  const recentSessions = sessions.slice(0, 3)

  return (
    <div className="pb-nav" style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 24, overflowY: 'auto', height: '100%' }}>
      {/* [A] Header */}
      <div className="si" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 5 }}>
            {getGreeting('').split(',')[0]}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1 }}>
            {user.name}
          </h1>
        </div>
        <button onClick={onOpenProfile} className="pressable" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1.5px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: 'var(--accent)',
          cursor: 'pointer', flexShrink: 0,
        }}>
          {user.name.charAt(0).toUpperCase()}
        </button>
      </div>

      {/* [B] Hero card */}
      <div className="si" style={{ marginBottom: 20, animationDelay: '0.05s' }}>
        {todaySession ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(24,21,16,0.9) 0%, var(--bg) 100%)',
            border: '1px solid rgba(62,207,142,0.2)',
            borderRadius: 'var(--r)', padding: 20, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'var(--green-dim)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Sesión completada hoy</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16, position: 'relative' }}>{todaySession.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, position: 'relative' }}>
              {[
                { l: 'VOLUMEN', v: `${formatKg(todaySession.totalVolume)} kg` },
                { l: 'SERIES', v: todaySession.exercises?.reduce((t,e)=>t+e.sets.filter(s=>s.completed).length,0) },
                { l: 'DURACIÓN', v: `${Math.floor((todaySession.duration||0)/60)}min` },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{v}</p>
                  <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 3 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        ) : todayRec ? (
          <div style={{
            background: getMuscleGradient(primaryMuscle),
            border: `1px solid ${mv.color}28`,
            borderRadius: 'var(--r)', padding: 20,
            position: 'relative', overflow: 'hidden', minHeight: 168,
          }}>
            <div style={{ position: 'absolute', top: -20, left: -20, width: 160, height: 160, borderRadius: '50%', background: mv.dim, filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, position: 'relative', flexWrap: 'wrap' }}>
              {(todayRec.day?.muscles || []).slice(0, 3).map(m => <MusclePill key={m} muscle={m} />)}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 5, position: 'relative' }}>
              {todayRec.day?.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, position: 'relative' }}>
              {todayRec.template?.exercises?.length || 0} ejercicios · ~60 min
            </p>
            <button
              className="pressable shimmer"
              onClick={() => onStartWorkout(todayRec.template?.id, program?.id, todayRec.day?.name)}
              style={{
                width: '100%', height: 48,
                background: 'var(--accent)', border: 'none', borderRadius: 12,
                color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
                cursor: 'pointer', position: 'relative', zIndex: 1,
                boxShadow: '0 4px 20px var(--accent-glow)',
              }}
            >
              EMPEZAR SESIÓN
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>El descanso también es entrenamiento.</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Activa un programa en la pestaña Programas</p>
          </div>
        )}
      </div>

      {/* [C] Stats row */}
      <div className="si" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24, animationDelay: '0.10s' }}>
        {[
          { l: 'KG SEMANA', v: `${volCountUp / 10}k`, sparkData: last7Vol, accent: 'var(--accent)' },
          { l: 'SESIONES', v: sessCountUp, sparkData: null, accent: 'var(--green)' },
          { l: 'RACHA', v: `${streakCountUp}d`, sparkData: null, accent: 'var(--amber)' },
        ].map(({ l, v, sparkData, accent }, i) => (
          <div key={l} style={{
            background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '14px 12px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '0 2px 2px 0', background: accent }} />
            <div style={{ paddingLeft: 6 }}>
              <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v}</p>
              <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text2)', marginTop: 5, marginBottom: sparkData ? 4 : 0 }}>{l}</p>
              {sparkData && <Sparkline data={sparkData} color={accent} />}
            </div>
          </div>
        ))}
      </div>

      {/* [D] Week strip */}
      <div className="si" style={{ marginBottom: 24, animationDelay: '0.15s' }}>
        <div className="section-hd">
          <span className="t-label">Esta semana</span>
          {volumeChange !== null && (
            <span style={{ fontSize: 12, fontWeight: 600, color: volumeChange >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
              {volumeChange >= 0 ? '↑' : '↓'} {Math.abs(volumeChange)}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {weekDays.map((day, i) => {
            const isToday = isSameDayAs(day, new Date())
            const trained = sessions.some(s => isSameDayAs(s.date, day))
            return (
              <div key={i} style={{
                flex: 1, height: 52, borderRadius: 12,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 5,
                background: trained ? 'var(--green-dim)' : isToday ? 'var(--accent-dim)' : 'var(--surface)',
                border: `1px solid ${trained ? 'rgba(62,207,142,0.25)' : isToday ? 'var(--accent-border)' : 'var(--border)'}`,
                animation: isToday ? 'ringPulse 2.5s ease-out infinite' : 'none',
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: trained ? 'var(--green)' : isToday ? 'var(--accent)' : 'var(--text3)' }}>
                  {getDayLabel(day)}
                </span>
                {trained && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />}
                {isToday && !trained && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', opacity: 0.7 }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* [E] Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="si" style={{ animationDelay: '0.20s' }}>
          <div className="section-hd">
            <span className="t-label">Últimas sesiones</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSessions.map((session, i) => {
              const primary = session.muscles?.[0]
              const mv2 = getMuscleVars(primary)
              const prev = sessions[i + 1]
              const delta = prev ? session.totalVolume - prev.totalVolume : null
              return (
                <div key={session.id} className="pressable" style={{
                  background: 'var(--surface)',
                  borderLeft: `3px solid ${mv2.color}`,
                  border: `1px solid var(--border)`,
                  borderLeftWidth: 3,
                  borderLeftColor: mv2.color,
                  borderRadius: 'var(--r-sm)',
                  padding: '13px 13px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: mv2.dim, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: mv2.color }}>
                      {(MUSCLE_NAMES[primary] || 'X')[0].toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>{relativeDate(session.date)} · {Math.floor((session.duration || 0) / 60)}min</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--text)' }}>{formatKg(session.totalVolume)}</p>
                    {delta !== null && (
                      <p style={{ fontSize: 11, fontWeight: 600, color: delta >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                        {delta >= 0 ? '+' : ''}{formatKg(Math.abs(delta))} kg
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
