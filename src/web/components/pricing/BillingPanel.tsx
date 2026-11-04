import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CalendarClock, Check, CreditCard, ExternalLink, RefreshCw, Sparkles, Users, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { PRO_PLANS, PRO_TIERS, TRIAL_DAYS, formatBRL, type ProTier } from '@/lib/proPlans'
import { STUDENT_CYCLES, STUDENT_FREE_AI, STUDENT_PLANS, STUDENT_PRO_PERKS, monthlyEquivalent, type StudentCycle } from '@/lib/studentPlans'
import {
  chooseProPlan,
  fetchProPlan,
  openBillingPortal,
  subscribeProPlan,
  subscribeStudentPlan,
  syncBilling,
  trialDaysLeft,
  type ProPlanStatus,
} from '../../lib/proPlanApi'
import { fetchStudentPlan } from '../../lib/performanceApi'
import { fetchAiQuota, type AiQuota } from '../../lib/studentApi'
import { useCheckoutReturn } from '../../lib/useCheckoutReturn'

type StudentStatus = Awaited<ReturnType<typeof fetchStudentPlan>> & {
  studentTier?: 'free' | 'pro'
  checkoutProduct?: string | null
  canManageBilling?: boolean
}

const card = 'dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6'
const muted = 'dark:text-zinc-400 text-slate-500'
const strong = 'dark:text-white text-slate-900'
const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '')
const errText = (err: unknown, fallback: string) =>
  (err instanceof PayloadApiError ? extractPayloadMessage(err.data) : '') || fallback

const STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  active: { text: 'Assinatura ativa', tone: 'bg-emerald-500/10 text-emerald-500' },
  pending: { text: 'Pagamento pendente', tone: 'bg-amber-500/10 text-amber-500' },
  cancelled: { text: 'Cancelada', tone: 'bg-red-500/10 text-red-400' },
  none: { text: 'Sem assinatura', tone: 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-600' },
}

function Badge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? STATUS_LABEL.none
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.tone}`}>{s.text}</span>
}

function Stat({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl p-4 dark:bg-zinc-800/50 bg-slate-50">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 dark:text-zinc-300 text-slate-600" />
      <div className="min-w-0">
        <p className={`text-xs ${muted}`}>{label}</p>
        <p className={`text-sm font-semibold ${strong}`}>{value}</p>
        {hint && <p className={`mt-0.5 text-xs ${muted}`}>{hint}</p>}
      </div>
    </div>
  )
}

function Meter({ used, limit }: { used: number; limit: number | null }) {
  if (limit === null) return null
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100))
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full dark:bg-zinc-800 bg-slate-200">
      <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-500' : 'dark:bg-white bg-slate-900'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Aba "Plano e cobrança": plano em vigor, uso, renovação, troca de plano e portal de pagamento. */
export function BillingPanel() {
  const { user } = useAuth()
  const token = user?.accessToken
  const isStudent = user?.role === 'student'
  const base = user?.role === 'personal' ? '/personal' : user?.role === 'nutritionist' ? '/nutritionist' : '/app'
  const returnPath = `${base}/configuracoes`

  const [pro, setPro] = useState<ProPlanStatus | null>(null)
  const [student, setStudent] = useState<StudentStatus | null>(null)
  const [quota, setQuota] = useState<AiQuota | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    try {
      const [plan, q] = await Promise.all([
        isStudent ? fetchStudentPlan(token) : fetchProPlan(token),
        fetchAiQuota(token).catch(() => null),
      ])
      if (isStudent) setStudent(plan as StudentStatus)
      else setPro(plan as ProPlanStatus)
      setQuota(q)
    } catch {
      toast.error('Não foi possível carregar o seu plano.')
    } finally {
      setLoading(false)
    }
  }, [token, isStudent])

  useEffect(() => {
    void load()
  }, [load])

  const checkout = useCheckoutReturn(token, () => void load())
  useEffect(() => {
    if (checkout === 'pending') void load()
  }, [checkout, load])

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  const portal = () =>
    run('portal', async () => {
      if (!token) return
      try {
        const { url } = await openBillingPortal(token)
        window.open(url, '_blank', 'noopener')
      } catch (err) {
        toast.error(errText(err, 'Não foi possível abrir o portal de pagamento.'))
      }
    })

  const refresh = () =>
    run('sync', async () => {
      if (!token) return
      try {
        await syncBilling(token)
        await load()
        toast.success('Status atualizado.')
      } catch (err) {
        toast.error(errText(err, 'Não foi possível conferir com o AbacatePay agora.'))
      }
    })

  const goCheckout = (key: string, fn: () => Promise<{ url?: string; message?: string }>) =>
    run(key, async () => {
      try {
        const res = await fn()
        if (res.url) {
          window.location.href = res.url
          return
        }
        toast.success(res.message || 'Plano atualizado.')
        await load()
      } catch (err) {
        toast.error(errText(err, 'Não foi possível abrir o pagamento.'))
      }
    })

  if (loading || (!pro && !student)) {
    return (
      <div className={card}>
        <div className="h-5 w-40 animate-pulse rounded dark:bg-zinc-800 bg-slate-200" />
        <div className="mt-4 h-24 animate-pulse rounded-2xl dark:bg-zinc-800 bg-slate-100" />
      </div>
    )
  }

  const checking = checkout === 'checking' && (
    <div role="status" className={`${card} flex items-center gap-3`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-zinc-600 dark:border-t-white" />
      <p className={`text-sm ${strong}`}>Confirmando seu pagamento com o AbacatePay…</p>
    </div>
  )

  const quotaStat = quota && (
    <Stat
      icon={Zap}
      label="IA este mês"
      value={`${quota.used} de ${quota.limit}`}
      hint={quota.remaining > 0 ? `${quota.remaining} restantes, renova no dia 1º` : 'Cota do mês usada'}
    />
  )

  /* ───────────── Aluno ───────────── */
  if (student) {
    const s = student
    const active = s.subscriptionStatus === 'active'
    const current = (s.checkoutProduct?.replace('student_', '') ?? null) as StudentCycle | null
    const cycle = current && STUDENT_PLANS[current as StudentCycle] ? (current as StudentCycle) : null
    const title = s.viaProfessional ? 'Aluno Pro (incluído)' : s.studentPro ? `Aluno Pro${cycle ? ` ${STUDENT_PLANS[cycle].label}` : ''}` : 'Grátis'
    return (
      <div className="space-y-4">
        {checking}
        <div className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-widest ${muted}`}>Seu plano</p>
              <p className={`mt-1 text-2xl font-extrabold ${strong}`}>{title}</p>
              <p className={`mt-1 text-sm ${muted}`}>
                {s.viaProfessional
                  ? 'Liberado pela sua conta profissional, sem cobrança extra.'
                  : cycle
                    ? `${formatBRL(STUDENT_PLANS[cycle].price, true)} por ${cycle === 'monthly' ? 'mês' : cycle === 'semester' ? 'semestre' : 'ano'}`
                    : 'Treinos e dietas do seu profissional, sem custo.'}
              </p>
            </div>
            {!s.viaProfessional && <Badge status={s.subscriptionStatus} />}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {quotaStat}
            <Stat
              icon={CalendarClock}
              label={s.subscriptionStatus === 'cancelled' ? 'Acesso até' : 'Próxima cobrança'}
              value={s.paidUntil ? date(s.paidUntil) : '—'}
              hint={s.subscriptionStatus === 'cancelled' ? 'Depois volta para o Grátis' : undefined}
            />
            <Stat icon={Sparkles} label="Recursos" value={s.studentPro ? 'Treino, dieta e periodização próprios' : 'Planos do seu profissional'} />
          </div>

          {!s.viaProfessional && (
            <div className="mt-5 flex flex-wrap gap-2">
              {s.canManageBilling && (
                <button type="button" onClick={() => void portal()} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 disabled:opacity-60">
                  <CreditCard className="h-4 w-4" /> {busy === 'portal' ? 'Abrindo…' : 'Cartão, faturas e cancelamento'} <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </button>
              )}
              {s.subscriptionStatus !== 'none' && (
                <button type="button" onClick={() => void refresh()} disabled={busy !== null} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${muted} disabled:opacity-60`}>
                  <RefreshCw className={`h-4 w-4 ${busy === 'sync' ? 'animate-spin' : ''}`} /> Atualizar status
                </button>
              )}
            </div>
          )}
        </div>

        {!s.viaProfessional && (
          <div className={card}>
            <h3 className={`font-bold ${strong}`}>{active ? 'Trocar de ciclo' : 'Assinar o Aluno Pro'}</h3>
            <p className={`mt-1 text-sm ${muted}`}>
              {active ? 'A troca vale a partir da próxima cobrança.' : `Grátis inclui ${STUDENT_FREE_AI} gerações de IA por mês. O Aluno Pro libera:`}
            </p>
            {!active && (
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {STUDENT_PRO_PERKS.map((p) => (
                  <li key={p} className={`flex items-start gap-2 text-sm ${strong}`}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} /> {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {STUDENT_CYCLES.map((c) => {
                const p = STUDENT_PLANS[c]
                const mine = active && cycle === c
                return (
                  <div key={c} className={`flex flex-col rounded-2xl border p-4 ${mine ? 'border-slate-900 dark:border-white' : 'dark:border-zinc-700 border-slate-200'}`}>
                    <p className={`font-semibold ${strong}`}>{p.label}</p>
                    <p className={`mt-2 text-xl font-extrabold ${strong}`}>{formatBRL(p.price, true)}</p>
                    <p className={`text-xs ${muted}`}>{c === 'monthly' ? 'por mês' : `${formatBRL(monthlyEquivalent(c), true)}/mês`}</p>
                    <button
                      type="button"
                      disabled={mine || busy !== null || !s.billingEnabled}
                      onClick={() => void goCheckout(c, () => subscribeStudentPlan(c, token!, returnPath))}
                      className="mt-4 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
                    >
                      {mine ? 'Seu plano' : busy === c ? 'Abrindo…' : !s.billingEnabled ? 'Em breve' : active ? 'Trocar para este' : 'Assinar'}
                    </button>
                  </div>
                )
              })}
            </div>
            <p className={`mt-4 text-xs ${muted}`}>Pagamento no cartão pelo AbacatePay. Cancele quando quiser pelo portal; o acesso segue até o fim do período pago.</p>
          </div>
        )}
      </div>
    )
  }

  /* ───────────── Profissional ───────────── */
  const p = pro!
  const who = user?.role === 'nutritionist' ? 'pacientes' : 'alunos'
  const subscribed = p.subscriptionStatus === 'active'
  const left = trialDaysLeft(p.trialEndsAt)
  const plan = PRO_PLANS[p.tier]
  const renewal = subscribed
    ? { label: 'Próxima cobrança', value: date(p.paidUntil) || '—', hint: `${formatBRL(PRO_PLANS[p.chosenTier].monthly, true)} no cartão` }
    : p.onTrial && left !== null
      ? { label: 'Teste grátis', value: `${left} ${left === 1 ? 'dia' : 'dias'} restantes`, hint: `Termina em ${date(p.trialEndsAt)}` }
      : p.subscriptionStatus === 'cancelled' && p.paidUntil
        ? { label: 'Acesso até', value: date(p.paidUntil), hint: 'Depois volta para o Grátis' }
        : { label: 'Cobrança', value: 'Nenhuma', hint: 'Plano gratuito' }

  return (
    <div className="space-y-4">
      {checking}
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-xs uppercase tracking-widest ${muted}`}>Seu plano</p>
            <p className={`mt-1 text-2xl font-extrabold ${strong}`}>
              {plan.name}
              {p.onTrial && <span className="ml-2 align-middle text-sm font-semibold text-amber-500">em teste</span>}
            </p>
            <p className={`mt-1 text-sm ${muted}`}>
              {p.tier === 'free' ? 'R$ 0' : `${formatBRL(plan.monthly, true)}/mês`} · {plan.studentLimit === null ? `${who} ilimitados` : `até ${plan.studentLimit} ${who}`}
            </p>
          </div>
          <Badge status={p.onTrial ? 'none' : p.subscriptionStatus} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl p-4 dark:bg-zinc-800/50 bg-slate-50">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 shrink-0 dark:text-zinc-300 text-slate-600" />
              <div className="min-w-0 flex-1">
                <p className={`text-xs ${muted}`}>{who[0].toUpperCase() + who.slice(1)} ativos</p>
                <p className={`text-sm font-semibold ${strong}`}>
                  {p.used}
                  {p.limit !== null ? ` de ${p.limit}` : ' · sem limite'}
                </p>
                <Meter used={p.used} limit={p.limit} />
                {!p.canAdd && <p className="mt-1 text-xs text-red-400">Limite atingido. Suba de plano para vincular mais.</p>}
              </div>
            </div>
          </div>
          <Stat icon={CalendarClock} label={renewal.label} value={renewal.value} hint={renewal.hint} />
          {quotaStat || <Stat icon={Sparkles} label="Recursos" value="Todos liberados" />}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {p.canManageBilling && (
            <button type="button" onClick={() => void portal()} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 disabled:opacity-60">
              <CreditCard className="h-4 w-4" /> {busy === 'portal' ? 'Abrindo…' : 'Cartão, faturas e cancelamento'} <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
          )}
          {p.subscriptionStatus !== 'none' && (
            <button type="button" onClick={() => void refresh()} disabled={busy !== null} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${muted} disabled:opacity-60`}>
              <RefreshCw className={`h-4 w-4 ${busy === 'sync' ? 'animate-spin' : ''}`} /> Atualizar status
            </button>
          )}
          <Link to="/planos" className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${muted}`}>
            Comparar planos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className={card}>
        <h3 className={`font-bold ${strong}`}>{subscribed ? 'Mudar de plano' : 'Escolha o seu plano'}</h3>
        <p className={`mt-1 text-sm ${muted}`}>
          {subscribed
            ? 'Subir para o Elite libera na hora; descer para o Pro vale no próximo ciclo. Para voltar ao Grátis, cancele pelo portal.'
            : `Todos os recursos em todos os planos. ${p.trialUsed ? '' : `Pro e Elite têm ${TRIAL_DAYS} dias grátis, sem cartão.`}`}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {PRO_TIERS.map((tier) => {
            const t = PRO_PLANS[tier]
            const mine = subscribed ? p.chosenTier === tier : p.tier === tier
            const tooSmall = t.studentLimit !== null && p.used > t.studentLimit
            return (
              <div key={tier} className={`flex flex-col rounded-2xl border p-4 ${mine ? 'border-slate-900 dark:border-white' : 'dark:border-zinc-700 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${strong}`}>{t.name}</p>
                  {mine && <span className={`text-xs font-semibold ${strong}`}>Atual</span>}
                </div>
                <p className={`mt-2 text-xl font-extrabold ${strong}`}>{tier === 'free' ? 'R$ 0' : `${formatBRL(t.monthly, true)}`}</p>
                <p className={`text-xs ${muted}`}>{t.studentLimit === null ? `${who} ilimitados` : `até ${t.studentLimit} ${who}`}</p>
                <div className="mt-4 space-y-2">
                  {tier === 'free' ? (
                    !mine &&
                    !subscribed && (
                      <button
                        type="button"
                        disabled={busy !== null || tooSmall}
                        onClick={() =>
                          void run('free', async () => {
                            try {
                              setPro(await chooseProPlan('free', token!))
                              toast.success('Você voltou para o Grátis.')
                            } catch (err) {
                              toast.error(errText(err, 'Não foi possível mudar agora.'))
                            }
                          })
                        }
                        className="w-full rounded-xl border px-3 py-2.5 text-sm font-semibold dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 disabled:opacity-50"
                      >
                        {tooSmall ? `Você tem mais de ${t.studentLimit} ${who}` : 'Voltar ao Grátis'}
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={(mine && subscribed) || busy !== null || !p.billingEnabled || tooSmall}
                        onClick={() => void goCheckout(tier, () => subscribeProPlan(tier as Exclude<ProTier, 'free'>, token!, returnPath))}
                        className="w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
                      >
                        {mine && subscribed
                          ? 'Seu plano'
                          : busy === tier
                            ? 'Abrindo…'
                            : !p.billingEnabled
                              ? 'Pagamento em breve'
                              : subscribed
                                ? `Trocar para o ${t.name}`
                                : `Assinar o ${t.name}`}
                      </button>
                      {!subscribed && !p.trialUsed && (
                        <button
                          type="button"
                          disabled={busy !== null || tooSmall}
                          onClick={() =>
                            void run(`trial-${tier}`, async () => {
                              try {
                                const next = await chooseProPlan(tier, token!)
                                setPro(next)
                                toast.success(`${t.name} liberado por ${TRIAL_DAYS} dias.`)
                              } catch (err) {
                                toast.error(errText(err, 'Não foi possível iniciar o teste.'))
                              }
                            })
                          }
                          className="w-full rounded-xl border px-3 py-2.5 text-sm font-semibold dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 disabled:opacity-50"
                        >
                          Testar {TRIAL_DAYS} dias grátis
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className={`mt-4 text-xs ${muted}`}>
          Cobrança mensal no cartão pelo AbacatePay. Personal e nutricionista na mesma conta só no Elite. Se um pagamento falhar, você tem alguns dias de tolerância antes de voltar para o Grátis.
        </p>
      </div>
    </div>
  )
}
