import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'

/**
 * Microciclo (semana) de um ciclo: planejado, faixa esperada, realizado, status e sugestões.
 * Gerado e recalculado pelo servidor (lib/periodization/engine). Pessoas só mexem no comentário
 * do profissional e na decisão sobre cada sugestão.
 */
export const CycleWeeks: CollectionConfig = {
  slug: 'cycle-weeks',
  admin: { useAsTitle: 'phaseName', defaultColumns: ['cycle', 'index', 'phaseName', 'status', 'startDate'] },
  access: {
    read: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'student') return { student: { equals: id } }
      return { or: [{ author: { equals: id } }, { coach: { equals: id } }, { nutritionist: { equals: id } }] }
    },
    create: ({ req }) => isSuperUser(req),
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id) return false
      if (userRole(req) === 'student') return { and: [{ student: { equals: id } }, { author: { equals: id } }] }
      return { or: [{ author: { equals: id } }, { coach: { equals: id } }, { nutritionist: { equals: id } }] }
    },
    delete: ({ req }) => isSuperUser(req),
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {
        if (operation !== 'update' || isSuperUser(req) || req.context?.periodizationEngine || !originalDoc) return data
        // Pela API só valem o comentário e o status das sugestões; o resto é calculado
        const decisions = new Map<string, string>(
          (Array.isArray(data.suggestions) ? data.suggestions : []).map((s: { id: string; status: string }) => [s.id, s.status]),
        )
        const suggestions = (originalDoc.suggestions ?? []).map((s: { id: string; status: string }) => {
          const next = decisions.get(s.id)
          return next === 'accepted' || next === 'dismissed' || next === 'pending' ? { ...s, status: next } : s
        })
        return { ...originalDoc, coachNote: data.coachNote ?? originalDoc.coachNote, suggestions }
      },
    ],
  },
  fields: [
    { name: 'cycle', type: 'relationship', relationTo: 'training-cycles', required: true, index: true },
    { name: 'student', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'author', type: 'relationship', relationTo: 'users', index: true },
    { name: 'coach', type: 'relationship', relationTo: 'users', index: true },
    { name: 'nutritionist', type: 'relationship', relationTo: 'users', index: true },
    { name: 'index', type: 'number', required: true, index: true },
    { name: 'phaseIndex', type: 'number', required: true },
    { name: 'phaseName', type: 'text' },
    { name: 'phaseKind', type: 'text' },
    { name: 'weekInPhase', type: 'number' },
    { name: 'startDate', type: 'date', required: true, index: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'isDeload', type: 'checkbox', defaultValue: false },
    { name: 'planned', type: 'json' },
    { name: 'expected', type: 'json' },
    { name: 'actual', type: 'json' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'no_data',
      index: true,
      options: [
        { label: 'No alvo', value: 'on_track' },
        { label: 'Abaixo do esperado', value: 'behind' },
        { label: 'Acima do esperado', value: 'ahead' },
        { label: 'Atenção', value: 'attention' },
        { label: 'Sem dados', value: 'no_data' },
        { label: 'Futura', value: 'upcoming' },
      ],
    },
    { name: 'reasons', type: 'json' },
    { name: 'suggestions', type: 'json' },
    { name: 'coachNote', type: 'textarea', label: 'Comentário do profissional' },
    { name: 'computedAt', type: 'date' },
  ],
}
