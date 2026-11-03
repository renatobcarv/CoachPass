import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { canUseSecondaryProRole } from '@/access/entitlements'
import { PRO_PLANS } from '@/lib/proPlans'

export const dynamic = 'force-dynamic'

const ROLES = new Set(['student', 'personal', 'nutritionist'])

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
 * Troca o painel ativo (o papel que vale nas regras de acesso).
 * - Profissional entra no painel do aluno (ele mesmo como aluno) em qualquer plano.
 * - A segunda área profissional (personal + nutri) só abre com o Elite em vigor.
 * Devolve um token novo, porque o papel faz parte do JWT.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  let body: { role?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const target = String(body.role ?? '')
  if (!ROLES.has(target)) return NextResponse.json({ error: 'Painel inválido.' }, { status: 400 })

  const full = (await payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true })) as unknown as RoleUser
  const allowed = new Set(full.roles ?? [])
  if (!allowed.has(target)) {
    return NextResponse.json({ error: 'Este painel não está liberado na sua conta.', code: 'ROLE_NOT_ALLOWED' }, { status: 403 })
  }
  const secondary = target !== 'student' && full.primaryProRole && target !== full.primaryProRole
  if (secondary && !canUseSecondaryProRole(full)) {
    return NextResponse.json(
      {
        error: `A segunda área profissional faz parte do ${PRO_PLANS.elite.name}. Seus dados continuam guardados; reative o ${PRO_PLANS.elite.name} para voltar a usar.`,
        code: 'ELITE_REQUIRED',
      },
      { status: 402 },
    )
  }

  if (full.role !== target) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { role: target as never },
      overrideAccess: true,
      context: { roleSwitch: true, skipRoleSync: true },
    })
  }

  // Token novo com o papel atualizado (mesma sessão)
  const refreshed = await payload.find({ collection: 'users', where: { id: { equals: user.id } }, depth: 0, limit: 1, overrideAccess: true })
  const res = await fetch(new URL('/api/users/refresh-token', request.url), {
    method: 'POST',
    headers: { Authorization: headers.get('authorization') ?? '', cookie: headers.get('cookie') ?? '' },
  })
  const json = (await res.json().catch(() => null)) as { refreshedToken?: string; token?: string } | null
  const token = json?.refreshedToken ?? json?.token ?? null
  return NextResponse.json({ ok: true, role: target, roles: refreshed.docs[0]?.roles ?? [], token })
}
