import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { recomputeCycle } from '@/lib/periodization/engine'

export const dynamic = 'force-dynamic'

/** Recalcula o realizado do ciclo agora (fecha a semana sem esperar um novo registro). */
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as { cycleId?: unknown }
  const id = Number(body.cycleId)
  if (!id) return NextResponse.json({ error: 'Informe o ciclo.' }, { status: 400 })

  // Respeita o acesso de quem pede: só recalcula ciclo que a pessoa pode ver
  const cycle = await payload
    .findByID({ collection: 'training-cycles', id, depth: 0, user, overrideAccess: false })
    .catch(() => null)
  if (!cycle) return NextResponse.json({ error: 'Ciclo não encontrado.' }, { status: 404 })
  if (cycle.status === 'active') await recomputeCycle(payload, cycle as never)
  return NextResponse.json({ ok: true })
}
