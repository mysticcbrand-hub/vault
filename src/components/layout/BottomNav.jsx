import { useRef, useEffect, useState } from 'react'
import useStore from '../../store/index.js'

// Pure SVG icons — no emoji, no text
const IconToday = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text3)'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="4"/>
    <line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="4" y2="12"/>
    <line x1="20" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
    <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
    <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>
    <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
  </svg>
)

const IconHistory = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text3)'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
    <polyline points="3 3 3 11 11 11"/>
  </svg>
)

const IconProgress = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text3)'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

const IconPrograms = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'var(--text3)'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
)

const IconZap = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const SIDE_TABS = [
  { id: 'today',    Icon: IconToday },
  { id: 'history',  Icon: IconHistory },
  { id: 'progress', Icon: IconProgress },
  { id: 'programs', Icon: IconPrograms },
]

export function BottomNav({ activeTab, onTabChange }) {
  const activeWorkout = useStore(s => s.activeWorkout)

  return (
    <nav style={{
      flexShrink: 0,
      background: 'rgba(10,10,20,0.85)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 64,
        maxWidth: 500,
        margin: '0 auto',
        padding: '0 8px',
        position: 'relative',
      }}>
        {/* Left two tabs */}
        <TabBtn tab={SIDE_TABS[0]} active={activeTab === SIDE_TABS[0].id} onPress={() => onTabChange(SIDE_TABS[0].id)} />
        <TabBtn tab={SIDE_TABS[1]} active={activeTab === SIDE_TABS[1].id} onPress={() => onTabChange(SIDE_TABS[1].id)} />

        {/* Center raised button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
          {/* Raised button sits 12px above baseline */}
          <button
            onClick={() => onTabChange('workout')}
            className="pressable"
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: activeWorkout
                ? 'linear-gradient(145deg, #32D583, #1a9e5f)'
                : 'linear-gradient(145deg, #7C6FF7, #5048CC)',
              boxShadow: activeWorkout
                ? '0 8px 24px rgba(50,213,131,0.45)'
                : '0 8px 24px rgba(124,111,247,0.45)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              bottom: 12,
              transition: 'box-shadow 0.2s ease, background 0.2s ease',
            }}
          >
            <IconZap />
            {activeWorkout && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 10, height: 10, borderRadius: '50%',
                background: '#32D583',
                border: '2px solid var(--bg)',
              }} />
            )}
          </button>
        </div>

        {/* Right two tabs */}
        <TabBtn tab={SIDE_TABS[2]} active={activeTab === SIDE_TABS[2].id} onPress={() => onTabChange(SIDE_TABS[2].id)} />
        <TabBtn tab={SIDE_TABS[3]} active={activeTab === SIDE_TABS[3].id} onPress={() => onTabChange(SIDE_TABS[3].id)} />
      </div>
    </nav>
  )
}

function TabBtn({ tab, active, onPress }) {
  const { Icon } = tab
  return (
    <button
      onClick={onPress}
      className="pressable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: 56,
        height: 56,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        paddingBottom: 4,
      }}
    >
      {/* Active pill dot */}
      <span style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: active ? 4 : 0,
        height: 3,
        borderRadius: 2,
        background: 'var(--accent)',
        transition: 'width 0.2s ease, opacity 0.2s ease',
        opacity: active ? 1 : 0,
      }} />
      <span style={{
        transform: active ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
      }}>
        <Icon active={active} />
      </span>
    </button>
  )
}
