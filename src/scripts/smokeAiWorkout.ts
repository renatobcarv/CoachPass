/**
 * Smoke: gera semana inteira de treinos IA.
 * Uso: npx tsx src/scripts/smokeAiWorkout.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { createAiWorkoutForStudent } from '../services/ai/workoutGenerator'
import { getAiQuota } from '../services/ai/quota'

async function main() {
  const payload = await getPayload({ config })
  const stamp = Date.now()
  const email = `aluno.ai.${stamp}@coachpass.test`
  const password = 'CoachPass123!'

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: 'Aluno AI',
      role: 'student',
    },
    overrideAccess: true,
  })

  const profile = await payload.create({
    collection: 'student-profiles',
    data: {
      user: user.id,
      displayName: 'Aluno AI Teste',
      phone: '11999990001',
      birthDate: '1995-03-15',
      heightCm: 172,
      weightKg: 70,
      sex: 'female',
      goal: 'hypertrophy',
      experienceLevel: 'beginner',
      trainingDaysPerWeek: 5,
      sessionMinutes: 60,
      equipmentAccess: ['basic_gym'],
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  const before = await getAiQuota(payload, user.id)
  const result = await createAiWorkoutForStudent({
    payload,
    userId: user.id,
    profile: profile as never,
  })
  const after = await getAiQuota(payload, user.id)

  if (!result.ok) {
    console.error(JSON.stringify({ ok: false, result, before, after }, null, 2))
    process.exit(1)
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        email,
        count: result.workouts.length,
        titles: result.workouts.map((w) => w.title),
        provider: result.provider,
        quotaBefore: before.remaining,
        quotaAfter: after.remaining,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
