// ─── calculateUserStats ────────────────────────────────────────────────────────
// Single source of truth for all badge conditions. Memoize at call site.

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function weekKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, '0')}`
}

export function calculateUserStats(sessions, bodyMetrics, user, programs, prs, storeCounters = {}) {
  // ── Basic counts ──────────────────────────────────────────────────────────
  const totalSessions = sessions.length
  const totalVolume = sessions.reduce((s, sess) => s + (sess.totalVolume ?? 0), 0)

  // ── PRs — count from prs store object ────────────────────────────────────
  const totalPRs = Object.keys(prs || {}).length

  // ── Per-exercise best weight from sessions ────────────────────────────────
  const prMap = {}
  sessions.forEach(s =>
    s.exercises?.forEach(e => {
      e.sets?.forEach(set => {
        const w = parseFloat(set.weight) || 0
        if (w > 0 && (!prMap[e.exerciseId] || w > prMap[e.exerciseId])) {
          prMap[e.exerciseId] = w
        }
      })
    })
  )

  // Map common exercise IDs used in badge conditions
  // The store uses IDs like 'squat', 'bench', 'deadlift' — check both variants
  const squatPR = prMap['squat'] || prMap['squat_barra'] || 0
  const benchPR = prMap['bench'] || prMap['press_banca'] || 0
  const deadliftPR = prMap['deadlift'] || prMap['peso_muerto'] || 0

  // ── Streak — cycle-based, read from store ──────────────────────────────────
  const currentStreak = storeCounters.streakCurrentStreak ?? 0
  const maxStreak = Math.max(storeCounters.streakLongestStreak ?? 0, currentStreak)

  // ── Active weeks (weeks with >= 2 sessions) ───────────────────────────────
  const byWeek = {}
  sessions.forEach(s => {
    if (!s.date) return
    const wk = weekKey(new Date(s.date))
    byWeek[wk] = (byWeek[wk] ?? 0) + 1
  })
  const activeWeeks = Object.values(byWeek).filter(c => c >= 2).length

  // ── Perfect weeks ─────────────────────────────────────────────────────────
  const activeProg = programs?.find(p => p.id === user?.activeProgram)
  const daysPerWeek = activeProg?.days?.length ?? 3
  const perfectWeeks = Object.values(byWeek).filter(c => c >= daysPerWeek).length

  // ── Muscle & exercise diversity ───────────────────────────────────────────
  const musclesSeen = new Set()
  const exercisesSeen = new Set()
  sessions.forEach(s =>
    s.exercises?.forEach(e => {
      if (e.muscle) musclesSeen.add(e.muscle)
      if (e.exerciseId) exercisesSeen.add(e.exerciseId)
    })
  )

  // ── Time-based sessions ───────────────────────────────────────────────────
  const earlyMorningSessions = sessions.filter(s => {
    const h = new Date(s.startTime ?? s.date).getHours()
    return h < 8
  }).length

  const lateSessions = sessions.filter(s => {
    const h = new Date(s.startTime ?? s.date).getHours()
    return h >= 22
  }).length

  // ── Max PRs in one week ───────────────────────────────────────────────────
  // Approximate: count sessions with PRs by week
  const prsByWeek = {}
  Object.entries(prs || {}).forEach(([, pr]) => {
    if (!pr?.date) return
    const wk = weekKey(new Date(pr.date))
    prsByWeek[wk] = (prsByWeek[wk] ?? 0) + 1
  })
  const maxPRsInOneWeek = Math.max(0, ...Object.values(prsByWeek))

  // ── Goal reached ──────────────────────────────────────────────────────────
  const sortedMetrics = [...(bodyMetrics || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )
  const latestWeight = sortedMetrics[sortedMetrics.length - 1]?.weight ?? user?.currentWeight
  const goalReached = user?.goalWeight && latestWeight
    ? (user?.goal === 'bajar_grasa'
        ? latestWeight <= user.goalWeight
        : latestWeight >= user.goalWeight)
    : false

  return {
    totalSessions,
    totalVolume,
    totalPRs,
    currentStreak,
    maxStreak,
    activeWeeks,
    perfectWeeks,
    uniqueMusclesTrainedCount: musclesSeen.size,
    uniqueExercisesCount: exercisesSeen.size,
    earlyMorningSessions,
    lateSessions,
    maxPRsInOneWeek,
    goalReached,
    squatPR,
    benchPR,
    deadliftPR,
    currentWeight: latestWeight ?? user?.currentWeight ?? 0,
    totalWeightLogs: (bodyMetrics || []).length,
    // Manual-only counters — pulled from store, not derived from data
    // This is the only correct source of truth for badge conditions
    userCreatedPrograms: storeCounters.userCreatedPrograms ?? 0,
    manualWeightLogs: storeCounters.manualWeightLogs ?? 0,
    onboardingComplete: !!(user?.name && user?.level && user?.goal),
    // Legacy — kept for backward compat but no longer used in badge conditions
    customProgramsCreated: (programs || []).filter(p => p.source === 'user').length,
    customExercisesCreated: 0,
    unlockedBadgesCount: 0, // filled in after badge check
  }
}
