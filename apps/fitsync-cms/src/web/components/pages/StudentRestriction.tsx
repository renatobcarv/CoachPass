import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createRestriction,
  fetchRestrictionsForStudent,
  type RestrictionDoc,
} from '../../lib/professionalApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const input =
  'w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white'

const types: { id: RestrictionDoc['type']; label: string }[] = [
  { id: 'injury', label: 'Lesão' },
  { id: 'medical', label: 'Médica' },
  { id: 'dietary', label: 'Alimentar' },
  { id: 'other', label: 'Outra' },
]

export function StudentRestriction() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState<RestrictionDoc[]>([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState<RestrictionDoc['type']>('injury')
  const [severity, setSeverity] = useState<RestrictionDoc['severity']>('moderate')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = async () => {
    if (!user?.accessToken || !id) return
    setItems(await fetchRestrictionsForStudent(id, user.accessToken))
  }

  useEffect(() => {
    reload().catch(() => toast.error('Não foi possível carregar restrições.'))
  }, [id, user?.accessToken])

  const handleSave = async () => {
    if (!user?.accessToken || !id || !title.trim()) {
      toast.error('Informe o título da restrição.')
      return
    }
    setSaving(true)
    try {
      await createRestriction(
        { student: id, title: title.trim(), type, severity, description: description.trim() || undefined, active: true },
        user.accessToken,
      )
      toast.success('Restrição registrada.')
      setTitle('')
      setDescription('')
      await reload()
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
      <h1 className="text-2xl font-bold dark:text-white">Restrições</h1>
      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-3">
        <input className={input} placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-2">
          <select className={input} value={type} onChange={(e) => setType(e.target.value as RestrictionDoc['type'])}>
            {types.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <select className={input} value={severity} onChange={(e) => setSeverity(e.target.value as RestrictionDoc['severity'])}>
            <option value="low">Baixa</option>
            <option value="moderate">Moderada</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <textarea className={input} rows={3} placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
      <section className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhuma restrição.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="text-sm dark:text-zinc-200">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs dark:text-zinc-500">
                {types.find((t) => t.id === item.type)?.label} · {item.severity}
                {item.active === false ? ' · inativa' : ''}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
