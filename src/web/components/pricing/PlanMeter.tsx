import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

import { PRO_PLANS } from '@/lib/proPlans'
import { useAuth } from '../../context/AuthContext'
import { fetchProPlan, trialDaysLeft, type ProPlanStatus } from '../../lib/proPlanApi'

/** Uso da carteira no menu do profissional: "3 de 5 alunos · Grátis". */
export function PlanMeter() {
  const { user } = useAuth()
  const [status, setStatus] = useState<ProPlanStatus | null>(null)
  const who = user?.role === 'nutritionist' ? 'pacientes' : 'alunos'

  useEffect(() => {
    if (!user?.accessToken) return
    let alive = true
    fetchProPlan(user.accessToken)
      .then((s) => alive && setStatus(s))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [user?.accessToken])

  if (!status) return null

  const plan = PRO_PLANS[status.tier]
  const ratio = status.limit ? Math.min(1, status.used / status.limit) : 0
  const tight = status.limit !== null && ratio >= 0.8
  const left = status.onTrial ? trialDaysLeft(status.trialEndsAt) : null

  return (
    <Link
      to="/planos"
      className="group block rounded-2xl border border-[var(--line-2)] bg-white/[0.025] p-4 transition-colors hover:border-[var(--brand-400)]"
    >
      <div className="flex items-center justify-between">
        <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--dim)]">Plano {plan.name}</p>
        <ArrowUpRight className="h-4 w-4 text-[var(--dim)] transition-colors group-hover:text-white" />
      </div>
      <p className="mt-1 text-[14px] font-semibold">
        {status.used}
        {status.limit !== null ? ` de ${status.limit}` : ''} {who}
      </p>
      {status.limit !== null && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--line-2)]">
          <div
            className={`h-full rounded-full ${tight ? 'bg-[var(--amber)]' : 'bg-[var(--brand-500)]'}`}
            style={{ width: `${Math.max(4, ratio * 100)}%` }}
          />
        </div>
      )}
      <p className="mt-2 text-[12.5px] text-[var(--muted)]">
        {left !== null
          ? `Teste termina em ${left} ${left === 1 ? 'dia' : 'dias'}`
          : tight
            ? 'Quase cheio. Ver planos maiores'
            : status.tier === 'elite'
              ? 'Sem limite de alunos'
              : 'Ver planos'}
      </p>
    </Link>
  )
}
