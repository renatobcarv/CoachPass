import type { CollectionConfig, Where } from 'payload'

import { isSuperUser } from '../access/isSuper'
import { studentOwnsProfile, userId, userRole } from '../access/roles'

export const StudentProfiles: CollectionConfig = {
  slug: 'student-profiles',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'goal', 'onboardingCompleted', 'updatedAt'],
  },
  access: {
    create: ({ req }) => {
      if (isSuperUser(req)) return true
      return Boolean(req.user && userRole(req) === 'student')
    },
    read: studentOwnsProfile,
    update: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id || userRole(req) !== 'student') return false
      return { user: { equals: id } }
    },
    delete: ({ req }): boolean | Where => {
      if (isSuperUser(req)) return true
      const id = userId(req)
      if (!id || userRole(req) !== 'student') return false
      return { user: { equals: id } }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data
        if (operation === 'create' && req.user && userRole(req) === 'student') {
          data.user = req.user.id
        }
        if (data.firstName || data.lastName || data.displayName) {
          const composed = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()
          data.displayName = data.displayName || composed || undefined
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'Nome completo',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefone',
      required: true,
    },
    {
      name: 'birthDate',
      type: 'date',
      label: 'Data de nascimento',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'heightCm',
      type: 'number',
      label: 'Altura (cm)',
      required: true,
      min: 50,
      max: 250,
    },
    {
      name: 'weightKg',
      type: 'number',
      label: 'Peso (kg)',
      required: true,
      min: 20,
      max: 400,
    },
    {
      name: 'sex',
      type: 'select',
      label: 'Sexo',
      required: true,
      options: [
        { label: 'Masculino', value: 'male' },
        { label: 'Feminino', value: 'female' },
        { label: 'Outro', value: 'other' },
        { label: 'Prefiro não informar', value: 'undisclosed' },
      ],
    },
    {
      name: 'goal',
      type: 'select',
      label: 'Objetivo principal',
      required: true,
      options: [
        { label: 'Emagrecimento', value: 'weight_loss' },
        { label: 'Hipertrofia', value: 'hypertrophy' },
      ],
    },
    {
      name: 'bodyFatPercent',
      type: 'number',
      label: 'Percentual de gordura (%)',
      required: false,
      min: 1,
      max: 70,
    },
    {
      name: 'experienceLevel',
      type: 'select',
      label: 'Nível de experiência',
      required: false,
      options: [
        { label: 'Iniciante', value: 'beginner' },
        { label: 'Intermediário', value: 'intermediate' },
        { label: 'Avançado', value: 'advanced' },
      ],
    },
    {
      name: 'trainingDaysPerWeek',
      type: 'number',
      label: 'Dias de treino por semana',
      required: false,
      min: 1,
      max: 7,
    },
    {
      name: 'sessionMinutes',
      type: 'number',
      label: 'Tempo disponível por treino (min)',
      required: false,
      min: 15,
      max: 180,
    },
    {
      name: 'equipmentAccess',
      type: 'select',
      label: 'Equipamentos / ambiente',
      required: false,
      hasMany: true,
      options: [
        { label: 'Academia completa', value: 'full_gym' },
        { label: 'Academia básica', value: 'basic_gym' },
        { label: 'Halteres / elásticos em casa', value: 'home_weights' },
        { label: 'Apenas peso corporal', value: 'bodyweight' },
        { label: 'Ar livre', value: 'outdoor' },
      ],
    },
    {
      name: 'foodAllergies',
      type: 'textarea',
      label: 'Alergias alimentares',
      required: false,
    },
    {
      name: 'dietaryRestrictions',
      type: 'textarea',
      label: 'Restrições alimentares',
      required: false,
    },
    {
      name: 'medicalConditions',
      type: 'textarea',
      label: 'Deficiências, limitações ou condições médicas',
      required: false,
    },
    {
      name: 'injuries',
      type: 'textarea',
      label: 'Lesões atuais ou anteriores',
      required: false,
    },
    {
      name: 'medications',
      type: 'textarea',
      label: 'Medicamentos ou acompanhamento médico',
      required: false,
    },
    {
      name: 'onboardingCompleted',
      type: 'checkbox',
      label: 'Onboarding concluído',
      defaultValue: false,
      index: true,
    },
    {
      name: 'onboardingCompletedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
}
