import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, CreditCard, Download, Lock, Minus, Plus, Undo2 } from 'lucide-react'

import {
  PRO_PLANS,
  PRO_TIERS,
  TRIAL_DAYS,
  annualSavings,
  formatBRL,
  priceFor,
  recommendTier,
  type BillingCycle,
  type ProTier,
} from '@/lib/proPlans'

type Audience = 'personal' | 'nutritionist'

export type ProPricingProps = {
  audience: Audience
  /** Ponto de partida da calculadora (ex.: resposta do onboarding) */
  initialStudents?: number
  /** Plano em vigor; o card mostra "Seu plano" */
  currentTier?: ProTier
  /** Quantos alunos a conta já tem (modo upgrade) */
  usedStudents?: number
  trialUsed?: boolean
  onTrial?: boolean
  /** Plano escolhido no onboarding, para manter o destaque ao voltar */
  selectedTier?: ProTier | null
  busyTier?: ProTier | null
  onChoose: (tier: ProTier, cycle: BillingCycle) => void
}

const MAX_STUDENTS = 80
const DEFAULT_TICKET: Record<Audience, number> = { personal: 150, nutritionist: 180 }

/** Mostra 1–80 com "80+" no fim da régua. */
const studentsLabel = (n: number) => (n >= MAX_STUDENTS ? `${MAX_STUDENTS}+` : String(n))

export function ProPricing({
  audience,
  initialStudents = 8,
  currentTier,
  usedStudents,
  trialUsed,
  onTrial,
  selectedTier,
  busyTier,
  onChoose,
}: ProPricingProps) {
  const who = audience === 'nutritionist' ? 'pacientes' : 'alunos'
  const whoOne = audience === 'nutritionist' ? 'paciente' : 'aluno'

  // Anual por padrão: o preço mensal equivalente vira a âncora visível
  const [cycle, setCycle] = useState<BillingCycle>('annual')
  const [students, setStudents] = useState(() =>
    Math.min(MAX_STUDENTS, Math.max(1, usedStudents ?? initialStudents)),
  )
  const [ticket, setTicket] = useState(DEFAULT_TICKET[audience])

  // O uso real da conta chega depois do primeiro render
  useEffect(() => {
    if (usedStudents) setStudents(Math.min(MAX_STUDENTS, Math.max(1, usedStudents)))
  }, [usedStudents])

  const recommended = recommendTier(students)
  const highlight: ProTier = selectedTier ?? recommended

  return (
    <div className="relative">
      {/* Calculadora: o próprio profissional descobre qual plano cabe nele */}
      <Calculator
        who={who}
        whoOne={whoOne}
        students={students}
        setStudents={setStudents}
        ticket={ticket}
        setTicket={setTicket}
        cycle={cycle}
        recommended={recommended}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <CycleToggle cycle={cycle} setCycle={setCycle} />
        <p className="cp-mono text-[11.5px] uppercase tracking-[0.12em] text-[var(--dim)]">
          Todos os recursos em todos os planos · você só paga quando cresce
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:items-stretch">
        {PRO_TIERS.map((tier, i) => (
          <PlanCard
            key={tier}
            tier={tier}
            index={i}
            cycle={cycle}
            students={students}
            who={who}
            isRecommended={tier === recommended}
            isHighlighted={tier === highlight}
            isCurrent={tier === currentTier}
            hasPaidCurrent={Boolean(currentTier && currentTier !== 'free')}
            trialUsed={Boolean(trialUsed)}
            onTrial={Boolean(onTrial)}
            busy={busyTier === tier}
            disabled={Boolean(busyTier)}
            onChoose={() => onChoose(tier, cycle)}
          />
        ))}
      </div>

      <Guarantees />
      <Faq who={who} />
    </div>
  )
}

function CycleToggle({ cycle, setCycle }: { cycle: BillingCycle; setCycle: (c: BillingCycle) => void }) {
  const options: { id: BillingCycle; label: string }[] = [
    { id: 'monthly', label: 'Mensal' },
    { id: 'annual', label: 'Anual' },
  ]
  return (
    <div role="radiogroup" aria-label="Ciclo de cobrança" className="inline-flex items-center gap-1 rounded-full border border-[var(--line-2)] bg-[var(--ink-2)] p-1">
      {options.map((o) => {
        const active = cycle === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setCycle(o.id)}
            className={`relative h-10 rounded-full px-5 text-[14px] font-semibold transition-colors ${
              active ? 'text-[var(--paper-ink)]' : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId="cycle-pill"
                className="absolute inset-0 rounded-full bg-[var(--paper)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative inline-flex items-center gap-2">
              {o.label}
              {o.id === 'annual' && (
                <span
                  className={`cp-mono rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.08em] ${
                    active ? 'bg-[var(--paper-ink)] text-[var(--amber)]' : 'bg-[rgba(255,181,71,0.14)] text-[var(--amber)]'
                  }`}
                >
                  3 meses grátis
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Calculator({
  who,
  whoOne,
  students,
  setStudents,
  ticket,
  setTicket,
  cycle,
  recommended,
}: {
  who: string
  whoOne: string
  students: number
  setStudents: (n: number) => void
  ticket: number
  setTicket: (n: number) => void
  cycle: BillingCycle
  recommended: ProTier
}) {
  const price = priceFor(recommended, cycle)
  const plan = PRO_PLANS[recommended]
  const perStudent = price / students
  // Quantos alunos pagam o plano inteiro
  const payback = price > 0 && ticket > 0 ? Math.ceil(price / ticket) : 0
  const revenue = students * ticket
  const share = revenue > 0 ? (price / revenue) * 100 : 0
  const pct = ((students - 1) / (MAX_STUDENTS - 1)) * 100

  const step = (d: number) => setStudents(Math.min(MAX_STUDENTS, Math.max(1, students + d)))

  return (
    <section className="rounded-[28px] border border-[var(--line-2)] bg-[var(--ink-2)] p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="cp-kicker">Simule a sua carteira</p>
          <label htmlFor="students-range" className="mt-3 block text-[15px] text-[var(--muted)]">
            Quantos {who} você quer acompanhar?
          </label>
          <div className="mt-2 flex items-end gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={students}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="cp-display block min-w-[2.2ch] text-[clamp(64px,9vw,104px)] font-bold leading-[0.85] tabular-nums"
              >
                {studentsLabel(students)}
              </motion.span>
            </AnimatePresence>
            <div className="mb-2 flex gap-1.5">
              <StepButton label={`Menos ${who}`} onClick={() => step(-1)} disabled={students <= 1}>
                <Minus className="h-4 w-4" />
              </StepButton>
              <StepButton label={`Mais ${who}`} onClick={() => step(1)} disabled={students >= MAX_STUDENTS}>
                <Plus className="h-4 w-4" />
              </StepButton>
            </div>
          </div>

          <div className="relative mt-6">
            <input
              id="students-range"
              type="range"
              min={1}
              max={MAX_STUDENTS}
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              aria-valuetext={`${studentsLabel(students)} ${who}`}
              className="cp-range w-full"
              style={{ ['--pct' as string]: `${pct}%` }}
            />
            {/* Marcas dos limites dos planos na régua */}
            <div className="cp-mono relative mt-2 h-4 text-[10.5px] text-[var(--dim)]">
              {[
                { at: 5, label: 'Grátis até 5' },
                { at: 40, label: 'Pro até 40' },
              ].map((m) => (
                <span
                  key={m.at}
                  className="absolute whitespace-nowrap"
                  style={{
                    left: `${((m.at - 1) / (MAX_STUDENTS - 1)) * 100}%`,
                    transform: m.at <= 10 ? 'translateX(-6px)' : 'translateX(-50%)',
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recibo: a conta que convence */}
        <div className="cp-paper rounded-[22px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="cp-mono text-[11px] uppercase tracking-[0.14em] text-[var(--paper-muted)]">Ideal para você</p>
            <span className="cp-mono rounded-full bg-[var(--paper-ink)] px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-white">
              {plan.name}
            </span>
          </div>

          {recommended === 'free' ? (
            <p className="cp-display mt-3 text-[26px] font-bold leading-[1.1]">
              Comece de graça. Seus primeiros {PRO_PLANS.free.studentLimit} {who} não custam nada.
            </p>
          ) : (
            <p className="cp-display mt-3 text-[26px] font-bold leading-[1.1]">
              {formatBRL(perStudent, true)} por {whoOne} ao mês.
            </p>
          )}

          <dl className="mt-5 space-y-2.5 border-t border-dashed border-[var(--paper-line)] pt-4 text-[14px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--paper-muted)]">Cada {whoOne} te paga</dt>
              <dd>
                <label className="inline-flex items-center gap-1 rounded-lg border border-[var(--paper-line)] bg-white px-2 py-1 font-semibold tabular-nums focus-within:outline focus-within:outline-2 focus-within:outline-[var(--brand-500)]">
                  <span className="text-[var(--paper-muted)]">R$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={5000}
                    value={ticket}
                    onChange={(e) => setTicket(Math.max(0, Math.min(5000, Number(e.target.value) || 0)))}
                    aria-label={`Quanto cada ${whoOne} te paga por mês`}
                    className="w-[64px] bg-transparent text-right outline-none"
                  />
                  <span className="text-[var(--paper-muted)]">/mês</span>
                </label>
              </dd>
            </div>
            <Row label="Sua receita com a carteira" value={`${formatBRL(revenue)}/mês`} />
            <Row
              label={`Plano ${plan.name}${cycle === 'annual' && price > 0 ? ' (anual)' : ''}`}
              value={price > 0 ? `${formatBRL(price)}/mês` : 'R$ 0'}
            />
            {price > 0 && <Row label="Peso na sua receita" value={`${share < 1 ? share.toFixed(1) : Math.round(share)}%`} />}
          </dl>

          {price > 0 && payback > 0 && (
            <p className="mt-4 rounded-xl bg-[var(--paper-ink)] px-4 py-3 text-[14px] leading-snug text-white">
              <strong className="text-[var(--amber)]">
                {payback === 1 ? `1 ${whoOne}` : `${payback} ${who}`}
              </strong>{' '}
              {payback === 1 ? 'paga' : 'pagam'} o plano inteiro. O resto da carteira é lucro.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--paper-muted)]">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function StepButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line-2)] text-[var(--muted)] transition hover:border-white hover:text-white active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function PlanCard({
  tier,
  index,
  cycle,
  students,
  who,
  isRecommended,
  isHighlighted,
  isCurrent,
  hasPaidCurrent,
  trialUsed,
  onTrial,
  busy,
  disabled,
  onChoose,
}: {
  tier: ProTier
  index: number
  cycle: BillingCycle
  students: number
  who: string
  isRecommended: boolean
  isHighlighted: boolean
  isCurrent: boolean
  hasPaidCurrent: boolean
  trialUsed: boolean
  onTrial: boolean
  busy: boolean
  disabled: boolean
  onChoose: () => void
}) {
  const plan = PRO_PLANS[tier]
  const isPro = tier === 'pro'
  const paid = tier !== 'free'
  const price = priceFor(tier, cycle)
  const fits = plan.studentLimit === null || students <= plan.studentLimit
  const missing = plan.studentLimit === null ? 0 : students - plan.studentLimit
  const yearly = plan.annualMonthly * 12
  const perDay = cycle === 'annual' ? yearly / 365 : plan.monthly / 30

  // Pro é sempre o card de papel (âncora visual); destaque do recomendado é a borda/elevação
  const surface = isPro
    ? 'cp-paper border-transparent'
    : 'border-[var(--line-2)] bg-[var(--ink-2)] text-white'
  const muted = isPro ? 'text-[var(--paper-muted)]' : 'text-[var(--muted)]'
  const line = isPro ? 'border-[var(--paper-line)]' : 'border-[var(--line)]'

  // Plano pago depois do teste já usado: sem gateway ainda, não dá para assinar pela tela
  const lockedPaid = paid && trialUsed && !onTrial && !isCurrent

  let cta: string
  if (isCurrent) cta = onTrial && paid ? 'Você está testando' : 'Seu plano atual'
  else if (!paid) cta = hasPaidCurrent ? 'Voltar para o Grátis' : 'Começar grátis'
  else if (onTrial) cta = `Trocar para o ${plan.name}`
  else if (lockedPaid) cta = 'Assinatura em breve'
  else cta = `Testar ${TRIAL_DAYS} dias grátis`

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: isHighlighted ? -6 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.06 * index }}
      className={`relative flex flex-col rounded-[26px] border p-6 sm:p-7 ${surface} ${
        isPro ? 'order-first lg:order-none' : ''
      } ${isHighlighted ? (isPro ? 'shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)]' : 'border-[var(--brand-400)]') : ''}`}
    >
      <div className="flex min-h-[28px] flex-wrap items-center gap-2">
        <h3 className="cp-display text-[24px] font-bold">{plan.name}</h3>
        {isPro && (
          <span className="cp-mono rounded-full bg-[var(--paper-ink)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--amber)]">
            Mais escolhido
          </span>
        )}
        {isRecommended && !isPro && (
          <span className="cp-mono rounded-full border border-[var(--brand-400)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--brand-200)]">
            Ideal para você
          </span>
        )}
        {isRecommended && isPro && (
          <span className="cp-mono rounded-full border border-[var(--paper-ink)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em]">
            Ideal para você
          </span>
        )}
      </div>
      <p className={`mt-2 text-[14.5px] leading-snug ${muted}`}>{plan.tagline}</p>

      {/* Preço */}
      <div className="mt-6 flex items-end gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${tier}-${cycle}`}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="cp-display text-[52px] font-bold leading-none tabular-nums"
          >
            {price === 0 ? 'R$ 0' : formatBRL(price)}
          </motion.span>
        </AnimatePresence>
        <span className={`mb-1.5 text-[15px] ${muted}`}>/mês</span>
        {paid && cycle === 'annual' && (
          <span className={`mb-1.5 ml-1 text-[15px] line-through decoration-[1.5px] ${muted}`}>
            {formatBRL(plan.monthly)}
          </span>
        )}
      </div>
      <p className={`cp-mono mt-2 min-h-[18px] text-[12px] ${muted}`}>
        {!paid
          ? 'Para sempre. Sem cartão.'
          : cycle === 'annual'
            ? `${formatBRL(yearly)} por ano · economize ${formatBRL(annualSavings(tier))}`
            : `${formatBRL(perDay, true)} por dia · sem fidelidade`}
      </p>
      {paid && cycle === 'annual' && (
        <p className={`cp-mono mt-1 text-[12px] ${muted}`}>Menos de {formatBRL(Math.ceil(perDay * 10) / 10, true)} por dia</p>
      )}

      {/* Cabe na carteira simulada? */}
      <div className={`mt-5 rounded-xl border px-3.5 py-2.5 text-[13.5px] ${line} ${fits ? '' : isPro ? 'bg-[rgba(0,3,38,0.04)]' : 'bg-white/[0.02]'}`}>
        {fits ? (
          <span className="inline-flex items-center gap-2">
            <Check className={`h-4 w-4 ${isPro ? 'text-[var(--brand-600)]' : 'text-[var(--teal)]'}`} strokeWidth={3} />
            Comporta seus {studentsLabel(students)} {who}
          </span>
        ) : (
          <span className={`inline-flex items-center gap-2 ${muted}`}>
            <Lock className="h-4 w-4" />
            Comporta só {plan.studentLimit}. Ficariam {missing} {who} de fora.
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2.5 text-[14.5px]">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isPro ? 'text-[var(--brand-600)]' : 'text-[var(--brand-300)]'}`} strokeWidth={3} />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={onChoose}
          disabled={disabled || isCurrent || lockedPaid}
          className={`group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed ${
            isCurrent
              ? `border ${isPro ? 'border-[var(--paper-ink)] text-[var(--paper-ink)]' : 'border-white/40 text-white'}`
              : isPro
              ? 'bg-[var(--paper-ink)] text-white hover:bg-[var(--brand-700)] disabled:opacity-60'
              : paid
                ? 'bg-[var(--paper)] text-[var(--paper-ink)] hover:bg-white disabled:opacity-50'
                : 'border border-[var(--line-2)] text-white hover:border-white disabled:opacity-50'
          }`}
        >
          {isCurrent && <Check className="h-4 w-4" strokeWidth={3} />}
          {busy ? 'Salvando…' : cta}
          {!busy && !isCurrent && !lockedPaid && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
        <p className={`mt-2.5 min-h-[16px] text-center text-[12px] ${muted}`}>
          {paid && !isCurrent && !lockedPaid && !onTrial && 'Sem cartão. Se não assinar, volta para o Grátis.'}
          {lockedPaid && 'Seu teste já foi usado. Fale com a gente para liberar.'}
        </p>
      </div>
    </motion.article>
  )
}

function Guarantees() {
  const items = [
    { icon: CreditCard, title: 'Sem cartão para testar', text: `${TRIAL_DAYS} dias com tudo liberado.` },
    { icon: Undo2, title: 'Sem fidelidade', text: 'Troque de plano ou volte para o Grátis quando quiser.' },
    { icon: Download, title: 'Seus dados são seus', text: 'Exporte tudo a qualquer momento.' },
  ]
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-start gap-3 rounded-2xl border border-[var(--line)] px-4 py-3.5">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-300)]" />
          <div>
            <p className="text-[14px] font-semibold">{title}</p>
            <p className="text-[13px] text-[var(--muted)]">{text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Faq({ who }: { who: string }) {
  const items = useMemo(
    () => [
      {
        q: `O que acontece quando passo de ${PRO_PLANS.free.studentLimit} ${who} no Grátis?`,
        a: `Nada some. Quem já está com você continua; só novos convites ficam travados até você subir de plano.`,
      },
      {
        q: `Meus ${who} pagam alguma coisa?`,
        a: `Não. O app do ${who === 'pacientes' ? 'paciente' : 'aluno'} é gratuito em qualquer plano.`,
      },
      {
        q: `E depois dos ${TRIAL_DAYS} dias de teste?`,
        a: 'Sua conta volta para o Grátis automaticamente. Nada é cobrado sem você confirmar.',
      },
    ],
    [who],
  )
  return (
    <div className="mt-8 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)]">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold">
            {item.q}
            <Plus className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-45" />
          </summary>
          <p className="mt-2 text-[14px] text-[var(--muted)]">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
