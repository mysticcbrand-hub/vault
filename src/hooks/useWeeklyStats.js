import { useMemo } from 'react'
import useStore from '../store/index.js'
import { getWeekDays, isSameDayAs } from '../utils/dates.js'

export function useWeeklyStats() {
  const sessions = useStore(s => s.sessions)

  return useMemo(() => {
    const weekDays = getWeekDays()
    const now = new Date()
    const weekStart = weekDays[0]
    const weekEnd = new Date(weekDays[6])
    weekEnd.setHours(23, 59, 59, 999)

    const thisWeekSessions = sessions.filter(s => {
      const d = new Date(s.date)
      return d >= weekStart && d <= weekEnd
    })

    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(weekStart)
    lastWeekEnd.setMilliseconds(-1)

    const lastWeekSessions = sessions.filter(s => {
      const d = new Date(s.date)
      return d >= lastWeekStart && d <= lastWeekEnd
    })

    const thisWeekVolume = thisWeekSessions.reduce((t, s) => t + (s.totalVolume || 0), 0)
    const lastWeekVolume = lastWeekSessions.reduce((t, s) => t + (s.totalVolume || 0), 0)
    const volumeChange = lastWeekVolume > 0
      ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100)
      : null

    const dayVolumes = weekDays.map(day => {
      const daySessions = sessions.filter(s => isSameDayAs(s.date, day))
      return daySessions.reduce((t, s) => t + (s.totalVolume || 0), 0)
    })

    const trainedToday = sessions.some(s => isSameDayAs(s.date, now))

    return {
      weekDays,
      thisWeekSessions,
      thisWeekVolume,
      lastWeekVolume,
      volumeChange,
      dayVolumes,
      trainedToday,
      sessionCount: thisWeekSessions.length,
    }
  }, [sessions])
}
