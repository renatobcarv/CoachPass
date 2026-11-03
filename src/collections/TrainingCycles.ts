import type { Access, CollectionConfig, Where } from 'payload'
import { APIError, ValidationError } from 'payload'

import { reqHasStudentPro } from '../access/entitlements'
import { hasActiveLink } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { userId, userRole } from '../access/roles'
import { totalWeeks } from '../lib/periodization/calc'
import { regenerateCycleWeeks } from '../lib/periodization/engine'

const GOALS = [
  { label: 'Hipertrofia', value: 'hypertrophy' },
  { label: 'Força', value: 'strength' },
  { label: 'Emagrecimento', value: 'fat_loss' },
  { label: 'Recomposição', value: 'recomposition' },
  { label: 'Condicionamento', value: 'conditioning' },
  { label: 'Performance', value: 'performance' },
]
const PHASE_KINDS = [
  { label: 'Adaptação', value: 'adaptation' },
  { label: 'Acumulação', value: 'accumulation' },
  { label: 'Hipertrofia', value: 'hypertrophy' },
  { label: 'Força', value: 'strength' },
  { label: 'Intensificação', value: 'intensification' },
  { label: 'Potência', value: 'power' },
  { label: 'Realização (pico)', value: 'realization' },
  { label: 'Deload', value: 'deload' },
  { label: 'Transição', value: 'transition' },
  { label: 'Definição', value: 'cutting' },
]
const DIET_PHASES = [
  { label: 'Déficit', value: 'deficit' },
  { label: 'Manutenção', value: 'maintenance' },
  { label: 'Superávit', value: 'surplus' },
  { label: 'Diet break', value: 'diet_break' },
]

/** Profissional enxerga o ciclo se montou, acompanha como personal ou como nutricionista. */
export const cycleReadAccess: Access = ({ req }): boolean | Where => {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id) return false
  if (userRole(req) === 'student') return { student: { equals: id } }
  return { or: [{ author: { equals: id } }, { coach: { equals: id } }, { nutritionist: { equals: id } }] }
}

/** Macrociclo do aluno, com as fases (mesociclos). As semanas ficam em `cycle-weeks`. */
export const TrainingCycles: CollectionConfig = {
  slug: 'training-cycles',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'student', 'goal', 'status', 'startDate'] },
  access: {
    read: cycleReadAccess,
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      const role = userRole(req)
      return role === 'personal' || role === 'student'
    },
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'student') return { and: [{ student: { equals: id } }, { author: { equals: id } }] }
      return { or: [{ author: { equals: id } }, { coach: { equals: id } }, { nutritionist: { equals: id } }] }
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      return id ? { author: { equals: id } } : false
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req, originalDoc, collection }) => {
        if (!data) return data
        const relations = ['student', 'author', 'coach', 'nutritionist'] as const
        if (!req.user || isSuperUser(req) || req.context?.periodizationEngine) {
          coerceNumericRelations(data, relations)
          return data
        }
        const actor = toNumericRelationId(req.user.id)!
        const role = userRole(req)

        if (operation === 'create') {
          data.author = actor
          if (role === 'student') {
            if (!reqHasStudentPro(req)) {
              throw new APIError('Montar a própria periodização é um recurso do Aluno Pro.', 402, { code: 'STUDENT_PRO_REQUIRED' }, true)
            }
            data.student = actor
            data.coach = null
          } else if (role === 'personal') {
            const student = toNumericRelationId(data.student)
            if (!student || !(await hasActiveLink({ req, studentId: student, professionalId: actor, professionalRole: 'personal' }))) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [{ path: 'student', message: 'Só é possível montar ciclo para aluno com vínculo ativo.' }],
              })
            }
            data.student = student
            data.coach = actor
          }
        } else if (originalDoc) {
          // Aluno, autor e personal não mudam depois de criados
          data.student = toNumericRelationId(originalDoc.student)
          data.author = toNumericRelationId(originalDoc.author)
          data.coach = toNumericRelationId(originalDoc.coach)
        }

        // Nutricionista só entra se tiver vínculo ativo com o aluno
        const nutri = toNumericRelationId(data.nutritionist)
        if (nutri && data.student) {
          const ok = await hasActiveLink({ req, studentId: data.student, professionalId: nutri, professionalRole: 'nutritionist' })
          if (!ok) data.nutritionist = toNumericRelationId(originalDoc?.nutritionist) ?? null
        }

        coerceNumericRelations(data, relations)
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        data.totalWeeks = totalWeeks(data.phases ?? [])
        // Só um ciclo ativo por aluno: ativar este conclui o anterior
        if (data.status === 'active' && originalDoc?.status !== 'active' && data.student) {
          const others = await req.payload.find({
            collection: 'training-cycles',
            where: { and: [{ student: { equals: data.student } }, { status: { equals: 'active' } }] },
            depth: 0,
            pagination: false,
            overrideAccess: true,
            req,
          })
          for (const doc of others.docs) {
            if (originalDoc && doc.id === originalDoc.id) continue
            await req.payload.update({
              collection: 'training-cycles',
              id: doc.id,
              data: { status: 'completed' },
              overrideAccess: true,
              req,
              context: { periodizationEngine: true, skipWeeks: true },
            })
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, context, operation }) => {
        if (context?.skipWeeks) return doc
        const structural =
          operation === 'create' ||
          JSON.stringify(doc.phases) !== JSON.stringify(previousDoc?.phases) ||
          doc.startDate !== previousDoc?.startDate ||
          doc.sessionsPerWeek !== previousDoc?.sessionsPerWeek ||
          JSON.stringify(doc.baseline) !== JSON.stringify(previousDoc?.baseline) ||
          doc.goal !== previousDoc?.goal ||
          doc.level !== previousDoc?.level ||
          doc.status !== previousDoc?.status ||
          doc.nutritionist !== previousDoc?.nutritionist
        if (structural) await regenerateCycleWeeks(req.payload, doc.id, req)
        return doc
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({ collection: 'cycle-weeks', where: { cycle: { equals: id } }, overrideAccess: true, req })
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Nome do ciclo', required: true },
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'author', type: 'relationship', relationTo: 'users', index: true },
    { name: 'coach', type: 'relationship', relationTo: 'users', label: 'Personal', index: true },
    { name: 'nutritionist', type: 'relationship', relationTo: 'users', label: 'Nutricionista', index: true },
    { name: 'goal', type: 'select', required: true, defaultValue: 'hypertrophy', options: GOALS },
    {
      name: 'model',
      type: 'select',
      defaultValue: 'block',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'Ondulatória semanal', value: 'undulating_weekly' },
        { label: 'Ondulatória diária', value: 'undulating_daily' },
        { label: 'Em blocos', value: 'block' },
        { label: 'Reversa', value: 'reverse' },
      ],
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      defaultValue: 'beginner',
      options: [
        { label: 'Iniciante', value: 'beginner' },
        { label: 'Intermediário', value: 'intermediate' },
        { label: 'Avançado', value: 'advanced' },
      ],
    },
    { name: 'startDate', type: 'date', required: true, index: true },
    { name: 'sessionsPerWeek', type: 'number', min: 1, max: 14, defaultValue: 4 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Ativo', value: 'active' },
        { label: 'Concluído', value: 'completed' },
        { label: 'Arquivado', value: 'archived' },
      ],
    },
    { name: 'templateId', type: 'text', admin: { readOnly: true } },
    {
      name: 'baseline',
      type: 'group',
      label: 'Ponto de partida',
      fields: [
        { name: 'weightKg', type: 'number', min: 20, max: 400 },
        { name: 'bodyFatPercent', type: 'number', min: 2, max: 70 },
        { name: 'waistCm', type: 'number', min: 30, max: 250 },
        {
          name: 'lifts',
          type: 'array',
          label: 'Exercícios-chave (até 4)',
          maxRows: 4,
          fields: [
            { name: 'exercise', type: 'relationship', relationTo: 'exercises' },
            { name: 'name', type: 'text', required: true },
            { name: 'e1rm', type: 'number', min: 0, label: 'Força estimada (e1RM, kg)' },
          ],
        },
      ],
    },
    {
      name: 'targets',
      type: 'group',
      label: 'Metas finais (opcional)',
      fields: [
        { name: 'weightKg', type: 'number' },
        { name: 'bodyFatPercent', type: 'number' },
        { name: 'notes', type: 'textarea' },
      ],
    },
    {
      name: 'phases',
      type: 'array',
      label: 'Fases (mesociclos)',
      minRows: 1,
      maxRows: 24,
      fields: [
        { name: 'name', type: 'text' },
        { name: 'kind', type: 'select', required: true, options: PHASE_KINDS },
        { name: 'weeks', type: 'number', required: true, min: 1, max: 12 },
        { name: 'repRange', type: 'text', label: 'Faixa de repetições' },
        { name: 'rirStart', type: 'number', min: 0, max: 6 },
        { name: 'rirEnd', type: 'number', min: 0, max: 6 },
        { name: 'intensityMin', type: 'number', min: 30, max: 100, label: '%1RM mínimo' },
        { name: 'intensityMax', type: 'number', min: 30, max: 100, label: '%1RM máximo' },
        { name: 'setsStart', type: 'number', min: 0, max: 40, label: 'Séries/músculo/semana no início' },
        { name: 'setsEnd', type: 'number', min: 0, max: 40, label: 'Séries/músculo/semana no fim' },
        { name: 'cardioMin', type: 'number', min: 0, max: 2000, label: 'Cardio (min/semana)' },
        { name: 'dietPhase', type: 'select', options: DIET_PHASES },
        { name: 'kcalDelta', type: 'number', min: -1500, max: 1500, label: 'Ajuste calórico (kcal/dia)' },
        { name: 'proteinGPerKg', type: 'number', min: 0, max: 4, label: 'Proteína (g/kg)' },
        { name: 'notes', type: 'textarea' },
      ],
    },
    { name: 'totalWeeks', type: 'number', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
  ],
}
