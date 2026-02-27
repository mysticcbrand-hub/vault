import { useState } from 'react'
import { Plus, Edit2, Trash2, Play } from 'lucide-react'
import { TemplateEditor } from '../programs/TemplateEditor.jsx'
import { ProgramEditor } from '../programs/ProgramEditor.jsx'
import { getMuscleVars } from '../../utils/format.js'
import { MUSCLE_NAMES, getExerciseById } from '../../data/exercises.js'
import useStore from '../../store/index.js'

export function ProgramsTab({ onSwitchTab }) {
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const activeProgram = useStore(s => s.activeProgram)
  const setActiveProgram = useStore(s => s.setActiveProgram)
  const deleteProgram = useStore(s => s.deleteProgram)
  const deleteTemplate = useStore(s => s.deleteTemplate)

  // Editor state — completely separate from workout system
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [programEditorOpen, setProgramEditorOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)

  const openTemplateEditor = (template = null) => {
    setEditingTemplate(template)
    setTemplateEditorOpen(true)
  }

  const openProgramEditor = (program = null) => {
    setEditingProgram(program)
    setProgramEditorOpen(true)
  }

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 'calc(var(--nav-h) + 24px)', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="stagger-item">
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>Programas</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Gestiona tus planes y plantillas</p>
      </div>

      {/* Programs section */}
      <div className="stagger-item" style={{ animationDelay: '45ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="t-label">Programas</span>
          <button onClick={() => openProgramEditor(null)} className="pressable" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8,
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={12} /> Nuevo
          </button>
        </div>

        {programs.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>Crea tu primer programa de entrenamiento</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {programs.map((program, i) => {
              const isActive = program.id === activeProgram
              return (
                <div key={program.id} className="stagger-item" style={{
                  animationDelay: `${82 + i * 30}ms`,
                  background: 'rgba(22,18,12,0.68)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  borderRadius: 'var(--r)',
                  border: `0.5px solid ${isActive ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.07)'}`,
                  padding: '16px',
                  boxShadow: `inset 0 1px 0 rgba(255,235,200,0.08), ${isActive ? '0 0 20px rgba(232,146,74,0.08)' : ''}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{program.name}</p>
                        {isActive && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                            ACTIVO
                          </span>
                        )}
                      </div>
                      {program.description && (
                        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>{program.description}</p>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                        {(program.days || []).length} días
                        {program.totalWeeks ? ` · ${program.totalWeeks} semanas` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <button onClick={() => openProgramEditor(program)} className="pressable" style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'var(--surface3)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}>
                        <Edit2 size={14} color="var(--text2)" />
                      </button>
                      <button onClick={() => deleteProgram(program.id)} className="pressable" style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}>
                        <Trash2 size={14} color="var(--red)" />
                      </button>
                    </div>
                  </div>

                  {/* "Usar este programa" — sets active, switches to Hoy tab */}
                  {!isActive && (
                    <button onClick={() => { setActiveProgram(program.id); onSwitchTab?.('today') }} className="pressable" style={{
                      marginTop: 8, width: '100%', padding: '10px',
                      borderRadius: 10, background: 'var(--accent-dim)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Play size={13} /> Usar este programa
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Templates section */}
      <div className="stagger-item" style={{ animationDelay: '112ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="t-label">Templates</span>
          <button onClick={() => openTemplateEditor(null)} className="pressable" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8,
            background: 'var(--accent)', border: 'none',
            color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={12} /> Nuevo
          </button>
        </div>

        {templates.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>Crea tu primer template</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {templates.map((template, i) => {
              const primaryMuscle = template.muscles?.[0]
              const mv = getMuscleVars(primaryMuscle)
              return (
                <div key={template.id} className="stagger-item" style={{
                  animationDelay: `${112 + i * 30}ms`,
                  background: 'rgba(22,18,12,0.68)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  borderRadius: 'var(--r)',
                  border: '0.5px solid rgba(255,235,200,0.07)',
                  borderLeft: `3px solid ${mv.color}`,
                  padding: '14px 16px',
                  boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{template.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {(template.exercises || []).length} ejercicios
                      </span>
                      {(template.muscles || []).slice(0, 2).map(m => (
                        <span key={m} style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 6px',
                          borderRadius: 'var(--r-pill)',
                          background: getMuscleVars(m).dim,
                          color: getMuscleVars(m).color,
                        }}>
                          {MUSCLE_NAMES[m] || m}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Edit — opens TemplateEditor, NEVER starts a workout */}
                  <button onClick={() => openTemplateEditor(template)} className="pressable" style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'var(--surface3)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  }}>
                    <Edit2 size={14} color="var(--text2)" />
                  </button>
                  <button onClick={() => deleteTemplate(template.id)} className="pressable" style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  }}>
                    <Trash2 size={14} color="var(--red)" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Editors — full-screen, zero workout store connection */}
      <TemplateEditor
        open={templateEditorOpen}
        onClose={() => { setTemplateEditorOpen(false); setEditingTemplate(null) }}
        template={editingTemplate}
      />
      <ProgramEditor
        open={programEditorOpen}
        onClose={() => { setProgramEditorOpen(false); setEditingProgram(null) }}
        program={editingProgram}
      />
    </div>
  )
}
