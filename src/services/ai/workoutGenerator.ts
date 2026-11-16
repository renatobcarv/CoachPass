import type { Payload } from 'payload'

import type { User, Workout } from '@/payload-types'
import { catalogForPrompt } from './catalog'
import { generateWeekWithGemini, type GeneratedWorkout } from './geminiProvider'
import { enrichWorkout, generateWeekFromCatalog } from './localWorkoutGenerator'
import { weekSplitsForProfile } from './muscleMedia'
import { assessGenerationRisk } from './riskGate'
import { getAiQuota } from './quota'

type ProfileDoc = {
  id: string | number
  goal?: string | null
  experienceLevel?: string | null
  trainingDaysPerWeek?: number | null
  sessionMinutes?: number | null
  equipmentAccess?: string[] | null
  medicalConditions?: string | null
  injuries?: string | null
  medications?: string | null
  heightCm?: number | null
  weightKg?: number | null
  birthDate?: string | null
  foodAllergies?: string | null
  dietaryRestrictions?: string | null
}

type Weekday = NonNullable<Workout['weekday']>

/** Respostas do quiz "Gerar treino com IA". Tudo opcional; o que faltar vem do perfil. */
export type WorkoutPreferences = {
  goal?: 'hypertrophy' | 'weight_loss' | 'strength' | 'conditioning'
  daysPerWeek?: number
  sessionMinutes?: number
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  equipment?: string[]
  focus?: string[]
  avoid?: string
}

const PREF_GOALS = ['hypertrophy', 'weight_loss', 'strength', 'conditioning'] as const
const PREF_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
const PREF_EQUIPMENT = ['full_gym', 'basic_gym', 'home_weights', 'bodyweight', 'outdoor'] as const
export const PREF_FOCUS = ['Peito', 'Costas', 'Pernas', 'Glúteos', 'Ombros', 'Braços', 'Abdômen'] as const

const GOAL_TEXT: Record<NonNullable<WorkoutPreferences['goal']>, string> = {
  hypertrophy: 'hipertrofia (ganho de massa muscular)',
  weight_loss: 'emagrecimento (gasto calórico com preservação de massa magra)',
  strength: 'força (séries de 4 a 6 repetições nos exercícios principais, descanso maior)',
  conditioning: 'condicionamento (circuitos e descansos curtos)',
}

/** Valida o corpo vindo do cliente: só valores de listas fechadas e um texto curto. */
export function sanitizeWorkoutPreferences(raw: unknown): WorkoutPreferences {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const prefs: WorkoutPreferences = {}
  if (PREF_GOALS.includes(r.goal as never)) prefs.goal = r.goal as WorkoutPreferences['goal']
  if (PREF_LEVELS.includes(r.experienceLevel as never)) {
    prefs.experienceLevel = r.experienceLevel as WorkoutPreferences['experienceLevel']
  }
  const days = Number(r.daysPerWeek)
  if (Number.isInteger(days) && days >= 3 && days <= 6) prefs.daysPerWeek = days
  const minutes = Number(r.sessionMinutes)
  if (Number.isInteger(minutes) && minutes >= 20 && minutes <= 120) prefs.sessionMinutes = minutes
  if (Array.isArray(r.equipment)) {
    const eq = r.equipment.filter((e): e is string => PREF_EQUIPMENT.includes(e as never))
    if (eq.length) prefs.equipment = [...new Set(eq)]
  }
  if (Array.isArray(r.focus)) {
    const focus = r.focus.filter((f): f is string => PREF_FOCUS.includes(f as never))
    if (focus.length) prefs.focus = [...new Set(focus)].slice(0, 3)
  }
  if (typeof r.avoid === 'string' && r.avoid.trim()) prefs.avoid = r.avoid.trim().slice(0, 280)
  return prefs
}

/** Aplica as respostas sobre o perfil. Objetivos extras do quiz caem no valor mais próximo do perfil. */
function applyPreferences(profile: ProfileDoc, prefs: WorkoutPreferences): ProfileDoc {
  const goal =
    prefs.goal === 'strength'
      ? 'hypertrophy'
      : prefs.goal === 'conditioning'
        ? 'weight_loss'
        : (prefs.goal ?? profile.goal)
  return {
    ...profile,
    goal,
    experienceLevel: prefs.experienceLevel ?? profile.experienceLevel,
    trainingDaysPerWeek: prefs.daysPerWeek ?? profile.trainingDaysPerWeek,
    sessionMinutes: prefs.sessionMinutes ?? profile.sessionMinutes,
    equipmentAccess: prefs.equipment ?? profile.equipmentAccess,
    // O que o aluno pediu para evitar passa pelo mesmo filtro de risco das lesões do perfil
    injuries: [profile.injuries, prefs.avoid].filter(Boolean).join('; ') || null,
  }
}

const WEEKDAYS: readonly Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

function toWeekday(value?: string | null): Weekday | undefined {
  return WEEKDAYS.find((day) => day === value)
}

function ageFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

function buildWeekPrompt(profile: ProfileDoc, prefs: WorkoutPreferences = {}): string {
  const age = ageFromBirthDate(profile.birthDate)
  const splits = weekSplitsForProfile(profile.trainingDaysPerWeek)
  const plan = splits
    .map(
      (s) =>
        `- ${s.weekdayLabel} (${s.weekday}): ${s.splitLabel} — título sugerido "${s.weekdayLabel} — ${s.title}"`,
    )
    .join('\n')

  return `Você é um assistente de treino do CoachPass. Gere a SEMANA INTEIRA de treinos em JSON válido.
Regras:
- Gere exatamente ${splits.length} dias, um objeto por dia, com divisões SEPARADAS (não misture full body).
- Dias obrigatórios:
${plan}
- Use APENAS exercícios da lista (campo name idêntico). Não invente.
- Sem dados pessoais.
- Cada dia: 5 a 8 exercícios só dos grupos daquele dia.
- instructions curtas em português. youtubeUrl e muscleImage vazios.
- Resposta SOMENTE:
{"days":[{"title":"Segunda — ...","weekday":"monday","splitLabel":"Costas + Bíceps","observations":"...","exercises":[{"name":"...","sets":3,"reps":"8-12","weight":"Ajustar","rest":"60s","muscle":"Costas","notes":"","instructions":"..."}]}]}

Pedido do aluno neste treino:
- Objetivo: ${prefs.goal ? GOAL_TEXT[prefs.goal] : profile.goal}
- Ênfase: ${prefs.focus?.length ? `${prefs.focus.join(', ')} (inclua 1 a 2 exercícios a mais desses grupos na semana)` : 'equilibrado'}
- Evitar: ${prefs.avoid ? `${prefs.avoid} (não use exercícios que agravem isso)` : 'nada informado'}

Perfil: idade ${age ?? 'n/d'}, objetivo ${profile.goal}, experiência ${profile.experienceLevel || 'n/d'}, dias/semana ${profile.trainingDaysPerWeek || splits.length}, ${profile.sessionMinutes || '?'} min, equipamentos ${(profile.equipmentAccess || []).join(', ') || 'n/d'}.

Catálogo:
${catalogForPrompt(120)}
`
}

async function generateWeekWorkouts(
  profile: ProfileDoc,
  prefs: WorkoutPreferences = {},
): Promise<{ workouts: GeneratedWorkout[]; provider: string }> {
  const splits = weekSplitsForProfile(profile.trainingDaysPerWeek)
  const gemini = await generateWeekWithGemini(buildWeekPrompt(profile, prefs))

  if (gemini.ok && gemini.data.days.length >= Math.min(3, splits.length)) {
    const byWeekday = new Map(gemini.data.days.map((d) => [d.weekday, d]))
    const workouts = splits.map((split) => {
      const fromAi = byWeekday.get(split.weekday)
      if (fromAi) {
        return enrichWorkout({
          ...fromAi,
          weekday: split.weekday,
          splitLabel: fromAi.splitLabel || split.splitLabel,
          title: fromAi.title?.includes(split.weekdayLabel)
            ? fromAi.title
            : `${split.weekdayLabel} — ${fromAi.title}`,
        })
      }
      return generateWeekFromCatalog(profile).find((w) => w.weekday === split.weekday)!
    })
    return { workouts: workouts.filter(Boolean), provider: 'gemini' }
  }

  return {
    workouts: generateWeekFromCatalog(profile),
    provider: process.env.GEMINI_API_KEY
      ? `local-fallback:${gemini.ok ? 'incomplete' : gemini.error}`
      : 'local-catalog',
  }
}

export async function createAiWorkoutForStudent(args: {
  payload: Payload
  userId: User['id']
  profile: ProfileDoc
  preferences?: WorkoutPreferences
}): Promise<
  | {
      ok: true
      workoutIds: Array<string | number>
      workouts: GeneratedWorkout[]
      remaining: number
      provider: string
    }
  | { ok: false; code: string; message: string; remaining?: number }
> {
  const { payload, userId } = args
  const preferences = args.preferences ?? {}
  const profile = applyPreferences(args.profile, preferences)

  const quota = await getAiQuota(payload, userId)
  if (quota.blocked) {
    return {
      ok: false,
      code: 'QUOTA_EXCEEDED',
      message: 'Você atingiu o limite de 2 gerações de treino neste mês.',
      remaining: 0,
    }
  }

  const risk = assessGenerationRisk(profile)
  if (risk.blocked) {
    await payload.create({
      collection: 'ai-generations',
      data: {
        user: userId,
        type: 'workout',
        status: 'blocked',
        provider: 'risk-gate',
        errorMessage: risk.reason,
      },
      overrideAccess: true,
    })
    return {
      ok: false,
      code: 'RISK_BLOCKED',
      message: risk.reason || 'Geração bloqueada.',
      remaining: quota.remaining,
    }
  }

  const pending = await payload.create({
    collection: 'ai-generations',
    data: {
      user: userId,
      type: 'workout',
      status: 'pending',
      provider: 'pending',
    },
    overrideAccess: true,
  })

  const reserved = await getAiQuota(payload, userId)
  if (reserved.used > reserved.limit) {
    await payload.update({
      collection: 'ai-generations',
      id: pending.id,
      data: { status: 'failed', provider: 'quota', errorMessage: 'QUOTA_EXCEEDED' },
      overrideAccess: true,
    })
    return {
      ok: false,
      code: 'QUOTA_EXCEEDED',
      message: 'Você atingiu o limite de 2 gerações de treino neste mês.',
      remaining: 0,
    }
  }

  const { workouts, provider } = await generateWeekWorkouts(profile, preferences)
  const disclaimer =
    'Conteúdo gerado por IA. Não substitui avaliação presencial. Procure um profissional se houver dor ou desconforto.'
  const publishedAt = new Date().toISOString()
  const createdIds: Array<string | number> = []

  try {
    for (const workout of workouts) {
      const created = await payload.create({
        collection: 'workouts',
        data: {
          title: workout.title,
          student: userId,
          author: userId,
          status: 'published',
          source: 'ai',
          observations: [workout.observations, disclaimer].filter(Boolean).join('\n\n'),
          weekday: toWeekday(workout.weekday),
          splitLabel: workout.splitLabel,
          publishedAt,
          exercises: workout.exercises,
        },
        overrideAccess: true,
      })
      createdIds.push(created.id)
    }

    await payload.update({
      collection: 'ai-generations',
      id: pending.id,
      data: {
        status: 'succeeded',
        provider,
        resultId: createdIds.map(String).join(','),
      },
      overrideAccess: true,
    })

    const after = await getAiQuota(payload, userId)
    return {
      ok: true,
      workoutIds: createdIds,
      workouts,
      remaining: after.remaining,
      provider,
    }
  } catch (err) {
    await payload.update({
      collection: 'ai-generations',
      id: pending.id,
      data: {
        status: 'failed',
        provider,
        errorMessage: err instanceof Error ? err.message : 'Falha ao salvar treinos',
      },
      overrideAccess: true,
    })
    return {
      ok: false,
      code: 'SAVE_FAILED',
      message: 'Não foi possível salvar a semana de treinos.',
      remaining: quota.remaining,
    }
  }
}
