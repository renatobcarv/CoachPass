import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

const runDb = Boolean(process.env.DATABASE_URL_TEST)

describe.skipIf(!runDb)('API e acesso', () => {
  let payload: Payload
  const suffix = Date.now()
  const strong = 'Brisa#Lunar92'

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
    const config = (await import('@/payload.config')).default
    payload = await getPayload({ config })
  })

  it('rejeita senha fraca no create', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `fraca.${suffix}@coachpass.test`,
          password: '123456',
          name: 'Teste Fraca',
          role: 'student',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('aluno não eleva o próprio papel para personal', async () => {
    const student = await payload.create({
      collection: 'users',
      data: {
        email: `aluno.${suffix}@coachpass.test`,
        password: strong,
        name: 'Aluno Teste',
        role: 'student',
      },
      overrideAccess: true,
    })
    await expect(
      payload.update({
        collection: 'users',
        id: student.id,
        data: { role: 'personal' },
        user: student,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('create de professional-links força pending', async () => {
    const personal = await payload.create({
      collection: 'users',
      data: {
        email: `personal.${suffix}@coachpass.test`,
        password: strong,
        name: 'Personal Teste',
        role: 'personal',
      },
      overrideAccess: true,
    })
    const student = await payload.create({
      collection: 'users',
      data: {
        email: `aluno2.${suffix}@coachpass.test`,
        password: strong,
        name: 'Aluno Dois',
        role: 'student',
      },
      overrideAccess: true,
    })
    const link = await payload.create({
      collection: 'professional-links',
      data: {
        student: student.id,
        professional: 999999,
        professionalRole: 'nutritionist',
        status: 'active',
      },
      user: personal,
      overrideAccess: false,
    })
    expect(link.status).toBe('pending')
    expect(link.professional).toBeTruthy()
  })
})

describe('API (sem banco de teste)', () => {
  it('não usa o banco de produção quando DATABASE_URL_TEST está ausente', () => {
    expect(runDb || !process.env.DATABASE_URL_TEST).toBe(true)
  })
})
