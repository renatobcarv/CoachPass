import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchAssessmentsForStudent, type AssessmentDoc } from '../../lib/professionalApi'
import { fetchWorkoutLogs, type WorkoutLogDoc } from '../../lib/studentApi'

function workoutTitle(value: unknown): string {
  if (value && typeof value === 'object' && 'title' in value) {
    return String((value as { title?: string }).title || 'Treino')
  }
  return 'Treino'
}

const card = 'rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]'

export function Evolution() {
  const { user } = useAuth()
  const [items, setItems] = useState<AssessmentDoc[]>([])
  const [logs, setLogs] = useState<WorkoutLogDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken || !user.id) {
        setLoading(false)
        return
      }
      try {
        const [docs, workoutLogs] = await Promise.all([
          fetchAssessmentsForStudent(user.id, user.accessToken),
          fetchWorkoutLogs(user.id, user.accessToken),
        ])
        if (!cancelled) {
          setItems(docs)
          setLogs(workoutLogs)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id])

  const empty = !loading && items.length === 0 && logs.length === 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Evolução</h1>
        <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
          Check-ins de treino e medições do profissional.
        </p>
      </div>

      {loading && <p className="text-sm text-[#6a6a7a]">Carregando…</p>}

      {empty && (
        <div className={`${card} text-center py-12`}>
          <TrendingUp className="w-8 h-8 mx-auto text-[#8e8e9a]" />
          <p className="mt-3 font-semibold text-[#000326] dark:text-white">Sem dados de evolução</p>
          <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE] max-w-md mx-auto">
            Marque um treino como feito ou aguarde uma avaliação.
          </p>
          <Link
            to="/app/treinos"
            className="inline-flex mt-5 text-sm font-medium text-[#000326] dark:text-white underline-offset-2 hover:underline"
          >
            Ir para treinos
          </Link>
        </div>
      )}

      {logs.length > 0 && (
        <section className={card}>
          <h2 className="font-semibold text-[#000326] dark:text-white mb-3">Treinos feitos</h2>
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="text-sm text-[#000326] dark:text-white">
                <p className="font-medium">
                  {workoutTitle(log.workout)} · {new Date(log.performedAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-[#6a6a7a] dark:text-[#C5C5CE]">
                  {log.status === 'completed' ? 'Concluído' : log.status}
                  {log.rpe != null ? ` · esforço ${log.rpe}/10` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {items.length > 0 && (
        <section className={card}>
          <h2 className="font-semibold text-[#000326] dark:text-white mb-3">Avaliações</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="text-sm text-[#000326] dark:text-white">
                <p className="font-medium">
                  {item.kind === 'consultation' ? 'Consulta' : 'Avaliação física'} ·{' '}
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-xs text-[#6a6a7a] dark:text-[#C5C5CE]">
                  {item.weightKg != null ? `${item.weightKg} kg` : 'Peso não informado'}
                  {item.bodyFatPercent != null ? ` · ${item.bodyFatPercent}% gordura` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
