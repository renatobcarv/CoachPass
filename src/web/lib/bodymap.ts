/**
 * Ilustrações de "parte do corpo trabalhada" (public/muscles/*.svg).
 * Aceita os grupos do CoachPass ("Peito") e os músculos da MuscleWiki ("Chest", "Quads"...).
 */
const MAP: Record<string, string> = {
  peito: 'peito',
  chest: 'peito',
  peitoral: 'peito',
  costas: 'costas',
  lats: 'costas',
  'traps (mid-back)': 'costas',
  traps: 'costas',
  'lower back': 'costas',
  dorsal: 'costas',
  lombar: 'costas',
  ombro: 'ombro',
  ombros: 'ombro',
  shoulders: 'ombro',
  bíceps: 'biceps',
  biceps: 'biceps',
  forearms: 'biceps',
  tríceps: 'triceps',
  triceps: 'triceps',
  pernas: 'pernas',
  quadríceps: 'pernas',
  quads: 'pernas',
  hamstrings: 'pernas',
  glutes: 'pernas',
  glúteos: 'pernas',
  calves: 'pernas',
  panturrilha: 'pernas',
  abductors: 'pernas',
  adductors: 'pernas',
  abdômen: 'abdomen',
  abdomen: 'abdomen',
  abdominals: 'abdomen',
  obliques: 'abdomen',
}

export function bodymapFor(...muscles: (string | null | undefined)[]) {
  for (const m of muscles) {
    const key = m?.toLowerCase().trim()
    if (key && MAP[key]) return `/muscles/${MAP[key]}.svg`
  }
  return '/muscles/geral.svg'
}
