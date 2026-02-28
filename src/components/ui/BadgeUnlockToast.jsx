import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BadgeFrame } from './BadgeFrame.jsx'
import { RARITY_STYLES } from '../../data/badges.js'
import useStore from '../../store/index.js'

function BadgeUnlockToastInner({ badge, onDismiss }) {
  const style = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common

  useEffect(() => {
    const t = setTimeout(onDismiss, 4500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return createPortal(
    <motion.div
      key={badge.id}
      initial={{ opacity: 0, y: 80, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 32, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.9 }}
      onClick={onDismiss}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--nav-h, 80px) + 16px)',
        left: 16,
        right: 16,
        zIndex: 900,
        background: 'rgba(14,11,8,0.96)',
        backdropFilter: 'blur(56px) saturate(220%)',
        WebkitBackdropFilter: 'blur(56px) saturate(220%)',
        borderRadius: 'var(--r-lg)',
        padding: '18px 18px 18px 16px',
        boxShadow: [
          'inset 0 1px 0 rgba(255,235,200,0.12)',
          '0 8px 48px rgba(0,0,0,0.75)',
          `0 0 0 1px ${style.glowColor}`,
        ].join(', '),
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Badge visual with burst ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <BadgeFrame badge={badge} size={64} animated />

        {/* Burst ring */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            border: `2px solid ${style.glowColor}`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        {/* Second delayed burst */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
          style={{
            position: 'absolute',
            inset: 0,
            border: `1.5px solid ${style.glowColor}`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: style.labelColor,
          marginBottom: 4,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {style.label} · Logro desbloqueado
        </div>
        <div style={{
          fontSize: 17,
          fontWeight: 800,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: 1.2,
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {badge.name}
        </div>
        <div style={{
          fontSize: 12.5,
          color: 'var(--text2)',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: 1.4,
          fontStyle: 'italic',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {badge.flavor}
        </div>
      </div>
    </motion.div>,
    document.body
  )
}

export function BadgeUnlockToast() {
  const pendingBadgeToast = useStore(s => s.pendingBadgeToast)
  const clearPendingBadgeToast = useStore(s => s.clearPendingBadgeToast)

  return (
    <AnimatePresence>
      {pendingBadgeToast && (
        <BadgeUnlockToastInner
          key={pendingBadgeToast.id}
          badge={pendingBadgeToast}
          onDismiss={clearPendingBadgeToast}
        />
      )}
    </AnimatePresence>
  )
}
