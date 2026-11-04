import { NextResponse } from 'next/server'

import {
  AbacatePayError,
  abacateConfigured,
  appBaseUrl,
  audienceOf,
  changeSubscriptionPlan,
  createSubscriptionCheckout,
  studentProductKey,
  type ProductKey,
} from '@/lib/abacatePay'
import { authBillingUser, authError, planSummary } from '@/lib/proBilling'
import { PRO_PLANS } from '@/lib/proPlans'
import { isStudentCycle } from '@/lib/studentPlans'

export const dynamic = 'force-dynamic'

/**
 * Assinar um plano pago (profissional: { tier: 'pro'|'elite' }; aluno: { studentCycle }).
 * - Sem assinatura: cria o checkout no AbacatePay e devolve a URL de pagamento.
 * - Já assinante: troca de plano (vale no próximo ciclo; upgrade do profissional libera na hora).
 */
export async function POST(request: Request) {
  const { payload, user, status } = await authBillingUser()
  if (!user) return authError(status as 401 | 403)

  let body: { tier?: unknown; studentCycle?: unknown; returnPath?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const isStudent = user.role === 'student'
  let product: ProductKey
  if (isStudent) {
    if (!isStudentCycle(body.studentCycle)) {
      return NextResponse.json({ error: 'Escolha mensal, semestral ou anual.' }, { status: 400 })
    }
    product = studentProductKey(body.studentCycle)
  } else {
    if (body.tier !== 'pro' && body.tier !== 'elite') {
      return NextResponse.json({ error: 'Escolha o Pro ou o Elite.' }, { status: 400 })
    }
    product = body.tier
  }

  if (!abacateConfigured(audienceOf(product))) {
    return NextResponse.json({ error: 'Pagamento ainda não está disponível.', code: 'BILLING_OFF' }, { status: 503 })
  }

  try {
    if (user.subscriptionStatus === 'active' && user.abacateSubscriptionId) {
      if (user.checkoutTier === product) {
        return NextResponse.json({ error: 'Você já assina este plano.', code: 'SAME_PLAN' }, { status: 409 })
      }
      await changeSubscriptionPlan(user.abacateSubscriptionId, product)
      const upgrade = product === 'elite'
      await payload.update({
        collection: 'users',
        id: user.id,
        // Upgrade do profissional libera o Elite já; o resto vale no próximo ciclo
        data: { checkoutTier: product, ...(upgrade ? { proTier: 'elite' } : {}) },
        overrideAccess: true,
      })
      return NextResponse.json({
        changed: true,
        message: upgrade
          ? 'Elite liberado. O novo valor vale a partir da próxima cobrança.'
          : isStudent
            ? 'Troca agendada para o próximo ciclo.'
            : `Troca agendada: você segue no ${PRO_PLANS.elite.name} até o fim do ciclo pago e depois passa para o Pro.`,
        plan: await planSummary(payload, user.id),
      })
    }

    const checkout = await createSubscriptionCheckout({
      product,
      userId: user.id,
      customerId: user.abacateCustomerId,
      appUrl: appBaseUrl(),
      returnPath: typeof body.returnPath === 'string' ? body.returnPath : null,
    })
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        abacateCheckoutId: checkout.id,
        checkoutTier: product,
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
