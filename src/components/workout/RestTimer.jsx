import { memo } from 'react'
import { formatDurationMmSs } from '../../utils/dates.js'

export const RestTimerPill = memo(function RestTimerPill({ timer }) {
  const { active, remaining, total, start, stop } = timer
  if (!active) return null

  const skip = () => stop()
  const add30 = () => start(remaining + 30)

  return (
    <div className="rest-timer-pill">
      <span className="rest-dot" />
      <span style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>Descansando</span>
      <span style={{
        fontSize:15,fontWeight:600,
        fontFamily:'DM Mono,monospace',
        color:'var(--text)',letterSpacing:'-0.02em',
      }}>
        {formatDurationMmSs(remaining)}
      </span>
      <button onClick={add30} style={{
        height:26,padding:'0 10px',borderRadius:'var(--r-pill)',
        background:'var(--surface3)',border:'1px solid var(--border2)',
        fontSize:12,fontWeight:600,color:'var(--text2)',cursor:'pointer',
      }}>+30s</button>
      <button onClick={skip} style={{
        fontSize:12,fontWeight:600,color:'var(--text3)',
        background:'none',border:'none',cursor:'pointer',
        padding:'0 4px',
      }}>Saltar</button>
    </div>
  )
})
