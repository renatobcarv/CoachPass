import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createAssessment,
  fetchAssessmentsForStudent,
  fetchLinkedPeople,
  type AssessmentDoc,
  type LinkedPerson,
} from '../../lib/professionalApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const input =
  'w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white'

export function PersonalAvaliacao() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [students, setStudents] = useState<LinkedPerson[]>([])
  const [student, setStudent] = useState(studentId || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [weightKg, setWeightKg] = useState('')
  const [bodyFatPercent, setBodyFatPercent] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<AssessmentDoc[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.accessToken || !user.id) return
    fetchLinkedPeople(user.id, 'personal', user.accessToken, 'active')
      .then((rows) => {
        setStudents(rows)
        if (!student && rows[0]) setStudent(rows[0].userId)
      })
      .catch(() => toast.error('Não foi possível carregar alunos.'))
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    if (!user?.accessToken || !student) {
      setItems([])
      return
    }
    fetchAssessmentsForStudent(student, user.accessToken, 'physical')
      .then(setItems)
      .catch(() => setItems([]))
  }, [student, user?.accessToken])

  const handleSave = async () => {
    if (!user?.accessToken || !student) {
      toast.error('Selecione um aluno.')
      return
    }
    setSaving(true)
    try {
      await createAssessment(
        {
          kind: 'physical',
          student,
          date: new Date(date).toISOString(),
          weightKg: weightKg ? Number(weightKg) : undefined,
          bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
          notes: notes.trim() || undefined,
        },
        user.accessToken,
      )
      toast.success('Avaliação registrada.')
      const next = await fetchAssessmentsForStudent(student, user.accessToken, 'physical')
      setItems(next)
      setNotes('')
    } catch (err) {
      toast.error(
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : 'Não foi possível salvar a avaliação.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Avaliação física</h1>
        <p className="text-sm dark:text-zinc-400 mt-1">Registros persistidos para o aluno vinculado.</p>
      </div>
      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-3">
        <select className={input} value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Selecione o aluno</option>
          {students.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name}
            </option>
          ))}
        </select>
        <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className={input} type="number" placeholder="Peso (kg)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        <input className={input} type="number" placeholder="% gordura" value={bodyFatPercent} onChange={(e) => setBodyFatPercent(e.target.value)} />
        <textarea className={input} rows={3} placeholder="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
          >
            {saving ? 'Salvando…' : 'Salvar avaliação'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl text-sm border dark:border-zinc-700">
            Voltar
          </button>
        </div>
      </div>
      <section className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5">
        <h2 className="font-semibold dark:text-white mb-3">Histórico</h2>
        {items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhuma avaliação ainda.</p>
        ) : (
          <ul className="space-y-2 text-sm dark:text-zinc-200">
            {items.map((item) => (
              <li key={item.id}>
                {new Date(item.date).toLocaleDateString('pt-BR')}
                {item.weightKg != null ? ` · ${item.weightKg} kg` : ''}
                {item.bodyFatPercent != null ? ` · ${item.bodyFatPercent}%` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
