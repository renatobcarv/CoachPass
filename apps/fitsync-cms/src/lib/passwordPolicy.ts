/**
 * Política de senha do CoachPass. Usada no frontend (feedback em tempo real)
 * e no backend (hook `beforeOperation` da coleção `users`), então precisa
 * continuar sem dependências de browser ou de Node.
 */

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export type PasswordRuleId =
  | 'length'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'special'
  | 'noSpaces'
  | 'noSequence'
  | 'notPersonal'

export interface PasswordRuleResult {
  id: PasswordRuleId
  label: string
  message: string
  met: boolean
}

export interface PasswordContext {
  name?: string | null
  email?: string | null
}

const SEQUENCE_WINDOW = 4

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', 'qazwsxedc']

const NAME_STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'del', 'van', 'von'])

const LEET_VARIANTS: Array<Record<string, string>> = [
  { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i', '+': 't' },
  { '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'l', '|': 'l' },
]

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function lettersOnly(value: string): string {
  return value.replace(/[^a-z]/g, '')
}

function reverse(value: string): string {
  return [...value].reverse().join('')
}

function isStepSequence(chunk: string): boolean {
  if (!/^[a-z0-9]+$/.test(chunk)) return false
  const codes = [...chunk].map((c) => c.charCodeAt(0))
  const step = codes[1] - codes[0]
  if (step !== 1 && step !== -1) return false
  return codes.every((code, i) => i === 0 || code - codes[i - 1] === step)
}

function isKeyboardSequence(chunk: string): boolean {
  return KEYBOARD_ROWS.some((row) => row.includes(chunk) || reverse(row).includes(chunk))
}

export function hasObviousPattern(password: string): boolean {
  const lower = password.toLowerCase()
  if (lower.length >= 2 && /^(.+?)\1+$/su.test(lower)) return true

  const chars = [...lower]
  for (let i = 0; i + SEQUENCE_WINDOW <= chars.length; i++) {
    const chunk = chars.slice(i, i + SEQUENCE_WINDOW).join('')
    if (chars.slice(i, i + SEQUENCE_WINDOW).every((c) => c === chars[i])) return true
    if (isStepSequence(chunk) || isKeyboardSequence(chunk)) return true
  }
  return false
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonal = temp
    }
  }
  return prev[b.length]
}

function containsApproximately(haystack: string, token: string): boolean {
  for (let size = token.length - 1; size <= token.length + 1; size++) {
    for (let i = 0; i + size <= haystack.length; i++) {
      if (levenshtein(haystack.slice(i, i + size), token) <= 1) return true
    }
  }
  return false
}

function personalTokens({ name, email }: PasswordContext): string[] {
  const tokens = new Set<string>()
  const nameParts = normalizeText(name ?? '')
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3 && !NAME_STOPWORDS.has(t))
  for (const part of nameParts) tokens.add(part)
  if (nameParts.length > 1) tokens.add(nameParts.join(''))

  const localPart = normalizeText((email ?? '').split('@')[0] ?? '')
  for (const part of localPart.split(/[^a-z]+/)) {
    if (part.length >= 4) tokens.add(part)
  }

  for (const token of [...tokens]) tokens.add(reverse(token))
  return [...tokens]
}

export function resemblesPersonalInfo(password: string, context: PasswordContext): boolean {
  const tokens = personalTokens(context)
  if (tokens.length === 0) return false

  const normalized = normalizeText(password)
  const variants = new Set<string>([lettersOnly(normalized)])
  for (const map of LEET_VARIANTS) {
    variants.add(lettersOnly([...normalized].map((c) => map[c] ?? c).join('')))
  }

  for (const variant of variants) {
    if (!variant) continue
    for (const token of tokens) {
      if (token.length === 3) {
        if (variant.startsWith(token) || variant.endsWith(token)) return true
        continue
      }
      if (variant.includes(token)) return true
      if (token.length >= 5 && containsApproximately(variant, token)) return true
    }
  }
  return false
}

export function checkPassword(password: string, context: PasswordContext = {}): PasswordRuleResult[] {
  const value = password ?? ''
  return [
    {
      id: 'length',
      label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
      message: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`,
      met: [...value].length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: 'uppercase',
      label: 'Uma letra maiúscula',
      message: 'Inclua pelo menos uma letra maiúscula.',
      met: /\p{Lu}/u.test(value),
    },
    {
      id: 'lowercase',
      label: 'Uma letra minúscula',
      message: 'Inclua pelo menos uma letra minúscula.',
      met: /\p{Ll}/u.test(value),
    },
    {
      id: 'number',
      label: 'Um número',
      message: 'Inclua pelo menos um número.',
      met: /\p{Nd}/u.test(value),
    },
    {
      id: 'special',
      label: 'Um caractere especial (@ # $ % & * !)',
      message: 'Inclua pelo menos um caractere especial, como @ # $ % & * !.',
      met: /[^\p{L}\p{N}\s]/u.test(value),
    },
    {
      id: 'noSpaces',
      label: 'Sem espaços',
      message: 'A senha não pode conter espaços.',
      met: !/\s/u.test(value),
    },
    {
      id: 'noSequence',
      label: 'Sem sequências ou repetições (1234, abcd, qwerty, aaaa)',
      message: 'Evite sequências óbvias (como 1234, abcd ou qwerty) e repetições (como aaaa).',
      met: value.length > 0 && !hasObviousPattern(value),
    },
    {
      id: 'notPersonal',
      label: 'Diferente do seu nome e e-mail',
      message: 'A senha não pode ser igual ou parecida com seu nome ou e-mail.',
      met: value.length > 0 && !resemblesPersonalInfo(value, context),
    },
  ]
}

export function getPasswordErrors(password: string, context: PasswordContext = {}): string[] {
  const errors = checkPassword(password, context)
    .filter((rule) => !rule.met)
    .map((rule) => rule.message)
  if ([...(password ?? '')].length > PASSWORD_MAX_LENGTH) {
    errors.push(`A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`)
  }
  return errors
}
