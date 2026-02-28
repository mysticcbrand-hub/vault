import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

const HEIGHTS = {
  small:  '35vh',
  medium: '60vh',
  large:  '80vh',
  full:   '92vh',
}

/**
 * Universal bottom sheet — portal to document.body
 * Swipe-down-to-dismiss, body scroll lock, glassmorphism surface.
 */
export function Sheet({ isOpen, onClose, size = 'medium', title, children, dismissable = true }) {
  const sheetRef = useRef(null)
  const backdropRef = useRef(null)
  const dragStartY = useRef(null)
  const isDragging = useRef(false)
  const DISMISS_THRESHOLD = 80

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY
    isDragging.current = true
  }
  const handleTouchMove = (e) => {
    if (!isDragging.current || !sheetRef.current) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta < 0) return
    sheetRef.current.style.transform = `translateY(${delta}px)`
    sheetRef.current.style.transition = 'none'
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(1 - Math.min(delta / 200, 1) * 0.6)
    }
  }
  const handleTouchEnd = (e) => {
    if (!isDragging.current || !sheetRef.current) return
    isDragging.current = false
    const delta = e.changedTouches[0].clientY - dragStartY.current
    if (delta > DISMISS_THRESHOLD) {
      sheetRef.current.style.transition = 'transform 0.28s cubic-bezier(0.32,0.72,0,1)'
      sheetRef.current.style.transform = 'translateY(100%)'
      setTimeout(() => onClose?.(), 280)
    } else {
      sheetRef.current.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)'
      sheetRef.current.style.transform = 'translateY(0)'
      if (backdropRef.current) {
        backdropRef.current.style.transition = 'opacity 0.3s ease'
        backdropRef.current.style.opacity = '1'
      }
    }
    dragStartY.current = null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="sheet-backdrop"
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={dismissable ? onClose : undefined}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            key="sheet-panel"
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 1 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1001,
              maxHeight: HEIGHTS[size],
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '28px 28px 0 0',
              background: 'rgba(18,15,11,0.97)',
              backdropFilter: 'blur(56px) saturate(220%) brightness(1.06)',
              WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.06)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.10), 0 -8px 48px rgba(0,0,0,0.6)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
              overflow: 'hidden',
            }}
          >
            {/* Drag handle — touch target for swipe-to-dismiss */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ padding: '0 0 8px', cursor: 'grab', flexShrink: 0 }}
            >
              <div style={{
                width: 36, height: 5, borderRadius: 100,
                background: 'rgba(245,239,230,0.18)',
                margin: '12px auto 0',
              }} />
            </div>

            {/* Header */}
            {title && (
              <div style={{
                padding: '16px 20px 12px',
                borderBottom: '0.5px solid rgba(255,235,200,0.07)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#F5EFE6' }}>
                  {title}
                </span>
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(255,235,200,0.08)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(245,239,230,0.5)',
                    fontSize: 16, lineHeight: 1,
                    fontFamily: 'inherit',
                  }}
                >×</button>
              </div>
            )}

            {/* Scrollable content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              padding: '16px 20px',
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

/**
 * ConfirmDialog — centered modal for destructive actions
 */
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', confirmDestructive = false }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.70)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <motion.div
            key="dialog-panel"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              width: 'calc(100vw - 48px)',
              maxWidth: 340,
              borderRadius: 24,
              background: 'rgba(22,18,12,0.97)',
              backdropFilter: 'blur(56px) saturate(200%)',
              WebkitBackdropFilter: 'blur(56px) saturate(200%)',
              boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.10), 0 24px 80px rgba(0,0,0,0.70)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#F5EFE6', marginBottom: 8 }}>
                {title}
              </div>
              {message && (
                <div style={{ fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5 }}>
                  {message}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', borderTop: '0.5px solid rgba(255,235,200,0.08)', marginTop: 20 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, height: 52,
                  background: 'none', border: 'none',
                  borderRight: '0.5px solid rgba(255,235,200,0.08)',
                  color: 'rgba(245,239,230,0.6)',
                  fontSize: 15, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Cancelar</button>
              <button
                onClick={() => { onConfirm?.(); onClose?.() }}
                style={{
                  flex: 1, height: 52,
                  background: 'none', border: 'none',
                  color: confirmDestructive ? '#E5534B' : '#E8924A',
                  fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >{confirmLabel}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * OptionPicker — iOS-style action sheet for selecting from a list
 */
export function OptionPicker({ isOpen, onClose, title, options, selected, onSelect }) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} size="small" title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); onClose() }}
            style={{
              width: '100%', height: 52, borderRadius: 14,
              background: selected === opt.value ? 'rgba(232,146,74,0.14)' : 'rgba(255,235,200,0.04)',
              border: `1px solid ${selected === opt.value ? 'rgba(232,146,74,0.35)' : 'rgba(255,235,200,0.07)'}`,
              color: selected === opt.value ? '#E8924A' : '#F5EFE6',
              fontSize: 15, fontWeight: selected === opt.value ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 18px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{opt.label}</span>
            {selected === opt.value && <span style={{ color: '#E8924A', fontSize: 16 }}>✓</span>}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
