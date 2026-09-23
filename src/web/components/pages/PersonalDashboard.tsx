import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ClipboardList, Dumbbell, Search, UserPlus } from 'lucide-react'
import { AddPatientModal } from '../AddPatientModal'
import { useAuth } from '../../context/AuthContext'
import { PROFESSIONAL_LINKS_API, getJson, qs } from '@/lib/cms'

interface StudentRow {
  id: string
  linkId: string
  name: string
  email: string
  status: 'active' | 'pending'
  goal: string
  avatar: string
}

type LinkDoc = {
  id: string
  status: 'pending' | 'active' | 'revoked'
  student:
    | string
    | {
        id: string | number
        name?: string
        email?: string
      }
}

type ListResponse = { docs: LinkDoc[] }

function mapLink(doc: LinkDoc): StudentRow | null {
  if (doc.status !== 'active' && doc.status !== 'pending') return null
  const student = doc.student
  const id =
    typeof student === 'object' && student
      ? String(student.id)
      : String(student || '')
  if (!id) return null
  const name =
    typeof student === 'object' && student
      ? student.name || student.email || 'Aluno'
      : 'Aluno'
  const email =
    typeof student === 'object' && student ? student.email || '' : ''
  return {
    id,
    linkId: String(doc.id),
    name,
    email,
    status: doc.status,
    goal: doc.status === 'pending' ? 'Aguardando aceite' : 'Aluno vinculado',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
  }
}

export function PersonalDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const reload = useCallback(async () => {
    if (!user?.accessToken || !user?.id) {
      setStudents([])
      setLoading(false)
      return
    }
    setError(null)
    const data = await getJson<ListResponse>(
      `${PROFESSIONAL_LINKS_API}${qs({
        'where[and][0][professional][equals]': user.id,
        'where[and][1][professionalRole][equals]': 'personal',
        'where[and][2][or][0][status][equals]': 'pending',
        'where[and][2][or][1][status][equals]': 'active',
        depth: 1,
        limit: 100,
        sort: '-updatedAt',
      })}`,
      user.accessToken,
    )
    setStudents(data.docs.map(mapLink).filter((row): row is StudentRow => Boolean(row)))
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar alunos.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reload])

  const filtered = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900">Alunos</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            Convide alunos que já têm conta CoachPass.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/personal/criar-treino')}
            className="px-3 py-2 rounded-xl text-sm font-medium dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900"
          >
            <Dumbbell className="w-4 h-4 inline mr-1.5" />
            Criar treino
          </button>
          <button
            type="button"
            onClick={() => navigate('/personal/avaliacao')}
            className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-[#000326] dark:bg-white dark:text-[#000326]"
          >
            <ClipboardList className="w-4 h-4 inline mr-1.5" />
            Avaliação
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aluno"
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
        <p className="text-sm dark:text-zinc-400 text-slate-500">Carregando alunos…</p>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white px-4 py-10 text-center">
          <p className="font-semibold dark:text-white text-slate-900">Nenhum aluno ainda</p>
          <p className="mt-1.5 text-sm dark:text-zinc-400 text-slate-500 max-w-md mx-auto">
            Use Convidar com o e-mail de um aluno que já se cadastrou no CoachPass.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-2xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
          {filtered.map((student) => (
            <button
              key={student.linkId}
              type="button"
              onClick={() =>
                student.status === 'active' && navigate(`/personal/aluno/${student.id}`)
              }
              className="w-full flex items-center gap-3 px-4 py-3 text-left dark:bg-zinc-900 bg-white border-b last:border-b-0 dark:border-zinc-800 border-slate-200"
            >
              <img src={student.avatar} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dark:text-white text-slate-900">{student.name}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400 truncate">
                  {student.email || student.goal}
                </p>
              </div>
              <span className="text-xs dark:text-zinc-400 text-slate-500">
                {student.status === 'pending' ? 'Pendente' : 'Ativo'}
              </span>
            </button>
          ))}
        </div>
      )}

      <AddPatientModal
        isOpen={showAddModal}
        professionalType="personal"
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          void reload()
        }}
      />
    </div>
  )
}
