import { describe, expect, it } from 'vitest'

import { coerceNumericRelations, toNumericRelationId } from '../../src/access/relationIds'

describe('IDs de relationship (SHARED-001)', () => {
  it('aceita number positivo e string numérica', () => {
    expect(toNumericRelationId(51)).toBe(51)
    expect(toNumericRelationId('51')).toBe(51)
  })

  it('extrai id de documento populado', () => {
    expect(toNumericRelationId({ id: 51, name: 'petter pablo' })).toBe(51)
    expect(toNumericRelationId({ id: '12' })).toBe(12)
  })

  it('rejeita índice 0, vazio e texto', () => {
    expect(toNumericRelationId(0)).toBeNull()
    expect(toNumericRelationId('0')).toBeNull()
    expect(toNumericRelationId('')).toBeNull()
    expect(toNumericRelationId('abc')).toBeNull()
    expect(toNumericRelationId(null)).toBeNull()
  })

  it('grava number no campo sem inventar id inválido', () => {
    const data = { student: '51', author: { id: 7 }, title: 'A' }
    coerceNumericRelations(data, ['student', 'author'])
    expect(data.student).toBe(51)
    expect(data.author).toBe(7)
    expect(data.title).toBe('A')

    const invalid = { student: '0' }
    coerceNumericRelations(invalid, ['student'])
    expect(invalid.student).toBe('0')
  })
})
