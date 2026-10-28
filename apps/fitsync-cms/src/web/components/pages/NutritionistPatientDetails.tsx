import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ClipboardList, Stethoscope, Utensils } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  fetchAnamnesesForStudent,
  fetchAssessmentsForStudent,
  fetchMealPlansForStudent,
  fetchStudentProfileByUser,
  fetchUserById,
} from '../../lib/professionalApi'
import { ageFromBirthDate, goalLabel, type MealPlanDoc, type StudentProfile } from '../../lib/studentApi'

const card = 'rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-5'

export function NutritionistPatientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('Paciente')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [plans, setPlans] = useState<MealPlanDoc[]>([])
  const [consults, setConsults] = useState(0)
  const [anamneses, setAnamneses] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken || !id) {
        setLoading(false)
        return
      }
      try {
        const [userDoc, profileDoc, planDocs, consultDocs, anamneseDocs] = await Promise.all([
          fetchUserById(id, user.accessToken).catch(() => null),
          fetchStudentProfileByUser(id, user.accessToken),
          fetchMealPlansForStudent(id, user.accessToken),
          fetchAssessmentsForStudent(id, user.accessToken, 'consultation'),
          fetchAnamnesesForStudent(id, user.accessToken),
        ])
        if (cancelled) return
        setName(userDoc?.name || profileDoc?.displayName || 'Paciente')
        setEmail(userDoc?.email || '')
        setProfile(profileDoc)
        setPlans(planDocs)
        setConsults(consultDocs.length)
        setAnamneses(anamneseDocs.length)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar o paciente.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, user?.accessToken])

  if (loading) return <p className="p-8 text-sm dark:text-zinc-400">Carregando paciente…</p>
  if (!id) return <p className="p-8 text-sm">Paciente inválido.</p>

  const age = profile ? ageFromBirthDate(profile.birthDate) : null

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate('/nutritionist')}
        className="inline-flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      {error && <div className={`${card} text-sm text-red-500`}>{error}</div>}

      <div className={card}>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">{name}</h1>
        <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">{email}</p>
        <p className="mt-3 text-sm dark:text-zinc-300">
          {age ? `${age} anos` : 'Idade não informada'}
          {profile ? ` · ${goalLabel(profile.goal)} · ${profile.weightKg} kg` : ''}
        </p>
        {profile?.dietaryRestrictions && (
          <p className="mt-2 text-sm dark:text-zinc-400">Restrições: {profile.dietaryRestrictions}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link to={`/nutritionist/criar-plano/${id}`} className={card}>
          <Utensils className="w-5 h-5" />
          <p className="mt-2 font-semibold dark:text-white">Criar plano</p>
          <p className="text-xs dark:text-zinc-400">{plans.length} planos</p>
        </Link>
        <Link to={`/nutritionist/consulta/${id}`} className={card}>
          <Stethoscope className="w-5 h-5" />
          <p className="mt-2 font-semibold dark:text-white">Consulta</p>
          <p className="text-xs dark:text-zinc-400">{consults} registros</p>
        </Link>
        <Link to={`/nutritionist/anamnese/${id}`} className={card}>
          <ClipboardList className="w-5 h-5" />
          <p className="mt-2 font-semibold dark:text-white">Anamnese</p>
          <p className="text-xs dark:text-zinc-400">{anamneses} fichas</p>
        </Link>
      </div>

      <section className={card}>
        <h2 className="font-semibold dark:text-white mb-3">Planos alimentares</h2>
        {plans.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhum plano ainda.</p>
        ) : (
          <ul className="space-y-2">
            {plans.map((plan) => (
              <li key={plan.id} className="flex items-center justify-between gap-3 text-sm dark:text-zinc-200">
                <span>
                  {plan.title}
                  <span className="text-xs dark:text-zinc-500"> · {plan.status}</span>
                        </span>
                <Link
                  to={`/nutritionist/criar-plano/${id}?id=${plan.id}`}
                  className="text-xs font-medium text-[#5a64b4] hover:underline"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
