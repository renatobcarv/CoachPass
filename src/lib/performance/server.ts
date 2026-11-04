import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import type { CatalogEntry, PerfLog, PerfPlanned, RecoveryInput } from './analytics'

type AuthUser = { id: number; role?: string; isSuperAdmin?: boolean; name?: string }

/**
 * Quem pede e de qual aluno: o próprio aluno, um profissional com vínculo ativo
 * ou que acompanha um ciclo do aluno (personal/nutricionista). Nada além disso.
 */
export async function resolveStudent(studentParam: string | null) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return { payload, error: { status: 401, message: 'Não autenticado' } } as const
  const u = user as unknown as AuthUser
  const requested = Number(studentParam) || null

  if (u.role === 'student' && (!requested || requested === Number(u.id))) {
    return { payload, user: u, studentId: Number(u.id), isSelf: true } as const
  }
  if (!requested) return { payload, error: { status: 400, message: 'Informe o aluno.' } } as const
  if (u.isSuperAdmin || u.role === 'master') return { payload, user: u, studentId: requested, isSelf: false } as const
  if (u.role !== 'personal' && u.role !== 'nutritionist') {
    return { payload, error: { status: 403, message: 'Sem acesso a este aluno.' } } as const
  }
  const [link, cycle] = await Promise.all([
    payload.count({
      collection: 'professional-links',
      where: { and: [{ student: { equals: requested } }, { professional: { equals: u.id } }, { status: { equals: 'active' } }] },
      overrideAccess: true,
    }),
    payload.count({
      collection: 'training-cycles',
      where: { and: [{ student: { equals: requested } }, { or: [{ coach: { equals: u.id } }, { nutritionist: { equals: u.id } }] }] },
      overrideAccess: true,
    }),
  ])
  if (!link.totalDocs && !cycle.totalDocs) return { payload, error: { status: 403, message: 'Sem acesso a este aluno.' } } as const
  return { payload, user: u, studentId: requested, isSelf: false } as const
}

const rel = (v: unknown): number | null => {
  if (v == null) return null
  if (typeof v === 'object' && 'id' in (v as object)) return Number((v as { id: unknown }).id)
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Registros do aluno no formato da análise (opcionalmente filtrados por período/ciclo). */
export async function loadLogs(payload: Payload, studentId: number, opts: { from?: string | null; to?: string | null; cycleId?: number | null } = {}) {
  const and: Array<Record<string, unknown>> = [{ student: { equals: studentId } }]
  if (opts.from) and.push({ performedAt: { greater_than_equal: opts.from } })
  if (opts.to) and.push({ performedAt: { less_than: opts.to } })
  if (opts.cycleId) and.push({ cycle: { equals: opts.cycleId } })
  const res = await payload.find({
    collection: 'workout-logs',
    where: { and } as never,
    depth: 0,
    pagination: false,
    sort: 'performedAt',
    overrideAccess: true,
  })
  return res.docs.map(
    (l): PerfLog => ({
      id: l.id,
      performedAt: String(l.performedAt),
      status: l.status,
      cycle: rel(l.cycle),
      weekIndex: (l.weekIndex as number | null) ?? null,
      durationMin: l.durationMin ?? null,
      sessionRpe: l.sessionRpe ?? null,
      exercises: (l.exercises ?? []).map((e) => ({
        exercise: rel(e.exercise),
        name: e.name,
        muscleGroup: e.muscleGroup ?? null,
        planned: (e.planned as PerfPlanned | null | undefined) ?? null,
        change: e.change ?? null,
        replacedName: e.replacedName ?? null,
        notes: e.notes ?? null,
        sets: (e.sets ?? []).map((s) => ({ reps: s.reps ?? null, loadKg: s.loadKg ?? null, rir: s.rir ?? null, rpe: s.rpe ?? null, restSec: s.restSec ?? null, done: s.done ?? true })),
      })),
    }),
  )
}

/** Músculos dos exercícios citados nos registros (para o volume por grupo). */
export async function loadCatalog(payload: Payload, logs: PerfLog[]): Promise<Map<string, CatalogEntry>> {
  const ids = [...new Set(logs.flatMap((l) => (l.exercises ?? []).map((e) => e.exercise)).filter((x) => x != null).map(Number))]
  if (!ids.length) return new Map()
  const res = await payload.find({
    collection: 'exercises',
    where: { id: { in: ids } },
    depth: 0,
    pagination: false,
    select: { name: true, primaryMuscles: true, secondaryMuscles: true },
    overrideAccess: true,
  })
  return new Map(res.docs.map((e) => [String(e.id), { id: e.id, name: e.name, primaryMuscles: e.primaryMuscles ?? [], secondaryMuscles: e.secondaryMuscles ?? [] }]))
}

export async function loadCheckins(payload: Payload, studentId: number, from?: string | null): Promise<RecoveryInput[]> {
  const res = await payload.find({
    collection: 'weekly-checkins',
    where: { and: [{ student: { equals: studentId } }, ...(from ? [{ date: { greater_than_equal: from } }] : [])] },
    depth: 0,
    pagination: false,
    sort: 'date',
    overrideAccess: true,
  })
  return res.docs.map((c) => ({
    date: String(c.date),
    sleep: c.sleep ?? null,
    fatigue: c.fatigue ?? null,
    soreness: c.soreness ?? null,
    readiness: c.readiness ?? null,
    jointPain: c.jointPain ?? null,
    recovery: c.recovery ?? null,
    energy: c.energy ?? null,
    stress: c.stress ?? null,
    dietAdherence: c.dietAdherence ?? null,
  })) as RecoveryInput[]
}

export const errorResponse = (e: { status: number; message: string }) => Response.json({ error: e.message }, { status: e.status })
