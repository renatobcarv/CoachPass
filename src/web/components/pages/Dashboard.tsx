import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Apple,
  ArrowRight,
  Dumbbell,
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

const card =
  'rounded-2xl border border-[#000326]/10 bg-white p-5 transition duration-300 hover:border-[#000326]/20 dark:border-white/10 dark:bg-[#000346] dark:hover:border-white/20'

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

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
        Carregando seu painel…
      </div>
    )
  }

  return (
    <div className="relative p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6a6a7a] dark:text-[#C5C5CE]">
            {today}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#000326] dark:text-white">
            Olá, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            {profile?.goal
              ? `Objetivo: ${goalLabel(profile.goal)}.`
              : 'Complete seu perfil para personalizar o acompanhamento.'}{' '}
            {scenarioA
              ? 'Nenhum profissional vinculado ainda.'
              : 'Conteúdos publicados pelos seus profissionais aparecem abaixo.'}
          </p>
        </div>
      </div>

      {error && (
        <div className={`${card} text-sm text-red-600 dark:text-red-300`}>{error}</div>
      )}

      {(hasPersonal || hasNutritionist) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {hasPersonal && (
            <div className={card}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f3f4f9] dark:bg-[#000137] flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                    Personal trainer
                  </p>
                  <p className="font-semibold text-[#000326] dark:text-white">
                    {relName(personalLink?.professional, 'Personal vinculado')}
                  </p>
                </div>
              </div>
            </div>
          )}
          {hasNutritionist && (
            <div className={card}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f3f4f9] dark:bg-[#000137] flex items-center justify-center">
                  <Apple className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                    Nutricionista
                  </p>
                  <p className="font-semibold text-[#000326] dark:text-white">
                    {relName(nutritionistLink?.professional, 'Nutricionista vinculado')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={card}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8e8e9a] dark:text-[#C5C5CE]/70">
              Gerações com IA neste mês
            </p>
            <p className="mt-1 text-lg font-semibold text-[#000326] dark:text-white">
              {remainingGenerations} de {quotaLimit} disponíveis
            </p>
            <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
              Conta gratuita: até duas gerações concluídas por mês calendário.
            </p>
          </div>
          <Link
            to="/planos"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#000326] dark:text-white underline-offset-2 hover:underline"
          >
            Ver planos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {scenarioA && !hasAnyContent && (
        <div className={`${card} space-y-5`}>
          <div>
            <h2 className="text-lg font-semibold text-[#000326] dark:text-white">
              Ainda não há conteúdos cadastrados
            </h2>
            <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
              Sem personal ou nutricionista vinculado, seu painel começa vazio. Aguarde a publicação
              de um profissional. A geração com IA estará disponível em breve.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#000326]/15 dark:border-white/15 px-4 py-4 text-left opacity-70">
              <Sparkles className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
              <p className="mt-3 font-semibold text-[#000326] dark:text-white">Gerar treino com IA</p>
              <p className="mt-1 text-xs text-[#6a6a7a] dark:text-[#C5C5CE]">Em breve</p>
            </div>
            <div className="rounded-xl border border-[#000326]/15 dark:border-white/15 px-4 py-4 text-left opacity-70">
              <Sparkles className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
              <p className="mt-3 font-semibold text-[#000326] dark:text-white">
                Gerar sugestão alimentar com IA
              </p>
              <p className="mt-1 text-xs text-[#6a6a7a] dark:text-[#C5C5CE]">Em breve</p>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#000326] dark:text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Treinos publicados
          </h2>
          <button
            type="button"
            onClick={() => navigate('/app/treinos')}
            className="text-sm text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
          >
            Ver todos
          </button>
        </div>
        {workouts.length === 0 ? (
          <div className={`${card} text-sm text-[#6a6a7a] dark:text-[#C5C5CE]`}>
            {hasPersonal
              ? 'Seu personal ainda não publicou um treino. Rascunhos não aparecem aqui.'
              : 'Nenhum treino publicado. Quando um personal publicar ou você gerar com IA, ele aparece aqui.'}
          </div>
        ) : (
          workouts.slice(0, 3).map((workout) => (
            <div key={workout.id} className={card}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#000326] dark:text-white">{workout.title}</p>
                  <p className="mt-1 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                    {workout.source === 'ai' ? 'Gerado por IA' : `Por ${relName(workout.author, 'personal')}`}
                    {workout.exercises?.length
                      ? ` · ${workout.exercises.length} exercícios`
                      : ''}
                  </p>
                  {workout.observations && (
                    <p className="mt-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
                      {workout.observations}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#000326] dark:text-white flex items-center gap-2">
            <Apple className="w-4 h-4" />
            Planos alimentares publicados
          </h2>
          <button
            type="button"
            onClick={() => navigate('/app/dieta')}
            className="text-sm text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
          >
            Ver todos
          </button>
        </div>
        {mealPlans.length === 0 ? (
          <div className={`${card} text-sm text-[#6a6a7a] dark:text-[#C5C5CE]`}>
            {hasNutritionist
              ? 'Seu nutricionista ainda não publicou um plano. Rascunhos não aparecem aqui.'
              : 'Nenhum plano alimentar publicado. Quando um nutricionista publicar ou você gerar com IA, ele aparece aqui.'}
          </div>
        ) : (
          mealPlans.slice(0, 3).map((plan) => (
            <div key={plan.id} className={card}>
              <p className="font-semibold text-[#000326] dark:text-white">{plan.title}</p>
              <p className="mt-1 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                {plan.source === 'ai'
                  ? 'Sugestão informativa (IA)'
                  : `Por ${relName(plan.author, 'nutricionista')}`}
                {plan.meals?.length ? ` · ${plan.meals.length} refeições` : ''}
              </p>
              {plan.observations && (
                <p className="mt-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">{plan.observations}</p>
              )}
              {(plan.isInformational || plan.source === 'ai') && (
                <p className="mt-2 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                  Conteúdo informativo — não substitui prescrição clínica.
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
