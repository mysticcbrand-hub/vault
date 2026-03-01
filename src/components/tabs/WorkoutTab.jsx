import { useState, useEffect } from 'react'
import { ChevronRight, Zap, FileText } from 'lucide-react'
import { ActiveWorkout } from '../workout/ActiveWorkout.jsx'
import { getMuscleVars } from '../../utils/format.js'
import { formatKg, relativeDate } from '../../utils/format.js'
import { MUSCLE_NAMES } from '../../data/exercises.js'
import { ExercisePicker } from '../workout/ExercisePicker.jsx'
import { ensureProgramTemplates } from '../../utils/programs.js'
import useStore from '../../store/index.js'

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
  const [showTemplates, setShowTemplates] = useState(false)

  if (activeWorkout) return <ActiveWorkout />

  const program = programs.find(p => p.id === activeProgram)

  // Ensure custom programs have templates wired
  useEffect(() => {
    if (!program?.days?.length) return
    const needsTemplates = program.days.some(d => !d.templateId && (d.exercises || []).length > 0)
    if (!needsTemplates) return
    const normalized = ensureProgramTemplates(program, { createTemplate, updateTemplate })
    updateProgram(program.id, normalized)
  }, [program?.id, program?.days, createTemplate, updateTemplate, updateProgram])

  // Determine the next day in the active program
  const getNextDay = () => {
    if (!program?.days?.length) return null
    const recentTemplateIds = sessions
      .slice(0, program.days.length + 2)
      .map(s => s.templateId)
      .filter(Boolean)
    let nextIdx = 0
    for (let i = program.days.length - 1; i >= 0; i--) {
      if (recentTemplateIds.includes(program.days[i].templateId)) {
        nextIdx = (i + 1) % program.days.length
        break
      }
    }
    return program.days[nextIdx]
  }

  const nextDay = getNextDay()
  const nextTemplate = templates.find(t => t.id === nextDay?.templateId)
  const lastSession = sessions[0]

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 'calc(var(--nav-h) + 24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 className="stagger-item" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>
        Entrenar
      </h1>

      {/* Continue program — hero CTA */}
      {nextDay && nextTemplate ? (
        <button
          className="pressable stagger-item"
          onClick={() => startWorkout({ templateId: nextTemplate.id, programId: activeProgram, name: nextDay.name })}
          style={{
            width: '100%', height: 88, borderRadius: 'var(--r)',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
            boxShadow: '0 8px 32px rgba(232,146,74,0.28)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
            animationDelay: '45ms',
          }}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{nextDay.name}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              {program?.name} · {nextTemplate.exercises?.length || 0} ejercicios
            </p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronRight size={18} color="white" strokeWidth={2.5} />
          </div>
        </button>
      ) : (
        /* No active program — empty state hero */
        <div className="stagger-item hero-card" style={{
          padding: '24px 20px', animationDelay: '45ms',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 12, textAlign: 'center',
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
        </div>
      )}

      {/* Quick options grid */}
      <div className="stagger-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, animationDelay: '82ms' }}>
        <button
          className="pressable"
          onClick={() => setShowTemplates(!showTemplates)}
          style={{
            height: 80, borderRadius: 'var(--r-sm)',
            background: 'rgba(22,18,12,0.68)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: `1px solid ${showTemplates ? 'var(--accent-border)' : 'rgba(255,235,200,0.07)'}`,
            boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'flex-end', padding: 14,
          }}
        >
          <FileText size={18} color="var(--text2)" style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Desde template</p>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{templates.length} disponibles</p>
        </button>

        <button
          className="pressable"
          onClick={startEmptyWorkout}
          style={{
            height: 80, borderRadius: 'var(--r-sm)',
            background: 'rgba(22,18,12,0.68)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,235,200,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.07)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'flex-end', padding: 14,
          }}
        >
          <Zap size={18} color="var(--text2)" style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Vacío</p>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Desde cero</p>
        </button>
      </div>

      {/* Template list */}
      {showTemplates && templates.length > 0 && (
        <div className="stagger-item" style={{ display: 'flex', flexDirection: 'column', gap: 8, animationDelay: '112ms' }}>
          <p className="t-label" style={{ marginBottom: 4 }}>Templates</p>
          {templates.map(t => {
            const primary = t.muscles?.[0]
            const mv = getMuscleVars(primary)
            return (
              <button
                key={t.id}
                className="pressable"
                onClick={() => startWorkout({ templateId: t.id, programId: null, name: t.name })}
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: 'var(--r-sm)',
                  background: 'rgba(22,18,12,0.68)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: `0.5px solid rgba(255,235,200,0.07)`,
                  borderLeft: `3px solid ${mv.color}`,
                  boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    {(t.exercises || []).length} ejercicios
                    {primary ? ` · ${MUSCLE_NAMES[primary] || primary}` : ''}
                  </p>
                </div>
                <ChevronRight size={16} color="var(--text3)" />
              </button>
            )
          })}
        </div>
      )}

      {/* Last session recap */}
      {lastSession && (
        <div className="stagger-item" style={{ animationDelay: '136ms' }}>
          <p className="t-label" style={{ marginBottom: 10 }}>Última sesión</p>
          <div style={{
            background: 'rgba(22,18,12,0.68)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '0.5px solid rgba(255,235,200,0.07)',
            borderRadius: 'var(--r-sm)',
            padding: '14px 16px',
            boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {(() => {
              const mv = getMuscleVars(lastSession.muscles?.[0])
              return (
                <>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: mv.dim, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: mv.color }}>
                      {(MUSCLE_NAMES[lastSession.muscles?.[0]] || 'E')[0]}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lastSession.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                      {relativeDate(lastSession.date)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatKg(lastSession.totalVolume)}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text3)' }}>kg</p>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
