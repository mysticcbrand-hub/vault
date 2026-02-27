import { useState } from 'react'
import { ActiveWorkout } from '../workout/ActiveWorkout.jsx'
import { MUSCLE_NAMES, MUSCLE_COLORS, getExerciseById } from '../../data/exercises.js'
import { formatDate, formatDuration } from '../../utils/dates.js'
import { formatVolumeExact } from '../../utils/volume.js'
import useStore from '../../store/index.js'

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

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
    let nextIdx = 0
    for (let i = program.days.length - 1; i >= 0; i--) {
      if (recentIds.includes(program.days[i].templateId)) { nextIdx = (i + 1) % program.days.length; break }
    }
    return program.days[nextIdx]
  }
  const nextDay = getNextDay()
  const nextTemplate = templates.find(t => t.id === nextDay?.templateId)
  const lastSession = sessions[0]
  const lastTemplate = lastSession ? templates.find(t => t.id === lastSession.templateId) : null

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 20px)' }}>
      {/* Title */}
      <div className="anim-fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>Entrenar</h1>
      </div>

      {/* Primary card — continue program */}
      {nextDay && nextTemplate && (
        <button
          className="pressable btn-shimmer anim-fade-up stagger-1"
          onClick={() => startWorkout({ templateId: nextTemplate.id, programId: activeProgram, name: nextDay.name })}
          style={{
            width: '100%', marginBottom: 12,
            height: 88, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            boxShadow: '0 8px 32px var(--accent-glow)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            padding: '0 20px', gap: 16,
            position: 'relative',
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
            flexShrink: 0, color: 'white',
          }}>
            <ArrowIcon />
          </div>
        </button>
      )}

      {/* 2-col grid */}
      <div className="anim-fade-up stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {/* From template */}
        <button
          className="pressable"
          onClick={() => setShowTemplates(!showTemplates)}
          style={{
            height: 80, borderRadius: 16,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'flex-end',
            padding: '14px 14px',
            gap: 6,
          }}
        >
          <TemplateIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'left', lineHeight: 1.2 }}>Desde template</span>
        </button>

        {/* Empty */}
        <button
          className="pressable"
          onClick={startEmptyWorkout}
          style={{
            height: 80, borderRadius: 16,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'flex-end',
            padding: '14px 14px', gap: 6,
          }}
        >
          <EmptyIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'left', lineHeight: 1.2 }}>Vacío</span>
        </button>
      </div>

      {/* Template list */}
      {showTemplates && (
        <div className="anim-fade-up" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {templates.map(t => (
            <button
              key={t.id}
              className="pressable"
              onClick={() => startWorkout({ templateId: t.id, programId: null, name: t.name })}
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: 16,
                padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)' }}>{t.exercises?.length || 0} ejercicios</p>
              </div>
              <span style={{ color: 'var(--text3)' }}><ArrowIcon /></span>
            </button>
          ))}
        </div>
      )}

      {/* Recent */}
      {lastSession && (
        <div className="anim-fade-up stagger-3">
          <div className="section-header"><span className="section-label">Reciente</span></div>
          <button
            className="pressable card"
            onClick={() => startWorkout({ templateId: lastSession.templateId, programId: lastSession.programId, name: lastSession.name })}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', border: '1px solid var(--border)',
              background: 'var(--surface)', borderRadius: 16,
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{lastSession.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(lastSession.date)} · {formatVolumeExact(lastSession.totalVolume)} kg</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Repetir</span>
          </button>
        </div>
      )}
    </div>
  )
}

function TemplateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
