import { CMS_BASE_URL, getJson, postJson } from '@/lib/cms'
import type { BillingCycle, ProTier } from '@/lib/proPlans'

export const PRO_PLAN_API = `${CMS_BASE_URL}/api/pro/plan`

export type ProPlanStatus = {
  /** Plano em vigor agora (teste vencido conta como grátis) */
  tier: ProTier
  /** Plano escolhido na conta */
  chosenTier: ProTier
  limit: number | null
  used: number
  canAdd: boolean
  trialEndsAt: string | null
  trialUsed: boolean
  onTrial: boolean
  billingCycle: BillingCycle | null
}

export function fetchProPlan(token: string) {
  return getJson<ProPlanStatus>(PRO_PLAN_API, token)
}

export function chooseProPlan(tier: ProTier, cycle: BillingCycle, token: string) {
  return postJson<ProPlanStatus>(PRO_PLAN_API, { tier, cycle }, token)
}

/** Dias restantes do teste (arredonda para cima). */
export function trialDaysLeft(trialEndsAt: string | null, now = Date.now()): number | null {
  if (!trialEndsAt) return null
  const ms = new Date(trialEndsAt).getTime() - now
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0
}
