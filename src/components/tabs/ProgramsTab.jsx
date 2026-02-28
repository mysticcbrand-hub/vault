import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Play, Compass, Sparkles, ChevronLeft } from 'lucide-react'
import { TemplateEditor } from '../programs/TemplateEditor.jsx'
import { ProgramEditor } from '../programs/ProgramEditor.jsx'
import { Sheet, ConfirmDialog } from '../ui/Sheet.jsx'
import { getMuscleVars } from '../../utils/format.js'
import { MUSCLE_NAMES, getExerciseById } from '../../data/exercises.js'
import { PRESET_PROGRAMS, getRecommendedPreset } from '../../data/presetPrograms.js'
import useStore from '../../store/index.js'

const GOAL_LABELS = { fuerza: 'Fuerza', volumen: 'Volumen', definicion: 'Definición' }
const LEVEL_LABELS = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }
const GOAL_COLORS = { fuerza: 'var(--red)', volumen: 'var(--accent)', definicion: 'var(--green)' }
const DAY_LETTERS = ['L','M','X','J','V','S','D']

const FILTER_GOAL = [null, 'fuerza', 'volumen', 'definicion']
const FILTER_LEVEL = [null, 'principiante', 'intermedio', 'avanzado']
const FILTER_DAYS = [null, 3, 4, 6]

function ScheduleDots({ schedule }) {
  if (!schedule?.length) return null
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {schedule.map((s, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600 }}>{DAY_LETTERS[i] || ''}</span>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s === 'rest' ? 'var(--border2)' : 'var(--accent)', opacity: s === 'rest' ? 0.4 : 1 }} />
        </div>
      ))}
    </div>
  )
}

function ProgramDetail({ program, recommended, onBack, onActivate }) {
  const goalColor = GOAL_COLORS[program.goal] || 'var(--accent)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} className="pressable" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color="var(--text2)" />
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Detalle del programa</p>
      </div>

      <div style={{
        background: 'linear-gradient(155deg, rgba(36,27,16,0.88) 0%, rgba(16,13,9,0.94) 100%)',
        borderRadius: 'var(--r-lg)', padding: '20px', position: 'relative', overflow: 'hidden',
        boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,235,200,0.08)',
      }}>
        <div style={{ position: 'absolute', top: -40, left: -30, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(ellipse, ${goalColor}26 0%, transparent 70%)`, filter: 'blur(30px)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{LEVEL_LABELS[program.level]}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{GOAL_LABELS[program.goal]}</span>
            {recommended && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                <Sparkles size={8} /> Para ti
              </span>
            )}
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>{program.name}</p>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{program.description}</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(program.tags || []).map(tag => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text2)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="t-label" style={{ marginBottom: 8 }}>Calendario semanal</p>
        <ScheduleDots schedule={program.schedule} />
      </div>

      <div>
        <p className="t-label" style={{ marginBottom: 8 }}>Entrenamientos</p>
        {(program.days || []).map((day, i) => (
          <div key={day.id || i} style={{ marginBottom: 12, padding: '14px 14px', background: 'rgba(22,18,12,0.65)', borderRadius: 'var(--r)', border: '1px solid rgba(255,235,200,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{day.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(day.exercises || []).map((ex, j) => {
                const exData = getExerciseById(ex.exerciseId)
                return (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{exData?.name || ex.exerciseId}</span>
                    <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{ex.sets}×{ex.reps}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => onActivate(program)} className="pressable" style={{ width: '100%', height: 52, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.2), 0 4px 20px var(--accent-glow)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        Usar este programa
      </button>
    </div>
  )
}

export function ProgramsTab({ onSwitchTab }) {
  const programs = useStore(s => s.programs)
  const templates = useStore(s => s.templates)
  const activeProgram = useStore(s => s.activeProgram)
  const user = useStore(s => s.user)
  const addProgram = useStore(s => s.addProgram)
  const setActiveProgram = useStore(s => s.setActiveProgram)
  const deleteProgram = useStore(s => s.deleteProgram)
  const deleteTemplate = useStore(s => s.deleteTemplate)
  const addToast = useStore(s => s.addToast)

  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [programEditorOpen, setProgramEditorOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [exploreView, setExploreView] = useState('list')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [filterGoal, setFilterGoal] = useState(null)
  const [filterLevel, setFilterLevel] = useState(null)
  const [filterDays, setFilterDays] = useState(null)

  const recommended = getRecommendedPreset(user?.level, user?.goal)

  const filteredPresets = useMemo(() => {
    return PRESET_PROGRAMS.filter(p => {
      if (filterGoal && p.goal !== filterGoal) return false
      if (filterLevel && p.level !== filterLevel) return false
      if (filterDays && p.daysPerWeek !== filterDays) return false
      return true
    })
  }, [filterGoal, filterLevel, filterDays])

  const openTemplateEditor = (template = null) => { setEditingTemplate(template); setTemplateEditorOpen(true) }
  const openProgramEditor = (program = null) => { setEditingProgram(program); setProgramEditorOpen(true) }

  const activatePreset = (preset) => {
    const userCopy = { ...preset, id: `user-${Date.now()}`, isPreset: false, presetId: preset.id, createdAt: new Date().toISOString() }
    addProgram(userCopy)
    setActiveProgram(userCopy.id)
    addToast(`¡${preset.name} activado!`, 'success')
    setExploreOpen(false)
    onSwitchTab?.('today')
  }

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 'calc(var(--nav-h) + 24px)', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div className="stagger-item">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>Programas</h1>
          <button onClick={() => { setExploreOpen(true); setExploreView('list') }} className="pressable" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Compass size={13} /> Explorar
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Gestiona tus planes y plantillas</p>
      </div>

      <div className="stagger-item" style={{ animationDelay: '45ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="t-label">Mis programas</span>
          <button onClick={() => openProgramEditor(null)} className="pressable" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={12} /> Nuevo
          </button>
        </div>

        {programs.length === 0 ? (
          <div style={{ padding: '28px 20px', textAlign: 'center', background: 'rgba(22,18,12,0.5)', borderRadius: 'var(--r)', border: '1px dashed var(--border2)' }}>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>Aún sin programas</p>
            <button onClick={() => { setExploreOpen(true); setExploreView('list') }} className="pressable" style={{ padding: '10px 20px', borderRadius: 12, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Explorar programas
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {programs.map((program) => {
              const isActive = program.id === activeProgram
              const isRecommendedPreset = recommended && program.presetId === recommended.id
              return (
                <div key={program.id} style={{ background: 'rgba(22,18,12,0.68)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderRadius: 'var(--r)', border: `0.5px solid ${isActive ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.07)'}`, padding: '16px', boxShadow: `inset 0 1px 0 rgba(255,235,200,0.08)${isActive ? ', 0 0 20px rgba(232,146,74,0.08)' : ''}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{program.name}</p>
                        {isActive && (<span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>ACTIVO</span>)}
                        {isRecommendedPreset && (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'rgba(212,168,67,0.12)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)' }}><Sparkles size={8} /> Para ti</span>)}
                        {!program.presetId && (<span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>Personalizado</span>)}
                      </div>
                      {program.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4, marginBottom: 4 }}>{program.description}</p>}
                      <p style={{ fontSize: 12, color: 'var(--text3)' }}>{(program.days || []).length} días{program.weeks ? ` · ${program.weeks} semanas` : ''}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <button onClick={() => openProgramEditor(program)} className="pressable" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} color="var(--text2)" /></button>
                      <button onClick={() => deleteProgram(program.id)} className="pressable" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} color="var(--red)" /></button>
                    </div>
                  </div>

                  {!isActive && (
                    <button onClick={() => { setActiveProgram(program.id); onSwitchTab?.('today') }} className="pressable" style={{ marginTop: 8, width: '100%', padding: '10px', borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Play size={13} /> Usar este programa
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="stagger-item" style={{ animationDelay: '82ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="t-label">Templates</span>
          <button onClick={() => openTemplateEditor(null)} className="pressable" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={12} /> Nuevo
          </button>
        </div>

        {templates.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>Crea tu primer template</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {templates.map((template) => {
              const primaryMuscle = template.muscles?.[0]
              const mv = getMuscleVars(primaryMuscle)
              return (
                <div key={template.id} style={{ background: 'rgba(22,18,12,0.68)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderRadius: 'var(--r)', border: '0.5px solid rgba(255,235,200,0.07)', borderLeft: `3px solid ${mv.color}`, padding: '14px 16px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{template.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{(template.exercises || []).length} ejercicios</span>
                      {(template.muscles || []).slice(0, 2).map(m => {
                        const tmv = getMuscleVars(m)
                        return (
                          <span key={m} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 'var(--r-pill)', background: tmv.dim, color: tmv.color }}>
                            {MUSCLE_NAMES[m] || m}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <button onClick={() => openTemplateEditor(template)} className="pressable" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Edit2 size={14} color="var(--text2)" /></button>
                  <button onClick={() => deleteTemplate(template.id)} className="pressable" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={14} color="var(--red)" /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TemplateEditor open={templateEditorOpen} onClose={() => { setTemplateEditorOpen(false); setEditingTemplate(null) }} template={editingTemplate} />
      <ProgramEditor open={programEditorOpen} onClose={() => { setProgramEditorOpen(false); setEditingProgram(null) }} program={editingProgram} />

      <Sheet isOpen={exploreOpen} onClose={() => setExploreOpen(false)} title="Explorar programas" size="full">
        <div style={{ padding: '12px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          {exploreView === 'detail' && selectedPreset ? (
            <ProgramDetail program={selectedPreset} recommended={recommended?.id === selectedPreset.id} onBack={() => setExploreView('list')} onActivate={activatePreset} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                  {FILTER_GOAL.map(g => (
                    <button key={String(g)} onClick={() => setFilterGoal(g)} className="pressable" style={{ padding: '7px 14px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap', flexShrink: 0, background: filterGoal === g ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${filterGoal === g ? 'var(--accent-border)' : 'var(--border)'}`, color: filterGoal === g ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {g ? GOAL_LABELS[g] : 'Todos'}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                  {FILTER_LEVEL.map(l => (
                    <button key={String(l)} onClick={() => setFilterLevel(l)} className="pressable" style={{ padding: '6px 11px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap', flexShrink: 0, background: filterLevel === l ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${filterLevel === l ? 'var(--accent-border)' : 'var(--border)'}`, color: filterLevel === l ? 'var(--accent)' : 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {l ? LEVEL_LABELS[l] : 'Todos los niveles'}
                    </button>
                  ))}
                  {FILTER_DAYS.map(d => (
                    <button key={String(d)} onClick={() => setFilterDays(d)} className="pressable" style={{ padding: '6px 11px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap', flexShrink: 0, background: filterDays === d ? 'var(--surface3)' : 'var(--surface2)', border: `1px solid ${filterDays === d ? 'var(--border2)' : 'var(--border)'}`, color: filterDays === d ? 'var(--text)' : 'var(--text3)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {d ? `${d} días` : 'Todos'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredPresets.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: 'var(--text3)' }}>Sin programas para estos filtros.</p>
                  </div>
                ) : (
                  filteredPresets.map(p => {
                    const goalColor = GOAL_COLORS[p.goal] || 'var(--accent)'
                    const isRec = recommended?.id === p.id
                    return (
                      <div key={p.id} style={{ background: 'rgba(22,18,12,0.70)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderRadius: 'var(--r)', border: `0.5px solid ${isRec ? 'rgba(232,146,74,0.32)' : 'rgba(255,235,200,0.07)'}`, borderLeft: `4px solid ${goalColor}`, boxShadow: `inset 0 1px 0 rgba(255,235,200,0.08)${isRec ? ', 0 0 24px rgba(232,146,74,0.08)' : ''}`, overflow: 'hidden', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{p.name}</p>
                          {isRec && (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}><Sparkles size={8} /> Para ti</span>)}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{LEVEL_LABELS[p.level]}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{p.daysPerWeek} días/sem</span>
                        </div>
                        <ScheduleDots schedule={p.schedule} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button onClick={() => { setSelectedPreset(p); setExploreView('detail') }} className="pressable" style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Ver programa</button>
                          <button onClick={() => activatePreset(p)} className="pressable" style={{ flex: 1.2, height: 40, borderRadius: 10, background: 'var(--accent)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Usar</button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </Sheet>
    </div>
  )
}
