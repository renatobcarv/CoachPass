import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence } from 'motion/react'
import { ArrowDown, ArrowUp, Dumbbell, Lock, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { fetchLinkedPeople, type LinkedPerson } from '../../lib/professionalApi'
import { fetchCycles, fetchStudentPlan, saveWorkout, type CycleDoc, type ExerciseLite } from '../../lib/performanceApi'
import { Card, EmptyState, Page, PageHeader } from '../student/ui'
import { ExercisePicker } from './SessionLogger'
import { Field, GhostButton, PrimaryButton, Stepper, inputCls } from './kit'

type Row = { exercise: number | null; name: string; muscle: string | null; sets: number | null; reps: string; loadKg: number | null; targetRir: number | null; restSec: number | null; notes: string }

const WEEKDAYS = [
  ['', 'Sem dia fixo'],
  ['monday', 'Segunda'],
  ['tuesday', 'Terça'],
  ['wednesday', 'Quarta'],
  ['thursday', 'Quinta'],
  ['friday', 'Sexta'],
  ['saturday', 'Sábado'],
  ['sunday', 'Domingo'],
]

/** Monta um treino: aluno para si (Aluno Pro / profissional no modo aluno) ou personal para um aluno vinculado. */
export function WorkoutBuilder({ mode }: { mode: 'student' | 'coach' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [allowed, setAllowed] = useState<boolean | null>(mode === 'coach' ? true : null)
  const [students, setStudents] = useState<LinkedPerson[]>([])
  const [studentId, setStudentId] = useState(params.get('aluno') ?? '')
  const [cycles, setCycles] = useState<CycleDoc[]>([])
  const [cycleId, setCycleId] = useState(params.get('ciclo') ?? '')
  const [title, setTitle] = useState('')
  const [split, setSplit] = useState('')
  const [weekday, setWeekday] = useState('')
  const [observations, setObservations] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [picker, setPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const token = user?.accessToken
  const ownerId = mode === 'student' ? user?.id ?? '' : studentId

  useEffect(() => {
    if (!token) return
    if (mode === 'student') {
      fetchStudentPlan(token).then((p) => setAllowed(p.studentPro)).catch(() => setAllowed(false))
    } else if (user?.id) {
      fetchLinkedPeople(user.id, 'personal', token, 'active').then(setStudents).catch(() => setStudents([]))
    }
  }, [token, mode, user?.id])

  useEffect(() => {
    if (!token || !ownerId) return setCycles([])
    fetchCycles(token, { 'where[student][equals]': ownerId, 'where[status][in]': 'active,draft' })
      .then(setCycles)
      .catch(() => setCycles([]))
  }, [token, ownerId])

  const add = (e: ExerciseLite) => {
    setRows((r) => [...r, { exercise: e.id, name: e.name, muscle: e.muscleGroup, sets: 3, reps: '8-12', loadKg: null, targetRir: 2, restSec: 90, notes: '' }])
    setPicker(false)
  }
  const patch = (i: number, p: Partial<Row>) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...p } : row)))
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const j = i + d
      if (j < 0 || j >= r.length) return r
      const copy = [...r]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })

  const save = async () => {
    if (!token) return
    if (mode === 'coach' && !studentId) return toast.error('Escolha o aluno.')
    if (!title.trim()) return toast.error('Dê um nome ao treino.')
    if (!rows.length) return toast.error('Adicione pelo menos um exercício.')
    if (rows.some((r) => !r.sets || r.sets < 1 || r.sets > 20)) return toast.error('Cada exercício precisa de 1 a 20 séries.')
    if (rows.some((r) => !/\d/.test(r.reps))) return toast.error('Informe as repetições (ex.: 8-12).')
    setSaving(true)
    try {
      await saveWorkout(token, {
        title: title.trim(),
        ...(mode === 'coach' ? { student: Number(studentId) } : {}),
        status: 'published',
        weekday: weekday || null,
        splitLabel: split.trim() || null,
        observations: observations.trim() || null,
        cycle: cycleId ? Number(cycleId) : null,
        exercises: rows.map((r) => ({
          name: r.name,
          exercise: r.exercise,
          muscle: r.muscle,
          sets: r.sets,
          reps: r.reps.trim(),
          loadKg: r.loadKg,
          targetRir: r.targetRir,
          restSec: r.restSec,
          notes: r.notes.trim() || null,
        })),
      })
      toast.success('Treino salvo e publicado.')
      navigate(mode === 'coach' ? `/personal/aluno/${studentId}/evolucao` : '/app/treinos')
    } catch (err) {
      toast.error(err instanceof PayloadApiError ? extractPayloadMessage(err.data) || 'Não foi possível salvar.' : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (allowed === false) {
    return (
      <Page>
        <EmptyState
          icon={Lock}
          title="Monte seus próprios treinos com o Aluno Pro"
          action={<Link to="/planos" className="inline-flex h-12 items-center rounded-full bg-[var(--paper)] px-6 text-[15px] font-semibold text-[var(--paper-ink)]">Ver o Aluno Pro</Link>}
        >
          Criar treinos, dieta e periodização próprios faz parte do Aluno Pro. Os treinos que seus profissionais publicam continuam liberados.
        </EmptyState>
      </Page>
    )
  }

  return (
    <Page wide>
      <PageHeader
        kicker={mode === 'coach' ? 'Prescrição' : 'Treino próprio'}
        title="Montar"
        accent="treino."
        lead="Escolha os exercícios da biblioteca e defina séries, repetições, carga, esforço (RIR) e descanso. Esse é o planejado; o que for feito fica registrado à parte."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card className="space-y-4 p-5">
          {mode === 'coach' && (
            <Field label="Aluno">
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputCls}>
                <option value="">Escolha…</option>
                {students.map((s) => (
                  <option key={s.userId} value={s.userId}>{s.name}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Nome do treino">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Treino A — Inferiores" className={inputCls} />
          </Field>
          <Field label="Divisão (opcional)">
            <input value={split} onChange={(e) => setSplit(e.target.value)} placeholder="Ex.: Quadríceps + Glúteos" className={inputCls} />
          </Field>
          <Field label="Dia da semana">
            <select value={weekday} onChange={(e) => setWeekday(e.target.value)} className={inputCls}>
              {WEEKDAYS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Ciclo de periodização" hint={cycles.length ? 'Liga o treino ao programa para comparar semanas.' : 'Nenhum ciclo ativo ou em rascunho.'}>
            <select value={cycleId} onChange={(e) => setCycleId(e.target.value)} className={inputCls} disabled={!cycles.length}>
              <option value="">Sem ciclo</option>
              {cycles.map((c) => <option key={c.id} value={c.id}>{c.title}{c.status === 'draft' ? ' (rascunho)' : ''}</option>)}
            </select>
          </Field>
          <Field label="Observações técnicas">
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)} className={`${inputCls} h-24 py-2`} placeholder="Aquecimento, cadência, cuidados…" />
          </Field>
        </Card>

        <div>
          {rows.length === 0 && <EmptyState icon={Dumbbell} title="Nenhum exercício ainda">Adicione exercícios da biblioteca (mais de 800, com fotos).</EmptyState>}
          <div className="space-y-3">
            {rows.map((r, i) => (
              <Card key={`${r.name}-${i}`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{i + 1}. {r.name}</p>
                    {r.muscle && <p className="text-[12.5px] text-[var(--muted)]">{r.muscle}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Subir" onClick={() => move(i, -1)} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] hover:text-white"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label="Descer" onClick={() => move(i, 1)} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] hover:text-white"><ArrowDown className="h-4 w-4" /></button>
                    <button type="button" aria-label="Remover" onClick={() => setRows((x) => x.filter((_, k) => k !== i))} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] hover:text-[#ff8a95]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <Field label="Séries"><Stepper label="séries" value={r.sets} onChange={(v) => patch(i, { sets: v })} min={1} max={20} width="w-full" /></Field>
                  <Field label="Reps"><input value={r.reps} onChange={(e) => patch(i, { reps: e.target.value })} className={inputCls} placeholder="8-12" /></Field>
                  <Field label="Carga (kg)"><Stepper label="carga" value={r.loadKg} onChange={(v) => patch(i, { loadKg: v })} step={2.5} max={1000} placeholder="—" width="w-full" /></Field>
                  <Field label="RIR alvo"><Stepper label="RIR alvo" value={r.targetRir} onChange={(v) => patch(i, { targetRir: v })} max={6} width="w-full" /></Field>
                  <Field label="Descanso (s)"><Stepper label="descanso" value={r.restSec} onChange={(v) => patch(i, { restSec: v })} step={15} max={600} width="w-full" /></Field>
                </div>
                <input value={r.notes} onChange={(e) => patch(i, { notes: e.target.value })} placeholder="Observação do exercício (opcional)" className={`${inputCls} mt-3`} />
              </Card>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <GhostButton onClick={() => setPicker(true)}><Plus className="h-4 w-4" /> Adicionar exercício</GhostButton>
            <PrimaryButton onClick={() => void save()} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Salvando…' : 'Salvar e publicar'}</PrimaryButton>
          </div>
        </div>
      </div>
      <AnimatePresence>{picker && token && <ExercisePicker token={token} title="Adicionar exercício" onPick={add} onClose={() => setPicker(false)} />}</AnimatePresence>
    </Page>
  )
}
