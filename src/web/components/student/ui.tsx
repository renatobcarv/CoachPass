import React from 'react'
import { motion } from 'motion/react'
import { SplitWords } from '../brand/Brand'

/** Peças visuais do app do aluno (dentro do shell .cp-brand escuro). */

const EASE = [0.2, 0.8, 0.2, 1] as const

export function Page({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  // wide: telas de trabalho do profissional (montar treino, agenda) aproveitam monitores largos
  return (
    <div className={`relative px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10 pb-28 lg:pb-14 mx-auto ${wide ? 'max-w-[1480px]' : 'max-w-[1080px]'}`}>
      {children}
    </div>
  )
}

export function PageHeader({
  kicker,
  title,
  accent,
  lead,
  action,
}: {
  kicker?: string
  title: string
  accent?: string
  lead?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
      <div className="min-w-0">
        {kicker && (
          <motion.p
            className="cp-kicker first-letter:uppercase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {kicker}
          </motion.p>
        )}
        <h1 className="cp-display mt-3 text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.0]">
          <SplitWords text={title} immediate />
          {accent && (
            <>
              {' '}
              <SplitWords text={accent} immediate delay={0.15} className="cp-accent" />
            </>
          )}
        </h1>
        {lead && (
          <motion.div
            className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {lead}
          </motion.div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

export function Card({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'article' | 'section'
}) {
  const Comp = as === 'article' ? motion.article : as === 'section' ? motion.section : motion.div
  return (
    <Comp
      className={`cp-spot relative rounded-[22px] border border-[var(--line)] bg-white/[0.025] ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

export function SectionTitle({
  icon: Icon,
  children,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="cp-display flex items-center gap-2.5 text-[20px] font-bold">
        {Icon && <Icon className="w-[18px] h-[18px] text-[var(--blue-2)]" />}
        {children}
      </h2>
      {action}
    </div>
  )
}

export function Stat({
  label,
  value,
  unit,
  hint,
  color = 'var(--blue-2)',
  icon: Icon,
  delay = 0,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  hint?: string
  color?: string
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  delay?: number
}) {
  return (
    <Card className="p-5" delay={delay}>
      <div className="flex items-center justify-between">
        <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
        {Icon && <Icon className="w-4 h-4" style={{ color }} />}
      </div>
      <p className="cp-display mt-3 text-[30px] font-bold leading-none">
        {value}
        {unit && <span className="ml-1 text-[14px] font-medium text-[var(--muted)]">{unit}</span>}
      </p>
      {hint && <p className="mt-2 text-[12.5px] text-[var(--dim)]">{hint}</p>}
    </Card>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card className="px-6 py-12 text-center overflow-hidden">
      <span className="relative mx-auto w-14 h-14 rounded-2xl grid place-items-center bg-white/[0.05] border border-[var(--line-2)]">
        <Icon className="w-6 h-6 text-[var(--blue-2)]" />
      </span>
      <h3 className="relative cp-display mt-5 text-[22px] font-bold">{title}</h3>
      {children && <p className="relative mt-2 text-[14.5px] leading-relaxed text-[var(--muted)] max-w-md mx-auto">{children}</p>}
      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </Card>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'blue' | 'amber' | 'teal' | 'violet'
}) {
  const tones: Record<string, string> = {
    neutral: 'text-[var(--muted)] bg-white/[0.05] border-[var(--line-2)]',
    blue: 'text-[var(--blue-2)] bg-[rgba(61,107,255,0.12)] border-[rgba(111,143,255,0.3)]',
    amber: 'text-[var(--amber)] bg-[rgba(255,181,71,0.1)] border-[rgba(255,181,71,0.3)]',
    teal: 'text-[var(--teal)] bg-[rgba(46,230,200,0.1)] border-[rgba(46,230,200,0.28)]',
    violet: 'text-[#b39dff] bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.3)]',
  }
  return (
    <span className={`cp-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-[22px] bg-white/[0.04] animate-pulse ${className}`} />
}

export function LoadingPage() {
  return (
    <Page>
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-12 w-72 mb-10" />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48" />
    </Page>
  )
}

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-[rgba(255,93,108,0.3)] bg-[rgba(255,93,108,0.08)] px-4 py-3 text-[14px] text-[#ff8a95]">
      {children}
    </div>
  )
}

/** Botão secundário "em breve" para recursos de IA ainda desativados. */
export function SoonButton({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled
      title="Disponível em breve"
      className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-[var(--line-2)] bg-white/[0.03] text-[14px] text-[var(--muted)] cursor-not-allowed"
    >
      <Icon className="w-4 h-4 text-[var(--violet)]" />
      {children}
      <span className="cp-mono text-[10px] uppercase tracking-[0.12em] text-[var(--dim)]">em breve</span>
    </button>
  )
}

export const WEEKDAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const WEEKDAY_PT: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export const WEEKDAY_SHORT: Record<string, string> = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
  sunday: 'Dom',
}

/**
 * Título do treino sem o dia repetido: "Terça — Treino de peito" → "Treino de peito"
 * quando a tela já mostra o dia numa etiqueta.
 */
export function workoutTitle(title: string, weekday?: string | null) {
  const day = weekday ? WEEKDAY_PT[weekday] : null
  if (!day) return title
  const cleaned = title.replace(new RegExp(`^\\s*${day}\\s*[—–-]\\s*`, 'i'), '').trim()
  return cleaned || title
}

/** Dia da semana de hoje no formato salvo nos treinos ('monday'...). */
export function todayWeekday() {
  return WEEKDAY_ORDER[(new Date().getDay() + 6) % 7]
}
