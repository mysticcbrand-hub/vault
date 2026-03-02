import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { X, Lock } from 'lucide-react'
import { BadgeFrame } from '../ui/BadgeFrame.jsx'
import { ALL_BADGES, RARITY_STYLES, CATEGORY_LABELS } from '../../data/badges.js'
import useStore from '../../store/index.js'
import { calculateUserStats } from '../../utils/userStats.js'

// ─── Flip config por rareza ───────────────────────────────────────────────────
// Filosofía Apple: spring física real, no easing por keyframes.
// El spring hace que la moneda acelere orgánicamente y frene por inercia.
// Cada rareza tiene su propia "masa" y "rigidez" — se siente diferente.
const FLIP_CONFIG = {
  common: {
    // Moneda ligera — flip ágil y limpio
    spring: { stiffness: 200, damping: 22, mass: 0.8 },
    degrees: 360,
    scalePeak: 1.06,
    glowOpacity: 0,
    burst: false,
    glowColor: null,
  },
  rare: {
    // Chapa de acero — un poco más de inercia
    spring: { stiffness: 180, damping: 20, mass: 1.0 },
    degrees: 360,
    scalePeak: 1.10,
    glowOpacity: 0.5,
    burst: false,
    glowColor: null,
  },
  epic: {
    // Medalla pesada — arranca fuerte, frena despacio
    spring: { stiffness: 160, damping: 18, mass: 1.2 },
    degrees: 360,
    scalePeak: 1.14,
    glowOpacity: 0.7,
    burst: false,
    glowColor: null,
  },
  legendary: {
    // Moneda de oro — doble vuelta completa, muy suave al frenar
    spring: { stiffness: 130, damping: 16, mass: 1.5 },
    degrees: 720,
    scalePeak: 1.18,
    glowOpacity: 1,
    burst: true,
    glowColor: null,
  },
}

// ─── Partículas burst — solo legendary ───────────────────────────────────────
// 6 sparks de diferentes tamaños y distancias para variedad orgánica
const SPARKS = [
  { angle: 0,   dist: 36, size: 3.5, delay: 0    },
  { angle: 60,  dist: 32, size: 2.5, delay: 0.02 },
  { angle: 120, dist: 38, size: 3,   delay: 0.01 },
  { angle: 180, dist: 34, size: 2.5, delay: 0.03 },
  { angle: 240, dist: 37, size: 3,   delay: 0.01 },
  { angle: 300, dist: 31, size: 2,   delay: 0.02 },
  { angle: 30,  dist: 28, size: 2,   delay: 0.04 },
  { angle: 150, dist: 30, size: 2.5, delay: 0.02 },
]

function LegendaryBurst({ color, active }) {
  return (
    <AnimatePresence>
      {active && SPARKS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: color,
              marginTop: -s.size / 2,
              marginLeft: -s.size / 2,
              pointerEvents: 'none',
              zIndex: 20,
              boxShadow: `0 0 ${s.size * 2}px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
            animate={{
              x: Math.cos(rad) * s.dist,
              y: Math.sin(rad) * s.dist,
              opacity: 0,
              scale: 0,
            }}
            exit={{}}
            transition={{
              duration: 0.52,
              ease: [0.2, 0, 0.2, 1],
              delay: s.delay,
            }}
          />
        )
      })}
    </AnimatePresence>
  )
}

// Ring expansiva — aparece y se disuelve
function ShockRing({ color, active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 54, height: 54,
            marginTop: -27, marginLeft: -27,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            pointerEvents: 'none',
            zIndex: 15,
          }}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.4, opacity: 0 }}
          exit={{}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </AnimatePresence>
  )
}

const CATEGORIES = ['all', 'milestones', 'consistency', 'sessions', 'volume', 'strength', 'exploration', 'mastery']
const CAT_LABELS = { all: 'Todos', ...CATEGORY_LABELS }

// ─── Badge detail sheet — con flip animation al entrar ───────────────────────
function BadgeDetail({ badge, unlocked, unlockedAt, stats, onClose }) {
  const style    = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common
  const cfg      = FLIP_CONFIG[badge.rarity]   ?? FLIP_CONFIG.common
  const prog     = badge.progress?.(stats)
  const pct      = prog ? Math.min(100, Math.round((prog.current / prog.total) * 100)) : null
  const flipCtrl  = useAnimation()
  const scaleCtrl = useAnimation()
  const [bursting, setBursting] = useState(false)

  // Dispara el flip cuando el sheet termina de entrar
  useEffect(() => {
    if (!unlocked) return
    // Pequeño delay para que el sheet esté completamente visible
    const t = setTimeout(async () => {
      if (cfg.burst) {
        const burstDelay = cfg.degrees === 720 ? 280 : 160
        setTimeout(() => {
          setBursting(true)
          setTimeout(() => setBursting(false), 700)
        }, burstDelay)
      }
      await Promise.all([
        flipCtrl.start({
          rotateY: cfg.degrees,
          transition: { type: 'spring', ...cfg.spring, restDelta: 0.5, restSpeed: 0.5 },
        }),
        scaleCtrl.start({
          scale: [1, cfg.scalePeak, 1],
          transition: {
            duration: cfg.degrees === 720 ? 1.1 : 0.65,
            ease: [0.34, 1.2, 0.64, 1],
            times: [0, 0.45, 1],
          },
        }),
      ])
      flipCtrl.set({ rotateY: 0 })
      scaleCtrl.set({ scale: 1 })
    }, 320)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

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
          {/* Badge visual con flip */}
          <div style={{ marginBottom: 20, position: 'relative', perspective: 600, WebkitPerspective: 600 }}>
            {/* Glow ambient */}
            {unlocked && (
              <div style={{
                position: 'absolute', inset: -24, borderRadius: '50%',
                background: `radial-gradient(ellipse, ${style.glowColor} 0%, transparent 65%)`,
                pointerEvents: 'none', zIndex: -1,
              }}/>
            )}
            {/* Shock ring legendary */}
            {unlocked && badge.rarity === 'legendary' && (
              <ShockRing color={style.iconColor} active={bursting} />
            )}
            {/* Sparks legendary */}
            {unlocked && badge.rarity === 'legendary' && (
              <LegendaryBurst color={style.iconColor} active={bursting} />
            )}
            {/* Badge con flip */}
            <motion.div animate={scaleCtrl} style={{ display: 'inline-block' }}>
              <motion.div
                animate={flipCtrl}
                style={{
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  willChange: 'transform',
                  display: 'block',
                }}
              >
                <BadgeFrame badge={badge} size={96} locked={!unlocked} animated={unlocked} />
              </motion.div>
            </motion.div>
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

// ─── Badge grid item — press feedback limpio, flip en el sheet ───────────────
function BadgeGridItem({ badge, unlocked, unlockedAt, stats, onTap }) {
  const style = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common
  const prog  = badge.progress?.(stats)
  const pct   = prog ? Math.min(100, Math.round((prog.current / prog.total) * 100)) : null

  return (
    <motion.div
      onTap={() => onTap(badge, unlockedAt)}
      whileTap={{ scale: 0.94, transition: { duration: 0.1, ease: [0.32, 0.72, 0, 1] } }}
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
        userSelect: 'none', WebkitUserSelect: 'none',
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

      {/* Progress bar */}
      {!unlocked && pct !== null && pct > 0 && (
        <div style={{ width: '85%', height: 2, borderRadius: 1, background: 'var(--surface3)' }}>
          <div style={{ height: '100%', borderRadius: 1, width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.8s ease' }}/>
        </div>
      )}

      {/* Rarity dot */}
      {unlocked && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: style.iconColor,
          boxShadow: `0 0 5px ${style.iconColor}`,
        }}/>
      )}

      {/* Lock */}
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
