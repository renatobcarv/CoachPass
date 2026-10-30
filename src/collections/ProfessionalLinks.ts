import type { CollectionConfig, Where } from 'payload'
import { APIError, ValidationError } from 'payload'

import { getStudentCapacity, PLAN_LIMIT_CODE, planLimitMessage } from '../lib/proCapacity'

import { expectedProfessionalRole } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { userId, userRole } from '../access/roles'

export const ProfessionalLinks: CollectionConfig = {
  slug: 'professional-links',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'professional', 'professionalRole', 'status', 'updatedAt'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'personal' || role === 'nutritionist'
    },
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      const role = userRole(req)
      if (role === 'student') return { student: { equals: id } }
      if (role === 'personal' || role === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
    },
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      const role = userRole(req)
      if (role === 'student') return { student: { equals: id } }
      if (role === 'personal' || role === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
    },
    delete: ({ req }) => isSuperUser(req),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req, collection, originalDoc }) => {
        if (!data) return data
        const relations = ['student', 'professional'] as const
        if (!req.user || isSuperUser(req) || req.context?.seedDemo) {
          coerceNumericRelations(data, relations)
          return data
        }

        const actorId = toNumericRelationId(req.user?.id)
        const role = expectedProfessionalRole(req)

        if (operation === 'create') {
          if (!actorId || !role) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'professional', message: 'Apenas personal ou nutricionista podem criar vínculos.' }],
            })
          }
          data.professional = actorId
          data.professionalRole = role
          data.status = 'pending'
          data.acceptedAt = null
          data.revokedAt = null

          const student = toNumericRelationId(data.student)
          if (!student) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'student', message: 'Informe o aluno.' }],
            })
          }
          data.student = student
          if (student === actorId) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'student', message: 'Você não pode vincular a si mesmo.' }],
            })
          }

          const existing = await req.payload.find({
            collection: 'professional-links',
            where: {
              and: [
                { student: { equals: student } },
                { professional: { equals: actorId } },
                { professionalRole: { equals: role } },
                { status: { in: ['pending', 'active'] } },
              ],
            },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (existing.docs[0]) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'student', message: 'Já existe um convite ou vínculo ativo com este aluno.' }],
            })
          }
        }

        if (operation === 'update' && originalDoc) {
          const student = toNumericRelationId(originalDoc.student)
          const professional = toNumericRelationId(originalDoc.professional)
          if (student !== null) data.student = student
          if (professional !== null) data.professional = professional
          data.professionalRole = originalDoc.professionalRole

          const currentStatus = String(originalDoc?.status || '')
          const nextStatus = data.status ? String(data.status) : currentStatus
          const actorRole = userRole(req)

          if (actorRole === 'student') {
            if (currentStatus !== 'pending' || (nextStatus !== 'active' && nextStatus !== 'revoked')) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'status', message: 'O aluno só pode aceitar ou recusar um convite pendente.' }],
              })
            }
            if (nextStatus === 'active') data.acceptedAt = new Date().toISOString()
            if (nextStatus === 'revoked') data.revokedAt = new Date().toISOString()
          } else if (actorRole === 'personal' || actorRole === 'nutritionist') {
            if (nextStatus !== 'revoked') {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'status', message: 'O profissional só pode encerrar o vínculo.' }],
              })
            }
            data.revokedAt = new Date().toISOString()
          }
        }

        coerceNumericRelations(data, relations)
        return data
      },
    ],
    beforeChange: [
      // Limite de alunos do plano (vale para a rota de convite e para a API direta)
      async ({ data, operation, req }) => {
        if (operation !== 'create' || isSuperUser(req) || req.context?.seedDemo) return data
        const professional = toNumericRelationId(data.professional)
        if (!professional) return data
        const capacity = await getStudentCapacity(req.payload, professional, req)
        if (!capacity.canAdd) {
          throw new APIError(planLimitMessage(capacity), 402, { code: PLAN_LIMIT_CODE, ...capacity }, true)
        }
        return data
      },
      // Nome de quem convidou: o aluno não lê a conta do profissional, mas precisa saber quem é
      async ({ data, operation, req, originalDoc }) => {
        if (operation === 'update') {
          data.professionalName = originalDoc?.professionalName ?? null
          return data
        }
        const professional = toNumericRelationId(data.professional)
        if (!professional) {
          data.professionalName = null
          return data
        }
        const pro = await req.payload.findByID({
          collection: 'users',
          id: professional,
          depth: 0,
          overrideAccess: true,
          req,
        })
        data.professionalName = pro?.name || null
        return data
      },
    ],
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'professional',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'professionalRole',
      type: 'select',
      required: true,
      options: [
        { label: 'Personal trainer', value: 'personal' },
        { label: 'Nutricionista', value: 'nutritionist' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Ativo', value: 'active' },
        { label: 'Revogado', value: 'revoked' },
      ],
    },
    {
      name: 'acceptedAt',
      type: 'date',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'revokedAt',
      type: 'date',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      required: false,
    },
    {
      name: 'professionalName',
      type: 'text',
      label: 'Nome do profissional',
      required: false,
      // Sempre definido pelo servidor (hook); o valor enviado pelo cliente é ignorado
      admin: { readOnly: true, description: 'Preenchido pelo servidor ao criar o convite.' },
    },
  ],
}
