import { NextResponse } from 'next/server'

import { AbacatePayError, abacateConfigured, syncUserSubscription } from '@/lib/abacatePay'
import { authError, authProfessional, planSummary } from '@/lib/proBilling'

export const dynamic = 'force-dynamic'

/**
 * Confere a assinatura direto na API do AbacatePay (volta do checkout).
 * Funciona mesmo sem webhook, por exemplo em localhost.
 */
export async function POST() {
  const { payload, user, status } = await authProfessional()
  if (!user) return authError(status as 401 | 403)
  if (!abacateConfigured()) return NextResponse.json(await planSummary(payload, user.id))

  try {
    await syncUserSubscription(payload, user)
  } catch (err) {
    if (!(err instanceof AbacatePayError)) throw err
    return NextResponse.json({ error: err.message, plan: await planSummary(payload, user.id) }, { status: 502 })
  }
  return NextResponse.json(await planSummary(payload, user.id))
}
