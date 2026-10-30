import type { CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { isSuperUser } from '../access/isSuper'
import { userId } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      return { owner: { equals: id } }
    },
    create: ({ req }) => isSuperUser(req) || Boolean(req.user),
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      return { owner: { equals: id } }
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      return { owner: { equals: id } }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req, collection }) => {
        if (!data) return data
        const candidates = [req.file?.size, req.file?.data?.length, data.filesize]
        const size = candidates.reduce<number>(
          (max, value) => (typeof value === 'number' && value > max ? value : max),
          0,
        )
        if (size > 2_000_000) {
          throw new ValidationError({
            collection: collection?.slug,
            errors: [{ path: 'file', message: 'A foto deve ter no máximo 2 MB.' }],
          })
        }
        if (operation === 'create' && req.user) {
          const actorId = toNumericRelationId(req.user.id)
          if (actorId !== null) data.owner = actorId
        }
        coerceNumericRelations(data, ['owner'])
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
      admin: { readOnly: true },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
}
