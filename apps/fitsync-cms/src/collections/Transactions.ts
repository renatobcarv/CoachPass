import type { CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { userId, userRole } from '../access/roles'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['description', 'student', 'amount', 'status', 'dueDate'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'personal' || role === 'nutritionist'
    },
    read: async ({ req }): Promise<boolean | Where> => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'student') return { student: { equals: id } }
      if (userRole(req) === 'personal' || userRole(req) === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
    },
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
              errors: [{ path: 'student', message: 'Só é possível lançar para aluno com vínculo ativo.' }],
            })
          }
          data.student = student
        }

        if (data.status === 'paid' && !data.paidAt) {
          data.paidAt = new Date().toISOString()
        }

        coerceNumericRelations(data, relations)
        return data
      },
    ],
  },
  fields: [
    { name: 'professional', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'description', type: 'text', required: true },
    { name: 'amount', type: 'number', required: true, min: 0 },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'charge',
      options: [
        { label: 'Cobrança', value: 'charge' },
        { label: 'Recebimento', value: 'payment' },
        { label: 'Despesa', value: 'expense' },
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
        { label: 'Pago', value: 'paid' },
        { label: 'Atrasado', value: 'overdue' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
    },
    { name: 'dueDate', type: 'date', required: false },
    { name: 'paidAt', type: 'date', required: false },
    { name: 'notes', type: 'textarea', required: false },
  ],
}
