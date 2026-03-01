export function formatKg(n) {
  if (!n && n !== 0) return '0'
  const num = Math.round(n)
  if (num >= 10000) return `${(num / 1000).toFixed(1)}k`
  if (num >= 1000) return new Intl.NumberFormat('es-ES').format(num)
  return String(num)
}

// formatWeight — display a weight value with optional unit, no trailing .0
export function formatWeight(n, unit = 'kg') {
  if (!n && n !== 0) return ''
  const raw = parseFloat(n)
  if (isNaN(raw)) return ''
  const val = unit === 'lbs' ? raw * 2.20462 : raw
  const rounded = Math.round(val * 10) / 10
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${display} ${unit}`
}

// formatVolume — smart k/M suffix for volume totals
export function formatVolume(kg) {
  if (!kg && kg !== 0) return '0 kg'
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}M kg`
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)}k kg`
  return `${Math.round(kg)} kg`
}

// formatRest — seconds → M:SS string
export function formatRest(seconds) {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

export function relativeDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''

  // Compare calendar dates (midnight), not raw timestamps.
  // This ensures "hoy" means same calendar day, not "within last 24h".
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dDay = new Date(d)
  dDay.setHours(0, 0, 0, 0)

  const diff = Math.round((today.getTime() - dDay.getTime()) / 86400000)

  if (diff === 0) return 'hoy'
  if (diff === 1) return 'ayer'
  if (diff < 7) return `hace ${diff} días`
  if (diff < 14) return 'hace 1 semana'
  if (diff < 30) return `hace ${Math.floor(diff / 7)} semanas`
  if (diff < 60) return 'hace 1 mes'
  return `hace ${Math.floor(diff / 30)} meses`
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getMuscleVars(muscle) {
  const map = {
    chest:     { color: 'var(--chest)',     dim: 'var(--chest-dim)',     border: 'rgba(232,146,74,0.25)'  },
    back:      { color: 'var(--back)',      dim: 'var(--back-dim)',      border: 'rgba(163,127,212,0.25)' },
    legs:      { color: 'var(--legs)',      dim: 'var(--legs-dim)',      border: 'rgba(229,83,75,0.25)'   },
    shoulders: { color: 'var(--shoulders)', dim: 'var(--shoulders-dim)', border: 'rgba(77,184,150,0.25)'  },
    arms:      { color: 'var(--arms)',      dim: 'var(--arms-dim)',      border: 'rgba(212,168,67,0.25)'  },
    forearms:  { color: 'var(--forearms)',  dim: 'var(--forearms-dim)',  border: 'rgba(126,184,160,0.25)' },
    calves:    { color: 'var(--calves)',    dim: 'var(--calves-dim)',    border: 'rgba(155,142,196,0.25)' },
    core:      { color: 'var(--core)',      dim: 'var(--core-dim)',      border: 'rgba(196,107,58,0.25)'  },
  }
  return map[muscle] || { color: 'var(--accent)', dim: 'var(--accent-dim)', border: 'rgba(232,146,74,0.25)' }
}

export function getMuscleGradient(muscle) {
  const map = {
    chest:     'linear-gradient(135deg, var(--chest-dim) 0%, var(--bg) 100%)',
    back:      'linear-gradient(135deg, var(--back-dim) 0%, var(--bg) 100%)',
    legs:      'linear-gradient(135deg, var(--legs-dim) 0%, var(--bg) 100%)',
    shoulders: 'linear-gradient(135deg, var(--shoulders-dim) 0%, var(--bg) 100%)',
    arms:      'linear-gradient(135deg, var(--arms-dim) 0%, var(--bg) 100%)',
    core:      'linear-gradient(135deg, var(--core-dim) 0%, var(--bg) 100%)',
  }
  return map[muscle] || 'linear-gradient(135deg, var(--surface2) 0%, var(--bg) 100%)'
}
