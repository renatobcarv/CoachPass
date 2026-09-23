import type { Access, PayloadRequest, Where } from 'payload'

import { isSuperUser } from './isSuper'

type AuthUser = {
  id?: string | number
  role?: string
}

export function userId(req: PayloadRequest): string | null {
  const id = req.user?.id
  if (id === undefined || id === null) return null
  return String(id)
}

export function userRole(req: PayloadRequest): string | null {
  return (req.user as AuthUser | undefined)?.role ?? null
}

/** Aluno lê/edita o próprio perfil; super lê tudo. */
export const studentOwnsProfile: Access = ({ req }) => {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id || userRole(req) !== 'student') return false
  return { user: { equals: id } } satisfies Where
}
