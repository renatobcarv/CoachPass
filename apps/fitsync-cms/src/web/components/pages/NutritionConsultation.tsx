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

export function NutritionConsultation() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState<LinkedPerson[]>([])
  const [student, setStudent] = useState(patientId || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [weightKg, setWeightKg] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<AssessmentDoc[]>([])
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
    fetchAssessmentsForStudent(student, user.accessToken, 'consultation')
      .then(setItems)
      .catch(() => setItems([]))
  }, [student, user?.accessToken])

  const handleSave = async () => {
    if (!user?.accessToken || !student) {
      toast.error('Selecione um paciente.')
      return
    }
    setSaving(true)
    try {
      await createAssessment(
        {
          kind: 'consultation',
          student,
          date: new Date(date).toISOString(),
          weightKg: weightKg ? Number(weightKg) : undefined,
          notes: notes.trim() || undefined,
        },
        user.accessToken,
      )
      toast.success('Consulta registrada.')
      setItems(await fetchAssessmentsForStudent(student, user.accessToken, 'consultation'))
      setNotes('')
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
      <h1 className="text-2xl font-bold dark:text-white">Consulta nutricional</h1>
      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-3">
        <select className={input} value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Paciente</option>
          {patients.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name}
            </option>
          ))}
        </select>
        <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className={input} type="number" placeholder="Peso (kg)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        <textarea className={input} rows={4} placeholder="Anotações da consulta" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
        >
          {saving ? 'Salvando…' : 'Salvar consulta'}
        </button>
      </div>
      <section className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhuma consulta ainda.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="text-sm dark:text-zinc-200">
              {new Date(item.date).toLocaleDateString('pt-BR')}
              {item.weightKg != null ? ` · ${item.weightKg} kg` : ''}
              {item.notes ? ` · ${item.notes}` : ''}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
