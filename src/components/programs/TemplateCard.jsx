import { formatDate } from '../../utils/dates.js'
import { MUSCLE_NAMES, MUSCLE_COLORS } from '../../data/exercises.js'
import useStore from '../../store/index.js'

function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg> }

export function TemplateCard({ template, onEdit, onStart }) {
  const sessions = useStore(s => s.sessions)
  const deleteTemplate = useStore(s => s.deleteTemplate)
  const timesUsed = sessions.filter(s => s.templateId === template.id).length
  const lastUsed = sessions.find(s => s.templateId === template.id)?.date

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{template.name}</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(template.muscles || []).map(m => {
              const c = MUSCLE_COLORS[m]
              return (
                <span key={m} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: c?.bg, color: c?.text, border: `1px solid ${c?.border}` }}>
                  {MUSCLE_NAMES[m]}
                </span>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {onEdit && (
            <button onClick={() => onEdit(template)} className="pressable" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <EditIcon />
            </button>
          )}
          <button onClick={() => deleteTemplate(template.id)} className="pressable" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(244,96,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <TrashIcon />
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>
          {template.exercises?.length || 0} ejercicios
          {timesUsed > 0 && ` · ${timesUsed} veces`}
          {lastUsed && ` · ${formatDate(lastUsed)}`}
        </p>
        {onStart && (
          <button onClick={() => onStart(template)} className="pressable" style={{
            padding: '6px 14px', borderRadius: 8,
            background: 'var(--accent-dim)', border: '1px solid rgba(124,111,247,0.3)',
            color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            Empezar
          </button>
        )}
      </div>
    </div>
  )
}
