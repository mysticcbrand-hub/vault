import { MUSCLE_COLORS, MUSCLE_NAMES } from '../../data/exercises.js'

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' },
    accent: { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' },
    green: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(52,199,123,0.3)' },
    amber: { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' },
    red: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(229,83,75,0.3)' },
  }
  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 6px', borderRadius: 'var(--r-xs)',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
      ...variants[variant],
    }}>{children}</span>
  )
}

export function MuscleBadge({ muscle, className = '' }) {
  const colors = MUSCLE_COLORS[muscle]
  if (!colors) return null
  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 6px', borderRadius: 'var(--r-xs)',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
    }}>{MUSCLE_NAMES[muscle] || muscle}</span>
  )
}
