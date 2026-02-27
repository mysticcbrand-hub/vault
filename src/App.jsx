import { useState, useEffect, useRef } from 'react'
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

const TABS = ['today', 'history', 'workout', 'progress', 'programs']
const DURATION = 280

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [prevTab, setPrevTab] = useState(null)
  const [direction, setDirection] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [splash, setSplash] = useState(true)
  const contentRef = useRef(null)

  const user = useStore(s => s.user)
  const updateUser = useStore(s => s.updateUser)
  const startWorkout = useStore(s => s.startWorkout)
  const [editName, setEditName] = useState(user.name)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 900)
    return () => clearTimeout(t)
  }, [])

  const handleTabChange = (tab) => {
    if (tab === activeTab || animating) return
    const ci = TABS.indexOf(activeTab)
    const ni = TABS.indexOf(tab)
    setDirection(ni > ci ? 1 : -1)
    setPrevTab(activeTab)
    setActiveTab(tab)
    setAnimating(true)
    setTimeout(() => setAnimating(false), DURATION)
  }

  const handleStartWorkout = (templateId, programId, name) => {
    startWorkout({ templateId, programId, name: name || 'Entrenamiento' })
    handleTabChange('workout')
  }

  if (splash) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'linear-gradient(145deg, #7C6FF7, #5048CC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 48px rgba(124,111,247,0.5)',
          marginBottom: 20,
          animation: 'scaleIn 0.5s cubic-bezier(0.32,0.72,0,1)',
        }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>LV</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 6 }}>LiftVault</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Track the weight. Own the progress.</p>
      </div>
    )
  }

  const tabStyle = (tab) => {
    const isActive = tab === activeTab
    const isExiting = tab === prevTab && animating
    let transform = 'translateX(0)'
    let opacity = 1
    if (isExiting) {
      transform = `translateX(${direction > 0 ? '-40px' : '40px'})`
      opacity = 0
    } else if (isActive && animating) {
      // entering — we use CSS animation
    }
    return {
      position: 'absolute', inset: 0,
      display: isActive || isExiting ? 'block' : 'none',
      transform, opacity,
      transition: `transform ${DURATION}ms cubic-bezier(0.32,0.72,0,1), opacity ${DURATION}ms ease`,
      overflowY: isActive ? 'auto' : 'hidden',
      overflowX: 'hidden',
      animation: isActive && animating
        ? `${direction > 0 ? 'slideInFromRight' : 'slideInFromLeft'} ${DURATION}ms cubic-bezier(0.32,0.72,0,1) both`
        : 'none',
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
      background: 'var(--bg)',
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <ToastContainer />

      {/* Main content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={tabStyle('today')}>
          <TodayTab onStartWorkout={handleStartWorkout} onOpenProfile={() => { setEditName(user.name); setProfileOpen(true) }} />
        </div>
        <div style={tabStyle('workout')}>
          <WorkoutTab />
        </div>
        <div style={tabStyle('history')}>
          <HistoryTab />
        </div>
        <div style={tabStyle('progress')}>
          <ProgressTab />
        </div>
        <div style={tabStyle('programs')}>
          <ProgramsTab />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Profile sheet */}
      <Sheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Mi perfil">
        <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'linear-gradient(145deg, #7C6FF7, #5048CC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(124,111,247,0.3)',
              fontSize: 32, fontWeight: 800, color: 'white',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{user.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>
              LiftVault · Desde {new Date(user.startDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 8 }}>Nombre</p>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Tu nombre"
              className="input-base"
            />
          </div>

          <button
            onClick={() => { updateUser({ name: editName.trim() || user.name }); setProfileOpen(false) }}
            className="pressable btn-shimmer"
            style={{
              width: '100%', height: 52, borderRadius: 14,
              background: 'var(--accent)', border: 'none',
              color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Guardar
          </button>

          <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
            Todos los datos se guardan localmente en tu dispositivo.<br />
            LiftVault no requiere cuenta ni conexión a internet.
          </p>
        </div>
      </Sheet>
    </div>
  )
}
