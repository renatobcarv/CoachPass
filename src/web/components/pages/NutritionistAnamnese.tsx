import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Activity, Check, ClipboardList, Heart, Moon, Save, Target, User, Utensils } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { createAnamnese, fetchAnamnesesForStudent, updateAnamnese, type AnamneseDoc } from '../../lib/professionalApi'
import { CTAButton } from '../brand/Brand'
import { Badge, Card, EmptyState, ErrorBanner, Page, PageHeader, Skeleton } from '../student/ui'
import { FieldLabel } from '../pro/ui'
import { NoPeople, PersonSelect, errorText, fmtDate, useLinkedPeople } from '../pro/records'

type Q = { id: string; label: string; type: 'text' | 'textarea' | 'select' | 'radio' | 'number'; options?: string[]; placeholder?: string }
type Section = { id: string; title: string; icon: React.ElementType; fields: Q[] }

const SECTIONS: Section[] = [
  {
    id: 'personal',
    title: 'Dados pessoais',
    icon: User,
    fields: [
      { id: 'profession', label: 'Profissão', type: 'text', placeholder: 'Ex.: professora' },
      { id: 'marital', label: 'Estado civil', type: 'select', options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'] },
      { id: 'education', label: 'Escolaridade', type: 'select', options: ['Fundamental', 'Médio', 'Superior incompleto', 'Superior completo', 'Pós-graduação'] },
      { id: 'household', label: 'Quem mora com o paciente / quem cozinha', type: 'text' },
    ],
  },
  {
    id: 'health',
    title: 'Histórico de saúde',
    icon: Heart,
    fields: [
      { id: 'pathologies', label: 'Patologias atuais', type: 'textarea', placeholder: 'Ex.: diabetes tipo 2, hipertensão, hipotireoidismo…' },
      { id: 'medications', label: 'Medicamentos em uso', type: 'textarea', placeholder: 'Medicamentos e dosagens' },
      { id: 'supplements', label: 'Suplementos', type: 'textarea', placeholder: 'Ex.: whey 30 g/dia, vitamina D 2000 UI…' },
      { id: 'surgeries', label: 'Cirurgias anteriores', type: 'textarea' },
      { id: 'family_history', label: 'Histórico familiar', type: 'textarea', placeholder: 'Doenças frequentes na família' },
      { id: 'blood_pressure', label: 'Pressão arterial (mmHg)', type: 'text', placeholder: 'Ex.: 120/80' },
      { id: 'fasting_glucose', label: 'Glicemia em jejum (mg/dL)', type: 'number' },
      { id: 'cholesterol', label: 'Colesterol total (mg/dL)', type: 'number' },
    ],
  },
  {
    id: 'eating',
    title: 'Hábitos alimentares',
    icon: Utensils,
    fields: [
      { id: 'meals_per_day', label: 'Refeições por dia', type: 'select', options: ['1-2 refeições', '3 refeições', '4-5 refeições', '6 ou mais'] },
      { id: 'appetite', label: 'Apetite', type: 'radio', options: ['Diminuído', 'Normal', 'Aumentado', 'Compulsivo'] },
      { id: 'water_intake', label: 'Água por dia', type: 'select', options: ['Menos de 1 L', '1 a 1,5 L', '2 L', 'Mais de 2 L'] },
      { id: 'allergies', label: 'Alergias alimentares', type: 'textarea' },
      { id: 'intolerances', label: 'Intolerâncias', type: 'textarea', placeholder: 'Ex.: lactose, glúten…' },
      { id: 'food_aversions', label: 'Alimentos que não gosta', type: 'textarea' },
      { id: 'preferred_foods', label: 'Alimentos preferidos', type: 'textarea' },
      { id: 'restrictive_diet', label: 'Segue alguma dieta?', type: 'radio', options: ['Não', 'Vegetariana', 'Vegana', 'Low carb', 'Cetogênica', 'Outra'] },
      { id: 'alcohol', label: 'Álcool', type: 'select', options: ['Não consome', 'Raramente', 'Fins de semana', 'Semanalmente', 'Diariamente'] },
      { id: 'smoking', label: 'Tabagismo', type: 'radio', options: ['Não fumante', 'Ex-fumante', 'Ocasional', 'Regular'] },
    ],
  },
  {
    id: 'activity',
    title: 'Atividade física',
    icon: Activity,
    fields: [
      { id: 'exercises', label: 'Pratica exercícios?', type: 'radio', options: ['Não', 'Aeróbico', 'Musculação', 'Ambos'] },
      { id: 'exercise_frequency', label: 'Frequência semanal', type: 'select', options: ['Não pratica', '1-2x', '3-4x', '5-6x', 'Todos os dias'] },
      { id: 'exercise_duration', label: 'Duração das sessões', type: 'select', options: ['30 min', '45 min', '1 hora', 'Mais de 1 hora'] },
      { id: 'activity_level', label: 'Nível de atividade', type: 'select', options: ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'] },
      { id: 'work_type', label: 'Trabalho', type: 'radio', options: ['Sentado', 'Em pé', 'Esforço moderado', 'Esforço intenso'] },
    ],
  },
  {
    id: 'life',
    title: 'Sono e rotina',
    icon: Moon,
    fields: [
      { id: 'sleep_hours', label: 'Horas de sono', type: 'select', options: ['Menos de 5h', '5-6h', '6-7h', '7-8h', 'Mais de 8h'] },
      { id: 'sleep_quality', label: 'Qualidade do sono', type: 'radio', options: ['Ruim', 'Regular', 'Boa', 'Ótima'] },
      { id: 'stress_level', label: 'Estresse', type: 'radio', options: ['Baixo', 'Moderado', 'Alto', 'Muito alto'] },
      { id: 'bowel_habits', label: 'Hábito intestinal', type: 'select', options: ['Diário normal', 'Constipado', 'Diarreia frequente', 'Irregular'] },
      { id: 'energy_level', label: 'Energia no dia a dia', type: 'radio', options: ['Muito baixa', 'Baixa', 'Normal', 'Alta'] },
    ],
  },
  {
    id: 'goals',
    title: 'Objetivos',
    icon: Target,
    fields: [
      { id: 'main_goal', label: 'Objetivo principal', type: 'select', options: ['Emagrecimento', 'Ganho de massa muscular', 'Manutenção do peso', 'Saúde e bem-estar', 'Controle de patologia', 'Performance esportiva', 'Outro'] },
      { id: 'goal_weight', label: 'Peso desejado (kg)', type: 'number' },
      { id: 'motivation', label: 'Motivação', type: 'textarea', placeholder: 'O que motivou a buscar acompanhamento?' },
      { id: 'previous_diets', label: 'Dietas anteriores', type: 'textarea' },
      { id: 'expectations', label: 'Expectativas', type: 'textarea' },
    ],
  },
]

type Answers = Record<string, string>
const asAnswers = (v: unknown): Answers => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Answers) : {})

/** Anamnese nutricional por etapas. Salva como rascunho e conclui quando terminar. */
export function NutritionistAnamnese() {
  const { user } = useAuth()
  const token = user?.accessToken
  const navigate = useNavigate()
  const { patientId = '' } = useParams()
  const { people, error: peopleError } = useLinkedPeople()
  const [studentId, setStudentId] = useState(patientId)
  const [history, setHistory] = useState<AnamneseDoc[] | null>(null)
  const [docId, setDocId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
  const [active, setActive] = useState(SECTIONS[0].id)
  const [saving, setSaving] = useState<'draft' | 'completed' | null>(null)

  useEffect(() => setStudentId(patientId), [patientId])

  const load = useCallback(async () => {
    if (!token || !studentId) return
    setHistory(null)
    try {
      const docs = await fetchAnamnesesForStudent(studentId, token)
      setHistory(docs)
      // Continua o rascunho aberto; senão começa uma nova a partir da última concluída
      const draft = docs.find((d) => d.status === 'draft')
      const last = docs.find((d) => d.status === 'completed')
      setDocId(draft?.id ?? null)
      setAnswers(asAnswers(draft?.answers ?? last?.answers))
    } catch (err) {
      setHistory([])
      toast.error(errorText(err, 'Não foi possível carregar a anamnese.'))
    }
  }, [token, studentId])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (status: 'draft' | 'completed') => {
    if (!token || !studentId) return
    setSaving(status)
    try {
      const body = {
        student: studentId,
        answers,
        status,
        ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
      }
      const doc = docId ? await updateAnamnese(docId, body, token) : await createAnamnese(body, token)
      if (status === 'completed') {
        toast.success('Anamnese concluída.')
        await load()
      } else {
        setDocId(String((doc as { id?: string; doc?: { id: string } }).doc?.id ?? doc.id))
        toast.success('Rascunho salvo.')
      }
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível salvar.'))
    } finally {
      setSaving(null)
    }
  }

  const pick = (id: string) => {
    setStudentId(id)
    navigate(id ? `/nutritionist/anamnese/${id}` : '/nutritionist/anamnese', { replace: true })
  }

  const idx = SECTIONS.findIndex((s) => s.id === active)
  const section = SECTIONS[idx]
  const filled = (s: Section) => s.fields.filter((f) => (answers[f.id] ?? '').trim()).length
  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }))

  return (
    <Page wide>
      <PageHeader
        kicker="Anamnese nutricional"
        title="Conheça o paciente"
        accent="antes do plano."
        lead="Saúde, hábitos, rotina e objetivos, por etapas. Salve como rascunho e conclua quando terminar."
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
              <EmptyState icon={ClipboardList} title="Escolha um paciente">
                A anamnese fica salva na ficha dele e aparece nas próximas consultas.
              </EmptyState>
            </div>
          ) : history === null ? (
            <Skeleton className="mt-6 h-72" />
          ) : (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[280px_1fr]">
              <div className="space-y-4">
                <Card className="p-3">
                  <ul>
                    {SECTIONS.map((s) => {
                      const Icon = s.icon
                      const n = filled(s)
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => setActive(s.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${
                              active === s.id ? 'bg-white/[0.07] text-white' : 'text-[var(--muted)] hover:text-white'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{s.title}</span>
                            {n === s.fields.length ? (
                              <Check className="h-4 w-4 text-[var(--teal)]" />
                            ) : (
                              <span className="cp-mono text-[11px] text-[var(--dim)]">
                                {n}/{s.fields.length}
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
                <Card className="p-4">
                  <p className="cp-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Histórico</p>
                  {history.length === 0 ? (
                    <p className="mt-2 text-[13px] text-[var(--dim)]">Primeira anamnese deste paciente.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {history.map((h) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setDocId(h.id)
                              setAnswers(asAnswers(h.answers))
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-white/[0.04] ${docId === h.id ? 'text-white' : 'text-[var(--muted)]'}`}
                          >
                            <span>{h.status === 'completed' ? fmtDate(h.completedAt) : 'Rascunho'}</span>
                            <Badge tone={h.status === 'completed' ? 'teal' : 'amber'}>{h.status === 'completed' ? 'Concluída' : 'Aberta'}</Badge>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {docId && (
                    <button
                      type="button"
                      onClick={() => setDocId(null)}
                      className="mt-3 text-[12.5px] text-[var(--muted)] underline-offset-2 hover:text-white hover:underline"
                    >
                      Começar uma nova (copia as respostas atuais)
                    </button>
                  )}
                </Card>
              </div>

              <Card className="p-5 sm:p-7">
                <h2 className="cp-display text-[24px] font-bold">{section.title}</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {section.fields.map((q) => (
                    <div key={q.id} className={q.type === 'textarea' || q.type === 'radio' ? 'md:col-span-2' : ''}>
                      <FieldLabel htmlFor={`an-${q.id}`}>{q.label}</FieldLabel>
                      {q.type === 'textarea' ? (
                        <textarea id={`an-${q.id}`} rows={2} maxLength={2000} value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} placeholder={q.placeholder} className="cp-field" />
                      ) : q.type === 'select' ? (
                        <select id={`an-${q.id}`} value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} className="cp-field !h-12 !pl-4">
                          <option value="">—</option>
                          {q.options?.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : q.type === 'radio' ? (
                        <div role="radiogroup" aria-label={q.label} className="flex flex-wrap gap-2">
                          {q.options?.map((o) => (
                            <button
                              key={o}
                              type="button"
                              role="radio"
                              aria-checked={answers[q.id] === o}
                              onClick={() => set(q.id, answers[q.id] === o ? '' : o)}
                              className={`h-10 rounded-full border px-4 text-[13.5px] ${answers[q.id] === o ? 'border-transparent bg-white text-black' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'}`}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          id={`an-${q.id}`}
                          inputMode={q.type === 'number' ? 'decimal' : undefined}
                          value={answers[q.id] ?? ''}
                          maxLength={200}
                          onChange={(e) => set(q.id, q.type === 'number' ? e.target.value.replace(/[^\d.,]/g, '') : e.target.value)}
                          placeholder={q.placeholder}
                          className="cp-field !h-12 !pl-4"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {idx < SECTIONS.length - 1 ? (
                    <CTAButton type="button" onClick={() => setActive(SECTIONS[idx + 1].id)}>
                      Próxima: {SECTIONS[idx + 1].title}
                    </CTAButton>
                  ) : (
                    <CTAButton type="button" onClick={() => void save('completed')} disabled={saving !== null}>
                      <Check className="h-4 w-4" /> {saving === 'completed' ? 'Concluindo…' : 'Concluir anamnese'}
                    </CTAButton>
                  )}
                  <button type="button" onClick={() => void save('draft')} disabled={saving !== null} className="cp-btn-ghost">
                    <Save className="h-4 w-4" /> {saving === 'draft' ? 'Salvando…' : 'Salvar rascunho'}
                  </button>
                  {idx === SECTIONS.length - 1 ? null : (
                    <button type="button" onClick={() => void save('completed')} disabled={saving !== null} className="text-[13px] text-[var(--muted)] underline-offset-2 hover:text-white hover:underline">
                      Concluir agora
                    </button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </Page>
  )
}
