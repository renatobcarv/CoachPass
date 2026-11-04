import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowDown, ArrowUp, BarChart3, CalendarRange, Check, Copy, Layers, Lock, Plus, RefreshCw, Sparkles, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { e1rm, type Phase } from '@/lib/periodization/calc'
import { CYCLE_TEMPLATES } from '@/lib/periodization/templates'
import { fetchLinkedPeople, type LinkedPerson } from '../../lib/professionalApi'
import {
  deleteCycle,
  fetchCompare,
  fetchCycle,
  fetchCycleWeeks,
  fetchCycles,
  fetchStudentPlan,
  proposeCycle,
  refreshCycle,
  saveCycle,
  updateCycleWeek,
  type CompareSummary,
  type CycleDoc,
  type CycleWeekView,
} from '../../lib/performanceApi'
import { Card, EmptyState, ErrorBanner, LoadingPage, Page, PageHeader, SectionTitle } from '../student/ui'
import {
  DIET_LABEL,
  Field,
  GOAL_LABEL,
  GhostButton,
  LEVEL_LABEL,
  PHASE_COLOR,
  PHASE_KIND_LABEL,
  PrimaryButton,
  StatusPill,
  Stepper,
  fmtDate,
  inputCls,
  kg,
  num,
} from './kit'

const relId = (v: unknown) => (v && typeof v === 'object' ? String((v as { id: unknown }).id) : v != null ? String(v) : '')
const relName = (v: unknown) => (v && typeof v === 'object' ? ((v as { name?: string }).name ?? '') : '')

const errText = (err: unknown, fallback: string) =>
  (err instanceof PayloadApiError ? extractPayloadMessage(err.data) : err instanceof Error ? err.message : '') || fallback

/** Segunda-feira desta semana: o treino de hoje já conta na semana 1. */
function thisMonday(): string {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

/** Linha do tempo das fases (largura proporcional às semanas). */
export function PhaseTimeline({ phases, currentWeek }: { phases: Phase[]; currentWeek?: number | null }) {
  const total = phases.reduce((n, p) => n + (p.weeks || 0), 0) || 1
  let acc = 0
  return (
    <div>
      <div className="relative flex h-10 overflow-hidden rounded-xl">
        {phases.map((p, i) => {
          const w = ((p.weeks || 0) / total) * 100
          return (
            <div key={i} className="flex items-center justify-center overflow-hidden border-r border-[rgba(5,6,11,0.6)] px-1 text-[11px] font-semibold text-[#05060b]" style={{ width: `${w}%`, background: PHASE_COLOR[p.kind] ?? '#6b7290' }} title={`${p.name || PHASE_KIND_LABEL[p.kind]} · ${p.weeks} sem`}>
              <span className="truncate">{p.name || PHASE_KIND_LABEL[p.kind]}</span>
            </div>
          )
        })}
        {currentWeek != null && currentWeek >= 0 && currentWeek < total && (
          <span className="absolute inset-y-0 w-[3px] bg-white shadow-[0_0_0_2px_rgba(5,6,11,0.6)]" style={{ left: `${((currentWeek + 0.5) / total) * 100}%` }} aria-label="Semana atual" />
        )}
      </div>
      <div className="cp-mono mt-1.5 flex text-[10.5px] text-[var(--dim)]">
        {phases.map((p, i) => {
          const start = acc + 1
          acc += p.weeks || 0
          return (
            <span key={i} className="truncate" style={{ width: `${((p.weeks || 0) / total) * 100}%` }}>
              S{start}{p.weeks > 1 ? `–${acc}` : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ======================= Lista e comparação =======================

export function CyclesHome({ mode }: { mode: 'student' | 'coach' }) {
  const { user } = useAuth()
  const [cycles, setCycles] = useState<CycleDoc[] | null>(null)
  const [pickCompare, setPickCompare] = useState<string[]>([])
  const [compare, setCompare] = useState<CompareSummary[] | null>(null)
  const [canCreate, setCanCreate] = useState(mode === 'coach')
  const base = mode === 'coach' ? '/personal/periodizacao' : '/app/periodizacao'

  useEffect(() => {
    if (!user?.accessToken || !user.id) return
    const where: Record<string, string> = mode === 'coach' ? { 'where[coach][equals]': user.id } : { 'where[student][equals]': user.id }
    fetchCycles(user.accessToken, where).then(setCycles).catch(() => setCycles([]))
    if (mode === 'student') fetchStudentPlan(user.accessToken).then((p) => setCanCreate(p.studentPro)).catch(() => undefined)
  }, [user?.accessToken, user?.id, mode])

  const runCompare = async () => {
    if (!user?.accessToken || pickCompare.length < 2) return
    const sameStudent = new Set(pickCompare.map((id) => relId(cycles?.find((c) => String(c.id) === id)?.student)))
    if (sameStudent.size > 1) return toast.error('Compare ciclos do mesmo aluno.')
    try {
      const studentId = [...sameStudent][0]
      const res = await fetchCompare(user.accessToken, pickCompare, mode === 'coach' ? studentId : null)
      setCompare(res.cycles)
    } catch (err) {
      toast.error(errText(err, 'Não foi possível comparar.'))
    }
  }

  if (!cycles) return <LoadingPage />
  const active = cycles.filter((c) => c.status === 'active')
  const others = cycles.filter((c) => c.status !== 'active')

  return (
    <Page>
      <PageHeader
        kicker="Periodização"
        title={mode === 'coach' ? 'Ciclos dos' : 'Seus'}
        accent={mode === 'coach' ? 'alunos.' : 'ciclos.'}
        lead="Programas em fases (acumulação, intensificação, realização, deload) com metas esperadas a cada semana e o que de fato aconteceu."
        action={
          canCreate ? (
            <Link to={`${base}/novo`} className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--paper)] px-6 text-[15px] font-semibold text-[var(--paper-ink)]">
              <Plus className="h-4 w-4" /> Novo ciclo
            </Link>
          ) : (
            <Link to="/planos" className="inline-flex h-12 items-center gap-2 rounded-full border border-[var(--line-2)] px-5 text-[14px] font-semibold text-[var(--muted)]">
              <Lock className="h-4 w-4" /> Criar ciclo próprio (Aluno Pro)
            </Link>
          )
        }
      />

      {!cycles.length && (
        <EmptyState icon={CalendarRange} title="Nenhum ciclo ainda">
          {mode === 'coach'
            ? 'Monte o primeiro ciclo de um aluno a partir de um modelo pronto ou de uma proposta da IA.'
            : canCreate
              ? 'Crie seu programa periodizado: escolha um modelo pronto e ajuste as fases.'
              : 'Quando seu personal montar seu ciclo, ele aparece aqui. Com o Aluno Pro você também cria o seu.'}
        </EmptyState>
      )}

      {active.length > 0 && (
        <>
          <SectionTitle icon={Layers}>Em andamento</SectionTitle>
          <div className="mb-8 grid gap-3">
            {active.map((c) => (
              <CycleCard key={c.id} c={c} base={base} showStudent={mode === 'coach'} />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <SectionTitle icon={CalendarRange}>Outros ciclos</SectionTitle>
          <div className="grid gap-3">
            {others.map((c) => (
              <CycleCard key={c.id} c={c} base={base} showStudent={mode === 'coach'} />
            ))}
          </div>
        </>
      )}

      {cycles.length >= 2 && (
        <Card className="mt-8 p-5">
          <SectionTitle icon={BarChart3}>Comparar ciclos</SectionTitle>
          <p className="text-[13.5px] text-[var(--muted)]">Escolha de 2 a 4 ciclos do mesmo aluno.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cycles.map((c) => {
              const on = pickCompare.includes(String(c.id))
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPickCompare((p) => (on ? p.filter((x) => x !== String(c.id)) : [...p, String(c.id)].slice(-4)))}
                  aria-pressed={on}
                  className={`h-9 rounded-full px-3 text-[13px] ${on ? 'bg-[var(--paper)] text-[var(--paper-ink)]' : 'border border-[var(--line-2)] text-[var(--muted)]'}`}
                >
                  {c.title}
                  {mode === 'coach' && relName(c.student) ? ` · ${relName(c.student)}` : ''}
                </button>
              )
            })}
          </div>
          <GhostButton className="mt-3" disabled={pickCompare.length < 2} onClick={() => void runCompare()}>
            <BarChart3 className="h-4 w-4" /> Comparar
          </GhostButton>
          {compare && <CompareTable rows={compare} />}
        </Card>
      )}
    </Page>
  )
}

function CycleCard({ c, base, showStudent }: { c: CycleDoc; base: string; showStudent: boolean }) {
  const STATUS = { active: 'Ativo', draft: 'Rascunho', completed: 'Concluído', archived: 'Arquivado' }
  return (
    <Link to={`${base}/${c.id}`} className="block">
      <Card className="p-5 transition-colors hover:border-[var(--brand-400)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[16px] font-semibold">{c.title}</p>
            <p className="text-[12.5px] text-[var(--muted)]">
              {showStudent && relName(c.student) ? `${relName(c.student)} · ` : ''}
              {GOAL_LABEL[c.goal] ?? c.goal} · {c.totalWeeks ?? 0} semanas · início {fmtDate(c.startDate, { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className="cp-mono rounded-full border border-[var(--line-2)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] text-[var(--muted)]">{STATUS[c.status]}</span>
        </div>
        <div className="mt-4">
          <PhaseTimeline phases={c.phases ?? []} />
        </div>
      </Card>
    </Link>
  )
}

function CompareTable({ rows }: { rows: CompareSummary[] }) {
  const line = (label: string, get: (r: CompareSummary) => React.ReactNode) => (
    <tr className="border-t border-[var(--line)]">
      <td className="py-2 pr-3 text-[var(--muted)]">{label}</td>
      {rows.map((r) => (
        <td key={r.id} className="py-2 pr-3 tabular-nums">{get(r)}</td>
      ))}
    </tr>
  )
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13.5px]">
        <thead>
          <tr className="text-left">
            <th className="pb-2 pr-3 font-normal text-[var(--dim)]">Indicador</th>
            {rows.map((r) => (
              <th key={r.id} className="pb-2 pr-3 font-semibold">{r.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {line('Objetivo', (r) => GOAL_LABEL[r.goal] ?? r.goal)}
          {line('Semanas com registro', (r) => `${r.weeksWithData}/${r.totalWeeks}`)}
          {line('Treinos feitos', (r) => r.sessions)}
          {line('Aderência média', (r) => (r.avgAdherence != null ? `${r.avgAdherence}%` : '—'))}
          {line('Semanas no alvo ou acima', (r) => r.onTrackWeeks)}
          {line('Volume médio/semana', (r) => (r.avgWeeklyTonnage != null ? `${num(r.avgWeeklyTonnage, 0)} kg` : '—'))}
          {line('Variação de peso', (r) => (r.weightChange != null ? `${r.weightChange > 0 ? '+' : ''}${num(r.weightChange)} kg` : '—'))}
          {rows[0]?.lifts.map((l, li) =>
            line(`${l.label} (1RM estimado)`, (r) => {
              const x = r.lifts[li]
              return x?.first != null ? `${num(x.first)} → ${num(x.last)} kg${x.changePct != null ? ` (${x.changePct > 0 ? '+' : ''}${x.changePct}%)` : ''}` : '—'
            }),
          )}
        </tbody>
      </table>
      <p className="mt-2 text-[12px] text-[var(--dim)]">1RM estimado pela fórmula de Epley a partir das séries registradas (até 12 repetições); não é um teste de 1RM.</p>
    </div>
  )
}

// ======================= Editor =======================

const emptyPhase = (): Phase => ({ name: '', kind: 'accumulation', weeks: 3, repRange: '8-12', rirStart: 3, rirEnd: 1, setsStart: 10, setsEnd: 14, dietPhase: 'maintenance' })
const MAIN_LIFTS = ['Agachamento livre', 'Supino reto', 'Levantamento terra']

export function CycleEditor({ mode }: { mode: 'student' | 'coach' }) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const base = mode === 'coach' ? '/personal/periodizacao' : '/app/periodizacao'
  const [allowed, setAllowed] = useState<boolean | null>(mode === 'coach' ? true : null)
  const [students, setStudents] = useState<LinkedPerson[]>([])
  const [studentId, setStudentId] = useState(params.get('aluno') ?? '')
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('hypertrophy')
  const [level, setLevel] = useState('beginner')
  const [model, setModel] = useState('block')
  const [startDate, setStartDate] = useState(thisMonday())
  const [sessions, setSessions] = useState<number | null>(4)
  const [phases, setPhases] = useState<Phase[]>([emptyPhase()])
  const [weight, setWeight] = useState<number | null>(null)
  const [lifts, setLifts] = useState(MAIN_LIFTS.map((name) => ({ name, load: null as number | null, reps: null as number | null })))
  const [aiWeeks, setAiWeeks] = useState<number | null>(12)
  const [busy, setBusy] = useState<'ai' | 'save' | null>(null)
  const [loaded, setLoaded] = useState(!id)

  useEffect(() => {
    if (!user?.accessToken) return
    if (mode === 'student') fetchStudentPlan(user.accessToken).then((p) => setAllowed(p.studentPro)).catch(() => setAllowed(false))
    else if (user.id) fetchLinkedPeople(user.id, 'personal', user.accessToken, 'active').then(setStudents).catch(() => setStudents([]))
  }, [user?.accessToken, user?.id, mode])

  // Edição: carrega o ciclo
  useEffect(() => {
    if (!id || !user?.accessToken) return
    fetchCycle(user.accessToken, id)
      .then((c) => {
        setTitle(c.title)
        setGoal(c.goal)
        setLevel(c.level)
        setModel(c.model)
        setStartDate(String(c.startDate).slice(0, 10))
        setSessions(c.sessionsPerWeek ?? 4)
        setPhases(c.phases?.length ? c.phases : [emptyPhase()])
        setWeight(c.baseline?.weightKg ?? null)
        setStudentId(relId(c.student))
        if (c.baseline?.lifts?.length) setLifts(c.baseline.lifts.map((l) => ({ name: l.name, load: l.e1rm ?? null, reps: l.e1rm ? 1 : null })))
        setLoaded(true)
      })
      .catch(() => toast.error('Ciclo não encontrado.'))
  }, [id, user?.accessToken])

  const totalWeeks = phases.reduce((n, p) => n + (p.weeks || 0), 0)
  const patch = (i: number, p: Partial<Phase>) => setPhases((ps) => ps.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const move = (i: number, d: -1 | 1) =>
    setPhases((ps) => {
      const j = i + d
      if (j < 0 || j >= ps.length) return ps
      const c = [...ps]
      ;[c[i], c[j]] = [c[j], c[i]]
      return c
    })

  const applyTemplate = (tid: string) => {
    const t = CYCLE_TEMPLATES.find((x) => x.id === tid)
    if (!t) return
    setPhases(t.phases.map((p) => ({ ...p })))
    setGoal(t.goal)
    setModel(t.model)
    setSessions(t.sessionsPerWeek)
    if (!title) setTitle(t.name)
    toast.success(`Modelo "${t.name}" aplicado. Ajuste o que quiser.`)
  }

  const askAi = async () => {
    if (!user?.accessToken) return
    if (mode === 'coach' && !studentId) return toast.error('Escolha o aluno primeiro.')
    setBusy('ai')
    try {
      const r = await proposeCycle(user.accessToken, { studentId: mode === 'coach' ? studentId : null, goal, level, weeks: aiWeeks ?? 12, sessionsPerWeek: sessions ?? 4 })
      setPhases(r.phases)
      setSessions(r.sessionsPerWeek)
      if (!title) setTitle(r.title)
      toast.success(r.provider === 'gemini' ? 'Proposta da IA aplicada. Revise antes de ativar.' : r.note || 'Modelo aplicado.')
    } catch (err) {
      toast.error(errText(err, 'A IA não conseguiu propor agora.'))
    } finally {
      setBusy(null)
    }
  }

  const save = async (status: 'draft' | 'active') => {
    if (!user?.accessToken) return
    if (mode === 'coach' && !studentId) return toast.error('Escolha o aluno.')
    if (!title.trim()) return toast.error('Dê um nome ao ciclo.')
    if (!phases.length || phases.some((p) => !p.weeks || p.weeks < 1)) return toast.error('Cada fase precisa de pelo menos 1 semana.')
    if (totalWeeks > 52) return toast.error('O ciclo pode ter no máximo 52 semanas.')
    setBusy('save')
    try {
      const doc = await saveCycle(
        user.accessToken,
        {
          title: title.trim(),
          ...(mode === 'coach' && !id ? { student: Number(studentId) } : {}),
          goal,
          level,
          model,
          startDate: new Date(`${startDate}T03:00:00Z`).toISOString(),
          sessionsPerWeek: sessions ?? 4,
          status,
          phases: phases.map((p) => ({ ...p, name: p.name || PHASE_KIND_LABEL[p.kind] })),
          baseline: {
            weightKg: weight,
            lifts: lifts
              .filter((l) => l.name.trim() && l.load && l.reps)
              .map((l) => ({ name: l.name.trim(), e1rm: e1rm(l.load!, l.reps!) ?? l.load })),
          },
        } as never,
        id,
      )
      toast.success(status === 'active' ? 'Ciclo ativado. As semanas e metas foram geradas.' : 'Rascunho salvo.')
      navigate(`${base}/${doc.id}`)
    } catch (err) {
      toast.error(errText(err, 'Não foi possível salvar o ciclo.'))
    } finally {
      setBusy(null)
    }
  }

  if (allowed === false) {
    return (
      <Page>
        <EmptyState icon={Lock} title="Periodização própria é do Aluno Pro" action={<Link to="/planos" className="inline-flex h-12 items-center rounded-full bg-[var(--paper)] px-6 font-semibold text-[var(--paper-ink)]">Ver o Aluno Pro</Link>}>
          Ciclos montados pelo seu personal continuam aparecendo para você.
        </EmptyState>
      </Page>
    )
  }
  if (!loaded) return <LoadingPage />

  return (
    <Page wide>
      <PageHeader kicker="Periodização" title={id ? 'Editar' : 'Novo'} accent="ciclo." lead="Defina as fases e a duração de cada uma. O sistema gera as semanas com as metas esperadas e compara com o que for registrado." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.7fr]">
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            {mode === 'coach' && !id && (
              <Field label="Aluno">
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputCls}>
                  <option value="">Escolha…</option>
                  {students.map((s) => <option key={s.userId} value={s.userId}>{s.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="Nome do programa"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Ex.: Powerbuilding — bloco 1" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Objetivo">
                <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>
                  {Object.entries(GOAL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Nível">
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                  {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Início"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></Field>
              <Field label="Treinos/semana"><Stepper label="treinos por semana" value={sessions} onChange={setSessions} min={1} max={14} width="w-full" /></Field>
            </div>
            <Field label="Modelo">
              <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
                <option value="block">Em blocos</option>
                <option value="linear">Linear</option>
                <option value="undulating_weekly">Ondulatória semanal</option>
                <option value="undulating_daily">Ondulatória diária</option>
                <option value="reverse">Reversa</option>
              </select>
            </Field>
            <p className="text-[13px] text-[var(--muted)]">
              Duração: <strong className="text-white">{totalWeeks} semanas</strong>
              {totalWeeks ? ` · termina em ${fmtDate(new Date(new Date(`${startDate}T12:00:00Z`).getTime() + totalWeeks * 7 * 86_400_000).toISOString(), { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
            </p>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={Copy}>Modelos prontos</SectionTitle>
            <div className="space-y-2">
              {CYCLE_TEMPLATES.map((t) => (
                <button key={t.id} type="button" onClick={() => applyTemplate(t.id)} className="w-full rounded-xl border border-[var(--line-2)] p-3 text-left transition hover:border-[var(--brand-400)]">
                  <p className="text-[14px] font-semibold">{t.name}</p>
                  <p className="text-[12.5px] text-[var(--muted)]">{t.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <Field label="Semanas (IA)"><Stepper label="semanas" value={aiWeeks} onChange={setAiWeeks} min={4} max={24} width="w-full" /></Field>
              <GhostButton onClick={() => void askAi()} disabled={busy !== null}>
                <Sparkles className="h-4 w-4" /> {busy === 'ai' ? 'Pensando…' : 'Propor com IA'}
              </GhostButton>
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <SectionTitle>Ponto de partida</SectionTitle>
            <Field label="Peso corporal (kg)"><Stepper label="peso" value={weight} onChange={setWeight} step={0.5} min={20} max={400} placeholder="—" width="w-full" /></Field>
            <p className="text-[12.5px] text-[var(--muted)]">Melhor série recente dos exercícios-chave. O 1RM é estimado (Epley) para calcular as metas de força.</p>
            {lifts.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
                <input value={l.name} onChange={(e) => setLifts((x) => x.map((y, k) => (k === i ? { ...y, name: e.target.value } : y)))} className={inputCls} aria-label="Exercício-chave" />
                <Stepper label="carga" value={l.load} onChange={(v) => setLifts((x) => x.map((y, k) => (k === i ? { ...y, load: v } : y)))} step={2.5} max={500} placeholder="kg" width="w-[48px]" />
                <Stepper label="repetições" value={l.reps} onChange={(v) => setLifts((x) => x.map((y, k) => (k === i ? { ...y, reps: v } : y)))} max={12} placeholder="reps" width="w-[36px]" />
                {l.load && l.reps ? <p className="col-span-3 -mt-1 text-[12px] text-[var(--dim)]">1RM estimado ≈ {kg(e1rm(l.load, l.reps))}</p> : null}
              </div>
            ))}
            {lifts.length < 4 && <GhostButton onClick={() => setLifts((x) => [...x, { name: '', load: null, reps: null }])}><Plus className="h-4 w-4" /> Exercício-chave</GhostButton>}
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="p-5">
            <PhaseTimeline phases={phases} />
          </Card>
          {phases.map((p, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: PHASE_COLOR[p.kind] }} />
                  <input value={p.name ?? ''} onChange={(e) => patch(i, { name: e.target.value })} placeholder={PHASE_KIND_LABEL[p.kind]} className="bg-transparent text-[16px] font-semibold outline-none placeholder:text-white" aria-label="Nome da fase" />
                </div>
                <div className="flex gap-1">
                  <button type="button" aria-label="Subir fase" onClick={() => move(i, -1)} className="grid h-9 w-9 place-items-center text-[var(--muted)] hover:text-white"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" aria-label="Descer fase" onClick={() => move(i, 1)} className="grid h-9 w-9 place-items-center text-[var(--muted)] hover:text-white"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" aria-label="Remover fase" onClick={() => setPhases((x) => x.filter((_, k) => k !== i))} className="grid h-9 w-9 place-items-center text-[var(--muted)] hover:text-[#ff8a95]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Tipo">
                  <select value={p.kind} onChange={(e) => patch(i, { kind: e.target.value as Phase['kind'] })} className={inputCls}>
                    {Object.entries(PHASE_KIND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Semanas"><Stepper label="semanas" value={p.weeks} onChange={(v) => patch(i, { weeks: v ?? 1 })} min={1} max={12} width="w-full" /></Field>
                <Field label="Repetições"><input value={p.repRange ?? ''} onChange={(e) => patch(i, { repRange: e.target.value })} className={inputCls} placeholder="8-12" /></Field>
                <Field label="Dieta">
                  <select value={p.dietPhase ?? ''} onChange={(e) => patch(i, { dietPhase: (e.target.value || null) as Phase['dietPhase'] })} className={inputCls}>
                    <option value="">—</option>
                    {Object.entries(DIET_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="RIR início → fim">
                  <div className="flex gap-1">
                    <Stepper label="RIR início" value={p.rirStart ?? null} onChange={(v) => patch(i, { rirStart: v })} max={6} width="w-full min-w-[24px]" />
                    <Stepper label="RIR fim" value={p.rirEnd ?? null} onChange={(v) => patch(i, { rirEnd: v })} max={6} width="w-full min-w-[24px]" />
                  </div>
                </Field>
                <Field label="Séries/músculo/sem">
                  <div className="flex gap-1">
                    <Stepper label="séries início" value={p.setsStart ?? null} onChange={(v) => patch(i, { setsStart: v })} max={40} width="w-full min-w-[24px]" />
                    <Stepper label="séries fim" value={p.setsEnd ?? null} onChange={(v) => patch(i, { setsEnd: v })} max={40} width="w-full min-w-[24px]" />
                  </div>
                </Field>
                <Field label="%1RM (mín–máx)">
                  <div className="flex gap-1">
                    <Stepper label="%1RM mínimo" value={p.intensityMin ?? null} onChange={(v) => patch(i, { intensityMin: v })} min={30} max={100} step={5} placeholder="—" width="w-full min-w-[24px]" />
                    <Stepper label="%1RM máximo" value={p.intensityMax ?? null} onChange={(v) => patch(i, { intensityMax: v })} min={30} max={100} step={5} placeholder="—" width="w-full min-w-[24px]" />
                  </div>
                </Field>
                <Field label="Calorias (kcal/dia)"><Stepper label="ajuste calórico" value={p.kcalDelta ?? null} onChange={(v) => patch(i, { kcalDelta: v })} min={-1500} max={1500} step={50} placeholder="0" width="w-full" /></Field>
              </div>
            </Card>
          ))}
          <GhostButton onClick={() => setPhases((x) => [...x, emptyPhase()])}><Plus className="h-4 w-4" /> Adicionar fase</GhostButton>
          <div className="flex flex-wrap gap-3 pt-2">
            <PrimaryButton onClick={() => void save('active')} disabled={busy !== null}><Check className="h-4 w-4" /> {busy === 'save' ? 'Salvando…' : 'Salvar e ativar'}</PrimaryButton>
            <GhostButton onClick={() => void save('draft')} disabled={busy !== null}>Salvar rascunho</GhostButton>
          </div>
          <p className="text-[12.5px] text-[var(--dim)]">Ativar este ciclo encerra o ciclo ativo anterior do aluno (o histórico continua guardado).</p>
        </div>
      </div>
    </Page>
  )
}

// ======================= Visão do ciclo =======================

export function CycleView({ mode }: { mode: 'student' | 'coach' }) {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const base = mode === 'coach' ? '/personal/periodizacao' : '/app/periodizacao'
  const [cycle, setCycle] = useState<CycleDoc | null>(null)
  const [weeks, setWeeks] = useState<CycleWeekView[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openWeek, setOpenWeek] = useState<number | null>(null)

  const load = async () => {
    if (!user?.accessToken || !id) return
    try {
      const [c, w] = await Promise.all([fetchCycle(user.accessToken, id), fetchCycleWeeks(user.accessToken, id)])
      setCycle(c)
      setWeeks(w)
    } catch (err) {
      setError(errText(err, 'Ciclo não encontrado.'))
    }
  }
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken, id])

  const current = useMemo(() => {
    if (!cycle) return null
    const idx = Math.floor((Date.now() - new Date(cycle.startDate).getTime()) / (7 * 86_400_000))
    return idx >= 0 && idx < (cycle.totalWeeks ?? 0) ? idx : null
  }, [cycle])

  useEffect(() => {
    if (current != null && openWeek == null) setOpenWeek(current)
  }, [current, openWeek])

  if (error) return <Page><ErrorBanner>{error}</ErrorBanner></Page>
  if (!cycle || !weeks) return <LoadingPage />

  const isAuthor = relId(cycle.author) === user?.id
  const canEdit = mode === 'coach' || isAuthor
  const studentId = relId(cycle.student)

  const setStatus = async (status: CycleDoc['status']) => {
    if (!user?.accessToken) return
    try {
      await saveCycle(user.accessToken, { status }, cycle.id)
      toast.success(status === 'active' ? 'Ciclo ativado.' : status === 'archived' ? 'Ciclo arquivado.' : 'Ciclo atualizado.')
      await load()
    } catch (err) {
      toast.error(errText(err, 'Não foi possível atualizar.'))
    }
  }
  const remove = async () => {
    if (!user?.accessToken || !window.confirm('Excluir este ciclo e as metas semanais? Os treinos registrados continuam no histórico.')) return
    try {
      await deleteCycle(user.accessToken, cycle.id)
      toast.success('Ciclo excluído.')
      navigate(base)
    } catch (err) {
      toast.error(errText(err, 'Não foi possível excluir.'))
    }
  }
  const refresh = async () => {
    if (!user?.accessToken) return
    await refreshCycle(user.accessToken, cycle.id).catch(() => undefined)
    await load()
    toast.success('Semanas recalculadas.')
  }

  const doneWeeks = weeks.filter((w) => w.status !== 'upcoming' && w.status !== 'no_data')
  const onTrack = doneWeeks.filter((w) => w.status === 'on_track' || w.status === 'ahead').length

  return (
    <Page wide>
      <Link to={base} className="mb-4 inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white">← Ciclos</Link>
      <PageHeader
        kicker={`${GOAL_LABEL[cycle.goal] ?? cycle.goal} · ${LEVEL_LABEL[cycle.level] ?? cycle.level}${mode === 'coach' && relName(cycle.student) ? ` · ${relName(cycle.student)}` : ''}`}
        title={cycle.title}
        lead={
          current != null
            ? `Semana ${current + 1} de ${cycle.totalWeeks} · ${weeks[current]?.phaseName ?? ''}. ${doneWeeks.length ? `${onTrack} de ${doneWeeks.length} semanas no alvo ou acima.` : 'Ainda sem registros nesta fase.'}`
            : cycle.status === 'draft'
              ? 'Rascunho: ative para começar a acompanhar.'
              : `${cycle.totalWeeks} semanas · início ${fmtDate(cycle.startDate, { day: '2-digit', month: 'short', year: 'numeric' })}`
        }
        action={
          <div className="flex flex-wrap gap-2">
            {canEdit && cycle.status === 'draft' && <PrimaryButton onClick={() => void setStatus('active')}><Check className="h-4 w-4" /> Ativar</PrimaryButton>}
            {canEdit && <Link to={`${base}/${cycle.id}/editar`} className="inline-flex h-11 items-center rounded-full border border-[var(--line-2)] px-4 text-[14px] font-semibold text-[var(--muted)] hover:text-white">Editar</Link>}
            <GhostButton onClick={() => void refresh()}><RefreshCw className="h-4 w-4" /> Recalcular</GhostButton>
            <Link
              to={mode === 'coach' ? `/personal/aluno/${studentId}/evolucao?ciclo=${cycle.id}` : `/app/evolucao?ciclo=${cycle.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line-2)] px-4 text-[14px] font-semibold text-[var(--muted)] hover:text-white"
            >
              <BarChart3 className="h-4 w-4" /> Evolução
            </Link>
          </div>
        }
      />

      <Card className="mb-6 p-5">
        <PhaseTimeline phases={cycle.phases ?? []} currentWeek={current} />
      </Card>

      <SectionTitle icon={CalendarRange}>Semanas</SectionTitle>
      <div className="space-y-2">
        {weeks.map((w) => (
          <WeekRow
            key={w.id}
            w={w}
            open={openWeek === w.index}
            current={current === w.index}
            canDecide={canEdit}
            canNote={mode === 'coach'}
            onToggle={() => setOpenWeek(openWeek === w.index ? null : w.index)}
            onChanged={load}
          />
        ))}
      </div>

      {canEdit && (
        <div className="mt-8 flex flex-wrap gap-3">
          {cycle.status === 'active' && <GhostButton onClick={() => void setStatus('completed')}>Marcar como concluído</GhostButton>}
          {cycle.status !== 'archived' && <GhostButton onClick={() => void setStatus('archived')}>Arquivar</GhostButton>}
          {relId(cycle.author) === user?.id && <GhostButton onClick={() => void remove()}><Trash2 className="h-4 w-4" /> Excluir</GhostButton>}
        </div>
      )}
    </Page>
  )
}

function WeekRow({
  w,
  open,
  current,
  canDecide,
  canNote,
  onToggle,
  onChanged,
}: {
  w: CycleWeekView
  open: boolean
  current: boolean
  canDecide: boolean
  canNote: boolean
  onToggle: () => void
  onChanged: () => void
}) {
  const { user } = useAuth()
  const [note, setNote] = useState(w.coachNote ?? '')
  const pending = (w.suggestions ?? []).filter((s) => s.status === 'pending')

  const decide = async (sid: string, status: 'accepted' | 'dismissed') => {
    if (!user?.accessToken) return
    try {
      await updateCycleWeek(user.accessToken, w.id, { suggestions: (w.suggestions ?? []).map((s) => ({ id: s.id, status: s.id === sid ? status : s.status })) })
      toast.success(status === 'accepted' ? 'Sugestão marcada como aplicada.' : 'Sugestão descartada.')
      onChanged()
    } catch (err) {
      toast.error(errText(err, 'Não foi possível salvar.'))
    }
  }
  const saveNote = async () => {
    if (!user?.accessToken) return
    try {
      await updateCycleWeek(user.accessToken, w.id, { coachNote: note })
      toast.success('Comentário salvo para o aluno.')
      onChanged()
    } catch (err) {
      toast.error(errText(err, 'Não foi possível salvar.'))
    }
  }

  const p = w.planned
  const e = w.expected
  const a = w.actual
  return (
    <Card className={`overflow-hidden ${current ? 'border-[var(--brand-400)]' : ''}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full flex-wrap items-center gap-3 p-4 text-left">
        <span className="cp-mono w-12 text-[13px] font-semibold">S{w.index + 1}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold">{w.phaseName}{w.isDeload ? ' · deload' : ''}{current ? ' · semana atual' : ''}</span>
          <span className="block text-[12.5px] text-[var(--muted)]">{fmtDate(w.startDate, { day: '2-digit', month: 'short' })} · {a?.sessionsDone ?? 0}/{p?.sessions ?? 0} treinos</span>
        </span>
        {pending.length > 0 && <span className="cp-mono rounded-full bg-[rgba(255,181,71,0.14)] px-2 py-1 text-[10.5px] text-[var(--amber)]">{pending.length} sugest.</span>}
        <StatusPill status={w.status} />
      </button>
      {open && (
        <div className="grid gap-4 border-t border-[var(--line)] p-4 md:grid-cols-3">
          <div>
            <p className="cp-kicker mb-2">Planejado</p>
            <ul className="space-y-1 text-[13.5px]">
              <li>Treinos: <strong>{p?.sessions ?? '—'}</strong></li>
              <li>Séries/músculo: <strong>{p?.setsPerMuscle ?? '—'}</strong></li>
              <li>RIR alvo: <strong>{p?.rir ?? '—'}</strong></li>
              <li>Repetições: <strong>{p?.repRange ?? '—'}</strong></li>
              {p?.intensity && <li>Intensidade: <strong>{p.intensity.min}–{p.intensity.max}% 1RM</strong></li>}
              {p?.dietPhase && <li>Dieta: <strong>{DIET_LABEL[p.dietPhase]}{p.kcalDelta ? ` (${p.kcalDelta > 0 ? '+' : ''}${p.kcalDelta} kcal)` : ''}</strong></li>}
            </ul>
          </div>
          <div>
            <p className="cp-kicker mb-2">Esperado</p>
            <ul className="space-y-1 text-[13.5px]">
              <li>Peso: <strong>{e?.weightKg ? `${num(e.weightKg.min)}–${num(e.weightKg.max)} kg` : '—'}</strong></li>
              {e?.lifts.map((l) => <li key={l.key}>{l.name}: <strong>{num(l.e1rm.min)}–{num(l.e1rm.max)} kg</strong> <span className="text-[var(--dim)]">(1RM est.)</span></li>)}
              <li>Aderência mínima: <strong>{Math.round((e?.minAdherence ?? 0.85) * 100)}%</strong></li>
            </ul>
          </div>
          <div>
            <p className="cp-kicker mb-2">Realizado</p>
            {a?.hasData ? (
              <ul className="space-y-1 text-[13.5px]">
                <li>Treinos: <strong>{a.sessionsDone}</strong>{a.adherence != null && ` (${Math.round(a.adherence * 100)}%)`}</li>
                <li>Peso (tendência): <strong>{a.weightTrend ? kg(a.weightTrend) : a.weightAvg ? kg(a.weightAvg) : '—'}</strong></li>
                {Object.entries(a.bestE1rm ?? {}).map(([k, v]) => <li key={k}>{e?.lifts.find((l) => l.key === k)?.name ?? k}: <strong>{kg(v)}</strong></li>)}
                <li>Volume: <strong>{num(a.tonnage, 0)} kg</strong></li>
              </ul>
            ) : (
              <p className="text-[13.5px] text-[var(--muted)]">{w.status === 'upcoming' ? 'Semana ainda não começou.' : 'Sem registros nesta semana.'}</p>
            )}
          </div>
          {(w.reasons ?? []).length > 0 && (
            <div className="md:col-span-3">
              <p className="cp-kicker mb-1">Por quê</p>
              <ul className="text-[13px] text-[var(--muted)]">{w.reasons!.map((r) => <li key={r.detail}>• {r.detail}</li>)}</ul>
            </div>
          )}
          {(w.suggestions ?? []).length > 0 && (
            <div className="md:col-span-3 space-y-2">
              <p className="cp-kicker">Sugestões (nada muda sem confirmação)</p>
              {w.suggestions.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] p-3 text-[13.5px]">
                  <span className="flex-1">{s.message}</span>
                  {s.status === 'pending' && canDecide ? (
                    <>
                      <button type="button" onClick={() => void decide(s.id, 'accepted')} className="inline-flex h-9 items-center gap-1 rounded-full bg-[var(--paper)] px-3 text-[13px] font-semibold text-[var(--paper-ink)]"><Check className="h-4 w-4" /> Aplicar</button>
                      <button type="button" onClick={() => void decide(s.id, 'dismissed')} className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--line-2)] px-3 text-[13px] text-[var(--muted)]"><X className="h-4 w-4" /> Descartar</button>
                    </>
                  ) : (
                    <span className="cp-mono text-[11px] uppercase text-[var(--dim)]">{s.status === 'accepted' ? 'aplicada' : s.status === 'dismissed' ? 'descartada' : 'pendente'}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="md:col-span-3">
            <p className="cp-kicker mb-1">Comentário do profissional</p>
            {canNote ? (
              <div className="flex gap-2">
                <input value={note} onChange={(ev) => setNote(ev.target.value)} className={inputCls} placeholder="Orientação para o aluno nesta semana" />
                <GhostButton onClick={() => void saveNote()}>Salvar</GhostButton>
              </div>
            ) : (
              <p className="text-[13.5px] text-[var(--muted)]">{w.coachNote || 'Sem comentário.'}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
