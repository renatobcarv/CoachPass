import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { AnimatePresence } from 'motion/react'
import { Activity, AlertTriangle, BarChart3, CalendarRange, Dumbbell, HeartPulse, Ruler, Scale, Trophy } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { VOLUME_GROUPS } from '@/lib/performance/analytics'
import { createBodyMetric, createCheckin, fetchExerciseHistory, fetchOverview, type ExerciseHistoryView, type MainLiftView, type Overview } from '../../lib/performanceApi'
import { uploadProfilePhoto } from '../../lib/studentApi'
import { Card, EmptyState, ErrorBanner, LoadingPage, Page, PageHeader, SectionTitle, Stat } from '../student/ui'
import { Sheet } from './SessionLogger'
import { AuthedImage } from '../AuthedImage'
import {
  BarsChart,
  EmptyNote,
  Field,
  GhostButton,
  LineSeriesChart,
  PrimaryButton,
  Select,
  StatusPill,
  Stepper,
  Tabs,
  fmtDate,
  fmtWeek,
  inputCls,
  kg,
  num,
} from './kit'

type Tab = 'overview' | 'strength' | 'volume' | 'body' | 'recovery'

/** Painel de evolução. Aluno: o próprio. Personal: rota /personal/aluno/:id/evolucao. */
export function PerformanceDashboard({ coach = false }: { coach?: boolean }) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const studentId = coach ? (id ?? null) : null
  const [tab, setTab] = useState<Tab>('overview')
  const [weeks, setWeeks] = useState(12)
  const [cycleId, setCycleId] = useState<string>(params.get('ciclo') ?? '')
  const [group, setGroup] = useState('')
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<'body' | 'checkin' | null>(null)

  const load = useCallback(async () => {
    if (!user?.accessToken) return
    try {
      setData(await fetchOverview(user.accessToken, { studentId, weeks: cycleId ? 0 : weeks, cycleId: cycleId ? Number(cycleId) : null, group: group || null }))
      setError(null)
    } catch (err) {
      setError(err instanceof PayloadApiError ? extractPayloadMessage(err.data) || 'Sem acesso.' : 'Não foi possível carregar a evolução.')
    }
  }, [user?.accessToken, studentId, weeks, cycleId, group])

  useEffect(() => {
    void load()
  }, [load])

  if (error) return <Page><ErrorBanner>{error}</ErrorBanner></Page>
  if (!data) return <LoadingPage />

  const exBase = coach ? `/personal/aluno/${studentId}/exercicio` : '/app/exercicio'

  return (
    <Page wide>
      <PageHeader
        kicker={coach ? `Aluno · ${data.student.name ?? ''}` : 'Training performance'}
        title="Evolução"
        accent={coach ? 'do aluno.' : 'e desempenho.'}
        lead="Planejado, realizado e o que mudou semana a semana. Só aparece o que foi registrado."
        action={
          data.isSelf ? (
            <div className="flex flex-wrap gap-2">
              <GhostButton onClick={() => setForm('body')}><Scale className="h-4 w-4" /> Pesagem e medidas</GhostButton>
              <GhostButton onClick={() => setForm('checkin')}><HeartPulse className="h-4 w-4" /> Check-in</GhostButton>
            </div>
          ) : (
            <Link to={`/personal/criar-treino?aluno=${studentId}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line-2)] px-4 text-[14px] font-semibold text-[var(--muted)] hover:text-white">
              <Dumbbell className="h-4 w-4" /> Prescrever treino
            </Link>
          )
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { id: 'overview', label: 'Visão geral' },
            { id: 'strength', label: 'Força' },
            { id: 'volume', label: 'Volume' },
            { id: 'body', label: 'Corpo' },
            { id: 'recovery', label: 'Recuperação' },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <Select label="Ciclo" value={cycleId} onChange={setCycleId}>
            <option value="">Todos os ciclos</option>
            {data.cycles.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
          {!cycleId && (
            <Select label="Período" value={String(weeks)} onChange={(v) => setWeeks(Number(v))}>
              <option value="4">4 semanas</option>
              <option value="8">8 semanas</option>
              <option value="12">12 semanas</option>
              <option value="26">6 meses</option>
              <option value="0">Tudo</option>
            </Select>
          )}
          {tab === 'volume' && (
            <Select label="Grupo muscular" value={group} onChange={setGroup}>
              <option value="">Todos os grupos</option>
              {VOLUME_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
          )}
        </div>
      </div>

      {data.alerts.length > 0 && (
        <div className="mb-5 space-y-2">
          {data.alerts.map((a) => (
            <p key={a} className="flex items-start gap-2 rounded-2xl border border-[rgba(255,181,71,0.35)] bg-[rgba(255,181,71,0.08)] px-4 py-3 text-[13.5px] text-[var(--amber)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {a}
            </p>
          ))}
        </div>
      )}

      {tab === 'overview' && <OverviewTab data={data} exBase={exBase} cycleBase={coach ? '/personal/periodizacao' : '/app/periodizacao'} />}
      {tab === 'strength' && <StrengthTab lifts={data.mainLifts} exBase={exBase} exercises={data.exercises} />}
      {tab === 'volume' && <VolumeTab data={data} />}
      {tab === 'body' && <BodyTab data={data} />}
      {tab === 'recovery' && <RecoveryTab data={data} />}

      <AnimatePresence>
        {form === 'body' && <BodyForm onClose={() => setForm(null)} onSaved={load} />}
        {form === 'checkin' && <CheckinForm onClose={() => setForm(null)} onSaved={load} />}
      </AnimatePresence>
    </Page>
  )
}

// ---------------- Visão geral ----------------

function OverviewTab({ data, exBase, cycleBase }: { data: Overview; exBase: string; cycleBase: string }) {
  const ac = data.activeCycle
  // Ciclo ativo que ainda não começou (início no futuro)
  const notStarted = ac != null && ac.currentWeek < 0
  const lastWeight = data.body.weight[data.body.weight.length - 1]
  const thisWeekVolume = data.tonnage[data.tonnage.length - 1]
  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Semana atual"
          value={ac && !notStarted ? `${String(ac.currentWeek + 1).padStart(2, '0')}/${ac.totalWeeks}` : '—'}
          hint={!ac ? 'Sem ciclo ativo' : notStarted ? `Começa em ${fmtDate(ac.startDate)}` : (ac.phaseName ?? '')}
          icon={CalendarRange}
        />
        <Stat
          label="Treinos concluídos"
          value={ac && !notStarted ? `${ac.sessionsDone}/${ac.sessionsPlanned}` : data.totals.sessions}
          hint={ac && !notStarted ? (ac.adherence != null ? `${ac.adherence}% de aderência` : 'no ciclo') : 'no período'}
          icon={Activity}
          delay={0.05}
        />
        <Stat label="Volume da semana" value={thisWeekVolume ? num(thisWeekVolume.tonnage, 0) : '—'} unit={thisWeekVolume ? 'kg' : undefined} hint="carga × repetições" icon={BarChart3} delay={0.1} />
        <Stat label="Peso (média 7 dias)" value={lastWeight?.avg7 ?? lastWeight?.weightKg ?? '—'} unit={lastWeight ? 'kg' : undefined} hint={lastWeight ? `última pesagem ${fmtDate(lastWeight.date)}` : 'Sem pesagens'} icon={Scale} delay={0.15} />
      </div>

      {ac ? (
        <Card className="mb-6 p-5">
          <SectionTitle icon={CalendarRange} action={<Link to={`${cycleBase}/${ac.id}`} className="text-[13.5px] text-[var(--brand-300)] hover:text-white">Abrir ciclo →</Link>}>
            {ac.title}
          </SectionTitle>
          <div className="flex gap-1">
            {ac.weeks.map((w) => (
              <div key={w.index} className="flex-1" title={`Semana ${w.index + 1}: ${w.phaseName}`}>
                <div className="h-2 rounded-full" style={{ background: w.index === ac.currentWeek ? 'white' : w.status === 'upcoming' ? 'rgba(255,255,255,0.08)' : w.status === 'on_track' || w.status === 'ahead' ? 'var(--teal)' : w.status === 'no_data' ? 'rgba(255,255,255,0.18)' : 'var(--amber)' }} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12.5px] text-[var(--muted)]">Cada barra é uma semana: verde = no alvo, amarelo = abaixo/atenção, cinza = sem registro, branco = semana atual.</p>
          {notStarted && <p className="mt-3 text-[13.5px] text-[var(--muted)]">O ciclo começa em {fmtDate(ac.startDate, { day: '2-digit', month: 'long' })}. Treinos feitos antes disso não entram nas metas dele.</p>}
          {ac.weeks[ac.currentWeek] && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[13.5px]">
              <StatusPill status={ac.weeks[ac.currentWeek].status} />
              {ac.weeks[ac.currentWeek].planned && (
                <span className="text-[var(--muted)]">
                  Meta da semana: {ac.weeks[ac.currentWeek].planned!.sessions} treinos · {ac.weeks[ac.currentWeek].planned!.setsPerMuscle ?? '—'} séries/músculo · RIR {ac.weeks[ac.currentWeek].planned!.rir ?? '—'}
                </span>
              )}
            </div>
          )}
        </Card>
      ) : (
        <div className="mb-6">
          <EmptyNote>Nenhum ciclo ativo. Monte um programa em Periodização para ver a semana, a fase e a aderência aqui.</EmptyNote>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle icon={Dumbbell}>Progressão de força</SectionTitle>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-[var(--dim)]">
                <th className="pb-2 font-normal">Exercício</th>
                <th className="pb-2 font-normal">Último registro</th>
                <th className="pb-2 font-normal">1RM estimado</th>
              </tr>
            </thead>
            <tbody>
              {data.mainLifts.map((l) => (
                <tr key={l.lift} className="border-t border-[var(--line)]">
                  <td className="py-2.5">{l.key ? <Link to={`${exBase}/${encodeURIComponent(l.key)}`} className="hover:text-[var(--brand-300)]">{l.label}</Link> : l.label}</td>
                  <td className="py-2.5 tabular-nums">{l.last?.topLoad ? `${num(l.last.topLoad)} kg × ${l.last.topLoadReps}` : <span className="text-[var(--dim)]">A registrar</span>}</td>
                  <td className="py-2.5 tabular-nums">{l.records.bestE1rm ? kg(l.records.bestE1rm.value) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={Trophy}>Recordes recentes</SectionTitle>
          {data.prTimeline.length ? (
            <ul className="space-y-2 text-[13.5px]">
              {data.prTimeline.slice(0, 7).map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <Link to={`${exBase}/${encodeURIComponent(p.key)}`} className="min-w-0 truncate hover:text-[var(--brand-300)]">
                    <strong>{p.exercise}</strong> · {p.detail}
                  </Link>
                  <span className="cp-mono shrink-0 text-[12px] text-[var(--dim)]">{fmtDate(p.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>Recordes aparecem quando um registro supera um anterior do mesmo exercício.</EmptyNote>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionTitle icon={BarChart3}>Volume semanal (carga × repetições)</SectionTitle>
          {data.tonnage.some((t) => t.tonnage > 0) ? (
            <BarsChart data={data.tonnage.map((t) => ({ ...t, semana: fmtWeek(t.week) }))} xKey="semana" series={[{ key: 'tonnage', label: 'Volume (kg)', color: '#5546ff' }]} />
          ) : (
            <EmptyNote>Sem séries com carga registradas no período.</EmptyNote>
          )}
        </Card>
      </div>
    </>
  )
}

// ---------------- Força ----------------

function StrengthTab({ lifts, exBase, exercises }: { lifts: MainLiftView[]; exBase: string; exercises: Overview['exercises'] }) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {lifts.map((l) => <LiftCard key={l.lift} lift={l} exBase={exBase} />)}
      </div>
      <Card className="mt-6 p-5">
        <SectionTitle icon={Dumbbell}>Histórico de qualquer exercício</SectionTitle>
        {exercises.length ? (
          <div className="flex flex-wrap gap-2">
            {exercises.map((e) => (
              <Link key={e.key} to={`${exBase}/${encodeURIComponent(e.key)}`} className="rounded-full border border-[var(--line-2)] px-3 py-1.5 text-[13px] text-[var(--muted)] hover:border-[var(--brand-400)] hover:text-white">
                {e.name} <span className="text-[var(--dim)]">· {e.sessions}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyNote>Registre treinos para ver o histórico de cada exercício.</EmptyNote>
        )}
      </Card>
      <p className="mt-3 text-[12px] text-[var(--dim)]">
        Recordes separados: maior carga (o peso mais alto levantado), recorde por repetição (melhor carga para N repetições), 1RM estimado (Epley, até 12 reps; é estimativa, não teste) e volume da sessão.
      </p>
    </>
  )
}

function LiftCard({ lift, exBase }: { lift: MainLiftView; exBase: string }) {
  const r = lift.records
  const c = lift.lastCompare
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="cp-display text-[19px] font-bold">{lift.label}</p>
        {lift.key && <Link to={`${exBase}/${encodeURIComponent(lift.key)}`} className="text-[12.5px] text-[var(--brand-300)] hover:text-white">Histórico →</Link>}
      </div>
      {!lift.key ? (
        <div className="mt-3"><EmptyNote>Nenhum registro de {lift.label.toLowerCase()} ainda.</EmptyNote></div>
      ) : (
        <>
          <p className="cp-display mt-3 text-[34px] font-bold leading-none tabular-nums">
            {lift.last?.topLoad ? `${num(lift.last.topLoad)} kg` : '—'}
            {lift.last?.topLoadReps ? <span className="ml-2 text-[15px] font-medium text-[var(--muted)]">× {lift.last.topLoadReps}</span> : null}
          </p>
          <p className="text-[12.5px] text-[var(--muted)]">Último registro · {fmtDate(lift.last?.date)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
            <div><dt className="text-[var(--dim)]">Maior carga</dt><dd className="font-semibold">{r.heaviest ? `${num(r.heaviest.loadKg)} kg × ${r.heaviest.reps}` : '—'}</dd></div>
            <div><dt className="text-[var(--dim)]">1RM estimado</dt><dd className="font-semibold">{r.bestE1rm ? kg(r.bestE1rm.value) : '—'}</dd></div>
            <div><dt className="text-[var(--dim)]">Maior volume</dt><dd className="font-semibold">{r.bestVolume ? `${num(r.bestVolume.value, 0)} kg` : '—'}</dd></div>
            <div><dt className="text-[var(--dim)]">Sessões no período</dt><dd className="font-semibold">{lift.sessions}</dd></div>
          </dl>
          {r.repMax.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.repMax.map((x) => (
                <span key={x.reps} className="cp-mono rounded-lg border border-[var(--line)] px-2 py-1 text-[11.5px]">{x.reps}RM {num(x.loadKg)}</span>
              ))}
            </div>
          )}
          {lift.weekly.length > 1 ? (
            <div className="mt-4">
              <LineSeriesChart
                data={lift.weekly.map((w) => ({ semana: fmtWeek(w.week), e1rm: w.bestE1rm, carga: w.topLoad }))}
                xKey="semana"
                height={170}
                series={[
                  { key: 'e1rm', label: '1RM estimado', color: '#8c82ff' },
                  { key: 'carga', label: 'Maior carga', color: '#2ee6c8', dashed: true },
                ]}
              />
            </div>
          ) : (
            <p className="mt-4 text-[12.5px] text-[var(--dim)]">O gráfico aparece a partir de 2 semanas com registro.</p>
          )}
          {c && c.status !== 'unplanned' && (
            <div className="mt-3 rounded-xl border border-[var(--line)] p-3 text-[12.5px]">
              <p className="cp-kicker mb-1">Última sessão: planejado × realizado</p>
              <p>Carga {kg(c.planned.loadKg)} → <strong>{kg(c.done.maxLoad)}</strong> · Reps {c.planned.repsMin ?? '—'}{c.planned.repsMax && c.planned.repsMax !== c.planned.repsMin ? `–${c.planned.repsMax}` : ''} → <strong>{c.done.reps.join(', ')}</strong> · RIR {c.planned.rir ?? '—'} → <strong>{c.done.avgRir ?? '—'}</strong></p>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

// ---------------- Volume ----------------

function VolumeTab({ data }: { data: Overview }) {
  const target = data.volume.plannedPerGroup
  const week = data.volume.thisWeek.filter((g) => g.direct + g.indirect > 0 || target)
  const groups = Object.keys(data.volume.weeks[0]?.groups ?? {})
  const chartData = data.volume.weeks.map((w) => ({
    semana: fmtWeek(w.week),
    ...Object.fromEntries(groups.map((g) => [g, w.groups[g]?.direct ?? 0])),
  }))
  const palette = ['#5546ff', '#2ee6c8', '#ffb547', '#ff8a5c', '#8c82ff', '#38d6f5', '#ff5d6c', '#c4bfff', '#f59e0b', '#6a5cff', '#14b8a6', '#e879f9']
  return (
    <>
      <Card className="mb-4 p-5">
        <SectionTitle icon={BarChart3}>Esta semana · séries por grupo</SectionTitle>
        {week.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13.5px]">
              <thead>
                <tr className="text-left text-[12px] text-[var(--dim)]">
                  <th className="pb-2 font-normal">Grupo</th>
                  <th className="pb-2 font-normal">Diretas</th>
                  <th className="pb-2 font-normal">Indiretas</th>
                  <th className="pb-2 font-normal">Total ponderado</th>
                  <th className="pb-2 font-normal">Frequência</th>
                  {target != null && <th className="pb-2 font-normal">Planejado</th>}
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {week.map((g) => {
                  const weighted = g.direct + g.indirect * 0.5
                  return (
                    <tr key={g.group} className="border-t border-[var(--line)]">
                      <td className="py-2">{g.group}</td>
                      <td className="py-2 font-semibold">{g.direct}</td>
                      <td className="py-2 text-[var(--muted)]">{g.indirect}</td>
                      <td className="py-2">{num(weighted)}</td>
                      <td className="py-2">{g.frequency}×</td>
                      {target != null && <td className="py-2" style={{ color: g.direct >= target * 0.8 ? 'var(--teal)' : 'var(--amber)' }}>{target}</td>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyNote>Nenhuma série registrada nesta semana.</EmptyNote>
        )}
        <p className="mt-3 text-[12px] text-[var(--dim)]">{data.volume.method}</p>
      </Card>
      <Card className="p-5">
        <SectionTitle>Séries diretas por semana</SectionTitle>
        {chartData.length ? (
          <BarsChart data={chartData} xKey="semana" stacked height={280} series={groups.map((g, i) => ({ key: g, label: g, color: palette[i % palette.length] }))} />
        ) : (
          <EmptyNote>Sem treinos registrados no período.</EmptyNote>
        )}
      </Card>
    </>
  )
}

// ---------------- Corpo ----------------

const MEASURE_LABEL: Record<string, string> = { waistCm: 'Cintura', abdomenCm: 'Abdômen', hipCm: 'Quadril', chestCm: 'Peitoral', armCm: 'Braço', thighCm: 'Coxa', calfCm: 'Panturrilha' }

function BodyTab({ data }: { data: Overview }) {
  const { user } = useAuth()
  const token = user?.accessToken
  const w = data.body.weight
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 lg:col-span-2">
        <SectionTitle icon={Scale}>Peso corporal</SectionTitle>
        {w.length ? (
          <LineSeriesChart
            data={w.map((p) => ({ dia: fmtDate(p.date), peso: p.weightKg, media: p.avg7 }))}
            xKey="dia"
            series={[
              { key: 'peso', label: 'Pesagem', color: 'rgba(232,236,255,0.45)', dashed: true },
              { key: 'media', label: 'Média de 7 dias', color: '#2ee6c8' },
            ]}
          />
        ) : (
          <EmptyNote>Sem pesagens no período. Pese-se em jejum, 3 ou mais vezes por semana: a média de 7 dias mostra a tendência real.</EmptyNote>
        )}
      </Card>
      <Card className="p-5">
        <SectionTitle icon={Ruler}>Medidas (período)</SectionTitle>
        <ul className="space-y-2 text-[13.5px]">
          {Object.entries(data.body.measures).map(([k, m]) => (
            <li key={k} className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <span className="text-[var(--muted)]">{MEASURE_LABEL[k]}</span>
              {m.last ? (
                <span className="tabular-nums">
                  <strong>{num(m.last.value)} cm</strong>
                  {m.first && m.first.date !== m.last.date && (
                    <span className="ml-2 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                      {m.last.value - m.first.value > 0 ? '+' : ''}
                      {num(m.last.value - m.first.value)} desde {fmtDate(m.first.date)}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[var(--dim)]">—</span>
              )}
            </li>
          ))}
        </ul>
        {data.body.bodyFat.length > 0 && (
          <p className="mt-3 text-[12.5px] text-[var(--muted)]">
            % de gordura (medido): {data.body.bodyFat.map((b) => `${num(b.value)}% em ${fmtDate(b.date)}${b.method ? ` (${b.method})` : ''}`).join(' · ')}
          </p>
        )}
        <p className="mt-2 text-[12px] text-[var(--dim)]">O app não estima % de gordura: só mostra o valor quando ele foi medido por um método informado.</p>
      </Card>
      <Card className="p-5">
        <SectionTitle>Fotos de evolução</SectionTitle>
        {data.body.photos.length ? (
          <div className="space-y-3">
            {data.body.photos.slice(-3).reverse().map((g) => (
              <div key={g.date}>
                <p className="cp-mono mb-1 text-[11.5px] text-[var(--dim)]">{fmtDate(g.date, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <div className="flex gap-2">{g.photos.map((p) => <AuthedImage key={p.url} src={p.url} token={token} alt={`Foto ${p.angle ?? ''}`} className="h-28 w-20 rounded-lg object-cover" />)}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote>{data.isSelf ? 'Adicione fotos em "Pesagem e medidas". Só você vê suas fotos.' : 'As fotos de evolução são privadas do aluno.'}</EmptyNote>
        )}
      </Card>
    </div>
  )
}

// ---------------- Recuperação ----------------

function RecoveryTab({ data }: { data: Overview }) {
  const r = data.recovery
  return (
    <Card className="p-5">
      <SectionTitle icon={HeartPulse}>Recuperação (check-ins)</SectionTitle>
      {r.length ? (
        <>
          <LineSeriesChart
            data={r.map((c) => ({ dia: fmtDate(String(c.date)), sono: c.sleep, fadiga: c.fatigue, disposicao: c.readiness, dor: c.jointPain }))}
            xKey="dia"
            series={[
              { key: 'sono', label: 'Sono', color: '#2ee6c8' },
              { key: 'disposicao', label: 'Disposição', color: '#8c82ff' },
              { key: 'fadiga', label: 'Fadiga', color: '#ffb547' },
              { key: 'dor', label: 'Dor articular', color: '#ff5d6c' },
            ]}
          />
          <p className="mt-2 text-[12px] text-[var(--dim)]">Escala de 1 a 5. Fadiga e dor: quanto maior, pior. Usado para contextualizar as sugestões de carga (nunca diagnostica nada).</p>
        </>
      ) : (
        <EmptyNote>Sem check-ins no período. Um check-in por semana (1 minuto) melhora as sugestões de carga.</EmptyNote>
      )}
    </Card>
  )
}

// ---------------- Formulários ----------------

function BodyForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth()
  const [v, setV] = useState<Record<string, number | null>>({ weightKg: null, waistCm: null, abdomenCm: null, hipCm: null, chestCm: null, armCm: null, thighCm: null, calfCm: null, bodyFatPercent: null })
  const [method, setMethod] = useState('')
  const [photos, setPhotos] = useState<Array<{ url: string; angle: string }>>([])
  const [busy, setBusy] = useState(false)
  const set = (k: string) => (n: number | null) => setV((x) => ({ ...x, [k]: n }))

  const upload = async (file: File | undefined, angle: string) => {
    if (!file || !user?.accessToken) return
    try {
      const url = await uploadProfilePhoto(file, user.accessToken)
      setPhotos((p) => [...p.filter((x) => x.angle !== angle), { url, angle }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao enviar a foto.')
    }
  }
  const save = async () => {
    if (!user?.accessToken) return
    if (!Object.values(v).some((x) => x != null) && !photos.length) return toast.error('Preencha pelo menos um campo.')
    if (v.bodyFatPercent != null && !method.trim()) return toast.error('Informe o método da medição de gordura.')
    setBusy(true)
    try {
      await createBodyMetric(user.accessToken, { ...v, bodyFatMethod: method.trim() || null, photos, date: new Date().toISOString() })
      toast.success('Medidas registradas.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof PayloadApiError ? extractPayloadMessage(err.data) || 'Valores inválidos.' : 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }
  const fields: Array<[string, string, number]> = [
    ['weightKg', 'Peso (kg)', 0.1],
    ['waistCm', 'Cintura (cm)', 0.5],
    ['abdomenCm', 'Abdômen (cm)', 0.5],
    ['hipCm', 'Quadril (cm)', 0.5],
    ['chestCm', 'Peitoral (cm)', 0.5],
    ['armCm', 'Braço (cm)', 0.5],
    ['thighCm', 'Coxa (cm)', 0.5],
    ['calfCm', 'Panturrilha (cm)', 0.5],
  ]
  return (
    <Sheet title="Pesagem e medidas" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([k, l, step]) => (
          <Field key={k} label={l}><Stepper label={l} value={v[k]} onChange={set(k)} step={step} max={400} placeholder="—" width="w-full" /></Field>
        ))}
        <Field label="% gordura (medido)"><Stepper label="% gordura" value={v.bodyFatPercent} onChange={set('bodyFatPercent')} step={0.5} max={70} placeholder="—" width="w-full" /></Field>
        <Field label="Método"><input value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls} placeholder="Bioimpedância, dobras…" /></Field>
      </div>
      <p className="cp-kicker mb-2 mt-4">Fotos (opcional, só você vê)</p>
      <div className="grid grid-cols-3 gap-2">
        {['front', 'side', 'back'].map((angle) => {
          const p = photos.find((x) => x.angle === angle)
          return (
            <label key={angle} className="grid h-24 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-[var(--line-2)] text-[12px] text-[var(--muted)]">
              {p ? <AuthedImage src={p.url} token={user?.accessToken} alt="" className="h-full w-full object-cover" /> : angle === 'front' ? 'Frente' : angle === 'side' ? 'Lado' : 'Costas'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void upload(e.target.files?.[0], angle)} />
            </label>
          )
        })}
      </div>
      <PrimaryButton className="mt-5 w-full" disabled={busy} onClick={() => void save()}>{busy ? 'Salvando…' : 'Salvar'}</PrimaryButton>
    </Sheet>
  )
}

function Scale5({ label, value, onChange, hint }: { label: string; value: number | null; onChange: (v: number) => void; hint: string }) {
  return (
    <div>
      <p className="text-[14px] font-medium">{label} <span className="text-[12px] text-[var(--dim)]">{hint}</span></p>
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-pressed={value === n} className={`h-10 rounded-lg text-[14px] font-semibold ${value === n ? 'bg-[var(--paper)] text-[var(--paper-ink)]' : 'border border-[var(--line-2)] text-[var(--muted)]'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function CheckinForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth()
  const [v, setV] = useState<Record<string, number | null>>({ sleep: null, fatigue: null, soreness: null, readiness: null, jointPain: null, recovery: null, stress: null })
  const [diet, setDiet] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: string) => (n: number) => setV((x) => ({ ...x, [k]: n }))
  const save = async () => {
    if (!user?.accessToken) return
    if (Object.values(v).some((x) => x == null)) return toast.error('Responda todas as perguntas (1 a 5).')
    setBusy(true)
    try {
      await createCheckin(user.accessToken, { ...v, dietAdherence: diet, notes: notes.trim() || null, date: new Date().toISOString() })
      toast.success('Check-in registrado.')
      onSaved()
      onClose()
    } catch {
      toast.error('Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet title="Check-in de recuperação" onClose={onClose}>
      <div className="space-y-3">
        <Scale5 label="Qualidade do sono" hint="(1 ruim · 5 ótimo)" value={v.sleep} onChange={set('sleep')} />
        <Scale5 label="Fadiga" hint="(1 descansado · 5 exausto)" value={v.fatigue} onChange={set('fatigue')} />
        <Scale5 label="Dor muscular" hint="(1 nenhuma · 5 muita)" value={v.soreness} onChange={set('soreness')} />
        <Scale5 label="Dor nas articulações" hint="(1 nenhuma · 5 muita)" value={v.jointPain} onChange={set('jointPain')} />
        <Scale5 label="Disposição para treinar" hint="(1 nenhuma · 5 total)" value={v.readiness} onChange={set('readiness')} />
        <Scale5 label="Recuperação percebida" hint="(1 ruim · 5 ótima)" value={v.recovery} onChange={set('recovery')} />
        <Scale5 label="Estresse" hint="(1 baixo · 5 alto)" value={v.stress} onChange={set('stress')} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px]">Aderência à dieta (%)</span>
          <Stepper label="aderência à dieta" value={diet} onChange={setDiet} step={10} max={100} placeholder="—" />
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} h-20 py-2`} placeholder="Algo a contar? (opcional)" />
        <p className="text-[12px] text-[var(--dim)]">Se sentir dor forte ou persistente, procure um profissional de saúde.</p>
      </div>
      <PrimaryButton className="mt-5 w-full" disabled={busy} onClick={() => void save()}>{busy ? 'Salvando…' : 'Salvar check-in'}</PrimaryButton>
    </Sheet>
  )
}

// ---------------- Histórico de um exercício ----------------

export function ExerciseHistoryPage({ coach = false }: { coach?: boolean }) {
  const { id, key } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState<ExerciseHistoryView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const decoded = useMemo(() => decodeURIComponent(key ?? ''), [key])

  useEffect(() => {
    if (!user?.accessToken || !decoded) return
    fetchExerciseHistory(user.accessToken, decoded, coach ? id : null)
      .then(setData)
      .catch((err) => setError(err instanceof PayloadApiError ? extractPayloadMessage(err.data) || 'Sem acesso.' : 'Não foi possível carregar.'))
  }, [user?.accessToken, decoded, coach, id])

  if (error) return <Page><ErrorBanner>{error}</ErrorBanner></Page>
  if (!data) return <LoadingPage />
  const back = coach ? `/personal/aluno/${id}/evolucao` : '/app/evolucao'
  const s = data.suggestion
  return (
    <Page>
      <Link to={back} className="mb-4 inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white">← Evolução</Link>
      <PageHeader kicker="Histórico do exercício" title={data.name} lead={`${data.sessions.length} sessões registradas.`} />
      {!data.sessions.length ? (
        <EmptyState icon={Dumbbell} title="Sem registros">Este exercício ainda não foi registrado.</EmptyState>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Maior carga" value={data.records.heaviest ? num(data.records.heaviest.loadKg) : '—'} unit="kg" hint={data.records.heaviest ? `× ${data.records.heaviest.reps} · ${fmtDate(data.records.heaviest.date)}` : undefined} />
            <Stat label="1RM estimado" value={data.records.bestE1rm ? num(data.records.bestE1rm.value) : '—'} unit="kg" hint="estimativa (Epley)" delay={0.05} />
            <Stat label="Maior volume" value={data.records.bestVolume ? num(data.records.bestVolume.value, 0) : '—'} unit="kg" hint="numa sessão" delay={0.1} />
            <Stat label="Próxima sessão" value={s.suggestedLoadKg != null ? num(s.suggestedLoadKg) : '—'} unit={s.suggestedLoadKg != null ? 'kg' : undefined} hint={s.suggestedReps ? `× ${s.suggestedReps} (sugestão)` : 'sugestão'} delay={0.15} />
          </div>
          <Card className="mb-4 p-5">
            <p className="cp-kicker mb-1">Por que essa sugestão</p>
            <ul className="text-[13.5px] text-[var(--muted)]">{s.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
          </Card>
          {data.weekly.length > 1 && (
            <Card className="mb-4 p-5">
              <SectionTitle>Evolução semanal</SectionTitle>
              <LineSeriesChart
                data={data.weekly.map((w) => ({ semana: fmtWeek(w.week), e1rm: w.bestE1rm, carga: w.topLoad }))}
                xKey="semana"
                series={[
                  { key: 'e1rm', label: '1RM estimado', color: '#8c82ff' },
                  { key: 'carga', label: 'Maior carga', color: '#2ee6c8', dashed: true },
                ]}
              />
            </Card>
          )}
          {data.records.repMax.length > 0 && (
            <Card className="mb-4 p-5">
              <SectionTitle icon={Trophy}>Recordes por repetição</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {data.records.repMax.map((x) => (
                  <span key={x.reps} className="rounded-xl border border-[var(--line)] px-3 py-2 text-[13px]"><strong>{x.reps} rep{x.reps > 1 ? 's' : ''}</strong>: {num(x.loadKg)} kg <span className="text-[var(--dim)]">· {fmtDate(x.date)}</span></span>
                ))}
              </div>
            </Card>
          )}
          <SectionTitle>Sessões</SectionTitle>
          <div className="space-y-2">
            {data.sessions.map((ss, i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{fmtDate(ss.date, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="cp-mono text-[12px] text-[var(--muted)]">volume {num(ss.volume, 0)} kg · 1RM est. {kg(ss.bestE1rm)}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ss.sets.map((st, k) => (
                    <span key={k} className="cp-mono rounded-lg bg-white/[0.04] px-2 py-1 text-[12.5px]">
                      {num(st.loadKg)}×{st.reps}{st.rir != null ? ` @RIR${st.rir}` : st.rpe != null ? ` @RPE${st.rpe}` : ''}{st.restSec ? ` · ${st.restSec}s` : ''}
                    </span>
                  ))}
                </div>
                {ss.compare && ss.compare.status !== 'unplanned' && (
                  <p className="mt-2 text-[12.5px] text-[var(--muted)]">
                    Planejado: {ss.compare.planned.sets ?? '—'} × {ss.compare.planned.repsMin ?? '—'}{ss.compare.planned.repsMax && ss.compare.planned.repsMax !== ss.compare.planned.repsMin ? `–${ss.compare.planned.repsMax}` : ''}
                    {ss.compare.planned.loadKg ? ` @ ${kg(ss.compare.planned.loadKg)}` : ''} · {ss.compare.status === 'completed' ? 'concluído' : 'parcial'}
                    {ss.compare.loadDiffKg ? ` · carga ${ss.compare.loadDiffKg > 0 ? '+' : ''}${num(ss.compare.loadDiffKg)} kg` : ''}
                  </p>
                )}
                {ss.change && ss.change !== 'none' && <p className="text-[12px] text-[var(--amber)]">{ss.change === 'substituted' ? 'Exercício trocado pelo aluno' : ss.change === 'added' ? 'Exercício extra' : 'Pulado'}</p>}
                {ss.notes && <p className="mt-1 text-[12.5px] text-[var(--muted)]">“{ss.notes}”</p>}
              </Card>
            ))}
          </div>
        </>
      )}
    </Page>
  )
}
