import type { CollectionConfig, Where } from 'payload'
import { ValidationError } from 'payload'

import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { linkedStudentIds } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { recomputeForStudentDate } from '../lib/periodization/engine'
import { weekIndexFor } from '../lib/periodization/calc'
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
        const relations = ['student', 'workout', 'cycle'] as const
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
          const ownDraft = toNumericRelationId(workout.author) === actorId
          if (toNumericRelationId(workout.student) !== actorId || (workout.status !== 'published' && !ownDraft)) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'workout', message: 'Só é possível registrar um treino publicado seu.' }],
            })
          }

          // Cópia do planejado (o plano pode mudar depois; o histórico preserva o que estava valendo)
          const plan = (workout.exercises ?? []) as Array<Record<string, unknown>>
          const findPlan = (ex: Record<string, unknown>) =>
            plan.find((p) => ex.exercise != null && toNumericRelationId(p.exercise) === toNumericRelationId(ex.exercise)) ??
            plan.find((p) => String(p.name ?? '').trim().toLowerCase() === String(ex.name ?? '').trim().toLowerCase())
          const firstNumber = (v: unknown) => {
            const m = String(v ?? '').replace(',', '.').match(/\d+(\.\d+)?/)
            return m ? Number(m[0]) : null
          }
          data.exercises = ((data.exercises ?? []) as Array<Record<string, unknown>>).map((ex) => {
            const p = findPlan(ex)
            const planned = (ex.planned as Record<string, unknown> | undefined) ?? {}
            const hasPlanned = Object.values(planned).some((v) => v != null && v !== '')
            const snapshot = hasPlanned
              ? planned
              : p
                ? {
                    sets: p.sets ?? null,
                    reps: p.reps ?? null,
                    loadKg: p.loadKg ?? firstNumber(p.weight),
                    rir: p.targetRir ?? null,
                    rpe: p.targetRpe ?? null,
                    restSec: p.restSec ?? firstNumber(p.rest),
                  }
                : {}
            const change = ex.change ?? (p ? 'none' : ex.replacedName ? 'substituted' : 'added')
            return { ...ex, planned: snapshot, change }
          })
        }

        // Programa e semana do treino (ciclo ativo do aluno)
        if (operation === 'create' && data.student) {
          const active = await req.payload.find({
            collection: 'training-cycles',
            where: { and: [{ student: { equals: data.student } }, { status: { equals: 'active' } }] },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          })
          const cycle = active.docs[0]
          if (cycle) {
            const index = weekIndexFor(String(cycle.startDate), String(data.performedAt ?? new Date().toISOString()))
            if (index >= 0 && index < (cycle.totalWeeks ?? 0)) {
              data.cycle = cycle.id
              data.weekIndex = index
            }
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
    afterChange: [
      // Treino registrado: atualiza o realizado da semana no ciclo ativo
      async ({ doc, req }) => {
        await recomputeForStudentDate(req.payload, doc.student, doc.performedAt, req)
        return doc
      },
    ],
  },
  fields: [
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    // Obrigatório só na criação (hook acima); se o treino for apagado depois, o histórico fica sem vínculo
    { name: 'workout', type: 'relationship', relationTo: 'workouts', required: false, index: true },
    { name: 'performedAt', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    // Programa e semana em que o treino foi feito (preenchidos pelo servidor)
    { name: 'cycle', type: 'relationship', relationTo: 'training-cycles', index: true, admin: { readOnly: true } },
    { name: 'weekIndex', type: 'number', admin: { readOnly: true } },
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
    // Carga interna da sessão (sRPE × duração, Foster)
    { name: 'sessionRpe', type: 'number', min: 1, max: 10, label: 'Esforço da sessão (1–10)' },
    { name: 'durationMin', type: 'number', min: 1, max: 600, label: 'Duração (min)' },
    { name: 'notes', type: 'textarea', required: false },
    {
      name: 'exercises',
      type: 'array',
      required: false,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'exercise', type: 'relationship', relationTo: 'exercises' },
        { name: 'muscleGroup', type: 'text', label: 'Grupo muscular (para o volume semanal)' },
        // Cópia do planejado no momento do treino: o plano pode mudar depois, o histórico não
        {
          name: 'planned',
          type: 'group',
          label: 'Planejado',
          fields: [
            { name: 'sets', type: 'number', min: 0, max: 20 },
            { name: 'reps', type: 'text' },
            { name: 'loadKg', type: 'number', min: 0, max: 1000 },
            { name: 'rir', type: 'number', min: 0, max: 10 },
            { name: 'rpe', type: 'number', min: 1, max: 10 },
            { name: 'restSec', type: 'number', min: 0, max: 900 },
          ],
        },
        {
          name: 'change',
          type: 'select',
          label: 'Alteração feita pelo aluno',
          options: [
            { label: 'Conforme o plano', value: 'none' },
            { label: 'Exercício trocado', value: 'substituted' },
            { label: 'Exercício extra', value: 'added' },
            { label: 'Exercício pulado', value: 'skipped' },
          ],
          defaultValue: 'none',
        },
        { name: 'replacedName', type: 'text', label: 'Exercício planejado que foi trocado' },
        { name: 'setsCompleted', type: 'number', required: false },
        { name: 'load', type: 'text', required: false },
        { name: 'notes', type: 'text', required: false },
        {
          name: 'sets',
          type: 'array',
          label: 'Séries',
          maxRows: 20,
          fields: [
            { name: 'reps', type: 'number', min: 0, max: 100 },
            { name: 'loadKg', type: 'number', min: 0, max: 1000 },
            { name: 'rir', type: 'number', min: 0, max: 10, label: 'Repetições em reserva' },
            { name: 'rpe', type: 'number', min: 1, max: 10, label: 'RPE' },
            { name: 'restSec', type: 'number', min: 0, max: 900, label: 'Descanso (s)' },
            { name: 'done', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
  ],
}
