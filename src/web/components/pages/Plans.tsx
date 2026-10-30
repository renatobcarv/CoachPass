import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { MotionConfig } from 'motion/react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Backdrop, Grain, Logo, Reveal, SplitWords } from '../brand/Brand'
import { useAuth } from '../../context/AuthContext'
import { ProPricing } from '../pricing/ProPricing'
import { chooseProPlan, fetchProPlan, trialDaysLeft, type ProPlanStatus } from '../../lib/proPlanApi'
import { PRO_PLANS, type BillingCycle, type ProTier } from '@/lib/proPlans'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

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

const featured = 'annual'

/** Profissionais (e visitantes) veem os planos por número de alunos; aluno vê os planos de IA. */
export function Plans() {
  const { user } = useAuth()
  if (user?.role === 'student') return <StudentPlans />
  return <ProfessionalPlans />
}

function ProfessionalPlans() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isPro = user?.role === 'personal' || user?.role === 'nutritionist' || user?.role === 'master'
  const audience = user?.role === 'nutritionist' ? 'nutritionist' : 'personal'
  const home = !user ? '/' : user.role === 'nutritionist' ? '/nutritionist' : user.role === 'personal' ? '/personal' : '/app'
  const [status, setStatus] = useState<ProPlanStatus | null>(null)
  const [busy, setBusy] = useState<ProTier | null>(null)

  const load = useCallback(async () => {
    if (!isPro || !user?.accessToken) return
    try {
      setStatus(await fetchProPlan(user.accessToken))
    } catch {
      /* sem status a tabela funciona como vitrine */
    }
  }, [isPro, user?.accessToken])

  useEffect(() => {
    void load()
  }, [load])

  const choose = async (tier: ProTier, cycle: BillingCycle) => {
    if (!user?.accessToken || !isPro) {
      navigate('/cadastro')
      return
    }
    setBusy(tier)
    try {
      const next = await chooseProPlan(tier, cycle, user.accessToken)
      setStatus(next)
      const left = trialDaysLeft(next.trialEndsAt)
      toast.success(
        tier === 'free'
          ? 'Você está no Grátis.'
          : `${PRO_PLANS[tier].name} liberado${left ? ` por ${left} dias de teste` : ''}.`,
      )
    } catch (err) {
      const msg = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : ''
      toast.error(msg || 'Não foi possível mudar o plano agora.')
    } finally {
      setBusy(null)
    }
  }

  const left = trialDaysLeft(status?.trialEndsAt ?? null)
  const who = audience === 'nutritionist' ? 'pacientes' : 'alunos'

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand relative min-h-screen overflow-hidden">
        <Grain />
        <Backdrop variant="soft" />
        <div className="relative max-w-[1160px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center justify-between">
            <Logo to={home} />
            <Link to={home} className="inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {user ? 'Voltar ao painel' : 'Voltar'}
            </Link>
          </div>

          <div className="mt-14 max-w-3xl">
            <p className="cp-kicker">Planos para profissionais</p>
            <h1 className="cp-display mt-4 text-[clamp(38px,5.6vw,76px)] font-bold leading-[0.98]">
              <SplitWords text="Pague pelo tamanho" immediate />{' '}
              <SplitWords text="da sua carteira." immediate delay={0.2} className="text-[var(--brand-300)]" />
            </h1>
            <Reveal delay={0.35}>
              <p className="mt-5 text-[16px] text-[var(--muted)]">
                Todos os recursos liberados em qualquer plano. Comece grátis com até {PRO_PLANS.free.studentLimit} {who} e
                suba só quando a carteira crescer.
              </p>
            </Reveal>
            {status && (
              <p className="cp-mono mt-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--line-2)] px-4 py-2 text-[12.5px]">
                <span className="text-[var(--muted)]">Seu plano:</span>
                <strong>{PRO_PLANS[status.tier].name}</strong>
                <span className="text-[var(--dim)]">·</span>
                <span>
                  {status.used}
                  {status.limit !== null ? ` de ${status.limit}` : ''} {who}
                </span>
                {status.onTrial && left !== null && (
                  <>
                    <span className="text-[var(--dim)]">·</span>
                    <span className="text-[var(--amber)]">teste termina em {left} {left === 1 ? 'dia' : 'dias'}</span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="mt-12">
            <ProPricing
              audience={audience}
              usedStudents={status?.used ? Math.max(status.used, 1) : undefined}
              currentTier={status?.tier}
              trialUsed={status?.trialUsed}
              onTrial={status?.onTrial}
              busyTier={busy}
              onChoose={choose}
            />
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}

/** Planos de IA do aluno — página visual provisória (sem gateway). */
function StudentPlans() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand relative min-h-screen overflow-hidden">
        <Grain />
        <Backdrop variant="soft" />
        <div className="relative max-w-[1100px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex items-center justify-between">
            <Logo to="/app" />
            <Link
              to="/app"
              className="inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao painel
            </Link>
          </div>

          <div className="mt-20 text-center max-w-2xl mx-auto">
            <p className="cp-kicker">Planos CoachPass</p>
            <h1 className="cp-display mt-4 text-[clamp(40px,5.4vw,72px)] font-bold leading-[0.98]">
              <SplitWords text="Mais IA para o seu" immediate />{' '}
              <SplitWords text="acompanhamento." immediate delay={0.25} className="cp-accent" />
            </h1>
            <Reveal delay={0.4}>
              <p className="mt-5 text-[16px] text-[var(--muted)]">
                Conta gratuita: 2 gerações de IA por mês. Os valores abaixo são provisórios e a assinatura ainda não
                processa pagamento.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan, i) => {
              const isFeatured = plan.id === featured
              return (
                <Reveal key={plan.id} delay={0.1 * i} className="h-full">
                  <div
                    className={`cp-card h-full p-7 flex flex-col ${
                      isFeatured
                        ? 'border-[var(--brand-400)] shadow-[0_0_0_1px_var(--brand-400)]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="cp-display text-[22px] font-bold">{plan.name}</h2>
                      {isFeatured && (
                        <span className="cp-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--amber)] bg-[rgba(255,181,71,0.12)] border border-[rgba(255,181,71,0.3)]">
                          <Sparkles className="w-3 h-3" />
                          Melhor valor
                        </span>
                      )}
                    </div>
                    <p className="mt-6 cp-display text-[44px] font-bold leading-none">
                      {plan.price}
                      <span className="ml-1 text-[15px] font-normal tracking-normal text-[var(--muted)]">{plan.period}</span>
                    </p>
                    <p className="mt-6 cp-mono text-[11.5px] text-[var(--dim)]">{plan.note}</p>
                    <div className="mt-auto pt-8">
                      <button
                        type="button"
                        disabled
                        className="w-full h-12 rounded-full text-[14px] font-semibold border border-[var(--line-2)] text-[var(--muted)] cursor-not-allowed"
                      >
                        Em breve
                      </button>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
