import type { Payload } from 'payload'

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

function buildWeekPrompt(profile: ProfileDoc): string {
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

Perfil: idade ${age ?? 'n/d'}, objetivo ${profile.goal}, experiência ${profile.experienceLevel || 'n/d'}, dias/semana ${profile.trainingDaysPerWeek || splits.length}, ${profile.sessionMinutes || '?'} min, equipamentos ${(profile.equipmentAccess || []).join(', ') || 'n/d'}.

Catálogo:
${catalogForPrompt(120)}
`
}

async function generateWeekWorkouts(
  profile: ProfileDoc,
): Promise<{ workouts: GeneratedWorkout[]; provider: string }> {
  const splits = weekSplitsForProfile(profile.trainingDaysPerWeek)
  const gemini = await generateWeekWithGemini(buildWeekPrompt(profile))

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
  userId: string | number
  profile: ProfileDoc
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
  const { payload, userId, profile } = args

  const quota = await getAiQuota(payload, userId)
  if (quota.blocked) {
    return {
      ok: false,
      code: 'QUOTA_EXCEEDED',
      message: 'Você atingiu o limite de 2 gerações gratuitas neste mês. Veja os planos.',
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

  const { workouts, provider } = await generateWeekWorkouts(profile)
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
          observations: workout.observations,
          weekday: workout.weekday,
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
