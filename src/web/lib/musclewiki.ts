/**
 * Cliente da biblioteca MuscleWiki via proxy do próprio app (/api/musclewiki).
 * A chave da API fica no servidor; aqui só usamos o JWT do usuário logado.
 */
import { CMS_BASE_URL, PayloadApiError, getJson } from '@/lib/cms'

const MW_API = `${CMS_BASE_URL}/api/musclewiki`
const MW_BASE = 'https://api.musclewiki.com'

export type MwVideo = { url: string | null; angle: string; gender: string; og_image?: string | null }

export type MwExercise = {
  id: number
  name: string
  primary_muscles?: string[]
  secondary_muscles?: string[] | null
  tertiary_muscles?: string[] | null
  category?: string
  force?: string | null
  grips?: string[]
  mechanic?: string | null
  difficulty?: string | null
  steps?: string[]
  videos?: MwVideo[]
}

export type MwList = { total: number; limit: number; offset: number; count: number; results: { id: number; name: string }[] }

export type MwErrorCode = 'MW_PLAN' | 'MW_QUOTA' | 'MW_AUTH' | 'MW_NOKEY' | 'MW_NOT_FOUND' | 'MW_ERROR'

export class MwError extends Error {
  constructor(public code: MwErrorCode, message: string) {
    super(message)
  }
}

async function call<T>(params: Record<string, string | number | undefined>, token: string): Promise<T> {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') qs.set(k, String(v))
  try {
    return await getJson<T>(`${MW_API}?${qs.toString()}`, token)
  } catch (err) {
    if (err instanceof PayloadApiError) {
      const data = (err.data || {}) as { code?: MwErrorCode; error?: string }
      throw new MwError(data.code || 'MW_ERROR', data.error || 'Falha ao consultar a MuscleWiki.')
    }
    throw new MwError('MW_ERROR', 'Falha ao consultar a MuscleWiki.')
  }
}

export const mwList = (
  token: string,
  f: { muscles?: string; category?: string; difficulty?: string; limit?: number; offset?: number },
) => call<MwList>({ op: 'list', ...f }, token)

export const mwSearch = (
  token: string,
  q: string,
  f: { muscles?: string; category?: string; difficulty?: string; limit?: number } = {},
) => call<MwExercise[]>({ op: 'search', q, ...f }, token)

export const mwExercise = (token: string, id: number, gender?: 'male' | 'female') =>
  call<MwExercise>({ op: 'exercise', id, gender }, token)

let tokenCache: { token: string; exp: number } | null = null
/** Token de mídia (15 min) para tocar os vídeos sem expor a chave. */
export async function mwMediaToken(token: string) {
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token
  const res = await call<{ token: string; expires_in?: number }>({ op: 'token' }, token)
  tokenCache = { token: res.token, exp: Date.now() + Math.max(60, (res.expires_in || 900) - 60) * 1000 }
  return res.token
}

/** Monta a URL tocável do vídeo (anexa o token de mídia quando é um /stream da API). */
export function mwVideoSrc(url: string | null | undefined, mediaToken: string | null) {
  if (!url) return null
  const abs = url.startsWith('http') ? url : `${MW_BASE}${url.startsWith('/') ? '' : '/'}${url}`
  if (!abs.includes('/stream/')) return abs
  if (!mediaToken) return null
  return `${abs}${abs.includes('?') ? '&' : '?'}token=${encodeURIComponent(mediaToken)}`
}

/** Mapa do corpo do exercício (músculos destacados) servido pela API — requer token de mídia. */
export function mwBodymapSrc(
  exerciseId: number,
  mediaToken: string | null,
  opts: { gender?: 'male' | 'female'; view?: 'front' | 'back'; theme?: 'light' | 'dark' } = {},
) {
  if (!mediaToken) return null
  const qs = new URLSearchParams({
    gender: opts.gender || 'male',
    view: opts.view || 'front',
    theme: opts.theme || 'light',
    token: mediaToken,
  })
  return `${MW_BASE}/stream/images/bodymaps/${exerciseId}?${qs.toString()}`
}

/* ---------- Mapas PT ↔ MuscleWiki ---------- */

/** Grupos usados no CoachPass → músculos primários da MuscleWiki. */
export const MW_GROUP_MUSCLES: Record<string, string> = {
  Peito: 'Chest',
  Costas: 'Lats,Traps (mid-back),Lower back',
  Ombro: 'Shoulders',
  Bíceps: 'Biceps',
  Tríceps: 'Triceps',
  Pernas: 'Quads,Hamstrings,Glutes,Calves',
  Abdômen: 'Abdominals,Obliques',
}

const DIFFICULTY_PT: Record<string, string> = {
  novice: 'Novato',
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

const CATEGORY_PT: Record<string, string> = {
  barbell: 'Barra',
  dumbbells: 'Halteres',
  dumbbell: 'Halteres',
  bodyweight: 'Peso corporal',
  cables: 'Cabo / polia',
  cable: 'Cabo / polia',
  machine: 'Máquina',
  kettlebells: 'Kettlebell',
  kettlebell: 'Kettlebell',
  band: 'Elástico',
  plate: 'Anilha',
  stretches: 'Alongamento',
  yoga: 'Yoga',
  trx: 'TRX',
  'smith-machine': 'Smith',
  'medicine-ball': 'Medicine ball',
  bosu: 'Bosu',
  cardio: 'Cardio',
}

const MUSCLE_PT: Record<string, string> = {
  chest: 'Peitoral',
  lats: 'Dorsal',
  'traps (mid-back)': 'Trapézio médio',
  traps: 'Trapézio',
  'lower back': 'Lombar',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraço',
  quads: 'Quadríceps',
  hamstrings: 'Posterior de coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilha',
  abdominals: 'Abdômen',
  obliques: 'Oblíquos',
  abductors: 'Abdutores',
  adductors: 'Adutores',
  neck: 'Pescoço',
}

const tr = (map: Record<string, string>, v?: string | null) => (v ? map[v.toLowerCase()] || v : '')

export const mwDifficultyPt = (v?: string | null) => tr(DIFFICULTY_PT, v)
export const mwCategoryPt = (v?: string | null) => tr(CATEGORY_PT, v)
export const mwMusclePt = (v?: string | null) => tr(MUSCLE_PT, v)
export const mwMechanicPt = (v?: string | null) =>
  !v ? '' : /compound/i.test(v) ? 'Multiarticular (composto)' : /isolation/i.test(v) ? 'Monoarticular (isolado)' : v
export const mwForcePt = (v?: string | null) =>
  !v ? '' : /push/i.test(v) ? 'Empurrar' : /pull/i.test(v) ? 'Puxar' : /hold/i.test(v) ? 'Sustentação' : v

/** Dificuldade CoachPass → filtro da API. */
export const MW_DIFFICULTY: Record<string, string> = {
  Iniciante: 'Beginner',
  Intermediário: 'Intermediate',
  Avançado: 'Advanced',
}

export const mwErrorHelp: Record<MwErrorCode, string> = {
  MW_PLAN: 'A conta MuscleWiki está no plano gratuito (BASIC), que só funciona no Playground do site. Faça upgrade para TESTING ou superior para liberar a biblioteca com vídeos.',
  MW_QUOTA: 'A cota mensal de chamadas da MuscleWiki acabou. Ela renova no próximo ciclo.',
  MW_AUTH: 'A chave da MuscleWiki foi recusada. Confira a variável MUSCLEWIKI_API_KEY no servidor.',
  MW_NOKEY: 'A chave da MuscleWiki não está configurada no servidor.',
  MW_NOT_FOUND: 'Exercício não encontrado na MuscleWiki.',
  MW_ERROR: 'Não foi possível falar com a MuscleWiki agora.',
}
