import { memo } from 'react'
import { Sun, Clock, Zap, TrendingUp, LayoutGrid, Activity } from 'lucide-react'
import useStore from '../../store/index.js'

const TABS = [
  { id: 'today',    Icon: Sun },
  { id: 'history',  Icon: Clock },
  { id: 'workout',  Icon: Zap,  center: true },
  { id: 'progress', Icon: TrendingUp },
  { id: 'programs', Icon: LayoutGrid },
]

export const BottomNav = memo(function BottomNav({ activeTab, onTabChange }) {
  const activeWorkout = useStore(s => s.activeWorkout)

  return (
    <nav className="bottom-nav glass-nav">
      {TABS.map(tab => {
        if (tab.center) {
          return (
            <div key={tab.id} style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              <button
                onClick={() => onTabChange('workout')}
                className={`pressable nav-center-btn ${activeWorkout ? 'active-workout' : ''}`}
                aria-label="Entrenar"
              >
                {activeWorkout
                  ? <Activity size={22} color="white" strokeWidth={2} />
                  : <Zap size={22} color="white" fill="white" strokeWidth={1.5} />
                }
                {activeWorkout && (
                  <span style={{
                    position:'absolute', top:-3, right:-3,
                    width:10, height:10, borderRadius:'50%',
                    background:'var(--bg)', border:'2px solid var(--green)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <span style={{width:4,height:4,borderRadius:'50%',background:'var(--green)'}} />
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
            className={`pressable nav-item ${active ? 'active' : ''}`}
            aria-label={tab.id}
            style={{ background:'none', border:'none' }}
          >
            <span className="nav-dot" />
            <Icon
              size={22}
              strokeWidth={active ? 2 : 1.75}
              color={active ? 'var(--accent)' : 'var(--text3)'}
            />
          </button>
        )
      })}
    </nav>
  )
})
