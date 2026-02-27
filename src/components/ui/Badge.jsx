import { MUSCLE_COLORS, MUSCLE_NAMES } from '../../data/exercises.js'

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[rgba(240,240,245,0.08)] text-[rgba(240,240,245,0.6)]',
    accent: 'bg-[rgba(108,99,255,0.15)] text-[#6C63FF] border border-[rgba(108,99,255,0.3)]',
    green: 'bg-[rgba(52,211,153,0.15)] text-[#34D399] border border-[rgba(52,211,153,0.3)]',
    amber: 'bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.3)]',
    red: 'bg-[rgba(248,113,113,0.15)] text-[#F87171] border border-[rgba(248,113,113,0.3)]',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function MuscleBadge({ muscle, className = '' }) {
  const colors = MUSCLE_COLORS[muscle]
  if (!colors) return null
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {MUSCLE_NAMES[muscle] || muscle}
    </span>
  )
}
