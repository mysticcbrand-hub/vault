import { format, startOfWeek, endOfWeek, isToday, isYesterday, differenceInDays, parseISO, isSameDay, startOfYear } from 'date-fns'
import { es } from 'date-fns/locale'

export function getGreeting(name) {
  const h = new Date().getHours()
  let g = h >= 5 && h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
  return `${g}, ${name}`
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

export function formatDuration(seconds) {
  if (!seconds) return '0min'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function formatDurationMmSs(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export function getWeekGroupLabel(dateStr) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  const now = new Date()
  const diff = differenceInDays(now, d)
  if (diff < 7) return 'Esta semana'
  if (diff < 14) return 'Semana pasada'
  const ws = startOfWeek(d, { weekStartsOn: 1 })
  const we = endOfWeek(d, { weekStartsOn: 1 })
  return `${format(ws,'d MMM',{locale:es})} – ${format(we,'d MMM',{locale:es})}`
}

export function groupSessionsByWeek(sessions) {
  const groups = {}
  const sorted = [...sessions].sort((a,b) => new Date(b.date)-new Date(a.date))
  sorted.forEach(s => {
    const label = getWeekGroupLabel(s.date)
    if (!groups[label]) groups[label] = []
    groups[label].push(s)
  })
  return Object.entries(groups).map(([label,items]) => ({label,items}))
}

export function getWeekDays() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diff)
  mon.setHours(0,0,0,0)
  return Array.from({length:7}, (_,i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate()+i)
    return d
  })
}

export function getDayLabel(date) {
  return ['D','L','M','X','J','V','S'][date.getDay()]
}

export function isSameDayAs(dateStr, compare) {
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
  return isSameDay(d, compare)
}

export function calculateStreak(sessions) {
  if (!sessions?.length) return { current: 0, longest: 0 }
  const dates = sessions
    .map(s => { const d = new Date(s.date); d.setHours(0,0,0,0); return d.getTime() })
    .filter((v,i,a) => a.indexOf(v)===i)
    .sort((a,b) => b-a)
  const today = new Date(); today.setHours(0,0,0,0)
  const todayTs = today.getTime()
  const yestTs = todayTs - 86400000
  let current = 0
  if (dates[0]===todayTs||dates[0]===yestTs) {
    current=1
    for (let i=1;i<dates.length;i++) {
      if (dates[i-1]-dates[i]===86400000) current++
      else break
    }
  }
  let streak=1, longest=1
  for (let i=1;i<dates.length;i++) {
    if (dates[i-1]-dates[i]===86400000) { streak++; longest=Math.max(longest,streak) }
    else streak=1
  }
  return { current, longest }
}
