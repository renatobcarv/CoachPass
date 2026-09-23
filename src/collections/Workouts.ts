import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'

export const Workouts: CollectionConfig = {
  slug: 'workouts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'status', 'source', 'updatedAt'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'personal' || role === 'student'
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
      if (role === 'personal') {
        return { author: { equals: id } }
      }
      return false
    },
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'personal') return { author: { equals: id } }
      return false
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'personal') return { author: { equals: id } }
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
      label: 'Orientações / observações',
      required: false,
    },
    {
      name: 'weekday',
      type: 'select',
      required: false,
      index: true,
      options: [
        { label: 'Segunda', value: 'monday' },
        { label: 'Terça', value: 'tuesday' },
        { label: 'Quarta', value: 'wednesday' },
        { label: 'Quinta', value: 'thursday' },
        { label: 'Sexta', value: 'friday' },
        { label: 'Sábado', value: 'saturday' },
        { label: 'Domingo', value: 'sunday' },
      ],
    },
    {
      name: 'splitLabel',
      type: 'text',
      label: 'Divisão (ex.: Costas + Bíceps)',
      required: false,
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: false,
    },
    {
      name: 'exercises',
      type: 'array',
      required: false,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'sets', type: 'number', required: false },
        { name: 'reps', type: 'text', required: false },
        { name: 'weight', type: 'text', required: false },
        { name: 'rest', type: 'text', required: false },
        { name: 'muscle', type: 'text', required: false },
        { name: 'notes', type: 'text', required: false },
        { name: 'instructions', type: 'textarea', required: false },
        { name: 'youtubeUrl', type: 'text', required: false },
        { name: 'muscleImage', type: 'text', required: false },
      ],
    },
  ],
}
