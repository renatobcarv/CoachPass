import {
  ANAMNESES_API,
  ASSESSMENTS_API,
  MEAL_PLANS_API,
  ME_EXPORT_API,
  PROFESSIONAL_LINKS_API,
  RESTRICTIONS_API,
  SESSIONS_API,
  STUDENT_PROFILES_API,
  USERS_API,
  WORKOUTS_API,
  WORKOUT_LOGS_API,
  TRANSACTIONS_API,
  deleteJson,
  getJson,
  patchJson,
  postJson,
  qs,
} from '@/lib/cms'
import { toNumericRelationId } from '@/access/relationIds'
import {
  type MealPlanDoc,
  type StudentProfile,
  type WorkoutDoc,
  type WorkoutLogDoc,
  relId,
  relName,
} from './studentApi'

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export const WEEKDAYS: { id: Weekday; label: string; short: string }[] = [
  { id: 'monday', label: 'Segunda', short: 'Seg' },
  { id: 'tuesday', label: 'Terça', short: 'Ter' },
  { id: 'wednesday', label: 'Quarta', short: 'Qua' },
  { id: 'thursday', label: 'Quinta', short: 'Qui' },
  { id: 'friday', label: 'Sexta', short: 'Sex' },
  { id: 'saturday', label: 'Sábado', short: 'Sáb' },
  { id: 'sunday', label: 'Domingo', short: 'Dom' },
]

export type LinkedPerson = {
  userId: string
  linkId: string
  name: string
  email: string
  status: 'active' | 'pending'
  avatar: string
}

type ListResponse<T> = { docs: T[]; totalDocs: number }

type LinkDoc = {
  id: string
  status: 'pending' | 'active' | 'revoked'
  student:
    | string
    | {
        id: string | number
        name?: string
        email?: string
      }
}

export type AssessmentDoc = {
  id: string
  kind: 'physical' | 'consultation'
  student: string | { id: string | number; name?: string }
  professional?: string | { id: string | number; name?: string }
  date: string
  weightKg?: number | null
  bodyFatPercent?: number | null
  muscleMassKg?: number | null
  visceralFat?: number | null
  bmr?: number | null
  hydrationPercent?: number | null
  circumferences?: {
    chest?: number | null
    waist?: number | null
    hip?: number | null
    arm?: number | null
    thigh?: number | null
  }
  restingHeartRate?: number | null
  bloodPressure?: string | null
  adherenceScore?: number | null
  energyScore?: number | null
  sleepScore?: number | null
  parq?: unknown
  notes?: string | null
  nextDate?: string | null
}

export type SessionDoc = {
  id: string
  student: string | { id: string | number; name?: string }
  date: string
  time?: string | null
  durationMin?: number | null
  type: 'training' | 'assessment' | 'consultation' | 'followup'
  location?: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string | null
}

export type RestrictionDoc = {
  id: string
  student: string | { id: string | number; name?: string }
  type: 'injury' | 'medical' | 'dietary' | 'other'
  title: string
  description?: string | null
  severity: 'low' | 'moderate' | 'high'
  startDate?: string | null
  endDate?: string | null
  medicalClearance?: boolean | null
  active?: boolean | null
  notes?: string | null
}

export type AnamneseDoc = {
  id: string
  student: string | { id: string | number; name?: string }
  answers?: unknown
  status: 'draft' | 'completed'
  completedAt?: string | null
}

export type ProfessionalUser = {
  id: string
  name?: string | null
  email?: string
  bio?: string | null
  specialties?: { value: string }[] | null
  avatarUrl?: string | null
  city?: string | null
  instagram?: string | null
  whatsapp?: string | null
  professionalId?: string | null
  passwordChangedAt?: string | null
  preferences?: Record<string, unknown> | null
}

function avatarFor(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`
}

export function mapLinkedPerson(doc: LinkDoc): LinkedPerson | null {
  if (doc.status !== 'active' && doc.status !== 'pending') return null
  const userId = relId(doc.student)
  if (!userId) return null
  const name = relName(doc.student, 'Aluno')
  const email = typeof doc.student === 'object' && doc.student ? doc.student.email || '' : ''
  return {
    userId,
    linkId: String(doc.id),
    name,
    email,
    status: doc.status,
    avatar: avatarFor(name),
  }
}

export async function fetchLinkedPeople(
  professionalId: string,
  role: 'personal' | 'nutritionist',
  token: string,
  status: 'active' | 'pending' | 'both' = 'both',
): Promise<LinkedPerson[]> {
  const params: Record<string, string | number> = {
    'where[and][0][professional][equals]': professionalId,
    'where[and][1][professionalRole][equals]': role,
    depth: 1,
    limit: 100,
    sort: '-updatedAt',
  }
  if (status === 'both') {
    params['where[and][2][or][0][status][equals]'] = 'pending'
    params['where[and][2][or][1][status][equals]'] = 'active'
  } else {
    params['where[and][2][status][equals]'] = status
  }
  const data = await getJson<ListResponse<LinkDoc>>(`${PROFESSIONAL_LINKS_API}${qs(params)}`, token)
  return data.docs.map(mapLinkedPerson).filter((row): row is LinkedPerson => Boolean(row))
}

export async function revokeLink(linkId: string, token: string): Promise<void> {
  await patchJson(`${PROFESSIONAL_LINKS_API}/${linkId}`, { status: 'revoked' }, token)
}

export async function fetchStudentProfileByUser(
  userId: string,
  token: string,
): Promise<StudentProfile | null> {
  const data = await getJson<ListResponse<StudentProfile>>(
    `${STUDENT_PROFILES_API}${qs({
      'where[user][equals]': userId,
      limit: 1,
      depth: 0,
    })}`,
    token,
  )
  return data.docs[0] ?? null
}

export async function fetchUserById(userId: string, token: string): Promise<ProfessionalUser> {
  return getJson<ProfessionalUser>(`${USERS_API}/${userId}`, token)
}

export async function fetchMeUser(token: string): Promise<ProfessionalUser | null> {
  const data = await getJson<{ user: ProfessionalUser | null }>(`${USERS_API}/me`, token)
  return data.user
}

export async function patchCurrentUser(
  userId: string,
  body: Record<string, unknown>,
  token: string,
): Promise<ProfessionalUser> {
  return patchJson<ProfessionalUser>(`${USERS_API}/${userId}`, body, token)
}

function withNumericRelations(
  body: Record<string, unknown>,
  fields: readonly string[],
): Record<string, unknown> {
  const next = { ...body }
  for (const field of fields) {
    const id = toNumericRelationId(next[field])
    if (id !== null) next[field] = id
  }
  return next
}

export async function createWorkout(
  input: {
    student: string
    title: string
    weekday?: Weekday | null
    observations?: string | null
    splitLabel?: string | null
    status?: 'draft' | 'published'
    exercises: WorkoutDoc['exercises']
  },
  token: string,
): Promise<WorkoutDoc> {
  return postJson<WorkoutDoc>(
    WORKOUTS_API,
    {
      student: toNumericRelationId(input.student) ?? input.student,
      title: input.title,
      weekday: input.weekday || undefined,
      observations: input.observations || undefined,
      splitLabel: input.splitLabel || undefined,
      status: input.status || 'published',
      source: 'professional',
      publishedAt: (input.status || 'published') === 'published' ? new Date().toISOString() : undefined,
      exercises: input.exercises,
    },
    token,
  )
}

export async function fetchWorkoutById(id: string, token: string): Promise<WorkoutDoc> {
  return getJson<WorkoutDoc>(`${WORKOUTS_API}/${id}?depth=1`, token)
}

export async function updateWorkout(
  id: string,
  input: {
    title: string
    weekday?: Weekday | null
    observations?: string | null
    splitLabel?: string | null
    status?: 'draft' | 'published'
    exercises: WorkoutDoc['exercises']
  },
  token: string,
): Promise<WorkoutDoc> {
  return patchJson<WorkoutDoc>(
    `${WORKOUTS_API}/${id}`,
    {
      title: input.title,
      weekday: input.weekday || undefined,
      observations: input.observations || undefined,
      splitLabel: input.splitLabel || undefined,
      status: input.status || 'published',
      publishedAt: (input.status || 'published') === 'published' ? new Date().toISOString() : undefined,
      exercises: input.exercises,
    },
    token,
  )
}

export async function fetchWorkoutsForStudent(studentId: string, token: string): Promise<WorkoutDoc[]> {
  const data = await getJson<ListResponse<WorkoutDoc>>(
    `${WORKOUTS_API}${qs({
      'where[student][equals]': studentId,
      depth: 1,
      limit: 50,
      sort: '-updatedAt',
    })}`,
    token,
  )
  return data.docs
}

export async function createMealPlan(
  input: {
    student: string
    title: string
    observations?: string | null
    status?: 'draft' | 'published'
    meals: MealPlanDoc['meals']
  },
  token: string,
): Promise<MealPlanDoc> {
  return postJson<MealPlanDoc>(
    MEAL_PLANS_API,
    {
      student: toNumericRelationId(input.student) ?? input.student,
      title: input.title,
      observations: input.observations || undefined,
      status: input.status || 'published',
      source: 'professional',
      publishedAt: (input.status || 'published') === 'published' ? new Date().toISOString() : undefined,
      meals: input.meals,
    },
    token,
  )
}

export async function fetchMealPlanById(id: string, token: string): Promise<MealPlanDoc> {
  return getJson<MealPlanDoc>(`${MEAL_PLANS_API}/${id}?depth=1`, token)
}

export async function updateMealPlan(
  id: string,
  input: {
    title: string
    observations?: string | null
    status?: 'draft' | 'published'
    meals: MealPlanDoc['meals']
  },
  token: string,
): Promise<MealPlanDoc> {
  return patchJson<MealPlanDoc>(
    `${MEAL_PLANS_API}/${id}`,
    {
      title: input.title,
      observations: input.observations || undefined,
      status: input.status || 'published',
      publishedAt: (input.status || 'published') === 'published' ? new Date().toISOString() : undefined,
      meals: input.meals,
    },
    token,
  )
}

export async function fetchMealPlansForStudent(studentId: string, token: string): Promise<MealPlanDoc[]> {
  const data = await getJson<ListResponse<MealPlanDoc>>(
    `${MEAL_PLANS_API}${qs({
      'where[student][equals]': studentId,
      depth: 1,
      limit: 50,
      sort: '-updatedAt',
    })}`,
    token,
  )
  return data.docs
}

export async function fetchAssessmentsForStudent(
  studentId: string,
  token: string,
  kind?: 'physical' | 'consultation',
): Promise<AssessmentDoc[]> {
  const params: Record<string, string | number> = {
    'where[and][0][student][equals]': studentId,
    depth: 1,
    limit: 50,
    sort: '-date',
  }
  if (kind) params['where[and][1][kind][equals]'] = kind
  const data = await getJson<ListResponse<AssessmentDoc>>(`${ASSESSMENTS_API}${qs(params)}`, token)
  return data.docs
}

export async function createAssessment(
  input: Record<string, unknown>,
  token: string,
): Promise<AssessmentDoc> {
  return postJson<AssessmentDoc>(ASSESSMENTS_API, withNumericRelations(input, ['student']), token)
}

export async function fetchSessions(professionalId: string, token: string): Promise<SessionDoc[]> {
  const data = await getJson<ListResponse<SessionDoc>>(
    `${SESSIONS_API}${qs({
      'where[professional][equals]': professionalId,
      depth: 1,
      limit: 100,
      sort: 'date',
    })}`,
    token,
  )
  return data.docs
}

export async function createSession(input: Record<string, unknown>, token: string): Promise<SessionDoc> {
  return postJson<SessionDoc>(SESSIONS_API, withNumericRelations(input, ['student']), token)
}

export async function updateSession(
  id: string,
  input: Record<string, unknown>,
  token: string,
): Promise<SessionDoc> {
  return patchJson<SessionDoc>(`${SESSIONS_API}/${id}`, input, token)
}

export async function fetchRestrictionsForStudent(studentId: string, token: string): Promise<RestrictionDoc[]> {
  const data = await getJson<ListResponse<RestrictionDoc>>(
    `${RESTRICTIONS_API}${qs({
      'where[student][equals]': studentId,
      depth: 0,
      limit: 50,
      sort: '-updatedAt',
    })}`,
    token,
  )
  return data.docs
}

export async function createRestriction(
  input: Record<string, unknown>,
  token: string,
): Promise<RestrictionDoc> {
  return postJson<RestrictionDoc>(RESTRICTIONS_API, withNumericRelations(input, ['student']), token)
}

export async function fetchAnamnesesForStudent(studentId: string, token: string): Promise<AnamneseDoc[]> {
  const data = await getJson<ListResponse<AnamneseDoc>>(
    `${ANAMNESES_API}${qs({
      'where[student][equals]': studentId,
      depth: 0,
      limit: 20,
      sort: '-updatedAt',
    })}`,
    token,
  )
  return data.docs
}

export async function createAnamnese(input: Record<string, unknown>, token: string): Promise<AnamneseDoc> {
  return postJson<AnamneseDoc>(ANAMNESES_API, withNumericRelations(input, ['student']), token)
}

export async function updateAnamnese(
  id: string,
  input: Record<string, unknown>,
  token: string,
): Promise<AnamneseDoc> {
  return patchJson<AnamneseDoc>(`${ANAMNESES_API}/${id}`, withNumericRelations(input, ['student']), token)
}

export type TransactionDoc = {
  id: string
  student: string | { id: string | number; name?: string }
  description: string
  amount: number
  kind: 'charge' | 'payment' | 'expense'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate?: string | null
  paidAt?: string | null
  notes?: string | null
}

export async function fetchTransactions(token: string): Promise<TransactionDoc[]> {
  const data = await getJson<ListResponse<TransactionDoc>>(
    `${TRANSACTIONS_API}${qs({ depth: 1, limit: 80, sort: '-dueDate' })}`,
    token,
  )
  return data.docs
}

export async function createTransaction(
  input: {
    student: string
    description: string
    amount: number
    kind?: TransactionDoc['kind']
    status?: TransactionDoc['status']
    dueDate?: string
    notes?: string
  },
  token: string,
): Promise<TransactionDoc> {
  return postJson<TransactionDoc>(TRANSACTIONS_API, {
    ...input,
    student: toNumericRelationId(input.student) ?? input.student,
  }, token)
}

export async function updateTransaction(
  id: string,
  input: Partial<Pick<TransactionDoc, 'status' | 'notes' | 'paidAt'>>,
  token: string,
): Promise<TransactionDoc> {
  return patchJson<TransactionDoc>(`${TRANSACTIONS_API}/${id}`, input, token)
}

export async function fetchWorkoutLogsForStudent(studentId: string, token: string) {
  const data = await getJson<ListResponse<WorkoutLogDoc>>(
    `${WORKOUT_LOGS_API}${qs({
      'where[student][equals]': studentId,
      depth: 1,
      limit: 30,
      sort: '-performedAt',
    })}`,
    token,
  )
  return data.docs
}

export { fetchFoods } from './studentApi'

export async function exportMyData(token: string): Promise<unknown> {
  return getJson<unknown>(ME_EXPORT_API, token)
}

export async function deleteCurrentUser(userId: string, token: string): Promise<void> {
  await deleteJson(`${USERS_API}/${userId}`, token)
}

export { relId, relName }
