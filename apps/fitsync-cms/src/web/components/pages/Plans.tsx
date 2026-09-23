import React from 'react'
import { Link } from 'react-router'
import { ArrowLeft, CreditCard } from 'lucide-react'

const plans = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 'R$ 29,90',
    period: '/mês',
    note: 'Valores provisórios — pagamento ainda não integrado.',
  },
  {
    id: 'semester',
    name: 'Semestral',
    price: 'R$ 149,90',
    period: '/6 meses',
    note: 'Valores provisórios — pagamento ainda não integrado.',
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 'R$ 249,90',
    period: '/ano',
    note: 'Valores provisórios — pagamento ainda não integrado.',
  },
]

/** Página visual provisória (sem gateway). Benefícios pagos não são liberados pelo clique. */
export function Plans() {
  return (
    <div className="min-h-screen bg-[#f3f4f9] dark:bg-[#000326] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE] hover:text-[#000326] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Planos CoachPass</h1>
          <p className="mt-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            Conta gratuita: 2 gerações de IA por mês. Os valores abaixo são provisórios e a
            assinatura ainda não processa pagamento.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]"
            >
              <CreditCard className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
              <h2 className="mt-3 font-semibold text-[#000326] dark:text-white">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-[#000326] dark:text-white">
                {plan.price}
                <span className="text-sm font-normal text-[#8e8e9a]">{plan.period}</span>
              </p>
              <p className="mt-3 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">{plan.note}</p>
              <button
                type="button"
                disabled
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium bg-[#000326]/40 text-white dark:bg-white/40 dark:text-[#000326] cursor-not-allowed"
              >
                Em breve
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
