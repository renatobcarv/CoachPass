import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { professionalOrStudentOnRecord, userId, userRole } from '../access/roles'

export const Assessments: CollectionConfig = {
  slug: 'assessments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['kind', 'student', 'professional', 'date', 'updatedAt'],
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
              errors: [{ path: 'student', message: 'Só é possível avaliar aluno com vínculo ativo.' }],
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
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Avaliação física', value: 'physical' },
        { label: 'Consulta nutricional', value: 'consultation' },
      ],
    },
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'professional', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'date', type: 'date', required: true },
    { name: 'weightKg', type: 'number', required: false },
    { name: 'bodyFatPercent', type: 'number', required: false },
    { name: 'muscleMassKg', type: 'number', required: false },
    { name: 'visceralFat', type: 'number', required: false },
    { name: 'bmr', type: 'number', required: false },
    { name: 'hydrationPercent', type: 'number', required: false },
    {
      name: 'circumferences',
      type: 'group',
      fields: [
        { name: 'chest', type: 'number' },
        { name: 'waist', type: 'number' },
        { name: 'hip', type: 'number' },
        { name: 'arm', type: 'number' },
        { name: 'thigh', type: 'number' },
      ],
    },
    { name: 'restingHeartRate', type: 'number', required: false },
    { name: 'bloodPressure', type: 'text', required: false },
    { name: 'adherenceScore', type: 'number', required: false, min: 0, max: 10 },
    { name: 'energyScore', type: 'number', required: false, min: 0, max: 10 },
    { name: 'sleepScore', type: 'number', required: false, min: 0, max: 10 },
    { name: 'parq', type: 'json', required: false },
    { name: 'notes', type: 'textarea', required: false },
    { name: 'nextDate', type: 'date', required: false },
  ],
}
