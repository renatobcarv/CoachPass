import React from 'react'
import { TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router'

const card =
  'rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]'

export function Evolution() {
  const { user } = useAuth()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Evolução</h1>
        <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
          Peso, medidas e histórico aparecem quando houver registros reais.
        </p>
      </div>

      <div className={`${card} text-center py-12`}>
        <TrendingUp className="w-8 h-8 mx-auto text-[#8e8e9a]" />
        <p className="mt-3 font-semibold text-[#000326] dark:text-white">Sem dados de evolução</p>
        <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE] max-w-md mx-auto">
          Ainda não há medições ou logs registrados para {user?.name?.split(' ')[0] || 'você'}.
          Quando o acompanhamento físico for publicado ou você registrar progresso, os gráficos
          entram aqui.
        </p>
        <Link
          to="/app/perfil"
          className="inline-flex mt-5 text-sm font-medium text-[#000326] dark:text-white underline-offset-2 hover:underline"
        >
          Atualizar peso no perfil
        </Link>
      </div>
    </div>
  )
}
