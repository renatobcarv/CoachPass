import { NextResponse } from 'next/server'

import { comparePlanned, exerciseHistory, exerciseKey, mainLiftOf, records, weeklySeries } from '@/lib/performance/analytics'
import { suggestProgression } from '@/lib/performance/progression'
import { errorResponse, loadCheckins, loadLogs, resolveStudent } from '@/lib/performance/server'

export const dynamic = 'force-dynamic'

/** Histórico completo de um exercício: sessões com cada série, planejado × realizado, recordes e sugestão. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const ctx = await resolveStudent(url.searchParams.get('studentId'))
  if ('error' in ctx && ctx.error) return errorResponse(ctx.error)
  const { payload, studentId } = ctx
  const key = url.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Informe o exercício.' }, { status: 400 })

  const [logs, checkins] = await Promise.all([loadLogs(payload, studentId), loadCheckins(payload, studentId)])
  const history = exerciseHistory(logs, key)
  const name =
    logs.flatMap((l) => l.exercises ?? []).find((e) => exerciseKey(e) === key)?.name ??
    (key.startsWith('id:')
      ? (await payload.findByID({ collection: 'exercises', id: key.slice(3), depth: 0, overrideAccess: true }).catch(() => null))?.name
      : null) ??
    'Exercício'

  const sessions = [...history].reverse().map((s) => {
    const log = logs.find((l) => l.id === s.logId)
    const ex = log?.exercises?.find((e) => exerciseKey(e) === key)
    return { ...s, compare: ex ? comparePlanned(ex) : null, notes: ex?.notes ?? null, change: ex?.change ?? null }
  })
  const lastPlanned = history[history.length - 1]?.planned ?? null

  return NextResponse.json({
    key,
    name,
    mainLift: mainLiftOf(name),
    sessions,
    records: records(history),
    weekly: weeklySeries(history),
    suggestion: suggestProgression(
      history,
      { repRange: lastPlanned?.reps ?? null, sets: lastPlanned?.sets ?? null, targetRir: lastPlanned?.rir ?? null, loadKg: lastPlanned?.loadKg ?? null, isMainLift: Boolean(mainLiftOf(name)) },
      checkins[checkins.length - 1] ?? null,
    ),
  })
}
