// ─── GRAW Badge System — 38 badges across 7 categories ───────────────────────

export const RARITY_STYLES = {
  common: {
    frameBg: '#2A2520',
    frameGradient: 'linear-gradient(135deg, #2A2520 0%, #1A1510 100%)',
    borderColor1: 'rgba(255,235,200,0.2)',
    borderColor2: 'rgba(255,235,200,0.06)',
    glowColor: 'rgba(255,235,200,0.1)',
    iconColor: '#A89070',
    label: 'Común',
    labelColor: '#A89070',
    shimmer: false,
    particles: false,
  },
  rare: {
    frameBg: '#1A2535',
    frameGradient: 'linear-gradient(135deg, #1A2535 0%, #0F1520 100%)',
    borderColor1: 'rgba(91,156,246,0.5)',
    borderColor2: 'rgba(91,156,246,0.1)',
    glowColor: 'rgba(91,156,246,0.2)',
    iconColor: '#5B9CF6',
    label: 'Raro',
    labelColor: '#5B9CF6',
    shimmer: true,
    particles: false,
  },
  epic: {
    frameBg: '#251535',
    frameGradient: 'linear-gradient(135deg, #251535 0%, #150D20 100%)',
    borderColor1: 'rgba(163,127,212,0.6)',
    borderColor2: 'rgba(163,127,212,0.1)',
    glowColor: 'rgba(163,127,212,0.3)',
    iconColor: '#A37FD4',
    label: 'Épico',
    labelColor: '#A37FD4',
    shimmer: true,
    particles: false,
  },
  legendary: {
    frameBg: '#2A1A08',
    frameGradient: 'linear-gradient(135deg, #2A1A08 0%, #1A0E02 100%)',
    borderColor1: '#E8924A',
    borderColor2: '#D4A843',
    glowColor: 'rgba(232,146,74,0.4)',
    iconColor: '#E8924A',
    label: 'Legendario',
    labelColor: '#E8924A',
    shimmer: true,
    particles: true,
  },
}

export const CATEGORY_LABELS = {
  milestones:   'Hitos',
  consistency:  'Consistencia',
  sessions:     'Sesiones',
  volume:       'Volumen',
  strength:     'Fuerza',
  exploration:  'Exploración',
  mastery:      'Maestría',
}

export const ALL_BADGES = [

  // ════════════════════════════════════════
  // PRIMER CONTACTO
  // ════════════════════════════════════════

  {
    id: 'first_login',
    name: 'Bienvenido a GRAW',
    description: 'Completaste el proceso de inicio',
    flavor: 'Todo comienza con un primer paso.',
    category: 'milestones',
    rarity: 'common',
    icon: 'Sparkles',
    shape: 'circle',
    condition: (s) => s.onboardingComplete,
  },

  {
    id: 'first_session',
    name: 'Primera Sesión',
    description: 'Completaste tu primer entrenamiento',
    flavor: 'El primer rep es el más difícil. Ya lo tienes.',
    category: 'milestones',
    rarity: 'common',
    icon: 'Play',
    shape: 'circle',
    condition: (s) => s.totalSessions >= 1,
    progress: (s) => ({ current: Math.min(s.totalSessions, 1), total: 1 }),
  },

  {
    id: 'first_pr',
    name: 'Primer Récord',
    description: 'Conseguiste tu primer PR',
    flavor: 'El techo siempre fue más alto de lo que creías.',
    category: 'strength',
    rarity: 'common',
    icon: 'Star',
    shape: 'hexagon',
    condition: (s) => s.totalPRs >= 1,
    progress: (s) => ({ current: Math.min(s.totalPRs, 1), total: 1 }),
  },

  {
    id: 'first_weight_log',
    name: 'Báscula Iniciada',
    description: 'Registraste tu primer peso corporal',
    flavor: 'Los datos son poder. Ya empiezas a usarlo.',
    category: 'milestones',
    rarity: 'common',
    icon: 'Scale',
    shape: 'circle',
    // Only fires on manual logs — onboarding weight entry does NOT count
    condition: (s) => s.manualWeightLogs >= 1,
    progress: (s) => ({ current: Math.min(s.manualWeightLogs, 1), total: 1 }),
  },

  // ════════════════════════════════════════
  // CONSISTENCY — streaks
  // ════════════════════════════════════════

  {
    id: 'streak_3',
    name: 'Tres en Raya',
    description: 'Racha de 3 días entrenando',
    flavor: 'El hábito empieza a formarse.',
    category: 'consistency',
    rarity: 'common',
    icon: 'Zap',
    shape: 'shield',
    condition: (s) => s.maxStreak >= 3,
    progress: (s) => ({ current: Math.min(s.currentStreak, 3), total: 3 }),
  },

  {
    id: 'streak_7',
    name: 'Una Semana Sólida',
    description: 'Racha de 7 días consecutivos',
    flavor: 'Una semana entera. Sin excusas.',
    category: 'consistency',
    rarity: 'common',
    icon: 'Shield',
    shape: 'shield',
    condition: (s) => s.maxStreak >= 7,
    progress: (s) => ({ current: Math.min(s.currentStreak, 7), total: 7 }),
  },

  {
    id: 'streak_14',
    name: 'Dos Semanas de Hierro',
    description: 'Racha de 14 días consecutivos',
    flavor: 'Cuando apareces aunque no apetezca, eso es carácter.',
    category: 'consistency',
    rarity: 'rare',
    icon: 'ShieldCheck',
    shape: 'shield',
    condition: (s) => s.maxStreak >= 14,
    progress: (s) => ({ current: Math.min(s.currentStreak, 14), total: 14 }),
  },

  {
    id: 'streak_30',
    name: 'Un Mes Imparable',
    description: 'Racha de 30 días consecutivos',
    flavor: 'Treinta días. No todos lo consiguen.',
    category: 'consistency',
    rarity: 'epic',
    icon: 'ShieldCheck',
    shape: 'shield',
    condition: (s) => s.maxStreak >= 30,
    progress: (s) => ({ current: Math.min(s.currentStreak, 30), total: 30 }),
  },

  {
    id: 'streak_60',
    name: 'Máquina de Guerra',
    description: 'Racha de 60 días consecutivos',
    flavor: 'Sesenta días sin rendirse. Eres diferente.',
    category: 'consistency',
    rarity: 'epic',
    icon: 'Flame',
    shape: 'shield',
    condition: (s) => s.maxStreak >= 60,
    progress: (s) => ({ current: Math.min(s.currentStreak, 60), total: 60 }),
  },

  {
    id: 'streak_100',
    name: 'Centurión',
    description: 'Racha de 100 días consecutivos',
    flavor: 'Cien días. Una transformación completa.',
    category: 'consistency',
    rarity: 'legendary',
    icon: 'Crown',
    shape: 'crown',
    condition: (s) => s.maxStreak >= 100,
    progress: (s) => ({ current: Math.min(s.currentStreak, 100), total: 100 }),
  },

  // ════════════════════════════════════════
  // SESSIONS — total workouts
  // ════════════════════════════════════════

  {
    id: 'sessions_10',
    name: 'Doble Dígito',
    description: '10 sesiones completadas',
    flavor: 'Ya sabes cómo sabe el cansancio bueno.',
    category: 'sessions',
    rarity: 'common',
    icon: 'Dumbbell',
    shape: 'circle',
    condition: (s) => s.totalSessions >= 10,
    progress: (s) => ({ current: Math.min(s.totalSessions, 10), total: 10 }),
  },

  {
    id: 'sessions_25',
    name: 'Constante',
    description: '25 sesiones completadas',
    flavor: 'Veinticinco veces dijiste que sí.',
    category: 'sessions',
    rarity: 'common',
    icon: 'Activity',
    shape: 'circle',
    condition: (s) => s.totalSessions >= 25,
    progress: (s) => ({ current: Math.min(s.totalSessions, 25), total: 25 }),
  },

  {
    id: 'sessions_50',
    name: 'Medio Centenar',
    description: '50 sesiones completadas',
    flavor: 'Cincuenta sesiones. El gym ya te conoce.',
    category: 'sessions',
    rarity: 'rare',
    icon: 'BarChart2',
    shape: 'hexagon',
    condition: (s) => s.totalSessions >= 50,
    progress: (s) => ({ current: Math.min(s.totalSessions, 50), total: 50 }),
  },

  {
    id: 'sessions_100',
    name: 'Centenario',
    description: '100 sesiones completadas',
    flavor: 'Cien entrenamientos. Un atleta de verdad.',
    category: 'sessions',
    rarity: 'epic',
    icon: 'Trophy',
    shape: 'star',
    condition: (s) => s.totalSessions >= 100,
    progress: (s) => ({ current: Math.min(s.totalSessions, 100), total: 100 }),
  },

  {
    id: 'sessions_250',
    name: 'Veterano',
    description: '250 sesiones completadas',
    flavor: 'Doscientas cincuenta veces. Esto ya es quién eres.',
    category: 'sessions',
    rarity: 'legendary',
    icon: 'Medal',
    shape: 'diamond',
    condition: (s) => s.totalSessions >= 250,
    progress: (s) => ({ current: Math.min(s.totalSessions, 250), total: 250 }),
  },

  // ════════════════════════════════════════
  // VOLUME — total kg lifted
  // ════════════════════════════════════════

  {
    id: 'volume_1000',
    name: 'Primera Tonelada',
    description: '1,000 kg de volumen total',
    flavor: 'Tu primera tonelada. La más importante.',
    category: 'volume',
    rarity: 'common',
    icon: 'Weight',
    shape: 'circle',
    condition: (s) => s.totalVolume >= 1000,
    progress: (s) => ({ current: Math.min(s.totalVolume, 1000), total: 1000 }),
  },

  {
    id: 'volume_10000',
    name: 'Diez Toneladas',
    description: '10,000 kg de volumen total',
    flavor: 'Diez mil kilos. El gimnasio te debe algo.',
    category: 'volume',
    rarity: 'rare',
    icon: 'Package',
    shape: 'hexagon',
    condition: (s) => s.totalVolume >= 10000,
    progress: (s) => ({ current: Math.min(s.totalVolume, 10000), total: 10000 }),
  },

  {
    id: 'volume_50000',
    name: 'Cincuenta Toneladas',
    description: '50,000 kg de volumen total',
    flavor: 'El hierro ya te conoce mejor que nadie.',
    category: 'volume',
    rarity: 'epic',
    icon: 'Layers',
    shape: 'hexagon',
    condition: (s) => s.totalVolume >= 50000,
    progress: (s) => ({ current: Math.min(s.totalVolume, 50000), total: 50000 }),
  },

  {
    id: 'volume_100000',
    name: 'Leyenda del Hierro',
    description: '100,000 kg de volumen total',
    flavor: 'Cien toneladas. Una leyenda real.',
    category: 'volume',
    rarity: 'legendary',
    icon: 'Mountain',
    shape: 'diamond',
    condition: (s) => s.totalVolume >= 100000,
    progress: (s) => ({ current: Math.min(s.totalVolume, 100000), total: 100000 }),
  },

  // ════════════════════════════════════════
  // STRENGTH — PR milestones
  // ════════════════════════════════════════

  {
    id: 'pr_5',
    name: 'Récords Personales',
    description: '5 PRs conseguidos',
    flavor: 'Cada récord es la prueba de que mejoras.',
    category: 'strength',
    rarity: 'common',
    icon: 'TrendingUp',
    shape: 'hexagon',
    condition: (s) => s.totalPRs >= 5,
    progress: (s) => ({ current: Math.min(s.totalPRs, 5), total: 5 }),
  },

  {
    id: 'pr_25',
    name: 'Rompe Límites',
    description: '25 PRs conseguidos',
    flavor: 'Veinticinco veces superaste tu mejor marca.',
    category: 'strength',
    rarity: 'rare',
    icon: 'TrendingUp',
    shape: 'hexagon',
    condition: (s) => s.totalPRs >= 25,
    progress: (s) => ({ current: Math.min(s.totalPRs, 25), total: 25 }),
  },

  {
    id: 'squat_bodyweight',
    name: 'Sentadilla Corporal',
    description: 'Sentadilla con tu peso corporal',
    flavor: 'Cargar con uno mismo. En todos los sentidos.',
    category: 'strength',
    rarity: 'rare',
    icon: 'ArrowDown',
    shape: 'hexagon',
    condition: (s) => s.squatPR > 0 && s.currentWeight > 0 && s.squatPR >= s.currentWeight,
    progress: (s) => ({ current: Math.min(s.squatPR, s.currentWeight || 1), total: s.currentWeight || 80 }),
  },

  {
    id: 'bench_bodyweight',
    name: 'Press tu Peso',
    description: 'Press banca con tu peso corporal',
    flavor: 'Levantar tu propio peso. Literalmente.',
    category: 'strength',
    rarity: 'rare',
    icon: 'ArrowUp',
    shape: 'hexagon',
    condition: (s) => s.benchPR > 0 && s.currentWeight > 0 && s.benchPR >= s.currentWeight,
    progress: (s) => ({ current: Math.min(s.benchPR, s.currentWeight || 1), total: s.currentWeight || 80 }),
  },

  {
    id: 'deadlift_2x',
    name: 'El Doble',
    description: 'Peso muerto con 2× tu peso corporal',
    flavor: 'Dos veces tú. Eso es fuerza real.',
    category: 'strength',
    rarity: 'epic',
    icon: 'Dumbbell',
    shape: 'diamond',
    condition: (s) => s.deadliftPR > 0 && s.currentWeight > 0 && s.deadliftPR >= s.currentWeight * 2,
    progress: (s) => ({ current: Math.min(s.deadliftPR, (s.currentWeight || 1) * 2), total: (s.currentWeight || 80) * 2 }),
  },

  {
    id: 'pr_week',
    name: 'Semana Perfecta',
    description: '3 o más PRs en la misma semana',
    flavor: 'Una semana donde todo encajó a la perfección.',
    category: 'strength',
    rarity: 'epic',
    icon: 'Sparkles',
    shape: 'star',
    condition: (s) => s.maxPRsInOneWeek >= 3,
    progress: (s) => ({ current: Math.min(s.maxPRsInOneWeek, 3), total: 3 }),
  },

  // ════════════════════════════════════════
  // EXPLORATION — muscle groups & variety
  // ════════════════════════════════════════

  {
    id: 'all_muscles',
    name: 'Atleta Completo',
    description: 'Has entrenado todos los grupos musculares',
    flavor: 'El cuerpo entero. Sin puntos débiles.',
    category: 'exploration',
    rarity: 'rare',
    icon: 'User',
    shape: 'star',
    condition: (s) => s.uniqueMusclesTrainedCount >= 7,
    progress: (s) => ({ current: Math.min(s.uniqueMusclesTrainedCount, 7), total: 7 }),
  },

  {
    id: 'exercises_20',
    name: 'Arsenal',
    description: '20 ejercicios diferentes registrados',
    flavor: 'Un atleta con muchas herramientas.',
    category: 'exploration',
    rarity: 'rare',
    icon: 'Grid',
    shape: 'hexagon',
    condition: (s) => s.uniqueExercisesCount >= 20,
    progress: (s) => ({ current: Math.min(s.uniqueExercisesCount, 20), total: 20 }),
  },

  {
    id: 'custom_program',
    name: 'Tu Programa',
    description: 'Creaste y guardaste tu primer programa personalizado',
    flavor: 'El mejor programa es el que diseñas tú.',
    category: 'exploration',
    rarity: 'common',
    icon: 'PenLine',
    shape: 'circle',
    // Only fires when user manually creates a program in the editor
    // Programs auto-created by personalizeFromOnboarding() do NOT count
    condition: (s) => s.userCreatedPrograms >= 1,
  },

  {
    id: 'custom_exercise',
    name: 'Inventor',
    description: 'Añadiste un ejercicio personalizado',
    flavor: 'No te limites al catálogo.',
    category: 'exploration',
    rarity: 'common',
    icon: 'Plus',
    shape: 'circle',
    condition: (s) => s.customExercisesCreated >= 1,
  },

  // ════════════════════════════════════════
  // MASTERY — long-term dedication
  // ════════════════════════════════════════

  {
    id: 'weeks_active_4',
    name: 'Un Mes de Juego',
    description: '4 semanas con al menos 2 sesiones',
    flavor: 'Cuatro semanas siendo regular.',
    category: 'mastery',
    rarity: 'common',
    icon: 'Calendar',
    shape: 'shield',
    condition: (s) => s.activeWeeks >= 4,
    progress: (s) => ({ current: Math.min(s.activeWeeks, 4), total: 4 }),
  },

  {
    id: 'weeks_active_12',
    name: 'Trimestre Élite',
    description: '12 semanas activas',
    flavor: 'Tres meses de trabajo constante.',
    category: 'mastery',
    rarity: 'rare',
    icon: 'CalendarDays',
    shape: 'shield',
    condition: (s) => s.activeWeeks >= 12,
    progress: (s) => ({ current: Math.min(s.activeWeeks, 12), total: 12 }),
  },

  {
    id: 'weeks_active_52',
    name: 'Un Año de Hierro',
    description: '52 semanas activas',
    flavor: 'Un año entero. Cambiado para siempre.',
    category: 'mastery',
    rarity: 'legendary',
    icon: 'Globe',
    shape: 'crown',
    condition: (s) => s.activeWeeks >= 52,
    progress: (s) => ({ current: Math.min(s.activeWeeks, 52), total: 52 }),
  },

  {
    id: 'goal_reached',
    name: 'Objetivo Cumplido',
    description: 'Alcanzaste tu objetivo de peso corporal',
    flavor: 'Lo dijiste. Lo hiciste.',
    category: 'mastery',
    rarity: 'legendary',
    icon: 'Target',
    shape: 'star',
    condition: (s) => s.goalReached === true,
  },

  {
    id: 'morning_warrior',
    name: 'Guerrero Madrugador',
    description: '10 sesiones antes de las 8:00am',
    flavor: 'Mientras otros duermen, tú construyes.',
    category: 'mastery',
    rarity: 'rare',
    icon: 'Sunrise',
    shape: 'circle',
    condition: (s) => s.earlyMorningSessions >= 10,
    progress: (s) => ({ current: Math.min(s.earlyMorningSessions, 10), total: 10 }),
  },

  {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: '10 sesiones después de las 22:00',
    flavor: 'La noche también es tuya.',
    category: 'mastery',
    rarity: 'rare',
    icon: 'Moon',
    shape: 'circle',
    condition: (s) => s.lateSessions >= 10,
    progress: (s) => ({ current: Math.min(s.lateSessions, 10), total: 10 }),
  },

  {
    id: 'weight_logged_30',
    name: 'Disciplina Total',
    description: '30 registros de peso corporal',
    flavor: 'Lo que se mide, mejora.',
    category: 'mastery',
    rarity: 'rare',
    icon: 'ClipboardList',
    shape: 'shield',
    condition: (s) => s.totalWeightLogs >= 30,
    progress: (s) => ({ current: Math.min(s.totalWeightLogs, 30), total: 30 }),
  },

  {
    id: 'perfect_week',
    name: 'Semana Sin Fallos',
    description: 'Completaste todos los días de tu programa en una semana',
    flavor: 'Cero días perdidos. Eso es excelencia.',
    category: 'mastery',
    rarity: 'epic',
    icon: 'CheckCircle',
    shape: 'star',
    condition: (s) => s.perfectWeeks >= 1,
    progress: (s) => ({ current: Math.min(s.perfectWeeks, 1), total: 1 }),
  },

  {
    id: 'all_badges',
    name: 'El Coleccionista',
    description: 'Desbloqueaste todos los demás logros',
    flavor: 'No hay nada más que demostrar. Lo tienes todo.',
    category: 'mastery',
    rarity: 'legendary',
    icon: 'Award',
    shape: 'crown',
    condition: (s) => s.unlockedBadgesCount >= 37,
  },
]
