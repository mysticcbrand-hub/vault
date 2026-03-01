import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Check, ChevronRight, X } from 'lucide-react'
import { getMuscleVars } from '../utils/format.js'
import { MUSCLE_NAMES, getExerciseById } from '../data/exercises.js'
import { isSameDayAs } from '../utils/dates.js'

// ─── Day label helpers ─────────────────────────────────────────────────────────
const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DAY_NAMES   = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function getTodayIndex() {
  const d = new Date().getDay() // 0=Sun
  return d === 0 ? 6 : d - 1   // Monday-based
}

// ─── Muscle pill ─────────────────────────────────────────────────────────────
function MusclePill({ muscle, small }) {
  const mv = getMuscleVars(muscle)
  return (
    <span style={{
      height: small ? 20 : 24,
      padding: small ? '0 7px' : '0 10px',
      borderRadius: 100,
      fontSize: small ? 9 : 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: mv.dim,
      color: mv.color,
      border: `0.5px solid ${mv.border}`,
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {MUSCLE_NAMES[muscle] || muscle}
    </span>
  )
}

// ─── Single day card ──────────────────────────────────────────────────────────
function DayCard({ day, dayIndex, programDayIndex, isNext, isToday, sessions, onStart }) {
  const [expanded, setExpanded] = useState(isNext)
  const template = day._template
  const exercises = template?.exercises || day.exercises || []
  const muscles = template?.muscles
    || day.muscles
    || [...new Set(exercises.map(ex => getExerciseById(ex.exerciseId)?.muscle).filter(Boolean))]
  const primaryMuscle = muscles[0]
  const mv = getMuscleVars(primaryMuscle)

  // Check if this day was trained this week
  const now = new Date()
  const weekStart = new Date(now)
  const dow = now.getDay()
  const daysFromMon = dow === 0 ? 6 : dow - 1
  weekStart.setDate(now.getDate() - daysFromMon)
  weekStart.setHours(0, 0, 0, 0)

  const trainedThisWeek = sessions.some(s => {
    const sd = new Date(s.date)
    return sd >= weekStart && s.templateId === day.templateId
  })

  const totalSets = exercises.reduce((t, e) => t + (Number(e.sets) || 3), 0)
  const estMin = Math.round(exercises.length * 8 + totalSets * 1.5)

  return (
    <motion.div
      layout
      style={{
        borderRadius: 20,
        background: isNext
          ? 'rgba(36,27,14,0.80)'
          : 'rgba(22,18,12,0.65)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `0.5px solid ${isNext
          ? 'rgba(232,146,74,0.28)'
          : 'rgba(255,235,200,0.07)'}`,
        boxShadow: isNext
          ? 'inset 0 1px 0 rgba(255,235,200,0.10), 0 4px 24px rgba(232,146,74,0.08)'
          : 'inset 0 1px 0 rgba(255,235,200,0.05)',
        borderLeft: `3px solid ${mv.color}`,
        overflow: 'hidden',
      }}
    >
      {/* Day header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
          WebkitTapHighlightColor: 'transparent',
        }}
        onTouchStart={e => { e.currentTarget.style.opacity = '0.75' }}
        onTouchEnd={e => { e.currentTarget.style.opacity = '' }}
      >
        {/* Day letter circle */}
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: trainedThisWeek
            ? 'rgba(52,199,123,0.15)'
            : isNext
              ? mv.dim
              : 'rgba(255,235,200,0.05)',
          border: `0.5px solid ${trainedThisWeek
            ? 'rgba(52,199,123,0.3)'
            : isNext
              ? mv.border
              : 'rgba(255,235,200,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {trainedThisWeek ? (
            <Check size={14} color="#34C77B" strokeWidth={2.5} />
          ) : (
            <span style={{
              fontSize: 13, fontWeight: 800,
              color: isNext ? mv.color : 'rgba(245,239,230,0.35)',
              fontFamily: 'DM Mono, monospace',
            }}>
              {DAY_LETTERS[dayIndex % 7] || `D${programDayIndex + 1}`}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              fontSize: 15, fontWeight: 700,
              color: '#F5EFE6',
              letterSpacing: '-0.01em',
            }}>
              {day.name || template?.name || `Día ${programDayIndex + 1}`}
            </span>
            {isNext && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#E8924A',
                background: 'rgba(232,146,74,0.14)',
                border: '0.5px solid rgba(232,146,74,0.3)',
                borderRadius: 6, padding: '2px 7px',
              }}>
                Siguiente
              </span>
            )}
            {trainedThisWeek && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#34C77B',
                background: 'rgba(52,199,123,0.12)',
                border: '0.5px solid rgba(52,199,123,0.25)',
                borderRadius: 6, padding: '2px 7px',
              }}>
                Hecho ✓
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {muscles.slice(0, 3).map(m => <MusclePill key={m} muscle={m} small />)}
            {exercises.length > 0 && (
              <span style={{
                fontSize: 10, color: 'rgba(245,239,230,0.35)',
                fontWeight: 500,
              }}>
                {exercises.length} ej · ~{estMin}min
              </span>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          style={{ flexShrink: 0 }}
        >
          <ChevronRight size={16} color="rgba(245,239,230,0.3)" />
        </motion.div>
      </button>

      {/* Exercise list — expandable */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '0.5px solid rgba(255,235,200,0.07)',
              padding: '10px 16px 14px',
            }}>
              {exercises.length === 0 ? (
                <p style={{ fontSize: 12, color: 'rgba(245,239,230,0.3)', fontStyle: 'italic' }}>
                  Sin ejercicios configurados
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {exercises.map((ex, i) => {
                    const exercise = getExerciseById(ex.exerciseId)
                    const exMv = getMuscleVars(exercise?.muscle)
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '6px 10px',
                        borderRadius: 10,
                        background: 'rgba(255,235,200,0.03)',
                        border: '0.5px solid rgba(255,235,200,0.05)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                            background: exMv.color,
                          }} />
                          <span style={{
                            fontSize: 13, fontWeight: 500,
                            color: 'rgba(245,239,230,0.75)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {exercise?.name || ex.exerciseId}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: 'rgba(245,239,230,0.35)',
                          fontFamily: 'DM Mono, monospace',
                          flexShrink: 0,
                        }}>
                          {ex.sets}×{ex.reps}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Start button — only on next day */}
              {isNext && onStart && exercises.length > 0 && (
                <button
                  onClick={onStart}
                  style={{
                    width: '100%', height: 44, marginTop: 12,
                    borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #E8924A, #C9712D)',
                    boxShadow: '0 4px 16px rgba(232,146,74,0.28), inset 0 1px 0 rgba(255,235,200,0.2)',
                    color: 'rgba(255,245,235,0.96)',
                    fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'opacity 0.15s ease',
                  }}
                  onTouchStart={e => { e.currentTarget.style.opacity = '0.82' }}
                  onTouchEnd={e => { e.currentTarget.style.opacity = '' }}
                >
                  Empezar sesión →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Week strip ───────────────────────────────────────────────────────────────
function ProgramWeekStrip({ program, sessions }) {
  if (!program?.days?.length) return null
  const todayIdx = getTodayIndex()
  const days = program.days

  // Build a 7-day view cycling through program days
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {DAY_LETTERS.map((letter, i) => {
        const isToday = i === todayIdx
        const isPast = i < todayIdx
        // Find which program day maps to this weekday (cycle)
        const progDay = days[i % days.length]
        const mv = getMuscleVars(progDay?._template?.muscles?.[0] || progDay?.muscles?.[0])

        const now = new Date()
        const weekStart = new Date(now)
        const dow = now.getDay()
        const daysFromMon = dow === 0 ? 6 : dow - 1
        weekStart.setDate(now.getDate() - daysFromMon)
        weekStart.setHours(0, 0, 0, 0)
        const thisDay = new Date(weekStart)
        thisDay.setDate(weekStart.getDate() + i)

        const trained = sessions.some(s => isSameDayAs(new Date(s.date), thisDay))

        const bg = trained
          ? 'rgba(52,199,123,0.14)'
          : isToday
            ? mv.dim
            : 'rgba(255,235,200,0.04)'
        const border = trained
          ? 'rgba(52,199,123,0.3)'
          : isToday
            ? mv.border
            : 'rgba(255,235,200,0.07)'
        const color = trained
          ? '#34C77B'
          : isToday
            ? mv.color
            : isPast
              ? 'rgba(245,239,230,0.2)'
              : 'rgba(245,239,230,0.28)'

        return (
          <div key={i} style={{
            flex: 1, height: 52, borderRadius: 12,
            background: bg,
            border: `0.5px solid ${border}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
            opacity: !isPast && !isToday && !trained ? 0.55 : 1,
            boxShadow: isToday ? `0 0 0 1px ${mv.border}, 0 2px 8px ${mv.dim}` : 'none',
            transition: 'all 0.15s ease',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.02em' }}>
              {letter}
            </span>
            {trained ? (
              <Check size={10} color="#34C77B" strokeWidth={3} />
            ) : (
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: isToday ? mv.color : 'rgba(255,235,200,0.18)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main sheet component ─────────────────────────────────────────────────────
export function ProgramOverviewSheet({ isOpen, onClose, program, templates, sessions, nextDayIndex, onStartWorkout }) {
  if (!program) return null

  // Attach template data to each day
  const daysWithTemplates = (program.days || []).map(day => ({
    ...day,
    _template: templates.find(t => t.id === day.templateId) || null,
  }))

  const todayIdx = getTodayIndex()
  const totalExercises = daysWithTemplates.reduce((t, d) =>
    t + (d._template?.exercises?.length || 0), 0)
  const totalSets = daysWithTemplates.reduce((t, d) =>
    t + (d._template?.exercises || []).reduce((s, e) => s + (Number(e.sets) || 3), 0), 0)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.72)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
            style={{
              position: 'fixed',
              left: 0, right: 0, bottom: 0,
              zIndex: 1001,
              maxHeight: '90dvh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(14,11,8,0.96)',
              backdropFilter: 'blur(56px) saturate(220%) brightness(1.04)',
              WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.04)',
              borderRadius: '28px 28px 0 0',
              boxShadow: `
                inset 0 1.5px 0 rgba(255,235,200,0.1),
                0 -4px 60px rgba(0,0,0,0.7),
                0 0 0 0.5px rgba(255,235,200,0.07)
              `,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drag handle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              paddingTop: 12, paddingBottom: 4, flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 4, borderRadius: 100,
                background: 'rgba(255,235,200,0.18)',
              }} />
            </div>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '12px 20px 16px',
              flexShrink: 0,
              borderBottom: '0.5px solid rgba(255,235,200,0.07)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.09em', textTransform: 'uppercase',
                  color: 'rgba(232,146,74,0.75)', marginBottom: 4,
                }}>
                  Programa activo
                </p>
                <h2 style={{
                  fontSize: 22, fontWeight: 800,
                  letterSpacing: '-0.03em', color: '#F5EFE6',
                  margin: 0, lineHeight: 1.1,
                }}>
                  {program.name}
                </h2>
                {program.description && (
                  <p style={{
                    fontSize: 13, color: 'rgba(245,239,230,0.45)',
                    marginTop: 4, lineHeight: 1.45,
                  }}>
                    {program.description}
                  </p>
                )}

                {/* Program meta pills */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {[
                    `${daysWithTemplates.length} días`,
                    totalExercises > 0 ? `${totalExercises} ejercicios` : null,
                    program.weeks ? `${program.weeks} semanas` : null,
                  ].filter(Boolean).map(label => (
                    <span key={label} style={{
                      height: 22, padding: '0 9px',
                      borderRadius: 100,
                      background: 'rgba(255,235,200,0.06)',
                      border: '0.5px solid rgba(255,235,200,0.1)',
                      fontSize: 11, fontWeight: 600,
                      color: 'rgba(245,239,230,0.45)',
                      display: 'inline-flex', alignItems: 'center',
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,235,200,0.07)',
                  border: '0.5px solid rgba(255,235,200,0.1)',
                  color: 'rgba(245,239,230,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  transition: 'all 0.15s ease',
                }}
                onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.12)' }}
                onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,235,200,0.07)' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{
              flex: 1, overflowY: 'auto', overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 16,
              paddingBottom: 32,
            }}>
              {/* Week strip */}
              <div>
                <p style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'rgba(245,239,230,0.35)', marginBottom: 10,
                }}>
                  Esta semana
                </p>
                <ProgramWeekStrip program={{ ...program, days: daysWithTemplates }} sessions={sessions} />
              </div>

              {/* Day cards */}
              <div>
                <p style={{
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'rgba(245,239,230,0.35)', marginBottom: 10,
                }}>
                  Días del programa
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {daysWithTemplates.map((day, i) => (
                    <DayCard
                      key={day.id || i}
                      day={day}
                      dayIndex={(todayIdx + 1 + i) % 7}
                      programDayIndex={i}
                      isNext={i === nextDayIndex}
                      sessions={sessions}
                      onStart={i === nextDayIndex && onStartWorkout ? () => {
                        onClose()
                        const t = day._template
                        if (t) onStartWorkout(t.id, program.id, t.name || day.name)
                      } : null}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
