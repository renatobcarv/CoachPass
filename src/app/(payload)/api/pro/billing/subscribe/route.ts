import { NextResponse } from 'next/server'

import {
  AbacatePayError,
  abacateConfigured,
  appBaseUrl,
  changeSubscriptionPlan,
  createSubscriptionCheckout,
} from '@/lib/abacatePay'
import { authError, authProfessional, planSummary } from '@/lib/proBilling'
import { PRO_PLANS } from '@/lib/proPlans'

export const dynamic = 'force-dynamic'

/**
 * Assinar um plano pago.
 * - Sem assinatura: cria o checkout de assinatura no AbacatePay e devolve a URL de pagamento.
 * - Já assinante: troca de plano (vale no próximo ciclo; upgrade libera na hora).
 */
export async function POST(request: Request) {
  const { payload, user, status } = await authProfessional()
  if (!user) return authError(status as 401 | 403)
  if (!abacateConfigured()) {
    return NextResponse.json({ error: 'Pagamento ainda não está disponível.', code: 'BILLING_OFF' }, { status: 503 })
  }

  let body: { tier?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const tier = body.tier
  if (tier !== 'pro' && tier !== 'elite') {
    return NextResponse.json({ error: 'Escolha o Pro ou o Elite.' }, { status: 400 })
  }

  try {
    if (user.subscriptionStatus === 'active' && user.abacateSubscriptionId) {
      if (user.checkoutTier === tier) {
        return NextResponse.json({ error: `Você já assina o ${PRO_PLANS[tier].name}.`, code: 'SAME_PLAN' }, { status: 409 })
      }
      await changeSubscriptionPlan(user.abacateSubscriptionId, tier)
      const upgrade = tier === 'elite'
      await payload.update({
        collection: 'users',
        id: user.id,
        // Upgrade libera o Elite já; downgrade mantém o Elite até o próximo ciclo
        data: { checkoutTier: tier, ...(upgrade ? { proTier: 'elite' } : {}) },
        overrideAccess: true,
      })
      return NextResponse.json({
        changed: true,
        message: upgrade
          ? 'Elite liberado. O novo valor vale a partir da próxima cobrança.'
          : 'Troca agendada: você segue no Elite até o fim do ciclo pago e depois passa para o Pro.',
        plan: await planSummary(payload, user.id),
      })
    }

    const checkout = await createSubscriptionCheckout({
      tier,
      userId: user.id,
      customerId: user.abacateCustomerId,
      appUrl: appBaseUrl(),
    })
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        abacateCheckoutId: checkout.id,
        checkoutTier: tier,
        ...(user.subscriptionStatus === 'active' ? {} : { subscriptionStatus: 'pending' }),
      },
      overrideAccess: true,
    })
    return NextResponse.json({ url: checkout.url })
  } catch (err) {
    const message = err instanceof AbacatePayError ? err.message : 'Não foi possível iniciar o pagamento.'
    return NextResponse.json({ error: message, code: 'BILLING_ERROR' }, { status: 502 })
  }
}
