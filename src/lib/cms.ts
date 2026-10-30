/** URL do Payload. Vazio = mesma origem (app e CMS no mesmo Next.js). */
export const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || ''

export const USERS_API = `${CMS_BASE_URL}/api/users`
export const STUDENT_PROFILES_API = `${CMS_BASE_URL}/api/student-profiles`
export const PROFESSIONAL_LINKS_API = `${CMS_BASE_URL}/api/professional-links`
export const PROFESSIONAL_LINKS_INVITE_API = `${CMS_BASE_URL}/api/professional-links/invite`
export const WORKOUTS_API = `${CMS_BASE_URL}/api/workouts`
export const MEAL_PLANS_API = `${CMS_BASE_URL}/api/meal-plans`
export const AI_GENERATE_WORKOUT_API = `${CMS_BASE_URL}/api/ai/generate-workout`
export const AI_GENERATE_MEAL_PLAN_API = `${CMS_BASE_URL}/api/ai/generate-meal-plan`
export const AI_CHAT_API = `${CMS_BASE_URL}/api/ai/chat`
export const WORKOUT_LOGS_API = `${CMS_BASE_URL}/api/workout-logs`
export const FOODS_API = `${CMS_BASE_URL}/api/foods`
export const TRANSACTIONS_API = `${CMS_BASE_URL}/api/transactions`
export const ASSESSMENTS_API = `${CMS_BASE_URL}/api/assessments`
export const SESSIONS_API = `${CMS_BASE_URL}/api/sessions`
export const RESTRICTIONS_API = `${CMS_BASE_URL}/api/restrictions`
export const ANAMNESES_API = `${CMS_BASE_URL}/api/anamneses`
export const ME_EXPORT_API = `${CMS_BASE_URL}/api/me/export`
export const HEALTH_API = `${CMS_BASE_URL}/api/health`

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/** Bloqueia envio de credenciais por HTTP puro em produção (localhost continua liberado). */
export function assertSecureTransport(url: string = USERS_API): void {
  if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') return
  const target = new URL(url, window.location.href)
  if (target.protocol !== 'https:' && !LOCAL_HOSTS.has(target.hostname)) {
    throw new Error('Conexão insegura: o envio de senha só é permitido via HTTPS.')
  }
}

export type SessionInvalidKind = 'unauthorized' | 'forbidden'
type SessionInvalidListener = (kind: SessionInvalidKind, token: string) => void

const sessionInvalidListeners = new Set<SessionInvalidListener>()

/** 401 = token recusado; 403 pode ser sessão revogada ou permissão negada de verdade. */
export function onSessionInvalid(listener: SessionInvalidListener): () => void {
  sessionInvalidListeners.add(listener)
  return () => {
    sessionInvalidListeners.delete(listener)
  }
}

function notifySessionInvalid(status: number, authToken?: string | null): void {
  if (!authToken) return
  const kind: SessionInvalidKind | null =
    status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : null
  if (!kind) return
  for (const listener of sessionInvalidListeners) listener(kind, authToken)
}

const PAYLOAD_MESSAGES_PT: Record<string, string> = {
  'You are not allowed to perform this action.': 'Você não tem permissão para esta ação.',
  'You are not allowed to perform this action': 'Você não tem permissão para esta ação.',
  'This field is required.': 'Preencha os campos obrigatórios.',
  'This field is required': 'Preencha os campos obrigatórios.',
}

export class PayloadApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    const msg = extractPayloadMessage(data)
    super(msg || `Erro HTTP ${status}`)
    this.name = 'PayloadApiError'
  }
}

function firstFieldErrorMessage(errors: unknown): string {
  if (!Array.isArray(errors) || errors.length === 0) return ''
  for (const item of errors) {
    if (!item || typeof item !== 'object') continue
    const err = item as Record<string, unknown>
    if (typeof err.message === 'string' && err.message.trim()) {
      // Prefer nested field errors from Payload ValidationError
      const nested = err.data
      if (nested && typeof nested === 'object') {
        const nestedMsg = firstFieldErrorMessage((nested as Record<string, unknown>).errors)
        if (nestedMsg) return nestedMsg
      }
      return err.message
    }
  }
  return ''
}

function rawPayloadMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const d = data as Record<string, unknown>
  const fromErrors = firstFieldErrorMessage(d.errors)
  if (fromErrors) return fromErrors
  if (typeof d.message === 'string' && d.message.trim()) return d.message
  if (typeof d.error === 'string' && d.error.trim()) return d.error
  return ''
}

export function extractPayloadMessage(data: unknown): string {
  const raw = rawPayloadMessage(data)
  return PAYLOAD_MESSAGES_PT[raw.trim()] ?? raw
}

export async function postJson<T>(
  url: string,
  body: unknown,
  authToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (authToken) {
    headers.Authorization = `JWT ${authToken}`
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as unknown
  if (!res.ok) {
    notifySessionInvalid(res.status, authToken)
    throw new PayloadApiError(res.status, data)
  }
  return data as T
}

export async function getJson<T>(url: string, authToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `JWT ${authToken}`,
    },
  })
  const data = (await res.json().catch(() => ({}))) as unknown
  if (!res.ok) {
    notifySessionInvalid(res.status, authToken)
    throw new PayloadApiError(res.status, data)
  }
  return data as T
}

export async function patchJson<T>(
  url: string,
  body: unknown,
  authToken: string,
): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${authToken}`,
    },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as unknown
  if (!res.ok) {
    notifySessionInvalid(res.status, authToken)
    throw new PayloadApiError(res.status, data)
  }
  return data as T
}

export async function deleteJson<T>(url: string, authToken: string): Promise<T> {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `JWT ${authToken}`,
    },
  })
  const data = (await res.json().catch(() => ({}))) as unknown
  if (!res.ok) {
    notifySessionInvalid(res.status, authToken)
    throw new PayloadApiError(res.status, data)
  }
  return data as T
}

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const out = search.toString()
  return out ? `?${out}` : ''
}
