import type { PayloadRequest } from 'payload'

import { PAYMENT_GRACE_DAYS, effectiveTier } from '../lib/proPlans'
import { isSuperUser } from './isSuper'

type EntitledUser = {
  role?: string | null
  roles?: string[] | null
  isSuperAdmin?: boolean | null
  studentTier?: string | null
  paidUntil?: string | null
  proTier?: string | null
  trialEndsAt?: string | null
}

const PRO = new Set(['personal', 'nutritionist'])

/** A conta é de profissional (mesmo usando o painel do aluno agora). */
export function isProfessionalAccount(user: EntitledUser | null | undefined): boolean {
  if (!user) return false
  if (PRO.has(String(user.role))) return true
  return Array.isArray(user.roles) && user.roles.some((r) => PRO.has(r))
}

/**
 * Pode criar treino, dieta e periodização para si mesmo:
 * Aluno Pro com o período pago em dia (mais a folga de cobrança) ou qualquer profissional.
 */
export function hasStudentPro(user: EntitledUser | null | undefined, now = new Date()): boolean {
  if (!user) return false
  if (user.isSuperAdmin || user.role === 'master') return true
  if (isProfessionalAccount(user)) return true
  if (user.studentTier !== 'pro') return false
  if (!user.paidUntil) return true // liberado pelo admin, sem vencimento
  const graceEnd = new Date(user.paidUntil).getTime() + PAYMENT_GRACE_DAYS * 86_400_000
  return graceEnd >= now.getTime()
}

export function reqHasStudentPro(req: PayloadRequest): boolean {
  return isSuperUser(req) || hasStudentPro(req.user as EntitledUser | undefined)
}

/** Segundo papel profissional (personal + nutri na mesma conta) só vale no Elite em vigor. */
export function canUseSecondaryProRole(user: EntitledUser | null | undefined): boolean {
  return effectiveTier(user) === 'elite'
}
