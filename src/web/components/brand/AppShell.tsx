import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { motion, MotionConfig } from 'motion/react'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { AIChat } from '../AIChat'
import { BrandLogo, Grain } from './Brand'
import { useSpotlight } from './fx'

export type ShellNavItem = {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  short: string
  exact?: boolean
}

function initials(name?: string) {
  const parts = (name || 'Usuário').trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function Avatar({ name, src, size = 40 }: { name?: string; src?: string; size?: number }) {
  return src ? (
    <img src={src} alt={name || 'Usuário'} className="rounded-full object-cover ring-2 ring-white/10" style={{ width: size, height: size }} />
  ) : (
    <span
      className="rounded-full grid place-items-center bg-[var(--ink-4)] border border-[var(--line-2)] text-white font-bold ring-2 ring-white/10"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </span>
  )
}

const TAB_COLS: Record<number, string> = { 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5' }

/**
 * Layout escuro da marca usado pelo aluno e pelos profissionais: sidebar no desktop, abas no celular.
 * A classe "dark" faz as telas antigas usarem suas variantes escuras aqui dentro.
 */
export function AppShell({
  navItems,
  homeTo,
  settingsTo,
  subtitle,
  aside,
  shellClass,
}: {
  navItems: ShellNavItem[]
  homeTo: string
  settingsTo: string
  subtitle?: string
  aside?: React.ReactNode
  shellClass: string
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const spotlightRef = useSpotlight<HTMLDivElement>()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <MotionConfig reducedMotion="user">
      <div ref={spotlightRef} className={`dark cp-brand cp-app-shell ${shellClass} relative min-h-screen`}>
        <Grain />

        {/* Sidebar desktop */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[264px] flex-col border-r border-[var(--line)] bg-[rgba(10,12,22,0.72)] backdrop-blur-xl">
          <div className="px-6 pt-7 pb-8">
            <Link to={homeTo} aria-label="Início">
              <BrandLogo size={26} />
            </Link>
            {subtitle && (
              <p className="cp-mono mt-2 pl-[2px] text-[10px] uppercase tracking-[0.16em] text-[var(--dim)]">{subtitle}</p>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <p className="cp-kicker px-3 mb-3 text-[10.5px]">Menu</p>
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <NavLink key={to} to={to} end={exact} className="relative block">
                {({ isActive }) => (
                  <span
                    className={`relative flex items-center gap-3 px-3 h-11 rounded-xl text-[14.5px] transition-colors ${
                      isActive ? 'text-white' : 'text-[var(--muted)] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`${shellClass}-nav-active`}
                        className="absolute inset-0 rounded-xl bg-[rgba(85,70,255,0.14)] border border-[rgba(140,130,255,0.3)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <Icon className={`relative w-[18px] h-[18px] ${isActive ? 'text-[var(--brand-300)]' : ''}`} />
                    <span className="relative font-medium">{label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 pb-4 space-y-3">
            {aside}

            <div className="flex items-center gap-3 rounded-2xl p-3 border border-[var(--line)] bg-white/[0.02]">
              <Avatar name={user?.name} src={user?.avatar} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate">{user?.name || 'Usuário'}</p>
                <p className="text-[12px] text-[var(--dim)] truncate">{user?.email}</p>
              </div>
              <NavLink
                to={settingsTo}
                aria-label="Configurações"
                className={({ isActive }) =>
                  `w-8 h-8 rounded-lg grid place-items-center transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-[var(--muted)] hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
              </NavLink>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[13.5px] text-[var(--muted)] hover:text-[#ff8a95] hover:bg-[rgba(255,93,108,0.08)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        </aside>

        {/* Topo mobile */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-[60px] border-b border-[var(--line)] bg-[rgba(5,6,11,0.78)] backdrop-blur-xl">
          <Link to={homeTo} aria-label="Início">
            <BrandLogo size={22} />
          </Link>
          <div className="flex items-center gap-2">
            <NavLink
              to={settingsTo}
              aria-label="Configurações"
              className={({ isActive }) =>
                `w-9 h-9 rounded-full grid place-items-center border border-[var(--line-2)] ${isActive ? 'text-white bg-white/10' : 'text-[var(--muted)]'}`
              }
            >
              <Settings className="w-4 h-4" />
            </NavLink>
            <button
              onClick={handleLogout}
              aria-label="Sair da conta"
              className="w-9 h-9 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="relative lg:pl-[264px] min-h-screen">
          <Outlet />
        </main>

        {/* Abas inferiores mobile */}
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line)] bg-[rgba(8,9,16,0.88)] backdrop-blur-xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className={`grid ${TAB_COLS[navItems.length] || 'grid-cols-5'} h-[68px]`}>
            {navItems.map(({ to, icon: Icon, short, exact }) => (
              <NavLink key={to} to={to} end={exact} className="relative flex flex-col items-center justify-center gap-1">
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={`${shellClass}-tab-active`}
                        className="absolute top-0 h-[2px] w-10 rounded-full cp-brand-bar"
                      />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--brand-300)]' : 'text-[var(--dim)]'}`} />
                    <span className={`text-[11px] ${isActive ? 'text-white font-medium' : 'text-[var(--dim)]'}`}>{short}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <AIChat />
      </div>
    </MotionConfig>
  )
}
