import React, { useEffect, useId, useState } from 'react'
import { Users } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { fetchLinkedPeople, type LinkedPerson } from '../../lib/professionalApi'
import { EmptyState } from '../student/ui'

/** Peças comuns das telas de registro do profissional (avaliação, agenda, restrições, anamnese, consulta). */

export const errorText = (err: unknown, fallback: string) =>
  (err instanceof PayloadApiError ? extractPayloadMessage(err.data) || err.message : err instanceof Error ? err.message : '') || fallback

/** "2026-11-04" → "04/11/2026" sem deslocar o fuso. */
export function fmtDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Data do formulário (yyyy-mm-dd) salva ao meio-dia UTC, para não virar o dia anterior no Brasil. */
export const dateToApi = (ymd: string) => (ymd ? `${ymd}T12:00:00.000Z` : undefined)

/** Converte o texto do campo em número (aceita vírgula). Vazio vira undefined. */
export function num(v: string): number | undefined {
  const t = v.trim().replace(',', '.')
  if (!t) return undefined
  const n = Number(t)
  return Number.isFinite(n) ? n : undefined
}

export function fmtNum(n?: number | null, digits = 1): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', { maximumFractionDigits: digits })
}

/** Alunos/pacientes com vínculo ativo do profissional logado. */
export function useLinkedPeople() {
  const { user } = useAuth()
  const role = user?.role === 'nutritionist' ? 'nutritionist' : 'personal'
  const [people, setPeople] = useState<LinkedPerson[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!user?.accessToken || !user.id) return
    fetchLinkedPeople(String(user.id), role, user.accessToken, 'active')
      .then(setPeople)
      .catch((err) => {
        setPeople([])
        setError(errorText(err, 'Não foi possível carregar a lista.'))
      })
  }, [user?.accessToken, user?.id, role])
  return { people, error, role, who: role === 'nutritionist' ? 'paciente' : 'aluno' }
}

export function PersonSelect({
  people,
  value,
  onChange,
  who,
  id,
}: {
  people: LinkedPerson[]
  value: string
  onChange: (id: string) => void
  who: string
  id?: string
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="cp-field !pl-4">
      <option value="">Escolha o {who}</option>
      {people.map((p) => (
        <option key={p.userId} value={p.userId}>
          {p.name}
          {p.email ? ` · ${p.email}` : ''}
        </option>
      ))}
    </select>
  )
}

export function NoPeople({ who }: { who: string }) {
  return (
    <EmptyState icon={Users} title={`Nenhum ${who} vinculado`}>
      Convide pelo painel com o e-mail da pessoa. Depois que ela aceitar o convite, os registros ficam disponíveis aqui.
    </EmptyState>
  )
}

/** Campo com rótulo; o valor fica como texto para aceitar vírgula. */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  unit,
  placeholder,
  inputMode,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'date' | 'time' | 'number'
  unit?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  className?: string
}) {
  const id = useId()
  const numeric = type === 'number'
  return (
    <div className={className}>
      <label htmlFor={id} className="cp-mono mb-2 block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
        {unit && <span className="ml-1 normal-case tracking-normal text-[var(--dim)]">({unit})</span>}
      </label>
      <input
        id={id}
        type={numeric ? 'text' : type}
        inputMode={inputMode ?? (numeric ? 'decimal' : undefined)}
        value={value}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/[^\d.,]/g, '') : e.target.value)}
        placeholder={placeholder}
        className="cp-field !h-12 !pl-4"
      />
    </div>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="cp-mono mb-2 block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </label>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={4000} className="cp-field" />
    </div>
  )
}

export function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <fieldset>
      <legend className="cp-mono mb-2 block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-10 rounded-full border px-4 text-[13.5px] transition-colors ${
              value === o.value ? 'border-transparent bg-white text-black' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** Nota de 0 a 10 em botões. */
export function Score({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <fieldset>
      <legend className="cp-mono mb-2 block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        {label} <span className="normal-case tracking-normal text-[var(--dim)]">(0 a 10)</span>
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            onClick={() => onChange(value === n ? null : n)}
            className={`h-9 w-9 rounded-full border text-[13px] transition-colors ${
              value === n ? 'border-transparent bg-white font-semibold text-black' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

/** Diferença entre duas medidas, com seta e cor neutra (o profissional interpreta). */
export function Delta({ now, before, unit = '', digits = 1 }: { now?: number | null; before?: number | null; unit?: string; digits?: number }) {
  if (now == null || before == null) return null
  const d = now - before
  if (Math.abs(d) < 10 ** -digits / 2) return <span className="text-[12px] text-[var(--dim)]">= igual</span>
  return (
    <span className="cp-mono text-[12px] text-[var(--muted)]">
      {d > 0 ? '▲ +' : '▼ '}
      {fmtNum(d, digits)}
      {unit}
    </span>
  )
}
