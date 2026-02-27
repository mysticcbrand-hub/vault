import { useMemo, useRef, useEffect } from 'react'
import { subDays, startOfYear, differenceInDays, format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { calculateStreak } from '../../utils/dates.js'
import useStore from '../../store/index.js'

export function Heatmap() {
  const sessions = useStore(s => s.sessions)
  const streak = useMemo(() => calculateStreak(sessions), [sessions])
  const scrollRef = useRef(null)

  const { weeks, months } = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0)
    const totalDays = Math.min(differenceInDays(now, startOfYear(now)) + 1, 365)
    const volByDay = {}
    sessions.forEach(s => {
      const d = new Date(s.date); d.setHours(0,0,0,0)
      const k = d.toDateString()
      volByDay[k] = (volByDay[k]||0) + (s.totalVolume||0)
    })
    const maxVol = Math.max(...Object.values(volByDay), 1)

    const cells = []
    for (let i = totalDays-1; i >= 0; i--) {
      const d = subDays(now, i); d.setHours(0,0,0,0)
      const k = d.toDateString()
      const vol = volByDay[k]||0
      const intensity = vol>0 ? Math.ceil((vol/maxVol)*4) : 0
      cells.push({ date: new Date(d), vol, intensity, isToday: i===0 })
    }

    // Build columns (Mon=0..Sun=6)
    const cols = []
    let col = []
    cells.forEach((cell, i) => {
      const dow = getDay(cell.date) // 0=Sun
      const wd = dow===0?6:dow-1 // Mon=0
      if (i===0) { for (let p=0;p<wd;p++) col.push(null) }
      col.push(cell)
      if (wd===6||i===cells.length-1) {
        while (col.length<7) col.push(null)
        cols.push([...col]); col=[]
      }
    })

    // Month labels
    const months = []
    cols.forEach((week, wi) => {
      const first = week.find(c=>c)
      if (!first) return
      const m = format(first.date,'MMM',{locale:es})
      if (!months.length||months[months.length-1].label!==m) {
        months.push({label:m,col:wi})
      }
    })

    return { weeks: cols, months }
  }, [sessions])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [weeks])

  const colors = ['var(--border)','rgba(94,106,210,0.2)','rgba(94,106,210,0.4)','rgba(94,106,210,0.62)','var(--accent)']
  const thisYearCount = sessions.filter(s=>new Date(s.date).getFullYear()===new Date().getFullYear()).length

  return (
    <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'20px 16px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
        <div>
          <p style={{ fontSize:16,fontWeight:700,color:'var(--text)',letterSpacing:'-0.02em',marginBottom:2 }}>Consistencia</p>
          <p style={{ fontSize:12,color:'var(--text3)' }}>{thisYearCount} sesiones este año</p>
        </div>
        <div style={{ display:'flex',gap:16 }}>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:24,fontWeight:800,letterSpacing:'-0.04em',color:'var(--amber)',fontVariantNumeric:'tabular-nums',lineHeight:1 }}>{streak.current}</p>
            <p className="t-label" style={{ marginTop:3 }}>Racha</p>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:24,fontWeight:800,letterSpacing:'-0.04em',color:'var(--accent)',fontVariantNumeric:'tabular-nums',lineHeight:1 }}>{streak.longest}</p>
            <p className="t-label" style={{ marginTop:3 }}>Mejor</p>
          </div>
        </div>
      </div>
      <div ref={scrollRef} style={{ overflowX:'auto',paddingBottom:4 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
          {/* Month labels */}
          <div style={{ display:'flex',gap:2,marginBottom:4,height:14 }}>
            <div style={{ width:14,flexShrink:0 }} />
            {weeks.map((_, wi) => {
              const m = months.find(m=>m.col===wi)
              return (
                <div key={wi} style={{ width:10,flexShrink:0,fontSize:8,color:'var(--text3)',fontWeight:600,letterSpacing:'0.04em',textTransform:'uppercase',lineHeight:1 }}>
                  {m?.label}
                </div>
              )
            })}
          </div>
          {/* Grid */}
          <div style={{ display:'flex',gap:2 }}>
            <div style={{ display:'flex',flexDirection:'column',gap:2,width:14,flexShrink:0,paddingTop:1 }}>
              {['L','','X','','V','','D'].map((l,i)=>(
                <div key={i} style={{ height:10,fontSize:8,color:'var(--text3)',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center' }}>{l}</div>
              ))}
            </div>
            {weeks.map((week,wi)=>(
              <div key={wi} style={{ display:'flex',flexDirection:'column',gap:2 }}>
                {week.map((cell,di)=>(
                  <div key={di} style={{
                    width:10,height:10,borderRadius:2,flexShrink:0,
                    background:cell?colors[cell.intensity]:'transparent',
                    border:cell?.isToday?'1px solid var(--accent)':'none',
                    cursor:cell?.vol>0?'pointer':'default',
                  }} title={cell?`${format(cell.date,'d MMM',{locale:es})}: ${cell.vol>0?`${cell.vol} kg`:'Descanso'}`:''}/>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:4,marginTop:10,justifyContent:'flex-end' }}>
        <span style={{ fontSize:10,color:'var(--text3)' }}>Menos</span>
        {colors.map((c,i)=><div key={i} style={{ width:10,height:10,borderRadius:2,background:c }}/>)}
        <span style={{ fontSize:10,color:'var(--text3)' }}>Más</span>
      </div>
    </div>
  )
}
