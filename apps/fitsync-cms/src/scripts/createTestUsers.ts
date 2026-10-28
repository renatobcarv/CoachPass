/**
 * Script legado. Não use em produção.
 * TEST_PASSWORD é obrigatório.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const password = process.env.TEST_PASSWORD
if (!password) {
  console.error('[createTestUsers] Defina TEST_PASSWORD. Este script não deve rodar em produção.')
  process.exit(1)
}

const accounts = [
  { email: 'admin@fitsync.local', name: 'Admin FitSync', role: 'master' as const, isSuperAdmin: true },
  { email: 'aluno@fitsync.local', name: 'Aluno FitSync', role: 'student' as const, isSuperAdmin: false },
  { email: 'personal@fitsync.local', name: 'Personal FitSync', role: 'personal' as const, isSuperAdmin: false },
  { email: 'nutri@fitsync.local', name: 'Nutricionista FitSync', role: 'nutritionist' as const, isSuperAdmin: false },
]

async function main() {
  const payload = await getPayload({ config })
  for (const account of accounts) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: account.email } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      console.log(`[createTestUsers] já existe: ${account.email}`)
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
    console.log(`[createTestUsers] criado: ${account.email}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
