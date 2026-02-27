export function formatKg(n) {
  if (!n && n !== 0) return '0'
  const num = Math.round(n)
  if (num >= 10000) return `${(num / 1000).toFixed(1)}k`
  if (num >= 1000) return new Intl.NumberFormat('es-ES').format(num)
  return String(num)
}

export function formatWeight(n) {
  if (!n && n !== 0) return ''
  const num = parseFloat(n)
  if (isNaN(num)) return ''
  return num % 1 === 0 ? String(num) : String(num)
}

export function relativeDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
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
    chest:     { color: 'var(--chest)',     dim: 'var(--chest-dim)'     },
    back:      { color: 'var(--back)',      dim: 'var(--back-dim)'      },
    legs:      { color: 'var(--legs)',      dim: 'var(--legs-dim)'      },
    shoulders: { color: 'var(--shoulders)', dim: 'var(--shoulders-dim)' },
    arms:      { color: 'var(--arms)',      dim: 'var(--arms-dim)'      },
    forearms:  { color: 'var(--forearms)',  dim: 'var(--forearms-dim)'  },
    calves:    { color: 'var(--calves)',    dim: 'var(--calves-dim)'    },
    core:      { color: 'var(--core)',      dim: 'var(--core-dim)'      },
  }
  return map[muscle] || { color: 'var(--accent)', dim: 'var(--accent-dim)' }
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
