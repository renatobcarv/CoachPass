/**
 * IDs do PostgreSQL neste projeto são number.
 * O Payload só aceita relationship quando `typeof value === 'number'`.
 * A string `"51"` vira a mensagem "invalid relationships: 51 0":
 * o 51 é o valor rejeitado e o 0 é o índice interno, não um segundo usuário.
 */
export function toNumericRelationId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const raw =
    typeof value === 'object' && value !== null && 'id' in value
      ? (value as { id: unknown }).id
      : value

  if (typeof raw === 'number') {
    return Number.isSafeInteger(raw) && raw > 0 ? raw : null
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!/^[1-9]\d*$/.test(trimmed)) return null
    const parsed = Number(trimmed)
    return Number.isSafeInteger(parsed) ? parsed : null
  }

  return null
}

export function coerceNumericRelations(
  data: object | null | undefined,
  fields: readonly string[],
): void {
  if (!data) return
  const record = data as Record<string, unknown>
  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) continue
    const current = record[field]
    if (current === undefined || current === null || current === '') continue
    const id = toNumericRelationId(current)
    if (id !== null) record[field] = id
  }
}
