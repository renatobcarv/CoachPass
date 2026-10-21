import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'

/** Peças de UI dos painéis profissionais (dentro do shell escuro da marca). */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }>; count?: number }[]
  layoutId: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className="inline-flex p-1 rounded-full border border-[var(--line-2)] bg-white/[0.03] max-w-full overflow-x-auto">
      {options.map(({ value: v, label, icon: Icon, count }) => {
        const active = v === value
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={active}
            className={`relative shrink-0 inline-flex items-center gap-2 rounded-full ${
              size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-10 px-4 text-[13.5px]'
            } font-medium transition-colors ${active ? 'text-white' : 'text-[var(--muted)] hover:text-white'}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full cp-selected"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            {Icon && <Icon className="relative w-4 h-4" />}
            <span className="relative">{label}</span>
            {count != null && (
              <span className={`relative cp-mono text-[10.5px] ${active ? 'text-white/70' : 'text-[var(--dim)]'}`}>{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="cp-mono block mb-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
      {children}
    </label>
  )
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--line-2)] bg-white/[0.03] h-8">
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 grid place-items-center text-[var(--muted)] hover:text-white disabled:opacity-30"
        disabled={value <= min}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="cp-mono w-6 text-center text-[13px] text-white">{value}</span>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 grid place-items-center text-[var(--muted)] hover:text-white disabled:opacity-30"
        disabled={value >= max}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'cp-selected' : 'bg-white/[0.12]'
      }`}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

export function PersonChip({
  name,
  avatar,
  selected,
  onClick,
}: {
  name: string
  avatar?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`shrink-0 inline-flex items-center gap-2.5 h-11 pl-1.5 pr-4 rounded-full border transition-[background,border-color] ${
        selected
          ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.14)] text-white'
          : 'border-[var(--line-2)] bg-white/[0.025] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]'
      }`}
    >
      {avatar ? (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <span className="w-8 h-8 rounded-full grid place-items-center bg-[var(--ink-4)] text-[12px] font-bold">
          {name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')}
        </span>
      )}
      <span className="text-[14px] font-medium">{name}</span>
    </button>
  )
}

export function SectionCard({
  icon: Icon,
  title,
  meta,
  children,
  className = '',
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  meta?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`cp-spot relative rounded-[22px] border border-[var(--line)] bg-white/[0.025] p-5 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="flex items-center gap-2.5 cp-display text-[17px] font-bold">
          {Icon && (
            <span className="w-8 h-8 rounded-lg grid place-items-center bg-[rgba(85,70,255,0.14)]">
              <Icon className="w-4 h-4 text-[var(--brand-300)]" />
            </span>
          )}
          {title}
        </h3>
        {meta}
      </div>
      {children}
    </section>
  )
}

/** Barra fixa inferior no celular (acima das abas) com a ação principal da tela. */
export function MobileActionBar({ children }: { children: React.ReactNode }) {
  // Sinaliza a barra para o botão do assistente subir e não cobrir a ação (ver brand.css)
  useEffect(() => {
    document.documentElement.classList.add('cp-has-action-bar')
    return () => document.documentElement.classList.remove('cp-has-action-bar')
  }, [])
  return (
    <div className="lg:hidden fixed inset-x-3 bottom-[84px] z-30 rounded-2xl border border-[var(--line-2)] bg-[rgba(16,19,31,0.92)] backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
      {children}
    </div>
  )
}
