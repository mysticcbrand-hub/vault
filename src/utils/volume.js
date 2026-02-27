export function calcSetVolume(weight, reps) {
  const w = parseFloat(weight) || 0
  const r = parseInt(reps) || 0
  return w * r
}

export function calcSessionVolume(exercises) {
  if (!exercises || !Array.isArray(exercises)) return 0
  return exercises.reduce((total, ex) => {
    const exVol = (ex.sets || []).reduce((s, set) => {
      if (set.completed) {
        return s + calcSetVolume(set.weight, set.reps)
      }
      return s
    }, 0)
    return total + exVol
  }, 0)
}

export function calcExerciseVolume(exercise) {
  if (!exercise || !exercise.sets) return 0
  return exercise.sets.reduce((total, set) => {
    if (set.completed) return total + calcSetVolume(set.weight, set.reps)
    return total
  }, 0)
}

export function formatVolume(volume) {
  if (!volume) return '0'
  if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'k'
  }
  return Math.round(volume).toString()
}

export function formatVolumeExact(volume) {
  if (!volume) return '0'
  return new Intl.NumberFormat('es-ES').format(Math.round(volume))
}

export function getWeeklyVolume(sessions, weeksBack = 12) {
  const now = new Date()
  const weeks = []

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - (i * 7) + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekSessions = sessions.filter(s => {
      const d = new Date(s.date)
      return d >= weekStart && d <= weekEnd
    })

    const volume = weekSessions.reduce((t, s) => t + (s.totalVolume || 0), 0)

    weeks.push({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      volume,
      sessions: weekSessions.length,
      label: formatWeekLabel(weekStart),
    })
  }

  return weeks
}

function formatWeekLabel(date) {
  const d = new Date(date)
  const day = d.getDate()
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${day} ${months[d.getMonth()]}`
}
