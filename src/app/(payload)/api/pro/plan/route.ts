import { NextResponse } from 'next/server'

import { authError, authProfessional, planSummary, refreshIfStale } from '@/lib/proBilling'
import { isProTier, PRO_PLANS, TRIAL_DAYS } from '@/lib/proPlans'

export const dynamic = 'force-dynamic'

/** Plano atual do profissional, uso de alunos e situação da assinatura. */
export async function GET() {
  const { payload, user, status } = await authProfessional()
  if (!user) return authError(status as 401 | 403)
  await refreshIfStale(payload, user)
  return NextResponse.json(await planSummary(payload, user.id))
}

/**
 * Teste grátis e volta para o Grátis. Assinatura paga vai por /api/pro/billing/subscribe.
 * O teste de 14 dias vale uma vez por conta e não pede cartão.
 */
export async function POST(request: Request) {
  const { payload, user, status } = await authProfessional()
  if (!user) return authError(status as 401 | 403)

  let body: { tier?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (!isProTier(body.tier)) {
    return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
  }
  const tier = body.tier
  const subscribed = user.subscriptionStatus === 'active'

  if (tier === 'free') {
    if (subscribed) {
      return NextResponse.json(
        {
          error: 'Você tem uma assinatura ativa. Cancele em "Gerenciar assinatura" para voltar ao Grátis no fim do ciclo.',
          code: 'ACTIVE_SUBSCRIPTION',
        },
        { status: 409 },
      )
    }
    // Encerra o teste; vínculos existentes continuam, só novos convites param
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { proTier: 'free', trialEndsAt: null },
      overrideAccess: true,
    })
    return NextResponse.json(await planSummary(payload, user.id))
  }

  if (subscribed) {
    return NextResponse.json(
      { error: 'Você já é assinante. Para trocar de plano use a opção de assinatura.', code: 'ACTIVE_SUBSCRIPTION' },
      { status: 409 },
    )
  }

  // Ainda dentro do teste: troca Pro ↔ Elite mantendo a mesma data de fim
  const trialActive = Boolean(user.trialEndsAt) && new Date(user.trialEndsAt!).getTime() > Date.now()
  if (user.trialUsed && trialActive) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { proTier: tier },
      overrideAccess: true,
    })
    return NextResponse.json(await planSummary(payload, user.id))
  }

  if (user.trialUsed && !user.isSuperAdmin) {
    return NextResponse.json(
      {
        error: `Seu teste grátis já foi usado. Assine o ${PRO_PLANS[tier].name} para continuar.`,
        code: 'TRIAL_USED',
      },
      { status: 409 },
    )
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { proTier: tier, billingCycle: 'monthly', trialEndsAt, trialUsed: true },
    overrideAccess: true,
  })
  return NextResponse.json(await planSummary(payload, user.id))
}
