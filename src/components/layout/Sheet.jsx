import { useEffect } from 'react'

function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

export function Sheet({ open, onClose, title, children, fullHeight = false }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
          background: 'var(--surface)',
          borderTop: '1px solid var(--border2)',
          borderLeft: '1px solid var(--border2)',
          borderRight: '1px solid var(--border2)',
          borderRadius: '24px 24px 0 0',
          maxHeight: fullHeight ? '96dvh' : '92dvh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          animation: 'slideInSheet 0.32s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <style>{`
          @keyframes slideInSheet {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
        </div>

        {/* Header */}
        {(title || onClose) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 20px 12px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {title && <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</h2>}
            {onClose && (
              <button onClick={onClose} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', marginLeft: 'auto',
              }}>
                <XIcon />
              </button>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
          {children}
        </div>
      </div>
    </>
  )
}
