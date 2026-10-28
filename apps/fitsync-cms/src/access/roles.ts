import type { Access, PayloadRequest, Where } from 'payload'

import { isSuperUser } from './isSuper'

export { coerceNumericRelations, toNumericRelationId } from './relationIds'

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

export function relationId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: unknown }).id)
  }
  return String(value)
}

export const professionalOrStudentOnRecord: Access = ({ req }): boolean | Where => {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id) return false
  const role = userRole(req)
  if (role === 'student') return { student: { equals: id } }
  if (role === 'personal' || role === 'nutritionist') {
    return { professional: { equals: id } }
  }
  return false
}
