import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Lock } from 'lucide-react'
import { BadgeFrame } from '../ui/BadgeFrame.jsx'
import { ALL_BADGES, RARITY_STYLES, CATEGORY_LABELS } from '../../data/badges.js'
import useStore from '../../store/index.js'
import { calculateUserStats } from '../../utils/userStats.js'

const CATEGORIES = ['all', 'milestones', 'consistency', 'sessions', 'volume', 'strength', 'exploration', 'mastery']
const CAT_LABELS = { all: 'Todos', ...CATEGORY_LABELS }

// ─── Badge detail sheet ───────────────────────────────────────────────────────
function BadgeDetail({ badge, unlocked, unlockedAt, stats, onClose }) {
  const style = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common
  const prog = badge.progress?.(stats)
  const pct = prog ? Math.min(100, Math.round((prog.current / prog.total) * 100)) : null

  return createPortal(
    <>
      <motion.div
        key="bd-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 310, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      />
      <motion.div
        key="bd-sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 1 }}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 311,
          background: 'rgba(14,11,8,0.96)',
          backdropFilter: 'blur(56px) saturate(220%)',
          WebkitBackdropFilter: 'blur(56px) saturate(220%)',
          borderRadius: '28px 28px 0 0',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.7)',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '14px auto 0' }}/>

        {/* Content */}
        <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Badge visual */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <BadgeFrame badge={badge} size={96} locked={!unlocked} animated={unlocked} />
            {/* Ambient glow for unlocked */}
            {unlocked && (
              <div style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                background: `radial-gradient(ellipse, ${style.glowColor} 0%, transparent 65%)`,
                pointerEvents: 'none', zIndex: -1,
              }}/>
            )}
          </div>

          {/* Rarity label */}
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: style.labelColor,
            marginBottom: 8,
          }}>
            {style.label}
          </div>

          {/* Name */}
          <h2 style={{
            fontSize: 24, fontWeight: 800, color: 'var(--text)',
            letterSpacing: '-0.03em', textAlign: 'center',
            marginBottom: 10, lineHeight: 1.15,
          }}>
            {badge.name}
          </h2>

          {/* Flavor */}
          <p style={{
            fontSize: 14, color: 'var(--text2)', textAlign: 'center',
            fontStyle: 'italic', lineHeight: 1.55, marginBottom: 20,
            maxWidth: 280,
          }}>
            "{badge.flavor}"
          </p>

          {/* Divider */}
          <div style={{ width: '100%', height: 0.5, background: 'var(--border)', marginBottom: 20 }}/>

          {/* Description */}
          <div style={{ width: '100%', marginBottom: prog ? 16 : 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Condición
            </p>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
              {badge.description}
            </p>
          </div>

          {/* Progress bar */}
          {prog && !unlocked && (
            <div style={{ width: '100%', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>Progreso</p>
                <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'DM Mono, monospace' }}>
                  {Math.round(prog.current).toLocaleString('es-ES')} / {Math.round(prog.total).toLocaleString('es-ES')}
                </p>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--surface3)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
                  transition: 'width 1s cubic-bezier(0.32,0.72,0,1)',
                }}/>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, textAlign: 'right' }}>{pct}% completado</p>
            </div>
          )}

          {/* Unlocked date */}
          {unlocked && unlockedAt && (
            <div style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              background: 'rgba(52,199,123,0.08)', border: '0.5px solid rgba(52,199,123,0.2)',
              marginTop: 4,
            }}>
              <p style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                ✓ Conseguido el {new Date(unlockedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Locked state hint */}
          {!unlocked && !prog && (
            <div style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,235,200,0.04)', border: '0.5px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
            }}>
              <Lock size={14} color="var(--text3)" />
              <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Aún sin desbloquear</p>
            </div>
          )}
        </div>
      </motion.div>
    </>,
    document.body
  )
}

// ─── Badge grid item ──────────────────────────────────────────────────────────
function BadgeGridItem({ badge, unlocked, unlockedAt, stats, onTap }) {
  const style = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common
  const prog = badge.progress?.(stats)
  const pct = prog ? Math.min(100, Math.round((prog.current / prog.total) * 100)) : null

  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      onClick={() => onTap(badge, unlockedAt)}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8,
        padding: '14px 6px 12px',
        borderRadius: 'var(--r)',
        background: unlocked ? 'rgba(20,17,12,0.72)' : 'rgba(14,12,8,0.45)',
        border: `0.5px solid ${unlocked ? 'var(--border2)' : 'var(--border)'}`,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: unlocked ? 'inset 0 1px 0 rgba(255,235,200,0.06)' : 'none',
      }}
    >
      <BadgeFrame badge={badge} size={52} locked={!unlocked} animated={unlocked} />

      <span style={{
        fontSize: 10.5, fontWeight: 600,
        color: unlocked ? 'var(--text)' : 'var(--text3)',
        textAlign: 'center', lineHeight: 1.3,
        maxWidth: '100%', overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {badge.name}
      </span>

      {/* Progress bar for locked badges */}
      {!unlocked && pct !== null && pct > 0 && (
        <div style={{ width: '85%', height: 2, borderRadius: 1, background: 'var(--surface3)' }}>
          <div style={{
            height: '100%', borderRadius: 1,
            width: `${pct}%`,
            background: 'var(--accent)',
            transition: 'width 0.8s ease',
          }}/>
        </div>
      )}

      {/* Rarity dot */}
      {unlocked && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: style.iconColor,
          boxShadow: `0 0 4px ${style.iconColor}`,
        }}/>
      )}

      {/* Lock icon for completely unknown badges */}
      {!unlocked && pct === null && (
        <Lock size={9} color="var(--text3)" style={{ position: 'absolute', top: 8, right: 8 }} />
      )}
    </motion.div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function AchievementsModal({ open, onClose }) {
  const [category, setCategory] = useState('all')
  const [detailBadge, setDetailBadge] = useState(null)
  const [detailUnlockedAt, setDetailUnlockedAt] = useState(null)

  const sessions    = useStore(s => s.sessions)
  const bodyMetrics = useStore(s => s.bodyMetrics)
  const user        = useStore(s => s.user)
  const programs    = useStore(s => s.programs)
  const prs         = useStore(s => s.prs)
  const unlockedBadges = useStore(s => s.unlockedBadges)

  const stats = useMemo(() =>
    calculateUserStats(sessions, bodyMetrics, user, programs, prs),
    [sessions, bodyMetrics, user, programs, prs]
  )

  const unlockedMap = useMemo(() => {
    const m = {}
    ;(unlockedBadges || []).forEach(b => { m[b.id] = b.unlockedAt })
    return m
  }, [unlockedBadges])

  const filteredBadges = useMemo(() => {
    const list = category === 'all' ? ALL_BADGES : ALL_BADGES.filter(b => b.category === category)
    const unlocked = list.filter(b => unlockedMap[b.id])
      .sort((a, b) => new Date(unlockedMap[b.id]) - new Date(unlockedMap[a.id]))
    const locked = list.filter(b => !unlockedMap[b.id])
    // Sort locked: those with progress > 0 first, then by rarity
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
    locked.sort((a, b) => {
      const pa = a.progress?.(stats)
      const pb = b.progress?.(stats)
      const pctA = pa ? (pa.current / pa.total) : 0
      const pctB = pb ? (pb.current / pb.total) : 0
      if (pctA !== pctB) return pctB - pctA
      return (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
    })
    return { unlocked, locked }
  }, [category, unlockedMap, stats])

  const totalUnlocked = unlockedBadges?.length ?? 0
  const totalBadges = ALL_BADGES.length

  const handleTap = (badge, unlockedAt) => {
    setDetailBadge(badge)
    setDetailUnlockedAt(unlockedAt ?? null)
  }

  if (open === false) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="ach-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      />

      <motion.div
        key="ach-sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 42, mass: 1 }}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
          height: '94dvh',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(13,10,7,0.97)',
          backdropFilter: 'blur(56px) saturate(220%)',
          WebkitBackdropFilter: 'blur(56px) saturate(220%)',
          borderRadius: '32px 32px 0 0',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '12px auto 0', flexShrink: 0 }}/>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 10px', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1 }}>Logros</h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3, fontWeight: 500 }}>
              {totalUnlocked} de {totalBadges} conseguidos · {Math.round((totalUnlocked / totalBadges) * 100)}%
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,235,200,0.07)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text2)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--surface3)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((totalUnlocked / totalBadges) * 100)}%` }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
              style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
              }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div style={{
          overflowX: 'auto', display: 'flex', gap: 6,
          padding: '0 20px 12px', flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '7px 14px', borderRadius: 'var(--r-pill)',
                whiteSpace: 'nowrap', flexShrink: 0,
                background: category === cat ? 'var(--accent-dim)' : 'var(--surface2)',
                border: `1px solid ${category === cat ? 'var(--accent-border)' : 'var(--border)'}`,
                color: category === cat ? 'var(--accent)' : 'var(--text2)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>

        <div style={{ height: 0.5, background: 'var(--border)', flexShrink: 0 }}/>

        {/* Badge grid */}
        <div style={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
          padding: '16px 16px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}>
          {/* Unlocked section */}
          {filteredBadges.unlocked.length > 0 && (
            <>
              {filteredBadges.locked.length > 0 && (
                <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Desbloqueados · {filteredBadges.unlocked.length}
                </p>
              )}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                marginBottom: filteredBadges.locked.length > 0 ? 20 : 0,
              }}>
                {filteredBadges.unlocked.map(badge => (
                  <BadgeGridItem
                    key={badge.id}
                    badge={badge}
                    unlocked
                    unlockedAt={unlockedMap[badge.id]}
                    stats={stats}
                    onTap={handleTap}
                  />
                ))}
              </div>
            </>
          )}

          {/* Locked section */}
          {filteredBadges.locked.length > 0 && (
            <>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
                Por conseguir · {filteredBadges.locked.length}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {filteredBadges.locked.map(badge => (
                  <BadgeGridItem
                    key={badge.id}
                    badge={badge}
                    unlocked={false}
                    unlockedAt={null}
                    stats={stats}
                    onTap={handleTap}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Badge detail sheet */}
      <AnimatePresence>
        {detailBadge && (
          <BadgeDetail
            key={detailBadge.id}
            badge={detailBadge}
            unlocked={!!unlockedMap[detailBadge.id]}
            unlockedAt={detailUnlockedAt}
            stats={stats}
            onClose={() => { setDetailBadge(null); setDetailUnlockedAt(null) }}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>,
    document.body
  )
}
