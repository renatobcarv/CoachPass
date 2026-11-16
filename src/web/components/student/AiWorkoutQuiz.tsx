import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import {
  fetchMyStudentProfile,
  generateWorkoutWithAi,
  type AiWorkoutPreferences,
  type EquipmentAccess,
  type ExperienceLevel,
} from '../../lib/studentApi'

type Goal = NonNullable<AiWorkoutPreferences['goal']>

const GOALS: { value: Goal; label: string; hint: string }[] = [
  { value: 'hypertrophy', label: 'Ganhar massa', hint: 'Hipertrofia, 8 a 12 repetições' },
  { value: 'weight_loss', label: 'Emagrecer', hint: 'Mais gasto calórico, sem perder músculo' },
  { value: 'strength', label: 'Ficar mais forte', hint: 'Cargas altas, poucas repetições' },
  { value: 'conditioning', label: 'Condicionamento', hint: 'Circuitos e descanso curto' },
]
const DAYS = [3, 4, 5, 6]
const MINUTES = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 75, label: '1h15 ou mais' },
]
const EQUIPMENT: { value: EquipmentAccess; label: string; hint: string }[] = [
  { value: 'full_gym', label: 'Academia completa', hint: 'Máquinas, barras e halteres' },
  { value: 'basic_gym', label: 'Academia básica', hint: 'Poucas máquinas' },
  { value: 'home_weights', label: 'Em casa com pesos', hint: 'Halteres e elásticos' },
  { value: 'bodyweight', label: 'Só peso do corpo', hint: 'Sem equipamento' },
  { value: 'outdoor', label: 'Ao ar livre', hint: 'Praça, parque, barra fixa' },
]
const LEVELS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: 'beginner', label: 'Iniciante', hint: 'Menos de 6 meses treinando' },
  { value: 'intermediate', label: 'Intermediário', hint: 'De 6 meses a 2 anos' },
  { value: 'advanced', label: 'Avançado', hint: 'Mais de 2 anos com constância' },
]
const FOCUS = ['Peito', 'Costas', 'Pernas', 'Glúteos', 'Ombros', 'Braços', 'Abdômen']

type StepId = 'goal' | 'days' | 'minutes' | 'equipment' | 'level' | 'focus' | 'avoid' | 'review'
const STEPS: { id: StepId; title: string; hint?: string }[] = [
  { id: 'goal', title: 'Qual é o objetivo deste treino?' },
  { id: 'days', title: 'Quantos dias por semana você consegue treinar?' },
  { id: 'minutes', title: 'Quanto tempo você tem por treino?' },
  { id: 'equipment', title: 'Onde você vai treinar?' },
  { id: 'level', title: 'Qual é o seu nível hoje?' },
  { id: 'focus', title: 'Quer dar ênfase a algum grupo?', hint: 'Escolha até 3, ou siga equilibrado.' },
  { id: 'avoid', title: 'Tem algo para evitar?', hint: 'Dor, lesão ou exercício que você não quer fazer. Opcional.' },
  { id: 'review', title: 'Confira antes de gerar' },
]

type Answers = {
  goal?: Goal
  daysPerWeek?: number
  sessionMinutes?: number
  equipment?: EquipmentAccess
  experienceLevel?: ExperienceLevel
  focus: string[]
  avoid: string
}

function Option({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean
  onClick: () => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
        selected ? 'cp-selected border-transparent' : 'border-[var(--line-2)] hover:border-white/30 hover:bg-white/[0.03]'
      }`}
    >
      <span>
        <span className="block text-[16px] font-semibold text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] text-[var(--muted)]">{hint}</span>}
      </span>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
          selected ? 'border-white bg-white text-[var(--ink)]' : 'border-[var(--line-2)]'
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  )
}

/**
 * Quiz curto antes de gerar o treino com IA: entende o que o aluno quer nesta geração.
 * Abre em portal (escapa de ancestrais com transform), trava a rolagem e fecha com Esc.
 */
export function AiWorkoutQuiz({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone?: () => void }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [answers, setAnswers] = useState<Answers>({ focus: [], avoid: '' })
  const close = useRef(onClose)
  close.current = onClose
  const advance = useRef<number | undefined>(undefined)

  // Pré-preenche com o perfil do aluno; ele só confirma ou muda
  useEffect(() => {
    if (!open || !user?.accessToken || !user.id) return
    setStep(0)
    let cancelled = false
    fetchMyStudentProfile(String(user.id), user.accessToken)
      .then((p) => {
        if (cancelled || !p) return
        setAnswers((a) => ({
          ...a,
          goal: a.goal ?? p.goal,
          daysPerWeek: a.daysPerWeek ?? (p.trainingDaysPerWeek ? Math.min(6, Math.max(3, p.trainingDaysPerWeek)) : undefined),
          sessionMinutes: a.sessionMinutes ?? MINUTES.find((m) => m.value >= (p.sessionMinutes ?? 0))?.value,
          equipment: a.equipment ?? p.equipmentAccess?.[0],
          experienceLevel: a.experienceLevel ?? p.experienceLevel ?? undefined,
        }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [open, user?.accessToken, user?.id])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) close.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(advance.current)
    }
  }, [open, busy])

  const current = STEPS[step]!
  const set = <K extends keyof Answers>(key: K, value: Answers[K], auto = true) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    if (auto) {
      window.clearTimeout(advance.current)
      advance.current = window.setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 260)
    }
  }

  const valid = useMemo(() => {
    switch (current.id) {
      case 'goal':
        return Boolean(answers.goal)
      case 'days':
        return Boolean(answers.daysPerWeek)
      case 'minutes':
        return Boolean(answers.sessionMinutes)
      case 'equipment':
        return Boolean(answers.equipment)
      case 'level':
        return Boolean(answers.experienceLevel)
      default:
        return true
    }
  }, [answers, current.id])

  const generate = async () => {
    if (!user?.accessToken || busy) return
    setBusy(true)
    try {
      const res = await generateWorkoutWithAi(user.accessToken, {
        goal: answers.goal,
        daysPerWeek: answers.daysPerWeek,
        sessionMinutes: answers.sessionMinutes,
        experienceLevel: answers.experienceLevel,
        equipment: answers.equipment ? [answers.equipment] : undefined,
        focus: answers.focus.length ? answers.focus : undefined,
        avoid: answers.avoid.trim() || undefined,
      })
      toast.success(res.count > 1 ? `${res.count} treinos gerados para a sua semana.` : 'Treino gerado.', {
        description: `Gerações restantes no mês: ${res.remaining}.`,
      })
      onDone?.()
      onClose()
    } catch (err) {
      const msg = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : ''
      toast.error(msg || 'A IA não respondeu agora. Tente de novo em instantes.')
    } finally {
      setBusy(false)
    }
  }

  const label = {
    goal: GOALS.find((g) => g.value === answers.goal)?.label,
    days: answers.daysPerWeek ? `${answers.daysPerWeek} dias por semana` : undefined,
    minutes: MINUTES.find((m) => m.value === answers.sessionMinutes)?.label,
    equipment: EQUIPMENT.find((e) => e.value === answers.equipment)?.label,
    level: LEVELS.find((l) => l.value === answers.experienceLevel)?.label,
  }

  const body = () => {
    switch (current.id) {
      case 'goal':
        return GOALS.map((g) => (
          <Option key={g.value} selected={answers.goal === g.value} onClick={() => set('goal', g.value)} label={g.label} hint={g.hint} />
        ))
      case 'days':
        return (
          <div className="grid grid-cols-4 gap-3">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={answers.daysPerWeek === d}
                onClick={() => set('daysPerWeek', d)}
                className={`h-20 rounded-2xl border text-[26px] font-bold transition-colors ${
                  answers.daysPerWeek === d ? 'cp-selected border-transparent text-white' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )
      case 'minutes':
        return MINUTES.map((m) => (
          <Option key={m.value} selected={answers.sessionMinutes === m.value} onClick={() => set('sessionMinutes', m.value)} label={m.label} />
        ))
      case 'equipment':
        return EQUIPMENT.map((e) => (
          <Option key={e.value} selected={answers.equipment === e.value} onClick={() => set('equipment', e.value)} label={e.label} hint={e.hint} />
        ))
      case 'level':
        return LEVELS.map((l) => (
          <Option key={l.value} selected={answers.experienceLevel === l.value} onClick={() => set('experienceLevel', l.value)} label={l.label} hint={l.hint} />
        ))
      case 'focus':
        return (
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              aria-pressed={answers.focus.length === 0}
              onClick={() => set('focus', [], false)}
              className={`h-11 rounded-full border px-5 text-[14px] font-semibold ${
                answers.focus.length === 0 ? 'cp-selected border-transparent text-white' : 'border-[var(--line-2)] text-[var(--muted)]'
              }`}
            >
              Equilibrado
            </button>
            {FOCUS.map((f) => {
              const on = answers.focus.includes(f)
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && answers.focus.length >= 3}
                  onClick={() => set('focus', on ? answers.focus.filter((x) => x !== f) : [...answers.focus, f], false)}
                  className={`h-11 rounded-full border px-5 text-[14px] font-semibold disabled:opacity-40 ${
                    on ? 'cp-selected border-transparent text-white' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              )
            })}
          </div>
        )
      case 'avoid':
        return (
          <div>
            <label htmlFor="ai-avoid" className="sr-only">
              O que evitar
            </label>
            <textarea
              id="ai-avoid"
              value={answers.avoid}
              maxLength={280}
              onChange={(e) => set('avoid', e.target.value, false)}
              placeholder="Ex.: dor no ombro direito ao levantar o braço; não gosto de agachamento livre"
              className="min-h-[120px] w-full rounded-2xl border border-[var(--line-2)] bg-white/[0.03] px-4 py-3 text-[16px] text-white placeholder:text-[var(--dim)] focus:border-white/40 focus:outline-none"
            />
            <p className="mt-2 text-[12.5px] text-[var(--dim)]">
              Se houver dor forte ou condição médica, a IA não gera: procure o seu personal ou um médico.
            </p>
          </div>
        )
      case 'review':
        return (
          <div className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line-2)]">
            {(
              [
                ['Objetivo', label.goal, 0],
                ['Frequência', label.days, 1],
                ['Tempo por treino', label.minutes, 2],
                ['Local', label.equipment, 3],
                ['Nível', label.level, 4],
                ['Ênfase', answers.focus.length ? answers.focus.join(', ') : 'Equilibrado', 5],
                ['Evitar', answers.avoid.trim() || 'Nada informado', 6],
              ] as const
            ).map(([k, v, i]) => (
              <button
                key={k}
                type="button"
                onClick={() => setStep(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-white/[0.03]"
              >
                <span className="text-[13px] text-[var(--muted)]">{k}</span>
                <span className="truncate text-[14.5px] font-semibold text-white">{v}</span>
              </button>
            ))}
          </div>
        )
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !busy && onClose()} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-quiz-title"
            className="cp-brand relative flex max-h-[92svh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] border border-[var(--line-2)] bg-[var(--ink-2)] sm:rounded-[28px]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="h-1 bg-white/[0.06]">
              <div className="h-full bg-[var(--blue-2)] transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between px-6 pt-5">
              <span className="inline-flex items-center gap-2 cp-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                <Sparkles className="h-3.5 w-3.5" /> Treino com IA · {step + 1} de {STEPS.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Fechar"
                className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line-2)] text-[var(--muted)] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 id="ai-quiz-title" className="cp-display text-[26px] font-bold leading-tight text-white">
                    {current.title}
                  </h2>
                  {current.hint && <p className="mt-2 text-[14.5px] text-[var(--muted)]">{current.hint}</p>}
                  <div className="mt-6 space-y-2.5">{body()}</div>
                  {current.id === 'review' && (
                    <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--dim)]">
                      A IA monta a semana inteira e usa uma geração da sua cota mensal. O treino é um ponto de partida e não
                      substitui a avaliação de um profissional.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 border-t border-[var(--line)] px-6 py-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={busy}
                  className="cp-btn-ghost h-11 px-4"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              {current.id === 'review' ? (
                <button type="button" onClick={() => void generate()} disabled={busy} className="cp-btn-sm ml-auto h-11 px-6 disabled:opacity-60">
                  {busy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" /> Gerando a sua semana…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Gerar meu treino
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!valid}
                  className="cp-btn-sm ml-auto h-11 px-6 disabled:opacity-50"
                >
                  {current.id === 'avoid' && !answers.avoid.trim() ? 'Pular' : 'Continuar'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
