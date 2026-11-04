import type { Access, CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { hasActiveLink, linkedStudentIds } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { userId, userRole } from '../access/roles'
import { recomputeForStudentDate } from '../lib/periodization/engine'

/** Aluno lê os próprios; profissional lê dos alunos com vínculo ativo. */
export const ownOrLinkedRead: Access = async ({ req }): Promise<boolean | Where> => {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id) return false
  if (userRole(req) === 'student') return { student: { equals: id } }
  const ids = await linkedStudentIds(req, { status: 'active' })
  return ids.length ? { student: { in: ids } } : false
}

const ownerWrite: Access = ({ req }): boolean | Where => {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id) return false
  return { or: [{ student: { equals: id } }, { recordedBy: { equals: id } }] }
}

/** Pesagens e medidas avulsas: base da tendência de peso da periodização. */
export const BodyMetrics: CollectionConfig = {
  slug: 'body-metrics',
  admin: { defaultColumns: ['student', 'date', 'weightKg', 'waistCm'] },
  access: {
    read: ownOrLinkedRead,
    create: ({ req }) => Boolean(req.user),
    update: ownerWrite,
    delete: ownerWrite,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req, collection }) => {
        if (!data) return data
        if (operation === 'create' && req.user && !isSuperUser(req)) {
          const actor = toNumericRelationId(req.user.id)!
          data.recordedBy = actor
          if (userRole(req) === 'student') {
            data.student = actor
          } else {
            const student = toNumericRelationId(data.student)
            if (!student || !(await hasActiveLink({ req, studentId: student, professionalId: actor }))) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'student', message: 'Só é possível registrar medida de aluno com vínculo ativo.' }],
              })
            }
            data.student = student
          }
        }
        coerceNumericRelations(data, ['student', 'recordedBy'] as const)
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
    { name: 'recordedBy', type: 'relationship', relationTo: 'users' },
    { name: 'date', type: 'date', required: true, index: true, defaultValue: () => new Date().toISOString() },
    { name: 'weightKg', type: 'number', min: 20, max: 400 },
    { name: 'waistCm', type: 'number', min: 30, max: 250, label: 'Cintura (cm)' },
    { name: 'abdomenCm', type: 'number', min: 30, max: 250, label: 'Abdômen (cm)' },
    { name: 'hipCm', type: 'number', min: 30, max: 250, label: 'Quadril (cm)' },
    { name: 'chestCm', type: 'number', min: 30, max: 250, label: 'Peitoral (cm)' },
    { name: 'armCm', type: 'number', min: 10, max: 100, label: 'Braço (cm)' },
    { name: 'thighCm', type: 'number', min: 20, max: 150, label: 'Coxa (cm)' },
    { name: 'calfCm', type: 'number', min: 15, max: 80, label: 'Panturrilha (cm)' },
    // Só quando medido por método adequado (bioimpedância, dobras, DEXA); o app não estima
    { name: 'bodyFatPercent', type: 'number', min: 2, max: 70, label: '% de gordura medido' },
    { name: 'bodyFatMethod', type: 'text', label: 'Método da medição de gordura' },
    {
      name: 'photos',
      type: 'array',
      label: 'Fotos de evolução',
      maxRows: 4,
      fields: [
        { name: 'url', type: 'text', required: true },
        {
          name: 'angle',
          type: 'select',
          options: [
            { label: 'Frente', value: 'front' },
            { label: 'Lado', value: 'side' },
            { label: 'Costas', value: 'back' },
          ],
        },
      ],
    },
    { name: 'notes', type: 'text' },
  ],
}
