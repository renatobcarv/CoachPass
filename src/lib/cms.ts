/** URL do Payload. Vazio = mesma origem (app e CMS no mesmo Next.js). */
export const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || ''

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

export function extractPayloadMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const d = data as Record<string, unknown>
  const fromErrors = firstFieldErrorMessage(d.errors)
  if (fromErrors) return fromErrors
  if (typeof d.message === 'string') return d.message
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
