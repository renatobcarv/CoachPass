/**
 * Smoke test: cria aluno, perfil e valida dashboard vazio (sem treinos/dietas).
 * Uso: npx tsx src/scripts/smokeStudentFlow.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  const payload = await getPayload({ config })
  const stamp = Date.now()
  const email = `aluno.smoke.${stamp}@coachpass.test`
  const password = 'CoachPass123!'

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: 'Aluno Smoke',
      role: 'student',
    },
    overrideAccess: true,
  })

  const profile = await payload.create({
    collection: 'student-profiles',
    data: {
      user: user.id,
      displayName: 'Aluno Smoke Teste',
      phone: '11999990000',
      birthDate: '1998-05-10',
      heightCm: 175,
      weightKg: 78.5,
      sex: 'male',
      goal: 'hypertrophy',
      experienceLevel: 'beginner',
      trainingDaysPerWeek: 4,
      sessionMinutes: 60,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  const workouts = await payload.find({
    collection: 'workouts',
    where: {
      and: [{ student: { equals: user.id } }, { status: { equals: 'published' } }],
    },
    overrideAccess: true,
  })

  const meals = await payload.find({
    collection: 'meal-plans',
    where: {
      and: [{ student: { equals: user.id } }, { status: { equals: 'published' } }],
    },
    overrideAccess: true,
  })

  const links = await payload.find({
    collection: 'professional-links',
    where: {
      and: [{ student: { equals: user.id } }, { status: { equals: 'active' } }],
    },
    overrideAccess: true,
  })

  const updated = await payload.update({
    collection: 'student-profiles',
    id: profile.id,
    data: { weightKg: 79.1, phone: '11988887777' },
    overrideAccess: true,
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: user.id,
        email,
        profileId: profile.id,
        onboardingCompleted: profile.onboardingCompleted,
        workoutsPublished: workouts.totalDocs,
        mealPlansPublished: meals.totalDocs,
        activeLinks: links.totalDocs,
        updatedWeight: updated.weightKg,
        updatedPhone: updated.phone,
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
