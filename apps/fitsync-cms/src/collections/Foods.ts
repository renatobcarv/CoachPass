import type { CollectionConfig } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userRole } from '../access/roles'

export const Foods: CollectionConfig = {
  slug: 'foods',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'calories', 'source'],
  },
  access: {
    create: ({ req }) => isSuperUser(req) || userRole(req) === 'nutritionist',
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => isSuperUser(req) || userRole(req) === 'nutritionist',
    delete: ({ req }) => isSuperUser(req) || userRole(req) === 'nutritionist',
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Proteínas', value: 'protein' },
        { label: 'Carboidratos', value: 'carb' },
        { label: 'Gorduras', value: 'fat' },
        { label: 'Vegetais', value: 'vegetable' },
        { label: 'Frutas', value: 'fruit' },
        { label: 'Laticínios e suplementos', value: 'dairy' },
      ],
    },
    { name: 'calories', type: 'number', required: true, min: 0 },
    { name: 'protein', type: 'number', required: true, min: 0 },
    { name: 'carbs', type: 'number', required: true, min: 0 },
    { name: 'fat', type: 'number', required: true, min: 0 },
    { name: 'fiber', type: 'number', required: false, min: 0 },
    { name: 'sodium', type: 'number', required: false, min: 0 },
    { name: 'unit', type: 'text', required: true, defaultValue: 'g' },
    { name: 'portionLabel', type: 'text', required: false, defaultValue: '100g' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'taco',
      options: [
        { label: 'TACO (valores de referência)', value: 'taco' },
        { label: 'TBCA', value: 'tbca' },
        { label: 'USDA', value: 'usda' },
        { label: 'Fabricante', value: 'manufacturer' },
        { label: 'Manual', value: 'manual' },
      ],
    },
  ],
}
