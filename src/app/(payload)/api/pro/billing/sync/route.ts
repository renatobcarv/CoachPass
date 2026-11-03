import { NextResponse } from 'next/server'

import { AbacatePayError, abacateConfigured, syncUserSubscription } from '@/lib/abacatePay'
import { authError, authBillingUser, planSummary, studentPlanSummary } from '@/lib/proBilling'

export const dynamic = 'force-dynamic'

/**
 * Confere a assinatura direto na API do AbacatePay (volta do checkout).
 * Funciona mesmo sem webhook, por exemplo em localhost. Serve profissional e aluno.
 */
export async function POST() {
  const { payload, user, status } = await authBillingUser()
  if (!user) return authError(status as 401 | 403)
  const summary = () => (user.role === 'student' ? studentPlanSummary(payload, user.id) : planSummary(payload, user.id))
  if (!abacateConfigured(user.role === 'student' ? 'student' : 'pro')) return NextResponse.json(await summary())

  try {
    await syncUserSubscription(payload, user)
  } catch (err) {
    if (!(err instanceof AbacatePayError)) throw err
    return NextResponse.json({ error: err.message, plan: await summary() }, { status: 502 })
  }
  return NextResponse.json(await summary())
}
