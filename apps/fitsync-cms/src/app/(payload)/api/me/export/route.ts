import { NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

export const dynamic = 'force-dynamic'

async function docsFor(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection:
    | 'student-profiles'
    | 'professional-links'
    | 'workouts'
    | 'meal-plans'
    | 'ai-generations'
    | 'assessments'
    | 'sessions'
    | 'restrictions'
    | 'anamneses'
    | 'workout-logs'
    | 'transactions',
  where: Where,
) {
  const result = await payload.find({
    collection,
    where,
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs
}

export async function GET() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const id = user.id
  const safeUser = { ...user } as Record<string, unknown>
  delete safeUser.hash
  delete safeUser.salt
  delete safeUser.resetPasswordToken
  delete safeUser.sessions
  delete safeUser.collection
  delete safeUser._strategy

  const [profiles, linksAsStudent, linksAsPro, workouts, mealPlans, generations, assessments, sessions, restrictions, anamneses, workoutLogs, transactions] =
    await Promise.all([
      docsFor(payload, 'student-profiles', { user: { equals: id } }),
      docsFor(payload, 'professional-links', { student: { equals: id } }),
      docsFor(payload, 'professional-links', { professional: { equals: id } }),
      docsFor(payload, 'workouts', { student: { equals: id } }),
      docsFor(payload, 'meal-plans', { student: { equals: id } }),
      docsFor(payload, 'ai-generations', { user: { equals: id } }),
      docsFor(payload, 'assessments', { student: { equals: id } }),
      docsFor(payload, 'sessions', { student: { equals: id } }),
      docsFor(payload, 'restrictions', { student: { equals: id } }),
      docsFor(payload, 'anamneses', { student: { equals: id } }),
      docsFor(payload, 'workout-logs', { student: { equals: id } }),
      docsFor(payload, 'transactions', {
        or: [{ student: { equals: id } }, { professional: { equals: id } }],
      }),
    ])

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    user: safeUser,
    studentProfiles: profiles,
    professionalLinks: [...linksAsStudent, ...linksAsPro],
    workouts,
    mealPlans,
    aiGenerations: generations,
    assessments,
    sessions,
    restrictions,
    anamneses,
    workoutLogs,
    transactions,
  })
}
