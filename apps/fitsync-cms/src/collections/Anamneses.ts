import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { professionalOrStudentOnRecord, userId, userRole } from '../access/roles'

export const Anamneses: CollectionConfig = {
  slug: 'anamneses',
  admin: {
    defaultColumns: ['student', 'professional', 'status', 'completedAt'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      return userRole(req) === 'nutritionist'
    },
    read: professionalOrStudentOnRecord,
    update: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id || userRole(req) !== 'nutritionist') return false
      return { professional: { equals: id } }
    },
    delete: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id || userRole(req) !== 'nutritionist') return false
      return { professional: { equals: id } }
    },
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

        const actorId = toNumericRelationId(req.user.id)

        if (operation === 'update' && originalDoc) {
          const student = toNumericRelationId(originalDoc.student)
          const professional = toNumericRelationId(originalDoc.professional)
          if (student !== null) data.student = student
          if (professional !== null) data.professional = professional
        }

        if (operation === 'create' && actorId && userRole(req) === 'nutritionist') {
          data.professional = actorId
          const student = toNumericRelationId(data.student)
          if (
            !student ||
            !(await hasActiveLink({
              req,
              studentId: student,
              professionalId: actorId,
              professionalRole: 'nutritionist',
            }))
          ) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'student', message: 'Só é possível registrar anamnese de paciente vinculado.' }],
            })
          }
          data.student = student
        }

        coerceNumericRelations(data, relations)
        return data
      },
    ],
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'professional', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'answers', type: 'json', required: false },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Concluída', value: 'completed' },
      ],
    },
    { name: 'completedAt', type: 'date', required: false },
  ],
}
