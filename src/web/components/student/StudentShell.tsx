import React from 'react'
import { Link } from 'react-router'
import { Apple, CalendarRange, Dumbbell, Home, Sparkles, TrendingUp, User } from 'lucide-react'
import { AppShell, type ShellNavItem } from '../brand/AppShell'
import { useAuth } from '../../context/AuthContext'

const navItems: ShellNavItem[] = [
  { to: '/app', icon: Home, label: 'Início', short: 'Início', exact: true },
  { to: '/app/treinos', icon: Dumbbell, label: 'Meus treinos', short: 'Treinos' },
  { to: '/app/periodizacao', icon: CalendarRange, label: 'Periodização', short: 'Ciclos' },
  { to: '/app/evolucao', icon: TrendingUp, label: 'Evolução', short: 'Evolução' },
  { to: '/app/dieta', icon: Apple, label: 'Minha dieta', short: 'Dieta' },
  { to: '/app/perfil', icon: User, label: 'Perfil', short: 'Perfil', desktopOnly: true },
]

/** Layout do app do aluno. */
export function StudentShell() {
  const { user } = useAuth()
  // Profissional no modo aluno já tem tudo liberado: sem quadro de "conta gratuita"
  const isPro = (user?.roles ?? []).some((r) => r === 'personal' || r === 'nutritionist')
  return (
    <AppShell
      navItems={navItems}
      homeTo="/app"
      settingsTo="/app/configuracoes"
      shellClass="cp-student-shell"
      aside={
        isPro ? null : (
        <Link to="/planos" className="group block rounded-2xl p-4 border border-[var(--line-2)] bg-white/[0.025]">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Sparkles className="w-4 h-4 text-[var(--amber)]" />
            Conta gratuita
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">2 gerações de IA por mês.</p>
          <p className="mt-2 text-[12.5px] font-medium text-[var(--brand-300)] group-hover:underline">Ver planos →</p>
        </Link>
        )
      }
    />
  )
}
