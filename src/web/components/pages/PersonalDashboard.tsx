import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Copy,
  Dumbbell,
  MailPlus,
  Link as LinkIcon,
  Search,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { AddPatientModal } from '../AddPatientModal'
import { useAuth } from '../../context/AuthContext'
import { PROFESSIONAL_LINKS_API, SESSIONS_API, WORKOUT_LOGS_API, getJson, qs } from '@/lib/cms'
import { CTAButton } from '../brand/Brand'
import { Avatar } from '../brand/AppShell'
import { RollingNumber } from '../brand/fx'
import { loadProProfile, specialtiesLine } from '../../lib/proProfile'
import { Badge, Card, ErrorBanner, Page, PageHeader, Skeleton } from '../student/ui'

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
  studentInfo?: { name?: string | null; email?: string | null } | null
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
  const obj = typeof student === 'object' && student ? student : null
  const email = obj?.email || doc.studentInfo?.email || ''
  const name = obj?.name || doc.studentInfo?.name || email || 'Aluno'
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

  // Números reais do painel: treinos registrados pelos alunos e sessões da agenda
  const [stats, setStats] = useState<{ logs7d: number; sessionsToday: number; sessionsWeek: number } | null>(null)
  useEffect(() => {
    if (!user?.accessToken || !user?.id) return
    const token = user.accessToken
    const day = (offset: number) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + offset)
      return d.toISOString()
    }
    const count = (url: string) => getJson<{ totalDocs: number }>(url, token).then((r) => r.totalDocs).catch(() => 0)
    void Promise.all([
      count(`${WORKOUT_LOGS_API}${qs({ 'where[performedAt][greater_than_equal]': day(-6), limit: 1, depth: 0 })}`),
      count(
        `${SESSIONS_API}${qs({
          'where[and][0][professional][equals]': user.id,
          'where[and][1][date][greater_than_equal]': day(0),
          'where[and][2][date][less_than]': day(1),
          'where[and][3][status][not_equals]': 'cancelled',
          limit: 1,
          depth: 0,
        })}`,
      ),
      count(
        `${SESSIONS_API}${qs({
          'where[and][0][professional][equals]': user.id,
          'where[and][1][date][greater_than_equal]': day(0),
          'where[and][2][date][less_than]': day(7),
          'where[and][3][status][not_equals]': 'cancelled',
          limit: 1,
          depth: 0,
        })}`,
      ),
    ]).then(([logs7d, sessionsToday, sessionsWeek]) => setStats({ logs7d, sessionsToday, sessionsWeek }))
  }, [user?.accessToken, user?.id])

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

  const firstName = user?.name?.split(' ')[0] || 'Personal'
  const proProfile = loadProProfile(user?.id)
  const activeCount = students.filter((s) => s.status === 'active').length
  const pendingCount = students.filter((s) => s.status === 'pending').length
  // Link real de cadastro do aluno (conta grátis); depois é só convidar pelo e-mail
  const signupLink = typeof window !== 'undefined' ? `${window.location.origin}/cadastro?perfil=aluno&plano=free` : '/cadastro'

  const kpis = [
    { label: 'Alunos ativos', value: String(activeCount), icon: Users, hint: pendingCount ? `${pendingCount} convite(s) pendente(s)` : 'vínculos aceitos' },
    { label: 'Treinos registrados', value: stats ? String(stats.logs7d) : '–', icon: Dumbbell, hint: 'pelos alunos, últimos 7 dias' },
    { label: 'Sessões hoje', value: stats ? String(stats.sessionsToday) : '–', icon: Calendar, hint: 'na sua agenda' },
    { label: 'Sessões na semana', value: stats ? String(stats.sessionsWeek) : '–', icon: TrendingUp, hint: 'próximos 7 dias' },
  ]

  const copySignupLink = async () => {
    try {
      await navigator.clipboard.writeText(signupLink)
      toast.success('Link copiado', { description: 'Envie para o aluno criar a conta grátis.' })
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  return (
    <Page>
      <PageHeader
        kicker="Painel do personal"
        title="Olá,"
        accent={`${firstName}.`}
        lead={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone="blue">CREF {user?.professionalId || '—'}</Badge>
            <span>{specialtiesLine(proProfile, 'Treinamento de força e hipertrofia')}</span>
            {proProfile?.experience && <Badge>{proProfile.experience}</Badge>}
          </span>
        }
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/personal/criar-treino')} className="cp-btn-ghost">
              <Dumbbell className="w-4 h-4" />
              Criar treino
            </button>
            <CTAButton type="button" onClick={() => setShowAddModal(true)}>
              Convidar aluno
            </CTAButton>
          </div>
        }
      />

      {/* KPIs principais */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, hint }, i) => (
          <Card key={label} className="p-5 sm:p-6" delay={0.04 * i}>
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl grid place-items-center bg-[rgba(85,70,255,0.14)] border border-[rgba(140,130,255,0.25)]">
                <Icon className="w-[18px] h-[18px] text-[var(--brand-300)]" />
              </span>
            </div>
            <p className="cp-display mt-5 text-[clamp(30px,3.4vw,42px)] font-bold leading-none">
              <RollingNumber value={value} />
            </p>
            <p className="mt-2 text-[13.5px] text-[var(--muted)]">{label}</p>
            <p className="mt-0.5 text-[12px] text-[var(--dim)]">{hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        {/* Carteira de alunos */}
        <Card className="overflow-hidden" delay={0.12}>
          <div className="p-5 sm:p-6 border-b border-[var(--line)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="cp-display text-[22px] font-bold">Meus alunos</h2>
                <p className="mt-1 text-[13.5px] text-[var(--muted)]">Convide alunos que já têm conta CoachPass.</p>
              </div>
              <div className="flex gap-2">
                <Badge tone="teal">{activeCount} ativos</Badge>
                {pendingCount > 0 && <Badge tone="amber">{pendingCount} pendentes</Badge>}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar aluno"
                  className="cp-field h-11"
                />
              </div>
              <button type="button" onClick={() => setShowAddModal(true)} className="cp-btn-sm h-11">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Convidar</span>
              </button>
            </div>
          </div>

          {error && <div className="px-6 pt-5"><ErrorBanner>{error}</ErrorBanner></div>}

          {loading && (
            <div className="p-6 space-y-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto w-12 h-12 rounded-2xl grid place-items-center bg-white/[0.05] border border-[var(--line-2)]">
                <Users className="w-5 h-5 text-[var(--brand-300)]" />
              </span>
              <p className="mt-4 cp-display text-[19px] font-bold">
                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno ainda'}
              </p>
              <p className="mt-1.5 text-[14px] text-[var(--muted)] max-w-sm mx-auto">
                Use Convidar com o e-mail de um aluno que já se cadastrou no CoachPass.
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <ul>
              {filtered.map((student) => {
                const active = student.status === 'active'
                return (
                  <li key={student.linkId} className="border-b border-[var(--line)] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => active && navigate(`/personal/aluno/${student.id}`)}
                      disabled={!active}
                      className="group w-full flex items-center gap-4 px-5 sm:px-6 py-4 text-left transition-colors hover:bg-white/[0.03] disabled:cursor-default"
                    >
                      <Avatar name={student.name} size={42} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] truncate">{student.name}</p>
                        <p className="text-[13px] text-[var(--dim)] truncate">{student.email || student.goal}</p>
                      </div>
                      <Badge tone={active ? 'teal' : 'amber'}>{active ? 'Ativo' : 'Pendente'}</Badge>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-[var(--dim)] transition-transform group-hover:translate-x-0.5" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {/* Ações rápidas */}
          <Card className="p-5 sm:p-6" delay={0.16}>
            <h2 className="cp-display text-[18px] font-bold mb-4">Ações rápidas</h2>
            <div className="grid gap-2">
              {[
                { to: '/personal/criar-treino', icon: Dumbbell, label: 'Criar treino', desc: 'Série, repetição e carga' },
                { to: '/personal/avaliacao', icon: ClipboardList, label: 'Avaliação física', desc: 'Medidas e composição' },
                { to: '/personal/agenda', icon: Calendar, label: 'Agenda & sessões', desc: 'Presencial e online' },
              ].map(({ to, icon: Icon, label, desc }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className="cp-spot group relative flex items-center gap-3 rounded-2xl px-4 py-3 border border-[var(--line)] bg-white/[0.02] text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-10 h-10 rounded-xl grid place-items-center bg-white/[0.05]">
                    <Icon className="w-[18px] h-[18px] text-[var(--brand-300)]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14.5px] font-semibold">{label}</span>
                    <span className="block text-[12.5px] text-[var(--dim)]">{desc}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--dim)] transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </Card>

          {/* Link de cadastro para novos alunos */}
          <Card className="p-5 sm:p-6 overflow-hidden" delay={0.2}>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[var(--brand-300)]" />
              <p className="cp-kicker">Trazer um aluno novo</p>
            </div>
            <ol className="mt-4 space-y-2 text-[13.5px] text-[var(--muted)]">
              <li>1. Envie o link: o aluno cria a conta grátis.</li>
              <li>2. Convide pelo e-mail que ele usou.</li>
              <li>3. Ele aceita o convite no app e aparece aqui.</li>
            </ol>
            <button type="button" onClick={copySignupLink} className="cp-btn-sm mt-4 w-full justify-center h-11">
              <Copy className="w-4 h-4" />
              Copiar link de cadastro
            </button>
            <button type="button" onClick={() => setShowAddModal(true)} className="cp-btn-ghost mt-2 w-full justify-center h-11">
              <MailPlus className="w-4 h-4" />
              Convidar por e-mail
            </button>
          </Card>
        </div>
      </div>

      <AddPatientModal
        isOpen={showAddModal}
        professionalType="personal"
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          void reload()
        }}
      />
    </Page>
  )
}
