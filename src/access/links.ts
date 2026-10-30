import type { Access, PayloadRequest, Where } from 'payload'

import { isSuperUser } from './isSuper'
import { relationId, userId, userRole } from './roles'

export const studentOwnsProfile: Access = async ({ req }) => {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id) return false
  const role = userRole(req)
  if (role === 'student') return { user: { equals: id } } satisfies Where
  if (role === 'personal' || role === 'nutritionist') {
    const studentIds = await linkedStudentIds(req, { status: 'active' })
    if (studentIds.length === 0) return false
    return { user: { in: studentIds } } satisfies Where
  }
  return false
}

type LinkStatus = 'pending' | 'active' | 'revoked'

export async function linkedStudentIds(
  req: PayloadRequest,
  options: { status?: LinkStatus | LinkStatus[]; professionalRole?: 'personal' | 'nutritionist' } = {},
): Promise<string[]> {
  const id = userId(req)
  if (!id) return []
  const status = options.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : ['active']
  const and: Where[] = [
    { professional: { equals: id } },
    { status: { in: status } },
  ]
  if (options.professionalRole) {
    and.push({ professionalRole: { equals: options.professionalRole } })
  }
  const result = await req.payload.find({
    collection: 'professional-links',
    where: { and },
    limit: 200,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return result.docs
    .map((doc) => relationId(doc.student))
    .filter((value): value is string => Boolean(value))
}

export async function hasActiveLink(args: {
  req: PayloadRequest
  studentId: string | number
  professionalId?: string | number
  professionalRole?: 'personal' | 'nutritionist'
}): Promise<boolean> {
  const { req, studentId, professionalRole } = args
  if (isSuperUser(req)) return true
  const professionalId = args.professionalId ?? userId(req)
  if (!professionalId) return false
  const and: Where[] = [
    { student: { equals: studentId } },
    { professional: { equals: professionalId } },
    { status: { equals: 'active' } },
  ]
  if (professionalRole) {
    and.push({ professionalRole: { equals: professionalRole } })
  }
  const result = await req.payload.find({
    collection: 'professional-links',
    where: { and },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return result.docs.length > 0
}

export function expectedProfessionalRole(
  req: PayloadRequest,
): 'personal' | 'nutritionist' | null {
  const role = userRole(req)
  if (role === 'personal' || role === 'nutritionist') return role
  return null
}
