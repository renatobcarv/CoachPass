/**
 * Remove contas fora da allowlist e os documentos dependentes.
 * Dry-run por padrão. Apaga só com --apply.
 * Uso: npx tsx src/scripts/cleanupUsers.ts [--apply]
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'
import { isKeptEmail, KEEP_EMAILS } from './keepUsers.js'

const apply = process.argv.includes('--apply')

function relationId(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: unknown }).id)
  }
  return String(value)
}

async function findAll(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'users' | 'student-profiles' | 'professional-links' | 'workouts' | 'meal-plans' | 'ai-generations',
) {
  const docs: Array<{ id: string | number } & Record<string, unknown>> = []
  let page = 1
  while (true) {
    const result = await payload.find({
      collection,
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    })
    docs.push(...(result.docs as unknown as typeof docs))
    if (!result.hasNextPage) break
    page += 1
  }
  return docs
}

async function deleteIds(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'users' | 'student-profiles' | 'professional-links' | 'workouts' | 'meal-plans' | 'ai-generations',
  ids: Array<string | number>,
  label: string,
) {
  console.log(`[cleanup] ${label}: ${ids.length}`)
  if (!apply) return
  for (const id of ids) {
    await payload.delete({
      collection,
      id,
      overrideAccess: true,
    })
  }
}

async function main() {
  const payload = await getPayload({ config })
  const users = await findAll(payload, 'users')
  const removeUsers = users.filter((user) => !isKeptEmail(String(user.email || '')))
  const removeIds = new Set(removeUsers.map((user) => String(user.id)))
  const keepUsers = users.filter((user) => isKeptEmail(String(user.email || '')))

  console.log(`[cleanup] modo: ${apply ? 'APPLY' : 'dry-run'}`)
  console.log(`[cleanup] permanecem (${keepUsers.length}): ${KEEP_EMAILS.join(', ')}`)
  console.log('[cleanup] removidos:')
  for (const user of removeUsers) {
    console.log(`- ${user.email} id=${user.id} role=${user.role || ''}`)
  }

  const [generations, workouts, mealPlans, links, profiles] = await Promise.all([
    findAll(payload, 'ai-generations'),
    findAll(payload, 'workouts'),
    findAll(payload, 'meal-plans'),
    findAll(payload, 'professional-links'),
    findAll(payload, 'student-profiles'),
  ])

  const genIds = generations
    .filter((doc) => removeIds.has(String(relationId(doc.user))))
    .map((doc) => doc.id)
  const workoutIds = workouts
    .filter(
      (doc) =>
        removeIds.has(String(relationId(doc.student))) || removeIds.has(String(relationId(doc.author))),
    )
    .map((doc) => doc.id)
  const mealIds = mealPlans
    .filter(
      (doc) =>
        removeIds.has(String(relationId(doc.student))) || removeIds.has(String(relationId(doc.author))),
    )
    .map((doc) => doc.id)
  const linkIds = links
    .filter(
      (doc) =>
        removeIds.has(String(relationId(doc.student))) ||
        removeIds.has(String(relationId(doc.professional))),
    )
    .map((doc) => doc.id)
  const profileIds = profiles
    .filter((doc) => removeIds.has(String(relationId(doc.user))))
    .map((doc) => doc.id)

  await deleteIds(payload, 'ai-generations', genIds, 'ai-generations')
  await deleteIds(payload, 'workouts', workoutIds, 'workouts')
  await deleteIds(payload, 'meal-plans', mealIds, 'meal-plans')
  await deleteIds(payload, 'professional-links', linkIds, 'professional-links')
  await deleteIds(payload, 'student-profiles', profileIds, 'student-profiles')
  await deleteIds(
    payload,
    'users',
    removeUsers.map((user) => user.id),
    'users',
  )

  if (!apply) {
    console.log('[cleanup] nada foi apagado. Rode com --apply para confirmar.')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
