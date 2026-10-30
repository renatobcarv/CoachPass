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
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      const role = userRole(req)
      // Aluno pode aceitar ou revogar seu próprio vínculo
      if (role === 'student') return { student: { equals: id } }
      // Profissional pode alterar notas ou revogar vínculo criado por ele
      if (role === 'personal' || role === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      const role = userRole(req)
      // Permite que o profissional remova vínculos criados por ele
      if (role === 'personal' || role === 'nutritionist') {
        return { professional: { equals: id } }
      }
      return false
    },
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data, originalDoc }) => {
        if (!req.user || isSuperUser(req)) return data
        const role = userRole(req)
        const id = userId(req)

        // Aluno só pode atualizar o status para active ou revoked
        if (operation === 'update' && role === 'student') {
          // Garante que o vínculo pertence ao aluno
          const currentStudentId = typeof originalDoc?.student === 'object' && originalDoc?.student ? originalDoc.student.id : originalDoc?.student
          if (String(currentStudentId) !== String(id)) {
            throw new Error('Não autorizado a alterar este vínculo.')
          }

          // Aluno não pode trocar profissional ou campos estruturais
          return {
            ...originalDoc,
            status: data?.status === 'active' || data?.status === 'revoked' ? data.status : originalDoc?.status,
          }
        }

        return data
      },
    ],
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
    {
      // Nome e e-mail do aluno para o profissional do vínculo (o profissional não lê a coleção users).
      // Virtual: não vira coluna no banco. Só aparece para quem já tem acesso a este vínculo.
      name: 'studentInfo',
      type: 'json',
      virtual: true,
      admin: { hidden: true },
      access: {
        create: () => false,
        update: () => false,
      },
      hooks: {
        afterRead: [
          async ({ siblingData, req }) => {
            if (!req.user) return null
            const raw = siblingData?.student
            const id = raw && typeof raw === 'object' ? (raw as { id?: unknown }).id : raw
            if (id === undefined || id === null || id === '') return null
            try {
              const u = await req.payload.findByID({
                collection: 'users',
                id: id as string | number,
                depth: 0,
                overrideAccess: true,
                select: { name: true, email: true },
                req,
              })
              return { name: u?.name ?? null, email: u?.email ?? null }
            } catch {
              return null
            }
          },
        ],
      },
    },
  ],
}
