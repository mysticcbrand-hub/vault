import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Edit3, Download, Upload, Trash2 } from 'lucide-react'
import useStore from '../../store/index.js'
import { ALL_BADGES, RARITY_STYLES } from '../../data/badges.js'
import { calculateUserStats } from '../../utils/userStats.js'
import { computeRewards } from '../../data/rewards.js'
import { AchievementsModal } from '../profile/AchievementsModal.jsx'
import { Sheet, OptionPicker, ConfirmDialog } from '../ui/Sheet.jsx'

// ─── BadgeShowcaseItem ────────────────────────────────────────────────────────
// Renders a single badge with its full rarity frame in the profile showcase.
function BadgeShowcaseItem({ badge }) {
  if (!badge) return null
  const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common
  const ICONS = {
    Sparkles: '✨', Play: '▶', Star: '★', Scale: '⚖', Zap: '⚡',
    Shield: '🛡', ShieldCheck: '✅', Flame: '🔥', Crown: '👑',
    Dumbbell: '🏋', Activity: '📈', BarChart2: '📊', Trophy: '🏆',
    Medal: '🎖', Weight: '⚖', Package: '📦', Layers: '📚', Mountain: '⛰',
    TrendingUp: '📈', ArrowDown: '↓', ArrowUp: '↑', User: '👤',
    Grid: '⊞', PenLine: '✏', Plus: '+', Calendar: '📅',
    CalendarDays: '🗓', Globe: '🌍', Target: '🎯', Sunrise: '🌅',
    Moon: '🌙', ClipboardList: '📋', CheckCircle: '✓', Award: '🏅',
  }
  const iconEmoji = ICONS[badge.icon] || '★'

  return (
    <div style={{
      flex: 1, minHeight: 72,
      borderRadius: 16,
      background: style.frameGradient,
      border: `1px solid ${style.borderColor1}`,
      boxShadow: `0 0 16px ${style.glowColor}, inset 0 1px 0 ${style.borderColor1}`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 4, padding: '10px 6px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Shimmer overlay for rare+ */}
      {style.shimmer && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(105deg, transparent 40%, ${style.glowColor} 50%, transparent 60%)`,
          backgroundSize: '200% 100%',
          animation: 'title-shimmer 2.5s linear infinite',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }} />
      )}
      <div style={{ fontSize: 22, lineHeight: 1, position: 'relative', zIndex: 1 }}>{iconEmoji}</div>
      <div style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: style.labelColor,
        position: 'relative', zIndex: 1,
      }}>
        {style.label}
      </div>
    </div>
  )
}

const EMOJI_OPTIONS = ['💪','🔥','⚡','🏋️','🎯','🦁','🐺','🦅','⚔️','🛡️','🌊','🏔️','🌙','☄️','🧬','💎','🔱','⚙️','🎖️','🏆']
const REST_PRESETS = [45, 60, 90, 120, 180, 300]

function StatCard({ label, value, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.28 }}
      style={{
        borderRadius: 16,
        background: 'rgba(32,26,16,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(255,235,200,0.07)',
        boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.06)',
        padding: '14px 14px 12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 14, right: 14,
        height: 2,
        borderRadius: '0 0 3px 3px',
        background: accent,
        opacity: 0.75,
        boxShadow: `0 0 8px ${accent}`,
      }} />
      <div style={{
        fontSize: 24, fontWeight: 800, letterSpacing: '-0.035em',
        color: '#F5EFE6', fontFamily: 'DM Mono, monospace',
        lineHeight: 1, marginTop: 6, marginBottom: 5,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 600,
        letterSpacing: '0.055em', textTransform: 'uppercase',
        color: 'rgba(245,239,230,0.38)', lineHeight: 1.3,
      }}>
        {label}
      </div>
    </motion.div>
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
  const repRangeValue = settings.repRangeGuidance
  const repRangeLabel = typeof repRangeValue === 'string'
    ? repRangeValue
    : repRangeValue?.label || repRangeValue?.range
  const [clearOpen, setClearOpen] = useState(false)
  const [clearText, setClearText] = useState('')

  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const stats = useMemo(() => calculateUserStats(sessions, bodyMetrics, user, programs, prs), [sessions, bodyMetrics, user, programs, prs])

  // ── Rewards — computed from unlocked badges + current streak ──────────────
  const rewards = useMemo(
    () => computeRewards(unlockedBadges, stats.currentStreak),
    [unlockedBadges, stats.currentStreak]
  )

  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => { setNameValue(user?.name || '') }, [user?.name])

  const memberSince = (() => {
    const raw = user?.startDate || user?.createdAt
    if (!raw) {
      // No date stored — use today and persist it
      const today = new Date().toISOString()
      setTimeout(() => updateUser({ startDate: today }), 0)
      return new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    const d = new Date(raw)
    if (isNaN(d.getTime())) return 'Hoy'
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  })()

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
      {/* Section 1 — Identity (gamified) */}
      <div style={{ padding: '20px 20px 0' }}>
        <motion.div
          className="identity-card"
          layout
          style={{
            background: rewards.cardGradient,
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            borderRadius: 'var(--r-lg)',
            padding: '24px 20px',
            boxShadow: rewards.maxRarity === 'legendary'
              ? 'inset 0 1.5px 0 rgba(232,146,74,0.2), 0 8px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(232,146,74,0.2)'
              : rewards.maxRarity === 'epic'
                ? 'inset 0 1.5px 0 rgba(163,127,212,0.15), 0 8px 40px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(163,127,212,0.15)'
                : 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 8px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,235,200,0.08)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.6s ease, box-shadow 0.6s ease',
          }}
        >
          {/* Ambient glow orb — color changes with rarity */}
          <div style={{
            position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%',
            background: rewards.maxRarity === 'legendary'
              ? 'radial-gradient(ellipse, rgba(232,146,74,0.13) 0%, transparent 70%)'
              : rewards.maxRarity === 'epic'
                ? 'radial-gradient(ellipse, rgba(163,127,212,0.1) 0%, transparent 70%)'
                : rewards.maxRarity === 'rare'
                  ? 'radial-gradient(ellipse, rgba(91,156,246,0.08) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(232,146,74,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
            transition: 'background 0.6s ease',
          }} />

          {/* ── Avatar + Name row ─────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

            {/* Avatar with dynamic frame */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setEmojiOpen(true)}
                className={`profile-avatar pressable ${rewards.maxRarity === 'legendary' ? 'avatar-legendary' : rewards.maxRarity === 'epic' ? 'avatar-pulse' : ''}`}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(232,146,74,0.12), rgba(232,146,74,0.05))',
                  border: rewards.avatarFrame.border,
                  boxShadow: rewards.avatarFrame.boxShadow,
                  '--pulse-shadow-a': rewards.avatarFrame.boxShadow,
                  '--pulse-shadow-b': `0 0 0 6px ${rewards.avatarFrame.glow}, 0 0 36px ${rewards.avatarFrame.glow}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 800, color: 'var(--accent)',
                  letterSpacing: '-0.02em', cursor: 'pointer',
                  transition: 'border 0.4s ease, box-shadow 0.4s ease',
                }}
              >
                {user?.avatarEmoji || user?.name?.[0]?.toUpperCase() || '?'}
              </button>

              {/* Streak emblem — badge bottom-right of avatar */}
              <AnimatePresence>
                {rewards.streakEmblem && (
                  <motion.div
                    key={rewards.streakEmblem.emoji}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      position: 'absolute', bottom: -2, right: -4,
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(12,10,9,0.95)',
                      border: `1.5px solid ${rewards.streakEmblem.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13,
                      boxShadow: `0 0 10px ${rewards.streakEmblem.color}60`,
                    }}
                    title={rewards.streakEmblem.label}
                  >
                    <span className="streak-emblem-animate">
                      {rewards.streakEmblem.emoji}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Name + title + pills */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <input
                  autoFocus
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={() => { updateUser({ name: nameValue.trim() || user?.name }); setEditingName(false) }}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--accent)',
                    fontSize: 22, fontWeight: 800, color: 'var(--text)',
                    padding: '2px 0', outline: 'none', width: '100%',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
              ) : (
                <h2
                  onClick={() => setEditingName(true)}
                  style={{
                    fontSize: 21, fontWeight: 800, color: 'var(--text)',
                    letterSpacing: '-0.02em',
                    display: 'flex', alignItems: 'center', gap: 6,
                    cursor: 'pointer', flexWrap: 'wrap',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {user?.name || 'Atleta'}
                  </span>
                  <Edit3 size={13} color="var(--text3)" style={{ flexShrink: 0 }} />
                </h2>
              )}

              {/* Earned title — unlocked cosmetic */}
              <AnimatePresence mode="wait">
                {rewards.activeTitle ? (
                  <motion.div
                    key={rewards.activeTitle.title}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25 }}
                    style={{ marginTop: 2, marginBottom: 4 }}
                  >
                    <span
                      className={rewards.maxRarity === 'legendary' ? 'title-shimmer' : ''}
                      style={{
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                        color: rewards.maxRarity === 'legendary' ? rewards.activeTitle.color : rewards.activeTitle.color,
                      }}
                    >
                      {rewards.activeTitle.title}
                    </span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="since"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}
                  >
                    Miembro desde {memberSince}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Member since — shown below title when title is present */}
              {rewards.activeTitle && (
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>
                  Desde {memberSince}
                </p>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                <span className="identity-pill">{user?.level || 'Intermedio'}</span>
                <span className="identity-pill">{user?.goal || 'Volumen'}</span>
                {/* Streak pill — shows current streak count */}
                {stats.currentStreak >= 3 && (
                  <span className="identity-pill" style={{
                    background: `${rewards.streakEmblem?.color || '#E8924A'}18`,
                    border: `1px solid ${rewards.streakEmblem?.color || '#E8924A'}40`,
                    color: rewards.streakEmblem?.color || '#E8924A',
                  }}>
                    {rewards.streakEmblem?.emoji || '⚡'} {stats.currentStreak}d
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0 12px' }} />

          {/* Active program */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Programa activo</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{activeProgram?.name || 'Sin programa'} · Semana {weeksSince} de {totalWeeks}</p>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--surface3)', marginTop: 8, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((weeksSince / totalWeeks) * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))' }}
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Objetivo de peso</p>
            {goalWeight && currentWeight ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{currentWeight} kg → {goalWeight} kg · Faltan {goalRemaining?.toFixed(1)} kg{goalWeeks ? ` · ~${goalWeeks} semanas` : ''}</p>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--surface3)', marginTop: 8, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((1 - Math.min(1, goalRemaining / Math.max(1, Math.abs(goalWeight - currentWeight) || 1))) * 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))' }}
                  />
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Sin objetivo · Tap para añadir →</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Section 2 — Lifetime stats */}
      <div ref={statsRef} style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12 }}>Lifetime stats</p>
        <div style={{
          borderRadius: 24,
          background: 'rgba(24,19,12,0.60)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '0.5px solid rgba(255,235,200,0.09)',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.08), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.35)',
          padding: 16,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(232,146,74,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative' }}>
            {[
              { label: 'Sesiones',          value: stats.totalSessions,                                              accent: '#E8924A' },
              { label: 'Volumen total',      value: formatVolumeShort(stats.totalVolume),                            accent: '#34C77B' },
              { label: 'Tiempo total',       value: formatMinutes(sessions.reduce((t, s) => t + (s.duration || 0), 0)), accent: '#E8924A' },
              { label: 'Mejor racha',        value: `${stats.maxStreak}d`,                                           accent: '#D4A843' },
              { label: 'Ejercicios únicos',  value: stats.uniqueExercisesCount ?? stats.uniqueExercises ?? 0,        accent: '#A37FD4' },
              { label: 'Semanas activas',    value: stats.activeWeeks ?? 0,                                          accent: '#34C77B' },
            ].map((item, i) => (
              <StatCard key={item.label} {...item} index={i} />
            ))}
          </div>
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

        <div style={{ display: 'flex', gap: 8 }}>
          {rewards.showcaseBadges.length > 0 ? (
            rewards.showcaseBadges.map(b => (
              <BadgeShowcaseItem key={b.id} badge={b} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1, padding: '18px 14px', borderRadius: 16,
                border: '1px dashed rgba(255,235,200,0.1)',
                background: 'rgba(255,235,200,0.02)',
                color: 'rgba(245,239,230,0.3)', fontSize: 12,
                textAlign: 'center', lineHeight: 1.5,
              }}
            >
              Completa tu primera sesión para desbloquear logros
            </motion.div>
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
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{repRangeLabel || getRepRangeLabel(user?.goal)} ▾</span>
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
        selected={repRangeLabel || getRepRangeLabel(user?.goal)}
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

      <AchievementsModal open={achOpen} onClose={() => setAchOpen(false)} />
    </div>
  )
}
