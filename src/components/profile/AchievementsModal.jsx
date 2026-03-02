import { useState, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { X, ChevronRight, Lock } from 'lucide-react'
import { BadgeFrame } from '../ui/BadgeFrame.jsx'
import { ALL_BADGES, RARITY_STYLES, CATEGORY_LABELS } from '../../data/badges.js'
import useStore from '../../store/index.js'
import { calculateUserStats } from '../../utils/userStats.js'

// ─── Flip animation config por rareza ────────────────────────────────────────
// Filosofía: el flip debe sentirse como una moneda/chapa de metal real.
// Aceleración rápida, deceleración larga y suave. Nunca mecánico.
const FLIP_CONFIG = {
  common: {
    // Flip limpio, directo. Como girar una moneda de cobre.
    keyframes: [
      { ry: 0,   scale: 1,    z: 0  },
      { ry: 90,  scale: 0.92, z: 8  }, // punto muerto — se aplana
      { ry: 180, scale: 1.06, z: 16 }, // emerge al otro lado — leve overshoot
      { ry: 270, scale: 0.96, z: 8  }, // vuelta al centro
      { ry: 360, scale: 1,    z: 0  }, // reposo
    ],
    duration: 0.78,
    ease: [0.25, 0.1, 0.15, 1],
    glowOpacity: 0,
    burst: false,
  },
  rare: {
    // Algo más vivo. Como una chapa de acero bruñido.
    keyframes: [
      { ry: 0,   scale: 1,    z: 0  },
      { ry: 90,  scale: 0.88, z: 12 },
      { ry: 180, scale: 1.10, z: 20 },
      { ry: 270, scale: 0.94, z: 12 },
      { ry: 360, scale: 1,    z: 0  },
    ],
    duration: 0.88,
    ease: [0.22, 1, 0.2, 1],
    glowOpacity: 0.4,
    burst: false,
  },
  epic: {
    // Pesado y poderoso. Como una medalla de campeonato.
    keyframes: [
      { ry: 0,   scale: 1,    z: 0  },
      { ry: 90,  scale: 0.84, z: 16 },
      { ry: 180, scale: 1.14, z: 24 },
      { ry: 270, scale: 0.92, z: 16 },
      { ry: 360, scale: 1,    z: 0  },
    ],
    duration: 0.96,
    ease: [0.22, 1, 0.18, 1],
    glowOpacity: 0.65,
    burst: false,
  },
  legendary: {
    // Doble flip. Primera vuelta rápida, segunda más lenta y solemne.
    // Como una moneda de oro que gira dos veces antes de caer perfecta.
    keyframes: [
      { ry: 0,   scale: 1,    z: 0  },
      { ry: 90,  scale: 0.82, z: 14 },
      { ry: 180, scale: 1.18, z: 28 }, // primer peak
      { ry: 270, scale: 0.88, z: 14 },
      { ry: 360, scale: 1.04, z: 0  }, // micro-rebote entre vueltas
      { ry: 450, scale: 0.90, z: 10 },
      { ry: 540, scale: 1.22, z: 26 }, // segundo peak — más alto
      { ry: 630, scale: 0.96, z: 10 },
      { ry: 720, scale: 1,    z: 0  }, // reposo solemne
    ],
    duration: 1.4,
    ease: [0.22, 1, 0.15, 1],
    glowOpacity: 1,
    burst: true,
  },
}

// Burst de partículas para legendarios
function LegendaryBurst({ color, active }) {
  const SPARKS = 8
  return (
    <AnimatePresence>
      {active && Array.from({ length: SPARKS }).map((_, i) => {
        const angle = (360 / SPARKS) * i
        const rad = (angle * Math.PI) / 180
        const dist = 38
        const tx = Math.cos(rad) * dist
        const ty = Math.sin(rad) * dist
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 4, height: 4,
              borderRadius: '50%',
              background: color,
              marginTop: -2, marginLeft: -2,
              pointerEvents: 'none',
              zIndex: 20,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
            exit={{}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.015 }}
          />
        )
      })}
    </AnimatePresence>
  )
}

// Ring de onda expansiva para legendarios
function ShockRing({ color, active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 52, height: 52,
            marginTop: -26, marginLeft: -26,
            borderRadius: '50%',
            border: `1.5px solid ${color}`,
            pointerEvents: 'none',
            zIndex: 15,
          }}
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          exit={{}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

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

// ─── Badge grid item con flip animation ──────────────────────────────────────
function BadgeGridItem({ badge, unlocked, unlockedAt, stats, onTap }) {
  const style    = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common
  const cfg      = FLIP_CONFIG[badge.rarity]   ?? FLIP_CONFIG.common
  const prog     = badge.progress?.(stats)
  const pct      = prog ? Math.min(100, Math.round((prog.current / prog.total) * 100)) : null
  const controls = useAnimation()
  const isFlipping = useRef(false)
  const [bursting, setBursting] = useState(false)
  const [glowing,  setGlowing]  = useState(false)

  const handleTap = useCallback(async () => {
    if (isFlipping.current) return
    isFlipping.current = true

    if (cfg.glowOpacity > 0) setGlowing(true)

    if (cfg.burst) {
      // Burst al punto medio de la primera vuelta
      setTimeout(() => {
        setBursting(true)
        setTimeout(() => setBursting(false), 700)
      }, cfg.duration * 1000 * 0.3)
    }

    // Extraer keyframes tipados
    const kf = cfg.keyframes
    const n  = kf.length
    const times = kf.map((_, i) => i / (n - 1))

    await controls.start({
      rotateY:    kf.map(k => k.ry),
      scale:      kf.map(k => k.scale),
      translateZ: kf.map(k => k.z),
      transition: {
        duration: cfg.duration,
        ease: cfg.ease,
        times,
      },
    })

    controls.set({ rotateY: 0, scale: 1, translateZ: 0 })
    if (cfg.glowOpacity > 0) setGlowing(false)
    isFlipping.current = false

    onTap(badge, unlockedAt)
  }, [controls, cfg, badge, unlockedAt, onTap])

  return (
    <div
      onClick={handleTap}
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
        // Perspective en el padre para que el rotateY tenga profundidad real
        perspective: 400,
        WebkitPerspective: 400,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Glow flash — se expande y desaparece */}
      <AnimatePresence>
        {glowing && (
          <motion.div
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: 'var(--r)',
              background: `radial-gradient(ellipse, ${style.glowColor} 0%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: cfg.glowOpacity, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Shock ring — solo legendary */}
      {unlocked && badge.rarity === 'legendary' && (
        <ShockRing color={style.iconColor} active={bursting} />
      )}

      {/* Burst de partículas — solo legendary */}
      {unlocked && badge.rarity === 'legendary' && (
        <LegendaryBurst color={style.iconColor} active={bursting} />
      )}

      {/* El badge con el flip */}
      <motion.div
        animate={controls}
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <BadgeFrame badge={badge} size={52} locked={!unlocked} animated={unlocked} />
      </motion.div>

      <span style={{
        fontSize: 10.5, fontWeight: 600,
        color: unlocked ? 'var(--text)' : 'var(--text3)',
        textAlign: 'center', lineHeight: 1.3,
        maxWidth: '100%', overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        position: 'relative', zIndex: 10,
      }}>
        {badge.name}
      </span>

      {/* Progress bar */}
      {!unlocked && pct !== null && pct > 0 && (
        <div style={{ width: '85%', height: 2, borderRadius: 1, background: 'var(--surface3)', position: 'relative', zIndex: 10 }}>
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
          zIndex: 10,
        }}/>
      )}

      {/* Lock */}
      {!unlocked && pct === null && (
        <Lock size={9} color="var(--text3)" style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} />
      )}
    </div>
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
