import { useEffect, memo } from 'react'
import { X } from 'lucide-react'

export const Sheet = memo(function Sheet({ open, onClose, title, children, fullHeight = false }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:50,
          background:'rgba(0,0,0,0.65)',
          animation:'fadeIn 0.25s ease',
        }}
      />
      <div
        className="glass-sheet"
        style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:51,
          borderTop:'1px solid rgba(255,255,255,0.09)',
          borderLeft:'1px solid rgba(255,255,255,0.06)',
          borderRight:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'24px 24px 0 0',
          maxHeight: fullHeight ? '96dvh' : '92dvh',
          display:'flex', flexDirection:'column',
          boxShadow:'0 -8px 48px rgba(0,0,0,0.5)',
          animation:'sheetIn 0.38s cubic-bezier(0.32,0.72,0,1) both',
        }}
      >
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 2px',flexShrink:0}}>
          <div style={{width:36,height:4,borderRadius:2,background:'var(--border2)'}} />
        </div>
        {(title||onClose) && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 20px 14px', flexShrink:0,
            borderBottom:'1px solid var(--border)',
          }}>
            {title && <h2 style={{fontSize:17,fontWeight:700,color:'var(--text)',letterSpacing:'-0.01em'}}>{title}</h2>}
            {onClose && (
              <button onClick={onClose} className="pressable" style={{
                width:30,height:30,borderRadius:'50%',
                background:'var(--surface3)',border:'1px solid var(--border)',
                display:'flex',alignItems:'center',justifyContent:'center',
                cursor:'pointer',marginLeft:'auto',
              }}>
                <X size={14} color="var(--text2)" />
              </button>
            )}
          </div>
        )}
        <div style={{flex:1,overflowY:'auto',paddingBottom:'env(safe-area-inset-bottom,16px)'}}>
          {children}
        </div>
      </div>
    </>
  )
})
