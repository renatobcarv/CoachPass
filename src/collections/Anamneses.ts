import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'

export const Anamneses: CollectionConfig = {
  slug: 'anamneses',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['patient', 'author', 'status', 'updatedAt'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'nutritionist'
    },
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      const role = userRole(req)
      if (role === 'student') return { patient: { equals: id } }
      if (role === 'nutritionist') return { author: { equals: id } }
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
      ({ data, req, operation }) => {
        if (!data) return data
        // Força o autor a ser o nutricionista logado
        if (operation === 'create' && req.user && userRole(req) === 'nutritionist') {
          data.author = req.user.id
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'Nutricionista responsável pela anamnese',
      },
    },
    {
      name: 'patient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'Paciente associado',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Concluído', value: 'completed' },
      ],
    },
    {
      name: 'templateId',
      type: 'text',
      required: false,
      defaultValue: 'webdiet',
    },
    {
      name: 'data',
      type: 'json',
      required: false,
      admin: {
        description: 'Respostas estruturadas das seções da anamnese',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      required: false,
    },
  ],
}
