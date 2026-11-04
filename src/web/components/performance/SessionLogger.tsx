import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, ChevronDown, Clock, Plus, Repeat, SkipForward, TrendingDown, TrendingUp, Minus as Equal } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { comparePlanned } from '@/lib/performance/analytics'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { createWorkoutLogFull, fetchSessionPlan, searchExercises, type ExerciseLite, type SessionPlan, type SessionPlanExercise } from '../../lib/performanceApi'
import { Card, ErrorBanner, LoadingPage, Page } from '../student/ui'
import { GhostButton, PrimaryButton, Stepper, inputCls, kg } from './kit'

type SetRow = { loadKg: number | null; reps: number | null; effort: number | null; done: boolean; restSec: number | null }
type ExState = {
  key: string
  exercise: number | null
  name: string
  muscleGroup: string | null
  planned: SessionPlanExercise['planned'] | null
  plan?: SessionPlanExercise
  change: 'none' | 'substituted' | 'added' | 'skipped'
  replacedName: string | null
  notes: string
  sets: SetRow[]
}

const ACTION_META = {
  increase: { label: 'Subir carga', icon: TrendingUp, color: 'var(--teal)' },
  maintain: { label: 'Manter carga', icon: Equal, color: 'var(--brand-300)' },
  add_reps: { label: 'Buscar +1 repetição', icon: TrendingUp, color: 'var(--brand-300)' },
  decrease: { label: 'Reduzir carga', icon: TrendingDown, color: 'var(--amber)' },
  insufficient_data: { label: 'Primeiro registro', icon: Equal, color: 'var(--muted)' },
} as const

function initialSets(p: SessionPlanExercise): SetRow[] {
  const n = p.planned.sets ?? p.last?.sets.length ?? 3
  const load = p.suggestion.suggestedLoadKg ?? p.planned.loadKg ?? p.last?.topLoad ?? null
  const reps = p.repRange.max ?? p.repRange.min ?? null
  return Array.from({ length: Math.max(1, n) }, () => ({ loadKg: load, reps, effort: null, done: false, restSec: null }))
}

export function SessionLogger() {
  const { workoutId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<SessionPlan | null>(null)
  const [items, setItems] = useState<ExState[]>([])
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(0)
  const [effortMode, setEffortMode] = useState<'rir' | 'rpe'>('rir')
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())
  const lastDone = useRef<number | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<ExState[] | null>(null)
  const [sessionRpe, setSessionRpe] = useState<number | null>(7)
  const [duration, setDuration] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [picker, setPicker] = useState<{ mode: 'swap' | 'add'; index?: number } | null>(null)

  useEffect(() => {
    if (!user?.accessToken || !workoutId) return
    fetchSessionPlan(user.accessToken, workoutId)
      .then((p) => {
        setPlan(p)
        setItems(
          p.exercises.map((e) => ({
            key: e.key,
            exercise: e.exercise,
            name: e.name,
            muscleGroup: e.muscleGroup,
            planned: e.planned,
            plan: e,
            change: 'none',
            replacedName: null,
            notes: '',
            sets: initialSets(e),
          })),
        )
      })
      .catch((err) => setError(err instanceof PayloadApiError ? extractPayloadMessage(err.data) || 'Treino não encontrado.' : 'Não foi possível abrir o treino.'))
  }, [user?.accessToken, workoutId])

  // Relógio da sessão e do descanso
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const update = (i: number, fn: (e: ExState) => ExState) => setItems((list) => list.map((e, idx) => (idx === i ? fn(e) : e)))
  const updateSet = (i: number, s: number, patch: Partial<SetRow>) =>
    update(i, (e) => ({ ...e, sets: e.sets.map((row, idx) => (idx === s ? { ...row, ...patch } : row)) }))

  const toggleDone = (i: number, s: number) => {
    const row = items[i].sets[s]
    if (!row.done) {
      if (!row.reps) return toast.error('Informe as repetições feitas.')
      // Descanso real: tempo desde a última série concluída
      const rest = lastDone.current ? Math.round((Date.now() - lastDone.current) / 1000) : null
      lastDone.current = Date.now()
      updateSet(i, s, { done: true, restSec: rest != null && rest <= 900 ? rest : null })
    } else {
      updateSet(i, s, { done: false })
    }
  }

  const doneSets = items.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0)
  const totalSets = items.reduce((n, e) => n + (e.change === 'skipped' ? 0 : e.sets.length), 0)
  const elapsedMin = Math.max(1, Math.round((now - startedAt) / 60000))
  const restRunning = lastDone.current ? Math.round((now - lastDone.current) / 1000) : null
  const currentRest = items[open]?.planned?.restSec ?? 90

  const pick = (ex: ExerciseLite) => {
    if (!picker) return
    if (picker.mode === 'add') {
      setItems((list) => [
        ...list,
        { key: `id:${ex.id}`, exercise: ex.id, name: ex.name, muscleGroup: ex.muscleGroup, planned: null, change: 'added', replacedName: null, notes: '', sets: [{ loadKg: null, reps: null, effort: null, done: false, restSec: null }] },
      ])
      setOpen(items.length)
    } else if (picker.index != null) {
      update(picker.index, (e) => ({ ...e, key: `id:${ex.id}`, exercise: ex.id, name: ex.name, muscleGroup: ex.muscleGroup, change: 'substituted', replacedName: e.replacedName ?? e.name }))
    }
    setPicker(null)
  }

  const finish = async () => {
    if (!user?.accessToken || !plan) return
    const performed = items.filter((e) => e.change !== 'skipped' && e.sets.some((s) => s.done))
    if (!performed.length) return toast.error('Marque pelo menos uma série como feita.')
    setSaving(true)
    const complete = items.every((e) => e.change === 'skipped' || e.sets.every((s) => s.done)) && items.every((e) => e.change !== 'skipped')
    try {
      await createWorkoutLogFull(user.accessToken, {
        workout: plan.workout.id,
        performedAt: new Date(startedAt).toISOString(),
        status: complete ? 'completed' : 'partial',
        durationMin: duration ?? elapsedMin,
        sessionRpe,
        notes: notes.trim() || null,
        exercises: items.map((e) => ({
          exercise: e.exercise,
          name: e.name,
          muscleGroup: e.muscleGroup,
          planned: e.planned ? { ...e.planned } : null,
          change: e.change,
          replacedName: e.replacedName,
          notes: e.notes.trim() || null,
          sets:
            e.change === 'skipped'
              ? []
              : e.sets.map((s) => ({
                  reps: s.reps,
                  loadKg: s.loadKg,
                  rir: effortMode === 'rir' ? s.effort : null,
                  rpe: effortMode === 'rpe' ? s.effort : null,
                  restSec: s.restSec,
                  done: s.done,
                })),
        })),
      })
      toast.success('Treino registrado.')
      setSaved(items)
      setFinishing(false)
    } catch (err) {
      toast.error(err instanceof PayloadApiError ? extractPayloadMessage(err.data) || 'Não foi possível salvar.' : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (error) return <Page><ErrorBanner>{error}</ErrorBanner></Page>
  if (!plan) return <LoadingPage />
  if (saved) return <SessionSummary items={saved} effortMode={effortMode} onDone={() => navigate('/app/evolucao')} title={plan.workout.title} />

  return (
    <Page>
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="cp-kicker">Treino em andamento</p>
          <h1 className="cp-display mt-2 text-[clamp(26px,4vw,38px)] font-bold leading-tight">{plan.workout.title}</h1>
          <p className="cp-mono mt-1 text-[12.5px] text-[var(--muted)]">
            {doneSets}/{totalSets} séries · {elapsedMin} min
          </p>
        </div>
        <div className="inline-flex rounded-full border border-[var(--line-2)] p-1 text-[12.5px]" role="radiogroup" aria-label="Como registrar o esforço">
          {(['rir', 'rpe'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={effortMode === m} onClick={() => setEffortMode(m)} className={`h-8 rounded-full px-3 font-semibold ${effortMode === m ? 'bg-[var(--paper)] text-[var(--paper-ink)]' : 'text-[var(--muted)]'}`}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      {plan.workout.observations && <p className="mb-4 rounded-2xl border border-[var(--line)] px-4 py-3 text-[13.5px] text-[var(--muted)]">{plan.workout.observations}</p>}

      <div className="space-y-3">
        {items.map((e, i) => (
          <ExerciseCard
            key={`${e.key}-${i}`}
            ex={e}
            index={i}
            open={open === i}
            effortMode={effortMode}
            onOpen={() => setOpen(open === i ? -1 : i)}
            onSet={(s, patch) => updateSet(i, s, patch)}
            onToggle={(s) => toggleDone(i, s)}
            onAddSet={() => update(i, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets[x.sets.length - 1] ?? { loadKg: null, reps: null, effort: null }), done: false, restSec: null }] }))}
            onRemoveSet={(s) => update(i, (x) => ({ ...x, sets: x.sets.filter((_, idx) => idx !== s) }))}
            onSkip={() => update(i, (x) => ({ ...x, change: x.change === 'skipped' ? 'none' : 'skipped' }))}
            onSwap={() => setPicker({ mode: 'swap', index: i })}
            onNotes={(v) => update(i, (x) => ({ ...x, notes: v }))}
          />
        ))}
      </div>

      <GhostButton className="mt-4 w-full" onClick={() => setPicker({ mode: 'add' })}>
        <Plus className="h-4 w-4" /> Adicionar exercício
      </GhostButton>

      {/* Barra fixa: descanso + concluir */}
      <div className="fixed inset-x-0 bottom-[68px] z-30 border-t border-[var(--line)] bg-[rgba(8,9,16,0.94)] px-4 py-3 backdrop-blur-xl lg:bottom-0 lg:left-[264px]">
        <div className="mx-auto flex max-w-[1080px] items-center gap-3">
          <div className="flex-1">
            {restRunning != null && (
              <p className="inline-flex items-center gap-2 text-[14px]">
                <Clock className="h-4 w-4 text-[var(--brand-300)]" />
                <span className="tabular-nums font-semibold" style={{ color: restRunning >= currentRest ? 'var(--teal)' : 'white' }}>
                  {Math.floor(restRunning / 60)}:{String(restRunning % 60).padStart(2, '0')}
                </span>
                <span className="text-[12.5px] text-[var(--muted)]">descanso · alvo {currentRest}s</span>
              </p>
            )}
          </div>
          <PrimaryButton onClick={() => setFinishing(true)}>Concluir treino</PrimaryButton>
        </div>
      </div>
      <div className="h-24" />

      <AnimatePresence>
        {finishing && (
          <Sheet onClose={() => setFinishing(false)} title="Concluir treino">
            <p className="text-[14px] text-[var(--muted)]">Como foi a sessão no geral? (1 = muito leve, 10 = máximo)</p>
            <div className="mt-3 grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
                <button key={v} type="button" onClick={() => setSessionRpe(v)} className={`h-11 rounded-lg text-[14px] font-semibold ${sessionRpe === v ? 'bg-[var(--paper)] text-[var(--paper-ink)]' : 'border border-[var(--line-2)] text-[var(--muted)]'}`}>
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[14px] text-[var(--muted)]">Duração (min)</span>
              <Stepper label="duração" value={duration ?? elapsedMin} onChange={setDuration} step={5} min={1} max={600} />
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações da sessão (opcional)" className={`${inputCls} mt-4 h-20 py-2`} />
            <PrimaryButton className="mt-5 w-full" disabled={saving} onClick={() => void finish()}>
              <Check className="h-4 w-4" /> {saving ? 'Salvando…' : 'Salvar treino'}
            </PrimaryButton>
          </Sheet>
        )}
        {picker && user?.accessToken && (
          <ExercisePicker token={user.accessToken} title={picker.mode === 'add' ? 'Adicionar exercício' : 'Trocar exercício'} onPick={pick} onClose={() => setPicker(null)} />
        )}
      </AnimatePresence>
    </Page>
  )
}

function ExerciseCard({
  ex,
  index,
  open,
  effortMode,
  onOpen,
  onSet,
  onToggle,
  onAddSet,
  onRemoveSet,
  onSkip,
  onSwap,
  onNotes,
}: {
  ex: ExState
  index: number
  open: boolean
  effortMode: 'rir' | 'rpe'
  onOpen: () => void
  onSet: (s: number, patch: Partial<SetRow>) => void
  onToggle: (s: number) => void
  onAddSet: () => void
  onRemoveSet: (s: number) => void
  onSkip: () => void
  onSwap: () => void
  onNotes: (v: string) => void
}) {
  const p = ex.planned
  const sug = ex.plan?.suggestion
  const meta = sug ? ACTION_META[sug.action] : null
  const done = ex.sets.filter((s) => s.done).length
  const skipped = ex.change === 'skipped'
  const plannedEffort = effortMode === 'rir' ? p?.rir : p?.rpe ?? (p?.rir != null ? 10 - p.rir : null)

  return (
    <Card className={`overflow-hidden ${skipped ? 'opacity-60' : ''}`}>
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 p-4 text-left" aria-expanded={open}>
        <span className={`cp-mono grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[12px] ${done && done === ex.sets.length ? 'bg-[var(--teal)] text-[#05060b]' : 'border border-[var(--line-2)] text-[var(--muted)]'}`}>
          {done && done === ex.sets.length ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-semibold">{ex.name}</span>
          <span className="block text-[12.5px] text-[var(--muted)]">
            {skipped
              ? 'Pulado'
              : p && (p.sets || p.reps)
                ? `Planejado: ${p.sets ?? '?'} × ${p.reps ?? '?'}${p.loadKg ? ` · ${kg(p.loadKg)}` : ''}${plannedEffort != null ? ` · ${effortMode.toUpperCase()} ${plannedEffort}` : ''}`
                : ex.change === 'added'
                  ? 'Exercício extra'
                  : 'Sem planejamento'}
            {ex.replacedName && ` · no lugar de ${ex.replacedName}`}
          </span>
        </span>
        <span className="cp-mono text-[12px] text-[var(--muted)]">{done}/{ex.sets.length}</span>
        <ChevronDown className={`h-4 w-4 text-[var(--dim)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !skipped && (
        <div className="border-t border-[var(--line)] px-3 pb-4 pt-3 sm:px-4">
          {sug && meta && (
            <details className="mb-3 rounded-xl border border-[var(--line)] px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-[13.5px] [&::-webkit-details-marker]:hidden">
                <meta.icon className="h-4 w-4" style={{ color: meta.color }} />
                <strong style={{ color: meta.color }}>{meta.label}</strong>
                {sug.suggestedLoadKg != null && <span className="text-[var(--muted)]">· sugestão {kg(sug.suggestedLoadKg)}{sug.suggestedReps ? ` × ${sug.suggestedReps}` : ''}</span>}
                <span className="ml-auto text-[11.5px] text-[var(--dim)]">por quê?</span>
              </summary>
              <ul className="mt-2 space-y-1 text-[12.5px] text-[var(--muted)]">
                {sug.reasons.map((r) => <li key={r}>• {r}</li>)}
                {ex.plan?.last && (
                  <li>
                    • Última vez ({new Date(ex.plan.last.date).toLocaleDateString('pt-BR')}):{' '}
                    {ex.plan.last.sets.map((s) => `${s.loadKg ?? '?'}×${s.reps ?? '?'}`).join(', ')}
                  </li>
                )}
                <li className="text-[var(--dim)]">É só uma sugestão: os valores abaixo são seus para ajustar.</li>
              </ul>
            </details>
          )}

          <div className="cp-mono mb-1 grid grid-cols-[28px_1fr_1fr_1fr_44px] gap-2 px-1 text-[10.5px] uppercase tracking-[0.1em] text-[var(--dim)]">
            <span>#</span>
            <span>Carga</span>
            <span>Reps</span>
            <span>{effortMode.toUpperCase()}</span>
            <span />
          </div>
          <div className="space-y-2">
            {ex.sets.map((s, si) => (
              <div key={si} className={`grid grid-cols-[28px_1fr_1fr_1fr_44px] items-center gap-2 rounded-xl px-1 py-1 ${s.done ? 'bg-[rgba(46,230,200,0.06)]' : ''}`}>
                <button type="button" onClick={() => onRemoveSet(si)} aria-label={`Remover série ${si + 1}`} className="cp-mono grid h-8 place-items-center text-[12px] text-[var(--muted)] hover:text-[#ff8a95]" title="Remover série">
                  {si + 1}
                </button>
                <Stepper label={`carga da série ${si + 1}`} value={s.loadKg} onChange={(v) => onSet(si, { loadKg: v })} step={2.5} max={1000} width="w-full min-w-[44px]" />
                <Stepper label={`repetições da série ${si + 1}`} value={s.reps} onChange={(v) => onSet(si, { reps: v })} max={100} width="w-full min-w-[32px]" />
                <Stepper label={`${effortMode} da série ${si + 1}`} value={s.effort} onChange={(v) => onSet(si, { effort: v })} min={effortMode === 'rpe' ? 1 : 0} max={10} placeholder="—" width="w-full min-w-[28px]" />
                <button
                  type="button"
                  onClick={() => onToggle(si)}
                  aria-label={s.done ? `Desmarcar série ${si + 1}` : `Concluir série ${si + 1}`}
                  aria-pressed={s.done}
                  className={`grid h-11 w-11 place-items-center rounded-xl transition ${s.done ? 'bg-[var(--teal)] text-[#05060b]' : 'border border-[var(--line-2)] text-[var(--muted)] hover:text-white'}`}
                >
                  <Check className="h-5 w-5" strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <GhostButton onClick={onAddSet}><Plus className="h-4 w-4" /> Série</GhostButton>
            <GhostButton onClick={onSwap}><Repeat className="h-4 w-4" /> Trocar</GhostButton>
            <GhostButton onClick={onSkip}><SkipForward className="h-4 w-4" /> Pular</GhostButton>
          </div>
          <input value={ex.notes} onChange={(e) => onNotes(e.target.value)} placeholder="Execução, dor, ajuste de técnica…" className={`${inputCls} mt-3`} />
        </div>
      )}
      {open && skipped && (
        <div className="border-t border-[var(--line)] p-4">
          <GhostButton onClick={onSkip}>Desfazer: vou fazer este exercício</GhostButton>
        </div>
      )}
    </Card>
  )
}

function SessionSummary({ items, effortMode, onDone, title }: { items: ExState[]; effortMode: 'rir' | 'rpe'; onDone: () => void; title: string }) {
  const rows = useMemo(
    () =>
      items.map((e) => ({
        e,
        c: comparePlanned({
          name: e.name,
          planned: e.planned,
          change: e.change,
          sets: e.sets.map((s) => ({ reps: s.reps, loadKg: s.loadKg, rir: effortMode === 'rir' ? s.effort : null, rpe: effortMode === 'rpe' ? s.effort : null, done: s.done })),
        }),
      })),
    [items, effortMode],
  )
  const LABEL = { completed: 'Concluído', partial: 'Parcial', not_done: 'Não feito', unplanned: 'Extra' }
  const COLOR = { completed: 'var(--teal)', partial: 'var(--amber)', not_done: '#ff8a95', unplanned: 'var(--brand-300)' }
  return (
    <Page>
      <p className="cp-kicker">Treino registrado</p>
      <h1 className="cp-display mt-2 text-[34px] font-bold">{title}</h1>
      <p className="mt-2 text-[14.5px] text-[var(--muted)]">Planejado × realizado. O plano original fica guardado junto com o que você fez.</p>
      <div className="mt-6 space-y-3">
        {rows.map(({ e, c }) => (
          <Card key={e.name + e.change} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{e.name}</p>
              <span className="cp-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: COLOR[c.status] }}>{LABEL[c.status]}</span>
            </div>
            <table className="mt-3 w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[var(--dim)]">
                  <th className="font-normal">Indicador</th>
                  <th className="font-normal">Planejado</th>
                  <th className="font-normal">Realizado</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr><td className="text-[var(--muted)]">Carga</td><td>{kg(c.planned.loadKg)}</td><td>{kg(c.done.maxLoad)}{c.loadDiffKg ? ` (${c.loadDiffKg > 0 ? '+' : ''}${c.loadDiffKg})` : ''}</td></tr>
                <tr><td className="text-[var(--muted)]">Séries</td><td>{c.planned.sets ?? '—'}</td><td>{c.done.sets}{c.missingSets ? ` (faltaram ${c.missingSets})` : ''}</td></tr>
                <tr><td className="text-[var(--muted)]">Repetições</td><td>{c.planned.repsMin == null ? '—' : c.planned.repsMin === c.planned.repsMax ? c.planned.repsMin : `${c.planned.repsMin}–${c.planned.repsMax}`}</td><td>{c.done.reps.join(', ') || '—'}</td></tr>
                <tr><td className="text-[var(--muted)]">RIR</td><td>{c.planned.rir ?? '—'}</td><td>{c.done.avgRir ?? '—'}</td></tr>
              </tbody>
            </table>
          </Card>
        ))}
      </div>
      <PrimaryButton className="mt-6" onClick={onDone}>Ver minha evolução</PrimaryButton>
    </Page>
  )
}

export function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <>
      <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="cp-brand fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[28px] border border-[var(--line-2)] bg-[var(--ink-2)] p-5 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[520px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="cp-display text-[22px] font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="text-[14px] text-[var(--muted)] hover:text-white">Fechar</button>
        </div>
        {children}
      </motion.div>
    </>
  )
}

export function ExercisePicker({ token, title, onPick, onClose }: { token: string; title: string; onPick: (e: ExerciseLite) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('')
  const [list, setList] = useState<ExerciseLite[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => {
      setLoading(true)
      searchExercises(token, { q, group: group || null })
        .then(setList)
        .catch(() => setList([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(t)
  }, [token, q, group])
  return (
    <Sheet title={title} onClose={onClose}>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exercício (ex.: supino, remada)" className={inputCls} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['', 'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen'].map((g) => (
          <button key={g || 'todos'} type="button" onClick={() => setGroup(g)} className={`h-8 rounded-full px-3 text-[12.5px] ${group === g ? 'bg-[var(--paper)] text-[var(--paper-ink)]' : 'border border-[var(--line-2)] text-[var(--muted)]'}`}>
            {g || 'Todos'}
          </button>
        ))}
      </div>
      <ul className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto">
        {loading && <li className="py-6 text-center text-[13px] text-[var(--muted)]">Buscando…</li>}
        {!loading && !list.length && <li className="py-6 text-center text-[13px] text-[var(--muted)]">Nenhum exercício encontrado.</li>}
        {list.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => onPick(e)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/[0.05]">
              {e.images?.[0]?.url ? (
                <img src={e.images[0].url} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="h-11 w-11 shrink-0 rounded-lg bg-white/[0.05]" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-medium">{e.name}</span>
                <span className="block text-[12px] text-[var(--muted)]">{[e.muscleGroup, e.equipment].filter(Boolean).join(' · ')}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}


