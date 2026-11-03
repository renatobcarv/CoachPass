/**
 * Vocabulário da biblioteca de exercícios (valores gravados em inglês, rótulos em PT).
 * Os códigos seguem a free-exercise-db para o import ficar direto.
 */

export const MUSCLES: Record<string, string> = {
  chest: 'Peito',
  lats: 'Dorsais',
  'middle back': 'Costas (meio)',
  'lower back': 'Lombar',
  traps: 'Trapézio',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraço',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores da coxa',
  glutes: 'Glúteos',
  adductors: 'Adutores',
  abductors: 'Abdutores',
  calves: 'Panturrilhas',
  abdominals: 'Abdômen',
  neck: 'Pescoço',
}

/** Grupo usado para filtrar e para contar volume semanal (séries por grupo). */
export const MUSCLE_GROUP_OF: Record<string, string> = {
  chest: 'Peito',
  lats: 'Costas',
  'middle back': 'Costas',
  'lower back': 'Costas',
  traps: 'Costas',
  shoulders: 'Ombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Bíceps',
  quadriceps: 'Pernas',
  hamstrings: 'Pernas',
  adductors: 'Pernas',
  abductors: 'Pernas',
  calves: 'Pernas',
  glutes: 'Glúteos',
  abdominals: 'Abdômen',
  neck: 'Ombro',
}

export const MUSCLE_GROUPS = ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen'] as const

export const EQUIPMENT: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Halteres',
  machine: 'Máquina',
  cable: 'Polia',
  'body only': 'Peso corporal',
  kettlebells: 'Kettlebell',
  bands: 'Elástico',
  'medicine ball': 'Medicine ball',
  'exercise ball': 'Bola suíça',
  'e-z curl bar': 'Barra W',
  'foam roll': 'Rolo de liberação',
  other: 'Outro',
}

export const LEVELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  expert: 'Avançado',
}

export const MECHANICS: Record<string, string> = {
  compound: 'Composto',
  isolation: 'Isolado',
}

export const CATEGORIES: Record<string, string> = {
  strength: 'Força',
  stretching: 'Alongamento',
  plyometrics: 'Pliometria',
  cardio: 'Cardio',
  powerlifting: 'Powerlifting',
  'olympic weightlifting': 'Levantamento olímpico',
  strongman: 'Strongman',
}

export const toOptions = (map: Record<string, string>) =>
  Object.entries(map).map(([value, label]) => ({ value, label }))

export const groupOf = (primaryMuscles: string[] | null | undefined): string | null => {
  const first = primaryMuscles?.find((m) => MUSCLE_GROUP_OF[m])
  return first ? MUSCLE_GROUP_OF[first] : null
}
