import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronDown, ChevronUp, Play, Sparkles } from 'lucide-react'
import { PRESET_PROGRAMS, getRecommendedPreset } from '../../data/presetPrograms.js'
import { getExerciseById } from '../../data/exercises.js'
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
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: s === 'rest' ? 'var(--border2)' : 'var(--accent)',
            opacity: s === 'rest' ? 0.4 : 1,
          }} />
        </div>
      ))}
    </div>
  )
}

function ProgramCard({ program, recommended, onOpen, onActivate }) {
  const [expanded, setExpanded] = useState(false)
  const goalColor = GOAL_COLORS[program.goal] || 'var(--accent)'

  return (
    <div style={{
      background: 'rgba(22,18,12,0.70)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderRadius: 'var(--r)',
      border: `0.5px solid ${recommended ? 'rgba(232,146,74,0.32)' : 'rgba(255,235,200,0.07)'}`,
      borderLeft: `4px solid ${goalColor}`,
      boxShadow: `inset 0 1px 0 rgba(255,235,200,0.08)${recommended ? ', 0 0 24px rgba(232,146,74,0.08)' : ''}`,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{program.name}</p>
              {recommended && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                  <Sparkles size={8} /> Para ti
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                {LEVEL_LABELS[program.level]}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                {program.daysPerWeek} días/sem
              </span>
              {program.weeks && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  {program.weeks} semanas
                </span>
              )}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 10 }}>
          {program.description}
        </p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {(program.tags || []).map(tag => (
            <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text2)' }}>{tag}</span>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <ScheduleDots schedule={program.schedule} />
        </div>

        {expanded && (
          <div style={{ marginBottom: 12 }}>
            <p className="t-label" style={{ marginBottom: 8 }}>Días de entrenamiento</p>
            {(program.days || []).map((day, i) => (
              <div key={day.id || i} style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 12, border: '0.5px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{day.name}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {(day.exercises || []).map((ex, j) => {
                    const exData = getExerciseById(ex.exerciseId)
                    return (
                      <p key={j} style={{ fontSize: 12, color: 'var(--text2)' }}>
                        · {exData?.name || ex.exerciseId} — {ex.sets}×{ex.reps}
                      </p>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setExpanded(!expanded)} className="pressable" style={{ flex: 1, height: 38, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {expanded ? <><ChevronUp size={13} /> Ocultar</> : <><ChevronDown size={13} /> Ver detalles</>}
          </button>
          <button onClick={() => onOpen(program)} className="pressable" style={{ flex: 1, height: 38, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Ver programa
          </button>
          <button onClick={() => onActivate(program)} className="pressable" style={{ flex: 1.2, height: 38, borderRadius: 10, background: 'var(--accent)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,146,74,0.25)' }}>
            <Play size={13} /> Usar
          </button>
        </div>
      </div>
    </div>
  )
}

function ProgramDetail({ program, recommended, onBack, onActivate }) {
  const goalColor = GOAL_COLORS[program.goal] || 'var(--accent)'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 20px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,235,200,0.07)' }}>
        <button onClick={onBack} className="pressable" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color="var(--text2)" />
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Detalle del programa</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom,0px))' }}>
        <div style={{ background: 'linear-gradient(155deg, rgba(36,27,16,0.88) 0%, rgba(16,13,9,0.94) 100%)', borderRadius: 'var(--r-lg)', padding: '20px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,235,200,0.08)', marginBottom: 16 }}>
          <div style={{ position: 'absolute', top: -40, left: -30, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(ellipse, ${goalColor}26 0%, transparent 70%)`, filter: 'blur(30px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{LEVEL_LABELS[program.level]}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{GOAL_LABELS[program.goal]}</span>
              {recommended && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}><Sparkles size={8} /> Para ti</span>
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

        <div style={{ marginBottom: 14 }}>
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
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px', background: 'rgba(12,10,9,0.92)', borderTop: '1px solid rgba(255,235,200,0.08)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <button onClick={() => onActivate(program)} className="pressable" style={{ width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.2), 0 4px 20px var(--accent-glow)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Usar este programa
        </button>
      </div>
    </div>
  )
}

export function ProgramBrowser({ open, onClose, onProgramActivated }) {
  const user = useStore(s => s.user)
  const addProgram = useStore(s => s.addProgram)
  const setActiveProgram = useStore(s => s.setActiveProgram)
  const addToast = useStore(s => s.addToast)

  const [filterGoal, setFilterGoal] = useState(null)
  const [filterLevel, setFilterLevel] = useState(null)
  const [filterDays, setFilterDays] = useState(null)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)

  const recommended = getRecommendedPreset(user?.level, user?.goal)

  const filtered = useMemo(() => PRESET_PROGRAMS.filter(p => {
    if (filterGoal && p.goal !== filterGoal) return false
    if (filterLevel && p.level !== filterLevel) return false
    if (filterDays && p.daysPerWeek !== filterDays) return false
    return true
  }), [filterGoal, filterLevel, filterDays])

  const handleActivate = (preset) => {
    const userCopy = { ...preset, id: `user-${Date.now()}`, isPreset: false, presetId: preset.id, createdAt: new Date().toISOString() }
    addProgram(userCopy)
    setActiveProgram(userCopy.id)
    addToast(`¡${preset.name} activado!`, 'success')
    onClose()
    onProgramActivated?.()
  }

  const openDetail = (program) => { setSelected(program); setView('detail') }

  return createPortal(
    <AnimatePresence>
      {open && (
    <>
      <motion.div key="pb-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />

      <motion.div key="pb-sh" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 1 }}
        style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 81, height: '94dvh', display: 'flex', flexDirection: 'column', background: 'rgba(16,13,9,0.94)', backdropFilter: 'blur(56px) saturate(220%) brightness(1.05)', WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.05)', borderRadius: '32px 32px 0 0', boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', flexShrink: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{view === 'detail' ? 'Programa' : 'Explorar programas'}</p>
          <button onClick={onClose} className="pressable" style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,235,200,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text2)' }}>
            <X size={16} />
          </button>
        </div>

        {view === 'detail' && selected ? (
          <ProgramDetail program={selected} recommended={recommended?.id === selected.id} onBack={() => setView('list')} onActivate={handleActivate} />
        ) : (
          <>
            <div style={{ flexShrink: 0, padding: '0 20px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

            <div style={{ height: 1, background: 'rgba(255,235,200,0.07)', flexShrink: 0 }} />

            <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '12px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: 'var(--text3)' }}>Sin programas para estos filtros.</p>
                </div>
              ) : (
                filtered.map(p => (
                  <ProgramCard key={p.id} program={p} recommended={recommended?.id === p.id} onOpen={openDetail} onActivate={handleActivate} />
                ))
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
      )}
    </AnimatePresence>,
    document.body
  )
}
