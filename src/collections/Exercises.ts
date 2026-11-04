import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'
import { CATEGORIES, EQUIPMENT, LEVELS, MECHANICS, MUSCLES, MUSCLE_GROUPS, groupOf, toOptions } from '../lib/exerciseTaxonomy'

const isPro = (role: string | null) => role === 'personal' || role === 'nutritionist'

/**
 * Biblioteca de exercícios própria.
 * Base pública importada da free-exercise-db (domínio público) + exercícios próprios de profissionais.
 */
export const Exercises: CollectionConfig = {
  slug: 'exercises',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'muscleGroup', 'equipment', 'level', 'isCustom'],
  },
  access: {
    // Todo usuário logado vê a base pública; exercícios próprios só o autor
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      return { or: [{ isCustom: { not_equals: true } }, { author: { equals: id } }] }
    },
    create: ({ req }) => isSuperUser(req) || isPro(userRole(req)),
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id || !isPro(userRole(req))) return false
      return { and: [{ isCustom: { equals: true } }, { author: { equals: id } }] }
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id || !isPro(userRole(req))) return false
      return { and: [{ isCustom: { equals: true } }, { author: { equals: id } }] }
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Exercício criado pela API (profissional) é sempre próprio e do autor
        if (operation === 'create' && req.user && !isSuperUser(req) && !req.context?.seedExercises) {
          data.isCustom = true
          data.author = req.user.id
          data.slug = `custom-${req.user.id}-${Date.now()}`
        }
        if (!data.muscleGroup) data.muscleGroup = groupOf(data.primaryMuscles) ?? undefined
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nome', required: true, index: true },
    { name: 'nameEn', type: 'text', label: 'Nome original (inglês)' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'muscleGroup',
      type: 'select',
      label: 'Grupo muscular',
      index: true,
      options: MUSCLE_GROUPS.map((g) => ({ label: g, value: g })),
    },
    { name: 'primaryMuscles', type: 'select', hasMany: true, label: 'Músculos principais', options: toOptions(MUSCLES) },
    { name: 'secondaryMuscles', type: 'select', hasMany: true, label: 'Músculos secundários', options: toOptions(MUSCLES) },
    { name: 'equipment', type: 'select', label: 'Equipamento', index: true, options: toOptions(EQUIPMENT) },
    { name: 'level', type: 'select', label: 'Nível', options: toOptions(LEVELS) },
    { name: 'mechanic', type: 'select', label: 'Mecânica', options: toOptions(MECHANICS) },
    { name: 'category', type: 'select', label: 'Categoria', options: toOptions(CATEGORIES) },
    {
      name: 'instructions',
      type: 'array',
      label: 'Passo a passo',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'instructionsLang',
      type: 'select',
      defaultValue: 'pt',
      options: [
        { label: 'Português', value: 'pt' },
        { label: 'Inglês', value: 'en' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Fotos (início e fim do movimento)',
      fields: [{ name: 'url', type: 'text', required: true }],
    },
    { name: 'youtubeUrl', type: 'text', label: 'Vídeo (YouTube)' },
    { name: 'isCustom', type: 'checkbox', label: 'Exercício próprio', defaultValue: false, index: true },
    { name: 'author', type: 'relationship', relationTo: 'users', index: true },
  ],
}
