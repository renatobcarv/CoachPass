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
  DollarSign,
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
  { to: '/personal/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/personal/perfil', icon: User, label: 'Perfil' },
  { to: '/personal/configuracoes', icon: Settings, label: 'Configurações' },
];

const nutritionistNavItems = [
  { to: '/nutritionist', icon: Users, label: 'Meus Pacientes', exact: true },
  { to: '/nutritionist/criar-plano', icon: Utensils, label: 'Criar Plano Alimentar' },
  { to: '/nutritionist/anamnese', icon: ClipboardList, label: 'Anamnese' },
  { to: '/nutritionist/alimentos', icon: Apple, label: 'Base de Alimentos' },
  { to: '/nutritionist/financeiro', icon: DollarSign, label: 'Financeiro' },
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Seleciona os itens de navegação baseado no role do usuário
  const navItems = user?.role === 'personal' 
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

  const sidebarClasses = `
    fixed top-0 left-0 h-full w-64 z-40 flex flex-col
    transition-transform duration-300 ease-in-out
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    dark:bg-zinc-950 bg-white
    dark:border-zinc-800 border-slate-200 border-r
  `;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link to={navItems[0]?.to || '/'} className="flex items-center gap-2.5" onClick={onMobileClose}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span
                className="text-xl tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                }}
              >
                CoachPass
              </span>
              <p className="text-xs dark:text-zinc-500 text-slate-400 -mt-0.5">
                Treino e nutrição
              </p>
            </div>
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden dark:text-zinc-400 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="text-xs dark:text-zinc-600 text-slate-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/15 dark:to-blue-500/15'
                    : 'dark:hover:bg-zinc-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-emerald-500 to-blue-500" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-500 to-blue-500 shadow-md shadow-emerald-500/20'
                        : 'dark:bg-zinc-800 bg-slate-100 dark:group-hover:bg-zinc-700 group-hover:bg-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : 'dark:text-zinc-400 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isActive
                        ? 'dark:text-white text-slate-900'
                        : 'dark:text-zinc-400 text-slate-500 dark:group-hover:text-zinc-100 group-hover:text-slate-700'
                    }`}
                    style={{ fontWeight: isActive ? 600 : 400 }}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl dark:bg-zinc-900 bg-slate-50 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center dark:bg-zinc-800 bg-white dark:border-zinc-700 border border-slate-200">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm dark:text-zinc-200 text-slate-700" style={{ fontWeight: 500 }}>
                  {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                </p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">Tema atual</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  : 'bg-gradient-to-r from-amber-400 to-orange-400'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3 h-3 text-indigo-600" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t dark:border-zinc-800 border-slate-200 space-y-2">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500/40 transition-all">
                <img
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                  alt={user?.name || 'Usuário'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 dark:border-zinc-950 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm dark:text-zinc-100 text-slate-800 truncate" style={{ fontWeight: 600 }}>
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs dark:text-zinc-500 text-slate-400 truncate">
                {user?.role ? roleLabels[user.role] : 'Aluno'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 hover:dark:bg-red-500/20 hover:bg-red-100 transition-all text-sm"
            style={{ fontWeight: 500 }}
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}