import type { PayloadRequest } from 'payload'

type AuthUser = {
  isSuperAdmin?: boolean
  role?: string
}

/** Master / super-admin: acesso total no CMS e reconhecido no app FitSync. */
export function isSuperUser(req: PayloadRequest): boolean {
  const u = req.user as AuthUser | undefined
  if (!u) return false
  return u.isSuperAdmin === true || u.role === 'master'
}
