import type { CollectionConfig, Where } from 'payload'
import { APIError, ValidationError } from 'payload'

import { reqHasStudentPro } from '../access/entitlements'
import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
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
        // Publicados pelo profissional + os que o próprio aluno criou (mesmo em rascunho)
        return {
          and: [
            { student: { equals: id } },
            { or: [{ status: { equals: 'published' } }, { author: { equals: id } }] },
          ],
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
      // Aluno mexe só nos treinos que ele mesmo criou
      if (userRole(req) === 'student') return { and: [{ student: { equals: id } }, { author: { equals: id } }] }
      return false
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'personal') return { author: { equals: id } }
      if (userRole(req) === 'student') return { and: [{ student: { equals: id } }, { author: { equals: id } }] }
      return false
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req, collection, originalDoc }) => {
        if (!data) return data
        const relations = ['student', 'author'] as const
        if (!req.user || isSuperUser(req) || req.context?.seedDemo) {
          coerceNumericRelations(data, relations)
          return data
        }

        const actorId = toNumericRelationId(req.user.id)
        const role = userRole(req)
        if (!actorId) {
          coerceNumericRelations(data, relations)
          return data
        }

        if (operation === 'create') {
          if (role === 'student') {
            data.student = actorId
            data.author = actorId
            if (data.source !== 'ai') {
              // Treino montado pelo próprio aluno: recurso do Aluno Pro (profissional no modo aluno também)
              if (!reqHasStudentPro(req)) {
                throw new APIError('Criar os próprios treinos é um recurso do Aluno Pro.', 402, { code: 'STUDENT_PRO_REQUIRED' }, true)
              }
              data.source = 'self'
              if (!data.status) data.status = 'published'
            }
          } else if (role === 'personal') {
            data.author = actorId
            data.source = 'professional'
            const student = toNumericRelationId(data.student)
            if (!student) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'student', message: 'Informe o aluno do treino.' }],
              })
            }
            data.student = student
            const linked = await hasActiveLink({
              req,
              studentId: student,
              professionalId: actorId,
              professionalRole: 'personal',
            })
            if (!linked) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'student', message: 'Só é possível prescrever treino para aluno com vínculo ativo.' }],
              })
            }
          } else {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'author', message: 'Sem permissão para criar treino.' }],
            })
          }
        }

        if (operation === 'update' && originalDoc) {
          const student = toNumericRelationId(originalDoc.student)
          const author = toNumericRelationId(originalDoc.author)
          if (student !== null) data.student = student
          if (author !== null) data.author = author
        }

        coerceNumericRelations(data, relations)
        return data
      },
    ],
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
        { label: 'Próprio aluno', value: 'self' },
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
    // Periodização: a que ciclo/fase/semanas este treino pertence
    { name: 'cycle', type: 'relationship', relationTo: 'training-cycles', index: true },
    { name: 'phaseIndex', type: 'number', min: 0 },
    { name: 'weekFrom', type: 'number', min: 0, label: 'Da semana' },
    { name: 'weekTo', type: 'number', min: 0, label: 'Até a semana' },
    {
      name: 'exercises',
      type: 'array',
      required: false,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'exercise', type: 'relationship', relationTo: 'exercises' },
        { name: 'sets', type: 'number', required: false },
        { name: 'targetRir', type: 'number', min: 0, max: 6, label: 'RIR alvo' },
        { name: 'intensityPct', type: 'number', min: 30, max: 100, label: '%1RM' },
        { name: 'tempo', type: 'text', label: 'Cadência' },
        { name: 'reps', type: 'text', required: false },
        { name: 'weight', type: 'text', required: false },
        { name: 'loadKg', type: 'number', min: 0, max: 1000, label: 'Carga planejada (kg)' },
        { name: 'targetRpe', type: 'number', min: 1, max: 10, label: 'RPE alvo' },
        { name: 'rest', type: 'text', required: false },
        { name: 'restSec', type: 'number', min: 0, max: 900, label: 'Descanso (s)' },
        { name: 'muscle', type: 'text', required: false },
        { name: 'notes', type: 'text', required: false },
        { name: 'instructions', type: 'textarea', required: false },
        { name: 'youtubeUrl', type: 'text', required: false },
        { name: 'muscleImage', type: 'text', required: false },
      ],
    },
  ],
}
