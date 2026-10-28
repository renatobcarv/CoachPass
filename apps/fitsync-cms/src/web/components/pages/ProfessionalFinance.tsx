import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  createTransaction,
  fetchLinkedPeople,
  fetchTransactions,
  updateTransaction,
  type LinkedPerson,
  type TransactionDoc,
} from '../../lib/professionalApi'
import { relName } from '../../lib/studentApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const card = 'rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5'

const statusLabel: Record<TransactionDoc['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
}

export function ProfessionalFinance() {
  const { user } = useAuth()
  const [people, setPeople] = useState<LinkedPerson[]>([])
  const [rows, setRows] = useState<TransactionDoc[]>([])
  const [student, setStudent] = useState('')
  const [description, setDescription] = useState('Mensalidade')
  const [amount, setAmount] = useState('150')
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  const reload = async () => {
    if (!user?.accessToken || !user.id) return
    const role = user.role === 'nutritionist' ? 'nutritionist' : 'personal'
    const [linked, docs] = await Promise.all([
      fetchLinkedPeople(user.id, role, user.accessToken, 'active'),
      fetchTransactions(user.accessToken),
    ])
    setPeople(linked)
    setRows(docs)
    if (!student && linked[0]) setStudent(linked[0].userId)
  }

  useEffect(() => {
    reload().catch(() => toast.error('Não foi possível carregar o financeiro.'))
  }, [user?.accessToken, user?.id])

  const handleCreate = async () => {
    if (!user?.accessToken || !student || !description || !amount) {
      toast.error('Preencha aluno, descrição e valor.')
      return
    }
    setSaving(true)
    try {
      await createTransaction(
        {
          student,
          description: description.trim(),
          amount: Number(amount),
          kind: 'charge',
          status: 'pending',
          dueDate: new Date(dueDate).toISOString(),
        },
        user.accessToken,
      )
      toast.success('Lançamento criado. Cobrança automática entra depois.')
      setDescription('Mensalidade')
      await reload()
    } catch (err) {
      toast.error(
        err instanceof PayloadApiError ? extractPayloadMessage(err.data) || err.message : 'Falha ao lançar.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Financeiro</h1>
        <p className="text-sm dark:text-zinc-400 mt-1">
          Lançamentos manuais. Pagamento online fica desligado por enquanto — as funções do app continuam liberadas.
        </p>
      </div>
      <section className={`${card} space-y-3`}>
        <select
          className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          aria-label="Aluno"
        >
          <option value="">Aluno ou paciente</option>
          {people.map((row) => (
            <option key={row.userId} value={row.userId}>
              {row.name}
            </option>
          ))}
        </select>
        <input
          className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          aria-label="Descrição"
        />
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Valor"
          />
          <input
            className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Vencimento"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleCreate()}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
        >
          {saving ? 'Salvando…' : 'Lançar'}
        </button>
      </section>
      <section className={card}>
        {rows.length === 0 ? (
          <p className="text-sm dark:text-zinc-400">Nenhum lançamento.</p>
        ) : (
          <ul className="divide-y dark:divide-zinc-800">
            {rows.map((row) => (
              <li key={row.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm dark:text-white">
                <div className="flex-1">
                  <p className="font-medium">{row.description}</p>
                  <p className="text-xs dark:text-zinc-400">
                    {relName(row.student, 'Aluno')} · R$ {Number(row.amount).toFixed(2)} · {statusLabel[row.status]}
                  </p>
                </div>
                {row.status === 'pending' && user?.accessToken && (
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() =>
                      updateTransaction(row.id, { status: 'paid' }, user.accessToken!)
                        .then(() => reload())
                        .catch(() => toast.error('Não foi possível marcar como pago.'))
                    }
                  >
                    Marcar pago
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
