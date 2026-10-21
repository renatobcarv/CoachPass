import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Dumbbell, ExternalLink, PlayCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  WorkoutDoc,
  fetchPublishedWorkouts,
  relName,
} from '../../lib/studentApi'
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Page,
  PageHeader,
  Skeleton,
  SoonButton,
  WEEKDAY_ORDER,
  WEEKDAY_PT,
  WEEKDAY_SHORT,
  todayWeekday,
  workoutTitle,
} from '../student/ui'
import { DemoFinder } from '../musclewiki/DemoFinder'
import { PhotoLoop } from '../exercise/PhotoLoop'
import { exercisePhotos } from '../../data/exercisePhotos'


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

  const todayKey = todayWeekday()
  const days = useMemo(() => WEEKDAY_ORDER.filter((d) => sorted.some((w) => w.weekday === d)), [sorted])
  const [selected, setSelected] = useState<string>('all')
  const [pickedDefault, setPickedDefault] = useState(false)

  // Abre no treino de hoje quando existir; senão mostra todos.
  useEffect(() => {
    if (pickedDefault || loading) return
    setSelected(days.includes(todayKey) ? todayKey : 'all')
    setPickedDefault(true)
  }, [days, loading, pickedDefault, todayKey])

  const visible = selected === 'all' ? sorted : sorted.filter((w) => w.weekday === selected)

  return (
    <Page>
      <PageHeader
        kicker="Treinos"
        title="Sua semana de"
        accent="treino."
        lead="Treinos publicados pelo personal ou gerados por IA aparecem aqui."
        action={<SoonButton icon={Sparkles}>Gerar semana com IA</SoonButton>}
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-64" />
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <EmptyState icon={Dumbbell} title="Nenhum treino ainda">
          Quando um personal publicar um treino — ou quando a geração com IA estiver disponível — ele será listado
          aqui.
        </EmptyState>
      )}

      {!loading && sorted.length > 0 && (
        <>
          {/* Seletor de dias */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-1 mb-6">
            <div className="flex gap-2 min-w-max">
              <DayPill active={selected === 'all'} onClick={() => setSelected('all')} label="Todos" sub={`${sorted.length}`} />
              {WEEKDAY_ORDER.map((d) => {
                const has = days.includes(d)
                return (
                  <DayPill
                    key={d}
                    active={selected === d}
                    disabled={!has}
                    today={d === todayKey}
                    onClick={() => has && setSelected(d)}
                    label={WEEKDAY_SHORT[d]}
                    sub={has ? '•' : '—'}
                  />
                )
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {visible.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} isToday={workout.weekday === todayKey} />
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </Page>
  )
}

function DayPill({
  label,
  sub,
  active,
  disabled,
  today,
  onClick,
}: {
  label: string
  sub: string
  active: boolean
  disabled?: boolean
  today?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative w-[68px] h-[72px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-[background,border-color,color] duration-300 ${
        active
          ? 'cp-selected border-transparent'
          : disabled
            ? 'border-[var(--line)] text-[var(--dim)] opacity-50 cursor-not-allowed'
            : 'border-[var(--line-2)] bg-white/[0.03] text-[var(--cream)] hover:bg-white/[0.07]'
      }`}
    >
      <span className="cp-display text-[16px] font-bold">{label}</span>
      <span className={`cp-mono text-[11px] ${active ? 'text-white/75' : 'text-[var(--muted)]'}`}>{sub}</span>
      {today && (
        <span className="absolute -top-2 cp-mono rounded-full px-1.5 py-[1px] text-[9px] uppercase tracking-[0.1em] bg-[var(--amber)] text-[#1a0b03]">
          hoje
        </span>
      )}
    </button>
  )
}

function WorkoutCard({ workout, isToday }: { workout: WorkoutDoc; isToday: boolean }) {
  const day = (workout.weekday && WEEKDAY_PT[workout.weekday]) || workout.weekday || null
  const exercises = workout.exercises || []
  return (
    <Card as="article" className="overflow-hidden">
      <div className="p-6 sm:p-7 border-b border-[var(--line)]">
        <div className="flex flex-wrap items-center gap-2">
          {isToday && <Badge tone="teal">Hoje</Badge>}
          {day && <Badge>{day}</Badge>}
          {workout.splitLabel && <Badge tone="blue">{workout.splitLabel}</Badge>}
          {workout.source === 'ai' && <Badge tone="violet">IA</Badge>}
        </div>
        <h2 className="cp-display mt-4 text-[26px] sm:text-[30px] font-bold leading-tight">
          {workoutTitle(workout.title, workout.weekday)}
        </h2>
        <p className="mt-1.5 text-[13.5px] text-[var(--dim)]">
          {[
            workout.source === 'ai' ? 'Gerado por IA' : relName(workout.author, 'Personal'),
            exercises.length ? `${exercises.length} exercícios` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {workout.observations && (
          <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--muted)]">{workout.observations}</p>
        )}
      </div>

      <ol>
        {exercises.map((ex, index) => (
          <li
            key={ex.id || `${workout.id}-${index}`}
            className="group flex gap-4 px-5 sm:px-7 py-5 border-b border-[var(--line)] last:border-b-0 hover:bg-white/[0.02] transition-colors"
          >
            <span className="cp-mono pt-1 w-6 shrink-0 text-[12px] text-[var(--dim)]">{String(index + 1).padStart(2, '0')}</span>
            {exercisePhotos(ex.name) ? (
              <div className="relative shrink-0">
                <PhotoLoop
                  photos={exercisePhotos(ex.name)!}
                  alt={ex.name}
                  mode="auto"
                  interval={1500}
                  className="w-28 h-[88px] sm:w-36 sm:h-24 rounded-xl"
                />
              </div>
            ) : (
              <img
                src={ex.muscleImage || '/muscles/geral.svg'}
                alt={ex.muscle ? `Músculo alvo: ${ex.muscle}` : 'Músculo alvo'}
                className="w-14 h-[88px] rounded-xl object-cover shrink-0 bg-white"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[16px]">{ex.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ex.sets ? <Metric k="Séries" v={String(ex.sets)} /> : null}
                {ex.reps ? <Metric k="Reps" v={ex.reps} /> : null}
                {ex.weight ? <Metric k="Carga" v={ex.weight} /> : null}
                {ex.rest ? <Metric k="Descanso" v={ex.rest} /> : null}
                {ex.muscle ? <Metric k="Alvo" v={ex.muscle} /> : null}
              </div>
              {ex.instructions && (
                <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--muted)]">{ex.instructions}</p>
              )}
              <DemoFinder exerciseName={ex.name} />
              {ex.youtubeUrl && (
                <a
                  href={ex.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--blue-2)] hover:underline"
                >
                  <PlayCircle className="w-4 h-4" />
                  Ver tutorial no YouTube
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg px-2.5 py-1 bg-white/[0.05] border border-white/[0.06]">
      <span className="cp-mono text-[10px] uppercase tracking-[0.1em] text-[var(--dim)]">{k}</span>
      <span className="text-[13px] font-medium">{v}</span>
    </span>
  )
}
