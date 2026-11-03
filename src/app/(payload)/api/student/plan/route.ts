import { NextResponse } from 'next/server'

import { authBillingUser, authError, refreshIfStale, studentPlanSummary } from '@/lib/proBilling'

export const dynamic = 'force-dynamic'

/** Plano do aluno (Aluno Pro) e situação da assinatura. */
export async function GET() {
  const { payload, user, status } = await authBillingUser()
  if (!user) return authError(status as 401 | 403)
  await refreshIfStale(payload, user)
  return NextResponse.json(await studentPlanSummary(payload, user.id))
}
