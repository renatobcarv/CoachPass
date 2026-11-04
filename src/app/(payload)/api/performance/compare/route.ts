import { NextResponse } from 'next/server'

import { cycleSummary } from '@/lib/performance/analytics'
import { errorResponse, loadLogs, resolveStudent } from '@/lib/performance/server'

export const dynamic = 'force-dynamic'

/** Comparação de ciclos do aluno: ?studentId=&ids=1,2,3 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const ctx = await resolveStudent(url.searchParams.get('studentId'))
  if ('error' in ctx && ctx.error) return errorResponse(ctx.error)
  const { payload, studentId } = ctx
  const ids = (url.searchParams.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => n > 0)
    .slice(0, 4)
  if (!ids.length) return NextResponse.json({ error: 'Escolha os ciclos.' }, { status: 400 })

  const cycles = await payload.find({
    collection: 'training-cycles',
    where: { and: [{ id: { in: ids } }, { student: { equals: studentId } }] },
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const weeks = await payload.find({
    collection: 'cycle-weeks',
    where: { cycle: { in: cycles.docs.map((c) => c.id) } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const logs = await loadLogs(payload, studentId)

  return NextResponse.json({
    cycles: cycles.docs.map((c) =>
      cycleSummary(
        {
          id: c.id,
          title: c.title,
          goal: c.goal,
          startDate: String(c.startDate),
          totalWeeks: c.totalWeeks ?? 0,
          weeks: weeks.docs
            .filter((w) => (typeof w.cycle === 'object' ? w.cycle?.id : w.cycle) === c.id)
            .map((w) => ({ index: Number(w.index), status: w.status, actual: w.actual as never })),
        },
        logs,
      ),
    ),
  })
}
