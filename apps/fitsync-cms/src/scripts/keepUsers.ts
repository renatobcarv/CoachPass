export const KEEP_EMAILS = [
  'master@fitsync.local',
  'carloseduardomendesfarias0@gmail.com',
  'aluno@coachpass.app',
  'personal@coachpass.app',
  'nutri@coachpass.app',
] as const

export function normalizeEmail(value: string | null | undefined): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function isKeptEmail(email: string | null | undefined): boolean {
  return (KEEP_EMAILS as readonly string[]).includes(normalizeEmail(email))
}
