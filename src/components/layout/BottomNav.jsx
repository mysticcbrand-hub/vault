import { memo } from 'react'
import { Sun, Clock, Zap, TrendingUp, User } from 'lucide-react'
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

  return (
    <nav className="bottom-nav" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1fr',
      alignItems: 'center',
      height: 'var(--nav-h)',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
      paddingTop: 6,
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(10, 8, 6, 0.80)',
      backdropFilter: 'blur(48px) saturate(240%) brightness(1.06)',
      WebkitBackdropFilter: 'blur(48px) saturate(240%) brightness(1.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,235,200,0.09), 0 -1px 0 rgba(0,0,0,0.5)',
      borderTop: 'none',
    }}>
      {TABS.map(tab => {
        if (tab.center) {
          return (
            <div key={tab.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={() => onTabChange('workout')}
                aria-label="Entrenar"
                style={{
                  position: 'relative',
                  width: 54,
                  height: 54,
                  borderRadius: 17,
                  padding: 0,
                  lineHeight: 0,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translateY(-10px)',
                  // Layered glass construction
                  background: activeWorkout
                    ? `radial-gradient(ellipse at 40% 35%, rgba(200,255,230,0.15) 0%, transparent 60%),
                       linear-gradient(145deg, rgba(52,199,123,0.9) 0%, rgba(34,160,95,0.95) 100%)`
                    : `radial-gradient(ellipse at 40% 35%, rgba(255,235,200,0.12) 0%, transparent 60%),
                       linear-gradient(145deg, rgba(232,146,74,0.9) 0%, rgba(194,108,40,0.95) 100%)`,
                  backdropFilter: 'blur(20px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(200%)',
                  boxShadow: activeWorkout
                    ? `inset 0 1.5px 0 rgba(200,255,230,0.3),
                       inset 1px 0 0 rgba(200,255,230,0.1),
                       0 0 0 1px rgba(52,199,123,0.3),
                       0 4px 16px rgba(52,199,123,0.35),
                       0 8px 32px rgba(52,199,123,0.18),
                       0 2px 4px rgba(0,0,0,0.4)`
                    : `inset 0 1.5px 0 rgba(255,235,200,0.35),
                       inset 1px 0 0 rgba(255,235,200,0.1),
                       0 0 0 1px rgba(232,146,74,0.3),
                       0 4px 16px rgba(232,146,74,0.35),
                       0 8px 32px rgba(232,146,74,0.18),
                       0 2px 4px rgba(0,0,0,0.4)`,
                  animation: activeWorkout ? 'workoutActivePulse 3s ease-in-out infinite' : 'none',
                  transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onPointerDown={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(0.93)'
                }}
                onPointerUp={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1)'
                }}
                onPointerLeave={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1)'
                }}
              >
                <Zap
                  size={22}
                  strokeWidth={2.2}
                  color="rgba(255,245,235,0.95)"
                  style={{
                    display: 'block',
                    margin: 'auto',
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
                  }}
                />
                {activeWorkout && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 10, height: 10, borderRadius: '50%',
                    background: 'var(--bg)', border: '2px solid var(--green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green)' }} />
                  </span>
                )}
              </button>
            </div>
          )
        }

        const active = activeTab === tab.id
        const { Icon } = tab
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
            {/* Active dot */}
            <span style={{
              position: 'absolute',
              top: 6,
              width: 20,
              height: 3,
              borderRadius: 2,
              background: 'var(--accent)',
              opacity: active ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }} />
            <Icon
              size={22}
              strokeWidth={active ? 2.1 : 1.75}
              color={active ? 'var(--accent)' : 'var(--text3)'}
              style={{ transition: 'color 0.15s ease, stroke-width 0.15s ease' }}
            />
          </button>
        )
      })}
    </nav>
  )
})
