/**
 * Cálculos da periodização (puros, sem banco): semanas do ciclo, faixas esperadas,
 * medidas da semana, classificação e sugestões. Faixas padrão: docs/PLANO_V2 (seção 6.3).
 */

export type Goal = 'hypertrophy' | 'strength' | 'fat_loss' | 'recomposition' | 'conditioning' | 'performance'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type PhaseKind =
  | 'adaptation'
  | 'accumulation'
  | 'hypertrophy'
  | 'strength'
  | 'intensification'
  | 'power'
  | 'realization'
  | 'deload'
  | 'transition'
  | 'cutting'
export type DietPhase = 'deficit' | 'maintenance' | 'surplus' | 'diet_break'

export type Phase = {
  name?: string | null
  kind: PhaseKind
  weeks: number
  repRange?: string | null
  rirStart?: number | null
  rirEnd?: number | null
  intensityMin?: number | null
  intensityMax?: number | null
  setsStart?: number | null
  setsEnd?: number | null
  cardioMin?: number | null
  dietPhase?: DietPhase | null
  kcalDelta?: number | null
  proteinGPerKg?: number | null
}

export type KeyLift = { exercise?: string | number | null; name: string; e1rm?: number | null }

export type CycleInput = {
  goal: Goal
  level: Level
  startDate: string
  sessionsPerWeek?: number | null
  phases: Phase[]
  baseline?: { weightKg?: number | null; bodyFatPercent?: number | null; waistCm?: number | null; lifts?: KeyLift[] | null } | null
}

export type Band = { min: number; max: number }

export type WeekPlan = {
  index: number
  phaseIndex: number
  phaseName: string
  phaseKind: PhaseKind
  weekInPhase: number
  startDate: string
  endDate: string
  isDeload: boolean
  planned: {
    sessions: number
    setsPerMuscle: number | null
    rir: number | null
    intensity: Band | null
    repRange: string | null
    cardioMin: number | null
    dietPhase: DietPhase | null
    kcalDelta: number | null
  }
  expected: {
    weightKg: Band | null
    lifts: Array<{ key: string; name: string; e1rm: Band }>
    minAdherence: number
  }
}

const DAY = 86_400_000
export const MIN_ADHERENCE = 0.85

/** Força estimada (Epley) contando as repetições em reserva; séries acima de 12 reps não estimam bem. */
export function e1rm(loadKg: number, reps: number, rir = 0): number | null {
  if (!(loadKg > 0) || !(reps > 0)) return null
  const total = reps + Math.max(0, rir || 0)
  if (total > 12) return null
  return round1(loadKg * (1 + total / 30))
}

export const round1 = (n: number) => Math.round(n * 10) / 10

export function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY).toISOString()
}

export const totalWeeks = (phases: Phase[]) => phases.reduce((n, p) => n + Math.max(0, Math.round(p.weeks || 0)), 0)

/** Semana do ciclo (0 = primeira) em que cai uma data; negativa antes do início. */
export function weekIndexFor(startDate: string, date: string | Date): number {
  const diff = new Date(date).getTime() - new Date(startDate).getTime()
  return Math.floor(diff / (7 * DAY))
}

const lerp = (a: number | null | undefined, b: number | null | undefined, t: number): number | null => {
  if (a == null && b == null) return null
  const x = a ?? b!
  const y = b ?? a!
  return round1(x + (y - x) * t)
}

/**
 * Ganho/perda de peso esperado por semana (% do peso) pelo objetivo da fase.
 * Ganho: Aragon/Helms por nível; perda: 0,5–1%/sem (Helms 2014; Garthe 2011: mais lento preserva massa magra).
 */
export function weightRate(direction: 'gain' | 'loss' | 'maintain', level: Level): Band {
  if (direction === 'gain') {
    return level === 'beginner' ? { min: 0.25, max: 0.375 } : level === 'intermediate' ? { min: 0.125, max: 0.25 } : { min: 0, max: 0.125 }
  }
  if (direction === 'loss') return level === 'advanced' ? { min: -0.7, max: -0.5 } : { min: -1, max: -0.5 }
  return { min: -0.25, max: 0.25 }
}

/** Ganho de e1RM esperado por semana (%), por nível. Avançado ≈ 2–5% por mesociclo. */
export function strengthRate(level: Level): Band {
  return level === 'beginner' ? { min: 1, max: 2.5 } : level === 'intermediate' ? { min: 0.5, max: 1 } : { min: 0.25, max: 0.6 }
}

export function directionFor(goal: Goal, dietPhase?: DietPhase | null): 'gain' | 'loss' | 'maintain' {
  if (dietPhase === 'surplus') return 'gain'
  if (dietPhase === 'deficit') return 'loss'
  if (dietPhase === 'maintenance' || dietPhase === 'diet_break') return 'maintain'
  if (goal === 'hypertrophy') return 'gain'
  if (goal === 'fat_loss') return 'loss'
  return 'maintain'
}

const liftKey = (l: KeyLift) => String(l.exercise ?? l.name)

/** Monta as semanas do ciclo com o planejado e a faixa esperada (acumulada desde o baseline). */
export function buildWeeks(cycle: CycleInput): WeekPlan[] {
  const weeks: WeekPlan[] = []
  const baseWeight = cycle.baseline?.weightKg ?? null
  const lifts = (cycle.baseline?.lifts ?? []).filter((l) => (l.e1rm ?? 0) > 0)
  let wMin = baseWeight ?? 0
  let wMax = baseWeight ?? 0
  const liftBands = new Map(lifts.map((l) => [liftKey(l), { min: l.e1rm!, max: l.e1rm! }]))
  let index = 0

  cycle.phases.forEach((phase, phaseIndex) => {
    const n = Math.max(0, Math.round(phase.weeks || 0))
    const isDeloadPhase = phase.kind === 'deload' || phase.kind === 'transition'
    for (let w = 0; w < n; w++) {
      const t = n > 1 ? w / (n - 1) : 0
      const start = addDays(cycle.startDate, index * 7)

      // Peso: soma a faixa da semana (a semana 0 já tem uma semana de efeito)
      if (baseWeight) {
        const rate = weightRate(directionFor(cycle.goal, phase.dietPhase), cycle.level)
        wMin = wMin + (baseWeight * rate.min) / 100
        wMax = wMax + (baseWeight * rate.max) / 100
      }
      // Força: deload/transição mantém; nas outras fases soma a faixa do nível
      for (const l of lifts) {
        const b = liftBands.get(liftKey(l))!
        if (isDeloadPhase) {
          liftBands.set(liftKey(l), { min: round1(b.min * 0.98), max: b.max })
        } else {
          const r = strengthRate(cycle.level)
          liftBands.set(liftKey(l), { min: b.min + (l.e1rm! * r.min) / 100, max: b.max + (l.e1rm! * r.max) / 100 })
        }
      }

      weeks.push({
        index,
        phaseIndex,
        phaseName: phase.name || PHASE_LABEL[phase.kind],
        phaseKind: phase.kind,
        weekInPhase: w,
        startDate: start,
        endDate: addDays(start, 7),
        isDeload: isDeloadPhase,
        planned: {
          sessions: Math.max(0, Math.round(cycle.sessionsPerWeek ?? 0)),
          setsPerMuscle: lerp(phase.setsStart, phase.setsEnd, t),
          rir: lerp(phase.rirStart, phase.rirEnd, t),
          intensity:
            phase.intensityMin != null || phase.intensityMax != null
              ? { min: phase.intensityMin ?? phase.intensityMax!, max: phase.intensityMax ?? phase.intensityMin! }
              : null,
          repRange: phase.repRange ?? null,
          cardioMin: phase.cardioMin ?? null,
          dietPhase: phase.dietPhase ?? null,
          kcalDelta: phase.kcalDelta ?? null,
        },
        expected: {
          weightKg: baseWeight ? { min: round1(Math.min(wMin, wMax)), max: round1(Math.max(wMin, wMax)) } : null,
          lifts: lifts.map((l) => {
            const b = liftBands.get(liftKey(l))!
            return { key: liftKey(l), name: l.name, e1rm: { min: round1(b.min), max: round1(b.max) } }
          }),
          minAdherence: MIN_ADHERENCE,
        },
      })
      index++
    }
  })
  return weeks
}

export const PHASE_LABEL: Record<PhaseKind, string> = {
  adaptation: 'Adaptação',
  accumulation: 'Acumulação',
  hypertrophy: 'Hipertrofia',
  strength: 'Força',
  intensification: 'Intensificação',
  power: 'Potência',
  realization: 'Realização (pico)',
  deload: 'Deload',
  transition: 'Transição',
  cutting: 'Definição',
}

// ---------- Realizado na semana ----------

export type LogSet = { reps?: number | null; loadKg?: number | null; rir?: number | null; done?: boolean | null }
export type LogExercise = {
  exercise?: string | number | null
  name: string
  muscleGroup?: string | null
  sets?: LogSet[] | null
}
export type LogInput = {
  performedAt: string
  status?: string | null
  durationMin?: number | null
  sessionRpe?: number | null
  exercises?: LogExercise[] | null
}
export type MetricInput = { date: string; weightKg?: number | null; waistCm?: number | null }
export type CheckinInput = {
  date: string
  sleep?: number | null
  energy?: number | null
  soreness?: number | null
  stress?: number | null
  dietAdherence?: number | null
}

export type WeekActual = {
  sessionsDone: number
  adherence: number | null
  hardSetsByGroup: Record<string, number>
  tonnage: number
  bestE1rm: Record<string, number>
  weightAvg: number | null
  weightTrend: number | null
  waistAvg: number | null
  sessionLoad: number
  checkin: Omit<CheckinInput, 'date'> | null
  hasData: boolean
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

/** Média móvel exponencial do peso até a data (α diário ≈ 0,1): ignora água e sódio do dia. */
export function weightTrend(metrics: MetricInput[], until: string, alpha = 0.1): number | null {
  const pts = metrics
    .filter((m) => (m.weightKg ?? 0) > 0 && new Date(m.date) < new Date(until))
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!pts.length) return null
  let ema = pts[0].weightKg!
  let last = new Date(pts[0].date).getTime()
  for (const p of pts.slice(1)) {
    const days = Math.max(1, Math.round((new Date(p.date).getTime() - last) / DAY))
    const a = 1 - Math.pow(1 - alpha, days)
    ema = ema + a * (p.weightKg! - ema)
    last = new Date(p.date).getTime()
  }
  return round1(ema)
}

export function computeActual(args: {
  week: Pick<WeekPlan, 'startDate' | 'endDate' | 'planned'>
  logs: LogInput[]
  metrics: MetricInput[]
  checkins: CheckinInput[]
  keyLifts: KeyLift[]
}): WeekActual {
  const { week } = args
  const inWeek = (d: string) => d >= week.startDate && d < week.endDate
  const logs = args.logs.filter((l) => inWeek(l.performedAt) && l.status !== 'skipped')

  const hardSetsByGroup: Record<string, number> = {}
  const bestE1rm: Record<string, number> = {}
  let tonnage = 0
  let sessionLoad = 0
  const keyOf = new Map<string, string>()
  for (const k of args.keyLifts) {
    if (k.exercise != null) keyOf.set(`id:${k.exercise}`, liftKey(k))
    keyOf.set(`name:${k.name.trim().toLowerCase()}`, liftKey(k))
  }

  for (const log of logs) {
    if (log.sessionRpe && log.durationMin) sessionLoad += log.sessionRpe * log.durationMin
    for (const ex of log.exercises ?? []) {
      const key =
        (ex.exercise != null && keyOf.get(`id:${ex.exercise}`)) || keyOf.get(`name:${ex.name.trim().toLowerCase()}`)
      for (const s of ex.sets ?? []) {
        if (s.done === false) continue
        const reps = s.reps ?? 0
        const load = s.loadKg ?? 0
        tonnage += reps * load
        // Série dura: até 4 repetições em reserva (sem RIR informado conta como dura)
        if (ex.muscleGroup && (s.rir == null || s.rir <= 4) && reps > 0) {
          hardSetsByGroup[ex.muscleGroup] = (hardSetsByGroup[ex.muscleGroup] ?? 0) + 1
        }
        if (key) {
          const est = e1rm(load, reps, s.rir ?? 0)
          if (est && est > (bestE1rm[key] ?? 0)) bestE1rm[key] = est
        }
      }
    }
  }

  const weekMetrics = args.metrics.filter((m) => inWeek(m.date))
  const weights = weekMetrics.map((m) => m.weightKg).filter((n): n is number => (n ?? 0) > 0)
  const waists = weekMetrics.map((m) => m.waistCm).filter((n): n is number => (n ?? 0) > 0)
  const checkins = args.checkins.filter((c) => inWeek(c.date)).sort((a, b) => b.date.localeCompare(a.date))
  const planned = week.planned.sessions

  const actual: WeekActual = {
    sessionsDone: logs.length,
    adherence: planned > 0 ? round1(Math.min(1, logs.length / planned) * 100) / 100 : null,
    hardSetsByGroup,
    tonnage: Math.round(tonnage),
    bestE1rm,
    weightAvg: weights.length ? round1(mean(weights)!) : null,
    weightTrend: weightTrend(args.metrics, week.endDate),
    waistAvg: waists.length ? round1(mean(waists)!) : null,
    sessionLoad: Math.round(sessionLoad),
    checkin: checkins[0]
      ? {
          sleep: checkins[0].sleep ?? null,
          energy: checkins[0].energy ?? null,
          soreness: checkins[0].soreness ?? null,
          stress: checkins[0].stress ?? null,
          dietAdherence: checkins[0].dietAdherence ?? null,
        }
      : null,
    hasData: false,
  }
  actual.hasData = logs.length > 0 || weights.length > 0 || checkins.length > 0
  return actual
}

// ---------- Classificação e sugestões ----------

export type WeekStatus = 'on_track' | 'behind' | 'ahead' | 'attention' | 'no_data'
export type Reason = { metric: 'weight' | 'lift' | 'adherence' | 'recovery'; detail: string }

export type ClassifiedWeek = { status: WeekStatus; reasons: Reason[]; weightPosition: 'below' | 'within' | 'above' | null }

const position = (v: number | null, b: Band | null): 'below' | 'within' | 'above' | null => {
  if (v == null || !b) return null
  if (v < b.min) return 'below'
  if (v > b.max) return 'above'
  return 'within'
}

export function classifyWeek(goal: Goal, plan: WeekPlan, actual: WeekActual): ClassifiedWeek {
  if (!actual.hasData) return { status: 'no_data', reasons: [], weightPosition: null }
  const reasons: Reason[] = []
  const dir = directionFor(goal, plan.planned.dietPhase)
  const weight = actual.weightTrend ?? actual.weightAvg
  const wp = position(weight, plan.expected.weightKg)

  let behind = false
  let ahead = false
  if (wp === 'below') {
    if (dir === 'gain' || dir === 'maintain') {
      behind = true
      reasons.push({ metric: 'weight', detail: 'Peso abaixo da faixa esperada' })
    } else {
      ahead = true
      reasons.push({ metric: 'weight', detail: 'Perdendo peso mais rápido que o esperado' })
    }
  } else if (wp === 'above') {
    if (dir === 'loss' || dir === 'maintain') {
      behind = true
      reasons.push({ metric: 'weight', detail: 'Peso acima da faixa esperada' })
    } else {
      ahead = true
      reasons.push({ metric: 'weight', detail: 'Ganhando peso mais rápido que o esperado' })
    }
  }

  for (const lift of plan.expected.lifts) {
    const v = actual.bestE1rm[lift.key]
    const p = position(v ?? null, lift.e1rm)
    if (p === 'below') {
      behind = true
      reasons.push({ metric: 'lift', detail: `${lift.name}: força abaixo da faixa` })
    } else if (p === 'above') {
      ahead = true
      reasons.push({ metric: 'lift', detail: `${lift.name}: acima do esperado` })
    }
  }

  const lowAdherence = actual.adherence != null && actual.adherence < plan.expected.minAdherence
  const poorRecovery = (actual.checkin?.sleep ?? 5) <= 2 || (actual.checkin?.energy ?? 5) <= 2
  if (lowAdherence) reasons.push({ metric: 'adherence', detail: 'Aderência abaixo de 85% das sessões' })
  if (poorRecovery) reasons.push({ metric: 'recovery', detail: 'Sono ou energia baixos no check-in' })

  const status: WeekStatus = lowAdherence || poorRecovery ? 'attention' : behind ? 'behind' : ahead ? 'ahead' : 'on_track'
  return { status, reasons, weightPosition: wp }
}

export type Suggestion = {
  id: string
  kind: 'kcal_up' | 'kcal_down' | 'slow_loss' | 'deload' | 'volume_gap' | 'adherence' | 'phase_end'
  audience: 'nutrition' | 'training' | 'both'
  message: string
  status: 'pending' | 'accepted' | 'dismissed'
}

type WeekState = { plan: WeekPlan; actual: WeekActual; classified: ClassifiedWeek }

/** Regras de ajuste (sempre sugestões). Usa a semana atual e a anterior. */
export function suggest(goal: Goal, weeks: WeekState[], current: number, totalInPhase: number): Suggestion[] {
  const now = weeks.find((w) => w.plan.index === current)
  if (!now) return []
  const prev = weeks.find((w) => w.plan.index === current - 1)
  const out: Suggestion[] = []
  const add = (s: Omit<Suggestion, 'id' | 'status'>) => out.push({ ...s, id: `${s.kind}-w${current}`, status: 'pending' })
  const dir = directionFor(goal, now.plan.planned.dietPhase)
  const both = (pos: 'below' | 'above') => now.classified.weightPosition === pos && prev?.classified.weightPosition === pos

  if (dir === 'gain' && both('below')) add({ kind: 'kcal_up', audience: 'nutrition', message: 'Peso abaixo da faixa há 2 semanas: aumentar 150–250 kcal/dia.' })
  if (dir === 'loss' && both('above')) add({ kind: 'kcal_down', audience: 'both', message: 'Perda mais lenta que o esperado há 2 semanas: reduzir 150–250 kcal/dia ou somar 1 sessão de cardio.' })
  if (dir === 'loss' && both('below')) {
    const fast = (now.actual.weightTrend ?? 0) && (prev?.actual.weightTrend ?? 0) && now.actual.weightTrend! < prev!.actual.weightTrend! * 0.99
    if (fast) add({ kind: 'slow_loss', audience: 'nutrition', message: 'Perdendo mais de 1% do peso por semana: aumentar ~150 kcal/dia para preservar massa magra.' })
  }

  const liftsDown = (w?: WeekState) => !!w && w.classified.reasons.some((r) => r.metric === 'lift' && r.detail.includes('abaixo'))
  const tired = (now.actual.checkin?.sleep ?? 5) <= 2 || (now.actual.checkin?.energy ?? 5) <= 2
  if (!now.plan.isDeload && liftsDown(now) && liftsDown(prev) && tired) {
    add({ kind: 'deload', audience: 'training', message: 'Força parada ou caindo há 2 semanas e recuperação ruim: antecipar o deload.' })
  }

  const target = now.plan.planned.setsPerMuscle
  if (target && now.actual.hasData) {
    const behindGroups = Object.entries(now.actual.hardSetsByGroup)
      .filter(([, n]) => n < target * 0.7)
      .map(([g]) => g)
    if (behindGroups.length) add({ kind: 'volume_gap', audience: 'training', message: `Séries duras abaixo do planejado em: ${behindGroups.join(', ')}.` })
  }

  if (now.actual.adherence != null && now.actual.adherence < MIN_ADHERENCE) {
    add({ kind: 'adherence', audience: 'both', message: 'Aderência abaixo de 85%: simplificar o plano (menos sessões) antes de mexer em carga ou calorias.' })
  }

  if (now.plan.weekInPhase === totalInPhase - 1) {
    add({ kind: 'phase_end', audience: 'both', message: `Fim da fase ${now.plan.phaseName}: revise os resultados e confirme a próxima fase.` })
  }
  return out
}

/** Mantém o que a pessoa já decidiu (aceitar/descartar) quando a sugestão é recalculada. */
export function mergeSuggestions(previous: Suggestion[] | null | undefined, next: Suggestion[]): Suggestion[] {
  const byId = new Map((previous ?? []).map((s) => [s.id, s]))
  return next.map((s) => (byId.get(s.id) ? { ...s, status: byId.get(s.id)!.status } : s))
}
