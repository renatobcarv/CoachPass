import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Stethoscope, UserPlus, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import { AddPatientModal } from '../AddPatientModal'
import { useAuth } from '../../context/AuthContext'
import { fetchLinkedPeople, revokeLink, type LinkedPerson } from '../../lib/professionalApi'

export function NutritionistDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState<LinkedPerson[]>([])
  const [revoking, setRevoking] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const reload = useCallback(async () => {
    if (!user?.accessToken || !user?.id) {
      setPatients([])
      setLoading(false)
      return
    }
    setError(null)
    const rows = await fetchLinkedPeople(user.id, 'nutritionist', user.accessToken)
    setPatients(rows)
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar pacientes.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  const handleRevoke = async (linkId: string) => {
    if (!user?.accessToken || revoking) return
    if (!window.confirm('Encerrar este vínculo? O paciente deixa de receber novos planos.')) return
    setRevoking(linkId)
    try {
      await revokeLink(linkId, user.accessToken)
      await reload()
      toast.success('Vínculo encerrado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível encerrar o vínculo.')
    } finally {
      setRevoking(null)
    }
  }

  const firstActive = patients.find((p) => p.status === 'active')

  const filtered = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900">Pacientes</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            Convide pacientes que já têm conta CoachPass.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/nutritionist/criar-plano')}
            className="px-3 py-2 rounded-xl text-sm font-medium dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900"
          >
            <Utensils className="w-4 h-4 inline mr-1.5" />
            Criar plano
          </button>
          <button
            type="button"
            onClick={() => {
              if (!firstActive) {
                toast.info('Aceite um paciente antes de abrir a consulta.')
                return
              }
              navigate(`/nutritionist/consulta/${firstActive.userId}`)
            }}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-[#000326] dark:bg-white dark:text-[#000326]"
          >
            <Stethoscope className="w-4 h-4 inline mr-1.5" />
            Consulta
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#000326] dark:bg-white dark:text-[#000326]"
        >
          <UserPlus className="w-4 h-4 inline mr-1.5" />
          Convidar
        </button>
      </div>

      {loading && (
        <p className="text-sm dark:text-zinc-400 text-slate-500">Carregando pacientes…</p>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white px-4 py-10 text-center">
          <p className="font-semibold dark:text-white text-slate-900">Nenhum paciente ainda</p>
          <p className="mt-1.5 text-sm dark:text-zinc-400 text-slate-500 max-w-md mx-auto">
            Use Convidar com o e-mail de um paciente que já se cadastrou no CoachPass.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
          {filtered.map((patient) => (
            <div
              key={patient.linkId}
              className="w-full flex items-center gap-3 px-4 py-3 dark:bg-zinc-900 bg-white border-b last:border-b-0 dark:border-zinc-800 border-slate-200"
            >
              <button
                type="button"
                onClick={() =>
                  patient.status === 'active' && navigate(`/nutritionist/paciente/${patient.userId}`)
                }
                className="flex flex-1 items-center gap-3 text-left min-w-0"
              >
                <img src={patient.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white text-slate-900">{patient.name}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400 truncate">{patient.email}</p>
                </div>
                <span className="text-xs dark:text-zinc-400 text-slate-500">
                  {patient.status === 'pending' ? 'Pendente' : 'Ativo'}
                </span>
              </button>
              <button
                type="button"
                disabled={revoking === patient.linkId}
                onClick={() => void handleRevoke(patient.linkId)}
                className="text-xs text-red-500 hover:underline shrink-0"
              >
                Encerrar
              </button>
            </div>
          ))}
        </div>
      )}

      <AddPatientModal
        isOpen={showAddModal}
        professionalType="nutritionist"
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          void reload()
        }}
      />
    </div>
  )
}
