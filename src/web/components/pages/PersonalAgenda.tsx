import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, MapPin, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { SESSIONS_API, deleteJson, getJson, qs } from '@/lib/cms'
import { createSession, updateSession, type SessionDoc } from '../../lib/professionalApi'
import { CTAButton } from '../brand/Brand'
import { Badge, Card, ErrorBanner, Page, PageHeader, SectionTitle, Skeleton } from '../student/ui'
import { Choice, Field, NoPeople, PersonSelect, TextArea, dateToApi, errorText, todayISO, useLinkedPeople } from '../pro/records'

const TYPE_LABEL: Record<SessionDoc['type'], string> = {
  training: 'Treino',
  assessment: 'Avaliação',
  consultation: 'Consulta',
  followup: 'Retorno',
}
const STATUS: Record<SessionDoc['status'], { label: string; tone: 'blue' | 'teal' | 'neutral' }> = {
  scheduled: { label: 'Agendada', tone: 'blue' },
  completed: { label: 'Concluída', tone: 'teal' },
  cancelled: { label: 'Cancelada', tone: 'neutral' },
}

/** Segunda-feira da semana de uma data (horário local). */
function mondayOf(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dayKey = (iso: string) => iso.slice(0, 10)

const EMPTY = { student: '', date: todayISO(), time: '07:00', durationMin: '60', type: 'training' as SessionDoc['type'], location: '', notes: '' }

/** Agenda do profissional: sessões da semana, nova sessão e marcação de presença. */
export function PersonalAgenda() {
  const { user } = useAuth()
  const token = user?.accessToken
  const { people, error: peopleError, who } = useLinkedPeople()
  const [week, setWeek] = useState(() => mondayOf(new Date()))
  const [sessions, setSessions] = useState<SessionDoc[] | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(week)
        d.setDate(d.getDate() + i)
        return d
      }),
    [week],
  )

  const load = useCallback(async () => {
    if (!token || !user?.id) return
    const end = new Date(week)
    end.setDate(end.getDate() + 7)
    try {
      const res = await getJson<{ docs: SessionDoc[] }>(
        `${SESSIONS_API}${qs({
          'where[and][0][professional][equals]': user.id,
          // Datas salvas ao meio-dia UTC: a janela usa o dia inteiro em UTC
          'where[and][1][date][greater_than_equal]': `${ymd(week)}T00:00:00.000Z`,
          'where[and][2][date][less_than]': `${ymd(end)}T00:00:00.000Z`,
          depth: 1,
          limit: 200,
          sort: 'date',
        })}`,
        token,
      )
      setSessions(res.docs)
    } catch (err) {
      setSessions([])
      toast.error(errorText(err, 'Não foi possível carregar a agenda.'))
    }
  }, [token, user?.id, week])

  useEffect(() => {
    setSessions(null)
    void load()
  }, [load])

  const byDay = useMemo(() => {
    const map = new Map<string, SessionDoc[]>()
    for (const s of sessions ?? []) {
      const k = dayKey(s.date)
      map.set(k, [...(map.get(k) ?? []), s].sort((a, b) => (a.time || '').localeCompare(b.time || '')))
    }
    return map
  }, [sessions])

  const studentName = (s: SessionDoc) =>
    (typeof s.student === 'object' && s.student?.name) || people?.find((p) => p.userId === String(typeof s.student === 'object' ? s.student.id : s.student))?.name || who

  const save = async () => {
    if (!token) return
    if (!form.student) return toast.error(`Escolha o ${who}.`)
    if (!form.date) return toast.error('Informe a data.')
    if (form.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)) return toast.error('Horário no formato 07:30.')
    setSaving(true)
    try {
      await createSession(
        {
          student: form.student,
          date: dateToApi(form.date),
          time: form.time || undefined,
          durationMin: Math.min(240, Math.max(15, Number(form.durationMin) || 60)),
          type: form.type,
          location: form.location.trim() || undefined,
          notes: form.notes.trim() || undefined,
          status: 'scheduled',
        },
        token,
      )
      toast.success('Sessão agendada.')
      const target = mondayOf(new Date(`${form.date}T12:00:00`))
      setForm({ ...EMPTY, student: form.student })
      setShowForm(false)
      if (target.getTime() !== week.getTime()) setWeek(target)
      else await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível agendar.'))
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (s: SessionDoc, status: SessionDoc['status']) => {
    if (!token) return
    try {
      await updateSession(s.id, { status }, token)
      setSessions((list) => list?.map((x) => (x.id === s.id ? { ...x, status } : x)) ?? null)
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível atualizar.'))
    }
  }

  const remove = async (s: SessionDoc) => {
    if (!token || !window.confirm('Excluir esta sessão da agenda?')) return
    try {
      await deleteJson(`${SESSIONS_API}/${s.id}`, token)
      setSessions((list) => list?.filter((x) => x.id !== s.id) ?? null)
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível excluir.'))
    }
  }

  const today = ymd(new Date())
  const total = sessions?.filter((s) => s.status !== 'cancelled').length ?? 0
  const done = sessions?.filter((s) => s.status === 'completed').length ?? 0
  const rangeLabel = `${days[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${days[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`

  return (
    <Page wide>
      <PageHeader
        kicker="Agenda e sessões"
        title="Sua semana"
        accent="de atendimentos."
        lead="Agende treinos, avaliações e retornos. Marque como concluída depois do atendimento."
        action={
          people && people.length > 0 ? (
            <CTAButton type="button" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> Nova sessão
            </CTAButton>
          ) : undefined
        }
      />
      {peopleError && <ErrorBanner>{peopleError}</ErrorBanner>}
      {people && people.length === 0 && <NoPeople who={who} />}

      {showForm && people && people.length > 0 && (
        <Card className="mb-6 p-5 sm:p-6">
          <SectionTitle icon={Calendar}>Nova sessão</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <p className="cp-mono mb-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">{who}</p>
              <PersonSelect people={people} value={form.student} onChange={(v) => setForm((f) => ({ ...f, student: v }))} who={who} />
            </div>
            <Field label="Data" type="date" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} />
            <Field label="Horário" type="time" value={form.time} onChange={(v) => setForm((f) => ({ ...f, time: v }))} />
            <Field label="Duração" unit="min" type="number" inputMode="numeric" value={form.durationMin} onChange={(v) => setForm((f) => ({ ...f, durationMin: v }))} />
            <Field label="Local" placeholder="Academia, online…" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} className="sm:col-span-3" />
          </div>
          <div className="mt-4">
            <Choice
              label="Tipo"
              value={form.type}
              onChange={(v) => setForm((f) => ({ ...f, type: v }))}
              options={(Object.keys(TYPE_LABEL) as SessionDoc['type'][]).map((v) => ({ value: v, label: TYPE_LABEL[v] }))}
            />
          </div>
          <div className="mt-4">
            <TextArea label="Observações" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} rows={2} />
          </div>
          <div className="mt-5 flex gap-3">
            <CTAButton type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Salvando…' : 'Agendar'}
            </CTAButton>
            <button type="button" onClick={() => setShowForm(false)} className="cp-btn-ghost">
              Cancelar
            </button>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Semana anterior" onClick={() => setWeek((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() - 7))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line-2)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="cp-display min-w-[150px] text-center text-[18px] font-bold">{rangeLabel}</p>
          <button type="button" aria-label="Próxima semana" onClick={() => setWeek((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line-2)]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setWeek(mondayOf(new Date()))} className="cp-btn-ghost h-10 px-4 text-[13px]">
            Hoje
          </button>
        </div>
        <p className="text-[13.5px] text-[var(--muted)]">
          {total} sessão(ões) na semana · {done} concluída(s)
        </p>
      </div>

      {sessions === null ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {days.map((d) => {
            const k = ymd(d)
            const list = byDay.get(k) ?? []
            return (
              <Card key={k} className={`min-h-[140px] p-4 ${k === today ? 'border-white/40' : ''}`}>
                <p className="cp-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' })} · {d.getDate()}
                </p>
                {list.length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-[var(--dim)]">Livre</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {list.map((s) => (
                      <li key={s.id} className={`rounded-xl border border-[var(--line)] p-3 ${s.status === 'cancelled' ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold">
                            <Clock className="h-3.5 w-3.5" /> {s.time || '—'}
                          </span>
                          <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                        </div>
                        <p className="mt-1.5 truncate text-[14px] font-semibold">{studentName(s)}</p>
                        <p className="text-[12px] text-[var(--dim)]">
                          {TYPE_LABEL[s.type]}
                          {s.durationMin ? ` · ${s.durationMin} min` : ''}
                        </p>
                        {s.location && (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-[var(--dim)]">
                            <MapPin className="h-3 w-3" /> {s.location}
                          </p>
                        )}
                        {s.notes && <p className="mt-1 text-[12px] text-[var(--muted)]">{s.notes}</p>}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.status !== 'completed' && (
                            <button type="button" onClick={() => void setStatus(s, 'completed')} className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--line-2)] px-2.5 text-[11.5px] hover:text-white">
                              <Check className="h-3 w-3" /> Concluir
                            </button>
                          )}
                          {s.status === 'scheduled' && (
                            <button type="button" onClick={() => void setStatus(s, 'cancelled')} className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--line-2)] px-2.5 text-[11.5px] text-[var(--muted)] hover:text-white">
                              <X className="h-3 w-3" /> Cancelar
                            </button>
                          )}
                          {s.status !== 'scheduled' && (
                            <button type="button" onClick={() => void setStatus(s, 'scheduled')} className="h-7 rounded-full px-2 text-[11.5px] text-[var(--dim)] hover:text-white">
                              Reabrir
                            </button>
                          )}
                          <button type="button" onClick={() => void remove(s)} className="h-7 rounded-full px-2 text-[11.5px] text-[var(--dim)] hover:text-white">
                            Excluir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </Page>
  )
}
