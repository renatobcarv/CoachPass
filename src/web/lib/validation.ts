/**
 * Máscaras e validações dos formulários (espelham as regras do servidor em src/collections/validators.ts).
 */

export const onlyDigits = (v: string) => v.replace(/\D/g, '')

/** (11) 98765-4321 · (11) 3456-7890 — formata enquanto digita, no máximo 11 dígitos. */
export function maskPhoneBR(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** DDD + número: 10 dígitos (fixo) ou 11 (celular começando com 9). */
export function isValidPhoneBR(value: string) {
  const d = onlyDigits(value)
  if (d.length !== 10 && d.length !== 11) return false
  const ddd = Number(d.slice(0, 2))
  if (ddd < 11 || ddd > 99) return false
  if (d.length === 11 && d[2] !== '9') return false
  return true
}

export function phoneError(value: string, required: boolean): string | null {
  if (!onlyDigits(value)) return required ? 'Informe o telefone com DDD.' : null
  if (onlyDigits(value).length < 10) return 'Número incompleto: informe DDD + número (10 ou 11 dígitos).'
  return isValidPhoneBR(value) ? null : 'Telefone inválido. Confira o DDD e o número.'
}

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/** Nome com pelo menos 2 letras, sem números/símbolos estranhos. */
export function nameError(v: string): string | null {
  const t = v.trim()
  if (t.length < 2) return 'Informe seu nome.'
  if (t.length > 120) return 'Nome muito longo.'
  if (!/^[A-Za-zÀ-ÿ' .-]+$/.test(t)) return 'Use apenas letras no nome.'
  return null
}

export type PasswordCheck = { label: string; ok: boolean }

export function passwordChecks(p: string): PasswordCheck[] {
  return [
    { label: 'Pelo menos 8 caracteres', ok: p.length >= 8 },
    { label: 'Uma letra', ok: /[A-Za-zÀ-ÿ]/.test(p) },
    { label: 'Um número', ok: /\d/.test(p) },
    { label: 'Um caractere especial (recomendado)', ok: /[^A-Za-zÀ-ÿ0-9]/.test(p) },
  ]
}

/** Obrigatórios: 8+, letra e número (o caractere especial só aumenta a força). */
export const isStrongEnough = (p: string) => p.length >= 8 && p.length <= 128 && /[A-Za-zÀ-ÿ]/.test(p) && /\d/.test(p)

export function passwordStrength(p: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!p) return { score: 0, label: '' }
  let score = passwordChecks(p).filter((c) => c.ok).length
  if (p.length >= 12) score += 1
  const s = Math.min(4, Math.max(1, score - 1)) as 1 | 2 | 3 | 4
  if (!isStrongEnough(p)) return { score: 1, label: 'Fraca' }
  return { score: s, label: ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][s] }
}

/** Data de nascimento plausível: entre 10 e 100 anos. */
export function birthDateError(iso: string): string | null {
  if (!iso) return 'Informe sua data de nascimento.'
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return 'Data inválida.'
  const now = new Date()
  const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
  if (d > now) return 'A data não pode estar no futuro.'
  if (age < 10) return 'Idade mínima: 10 anos.'
  if (age > 100) return 'Confira o ano de nascimento.'
  return null
}

export const birthDateBounds = () => {
  const now = new Date()
  const iso = (y: number) => `${y}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { min: iso(now.getFullYear() - 100), max: iso(now.getFullYear() - 10) }
}

/** Faixas aceitas pelo servidor (StudentProfiles). */
export const RANGES = {
  heightCm: { min: 50, max: 250, label: 'Altura entre 50 e 250 cm.' },
  weightKg: { min: 20, max: 400, label: 'Peso entre 20 e 400 kg.' },
  bodyFatPercent: { min: 1, max: 70, label: '% de gordura entre 1 e 70.' },
  sessionMinutes: { min: 15, max: 180, label: 'Duração entre 15 e 180 min.' },
  trainingDaysPerWeek: { min: 1, max: 7, label: 'Entre 1 e 7 dias.' },
} as const

export function rangeError(key: keyof typeof RANGES, value: string, required = false): string | null {
  if (value === '' || value == null) return required ? 'Campo obrigatório.' : null
  const n = Number(String(value).replace(',', '.'))
  const r = RANGES[key]
  return Number.isFinite(n) && n >= r.min && n <= r.max ? null : r.label
}

/** CREF (ex.: 123456-G/SP) ou CRN (ex.: 12345/SP): número + UF. */
export function credentialError(value: string, type: 'personal' | 'nutritionist'): string | null {
  const t = value.trim().toUpperCase()
  if (!t) return `Informe seu ${type === 'nutritionist' ? 'CRN' : 'CREF'}.`
  const ok =
    type === 'nutritionist'
      ? /^(CRN-?\d{1,2}\s*)?\d{3,7}\s*\/?\s*[A-Z]{2}$/.test(t) || /^\d{3,7}(-[A-Z])?\s*\/\s*[A-Z]{2}$/.test(t)
      : /^\d{4,7}\s*-?\s*[GP]\s*\/\s*[A-Z]{2}$/.test(t)
  return ok
    ? null
    : type === 'nutritionist'
      ? 'Formato esperado: número/UF (ex.: 12345/SP).'
      : 'Formato esperado: número-G/UF (ex.: 123456-G/SP).'
}
