import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { exerciseHistory, exerciseKey, mainLiftOf, parseRepRange } from '@/lib/performance/analytics'
import { suggestProgression } from '@/lib/performance/progression'
import { loadCheckins, loadLogs } from '@/lib/performance/server'

export const dynamic = 'force-dynamic'

const firstNumber = (v: unknown) => {
  const m = String(v ?? '').replace(',', '.').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

/**
 * Plano da sessão para a tela de execução: cada exercício com o planejado, a última vez que foi feito
 * e a sugestão de carga (sugestão, não altera o plano). Só o dono do treino (aluno) usa esta rota.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const workoutId = Number(new URL(request.url).searchParams.get('workoutId'))
  if (!workoutId) return NextResponse.json({ error: 'Informe o treino.' }, { status: 400 })

  // Acesso de quem pede (o aluno só enxerga os próprios treinos)
  const workout = await payload
    .findByID({ collection: 'workouts', id: workoutId, depth: 0, user, overrideAccess: false })
    .catch(() => null)
  if (!workout) return NextResponse.json({ error: 'Treino não encontrado.' }, { status: 404 })
  const studentId = typeof workout.student === 'object' ? Number(workout.student?.id) : Number(workout.student)

  const [logs, checkins] = await Promise.all([loadLogs(payload, studentId), loadCheckins(payload, studentId)])
  const latestCheckin = checkins[checkins.length - 1] ?? null
  const exerciseIds = (workout.exercises ?? []).map((e) => (typeof e.exercise === 'object' ? e.exercise?.id : e.exercise)).filter(Boolean) as number[]
  const catalog = exerciseIds.length
    ? await payload.find({ collection: 'exercises', where: { id: { in: exerciseIds } }, depth: 0, pagination: false, overrideAccess: true })
    : { docs: [] }
  const byId = new Map(catalog.docs.map((e) => [Number(e.id), e]))

  const exercises = (workout.exercises ?? []).map((e) => {
    const exId = typeof e.exercise === 'object' ? (e.exercise?.id ?? null) : (e.exercise ?? null)
    const key = exerciseKey({ exercise: exId, name: e.name })
    const history = exerciseHistory(logs, key)
    const last = history[history.length - 1] ?? null
    const planned = {
      sets: e.sets ?? null,
      reps: e.reps ?? null,
      loadKg: e.loadKg ?? firstNumber(e.weight),
      rir: e.targetRir ?? (e.targetRpe != null ? 10 - e.targetRpe : null),
      rpe: e.targetRpe ?? null,
      restSec: e.restSec ?? firstNumber(e.rest),
    }
    const lib = exId ? byId.get(Number(exId)) : undefined
    return {
      exercise: exId,
      key,
      name: e.name,
      muscleGroup: e.muscle ?? lib?.muscleGroup ?? null,
      notes: e.notes ?? null,
      image: lib?.images?.[0]?.url ?? null,
      planned,
      repRange: parseRepRange(e.reps),
      isMainLift: Boolean(mainLiftOf(e.name)),
      last: last ? { date: last.date, sets: last.sets, topLoad: last.topLoad, bestE1rm: last.bestE1rm } : null,
      suggestion: suggestProgression(
        history,
        { repRange: e.reps ?? null, sets: e.sets ?? null, targetRir: planned.rir, loadKg: planned.loadKg, isMainLift: Boolean(mainLiftOf(e.name)) },
        latestCheckin,
      ),
    }
  })

  return NextResponse.json({
    workout: { id: workout.id, title: workout.title, splitLabel: workout.splitLabel ?? null, observations: workout.observations ?? null, cycle: workout.cycle ?? null },
    exercises,
    latestCheckin,
  })
}
