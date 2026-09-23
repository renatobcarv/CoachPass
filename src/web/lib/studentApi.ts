import {
  STUDENT_PROFILES_API,
  PROFESSIONAL_LINKS_API,
  WORKOUTS_API,
  MEAL_PLANS_API,
  USERS_API,
  AI_GENERATE_WORKOUT_API,
  getJson,
  postJson,
  patchJson,
  qs,
} from '@/lib/cms'

export type StudentGoal = 'weight_loss' | 'hypertrophy'
export type StudentSex = 'male' | 'female' | 'other' | 'undisclosed'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type EquipmentAccess =
  | 'full_gym'
  | 'basic_gym'
  | 'home_weights'
  | 'bodyweight'
  | 'outdoor'

export type StudentProfile = {
  id: string
  user: string | { id: string | number; name?: string; email?: string }
  displayName: string
  phone: string
  birthDate: string
  heightCm: number
  weightKg: number
  sex: StudentSex
  goal: StudentGoal
  bodyFatPercent?: number | null
  experienceLevel?: ExperienceLevel | null
  trainingDaysPerWeek?: number | null
  sessionMinutes?: number | null
  equipmentAccess?: EquipmentAccess[] | null
  foodAllergies?: string | null
  dietaryRestrictions?: string | null
  medicalConditions?: string | null
  injuries?: string | null
  medications?: string | null
  onboardingCompleted?: boolean | null
  onboardingCompletedAt?: string | null
  updatedAt?: string
}

export type StudentProfileInput = {
  displayName: string
  phone: string
  birthDate: string
  heightCm: number
  weightKg: number
  sex: StudentSex
  goal: StudentGoal
  bodyFatPercent?: number | null
  experienceLevel?: ExperienceLevel | null
  trainingDaysPerWeek?: number | null
  sessionMinutes?: number | null
  equipmentAccess?: EquipmentAccess[] | null
  foodAllergies?: string | null
  dietaryRestrictions?: string | null
  medicalConditions?: string | null
  injuries?: string | null
  medications?: string | null
  onboardingCompleted?: boolean
}

export type ProfessionalLink = {
  id: string
  status: 'pending' | 'active' | 'revoked'
  professionalRole: 'personal' | 'nutritionist'
  professional:
    | string
    | {
        id: string | number
        name?: string
        email?: string
      }
  notes?: string | null
}

export type WorkoutDoc = {
  id: string
  title: string
  status: 'draft' | 'published'
  source: 'professional' | 'ai'
  observations?: string | null
  weekday?: string | null
  splitLabel?: string | null
  publishedAt?: string | null
  exercises?: Array<{
    id?: string
    name: string
    sets?: number | null
    reps?: string | null
    weight?: string | null
    rest?: string | null
    muscle?: string | null
    notes?: string | null
    instructions?: string | null
    youtubeUrl?: string | null
    muscleImage?: string | null
  }> | null
  author?: string | { id: string | number; name?: string } | null
}

export type MealPlanDoc = {
  id: string
  title: string
  status: 'draft' | 'published'
  source: 'professional' | 'ai'
  observations?: string | null
  isInformational?: boolean | null
  publishedAt?: string | null
  meals?: Array<{
    id?: string
    name: string
    time?: string | null
    calories?: number | null
    notes?: string | null
    items?: Array<{
      id?: string
      name: string
      quantity?: string | null
      calories?: number | null
    }> | null
  }> | null
  author?: string | { id: string | number; name?: string } | null
}

type ListResponse<T> = {
  docs: T[]
  totalDocs: number
}

function relId(value: unknown): string {
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return String(value ?? '')
}

export function relName(value: unknown, fallback = 'Profissional'): string {
  if (value && typeof value === 'object') {
    const v = value as { name?: string; email?: string }
    return v.name || v.email || fallback
  }
  return fallback
}

export async function fetchMyStudentProfile(
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

export async function createStudentProfile(
  input: StudentProfileInput,
  token: string,
): Promise<StudentProfile> {
  return postJson<StudentProfile>(STUDENT_PROFILES_API, input, token)
}

export async function updateStudentProfile(
  profileId: string,
  input: Partial<StudentProfileInput>,
  token: string,
): Promise<StudentProfile> {
  return patchJson<StudentProfile>(`${STUDENT_PROFILES_API}/${profileId}`, input, token)
}

export async function saveStudentProfile(
  userId: string,
  input: StudentProfileInput,
  token: string,
): Promise<StudentProfile> {
  const existing = await fetchMyStudentProfile(userId, token)
  const payload = {
    ...input,
    onboardingCompleted: input.onboardingCompleted ?? true,
    onboardingCompletedAt: new Date().toISOString(),
  }

  // Mantém whatsapp do user alinhado ao telefone do perfil.
  try {
    await patchJson(`${USERS_API}/${userId}`, {
      name: input.displayName,
      whatsapp: input.phone,
    }, token)
  } catch {
    /* não bloqueia o perfil se o patch do user falhar */
  }

  if (existing) {
    return updateStudentProfile(existing.id, payload, token)
  }
  return createStudentProfile(payload, token)
}

export async function fetchActiveProfessionalLinks(
  studentId: string,
  token: string,
): Promise<ProfessionalLink[]> {
  const data = await getJson<ListResponse<ProfessionalLink>>(
    `${PROFESSIONAL_LINKS_API}${qs({
      'where[and][0][student][equals]': studentId,
      'where[and][1][status][equals]': 'active',
      depth: 1,
      limit: 20,
    })}`,
    token,
  )
  return data.docs
}

export async function fetchPublishedWorkouts(
  studentId: string,
  token: string,
): Promise<WorkoutDoc[]> {
  const data = await getJson<ListResponse<WorkoutDoc>>(
    `${WORKOUTS_API}${qs({
      'where[and][0][student][equals]': studentId,
      'where[and][1][status][equals]': 'published',
      depth: 1,
      limit: 50,
      sort: '-publishedAt',
    })}`,
    token,
  )
  return data.docs
}

export async function fetchPublishedMealPlans(
  studentId: string,
  token: string,
): Promise<MealPlanDoc[]> {
  const data = await getJson<ListResponse<MealPlanDoc>>(
    `${MEAL_PLANS_API}${qs({
      'where[and][0][student][equals]': studentId,
      'where[and][1][status][equals]': 'published',
      depth: 1,
      limit: 50,
      sort: '-publishedAt',
    })}`,
    token,
  )
  return data.docs
}

export function ageFromBirthDate(birthDate: string): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

export function goalLabel(goal?: StudentGoal | null): string {
  if (goal === 'weight_loss') return 'Emagrecimento'
  if (goal === 'hypertrophy') return 'Hipertrofia'
  return '—'
}

export type AiQuota = {
  limit: number
  used: number
  remaining: number
  month: string
  blocked: boolean
}

export type GenerateWorkoutResult = {
  ok: true
  workoutIds: Array<string | number>
  titles: string[]
  count: number
  remaining: number
  provider: string
}

export async function fetchAiQuota(token: string): Promise<AiQuota> {
  return getJson<AiQuota>(AI_GENERATE_WORKOUT_API, token)
}

export async function generateWorkoutWithAi(token: string): Promise<GenerateWorkoutResult> {
  return postJson<GenerateWorkoutResult>(AI_GENERATE_WORKOUT_API, {}, token)
}

export { relId }
