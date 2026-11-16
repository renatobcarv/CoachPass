/**
 * Aluna demonstrativa para gravação de vídeo: histórico completo de 10 semanas.
 * Ciclo de periodização ativo, 4 treinos publicados, treinos registrados série a série com carga
 * progredindo (e um deload), pesagens e medidas semanais, check-ins e plano alimentar.
 *
 * Idempotente: recria só os registros desta aluna. Depende das contas do seed:demo (personal e nutri).
 * DEMO_PASSWORD é obrigatório. Uso: npm run seed:video [-- --personal=email@do.personal]
 * Sem --personal, o ciclo, os treinos e a agenda ficam com o personal demo (Rafael).
 * Com --personal, a aluna também é vinculada a esse personal e ele vira o dono do ciclo e da agenda.
 */
import 'dotenv/config'
import { getPayload, type Where } from 'payload'
import config from '../payload.config.js'

const password = process.env.DEMO_PASSWORD
if (!password) {
  console.error('[seed:video] Defina DEMO_PASSWORD no .env')
  process.exit(1)
}

const EMAIL = 'video@coachpass.app'
const NAME = 'Marina Rocha'
const WEEKS = 10 // semanas já vividas do ciclo (0 a 9), contando a atual
const context = { seedDemo: true, seedMaster: true }

type Payload = Awaited<ReturnType<typeof getPayload>>
type Id = number | string

/* ---------- Datas ---------- */

/** Segunda-feira da semana atual, 00:00 local. */
function mondayOf(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return d
}
const START = (() => {
  const d = mondayOf(new Date())
  d.setDate(d.getDate() - (WEEKS - 1) * 7)
  return d
})()
function at(week: number, dayOffset: number, hour = 7, minute = 0) {
  const d = new Date(START)
  d.setDate(d.getDate() + week * 7 + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d
}
const isoDate = (d: Date) => d.toISOString().slice(0, 10)

/* ---------- Progressão ---------- */

// Fases do ciclo: 0-1 adaptação, 2-5 hipertrofia, 6 deload, 7-10 força
const DELOAD_WEEK = 6
function progress(week: number): number {
  if (week === DELOAD_WEEK) return progress(DELOAD_WEEK - 1) * 0.85
  return Math.min(1, week / (WEEKS - 1))
}
function load(base: number, top: number, week: number, step: number) {
  const raw = week === DELOAD_WEEK ? (base + (top - base) * progress(DELOAD_WEEK - 1)) * 0.85 : base + (top - base) * progress(week)
  return Math.round(raw / step) * step
}
/** Repetições por série: começa no topo da faixa e cai com a fadiga. */
function repsFor(range: string, sets: number) {
  const [lo, hi] = range.split('-').map(Number)
  const top = hi || lo
  return Array.from({ length: sets }, (_, i) => Math.max(lo, top - Math.floor(i * 0.7)))
}

type Ex = { name: string; muscle: string; sets: number; reps: string; base: number; top: number; step: number; rest: number; perHand?: boolean }

const WORKOUTS: { title: string; weekday: 'monday' | 'tuesday' | 'thursday' | 'friday'; day: number; split: string; exercises: Ex[] }[] = [
  {
    title: 'Segunda — Inferiores A',
    weekday: 'monday',
    day: 0,
    split: 'Quadríceps + Panturrilha',
    exercises: [
      { name: 'Agachamento Livre', muscle: 'Pernas', sets: 4, reps: '6-8', base: 50, top: 62.5, step: 2.5, rest: 150 },
      { name: 'Leg Press 45°', muscle: 'Pernas', sets: 4, reps: '10-12', base: 140, top: 175, step: 5, rest: 120 },
      { name: 'Cadeira Extensora', muscle: 'Pernas', sets: 3, reps: '12-15', base: 35, top: 47.5, step: 2.5, rest: 75 },
      { name: 'Afundo', muscle: 'Glúteos', sets: 3, reps: '10-12', base: 10, top: 14, step: 1, rest: 90, perHand: true },
      { name: 'Panturrilha em Pé', muscle: 'Panturrilha', sets: 4, reps: '12-15', base: 40, top: 52.5, step: 2.5, rest: 60 },
    ],
  },
  {
    title: 'Terça — Superiores A',
    weekday: 'tuesday',
    day: 1,
    split: 'Peito + Ombros + Tríceps',
    exercises: [
      { name: 'Supino Reto com Barra', muscle: 'Peito', sets: 4, reps: '6-8', base: 30, top: 37.5, step: 2.5, rest: 150 },
      { name: 'Supino Inclinado com Halteres', muscle: 'Peito', sets: 3, reps: '8-10', base: 12, top: 16, step: 1, rest: 90, perHand: true },
      { name: 'Desenvolvimento com Halteres', muscle: 'Ombros', sets: 3, reps: '8-10', base: 10, top: 13, step: 1, rest: 90, perHand: true },
      { name: 'Elevação Lateral', muscle: 'Ombros', sets: 3, reps: '12-15', base: 5, top: 7, step: 1, rest: 60, perHand: true },
      { name: 'Tríceps Pulley com Corda', muscle: 'Tríceps', sets: 3, reps: '10-12', base: 20, top: 27.5, step: 2.5, rest: 60 },
    ],
  },
  {
    title: 'Quinta — Inferiores B',
    weekday: 'thursday',
    day: 3,
    split: 'Posterior + Glúteos',
    exercises: [
      { name: 'Levantamento Terra', muscle: 'Pernas', sets: 4, reps: '5-6', base: 50, top: 70, step: 2.5, rest: 180 },
      { name: 'Agachamento Búlgaro', muscle: 'Glúteos', sets: 3, reps: '8-10', base: 8, top: 12, step: 1, rest: 90, perHand: true },
      { name: 'Mesa Flexora', muscle: 'Pernas', sets: 3, reps: '10-12', base: 30, top: 40, step: 2.5, rest: 75 },
      { name: 'Cadeira Abdutora', muscle: 'Glúteos', sets: 3, reps: '15-20', base: 45, top: 60, step: 5, rest: 60 },
      { name: 'Prancha Isométrica', muscle: 'Abdômen', sets: 3, reps: '40-60', base: 0, top: 0, step: 1, rest: 45 },
    ],
  },
  {
    title: 'Sexta — Superiores B',
    weekday: 'friday',
    day: 4,
    split: 'Costas + Bíceps',
    exercises: [
      { name: 'Pulldown Frontal', muscle: 'Costas', sets: 4, reps: '8-10', base: 35, top: 45, step: 2.5, rest: 120 },
      { name: 'Remada Baixa no Cabo', muscle: 'Costas', sets: 3, reps: '10-12', base: 35, top: 45, step: 2.5, rest: 90 },
      { name: 'Remada Unilateral', muscle: 'Costas', sets: 3, reps: '10-12', base: 14, top: 18, step: 1, rest: 75, perHand: true },
      { name: 'Face Pull', muscle: 'Ombros', sets: 3, reps: '12-15', base: 15, top: 20, step: 2.5, rest: 60 },
      { name: 'Rosca Alternada', muscle: 'Bíceps', sets: 3, reps: '10-12', base: 8, top: 11, step: 1, rest: 60, perHand: true },
    ],
  },
]

// Imprevistos para o histórico parecer real
const SKIPPED = new Set(['3-friday'])
const PARTIAL = new Set(['6-thursday', '7-tuesday'])

/* ---------- Helpers de banco ---------- */

async function upsert(payload: Payload, collection: string, where: Where, data: Record<string, unknown>) {
  const found = await payload.find({ collection: collection as never, where, limit: 1, depth: 0, overrideAccess: true })
  if (found.docs[0]) {
    return payload.update({ collection: collection as never, id: (found.docs[0] as { id: Id }).id, data: data as never, overrideAccess: true, context })
  }
  return payload.create({ collection: collection as never, data: data as never, overrideAccess: true, context })
}

async function wipe(payload: Payload, collection: string, studentId: Id) {
  await payload.delete({ collection: collection as never, where: { student: { equals: studentId } }, overrideAccess: true, context })
}

async function userByEmail(payload: Payload, email: string) {
  const r = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })
  return r.docs[0]
}

/* ---------- Seed ---------- */

async function main() {
  const payload = await getPayload({ config })

  const demoPersonal = await userByEmail(payload, 'personal@coachpass.app')
  const nutri = await userByEmail(payload, 'nutri@coachpass.app')
  if (!demoPersonal || !nutri) throw new Error('Rode antes o npm run seed:demo (personal e nutri demo não encontrados).')

  const arg = process.argv.find((a) => a.startsWith('--personal='))?.slice('--personal='.length).trim().toLowerCase()
  let personal = demoPersonal
  if (arg) {
    const target = await userByEmail(payload, arg)
    const roles = ((target as { roles?: string[] } | undefined)?.roles ?? []) as string[]
    if (!target || (target.role !== 'personal' && !roles.includes('personal'))) {
      throw new Error(`--personal: nenhuma conta de personal com o e-mail ${arg}.`)
    }
    personal = target
  }

  const student = (await upsert(
    payload,
    'users',
    { email: { equals: EMAIL } },
    {
      email: EMAIL,
      password,
      name: NAME,
      role: 'student',
      avatarUrl: 'https://ui-avatars.com/api/?name=Marina+Rocha&background=263bff&color=fff',
    },
  )) as { id: Id }
  const sid = student.id

  await upsert(payload, 'student-profiles', { user: { equals: sid } }, {
    user: sid,
    displayName: NAME,
    phone: '11999990000',
    birthDate: '1994-03-08',
    heightCm: 166,
    weightKg: 61.9,
    sex: 'female',
    goal: 'hypertrophy',
    experienceLevel: 'intermediate',
    trainingDaysPerWeek: 4,
    sessionMinutes: 60,
    equipmentAccess: ['full_gym'],
    onboardingCompleted: true,
    onboardingCompletedAt: START.toISOString(),
  })

  const links: Array<{ pro: { id: Id }; role: 'personal' | 'nutritionist' }> = [
    { pro: demoPersonal, role: 'personal' },
    { pro: nutri, role: 'nutritionist' },
  ]
  if (personal.id !== demoPersonal.id) links.push({ pro: personal, role: 'personal' })
  for (const { pro, role } of links) {
    await upsert(
      payload,
      'professional-links',
      { and: [{ student: { equals: sid } }, { professional: { equals: pro.id } }, { professionalRole: { equals: role } }] },
      { student: sid, professional: pro.id, professionalRole: role, status: 'active', acceptedAt: START.toISOString() },
    )
  }

  // Recria o histórico desta aluna do zero (ordem: registros antes dos treinos e do ciclo)
  for (const c of ['workout-logs', 'body-metrics', 'weekly-checkins', 'sessions', 'assessments']) await wipe(payload, c, sid)
  const oldCycles = await payload.find({ collection: 'training-cycles', where: { student: { equals: sid } }, depth: 0, overrideAccess: true, pagination: false })
  for (const c of oldCycles.docs) await payload.delete({ collection: 'training-cycles', id: c.id, overrideAccess: true, context })
  await wipe(payload, 'workouts', sid)

  const cycle = (await payload.create({
    collection: 'training-cycles',
    data: {
      title: 'Recomposição · 11 semanas',
      student: sid,
      author: personal.id,
      coach: personal.id,
      nutritionist: nutri.id,
      goal: 'recomposition',
      model: 'block',
      level: 'intermediate',
      startDate: START.toISOString(),
      sessionsPerWeek: 4,
      status: 'active',
      baseline: {
        weightKg: 64.8,
        bodyFatPercent: 27,
        waistCm: 76,
        lifts: [
          { name: 'Agachamento Livre', e1rm: 62 },
          { name: 'Supino Reto com Barra', e1rm: 37 },
          { name: 'Levantamento Terra', e1rm: 66 },
          { name: 'Pulldown Frontal', e1rm: 44 },
        ],
      },
      targets: { weightKg: 61, bodyFatPercent: 23, notes: 'Perder gordura mantendo a força dos básicos.' },
      phases: [
        { name: 'Adaptação', kind: 'adaptation', weeks: 2, repRange: '10-12', rirStart: 3, rirEnd: 2, setsStart: 10, setsEnd: 12, dietPhase: 'maintenance', proteinGPerKg: 1.8 },
        { name: 'Hipertrofia', kind: 'hypertrophy', weeks: 4, repRange: '8-12', rirStart: 2, rirEnd: 1, setsStart: 12, setsEnd: 16, cardioMin: 90, dietPhase: 'deficit', kcalDelta: -350, proteinGPerKg: 2 },
        { name: 'Deload', kind: 'deload', weeks: 1, repRange: '8-10', rirStart: 4, rirEnd: 4, setsStart: 8, setsEnd: 8, dietPhase: 'maintenance', proteinGPerKg: 1.8 },
        { name: 'Força', kind: 'strength', weeks: 4, repRange: '5-8', rirStart: 2, rirEnd: 1, setsStart: 10, setsEnd: 12, cardioMin: 60, dietPhase: 'deficit', kcalDelta: -250, proteinGPerKg: 2.1 },
      ],
      notes: 'Ciclo demonstrativo para gravação.',
    } as never,
    overrideAccess: true,
    context: { periodizationEngine: true },
  })) as { id: Id }

  const workoutIds = new Map<string, Id>()
  for (const w of WORKOUTS) {
    const last = WEEKS - 1
    const doc = (await payload.create({
      collection: 'workouts',
      data: {
        title: w.title,
        student: sid,
        author: personal.id,
        status: 'published',
        source: 'professional',
        weekday: w.weekday,
        splitLabel: w.split,
        cycle: cycle.id,
        publishedAt: START.toISOString(),
        observations: 'Fase de força: suba a carga quando completar todas as séries no topo da faixa com 1–2 repetições em reserva.',
        exercises: w.exercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.name === 'Prancha Isométrica' ? '40-60s' : e.reps,
          weight: e.top ? `${load(e.base, e.top, last, e.step)} kg${e.perHand ? ' (cada mão)' : ''}` : 'Peso do corpo',
          rest: `${e.rest}s`,
          muscle: e.muscle,
        })),
      } as never,
      overrideAccess: true,
      context,
    })) as { id: Id }
    workoutIds.set(w.weekday, doc.id)
  }

  // Treinos registrados série a série
  let logs = 0
  for (let week = 0; week < WEEKS; week++) {
    for (const w of WORKOUTS) {
      const key = `${week}-${w.weekday}`
      const when = at(week, w.day, w.day % 2 ? 18 : 7, w.day % 2 ? 30 : 0)
      if (when > new Date()) continue
      const skipped = SKIPPED.has(key)
      const partial = PARTIAL.has(key)
      const rir = week === DELOAD_WEEK ? 4 : week < 2 ? 3 : week < 6 ? 2 : 1
      const exercises = w.exercises.map((e, i) => {
        const kg = e.top ? load(e.base, e.top, week, e.step) : 0
        const planned = { sets: e.sets, reps: e.reps, loadKg: kg, rir, restSec: e.rest }
        if (skipped || (partial && i >= 3)) {
          return { name: e.name, muscleGroup: e.muscle, planned, change: 'skipped', setsCompleted: 0 }
        }
        const reps = e.name === 'Prancha Isométrica' ? Array(e.sets).fill(45) : repsFor(e.reps, e.sets)
        return {
          name: e.name,
          muscleGroup: e.muscle,
          planned,
          change: 'none',
          setsCompleted: e.sets,
          load: kg ? `${kg} kg` : 'Peso do corpo',
          sets: reps.map((r, s) => ({ reps: r, loadKg: kg, rir: Math.max(0, rir - (s === e.sets - 1 ? 1 : 0)), restSec: e.rest, done: true })),
        }
      })
      await payload.create({
        collection: 'workout-logs',
        data: {
          student: sid,
          workout: workoutIds.get(w.weekday),
          performedAt: when.toISOString(),
          status: skipped ? 'skipped' : partial ? 'partial' : 'completed',
          rpe: skipped ? undefined : week === DELOAD_WEEK ? 6 : 7 + (week > 6 ? 1 : 0),
          sessionRpe: skipped ? undefined : week === DELOAD_WEEK ? 5 : 7,
          durationMin: skipped ? undefined : partial ? 38 : 58 + (w.day % 3),
          notes: skipped ? 'Viagem a trabalho.' : partial ? 'Terminei antes por falta de tempo.' : undefined,
          exercises: skipped ? [] : exercises,
        } as never,
        overrideAccess: true,
        context,
      })
      logs++
    }
  }

  // Pesagem e medidas toda segunda de manhã; % de gordura só nas bioimpedâncias
  const weights = [64.8, 64.5, 64.1, 63.9, 63.4, 63.2, 63.3, 62.7, 62.3, 61.9]
  const bf: Record<number, number> = { 0: 27, 5: 25.1, 9: 23.6 }
  for (let week = 0; week < WEEKS; week++) {
    const k = week / (WEEKS - 1)
    await payload.create({
      collection: 'body-metrics',
      data: {
        student: sid,
        recordedBy: sid,
        date: at(week, 0, 6, 30).toISOString(),
        weightKg: weights[week],
        waistCm: +(76 - 4.5 * k).toFixed(1),
        abdomenCm: +(81 - 5 * k).toFixed(1),
        hipCm: +(99 - 2 * k).toFixed(1),
        armCm: +(28.4 + 0.8 * k).toFixed(1),
        thighCm: +(55 + 0.4 * k).toFixed(1),
        ...(bf[week] ? { bodyFatPercent: bf[week], bodyFatMethod: 'Bioimpedância' } : {}),
      } as never,
      overrideAccess: true,
      context,
    })
  }

  // Check-in semanal (domingo)
  for (let week = 0; week < WEEKS; week++) {
    const date = at(week, 6, 20)
    if (date > new Date()) continue
    const k = week / (WEEKS - 1)
    const deload = week === DELOAD_WEEK
    await payload.create({
      collection: 'weekly-checkins',
      data: {
        student: sid,
        date: date.toISOString(),
        sleep: week === 3 ? 2 : 4,
        energy: deload ? 5 : Math.round(3 + k),
        soreness: deload ? 1 : week < 2 ? 4 : 2,
        stress: week === 3 ? 4 : 2,
        hunger: week > 6 ? 3 : 2,
        fatigue: deload ? 1 : week === 5 ? 4 : 2,
        readiness: deload ? 5 : 4,
        jointPain: 1,
        recovery: deload ? 5 : 4,
        dietAdherence: Math.round(72 + 18 * k),
        notes: week === 3 ? 'Semana corrida no trabalho, dormi mal.' : undefined,
      } as never,
      overrideAccess: true,
      context,
    })
  }

  await upsert(payload, 'meal-plans', { and: [{ student: { equals: sid } }, { title: { equals: 'Recomposição · fase de força' } }] }, {
    title: 'Recomposição · fase de força',
    student: sid,
    author: nutri.id,
    status: 'published',
    source: 'professional',
    publishedAt: at(7, 0, 9).toISOString(),
    observations: 'Proteína distribuída nas 5 refeições. Ajuste de -250 kcal nesta fase. Dados demonstrativos.',
    meals: [
      { name: 'Café da manhã', time: '06:30', calories: 390, items: [
        { name: 'Ovos mexidos', quantity: '3 un', calories: 210 },
        { name: 'Pão integral', quantity: '1 fatia', calories: 70 },
        { name: 'Mamão', quantity: '1 fatia média', calories: 60 },
        { name: 'Café sem açúcar', quantity: '1 xícara', calories: 5 },
      ] },
      { name: 'Lanche da manhã', time: '10:00', calories: 210, items: [
        { name: 'Iogurte natural desnatado', quantity: '170 g', calories: 90 },
        { name: 'Whey protein', quantity: '1 scoop', calories: 120 },
      ] },
      { name: 'Almoço', time: '12:30', calories: 560, items: [
        { name: 'Arroz integral', quantity: '4 colheres', calories: 160 },
        { name: 'Feijão', quantity: '1 concha', calories: 90 },
        { name: 'Peito de frango grelhado', quantity: '150 g', calories: 240 },
        { name: 'Salada verde com azeite', quantity: '1 prato', calories: 70 },
      ] },
      { name: 'Pré-treino', time: '17:00', calories: 260, items: [
        { name: 'Banana', quantity: '1 un', calories: 90 },
        { name: 'Pasta de amendoim', quantity: '1 colher', calories: 95 },
        { name: 'Aveia', quantity: '2 colheres', calories: 75 },
      ] },
      { name: 'Jantar', time: '20:30', calories: 450, items: [
        { name: 'Tilápia grelhada', quantity: '150 g', calories: 190 },
        { name: 'Batata-doce', quantity: '150 g', calories: 130 },
        { name: 'Legumes no vapor', quantity: '1 prato', calories: 80 },
      ] },
    ],
  })

  await payload.create({
    collection: 'assessments',
    data: { kind: 'physical', student: sid, professional: personal.id, date: START.toISOString(), weightKg: 64.8, bodyFatPercent: 27, notes: 'Avaliação inicial do ciclo (demonstrativa).' } as never,
    overrideAccess: true,
    context,
  })
  await payload.create({
    collection: 'assessments',
    data: { kind: 'physical', student: sid, professional: personal.id, date: at(WEEKS - 1, 0, 8).toISOString(), weightKg: 61.9, bodyFatPercent: 23.6, notes: 'Reavaliação: -2,9 kg e -3,4 pp de gordura (demonstrativa).' } as never,
    overrideAccess: true,
    context,
  })

  // Próximas sessões na agenda do personal
  for (const [day, time] of [
    [0, '07:00'],
    [3, '07:00'],
  ] as const) {
    await payload.create({
      collection: 'sessions',
      data: { student: sid, professional: personal.id, date: at(WEEKS, day, 7).toISOString(), time, durationMin: 60, type: 'training', location: 'Studio demo', status: 'scheduled' } as never,
      overrideAccess: true,
      context,
    })
  }

  console.log(`[seed:video] ${NAME} <${EMAIL}> vinculada a ${personal.name ?? 'personal'}: ciclo ativo, 4 treinos, ${logs} registros, ${WEEKS} pesagens. Senha = DEMO_PASSWORD.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
