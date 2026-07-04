# GRAW V2 — CONTEXTO TÉCNICO COMPLETO

> **ESTADO (jul 2026): V2 IMPLEMENTADA.** Los bugs de la sección 4 están corregidos y los gaps de la sección 6 cubiertos. Nuevos módulos: `utils/prEngine.js` (única fuente de PR/e1RM; `prFlags` se graba en cada set al completarlo), `utils/progression.js` (doble progresión, plateau, deload), `utils/analytics.js` (ventanas S/M/6M/A, sets fraccionales por músculo vs MEV/MRV, adherencia, RIR, tendencias por patrón), `data/movementPatterns.js` (patrón + músculos secundarios de los 110 ejercicios), `components/progress/AnalyticsV2.jsx`. Store migrado a `version: 2` (rebuild de PRs + `exerciseNotes` persistentes por ejercicio). RIR opcional por set con chips post-completar y sheet educativo. Texto mono de ExerciseCard cicla ANT→PR→META por tap. Export/import incluye los campos v2. `usePRDetection` eliminado.
> Auditoría del código actual (jul 2026). Fuente para diseñar la V2 de tracking/KPIs.
> Complementa `GRAW_CONTEXT.txt` (identidad de marca y reglas de diseño — sigue vigente).

---

## 1. STACK Y ARQUITECTURA

- **Stack:** React 19 + Vite 7 + PWA (vite-plugin-pwa, autoUpdate) · Zustand 5 (persist → localStorage, key `liftvault-storage`) · Framer Motion 12 · Recharts 3 · date-fns 4 · Tailwind 4 (uso mínimo, casi todo inline styles) · lucide-react.
- **Sin backend.** 100% offline, localStorage único storage. Sin tests. Sin TypeScript.
- **Navegación:** state manual en `App.jsx` (`activeTab`), 6 tabs: Hoy, Historial, Entrenar, Progreso, Programas, Perfil. Transiciones custom con blur/translate.
- **Timers:** Web Worker (`timer.worker.js`) + `graw_workout_start_ts` en localStorage para sobrevivir a reloads.

### Estructura src/
```
store/index.js        ← Zustand: TODO el estado + lógica de negocio (689 líneas)
store/seedData.js     ← programas/templates seed
data/                 ← exercises (110), presetPrograms (35 ids), badges (38), quotes, restProfiles (smart rest)
hooks/                ← useActiveWorkout, useGrawTimer (workout+rest), usePRDetection, useBadgeDetection, useWeeklyStats, useDragToReorder
utils/                ← oneRepMax (Brzycki), volume, userStats, dates, programs (ensureProgramTemplates), format, haptics
components/tabs/      ← 6 tabs
components/workout/   ← ActiveWorkout, ExerciseCard, SetRow, RestTimer, NoteSheet, FocusMode, WorkoutComplete, ExercisePicker
components/progress/  ← VolumeChart, StrengthCurve, Heatmap, BodyMetricsChart, PRBoard
components/programs/  ← ProgramEditor (1182 líneas), TemplateEditor, ProgramBrowser, CreateExerciseSheet
```

## 2. MODELO DE DATOS (Zustand persist)

```js
user            { name, unit, level, goal, currentWeight, goalWeight, goalTimeframe, weeklyTarget, avatarEmoji, ... }
programs        [{ id, name, days:[{ id, templateId }], source }]   // días → templateId (regla crítica)
templates       [{ id, name, exercises:[{ exerciseId, sets, weight, reps }], muscles }]
sessions        [{ id, templateId, programId, name, date, duration, exercises:[{ exerciseId, sets:[{weight,reps,completed,type?}], note? }], totalVolume, notes, muscles }]
activeWorkout   misma forma que session (persiste — sobrevive cierre de app)
prs             { [exerciseId]: { weight, reps, e1rm, date, repPRs: { [peso]: { reps, date } } } }
bodyMetrics     [{ id, date, weight, source }]
streak*         racha por CICLO de programa (no por día): streakCurrentStreak/Longest/CycleStart/CompletedDays
unlockedBadges, customExercises, settings { restTimerDefault:120, repRangeGuidance, ... }
```

- **e1RM:** fórmula Brzycki `w × 36/(37−reps)`, duplicada en 3 sitios (store, ExerciseCard, usePRDetection).
- **Volumen:** solo sets `completed`, `peso × reps`. Sin distinción por músculo en el agregado semanal (`getWeeklyVolume` suma `totalVolume` de sesión).

## 3. FUNCIONALIDADES ACTUALES

- **Hoy:** saludo, quote, StreakCard (racha por ciclos), día del programa activo, WeeklySummaryCard (resumen semanal condicional), CTA entrenar.
- **Entrenar:** workout desde template/programa o libre. ExerciseCard con: sets (peso/reps, bidireccional complete), dropsets (auto: −25% peso, +2 reps), añadir/quitar series, swap de ejercicio, nota (280 chars), drag-reorder, rest timer con presets y "smart rest" (restProfiles según % del PR), FocusMode, form tips para principiantes. Al terminar → WorkoutComplete (resumen + PRs de la sesión + notas de sesión).
- **Historial:** sesiones agrupadas por semana, editar notas, borrar, repetir.
- **Progreso:** VolumeChart (12 semanas), StrengthCurve (e1RM por ejercicio), Heatmap de frecuencia, BodyMetricsChart (peso corporal + meta), PRBoard (grid de PRs por e1rm).
- **Programas:** 35 presets, editor completo (días→templates, `ensureProgramTemplates` normaliza), ejercicios custom.
- **Perfil:** stats de usuario (userStats), 38 badges con cosmética (marcos, títulos, emblema racha), registro peso corporal, ajustes.

## 4. BUGS CONFIRMADOS (verificados en código)

### BUG 1 — "Más reps no cuenta como progreso" en el texto mono de ExerciseCard
`ExerciseCard.jsx` L82-89: el indicador `beating` ("↑" verde vs sesión anterior) compara **solo `todayMaxWeight > lastMaxWeight`**. Ignora reps y e1RM. Si haces mismo peso × más reps, no marca progreso — contradice el sistema de PR del store, que sí tiene rep-PRs.

### BUG 2 — Dos (tres) sistemas de PR paralelos e inconsistentes
1. **Store `isPRSet()`** (fuente correcta): e1rm-PR + rep-PR por peso. Usado por `completeSet` → toast "🏆 Nuevo récord" en ActiveWorkout, y por `finishWorkout` → WorkoutComplete.
2. **ExerciseCard L288-296**: reimplementa la lógica inline para el badge PR/+REPS del SetRow. Problema: se evalúa **contra el PR ya actualizado** por `completeSet` (el set que acaba de marcar PR deja de mostrarse como PR al re-render, `e1rm > currentPR.e1rm` es falso contra sí mismo). Además exige `existingRepRecord > 0` (primer rep-PR con un peso nunca marca).
3. **`usePRDetection.js`**: tercer sistema, solo e1rm, ignora rep-PRs. 
Y el menú "..." de ExerciseCard muestra `currentPR.weight × reps` (el par del máx e1rm) — otra "verdad" distinta a la del toast.
**Fix V2:** una sola fuente (selector del store), evaluar PR con snapshot pre-set, eliminar duplicados.

### BUG 3 — Notas de ejercicio no persisten entre sesiones
La nota vive en `activeWorkout.exercises[].note`. Al terminar queda enterrada en la session histórica; al empezar el siguiente workout, `startWorkout()` construye ejercicios desde el template **sin nota**. Además `swapExerciseInWorkout` la borra. No existe noción de "nota por ejercicio" (exercise-level, persistente) vs "nota de sesión". **Fix V2:** `exerciseNotes: { [exerciseId]: { text, updatedAt, pinned } }` en store + historial de notas por sesión.

### Deudas menores detectadas
- `finishWorkout` L469-476: cálculo de `muscles` roto — busca `stored.muscle` en los ejercicios del workout (no existe esa prop; habría que resolver vía `getExerciseById`). `session.muscles` siempre `[]`.
- `saveCustomExercise` escribe además a una key suelta `graw_custom_exercises` (redundante con persist).
- `deleteSession` **no recalcula PRs** → PRs huérfanos de sesiones borradas.
- PRs solo registran el máximo actual, **sin historial** → imposible graficar evolución de PR (StrengthCurve lo suple recalculando e1rm desde sessions, doble verdad otra vez).
- e1RM Brzycki duplicada ×3; `GRAW_CONTEXT.txt` describe keys `lv_*` que ya no existen (desactualizado).
- Racha por ciclo se resetea silenciosamente en `onRehydrateStorage` sin feedback al usuario.
- Todo en localStorage (~5MB límite, sin export/backup): riesgo real de pérdida de datos.

## 5. FEATURE PEDIDA: texto mono interactivo en ExerciseCard

Hoy el texto mono muestra sets de la última sesión (`80×8, 80×8, 75×10`), estático.
**V2:** convertirlo en toggle por tap (ciclo de 2-3 estados):
1. **Tap 1 →** última sesión: pesos × reps completos + fecha relativa (dato ya disponible en `lastSession`).
2. **Tap 2 →** PR histórico: `prs[exerciseId]` → peso × reps, e1RM, fecha.
3. (opcional) **Tap 3 →** objetivo sugerido (progresión).
Requisitos: touch target ≥44px, transición sutil, indicador visual de estado, y que `beating` use e1RM/rep-PR (fix Bug 1).

## 6. GAPS PARA EL TRACKING CIENTÍFICO V2 (lo que NO existe hoy)

- **Sin historial temporal de PRs/e1RM** — solo snapshot actual.
- **Sin RPE/RIR** en los sets → no se puede medir esfuerzo ni fatiga.
- **Sin volumen por grupo muscular por semana** (sets/semana por músculo — la métrica clave de la literatura de hipertrofia). `session.muscles` está roto y no hay agregado.
- **Sin ventanas de análisis** semana / mes / 6 meses / año — VolumeChart fijo a 12 semanas.
- **Sin KPIs con objetivos**: no hay targets de fuerza (e1RM goal), adherencia (% sesiones planificadas), tendencia de peso corporal vs goal con proyección.
- **Sin export/import de datos** ni backup.
- **Sin detección de estancamiento** (plateau) ni sugerencias de progresión (doble progresión, %1RM).
- Streak por ciclos es original pero opaca — no comunica adherencia semanal medible.

## 7. INVARIANTES A RESPETAR EN V2

- Identidad y HIG de `GRAW_CONTEXT.txt`: glassmorphism, DM Sans/Mono, accent #E8924A, touch ≥44px, safe areas, inputs ≥16px, curvas SETTLE/BOUNCE.
- Días de programa consumen **templateId** (usar `ensureProgramTemplates`).
- Migración de datos obligatoria: usar `version` + `migrate` de zustand persist para no romper datos existentes de usuarios.
- Una sola fuente de verdad por métrica (e1RM, PR, volumen) — selectores/utils compartidos, cero lógica duplicada en componentes.
