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
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [activeWorkout?.startTime])
  return elapsed
}

export function useRestTimer(defaultSeconds = 90) {
  const [active, setActive] = useState(false)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [total, setTotal] = useState(defaultSeconds)
  const ref = useRef(null)

  const stop = () => { setActive(false); clearInterval(ref.current) }

  const start = (seconds) => {
    const t = seconds ?? defaultSeconds
    clearInterval(ref.current)
    setTotal(t)
    setRemaining(t)
    setActive(true)
  }

  useEffect(() => {
    if (!active) return
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(ref.current)
          setActive(false)
          try { navigator.vibrate([200,100,200]) } catch {}
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [active])

  return { active, remaining, total, start, stop }
}
