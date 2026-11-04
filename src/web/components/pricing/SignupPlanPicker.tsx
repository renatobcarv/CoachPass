import React from 'react'
import { Check } from 'lucide-react'

import { PRO_PLANS, PRO_TIERS, TRIAL_DAYS, formatBRL, type ProTier } from '@/lib/proPlans'
import {
  STUDENT_CYCLES,
  STUDENT_FREE_AI,
  STUDENT_PLANS,
  STUDENT_PRO_PERKS,
  monthlyEquivalent,
  type StudentCycle,
} from '@/lib/studentPlans'
import type { SignupPlan } from '../../lib/proPlanApi'

type Props = {
  audience: 'student' | 'professional'
  value: SignupPlan | null
  onChange: (plan: SignupPlan) => void
}

/** Escolha do plano no cadastro. O pagamento abre logo depois que a conta é criada. */
export function SignupPlanPicker({ audience, value, onChange }: Props) {
  return audience === 'student' ? (
    <StudentPicker value={value} onChange={onChange} />
  ) : (
    <ProfessionalPicker value={value} onChange={onChange} />
  )
}

function Option({
  selected,
  onClick,
  title,
  price,
  sub,
  badge,
  perks,
}: {
  selected: boolean
  onClick: () => void
  title: string
  price: string
  sub: string
  badge?: string
  perks?: string[]
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
        selected ? 'border-white bg-white/[0.06]' : 'border-[var(--line-2)] hover:border-white/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
              selected ? 'border-white bg-white text-black' : 'border-[var(--line-2)]'
            }`}
          >
            {selected && <Check className="h-3 w-3" strokeWidth={3.5} />}
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {title}
              {badge && (
                <span className="cp-mono rounded-full border border-[var(--amber)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--amber)]">
                  {badge}
                </span>
              )}
            </p>
            <p className="mt-1 text-[13px] text-[var(--muted)]">{sub}</p>
          </div>
        </div>
        <p className="cp-display shrink-0 text-[19px] font-bold">{price}</p>
      </div>
      {perks && selected && (
        <ul className="mt-3 space-y-1.5 border-t border-[var(--line)] pt-3 pl-8">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-2 text-[13px] text-[var(--muted)]">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--teal)]" strokeWidth={3} /> {p}
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}

function StudentPicker({ value, onChange }: Omit<Props, 'audience'>) {
  const choice = value?.audience === 'student' ? value.choice : null
  const pick = (c: 'free' | StudentCycle) => onChange({ audience: 'student', choice: c })
  return (
    <div role="radiogroup" aria-label="Plano do aluno" className="space-y-3">
      <Option
        selected={choice === 'free'}
        onClick={() => pick('free')}
        title="Grátis"
        price="R$ 0"
        sub={`Treinos e dietas do seu profissional, registro de treino, evolução e ${STUDENT_FREE_AI} gerações de IA por mês.`}
      />
      <p className="cp-mono pt-2 text-[11px] uppercase tracking-[0.14em] text-[var(--dim)]">Aluno Pro · monte seu próprio plano</p>
      {STUDENT_CYCLES.map((cycle) => {
        const plan = STUDENT_PLANS[cycle]
        const savings = STUDENT_PLANS.monthly.price * plan.months - plan.price
        return (
          <Option
            key={cycle}
            selected={choice === cycle}
            onClick={() => pick(cycle)}
            title={`Aluno Pro ${plan.label}`}
            price={formatBRL(plan.price, true)}
            sub={
              cycle === 'monthly'
                ? 'por mês, cancele quando quiser'
                : `${formatBRL(monthlyEquivalent(cycle), true)}/mês · economize ${formatBRL(savings, true)}`
            }
            badge={cycle === 'annual' ? 'Melhor valor' : undefined}
            perks={STUDENT_PRO_PERKS}
          />
        )
      })}
    </div>
  )
}

function ProfessionalPicker({ value, onChange }: Omit<Props, 'audience'>) {
  const current = value?.audience === 'professional' ? value : null
  const pick = (tier: ProTier, action: 'free' | 'trial' | 'subscribe') =>
    onChange({ audience: 'professional', choice: tier, action })
  return (
    <div role="radiogroup" aria-label="Plano profissional" className="space-y-3">
      {PRO_TIERS.map((tier) => {
        const plan = PRO_PLANS[tier]
        const selected = current?.choice === tier
        const limit = plan.studentLimit === null ? 'Alunos ou pacientes ilimitados' : `Até ${plan.studentLimit} alunos ou pacientes`
        return (
          <div key={tier}>
            <Option
              selected={selected}
              onClick={() => pick(tier, tier === 'free' ? 'free' : current?.choice === tier ? current.action : 'subscribe')}
              title={plan.name}
              price={tier === 'free' ? 'R$ 0' : `${formatBRL(plan.monthly, true)}/mês`}
              sub={`${limit}. ${plan.tagline}`}
              badge={tier === 'pro' ? 'Mais escolhido' : undefined}
              perks={plan.perks}
            />
            {selected && tier !== 'free' && (
              <div className="mt-2 grid grid-cols-2 gap-2 pl-8">
                {(
                  [
                    ['subscribe', 'Assinar agora', 'cartão, logo após criar a conta'],
                    ['trial', `${TRIAL_DAYS} dias grátis`, 'sem cartão; assine depois'],
                  ] as const
                ).map(([action, label, hint]) => (
                  <button
                    key={action}
                    type="button"
                    aria-pressed={current?.action === action}
                    onClick={() => pick(tier, action)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors ${
                      current?.action === action ? 'border-white bg-white text-black' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                    }`}
                  >
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-[11.5px] opacity-75">{hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <p className="pt-1 text-[12.5px] text-[var(--dim)]">
        Todos os recursos em todos os planos. Personal e nutricionista na mesma conta só no Elite. Pagamento seguro pelo AbacatePay.
      </p>
    </div>
  )
}

/** Texto curto do plano escolhido (resumo do cadastro). */
export function signupPlanLabel(plan: SignupPlan | null): string {
  if (!plan) return 'Nenhum'
  if (plan.audience === 'student') {
    if (plan.choice === 'free') return 'Grátis'
    const p = STUDENT_PLANS[plan.choice]
    return `Aluno Pro ${p.label} · ${formatBRL(p.price, true)}`
  }
  const p = PRO_PLANS[plan.choice]
  if (plan.choice === 'free') return 'Grátis'
  return plan.action === 'trial'
    ? `${p.name} · ${TRIAL_DAYS} dias grátis`
    : `${p.name} · ${formatBRL(p.monthly, true)}/mês`
}

/** O plano escolhido exige pagamento logo após o cadastro. */
export function signupNeedsPayment(plan: SignupPlan | null): boolean {
  if (!plan) return false
  if (plan.audience === 'student') return plan.choice !== 'free'
  return plan.choice !== 'free' && plan.action === 'subscribe'
}
