import { CMS_BASE_URL, getJson, postJson } from '@/lib/cms'
import type { ProTier } from '@/lib/proPlans'

export const PRO_PLAN_API = `${CMS_BASE_URL}/api/pro/plan`
const BILLING_API = `${CMS_BASE_URL}/api/pro/billing`

export type ProPlanStatus = {
  /** Plano em vigor agora (teste ou ciclo vencido conta como grátis) */
  tier: ProTier
  /** Plano escolhido na conta */
  chosenTier: ProTier
  limit: number | null
  used: number
  canAdd: boolean
  trialEndsAt: string | null
  trialUsed: boolean
  onTrial: boolean
  billingCycle: 'monthly' | null
  subscriptionStatus: 'none' | 'pending' | 'active' | 'cancelled'
  paidUntil: string | null
  canManageBilling: boolean
  billingEnabled: boolean
  planName: string
}

export function fetchProPlan(token: string) {
  return getJson<ProPlanStatus>(PRO_PLAN_API, token)
}

/** Teste grátis (plano pago) ou volta para o Grátis. */
export function chooseProPlan(tier: ProTier, token: string) {
  return postJson<ProPlanStatus>(PRO_PLAN_API, { tier }, token)
}

/** Assinar (devolve a URL do checkout) ou trocar de plano se já for assinante. */
export function subscribeProPlan(tier: Exclude<ProTier, 'free'>, token: string, returnPath?: string) {
  return postJson<{ url?: string; changed?: boolean; message?: string; plan?: ProPlanStatus }>(
    `${BILLING_API}/subscribe`,
    { tier, returnPath },
    token,
  )
}

/** Assinatura do Aluno Pro (devolve a URL do checkout ou troca o ciclo). */
export function subscribeStudentPlan(studentCycle: 'monthly' | 'semester' | 'annual', token: string, returnPath?: string) {
  return postJson<{ url?: string; changed?: boolean; message?: string }>(
    `${BILLING_API}/subscribe`,
    { studentCycle, returnPath },
    token,
  )
}

/** Plano escolhido no cadastro, guardado até o fim do onboarding. */
export type SignupPlan =
  | { audience: 'student'; choice: 'free' | 'monthly' | 'semester' | 'annual' }
  | { audience: 'professional'; choice: ProTier; action: 'free' | 'trial' | 'subscribe' }

const SIGNUP_PLAN_KEY = 'cp_signup_plan'

export function saveSignupPlan(plan: SignupPlan) {
  try {
    sessionStorage.setItem(SIGNUP_PLAN_KEY, JSON.stringify(plan))
  } catch {
    /* sem storage: o onboarding pergunta de novo */
  }
}

export function readSignupPlan(): SignupPlan | null {
  try {
    const raw = sessionStorage.getItem(SIGNUP_PLAN_KEY)
    return raw ? (JSON.parse(raw) as SignupPlan) : null
  } catch {
    return null
  }
}

export function clearSignupPlan() {
  try {
    sessionStorage.removeItem(SIGNUP_PLAN_KEY)
  } catch {
    /* nada a limpar */
  }
}

/** Confere o pagamento direto no AbacatePay (volta do checkout). */
export function syncBilling(token: string) {
  return postJson<ProPlanStatus>(`${BILLING_API}/sync`, {}, token)
}

/** Link do portal do AbacatePay (cancelar, trocar cartão). */
export function openBillingPortal(token: string) {
  return postJson<{ url: string }>(`${BILLING_API}/portal`, {}, token)
}

/** Dias restantes até uma data (arredonda para cima). */
export function trialDaysLeft(until: string | null, now = Date.now()): number | null {
  if (!until) return null
  const ms = new Date(until).getTime() - now
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0
}
