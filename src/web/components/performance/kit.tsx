import React from 'react'
import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** Base da rota conforme o painel (aluno vê o próprio; personal vê o do aluno). */
export type Scope = { studentId: string | null; base: string; isCoach: boolean }

export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', opts) : '—'
export const fmtWeek = (isoDay: string) => fmtDate(`${isoDay}T12:00:00Z`)
export const kg = (n: number | null | undefined, digits = 1) =>
  n == null ? '—' : `${n.toLocaleString('pt-BR', { maximumFractionDigits: digits })} kg`
export const num = (n: number | null | undefined, digits = 1) => (n == null ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: digits }))

export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  on_track: { label: 'No alvo', color: 'var(--teal)', bg: 'rgba(46,230,200,0.12)' },
  ahead: { label: 'Acima do esperado', color: 'var(--brand-300)', bg: 'rgba(140,130,255,0.14)' },
  behind: { label: 'Abaixo do esperado', color: 'var(--amber)', bg: 'rgba(255,181,71,0.12)' },
  attention: { label: 'Atenção', color: '#ff8a95', bg: 'rgba(255,93,108,0.12)' },
  no_data: { label: 'Sem registros', color: 'var(--muted)', bg: 'rgba(255,255,255,0.05)' },
  upcoming: { label: 'Próxima', color: 'var(--dim)', bg: 'rgba(255,255,255,0.03)' },
}

export function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.no_data
  return (
    <span className="cp-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em]" style={{ color: m.color, background: m.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  )
}

export const GOAL_LABEL: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  strength: 'Força',
  fat_loss: 'Emagrecimento',
  recomposition: 'Recomposição',
  conditioning: 'Condicionamento',
  performance: 'Performance',
}
export const LEVEL_LABEL: Record<string, string> = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' }
export const PHASE_KIND_LABEL: Record<string, string> = {
  adaptation: 'Adaptação',
  accumulation: 'Acumulação',
  hypertrophy: 'Hipertrofia',
  strength: 'Força',
  intensification: 'Intensificação',
  power: 'Potência',
  realization: 'Realização',
  deload: 'Deload',
  transition: 'Transição',
  cutting: 'Definição',
}
export const PHASE_COLOR: Record<string, string> = {
  adaptation: '#38d6f5',
  accumulation: '#5546ff',
  hypertrophy: '#8c82ff',
  strength: '#ff8a5c',
  intensification: '#ffb547',
  power: '#f59e0b',
  realization: '#ff5d6c',
  deload: '#2ee6c8',
  transition: '#6b7290',
  cutting: '#c4bfff',
}
export const DIET_LABEL: Record<string, string> = { deficit: 'Déficit', maintenance: 'Manutenção', surplus: 'Superávit', diet_break: 'Diet break' }

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: Array<{ id: T; label: string }> }) {
  return (
    <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {items.map((it) => {
        const active = it.id === value
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(it.id)}
            className={`relative h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold transition-colors ${active ? 'text-[var(--paper-ink)]' : 'text-[var(--muted)] hover:text-white'}`}
          >
            {active && <motion.span layoutId={`tabs-${items.map((i) => i.id).join('')}`} className="absolute inset-0 rounded-full bg-[var(--paper)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Select({ value, onChange, children, label }: { value: string; onChange: (v: string) => void; children: React.ReactNode; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)]">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-[var(--line-2)] bg-[var(--ink-2)] px-3 text-[13.5px] text-white outline-none focus:border-[var(--brand-400)]"
      >
        {children}
      </select>
    </label>
  )
}

/** Campo numérico com − / + grandes (registro rápido no celular). */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix,
  label,
  placeholder,
  width = 'w-[64px]',
}: {
  value: number | null
  onChange: (v: number | null) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  label: string
  placeholder?: string
  width?: string
}) {
  const set = (v: number | null) => onChange(v == null ? null : Math.min(max, Math.max(min, Math.round(v * 100) / 100)))
  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--line-2)] bg-[var(--ink-2)]">
      <button type="button" aria-label={`Diminuir ${label}`} onClick={() => set((value ?? 0) - step)} className="grid h-11 w-9 place-items-center text-[var(--muted)] hover:text-white">
        <Minus className="h-4 w-4" />
      </button>
      <input
        aria-label={label}
        inputMode="decimal"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.')
          if (raw === '') return onChange(null)
          const n = Number(raw)
          if (Number.isFinite(n)) set(n)
        }}
        className={`${width} bg-transparent text-center text-[16px] font-semibold tabular-nums outline-none placeholder:text-[var(--dim)]`}
      />
      {suffix && <span className="pr-1 text-[11px] text-[var(--dim)]">{suffix}</span>}
      <button type="button" aria-label={`Aumentar ${label}`} onClick={() => set((value ?? 0) + step)} className="grid h-11 w-9 place-items-center text-[var(--muted)] hover:text-white">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="cp-mono mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-[var(--dim)]">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'h-11 w-full rounded-xl border border-[var(--line-2)] bg-[var(--ink-2)] px-3 text-[14.5px] text-white outline-none placeholder:text-[var(--dim)] focus:border-[var(--brand-400)]'

export function PrimaryButton({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--paper)] px-6 text-[15px] font-semibold text-[var(--paper-ink)] transition hover:bg-white active:scale-[0.98] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}
export function GhostButton({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--line-2)] px-4 text-[14px] font-semibold text-[var(--muted)] transition hover:border-white hover:text-white disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

// ---------- Gráficos (cores sólidas da marca) ----------

const AXIS = { stroke: 'rgba(232,236,255,0.25)', fontSize: 11 }
const tooltipStyle = {
  contentStyle: { background: '#10131f', border: '1px solid rgba(232,236,255,0.15)', borderRadius: 12, fontSize: 12.5 },
  labelStyle: { color: '#9aa1b8' },
}

export function LineSeriesChart({
  data,
  xKey,
  series,
  band,
  height = 220,
  yUnit,
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  series: Array<{ key: string; label: string; color: string; dashed?: boolean }>
  band?: Array<{ x1: string; x2: string; y1: number; y2: number }>
  height?: number
  yUnit?: string
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(232,236,255,0.06)" vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit={yUnit} width={52} />
          <Tooltip {...tooltipStyle} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {band?.map((b, i) => <ReferenceArea key={i} x1={b.x1} x2={b.x2} y1={b.y1} y2={b.y2} fill="#5546ff" fillOpacity={0.1} stroke="none" />)}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarsChart({
  data,
  xKey,
  series,
  height = 220,
  stacked,
  layout = 'horizontal',
}: {
  data: Array<Record<string, unknown>>
  xKey: string
  series: Array<{ key: string; label: string; color: string }>
  height?: number
  stacked?: boolean
  layout?: 'horizontal' | 'vertical'
}) {
  const vertical = layout === 'vertical'
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout={vertical ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 8, left: vertical ? 8 : -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(232,236,255,0.06)" vertical={vertical} horizontal={!vertical} />
          {vertical ? (
            <>
              <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} width={120} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={52} />
            </>
          )}
          <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={stacked ? 'a' : undefined} radius={stacked ? 0 : 4} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Estado vazio pequeno para dentro de cards. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-[var(--line-2)] px-4 py-6 text-center text-[13.5px] text-[var(--muted)]">{children}</p>
}
