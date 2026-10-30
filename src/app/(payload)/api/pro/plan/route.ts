import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { getStudentCapacity } from '@/lib/proCapacity'
import { isProTier, PRO_PLANS, TRIAL_DAYS, type BillingCycle } from '@/lib/proPlans'

export const dynamic = 'force-dynamic'

type PlanUser = {
  id: number
  role?: string
  isSuperAdmin?: boolean
  proTier?: string | null
  billingCycle?: string | null
  trialEndsAt?: string | null
  trialUsed?: boolean | null
}

async function auth() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  const u = user as PlanUser | null
  const isPro = u && (u.role === 'personal' || u.role === 'nutritionist' || u.isSuperAdmin)
  return { payload, user: isPro ? u : null, authenticated: Boolean(u) }
}

async function summary(payload: Awaited<ReturnType<typeof getPayload>>, user: PlanUser) {
  const capacity = await getStudentCapacity(payload, user.id)
  const fresh = await payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true })
  return {
    ...capacity,
    chosenTier: fresh.proTier || 'free',
    billingCycle: fresh.billingCycle || null,
    trialUsed: Boolean(fresh.trialUsed),
    onTrial: Boolean(fresh.trialEndsAt) && capacity.tier !== 'free',
  }
}

/** Plano atual do profissional e quantos alunos ele já usa. */
export async function GET() {
  const { payload, user, authenticated } = await auth()
  if (!user) {
    return NextResponse.json(
      { error: authenticated ? 'Disponível só para profissionais.' : 'Não autenticado' },
      { status: authenticated ? 403 : 401 },
    )
  }
  return NextResponse.json(await summary(payload, user))
}

/**
 * Escolhe o plano. Sem gateway de pagamento ainda: plano pago começa com teste grátis
 * de 14 dias (uma vez por conta). Depois do teste, só o admin libera o plano pago.
 */
export async function POST(request: Request) {
  const { payload, user, authenticated } = await auth()
  if (!user) {
    return NextResponse.json(
      { error: authenticated ? 'Disponível só para profissionais.' : 'Não autenticado' },
      { status: authenticated ? 403 : 401 },
    )
  }

  let body: { tier?: unknown; cycle?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (!isProTier(body.tier)) {
    return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
  }
  const tier = body.tier
  const cycle: BillingCycle = body.cycle === 'monthly' ? 'monthly' : 'annual'

  if (tier === 'free') {
    // Voltar para o grátis encerra o teste; vínculos existentes continuam, só novos convites param
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { proTier: 'free', trialEndsAt: null },
      overrideAccess: true,
    })
    return NextResponse.json(await summary(payload, user))
  }

  // Ainda dentro do teste: troca Pro ↔ Elite mantendo a mesma data de fim
  const trialActive = Boolean(user.trialEndsAt) && new Date(user.trialEndsAt!).getTime() > Date.now()
  if (user.trialUsed && trialActive) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { proTier: tier, billingCycle: cycle },
      overrideAccess: true,
    })
    return NextResponse.json(await summary(payload, user))
  }

  if (user.trialUsed && !user.isSuperAdmin) {
    return NextResponse.json(
      {
        error: `Seu teste grátis já foi usado. A assinatura do ${PRO_PLANS[tier].name} com pagamento chega em breve — fale com a gente para liberar antes.`,
        code: 'TRIAL_USED',
      },
      { status: 409 },
    )
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { proTier: tier, billingCycle: cycle, trialEndsAt, trialUsed: true },
    overrideAccess: true,
  })
  return NextResponse.json(await summary(payload, user))
}
