/**
 * Cria ou atualiza o usuário master (super-admin).
 * Uso: npx tsx src/scripts/ensureMasterUser.ts
 * Variáveis: MASTER_EMAIL, MASTER_PASSWORD (defina no .env ou no shell)
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const email = (process.env.MASTER_EMAIL || 'master@fitsync.local').trim().toLowerCase()
const password = process.env.MASTER_PASSWORD || 'MasterFitSync!MudeEstaSenha2026'

async function main() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const doc = existing.docs[0]
    await payload.update({
      collection: 'users',
      id: doc.id,
      data: {
        password,
        role: 'master',
        isSuperAdmin: true,
        name: (doc as { name?: string }).name || 'Master Admin',
      },
      overrideAccess: true,
    })
    console.log(`[fitsync] Usuário master atualizado: ${email}`)
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: 'Master Admin',
      role: 'master',
      isSuperAdmin: true,
    },
    overrideAccess: true,
    context: { seedMaster: true },
  })
  console.log(`[fitsync] Usuário master criado: ${email}`)
  console.log('[fitsync] Altere MASTER_PASSWORD no .env e rode de novo, ou troque a senha no admin.')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
