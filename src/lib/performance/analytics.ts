/**
 * Análise de desempenho a partir do que foi REALIZADO (registros de treino), sem inventar dados.
 * Funções puras: histórico por exercício, recordes, levantamentos principais, volume por grupo,
 * planejado × realizado, peso com média móvel de 7 dias e resumo de ciclos.
 */
import { e1rm, round1 } from '../periodization/calc'

export type PerfSet = {
  reps?: number | null
  loadKg?: number | null
  rir?: number | null
  rpe?: number | null
  restSec?: number | null
  done?: boolean | null
}
export type PerfPlanned = {
  sets?: number | null
  reps?: string | null
  loadKg?: number | null
  rir?: number | null
  rpe?: number | null
  restSec?: number | null
}
export type PerfExercise = {
  exercise?: number | string | null
  name: string
  muscleGroup?: string | null
  planned?: PerfPlanned | null
  change?: string | null
  replacedName?: string | null
  notes?: string | null
  sets?: PerfSet[] | null
}
export type PerfLog = {
  id?: number | string
  performedAt: string
  status?: string | null
  cycle?: number | string | null
  weekIndex?: number | null
  durationMin?: number | null
  sessionRpe?: number | null
  exercises?: PerfExercise[] | null
}
export type CatalogEntry = { id: number | string; name: string; primaryMuscles?: string[] | null; secondaryMuscles?: string[] | null }

const DAY = 86_400_000
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/** RIR efetivo da série: informado, ou derivado do RPE (RIR ≈ 10 − RPE). */
export function effectiveRir(s: PerfSet): number | null {
  if (s.rir != null) return s.rir
  if (s.rpe != null) return Math.max(0, 10 - s.rpe)
  return null
}

/** Série válida para análise: feita, com repetições. */
export const isWorkingSet = (s: PerfSet) => s.done !== false && (s.reps ?? 0) > 0

/** Chave estável do exercício: id da biblioteca ou nome normalizado. */
export const exerciseKey = (ex: Pick<PerfExercise, 'exercise' | 'name'>) =>
  ex.exercise != null && ex.exercise !== '' ? `id:${ex.exercise}` : `name:${norm(ex.name)}`

// ---------- Levantamentos principais ----------

export type MainLift = 'squat' | 'bench' | 'deadlift'
export const MAIN_LIFT_LABEL: Record<MainLift, string> = {
  squat: 'Agachamento livre',
  bench: 'Supino reto',
  deadlift: 'Levantamento terra',
}

/** Identifica os três levantamentos pelo nome (PT ou EN). Variações (romeno, inclinado, smith…) ficam de fora. */
export function mainLiftOf(name: string): MainLift | null {
  const n = norm(name)
  if (/(romeno|romanian|stiff|sumo|hack|smith|bulgar|frontal|front|goblet|pistol|zercher|maquina|machine|leg press)/.test(n)) {
    // Terra sumo continua sendo terra
    if (/sumo/.test(n) && /(terra|deadlift)/.test(n)) return 'deadlift'
    return null
  }
  if (/(agachamento( livre| com barra)?$|^agachamento livre|back squat|barbell (full )?squat)/.test(n)) return 'squat'
  if (/(supino reto( com barra)?$|^supino reto com barra|barbell bench press)/.test(n)) return 'bench'
  if (/(levantamento terra|^terra( convencional)?$|barbell deadlift|^deadlift$)/.test(n)) return 'deadlift'
  return null
}

// ---------- Histórico por exercício ----------

export type ExerciseSession = {
  date: string
  logId?: number | string
  weekIndex: number | null
  cycle: number | string | null
  sets: PerfSet[]
  planned: PerfPlanned | null
  topLoad: number | null
  topLoadReps: number | null
  bestE1rm: number | null
  volume: number
  totalReps: number
  avgRir: number | null
}

export function exerciseHistory(logs: PerfLog[], key: string): ExerciseSession[] {
  const out: ExerciseSession[] = []
  for (const log of [...logs].sort((a, b) => a.performedAt.localeCompare(b.performedAt))) {
    if (log.status === 'skipped') continue
    for (const ex of log.exercises ?? []) {
      if (exerciseKey(ex) !== key || ex.change === 'skipped') continue
      const sets = (ex.sets ?? []).filter(isWorkingSet)
      if (!sets.length) continue
      let topLoad: number | null = null
      let topLoadReps: number | null = null
      let best: number | null = null
      let volume = 0
      let totalReps = 0
      const rirs: number[] = []
      for (const s of sets) {
        const load = s.loadKg ?? 0
        const reps = s.reps ?? 0
        volume += load * reps
        totalReps += reps
        if (load > 0 && (topLoad == null || load > topLoad || (load === topLoad && reps > (topLoadReps ?? 0)))) {
          topLoad = load
          topLoadReps = reps
        }
        const rir = effectiveRir(s)
        if (rir != null) rirs.push(rir)
        const est = e1rm(load, reps, rir ?? 0)
        if (est && (best == null || est > best)) best = est
      }
      out.push({
        date: log.performedAt,
        logId: log.id,
        weekIndex: log.weekIndex ?? null,
        cycle: log.cycle ?? null,
        sets,
        planned: ex.planned ?? null,
        topLoad,
        topLoadReps,
        bestE1rm: best,
        volume: Math.round(volume),
        totalReps,
        avgRir: rirs.length ? round1(rirs.reduce((a, b) => a + b, 0) / rirs.length) : null,
      })
    }
  }
  return out
}

// ---------- Recordes (cada tipo separado) ----------

export type PrKind = 'load' | 'reps' | 'e1rm' | 'volume'
export type PrEvent = { date: string; kind: PrKind; value: number; reps?: number; detail: string }

export type Records = {
  /** Maior carga levantada (com quantas repetições) */
  heaviest: { loadKg: number; reps: number; date: string } | null
  /** Melhor carga para cada número de repetições (1 a 12): recorde por repetição */
  repMax: Array<{ reps: number; loadKg: number; date: string }>
  /** Maior 1RM estimado (estimativa, não é um teste de 1RM) */
  bestE1rm: { value: number; date: string } | null
  /** Maior volume (carga × repetições) numa sessão */
  bestVolume: { value: number; date: string } | null
  /** Quando cada recorde foi batido, em ordem */
  timeline: PrEvent[]
}

export function records(history: ExerciseSession[]): Records {
  let heaviest: Records['heaviest'] = null
  let bestE1rm: Records['bestE1rm'] = null
  let bestVolume: Records['bestVolume'] = null
  const repMax = new Map<number, { loadKg: number; date: string }>()
  const timeline: PrEvent[] = []

  for (const s of history) {
    for (const set of s.sets) {
      const load = set.loadKg ?? 0
      const reps = set.reps ?? 0
      if (load <= 0) continue
      if (!heaviest || load > heaviest.loadKg) {
        if (heaviest) timeline.push({ date: s.date, kind: 'load', value: load, reps, detail: `Maior carga: ${load} kg × ${reps}` })
        heaviest = { loadKg: load, reps, date: s.date }
      }
      if (reps >= 1 && reps <= 12) {
        const prev = repMax.get(reps)
        if (!prev || load > prev.loadKg) {
          if (prev) timeline.push({ date: s.date, kind: 'reps', value: load, reps, detail: `Recorde de ${reps} rep${reps > 1 ? 's' : ''}: ${load} kg` })
          repMax.set(reps, { loadKg: load, date: s.date })
        }
      }
    }
    if (s.bestE1rm && (!bestE1rm || s.bestE1rm > bestE1rm.value)) {
      if (bestE1rm) timeline.push({ date: s.date, kind: 'e1rm', value: s.bestE1rm, detail: `1RM estimado: ${s.bestE1rm} kg` })
      bestE1rm = { value: s.bestE1rm, date: s.date }
    }
    if (s.volume > 0 && (!bestVolume || s.volume > bestVolume.value)) {
      if (bestVolume) timeline.push({ date: s.date, kind: 'volume', value: s.volume, detail: `Volume da sessão: ${s.volume} kg` })
      bestVolume = { value: s.volume, date: s.date }
    }
  }
  return {
    heaviest,
    repMax: [...repMax.entries()].sort((a, b) => a[0] - b[0]).map(([reps, v]) => ({ reps, ...v })),
    bestE1rm,
    bestVolume,
    timeline,
  }
}

// ---------- Séries semanais ----------

/** Segunda-feira da semana (UTC) da data, como chave de agrupamento. */
export function weekStart(iso: string): string {
  const d = new Date(iso)
  const day = (d.getUTCDay() + 6) % 7
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day))
  return monday.toISOString().slice(0, 10)
}

export type WeeklyPoint = { week: string; bestE1rm: number | null; topLoad: number | null; volume: number; sessions: number }

export function weeklySeries(history: ExerciseSession[]): WeeklyPoint[] {
  const map = new Map<string, WeeklyPoint>()
  for (const s of history) {
    const w = weekStart(s.date)
    const p = map.get(w) ?? { week: w, bestE1rm: null, topLoad: null, volume: 0, sessions: 0 }
    p.sessions += 1
    p.volume += s.volume
    if (s.bestE1rm != null && (p.bestE1rm == null || s.bestE1rm > p.bestE1rm)) p.bestE1rm = s.bestE1rm
    if (s.topLoad != null && (p.topLoad == null || s.topLoad > p.topLoad)) p.topLoad = s.topLoad
    map.set(w, p)
  }
  return [...map.values()].sort((a, b) => a.week.localeCompare(b.week))
}

// ---------- Planejado × realizado ----------

export type PlanCompare = {
  status: 'completed' | 'partial' | 'not_done' | 'unplanned'
  planned: { sets: number | null; repsMin: number | null; repsMax: number | null; loadKg: number | null; rir: number | null }
  done: { sets: number; reps: number[]; maxLoad: number | null; avgRir: number | null }
  repsVsTarget: 'above' | 'within' | 'below' | null
  loadDiffKg: number | null
  missingSets: number
}

export function parseRepRange(reps: string | number | null | undefined): { min: number | null; max: number | null } {
  if (reps == null || reps === '') return { min: null, max: null }
  const nums = String(reps).match(/\d+/g)?.map(Number) ?? []
  if (!nums.length) return { min: null, max: null }
  return { min: Math.min(...nums), max: Math.max(...nums) }
}

export function comparePlanned(ex: PerfExercise): PlanCompare {
  const sets = (ex.sets ?? []).filter(isWorkingSet)
  const p = ex.planned ?? null
  const range = parseRepRange(p?.reps)
  const plannedSets = p?.sets ?? null
  const rirs = sets.map(effectiveRir).filter((x): x is number => x != null)
  const loads = sets.map((s) => s.loadKg ?? 0).filter((x) => x > 0)
  const maxLoad = loads.length ? Math.max(...loads) : null
  const done = {
    sets: sets.length,
    reps: sets.map((s) => s.reps ?? 0),
    maxLoad,
    avgRir: rirs.length ? round1(rirs.reduce((a, b) => a + b, 0) / rirs.length) : null,
  }
  const unplanned = !p || (plannedSets == null && range.min == null && p.loadKg == null)
  const missingSets = plannedSets != null ? Math.max(0, plannedSets - sets.length) : 0

  let repsVsTarget: PlanCompare['repsVsTarget'] = null
  if (range.min != null && sets.length) {
    const below = sets.filter((s) => (s.reps ?? 0) < range.min!).length
    const above = range.max != null ? sets.filter((s) => (s.reps ?? 0) > range.max!).length : 0
    repsVsTarget = below > 0 ? 'below' : above > sets.length / 2 ? 'above' : 'within'
  }

  let status: PlanCompare['status']
  if (ex.change === 'skipped' || sets.length === 0) status = 'not_done'
  else if (unplanned) status = 'unplanned'
  else if (missingSets > 0 || repsVsTarget === 'below') status = 'partial'
  else status = 'completed'

  return {
    status,
    planned: { sets: plannedSets, repsMin: range.min, repsMax: range.max, loadKg: p?.loadKg ?? null, rir: p?.rir ?? (p?.rpe != null ? 10 - p.rpe : null) },
    done,
    repsVsTarget,
    loadDiffKg: p?.loadKg != null && maxLoad != null ? round1(maxLoad - p.loadKg) : null,
    missingSets,
  }
}

// ---------- Volume por grupo muscular ----------

/** Grupos acompanhados (pedido do produto). Ombro dividido em porções quando o nome do exercício deixa claro. */
export const VOLUME_GROUPS = [
  'Peitoral',
  'Costas',
  'Ombro anterior',
  'Ombro lateral',
  'Ombro posterior',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Posteriores de coxa',
  'Glúteos',
  'Panturrilhas',
  'Abdômen',
] as const
export type VolumeGroup = (typeof VOLUME_GROUPS)[number]

const MUSCLE_TO_GROUP: Record<string, VolumeGroup | 'Ombro'> = {
  chest: 'Peitoral',
  lats: 'Costas',
  'middle back': 'Costas',
  traps: 'Costas',
  'lower back': 'Costas',
  shoulders: 'Ombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores de coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
  abdominals: 'Abdômen',
}

/** Grupos escritos à mão no treino (campo muscleGroup) */
const LABEL_TO_GROUP: Record<string, VolumeGroup | 'Ombro'> = {
  peito: 'Peitoral',
  peitoral: 'Peitoral',
  costas: 'Costas',
  ombro: 'Ombro',
  ombros: 'Ombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  pernas: 'Quadríceps',
  quadriceps: 'Quadríceps',
  posteriores: 'Posteriores de coxa',
  'posteriores de coxa': 'Posteriores de coxa',
  gluteos: 'Glúteos',
  panturrilha: 'Panturrilhas',
  panturrilhas: 'Panturrilhas',
  abdomen: 'Abdômen',
}

/**
 * Porção do ombro pelo nome do exercício (a base de exercícios não separa as porções).
 * Desenvolvimentos e elevação frontal → anterior; elevação lateral → lateral; crucifixo invertido,
 * face pull e posterior → posterior. Sem pista no nome: conta como anterior (o mais comum nos compostos).
 */
export function shoulderPortion(name: string): VolumeGroup {
  const n = norm(name)
  if (/(lateral raise|elevacao lateral|lateral)/.test(n)) return 'Ombro lateral'
  if (/(reverse fly|rear delt|face pull|crucifixo invertido|posterior|voador invertido)/.test(n)) return 'Ombro posterior'
  return 'Ombro anterior'
}

const resolve = (g: VolumeGroup | 'Ombro', name: string): VolumeGroup => (g === 'Ombro' ? shoulderPortion(name) : g)

/** Série dura: feita, com repetições, e esforço informado não muito longe da falha (RIR ≤ 4). Sem RIR conta. */
export const isHardSet = (s: PerfSet) => {
  if (!isWorkingSet(s)) return false
  const rir = effectiveRir(s)
  return rir == null || rir <= 4
}

export type GroupVolume = { group: VolumeGroup; direct: number; indirect: number; frequency: number; exercises: string[] }

/**
 * Metodologia: séries duras contam 1 para os músculos PRINCIPAIS do exercício (diretas) e 1 para os
 * SECUNDÁRIOS em uma coluna separada (indiretas). Indiretas nunca somam como diretas; o "total
 * ponderado" usa indiretas × 0,5, e isso é mostrado na tela.
 */
export function muscleVolume(logs: PerfLog[], catalog: Map<string, CatalogEntry>): Record<VolumeGroup, GroupVolume> {
  const out = Object.fromEntries(
    VOLUME_GROUPS.map((g) => [g, { group: g, direct: 0, indirect: 0, frequency: 0, exercises: [] as string[] }]),
  ) as Record<VolumeGroup, GroupVolume>
  for (const log of logs) {
    if (log.status === 'skipped') continue
    const directThisSession = new Set<VolumeGroup>()
    for (const ex of log.exercises ?? []) {
      const hard = (ex.sets ?? []).filter(isHardSet).length
      if (!hard) continue
      const entry = ex.exercise != null ? catalog.get(String(ex.exercise)) : undefined
      let primary: VolumeGroup[] = []
      let secondary: VolumeGroup[] = []
      if (entry) {
        primary = [...new Set((entry.primaryMuscles ?? []).map((m) => MUSCLE_TO_GROUP[m]).filter(Boolean).map((g) => resolve(g!, ex.name)))]
        secondary = [...new Set((entry.secondaryMuscles ?? []).map((m) => MUSCLE_TO_GROUP[m]).filter(Boolean).map((g) => resolve(g!, ex.name)))].filter(
          (g) => !primary.includes(g),
        )
      } else if (ex.muscleGroup) {
        const g = LABEL_TO_GROUP[norm(ex.muscleGroup)]
        if (g) primary = [resolve(g, ex.name)]
      }
      for (const g of primary) {
        out[g].direct += hard
        directThisSession.add(g)
        if (!out[g].exercises.includes(ex.name)) out[g].exercises.push(ex.name)
      }
      for (const g of secondary) out[g].indirect += hard
    }
    for (const g of directThisSession) out[g].frequency += 1
  }
  return out
}

// ---------- Corpo ----------

export type BodyPoint = { date: string; weightKg?: number | null; [k: string]: unknown }
export type WeightPoint = { date: string; weightKg: number | null; avg7: number | null }

/** Peso diário com média móvel dos últimos 7 dias (só com pesagens existentes; não preenche dias vazios). */
export function weightMovingAverage(points: BodyPoint[]): WeightPoint[] {
  const byDay = new Map<string, number[]>()
  for (const p of points) {
    if (!(p.weightKg && p.weightKg > 0)) continue
    const d = p.date.slice(0, 10)
    byDay.set(d, [...(byDay.get(d) ?? []), p.weightKg])
  }
  const days = [...byDay.keys()].sort()
  return days.map((d) => {
    const t = new Date(`${d}T00:00:00Z`).getTime()
    const window = days.filter((x) => {
      const tx = new Date(`${x}T00:00:00Z`).getTime()
      return tx <= t && tx > t - 7 * DAY
    })
    const vals = window.flatMap((x) => byDay.get(x)!)
    const dayVals = byDay.get(d)!
    return {
      date: d,
      weightKg: round1(dayVals.reduce((a, b) => a + b, 0) / dayVals.length),
      avg7: vals.length >= 2 ? round1(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
    }
  })
}

// ---------- Recuperação × desempenho ----------

export type RecoveryInput = {
  date: string
  sleep?: number | null
  fatigue?: number | null
  soreness?: number | null
  readiness?: number | null
  jointPain?: number | null
  recovery?: number | null
}

/** Recuperação ruim no check-in: sono ≤ 2, fadiga ≥ 4, dor articular ≥ 4, disposição ≤ 2 ou recuperação ≤ 2. */
export function poorRecovery(c: RecoveryInput | null | undefined): string[] {
  if (!c) return []
  const r: string[] = []
  if ((c.sleep ?? 5) <= 2) r.push('sono ruim')
  if ((c.fatigue ?? 1) >= 4) r.push('fadiga alta')
  if ((c.jointPain ?? 1) >= 4) r.push('dor articular')
  if ((c.readiness ?? 5) <= 2) r.push('pouca disposição')
  if ((c.recovery ?? 5) <= 2) r.push('recuperação baixa')
  return r
}

/**
 * Alerta (não diagnóstico): queda do 1RM estimado em 2 semanas seguidas num levantamento principal
 * junto com recuperação ruim no check-in mais recente.
 */
export function fatigueAlerts(
  lifts: Array<{ label: string; weekly: WeeklyPoint[] }>,
  latestCheckin: RecoveryInput | null,
): string[] {
  const reasons = poorRecovery(latestCheckin)
  if (!reasons.length) return []
  const alerts: string[] = []
  for (const l of lifts) {
    const pts = l.weekly.filter((p) => p.bestE1rm != null).slice(-3)
    if (pts.length === 3 && pts[2].bestE1rm! < pts[1].bestE1rm! && pts[1].bestE1rm! < pts[0].bestE1rm!) {
      alerts.push(
        `${l.label}: 1RM estimado caindo há 2 semanas, com ${reasons.join(', ')}. Considere reduzir volume ou antecipar o deload. Se houver dor, procure um profissional de saúde.`,
      )
    }
  }
  return alerts
}

// ---------- Comparação de ciclos ----------

export type CycleSummaryInput = {
  id: number | string
  title: string
  goal: string
  startDate: string
  totalWeeks: number
  weeks: Array<{ index: number; status?: string | null; actual?: { sessionsDone?: number; adherence?: number | null; tonnage?: number; weightTrend?: number | null; weightAvg?: number | null } | null }>
}

export type CycleSummary = {
  id: number | string
  title: string
  goal: string
  startDate: string
  totalWeeks: number
  weeksWithData: number
  sessions: number
  avgAdherence: number | null
  avgWeeklyTonnage: number | null
  weightChange: number | null
  onTrackWeeks: number
  lifts: Array<{ lift: MainLift; label: string; first: number | null; last: number | null; changePct: number | null }>
}

export function cycleSummary(cycle: CycleSummaryInput, logs: PerfLog[]): CycleSummary {
  const withData = cycle.weeks.filter((w) => w.actual && (w.actual.sessionsDone ?? 0) + (w.actual.weightAvg ? 1 : 0) > 0)
  const adh = withData.map((w) => w.actual?.adherence).filter((x): x is number => x != null)
  const ton = withData.map((w) => w.actual?.tonnage ?? 0)
  const weights = cycle.weeks.map((w) => w.actual?.weightTrend ?? w.actual?.weightAvg ?? null).filter((x): x is number => x != null)
  const cycleLogs = logs.filter((l) => String(l.cycle ?? '') === String(cycle.id))

  const lifts = (Object.keys(MAIN_LIFT_LABEL) as MainLift[]).map((lift) => {
    const key = mainLiftKeys(cycleLogs).get(lift)
    const hist = key ? exerciseHistory(cycleLogs, key).filter((s) => s.bestE1rm != null) : []
    const first = hist[0]?.bestE1rm ?? null
    const last = hist.length ? Math.max(...hist.slice(-2).map((s) => s.bestE1rm!)) : null
    return {
      lift,
      label: MAIN_LIFT_LABEL[lift],
      first,
      last,
      changePct: first && last ? round1(((last - first) / first) * 100) : null,
    }
  })

  return {
    id: cycle.id,
    title: cycle.title,
    goal: cycle.goal,
    startDate: cycle.startDate,
    totalWeeks: cycle.totalWeeks,
    weeksWithData: withData.length,
    sessions: withData.reduce((n, w) => n + (w.actual?.sessionsDone ?? 0), 0),
    avgAdherence: adh.length ? round1((adh.reduce((a, b) => a + b, 0) / adh.length) * 100) : null,
    avgWeeklyTonnage: ton.length ? Math.round(ton.reduce((a, b) => a + b, 0) / ton.length) : null,
    weightChange: weights.length >= 2 ? round1(weights[weights.length - 1] - weights[0]) : null,
    onTrackWeeks: cycle.weeks.filter((w) => w.status === 'on_track' || w.status === 'ahead').length,
    lifts,
  }
}

/** Para cada levantamento principal, a chave do exercício mais registrado com esse nome. */
export function mainLiftKeys(logs: PerfLog[]): Map<MainLift, string> {
  const counts = new Map<MainLift, Map<string, number>>()
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      const lift = mainLiftOf(ex.name)
      if (!lift) continue
      const m = counts.get(lift) ?? new Map<string, number>()
      const k = exerciseKey(ex)
      m.set(k, (m.get(k) ?? 0) + 1)
      counts.set(lift, m)
    }
  }
  const out = new Map<MainLift, string>()
  for (const [lift, m] of counts) out.set(lift, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0])
  return out
}
