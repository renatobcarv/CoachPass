import { describe, expect, it } from 'vitest'

import { getPasswordErrors } from '../../src/lib/passwordPolicy'

const context = { name: 'Maria Silva', email: 'maria.silva@coachpass.app' }

describe('passwordPolicy', () => {
  it('rejeita senha curta', () => {
    expect(getPasswordErrors('Ab1!', context).length).toBeGreaterThan(0)
  })
  it('rejeita sem maiúscula', () => {
    expect(getPasswordErrors('senha#forte1', context).some((m) => m.includes('maiúscula'))).toBe(true)
  })
  it('rejeita sem minúscula', () => {
    expect(getPasswordErrors('SENHA#FORTE1', context).some((m) => m.includes('minúscula'))).toBe(true)
  })
  it('rejeita sem número', () => {
    expect(getPasswordErrors('Senha#Forte', context).some((m) => m.includes('número'))).toBe(true)
  })
  it('rejeita sem especial', () => {
    expect(getPasswordErrors('SenhaForte1', context).some((m) => m.includes('especial'))).toBe(true)
  })
  it('rejeita espaços', () => {
    expect(getPasswordErrors('Senha #Forte1', context).some((m) => m.includes('espaços'))).toBe(true)
  })
  it('rejeita sequência 1234', () => {
    expect(getPasswordErrors('Senha#1234Aa', context).length).toBeGreaterThan(0)
  })
  it('rejeita qwerty', () => {
    expect(getPasswordErrors('Qwerty#Aa1x', context).length).toBeGreaterThan(0)
  })
  it('rejeita nome da pessoa', () => {
    expect(getPasswordErrors('Maria#Silva1', context).some((m) => m.includes('nome'))).toBe(true)
  })
  it('aceita senha forte e distinta', () => {
    expect(getPasswordErrors('Brisa#Lunar92', context)).toEqual([])
  })
})
