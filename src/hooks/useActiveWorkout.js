import { useEffect, useRef, useState } from 'react'
import useStore from '../store/index.js'

export function useWorkoutTimer() {
  const activeWorkout = useStore(s => s.activeWorkout)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeWorkout) { setElapsed(0); return }
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(activeWorkout.startTime).getTime()) / 1000)
      setElapsed(diff)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [activeWorkout])

  return elapsed
}

export function useRestTimer(defaultSeconds) {
  const [active, setActive] = useState(false)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [total, setTotal] = useState(defaultSeconds)
  const intervalRef = useRef(null)

  const start = (seconds) => {
    const t = seconds ?? defaultSeconds
    setTotal(t)
    setRemaining(t)
    setActive(true)
  }

  const stop = () => {
    setActive(false)
    clearInterval(intervalRef.current)
  }

  const reset = () => {
    stop()
    setRemaining(total)
  }

  useEffect(() => {
    if (!active) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setActive(false)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [active])

  return { active, remaining, total, start, stop, reset }
}
