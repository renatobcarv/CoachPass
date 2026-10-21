import React, { useEffect, useState } from 'react'
import { Apple, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { MealPlanDoc, fetchPublishedMealPlans, relName } from '../../lib/studentApi'
import { Badge, Card, EmptyState, ErrorBanner, Page, PageHeader, Skeleton, SoonButton } from '../student/ui'


export function Diet() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<MealPlanDoc[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken) {
        setLoading(false)
        return
      }
      try {
        const docs = await fetchPublishedMealPlans(user.id, user.accessToken)
        if (!cancelled) setPlans(docs)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar planos alimentares.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id])

  return (
    <Page>
      <PageHeader
        kicker="Alimentação"
        title="O que tem no"
        accent="prato hoje."
        lead="Somente planos publicados pelo nutricionista ou sugestões de IA."
        action={<SoonButton icon={Sparkles}>Gerar sugestão com IA</SoonButton>}
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-72" />
        </div>
      )}

      {!loading && plans.length === 0 && (
        <EmptyState icon={Apple} title="Nenhum plano alimentar ainda">
          Quando um nutricionista publicar um plano — ou quando a sugestão com IA estiver disponível — ele será listado
          aqui. Sugestões de IA são informativas e não substituem prescrição clínica.
        </EmptyState>
      )}

      <div className="space-y-8">
        {plans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} delay={i * 0.08} />
        ))}
      </div>
    </Page>
  )
}

function minutesOf(time?: string | null) {
  const m = /^(\d{1,2})[:h](\d{2})?/.exec(time || '')
  return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null
}

function PlanCard({ plan, delay }: { plan: MealPlanDoc; delay: number }) {
  const meals = plan.meals || []
  const totalKcal = meals.reduce((sum, m) => sum + (m.calories || 0), 0)
  const now = new Date().getHours() * 60 + new Date().getMinutes()
  const nextIndex = meals.findIndex((m) => {
    const t = minutesOf(m.time)
    return t != null && t >= now
  })

  return (
    <Card as="article" className="overflow-hidden" delay={delay}>
      <div className="relative p-6 sm:p-7 border-b border-[var(--line)] overflow-hidden">
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge tone={plan.source === 'ai' ? 'violet' : 'amber'}>
                {plan.source === 'ai' ? 'Sugestão IA' : relName(plan.author, 'Nutricionista')}
              </Badge>
              {meals.length > 0 && <Badge>{meals.length} refeições</Badge>}
            </div>
            <h2 className="cp-display mt-4 text-[26px] sm:text-[30px] font-bold leading-tight">{plan.title}</h2>
            {plan.observations && (
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--muted)] max-w-2xl">{plan.observations}</p>
            )}
          </div>
          {totalKcal > 0 && (
            <div className="text-right">
              <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">Total do dia</p>
              <p className="cp-display mt-1 text-[34px] font-bold leading-none cp-grad-warm">
                {totalKcal.toLocaleString('pt-BR')}
              </p>
              <p className="cp-mono text-[12px] text-[var(--dim)]">kcal</p>
            </div>
          )}
        </div>
      </div>

      <ol className="relative px-5 sm:px-7 py-6">
        <span aria-hidden className="absolute left-[34px] sm:left-[42px] top-8 bottom-8 w-px bg-[var(--line-2)]" />
        {meals.map((meal, index) => {
          const isNext = index === nextIndex
          return (
            <li key={meal.id || `${plan.id}-meal-${index}`} className="relative flex gap-4 sm:gap-5 py-3">
              <span
                className={`relative z-10 mt-1 w-[18px] h-[18px] shrink-0 rounded-full border-2 ${
                  isNext
                    ? 'border-[var(--amber)] bg-[var(--amber)] shadow-[0_0_0_5px_rgba(255,181,71,0.18)]'
                    : 'border-[var(--line-2)] bg-[var(--ink-2)]'
                }`}
              />
              <div
                className={`flex-1 min-w-0 rounded-2xl px-4 sm:px-5 py-4 border transition-colors ${
                  isNext ? 'border-[rgba(255,181,71,0.35)] bg-[rgba(255,181,71,0.06)]' : 'border-white/[0.06] bg-white/[0.03]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {meal.time && <span className="cp-mono text-[13px] text-[var(--muted)]">{meal.time}</span>}
                    <p className="font-semibold text-[16px] truncate">{meal.name}</p>
                    {isNext && <Badge tone="amber">Próxima</Badge>}
                  </div>
                  {meal.calories != null && (
                    <span className="cp-mono text-[12.5px] text-[var(--muted)]">{meal.calories} kcal</span>
                  )}
                </div>
                {(meal.items || []).length > 0 && (
                  <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {(meal.items || []).map((item, i) => (
                      <li key={item.id || `${plan.id}-${index}-${i}`} className="flex items-baseline gap-2 text-[14px]">
                        <span className="w-1 h-1 rounded-full bg-[var(--amber)] shrink-0 translate-y-[-3px]" />
                        <span className="text-[var(--cream)]">{item.name}</span>
                        {item.quantity && <span className="text-[var(--dim)]">· {item.quantity}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {meal.notes && <p className="mt-2 text-[13px] text-[var(--dim)]">{meal.notes}</p>}
              </div>
            </li>
          )
        })}
      </ol>

      {(plan.isInformational || plan.source === 'ai') && (
        <p className="px-7 pb-6 -mt-2 text-[12.5px] text-[var(--dim)]">Conteúdo informativo — não é prescrição clínica.</p>
      )}
    </Card>
  )
}
