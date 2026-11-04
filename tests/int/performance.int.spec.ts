// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
  comparePlanned,
  cycleSummary,
  effectiveRir,
  exerciseHistory,
  exerciseKey,
  fatigueAlerts,
  mainLiftKeys,
  mainLiftOf,
  muscleVolume,
  records,
  shoulderPortion,
  weeklySeries,
  weightMovingAverage,
  type PerfLog,
} from '@/lib/performance/analytics'
import { loadIncrement, suggestProgression } from '@/lib/performance/progression'

const day = (n: number) => new Date(Date.UTC(2026, 10, 2 + n, 10)).toISOString()

// Exemplo do pedido: Agachamento livre 140×4, 130×5, 130×5, 125×5
const squatLog = (n: number, sets: Array<[number, number, number?]>, extra: Partial<PerfLog> = {}): PerfLog => ({
  id: n,
  performedAt: day(n),
  status: 'completed',
  cycle: 1,
  exercises: [
    {
      exercise: 7,
      name: 'Agachamento livre',
      planned: { sets: 4, reps: '6', loadKg: 130, rir: 2 },
      sets: sets.map(([loadKg, reps, rir]) => ({ loadKg, reps, rir: rir ?? null })),
    },
  ],
  ...extra,
})

describe('histórico e recordes', () => {
  const logs = [
    squatLog(0, [[120, 5, 2], [120, 5, 2], [120, 5, 2]]),
    squatLog(7, [[140, 4, 1], [130, 5, 2], [130, 5, 2], [125, 5, 3]]),
  ]
  const key = exerciseKey({ exercise: 7, name: 'Agachamento livre' })
  const hist = exerciseHistory(logs, key)

  it('separa carga máxima, volume e 1RM estimado por sessão', () => {
    expect(hist).toHaveLength(2)
    expect(hist[1].topLoad).toBe(140)
    expect(hist[1].topLoadReps).toBe(4)
    expect(hist[1].volume).toBe(140 * 4 + 130 * 5 * 2 + 125 * 5)
    expect(hist[1].bestE1rm).toBe(163.3) // 140 × (1 + (4+1)/30)
  })

  it('recordes de carga, por repetição, de 1RM estimado e de volume não se misturam', () => {
    const r = records(hist)
    expect(r.heaviest).toEqual({ loadKg: 140, reps: 4, date: day(7) })
    expect(r.repMax.find((x) => x.reps === 5)?.loadKg).toBe(130)
    expect(r.repMax.find((x) => x.reps === 4)?.loadKg).toBe(140)
    expect(r.bestE1rm?.value).toBe(163.3)
    expect(r.timeline.map((e) => e.kind)).toEqual(expect.arrayContaining(['load', 'reps', 'e1rm', 'volume']))
  })

  it('agrupa por semana', () => {
    const w = weeklySeries(hist)
    expect(w).toHaveLength(2)
    expect(w[1].topLoad).toBe(140)
  })
})

describe('planejado × realizado', () => {
  it('130 kg × 6 planejado e 140 kg × 4 feito: carga acima, reps abaixo, parcial', () => {
    const c = comparePlanned({
      name: 'Agachamento livre',
      planned: { sets: 4, reps: '6', loadKg: 130, rpe: 7 },
      sets: [
        { loadKg: 140, reps: 4, rpe: 9 },
        { loadKg: 140, reps: 4, rpe: 9 },
        { loadKg: 140, reps: 4, rpe: 9 },
        { loadKg: 140, reps: 4, rpe: 9 },
      ],
    })
    expect(c.loadDiffKg).toBe(10)
    expect(c.repsVsTarget).toBe('below')
    expect(c.status).toBe('partial')
    expect(c.planned.rir).toBe(3)
    expect(c.done.avgRir).toBe(1)
  })
  it('séries faltando e exercício pulado', () => {
    expect(comparePlanned({ name: 'Remada', planned: { sets: 4, reps: '8-12' }, sets: [{ loadKg: 50, reps: 10 }] }).missingSets).toBe(3)
    expect(comparePlanned({ name: 'Remada', planned: { sets: 4 }, change: 'skipped', sets: [] }).status).toBe('not_done')
  })
  it('RPE vira RIR (RIR ≈ 10 − RPE)', () => {
    expect(effectiveRir({ rpe: 8 })).toBe(2)
    expect(effectiveRir({ rir: 1, rpe: 8 })).toBe(1)
  })
})

describe('levantamentos principais', () => {
  it('reconhece agachamento, supino e terra e ignora variações', () => {
    expect(mainLiftOf('Agachamento livre')).toBe('squat')
    expect(mainLiftOf('Supino reto com barra')).toBe('bench')
    expect(mainLiftOf('Levantamento terra')).toBe('deadlift')
    expect(mainLiftOf('Levantamento terra romeno')).toBe(null)
    expect(mainLiftOf('Supino inclinado com halteres')).toBe(null)
    expect(mainLiftOf('Agachamento no smith')).toBe(null)
  })
  it('escolhe a chave mais usada de cada levantamento', () => {
    const logs = [squatLog(0, [[100, 5]]), squatLog(1, [[100, 5]])]
    expect(mainLiftKeys(logs).get('squat')).toBe('id:7')
  })
})

describe('volume por grupo muscular', () => {
  const catalog = new Map([
    ['1', { id: 1, name: 'Supino', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'] }],
    ['2', { id: 2, name: 'Elevação lateral', primaryMuscles: ['shoulders'], secondaryMuscles: [] }],
  ])
  const logs: PerfLog[] = [
    {
      performedAt: day(0),
      exercises: [
        { exercise: 1, name: 'Supino reto', sets: [{ reps: 8, loadKg: 80, rir: 2 }, { reps: 8, loadKg: 80, rir: 1 }, { reps: 15, loadKg: 40, rir: 6 }] },
        { exercise: 2, name: 'Elevação lateral', sets: [{ reps: 12, loadKg: 10, rir: 2 }] },
      ],
    },
  ]
  const v = muscleVolume(logs, catalog)
  it('séries diretas e indiretas separadas; série longe da falha não conta', () => {
    expect(v.Peitoral.direct).toBe(2)
    expect(v.Tríceps.direct).toBe(0)
    expect(v.Tríceps.indirect).toBe(2)
    expect(v['Ombro lateral'].direct).toBe(1)
    expect(v['Ombro anterior'].indirect).toBe(2)
    expect(v.Peitoral.frequency).toBe(1)
  })
  it('porção do ombro pelo nome', () => {
    expect(shoulderPortion('Crucifixo invertido')).toBe('Ombro posterior')
    expect(shoulderPortion('Desenvolvimento com halteres')).toBe('Ombro anterior')
  })
})

describe('corpo e recuperação', () => {
  it('média móvel de 7 dias só com pesagens reais', () => {
    const pts = weightMovingAverage([
      { date: '2026-11-01T08:00:00Z', weightKg: 80 },
      { date: '2026-11-03T08:00:00Z', weightKg: 81 },
      { date: '2026-11-10T08:00:00Z', weightKg: 79 },
    ])
    expect(pts).toHaveLength(3)
    expect(pts[0].avg7).toBeNull()
    expect(pts[1].avg7).toBe(80.5)
    expect(pts[2].avg7).toBeNull() // só uma pesagem nos 7 dias
  })
  it('alerta de queda com fadiga, sem diagnóstico', () => {
    const weekly = [
      { week: 'a', bestE1rm: 150, topLoad: 0, volume: 0, sessions: 1 },
      { week: 'b', bestE1rm: 147, topLoad: 0, volume: 0, sessions: 1 },
      { week: 'c', bestE1rm: 143, topLoad: 0, volume: 0, sessions: 1 },
    ]
    expect(fatigueAlerts([{ label: 'Agachamento', weekly }], { date: day(0), fatigue: 5 })[0]).toMatch(/caindo/)
    expect(fatigueAlerts([{ label: 'Agachamento', weekly }], { date: day(0), fatigue: 2, sleep: 4 })).toHaveLength(0)
  })
})

describe('progressão', () => {
  const key = 'id:7'
  it('não sobe carga só por completar as repetições: sem RIR, mantém', () => {
    const hist = exerciseHistory([squatLog(0, [[100, 12], [100, 12], [100, 12]])], key)
    const s = suggestProgression(hist, { repRange: '8-12', sets: 3, targetRir: 2 })
    expect(s.action).toBe('maintain')
    expect(s.reasons.join(' ')).toMatch(/RIR/)
  })
  it('progressão dupla: topo da faixa com margem → sobe', () => {
    const hist = exerciseHistory([squatLog(0, [[50, 12, 2], [50, 12, 2], [50, 12, 3]])], key)
    const s = suggestProgression(hist, { repRange: '8-12', sets: 3, targetRir: 2 })
    expect(s.action).toBe('increase')
    expect(s.suggestedLoadKg).toBe(52.5)
  })
  it('topo da faixa mas na falha → consolida', () => {
    const hist = exerciseHistory([squatLog(0, [[50, 12, 0], [50, 12, 0], [50, 12, 0]])], key)
    expect(suggestProgression(hist, { repRange: '8-12', sets: 3, targetRir: 2 }).action).toBe('maintain')
  })
  it('recuperação ruim bloqueia o aumento', () => {
    const hist = exerciseHistory([squatLog(0, [[50, 12, 3], [50, 12, 3], [50, 12, 3]])], key)
    const s = suggestProgression(hist, { repRange: '8-12', sets: 3, targetRir: 2 }, { date: day(0), sleep: 1 })
    expect(s.action).toBe('maintain')
    expect(s.reasons.join(' ')).toMatch(/sono ruim/)
  })
  it('dentro da faixa → +1 repetição', () => {
    const hist = exerciseHistory([squatLog(0, [[50, 9, 2], [50, 9, 2], [50, 8, 2]])], key)
    expect(suggestProgression(hist, { repRange: '8-12', sets: 3, targetRir: 2 }).action).toBe('add_reps')
  })
  it('principal: esforço muito acima do alvo e reps faltando → reduz', () => {
    const hist = exerciseHistory([squatLog(0, [[140, 4, 0], [140, 4, 0]])], key)
    const s = suggestProgression(hist, { repRange: '6', targetRir: 2, isMainLift: true })
    expect(s.action).toBe('decrease')
    expect(s.suggestedLoadKg).toBe(132.5)
  })
  it('principal: reps completas com margem → sobe ~2,5%', () => {
    const hist = exerciseHistory([squatLog(0, [[120, 5, 3], [120, 5, 3], [120, 5, 4]])], key)
    const s = suggestProgression(hist, { repRange: '5', targetRir: 2, isMainLift: true })
    expect(s.action).toBe('increase')
    expect(s.suggestedLoadKg).toBe(122.5)
  })
  it('estagnação nas últimas 3 sessões', () => {
    const logs = [0, 1, 2, 3, 4, 5].map((n) => squatLog(n, [[100, 5, 2]]))
    const s = suggestProgression(exerciseHistory(logs, key), { repRange: '5', targetRir: 2, isMainLift: true })
    expect(s.stagnation).toBe(true)
  })
  it('incrementos conservadores', () => {
    expect(loadIncrement(12)).toBe(1)
    expect(loadIncrement(40)).toBe(2.5)
    expect(loadIncrement(200)).toBe(5)
  })
})

describe('comparação de ciclos', () => {
  it('resume aderência, peso e ganho nos principais', () => {
    const logs = [squatLog(0, [[100, 5, 2]]), squatLog(14, [[110, 5, 2]])]
    const s = cycleSummary(
      {
        id: 1,
        title: 'Bloco A',
        goal: 'strength',
        startDate: day(0),
        totalWeeks: 3,
        weeks: [
          { index: 0, status: 'on_track', actual: { sessionsDone: 3, adherence: 1, tonnage: 5000, weightTrend: 80 } },
          { index: 1, status: 'behind', actual: { sessionsDone: 2, adherence: 0.67, tonnage: 4000, weightTrend: 80.4 } },
        ],
      },
      logs,
    )
    expect(s.sessions).toBe(5)
    expect(s.avgAdherence).toBe(83.5)
    expect(s.weightChange).toBe(0.4)
    // 1RM estimado 123,3 → 135,7 kg
    expect(s.lifts.find((l) => l.lift === 'squat')?.changePct).toBe(10.1)
  })
})
