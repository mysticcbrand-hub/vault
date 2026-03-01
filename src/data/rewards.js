// ─── rewards.js ──────────────────────────────────────────────────────────────
// Maps badge unlocks to cosmetic rewards throughout the app.
// Zero game logic here — purely declarative data consumed by ProfileTab
// and any other surface that wants to reflect earned status.
// ─────────────────────────────────────────────────────────────────────────────

// ── STREAK EMBLEMS ────────────────────────────────────────────────────────────
// Shown next to the user's name when their CURRENT streak meets the threshold.
// Only the highest earned emblem shows. Priority = order of array (last wins).
export const STREAK_EMBLEMS = [
  { badgeId: 'streak_3',   minStreak: 3,   emoji: '⚡', label: 'En racha',      color: '#D4A843' },
  { badgeId: 'streak_7',   minStreak: 7,   emoji: '🔥', label: 'En llamas',     color: '#E8924A' },
  { badgeId: 'streak_14',  minStreak: 14,  emoji: '💥', label: 'Imparable',     color: '#E8924A' },
  { badgeId: 'streak_30',  minStreak: 30,  emoji: '🚀', label: 'En órbita',     color: '#5B9CF6' },
  { badgeId: 'streak_60',  minStreak: 60,  emoji: '🌪️', label: 'Torbellino',   color: '#A37FD4' },
  { badgeId: 'streak_100', minStreak: 100, emoji: '👑', label: 'Leyenda',       color: '#E8924A' },
]

// ── PROFILE TITLES ────────────────────────────────────────────────────────────
// Shown below the user's name. Priority = order of array (last earned wins).
export const PROFILE_TITLES = [
  { badgeId: 'first_session',   title: 'Iniciado',         color: 'rgba(245,239,230,0.45)' },
  { badgeId: 'sessions_10',     title: 'En Marcha',        color: '#A89070' },
  { badgeId: 'streak_7',        title: 'Constante',        color: '#D4A843' },
  { badgeId: 'sessions_25',     title: 'Dedicado',         color: '#A89070' },
  { badgeId: 'streak_14',       title: 'Disciplinado',     color: '#5B9CF6' },
  { badgeId: 'sessions_50',     title: 'Comprometido',     color: '#5B9CF6' },
  { badgeId: 'streak_30',       title: 'Imparable',        color: '#5B9CF6' },
  { badgeId: 'sessions_100',    title: 'Centenario',       color: '#A37FD4' },
  { badgeId: 'deadlift_2x',     title: 'Élite',            color: '#A37FD4' },
  { badgeId: 'streak_60',       title: 'Máquina de Guerra',color: '#A37FD4' },
  { badgeId: 'weeks_active_52', title: 'Un Año de Hierro', color: '#E8924A' },
  { badgeId: 'streak_100',      title: 'Centurión',        color: '#E8924A' },
  { badgeId: 'sessions_250',    title: 'Veterano',         color: '#E8924A' },
  { badgeId: 'all_badges',      title: 'El Coleccionista', color: '#E8924A' },
]

// ── AVATAR FRAMES ─────────────────────────────────────────────────────────────
// The avatar ring style evolves with the highest unlocked rarity.
// Consumed by the ProfileAvatarFrame component.
export const AVATAR_FRAMES = {
  none: {
    border: '2px solid rgba(232,146,74,0.3)',
    boxShadow: '0 0 0 4px rgba(232,146,74,0.07)',
    glow: 'none',
    animation: 'none',
  },
  common: {
    border: '2px solid rgba(232,146,74,0.55)',
    boxShadow: '0 0 0 4px rgba(232,146,74,0.09), 0 0 16px rgba(232,146,74,0.12)',
    glow: 'rgba(232,146,74,0.18)',
    animation: 'none',
  },
  rare: {
    border: '2px solid rgba(91,156,246,0.7)',
    boxShadow: '0 0 0 4px rgba(91,156,246,0.12), 0 0 20px rgba(91,156,246,0.2)',
    glow: 'rgba(91,156,246,0.25)',
    animation: 'shimmer',
  },
  epic: {
    border: '2px solid rgba(163,127,212,0.8)',
    boxShadow: '0 0 0 4px rgba(163,127,212,0.15), 0 0 24px rgba(163,127,212,0.28)',
    glow: 'rgba(163,127,212,0.32)',
    animation: 'pulse',
  },
  legendary: {
    border: '2.5px solid #E8924A',
    boxShadow: '0 0 0 4px rgba(232,146,74,0.18), 0 0 32px rgba(232,146,74,0.38), 0 0 0 8px rgba(212,168,67,0.07)',
    glow: 'rgba(232,146,74,0.45)',
    animation: 'legendary-spin',
  },
}

// ── CARD GRADIENTS ────────────────────────────────────────────────────────────
// The identity card background evolves with max rarity.
export const CARD_GRADIENTS = {
  none:      'linear-gradient(155deg, rgba(32,26,16,0.88) 0%, rgba(14,11,8,0.96) 100%)',
  common:    'linear-gradient(155deg, rgba(36,28,18,0.90) 0%, rgba(14,11,8,0.96) 100%)',
  rare:      'linear-gradient(155deg, rgba(20,28,48,0.90) 0%, rgba(10,14,24,0.97) 100%)',
  epic:      'linear-gradient(155deg, rgba(28,18,44,0.92) 0%, rgba(12,8,20,0.97) 100%)',
  legendary: 'linear-gradient(155deg, rgba(36,22,10,0.94) 0%, rgba(16,10,4,0.98) 100%)',
}

// ── HELPER — compute active rewards from unlockedBadges + currentStreak ───────
export function computeRewards(unlockedBadges = [], currentStreak = 0) {
  const unlockedIds = new Set((unlockedBadges || []).map(b => b.id))

  // Highest rarity
  const RARITY_ORDER = ['legendary', 'epic', 'rare', 'common']
  let maxRarity = 'none'
  for (const r of RARITY_ORDER) {
    if ((unlockedBadges || []).some(b => b.rarity === r)) { maxRarity = r; break }
  }

  // Active streak emblem — highest tier where badge is earned AND current streak meets threshold
  let streakEmblem = null
  for (const e of STREAK_EMBLEMS) {
    if (unlockedIds.has(e.badgeId) && currentStreak >= e.minStreak) {
      streakEmblem = e // last one wins (highest)
    }
  }

  // Active title — last earned badge in priority list wins
  let activeTitle = null
  for (const t of PROFILE_TITLES) {
    if (unlockedIds.has(t.badgeId)) activeTitle = t
  }

  // Avatar frame style
  const avatarFrame = AVATAR_FRAMES[maxRarity] || AVATAR_FRAMES.none

  // Card gradient
  const cardGradient = CARD_GRADIENTS[maxRarity] || CARD_GRADIENTS.none

  // Best 3 badges for showcase (by rarity, then most recent)
  const rarityScore = { legendary: 4, epic: 3, rare: 2, common: 1 }
  const showcaseBadges = [...(unlockedBadges || [])]
    .sort((a, b) => {
      const rDiff = (rarityScore[b.rarity] || 0) - (rarityScore[a.rarity] || 0)
      if (rDiff !== 0) return rDiff
      return new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0)
    })
    .slice(0, 3)

  return { maxRarity, streakEmblem, activeTitle, avatarFrame, cardGradient, showcaseBadges }
}
