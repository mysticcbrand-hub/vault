import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { ActiveWorkout } from '../workout/ActiveWorkout.jsx'
import { getMuscleVars } from '../../utils/format.js'
import { formatKg, relativeDate } from '../../utils/format.js'
import { MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

export function WorkoutTab() {
  const activeWorkout = useStore(s => s.activeWorkout)
  const sessions = useStore(s => s.sessions)
  const templates = useStore(s => s.templates)
  const programs = useStore(s => s.programs)
  const activeProgram = useStore(s => s.activeProgram)
  const startWorkout = useStore(s => s.startWorkout)
  const startEmptyWorkout = useStore(s => s.startEmptyWorkout)
  const [showTemplates, setShowTemplates] = useState(false)

  if (activeWorkout) return <ActiveWorkout />

  const program = programs.find(p => p.id === activeProgram)
  const getNextDay = () => {
    if (!program?.days?.length) return null
    const recentIds = sessions.slice(0, program.days.length + 2).map(s => s.templateId)
    let idx = 0
    for (let i = program.days.length - 1; i >= 0; i--) {
      if (recentIds.includes(program.days[i].templateId)) { idx = (i + 1) % program.days.length; break }
    }
    return program.days[idx]
  }
  const nextDay = getNextDay()
  const nextTemplate = templates.find(t => t.id === nextDay?.templateId)
  const lastSession = sessions[0]

  return (
    <div className="pb-nav" style={{ padding: '24px 20px' }}>
      <h1 className="si" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 24 }}>Entrenar</h1>

      {/* Primary — continue program */}
      {nextDay && nextTemplate && (
        <button className="pressable shimmer si" onClick={() => startWorkout({ templateId: nextTemplate.id, programId: activeProgram, name: nextDay.name })}
          style={{
            width: '100%', marginBottom: 12, height: 88, borderRadius: 'var(--r)',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
            boxShadow: '0 8px 32px var(--accent-glow)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
            animationDelay: '0.04s',
          }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{nextDay.name}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              {program?.name} · {nextTemplate.exercises?.length || 0} ejercicios
            </p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ChevronRight size={18} color="white" strokeWidth={2.5} />
          </div>
        </button>
      )}

      {/* 2-col grid */}
      <div className="si" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, animationDelay: '0.08s' }}>
        <button className="pressable" onClick={() => setShowTemplates(!showTemplates)} style={{
          height: 80, borderRadius: 'var(--r-sm)', background: 'var(--surface2)',
          border: `1px solid ${showTemplates ? 'var(--accent-border)' : 'var(--border)'}`,
          cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'flex-end', padding: '14px',
          transition: 'border-color 0.15s',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
            <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Desde template</span>
        </button>
        <button className="pressable" onClick={startEmptyWorkout} style={{
          height: 80, borderRadius: 'var(--r-sm)', background: 'var(--surface2)',
          border: '1px solid var(--border)', cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'flex-end', padding: '14px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.75" strokeLinecap="round" style={{ marginBottom: 8 }}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Vacío</span>
        </button>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div className="si" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {templates.map(t => (
            <button key={t.id} className="pressable" onClick={() => startWorkout({ templateId: t.id, programId: null, name: t.name })}
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{t.exercises?.length || 0} ejercicios</p>
              </div>
              <ChevronRight size={16} color="var(--text3)" />
            </button>
          ))}
        </div>
      )}

      {/* Recent */}
      {lastSession && (
        <div className="si" style={{ animationDelay: '0.12s' }}>
          <div className="section-hd"><span className="t-label">Reciente</span></div>
          <button className="pressable" onClick={() => startWorkout({ templateId: lastSession.templateId, programId: lastSession.programId, name: lastSession.name })}
            style={{
              width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '14px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{lastSession.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{relativeDate(lastSession.date)} · {formatKg(lastSession.totalVolume)} kg</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Repetir</span>
          </button>
        </div>
      )}
    </div>
  )
}
