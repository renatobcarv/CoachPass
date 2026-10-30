import { NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'

import { syncUserSubscription, verifyWebhook } from '@/lib/abacatePay'
import type { PlanUser } from '@/lib/proBilling'

export const dynamic = 'force-dynamic'

type WebhookEvent = {
  id?: string
  event?: string
  devMode?: boolean
  data?: {
    subscription?: { id?: string; cancelPolicy?: string | null }
    checkout?: { id?: string; items?: Array<{ id?: string }> }
    customer?: { id?: string; email?: string } | null
    payment?: { createdAt?: string; status?: string } | null
  }
}

const HANDLED = new Set([
  'subscription.completed',
  'subscription.renewed',
  'subscription.cancelled',
  'subscription.payment_failed',
])

/**
 * Webhook do AbacatePay. Configure no painel:
 *   URL: https://SEU-DOMINIO/api/webhooks/abacatepay?webhookSecret=<ABACATE_WEBHOOK_SECRET>
 *   Eventos: subscription.completed, subscription.renewed, subscription.cancelled, subscription.payment_failed
 * O evento só avisa; o estado real é buscado na API do AbacatePay.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  const url = new URL(request.url)
  const ok = verifyWebhook(raw, request.headers.get('x-webhook-signature'), url.searchParams.get('webhookSecret'))
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let event: WebhookEvent
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (!event.event || !HANDLED.has(event.event)) return NextResponse.json({ ok: true, ignored: true })

  const payload = await getPayload({ config })
  const subId = event.data?.subscription?.id
  const checkoutId = event.data?.checkout?.id

  // Acha o profissional: pela assinatura já conhecida ou pelo checkout que ele abriu
  const or: Where[] = []
  if (subId) or.push({ abacateSubscriptionId: { equals: subId } })
  if (checkoutId) or.push({ abacateCheckoutId: { equals: checkoutId } })
  if (or.length === 0) return NextResponse.json({ ok: true, ignored: true })

  const found = await payload.find({
    collection: 'users',
    where: { or },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const user = found.docs[0] as unknown as PlanUser | undefined
  if (!user) {
    // 200 para o AbacatePay não ficar reenviando um evento que não é nosso
    payload.logger.warn(`[abacatepay] ${event.event} sem usuário (subs=${subId} bill=${checkoutId})`)
    return NextResponse.json({ ok: true, unknown: true })
  }

  if (event.event === 'subscription.payment_failed') {
    // O AbacatePay tenta de novo; o acesso segue até o fim da folga do ciclo pago
    payload.logger.warn(`[abacatepay] cobrança falhou para o usuário ${user.id}`)
    return NextResponse.json({ ok: true })
  }

  try {
    const result = await syncUserSubscription(payload, user, {
      paidAt: event.event === 'subscription.cancelled' ? null : event.data?.payment?.createdAt ?? null,
      cancelPolicy: event.data?.subscription?.cancelPolicy ?? null,
      productId: event.data?.checkout?.items?.[0]?.id ?? null,
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    payload.logger.error(`[abacatepay] falha ao sincronizar usuário ${user.id}: ${String(err)}`)
    // 5xx faz o AbacatePay reenviar mais tarde
    return NextResponse.json({ error: 'Falha temporária' }, { status: 503 })
  }
}
