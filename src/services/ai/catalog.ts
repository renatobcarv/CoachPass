import { exerciseLibrary, type Exercise } from '../../web/data/exerciseLibrary'

export type CatalogExercise = Exercise & { id: string }

export function getExerciseCatalog(): CatalogExercise[] {
  const list: CatalogExercise[] = []
  for (const [group, exercises] of Object.entries(exerciseLibrary)) {
    for (const ex of exercises) {
      list.push({
        ...ex,
        id: `${group}:${ex.name}`.toLowerCase().replace(/\s+/g, '-'),
        muscle: ex.muscle || group,
      })
    }
  }
  return list
}

export function catalogForPrompt(limit = 80): string {
  return getExerciseCatalog()
    .slice(0, limit)
    .map((ex) => `- ${ex.name} | músculo: ${ex.muscle} | equipamento: ${ex.equipment} | nível: ${ex.difficulty}`)
    .join('\n')
}
