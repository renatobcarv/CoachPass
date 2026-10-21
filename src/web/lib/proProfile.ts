/**
 * Perfil complementar do profissional (respostas do quiz de onboarding além de área/registro/WhatsApp).
 * Ainda não há campos no backend para isso: fica salvo no navegador, por usuário, e personaliza o painel.
 */
export type ProProfile = {
  specialties: string[]
  experience: string
  clients: string
  workplaces: string[]
  priorities: string[]
}

const key = (userId: string | number) => `coachpass-pro-profile:${userId}`

export function loadProProfile(userId?: string | number | null): ProProfile | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as ProProfile) : null
  } catch {
    return null
  }
}

export function saveProProfile(userId: string | number, profile: ProProfile) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(profile))
  } catch {
    /* navegador sem storage: o painel usa os textos padrão */
  }
}

/** "Hipertrofia, Emagrecimento e Funcional" — para o cabeçalho do painel. */
export function specialtiesLine(profile: ProProfile | null, fallback: string) {
  const list = profile?.specialties || []
  if (!list.length) return fallback
  if (list.length === 1) return list[0]
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`
}
