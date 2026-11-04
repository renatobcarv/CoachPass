import React, { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'

import { PRO_PLANS, PRO_TIERS, TRIAL_DAYS, formatBRL } from '@/lib/proPlans'
import { STUDENT_CYCLES, STUDENT_FREE_AI, STUDENT_PLANS, STUDENT_PRO_PERKS, monthlyEquivalent } from '@/lib/studentPlans'

type Card = {
  key: string
  name: string
  price: string
  per: string
  note: string
  perks: string[]
  cta: string
  to: string
  featured?: boolean
  badge?: string
}

function proCards(): Card[] {
  return PRO_TIERS.map((tier) => {
    const p = PRO_PLANS[tier]
    return {
      key: tier,
      name: p.name,
      price: tier === 'free' ? 'R$ 0' : formatBRL(p.monthly, true),
      per: tier === 'free' ? 'para sempre' : 'por mês',
      note: p.tagline,
      perks: p.perks,
      cta: tier === 'free' ? 'Começar grátis' : `Assinar o ${p.name}`,
      to: `/cadastro?perfil=profissional&plano=${tier}`,
      featured: tier === 'pro',
      badge: tier === 'pro' ? 'Mais escolhido' : undefined,
    }
  })
}

function studentCards(): Card[] {
  const free: Card = {
    key: 'free',
    name: 'Grátis',
    price: 'R$ 0',
    per: 'para sempre',
    note: 'Para quem treina com um profissional.',
    perks: ['Treinos e dietas do seu profissional', 'Registro de treino e evolução', `${STUDENT_FREE_AI} gerações de IA por mês`],
    cta: 'Começar grátis',
    to: '/cadastro?perfil=aluno&plano=free',
  }
  return [
    free,
    ...STUDENT_CYCLES.map((cycle): Card => {
      const p = STUDENT_PLANS[cycle]
      const savings = STUDENT_PLANS.monthly.price * p.months - p.price
      return {
        key: cycle,
        name: `Aluno Pro ${p.label}`,
        price: formatBRL(p.price, true),
        per: cycle === 'monthly' ? 'por mês' : `${formatBRL(monthlyEquivalent(cycle), true)}/mês`,
        note: cycle === 'monthly' ? 'Cancele quando quiser.' : `Economize ${formatBRL(savings, true)} no período.`,
        perks: STUDENT_PRO_PERKS,
        cta: `Assinar ${p.label.toLowerCase()}`,
        to: `/cadastro?perfil=aluno&plano=${cycle}`,
        featured: cycle === 'annual',
        badge: cycle === 'annual' ? 'Melhor valor' : undefined,
      }
    }),
  ]
}

/** Planos na página inicial: profissional (por tamanho da carteira) e aluno (Aluno Pro). */
export function HomePricing() {
  const [tab, setTab] = useState<'pro' | 'student'>('pro')
  const cards = tab === 'pro' ? proCards() : studentCards()

  return (
    <div>
      <div role="tablist" aria-label="Planos" className="mx-auto flex w-fit gap-1 rounded-full border border-[var(--line-2)] p-1">
        {(
          [
            ['pro', 'Personal e nutricionista'],
            ['student', 'Aluno'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`h-10 rounded-full px-5 text-[14px] font-semibold transition-colors ${
              tab === id ? 'bg-white text-black' : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`mt-12 grid items-stretch gap-4 ${cards.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'}`}>
        {cards.map((c) => (
          <article
            key={c.key}
            className={`flex flex-col rounded-[26px] border p-7 ${
              c.featured ? 'cp-paper border-transparent' : 'border-[var(--line-2)] bg-[var(--ink-2)]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="cp-display text-[22px] font-bold">{c.name}</h3>
              {c.badge && (
                <span className="cp-mono rounded-full bg-[var(--paper-ink)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--amber)]">
                  {c.badge}
                </span>
              )}
            </div>
            <p className={`mt-2 text-[14px] ${c.featured ? 'text-[var(--paper-muted)]' : 'text-[var(--muted)]'}`}>{c.note}</p>
            <p className="cp-display mt-6 text-[42px] font-bold leading-none">{c.price}</p>
            <p className={`mt-2 text-[13px] ${c.featured ? 'text-[var(--paper-muted)]' : 'text-[var(--muted)]'}`}>{c.per}</p>
            <ul className="mt-6 space-y-2.5">
              {c.perks.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[14px] leading-snug">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${c.featured ? '' : 'text-[var(--teal)]'}`} strokeWidth={3} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Link
                to={c.to}
                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition active:scale-[0.98] ${
                  c.featured ? 'bg-[var(--paper-ink)] text-white' : 'bg-[var(--paper)] text-[var(--paper-ink)]'
                }`}
              >
                {c.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-[13.5px] text-[var(--dim)]">
        {tab === 'pro'
          ? `Todos os recursos em todos os planos. Pro e Elite com ${TRIAL_DAYS} dias grátis, sem cartão. Personal e nutricionista na mesma conta só no Elite.`
          : 'Os treinos e dietas do seu profissional são sempre grátis para você. O Aluno Pro é para montar o seu próprio plano.'}{' '}
        <Link to="/planos" className="text-[var(--muted)] underline-offset-2 hover:text-white hover:underline">
          Ver detalhes e calculadora
        </Link>
      </p>
    </div>
  )
}
