import { Navigate, Outlet } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen dark:bg-zinc-950 bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/30">
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div className="text-center">
            <p
              className="text-lg"
              style={{
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}
            >
              CoachPass
            </p>
            <p className="text-sm dark:text-zinc-500 text-slate-400 mt-1">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Master / super-admin: acesso a todos os painéis (aluno, personal, nutri)
  if (user && (user.role === 'master' || user.isSuperAdmin)) {
    return <Outlet />;
  }

  // Se estiver autenticado mas não tem permissão, redireciona baseado no role
  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/app" replace />;
    if (user.role === 'personal') return <Navigate to="/personal" replace />;
    if (user.role === 'nutritionist') return <Navigate to="/nutritionist" replace />;
  }

  return <Outlet />;
}
