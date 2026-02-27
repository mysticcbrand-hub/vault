import useStore from '../../store/index.js'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export function ToastContainer() {
  const toasts = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)
  return (
    <div style={{ position:'fixed',top:'calc(16px + env(safe-area-inset-top,0px))',left:0,right:0,zIndex:999,display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'0 16px',pointerEvents:'none' }}>
      {toasts.map(toast => (
        <div key={toast.id} style={{
          pointerEvents:'auto', width:'100%', maxWidth:380,
          background:'var(--surface2)',
          border:`1px solid ${toast.type==='pr'?'rgba(245,166,35,0.35)':toast.type==='success'?'rgba(62,207,142,0.25)':toast.type==='error'?'rgba(229,83,75,0.25)':'var(--border2)'}`,
          borderRadius:16, padding:'12px 14px',
          display:'flex', alignItems:'center', gap:10,
          boxShadow: toast.type==='pr'?'0 4px 20px rgba(245,166,35,0.3)':'0 8px 32px rgba(0,0,0,0.5)',
          animation:'slideInRight 0.38s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {toast.type==='success'?<CheckCircle size={16} color="var(--green)"/>:
           toast.type==='error'?<AlertCircle size={16} color="var(--red)"/>:
           toast.type==='pr'?<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--amber)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>:
           <Info size={16} color="var(--accent)"/>}
          <span style={{ flex:1,fontSize:14,fontWeight:500,color:'var(--text)' }}>{toast.message}</span>
          <button onClick={()=>removeToast(toast.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:2,display:'flex' }}>
            <X size={13} color="var(--text3)"/>
          </button>
        </div>
      ))}
    </div>
  )
}
