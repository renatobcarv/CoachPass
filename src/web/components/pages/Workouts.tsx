import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dumbbell, ExternalLink, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  WorkoutDoc,
  fetchPublishedWorkouts,
  relName,
} from '../../lib/studentApi'

const card =
  'rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]'

const WEEKDAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const WEEKDAY_PT: Record<string, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export function Workouts() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<WorkoutDoc[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user?.accessToken) {
      setLoading(false)
      return
    }
    const docs = await fetchPublishedWorkouts(user.id, user.accessToken)
    setWorkouts(docs)
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar treinos.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  const sorted = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const ai = WEEKDAY_ORDER.indexOf(a.weekday || '')
      const bi = WEEKDAY_ORDER.indexOf(b.weekday || '')
      const ao = ai === -1 ? 99 : ai
      const bo = bi === -1 ? 99 : bi
      if (ao !== bo) return ao - bo
      return String(a.title).localeCompare(String(b.title))
    })
  }, [workouts])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Treinos</h1>
          <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            Treinos publicados pelo personal ou gerados por IA aparecem aqui.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Geração com IA em breve"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326] opacity-60 cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          Gerar semana com IA · Em breve
        </button>
      </div>

      {loading && (
        <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">Carregando…</p>
      )}
      {error && <div className={`${card} text-sm text-red-600 dark:text-red-300`}>{error}</div>}

      {!loading && sorted.length === 0 && (
        <div className={`${card} text-center py-10`}>
          <Dumbbell className="w-8 h-8 mx-auto text-[#8e8e9a]" />
          <p className="mt-3 font-semibold text-[#000326] dark:text-white">Nenhum treino ainda</p>
          <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE] max-w-md mx-auto">
            Quando um personal publicar um treino — ou quando a geração com IA estiver disponível —
            ele será listado aqui.
          </p>
        </div>
      )}

      {sorted.map((workout) => {
        const day =
          (workout.weekday && WEEKDAY_PT[workout.weekday]) || workout.weekday || null
        return (
          <article key={workout.id} className={card}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-[#000326] dark:text-white">{workout.title}</h2>
                <p className="mt-1 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                  {[
                    day,
                    workout.splitLabel,
                    workout.source === 'ai' ? 'IA' : relName(workout.author, 'Personal'),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {workout.splitLabel && (
                <span className="rounded-lg px-2.5 py-1 text-xs font-medium bg-[#f3f4f9] text-[#000326] dark:bg-[#000137] dark:text-[#C5C5CE]">
                  {workout.splitLabel}
                </span>
              )}
            </div>
            {workout.observations && (
              <p className="mt-3 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">{workout.observations}</p>
            )}
            <ul className="mt-4 space-y-3">
              {(workout.exercises || []).map((ex, index) => (
                <li
                  key={ex.id || `${workout.id}-${index}`}
                  className="rounded-xl px-3 py-3 bg-[#f3f4f9] dark:bg-[#000137]"
                >
                  <div className="flex gap-3">
                    <img
                      src={ex.muscleImage || '/muscles/geral.svg'}
                      alt={ex.muscle ? `Músculo alvo: ${ex.muscle}` : 'Músculo alvo'}
                      className="w-16 h-[100px] rounded-lg object-cover shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#000326] dark:text-white">{ex.name}</p>
                      <p className="text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                        {[
                          ex.muscle && `Alvo: ${ex.muscle}`,
                          ex.sets && `${ex.sets} séries`,
                          ex.reps && `${ex.reps} reps`,
                          ex.rest && `descanso ${ex.rest}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {ex.instructions && (
                        <p className="mt-2 text-xs leading-relaxed text-[#6a6a7a] dark:text-[#C5C5CE]">
                          {ex.instructions}
                        </p>
                      )}
                      {ex.youtubeUrl && (
                        <a
                          href={ex.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#000326] underline-offset-2 hover:underline dark:text-white"
                        >
                          Ver tutorial no YouTube
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}
