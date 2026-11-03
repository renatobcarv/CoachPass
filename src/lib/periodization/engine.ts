import type { Payload, PayloadRequest } from 'payload'

import {
  buildWeeks,
  classifyWeek,
  computeActual,
  mergeSuggestions,
  suggest,
  weekIndexFor,
  type CheckinInput,
  type CycleInput,
  type Goal,
  type KeyLift,
  type Level,
  type LogInput,
  type MetricInput,
  type Phase,
  type Suggestion,
  type WeekPlan,
} from './calc'

/**
 * Liga os cálculos ao banco: gera as semanas do ciclo e recalcula o realizado.
 * Sempre com `req` (mesma transação de quem chamou) e `overrideAccess` (tarefa do servidor).
 */

const relId = (v: unknown): number | null => {
  if (v == null) return null
  if (typeof v === 'object' && 'id' in (v as object)) return Number((v as { id: unknown }).id)
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

type CycleDoc = {
  id: number
  student: unknown
  author?: unknown
  coach?: unknown
  nutritionist?: unknown
  goal: Goal
  level: Level
  status: string
  startDate: string
  sessionsPerWeek?: number | null
  phases?: Phase[] | null
  baseline?: { weightKg?: number | null; bodyFatPercent?: number | null; waistCm?: number | null; lifts?: Array<{ exercise?: unknown; name: string; e1rm?: number | null }> | null } | null
}

function toInput(c: CycleDoc): CycleInput {
  return {
    goal: c.goal,
    level: c.level,
    startDate: c.startDate,
    sessionsPerWeek: c.sessionsPerWeek ?? null,
    phases: (c.phases ?? []) as Phase[],
    baseline: c.baseline
      ? {
          ...c.baseline,
          lifts: (c.baseline.lifts ?? []).map((l) => ({ exercise: relId(l.exercise), name: l.name, e1rm: l.e1rm ?? null })),
        }
      : null,
  }
}

const keyLiftsOf = (c: CycleDoc): KeyLift[] =>
  (c.baseline?.lifts ?? []).map((l) => ({ exercise: relId(l.exercise), name: l.name, e1rm: l.e1rm ?? null }))

/** Recria as semanas do ciclo (mantém comentários e decisões já tomadas) e recalcula até hoje. */
export async function regenerateCycleWeeks(payload: Payload, cycleId: number | string, req?: PayloadRequest) {
  const cycle = (await payload.findByID({ collection: 'training-cycles', id: cycleId, depth: 0, overrideAccess: true, req })) as unknown as CycleDoc
  const old = await payload.find({ collection: 'cycle-weeks', where: { cycle: { equals: cycleId } }, depth: 0, pagination: false, overrideAccess: true, req })
  const kept = new Map(old.docs.map((w) => [Number(w.index), { coachNote: w.coachNote ?? null, suggestions: (w.suggestions as Suggestion[] | null) ?? null }]))
  if (old.docs.length) {
    await payload.delete({ collection: 'cycle-weeks', where: { cycle: { equals: cycleId } }, overrideAccess: true, req, context: { periodizationEngine: true } })
  }

  const plans = buildWeeks(toInput(cycle))
  const now = new Date().toISOString()
  for (const p of plans) {
    const prev = kept.get(p.index)
    await payload.create({
      collection: 'cycle-weeks',
      data: {
        cycle: cycle.id,
        student: relId(cycle.student)!,
        author: relId(cycle.author),
        coach: relId(cycle.coach),
        nutritionist: relId(cycle.nutritionist),
        index: p.index,
        phaseIndex: p.phaseIndex,
        phaseName: p.phaseName,
        phaseKind: p.phaseKind,
        weekInPhase: p.weekInPhase,
        startDate: p.startDate,
        endDate: p.endDate,
        isDeload: p.isDeload,
        planned: p.planned,
        expected: p.expected,
        status: p.startDate > now ? 'upcoming' : 'no_data',
        coachNote: prev?.coachNote ?? null,
        suggestions: prev?.suggestions ?? [],
      } as never,
      overrideAccess: true,
      req,
      context: { periodizationEngine: true },
    })
  }
  if (cycle.status === 'active') await recomputeCycle(payload, cycle, req)
}

/** Recalcula o realizado das semanas já iniciadas (a partir de `fromIndex`). */
export async function recomputeCycle(payload: Payload, cycle: CycleDoc, req?: PayloadRequest, fromIndex = 0) {
  const studentId = relId(cycle.student)
  if (!studentId) return
  const plans = buildWeeks(toInput(cycle))
  if (!plans.length) return
  const end = plans[plans.length - 1].endDate
  const current = Math.min(plans.length - 1, weekIndexFor(cycle.startDate, new Date()))
  if (current < 0) return

  const [logsRes, metricsRes, checkinsRes, weeksRes] = await Promise.all([
    payload.find({
      collection: 'workout-logs',
      where: { and: [{ student: { equals: studentId } }, { performedAt: { greater_than_equal: cycle.startDate } }, { performedAt: { less_than: end } }] },
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    }),
    payload.find({
      collection: 'body-metrics',
      where: { and: [{ student: { equals: studentId } }, { date: { less_than: end } }] },
      depth: 0,
      pagination: false,
      sort: 'date',
      overrideAccess: true,
      req,
    }),
    payload.find({
      collection: 'weekly-checkins',
      where: { and: [{ student: { equals: studentId } }, { date: { greater_than_equal: cycle.startDate } }, { date: { less_than: end } }] },
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    }),
    payload.find({ collection: 'cycle-weeks', where: { cycle: { equals: cycle.id } }, depth: 0, pagination: false, overrideAccess: true, req }),
  ])

  const logs: LogInput[] = logsRes.docs.map((l) => ({
    performedAt: String(l.performedAt),
    status: l.status,
    durationMin: (l as { durationMin?: number | null }).durationMin ?? null,
    sessionRpe: (l as { sessionRpe?: number | null }).sessionRpe ?? null,
    exercises: ((l.exercises ?? []) as Array<{ exercise?: unknown; name: string; muscleGroup?: string | null; sets?: Array<{ reps?: number | null; loadKg?: number | null; rir?: number | null; done?: boolean | null }> | null }>).map((e) => ({
      exercise: relId(e.exercise),
      name: e.name,
      muscleGroup: e.muscleGroup ?? null,
      sets: e.sets ?? [],
    })),
  }))
  const metrics: MetricInput[] = metricsRes.docs.map((m) => ({ date: String(m.date), weightKg: m.weightKg ?? null, waistCm: m.waistCm ?? null }))
  const checkins: CheckinInput[] = checkinsRes.docs.map((c) => ({
    date: String(c.date),
    sleep: c.sleep ?? null,
    energy: c.energy ?? null,
    soreness: c.soreness ?? null,
    stress: c.stress ?? null,
    dietAdherence: c.dietAdherence ?? null,
  }))
  const docByIndex = new Map(weeksRes.docs.map((w) => [Number(w.index), w]))
  const keyLifts = keyLiftsOf(cycle)

  const states: Array<{ plan: WeekPlan; actual: ReturnType<typeof computeActual>; classified: ReturnType<typeof classifyWeek> }> = []
  for (const plan of plans.slice(0, current + 1)) {
    const actual = computeActual({ week: plan, logs, metrics, checkins, keyLifts })
    states.push({ plan, actual, classified: classifyWeek(cycle.goal, plan, actual) })
  }

  for (const state of states) {
    if (state.plan.index < fromIndex) continue
    const doc = docByIndex.get(state.plan.index)
    if (!doc) continue
    const phaseWeeks = plans.filter((p) => p.phaseIndex === state.plan.phaseIndex).length
    const fresh = suggest(cycle.goal, states, state.plan.index, phaseWeeks)
    await payload.update({
      collection: 'cycle-weeks',
      id: doc.id,
      data: {
        actual: state.actual,
        status: state.classified.status,
        reasons: state.classified.reasons,
        suggestions: mergeSuggestions(doc.suggestions as Suggestion[] | null, fresh),
        computedAt: new Date().toISOString(),
      } as never,
      overrideAccess: true,
      req,
      context: { periodizationEngine: true },
    })
  }
}

/** Depois de um registro (treino, pesagem, check-in): recalcula o ciclo ativo a partir daquela semana. */
export async function recomputeForStudentDate(payload: Payload, student: unknown, date: unknown, req?: PayloadRequest) {
  const studentId = relId(student)
  if (!studentId || !date) return
  const active = await payload.find({
    collection: 'training-cycles',
    where: { and: [{ student: { equals: studentId } }, { status: { equals: 'active' } }] },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  })
  const cycle = active.docs[0] as unknown as CycleDoc | undefined
  if (!cycle) return
  const index = weekIndexFor(cycle.startDate, String(date))
  if (index < 0) return
  // Uma semana antes: as sugestões usam a semana anterior e a tendência de peso é contínua
  await recomputeCycle(payload, cycle, req, Math.max(0, index - 1))
}
