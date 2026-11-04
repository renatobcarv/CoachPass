import { CMS_BASE_URL, deleteJson, getJson, patchJson, postJson } from '@/lib/cms'
import type { PlanCompare, PrEvent, Records, VolumeGroup, WeeklyPoint, WeightPoint } from '@/lib/performance/analytics'
import type { ProgressionSuggestion } from '@/lib/performance/progression'
import type { Phase, Suggestion } from '@/lib/periodization/calc'

const API = `${CMS_BASE_URL}/api`
const qs = (p: Record<string, string | number | null | undefined>) => {
  const e = Object.entries(p).filter(([, v]) => v !== null && v !== undefined && v !== '')
  return e.length ? `?${new URLSearchParams(e.map(([k, v]) => [k, String(v)])).toString()}` : ''
}

// ---------- Tipos das respostas ----------

export type CycleListItem = { id: number; title: string; status: string; startDate: string; totalWeeks: number | null; goal: string }

export type CycleWeekView = {
  id: number
  index: number
  phaseName: string
  isDeload: boolean
  status: 'on_track' | 'behind' | 'ahead' | 'attention' | 'no_data' | 'upcoming'
  startDate: string
  planned: { sessions: number; setsPerMuscle: number | null; rir: number | null; intensity: { min: number; max: number } | null; repRange: string | null; cardioMin: number | null; dietPhase: string | null; kcalDelta: number | null } | null
  expected: { weightKg: { min: number; max: number } | null; lifts: Array<{ key: string; name: string; e1rm: { min: number; max: number } }>; minAdherence: number } | null
  actual: {
    sessionsDone: number
    adherence: number | null
    tonnage: number
    bestE1rm: Record<string, number>
    weightAvg: number | null
    weightTrend: number | null
    hardSetsByGroup: Record<string, number>
    checkin: Record<string, number | null> | null
    hasData: boolean
  } | null
  suggestions: Suggestion[]
  reasons?: Array<{ metric: string; detail: string }>
  coachNote?: string | null
}

export type MainLiftView = {
  lift: 'squat' | 'bench' | 'deadlift'
  label: string
  key: string | null
  name: string | null
  sessions: number
  last: { date: string; topLoad: number | null; topLoadReps: number | null; bestE1rm: number | null } | null
  records: Records
  weekly: WeeklyPoint[]
  lastCompare: PlanCompare | null
}

export type Overview = {
  student: { id: number; name: string | null }
  isSelf: boolean
  cycles: CycleListItem[]
  activeCycle: {
    id: number
    title: string
    goal: string
    startDate: string
    totalWeeks: number
    currentWeek: number
    phaseName: string | null
    isDeload: boolean
    sessionsDone: number
    sessionsPlanned: number
    adherence: number | null
    weeks: CycleWeekView[]
  } | null
  totals: { sessions: number }
  mainLifts: MainLiftView[]
  volume: {
    weeks: Array<{ week: string; groups: Record<string, { direct: number; indirect: number; frequency: number }> }>
    thisWeek: Array<{ group: VolumeGroup; direct: number; indirect: number; frequency: number; exercises: string[] }>
    plannedPerGroup: number | null
    method: string
  }
  tonnage: Array<{ week: string; sessions: number; tonnage: number }>
  body: {
    weight: WeightPoint[]
    measures: Record<string, { first: { date: string; value: number } | null; last: { date: string; value: number } | null; points: Array<{ date: string; value: number }> }>
    bodyFat: Array<{ date: string; value: number; method: string | null }>
    photos: Array<{ date: string; photos: Array<{ url: string; angle: string | null }> }>
  }
  recovery: Array<Record<string, number | string | null>>
  prTimeline: Array<PrEvent & { exercise: string; key: string }>
  exercises: Array<{ key: string; name: string; sessions: number }>
  alerts: string[]
}

export type SessionPlanExercise = {
  exercise: number | null
  key: string
  name: string
  muscleGroup: string | null
  notes: string | null
  image: string | null
  planned: { sets: number | null; reps: string | null; loadKg: number | null; rir: number | null; rpe: number | null; restSec: number | null }
  repRange: { min: number | null; max: number | null }
  isMainLift: boolean
  last: { date: string; sets: Array<{ reps: number | null; loadKg: number | null; rir: number | null }>; topLoad: number | null; bestE1rm: number | null } | null
  suggestion: ProgressionSuggestion
}

export type SessionPlan = {
  workout: { id: number; title: string; splitLabel: string | null; observations: string | null }
  exercises: SessionPlanExercise[]
}

export type ExerciseHistoryView = {
  key: string
  name: string
  mainLift: string | null
  sessions: Array<{
    date: string
    sets: Array<{ reps: number | null; loadKg: number | null; rir: number | null; rpe: number | null; restSec: number | null }>
    topLoad: number | null
    topLoadReps: number | null
    bestE1rm: number | null
    volume: number
    avgRir: number | null
    compare: PlanCompare | null
    notes: string | null
    change: string | null
  }>
  records: Records
  weekly: WeeklyPoint[]
  suggestion: ProgressionSuggestion
}

export type CycleDoc = {
  id: number
  title: string
  student: number | { id: number; name?: string }
  coach?: number | { id: number; name?: string } | null
  author?: number | { id: number } | null
  goal: string
  model: string
  level: string
  startDate: string
  sessionsPerWeek: number | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  baseline?: { weightKg?: number | null; bodyFatPercent?: number | null; waistCm?: number | null; lifts?: Array<{ exercise?: number | null; name: string; e1rm?: number | null }> | null } | null
  phases: Phase[]
  totalWeeks?: number | null
  notes?: string | null
}

export type CompareSummary = {
  id: number
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
  lifts: Array<{ lift: string; label: string; first: number | null; last: number | null; changePct: number | null }>
}

// ---------- Chamadas ----------

export const fetchOverview = (token: string, p: { studentId?: string | number | null; weeks?: number; cycleId?: number | null; group?: string | null } = {}) =>
  getJson<Overview>(`${API}/performance/overview${qs({ studentId: p.studentId, weeks: p.weeks, cycleId: p.cycleId, group: p.group })}`, token)

export const fetchExerciseHistory = (token: string, key: string, studentId?: string | number | null) =>
  getJson<ExerciseHistoryView>(`${API}/performance/exercise${qs({ key, studentId })}`, token)

export const fetchSessionPlan = (token: string, workoutId: string | number) =>
  getJson<SessionPlan>(`${API}/performance/session-plan${qs({ workoutId })}`, token)

export const fetchCompare = (token: string, ids: Array<number | string>, studentId?: string | number | null) =>
  getJson<{ cycles: CompareSummary[] }>(`${API}/performance/compare${qs({ ids: ids.join(','), studentId })}`, token)

type List<T> = { docs: T[]; totalDocs: number }

export const fetchCycles = (token: string, where: Record<string, string | number>) =>
  getJson<List<CycleDoc>>(`${API}/training-cycles${qs({ ...where, depth: 1, limit: 50, sort: '-startDate' })}`, token).then((r) => r.docs)

export const fetchCycle = (token: string, id: string | number) => getJson<CycleDoc>(`${API}/training-cycles/${id}?depth=1`, token)

export const fetchCycleWeeks = (token: string, cycleId: string | number) =>
  getJson<List<CycleWeekView>>(`${API}/cycle-weeks${qs({ 'where[cycle][equals]': cycleId, sort: 'index', limit: 60, depth: 0 })}`, token).then((r) => r.docs)

export const saveCycle = (token: string, data: Partial<CycleDoc> & Record<string, unknown>, id?: number | string | null) =>
  id
    ? patchJson<{ doc: CycleDoc }>(`${API}/training-cycles/${id}`, data, token).then((r) => r.doc)
    : postJson<{ doc: CycleDoc }>(`${API}/training-cycles`, data, token).then((r) => r.doc)

export const deleteCycle = (token: string, id: number | string) => deleteJson(`${API}/training-cycles/${id}`, token)

export const updateCycleWeek = (token: string, id: number | string, data: { coachNote?: string; suggestions?: Array<{ id: string; status: string }> }) =>
  patchJson(`${API}/cycle-weeks/${id}`, data, token)

export const refreshCycle = (token: string, cycleId: number | string) => postJson(`${API}/periodization/refresh`, { cycleId }, token)

export const proposeCycle = (
  token: string,
  body: { studentId?: string | number | null; goal: string; level: string; weeks: number; sessionsPerWeek: number },
) => postJson<{ provider: string; title: string; phases: Phase[]; sessionsPerWeek: number; note?: string }>(`${API}/ai/generate-cycle`, body, token)

export const createBodyMetric = (token: string, data: Record<string, unknown>) => postJson(`${API}/body-metrics`, data, token)
export const createCheckin = (token: string, data: Record<string, unknown>) => postJson(`${API}/weekly-checkins`, data, token)

export type LogPayload = {
  workout: number | string
  performedAt: string
  status: 'completed' | 'partial' | 'skipped'
  durationMin?: number | null
  sessionRpe?: number | null
  notes?: string | null
  exercises: Array<{
    exercise?: number | null
    name: string
    muscleGroup?: string | null
    planned?: Record<string, unknown> | null
    change?: 'none' | 'substituted' | 'added' | 'skipped'
    replacedName?: string | null
    notes?: string | null
    sets: Array<{ reps: number | null; loadKg: number | null; rir?: number | null; rpe?: number | null; restSec?: number | null; done: boolean }>
  }>
}
export const createWorkoutLogFull = (token: string, data: LogPayload) => postJson<{ doc: { id: number } }>(`${API}/workout-logs`, data, token)

export type ExerciseLite = {
  id: number
  name: string
  muscleGroup: string | null
  equipment: string | null
  level: string | null
  images?: Array<{ url: string }> | null
  primaryMuscles?: string[] | null
}
export const searchExercises = (token: string, p: { q?: string; group?: string | null; limit?: number }) => {
  const params: Record<string, string | number> = { limit: p.limit ?? 30, depth: 0, sort: 'name' }
  if (p.q?.trim()) params['where[or][0][name][like]'] = p.q.trim()
  if (p.q?.trim()) params['where[or][1][nameEn][like]'] = p.q.trim()
  if (p.group) params['where[muscleGroup][equals]'] = p.group
  return getJson<List<ExerciseLite>>(`${API}/exercises${qs(params)}`, token).then((r) => r.docs)
}

export type WorkoutInput = {
  title: string
  student?: number | string
  status?: 'draft' | 'published'
  weekday?: string | null
  splitLabel?: string | null
  observations?: string | null
  cycle?: number | null
  exercises: Array<{
    name: string
    exercise?: number | null
    muscle?: string | null
    sets?: number | null
    reps?: string | null
    loadKg?: number | null
    targetRir?: number | null
    restSec?: number | null
    notes?: string | null
  }>
}
export const saveWorkout = (token: string, data: WorkoutInput, id?: number | string | null) =>
  id
    ? patchJson<{ doc: { id: number } }>(`${API}/workouts/${id}`, data, token).then((r) => r.doc)
    : postJson<{ doc: { id: number } }>(`${API}/workouts`, data, token).then((r) => r.doc)

export const fetchStudentPlan = (token: string) =>
  getJson<{ studentPro: boolean; viaProfessional: boolean; billingEnabled: boolean; subscriptionStatus: string; paidUntil: string | null }>(
    `${API}/student/plan`,
    token,
  )
