import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const password = 'FitSync123!'

const accounts = [
  {
    email: 'admin@fitsync.local',
    name: 'Admin FitSync',
    role: 'master' as const,
    isSuperAdmin: true,
  },
  {
    email: 'aluno@fitsync.local',
    name: 'Aluno FitSync',
    role: 'student' as const,
    isSuperAdmin: false,
  },
  {
    email: 'personal@fitsync.local',
    name: 'Personal FitSync',
    role: 'personal' as const,
    isSuperAdmin: false,
  },
  {
    email: 'nutri@fitsync.local',
    name: 'Nutricionista FitSync',
    role: 'nutritionist' as const,
    isSuperAdmin: false,
  },
]

async function main() {
  const payload = await getPayload({ config })

  console.log('\n=== Criando usuários de teste ===\n')

  for (const account of accounts) {
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: account.email,
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      console.log(`⚠️ Já existe: ${account.email}`)
      continue
    }

    await payload.create({
      collection: 'users',
      data: {
        email: account.email,
        password,
        name: account.name,
        role: account.role,
        isSuperAdmin: account.isSuperAdmin,
      },
      overrideAccess: true,
      context: account.role === 'master' ? { seedMaster: true } : undefined,
    })

    console.log(`✅ Criado: ${account.email} (${account.role})`)
  }

  console.log('\n=== Usuários de teste ===')
  console.log('Senha de todos: FitSync123!')
  console.log('========================\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Erro ao criar usuários:')
    console.error(error)
    process.exit(1)
  })