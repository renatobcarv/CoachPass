/**
 * Planos do profissional (personal e nutricionista). Usado no servidor (limite de alunos)
 * e na tela de preços — a fonte única dos números.
 * Todos os recursos valem em todos os planos; o que muda é quantos alunos cabem.
 */

export type ProTier = 'free' | 'pro' | 'elite'
export type BillingCycle = 'monthly' | 'annual'

export type ProPlan = {
  id: ProTier
  name: string
  tagline: string
  /** null = ilimitado */
  studentLimit: number | null
  /** Preço em reais por mês */
  monthly: number
  /** Preço mensal equivalente no anual */
  annualMonthly: number
  perks: string[]
}

export const TRIAL_DAYS = 14

export const PRO_PLANS: Record<ProTier, ProPlan> = {
  free: {
    id: 'free',
    name: 'Grátis',
    tagline: 'Para começar a organizar os primeiros alunos.',
    studentLimit: 5,
    monthly: 0,
    annualMonthly: 0,
    perks: ['Até 5 alunos ativos', 'Todos os recursos do painel', 'App do aluno sem custo para ele'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para quem vive da consultoria e quer crescer a carteira.',
    studentLimit: 40,
    monthly: 79,
    annualMonthly: 59,
    perks: ['Até 40 alunos ativos', 'Todos os recursos do painel', 'Suporte por e-mail em até 24h'],
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    tagline: 'Para estúdios e carteiras grandes, sem teto.',
    studentLimit: null,
    monthly: 149,
    annualMonthly: 119,
    perks: ['Alunos ilimitados', 'Suporte prioritário no WhatsApp', 'Migração assistida dos seus alunos'],
  },
}

export const PRO_TIERS: ProTier[] = ['free', 'pro', 'elite']

export function isProTier(v: unknown): v is ProTier {
  return v === 'free' || v === 'pro' || v === 'elite'
}

type PlanFields = {
  proTier?: string | null
  trialEndsAt?: string | null
  role?: string | null
  isSuperAdmin?: boolean | null
}

/** Plano que vale agora: teste vencido volta para o grátis. Super usuário não tem limite. */
export function effectiveTier(user: PlanFields | null | undefined, now = new Date()): ProTier {
  if (!user) return 'free'
  if (user.isSuperAdmin || user.role === 'master') return 'elite'
  const tier = isProTier(user.proTier) ? user.proTier : 'free'
  if (tier === 'free') return 'free'
  if (user.trialEndsAt && new Date(user.trialEndsAt).getTime() < now.getTime()) return 'free'
  return tier
}

export function studentLimitFor(tier: ProTier): number | null {
  return PRO_PLANS[tier].studentLimit
}

/** Menor plano que comporta essa quantidade de alunos. */
export function recommendTier(students: number): ProTier {
  if (students <= (PRO_PLANS.free.studentLimit ?? 0)) return 'free'
  if (students <= (PRO_PLANS.pro.studentLimit ?? 0)) return 'pro'
  return 'elite'
}

export function priceFor(tier: ProTier, cycle: BillingCycle): number {
  const plan = PRO_PLANS[tier]
  return cycle === 'annual' ? plan.annualMonthly : plan.monthly
}

/** Quanto se economiza por ano escolhendo o anual. */
export function annualSavings(tier: ProTier): number {
  const plan = PRO_PLANS[tier]
  return (plan.monthly - plan.annualMonthly) * 12
}

export function formatBRL(value: number, cents = false): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })
}
