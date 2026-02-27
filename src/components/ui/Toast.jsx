import { useEffect } from 'react'
import useStore from '../../store/index.js'

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function AlertIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
}
function XIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

const ICONS = {
  success: <CheckIcon />,
  error: <AlertIcon />,
  info: <InfoIcon />,
  pr: <span style={{ fontSize: 15 }}>🏆</span>,
}

export function ToastContainer() {
  const toasts = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)

  return (
    <div style={{
      position: 'fixed', top: 'calc(16px + env(safe-area-inset-top,0px))',
      left: 0, right: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8, padding: '0 16px',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            width: '100%', maxWidth: 380,
            background: 'var(--surface2)',
            border: `1px solid ${toast.type === 'pr' ? 'rgba(245,166,35,0.4)' : toast.type === 'success' ? 'rgba(50,213,131,0.3)' : toast.type === 'error' ? 'rgba(244,96,96,0.3)' : 'var(--border2)'}`,
            borderRadius: 16, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            animation: 'slideInFromRight 0.4s cubic-bezier(0.32,0.72,0,1) both',
          }}
        >
          {ICONS[toast.type] || ICONS.info}
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
            <XIcon />
          </button>
        </div>
      ))}
    </div>
  )
}
