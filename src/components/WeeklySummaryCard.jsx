import { motion } from 'framer-motion'
import { formatVolume } from '../utils/format.js'

function formatDuration(minutes) {
  if (!minutes) return '0min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function WeeklySummaryCard({ stats, onDismiss }) {
  const hasData = stats.sessions > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      style={{
        margin: '0 0 4px',
        borderRadius: 22,
        background: 'linear-gradient(145deg, rgba(36,27,14,0.94) 0%, rgba(18,14,8,0.97) 100%)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '0.5px solid rgba(255,235,200,0.1)',
        boxShadow: `
          inset 0 1.5px 0 rgba(255,235,200,0.1),
          0 8px 40px rgba(0,0,0,0.45)
        `,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Amber top glow */}
      <div style={{
        position: 'absolute',
        top: -30, left: '50%',
        transform: 'translateX(-50%)',
        width: 220, height: 110,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(232,146,74,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '18px 18px 16px', position: 'relative' }}>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'rgba(232,146,74,0.85)',
              marginBottom: 3,
            }}>
              ✦ Resumen semanal
            </div>
            <div style={{
              fontSize: 16, fontWeight: 800,
              color: '#F5EFE6',
              letterSpacing: '-0.02em',
            }}>
              {hasData ? '¡Buena semana!' : 'La semana termina mañana.'}
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'rgba(255,235,200,0.07)',
              border: 'none', cursor: 'pointer',
              color: 'rgba(245,239,230,0.4)',
              fontSize: 18, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.15s ease',
            }}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.12)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.07)' }}
          >×</button>
        </div>

        {hasData ? (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[
                { value: String(stats.sessions), label: 'sesiones', icon: '⚡' },
                { value: formatVolume(stats.totalVolume), label: 'volumen', icon: '🏋️' },
                { value: formatDuration(stats.totalMinutes), label: 'tiempo', icon: '⏱️' },
              ].map((stat, i) => (
                <div key={i} style={{
                  flex: 1,
                  background: 'rgba(255,235,200,0.04)',
                  border: '0.5px solid rgba(255,235,200,0.07)',
                  borderRadius: 13,
                  padding: '10px 8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4, lineHeight: 1 }}>{stat.icon}</div>
                  <div style={{
                    fontSize: 17, fontWeight: 800,
                    color: '#F5EFE6',
                    fontFamily: 'DM Mono, monospace',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginBottom: 4,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 700,
                    color: 'rgba(245,239,230,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* PR + volume delta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              borderTop: '0.5px solid rgba(255,235,200,0.07)',
              paddingTop: 12,
            }}>
              {stats.bestPR ? (
                <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.5)', flex: 1, minWidth: 0 }}>
                  🏆{' '}
                  <span style={{ color: '#E8924A', fontWeight: 700 }}>
                    {stats.bestPR.weight}kg PR
                  </span>
                  {' '}en {stats.bestPR.exerciseName}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'rgba(245,239,230,0.3)', flex: 1 }}>
                  Sin récords esta semana
                </div>
              )}
              {stats.volumeDelta !== null && (
                <div style={{
                  fontSize: 12,
                  color: stats.volumeDelta >= 0
                    ? 'rgba(52,199,123,0.85)'
                    : 'rgba(245,239,230,0.35)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {stats.volumeDelta >= 0 ? '↑' : '↓'} {Math.abs(stats.volumeDelta)}% vs anterior
                </div>
              )}
            </div>
          </>
        ) : (
          <p style={{
            fontSize: 13,
            color: 'rgba(245,239,230,0.4)',
            margin: 0, lineHeight: 1.6,
          }}>
            Esta semana no has entrenado todavía.{'\n'}
            Todavía estás a tiempo de cerrarla bien.
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Weekly stats calculator ──────────────────────────────────────────────────

export function calculateWeeklySummaryStats(sessions) {
  const now = new Date()

  // Monday-based week boundaries
  const dayOfWeek = now.getDay() // 0=Sun
  const daysFromMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysFromMon)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(weekStart.getDate() - 7)
  const prevWeekEnd = new Date(weekStart)

  const inRange = (s, start, end) => {
    const d = new Date(s.date)
    return d >= start && d < end
  }

  const thisWeek = sessions.filter(s => inRange(s, weekStart, weekEnd))
  const lastWeek = sessions.filter(s => inRange(s, prevWeekStart, prevWeekEnd))

  const totalVolume = thisWeek.reduce((acc, s) => acc + (s.totalVolume ?? 0), 0)
  const lastVolume = lastWeek.reduce((acc, s) => acc + (s.totalVolume ?? 0), 0)
  const totalMinutes = thisWeek.reduce((acc, s) => {
    // duration is stored in seconds in some sessions, minutes in others
    const raw = s.durationMinutes ?? (s.duration ? Math.round(s.duration / 60) : 0)
    return acc + raw
  }, 0)

  // Best PR this week — find highest weight set marked isPR
  let bestPR = null
  thisWeek.forEach(sess => {
    (sess.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(set => {
        if (!set.completed) return
        const w = parseFloat(set.weight) || 0
        if (w > 0 && (!bestPR || w > bestPR.weight)) {
          bestPR = {
            weight: w,
            exerciseName: ex.name || ex.exerciseId || 'Ejercicio',
          }
        }
      })
    })
  })

  const volumeDelta = lastVolume > 0
    ? Math.round(((totalVolume - lastVolume) / lastVolume) * 100)
    : null

  return {
    sessions: thisWeek.length,
    totalVolume,
    totalMinutes,
    bestPR,
    volumeDelta,
  }
}

// ─── Hook: should we show the weekly summary card? ───────────────────────────

export function shouldShowWeeklySummary() {
  // Only on Sundays (day 0)
  if (new Date().getDay() !== 0) return false
  const dismissed = localStorage.getItem('weekly_summary_dismissed')
  if (!dismissed) return true
  const dismissedDate = new Date(dismissed)
  const today = new Date()
  return dismissedDate.toDateString() !== today.toDateString()
}
