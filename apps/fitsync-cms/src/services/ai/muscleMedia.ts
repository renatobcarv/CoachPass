/** Divisões da semana + mídia do músculo alvo. */

export type MuscleKey = 'Peito' | 'Costas' | 'Ombro' | 'Bíceps' | 'Tríceps' | 'Pernas' | 'Abdômen'

/** Diagramas anatômicos (silhueta com músculo destacado). */
export const MUSCLE_IMAGE: Record<MuscleKey, string> = {
  Peito: '/muscles/peito.svg',
  Costas: '/muscles/costas.svg',
  Ombro: '/muscles/ombro.svg',
  Bíceps: '/muscles/biceps.svg',
  Tríceps: '/muscles/triceps.svg',
  Pernas: '/muscles/pernas.svg',
  Abdômen: '/muscles/abdomen.svg',
}

export function normalizeMuscle(muscle?: string | null): MuscleKey | null {
  if (!muscle) return null
  const m = muscle.trim()
  if (m in MUSCLE_IMAGE) return m as MuscleKey
  const lower = m.toLowerCase()
  if (lower.includes('peito') || lower.includes('chest')) return 'Peito'
  if (lower.includes('costa') || lower.includes('back')) return 'Costas'
  if (lower.includes('ombro') || lower.includes('shoulder')) return 'Ombro'
  if (lower.includes('bíceps') || lower.includes('biceps')) return 'Bíceps'
  if (lower.includes('tríceps') || lower.includes('triceps')) return 'Tríceps'
  if (lower.includes('perna') || lower.includes('leg') || lower.includes('quad')) return 'Pernas'
  if (lower.includes('abd') || lower.includes('core')) return 'Abdômen'
  return null
}

export function muscleImageFor(muscle?: string | null): string {
  const key = normalizeMuscle(muscle)
  return key ? MUSCLE_IMAGE[key] : '/muscles/geral.svg'
}

export function youtubeTutorialUrl(exerciseName: string): string {
  const q = encodeURIComponent(`como fazer ${exerciseName} exercício execução correta`)
  return `https://www.youtube.com/results?search_query=${q}`
}

export function defaultInstructions(
  exerciseName: string,
  muscle?: string | null,
  equipment?: string | null,
): string {
  const eq = equipment ? ` Equipamento: ${equipment}.` : ''
  const focus = muscle ? ` Foque no músculo ${muscle}.` : ''
  return (
    `Execute ${exerciseName} com controle na ida e na volta, sem balançar o corpo.` +
    focus +
    eq +
    ' Expire no esforço e mantenha a coluna estável. Pare se sentir dor aguda.'
  )
}

export type SplitTemplate = {
  weekday: string
  weekdayLabel: string
  primary: MuscleKey
  secondary: MuscleKey
  title: string
  splitLabel: string
}

/** Semana padrão PPL / upper-lower híbrido. */
export const WEEK_SPLITS: SplitTemplate[] = [
  {
    weekday: 'monday',
    weekdayLabel: 'Segunda',
    primary: 'Costas',
    secondary: 'Bíceps',
    title: 'Treino de costas e bíceps',
    splitLabel: 'Costas + Bíceps',
  },
  {
    weekday: 'tuesday',
    weekdayLabel: 'Terça',
    primary: 'Peito',
    secondary: 'Tríceps',
    title: 'Treino de peito e tríceps',
    splitLabel: 'Peito + Tríceps',
  },
  {
    weekday: 'wednesday',
    weekdayLabel: 'Quarta',
    primary: 'Pernas',
    secondary: 'Abdômen',
    title: 'Treino de pernas e abdômen',
    splitLabel: 'Pernas + Abdômen',
  },
  {
    weekday: 'thursday',
    weekdayLabel: 'Quinta',
    primary: 'Ombro',
    secondary: 'Abdômen',
    title: 'Treino de ombro e core',
    splitLabel: 'Ombro + Abdômen',
  },
  {
    weekday: 'friday',
    weekdayLabel: 'Sexta',
    primary: 'Peito',
    secondary: 'Costas',
    title: 'Treino de peito e costas',
    splitLabel: 'Peito + Costas',
  },
  {
    weekday: 'saturday',
    weekdayLabel: 'Sábado',
    primary: 'Pernas',
    secondary: 'Abdômen',
    title: 'Treino de pernas (volume)',
    splitLabel: 'Pernas + Abdômen',
  },
]

/** Quantos dias da semana gerar (perfil do aluno, 3–6). */
export function weekSplitsForProfile(trainingDaysPerWeek?: number | null): SplitTemplate[] {
  const days = Math.min(6, Math.max(3, Number(trainingDaysPerWeek) || 5))
  return WEEK_SPLITS.slice(0, days)
}

/** @deprecated use weekSplitsForProfile */
export const SPLIT_TEMPLATES = WEEK_SPLITS

export function pickSplitTemplate(usedWeekdays: string[] = []): SplitTemplate {
  const unused = WEEK_SPLITS.filter((t) => !usedWeekdays.includes(t.weekday))
  const pool = unused.length ? unused : WEEK_SPLITS
  return pool[Math.floor(Math.random() * pool.length)]!
}
