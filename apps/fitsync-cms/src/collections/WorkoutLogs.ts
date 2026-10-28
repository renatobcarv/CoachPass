import type { CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { linkedStudentIds } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'

export const WorkoutLogs: CollectionConfig = {
  slug: 'workout-logs',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'workout', 'performedAt', 'status'],
  },
  access: {
    create: ({ req }) => isSuperUser(req) || userRole(req) === 'student',
    read: async ({ req }): Promise<boolean | Where> => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'student') return { student: { equals: id } }
      if (userRole(req) === 'personal' || userRole(req) === 'nutritionist') {
        const studentIds = await linkedStudentIds(req, { status: 'active' })
        return studentIds.length ? { student: { in: studentIds } } : false
      }
      return false
    },
    update: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      return id && userRole(req) === 'student' ? { student: { equals: id } } : false
    },
    delete: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      return id && userRole(req) === 'student' ? { student: { equals: id } } : false
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req, collection, originalDoc }) => {
        if (!data) return data
        const relations = ['student', 'workout'] as const
        if (!req.user || isSuperUser(req) || req.context?.seedDemo) {
          coerceNumericRelations(data, relations)
          return data
        }
        const actorId = toNumericRelationId(req.user.id)
        if (operation === 'create' && actorId && userRole(req) === 'student') {
          data.student = actorId
          const workoutId = toNumericRelationId(data.workout)
          if (!workoutId) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'workout', message: 'Informe o treino concluído.' }],
            })
          }
          data.workout = workoutId
          const workout = await req.payload.findByID({
            collection: 'workouts',
            id: workoutId,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (toNumericRelationId(workout.student) !== actorId || workout.status !== 'published') {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'workout', message: 'Só é possível registrar um treino publicado seu.' }],
            })
          }
        }
        if (operation === 'update' && originalDoc) {
          const student = toNumericRelationId(originalDoc.student)
          const workout = toNumericRelationId(originalDoc.workout)
          if (student !== null) data.student = student
          if (workout !== null) data.workout = workout
        }
        coerceNumericRelations(data, relations)
        return data
      },
    ],
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'workout', type: 'relationship', relationTo: 'workouts', required: true, index: true },
    { name: 'performedAt', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'completed',
      options: [
        { label: 'Concluído', value: 'completed' },
        { label: 'Parcial', value: 'partial' },
        { label: 'Não feito', value: 'skipped' },
      ],
    },
    { name: 'rpe', type: 'number', min: 1, max: 10, required: false },
    { name: 'notes', type: 'textarea', required: false },
    {
      name: 'exercises',
      type: 'array',
      required: false,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'setsCompleted', type: 'number', required: false },
        { name: 'load', type: 'text', required: false },
        { name: 'notes', type: 'text', required: false },
      ],
    },
  ],
}
