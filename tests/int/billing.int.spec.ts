// @vitest-environment node
import crypto from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { keyForProduct, keyFromAmount, verifyWebhook } from '@/lib/abacatePay'
import { effectiveTier, PAYMENT_GRACE_DAYS, recommendTier, tierFromAmount } from '@/lib/proPlans'

// Chave pública do AbacatePay para o HMAC (a mesma da documentação)
const HMAC_KEY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'
const sign = (body: string) => crypto.createHmac('sha256', HMAC_KEY).update(body).digest('base64')

describe('webhook do AbacatePay', () => {
  const saved = { ...process.env }
  beforeEach(() => {
    process.env.ABACATE_WEBHOOK_SECRET = 'segredo-de-teste'
  })
  afterEach(() => {
    process.env = { ...saved }
  })

  const body = JSON.stringify({ id: 'log_1', event: 'subscription.completed', data: {} })

  it('aceita secret e assinatura corretos', () => {
    expect(verifyWebhook(body, sign(body), 'segredo-de-teste')).toBe(true)
  })

  it('recusa secret errado mesmo com assinatura válida', () => {
    expect(verifyWebhook(body, sign(body), 'outro')).toBe(false)
  })

  it('recusa corpo alterado', () => {
    expect(verifyWebhook(body.replace('completed', 'cancelled'), sign(body), 'segredo-de-teste')).toBe(false)
  })

  it('recusa sem assinatura ou sem secret configurado', () => {
    expect(verifyWebhook(body, null, 'segredo-de-teste')).toBe(false)
    delete process.env.ABACATE_WEBHOOK_SECRET
    expect(verifyWebhook(body, sign(body), 'segredo-de-teste')).toBe(false)
  })
})

describe('plano em vigor', () => {
  const day = 86_400_000
  const now = new Date('2026-11-10T12:00:00Z')

  it('assinatura paga vale até o fim do ciclo mais a folga de cobrança', () => {
    const paidUntil = new Date(now.getTime() - (PAYMENT_GRACE_DAYS - 1) * day).toISOString()
    expect(effectiveTier({ proTier: 'pro', paidUntil }, now)).toBe('pro')
  })

  it('volta para o grátis depois da folga', () => {
    const paidUntil = new Date(now.getTime() - (PAYMENT_GRACE_DAYS + 1) * day).toISOString()
    expect(effectiveTier({ proTier: 'elite', paidUntil }, now)).toBe('free')
  })

  it('teste vencido volta para o grátis', () => {
    expect(effectiveTier({ proTier: 'pro', trialEndsAt: new Date(now.getTime() - day).toISOString() }, now)).toBe('free')
  })

  it('super usuário não tem limite', () => {
    expect(effectiveTier({ proTier: 'free', isSuperAdmin: true }, now)).toBe('elite')
  })
})

describe('preços e produtos', () => {
  it('lê o plano pelo valor cobrado em centavos', () => {
    expect(tierFromAmount(1990)).toBe('pro')
    expect(tierFromAmount(2990)).toBe('elite')
    expect(tierFromAmount(1234)).toBe(null)
  })

  it('mapeia o produto do AbacatePay para o plano', () => {
    process.env.ABACATE_PRODUCT_PRO = 'prod_pro'
    process.env.ABACATE_PRODUCT_ELITE = 'prod_elite'
    process.env.ABACATE_PRODUCT_STUDENT_ANNUAL = 'prod_aluno_anual'
    expect(keyForProduct('prod_pro')).toBe('pro')
    expect(keyForProduct('prod_elite')).toBe('elite')
    expect(keyForProduct('prod_aluno_anual')).toBe('student_annual')
    expect(keyForProduct('prod_x')).toBe(null)
  })

  it('Elite e Aluno mensal custam igual: o público desempata', () => {
    expect(keyFromAmount(2990, 'pro')).toBe('elite')
    expect(keyFromAmount(2990, 'student')).toBe('student_monthly')
    expect(keyFromAmount(24990, 'student')).toBe('student_annual')
    expect(keyFromAmount(1990, 'student')).toBe(null)
  })

  it('recomenda o menor plano que comporta a carteira', () => {
    expect(recommendTier(5)).toBe('free')
    expect(recommendTier(6)).toBe('pro')
    expect(recommendTier(41)).toBe('elite')
  })
})
