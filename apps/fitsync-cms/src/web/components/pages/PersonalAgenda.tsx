import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createSession,
  fetchLinkedPeople,
  fetchSessions,
  updateSession,
  type LinkedPerson,
  type SessionDoc,
} from '../../lib/professionalApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const input =
  'w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white'

const typeLabel: Record<SessionDoc['type'], string> = {
  training: 'Treino',
  assessment: 'Avaliação',
  consultation: 'Consulta',
  followup: 'Retorno',
}

export function PersonalAgenda() {
  const { user } = useAuth()
  const [students, setStudents] = useState<LinkedPerson[]>([])
  const [sessions, setSessions] = useState<SessionDoc[]>([])
  const [student, setStudent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('08:00')
  const [type, setType] = useState<SessionDoc['type']>('training')
  const [saving, setSaving] = useState(false)

  const reload = async () => {
    if (!user?.accessToken || !user.id) return
    const [people, docs] = await Promise.all([
      fetchLinkedPeople(user.id, 'personal', user.accessToken, 'active'),
      fetchSessions(user.id, user.accessToken),
    ])
    setStudents(people)
    setSessions(docs)
    if (!student && people[0]) setStudent(people[0].userId)
  }

  useEffect(() => {
    reload().catch(() => toast.error('Não foi possível carregar a agenda.'))
  }, [user?.accessToken, user?.id])

  const handleCreate = async () => {
    if (!user?.accessToken || !student) {
      toast.error('Selecione um aluno.')
      return
    }
    setSaving(true)
    try {
      await createSession(
        { student, date: new Date(date).toISOString(), time, type, status: 'scheduled' },
        user.accessToken,
      )
      toast.success('Sessão agendada.')
      await reload()
    } catch (err) {
      toast.error(
        err instanceof PayloadApiError ? extractPayloadMessage(err.data) || err.message : 'Falha ao agendar.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (id: string, status: SessionDoc['status']) => {
    if (!user?.accessToken) return
    try {
      await updateSession(id, { status }, user.accessToken)
      await reload()
    } catch {
      toast.error('Não foi possível atualizar a sessão.')
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Agenda e sessões</h1>
        <p className="text-sm dark:text-zinc-400 mt-1">Horários reais do vínculo ativo.</p>
      </div>
      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-3">
        <select className={input} value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">Aluno</option>
          {students.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name}
            </option>
          ))}
        </select>
        <div className="grid sm:grid-cols-3 gap-2">
          <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <select className={input} value={type} onChange={(e) => setType(e.target.value as SessionDoc['type'])}>
            {Object.entries(typeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleCreate()}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
        >
          {saving ? 'Salvando…' : 'Agendar'}
        </button>
      </div>
      <section className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white overflow-hidden">
        {sessions.length === 0 ? (
          <p className="p-5 text-sm dark:text-zinc-400">Nenhuma sessão.</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 border-b last:border-b-0 dark:border-zinc-800">
              <div className="flex-1 text-sm dark:text-white">
                {new Date(session.date).toLocaleDateString('pt-BR')} {session.time || ''}
                <span className="text-xs dark:text-zinc-400"> · {typeLabel[session.type]} · {session.status}</span>
              </div>
              {session.status === 'scheduled' && (
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => void handleStatus(session.id, 'completed')} className="underline">
                    Concluir
                  </button>
                  <button type="button" onClick={() => void handleStatus(session.id, 'cancelled')} className="text-red-500 underline">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
