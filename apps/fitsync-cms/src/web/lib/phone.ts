/** Máscara (99) 99999-9999: só dígitos, no máximo 11. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  if (rest.length <= 5) return `(${ddd}) ${rest}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}
