import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { SplashScreen } from './components/SplashScreen.jsx'
import { FocusMode } from './components/workout/FocusMode.jsx'
import { BottomNav } from './components/layout/BottomNav.jsx'
import Onboarding from './components/Onboarding.jsx'
import { TodayTab } from './components/tabs/TodayTab.jsx'
import { WorkoutTab } from './components/tabs/WorkoutTab.jsx'
import { HistoryTab } from './components/tabs/HistoryTab.jsx'
import { ProgressTab } from './components/tabs/ProgressTab.jsx'
import { ProgramsTab } from './components/tabs/ProgramsTab.jsx'
import { ProfileTab } from './components/tabs/ProfileTab.jsx'
import { Sheet } from './components/ui/Sheet.jsx'
import { ToastContainer } from './components/ui/Toast.jsx'
import { BadgeUnlockToast } from './components/ui/BadgeUnlockToast.jsx'
import { useBadgeDetection } from './hooks/useBadgeDetection.js'
import useStore from './store/index.js'
import './App.css'

const TABS = ['today', 'history', 'workout', 'progress', 'programs', 'profile']
const TAB_GLOWS = {
  today:    'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.10) 0%, transparent 70%)',
  workout:  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.14) 0%, transparent 70%)',
  history:  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.08) 0%, transparent 70%)',
  progress: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(52,199,123,0.08) 0%, transparent 70%)',
  programs: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,146,74,0.06) 0%, transparent 70%)',
  profile:  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(163,127,212,0.07) 0%, transparent 70%)',
}
const DUR = 260

// GRAW SVG mark — inline for zero network dependency
function GrawMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="12" fill="rgba(232,146,74,0.12)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="rgba(232,146,74,0.3)" strokeWidth="1" />
      <text
        x="50%" y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="DM Sans, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#E8924A"
        letterSpacing="-1"
      >G</text>
    </svg>
  )
}

// (SplashScreen is now imported from ./components/SplashScreen.jsx)

// Recovery sheet — shown when app restarts with an orphaned workout session
function RecoverySheet({ elapsed, onContinue, onDiscard }) {
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  const timeStr = `${m}:${String(s).padStart(2, '0')}`

  return createPortal(
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500 }}
      />
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 501,
          background: 'rgba(16,13,9,0.88)',
          backdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(56px) saturate(220%) brightness(1.05)',
          borderRadius: '32px 32px 0 0',
          boxShadow: 'inset 0 1.5px 0 rgba(255,235,200,0.1), 0 -4px 40px rgba(0,0,0,0.6)',
          padding: '20px 24px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'rgba(245,239,230,0.18)', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Sesión en progreso
        </p>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.5 }}>
          Tenías una sesión activa · <span style={{ color: 'var(--accent)', fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{timeStr}</span> · ¿Continuar o descartar?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onDiscard} className="pressable" style={{
            flex: 1, padding: 14, borderRadius: 14,
            background: 'var(--red-dim)', border: '1px solid rgba(229,83,75,0.3)',
            color: 'var(--red)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            Descartar
          </button>
          <button onClick={onContinue} className="pressable" style={{
            flex: 2, padding: 14, borderRadius: 14,
            background: 'var(--accent)', border: 'none',
            color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,146,74,0.3)',
          }}>
            Continuar sesión
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [prevTab, setPrevTab] = useState(null)
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      const raw = localStorage.getItem('graw_store')
      if (!raw) return false
      const parsed = JSON.parse(raw)
      const user = parsed?.state?.user ?? parsed?.user ?? null
      return !!(user?.onboardingComplete || (user?.name && user?.goal))
    } catch (e) {
      console.error('Could not read onboarding state:', e)
      return false
    }
  })
  const [direction, setDirection] = useState(1)
  const [transitioning, setTransitioning] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  // Splash: show on every fresh browser session (sessionStorage clears on tab close)
  const [splashDone, setSplashDone] = useState(() =>
    sessionStorage.getItem('splashShown') === 'true'
  )
  const [offline, setOffline] = useState(!navigator.onLine)
  const [recoveryElapsed, setRecoveryElapsed] = useState(null)

  const user = useStore(s => s.user)
  const updateUser = useStore(s => s.updateUser)

  useEffect(() => {
    if (user?.onboardingComplete) {
      setIsOnboarded(true)
    }
  }, [user])

  const activeWorkout = useStore(s => s.activeWorkout)
  const cancelWorkout = useStore(s => s.cancelWorkout)
  const [editName, setEditName] = useState(user?.name || '')

  // Only run badge detection after onboarding completes
  useBadgeDetection(isOnboarded)

  const handleOnboardingComplete = (userData) => {
    try {
      const raw = localStorage.getItem('graw_store')
      const current = raw ? JSON.parse(raw) : { state: {} }
      if (!current.state) current.state = {}
      current.state.user = { ...userData, onboardingComplete: true }
      localStorage.setItem('graw_store', JSON.stringify(current))
    } catch (e) {
      console.error('Failed to write user to localStorage:', e)
    }

    try {
      useStore.getState().updateUser({ ...userData, onboardingComplete: true })
    } catch (e) {}

    try {
      personalizeFromOnboarding(userData.experience, userData.goal, useStore.getState())
    } catch (e) {}

    setIsOnboarded(true)
  }

  // Keyboard detection — hide bottom nav
  useEffect(() => {
    if (!window.visualViewport) return
    const handler = () => {
      const keyboardOpen = window.visualViewport.height < window.innerHeight * 0.75
      document.body.classList.toggle('keyboard-open', keyboardOpen)
    }
    window.visualViewport.addEventListener('resize', handler)
    return () => window.visualViewport.removeEventListener('resize', handler)
  }, [])

  // Online / offline
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Session recovery — check for orphaned workout timer on mount
  useEffect(() => {
    const savedTs = localStorage.getItem('graw_workout_start_ts')
    if (savedTs && activeWorkout) {
      const elapsed = Math.floor((Date.now() - Number(savedTs)) / 1000)
      // Only show recovery if it's been more than 30 seconds (not just a hot reload)
      if (elapsed > 30) {
        setRecoveryElapsed(elapsed)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    useStore.getState().startWorkout({ templateId, programId, name: name || 'Entrenamiento' })
    handleTabChange('workout')
  }

  const getTabStyle = (tab) => {
    const isActive = tab === activeTab
    const isExiting = tab === prevTab && transitioning
    // Invisible-but-in-DOM tabs: zero overhead, no layout shift, header never reflowed
    if (!isActive && !isExiting) return {
      position: 'absolute', inset: 0,
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden',
      overflow: 'hidden',
    }
    return {
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      animation: isActive && transitioning
        ? `${direction > 0 ? 'tabEnterRight' : 'tabEnterLeft'} ${DUR}ms cubic-bezier(0.32,0.72,0,1) both`
        : isExiting
          ? `${direction > 0 ? 'tabExitRight' : 'tabExitLeft'} ${DUR}ms cubic-bezier(0.32,0.72,0,1) both`
          : 'none',
    }
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div style={{
      backgroundColor: '#0C0A09',
      color: '#F5EFE6',
      minHeight: 'max(100dvh, 100vh)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Splash — shown once per browser session */}
      <AnimatePresence>
        {!splashDone && (
          <SplashScreen onComplete={() => {
            sessionStorage.setItem('splashShown', 'true')
            setSplashDone(true)
          }} />
        )}
      </AnimatePresence>

      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', overflow: 'hidden',
        background: 'var(--bg)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        {/* Ambient background glow */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
          background: TAB_GLOWS[activeTab],
          transition: 'background 0.6s ease',
        }} />

        {/* Offline indicator */}
        {offline && (
          <div style={{
            position: 'fixed', top: 'env(safe-area-inset-top, 0px)',
            left: 0, right: 0, height: 28, zIndex: 999,
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em',
            color: 'var(--text2)', animation: 'fadeIn 0.3s ease',
            gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
            SIN CONEXIÓN
          </div>
        )}

        <ToastContainer />
        <BadgeUnlockToast />

        {/* App header — GRAW mark + wordmark + avatar */}
        <div style={{
          flexShrink: 0, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          {/* Left: GRAW mark + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GrawMark size={28} />
            <span style={{
              fontSize: 20, fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--text)',
              lineHeight: 1,
            }}>GRAW</span>
          </div>

          {/* Right: user avatar → navigates to Profile tab */}
          <button
            onClick={() => handleTabChange('profile')}
            className="pressable"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(232,146,74,0.12)',
              border: '1.5px solid rgba(232,146,74,0.28)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#E8924A',
              flexShrink: 0,
              transition: 'transform 0.15s ease',
            }}
          >
            {user?.avatarEmoji || (user?.name || 'A').charAt(0).toUpperCase()}
          </button>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, position: 'relative', paddingBottom: 'var(--nav-h)' }}>
          <div style={getTabStyle('today')}>
            <TodayTab onStartWorkout={handleStartWorkout} onNavigate={handleTabChange} />
          </div>
          <div style={getTabStyle('workout')}>
            <WorkoutTab onSwitchTab={handleTabChange} />
          </div>
          <div style={getTabStyle('history')}>
            <HistoryTab onStartWorkout={handleStartWorkout} />
          </div>
          <div style={getTabStyle('progress')}>
            <ProgressTab />
          </div>
          <div style={getTabStyle('programs')}>
            <ProgramsTab onSwitchTab={handleTabChange} />
          </div>
          <div style={getTabStyle('profile')}>
            <ProfileTab />
          </div>
        </div>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Focus Mode — renders progress bar + focus nav via portal when workout active */}
        <FocusMode onFinish={() => {
          // Trigger the finish flow in WorkoutTab by switching to it
          handleTabChange('workout')
          // Small delay to let tab render, then programmatically trigger finish
          setTimeout(() => {
            const finishEvent = new CustomEvent('graw:requestFinish')
            window.dispatchEvent(finishEvent)
          }, 80)
        }} />

        {/* Profile quick-edit sheet — keep for quick name edit */}
        <Sheet isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="Mi perfil" size="small">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p className="t-label" style={{ marginBottom: 8 }}>Nombre</p>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Tu nombre"
                className="input"
                style={{ fontSize: 16 }}
              />
            </div>
            <button
              onClick={() => { updateUser({ name: editName.trim() || user?.name }); setProfileOpen(false) }}
              className="pressable"
              style={{
                width: '100%', height: 52, borderRadius: 14,
                background: 'var(--accent)', border: 'none',
                color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Guardar
            </button>
          </div>
        </Sheet>

        {/* Session recovery sheet */}
        {recoveryElapsed !== null && (
          <RecoverySheet
            elapsed={recoveryElapsed}
            onContinue={() => {
              setRecoveryElapsed(null)
              handleTabChange('workout')
            }}
            onDiscard={() => {
              cancelWorkout()
              setRecoveryElapsed(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
