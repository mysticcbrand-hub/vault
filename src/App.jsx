import { useState, useEffect } from 'react'
import { BottomNav } from './components/layout/BottomNav.jsx'
import { TodayTab } from './components/tabs/TodayTab.jsx'
import { WorkoutTab } from './components/tabs/WorkoutTab.jsx'
import { HistoryTab } from './components/tabs/HistoryTab.jsx'
import { ProgressTab } from './components/tabs/ProgressTab.jsx'
import { ProgramsTab } from './components/tabs/ProgramsTab.jsx'
import { Sheet } from './components/layout/Sheet.jsx'
import { ToastContainer } from './components/ui/Toast.jsx'
import useStore from './store/index.js'
import './App.css'

const TABS = ['today','history','workout','progress','programs']
const TAB_GLOWS = {
  today:    'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.10) 0%, transparent 70%)',
  workout:  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.14) 0%, transparent 70%)',
  history:  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.08) 0%, transparent 70%)',
  progress: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(52,199,123,0.08) 0%, transparent 70%)',
  programs: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.06) 0%, transparent 70%)',
}
const DUR = 260

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [prevTab, setPrevTab] = useState(null)
  const [direction, setDirection] = useState(1)
  const [transitioning, setTransitioning] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [splash, setSplash] = useState(true)
  const [offline, setOffline] = useState(!navigator.onLine)

  const user = useStore(s => s.user)
  const updateUser = useStore(s => s.updateUser)
  const startWorkout = useStore(s => s.startWorkout)
  const [editName, setEditName] = useState(user.name)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 900)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const handleTabChange = (tab) => {
    if (tab === activeTab || transitioning) return
    const ci = TABS.indexOf(activeTab), ni = TABS.indexOf(tab)
    setDirection(ni > ci ? 1 : -1)
    setPrevTab(activeTab)
    setActiveTab(tab)
    setTransitioning(true)
    setTimeout(() => setTransitioning(false), DUR)
  }

  const handleStartWorkout = (templateId, programId, name) => {
    startWorkout({ templateId, programId, name: name || 'Entrenamiento' })
    handleTabChange('workout')
  }

  const getTabStyle = (tab) => {
    const isActive = tab === activeTab
    const isExiting = tab === prevTab && transitioning
    if (!isActive && !isExiting) return { display: 'none' }
    return {
      position: 'absolute', inset: 0,
      overflowY: isActive ? 'auto' : 'hidden',
      overflowX: 'hidden',
      animation: isActive && transitioning
        ? `${direction > 0 ? 'tabEnterRight' : 'tabEnterLeft'} ${DUR}ms cubic-bezier(0.32,0.72,0,1) both`
        : isExiting
          ? `${direction > 0 ? 'tabExitRight' : 'tabExitLeft'} ${DUR}ms cubic-bezier(0.32,0.72,0,1) both`
          : 'none',
    }
  }

  if (splash) return (
    <div style={{ position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg)',animation:'fadeIn 0.4s ease' }}>
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:20,animation:'scaleIn 0.5s cubic-bezier(0.32,0.72,0,1)' }}>
        <div style={{ width:80,height:80,borderRadius:22,background:'linear-gradient(145deg,var(--accent),var(--accent-deep))',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 48px var(--accent-glow)' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" stroke="white" strokeWidth="1.5"/>
            <line x1="18" y1="10" x2="18" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="18" x2="26" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="3" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:26,color:'var(--text)',letterSpacing:'-0.03em',lineHeight:1 }}>
            <span style={{ fontWeight:500,color:'var(--text2)' }}>Lift</span><span style={{ fontWeight:800 }}>Vault</span>
          </p>
          <p style={{ fontSize:13,color:'var(--text3)',marginTop:6 }}>Track the weight. Own the progress.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100dvh',overflow:'hidden',background:'var(--bg)',paddingTop:'env(safe-area-inset-top,0px)' }}>
      {/* Background glow */}
      <div className="bg-glow" style={{ background: TAB_GLOWS[activeTab] }} />

      {/* Offline bar */}
      {offline && <div className="offline-bar">SIN CONEXIÓN</div>}

      <ToastContainer />

      {/* Tab content */}
      <div style={{ flex:1,position:'relative',overflow:'hidden',paddingBottom:'var(--nav-h)' }}>
        <div style={getTabStyle('today')}><TodayTab onStartWorkout={handleStartWorkout} onOpenProfile={()=>{setEditName(user.name);setProfileOpen(true)}}/></div>
        <div style={getTabStyle('workout')}><WorkoutTab /></div>
        <div style={getTabStyle('history')}><HistoryTab /></div>
        <div style={getTabStyle('progress')}><ProgressTab /></div>
        <div style={getTabStyle('programs')}><ProgramsTab /></div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Profile sheet */}
      <Sheet open={profileOpen} onClose={()=>setProfileOpen(false)} title="Mi perfil">
        <div style={{ padding:'20px',display:'flex',flexDirection:'column',gap:20 }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'16px 0' }}>
            <div style={{ width:80,height:80,borderRadius:24,background:'linear-gradient(145deg,var(--accent),var(--accent-deep))',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 30px var(--accent-glow)',fontSize:32,fontWeight:800,color:'white' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontSize:18,fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em' }}>{user.name}</p>
            <p style={{ fontSize:12,color:'var(--text3)' }}>Desde {new Date(user.startDate).toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</p>
          </div>
          <div>
            <p className="t-label" style={{ marginBottom:8 }}>Nombre</p>
            <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Tu nombre" className="input"/>
          </div>
          <button onClick={()=>{updateUser({name:editName.trim()||user.name});setProfileOpen(false)}} className="pressable shimmer" style={{ width:'100%',height:52,borderRadius:14,background:'var(--accent)',border:'none',color:'white',fontSize:16,fontWeight:700,cursor:'pointer' }}>
            Guardar
          </button>
          <p style={{ fontSize:12,color:'var(--text3)',textAlign:'center',lineHeight:1.6 }}>
            Datos guardados localmente · Sin cuenta · Sin conexión
          </p>
        </div>
      </Sheet>
    </div>
  )
}
