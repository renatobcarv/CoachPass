import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ClipboardList, Dumbbell, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  fetchAssessmentsForStudent,
  fetchRestrictionsForStudent,
  fetchStudentProfileByUser,
  fetchUserById,
  fetchWorkoutLogsForStudent,
  fetchWorkoutsForStudent,
} from '../../lib/professionalApi'
import {
  ageFromBirthDate,
  goalLabel,
  type StudentProfile,
  type WorkoutDoc,
  type WorkoutLogDoc,
} from '../../lib/studentApi'

function workoutTitle(value: unknown): string {
  if (value && typeof value === 'object' && 'title' in value) {
    return String((value as { title?: string }).title || 'Treino')
  }
  return 'Treino'
}

const card = 'rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-5'

export function StudentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('Aluno')
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutDoc[]>([])
  const [logs, setLogs] = useState<WorkoutLogDoc[]>([])
  const [assessments, setAssessments] = useState<number>(0)
  const [restrictions, setRestrictions] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken || !id) {
        setLoading(false)
        return
      }
      try {
        const [userDoc, profileDoc, workoutDocs, workoutLogs, assessmentDocs, restrictionDocs] =
          await Promise.all([
            fetchUserById(id, user.accessToken).catch(() => null),
            fetchStudentProfileByUser(id, user.accessToken),
            fetchWorkoutsForStudent(id, user.accessToken),
            fetchWorkoutLogsForStudent(id, user.accessToken),
            fetchAssessmentsForStudent(id, user.accessToken, 'physical'),
            fetchRestrictionsForStudent(id, user.accessToken),
          ])
        if (cancelled) return
        setName(userDoc?.name || profileDoc?.displayName || 'Aluno')
        setEmail(userDoc?.email || '')
        setProfile(profileDoc)
        setWorkouts(workoutDocs)
        setLogs(workoutLogs)
        setAssessments(assessmentDocs.length)
        setRestrictions(restrictionDocs.filter((r) => r.active !== false).length)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar o aluno.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, user?.accessToken])

  if (loading) return <p className="p-8 text-sm dark:text-zinc-400">Carregando aluno…</p>
  if (!id) return <p className="p-8 text-sm">Aluno inválido.</p>

  const age = profile ? ageFromBirthDate(profile.birthDate) : null

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate('/personal')}
        className="inline-flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      {error && <div className={`${card} text-sm text-red-500`}>{error}</div>}

      <div className={card}>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">{name}</h1>
        <p className="mt-1 text-sm dark:text-zinc-400 text-slate-500">{email}</p>
        <p className="mt-3 text-sm dark:text-zinc-300 text-slate-700">
          {age ? `${age} anos` : 'Idade não informada'}
          {profile ? ` · ${goalLabel(profile.goal)} · ${profile.weightKg} kg · ${profile.heightCm} cm` : ''}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link to={`/personal/criar-treino?student=${id}`} className={card}>
          <Dumbbell className="w-5 h-5" />
          <p className="mt-2 font-semibold dark:text-white">Criar treino</p>
          <p className="text-xs dark:text-zinc-400">{workouts.length} treinos salvos</p>
        </Link>
        <Link to={`/personal/avaliacao/${id}`} className={card}>
          <ClipboardList className="w-5 h-5" />
          <p className="mt-2 font-semibold dark:text-white">Avaliação</p>
          <p className="text-xs dark:text-zinc-400">{assessments} registros</p>
        </Link>
        <Link to={`/personal/aluno/${id}/restricao`} className={card}>
          <ShieldAlert className="w-5 h-5" />
          <p className="mt-2 font-semibold dark:text-white">Restrições</p>
          <p className="text-xs dark:text-zinc-400">{restrictions} ativas</p>
        </Link>
      </div>

      <section className={card}>
        <h2 className="font-semibold dark:text-white mb-3">Check-ins</h2>
        {logs.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhum treino marcado como feito ainda.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li key={log.id} className="text-sm dark:text-zinc-200">
                <p className="font-medium">
                  {workoutTitle(log.workout)} · {new Date(log.performedAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs dark:text-zinc-500">
                  {log.status === 'completed' ? 'Concluído' : log.status}
                  {log.rpe != null ? ` · esforço ${log.rpe}/10` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h2 className="font-semibold dark:text-white mb-3">Treinos</h2>
        {workouts.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhum treino ainda.</p>
        ) : (
          <ul className="space-y-2">
            {workouts.map((workout) => (
              <li key={workout.id} className="flex items-center justify-between gap-3 text-sm dark:text-zinc-200">
                <span>
                  {workout.title}
                  <span className="text-xs dark:text-zinc-500"> · {workout.status}</span>
                </span>
                <Link
                  to={`/personal/criar-treino?id=${workout.id}&student=${id}`}
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
