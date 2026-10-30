/**
 * Validações compartilhadas no servidor (a mesma regra roda no front, mas só aqui é garantida).
 */

/** Telefone BR com DDD: 10 (fixo) ou 11 (celular) dígitos; DDD 11–99; celular começa com 9. */
export function isValidBrazilPhone(value: unknown): boolean {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length !== 10 && digits.length !== 11) return false
  const ddd = Number(digits.slice(0, 2))
  if (ddd < 11 || ddd > 99) return false
  if (digits.length === 11 && digits[2] !== '9') return false
  return true
}

/** Validador de campo Payload para telefone (aceita vazio quando o campo não é obrigatório). */
export const phoneField =
  (required: boolean) =>
  (value: unknown): true | string => {
    if (!value) return required ? 'Informe o telefone com DDD.' : true
    return isValidBrazilPhone(value) || 'Telefone inválido: use DDD + número (10 ou 11 dígitos).'
  }

/** Política de senha: 8–128 caracteres, com pelo menos uma letra e um número. */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (password.length > 128) return 'A senha pode ter no máximo 128 caracteres.'
  if (!/[A-Za-zÀ-ÿ]/.test(password)) return 'A senha precisa ter pelo menos uma letra.'
  if (!/\d/.test(password)) return 'A senha precisa ter pelo menos um número.'
  return null
}
