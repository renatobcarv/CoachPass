import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { MotionConfig } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { CMS_BASE_URL, PayloadApiError, extractPayloadMessage, postJson } from '@/lib/cms'
import { STUDENT_CYCLES, STUDENT_PLANS, STUDENT_PRO_PERKS, STUDENT_FREE_AI, monthlyEquivalent, type StudentCycle } from '@/lib/studentPlans'
import { formatBRL } from '@/lib/proPlans'
import { fetchStudentPlan } from '../../lib/performanceApi'
import { openBillingPortal, syncBilling } from '../../lib/proPlanApi'
import { Backdrop, Grain, Logo, Reveal, SplitWords } from '../brand/Brand'

type Status = Awaited<ReturnType<typeof fetchStudentPlan>>

/** Aluno Pro: criar os próprios treinos, dieta e periodização. Preços mantidos: R$ 29,90 / 149,90 / 249,90. */
export function StudentPlans() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState<StudentCycle | 'manage' | null>(null)
  const token = user?.accessToken

  useEffect(() => {
    if (!token) return
    fetchStudentPlan(token).then(setStatus).catch(() => undefined)
  }, [token])

  // Volta do checkout: confere o pagamento algumas vezes
  useEffect(() => {
    if (params.get('assinatura') !== 'retorno' || !token) return
    let alive = true
    void (async () => {
      for (let i = 0; i < 8 && alive; i++) {
        await syncBilling(token).catch(() => undefined)
        const s = await fetchStudentPlan(token).catch(() => null)
        if (s && alive) setStatus(s)
        if (s?.subscriptionStatus === 'active') {
          toast.success('Aluno Pro ativo. Bons treinos!')
          break
        }
        await new Promise((r) => setTimeout(r, 2500))
      }
      if (alive) {
        const p = new URLSearchParams(params)
        p.delete('assinatura')
        setParams(p, { replace: true })
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const subscribe = async (cycle: StudentCycle) => {
    if (!token) return
    setBusy(cycle)
    try {
      const res = await postJson<{ url?: string; message?: string }>(`${CMS_BASE_URL}/api/pro/billing/subscribe`, { studentCycle: cycle }, token)
      if (res.url) {
        window.location.href = res.url
        return
      }
      toast.success(res.message || 'Plano atualizado.')
      setStatus(await fetchStudentPlan(token))
    } catch (err) {
      toast.error((err instanceof PayloadApiError ? extractPayloadMessage(err.data) : '') || 'Não foi possível abrir o pagamento.')
    } finally {
      setBusy(null)
    }
  }

  const manage = async () => {
    if (!token) return
    setBusy('manage')
    try {
      const { url } = await openBillingPortal(token)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error('Não foi possível abrir o portal.')
    } finally {
      setBusy(null)
    }
  }

  const pro = status?.studentPro
  const subscribed = status?.subscriptionStatus === 'active'

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand relative min-h-screen overflow-hidden">
        <Grain />
        <Backdrop variant="soft" />
        <div className="relative mx-auto max-w-[1100px] px-4 py-8 sm:px-8">
          <div className="flex items-center justify-between">
            <Logo to="/app" />
            <Link to="/app" className="inline-flex items-center gap-2 text-[14px] text-[var(--muted)] transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Voltar ao painel
            </Link>
          </div>

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <p className="cp-kicker">Aluno Pro</p>
            <h1 className="cp-display mt-4 text-[clamp(38px,5.4vw,68px)] font-bold leading-[0.98]">
              <SplitWords text="Seu treino," immediate /> <SplitWords text="do seu jeito." immediate delay={0.2} className="text-[var(--brand-300)]" />
            </h1>
            <Reveal delay={0.35}>
              <p className="mt-5 text-[16px] text-[var(--muted)]">
                Monte seus treinos, sua dieta e sua periodização, com sugestões de carga a cada sessão. Os treinos do seu personal continuam grátis.
              </p>
            </Reveal>
            {pro && (
              <p className="cp-mono mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-2)] px-4 py-2 text-[12.5px]">
                <Check className="h-4 w-4 text-[var(--teal)]" />
                {status?.viaProfessional ? 'Liberado pela sua conta profissional' : `Aluno Pro ativo${status?.paidUntil ? ` · renova em ${new Date(status.paidUntil).toLocaleDateString('pt-BR')}` : ''}`}
              </p>
            )}
          </div>

          <ul className="mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-2">
            {STUDENT_PRO_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-[14.5px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-300)]" strokeWidth={3} /> {p}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
            {STUDENT_CYCLES.map((cycle) => {
              const plan = STUDENT_PLANS[cycle]
              const featured = cycle === 'annual'
              const perMonth = monthlyEquivalent(cycle)
              const savings = cycle === 'monthly' ? 0 : STUDENT_PLANS.monthly.price * plan.months - plan.price
              return (
                <div key={cycle} className={`flex flex-col rounded-[26px] border p-6 ${featured ? 'cp-paper border-transparent' : 'border-[var(--line-2)] bg-[var(--ink-2)]'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="cp-display text-[22px] font-bold">{plan.label}</h2>
                    {featured && (
                      <span className="cp-mono inline-flex items-center gap-1 rounded-full bg-[var(--paper-ink)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--amber)]">
                        <Sparkles className="h-3 w-3" /> Melhor valor
                      </span>
                    )}
                  </div>
                  <p className="cp-display mt-5 text-[40px] font-bold leading-none">{formatBRL(plan.price, true)}</p>
                  <p className={`mt-2 text-[13px] ${featured ? 'text-[var(--paper-muted)]' : 'text-[var(--muted)]'}`}>
                    {cycle === 'monthly' ? 'por mês' : `${formatBRL(perMonth, true)}/mês · economize ${formatBRL(savings, true)}`}
                  </p>
                  <div className="mt-auto pt-7">
                    {subscribed || status?.viaProfessional ? (
                      <button type="button" onClick={() => void manage()} disabled={!subscribed || busy !== null} className={`h-12 w-full rounded-full border text-[14px] font-semibold ${featured ? 'border-[var(--paper-ink)] text-[var(--paper-ink)]' : 'border-[var(--line-2)] text-[var(--muted)]'} disabled:opacity-60`}>
                        {status?.viaProfessional ? 'Incluído na sua conta' : 'Gerenciar assinatura'}
                      </button>
                    ) : status?.billingEnabled ? (
                      <button
                        type="button"
                        onClick={() => void subscribe(cycle)}
                        disabled={busy !== null}
                        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-60 ${featured ? 'bg-[var(--paper-ink)] text-white' : 'bg-[var(--paper)] text-[var(--paper-ink)]'}`}
                      >
                        {busy === cycle ? 'Abrindo…' : `Assinar ${plan.label.toLowerCase()}`} <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button type="button" disabled className="h-12 w-full cursor-not-allowed rounded-full border border-[var(--line-2)] text-[14px] font-semibold text-[var(--muted)]">
                        Em breve
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-6 text-center text-[12.5px] text-[var(--dim)]">
            Conta gratuita: treinos e dietas do seu profissional, registro de treino e evolução, {STUDENT_FREE_AI} gerações de IA por mês. Pagamento no cartão pelo AbacatePay; cancele quando quiser.
          </p>
        </div>
      </div>
    </MotionConfig>
  )
}
