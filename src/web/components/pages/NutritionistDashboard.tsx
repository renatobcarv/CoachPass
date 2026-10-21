import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Apple,
  Calendar,
  ChevronRight,
  ClipboardList,
  Mail,
  Search,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
  Utensils,
} from 'lucide-react'
import { AddPatientModal } from '../AddPatientModal'
import { useAuth } from '../../context/AuthContext'
import { PROFESSIONAL_LINKS_API, getJson, qs } from '@/lib/cms'
import { CTAButton } from '../brand/Brand'
import { Avatar } from '../brand/AppShell'
import { RollingNumber } from '../brand/fx'
import { loadProProfile, specialtiesLine } from '../../lib/proProfile'
import { Badge, Card, ErrorBanner, Page, PageHeader, Skeleton } from '../student/ui'

interface PatientRow {
  id: string
  linkId: string
  name: string
  email: string
  status: 'active' | 'pending'
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

function mapLink(doc: LinkDoc): PatientRow | null {
  if (doc.status !== 'active' && doc.status !== 'pending') return null
  const student = doc.student
  const id =
    typeof student === 'object' && student
      ? String(student.id)
      : String(student || '')
  if (!id) return null
  const name =
    typeof student === 'object' && student
      ? student.name || student.email || 'Paciente'
      : 'Paciente'
  const email =
    typeof student === 'object' && student ? student.email || '' : ''
  return {
    id,
    linkId: String(doc.id),
    name,
    email,
    status: doc.status,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff`,
  }
}

export function NutritionistDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState<PatientRow[]>([])
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
    const data = await getJson<ListResponse>(
      `${PROFESSIONAL_LINKS_API}${qs({
        'where[and][0][professional][equals]': user.id,
        'where[and][1][professionalRole][equals]': 'nutritionist',
        'where[and][2][or][0][status][equals]': 'pending',
        'where[and][2][or][1][status][equals]': 'active',
        depth: 1,
        limit: 100,
        sort: '-updatedAt',
      })}`,
      user.accessToken,
    )
    setPatients(data.docs.map(mapLink).filter((row): row is PatientRow => Boolean(row)))
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

  const filtered = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const firstName = user?.name?.split(' ')[0] || 'Nutricionista'
  const proProfile = loadProProfile(user?.id)
  const activeCount = patients.filter((p) => p.status === 'active').length
  const pendingCount = patients.filter((p) => p.status === 'pending').length

  const kpis = [
    { label: 'Pacientes ativos', value: String(activeCount), icon: Users, live: true },
    { label: 'Consultas hoje', value: '8', icon: Calendar },
    { label: 'Taxa de adesão', value: '87%', icon: TrendingUp },
    { label: 'Convites pendentes', value: String(pendingCount), icon: Mail, live: true },
  ]

  return (
    <Page>
      <PageHeader
        kicker="Painel da nutricionista"
        title="Olá,"
        accent={`${firstName}.`}
        lead={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone="amber">CRN {user?.professionalId || '—'}</Badge>
            <span>{specialtiesLine(proProfile, 'Nutrição clínica e esportiva')}</span>
            {proProfile?.experience && <Badge>{proProfile.experience}</Badge>}
          </span>
        }
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/nutritionist/criar-plano')} className="cp-btn-ghost">
              <Utensils className="w-4 h-4" />
              Criar plano
            </button>
            <CTAButton type="button" onClick={() => setShowAddModal(true)}>
              Convidar paciente
            </CTAButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, live }, i) => (
          <Card key={label} className="p-5 sm:p-6" delay={0.04 * i}>
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl grid place-items-center bg-[rgba(85,70,255,0.14)] border border-[rgba(140,130,255,0.25)]">
                <Icon className="w-[18px] h-[18px] text-[var(--brand-300)]" />
              </span>
              <Badge tone={live ? 'teal' : 'neutral'}>Ativo</Badge>
            </div>
            <p className="cp-display mt-5 text-[clamp(30px,3.4vw,42px)] font-bold leading-none">
              <RollingNumber value={value} />
            </p>
            <p className="mt-2 text-[13.5px] text-[var(--muted)]">{label}</p>
          </Card>
        ))}
      </div>
      <p className="mt-3 cp-mono text-[11px] text-[var(--dim)]">
        Pacientes e convites vêm dos vínculos reais · consultas hoje e adesão são valores de exemplo até a integração.
      </p>

      <div className="mt-8 grid lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        <Card className="overflow-hidden" delay={0.12}>
          <div className="p-5 sm:p-6 border-b border-[var(--line)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="cp-display text-[22px] font-bold">Meus pacientes</h2>
                <p className="mt-1 text-[13.5px] text-[var(--muted)]">Convide pacientes que já têm conta CoachPass.</p>
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
                  placeholder="Buscar paciente"
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
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente ainda'}
              </p>
              <p className="mt-1.5 text-[14px] text-[var(--muted)] max-w-sm mx-auto">
                Use Convidar com o e-mail de um paciente que já se cadastrou no CoachPass.
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <ul>
              {filtered.map((patient) => {
                const active = patient.status === 'active'
                return (
                  <li key={patient.linkId} className="border-b border-[var(--line)] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => active && navigate(`/nutritionist/paciente/${patient.id}`)}
                      disabled={!active}
                      className="group w-full flex items-center gap-4 px-5 sm:px-6 py-4 text-left transition-colors hover:bg-white/[0.03] disabled:cursor-default"
                    >
                      <Avatar name={patient.name} size={42} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] truncate">{patient.name}</p>
                        <p className="text-[13px] text-[var(--dim)] truncate">{patient.email}</p>
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

        <Card className="p-5 sm:p-6" delay={0.16}>
          <h2 className="cp-display text-[18px] font-bold mb-4">Ações rápidas</h2>
          <div className="grid gap-2">
            {[
              { to: '/nutritionist/criar-plano', icon: Utensils, label: 'Criar plano alimentar', desc: 'Refeições do dia' },
              { to: '/nutritionist/consulta/1', icon: Stethoscope, label: 'Nova consulta', desc: 'Registro do atendimento' },
              { to: '/nutritionist/anamnese', icon: ClipboardList, label: 'Anamnese', desc: 'Histórico e hábitos' },
              { to: '/nutritionist/alimentos', icon: Apple, label: 'Base de alimentos', desc: 'Montar o cardápio' },
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
      </div>

      <AddPatientModal
        isOpen={showAddModal}
        professionalType="nutritionist"
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          void reload()
        }}
      />
    </Page>
  )
}
