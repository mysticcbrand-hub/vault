import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Edit3, Download, Upload, Trash2, Medal } from 'lucide-react'
import useStore from '../../store/index.js'
import { ALL_BADGES } from '../../data/badges.js'
import { calculateUserStats } from '../../utils/userStats.js'
import { AchievementsModal } from '../profile/AchievementsModal.jsx'
import { Sheet, OptionPicker, ConfirmDialog } from '../ui/Sheet.jsx'

const EMOJI_OPTIONS = ['💪','🔥','⚡','🏋️','🎯','🦁','🐺','🦅','⚔️','🛡️','🌊','🏔️','🌙','☄️','🧬','💎','🔱','⚙️','🎖️','🏆']
const REST_PRESETS = [45, 60, 90, 120, 180, 300]

function StatCell({ label, value, animate }) {
  return (
    <div className="stat-cell" style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 82 }}>
      <div className={animate ? 'stat-count-up' : ''} style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono, monospace', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)' }}>{label}</div>
    </div>
  )
}

function formatVolumeShort(n) {
  if (!n) return '0 kg'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M kg`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k kg`
  return `${Math.round(n)} kg`
}

function formatMinutes(totalSeconds) {
  const totalMin = Math.round(totalSeconds / 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function getRepRangeLabel(goal) {
  if (goal === 'hipertrofia') return 'Hipertrofia (8–12)'
  if (goal === 'fuerza') return 'Fuerza (3–6)'
  if (goal === 'bajar_grasa') return 'Recomposición (8–15)'
  return 'Personalizado'
}

export function ProfileTab() {
  const user = useStore(s => s.user)
  const sessions = useStore(s => s.sessions)
  const bodyMetrics = useStore(s => s.bodyMetrics)
  const programs = useStore(s => s.programs)
  const activeProgramId = useStore(s => s.activeProgram)
  const settings = useStore(s => s.settings)
  const prs = useStore(s => s.prs)
  const unlockedBadges = useStore(s => s.unlockedBadges)
  const updateUser = useStore(s => s.updateUser)
  const updateSettings = useStore(s => s.updateSettings)
  const setActiveProgram = useStore(s => s.setActiveProgram)

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name || '')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [achOpen, setAchOpen] = useState(false)
  const [restOpen, setRestOpen] = useState(false)
  const [programOpen, setProgramOpen] = useState(false)
  const [repRangeOpen, setRepRangeOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [clearText, setClearText] = useState('')

  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const stats = useMemo(() => calculateUserStats(sessions, bodyMetrics, user, programs, prs), [sessions, bodyMetrics, user, programs, prs])

  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => { setNameValue(user?.name || '') }, [user?.name])

  const memberSince = user?.startDate
    ? new Date(user.startDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : '—'

  const activeProgram = programs.find(p => p.id === activeProgramId)
  const totalWeeks = activeProgram?.totalWeeks || 12
  const startDate = user?.startDate ? new Date(user.startDate) : new Date()
  const weeksSince = Math.max(1, Math.min(totalWeeks, Math.floor((Date.now() - startDate.getTime()) / 604800000) + 1))

  const currentWeight = bodyMetrics[0]?.weight ?? user?.currentWeight
  const goalWeight = user?.goalWeight
  const goalRemaining = goalWeight && currentWeight ? Math.abs(goalWeight - currentWeight) : null
  const goalWeeks = user?.goalTimeframe ? Math.round(user.goalTimeframe) : null

  const recentBadges = [...(unlockedBadges || [])]
    .filter(b => b.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 3)

  const lockedWithProgress = ALL_BADGES
    .filter(b => !unlockedBadges?.find(u => u.id === b.id))
    .map(b => ({ badge: b, progress: b.progress?.(stats) }))
    .filter(b => b.progress && b.progress.total > 0)
    .map(b => ({ ...b, pct: b.progress ? Math.min(1, b.progress.current / b.progress.total) : 0 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2)

  const handleExport = () => {
    const data = { user, programs, activeProgram: activeProgramId, templates: useStore.getState().templates, sessions, prs, bodyMetrics, settings, unlockedBadges }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `graw_export_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file) => {
    const text = await file.text()
    const data = JSON.parse(text)
    useStore.setState(state => ({
      ...state,
      user: data.user || state.user,
      programs: data.programs || state.programs,
      activeProgram: data.activeProgram || state.activeProgram,
      templates: data.templates || state.templates,
      sessions: data.sessions || state.sessions,
      prs: data.prs || state.prs,
      bodyMetrics: data.bodyMetrics || state.bodyMetrics,
      settings: data.settings || state.settings,
      unlockedBadges: data.unlockedBadges || state.unlockedBadges,
    }))
  }

  const handleClear = () => {
    if (clearText.trim().toUpperCase() !== 'BORRAR') return
    useStore.setState(() => ({ ...useStore.getState(), sessions: [], prs: {}, bodyMetrics: [], unlockedBadges: [], activeWorkout: null }))
    setClearText('')
    setClearOpen(false)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom), 16px) + 24px)',
    }}>
      {/* Section 1 — Identity */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="identity-card" style={{
          background: 'linear-gradient(155deg, rgba(32,26,16,0.88) 0%, rgba(14,11,8,0.96) 100%)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderRadius: 'var(--r-lg)',
          padding: '24px 20px',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 8px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,235,200,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(232,146,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setEmojiOpen(true)} className="profile-avatar pressable" style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-dim), rgba(232,146,74,0.08))',
              border: '2px solid var(--accent-border)',
              boxShadow: '0 0 0 4px rgba(232,146,74,0.08), inset 0 1px 0 rgba(255,235,200,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', flexShrink: 0,
            }}>
              {user?.avatarEmoji || (user?.name || 'A').charAt(0).toUpperCase()}
            </button>

            <div style={{ flex: 1 }}>
              {editingName ? (
                <input
                  autoFocus
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={() => { updateUser({ name: nameValue.trim() || user?.name }); setEditingName(false) }}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', fontSize: 22, fontWeight: 800, color: 'var(--text)', padding: '2px 0', outline: 'none', width: '100%', fontFamily: 'DM Sans, sans-serif' }}
                />
              ) : (
                <h2 onClick={() => setEditingName(true)} style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  {user?.name || 'Atleta'} <Edit3 size={14} color="var(--text3)" />
                </h2>
              )}
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Miembro desde {memberSince}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span className="identity-pill">{user?.level || 'Intermedio'}</span>
                <span className="identity-pill">{user?.goal || 'Volumen'}</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0 12px' }} />

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Programa activo</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{activeProgram?.name || 'Sin programa'} · Semana {weeksSince} de {totalWeeks}</p>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--surface3)', marginTop: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((weeksSince / totalWeeks) * 100)}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))' }} />
            </div>
          </div>

          <div>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Objetivo de peso</p>
            {goalWeight && currentWeight ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{currentWeight} kg → {goalWeight} kg · Faltan {goalRemaining?.toFixed(1)} kg{goalWeeks ? ` · ~${goalWeeks} semanas` : ''}</p>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--surface3)', marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((1 - Math.min(1, goalRemaining / Math.max(1, Math.abs(goalWeight - currentWeight) || 1))) * 100)}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))' }} />
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Sin objetivo · Tap para añadir →</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 — Lifetime stats */}
      <div ref={statsRef} style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Lifetime stats</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
          <div style={{ borderRadius: 'var(--r-sm) 0 0 0' }}><StatCell label="Total sesiones" value={stats.totalSessions} animate={statsVisible} /></div>
          <div style={{ borderRadius: '0 var(--r-sm) 0 0' }}><StatCell label="Total volumen" value={formatVolumeShort(stats.totalVolume)} animate={statsVisible} /></div>
          <div><StatCell label="Tiempo total" value={formatMinutes(sessions.reduce((t, s) => t + (s.duration || 0), 0))} animate={statsVisible} /></div>
          <div><StatCell label="Mejor racha" value={`${stats.maxStreak} días`} animate={statsVisible} /></div>
          <div style={{ borderRadius: '0 0 0 var(--r-sm)' }}><StatCell label="Ejercicios únicos" value={stats.uniqueExercisesCount} animate={statsVisible} /></div>
          <div style={{ borderRadius: '0 0 var(--r-sm) 0' }}><StatCell label="Semanas activas" value={stats.activeWeeks} animate={statsVisible} /></div>
        </div>
      </div>

      {/* Section 3 — Achievements preview */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', textTransform: 'uppercase' }}>Logros</p>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{unlockedBadges?.length || 0} de {ALL_BADGES.length} conseguidos</p>
          </div>
          <button onClick={() => setAchOpen(true)} className="pressable" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Ver todos <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {recentBadges.length > 0 ? recentBadges.map(b => (
            <div key={b.id} style={{ flex: 1, minHeight: 64, borderRadius: 16, background: 'rgba(20,17,12,0.65)', border: '0.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Medal size={24} color="var(--accent)" />
            </div>
          )) : (
            <div style={{ flex: 1, padding: '16px 14px', borderRadius: 16, border: '0.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text3)', fontSize: 12 }}>
              Aún no hay logros. Empieza tu próxima sesión.
            </div>
          )}
        </div>

        {lockedWithProgress.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {lockedWithProgress.map(item => (
              <div key={item.badge.id} className="achievement-next" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Medal size={16} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.badge.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>{Math.round(item.progress.current)} / {Math.round(item.progress.total)}</p>
                  <div className="achievement-next-bar" style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                    <div className="achievement-next-fill" style={{ width: `${Math.round(item.pct * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 4 — Settings */}
      <div style={{ padding: '24px 20px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Ajustes</p>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '0.5px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)' }}>Entrenamiento</div>
          <div className="settings-row" onClick={() => updateSettings({ weightUnit: settings.weightUnit === 'kg' ? 'lbs' : 'kg' })}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Unidad de peso</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['kg','lbs'].map(u => (
                <span key={u} style={{ padding: '4px 10px', borderRadius: 999, background: settings.weightUnit === u ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${settings.weightUnit === u ? 'var(--accent-border)' : 'var(--border)'}`, fontSize: 12, fontWeight: 700, color: settings.weightUnit === u ? 'var(--accent)' : 'var(--text3)' }}>{u}</span>
              ))}
            </div>
          </div>
          <div className="settings-row" onClick={() => setRestOpen(true)}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Descanso por defecto</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{Math.floor(settings.restTimerDefault / 60)}:{String(settings.restTimerDefault % 60).padStart(2,'0')} ▾</span>
          </div>
          <div className="settings-row" onClick={() => setRepRangeOpen(true)}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Rango de reps</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{settings.repRangeGuidance || getRepRangeLabel(user?.goal)} ▾</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '0.5px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)' }}>Programa</div>
          <div className="settings-row" onClick={() => setProgramOpen(true)}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Programa activo</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{activeProgram?.name || 'Sin programa'} ▾</span>
          </div>
          <div className="settings-row" onClick={() => setProgramOpen(true)}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Explorar programas</span>
            <ChevronRight size={16} color="var(--text3)" />
          </div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '0.5px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)' }}>Datos</div>
          <div className="settings-row" onClick={handleExport}><span style={{ fontSize: 14, color: 'var(--text)' }}>Exportar datos</span><Download size={16} color="var(--text3)" /></div>
          <label className="settings-row" style={{ cursor: 'pointer' }}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Importar datos</span>
            <Upload size={16} color="var(--text3)" />
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = '' }} />
          </label>
          <div className="settings-row" onClick={() => setClearOpen(true)}><span style={{ fontSize: 14, color: 'var(--red)' }}>Borrar todo</span><Trash2 size={16} color="var(--red)" /></div>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '0.5px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.02)' }}>App</div>
          <div className="settings-row" style={{ cursor: 'default' }}><span style={{ fontSize: 14, color: 'var(--text)' }}>Versión GRAW</span><span style={{ fontSize: 13, color: 'var(--text3)' }}>1.0</span></div>
          <div className="settings-row" onClick={() => window.dispatchEvent(new Event('beforeinstallprompt'))}><span style={{ fontSize: 14, color: 'var(--text)' }}>Añadir a pantalla de inicio</span><ChevronRight size={16} color="var(--text3)" /></div>
        </div>
      </div>

      {/* ── SHEETS (all via portal, never cut off) ───── */}

      {/* Emoji picker */}
      <Sheet isOpen={emojiOpen} onClose={() => setEmojiOpen(false)} title="Elige tu avatar" size="small">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {EMOJI_OPTIONS.map(e => (
            <button key={e} onClick={() => { updateUser({ avatarEmoji: e }); setEmojiOpen(false) }}
              style={{ height: 52, borderRadius: 14, background: 'rgba(255,235,200,0.05)', border: '1px solid rgba(255,235,200,0.08)', fontSize: 22, cursor: 'pointer' }}>
              {e}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Rest timer picker */}
      <OptionPicker
        isOpen={restOpen}
        onClose={() => setRestOpen(false)}
        title="Descanso entre series"
        selected={settings.restTimerDefault}
        onSelect={v => updateSettings({ restTimerDefault: v })}
        options={[
          { value: 45,  label: '45 segundos' },
          { value: 60,  label: '1 minuto' },
          { value: 90,  label: '1 minuto 30s' },
          { value: 120, label: '2 minutos' },
          { value: 180, label: '3 minutos' },
          { value: 300, label: '5 minutos' },
        ]}
      />

      {/* Program picker */}
      <OptionPicker
        isOpen={programOpen}
        onClose={() => setProgramOpen(false)}
        title="Programa activo"
        selected={activeProgramId}
        onSelect={v => setActiveProgram(v)}
        options={programs.map(p => ({ value: p.id, label: p.name }))}
      />

      {/* Rep range picker */}
      <OptionPicker
        isOpen={repRangeOpen}
        onClose={() => setRepRangeOpen(false)}
        title="Rango de repeticiones"
        selected={settings.repRangeGuidance}
        onSelect={v => updateSettings({ repRangeGuidance: v })}
        options={[
          { value: 'Hipertrofia (8–12)', label: 'Hipertrofia (8–12)' },
          { value: 'Fuerza (3–6)',        label: 'Fuerza (3–6)' },
          { value: 'Recomposición (8–15)',label: 'Recomposición (8–15)' },
          { value: 'Personalizado',       label: 'Personalizado' },
        ]}
      />

      {/* Clear confirmation */}
      <Sheet isOpen={clearOpen} onClose={() => setClearOpen(false)} title="Borrar todos los datos" size="small" dismissable={false}>
        <p style={{ fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 16, lineHeight: 1.5 }}>
          Se borrarán todas tus sesiones, PRs y métricas. Esta acción no se puede deshacer.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(245,239,230,0.4)', marginBottom: 8 }}>Escribe BORRAR para confirmar</p>
        <input
          value={clearText}
          onChange={e => setClearText(e.target.value)}
          className="input"
          placeholder="BORRAR"
          style={{ marginBottom: 16, width: '100%' }}
        />
        <button
          onClick={handleClear}
          disabled={clearText.trim().toUpperCase() !== 'BORRAR'}
          style={{
            width: '100%', height: 48, borderRadius: 14,
            background: clearText.trim().toUpperCase() === 'BORRAR' ? 'var(--red)' : 'rgba(229,83,75,0.12)',
            border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Confirmar
        </button>
      </Sheet>

      {/* KEEP old emoji/rest/program/repRange/clear open={false} so React doesn't break */}
      {false && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setEmojiOpen(false)}>
          <div style={{ width: '100%', background: 'rgba(14,11,8,0.96)', borderRadius: '28px 28px 0 0', padding: '20px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Elige tu avatar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => { updateUser({ avatarEmoji: e }); setEmojiOpen(false) }} style={{ height: 48, borderRadius: 14, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 20, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rest timer picker */}
      {restOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setRestOpen(false)}>
          <div style={{ width: '100%', background: 'rgba(14,11,8,0.96)', borderRadius: '28px 28px 0 0', padding: '20px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Descanso por defecto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REST_PRESETS.map(sec => (
                <button key={sec} onClick={() => { updateSettings({ restTimerDefault: sec }); setRestOpen(false) }} className="pressable" style={{ height: 44, borderRadius: 12, background: settings.restTimerDefault === sec ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${settings.restTimerDefault === sec ? 'var(--accent-border)' : 'var(--border)'}`, color: settings.restTimerDefault === sec ? 'var(--accent)' : 'var(--text2)', fontWeight: 700, cursor: 'pointer' }}>
                  {Math.floor(sec / 60)}:{String(sec % 60).padStart(2,'0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Program picker */}
      {programOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setProgramOpen(false)}>
          <div style={{ width: '100%', background: 'rgba(14,11,8,0.96)', borderRadius: '28px 28px 0 0', padding: '20px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Programa activo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {programs.map(p => (
                <button key={p.id} onClick={() => { setActiveProgram(p.id); setProgramOpen(false) }} className="pressable" style={{ height: 48, borderRadius: 12, background: activeProgramId === p.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${activeProgramId === p.id ? 'var(--accent-border)' : 'var(--border)'}`, color: activeProgramId === p.id ? 'var(--accent)' : 'var(--text2)', fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: '0 14px' }}>{p.name}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rep range override */}
      {repRangeOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setRepRangeOpen(false)}>
          <div style={{ width: '100%', background: 'rgba(14,11,8,0.96)', borderRadius: '28px 28px 0 0', padding: '20px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Rango de reps</p>
            {['Hipertrofia (8–12)','Fuerza (3–6)','Recomposición (8–15)','Personalizado'].map(label => (
              <button key={label} onClick={() => { updateSettings({ repRangeGuidance: label }); setRepRangeOpen(false) }} className="pressable" style={{ height: 44, borderRadius: 12, background: settings.repRangeGuidance === label ? 'var(--accent-dim)' : 'var(--surface2)', border: `1px solid ${settings.repRangeGuidance === label ? 'var(--accent-border)' : 'var(--border)'}`, color: settings.repRangeGuidance === label ? 'var(--accent)' : 'var(--text2)', fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear confirmation */}
      {clearOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setClearOpen(false)}>
          <div style={{ width: '100%', background: 'rgba(16,13,9,0.96)', borderRadius: '28px 28px 0 0', padding: '20px', boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Borrar todo</p>
            <p style={{ fontSize: 12.5, color: 'var(--text2)', marginBottom: 12 }}>Escribe BORRAR para confirmar</p>
            <input value={clearText} onChange={e => setClearText(e.target.value)} className="input" placeholder="BORRAR" style={{ marginBottom: 12 }} />
            <button onClick={handleClear} className="pressable" style={{ width: '100%', height: 46, borderRadius: 12, background: 'var(--red)', border: 'none', color: 'white', fontWeight: 700 }}>Confirmar</button>
          </div>
        </div>
      )}

      <AchievementsModal open={achOpen} onClose={() => setAchOpen(false)} />
    </div>
  )
}
