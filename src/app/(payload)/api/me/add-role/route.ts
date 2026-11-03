import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { canUseSecondaryProRole } from '@/access/entitlements'
import { PRO_PLANS } from '@/lib/proPlans'
import { credentialError } from '@/web/lib/validation'

export const dynamic = 'force-dynamic'

type RoleUser = {
  id: number
  role?: string | null
  roles?: string[] | null
  primaryProRole?: string | null
  isSuperAdmin?: boolean | null
  proTier?: string | null
  trialEndsAt?: string | null
  paidUntil?: string | null
}

/**
 * Libera a segunda área profissional na mesma conta (personal + nutricionista).
 * Exige o Elite em vigor e o registro (CREF/CRN) da nova área.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  let body: { role?: unknown; registration?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const role = body.role === 'personal' || body.role === 'nutritionist' ? body.role : null
  if (!role) return NextResponse.json({ error: 'Escolha personal ou nutricionista.' }, { status: 400 })

  const full = (await payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true })) as unknown as RoleUser
  if (!full.primaryProRole) {
    return NextResponse.json({ error: 'Disponível só para contas profissionais.' }, { status: 403 })
  }
  if (role === full.primaryProRole || (full.roles ?? []).includes(role)) {
    return NextResponse.json({ error: 'Esta área já está liberada na sua conta.', code: 'ALREADY' }, { status: 409 })
  }
  if (!canUseSecondaryProRole(full)) {
    return NextResponse.json(
      { error: `Personal e nutricionista na mesma conta é um recurso do ${PRO_PLANS.elite.name}.`, code: 'ELITE_REQUIRED' },
      { status: 402 },
    )
  }
  const registration = String(body.registration ?? '').trim().toUpperCase()
  const problem = credentialError(registration, role)
  if (problem) return NextResponse.json({ error: problem, code: 'INVALID_REGISTRATION' }, { status: 400 })

  const roles = Array.from(new Set([...(full.roles ?? []), role, 'student']))
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { roles: roles as never, secondaryProfessionalId: registration },
    overrideAccess: true,
    context: { roleSwitch: true, skipRoleSync: true },
  })
  return NextResponse.json({ ok: true, roles })
}
