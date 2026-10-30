import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, CreditCard, Download, Lock, Minus, Plus, ShieldCheck, Undo2 } from 'lucide-react'

import { PRO_PLANS, PRO_TIERS, TRIAL_DAYS, formatBRL, priceFor, recommendTier, type ProTier } from '@/lib/proPlans'

type Audience = 'personal' | 'nutritionist'

/** O que o profissional quer fazer com um plano. */
export type PlanAction = 'free' | 'trial' | 'subscribe' | 'manage'

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
  subscriptionStatus?: 'none' | 'pending' | 'active' | 'cancelled'
  canManageBilling?: boolean
  /** Pagamento configurado no servidor */
  billingEnabled?: boolean
  /** Plano escolhido no onboarding, para manter o destaque ao voltar */
  selectedTier?: ProTier | null
  busyTier?: ProTier | null
  onAction: (tier: ProTier, action: PlanAction) => void
}

const MAX_STUDENTS = 80
const DEFAULT_TICKET: Record<Audience, number> = { personal: 150, nutritionist: 180 }

/** Mostra 1–80 com "80+" no fim da régua. */
const studentsLabel = (n: number) => (n >= MAX_STUDENTS ? `${MAX_STUDENTS}+` : String(n))

/** "R$ 19" e ",90" separados para o preço grande. */
function splitPrice(value: number) {
  const [int, cents] = value.toFixed(2).split('.')
  return { int: `R$ ${int}`, cents: cents === '00' ? '' : `,${cents}` }
}

export function ProPricing({
  audience,
  initialStudents = 8,
  currentTier,
  usedStudents,
  trialUsed,
  onTrial,
  subscriptionStatus = 'none',
  canManageBilling,
  billingEnabled = true,
  selectedTier,
  busyTier,
  onAction,
}: ProPricingProps) {
  const who = audience === 'nutritionist' ? 'pacientes' : 'alunos'
  const whoOne = audience === 'nutritionist' ? 'paciente' : 'aluno'

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
  const subscribed = subscriptionStatus === 'active'

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
        recommended={recommended}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-2)] bg-[var(--ink-2)] px-4 py-2 text-[13.5px]">
          <ShieldCheck className="h-4 w-4 text-[var(--teal)]" />
          Cobrança mensal · cancele quando quiser
        </span>
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
            students={students}
            who={who}
            isRecommended={tier === recommended}
            isHighlighted={tier === highlight}
            isCurrent={tier === currentTier}
            subscribed={subscribed}
            canManageBilling={Boolean(canManageBilling)}
            billingEnabled={billingEnabled}
            trialUsed={Boolean(trialUsed)}
            onTrial={Boolean(onTrial)}
            busy={busyTier === tier}
            disabled={Boolean(busyTier)}
            onAction={(action) => onAction(tier, action)}
          />
        ))}
      </div>

      <Guarantees />
      <Faq who={who} />
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
  recommended,
}: {
  who: string
  whoOne: string
  students: number
  setStudents: (n: number) => void
  ticket: number
  setTicket: (n: number) => void
  recommended: ProTier
}) {
  const price = priceFor(recommended)
  const plan = PRO_PLANS[recommended]
  const perStudent = price / students
  const revenue = students * ticket
  const share = revenue > 0 ? (price / revenue) * 100 : 0
  // Quantas vezes a mensalidade de um único aluno paga o plano
  const timesPaid = price > 0 ? Math.floor(ticket / price) : 0
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
            <Row label={`Plano ${plan.name}`} value={price > 0 ? `${formatBRL(price, true)}/mês` : 'R$ 0'} />
            {price > 0 && <Row label="Peso na sua receita" value={`${share < 1 ? share.toFixed(1) : Math.round(share)}%`} />}
          </dl>

          {price > 0 && timesPaid >= 1 && (
            <p className="mt-4 rounded-xl bg-[var(--paper-ink)] px-4 py-3 text-[14px] leading-snug text-white">
              A mensalidade de <strong className="text-[var(--amber)]">1 {whoOne}</strong> paga o {plan.name}{' '}
              {timesPaid === 1 ? 'inteiro' : <strong className="text-[var(--amber)]">{timesPaid} vezes</strong>}. O resto da
              carteira é lucro.
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

type Cta = { label: string; action: PlanAction | null; note?: string; secondary?: { label: string; action: PlanAction } }

/** Botão principal (e um link secundário) de cada card conforme a situação da conta. */
function ctaFor(args: {
  tier: ProTier
  isCurrent: boolean
  subscribed: boolean
  canManageBilling: boolean
  billingEnabled: boolean
  trialUsed: boolean
  onTrial: boolean
}): Cta {
  const { tier, isCurrent, subscribed, canManageBilling, billingEnabled, trialUsed, onTrial } = args
  const plan = PRO_PLANS[tier]
  const price = formatBRL(plan.monthly, true)
  const secure = 'Pagamento seguro no cartão via AbacatePay'

  if (tier === 'free') {
    if (subscribed) return { label: 'Incluído no seu plano', action: null, note: 'Cancele a assinatura para voltar ao Grátis.' }
    if (isCurrent) return { label: 'Seu plano atual', action: null }
    return { label: onTrial ? 'Voltar para o Grátis' : 'Começar grátis', action: 'free' }
  }

  if (subscribed) {
    if (isCurrent) {
      return canManageBilling
        ? { label: 'Seu plano atual', action: null, secondary: { label: 'Gerenciar assinatura', action: 'manage' } }
        : { label: 'Seu plano atual', action: null }
    }
    return {
      label: `Mudar para o ${plan.name}`,
      action: 'subscribe',
      note: tier === 'elite' ? 'Libera na hora. O novo valor vale na próxima cobrança.' : 'Vale a partir do próximo ciclo.',
    }
  }

  if (!trialUsed) {
    return {
      label: `Testar ${TRIAL_DAYS} dias grátis`,
      action: 'trial',
      note: 'Sem cartão. Se não assinar, volta para o Grátis.',
      ...(billingEnabled ? { secondary: { label: `ou assinar agora por ${price}/mês`, action: 'subscribe' as const } } : {}),
    }
  }

  if (!billingEnabled) return { label: 'Assinatura em breve', action: null, note: 'Fale com a gente para liberar.' }
  return { label: `Assinar por ${price}/mês`, action: 'subscribe', note: secure }
}

function PlanCard({
  tier,
  index,
  students,
  who,
  isRecommended,
  isHighlighted,
  isCurrent,
  subscribed,
  canManageBilling,
  billingEnabled,
  trialUsed,
  onTrial,
  busy,
  disabled,
  onAction,
}: {
  tier: ProTier
  index: number
  students: number
  who: string
  isRecommended: boolean
  isHighlighted: boolean
  isCurrent: boolean
  subscribed: boolean
  canManageBilling: boolean
  billingEnabled: boolean
  trialUsed: boolean
  onTrial: boolean
  busy: boolean
  disabled: boolean
  onAction: (action: PlanAction) => void
}) {
  const plan = PRO_PLANS[tier]
  const isPro = tier === 'pro'
  const paid = tier !== 'free'
  const { int, cents } = splitPrice(plan.monthly)
  const fits = plan.studentLimit === null || students <= plan.studentLimit
  const missing = plan.studentLimit === null ? 0 : students - plan.studentLimit
  const perDay = plan.monthly / 30

  const cta = ctaFor({ tier, isCurrent, subscribed, canManageBilling, billingEnabled, trialUsed, onTrial })

  // Pro é sempre o card de papel (âncora visual); destaque do recomendado é a borda/elevação
  const surface = isPro ? 'cp-paper border-transparent' : 'border-[var(--line-2)] bg-[var(--ink-2)] text-white'
  const muted = isPro ? 'text-[var(--paper-muted)]' : 'text-[var(--muted)]'
  const line = isPro ? 'border-[var(--paper-line)]' : 'border-[var(--line)]'
  const inert = cta.action === null

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
        {isRecommended && (
          <span
            className={`cp-mono rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] ${
              isPro ? 'border-[var(--paper-ink)]' : 'border-[var(--brand-400)] text-[var(--brand-200)]'
            }`}
          >
            Ideal para você
          </span>
        )}
      </div>
      <p className={`mt-2 text-[14.5px] leading-snug ${muted}`}>{plan.tagline}</p>

      {/* Preço: reais grandes, centavos pequenos */}
      <div className="mt-6 flex items-start">
        <span className="cp-display text-[56px] font-bold leading-none tabular-nums">{int}</span>
        {cents && <span className="cp-display mt-1.5 text-[24px] font-bold leading-none">{cents}</span>}
        <span className={`ml-1.5 self-end pb-1.5 text-[15px] ${muted}`}>/mês</span>
      </div>
      <p className={`cp-mono mt-2 min-h-[18px] text-[12px] ${muted}`}>
        {paid ? `Menos de ${formatBRL(Math.ceil(perDay * 10) / 10, true)} por dia` : 'Para sempre. Sem cartão.'}
      </p>

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
          onClick={() => cta.action && onAction(cta.action)}
          disabled={disabled || inert}
          className={`group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed ${
            inert
              ? `border ${isPro ? 'border-[var(--paper-ink)] text-[var(--paper-ink)]' : 'border-white/30 text-white'}`
              : isPro
                ? 'bg-[var(--paper-ink)] text-white hover:bg-[var(--brand-700)] disabled:opacity-60'
                : paid
                  ? 'bg-[var(--paper)] text-[var(--paper-ink)] hover:bg-white disabled:opacity-50'
                  : 'border border-[var(--line-2)] text-white hover:border-white disabled:opacity-50'
          }`}
        >
          {inert && isCurrent && <Check className="h-4 w-4" strokeWidth={3} />}
          {busy ? 'Abrindo…' : cta.label}
          {!busy && !inert && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
        {cta.secondary && (
          <button
            type="button"
            onClick={() => onAction(cta.secondary!.action)}
            disabled={disabled}
            className={`mt-2 w-full text-center text-[13.5px] font-semibold underline-offset-4 hover:underline disabled:opacity-50 ${
              isPro ? 'text-[var(--brand-600)]' : 'text-[var(--brand-200)]'
            }`}
          >
            {cta.secondary.label}
          </button>
        )}
        <p className={`mt-2 min-h-[16px] text-center text-[12px] ${muted}`}>{cta.note}</p>
      </div>
    </motion.article>
  )
}

function Guarantees() {
  const items = [
    { icon: CreditCard, title: 'Pagamento seguro', text: 'Cartão de crédito pelo AbacatePay.' },
    { icon: Undo2, title: 'Sem fidelidade', text: 'Cancele quando quiser, sem multa.' },
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
        q: 'Como cancelo?',
        a: 'Em "Gerenciar assinatura". O plano segue ativo até o fim do mês já pago e depois volta para o Grátis, sem multa.',
      },
      {
        q: `E depois dos ${TRIAL_DAYS} dias de teste?`,
        a: 'Sua conta volta para o Grátis automaticamente. Nada é cobrado sem você assinar.',
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
