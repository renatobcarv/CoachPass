import React from 'react'
import { Link } from 'react-router'
import { Apple, Dumbbell, Home, Sparkles, TrendingUp, User } from 'lucide-react'
import { AppShell, type ShellNavItem } from '../brand/AppShell'

const navItems: ShellNavItem[] = [
  { to: '/app', icon: Home, label: 'Início', short: 'Início', exact: true },
  { to: '/app/treinos', icon: Dumbbell, label: 'Meus treinos', short: 'Treinos' },
  { to: '/app/dieta', icon: Apple, label: 'Minha dieta', short: 'Dieta' },
  { to: '/app/evolucao', icon: TrendingUp, label: 'Evolução', short: 'Evolução' },
  { to: '/app/perfil', icon: User, label: 'Perfil', short: 'Perfil' },
]

/** Layout do app do aluno. */
export function StudentShell() {
  return (
    <AppShell
      navItems={navItems}
      homeTo="/app"
      settingsTo="/app/configuracoes"
      shellClass="cp-student-shell"
      aside={
        <Link to="/planos" className="group block rounded-2xl p-4 border border-[var(--line-2)] bg-white/[0.025]">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Sparkles className="w-4 h-4 text-[var(--amber)]" />
            Conta gratuita
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">2 gerações de IA por mês.</p>
          <p className="mt-2 text-[12.5px] font-medium text-[var(--brand-300)] group-hover:underline">Ver planos →</p>
        </Link>
      }
    />
  )
}
