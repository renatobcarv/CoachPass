import { MEAL_PLANS_API, PROFESSIONAL_LINKS_API, deleteJson, getJson, patchJson, postJson, qs } from '@/lib/cms'

/** Paciente vinculado à nutricionista (vínculo real em professional-links). */
export type NutriPatient = {
  id: string
  linkId: string
  name: string
  email: string
  status: 'active' | 'pending'
}

export type PlanItem = { id?: string; name: string; quantity?: string | null; calories?: number | null }
export type PlanMeal = {
  id?: string
  name: string
  time?: string | null
  calories?: number | null
  notes?: string | null
  items?: PlanItem[] | null
}
export type MealPlan = {
  id: string | number
  title: string
  student: string | number | { id: string | number }
  status: 'draft' | 'published'
  source: 'professional' | 'ai'
  observations?: string | null
  publishedAt?: string | null
  updatedAt?: string
  createdAt?: string
  meals?: PlanMeal[] | null
}

export type MealPlanInput = {
  title: string
  student?: string | number
  status: 'draft' | 'published'
  observations?: string
  meals: PlanMeal[]
}

type LinkDoc = {
  id: string | number
  status: 'pending' | 'active' | 'revoked'
  student: string | number | { id: string | number; name?: string; email?: string } | null
  studentInfo?: { name?: string | null; email?: string | null } | null
}

export const relId = (v: MealPlan['student']) => String(typeof v === 'object' && v ? v.id : v)
/** IDs do Postgres são numéricos; mantém string se não for número. */
const asId = (v: string | number) => (typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : v)

export async function fetchNutriPatients(userId: string | number, token: string): Promise<NutriPatient[]> {
  const data = await getJson<{ docs: LinkDoc[] }>(
    `${PROFESSIONAL_LINKS_API}${qs({
      'where[and][0][professional][equals]': userId,
      'where[and][1][professionalRole][equals]': 'nutritionist',
      'where[and][2][or][0][status][equals]': 'pending',
      'where[and][2][or][1][status][equals]': 'active',
      depth: 1,
      limit: 200,
      sort: '-updatedAt',
    })}`,
    token,
  )
  const out: NutriPatient[] = []
  for (const doc of data.docs) {
    if (doc.status !== 'active' && doc.status !== 'pending') continue
    const s = doc.student
    const id = typeof s === 'object' && s ? String(s.id) : String(s ?? '')
    if (!id) continue
    const obj = typeof s === 'object' && s ? s : null
    const email = obj?.email || doc.studentInfo?.email || ''
    const name = obj?.name || doc.studentInfo?.name || email || 'Paciente'
    if (out.some((p) => p.id === id)) continue
    out.push({ id, linkId: String(doc.id), name, email, status: doc.status })
  }
  return out
}

/** Todos os planos escritos por esta nutricionista (o backend já limita ao autor). */
export async function fetchMyMealPlans(userId: string | number, token: string): Promise<MealPlan[]> {
  const data = await getJson<{ docs: MealPlan[] }>(
    `${MEAL_PLANS_API}${qs({
      'where[author][equals]': userId,
      depth: 0,
      limit: 300,
      sort: '-updatedAt',
    })}`,
    token,
  )
  return data.docs
}

/** Igual a fetchMyMealPlans, mas não derruba a tela se os planos falharem. */
export async function fetchMealPlansSafe(userId: string | number, token: string) {
  try {
    return { plans: await fetchMyMealPlans(userId, token), error: null as string | null }
  } catch (err) {
    return { plans: [] as MealPlan[], error: err instanceof Error ? err.message : 'Falha ao carregar planos.' }
  }
}

export async function createMealPlan(input: MealPlanInput, token: string): Promise<MealPlan> {
  const res = await postJson<{ doc: MealPlan }>(
    MEAL_PLANS_API,
    { ...input, student: input.student != null ? asId(input.student) : undefined, source: 'professional' },
    token,
  )
  return res.doc
}

export async function updateMealPlan(id: string | number, input: Partial<MealPlanInput>, token: string): Promise<MealPlan> {
  const { student: _ignored, ...rest } = input
  const res = await patchJson<{ doc: MealPlan }>(`${MEAL_PLANS_API}/${id}`, rest, token)
  return res.doc
}

export async function deleteMealPlan(id: string | number, token: string): Promise<void> {
  await deleteJson(`${MEAL_PLANS_API}/${id}`, token)
}

// ── Ajustes de quantidade ──

/** "150g" → { n: 150, unit: 'g' }; "1 unidade" → { n: 1, unit: ' unidade' } */
export function parseQuantity(q?: string | null): { n: number; unit: string } | null {
  if (!q) return null
  const m = q.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  if (!Number.isFinite(n)) return null
  const rest = m[2]
  return { n, unit: rest && !/^(g|ml|kg|l)$/i.test(rest) ? ` ${rest}` : rest }
}

export function formatQuantity(n: number, unit: string) {
  const isWeight = /^(g|ml)$/i.test(unit.trim())
  const rounded = isWeight ? Math.max(1, Math.round(n / 5) * 5) : Math.round(n * 2) / 2
  return `${String(rounded).replace('.', ',')}${unit}`
}

/** Gramas/ml de uma quantidade ("150g", "200 ml"); null quando não é peso/volume. */
export function gramsOf(q?: string | null): number | null {
  const p = parseQuantity(q)
  if (!p) return null
  return /^(g|ml)$/i.test(p.unit.trim()) ? p.n : null
}
