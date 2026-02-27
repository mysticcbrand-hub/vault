import { format, startOfWeek, endOfWeek, isToday, isYesterday, differenceInDays, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export function getGreeting(name) {
  const hour = new Date().getHours()
  let greeting
  if (hour >= 5 && hour < 12) greeting = 'Buenos días'
  else if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
  else if (hour >= 18 && hour < 24) greeting = 'Buenas noches'
  else greeting = 'Buenas noches'
  return `${greeting}, ${name}`
}

export function formatDateHeader() {
  return format(new Date(), "EEEE, d MMM", { locale: es })
    .replace(/^\w/, c => c.toUpperCase())
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  return format(d, 'd MMM yyyy', { locale: es })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(d, 'd MMM', { locale: es })
}

export function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return format(d, 'HH:mm')
}

export function formatDuration(seconds) {
  if (!seconds) return '0min'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min`
  return `${s}s`
}

export function formatDurationMmSs(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getWeekGroupLabel(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  const now = new Date()
  const diffDays = differenceInDays(now, d)

  if (diffDays < 7) return 'Esta semana'
  if (diffDays < 14) return 'Semana pasada'

  const weekStart = startOfWeek(d, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(d, { weekStartsOn: 1 })
  return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM', { locale: es })}`
}

export function groupSessionsByWeek(sessions) {
  const groups = {}
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))

  sortedSessions.forEach(session => {
    const label = getWeekGroupLabel(session.date)
    if (!groups[label]) groups[label] = []
    groups[label].push(session)
  })

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}

export function getWeekDays() {
  const now = new Date()
  const monday = new Date(now)
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d)
  }
  return days
}

export function getDayLabel(date) {
  const labels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return labels[date.getDay()]
}

export function isSameDayAs(dateStr, compareDate) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return isSameDay(d, compareDate)
}

export function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return { current: 0, longest: 0 }

  const sortedDates = sessions
    .map(s => {
      const d = typeof s.date === 'string' ? parseISO(s.date) : new Date(s.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b - a)

  let current = 0
  let longest = 0
  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Current streak
  const todayTs = today.getTime()
  const yesterdayTs = todayTs - 86400000

  if (sortedDates[0] === todayTs || sortedDates[0] === yesterdayTs) {
    current = 1
    for (let i = 1; i < sortedDates.length; i++) {
      if (sortedDates[i - 1] - sortedDates[i] === 86400000) {
        current++
      } else {
        break
      }
    }
  }

  // Longest streak
  streak = 1
  longest = 1
  for (let i = 1; i < sortedDates.length; i++) {
    if (sortedDates[i - 1] - sortedDates[i] === 86400000) {
      streak++
      longest = Math.max(longest, streak)
    } else {
      streak = 1
    }
  }

  return { current, longest }
}
