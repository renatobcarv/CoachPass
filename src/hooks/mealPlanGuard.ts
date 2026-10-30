import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'

const relId = (v: unknown): string | null => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'object') {
    const id = (v as { id?: unknown }).id
    return id === undefined || id === null ? null : String(id)
  }
  return String(v)
}

/**
 * Garante quem é o autor e para quem é o plano alimentar:
 * - nutricionista: autor é sempre ele mesmo e o aluno precisa ser paciente ativo dele;
 * - aluno: só cria plano para si (ex.: gerado por IA);
 * - publicação: registra a data quando o plano passa a "publicado".
 * Operações administrativas (sem usuário, ex.: seed) e super usuários passam direto.
 */
export const mealPlanGuard: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  const me = userId(req)

  if (data.status === 'published' && originalDoc?.status !== 'published') {
    data.publishedAt = new Date().toISOString()
  }

  if (!me || isSuperUser(req)) return data

  const role = userRole(req)

  if (role === 'student') {
    data.student = req.user!.id
    if (operation === 'create') data.author = null
    return data
  }

  if (role === 'nutritionist') {
    data.author = req.user!.id

    const before = relId(originalDoc?.student)
    const target = relId(data.student) ?? before
    if (!target) throw new APIError('Selecione o paciente do plano.', 400)

    if (operation === 'create' || target !== before) {
      const links = await req.payload.find({
        collection: 'professional-links',
        where: {
          and: [
            { student: { equals: target } },
            { professional: { equals: me } },
            { professionalRole: { equals: 'nutritionist' } },
            { status: { equals: 'active' } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (links.totalDocs === 0) {
        throw new APIError('Este aluno não é seu paciente ativo.', 403)
      }
    }
  }

  return data
}
