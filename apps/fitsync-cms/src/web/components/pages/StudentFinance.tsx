import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchTransactions, type TransactionDoc } from '../../lib/professionalApi'

const card = 'rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]'

const statusLabel: Record<TransactionDoc['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
}

export function StudentFinance() {
  const { user } = useAuth()
  const [rows, setRows] = useState<TransactionDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.accessToken) return
    fetchTransactions(user.accessToken)
      .then(setRows)
      .finally(() => setLoading(false))
  }, [user?.accessToken])

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Pagamentos</h1>
        <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
          Lançamentos do seu personal ou nutri. O app continua liberado; cobrança automática vem depois.
        </p>
      </div>
      {loading && <p className="text-sm text-[#6a6a7a]">Carregando…</p>}
      <section className={card}>
        {!loading && rows.length === 0 ? (
          <p className="text-sm text-[#6a6a7a]">Nenhum lançamento.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="text-sm text-[#000326] dark:text-white">
                <p className="font-medium">{row.description}</p>
                <p className="text-xs text-[#6a6a7a]">
                  R$ {Number(row.amount).toFixed(2)} · {statusLabel[row.status]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
