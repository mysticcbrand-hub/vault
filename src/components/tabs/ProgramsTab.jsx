import { useState, useMemo, useEffect } from 'react'
import { Plus, Edit2, Trash2, Play, Compass, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TemplateEditor } from '../programs/TemplateEditor.jsx'
import { ProgramEditor } from '../programs/ProgramEditor.jsx'
import { Sheet, ConfirmDialog } from '../ui/Sheet.jsx'
import { getMuscleVars } from '../../utils/format.js'
import { MUSCLE_NAMES, getExerciseById, EXERCISES } from '../../data/exercises.js'
import { PRESET_PROGRAMS, getRecommendedPreset } from '../../data/presetPrograms.js'
import { ensureProgramTemplates } from '../../utils/programs.js'
import useStore from '../../store/index.js'

const GOAL_LABELS = { fuerza: 'Fuerza', volumen: 'Volumen', definicion: 'Definición' }
const LEVEL_LABELS = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }
const GOAL_COLORS = { fuerza: 'var(--red)', volumen: 'var(--accent)', definicion: 'var(--green)' }
const GOAL_HEX = { fuerza: '#E5534B', volumen: '#E8924A', definicion: '#34C77B' }
const DAY_LETTERS = ['L','M','X','J','V','S','D']

const FILTER_GOAL = [null, 'fuerza', 'volumen', 'definicion']
const FILTER_LEVEL = [null, 'principiante', 'intermedio', 'avanzado']
const FILTER_DAYS = [null, 3, 4, 6]

// ─── FilterPill ───────────────────────────────────────────────────────────────
function FilterPill({ label, active, onTap, small }) {
  return (
    <button
      onClick={onTap}
      style={{
        padding: small ? '5px 11px' : '7px 14px',
        borderRadius: 100,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        background: active ? 'var(--accent-dim)' : 'var(--surface2)',
        border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
        color: active ? 'var(--accent)' : 'var(--text2)',
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.96)'; e.currentTarget.style.opacity = '0.8' }}
      onTouchEnd={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
    >
      {label}
    </button>
  )
}

// ─── PresetProgramCard ────────────────────────────────────────────────────────
function PresetProgramCard({ program, isActive, isRecommended, onActivate }) {
  const [expanded, setExpanded] = useState(false)
  const accentHex = GOAL_HEX[program.goal] ?? '#E8924A'
  const accentColor = GOAL_COLORS[program.goal] ?? 'var(--accent)'

  return (
    <div style={{
      borderRadius: 18,
      background: 'rgba(22,18,12,0.72)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: `0.5px solid ${isActive ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.08)'}`,
      boxShadow: `inset 0 1px 0 rgba(255,235,200,0.06)${isActive ? ', 0 0 20px rgba(232,146,74,0.06)' : ''}`,
      borderLeft: `3px solid ${accentHex}`,
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {program.name}
              </span>
              {isActive && (
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: accentHex,
                  background: `${accentHex}20`, border: `0.5px solid ${accentHex}40`,
                  borderRadius: 6, padding: '2px 6px',
                }}>Activo</span>
              )}
              {isRecommended && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: '#E8924A',
                  background: 'rgba(232,146,74,0.12)', border: '0.5px solid rgba(232,146,74,0.3)',
                  borderRadius: 6, padding: '2px 6px',
                }}><Sparkles size={7} /> Para ti</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.45, margin: 0 }}>
              {program.description}
            </p>
          </div>
        </div>

        {/* Meta pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {LEVEL_LABELS[program.level] && (
            <span style={{
              height: 22, padding: '0 8px', borderRadius: 6,
              background: 'rgba(255,235,200,0.06)', border: '0.5px solid rgba(255,235,200,0.1)',
              fontSize: 11, fontWeight: 600, color: 'var(--text3)',
              display: 'inline-flex', alignItems: 'center',
            }}>{LEVEL_LABELS[program.level]}</span>
          )}
          {program.daysPerWeek && (
            <span style={{
              height: 22, padding: '0 8px', borderRadius: 6,
              background: 'rgba(255,235,200,0.06)', border: '0.5px solid rgba(255,235,200,0.1)',
              fontSize: 11, fontWeight: 600, color: 'var(--text3)',
              display: 'inline-flex', alignItems: 'center',
            }}>{program.daysPerWeek} días/semana</span>
          )}
          {(program.tags || []).filter(t => !LEVEL_LABELS[program.level]?.includes(t)).map(tag => (
            <span key={tag} style={{
              height: 22, padding: '0 8px', borderRadius: 6,
              background: 'rgba(255,235,200,0.06)', border: '0.5px solid rgba(255,235,200,0.1)',
              fontSize: 11, fontWeight: 600, color: 'var(--text3)',
              display: 'inline-flex', alignItems: 'center',
            }}>{tag}</span>
          ))}
        </div>

        {/* Week schedule strip */}
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {DAY_LETTERS.map((day, i) => {
            const isTraining = program.schedule?.[i] && program.schedule[i] !== 'rest'
            return (
              <div key={day} style={{
                flex: 1, height: 26, borderRadius: 7,
                background: isTraining ? `${accentHex}20` : 'rgba(255,235,200,0.04)',
                border: `0.5px solid ${isTraining ? `${accentHex}40` : 'rgba(255,235,200,0.07)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700,
                color: isTraining ? accentHex : 'rgba(245,239,230,0.2)',
                transition: 'all 0.15s ease',
              }}>{day}</div>
            )
          })}
        </div>
      </div>

      {/* Expandable exercises list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '0.5px solid rgba(255,235,200,0.07)', padding: '12px 16px' }}>
              {(program.days || []).map((day, i) => (
                <div key={i} style={{ marginBottom: i < program.days.length - 1 ? 12 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {day.name}
                  </div>
                  {(day.exercises || []).map((ex, j) => {
                    const exercise = EXERCISES.find(e => e.id === ex.exerciseId) || getExerciseById(ex.exerciseId)
                    return (
                      <div key={j} style={{ fontSize: 12, color: 'var(--text2)', paddingLeft: 10, lineHeight: 1.9, display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {exercise?.name ?? ex.exerciseId}</span>
                        <span style={{ color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{ex.sets}×{ex.reps}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action row */}
      <div style={{ display: 'flex', borderTop: '0.5px solid rgba(255,235,200,0.07)' }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            flex: 1, height: 44, background: 'none', border: 'none',
            borderRight: '0.5px solid rgba(255,235,200,0.07)',
            color: 'var(--text3)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'color 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={e => { e.currentTarget.style.color = 'var(--text2)' }}
          onTouchEnd={e => { e.currentTarget.style.color = 'var(--text3)' }}
        >
          {expanded ? 'Ver menos ↑' : 'Ver detalles ↓'}
        </button>
        <button
          onClick={isActive ? undefined : onActivate}
          style={{
            flex: 1, height: 44, background: 'none', border: 'none',
            color: isActive ? 'rgba(245,239,230,0.25)' : accentHex,
            fontSize: 13, fontWeight: 700,
            cursor: isActive ? 'default' : 'pointer',
            fontFamily: 'inherit',
            transition: 'opacity 0.15s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onTouchStart={e => { if (!isActive) { e.currentTarget.style.opacity = '0.7' } }}
          onTouchEnd={e => { e.currentTarget.style.opacity = '' }}
        >
          {isActive ? 'Activo ✓' : 'Usar programa →'}
        </button>
      </div>
    </div>
  )
}

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
  const updateProgram = useStore(s => s.updateProgram)
  const createTemplate = useStore(s => s.createTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)
  const addToast = useStore(s => s.addToast)

  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [programEditorOpen, setProgramEditorOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [exploreOpen, setExploreOpen] = useState(false)
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

  useEffect(() => {
    try {
      const editId = sessionStorage.getItem('graw_edit_program_id')
      if (!editId) return
      const target = programs.find(p => p.id === editId)
      if (target) {
        openProgramEditor(target)
      }
      sessionStorage.removeItem('graw_edit_program_id')
    } catch {}
  }, [programs])

  const activatePreset = (preset) => {
    const userCopy = {
      ...preset,
      id: `user-${Date.now()}`,
      source: 'preset',
      presetId: preset.id,
      createdAt: new Date().toISOString(),
    }
    const normalized = ensureProgramTemplates(userCopy, { createTemplate, updateTemplate })
    addProgram(normalized)
    setActiveProgram(normalized.id)
    addToast({ message: `¡${preset.name} activado! ✓`, type: 'success' })
    setExploreOpen(false)
    onSwitchTab?.('today')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom), 16px) + 20px)' }}>
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="stagger-item">
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>Programas</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Gestiona tus planes de entrenamiento</p>

        {/* Primary CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => setExploreOpen(true)}
            className="pressable"
            style={{
              height: 52, borderRadius: 14, border: '1px solid var(--accent-border)',
              background: 'var(--accent-dim)', color: 'var(--accent)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease', WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.opacity = '0.8' }}
            onTouchEnd={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
          >
            <Compass size={16} /> Explorar
          </button>
          <button
            onClick={() => openProgramEditor(null)}
            className="pressable"
            style={{
              height: 52, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
              boxShadow: '0 4px 16px rgba(232,146,74,0.25)',
              color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease', WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.opacity = '0.85' }}
            onTouchEnd={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '' }}
          >
            <Plus size={16} /> Crear programa
          </button>
        </div>
      </div>

      <div className="stagger-item" style={{ animationDelay: '45ms' }}>
        <span className="t-label" style={{ display: 'block', marginBottom: 12 }}>Mis programas</span>

        {programs.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', background: 'rgba(22,18,12,0.5)', borderRadius: 'var(--r)', border: '1px dashed var(--border2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, opacity: 0.4 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)' }}>Sin programas aún</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5, maxWidth: 240 }}>Explora programas prediseñados o crea el tuyo propio</p>
            <button
              onClick={() => setExploreOpen(true)}
              className="pressable"
              style={{ marginTop: 4, height: 40, padding: '0 20px', borderRadius: 11, background: 'rgba(232,146,74,0.15)', border: '0.5px solid rgba(232,146,74,0.3)', color: 'var(--accent)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent' }}
              onTouchStart={e => { e.currentTarget.style.opacity = '0.7' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '' }}
            >
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

      {/* ── PROGRAM BROWSER SHEET ─────────────────────────────────────────── */}
      <Sheet isOpen={exploreOpen} onClose={() => setExploreOpen(false)} title="Explorar programas" size="full">
        <div style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Goal filter pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 8, WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: null, label: 'Todos' },
              { id: 'fuerza', label: 'Fuerza' },
              { id: 'volumen', label: 'Volumen' },
              { id: 'definicion', label: 'Definición' },
            ].map(f => (
              <FilterPill key={String(f.id)} label={f.label} active={filterGoal === f.id} onTap={() => setFilterGoal(f.id)} />
            ))}
          </div>

          {/* Level + Days filter pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: null, label: 'Todos los niveles' },
              { id: 'principiante', label: 'Principiante' },
              { id: 'intermedio', label: 'Intermedio' },
              { id: 'avanzado', label: 'Avanzado' },
            ].map(f => (
              <FilterPill key={String(f.id)} label={f.label} active={filterLevel === f.id} onTap={() => setFilterLevel(f.id)} small />
            ))}
            {[null, 3, 4, 6].map(d => (
              <FilterPill key={String(d)} label={d ? `${d} días` : 'Todos'} active={filterDays === d} onTap={() => setFilterDays(d)} small />
            ))}
          </div>

          {/* Program cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredPresets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 36, opacity: 0.4 }}>🔍</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)' }}>Sin resultados</p>
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>No hay programas con estos filtros</p>
                <button
                  onClick={() => { setFilterGoal(null); setFilterLevel(null); setFilterDays(null) }}
                  style={{ height: 36, padding: '0 16px', borderRadius: 10, outline: 'none', background: 'rgba(232,146,74,0.12)', border: '0.5px solid rgba(232,146,74,0.25)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : filteredPresets.map(p => {
              const isActivated = programs.some(pr => pr.presetId === p.id && pr.id === activeProgram)
              return (
                <PresetProgramCard
                  key={p.id}
                  program={p}
                  isActive={isActivated}
                  isRecommended={recommended?.id === p.id}
                  onActivate={() => activatePreset(p)}
                />
              )
            })}
          </div>
        </div>
      </Sheet>
    </div>
    </div>
  )
}
