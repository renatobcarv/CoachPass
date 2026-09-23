import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import {
  Home,
  Dumbbell,
  Apple,
  TrendingUp,
  User,
  Sun,
  Moon,
  Zap,
  X,
  ChevronRight,
  LogOut,
  Users,
  Utensils,
  ClipboardList,
  Calendar,
  Settings,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const studentNavItems = [
  { to: '/app', icon: Home, label: 'Início', exact: true },
  { to: '/app/treinos', icon: Dumbbell, label: 'Meus Treinos' },
  { to: '/app/dieta', icon: Apple, label: 'Minha Dieta' },
  { to: '/app/evolucao', icon: TrendingUp, label: 'Evolução' },
  { to: '/app/perfil', icon: User, label: 'Perfil' },
  { to: '/app/configuracoes', icon: Settings, label: 'Configurações' },
];

const personalNavItems = [
  { to: '/personal', icon: Users, label: 'Dashboard', exact: true },
  { to: '/personal/criar-treino', icon: Dumbbell, label: 'Criar Treino' },
  { to: '/personal/avaliacao', icon: ClipboardList, label: 'Avaliação Física' },
  { to: '/personal/agenda', icon: Calendar, label: 'Agenda & Sessões' },
  { to: '/personal/perfil', icon: User, label: 'Perfil' },
  { to: '/personal/configuracoes', icon: Settings, label: 'Configurações' },
];

const nutritionistNavItems = [
  { to: '/nutritionist', icon: Users, label: 'Meus Pacientes', exact: true },
  { to: '/nutritionist/criar-plano', icon: Utensils, label: 'Criar Plano Alimentar' },
  { to: '/nutritionist/anamnese', icon: ClipboardList, label: 'Anamnese' },
  { to: '/nutritionist/alimentos', icon: Apple, label: 'Base de Alimentos' },
  { to: '/nutritionist/perfil', icon: User, label: 'Perfil' },
  { to: '/nutritionist/configuracoes', icon: Settings, label: 'Configurações' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems =
    user?.role === 'personal'
      ? personalNavItems
      : user?.role === 'nutritionist'
        ? nutritionistNavItems
        : studentNavItems;

  const roleLabels: Record<string, string> = {
    master: 'Master',
    student: 'Aluno',
    personal: 'Personal Trainer',
    nutritionist: 'Nutricionista',
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={onMobileClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ease-in-out border-r border-[#000326]/10 bg-white dark:border-white/10 dark:bg-[#000137] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <Link to={navItems[0]?.to || '/'} className="group flex items-center gap-2.5" onClick={onMobileClose}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#000326] transition-transform duration-300 group-hover:scale-105 dark:bg-white">
              <Zap className="w-5 h-5 text-white dark:text-[#000326]" fill="currentColor" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#000326] dark:text-white">CoachPass</span>
              <p className="text-xs text-[#6a6a7a] -mt-0.5 dark:text-[#C5C5CE]">Treino e nutrição</p>
            </div>
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-[#6a6a7a] transition-colors hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="text-xs text-[#8e8e9a] uppercase tracking-widest px-3 mb-3 dark:text-[#C5C5CE]/70">Menu</p>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#000326]/06 dark:bg-[#000346]'
                    : 'hover:bg-[#000326]/04 dark:hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#000326] dark:bg-white" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#000326] dark:bg-white'
                        : 'bg-[#f3f4f9] group-hover:bg-[#e8e9f0] dark:bg-[#000346] dark:group-hover:bg-[#0a0e42]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white dark:text-[#000326]'
                          : 'text-[#6a6a7a] group-hover:text-[#000326] dark:text-[#C5C5CE] dark:group-hover:text-white'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isActive
                        ? 'font-semibold text-[#000326] dark:text-white'
                        : 'text-[#6a6a7a] group-hover:text-[#000326] dark:text-[#C5C5CE] dark:group-hover:text-white'
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#8e8e9a] ml-auto dark:text-[#C5C5CE]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl border border-[#000326]/10 bg-[#f3f4f9] dark:border-white/10 dark:bg-[#000346]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-[#000326]/10 bg-white dark:border-white/10 dark:bg-[#000137]">
                <Sun
                  className={`absolute w-4 h-4 text-amber-500 transition-all duration-300 ${
                    isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <Moon
                  className={`absolute w-4 h-4 text-[#C5C5CE] transition-all duration-300 ${
                    isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#000326] dark:text-white">
                  {isDark ? 'Modo escuro' : 'Modo claro'}
                </p>
                <p className="text-xs text-[#8e8e9a] dark:text-[#C5C5CE]">Tema atual</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
                isDark ? 'bg-white/30' : 'bg-[#000326]/20'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  isDark ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#000326]/10 space-y-2 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#000326]/15 dark:ring-white/20">
                <img
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=000326&color=fff'}
                  alt={user?.name || 'Usuário'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#C5C5CE] rounded-full border-2 border-white dark:border-[#000137]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#000326] truncate dark:text-white">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-[#8e8e9a] truncate dark:text-[#C5C5CE]">
                {user?.role ? roleLabels[user.role] : 'Aluno'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 transition-all hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
