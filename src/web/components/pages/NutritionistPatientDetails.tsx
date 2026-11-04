import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ClipboardList, LineChart, Stethoscope, Utensils } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import {
  fetchAnamnesesForStudent,
  fetchAssessmentsForStudent,
  fetchMealPlansForStudent,
  fetchStudentProfileByUser,
  type AnamneseDoc,
  type AssessmentDoc,
} from '../../lib/professionalApi'
import { ageFromBirthDate, goalLabel, type MealPlanDoc, type StudentProfile } from '../../lib/studentApi'
import { Avatar } from '../brand/AppShell'
import { Badge, Card, ErrorBanner, LoadingPage, Page, SectionTitle } from '../student/ui'
import { RestrictionsPanel } from '../pro/RestrictionsPanel'
import { errorText, fmtDate, fmtNum, useLinkedPeople } from '../pro/records'

type Data = {
  profile: StudentProfile | null
  consultations: AssessmentDoc[]
  plans: MealPlanDoc[]
  anamneses: AnamneseDoc[]
}

const SEX: Record<string, string> = { male: 'Masculino', female: 'Feminino', other: 'Outro', undisclosed: 'Não informado' }

/** Ficha do paciente: dados do perfil, consultas, planos alimentares, anamnese e restrições. */
export function NutritionistPatientDetails() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const token = user?.accessToken
  const { people } = useLinkedPeople()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !id) return
    Promise.all([
      fetchStudentProfileByUser(id, token).catch(() => null),
      fetchAssessmentsForStudent(id, token, 'consultation'),
      fetchMealPlansForStudent(id, token),
      fetchAnamnesesForStudent(id, token),
    ])
      .then(([profile, consultations, plans, anamneses]) => setData({ profile, consultations, plans, anamneses }))
      .catch((err) => {
        setError(errorText(err, 'Não foi possível carregar a ficha.'))
        toast.error('Não foi possível carregar a ficha do paciente.')
      })
  }, [token, id])

  const person = people?.find((p) => p.userId === id)
  if (!data && !error) return <LoadingPage />

  const p = data?.profile
  const last = data?.consultations[0]
  const first = data?.consultations[data.consultations.length - 1]
  const anamnese = data?.anamneses.find((a) => a.status === 'completed')
  const draft = data?.anamneses.find((a) => a.status === 'draft')
  const name = p?.displayName || person?.name || 'Paciente'
  const age = p?.birthDate ? ageFromBirthDate(p.birthDate) : null

  const health: [string, string | null | undefined][] = [
    ['Alergias', p?.foodAllergies],
    ['Restrições alimentares', p?.dietaryRestrictions],
    ['Condições de saúde', p?.medicalConditions],
    ['Medicamentos', p?.medications],
    ['Lesões', p?.injuries],
  ]

  return (
    <Page wide>
      <Link to="/nutritionist" className="mb-6 inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Meus pacientes
      </Link>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={name} size={64} />
          <div>
            <h1 className="cp-display text-[clamp(28px,3.6vw,42px)] font-bold leading-none">{name}</h1>
            <p className="mt-2 text-[14px] text-[var(--muted)]">
              {[person?.email, age !== null ? `${age} anos` : null, p?.sex ? SEX[p.sex] : null].filter(Boolean).join(' · ') || 'Perfil ainda não preenchido'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/nutritionist/consulta/${id}`} className="cp-btn-sm">
            <Stethoscope className="h-4 w-4" /> Nova consulta
          </Link>
          <Link to={`/nutritionist/criar-plano/${id}`} className="cp-btn-ghost">
            <Utensils className="h-4 w-4" /> Plano alimentar
          </Link>
          <Link to={`/nutritionist/anamnese/${id}`} className="cp-btn-ghost">
            <ClipboardList className="h-4 w-4" /> Anamnese
          </Link>
          <Link to={`/nutritionist/paciente/${id}/evolucao`} className="cp-btn-ghost">
            <LineChart className="h-4 w-4" /> Evolução
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(
          [
            ['Objetivo', p?.goal ? goalLabel(p.goal) : '—', ''],
            ['Altura', p?.heightCm ? `${p.heightCm} cm` : '—', ''],
            ['Peso atual', last?.weightKg != null ? `${fmtNum(last.weightKg)} kg` : p?.weightKg ? `${fmtNum(p.weightKg)} kg` : '—', last?.weightKg != null ? `consulta de ${fmtDate(last.date)}` : 'informado no perfil'],
            [
              'Variação',
              last?.weightKg != null && first?.weightKg != null && last !== first ? `${last.weightKg - first.weightKg > 0 ? '+' : ''}${fmtNum(last.weightKg - first.weightKg)} kg` : '—',
              first && last !== first ? `desde ${fmtDate(first.date)}` : 'precisa de 2 consultas',
            ],
          ] as [string, string, string][]
        ).map(([label, value, hint]) => (
          <Card key={label} className="p-5">
            <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
            <p className="cp-display mt-3 text-[26px] font-bold leading-none">{value}</p>
            {hint && <p className="mt-2 text-[12px] text-[var(--dim)]">{hint}</p>}
          </Card>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Stethoscope}>Consultas</SectionTitle>
            {!data?.consultations.length ? (
              <p className="text-[14px] text-[var(--muted)]">Nenhuma consulta registrada.</p>
            ) : (
              <ul className="space-y-2">
                {data.consultations.slice(0, 6).map((c) => (
                  <li key={c.id} className="rounded-2xl border border-[var(--line)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{fmtDate(c.date)}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.weightKg != null && <Badge>{fmtNum(c.weightKg)} kg</Badge>}
                        {c.adherenceScore != null && <Badge tone="teal">Adesão {c.adherenceScore}/10</Badge>}
                      </div>
                    </div>
                    {c.notes && <p className="mt-1.5 line-clamp-3 text-[13.5px] text-[var(--muted)]">{c.notes}</p>}
                    {c.nextDate && <p className="mt-1 text-[12px] text-[var(--dim)]">Retorno: {fmtDate(c.nextDate)}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Utensils}>Planos alimentares</SectionTitle>
            {!data?.plans.length ? (
              <p className="text-[14px] text-[var(--muted)]">Nenhum plano ainda.</p>
            ) : (
              <ul className="space-y-2">
                {data.plans.map((m) => {
                  const kcal = m.meals?.reduce((s, meal) => s + (meal.calories || meal.items?.reduce((t, i) => t + (i.calories || 0), 0) || 0), 0) || 0
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] p-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{m.title}</p>
                        <p className="text-[12.5px] text-[var(--dim)]">
                          {m.meals?.length ?? 0} refeições{kcal ? ` · ${fmtNum(kcal, 0)} kcal/dia` : ''}
                          {m.publishedAt ? ` · publicado em ${fmtDate(m.publishedAt)}` : ''}
                        </p>
                      </div>
                      <Badge tone={m.status === 'published' ? 'teal' : 'amber'}>{m.status === 'published' ? 'Publicado' : 'Rascunho'}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={ClipboardList}>Saúde e anamnese</SectionTitle>
            <dl className="space-y-3">
              {health.map(([label, v]) => (
                <div key={label}>
                  <dt className="text-[12px] text-[var(--dim)]">{label}</dt>
                  <dd className="text-[14px]">{v?.trim() || '—'}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-[var(--line)] pt-4 text-[13.5px] text-[var(--muted)]">
              {anamnese
                ? `Anamnese concluída em ${fmtDate(anamnese.completedAt)}.`
                : draft
                  ? 'Anamnese em rascunho.'
                  : 'Anamnese ainda não feita.'}{' '}
              <Link to={`/nutritionist/anamnese/${id}`} className="text-white underline-offset-2 hover:underline">
                {anamnese || draft ? 'Abrir' : 'Fazer agora'}
              </Link>
            </p>
          </Card>
          <RestrictionsPanel studentId={id} />
        </div>
      </div>
    </Page>
  )
}
