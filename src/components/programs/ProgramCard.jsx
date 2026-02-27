import { useState } from 'react'
import { MUSCLE_NAMES, MUSCLE_COLORS } from '../../data/exercises.js'
import useStore from '../../store/index.js'

function ChevronDown() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function ChevronUp() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg> }
function PlayIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg> }

export function ProgramCard({ program }) {
  const [expanded, setExpanded] = useState(false)
  const activeProgram = useStore(s => s.activeProgram)
  const setActiveProgram = useStore(s => s.setActiveProgram)
  const deleteProgram = useStore(s => s.deleteProgram)
  const templates = useStore(s => s.templates)
  const isActive = activeProgram === program.id

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 16, overflow: 'hidden',
      border: `1px solid ${isActive ? 'rgba(124,111,247,0.35)' : 'var(--border)'}`,
      boxShadow: isActive ? '0 0 0 1px rgba(124,111,247,0.1)' : 'none',
    }}>
      <div style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {isActive && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(124,111,247,0.3)' }}>ACTIVO</span>}
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{program.name}</p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>{program.days?.length || 0} días{program.totalWeeks ? ` · ${program.totalWeeks} semanas` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {!isActive && (
            <button onClick={() => setActiveProgram(program.id)} className="pressable" style={{
              padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)',
              color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <PlayIcon />Activar
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
          {program.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.5 }}>{program.description}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {(program.days || []).map((day, i) => {
              const template = templates.find(t => t.id === day.templateId)
              return (
                <div key={day.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface2)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', width: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{day.name}</p>
                    {template && <p style={{ fontSize: 11, color: 'var(--text3)' }}>{template.exercises?.length || 0} ejercicios</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(day.muscles || []).slice(0, 2).map(m => {
                      const c = MUSCLE_COLORS[m]
                      return <span key={m} style={{ fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4, background: c?.bg, color: c?.text }}>{MUSCLE_NAMES[m]}</span>
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={() => deleteProgram(program.id)} className="pressable" style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: 'var(--red-dim)', border: '1px solid rgba(244,96,96,0.2)',
            color: 'var(--red)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <TrashIcon />Eliminar programa
          </button>
        </div>
      )}
    </div>
  )
}
