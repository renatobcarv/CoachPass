type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60_000

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

function prune(now: number) {
  if (buckets.size < 2000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function consumeRateLimit(key: string, limit: number, windowMs = WINDOW_MS): RateLimitResult {
  const now = Date.now()
  prune(now)
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) }
  }
  existing.count += 1
  const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec }
  }
  return { ok: true, remaining: Math.max(0, limit - existing.count), retryAfterSec }
}

export function clientIp(headers: Headers, fallback = 'unknown'): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip') || fallback
}
