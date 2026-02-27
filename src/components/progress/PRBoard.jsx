import { useMemo } from 'react'
import { getExerciseById, MUSCLE_COLORS } from '../../data/exercises.js'
import { formatDateShort } from '../../utils/dates.js'
import { differenceInDays, parseISO } from 'date-fns'
import useStore from '../../store/index.js'

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--amber)" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

export function PRBoard() {
  const prs = useStore(s => s.prs)
  const now = new Date()

  const prList = useMemo(() =>
    Object.entries(prs)
      .map(([exerciseId, pr]) => ({ exerciseId, ex: getExerciseById(exerciseId), ...pr }))
      .filter(p => p.ex)
      .sort((a, b) => (b.e1rm||0) - (a.e1rm||0)),
    [prs]
  )

  if (!prList.length) return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 20px', textAlign: 'center' }}>
      <EmptyPRSVG />
      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 16, marginBottom: 8 }}>Sin récords aún</p>
      <p style={{ fontSize: 14, color: 'var(--text2)' }}>Completa sesiones para ver tus PRs aquí.</p>
    </div>
  )

  return (
    <div>
      <div className="section-header">
        <span className="section-label">Récords personales</span>
        <span style={{ fontSize: 12, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>{prList.length}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {prList.map(({ exerciseId, ex, weight, reps, date, e1rm }, i) => {
          const colors = MUSCLE_COLORS[ex.muscle]
          const isNew = date && differenceInDays(now, parseISO(date)) <= 7
          return (
            <div key={exerciseId} className="anim-fade-up" style={{ animationDelay: `${i * 0.03}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px', position: 'relative', overflow: 'hidden' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                {isNew ? (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 4, background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid rgba(245,166,35,0.3)' }}>NUEVO</span>
                ) : <span />}
                <StarIcon />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>{ex.name}</p>
              <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: colors?.text || 'var(--accent)', lineHeight: 1 }}>
                {weight}<span style={{ fontSize: 13, fontWeight: 600, marginLeft: 2, color: 'var(--text2)' }}>kg</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>× {reps} reps</p>
              {e1rm && <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>1RM ~{e1rm.toFixed(1)} kg</p>}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: colors?.bg, color: colors?.text }}>{ex.muscle}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{date ? formatDateShort(date) : ''}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyPRSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto', display: 'block' }}>
      <circle cx="40" cy="32" r="18" stroke="var(--text3)" strokeWidth="1.5"/>
      <path d="M28 50 L40 68 L52 50" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="40" y1="50" x2="40" y2="58" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M33 29 L38 34 L47 25" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
