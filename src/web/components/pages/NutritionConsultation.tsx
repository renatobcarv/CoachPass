import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ClipboardList, Save, Stethoscope, Trash2, Utensils } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { ASSESSMENTS_API, deleteJson } from '@/lib/cms'
import { createAssessment, fetchAssessmentsForStudent, type AssessmentDoc } from '../../lib/professionalApi'
import { CTAButton } from '../brand/Brand'
import { Card, EmptyState, ErrorBanner, Page, PageHeader, SectionTitle, Skeleton } from '../student/ui'
import { Delta, Field, NoPeople, PersonSelect, Score, TextArea, dateToApi, errorText, fmtDate, fmtNum, num, todayISO, useLinkedPeople } from '../pro/records'

const EMPTY = { date: todayISO(), weightKg: '', bodyFatPercent: '', waist: '', hip: '', notes: '', nextDate: '' }

/** Consulta nutricional: medidas do dia, adesão, energia e sono, conduta e retorno. */
export function NutritionConsultation() {
  const { user } = useAuth()
  const token = user?.accessToken
  const navigate = useNavigate()
  const { patientId = '' } = useParams()
  const { people, error: peopleError } = useLinkedPeople()
  const [studentId, setStudentId] = useState(patientId)
  const [history, setHistory] = useState<AssessmentDoc[] | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [scores, setScores] = useState<{ adherence: number | null; energy: number | null; sleep: number | null }>({ adherence: null, energy: null, sleep: null })
  const [saving, setSaving] = useState(false)

  useEffect(() => setStudentId(patientId), [patientId])

  const load = useCallback(async () => {
    if (!token || !studentId) return
    setHistory(null)
    try {
      setHistory(await fetchAssessmentsForStudent(studentId, token, 'consultation'))
    } catch (err) {
      setHistory([])
      toast.error(errorText(err, 'Não foi possível carregar as consultas.'))
    }
  }, [token, studentId])

  useEffect(() => {
    void load()
  }, [load])

  const pick = (id: string) => {
    setStudentId(id)
    navigate(id ? `/nutritionist/consulta/${id}` : '/nutritionist/consulta', { replace: true })
  }
  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!token || !studentId) return
    if (!form.date) return toast.error('Informe a data da consulta.')
    setSaving(true)
    try {
      await createAssessment(
        {
          kind: 'consultation',
          student: studentId,
          date: dateToApi(form.date),
          weightKg: num(form.weightKg),
          bodyFatPercent: num(form.bodyFatPercent),
          circumferences: { waist: num(form.waist), hip: num(form.hip) },
          adherenceScore: scores.adherence ?? undefined,
          energyScore: scores.energy ?? undefined,
          sleepScore: scores.sleep ?? undefined,
          notes: form.notes.trim() || undefined,
          nextDate: dateToApi(form.nextDate),
        },
        token,
      )
      toast.success('Consulta registrada.')
      setForm({ ...EMPTY, date: todayISO() })
      setScores({ adherence: null, energy: null, sleep: null })
      await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível salvar a consulta.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!token || !window.confirm('Excluir esta consulta?')) return
    try {
      await deleteJson(`${ASSESSMENTS_API}/${id}`, token)
      await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível excluir.'))
    }
  }

  return (
    <Page wide>
      <PageHeader
        kicker="Consulta nutricional"
        title="Registro do"
        accent="atendimento."
        lead="Peso e medidas do dia, como o paciente seguiu o plano e a conduta para o retorno."
        action={
          studentId ? (
            <div className="flex flex-wrap gap-2">
              <Link to={`/nutritionist/anamnese/${studentId}`} className="cp-btn-ghost">
                <ClipboardList className="h-4 w-4" /> Anamnese
              </Link>
              <Link to={`/nutritionist/criar-plano/${studentId}`} className="cp-btn-ghost">
                <Utensils className="h-4 w-4" /> Plano alimentar
              </Link>
            </div>
          ) : undefined
        }
      />
      {peopleError && <ErrorBanner>{peopleError}</ErrorBanner>}
      {people === null ? (
        <Skeleton className="h-14" />
      ) : people.length === 0 ? (
        <NoPeople who="paciente" />
      ) : (
        <>
          <div className="max-w-md">
            <PersonSelect people={people} value={studentId} onChange={pick} who="paciente" />
          </div>
          {!studentId ? (
            <div className="mt-6">
              <EmptyState icon={Stethoscope} title="Escolha um paciente">
                Selecione acima para registrar a consulta de hoje e ver as anteriores.
              </EmptyState>
            </div>
          ) : (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card className="p-5 sm:p-6">
                <SectionTitle icon={Stethoscope}>Consulta de hoje</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Data" type="date" value={form.date} onChange={set('date')} />
                  <Field label="Peso" unit="kg" type="number" value={form.weightKg} onChange={set('weightKg')} />
                  <Field label="Gordura" unit="%" type="number" value={form.bodyFatPercent} onChange={set('bodyFatPercent')} />
                  <Field label="Cintura" unit="cm" type="number" value={form.waist} onChange={set('waist')} />
                  <Field label="Quadril" unit="cm" type="number" value={form.hip} onChange={set('hip')} />
                  <Field label="Retorno" type="date" value={form.nextDate} onChange={set('nextDate')} />
                </div>
                <div className="mt-6 space-y-5">
                  <Score label="Adesão ao plano" value={scores.adherence} onChange={(v) => setScores((s) => ({ ...s, adherence: v }))} />
                  <Score label="Energia" value={scores.energy} onChange={(v) => setScores((s) => ({ ...s, energy: v }))} />
                  <Score label="Sono" value={scores.sleep} onChange={(v) => setScores((s) => ({ ...s, sleep: v }))} />
                  <TextArea label="Anotações e conduta" rows={4} value={form.notes} onChange={set('notes')} placeholder="Queixas, ajustes no plano, orientações para o retorno…" />
                </div>
                <div className="mt-6">
                  <CTAButton type="button" onClick={() => void save()} disabled={saving}>
                    <Save className="h-4 w-4" /> {saving ? 'Salvando…' : 'Salvar consulta'}
                  </CTAButton>
                </div>
              </Card>

              <div>
                <SectionTitle>Consultas anteriores</SectionTitle>
                {history === null ? (
                  <Skeleton className="h-40" />
                ) : history.length === 0 ? (
                  <EmptyState icon={Stethoscope} title="Primeira consulta">
                    As próximas mostram a variação de peso e medidas em relação a esta.
                  </EmptyState>
                ) : (
                  <ul className="space-y-3">
                    {history.map((a, i) => {
                      const prev = history[i + 1]
                      return (
                        <li key={a.id}>
                          <Card className="p-5">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{fmtDate(a.date)}</p>
                              <button type="button" aria-label="Excluir consulta" onClick={() => void remove(a.id)} className="grid h-8 w-8 place-items-center rounded-full text-[var(--dim)] hover:text-white">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                              {(
                                [
                                  ['Peso', a.weightKg, prev?.weightKg, ' kg'],
                                  ['Gordura', a.bodyFatPercent, prev?.bodyFatPercent, '%'],
                                  ['Cintura', a.circumferences?.waist, prev?.circumferences?.waist, ' cm'],
                                  ['Quadril', a.circumferences?.hip, prev?.circumferences?.hip, ' cm'],
                                  ['Adesão', a.adherenceScore, prev?.adherenceScore, '/10'],
                                  ['Energia', a.energyScore, prev?.energyScore, '/10'],
                                  ['Sono', a.sleepScore, prev?.sleepScore, '/10'],
                                ] as [string, number | null | undefined, number | null | undefined, string][]
                              )
                                .filter(([, v]) => v != null)
                                .map(([label, v, pv, unit]) => (
                                  <div key={label}>
                                    <dt className="text-[12px] text-[var(--dim)]">{label}</dt>
                                    <dd className="text-[14.5px] font-semibold">
                                      {fmtNum(v)}
                                      {unit} <Delta now={v} before={pv} />
                                    </dd>
                                  </div>
                                ))}
                            </dl>
                            {a.notes && <p className="mt-3 whitespace-pre-line text-[13.5px] text-[var(--muted)]">{a.notes}</p>}
                            {a.nextDate && <p className="mt-2 text-[12.5px] text-[var(--dim)]">Retorno: {fmtDate(a.nextDate)}</p>}
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
