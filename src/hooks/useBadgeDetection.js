import { useEffect, useMemo } from 'react'
import { ALL_BADGES } from '../data/badges.js'
import { calculateUserStats } from '../utils/userStats.js'
import useStore from '../store/index.js'

export function useBadgeDetection() {
  const sessions     = useStore(s => s.sessions)
  const bodyMetrics  = useStore(s => s.bodyMetrics)
  const user         = useStore(s => s.user)
  const programs     = useStore(s => s.programs)
  const prs          = useStore(s => s.prs)
  const unlockedBadges = useStore(s => s.unlockedBadges)
  const unlockBadges   = useStore(s => s.unlockBadges)
  const setPendingBadgeToast = useStore(s => s.setPendingBadgeToast)

  const stats = useMemo(() =>
    calculateUserStats(sessions, bodyMetrics, user, programs, prs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions.length, bodyMetrics.length, Object.keys(prs).length, user?.goal, user?.goalWeight]
  )

  useEffect(() => {
    const previouslyUnlocked = new Set((unlockedBadges || []).map(b => b.id))
    const newlyUnlocked = []

    // Compute how many are already unlocked for the 'all_badges' condition
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
            // strip functions — store only data
            condition: undefined,
            progress: undefined,
            unlockedAt: new Date().toISOString(),
          })
        }
      } catch {
        // condition evaluation errors should never crash the app
      }
    })

    if (newlyUnlocked.length > 0) {
      unlockBadges(newlyUnlocked)
      // Show toast for the most exciting one (highest rarity first)
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 }
      const best = [...newlyUnlocked].sort(
        (a, b) => (rarityOrder[a.rarity] ?? 4) - (rarityOrder[b.rarity] ?? 4)
      )[0]
      // Find full badge definition (with condition fn) for the toast
      const fullBadge = ALL_BADGES.find(b => b.id === best.id)
      setPendingBadgeToast({ ...fullBadge, unlockedAt: best.unlockedAt })
    }
  }, [stats, unlockedBadges, unlockBadges, setPendingBadgeToast])
}
