import type { CollectionConfig } from 'payload'

import { isSuperUser } from '../access/isSuper'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => isSuperUser(req) || Boolean(req.user),
    update: ({ req }) => isSuperUser(req) || Boolean(req.user),
    delete: ({ req }) => isSuperUser(req) || Boolean(req.user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
