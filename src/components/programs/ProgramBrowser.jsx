import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Play, Sparkles } from 'lucide-react'
import { PRESET_PROGRAMS, getRecommendedPreset } from '../../data/presetPrograms.js'
import { getExerciseById, MUSCLE_NAMES } from '../../data/exercises.js'
import useStore from '../../store/index.js'

const GOAL_LABELS   = { fuerza: 'Fuerza', volumen: 'Volumen', definicion: 'Definición' }
const LEVEL_LABELS  = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }
const GOAL_COLORS   = { fuerza: 'var(--red)', volumen: 'var(--accent)', definicion: 'var(--green)' }

const DAY_LETTERS = ['L','M','X','J','V','S','D']

function ScheduleDots({ schedule }) {
  if (!schedule?.length) return null
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
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

function ProgramCard({ program, isRecommended, onActivate }) {
  const [expanded, setExpanded] = useState(false)
  const goalColor = GOAL_COLORS[program.goal] || 'var(--accent)'

  return (
    <div style={{
      background: 'rgba(22,18,12,0.68)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderRadius: 'var(--r)',
      border: `0.5px solid ${isRecommended ? 'rgba(232,146,74,0.3)' : 'rgba(255,235,200,0.07)'}`,
      borderLeft: `4px solid ${goalColor}`,
      boxShadow: `inset 0 1px 0 rgba(255,235,200,0.07)${isRecommended ? ', 0 0 24px rgba(232,146,74,0.08)' : ''}`,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 16px 14px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {program.name}
              </p>
              {isRecommended && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, fontWeight: 700, padding: '2px 8px',
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  border: '1px solid var(--accent-border)',
                }}>
                  <Sparkles size={8} /> Para ti
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 'var(--r-pill)',
                background: 'var(--surface2)', color: 'var(--text2)',
                border: '1px solid var(--border)',
              }}>
                {LEVEL_LABELS[program.level]}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 'var(--r-pill)',
                background: 'var(--surface2)', color: 'var(--text2)',
                border: '1px solid var(--border)',
              }}>
                {program.daysPerWeek} días/sem
              </span>
              {program.weeks && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px',
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--surface2)', color: 'var(--text2)',
                  border: '1px solid var(--border)',
                }}>
                  {program.weeks} semanas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: 'var(--text2)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 12,
        }}>
          {program.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {(program.tags || []).map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--surface3)', color: 'var(--text2)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Week schedule */}
        <div style={{ marginBottom: 14 }}>
          <ScheduleDots schedule={program.schedule} />
        </div>

        {/* Expanded detail — training days */}
        {expanded && (
          <div style={{ marginBottom: 14 }}>
            <p className="t-label" style={{ marginBottom: 8 }}>Días de entrenamiento</p>
            {(program.days || []).map((day, i) => (
              <div key={day.id || i} style={{
                marginBottom: 10, padding: '10px 12px',
                background: 'var(--surface2)', borderRadius: 12,
                border: '0.5px solid var(--border)',
              }}>
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

        {/* Actions row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="pressable"
            style={{
              flex: 1, height: 38, borderRadius: 10,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {expanded ? <><ChevronUp size={13} /> Ocultar</> : <><ChevronDown size={13} /> Ver detalles</>}
          </button>
          <button
            onClick={() => onActivate(program)}
            className="pressable"
            style={{
              flex: 2, height: 38, borderRadius: 10,
              background: 'var(--accent)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(232,146,74,0.25)',
            }}
          >
            <Play size={13} /> Usar este programa
          </button>
        </div>
      </div>
    </div>
  )
}

const FILTER_PILLS_GOAL  = [null, 'fuerza', 'volumen', 'definicion']
const FILTER_PILLS_LEVEL = [null, 'principiante', 'intermedio', 'avanzado']
const FILTER_PILLS_DAYS  = [null, 3, 4, 6]

export function ProgramBrowser({ open, onClose, onProgramActivated }) {
  const user = useStore(s => s.user)
  const addProgram = useStore(s => s.addProgram)
  const setActiveProgram = useStore(s => s.setActiveProgram)
  const addToast = useStore(s => s.addToast)

  const [filterGoal, setFilterGoal]   = useState(null)
  const [filterLevel, setFilterLevel] = useState(null)
  const [filterDays, setFilterDays]   = useState(null)

  const recommended = getRecommendedPreset(user?.level, user?.goal)

  const filtered = PRESET_PROGRAMS.filter(p => {
    if (filterGoal  && p.goal  !== filterGoal)              return false
    if (filterLevel && p.level !== filterLevel)             return false
    if (filterDays  && p.daysPerWeek !== filterDays)        return false
    return true
  })

  const handleActivate = (preset) => {
    const userCopy = {
      ...preset,
      id: `user-${Date.now()}`,
      isPreset: false,
      presetId: preset.id,
      createdAt: new Date().toISOString(),
    }
    addProgram(userCopy)
    setActiveProgram(userCopy.id)
    addToast(`¡${preset.name} activado!`, 'success')
    onClose()
    onProgramActivated?.()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.22s ease',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 81,
        height: '92dvh', display: 'flex', flexDirection: 'column',
        background: 'rgba(16,13,9,0.88)',
        backdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
        borderRadius: '32px 32px 0 0',
        boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
        animation: 'sheetIn 0.36s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Handle */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', flexShrink: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>Explorar programas</p>
          <button onClick={onClose} className="pressable" style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,235,200,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text2)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div style={{ flexShrink: 0, overflowX: 'auto', padding: '0 20px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Goal filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTER_PILLS_GOAL.map(g => (
              <button key={String(g)} onClick={() => setFilterGoal(g)} className="pressable" style={{
                padding: '6px 12px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap',
                background: filterGoal === g ? 'var(--accent-dim)' : 'var(--surface2)',
                border: `1px solid ${filterGoal === g ? 'var(--accent-border)' : 'var(--border)'}`,
                color: filterGoal === g ? 'var(--accent)' : 'var(--text2)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                {g ? GOAL_LABELS[g] : 'Todos'}
              </button>
            ))}
          </div>
          {/* Level + Days filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTER_PILLS_LEVEL.map(l => (
              <button key={String(l)} onClick={() => setFilterLevel(l)} className="pressable" style={{
                padding: '5px 10px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap',
                background: filterLevel === l ? 'var(--surface3)' : 'var(--surface2)',
                border: `1px solid ${filterLevel === l ? 'var(--border2)' : 'var(--border)'}`,
                color: filterLevel === l ? 'var(--text)' : 'var(--text3)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                {l ? LEVEL_LABELS[l] : 'Cualquier nivel'}
              </button>
            ))}
            {FILTER_PILLS_DAYS.map(d => (
              <button key={String(d)} onClick={() => setFilterDays(d)} className="pressable" style={{
                padding: '5px 10px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap',
                background: filterDays === d ? 'var(--surface3)' : 'var(--surface2)',
                border: `1px solid ${filterDays === d ? 'var(--border2)' : 'var(--border)'}`,
                color: filterDays === d ? 'var(--text)' : 'var(--text3)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                {d ? `${d} días` : 'Todos los días'}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', flexShrink: 0, marginBottom: 4 }} />

        {/* Program list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>Sin programas para estos filtros.</p>
            </div>
          ) : (
            filtered.map(p => (
              <ProgramCard
                key={p.id}
                program={p}
                isRecommended={recommended?.id === p.id}
                onActivate={handleActivate}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
