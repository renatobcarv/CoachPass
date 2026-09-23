import React, { useEffect, useState } from 'react'
import { Apple, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { MealPlanDoc, fetchPublishedMealPlans, relName } from '../../lib/studentApi'

const card =
  'rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]'

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Alimentação</h1>
          <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            Somente planos publicados pelo nutricionista ou sugestões de IA.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Geração com IA em breve"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326] opacity-60 cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          Gerar sugestão com IA · Em breve
        </button>
      </div>

      {loading && (
        <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">Carregando…</p>
      )}
      {error && <div className={`${card} text-sm text-red-600 dark:text-red-300`}>{error}</div>}

      {!loading && plans.length === 0 && (
        <div className={`${card} text-center py-10`}>
          <Apple className="w-8 h-8 mx-auto text-[#8e8e9a]" />
          <p className="mt-3 font-semibold text-[#000326] dark:text-white">
            Nenhum plano alimentar ainda
          </p>
          <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE] max-w-md mx-auto">
            Quando um nutricionista publicar um plano — ou quando a sugestão com IA estiver
            disponível — ele será listado aqui. Sugestões de IA são informativas e não substituem
            prescrição clínica.
          </p>
        </div>
      )}

      {plans.map((plan) => (
        <article key={plan.id} className={card}>
          <h2 className="font-semibold text-[#000326] dark:text-white">{plan.title}</h2>
          <p className="mt-1 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
            {plan.source === 'ai' ? 'Sugestão IA' : relName(plan.author, 'Nutricionista')}
          </p>
          {plan.observations && (
            <p className="mt-3 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">{plan.observations}</p>
          )}
          <div className="mt-4 space-y-3">
            {(plan.meals || []).map((meal, index) => (
              <div
                key={meal.id || `${plan.id}-meal-${index}`}
                className="rounded-xl px-3 py-3 bg-[#f3f4f9] dark:bg-[#000137]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#000326] dark:text-white">{meal.name}</p>
                  {meal.calories != null && (
                    <span className="text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                      {meal.calories} kcal
                    </span>
                  )}
                </div>
                {(meal.items || []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {(meal.items || []).map((item, i) => (
                      <li
                        key={item.id || `${plan.id}-${index}-${i}`}
                        className="text-xs text-[#6a6a7a] dark:text-[#C5C5CE]"
                      >
                        {item.name}
                        {item.quantity ? ` · ${item.quantity}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          {(plan.isInformational || plan.source === 'ai') && (
            <p className="mt-3 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
              Conteúdo informativo — não é prescrição clínica.
            </p>
          )}
        </article>
      ))}
    </div>
  )
}
