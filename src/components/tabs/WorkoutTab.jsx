import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight, Zap, FileText, Play } from 'lucide-react'
import { ActiveWorkout } from '../workout/ActiveWorkout.jsx'
import { getExerciseById } from '../../data/exercises.js'
import { MUSCLE_NAMES } from '../../data/exercises.js'
import { ensureProgramTemplates } from '../../utils/programs.js'
import useStore from '../../store/index.js'

// ── Suggested day logic ────────────────────────────────────────────────────
// Pick the day that was done longest ago (or first never-done day).
// Smart default — but never forced on the user.
function getSuggestedDay(program, sessions) {
  if (!program?.days?.length) return null

  // Build a map: templateId → most recent session date
  const lastDoneMap = {}
  for (const s of sessions) {
    if (s.templateId && !lastDoneMap[s.templateId]) {
      lastDoneMap[s.templateId] = s.date
    }
  }

  // Find days never performed
  const neverDone = program.days.filter(d => !lastDoneMap[d.templateId])
  if (neverDone.length > 0) return neverDone[0]

  // All days done at least once — return the one done longest ago
  return [...program.days].sort((a, b) => {
    const da = new Date(lastDoneMap[a.templateId] || 0)
    const db = new Date(lastDoneMap[b.templateId] || 0)
    return da - db
  })[0]
}

function getDaysSince(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  return diff
}

// ── Day Selector (Apple Weather style) ─────────────────────────────────────
const DAY_CARD_W = 128

function DaySelector({ program, sessions, selectedDayId, onSelectDay, templates }) {
  const suggestedDay = getSuggestedDay(program, sessions)
  const scrollRef = useRef(null)

  // Build lastDone map from sessions
  const lastDoneMap = {}
  for (const s of sessions) {
    if (s.templateId && !lastDoneMap[s.templateId]) {
      lastDoneMap[s.templateId] = s.date
    }
  }

  return (
    <div style={{ marginTop: 4 }}>
      <p className="t-label" style={{ marginBottom: 10, paddingLeft: 20 }}>
        ELIGE TU DÍA
      </p>
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 10,
          overflowX: 'auto', overflowY: 'hidden',
          paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {program.days.map((day, index) => {
          const isSelected = selectedDayId === day.id
          const isSuggested = suggestedDay?.id === day.id
          const template = templates.find(t => t.id === day.templateId)
          const exerciseCount = template?.exercises?.length || 0
          const lastDate = lastDoneMap[day.templateId]
          const daysSince = getDaysSince(lastDate)

          return (
            <button
              key={day.id}
              className="pressable"
              onClick={() => onSelectDay(day.id)}
              style={{
                flex: '0 0 auto',
                width: DAY_CARD_W,
                padding: '14px 14px 12px',
                borderRadius: 16,
                background: isSelected
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(255,255,255,0.04)',
                border: 'none',
                borderTop: isSelected
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                outline: isSelected
                  ? '0.5px solid rgba(255,255,255,0.15)'
                  : '0.5px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                scrollSnapAlign: 'start',
                transition: 'background 0.18s ease, border-color 0.18s ease, outline-color 0.18s ease',
              }}
            >
              {/* Suggested dot */}
              {isSuggested && !isSelected && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--accent)', opacity: 0.75,
                }} />
              )}

              {/* Day letter */}
              <p style={{
                fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em',
                color: isSelected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)',
                lineHeight: 1, marginBottom: 8,
                transition: 'color 0.18s ease',
              }}>
                {String.fromCharCode(65 + index)}
              </p>

              {/* Day name */}
              <p style={{
                fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                color: isSelected ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.38)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 3,
                transition: 'color 0.18s ease',
              }}>
                {day.name}
              </p>

              {/* Exercise count */}
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.22)',
                letterSpacing: '0',
              }}>
                {exerciseCount} ejercicios
              </p>

              {/* Last performed */}
              <p style={{
                fontSize: 10, marginTop: 5,
                fontWeight: daysSince === null ? 500 : 400,
                color: daysSince === null
                  ? 'rgba(232,146,74,0.55)'
                  : 'rgba(255,255,255,0.18)',
              }}>
                {daysSince === null ? 'Sin hacer' :
                 daysSince === 0 ? 'Hoy' :
                 daysSince === 1 ? 'Ayer' :
                 `Hace ${daysSince}d`}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Exercise Preview ───────────────────────────────────────────────────────
function ExercisePreview({ template }) {
  if (!template?.exercises?.length) return null

  const PREVIEW_COUNT = 3
  const preview = template.exercises.slice(0, PREVIEW_COUNT)
  const remaining = template.exercises.length - PREVIEW_COUNT

  return (
    <div style={{ padding: '0 20px' }}>
      {preview.map((ex, index) => {
        const info = getExerciseById(ex.exerciseId)
        return (
          <div
            key={ex.exerciseId + index}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderBottom: index < preview.length - 1
                ? '0.5px solid rgba(255,255,255,0.06)'
                : 'none',
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.18)',
              width: 22, flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.04em',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span style={{
              flex: 1, fontSize: 14, fontWeight: 500,
              color: 'rgba(255,255,255,0.78)',
              letterSpacing: '-0.01em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {info?.name || ex.exerciseId}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: 'rgba(255,255,255,0.26)',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}>
              {ex.sets} × {ex.reps}
            </span>
          </div>
        )
      })}

      {remaining > 0 && (
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,0.22)',
          marginTop: 8, letterSpacing: '-0.01em',
        }}>
          +{remaining} ejercicios más
        </p>
      )}
    </div>
  )
}


// ═══ WORKOUT TAB ═══════════════════════════════════════════════════════════
export function WorkoutTab({ onSwitchTab }) {
  const activeWorkout = useStore(s => s.activeWorkout)
  const sessions = useStore(s => s.sessions)
  const templates = useStore(s => s.templates)
  const programs = useStore(s => s.programs)
  const activeProgram = useStore(s => s.activeProgram)
  const updateProgram = useStore(s => s.updateProgram)
  const createTemplate = useStore(s => s.createTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)
  const startWorkout = useStore(s => s.startWorkout)
  const startEmptyWorkout = useStore(s => s.startEmptyWorkout)

  const program = programs.find(p => p.id === activeProgram)

  // ── Ensure custom programs have templates wired ──
  useEffect(() => {
    if (!program?.days?.length) return
    const needsTemplates = program.days.some(d => !d.templateId && (d.exercises || []).length > 0)
    if (!needsTemplates) return
    const normalized = ensureProgramTemplates(program, { createTemplate, updateTemplate })
    updateProgram(program.id, normalized)
  }, [program?.id, program?.days, createTemplate, updateTemplate, updateProgram])

  // ── Selected day state ──
  const [selectedDayId, setSelectedDayId] = useState(null)
  const [previewOpacity, setPreviewOpacity] = useState(1)
  const [showSecondary, setShowSecondary] = useState(false)

  // Auto-select suggested day when program changes or on mount
  useEffect(() => {
    if (program?.days?.length) {
      const suggested = getSuggestedDay(program, sessions)
      if (suggested) setSelectedDayId(suggested.id)
    }
  }, [program?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Day switch with fade ──
  const handleSelectDay = useCallback((dayId) => {
    if (dayId === selectedDayId) return
    setPreviewOpacity(0)
    setTimeout(() => {
      setSelectedDayId(dayId)
      setPreviewOpacity(1)
    }, 120)
  }, [selectedDayId])

  // ── If workout is active, show ActiveWorkout ──
  if (activeWorkout) return <ActiveWorkout />

  // ── Derived data ──
  const selectedDay = program?.days?.find(d => d.id === selectedDayId)
  const selectedTemplate = templates.find(t => t.id === selectedDay?.templateId)
  const exerciseCount = selectedTemplate?.exercises?.length || 0

  // ── No active program: empty state ──
  if (!program) {
    return (
      <div style={{
        height: '100%', overflowY: 'auto',
        padding: 'calc(var(--header-h) + 24px) 20px 24px',
        paddingBottom: 'calc(var(--nav-h) + 24px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={24} color="var(--accent)" />
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Sin programa activo</p>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Elige un programa en la pestaña Programas
          </p>
        </div>
        <button
          onClick={() => onSwitchTab?.('programs')}
          className="pressable"
          style={{
            padding: '10px 20px', borderRadius: 12,
            background: 'var(--accent)', border: 'none',
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Ver programas
        </button>

        {/* Secondary actions */}
        <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
          <button
            onClick={startEmptyWorkout}
            className="pressable"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--text2)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Zap size={14} />
            Vacío
          </button>
        </div>
      </div>
    )
  }

  // ── Program with days: main view ──
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* ══ Scrollable content ════════════════════════════════════════════ */}
      <div style={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'calc(var(--header-h) + 20px)',
        paddingBottom: 'calc(var(--nav-h) + 100px)',
      }}>

        {/* Program name — tiny, silver */}
        <p className="stagger-item" style={{
          fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--text3)',
          padding: '0 20px', marginBottom: 4,
        }}>
          {program.name}
        </p>

        {/* Selected day name — large, dominant */}
        <h1 className="stagger-item" style={{
          fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'var(--text)',
          padding: '0 20px', marginBottom: 2,
          opacity: previewOpacity,
          transition: 'opacity 0.14s ease',
        }}>
          {selectedDay?.name || 'Entrenar'}
        </h1>

        {/* Inline meta */}
        {selectedDay && (
          <p className="stagger-item" style={{
            fontSize: 13, color: 'var(--text3)',
            padding: '0 20px', marginBottom: 20,
            opacity: previewOpacity,
            transition: 'opacity 0.14s ease',
            animationDelay: '30ms',
          }}>
            {exerciseCount} ejercicios
            {selectedDay.muscles?.length > 0 && (
              <> · {selectedDay.muscles.map(m => MUSCLE_NAMES[m] || m).join(', ')}</>
            )}
          </p>
        )}

        {/* Day selector — horizontal scroll pills */}
        <div className="stagger-item" style={{ animationDelay: '55ms' }}>
          <DaySelector
            program={program}
            sessions={sessions}
            selectedDayId={selectedDayId}
            onSelectDay={handleSelectDay}
            templates={templates}
          />
        </div>

        {/* Exercise preview */}
        <div className="stagger-item" style={{
          marginTop: 22,
          opacity: previewOpacity,
          transition: 'opacity 0.14s ease',
          animationDelay: '90ms',
        }}>
          <ExercisePreview template={selectedTemplate} />
        </div>

        {/* Secondary actions — minimal text links */}
        <div className="stagger-item" style={{
          marginTop: 28, padding: '0 20px',
          display: 'flex', gap: 20,
          animationDelay: '120ms',
        }}>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="pressable"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--text3)',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 0,
            }}
          >
            <FileText size={14} />
            Desde template
          </button>
          <button
            onClick={startEmptyWorkout}
            className="pressable"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--text3)',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 0,
            }}
          >
            <Zap size={14} />
            Vacío
          </button>
        </div>

        {/* Template list — only if toggled */}
        {showSecondary && templates.length > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            padding: '12px 20px 0',
          }}>
            {templates.map(t => (
              <button
                key={t.id}
                className="pressable"
                onClick={() => startWorkout({ templateId: t.id, programId: null, name: t.name })}
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 'var(--r-sm)',
                  background: 'rgba(22,18,12,0.55)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  border: '0.5px solid rgba(255,235,200,0.06)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                    {(t.exercises || []).length} ejercicios
                  </p>
                </div>
                <ChevronRight size={14} color="var(--text3)" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══ Pinned CTA — outside scroll, always visible ════════════════ */}
      {selectedDay && selectedTemplate && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          paddingBottom: 'calc(var(--nav-h) + 8px)',
          paddingTop: 20,
          paddingLeft: 20, paddingRight: 20,
          background: 'linear-gradient(to top, #0C0A09 40%, rgba(12,10,9,0.92) 70%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <button
            className="pressable"
            onClick={() => startWorkout({
              templateId: selectedTemplate.id,
              programId: activeProgram,
              name: selectedDay.name,
            })}
            style={{
              width: '100%', height: 54,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
              boxShadow: '0 6px 28px rgba(232,146,74,0.30)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              pointerEvents: 'auto',
            }}
          >
            <Play size={16} color="#000" fill="#000" strokeWidth={2.5} />
            <span style={{
              fontSize: 16, fontWeight: 700,
              color: '#000', letterSpacing: '-0.02em',
            }}>
              Empezar · {selectedDay.name}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
