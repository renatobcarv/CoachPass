import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createAnamnese,
  fetchAnamnesesForStudent,
  fetchLinkedPeople,
  updateAnamnese,
  type AnamneseDoc,
  type LinkedPerson,
} from '../../lib/professionalApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const input =
  'w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white'

export function NutritionistAnamnese() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState<LinkedPerson[]>([])
  const [student, setStudent] = useState(patientId || '')
  const [history, setHistory] = useState('')
  const [habits, setHabits] = useState('')
  const [goals, setGoals] = useState('')
  const [items, setItems] = useState<AnamneseDoc[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.accessToken || !user.id) return
    fetchLinkedPeople(user.id, 'nutritionist', user.accessToken, 'active')
      .then((rows) => {
        setPatients(rows)
        if (!student && rows[0]) setStudent(rows[0].userId)
      })
      .catch(() => toast.error('Não foi possível carregar pacientes.'))
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    if (!user?.accessToken || !student) return
    fetchAnamnesesForStudent(student, user.accessToken)
      .then(setItems)
      .catch(() => setItems([]))
  }, [student, user?.accessToken])

  const handleSave = async (status: 'draft' | 'completed') => {
    if (!user?.accessToken || !student) {
      toast.error('Selecione um paciente.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        student,
        status,
        answers: { history, habits, goals },
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      }
      const existing = items[0]
      if (existing) await updateAnamnese(existing.id, payload, user.accessToken)
      else await createAnamnese(payload, user.accessToken)
      toast.success(status === 'completed' ? 'Anamnese concluída.' : 'Rascunho salvo.')
      setItems(await fetchAnamnesesForStudent(student, user.accessToken))
    } catch (err) {
      toast.error(
        err instanceof PayloadApiError ? extractPayloadMessage(err.data) || err.message : 'Falha ao salvar.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="text-sm dark:text-zinc-400">
        Voltar
      </button>
      <h1 className="text-2xl font-bold dark:text-white">Anamnese</h1>
      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-3">
        <select className={input} value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Paciente</option>
          {patients.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name}
            </option>
          ))}
        </select>
        <textarea className={input} rows={3} placeholder="Histórico clínico e alimentar" value={history} onChange={(e) => setHistory(e.target.value)} />
        <textarea className={input} rows={3} placeholder="Hábitos e rotina" value={habits} onChange={(e) => setHabits(e.target.value)} />
        <textarea className={input} rows={3} placeholder="Objetivos" value={goals} onChange={(e) => setGoals(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave('draft')}
            className="px-4 py-2 rounded-xl text-sm border dark:border-zinc-700"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave('completed')}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
          >
            Concluir
          </button>
        </div>
      </div>
      <section className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhuma anamnese ainda.</p>
        ) : (
          items.map((item) => (
            <p key={item.id} className="text-sm dark:text-zinc-200">
              {item.status === 'completed' ? 'Concluída' : 'Rascunho'}
              {item.completedAt ? ` · ${new Date(item.completedAt).toLocaleDateString('pt-BR')}` : ''}
            </p>
          ))
        )}
      </section>
    </div>
  )
}
