/**
 * Exporta usuários e documentos relacionados para backups/.
 * Uso: npx tsx src/scripts/backupUsers.ts
 */
import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const backupDir = path.resolve(dirname, '../../backups')

async function allDocs(payload: Awaited<ReturnType<typeof getPayload>>, collection: string) {
  const docs: unknown[] = []
  let page = 1
  while (true) {
    const result = await payload.find({
      collection: collection as 'users',
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    })
    docs.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }
  return docs
}

async function main() {
  const payload = await getPayload({ config })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await mkdir(backupDir, { recursive: true })

  const collections = [
    'users',
    'student-profiles',
    'professional-links',
    'workouts',
    'meal-plans',
    'ai-generations',
  ] as const

  const dump: { createdAt: string; collections: Record<string, unknown[]> } = {
    createdAt: new Date().toISOString(),
    collections: {},
  }

  for (const collection of collections) {
    const docs = await allDocs(payload, collection)
    dump.collections[collection] = docs
    console.log(`[backup] ${collection}: ${docs.length}`)
  }

  const file = path.join(backupDir, `pre-cleanup-${stamp}.json`)
  await writeFile(file, JSON.stringify(dump, null, 2), 'utf8')
  console.log(`[backup] gravado em ${file}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
