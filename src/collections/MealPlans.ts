import type { CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { userId, userRole } from '../access/roles'

export const MealPlans: CollectionConfig = {
  slug: 'meal-plans',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'status', 'source', 'updatedAt'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'nutritionist' || role === 'student'
    },
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      const role = userRole(req)
      if (role === 'student') {
        return {
          and: [{ student: { equals: id } }, { status: { equals: 'published' } }],
        }
      }
      if (role === 'nutritionist') {
        return { author: { equals: id } }
      }
      return false
    },
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'nutritionist') return { author: { equals: id } }
      return false
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'nutritionist') return { author: { equals: id } }
      return false
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req, collection, originalDoc }) => {
        if (!data) return data
        const relations = ['student', 'author'] as const
        if (!req.user || isSuperUser(req) || req.context?.seedDemo) {
          coerceNumericRelations(data, relations)
          return data
        }

        const actorId = toNumericRelationId(req.user.id)
        const role = userRole(req)
        if (!actorId) {
          coerceNumericRelations(data, relations)
          return data
        }

        if (operation === 'create') {
          if (role === 'student') {
            data.student = actorId
            data.author = actorId
            data.isInformational = true
          } else if (role === 'nutritionist') {
            data.author = actorId
            data.source = 'professional'
            const student = toNumericRelationId(data.student)
            if (!student) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'student', message: 'Informe o paciente do plano.' }],
              })
            }
            data.student = student
            const linked = await hasActiveLink({
              req,
              studentId: student,
              professionalId: actorId,
              professionalRole: 'nutritionist',
            })
            if (!linked) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [
                  { path: 'student', message: 'Só é possível prescrever plano para paciente com vínculo ativo.' },
                ],
              })
            }
          } else {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'author', message: 'Sem permissão para criar plano alimentar.' }],
            })
          }
        }

        if (operation === 'update' && originalDoc) {
          const student = toNumericRelationId(originalDoc.student)
          const author = toNumericRelationId(originalDoc.author)
          if (student !== null) data.student = student
          if (author !== null) data.author = author
        }

        coerceNumericRelations(data, relations)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'professional',
      options: [
        { label: 'Profissional', value: 'professional' },
        { label: 'IA', value: 'ai' },
      ],
    },
    {
      name: 'observations',
      type: 'textarea',
      label: 'Orientações nutricionais',
      required: false,
    },
    {
      name: 'isInformational',
      type: 'checkbox',
      label: 'Conteúdo informativo (não é prescrição clínica)',
      defaultValue: false,
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: false,
    },
    {
      name: 'meals',
      type: 'array',
      required: false,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'time', type: 'text', required: false },
        { name: 'calories', type: 'number', required: false },
        { name: 'notes', type: 'textarea', required: false },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'quantity', type: 'text', required: false },
            { name: 'calories', type: 'number', required: false },
          ],
        },
      ],
    },
  ],
}
