/**
 * Importa a biblioteca de exercícios (free-exercise-db, domínio público) para a coleção `exercises`.
 * Idempotente: atualiza pelo `slug`. Nomes e passo a passo em PT vêm da base local do CoachPass.
 * Uso: npm run seed:exercises
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import config from '../payload.config.js'
import { groupOf } from '../lib/exerciseTaxonomy.js'
import { PHOTO_IDS } from '../web/data/exercisePhotos.js'
import { exerciseLibrary } from '../web/data/exerciseLibrary.js'
import { exerciseDatabase } from '../web/data/exerciseData.js'

type Raw = {
  id: string
  name: string
  level: string | null
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string | null
  images: string[]
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const file = JSON.parse(fs.readFileSync(path.resolve(dirname, '../data/free-exercise-db.json'), 'utf8')) as {
  commit: string
  exercises: Raw[]
}
// Versão fixa do repositório: as fotos não mudam nem somem
const CDN = `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${file.commit}/exercises`

const LEVEL_PT: Record<string, string> = { Iniciante: 'beginner', Intermediário: 'intermediate', Avançado: 'expert' }

// id da free-exercise-db -> nome em PT (o primeiro nome PT mapeado vence)
const ptNameById = new Map<string, string>()
for (const [pt, id] of Object.entries(PHOTO_IDS)) if (!ptNameById.has(id)) ptNameById.set(id, pt)

// Nome PT -> dados da biblioteca local (nível e grupo)
const libByName = new Map(Object.values(exerciseLibrary).flat().map((e) => [e.name, e]))

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

async function main() {
  const payload = await getPayload({ config })
  let created = 0
  let updated = 0

  const upsert = async (slug: string, data: Record<string, unknown>) => {
    const found = await payload.find({
      collection: 'exercises',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (found.docs[0]) {
      await payload.update({
        collection: 'exercises',
        id: found.docs[0].id,
        data,
        overrideAccess: true,
        context: { seedExercises: true },
      })
      updated++
    } else {
      await payload.create({
        collection: 'exercises',
        data: { ...data, slug } as never,
        overrideAccess: true,
        context: { seedExercises: true },
      })
      created++
    }
  }

  const usedPt = new Set<string>()
  for (const e of file.exercises) {
    const pt = ptNameById.get(e.id)
    const detail = pt ? exerciseDatabase[pt] : undefined
    const lib = pt ? libByName.get(pt) : undefined
    if (pt) usedPt.add(pt)
    await upsert(e.id, {
      name: pt ?? e.name,
      nameEn: e.name,
      muscleGroup: groupOf(e.primaryMuscles) ?? undefined,
      primaryMuscles: e.primaryMuscles,
      secondaryMuscles: e.secondaryMuscles,
      equipment: e.equipment ?? 'other',
      level: (lib && LEVEL_PT[lib.difficulty]) || e.level || undefined,
      mechanic: e.mechanic ?? undefined,
      category: e.category ?? undefined,
      // Alguns passos do catálogo vêm vazios; o campo exige texto
      instructions: (detail?.steps ?? e.instructions).filter((t) => t?.trim()).map((text) => ({ text })),
      instructionsLang: detail ? 'pt' : 'en',
      images: e.images.map((img) => ({ url: `${CDN}/${img}` })),
      youtubeUrl: detail?.videoId ? `https://www.youtube.com/watch?v=${detail.videoId}` : undefined,
      isCustom: false,
    })
  }

  // Exercícios da base PT sem foto na free-exercise-db entram só com o nome em português
  for (const [group, list] of Object.entries(exerciseLibrary)) {
    for (const ex of list) {
      if (usedPt.has(ex.name)) continue
      const detail = exerciseDatabase[ex.name]
      await upsert(`pt-${slugify(ex.name)}`, {
        name: ex.name,
        muscleGroup: ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen'].includes(group)
          ? group
          : undefined,
        level: LEVEL_PT[ex.difficulty],
        instructions: (detail?.steps ?? []).filter((t) => t?.trim()).map((text) => ({ text })),
        instructionsLang: 'pt',
        youtubeUrl: detail?.videoId ? `https://www.youtube.com/watch?v=${detail.videoId}` : undefined,
        isCustom: false,
      })
    }
  }

  console.log(`[seed:exercises] ${created} criados, ${updated} atualizados.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
