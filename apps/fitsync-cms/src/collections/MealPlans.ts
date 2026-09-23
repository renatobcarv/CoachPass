import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
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
      // Personal não publica plano alimentar como prescrição.
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
