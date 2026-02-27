import { useMemo, useEffect, useRef, useState } from 'react'
import { getGreeting, formatDate, getDayLabel, isSameDayAs } from '../../utils/dates.js'
import { formatVolumeExact, formatVolume } from '../../utils/volume.js'
import { getRandomRestQuote } from '../../data/quotes.js'
import { getExerciseById, MUSCLE_COLORS, MUSCLE_NAMES } from '../../data/exercises.js'
import { calculateStreak } from '../../utils/dates.js'
import useStore from '../../store/index.js'
import { useWeeklyStats } from '../../hooks/useWeeklyStats.js'

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * value))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value, duration])
  return <>{display.toLocaleString('es-ES')}</>
}

function MusclePill({ muscle }) {
  const c = MUSCLE_COLORS[muscle]
  if (!c) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 22, padding: '0 8px',
      borderRadius: 6, fontSize: 10, fontWeight: 600,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: '0.02em',
    }}>
      {MUSCLE_NAMES[muscle]}
    </span>
  )
}

const MuscleSquare = ({ muscle }) => {
  const c = MUSCLE_COLORS[muscle] || {}
  const letter = (MUSCLE_NAMES[muscle] || 'X')[0].toUpperCase()
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: c.bg || 'var(--surface3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: c.text || 'var(--text2)' }}>{letter}</span>
    </div>
  )
}

export function TodayTab({ onStartWorkout, onOpenProfile }) {
  const user = useStore(s => s.user)
  const sessions = useStore(s => s.sessions)
  const activeProgram = useStore(s => s.activeProgram)
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const prs = useStore(s => s.prs)
  const { weekDays, thisWeekSessions, thisWeekVolume, volumeChange, sessionCount } = useWeeklyStats()

  const program = programs.find(p => p.id === activeProgram)

  const todayRecommendation = useMemo(() => {
    if (!program?.days?.length) return null
    const recentTemplateIds = sessions.slice(0, program.days.length + 2).map(s => s.templateId)
    let nextDayIndex = 0
    for (let i = program.days.length - 1; i >= 0; i--) {
      if (recentTemplateIds.includes(program.days[i].templateId)) {
        nextDayIndex = (i + 1) % program.days.length; break
      }
    }
    const nextDay = program.days[nextDayIndex]
    const template = templates.find(t => t.id === nextDay?.templateId)
    return { day: nextDay, template, program }
  }, [program, sessions, templates])

  const todaySession = sessions.find(s => isSameDayAs(s.date, new Date()))
  const streak = useMemo(() => calculateStreak(sessions), [sessions])

  const recentSessions = sessions.slice(0, 3)

  const greeting = getGreeting(user.name).split(',')[0]
  const name = user.name

  return (
    <div style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 20px)' }}>

      {/* [A] HEADER */}
      <div className="anim-fade-up" style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 4 }}>
            {greeting}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1 }}>
            {name}
          </h1>
        </div>
        <button onClick={onOpenProfile} className="pressable" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '1.5px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: 'var(--accent)',
          cursor: 'pointer', flexShrink: 0,
        }}>
          {name.charAt(0).toUpperCase()}
        </button>
      </div>

      {/* [B] HERO WORKOUT CARD */}
      <div className="anim-fade-up stagger-1" style={{ margin: '0 20px 24px' }}>
        {todaySession ? (
          <div style={{
            background: 'linear-gradient(135deg, #0e1f18 0%, #0a0f0a 100%)',
            border: '1px solid rgba(50,213,131,0.25)',
            borderRadius: 22, padding: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(50,213,131,0.06)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Sesión completada hoy</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16 }}>{todaySession.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'VOLUMEN', value: formatVolumeExact(todaySession.totalVolume), unit: 'kg' },
                { label: 'SERIES', value: todaySession.exercises?.reduce((t,e)=>t+e.sets.filter(s=>s.completed).length,0) },
                { label: 'DURACIÓN', value: `${Math.floor((todaySession.duration||0)/60)}`, unit: 'min' },
              ].map(({ label, value, unit }) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                    {value}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text3)', marginLeft: 2 }}>{unit}</span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : todayRecommendation ? (
          <div style={{
            background: 'linear-gradient(135deg, #1A1535 0%, #0F0F1E 100%)',
            border: '1px solid rgba(124,111,247,0.2)',
            borderRadius: 22, padding: '20px',
            position: 'relative', overflow: 'hidden',
            minHeight: 160,
          }}>
            {/* Radial glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(124,111,247,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
            {/* Muscle pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, position: 'relative' }}>
              {(todayRecommendation.day?.muscles || []).slice(0, 3).map(m => <MusclePill key={m} muscle={m} />)}
            </div>
            {/* Title */}
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6, position: 'relative' }}>
              {todayRecommendation.day?.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, position: 'relative' }}>
              {todayRecommendation.template?.exercises?.length || 0} ejercicios · ~60 min
            </p>
            {/* CTA */}
            <button
              className="pressable btn-shimmer"
              onClick={() => onStartWorkout(todayRecommendation.template?.id, program?.id, todayRecommendation.day?.name)}
              style={{
                width: '100%', height: 48,
                background: 'var(--accent)',
                border: 'none', borderRadius: 12,
                color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
                cursor: 'pointer', position: 'relative', zIndex: 1,
                boxShadow: '0 4px 20px var(--accent-glow)',
              }}
            >
              EMPEZAR SESIÓN
            </button>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #1A1535 0%, #0F0F1E 100%)',
            border: '1px solid rgba(124,111,247,0.15)',
            borderRadius: 22, padding: '32px 20px',
            textAlign: 'center',
          }}>
            <RestDaySVG />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 16, marginBottom: 8 }}>Día de descanso</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{getRandomRestQuote().quote}</p>
          </div>
        )}
      </div>

      {/* [C] STATS ROW */}
      <div className="anim-fade-up stagger-2" style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'KG SEMANA', value: Math.round(thisWeekVolume / 1000 * 10) / 10, unit: 'k', accent: 'var(--accent)' },
            { label: 'SESIONES', value: sessionCount, unit: '', accent: 'var(--green)' },
            { label: 'RACHA', value: streak.current, unit: ' días', accent: 'var(--amber)' },
          ].map(({ label, value, unit, accent }, i) => (
            <div key={label} style={{
              background: 'var(--surface2)',
              borderRadius: 16,
              padding: '14px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 3, borderRadius: '0 2px 2px 0',
                background: accent,
              }} />
              <div style={{ paddingLeft: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  <AnimatedNumber value={typeof value === 'number' ? value : 0} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)', marginLeft: 2 }}>{unit}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginTop: 6 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* [D] WEEK STRIP */}
      <div className="anim-fade-up stagger-3" style={{ padding: '0 20px', marginBottom: 24 }}>
        <div className="section-header">
          <span className="section-label">Esta semana</span>
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
              <div
                key={i}
                className={isToday ? 'today-ring' : ''}
                style={{
                  flex: 1, height: 52, borderRadius: 12,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: trained ? 'var(--green-dim)' : isToday ? 'var(--accent-dim)' : 'var(--surface)',
                  border: trained ? '1px solid rgba(50,213,131,0.3)'
                       : isToday ? '1px solid rgba(124,111,247,0.4)'
                       : '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: trained ? 'var(--green)' : isToday ? 'var(--accent)' : 'var(--text3)' }}>
                  {getDayLabel(day)}
                </span>
                {trained && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />}
                {isToday && !trained && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', opacity: 0.8 }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* [E] RECENT SESSIONS */}
      {recentSessions.length > 0 && (
        <div className="anim-fade-up stagger-4" style={{ padding: '0 20px' }}>
          <div className="section-header">
            <span className="section-label">Últimas sesiones</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Ver todo</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSessions.map((session, i) => {
              const primary = session.muscles?.[0]
              return (
                <div key={session.id} className="pressable card-sm" style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MuscleSquare muscle={primary} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(session.date)} · {Math.floor((session.duration || 0) / 60)}min</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--text)' }}>{formatVolumeExact(session.totalVolume)}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)' }}>kg</p>
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

function RestDaySVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
      <circle cx="40" cy="40" r="30" stroke="var(--text3)" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="20" stroke="var(--text3)" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="10" stroke="var(--text3)" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="3" fill="var(--text3)"/>
      <line x1="20" y1="20" x2="60" y2="60" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
