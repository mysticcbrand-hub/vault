import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function Sheet({ open, onClose, title, children, fullHeight }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const top = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (top) window.scrollTo(0, parseInt(top) * -1)
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — no transform conflict */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            ref={overlayRef}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 80,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Sheet — position with left/right/bottom, NO centering transform */}
          <motion.div
            key="sheet-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40, mass: 1 }}
            style={{
              position: 'fixed',
              left: 0, right: 0, bottom: 0,
              zIndex: 81,
              maxHeight: fullHeight ? '92dvh' : '80dvh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(16,13,9,0.88)',
              backdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
              WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
              borderRadius: '32px 32px 0 0',
              boxShadow: `
                inset 0 1.5px 0 rgba(255,235,200,0.1),
                0 -4px 40px rgba(0,0,0,0.6),
                0 -1px 0 rgba(0,0,0,0.5)
              `,
            }}
          >
        {/* Drag handle */}
        <div style={{
          width: 38, height: 5, borderRadius: 100,
          background: 'rgba(245,239,230,0.18)',
          margin: '12px auto 0',
          flexShrink: 0,
        }} />

        {/* Title */}
        {title && (
          <div style={{
            flexShrink: 0,
            padding: '14px 20px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,235,200,0.07)',
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {title}
            </p>
            <button
              onClick={onClose}
              className="pressable"
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,235,200,0.07)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--text3)', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {children}
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
