// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
  buildWeeks,
  classifyWeek,
  computeActual,
  e1rm,
  mergeSuggestions,
  suggest,
  totalWeeks,
  weekIndexFor,
  weightTrend,
  type CycleInput,
} from '@/lib/periodization/calc'
import { CYCLE_TEMPLATES } from '@/lib/periodization/templates'

const start = '2026-11-02T00:00:00.000Z'
const cycle: CycleInput = {
  goal: 'hypertrophy',
  level: 'beginner',
  startDate: start,
  sessionsPerWeek: 4,
  baseline: { weightKg: 80, lifts: [{ exercise: 10, name: 'Agachamento', e1rm: 100 }] },
  phases: [
    { kind: 'accumulation', weeks: 3, rirStart: 3, rirEnd: 1, setsStart: 10, setsEnd: 14, dietPhase: 'surplus' },
    { kind: 'deload', weeks: 1, rirStart: 4, rirEnd: 4, setsStart: 6, setsEnd: 6, dietPhase: 'maintenance' },
  ],
}

describe('e1RM', () => {
  it('Epley somando as repetições em reserva', () => {
    expect(e1rm(100, 5, 0)).toBe(116.7)
    expect(e1rm(100, 5, 2)).toBe(123.3)
  })
  it('não estima acima de 12 repetições nem sem carga', () => {
    expect(e1rm(50, 15)).toBeNull()
    expect(e1rm(0, 5)).toBeNull()
  })
})

describe('semanas do ciclo', () => {
  const weeks = buildWeeks(cycle)
  it('gera uma semana por microciclo com o planejado interpolado', () => {
    expect(weeks).toHaveLength(4)
    expect(weeks[0].planned.setsPerMuscle).toBe(10)
    expect(weeks[2].planned.setsPerMuscle).toBe(14)
    expect(weeks[2].planned.rir).toBe(1)
    expect(weeks[3].isDeload).toBe(true)
  })
  it('faixa de peso de iniciante em superávit: +0,25 a +0,375% por semana', () => {
    expect(weeks[0].expected.weightKg).toEqual({ min: 80.2, max: 80.3 })
    expect(weeks[2].expected.weightKg).toEqual({ min: 80.6, max: 80.9 })
  })
  it('força de iniciante sobe 1–2,5%/sem e não cresce no deload', () => {
    expect(weeks[0].expected.lifts[0].e1rm).toEqual({ min: 101, max: 102.5 })
    expect(weeks[3].expected.lifts[0].e1rm.max).toBe(weeks[2].expected.lifts[0].e1rm.max)
  })
  it('índice da semana pela data', () => {
    expect(weekIndexFor(start, '2026-11-02T10:00:00Z')).toBe(0)
    expect(weekIndexFor(start, '2026-11-10T10:00:00Z')).toBe(1)
    expect(weekIndexFor(start, '2026-10-30T10:00:00Z')).toBe(-1)
  })
})

describe('realizado, classificação e sugestões', () => {
  const weeks = buildWeeks(cycle)
  const logs = (week: number, load: number, n = 4) =>
    Array.from({ length: n }, (_, i) => ({
      performedAt: new Date(new Date(start).getTime() + (week * 7 + i) * 86_400_000 + 3_600_000).toISOString(),
      status: 'completed',
      durationMin: 60,
      sessionRpe: 7,
      exercises: [{ exercise: 10, name: 'Agachamento', muscleGroup: 'Pernas', sets: [{ reps: 5, loadKg: load, rir: 2 }, { reps: 5, loadKg: load, rir: 1 }] }],
    }))

  it('conta sessões, séries duras, tonelagem e melhor e1RM', () => {
    const a = computeActual({ week: weeks[0], logs: logs(0, 85), metrics: [], checkins: [], keyLifts: cycle.baseline!.lifts! })
    expect(a.sessionsDone).toBe(4)
    expect(a.adherence).toBe(1)
    expect(a.hardSetsByGroup.Pernas).toBe(8)
    expect(a.tonnage).toBe(3400)
    expect(a.bestE1rm['10']).toBe(104.8)
    expect(a.sessionLoad).toBe(1680)
  })

  it('no alvo com força e peso dentro da faixa', () => {
    const a = computeActual({
      week: weeks[0],
      logs: logs(0, 85),
      metrics: [{ date: '2026-11-03T08:00:00Z', weightKg: 80.25 }],
      checkins: [],
      keyLifts: cycle.baseline!.lifts!,
    })
    // 104,8 está acima de 102,5 → à frente; peso dentro da faixa
    expect(classifyWeek('hypertrophy', weeks[0], a).status).toBe('ahead')
  })

  it('atenção com aderência baixa', () => {
    const a = computeActual({ week: weeks[0], logs: logs(0, 80, 2), metrics: [], checkins: [], keyLifts: [] })
    expect(a.adherence).toBe(0.5)
    expect(classifyWeek('hypertrophy', weeks[0], a).status).toBe('attention')
  })

  it('sem dados quando não há registro', () => {
    const a = computeActual({ week: weeks[1], logs: [], metrics: [], checkins: [], keyLifts: [] })
    expect(classifyWeek('hypertrophy', weeks[1], a).status).toBe('no_data')
  })

  it('peso abaixo da faixa por 2 semanas no superávit sugere +kcal', () => {
    const metrics = [
      { date: '2026-11-03T08:00:00Z', weightKg: 79.5 },
      { date: '2026-11-10T08:00:00Z', weightKg: 79.4 },
    ]
    const states = [0, 1].map((i) => {
      const actual = computeActual({ week: weeks[i], logs: logs(i, 85), metrics, checkins: [], keyLifts: [] })
      return { plan: weeks[i], actual, classified: classifyWeek('hypertrophy', weeks[i], actual) }
    })
    const s = suggest('hypertrophy', states, 1, 3)
    expect(s.map((x) => x.kind)).toContain('kcal_up')
    const kept = mergeSuggestions([{ ...s[0], status: 'dismissed' }], s)
    expect(kept[0].status).toBe('dismissed')
  })

  it('tendência de peso amortece a pesagem do dia', () => {
    const t = weightTrend(
      [
        { date: '2026-11-01T08:00:00Z', weightKg: 80 },
        { date: '2026-11-02T08:00:00Z', weightKg: 82 },
      ],
      '2026-11-03T00:00:00Z',
    )
    expect(t).toBe(80.2)
  })
})

describe('modelos prontos', () => {
  it('todos têm fases válidas e duração coerente', () => {
    for (const t of CYCLE_TEMPLATES) {
      expect(t.phases.length).toBeGreaterThan(0)
      expect(totalWeeks(t.phases)).toBeGreaterThanOrEqual(8)
      expect(buildWeeks({ goal: t.goal, level: 'intermediate', startDate: start, phases: t.phases })).toHaveLength(totalWeeks(t.phases))
    }
  })
})
