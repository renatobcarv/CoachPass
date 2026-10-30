import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { getStudentCapacity } from './proCapacity'
import { abacateConfigured, syncUserSubscription } from './abacatePay'
import { PRO_PLANS } from './proPlans'

export type PlanUser = {
  id: number
  email?: string
  role?: string
  isSuperAdmin?: boolean
  proTier?: string | null
  billingCycle?: string | null
  trialEndsAt?: string | null
  trialUsed?: boolean | null
  paidUntil?: string | null
  checkoutTier?: string | null
  subscriptionStatus?: string | null
  abacateCheckoutId?: string | null
  abacateSubscriptionId?: string | null
  abacateCustomerId?: string | null
}

/** Usuário profissional da requisição (com os campos de cobrança, lidos sem filtro de acesso). */
export async function authProfessional() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  const isPro = user && (user.role === 'personal' || user.role === 'nutritionist' || (user as PlanUser).isSuperAdmin)
  if (!user || !isPro) {
    return { payload, user: null, status: user ? 403 : 401 } as const
  }
  const full = (await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as PlanUser
  return { payload, user: full, status: 200 } as const
}

export function authError(status: 401 | 403) {
  return Response.json(
    { error: status === 401 ? 'Não autenticado' : 'Disponível só para profissionais.' },
    { status },
  )
}

/** Resumo do plano para a tela (sem IDs internos do AbacatePay). */
export async function planSummary(payload: Payload, userId: number) {
  const capacity = await getStudentCapacity(payload, userId)
  const fresh = (await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    overrideAccess: true,
  })) as unknown as PlanUser
  const subscribed = fresh.subscriptionStatus === 'active'
  return {
    ...capacity,
    chosenTier: fresh.proTier || 'free',
    billingCycle: 'monthly' as const,
    trialUsed: Boolean(fresh.trialUsed),
    onTrial: Boolean(fresh.trialEndsAt) && capacity.tier !== 'free' && !subscribed,
    subscriptionStatus: (fresh.subscriptionStatus || 'none') as 'none' | 'pending' | 'active' | 'cancelled',
    paidUntil: fresh.paidUntil ?? null,
    canManageBilling: Boolean(fresh.abacateCustomerId && fresh.abacateCheckoutId),
    billingEnabled: abacateConfigured(),
    planName: PRO_PLANS[capacity.tier].name,
  }
}

/** Ressincroniza com o AbacatePay quando o estado local pode estar velho. Nunca derruba a tela. */
export async function refreshIfStale(payload: Payload, user: PlanUser) {
  if (!abacateConfigured()) return
  // Só quando o ciclo pago venceu sem chegar a renovação (checkout pendente é conferido na volta do pagamento)
  const expired = user.subscriptionStatus === 'active' && user.paidUntil && new Date(user.paidUntil) < new Date()
  if (!expired) return
  try {
    await syncUserSubscription(payload, user)
  } catch {
    /* AbacatePay fora do ar: segue com o estado salvo */
  }
}
