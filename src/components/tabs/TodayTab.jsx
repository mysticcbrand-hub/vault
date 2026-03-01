import { useMemo, useEffect, useRef, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMuscleVars } from '../../utils/format.js'
import { MUSCLE_NAMES, getExerciseById } from '../../data/exercises.js'
import { calculateStreak, isSameDayAs, getGreeting, formatDateHeader } from '../../utils/dates.js'
import useStore from '../../store/index.js'
import { useWeeklyStats } from '../../hooks/useWeeklyStats.js'
import { GOAL_CONFIG } from '../../data/presetPrograms.js'
import { ensureProgramTemplates } from '../../utils/programs.js'
import { WeeklySummaryCard, calculateWeeklySummaryStats, shouldShowWeeklySummary } from '../WeeklySummaryCard.jsx'
import { ProgramOverviewSheet } from '../ProgramOverviewSheet.jsx'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  const prevTarget = useRef(0)

  useEffect(() => {
    const from = prevTarget.current
    prevTarget.current = target
    if (target === from) return
    let start = null
    cancelAnimationFrame(raf.current)
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + ease * (target - from)))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

function formatVolume(kg) {
  if (!kg || isNaN(kg)) return '0'
  if (kg >= 10000) return (kg / 1000).toFixed(1) + 'k'
  return kg.toLocaleString('es-ES')
}

// Derive 7 day strip from today going back to Monday
function getWeekStrip(sessions) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  // Monday-based week
  const monday = new Date(today)
  const diff = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
  monday.setDate(today.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  return labels.map((label, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const isToday = isSameDayAs(date, today)
    const isPast = date < today && !isToday
    const hasSesh = sessions.some(s => isSameDayAs(s.date, date))

    let status = 'pending'
    if (hasSesh) status = 'completed'
    else if (isToday) status = 'today'
    else if (!isPast) status = 'future'

    return { label, date, status, isToday }
  })
}

// Derive next workout from active program
function deriveNextWorkout(program, templates, sessions) {
  if (!program?.days?.length) return null
  const recentIds = sessions.slice(0, program.days.length + 2).map(s => s.templateId)
  let idx = 0
  for (let i = program.days.length - 1; i >= 0; i--) {
    if (recentIds.includes(program.days[i].templateId)) {
      idx = (i + 1) % program.days.length
      break
    }
  }
  const day = program.days[idx]
  const template = templates.find(t => t.id === day?.templateId)
  return { day, template, program, dayIndex: idx }
}

// Top PR in last 30 days
function deriveTopRecentPR(prs, sessions) {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  let best = null
  Object.entries(prs).forEach(([id, pr]) => {
    if (!pr?.date) return
    if (new Date(pr.date).getTime() < cutoff) return
    if (!best || pr.e1rm > best.e1rm) {
      const ex = getExerciseById(id)
      best = { ...pr, exerciseName: ex?.name || id }
    }
  })
  return best
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function MusclePill({ muscle }) {
  const mv = getMuscleVars(muscle)
  return (
    <span style={{
      height: 24, padding: '0 10px', borderRadius: 'var(--r-xs)',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: mv.dim, color: mv.color,
      display: 'inline-flex', alignItems: 'center',
    }}>
      {MUSCLE_NAMES[muscle] || muscle}
    </span>
  )
}

function WeekStrip({ strip }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {strip.map(({ label, status, isToday }, i) => {
        const bg = status === 'completed'
          ? 'rgba(52,199,123,0.12)'
          : status === 'today'
            ? 'var(--accent-dim)'
            : 'var(--surface)'
        const borderColor = status === 'completed'
          ? 'rgba(52,199,123,0.25)'
          : status === 'today'
            ? 'var(--accent-border)'
            : 'var(--border)'

        return (
          <div key={i} style={{
            flex: 1, height: 56, borderRadius: 14,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5,
            background: bg,
            border: `1px solid ${borderColor}`,
            opacity: status === 'future' ? 0.45 : 1,
            boxShadow: status === 'today'
              ? '0 0 0 1px var(--accent-border), 0 4px 12px rgba(232,146,74,0.1)'
              : 'none',
            animation: status === 'today' ? 'todayPulse 2.5s ease-in-out infinite' : 'none',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: status === 'today' ? 'var(--accent)' : 'var(--text2)' }}>
              {label}
            </span>
            {status === 'completed' && (
              <Check size={12} color="var(--green)" strokeWidth={2.5} />
            )}
            {status === 'today' && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            )}
            {(status === 'pending' || status === 'future') && (
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--border2)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function HeroCard({ next, onStart, onShowProgram }) {
  const template = next?.template
  const muscles = template?.muscles || []
  const primaryMuscle = muscles[0]
  const mv = getMuscleVars(primaryMuscle)

  const exerciseCount = template?.exercises?.length || 0
  const totalSets = (template?.exercises || []).reduce((t, e) => t + (Number(e.sets) || 3), 0)
  const estMin = Math.round(exerciseCount * 8 + totalSets * 1.5)

  if (!template) {
    // Rest day / no program
    return (
      <div style={{
        background: 'linear-gradient(155deg, rgba(20,17,12,0.88) 0%, rgba(12,10,8,0.94) 100%)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 'var(--r-lg)',
        padding: '22px 20px 20px',
        boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,235,200,0.07)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Hoy</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Día de descanso</p>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>La recuperación es donde crece el músculo.</p>
        <button
          onClick={onShowProgram}
          style={{
            marginTop: 8, background: 'none', border: 'none',
            color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, padding: 0,
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.15s ease',
          }}
          onTouchStart={e => { e.currentTarget.style.opacity = '0.65' }}
          onTouchEnd={e => { e.currentTarget.style.opacity = '' }}
        >
          Ver programa completo <ChevronRight size={14} />
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(155deg, rgba(36,27,16,0.88) 0%, rgba(16,13,9,0.94) 100%)',
      backdropFilter: 'blur(32px) saturate(200%)',
      WebkitBackdropFilter: 'blur(32px) saturate(200%)',
      borderRadius: 'var(--r-lg)',
      padding: '22px 20px 20px',
      position: 'relative', overflow: 'hidden',
      boxShadow: `inset 0 1.5px 0 rgba(255,235,200,0.1), inset 1px 0 0 rgba(255,235,200,0.04), 0 8px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,235,200,0.08)`,
    }}>
      {/* Atmospheric glow — muscle color */}
      <div style={{
        position: 'absolute', top: -40, left: -20,
        width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(ellipse, ${mv.color}26 0%, transparent 70%)`,
        filter: 'blur(30px)',
      }} />

      {/* Row 1: muscle pills + program badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {muscles.slice(0, 3).map(m => <MusclePill key={m} muscle={m} />)}
        </div>
        <span style={{
          height: 24, padding: '0 10px', borderRadius: 'var(--r-xs)',
          background: 'rgba(255,235,200,0.06)', border: '0.5px solid var(--border2)',
          fontSize: 11, fontWeight: 600, color: 'var(--text2)',
          display: 'inline-flex', alignItems: 'center', flexShrink: 0,
        }}>
          {next?.program?.name} · Día {(next?.dayIndex || 0) + 1}
        </span>
      </div>

      {/* Workout name */}
      <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6, position: 'relative' }}>
        {template.name}
      </p>

      {/* Meta */}
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, position: 'relative' }}>
        {exerciseCount} ejercicios · ~{estMin} min · {totalSets} series
      </p>

      {/* Start button */}
      <button
        className="pressable"
        onClick={() => onStart(template.id, next.program.id, template.name)}
        style={{
          width: '100%', height: 50, borderRadius: 'var(--r-sm)', border: 'none',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.2), 0 4px 20px var(--accent-glow), 0 8px 32px rgba(232,146,74,0.15)',
          fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
          color: 'rgba(255,245,235,0.96)', cursor: 'pointer', position: 'relative',
        }}
      >
        EMPEZAR SESIÓN
      </button>
    </div>
  )
}

function StreakCard({ streak }) {
  return (
    <div style={{
      background: 'rgba(22,18,12,0.65)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderRadius: 'var(--r)', padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07), 0 0 0 0.5px rgba(255,235,200,0.07)',
    }}>
      {/* Decorative flame */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none',
      }}>
        <path d="M32 56C20 56 12 46 12 36C12 28 18 22 22 18C22 26 28 28 28 28C28 20 34 10 40 6C40 16 48 20 52 28C56 36 52 48 44 52C46 46 44 40 40 38C40 44 36 52 32 56Z"
          fill="var(--accent)" opacity="0.1" />
      </svg>

      {streak > 0 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent)', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {streak}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}>🔥</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {streak === 1 ? 'día seguido' : 'días seguidos'}
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Sin racha aún</p>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Empieza hoy tu racha 🔥</p>
        </div>
      )}
    </div>
  )
}

function StatCards({ weeklyVolume, weeklySessions, topPR, weightDelta, statPriority }) {
  const volUp = useCountUp(weeklyVolume)
  const sessUp = useCountUp(weeklySessions)
  const prUp = useCountUp(topPR?.weight || 0)
  const deltaUp = useCountUp(Math.abs(weightDelta || 0))

  const allStats = {
    '1rm':        { label: 'Mejor 1RM',     value: topPR ? `${prUp}kg` : '—', unit: topPR ? (topPR.exerciseName.length > 12 ? topPR.exerciseName.slice(0, 12) + '…' : topPR.exerciseName) : 'Sin récords', accent: 'var(--red)' },
    'volume':     { label: 'Volumen sem.',   value: formatVolume(volUp),        unit: 'kg esta semana',  accent: 'var(--accent)' },
    'sessions':   { label: 'Sesiones',       value: String(sessUp),             unit: 'esta semana',     accent: 'var(--green)' },
    'bodyweight': { label: 'Progreso peso',  value: weightDelta != null ? `${weightDelta >= 0 ? '+' : ''}${(weightDelta || 0).toFixed(1)}` : '—', unit: 'kg este mes', accent: 'var(--green)' },
  }

  const priority = statPriority || ['volume', 'sessions', '1rm']
  const cards = priority.slice(0, 3).map(key => allStats[key]).filter(Boolean)

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          flex: 1, padding: '14px 12px 12px',
          borderRadius: 'var(--r)',
          background: 'rgba(20,17,12,0.68)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: '0.5px solid var(--border)',
          boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Left accent bar */}
          <div style={{
            position: 'absolute', left: 0, top: '20%', bottom: '20%',
            width: 3, borderRadius: '0 2px 2px 0',
            background: c.accent,
          }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{c.value}</p>
          <p style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>{c.unit}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Stagger variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 16, filter: 'blur(3px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TodayTab({ onStartWorkout, onOpenProfile, onNavigate }) {
  const user = useStore(s => s.user)
  const sessions = useStore(s => s.sessions)
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const activeProgram = useStore(s => s.activeProgram)
  const updateProgram = useStore(s => s.updateProgram)
  const createTemplate = useStore(s => s.createTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)
  const prs = useStore(s => s.prs)
  const { thisWeekVolume, sessionCount } = useWeeklyStats()

  const streakData = useMemo(() => calculateStreak(sessions), [sessions])
  const streak = streakData.current
  const weekStrip = useMemo(() => getWeekStrip(sessions), [sessions])

  const program = programs.find(p => p.id === activeProgram)

  useEffect(() => {
    if (!program?.days?.length) return
    const needsTemplates = program.days.some(d => !d.templateId && (d.exercises || []).length > 0)
    if (!needsTemplates) return
    const normalized = ensureProgramTemplates(program, { createTemplate, updateTemplate })
    updateProgram(program.id, normalized)
  }, [program?.id, program?.days, createTemplate, updateTemplate, updateProgram])

  const next = useMemo(() => deriveNextWorkout(program, templates, sessions), [program, templates, sessions])
  const topPR = useMemo(() => deriveTopRecentPR(prs, sessions), [prs, sessions])

  // Weekly summary card — Sundays only
  const [showWeeklySummary, setShowWeeklySummary] = useState(() => shouldShowWeeklySummary())
  const weeklyStats = useMemo(() => calculateWeeklySummaryStats(sessions), [sessions])

  // Program overview sheet — triggered from rest-day hero card
  const [showProgramOverview, setShowProgramOverview] = useState(false)

  const greeting = getGreeting(user?.name || 'Atleta').split(',')[0]
  const dateStr = formatDateHeader()
  const todayDone = sessions.some(s => isSameDayAs(s.date, new Date()))

  // Goal-based personalization
  const goalCfg = GOAL_CONFIG[user?.goal] || GOAL_CONFIG['volumen']
  const statPriority = goalCfg.statPriority || ['volume', 'sessions', '1rm']
  const todayHint = goalCfg.todayHint || null

  // Weight delta for bodyweight stat card
  const weightDelta = (() => {
    const metrics = useStore.getState().bodyMetrics
    if (!metrics || metrics.length < 2) return null
    const sorted = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date))
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recent = sorted.filter(m => new Date(m.date).getTime() >= cutoff)
    if (recent.length < 2) return null
    return recent[recent.length - 1].weight - recent[0].weight
  })()

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      padding: '0 20px',
      paddingTop: 16,
      paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom), 16px) + 20px)',
      boxSizing: 'border-box',
    }}>
      {/* Weekly summary card — Sundays only, dismissable */}
      <AnimatePresence>
        {showWeeklySummary && (
          <WeeklySummaryCard
            stats={weeklyStats}
            onDismiss={() => {
              localStorage.setItem('weekly_summary_dismissed', new Date().toISOString())
              setShowWeeklySummary(false)
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Greeting */}
        <motion.div variants={itemVariants}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>
            {greeting},
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 2 }}>
            {user?.name || 'Atleta'} 👋
          </p>
          <p style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{dateStr}</p>
          {todayHint && (
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, fontStyle: 'italic' }}>{todayHint}</p>
          )}
        </motion.div>

        {/* Hero workout card */}
        <motion.div variants={itemVariants}>
          {todayDone ? (
            <div style={{
              background: 'rgba(52,199,123,0.08)', border: '1px solid rgba(52,199,123,0.25)',
              borderRadius: 'var(--r-lg)', padding: '18px 20px',
              boxShadow: 'inset 0 1px 0 rgba(200,255,230,0.08)',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>✓ Ya entrenaste hoy</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {sessions.find(s => isSameDayAs(s.date, new Date()))?.name || 'Entrenamiento'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>La recuperación también es entrenar.</p>
              <button
                onClick={() => setShowProgramOverview(true)}
                style={{
                  marginTop: 8, background: 'none', border: 'none',
                  color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Ver programa <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <HeroCard
              next={next}
              onStart={onStartWorkout}
              onShowProgram={() => setShowProgramOverview(true)}
            />
          )}
        </motion.div>

        {/* Program quick actions */}
        <motion.div variants={itemVariants}>
          <div style={{
            borderRadius: 'var(--r-lg)',
            background: 'rgba(22,18,12,0.68)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '0.5px solid rgba(255,235,200,0.08)',
            padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 10,
            boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: 'var(--text)',
                letterSpacing: '-0.01em',
              }}>
                {program?.name ? `Programa activo: ${program.name}` : 'Sin programa activo'}
              </div>
              <button
                onClick={() => onNavigate?.('programs')}
                className="pressable"
                style={{
                  border: 'none', background: 'none',
                  color: 'var(--accent)', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}
              >
                Ver todos <ChevronRight size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => {
                  if (program?.id) {
                    try { sessionStorage.setItem('graw_edit_program_id', program.id) } catch {}
                  }
                  onNavigate?.('programs')
                }}
                className="pressable"
                style={{
                  height: 44, borderRadius: 12,
                  background: 'rgba(232,146,74,0.12)',
                  border: '1px solid rgba(232,146,74,0.25)',
                  color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {program?.id ? 'Editar programa' : 'Crear programa'}
              </button>
              <button
                onClick={() => onNavigate?.('programs')}
                className="pressable"
                style={{
                  height: 44, borderRadius: 12,
                  background: 'var(--surface3)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text2)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cambiar programa
              </button>
            </div>
          </div>
        </motion.div>

        {/* Week strip */}
        <motion.div variants={itemVariants}>
          <p className="t-label" style={{ marginBottom: 10 }}>Esta semana</p>
          <WeekStrip strip={weekStrip} />
        </motion.div>

        {/* Streak */}
        <motion.div variants={itemVariants}>
          <StreakCard streak={streak} />
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={itemVariants}>
          <StatCards
            weeklyVolume={Math.round(thisWeekVolume)}
            weeklySessions={sessionCount}
            topPR={topPR}
            weightDelta={weightDelta}
            statPriority={statPriority}
          />
        </motion.div>

        {/* Last sessions */}
        {sessions.length > 0 && (
          <motion.div variants={itemVariants}>
            <p className="t-label" style={{ marginBottom: 10 }}>Últimas sesiones</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.slice(0, 3).map((s, i) => {
                const primaryMuscle = s.muscles?.[0]
                const mv = getMuscleVars(primaryMuscle)
                return (
                  <div key={s.id} style={{
                    background: 'rgba(22,18,12,0.68)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '0.5px solid rgba(255,235,200,0.07)',
                    borderLeft: `3px solid ${mv.color}`,
                    borderRadius: 'var(--r-sm)',
                    padding: '12px 14px',
                    boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.05)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                        {new Date(s.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text2)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {s.totalVolume?.toLocaleString('es-ES') || 0} kg
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {sessions.length === 0 && (
          <motion.div variants={itemVariants}>
            <div style={{
              padding: '32px 20px', textAlign: 'center',
              background: 'rgba(22,18,12,0.5)', borderRadius: 'var(--r)',
              border: '1px dashed var(--border2)',
            }}>
              <p style={{ fontSize: 28, marginBottom: 12 }}>💪</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Aún sin sesiones</p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                Tu historial aparecerá aquí después de tu primer entrenamiento.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Program overview sheet — opens from rest-day hero card */}
      <ProgramOverviewSheet
        isOpen={showProgramOverview}
        onClose={() => setShowProgramOverview(false)}
        program={program}
        templates={templates}
        sessions={sessions}
        nextDayIndex={next?.dayIndex ?? 0}
        onStartWorkout={onStartWorkout}
      />
    </div>
  )
}
