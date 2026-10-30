/**
 * Homologa o ciclo 14.2 contra o servidor local (e túnel, se HOMO_TUNNEL_URL).
 * Não imprime senhas, tokens nem o corpo de e-mail.
 * Uso: npx tsx src/scripts/homologate.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const LOCAL = (process.env.HOMO_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const TUNNEL = (process.env.HOMO_TUNNEL_URL || '').replace(/\/$/, '')
const DEMO_EMAILS = {
  student: 'aluno@coachpass.app',
  personal: 'personal@coachpass.app',
  nutritionist: 'nutri@coachpass.app',
}

type Check = { name: string; ok: boolean; detail: string }

const checks: Check[] = []

function record(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail })
  console.log(`${ok ? 'OK' : 'FALHOU'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function authHeader(token: string) {
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

function asUserId(id: string | undefined): number {
  return Number(id)
}

async function request(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; json: unknown; text: string }> {
  const headers = new Headers(init.headers)
  if (base.includes('ngrok')) headers.set('ngrok-skip-browser-warning', '1')
  const res = await fetch(`${base}${path}`, { ...init, headers })
  const text = await res.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { status: res.status, json, text }
}

async function login(base: string, email: string, password: string, forwardedFor?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (forwardedFor) headers['x-forwarded-for'] = forwardedFor
  const res = await request(base, '/api/users/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  })
  const token =
    res.json && typeof res.json === 'object' && 'token' in res.json
      ? String((res.json as { token?: string }).token || '')
      : ''
  const user =
    res.json && typeof res.json === 'object' && 'user' in res.json
      ? ((res.json as { user?: { id?: string; role?: string; isSuperAdmin?: boolean } }).user ?? null)
      : null
  return { status: res.status, token, user, json: res.json }
}

async function main() {
  const password = process.env.DEMO_PASSWORD
  if (!password) {
    console.error('[homologate] Defina DEMO_PASSWORD no .env')
    process.exit(1)
  }

  const health = await request(LOCAL, '/api/health')
  const healthOk =
    health.status === 200 &&
    Boolean(health.json && typeof health.json === 'object' && (health.json as { ok?: boolean }).ok)
  record('GET /api/health', healthOk, `HTTP ${health.status}`)

  if (TUNNEL) {
    const tunnelHealth = await request(TUNNEL, '/api/health')
    const tunnelOk =
      tunnelHealth.status === 200 &&
      Boolean(tunnelHealth.json && typeof tunnelHealth.json === 'object' && (tunnelHealth.json as { ok?: boolean }).ok)
    record('GET /api/health (túnel)', tunnelOk, `HTTP ${tunnelHealth.status}`)
  } else {
    record('GET /api/health (túnel)', false, 'HOMO_TUNNEL_URL ausente')
  }

  const student = await login(LOCAL, DEMO_EMAILS.student, password)
  record('Login aluno demo', student.status === 200 && Boolean(student.token), `HTTP ${student.status}`)
  const personal = await login(LOCAL, DEMO_EMAILS.personal, password)
  record('Login personal demo', personal.status === 200 && Boolean(personal.token), `HTTP ${personal.status}`)
  const nutri = await login(LOCAL, DEMO_EMAILS.nutritionist, password)
  record('Login nutri demo', nutri.status === 200 && Boolean(nutri.token), `HTTP ${nutri.status}`)

  if (!student.token || !personal.token || !nutri.token || !student.user?.id) {
    console.error('[homologate] Sem sessão demo; interrompendo o restante.')
    failIfNeeded()
    return
  }

  const inviteUnknown = await request(LOCAL, '/api/professional-links/invite', {
    method: 'POST',
    headers: authHeader(personal.token),
    body: JSON.stringify({ email: 'naoexiste.homolog@coachpass.app' }),
  })
  record(
    'Convite e-mail inexistente é 200 genérico',
    inviteUnknown.status === 200,
    `HTTP ${inviteUnknown.status}`,
  )

  const inviteAluno = await request(LOCAL, '/api/professional-links/invite', {
    method: 'POST',
    headers: authHeader(personal.token),
    body: JSON.stringify({ email: DEMO_EMAILS.student }),
  })
  record('Convite aluno demo (já vinculado) 200', inviteAluno.status === 200, `HTTP ${inviteAluno.status}`)

  const workouts = await request(
    LOCAL,
    `/api/workouts?where[student][equals]=${student.user.id}&limit=5`,
    { headers: authHeader(student.token) },
  )
  const workoutDocs =
    workouts.json && typeof workouts.json === 'object' && 'docs' in workouts.json
      ? ((workouts.json as { docs?: Array<{ id: string; title: string }> }).docs ?? [])
      : []
  record('Aluno vê treino publicado', workouts.status === 200 && workoutDocs.length > 0, `${workoutDocs.length} treinos`)

  if (workoutDocs[0]) {
    const patched = await request(LOCAL, `/api/workouts/${workoutDocs[0].id}`, {
      method: 'PATCH',
      headers: authHeader(personal.token),
      body: JSON.stringify({ observations: 'Homologação PATCH treino' }),
    })
    record('Personal PATCH treino existente', patched.status === 200, `HTTP ${patched.status}`)
  } else {
    record('Personal PATCH treino existente', false, 'nenhum treino para editar')
  }

  const plans = await request(
    LOCAL,
    `/api/meal-plans?where[student][equals]=${student.user.id}&limit=5`,
    { headers: authHeader(student.token) },
  )
  const planDocs =
    plans.json && typeof plans.json === 'object' && 'docs' in plans.json
      ? ((plans.json as { docs?: Array<{ id: string }> }).docs ?? [])
      : []
  record('Aluno vê plano publicado', plans.status === 200 && planDocs.length > 0, `${planDocs.length} planos`)

  if (planDocs[0]) {
    const patchedPlan = await request(LOCAL, `/api/meal-plans/${planDocs[0].id}`, {
      method: 'PATCH',
      headers: authHeader(nutri.token),
      body: JSON.stringify({ observations: 'Homologação PATCH plano' }),
    })
    record('Nutri PATCH plano existente', patchedPlan.status === 200, `HTTP ${patchedPlan.status}`)
  } else {
    record('Nutri PATCH plano existente', false, 'nenhum plano para editar')
  }

  const elevate = await request(LOCAL, `/api/users/${student.user.id}`, {
    method: 'PATCH',
    headers: authHeader(student.token),
    body: JSON.stringify({ role: 'personal' }),
  })
  record(
    'PATCH aluno com role=personal falha',
    elevate.status >= 400,
    `HTTP ${elevate.status}`,
  )

  const payload = await getPayload({ config })
  const third = await payload.create({
    collection: 'users',
    data: {
      email: `homo.terceiro.${Date.now()}@coachpass.app`,
      password,
      name: 'Terceiro Homolog',
      role: 'student',
    },
    overrideAccess: true,
    context: { seedDemo: true },
  })
  const stolen = await request(LOCAL, '/api/workouts', {
    method: 'POST',
    headers: authHeader(personal.token),
    body: JSON.stringify({
      student: third.id,
      title: 'Treino indevido',
      status: 'published',
      exercises: [{ name: 'Agachamento', sets: 3, reps: '8' }],
    }),
  })
  record(
    'POST workout de terceiro é 403/400',
    stolen.status === 403 || stolen.status === 400,
    `HTTP ${stolen.status}`,
  )
  try {
    await payload.delete({ collection: 'users', id: third.id, overrideAccess: true })
  } catch {
    await payload.delete({
      collection: 'users',
      where: { email: { like: 'homo.terceiro.%@coachpass.app' } },
      overrideAccess: true,
    })
  }

  let forcedStatus = 'error'
  let forcedId = ''
  try {
    const forcedLink = await payload.create({
      collection: 'professional-links',
      data: {
        student: asUserId(student.user.id),
        professional: asUserId(personal.user?.id),
        professionalRole: 'personal',
        status: 'active',
      },
      overrideAccess: false,
      user: { id: personal.user?.id, collection: 'users', role: 'personal' } as never,
    })
    forcedStatus = String(forcedLink.status || 'error')
    forcedId = String(forcedLink.id || '')
  } catch {
    forcedStatus = 'error'
  }
  record(
    'POST professional-links com status active grava pending',
    forcedStatus === 'pending' || forcedStatus === 'error',
    forcedStatus === 'pending' ? 'pending' : 'hook recusou ou forçou pending',
  )
  if (forcedId) {
    await payload.delete({
      collection: 'professional-links',
      id: forcedId,
      overrideAccess: true,
    })
  }

  const forgot = await request(LOCAL, '/api/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': 'homologate-forgot' },
    body: JSON.stringify({ email: DEMO_EMAILS.student }),
  })
  record('POST forgot-password 200', forgot.status === 200, `HTTP ${forgot.status}`)

  const resetToken = await payload.forgotPassword({
    collection: 'users',
    data: { email: DEMO_EMAILS.student },
    disableEmail: true,
  })
  const resetPage = resetToken
    ? await request(LOCAL, `/redefinir-senha/${encodeURIComponent(String(resetToken))}`)
    : { status: 0, text: '', json: null }
  record(
    'Token de reset gera /redefinir-senha/:token',
    Boolean(resetToken) && resetPage.status === 200,
    resetToken ? `página HTTP ${resetPage.status}` : 'token não emitido',
  )

  const exported = await request(LOCAL, '/api/me/export', { headers: authHeader(student.token) })
  const exportObj = exported.json && typeof exported.json === 'object' ? (exported.json as Record<string, unknown>) : {}
  const userBlob = exportObj.user && typeof exportObj.user === 'object' ? (exportObj.user as Record<string, unknown>) : {}
  const leak = Boolean(userBlob.hash || userBlob.salt || userBlob.resetPasswordToken)
  record('GET /api/me/export sem hash/token', exported.status === 200 && !leak, leak ? 'vazou hash' : `HTTP ${exported.status}`)

  const adminStudent = await request(LOCAL, '/admin', { headers: { Authorization: `JWT ${student.token}` } })
  record(
    '/admin bloqueado para aluno (não é dashboard)',
    adminStudent.status === 200 && !adminStudent.text.includes('span title="Dashboard"'),
    `HTTP ${adminStudent.status}`,
  )

  const masterEmail = process.env.MASTER_EMAIL
  const masterPassword = process.env.MASTER_PASSWORD
  if (masterEmail && masterPassword) {
    const master = await login(LOCAL, masterEmail, masterPassword)
    record('Master entra no admin (login API)', master.status === 200 && Boolean(master.user?.isSuperAdmin || master.user?.role === 'master'), `HTTP ${master.status}`)
  } else {
    record('Master entra no admin (login API)', false, 'MASTER_EMAIL/MASTER_PASSWORD ausentes')
  }

  const existingGens = await payload.find({
    collection: 'ai-generations',
    where: {
      and: [
        { user: { equals: student.user.id } },
        { type: { equals: 'workout' } },
        { status: { in: ['pending', 'succeeded'] } },
      ],
    },
    limit: 10,
    overrideAccess: true,
  })
  const createdIds: string[] = []
  for (let i = existingGens.totalDocs; i < 2; i += 1) {
    const row = await payload.create({
      collection: 'ai-generations',
      data: {
        user: asUserId(student.user.id),
        type: 'workout',
        status: 'succeeded',
        provider: 'catalog',
      },
      overrideAccess: true,
    })
    createdIds.push(String(row.id))
  }
  const quota = await request(LOCAL, '/api/ai/generate-workout', {
    method: 'POST',
    headers: authHeader(student.token),
  })
  record('Quota IA: geração extra retorna 402', quota.status === 402, `HTTP ${quota.status}`)
  for (const id of createdIds) {
    await payload.delete({ collection: 'ai-generations', id, overrideAccess: true })
  }

  const foods = await request(LOCAL, '/api/foods?limit=5', { headers: authHeader(nutri.token) })
  const foodDocs =
    foods.json && typeof foods.json === 'object' && 'docs' in foods.json
      ? ((foods.json as { docs?: unknown[] }).docs ?? [])
      : []
  record('GET /api/foods', foods.status === 200 && foodDocs.length > 0, `${foodDocs.length} alimentos`)

  const transactions = await request(LOCAL, '/api/transactions?limit=5', {
    headers: authHeader(student.token),
  })
  record('GET /api/transactions', transactions.status === 200, `HTTP ${transactions.status}`)

  if (workoutDocs[0]) {
    const logRes = await request(LOCAL, '/api/workout-logs', {
      method: 'POST',
      headers: authHeader(student.token),
      body: JSON.stringify({
        workout: workoutDocs[0].id,
        status: 'completed',
        rpe: 8,
        performedAt: new Date().toISOString(),
      }),
    })
    record('POST /api/workout-logs (check-in)', logRes.status === 201 || logRes.status === 200, `HTTP ${logRes.status}`)
    const logId =
      logRes.json && typeof logRes.json === 'object' && 'doc' in logRes.json
        ? String((logRes.json as { doc?: { id?: string } }).doc?.id || '')
        : logRes.json && typeof logRes.json === 'object' && 'id' in logRes.json
          ? String((logRes.json as { id?: string }).id || '')
          : ''
    if (logId) {
      await payload.delete({ collection: 'workout-logs', id: logId, overrideAccess: true })
    }
  } else {
    record('POST /api/workout-logs (check-in)', false, 'nenhum treino para check-in')
  }

  const existingMealGens = await payload.find({
    collection: 'ai-generations',
    where: {
      and: [
        { user: { equals: student.user.id } },
        { type: { equals: 'meal_plan' } },
        { status: { in: ['pending', 'succeeded'] } },
      ],
    },
    limit: 10,
    overrideAccess: true,
  })
  const createdMealIds: string[] = []
  for (let i = existingMealGens.totalDocs; i < 2; i += 1) {
    const row = await payload.create({
      collection: 'ai-generations',
      data: {
        user: asUserId(student.user.id),
        type: 'meal_plan',
        status: 'succeeded',
        provider: 'catalog',
      },
      overrideAccess: true,
    })
    createdMealIds.push(String(row.id))
  }
  const mealQuota = await request(LOCAL, '/api/ai/generate-meal-plan', {
    method: 'POST',
    headers: authHeader(student.token),
  })
  record('Quota dieta IA: geração extra retorna 402', mealQuota.status === 402, `HTTP ${mealQuota.status}`)
  for (const id of createdMealIds) {
    await payload.delete({ collection: 'ai-generations', id, overrideAccess: true })
  }

  let last = 0
  for (let i = 0; i < 11; i += 1) {
    const res = await login(LOCAL, 'rate.limit@coachpass.app', 'x', 'homologate-rl')
    last = res.status
  }
  record('Rate limit login responde 429', last === 429, `último HTTP ${last}`)

  record('SMTP real (entrega inbox)', Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS), hasSmtpDetail())
  record(
    'Gemini: rotacionar se a chave vazou no chat',
    Boolean(process.env.GEMINI_API_KEY),
    process.env.GEMINI_API_KEY ? 'chave presente — revogue a exposta no AI Studio' : 'GEMINI_API_KEY ausente',
  )

  failIfNeeded()
}

function hasSmtpDetail() {
  return process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? 'SMTP_* preenchidos'
    : 'dev usa Ethereal; dono ainda precisa do provedor para inbox real'
}

function failIfNeeded() {
  const required = checks.filter((item) => !item.name.includes('túnel') && !item.name.includes('SMTP real') && !item.name.includes('Master') && !item.name.includes('Gemini'))
  const failed = required.filter((item) => !item.ok)
  if (failed.length) {
    console.error(`[homologate] ${failed.length} checagens obrigatórias falharam.`)
    process.exit(1)
  }
  console.log('[homologate] ciclo mínimo passou.')
}

main().catch((err) => {
  console.error('[homologate] erro inesperado')
  console.error(err instanceof Error ? err.message : 'falha')
  process.exit(1)
})
