import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { professionalOrStudentOnRecord, userId, userRole } from '../access/roles'

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: {
    defaultColumns: ['student', 'professional', 'date', 'status', 'type'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'personal' || role === 'nutritionist'
    },
    read: professionalOrStudentOnRecord,
    update: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'personal' || userRole(req) === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
    },
    delete: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'personal' || userRole(req) === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
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
        const role = userRole(req)

        if (operation === 'update' && originalDoc) {
          const student = toNumericRelationId(originalDoc.student)
          const professional = toNumericRelationId(originalDoc.professional)
          if (student !== null) data.student = student
          if (professional !== null) data.professional = professional
        }

        if (operation === 'create' && actorId && (role === 'personal' || role === 'nutritionist')) {
          data.professional = actorId
          const student = toNumericRelationId(data.student)
          if (!student || !(await hasActiveLink({ req, studentId: student, professionalId: actorId, professionalRole: role }))) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'student', message: 'Só é possível agendar para aluno com vínculo ativo.' }],
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
    { name: 'date', type: 'date', required: true, index: true },
    { name: 'time', type: 'text', required: false },
    { name: 'durationMin', type: 'number', required: false, min: 15, max: 240 },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'training',
      options: [
        { label: 'Treino', value: 'training' },
        { label: 'Avaliação', value: 'assessment' },
        { label: 'Consulta', value: 'consultation' },
        { label: 'Retorno', value: 'followup' },
      ],
    },
    { name: 'location', type: 'text', required: false },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      index: true,
      options: [
        { label: 'Agendada', value: 'scheduled' },
        { label: 'Concluída', value: 'completed' },
        { label: 'Cancelada', value: 'cancelled' },
      ],
    },
    { name: 'recurring', type: 'checkbox', defaultValue: false },
    { name: 'notes', type: 'textarea', required: false },
  ],
}
