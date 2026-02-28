import { useEffect, useMemo } from 'react'
import { ALL_BADGES } from '../data/badges.js'
import { calculateUserStats } from '../utils/userStats.js'
import useStore from '../store/index.js'

export function useBadgeDetection(enabled = true) {
  const sessions        = useStore(s => s.sessions)
  const bodyMetrics     = useStore(s => s.bodyMetrics)
  const user            = useStore(s => s.user)
  const programs        = useStore(s => s.programs)
  const prs             = useStore(s => s.prs)
  const unlockedBadges  = useStore(s => s.unlockedBadges)
  const unlockBadges    = useStore(s => s.unlockBadges)
  const setPendingBadgeToast = useStore(s => s.setPendingBadgeToast)

  const stats = useMemo(() =>
    calculateUserStats(sessions, bodyMetrics, user, programs, prs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions.length, bodyMetrics.length, Object.keys(prs).length, user?.goal, user?.goalWeight]
  )

  useEffect(() => {
    // Do nothing during onboarding — prevents "Primer Programa" badge
    // from firing when personalizeFromOnboarding() runs before user is saved
    if (!enabled) return

    const previouslyUnlocked = new Set((unlockedBadges || []).map(b => b.id))
    const newlyUnlocked = []

    const statsWithCount = {
      ...stats,
      unlockedBadgesCount: previouslyUnlocked.size,
    }

    ALL_BADGES.forEach(badge => {
      if (previouslyUnlocked.has(badge.id)) return
      try {
        if (badge.condition(statsWithCount)) {
          newlyUnlocked.push({
            ...badge,
            condition: undefined,
            progress: undefined,
            unlockedAt: new Date().toISOString(),
          })
        }
      } catch {
        // condition evaluation errors must never crash the app
      }
    })

    if (newlyUnlocked.length > 0) {
      unlockBadges(newlyUnlocked)
      // Sort by rarity — show the most exciting badge in the toast
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
      const best = [...newlyUnlocked].sort(
        (a, b) => (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
      )[0]
      const fullBadge = ALL_BADGES.find(b => b.id === best.id)
      // Delay toast by 1500ms — ensures it appears after app transition animation
      setTimeout(() => {
        setPendingBadgeToast({ ...fullBadge, unlockedAt: best.unlockedAt })
      }, 1500)
    }
  }, [enabled, stats, unlockedBadges, unlockBadges, setPendingBadgeToast])
}
