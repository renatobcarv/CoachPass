import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
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
    update: ({ req }) => isSuperUser(req),
    delete: ({ req }) => isSuperUser(req),
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
      name: 'notes',
      type: 'textarea',
      required: false,
    },
  ],
}
