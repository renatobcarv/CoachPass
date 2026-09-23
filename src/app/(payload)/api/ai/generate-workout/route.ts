import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { createAiWorkoutForStudent } from '@/services/ai/workoutGenerator'
import { getAiQuota } from '@/services/ai/quota'

export const dynamic = 'force-dynamic'

async function getAuthUser() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  return { payload, user }
}

export async function GET() {
  const { payload, user } = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  const quota = await getAiQuota(payload, user.id)
  return NextResponse.json(quota)
}

export async function POST() {
  const { payload, user } = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (
    (user as { role?: string }).role !== 'student' &&
    !(user as { isSuperAdmin?: boolean }).isSuperAdmin
  ) {
    return NextResponse.json({ error: 'Apenas alunos podem gerar treino por aqui.' }, { status: 403 })
  }

  const profiles = await payload.find({
    collection: 'student-profiles',
    where: { user: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const profile = profiles.docs[0]
  if (!profile) {
    return NextResponse.json(
      { error: 'Complete o onboarding do perfil antes de gerar treinos.' },
      { status: 400 },
    )
  }

  const result = await createAiWorkoutForStudent({
    payload,
    userId: user.id,
    profile: profile as never,
  })

  if (!result.ok) {
    const status =
      result.code === 'QUOTA_EXCEEDED' ? 402 : result.code === 'RISK_BLOCKED' ? 422 : 400
    return NextResponse.json(
      { error: result.message, code: result.code, remaining: result.remaining },
      { status },
    )
  }

  return NextResponse.json({
    ok: true,
    workoutIds: result.workoutIds,
    titles: result.workouts.map((w) => w.title),
    count: result.workouts.length,
    remaining: result.remaining,
    provider: result.provider,
  })
}
