import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import {
  Activity,
  Apple,
  ArrowRight,
  Dumbbell,
  Flame,
  Scale,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  AiQuota,
  MealPlanDoc,
  ProfessionalLink,
  WorkoutDoc,
  fetchActiveProfessionalLinks,
  fetchAiQuota,
  fetchPublishedMealPlans,
  fetchPublishedWorkouts,
  goalLabel,
  relName,
  fetchMyStudentProfile,
  StudentProfile,
} from '../../lib/studentApi'
import { CTAButton } from '../brand/Brand'
import {
  Badge,
  Card,
  ErrorBanner,
  LoadingPage,
  Page,
  PageHeader,
  SectionTitle,
  Stat,
  WEEKDAY_ORDER,
  WEEKDAY_PT,
  todayWeekday,
  workoutTitle,
} from '../student/ui'

function weekdayLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

const FREE_AI_MONTHLY_LIMIT = 2

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [links, setLinks] = useState<ProfessionalLink[]>([])
  const [workouts, setWorkouts] = useState<WorkoutDoc[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlanDoc[]>([])
  const [quota, setQuota] = useState<AiQuota | null>(null)
  const [error, setError] = useState<string | null>(null)

  const firstName = user?.name?.split(' ')[0] || profile?.displayName?.split(' ')[0] || 'Aluno'
  const today = useMemo(() => weekdayLabel(), [])
  const remainingGenerations = quota?.remaining ?? FREE_AI_MONTHLY_LIMIT
  const quotaLimit = quota?.limit ?? FREE_AI_MONTHLY_LIMIT

  const personalLink = links.find((l) => l.professionalRole === 'personal')
  const nutritionistLink = links.find((l) => l.professionalRole === 'nutritionist')
  const hasPersonal = Boolean(personalLink)
  const hasNutritionist = Boolean(nutritionistLink)
  const hasAnyContent = workouts.length > 0 || mealPlans.length > 0
  const scenarioA = !hasPersonal && !hasNutritionist

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const [profileDoc, linkDocs, workoutDocs, mealDocs, aiQuota] = await Promise.all([
          fetchMyStudentProfile(user.id, user.accessToken),
          fetchActiveProfessionalLinks(user.id, user.accessToken),
          fetchPublishedWorkouts(user.id, user.accessToken),
          fetchPublishedMealPlans(user.id, user.accessToken),
          fetchAiQuota(user.accessToken).catch(() => null),
        ])
        if (cancelled) return
        setProfile(profileDoc)
        setLinks(linkDocs)
        setWorkouts(workoutDocs)
        setMealPlans(mealDocs)
        if (aiQuota) setQuota(aiQuota)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar o painel.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id])

  const todayKey = todayWeekday()
  const todaysWorkout = workouts.find((w) => w.weekday === todayKey) || null
  const nextWorkout =
    todaysWorkout ||
    [...workouts].sort(
      (a, b) =>
        ((WEEKDAY_ORDER.indexOf(a.weekday || '') - WEEKDAY_ORDER.indexOf(todayKey) + 7) % 7) -
        ((WEEKDAY_ORDER.indexOf(b.weekday || '') - WEEKDAY_ORDER.indexOf(todayKey) + 7) % 7),
    )[0] ||
    null
  const bmi =
    profile?.heightCm && profile?.weightKg ? profile.weightKg / Math.pow(profile.heightCm / 100, 2) : null
  const totalMealsKcal = (mealPlans[0]?.meals || []).reduce((sum, m) => sum + (m.calories || 0), 0)
  const quotaPct = quotaLimit > 0 ? remainingGenerations / quotaLimit : 0
  const ring = 2 * Math.PI * 30

  if (loading) {
    return <LoadingPage />
  }

  return (
    <Page>
      <PageHeader
        kicker={today}
        title="Olá,"
        accent={`${firstName}.`}
        lead={
          <>
            {profile?.goal
              ? `Objetivo: ${goalLabel(profile.goal)}.`
              : 'Complete seu perfil para personalizar o acompanhamento.'}{' '}
            {scenarioA
              ? 'Nenhum profissional vinculado ainda.'
              : 'Conteúdos publicados pelos seus profissionais aparecem abaixo.'}
          </>
        }
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* Destaque: treino do dia + IA */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Card className="p-6 sm:p-7 overflow-hidden" delay={0.05}>
          <div className="relative flex items-center justify-between gap-3">
            <Badge tone={todaysWorkout ? 'teal' : 'neutral'}>
              <Dumbbell className="w-3 h-3" />
              {todaysWorkout ? 'Treino de hoje' : nextWorkout ? 'Próximo treino' : 'Treino'}
            </Badge>
            {nextWorkout?.weekday && (
              <span className="cp-mono text-[12px] text-[var(--dim)]">{WEEKDAY_PT[nextWorkout.weekday]}</span>
            )}
          </div>

          {nextWorkout ? (
            <div className="relative">
              <h2 className="cp-display mt-5 text-[30px] sm:text-[34px] font-bold leading-[1.05]">
                {workoutTitle(nextWorkout.title, nextWorkout.weekday)}
              </h2>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                {[
                  nextWorkout.splitLabel,
                  nextWorkout.exercises?.length ? `${nextWorkout.exercises.length} exercícios` : null,
                  nextWorkout.source === 'ai' ? 'Gerado por IA' : `Por ${relName(nextWorkout.author, 'personal')}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <ul className="mt-5 grid sm:grid-cols-2 gap-2">
                {(nextWorkout.exercises || []).slice(0, 4).map((ex, i) => (
                  <li
                    key={ex.id || i}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.04] border border-white/[0.06]"
                  >
                    <span className="cp-mono text-[11px] text-[var(--dim)] w-5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 min-w-0 text-[14px] leading-snug">{ex.name}</span>
                    {(ex.sets || ex.reps) && (
                      <span className="cp-mono text-[11px] text-[var(--muted)]">
                        {[ex.sets, ex.reps].filter(Boolean).join('×')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <CTAButton to="/app/treinos">Ver treino completo</CTAButton>
              </div>
            </div>
          ) : (
            <div className="relative">
              <h2 className="cp-display mt-5 text-[26px] font-bold leading-tight">Nenhum treino publicado</h2>
              <p className="mt-2 text-[14.5px] text-[var(--muted)] max-w-md">
                {hasPersonal
                  ? 'Seu personal ainda não publicou um treino. Rascunhos não aparecem aqui.'
                  : 'Quando um personal publicar ou você gerar com IA, ele aparece aqui.'}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 flex flex-col" delay={0.12}>
          <div className="flex items-center justify-between">
            <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">IA neste mês</p>
            <Sparkles className="w-4 h-4 text-[var(--amber)]" />
          </div>
          <div className="mt-5 flex items-center gap-5">
            <svg viewBox="0 0 72 72" className="w-[84px] h-[84px] -rotate-90 shrink-0">
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <motion.circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="#f4f6fb"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={ring}
                initial={{ strokeDashoffset: ring }}
                animate={{ strokeDashoffset: ring * (1 - quotaPct) }}
                transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
              />
              <defs>
                <linearGradient id="cp-quota" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffb547" />
                  <stop offset="100%" stopColor="#ff8a5c" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <p className="cp-display text-[34px] font-bold leading-none">
                {remainingGenerations}
                <span className="text-[16px] text-[var(--muted)] font-medium"> / {quotaLimit}</span>
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--muted)]">gerações disponíveis</p>
            </div>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-[var(--dim)]">
            Conta gratuita: até duas gerações concluídas por mês calendário.
          </p>
          <Link
            to="/planos"
            className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--blue-2)] hover:underline"
          >
            Ver planos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Números do perfil */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Peso"
          value={profile?.weightKg != null ? String(profile.weightKg).replace('.', ',') : '—'}
          unit={profile?.weightKg != null ? 'kg' : undefined}
          icon={Scale}
          delay={0.16}
        />
        <Stat
          label="IMC"
          value={bmi ? bmi.toFixed(1).replace('.', ',') : '—'}
          hint={profile?.heightCm ? `${profile.heightCm} cm de altura` : undefined}
          icon={Activity}
          color="var(--teal)"
          delay={0.2}
        />
        <Stat
          label="Treinos"
          value={workouts.length}
          hint={workouts.length === 1 ? 'publicado' : 'publicados'}
          icon={Dumbbell}
          color="var(--violet)"
          delay={0.24}
        />
        <Stat
          label="Plano alimentar"
          value={totalMealsKcal ? totalMealsKcal.toLocaleString('pt-BR') : mealPlans.length}
          unit={totalMealsKcal ? 'kcal' : undefined}
          hint={totalMealsKcal ? 'no plano atual' : mealPlans.length === 1 ? 'publicado' : 'publicados'}
          icon={Flame}
          color="var(--amber)"
          delay={0.28}
        />
      </div>

      {/* Profissionais */}
      <section className="mt-10">
        <SectionTitle icon={UserRound}>Seus profissionais</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              key: 'personal',
              link: personalLink,
              icon: Dumbbell,
              role: 'Personal trainer',
              fallback: 'Personal vinculado',
              color: 'var(--blue-2)',
              empty: 'Nenhum personal vinculado ainda.',
            },
            {
              key: 'nutri',
              link: nutritionistLink,
              icon: Apple,
              role: 'Nutricionista',
              fallback: 'Nutricionista vinculado',
              color: 'var(--amber)',
              empty: 'Nenhum nutricionista vinculado ainda.',
            },
          ].map(({ key, link, icon: Icon, role, fallback, color, empty }, i) => (
            <Card key={key} className="p-5" delay={0.3 + i * 0.05}>
              <div className="flex items-center gap-4">
                <span
                  className="w-12 h-12 rounded-2xl grid place-items-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </span>
                <div className="min-w-0">
                  <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">{role}</p>
                  {link ? (
                    <p className="mt-0.5 font-semibold text-[16px] truncate">{relName(link.professional, fallback)}</p>
                  ) : (
                    <p className="mt-0.5 text-[14px] text-[var(--dim)]">{empty}</p>
                  )}
                </div>
                {link && (
                  <span className="ml-auto">
                    <Badge tone="teal">Ativo</Badge>
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {scenarioA && !hasAnyContent && (
        <section className="mt-10">
          <SectionTitle icon={Sparkles}>Ainda não há conteúdos cadastrados</SectionTitle>
          <p className="-mt-2 mb-4 text-[14px] text-[var(--muted)] max-w-2xl">
            Sem personal ou nutricionista vinculado, seu painel começa vazio. Aguarde a publicação de um profissional. A
            geração com IA estará disponível em breve.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {['Gerar treino com IA', 'Gerar sugestão alimentar com IA'].map((t, i) => (
              <Card key={t} className="p-5 opacity-80" delay={0.1 * i}>
                <Sparkles className="w-5 h-5 text-[var(--violet)]" />
                <p className="mt-3 font-semibold">{t}</p>
                <div className="mt-2">
                  <Badge tone="violet">Em breve</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Listas */}
      <div className="mt-10 grid lg:grid-cols-2 gap-8">
        <section>
          <SectionTitle
            icon={Dumbbell}
            action={
              <button
                type="button"
                onClick={() => navigate('/app/treinos')}
                className="text-[13.5px] text-[var(--muted)] hover:text-white transition-colors"
              >
                Ver todos →
              </button>
            }
          >
            Treinos publicados
          </SectionTitle>
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <Card className="p-5 text-[14px] text-[var(--muted)]">
                {hasPersonal
                  ? 'Seu personal ainda não publicou um treino. Rascunhos não aparecem aqui.'
                  : 'Nenhum treino publicado. Quando um personal publicar ou você gerar com IA, ele aparece aqui.'}
              </Card>
            ) : (
              workouts.slice(0, 3).map((workout, i) => (
                <Card key={workout.id} className="p-5" delay={0.05 * i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[16px]">{workoutTitle(workout.title, workout.weekday)}</p>
                      <p className="mt-1 text-[13px] text-[var(--dim)]">
                        {workout.source === 'ai' ? 'Gerado por IA' : `Por ${relName(workout.author, 'personal')}`}
                        {workout.exercises?.length ? ` · ${workout.exercises.length} exercícios` : ''}
                      </p>
                      {workout.observations && (
                        <p className="mt-2 text-[14px] text-[var(--muted)] line-clamp-2">{workout.observations}</p>
                      )}
                    </div>
                    {workout.weekday && <Badge>{WEEKDAY_PT[workout.weekday] || workout.weekday}</Badge>}
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        <section>
          <SectionTitle
            icon={Apple}
            action={
              <button
                type="button"
                onClick={() => navigate('/app/dieta')}
                className="text-[13.5px] text-[var(--muted)] hover:text-white transition-colors"
              >
                Ver todos →
              </button>
            }
          >
            Planos alimentares
          </SectionTitle>
          <div className="space-y-3">
            {mealPlans.length === 0 ? (
              <Card className="p-5 text-[14px] text-[var(--muted)]">
                {hasNutritionist
                  ? 'Seu nutricionista ainda não publicou um plano. Rascunhos não aparecem aqui.'
                  : 'Nenhum plano alimentar publicado. Quando um nutricionista publicar ou você gerar com IA, ele aparece aqui.'}
              </Card>
            ) : (
              mealPlans.slice(0, 3).map((plan, i) => (
                <Card key={plan.id} className="p-5" delay={0.05 * i}>
                  <p className="font-semibold text-[16px]">{plan.title}</p>
                  <p className="mt-1 text-[13px] text-[var(--dim)]">
                    {plan.source === 'ai' ? 'Sugestão informativa (IA)' : `Por ${relName(plan.author, 'nutricionista')}`}
                    {plan.meals?.length ? ` · ${plan.meals.length} refeições` : ''}
                  </p>
                  {plan.observations && (
                    <p className="mt-2 text-[14px] text-[var(--muted)] line-clamp-2">{plan.observations}</p>
                  )}
                  {(plan.isInformational || plan.source === 'ai') && (
                    <p className="mt-2 text-[12px] text-[var(--dim)]">Conteúdo informativo — não substitui prescrição clínica.</p>
                  )}
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </Page>
  )
}
