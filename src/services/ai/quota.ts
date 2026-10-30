import type { Payload } from 'payload'

const FREE_MONTHLY_LIMIT = 2
const TIME_ZONE = 'America/Sao_Paulo'

export function currentMonthBounds(now = new Date()): { start: Date; end: Date; label: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  if (!year || !month) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    return { start, end, label: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}` }
  }
  // Início do mês em SP ≈ 03:00 UTC no horário de verão / 03:00 ou 02:00 — usamos meia-noite SP via offset fixo aproximado.
  const start = new Date(`${year}-${month}-01T03:00:00.000Z`)
  const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1
  const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year)
  const end = new Date(
    `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T03:00:00.000Z`,
  )
  return { start, end, label: `${year}-${month}` }
}

export async function getAiQuota(
  payload: Payload,
  userId: string | number,
  type: 'workout' | 'meal_plan' = 'workout',
) {
  const { start, end, label } = currentMonthBounds()
  const result = await payload.find({
    collection: 'ai-generations',
    where: {
      and: [
        { user: { equals: userId } },
        { type: { equals: type } },
        { status: { in: ['pending', 'succeeded'] } },
        { createdAt: { greater_than_equal: start.toISOString() } },
        { createdAt: { less_than: end.toISOString() } },
      ],
    },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const used = result.totalDocs
  const remaining = Math.max(0, FREE_MONTHLY_LIMIT - used)
  return {
    limit: FREE_MONTHLY_LIMIT,
    used,
    remaining,
    month: label,
    blocked: remaining <= 0,
  }
}

export const CHAT_DAILY_LIMIT = 30

export function currentDayBounds(now = new Date()): { start: Date; end: Date } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  const start = new Date(`${year}-${month}-${day}T03:00:00.000Z`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

export async function getChatQuota(payload: Payload, userId: string | number) {
  const { start, end } = currentDayBounds()
  const result = await payload.find({
    collection: 'ai-generations',
    where: {
      and: [
        { user: { equals: userId } },
        { type: { equals: 'chat' } },
        { status: { in: ['pending', 'succeeded'] } },
        { createdAt: { greater_than_equal: start.toISOString() } },
        { createdAt: { less_than: end.toISOString() } },
      ],
    },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  const used = result.totalDocs
  return {
    limit: CHAT_DAILY_LIMIT,
    used,
    remaining: Math.max(0, CHAT_DAILY_LIMIT - used),
    blocked: used >= CHAT_DAILY_LIMIT,
  }
}

export { FREE_MONTHLY_LIMIT, TIME_ZONE }
