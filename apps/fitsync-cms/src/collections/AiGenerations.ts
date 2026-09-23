import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'

export const AiGenerations: CollectionConfig = {
  slug: 'ai-generations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'type', 'status', 'createdAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      return { user: { equals: id } }
    },
    update: ({ req }) => isSuperUser(req),
    delete: ({ req }) => isSuperUser(req),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Treino', value: 'workout' },
        { label: 'Plano alimentar', value: 'meal_plan' },
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
        { label: 'Sucesso', value: 'succeeded' },
        { label: 'Falhou', value: 'failed' },
        { label: 'Bloqueado', value: 'blocked' },
      ],
    },
    {
      name: 'provider',
      type: 'text',
      required: false,
    },
    {
      name: 'errorMessage',
      type: 'text',
      required: false,
    },
    {
      name: 'resultId',
      type: 'text',
      required: false,
      admin: { description: 'ID do workout ou meal-plan gerado' },
    },
  ],
}
