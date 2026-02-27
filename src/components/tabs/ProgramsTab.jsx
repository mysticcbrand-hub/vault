import { useState } from 'react'
import { ProgramCard } from '../programs/ProgramCard.jsx'
import { TemplateCard } from '../programs/TemplateCard.jsx'
import { TemplateEditor } from '../programs/TemplateEditor.jsx'
import useStore from '../../store/index.js'

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

export function ProgramsTab() {
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const startWorkout = useStore(s => s.startWorkout)
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom,0px) + 20px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="anim-fade-up">
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>Programas</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Tus planes y plantillas de entrenamiento</p>
      </div>

      {/* Programs */}
      <div className="anim-fade-up stagger-1">
        <div className="section-header">
          <span className="section-label">Programas activos</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{programs.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {programs.map((p, i) => (
            <div key={p.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <ProgramCard program={p} />
            </div>
          ))}
          {programs.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>Sin programas. Crea uno para estructurar tu entrenamiento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Templates */}
      <div className="anim-fade-up stagger-2">
        <div className="section-header">
          <span className="section-label">Templates</span>
          <button
            onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true) }}
            className="pressable"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--accent)', border: 'none',
              color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <PlusIcon />Nuevo
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.map((t, i) => (
            <div key={t.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <TemplateCard
                template={t}
                onEdit={(tmpl) => { setEditingTemplate(tmpl); setTemplateEditorOpen(true) }}
                onStart={() => startWorkout({ templateId: t.id, programId: null, name: t.name })}
              />
            </div>
          ))}
        </div>
      </div>

      <TemplateEditor open={templateEditorOpen} onClose={() => setTemplateEditorOpen(false)} template={editingTemplate} />
    </div>
  )
}
