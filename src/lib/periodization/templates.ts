import type { Goal, Phase } from './calc'

export type CycleModel = 'linear' | 'undulating_weekly' | 'undulating_daily' | 'block' | 'reverse'

export type CycleTemplate = {
  id: string
  name: string
  description: string
  goal: Goal
  model: CycleModel
  sessionsPerWeek: number
  phases: Phase[]
}

/** Modelos prontos (editáveis depois). Volumes e RIR seguem as faixas do plano V2, seção 6.3. */
export const CYCLE_TEMPLATES: CycleTemplate[] = [
  {
    id: 'hypertrophy-12',
    name: 'Hipertrofia 12 semanas',
    description: '3 blocos de acumulação com volume crescente e um deload a cada bloco.',
    goal: 'hypertrophy',
    model: 'block',
    sessionsPerWeek: 4,
    phases: [
      { name: 'Bloco 1 · Acumulação', kind: 'accumulation', weeks: 3, repRange: '8-12', rirStart: 3, rirEnd: 1, setsStart: 10, setsEnd: 14, dietPhase: 'surplus', kcalDelta: 250, proteinGPerKg: 1.8 },
      { name: 'Deload 1', kind: 'deload', weeks: 1, repRange: '8-12', rirStart: 4, rirEnd: 4, setsStart: 6, setsEnd: 6, dietPhase: 'maintenance' },
      { name: 'Bloco 2 · Hipertrofia', kind: 'hypertrophy', weeks: 3, repRange: '6-12', rirStart: 3, rirEnd: 0, setsStart: 12, setsEnd: 16, dietPhase: 'surplus', kcalDelta: 250, proteinGPerKg: 1.8 },
      { name: 'Deload 2', kind: 'deload', weeks: 1, repRange: '8-12', rirStart: 4, rirEnd: 4, setsStart: 7, setsEnd: 7, dietPhase: 'maintenance' },
      { name: 'Bloco 3 · Intensificação', kind: 'intensification', weeks: 3, repRange: '6-10', rirStart: 2, rirEnd: 0, setsStart: 14, setsEnd: 18, dietPhase: 'surplus', kcalDelta: 250, proteinGPerKg: 1.8 },
      { name: 'Deload 3', kind: 'deload', weeks: 1, repRange: '8-12', rirStart: 4, rirEnd: 4, setsStart: 8, setsEnd: 8, dietPhase: 'maintenance' },
    ],
  },
  {
    id: 'strength-blocks-8',
    name: 'Força 8 semanas em blocos',
    description: 'Acumulação → intensificação → realização, com teste no fim.',
    goal: 'strength',
    model: 'block',
    sessionsPerWeek: 4,
    phases: [
      { name: 'Acumulação', kind: 'accumulation', weeks: 3, repRange: '6-10', rirStart: 3, rirEnd: 2, intensityMin: 65, intensityMax: 75, setsStart: 12, setsEnd: 15, dietPhase: 'maintenance' },
      { name: 'Intensificação', kind: 'intensification', weeks: 3, repRange: '3-6', rirStart: 2, rirEnd: 1, intensityMin: 75, intensityMax: 85, setsStart: 10, setsEnd: 12, dietPhase: 'maintenance' },
      { name: 'Realização (pico)', kind: 'realization', weeks: 1, repRange: '1-3', rirStart: 1, rirEnd: 0, intensityMin: 85, intensityMax: 95, setsStart: 6, setsEnd: 6, dietPhase: 'maintenance' },
      { name: 'Deload e teste', kind: 'deload', weeks: 1, repRange: '1-3', rirStart: 4, rirEnd: 4, intensityMin: 60, intensityMax: 70, setsStart: 5, setsEnd: 5, dietPhase: 'maintenance' },
    ],
  },
  {
    id: 'fat-loss-16',
    name: 'Emagrecimento 16 semanas com diet break',
    description: 'Déficit moderado em dois blocos, com 1 semana de diet break no meio e manutenção do treino de força.',
    goal: 'fat_loss',
    model: 'linear',
    sessionsPerWeek: 4,
    phases: [
      { name: 'Déficit 1', kind: 'cutting', weeks: 7, repRange: '6-12', rirStart: 3, rirEnd: 1, setsStart: 10, setsEnd: 12, cardioMin: 120, dietPhase: 'deficit', kcalDelta: -400, proteinGPerKg: 2.2 },
      { name: 'Diet break', kind: 'deload', weeks: 1, repRange: '8-12', rirStart: 3, rirEnd: 3, setsStart: 8, setsEnd: 8, cardioMin: 60, dietPhase: 'diet_break', kcalDelta: 0, proteinGPerKg: 2 },
      { name: 'Déficit 2', kind: 'cutting', weeks: 7, repRange: '6-12', rirStart: 3, rirEnd: 1, setsStart: 10, setsEnd: 12, cardioMin: 150, dietPhase: 'deficit', kcalDelta: -400, proteinGPerKg: 2.2 },
      { name: 'Transição', kind: 'transition', weeks: 1, repRange: '8-12', rirStart: 3, rirEnd: 3, setsStart: 8, setsEnd: 8, dietPhase: 'maintenance', kcalDelta: 0, proteinGPerKg: 2 },
    ],
  },
  {
    id: 'undulating-12',
    name: 'Ondulatória 12 semanas',
    description: 'Alterna semanas de volume e de intensidade; boa para intermediários.',
    goal: 'recomposition',
    model: 'undulating_weekly',
    sessionsPerWeek: 4,
    phases: [
      { name: 'Volume', kind: 'hypertrophy', weeks: 2, repRange: '10-15', rirStart: 3, rirEnd: 2, setsStart: 14, setsEnd: 16, dietPhase: 'maintenance' },
      { name: 'Intensidade', kind: 'strength', weeks: 1, repRange: '4-6', rirStart: 2, rirEnd: 1, intensityMin: 78, intensityMax: 85, setsStart: 10, setsEnd: 10, dietPhase: 'maintenance' },
      { name: 'Volume', kind: 'hypertrophy', weeks: 2, repRange: '10-15', rirStart: 2, rirEnd: 1, setsStart: 15, setsEnd: 17, dietPhase: 'maintenance' },
      { name: 'Intensidade', kind: 'strength', weeks: 1, repRange: '4-6', rirStart: 2, rirEnd: 0, intensityMin: 80, intensityMax: 87, setsStart: 10, setsEnd: 10, dietPhase: 'maintenance' },
      { name: 'Deload', kind: 'deload', weeks: 1, repRange: '8-12', rirStart: 4, rirEnd: 4, setsStart: 8, setsEnd: 8, dietPhase: 'maintenance' },
      { name: 'Volume', kind: 'hypertrophy', weeks: 2, repRange: '8-12', rirStart: 2, rirEnd: 1, setsStart: 16, setsEnd: 18, dietPhase: 'maintenance' },
      { name: 'Intensidade', kind: 'strength', weeks: 2, repRange: '3-5', rirStart: 2, rirEnd: 0, intensityMin: 82, intensityMax: 90, setsStart: 10, setsEnd: 10, dietPhase: 'maintenance' },
      { name: 'Deload', kind: 'deload', weeks: 1, repRange: '8-12', rirStart: 4, rirEnd: 4, setsStart: 8, setsEnd: 8, dietPhase: 'maintenance' },
    ],
  },
  {
    id: 'beginner-linear-8',
    name: 'Iniciante 8 semanas linear',
    description: 'Adaptação e progressão de carga semana a semana, com volume moderado.',
    goal: 'hypertrophy',
    model: 'linear',
    sessionsPerWeek: 3,
    phases: [
      { name: 'Adaptação', kind: 'adaptation', weeks: 2, repRange: '10-15', rirStart: 4, rirEnd: 3, setsStart: 8, setsEnd: 10, dietPhase: 'maintenance', proteinGPerKg: 1.6 },
      { name: 'Progressão linear', kind: 'hypertrophy', weeks: 5, repRange: '8-12', rirStart: 3, rirEnd: 1, setsStart: 10, setsEnd: 14, dietPhase: 'surplus', kcalDelta: 200, proteinGPerKg: 1.8 },
      { name: 'Deload', kind: 'deload', weeks: 1, repRange: '10-12', rirStart: 4, rirEnd: 4, setsStart: 6, setsEnd: 6, dietPhase: 'maintenance' },
    ],
  },
]

export const templateById = (id: string) => CYCLE_TEMPLATES.find((t) => t.id === id) ?? null
