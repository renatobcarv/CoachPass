import type { CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { userId, userRole } from '../access/roles'
import { recomputeForStudentDate } from '../lib/periodization/engine'
import { ownOrLinkedRead } from './BodyMetrics'

const score = (name: string, label: string) => ({ name, label, type: 'number' as const, min: 1, max: 5 })

/** Check-in semanal do aluno: recuperação e aderência à dieta (alimenta status e sugestões). */
export const WeeklyCheckins: CollectionConfig = {
  slug: 'weekly-checkins',
  admin: { defaultColumns: ['student', 'date', 'sleep', 'energy', 'dietAdherence'] },
  access: {
    read: ownOrLinkedRead,
    create: ({ req }) => isSuperUser(req) || userRole(req) === 'student',
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      return id && userRole(req) === 'student' ? { student: { equals: id } } : false
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      return id && userRole(req) === 'student' ? { student: { equals: id } } : false
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req, collection }) => {
        if (!data) return data
        if (operation === 'create' && req.user && !isSuperUser(req)) {
          const actor = toNumericRelationId(req.user.id)
          if (!actor) {
            throw new ValidationError({ collection: collection?.slug, errors: [{ path: 'student', message: 'Sessão inválida.' }] })
          }
          data.student = actor
        }
        coerceNumericRelations(data, ['student'] as const)
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await recomputeForStudentDate(req.payload, doc.student, doc.date, req)
        return doc
      },
    ],
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'date', type: 'date', required: true, index: true, defaultValue: () => new Date().toISOString() },
    score('sleep', 'Sono (1–5)'),
    score('energy', 'Energia (1–5)'),
    score('soreness', 'Dor muscular (1–5)'),
    score('stress', 'Estresse (1–5)'),
    score('hunger', 'Fome (1–5)'),
    score('fatigue', 'Fadiga (1–5, 5 = muito cansado)'),
    score('readiness', 'Disposição para treinar (1–5)'),
    score('jointPain', 'Dor articular (1–5, 5 = muita dor)'),
    score('recovery', 'Recuperação percebida (1–5)'),
    { name: 'dietAdherence', type: 'number', min: 0, max: 100, label: 'Aderência à dieta (%)' },
    { name: 'notes', type: 'textarea' },
  ],
}
