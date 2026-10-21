import React from 'react'
import { Apple, Calendar, ClipboardList, Dumbbell, LayoutDashboard, User, Users, Utensils } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { AppShell, type ShellNavItem } from '../brand/AppShell'

const personalNav: ShellNavItem[] = [
  { to: '/personal', icon: LayoutDashboard, label: 'Painel', short: 'Painel', exact: true },
  { to: '/personal/criar-treino', icon: Dumbbell, label: 'Criar treino', short: 'Treino' },
  { to: '/personal/avaliacao', icon: ClipboardList, label: 'Avaliação física', short: 'Avaliação' },
  { to: '/personal/agenda', icon: Calendar, label: 'Agenda & sessões', short: 'Agenda' },
]

const nutritionistNav: ShellNavItem[] = [
  { to: '/nutritionist', icon: Users, label: 'Meus pacientes', short: 'Pacientes', exact: true },
  { to: '/nutritionist/criar-plano', icon: Utensils, label: 'Criar plano alimentar', short: 'Plano' },
  { to: '/nutritionist/anamnese', icon: ClipboardList, label: 'Anamnese', short: 'Anamnese' },
  { to: '/nutritionist/alimentos', icon: Apple, label: 'Base de alimentos', short: 'Alimentos' },
  { to: '/nutritionist/perfil', icon: User, label: 'Perfil', short: 'Perfil' },
]

/** Layout dos painéis do personal e da nutricionista (mesma base visual do app do aluno). */
export function ProShell() {
  const { user } = useAuth()
  const isNutri = user?.role === 'nutritionist'
  const credential = user?.professionalId ? `${isNutri ? 'CRN' : 'CREF'} ${user.professionalId}` : undefined

  return (
    <AppShell
      navItems={isNutri ? nutritionistNav : personalNav}
      homeTo={isNutri ? '/nutritionist' : '/personal'}
      settingsTo={isNutri ? '/nutritionist/configuracoes' : '/personal/configuracoes'}
      subtitle={isNutri ? 'Painel da nutricionista' : 'Painel do personal'}
      shellClass="cp-pro-shell"
      aside={
        credential ? (
          <div className="rounded-2xl p-4 border border-[var(--line-2)] bg-white/[0.025]">
            <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--dim)]">Registro</p>
            <p className="mt-1 text-[14px] font-semibold">{credential}</p>
          </div>
        ) : null
      }
    />
  )
}
