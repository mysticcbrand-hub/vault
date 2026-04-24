import { memo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Clock, Zap, TrendingUp, User } from 'lucide-react'
import { haptics } from '../../utils/haptics.js'
import useStore from '../../store/index.js'

const TABS = [
  { id: 'today',    Icon: Sun,         label: 'Hoy' },
  { id: 'history',  Icon: Clock,       label: 'Historial' },
  { id: 'workout',  Icon: Zap,         label: 'Entrenar', center: true },
  { id: 'progress', Icon: TrendingUp,  label: 'Progreso' },
  { id: 'profile',  Icon: User,        label: 'Perfil' },
]

export const BottomNav = memo(function BottomNav({ activeTab, onTabChange }) {
  const activeWorkout = useStore(s => s.activeWorkout)

  // Focus Mode is active — hide regular nav (FocusMode renders its own via portal)
  if (activeWorkout) return null

  const handleTabChange = (id) => {
    haptics.light()
    onTabChange(id)
  }

  return (
    <nav className="bottom-nav" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1fr',
      alignItems: 'center',
      height: 'var(--nav-h)',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
      paddingTop: 6,
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(10, 8, 6, 0.82)',
      backdropFilter: 'blur(48px) saturate(240%) brightness(1.06)',
      WebkitBackdropFilter: 'blur(48px) saturate(240%) brightness(1.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.09), 0 -1px 0 rgba(0,0,0,0.5)',
      borderTop: 'none',
    }}>
      {TABS.map(tab => {
        if (tab.center) {
          return (
            <div key={tab.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              <button
                onClick={() => handleTabChange('workout')}
                aria-label="Entrenar"
                style={{
                  position: 'relative',
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  padding: 0,
                  lineHeight: 0,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(-8px)',
                  background: `radial-gradient(ellipse at 40% 35%, rgba(255,235,200,0.10) 0%, transparent 60%),
                       linear-gradient(145deg, rgba(232,146,74,0.88) 0%, rgba(194,108,40,0.94) 100%)`,
                  backdropFilter: 'blur(20px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(200%)',
                  boxShadow: `inset 0 1.5px 0 rgba(255,235,200,0.30),
                       inset 1px 0 0 rgba(255,235,200,0.08),
                       0 0 0 1px rgba(232,146,74,0.25),
                       0 4px 14px rgba(232,146,74,0.30),
                       0 8px 28px rgba(232,146,74,0.14),
                       0 2px 4px rgba(0,0,0,0.4)`,
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onPointerDown={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(0.92)'
                }}
                onPointerUp={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1)'
                }}
                onPointerLeave={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1)'
                }}
              >
                <Zap
                  size={21}
                  strokeWidth={2.2}
                  color="rgba(255,245,235,0.95)"
                  style={{
                    display: 'block',
                    margin: 'auto',
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                  }}
                />
              </button>
              {/* Label below center button */}
              <span className="nav-label" style={{
                color: activeTab === 'workout' ? 'var(--accent)' : 'var(--text3)',
                marginTop: -4,
              }}>
                {tab.label}
              </span>
            </div>
          )
        }

        const active = activeTab === tab.id
        const { Icon } = tab
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            aria-label={tab.label}
            className="pressable"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            {/* Animated active pill — slides between tabs */}
            {active && (
              <motion.div
                layoutId="nav-active-pill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 32,
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--accent)',
                  boxShadow: '0 2px 8px rgba(232,146,74,0.3)',
                }}
              />
            )}
            <Icon
              size={21}
              strokeWidth={active ? 2.1 : 1.7}
              color={active ? 'var(--accent)' : 'var(--text3)'}
              style={{ transition: 'color 0.15s ease, stroke-width 0.15s ease' }}
            />
            {/* Tab label */}
            <span className="nav-label" style={{
              color: active ? 'var(--accent)' : 'var(--text3)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
})
