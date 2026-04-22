/** URL base do Payload (Next.js). Em dev: http://localhost:3000 */
export const CMS_BASE_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000'

export const USERS_API = `${CMS_BASE_URL}/api/users`

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

export function extractPayloadMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const d = data as Record<string, unknown>
  if (typeof d.message === 'string') return d.message
  const errors = d.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as Record<string, unknown>
    if (typeof first.message === 'string') return first.message
  }
  return ''
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
    throw new PayloadApiError(res.status, data)
  }
  return data as T
}
