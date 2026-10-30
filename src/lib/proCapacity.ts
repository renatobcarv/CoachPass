import type { Payload, PayloadRequest } from 'payload'

import { effectiveTier, PRO_PLANS, studentLimitFor, type ProTier } from './proPlans'

export const PLAN_LIMIT_CODE = 'PLAN_LIMIT'

export type StudentCapacity = {
  tier: ProTier
  limit: number | null
  used: number
  /** Ainda cabe mais um aluno? */
  canAdd: boolean
  trialEndsAt: string | null
}

/** Conta convites pendentes + vínculos ativos do profissional e compara com o plano. */
export async function getStudentCapacity(
  payload: Payload,
  professionalId: number | string,
  req?: PayloadRequest,
): Promise<StudentCapacity> {
  const user = await payload.findByID({
    collection: 'users',
    id: professionalId,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const tier = effectiveTier(user)
  const limit = studentLimitFor(tier)

  const links = await payload.count({
    collection: 'professional-links',
    where: {
      and: [{ professional: { equals: professionalId } }, { status: { in: ['pending', 'active'] } }],
    },
    overrideAccess: true,
    req,
  })

  return {
    tier,
    limit,
    used: links.totalDocs,
    canAdd: limit === null || links.totalDocs < limit,
    trialEndsAt: (user.trialEndsAt as string | null | undefined) ?? null,
  }
}

export function planLimitMessage(capacity: StudentCapacity): string {
  const plan = PRO_PLANS[capacity.tier]
  return `Seu plano ${plan.name} comporta até ${capacity.limit} alunos e você já tem ${capacity.used}. Suba de plano para convidar mais.`
}
