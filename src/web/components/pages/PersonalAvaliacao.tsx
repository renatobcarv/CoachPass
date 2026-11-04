import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ClipboardList, LineChart, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { ASSESSMENTS_API, deleteJson } from '@/lib/cms'
import {
  createAssessment,
  fetchAssessmentsForStudent,
  fetchStudentProfileByUser,
  type AssessmentDoc,
} from '../../lib/professionalApi'
import { CTAButton } from '../brand/Brand'
import { Badge, Card, EmptyState, ErrorBanner, Page, PageHeader, SectionTitle, Skeleton } from '../student/ui'
import { Delta, Field, NoPeople, PersonSelect, TextArea, dateToApi, errorText, fmtDate, fmtNum, num, todayISO, useLinkedPeople } from '../pro/records'

const EMPTY = {
  date: todayISO(),
  weightKg: '',
  bodyFatPercent: '',
  muscleMassKg: '',
  visceralFat: '',
  bmr: '',
  hydrationPercent: '',
  chest: '',
  waist: '',
  hip: '',
  arm: '',
  thigh: '',
  restingHeartRate: '',
  bloodPressure: '',
  notes: '',
  nextDate: '',
}
type Form = typeof EMPTY

/** Avaliação física: registra medidas e composição do aluno e mostra o histórico com a variação. */
export function PersonalAvaliacao() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()
  const routeStudent = params.studentId || params.id || ''
  const { people, error: peopleError } = useLinkedPeople()
  const [studentId, setStudentId] = useState(routeStudent)
  const [history, setHistory] = useState<AssessmentDoc[] | null>(null)
  const [heightCm, setHeightCm] = useState<number | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const token = user?.accessToken

  useEffect(() => setStudentId(routeStudent), [routeStudent])

  const load = useCallback(async () => {
    if (!token || !studentId) return
    setHistory(null)
    try {
      const [docs, profile] = await Promise.all([
        fetchAssessmentsForStudent(studentId, token, 'physical'),
        fetchStudentProfileByUser(studentId, token).catch(() => null),
      ])
      setHistory(docs)
      setHeightCm(profile?.heightCm ?? null)
    } catch (err) {
      setHistory([])
      toast.error(errorText(err, 'Não foi possível carregar as avaliações.'))
    }
  }, [token, studentId])

  useEffect(() => {
    void load()
  }, [load])

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const weight = num(form.weightKg)
  const bmi = weight && heightCm ? weight / (heightCm / 100) ** 2 : null

  const pick = (id: string) => {
    setStudentId(id)
    navigate(id ? `/personal/avaliacao/${id}` : '/personal/avaliacao', { replace: true })
  }

  const save = async () => {
    if (!token || !studentId) return
    const circumferences = {
      chest: num(form.chest),
      waist: num(form.waist),
      hip: num(form.hip),
      arm: num(form.arm),
      thigh: num(form.thigh),
    }
    const body = {
      kind: 'physical',
      student: studentId,
      date: dateToApi(form.date),
      weightKg: num(form.weightKg),
      bodyFatPercent: num(form.bodyFatPercent),
      muscleMassKg: num(form.muscleMassKg),
      visceralFat: num(form.visceralFat),
      bmr: num(form.bmr),
      hydrationPercent: num(form.hydrationPercent),
      circumferences,
      restingHeartRate: num(form.restingHeartRate),
      bloodPressure: form.bloodPressure.trim() || undefined,
      notes: form.notes.trim() || undefined,
      nextDate: dateToApi(form.nextDate),
    }
    const filled = [body.weightKg, body.bodyFatPercent, body.muscleMassKg, ...Object.values(circumferences), body.restingHeartRate].some(
      (v) => v !== undefined,
    )
    if (!form.date) return toast.error('Informe a data da avaliação.')
    if (!filled && !body.notes) return toast.error('Preencha ao menos uma medida.')
    setSaving(true)
    try {
      await createAssessment(body, token)
      toast.success('Avaliação salva.')
      setForm({ ...EMPTY, date: todayISO() })
      await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível salvar a avaliação.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!token || !window.confirm('Excluir esta avaliação?')) return
    try {
      await deleteJson(`${ASSESSMENTS_API}/${id}`, token)
      toast.success('Avaliação excluída.')
      await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível excluir.'))
    }
  }

  const person = useMemo(() => people?.find((p) => p.userId === studentId), [people, studentId])

  return (
    <Page wide>
      <PageHeader
        kicker="Avaliação física"
        title="Medidas e"
        accent="composição."
        lead="Registre peso, composição corporal e circunferências. O histórico mostra a diferença para a avaliação anterior."
        action={
          studentId ? (
            <Link to={`/personal/aluno/${studentId}/evolucao`} className="cp-btn-ghost">
              <LineChart className="h-4 w-4" /> Ver evolução
            </Link>
          ) : undefined
        }
      />
      {peopleError && <ErrorBanner>{peopleError}</ErrorBanner>}
      {people === null ? (
        <Skeleton className="h-14" />
      ) : people.length === 0 ? (
        <NoPeople who="aluno" />
      ) : (
        <>
          <div className="max-w-md">
            <PersonSelect people={people} value={studentId} onChange={pick} who="aluno" />
          </div>

          {!studentId ? (
            <div className="mt-6">
              <EmptyState icon={ClipboardList} title="Escolha um aluno">
                Selecione acima para ver o histórico e registrar uma avaliação nova.
              </EmptyState>
            </div>
          ) : (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card className="p-5 sm:p-6">
                <SectionTitle icon={ClipboardList}>Nova avaliação{person ? ` · ${person.name}` : ''}</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Data" type="date" value={form.date} onChange={set('date')} />
                  <Field label="Peso" unit="kg" type="number" value={form.weightKg} onChange={set('weightKg')} />
                  <Field label="Gordura" unit="%" type="number" value={form.bodyFatPercent} onChange={set('bodyFatPercent')} />
                  <Field label="Massa muscular" unit="kg" type="number" value={form.muscleMassKg} onChange={set('muscleMassKg')} />
                  <Field label="Gordura visceral" unit="nível" type="number" value={form.visceralFat} onChange={set('visceralFat')} />
                  <Field label="Metabolismo basal" unit="kcal" type="number" value={form.bmr} onChange={set('bmr')} />
                  <Field label="Hidratação" unit="%" type="number" value={form.hydrationPercent} onChange={set('hydrationPercent')} />
                  <Field label="FC de repouso" unit="bpm" type="number" value={form.restingHeartRate} onChange={set('restingHeartRate')} />
                  <Field label="Pressão arterial" placeholder="120/80" value={form.bloodPressure} onChange={set('bloodPressure')} />
                </div>
                {bmi && (
                  <p className="mt-3 text-[13px] text-[var(--muted)]">
                    IMC calculado: <strong className="text-white">{fmtNum(bmi)}</strong> (altura {heightCm} cm, do perfil do aluno)
                  </p>
                )}
                <p className="cp-mono mt-6 mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--dim)]">Circunferências (cm)</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  <Field label="Peitoral" type="number" value={form.chest} onChange={set('chest')} />
                  <Field label="Cintura" type="number" value={form.waist} onChange={set('waist')} />
                  <Field label="Quadril" type="number" value={form.hip} onChange={set('hip')} />
                  <Field label="Braço" type="number" value={form.arm} onChange={set('arm')} />
                  <Field label="Coxa" type="number" value={form.thigh} onChange={set('thigh')} />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_200px]">
                  <TextArea label="Observações" value={form.notes} onChange={set('notes')} placeholder="Postura, protocolo usado, condições da medição…" />
                  <Field label="Próxima avaliação" type="date" value={form.nextDate} onChange={set('nextDate')} />
                </div>
                <div className="mt-6">
                  <CTAButton type="button" onClick={() => void save()} disabled={saving}>
                    <Save className="h-4 w-4" /> {saving ? 'Salvando…' : 'Salvar avaliação'}
                  </CTAButton>
                </div>
              </Card>

              <div>
                <SectionTitle>Histórico</SectionTitle>
                {history === null ? (
                  <div className="space-y-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                  </div>
                ) : history.length === 0 ? (
                  <EmptyState icon={ClipboardList} title="Nenhuma avaliação ainda">
                    A primeira avaliação vira a linha de base para comparar as próximas.
                  </EmptyState>
                ) : (
                  <ul className="space-y-3">
                    {history.map((a, i) => {
                      const prev = history[i + 1]
                      const c = a.circumferences || {}
                      const pc = prev?.circumferences || {}
                      const rows: [string, number | null | undefined, number | null | undefined, string][] = [
                        ['Peso', a.weightKg, prev?.weightKg, ' kg'],
                        ['Gordura', a.bodyFatPercent, prev?.bodyFatPercent, '%'],
                        ['Massa muscular', a.muscleMassKg, prev?.muscleMassKg, ' kg'],
                        ['Cintura', c.waist, pc.waist, ' cm'],
                        ['Quadril', c.hip, pc.hip, ' cm'],
                        ['Braço', c.arm, pc.arm, ' cm'],
                        ['Coxa', c.thigh, pc.thigh, ' cm'],
                        ['Peitoral', c.chest, pc.chest, ' cm'],
                        ['FC repouso', a.restingHeartRate, prev?.restingHeartRate, ' bpm'],
                      ]
                      return (
                        <li key={a.id}>
                          <Card className="p-5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold">{fmtDate(a.date)}</p>
                              <div className="flex items-center gap-2">
                                {i === 0 && <Badge tone="teal">Mais recente</Badge>}
                                <button type="button" onClick={() => void remove(a.id)} aria-label="Excluir avaliação" className="grid h-8 w-8 place-items-center rounded-full text-[var(--dim)] hover:text-white">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                              {rows
                                .filter(([, v]) => v != null)
                                .map(([label, v, pv, unit]) => (
                                  <div key={label}>
                                    <dt className="text-[12px] text-[var(--dim)]">{label}</dt>
                                    <dd className="text-[14.5px] font-semibold">
                                      {fmtNum(v)}
                                      {unit} <Delta now={v} before={pv} unit={unit.trim() === '%' ? ' p.p.' : ''} />
                                    </dd>
                                  </div>
                                ))}
                            </dl>
                            {a.bloodPressure && <p className="mt-2 text-[13px] text-[var(--muted)]">Pressão: {a.bloodPressure}</p>}
                            {a.notes && <p className="mt-2 text-[13px] text-[var(--muted)]">{a.notes}</p>}
                            {a.nextDate && <p className="mt-2 text-[12.5px] text-[var(--dim)]">Próxima: {fmtDate(a.nextDate)}</p>}
                          </Card>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Page>
  )
}
