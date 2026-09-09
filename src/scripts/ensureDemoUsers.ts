/**
 * Cria contas de demonstração do CoachPass, se ainda não existirem.
 * Uso: npx tsx src/scripts/ensureDemoUsers.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const password = 'CoachPass123'
const accounts = [
  { email: 'aluno@coachpass.app', name: 'Aluno Demo', role: 'student' as const },
  { email: 'personal@coachpass.app', name: 'Personal Demo', role: 'personal' as const },
  { email: 'nutri@coachpass.app', name: 'Nutri Demo', role: 'nutritionist' as const },
]

async function main() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    limit: 20,
    overrideAccess: true,
  })
  console.log('[coachpass] Contas atuais:')
  for (const doc of existing.docs) {
    console.log(`- ${doc.email} (${(doc as { role?: string }).role || 'sem papel'})`)
  }

  for (const account of accounts) {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: account.email } },
      limit: 1,
      overrideAccess: true,
    })

    if (found.docs.length > 0) {
      await payload.update({
        collection: 'users',
        id: found.docs[0].id,
        data: { password, role: account.role, name: account.name },
        overrideAccess: true,
      })
      console.log(`[coachpass] Atualizada: ${account.email}`)
      continue
    }

    await payload.create({
      collection: 'users',
      data: {
        email: account.email,
        password,
        name: account.name,
        role: account.role,
      },
      overrideAccess: true,
    })
    console.log(`[coachpass] Criada: ${account.email}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
