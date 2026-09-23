import { getExerciseCatalog, type CatalogExercise } from './catalog'
import { generatedWorkoutSchema, type GeneratedWorkout } from './geminiProvider'
import {
  defaultInstructions,
  muscleImageFor,
  weekSplitsForProfile,
  youtubeTutorialUrl,
  type SplitTemplate,
} from './muscleMedia'

type ProfileLite = {
  goal?: string | null
  experienceLevel?: string | null
  trainingDaysPerWeek?: number | null
  sessionMinutes?: number | null
  equipmentAccess?: string[] | null
  injuries?: string | null
}

function matchesEquipment(ex: CatalogExercise, access?: string[] | null): boolean {
  if (!access || access.length === 0) return true
  const eq = ex.equipment.toLowerCase()
  if (access.includes('full_gym') || access.includes('basic_gym')) return true
  if (access.includes('bodyweight')) {
    return eq.includes('peso corporal') || eq.includes('barra fixa') || eq.includes('banco')
  }
  if (access.includes('home_weights')) {
    return (
      eq.includes('halter') ||
      eq.includes('peso corporal') ||
      eq.includes('elást') ||
      eq.includes('banco')
    )
  }
  if (access.includes('outdoor')) {
    return eq.includes('peso corporal') || eq.includes('barra fixa')
  }
  return true
}

function difficultyOk(ex: CatalogExercise, level?: string | null): boolean {
  if (!level || level === 'advanced') return true
  if (level === 'beginner') return ex.difficulty === 'Iniciante' || ex.difficulty === 'Intermediário'
  if (level === 'intermediate') return ex.difficulty !== 'Avançado' || Math.random() > 0.7
  return true
}

function pickFromGroup(
  pool: CatalogExercise[],
  muscle: string,
  count: number,
  already: Set<string>,
): CatalogExercise[] {
  const candidates = pool.filter((ex) => ex.muscle === muscle && !already.has(ex.name))
  const source = candidates.length ? candidates : pool.filter((ex) => !already.has(ex.name))
  const out: CatalogExercise[] = []
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  for (const ex of shuffled) {
    if (out.length >= count) break
    out.push(ex)
    already.add(ex.name)
  }
  return out
}

export function enrichExercise(ex: {
  name: string
  sets?: number
  reps?: string
  weight?: string
  rest?: string
  muscle?: string
  notes?: string
  instructions?: string
  youtubeUrl?: string
  muscleImage?: string
}): GeneratedWorkout['exercises'][number] {
  const catalog = getExerciseCatalog().find((c) => c.name === ex.name)
  const muscle = ex.muscle || catalog?.muscle || ''
  const equipment = catalog?.equipment || ex.notes || ''
  return {
    name: ex.name,
    sets: ex.sets ?? 3,
    reps: ex.reps ?? '8-12',
    weight: ex.weight || 'Ajustar',
    rest: ex.rest || '60-90s',
    muscle,
    notes: ex.notes || equipment,
    instructions:
      ex.instructions?.trim() || defaultInstructions(ex.name, muscle, equipment),
    youtubeUrl: ex.youtubeUrl?.trim() || youtubeTutorialUrl(ex.name),
    muscleImage: ex.muscleImage?.trim() || muscleImageFor(muscle),
  }
}

export function enrichWorkout(workout: GeneratedWorkout): GeneratedWorkout {
  return generatedWorkoutSchema.parse({
    ...workout,
    exercises: workout.exercises.map(enrichExercise),
  })
}

export function generateDayWorkoutFromCatalog(
  profile: ProfileLite,
  split: SplitTemplate,
): GeneratedWorkout {
  const catalog = getExerciseCatalog().filter(
    (ex) => matchesEquipment(ex, profile.equipmentAccess) && difficultyOk(ex, profile.experienceLevel),
  )
  const pool = catalog.length >= 6 ? catalog : getExerciseCatalog()

  const used = new Set<string>()
  const picked = [
    ...pickFromGroup(pool, split.primary, 4, used),
    ...pickFromGroup(pool, split.secondary, 3, used),
  ]

  while (picked.length < 5) {
    const choice = pool[Math.floor(Math.random() * pool.length)]
    if (choice && !used.has(choice.name)) {
      picked.push(choice)
      used.add(choice.name)
    }
  }

  const goal = profile.goal === 'weight_loss' ? 'emagrecimento' : 'hipertrofia'
  const sets = goal === 'emagrecimento' ? 3 : 4
  const reps = goal === 'emagrecimento' ? '12-15' : '8-12'

  return generatedWorkoutSchema.parse({
    title: `${split.weekdayLabel} — ${split.title}`,
    weekday: split.weekday,
    splitLabel: split.splitLabel,
    observations: `Divisão ${split.splitLabel} (${split.weekdayLabel}). Ajuste a carga com segurança e use o tutorial se tiver dúvida.`,
    exercises: picked.map((ex) =>
      enrichExercise({
        name: ex.name,
        sets,
        reps,
        weight: 'Ajustar',
        rest: goal === 'emagrecimento' ? '45-60s' : '60-90s',
        muscle: ex.muscle,
        notes: ex.equipment,
      }),
    ),
  })
}

/** Gera a semana inteira (um treino por dia). */
export function generateWeekFromCatalog(profile: ProfileLite): GeneratedWorkout[] {
  const splits = weekSplitsForProfile(profile.trainingDaysPerWeek)
  return splits.map((split) => generateDayWorkoutFromCatalog(profile, split))
}

/** @deprecated use generateDayWorkoutFromCatalog / generateWeekFromCatalog */
export function generateWorkoutFromCatalog(
  profile: ProfileLite,
  _usedWeekdays: string[] = [],
  forcedSplit?: SplitTemplate,
): GeneratedWorkout {
  const split = forcedSplit || weekSplitsForProfile(profile.trainingDaysPerWeek)[0]!
  return generateDayWorkoutFromCatalog(profile, split)
}
