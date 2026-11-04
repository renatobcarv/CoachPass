import { NextResponse } from 'next/server'

import {
  MAIN_LIFT_LABEL,
  VOLUME_GROUPS,
  comparePlanned,
  exerciseHistory,
  exerciseKey,
  fatigueAlerts,
  mainLiftKeys,
  muscleVolume,
  records,
  weekStart,
  weeklySeries,
  weightMovingAverage,
  type MainLift,
  type PerfLog,
  type PrEvent,
} from '@/lib/performance/analytics'
import { weekIndexFor } from '@/lib/periodization/calc'
import { errorResponse, loadCatalog, loadCheckins, loadLogs, resolveStudent } from '@/lib/performance/server'

export const dynamic = 'force-dynamic'

/**
 * Painel de evolução do aluno (para ele mesmo ou para o profissional que acompanha).
 * Filtros: ?studentId=&weeks=8|12|26|0(tudo)&cycleId=&group=
 * Só dados registrados: sem histórico, as listas vêm vazias.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const ctx = await resolveStudent(url.searchParams.get('studentId'))
  if ('error' in ctx && ctx.error) return errorResponse(ctx.error)
  const { payload, studentId, isSelf } = ctx

  const weeks = Number(url.searchParams.get('weeks') ?? 12)
  const from = weeks > 0 ? new Date(Date.now() - weeks * 7 * 86_400_000).toISOString() : null
  const cycleFilter = Number(url.searchParams.get('cycleId')) || null
  const groupFilter = url.searchParams.get('group')

  const [studentDoc, cyclesRes, metricsRes, allLogs, checkins] = await Promise.all([
    payload.findByID({ collection: 'users', id: studentId, depth: 0, overrideAccess: true, select: { name: true } }),
    payload.find({
      collection: 'training-cycles',
      where: { student: { equals: studentId } },
      depth: 0,
      pagination: false,
      sort: '-startDate',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'body-metrics',
      where: { and: [{ student: { equals: studentId } }, ...(from ? [{ date: { greater_than_equal: from } }] : [])] },
      depth: 0,
      pagination: false,
      sort: 'date',
      overrideAccess: true,
    }),
    loadLogs(payload, studentId),
    loadCheckins(payload, studentId, from),
  ])

  // Período/ciclo escolhido
  const logs = allLogs.filter(
    (l) => (!from || l.performedAt >= from) && (!cycleFilter || String(l.cycle ?? '') === String(cycleFilter)),
  )
  const catalog = await loadCatalog(payload, logs)

  // Ciclo ativo e semana atual
  const active = cyclesRes.docs.find((c) => c.status === 'active') ?? null
  let activeCycle = null
  if (active) {
    const weeksRes = await payload.find({
      collection: 'cycle-weeks',
      where: { cycle: { equals: active.id } },
      depth: 0,
      pagination: false,
      sort: 'index',
      overrideAccess: true,
    })
    const current = Math.min((active.totalWeeks ?? 1) - 1, weekIndexFor(String(active.startDate), new Date()))
    const started = weeksRes.docs.filter((w) => Number(w.index) <= current)
    const done = started.reduce((n, w) => n + ((w.actual as { sessionsDone?: number } | null)?.sessionsDone ?? 0), 0)
    const planned = started.reduce((n, w) => n + ((w.planned as { sessions?: number } | null)?.sessions ?? 0), 0)
    const cw = weeksRes.docs.find((w) => Number(w.index) === current)
    activeCycle = {
      id: active.id,
      title: active.title,
      goal: active.goal,
      startDate: active.startDate,
      totalWeeks: active.totalWeeks,
      currentWeek: current,
      phaseName: cw?.phaseName ?? null,
      isDeload: Boolean(cw?.isDeload),
      sessionsDone: done,
      sessionsPlanned: planned,
      adherence: planned > 0 ? Math.round((Math.min(done, planned) / planned) * 100) : null,
      currentPlanned: cw?.planned ?? null,
      weeks: weeksRes.docs.map((w) => ({
        index: w.index,
        phaseName: w.phaseName,
        isDeload: w.isDeload,
        status: w.status,
        startDate: w.startDate,
        planned: w.planned,
        expected: w.expected,
        actual: w.actual,
        suggestions: ((w.suggestions as Array<{ status: string }> | null) ?? []).filter((s) => s.status === 'pending'),
        id: w.id,
      })),
    }
  }

  // Levantamentos principais
  const liftKeys = mainLiftKeys(allLogs)
  const mainLifts = (Object.keys(MAIN_LIFT_LABEL) as MainLift[]).map((lift) => {
    const key = liftKeys.get(lift) ?? null
    const fullHist = key ? exerciseHistory(allLogs, key) : []
    const hist = fullHist.filter((s) => (!from || s.date >= from) && (!cycleFilter || String(s.cycle ?? '') === String(cycleFilter)))
    const last = fullHist[fullHist.length - 1] ?? null
    const lastLog = last ? allLogs.find((l) => l.id === last.logId) : null
    const lastEx = lastLog?.exercises?.find((e) => exerciseKey(e) === key) ?? null
    return {
      lift,
      label: MAIN_LIFT_LABEL[lift],
      key,
      name: lastEx?.name ?? null,
      sessions: hist.length,
      last: last ? { date: last.date, topLoad: last.topLoad, topLoadReps: last.topLoadReps, bestE1rm: last.bestE1rm } : null,
      records: records(fullHist),
      weekly: weeklySeries(hist),
      lastCompare: lastEx ? comparePlanned(lastEx) : null,
    }
  })

  // Volume por grupo, semana a semana (diretas e indiretas separadas)
  const byWeek = new Map<string, PerfLog[]>()
  for (const l of logs) byWeek.set(weekStart(l.performedAt), [...(byWeek.get(weekStart(l.performedAt)) ?? []), l])
  const volumeWeeks = [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, wl]) => {
      const v = muscleVolume(wl, catalog)
      return {
        week,
        groups: Object.fromEntries(
          VOLUME_GROUPS.filter((g) => !groupFilter || g === groupFilter).map((g) => [g, { direct: v[g].direct, indirect: v[g].indirect, frequency: v[g].frequency }]),
        ),
      }
    })
  const thisWeek = muscleVolume(byWeek.get(weekStart(new Date().toISOString())) ?? [], catalog)

  // Tonelagem semanal e sessões
  const tonnage = [...byWeek.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, wl]) => ({
      week,
      sessions: wl.filter((l) => l.status !== 'skipped').length,
      tonnage: Math.round(
        wl.flatMap((l) => l.exercises ?? []).flatMap((e) => e.sets ?? []).filter((s) => s.done !== false).reduce((n, s) => n + (s.loadKg ?? 0) * (s.reps ?? 0), 0),
      ),
    }))

  // Recordes de todos os exercícios (os mais recentes primeiro)
  const keys = new Map<string, string>()
  for (const l of allLogs) for (const e of l.exercises ?? []) keys.set(exerciseKey(e), e.name)
  const prTimeline: Array<PrEvent & { exercise: string; key: string }> = []
  const exercises: Array<{ key: string; name: string; sessions: number }> = []
  for (const [key, name] of keys) {
    const h = exerciseHistory(allLogs, key)
    if (!h.length) continue
    exercises.push({ key, name, sessions: h.length })
    for (const ev of records(h).timeline) prTimeline.push({ ...ev, exercise: name, key })
  }
  prTimeline.sort((a, b) => b.date.localeCompare(a.date))
  exercises.sort((a, b) => b.sessions - a.sessions)

  // Corpo
  const metrics = metricsRes.docs
  const measureKeys = ['waistCm', 'abdomenCm', 'hipCm', 'chestCm', 'armCm', 'thighCm', 'calfCm'] as const
  const measures = Object.fromEntries(
    measureKeys.map((k) => {
      const pts = metrics.filter((m) => (m[k] ?? 0) > 0).map((m) => ({ date: String(m.date), value: m[k] as number }))
      return [k, { first: pts[0] ?? null, last: pts[pts.length - 1] ?? null, points: pts }]
    }),
  )
  const photos = isSelf
    ? metrics
        .filter((m) => (m.photos ?? []).length)
        .map((m) => ({ date: String(m.date), photos: (m.photos ?? []).map((p) => ({ url: p.url, angle: p.angle ?? null })) }))
    : []

  const latestCheckin = checkins[checkins.length - 1] ?? null
  const alerts = fatigueAlerts(
    mainLifts.filter((m) => m.weekly.length).map((m) => ({ label: m.label, weekly: m.weekly })),
    latestCheckin,
  )

  return NextResponse.json({
    student: { id: studentId, name: studentDoc?.name ?? null },
    isSelf,
    filters: { weeks, cycleId: cycleFilter, group: groupFilter },
    cycles: cyclesRes.docs.map((c) => ({ id: c.id, title: c.title, status: c.status, startDate: c.startDate, totalWeeks: c.totalWeeks, goal: c.goal })),
    activeCycle,
    totals: { sessions: logs.filter((l) => l.status !== 'skipped').length, logsInPeriod: logs.length },
    mainLifts,
    volume: {
      weeks: volumeWeeks,
      thisWeek: VOLUME_GROUPS.map((g) => thisWeek[g]),
      plannedPerGroup: (activeCycle?.currentPlanned as { setsPerMuscle?: number | null } | null)?.setsPerMuscle ?? null,
      method:
        'Séries duras (até 4 repetições em reserva) contam 1 para os músculos principais do exercício. Músculos secundários aparecem como séries indiretas, em separado; no total ponderado valem 0,5. Porções do ombro são identificadas pelo nome do exercício.',
    },
    tonnage,
    body: {
      weight: weightMovingAverage(metrics.map((m) => ({ date: String(m.date), weightKg: m.weightKg ?? null }))),
      measures,
      bodyFat: metrics
        .filter((m) => m.bodyFatPercent)
        .map((m) => ({ date: String(m.date), value: m.bodyFatPercent, method: m.bodyFatMethod ?? null })),
      photos,
    },
    recovery: checkins,
    prTimeline: prTimeline.slice(0, 30),
    exercises,
    alerts,
  })
}
