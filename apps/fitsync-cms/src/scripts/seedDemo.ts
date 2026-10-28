/**
 * Seed idempotente das contas demonstrativas.
 * DEMO_PASSWORD é obrigatório.
 * Uso: npx tsx src/scripts/seedDemo.ts
 */
import 'dotenv/config'
import { getPayload, type Where } from 'payload'
import config from '../payload.config.js'
import { TACO_FOODS } from '../data/tacoFoods.js'

const password = process.env.DEMO_PASSWORD
if (!password) {
  console.error('[seed:demo] Defina DEMO_PASSWORD no .env')
  process.exit(1)
}

const context = { seedDemo: true, seedMaster: true }

type Role = 'student' | 'personal' | 'nutritionist'

async function upsertUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  data: {
    email: string
    name: string
    role: Role
    professionalId?: string
    bio?: string
    specialties?: string[]
    city?: string
    avatarUrl?: string
  },
) {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    limit: 1,
    overrideAccess: true,
  })
  const body = {
    email: data.email,
    password,
    name: data.name,
    role: data.role,
    professionalId: data.professionalId,
    bio: data.bio,
    specialties: data.specialties?.map((value) => ({ value })),
    city: data.city,
    avatarUrl: data.avatarUrl,
  }
  if (found.docs[0]) {
    return payload.update({
      collection: 'users',
      id: found.docs[0].id,
      data: body,
      overrideAccess: true,
      context,
    })
  }
  return payload.create({
    collection: 'users',
    data: body,
    overrideAccess: true,
    context,
  })
}

async function upsertByWhere(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection:
    | 'student-profiles'
    | 'professional-links'
    | 'workouts'
    | 'meal-plans'
    | 'assessments'
    | 'sessions'
    | 'restrictions'
    | 'anamneses'
    | 'foods'
    | 'workout-logs'
    | 'transactions',
  where: Where,
  data: Record<string, unknown>,
) {
  const found = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (found.docs[0]) {
    return payload.update({
      collection,
      id: found.docs[0].id,
      data: data as never,
      overrideAccess: true,
      context,
    })
  }
  return payload.create({
    collection,
    data: data as never,
    overrideAccess: true,
    context,
  })
}

async function main() {
  const payload = await getPayload({ config })

  const personal = await upsertUser(payload, {
    email: 'personal@coachpass.app',
    name: 'Rafael Monteiro',
    role: 'personal',
    professionalId: 'CREF 000000-G/SP — demonstrativo',
    bio: 'Personal trainer focado em hipertrofia e reabilitação leve. Conta demonstrativa.',
    specialties: ['Hipertrofia', 'Emagrecimento', 'Treinamento funcional'],
    city: 'São Paulo',
    avatarUrl: 'https://ui-avatars.com/api/?name=Rafael+Monteiro&background=1e3a5f&color=fff',
  })

  const nutri = await upsertUser(payload, {
    email: 'nutri@coachpass.app',
    name: 'Camila Duarte',
    role: 'nutritionist',
    professionalId: 'CRN-3 00000 — demonstrativo',
    bio: 'Nutricionista esportiva. Conta demonstrativa CoachPass.',
    specialties: ['Nutrição esportiva', 'Recomposição corporal'],
    city: 'São Paulo',
    avatarUrl: 'https://ui-avatars.com/api/?name=Camila+Duarte&background=1e3a5f&color=fff',
  })

  const students = [
    {
      email: 'aluno@coachpass.app',
      name: 'Lucas Almeida',
      goal: 'hypertrophy' as const,
      sex: 'male' as const,
      weightKg: 78,
      heightCm: 178,
    },
    {
      email: 'ana.souza@coachpass.app',
      name: 'Ana Souza',
      goal: 'weight_loss' as const,
      sex: 'female' as const,
      weightKg: 64,
      heightCm: 165,
    },
    {
      email: 'bruno.lima@coachpass.app',
      name: 'Bruno Lima',
      goal: 'hypertrophy' as const,
      sex: 'male' as const,
      weightKg: 82,
      heightCm: 181,
    },
    {
      email: 'carla.mendes@coachpass.app',
      name: 'Carla Mendes',
      goal: 'weight_loss' as const,
      sex: 'female' as const,
      weightKg: 70,
      heightCm: 168,
    },
    {
      email: 'diego.ferraz@coachpass.app',
      name: 'Diego Ferraz',
      goal: 'hypertrophy' as const,
      sex: 'male' as const,
      weightKg: 75,
      heightCm: 176,
    },
    {
      email: 'elena.costa@coachpass.app',
      name: 'Elena Costa',
      goal: 'weight_loss' as const,
      sex: 'female' as const,
      weightKg: 61,
      heightCm: 162,
    },
  ]

  const studentDocs = []
  for (const student of students) {
    const user = await upsertUser(payload, {
      email: student.email,
      name: student.name,
      role: 'student',
    })
    await upsertByWhere(
      payload,
      'student-profiles',
      { user: { equals: user.id } },
      {
        user: user.id,
        displayName: student.name,
        phone: '11999990000',
        birthDate: '1996-04-12',
        heightCm: student.heightCm,
        weightKg: student.weightKg,
        sex: student.sex,
        goal: student.goal,
        experienceLevel: 'intermediate',
        trainingDaysPerWeek: 4,
        sessionMinutes: 60,
        equipmentAccess: ['full_gym'],
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      },
    )
    studentDocs.push(user)
  }

  for (const [index, student] of studentDocs.entries()) {
    await upsertByWhere(
      payload,
      'professional-links',
      {
        and: [
          { student: { equals: student.id } },
          { professional: { equals: personal.id } },
          { professionalRole: { equals: 'personal' } },
        ],
      },
      {
        student: student.id,
        professional: personal.id,
        professionalRole: 'personal',
        status: index === 5 ? 'pending' : 'active',
        acceptedAt: index === 5 ? null : new Date().toISOString(),
      },
    )
    await upsertByWhere(
      payload,
      'professional-links',
      {
        and: [
          { student: { equals: student.id } },
          { professional: { equals: nutri.id } },
          { professionalRole: { equals: 'nutritionist' } },
        ],
      },
      {
        student: student.id,
        professional: nutri.id,
        professionalRole: 'nutritionist',
        status: index === 4 ? 'pending' : 'active',
        acceptedAt: index === 4 ? null : new Date().toISOString(),
      },
    )

    if (index === 5) continue

    await upsertByWhere(
      payload,
      'workouts',
      { and: [{ student: { equals: student.id } }, { title: { equals: 'Segunda — Costas e bíceps' } }] },
      {
        title: 'Segunda — Costas e bíceps',
        student: student.id,
        author: personal.id,
        status: 'published',
        source: 'professional',
        weekday: 'monday',
        splitLabel: 'Costas + Bíceps',
        publishedAt: new Date().toISOString(),
        observations: 'Demo: ajuste cargas conforme percepção de esforço.',
        exercises: [
          { name: 'Puxada frente', sets: 3, reps: '8-12', rest: '90s', muscle: 'Costas' },
          { name: 'Remada curvada', sets: 3, reps: '8-12', rest: '90s', muscle: 'Costas' },
          { name: 'Rosca direta', sets: 3, reps: '10-12', rest: '60s', muscle: 'Bíceps' },
        ],
      },
    )

    if (index < 4) {
      await upsertByWhere(
        payload,
        'meal-plans',
        { and: [{ student: { equals: student.id } }, { title: { equals: 'Plano de reorganização' } }] },
        {
          title: 'Plano de reorganização',
          student: student.id,
          author: nutri.id,
          status: 'published',
          source: 'professional',
          publishedAt: new Date().toISOString(),
          observations: 'Demo: distribuição ilustrativa, não é prescrição clínica.',
          meals: [
            {
              name: 'Café da manhã',
              time: '08:00',
              calories: 420,
              items: [
                { name: 'Ovos mexidos', quantity: '2 un', calories: 180 },
                { name: 'Pão integral', quantity: '2 fatias', calories: 140 },
              ],
            },
            {
              name: 'Almoço',
              time: '12:30',
              calories: 650,
              items: [
                { name: 'Arroz', quantity: '4 colheres', calories: 200 },
                { name: 'Frango grelhado', quantity: '150g', calories: 250 },
              ],
            },
          ],
        },
      )
    }

    await upsertByWhere(
      payload,
      'assessments',
      {
        and: [
          { student: { equals: student.id } },
          { professional: { equals: personal.id } },
          { kind: { equals: 'physical' } },
        ],
      },
      {
        kind: 'physical',
        student: student.id,
        professional: personal.id,
        date: new Date().toISOString(),
        weightKg: 70 + index,
        bodyFatPercent: 18 - index,
        notes: 'Avaliação demonstrativa.',
      },
    )

    await upsertByWhere(
      payload,
      'sessions',
      {
        and: [
          { student: { equals: student.id } },
          { professional: { equals: personal.id } },
          { type: { equals: 'training' } },
        ],
      },
      {
        student: student.id,
        professional: personal.id,
        date: new Date().toISOString(),
        time: '18:00',
        durationMin: 60,
        type: 'training',
        location: 'Studio demo',
        status: 'scheduled',
      },
    )
  }

  const restricted = studentDocs[1]
  await upsertByWhere(
    payload,
    'restrictions',
    { and: [{ student: { equals: restricted.id } }, { title: { equals: 'Joelho direito' } }] },
    {
      student: restricted.id,
      professional: personal.id,
      type: 'injury',
      title: 'Joelho direito',
      description: 'Evitar agachamento profundo nesta fase (dado fictício).',
      severity: 'moderate',
      active: true,
    },
  )

  const anamneseStudent = studentDocs[0]
  await upsertByWhere(
    payload,
    'anamneses',
    { student: { equals: anamneseStudent.id } },
    {
      student: anamneseStudent.id,
      professional: nutri.id,
      status: 'completed',
      completedAt: new Date().toISOString(),
      answers: {
        gastrointestinal: 'Sem queixas relevantes (demo)',
        sleep: '7 horas',
      },
    },
  )

  for (const food of TACO_FOODS) {
    await upsertByWhere(payload, 'foods', { name: { equals: food.name } }, food)
  }

  const aluno = studentDocs[0]
  const demoWorkout = await payload.find({
    collection: 'workouts',
    where: {
      and: [{ student: { equals: aluno.id } }, { title: { equals: 'Segunda — Costas e bíceps' } }],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (demoWorkout.docs[0]) {
    await upsertByWhere(
      payload,
      'workout-logs',
      {
        and: [{ student: { equals: aluno.id } }, { workout: { equals: demoWorkout.docs[0].id } }],
      },
      {
        student: aluno.id,
        workout: demoWorkout.docs[0].id,
        performedAt: new Date().toISOString(),
        status: 'completed',
        rpe: 7,
        notes: 'Check-in demonstrativo.',
      },
    )
  }

  await upsertByWhere(
    payload,
    'transactions',
    {
      and: [
        { student: { equals: aluno.id } },
        { professional: { equals: personal.id } },
        { description: { equals: 'Mensalidade demo' } },
      ],
    },
    {
      student: aluno.id,
      professional: personal.id,
      description: 'Mensalidade demo',
      amount: 150,
      kind: 'charge',
      status: 'pending',
      dueDate: new Date().toISOString(),
    },
  )

  console.log('[seed:demo] contas e dados demonstrativos atualizados (senhas não são impressas).')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
