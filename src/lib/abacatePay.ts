import crypto from 'node:crypto'
import type { Payload } from 'payload'

import { type ProTier } from './proPlans'
import { STUDENT_PLANS, type StudentCycle } from './studentPlans'

/**
 * Integração com o AbacatePay (API v2): assinaturas dos profissionais (Pro/Elite)
 * e do aluno (Aluno Pro mensal/semestral/anual). Só roda no servidor (chave ABACATE_PAY).
 */

const API = 'https://api.abacatepay.com/v2'

/** Chave pública oficial do AbacatePay para o HMAC dos webhooks (documentação "Segurança de webhooks"). */
const ABACATEPAY_WEBHOOK_HMAC_KEY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

export type ProductKey = 'pro' | 'elite' | 'student_monthly' | 'student_semester' | 'student_annual'
export type Audience = 'pro' | 'student'

const PRODUCT_ENV: Record<ProductKey, string> = {
  pro: 'ABACATE_PRODUCT_PRO',
  elite: 'ABACATE_PRODUCT_ELITE',
  student_monthly: 'ABACATE_PRODUCT_STUDENT_MONTHLY',
  student_semester: 'ABACATE_PRODUCT_STUDENT_SEMESTER',
  student_annual: 'ABACATE_PRODUCT_STUDENT_ANNUAL',
}

/** Meses pagos por ciclo de cada produto */
const PRODUCT_MONTHS: Record<ProductKey, number> = {
  pro: 1,
  elite: 1,
  student_monthly: STUDENT_PLANS.monthly.months,
  student_semester: STUDENT_PLANS.semester.months,
  student_annual: STUDENT_PLANS.annual.months,
}

/** Valor por ciclo em centavos (confere o que o AbacatePay cobrou, dentro do mesmo público) */
const PRODUCT_CENTS: Record<ProductKey, number> = {
  pro: 1990,
  elite: 2990,
  student_monthly: Math.round(STUDENT_PLANS.monthly.price * 100),
  student_semester: Math.round(STUDENT_PLANS.semester.price * 100),
  student_annual: Math.round(STUDENT_PLANS.annual.price * 100),
}

export const audienceOf = (key: ProductKey): Audience => (key.startsWith('student_') ? 'student' : 'pro')
export const studentProductKey = (cycle: StudentCycle): ProductKey => `student_${cycle}` as ProductKey
export const isProductKey = (v: unknown): v is ProductKey => typeof v === 'string' && v in PRODUCT_ENV

export class AbacatePayError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

export function productIdFor(key: ProductKey): string | null {
  return process.env[PRODUCT_ENV[key]]?.trim() || null
}

export function keyForProduct(productId: string | null | undefined): ProductKey | null {
  if (!productId) return null
  return (Object.keys(PRODUCT_ENV) as ProductKey[]).find((k) => productIdFor(k) === productId) ?? null
}

/** Pagamento liberado para o público (chave + produtos configurados). */
export function abacateConfigured(audience: Audience = 'pro'): boolean {
  if (!process.env.ABACATE_PAY) return false
  if (audience === 'pro') return Boolean(productIdFor('pro') && productIdFor('elite'))
  return Boolean(productIdFor('student_monthly') || productIdFor('student_semester') || productIdFor('student_annual'))
}

async function call<T>(
  path: string,
  init: { method?: 'GET' | 'POST'; query?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const key = process.env.ABACATE_PAY?.trim()
  if (!key) throw new AbacatePayError('Pagamento não configurado (ABACATE_PAY ausente).', 503)
  const qs = init.query ? `?${new URLSearchParams(init.query).toString()}` : ''
  let res: Response
  try {
    res = await fetch(`${API}${path}${qs}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    throw new AbacatePayError('Não foi possível falar com o AbacatePay agora.', 502)
  }
  const json = (await res.json().catch(() => null)) as { data?: T; error?: string | null; success?: boolean } | null
  if (!res.ok || !json || json.success === false) {
    const msg = typeof json?.error === 'string' && json.error ? json.error : `AbacatePay respondeu ${res.status}`
    throw new AbacatePayError(msg, res.status === 404 ? 404 : 502)
  }
  return json.data as T
}

export type AbacateSubscription = {
  id: string
  checkoutId: string | null
  customerId: string
  amount: number
  status: 'ACTIVE' | 'CANCELLED' | string
  createdAt: string
  updatedAt: string
}

/** Páginas aceitas como volta do checkout (evita redirecionar para fora do app). */
export const CHECKOUT_RETURN_PATHS = [
  '/planos',
  '/onboarding/student',
  '/onboarding/professional',
  '/app/configuracoes',
  '/personal/configuracoes',
  '/nutritionist/configuracoes',
] as const

export function safeReturnPath(path: unknown): string {
  return typeof path === 'string' && (CHECKOUT_RETURN_PATHS as readonly string[]).includes(path) ? path : '/planos'
}

export async function createSubscriptionCheckout(args: {
  product: ProductKey
  userId: number | string
  customerId?: string | null
  appUrl: string
  /** Página para onde o cliente volta (só caminhos da lista CHECKOUT_RETURN_PATHS) */
  returnPath?: string | null
}): Promise<{ id: string; url: string }> {
  const back = safeReturnPath(args.returnPath)
  const productId = productIdFor(args.product)
  if (!productId) throw new AbacatePayError('Produto do plano não configurado.', 503)
  const body = {
    items: [{ id: productId, quantity: 1 }],
    // PIX Automático precisa estar liberado na loja do AbacatePay (ABACATE_PIX_AUTOMATICO=true)
    methods: process.env.ABACATE_PIX_AUTOMATICO === 'true' ? ['CARD', 'PIX'] : ['CARD'],
    returnUrl: `${args.appUrl}${back}`,
    completionUrl: `${args.appUrl}${back}?assinatura=retorno`,
    externalId: `coachpass-user-${args.userId}-${Date.now()}`,
    metadata: { userId: String(args.userId), product: args.product },
    ...(args.customerId ? { customerId: args.customerId } : {}),
  }
  try {
    return await call<{ id: string; url: string }>('/subscriptions/create', { method: 'POST', body })
  } catch (err) {
    // Conta sem Pix Automático: tenta só cartão
    if (err instanceof AbacatePayError && /pix/i.test(err.message)) {
      return call('/subscriptions/create', { method: 'POST', body: { ...body, methods: ['CARD'] } })
    }
    throw err
  }
}

export async function getSubscription(id: string): Promise<AbacateSubscription | null> {
  try {
    return await call<AbacateSubscription>('/subscriptions/get', { query: { id } })
  } catch (err) {
    if (err instanceof AbacatePayError && err.status === 404) return null
    throw err
  }
}

export async function findSubscriptionByCheckout(checkoutId: string): Promise<AbacateSubscription | null> {
  const list = await call<AbacateSubscription[]>('/subscriptions/list', { query: { checkoutId, limit: '10' } })
  if (!Array.isArray(list) || list.length === 0) return null
  // A mais recente primeiro
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
}

export async function createPortalLink(customerId: string, checkoutId: string): Promise<string> {
  const data = await call<{ url: string }>('/customer-portal/create', {
    method: 'POST',
    body: { customerId, checkoutId },
  })
  return data.url
}

export async function changeSubscriptionPlan(subscriptionId: string, product: ProductKey): Promise<void> {
  const productId = productIdFor(product)
  if (!productId) throw new AbacatePayError('Produto do plano não configurado.', 503)
  await call('/subscriptions/change-plan', {
    method: 'POST',
    body: { id: subscriptionId, productId, quantity: 1 },
  })
}

/** Confere o secret da URL e a assinatura HMAC-SHA256 (base64) do corpo bruto. */
export function verifyWebhook(rawBody: string, signature: string | null, secretParam: string | null): boolean {
  const expectedSecret = process.env.ABACATE_WEBHOOK_SECRET?.trim()
  if (!expectedSecret || !secretParam || !signature) return false
  const a = Buffer.from(secretParam)
  const b = Buffer.from(expectedSecret)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false

  const expectedSig = crypto.createHmac('sha256', ABACATEPAY_WEBHOOK_HMAC_KEY).update(Buffer.from(rawBody, 'utf8')).digest('base64')
  const x = Buffer.from(expectedSig)
  const y = Buffer.from(signature)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

/** Produto pelo valor cobrado, só entre os produtos do mesmo público (Elite e Aluno mensal custam igual). */
export function keyFromAmount(cents: number | null | undefined, audience: Audience): ProductKey | null {
  if (!cents) return null
  return (Object.keys(PRODUCT_CENTS) as ProductKey[]).find((k) => audienceOf(k) === audience && PRODUCT_CENTS[k] === cents) ?? null
}

const PRO_RANK: Record<string, number> = { pro: 1, elite: 2 }
const higherPro = (a: ProductKey | null, b: ProductKey | null): ProductKey | null => {
  if (!a) return b
  if (!b) return a
  return (PRO_RANK[a] ?? 0) >= (PRO_RANK[b] ?? 0) ? a : b
}

type BillingUser = {
  id: number
  role?: string | null
  proTier?: string | null
  paidUntil?: string | null
  checkoutTier?: string | null
  subscriptionStatus?: string | null
  abacateCheckoutId?: string | null
  abacateSubscriptionId?: string | null
  abacateCustomerId?: string | null
}

export type SyncHint = {
  /** Data do pagamento confirmado (renovação) */
  paidAt?: string | null
  /** 'NOW' = cancelamento imediato (reembolso, falha de cobrança) */
  cancelPolicy?: string | null
  /** Produto cobrado no ciclo (renovação após troca de plano) */
  productId?: string | null
}

/**
 * Busca a assinatura no AbacatePay e aplica no usuário. A API é a fonte da verdade;
 * o webhook só avisa que algo mudou (e dá a data do pagamento).
 */
export async function syncUserSubscription(payload: Payload, user: BillingUser, hint: SyncHint = {}) {
  let sub: AbacateSubscription | null = null
  if (user.abacateSubscriptionId) sub = await getSubscription(user.abacateSubscriptionId)
  if (!sub && user.abacateCheckoutId) sub = await findSubscriptionByCheckout(user.abacateCheckoutId)
  if (!sub) return { changed: false as const }

  const chosen = isProductKey(user.checkoutTier) ? user.checkoutTier : null
  const audience: Audience = chosen ? audienceOf(chosen) : user.role === 'student' ? 'student' : 'pro'
  const charged = keyForProduct(hint.productId) ?? keyFromAmount(sub.amount, audience)
  // Profissional: valor cobrado manda, mas um upgrade pedido (troca agendada) já libera o plano maior
  const product: ProductKey =
    audience === 'pro' ? (higherPro(charged, chosen) ?? 'pro') : (charged ?? chosen ?? 'student_monthly')
  const months = PRODUCT_MONTHS[product]

  if (sub.status === 'ACTIVE') {
    const now = new Date()
    const base = hint.paidAt ? new Date(hint.paidAt) : user.paidUntil ? null : new Date(sub.createdAt)
    let paidUntil = user.paidUntil ? new Date(user.paidUntil) : null
    if (base) {
      const next = addMonths(base, months)
      if (!paidUntil || next > paidUntil) paidUntil = next
    }
    // Assinatura segue ativa no AbacatePay mas não recebemos a renovação: avança os ciclos
    while (paidUntil && paidUntil < now) paidUntil = addMonths(paidUntil, months)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        ...(audience === 'pro' ? { proTier: product as ProTier, trialEndsAt: null } : { studentTier: 'pro' }),
        subscriptionStatus: 'active',
        abacateSubscriptionId: sub.id,
        abacateCustomerId: sub.customerId,
        ...(sub.checkoutId ? { abacateCheckoutId: sub.checkoutId } : {}),
        paidUntil: paidUntil?.toISOString() ?? null,
      },
      overrideAccess: true,
      context: { billingSync: true },
    })
    return { changed: true as const, status: 'active' as const, product }
  }

  // Cancelada: imediato quando o AbacatePay cortou na hora; senão o acesso segue até o fim do ciclo pago
  const immediate = hint.cancelPolicy === 'NOW' || !user.paidUntil
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      subscriptionStatus: 'cancelled',
      abacateSubscriptionId: sub.id,
      ...(immediate
        ? { ...(audience === 'pro' ? { proTier: 'free' } : { studentTier: 'free' }), paidUntil: null }
        : {}),
    },
    overrideAccess: true,
    context: { billingSync: true },
  })
  return { changed: true as const, status: 'cancelled' as const, product }
}

export function appBaseUrl(): string {
  return (process.env.FITSYNC_FRONTEND_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}
