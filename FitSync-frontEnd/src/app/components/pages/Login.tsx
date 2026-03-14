import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Dumbbell,
  Apple,
  Mail,
  Lock,
  ChevronRight,
  Sparkles,
  Zap,
  X,
  CheckCircle,
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { toast } from 'sonner';

const roles = [
  {
    id: 'student' as UserRole,
    label: 'Aluno',
    icon: User,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Acompanhe seus treinos e dieta',
  },
  {
    id: 'personal' as UserRole,
    label: 'Personal',
    icon: Dumbbell,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    description: 'Gerencie seus alunos e treinos',
  },
  {
    id: 'nutritionist' as UserRole,
    label: 'Nutricionista',
    icon: Apple,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'Crie planos alimentares',
  },
];

export function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const actualRole = await login(email, password, selectedRole);
      // Redireciona baseado no perfil real do usuário
      if (actualRole === 'student') {
        navigate('/');
      } else if (actualRole === 'personal') {
        navigate('/personal');
      } else {
        navigate('/nutritionist');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    toast.success(`Link de recuperação enviado para ${forgotEmail}`);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 3000);
  };

  const selectedRoleData = roles.find((r) => r.id === selectedRole)!;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-zinc-950 bg-slate-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: selectedRoleData.gradient }} />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: selectedRoleData.gradient }} />
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md dark:bg-zinc-900 bg-white rounded-3xl p-8 border dark:border-zinc-800 border-slate-200 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>Recuperar senha</h3>
                  <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
                    Enviaremos um link para seu e-mail
                  </p>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                      E-mail cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu@email.com"
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!forgotEmail}
                    className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: selectedRoleData.gradient, fontWeight: 600 }}
                  >
                    Enviar link de recuperação
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>Link enviado!</p>
                  <p className="text-sm dark:text-zinc-400 text-slate-500">Verifique sua caixa de entrada em {forgotEmail}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl dark:bg-zinc-900/50 bg-white/50 backdrop-blur-sm border dark:border-zinc-800 border-slate-200">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selectedRoleData.gradient }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>FitSync</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">Fitness & Nutrition AI</p>
              </div>
            </div>

            <div>
              <h1 className="dark:text-white text-slate-900 mb-3" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-lg dark:text-zinc-400 text-slate-600">
                Entre na plataforma mais completa de treino e nutrição com IA
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Zap, text: 'Treinos personalizados com IA' },
                { icon: Apple, text: 'Planos alimentares inteligentes' },
                { icon: Dumbbell, text: 'Acompanhamento em tempo real' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${selectedRoleData.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: selectedRoleData.color }} />
                  </div>
                  <p className="text-sm dark:text-zinc-300 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-8 border dark:border-zinc-800 border-slate-200 shadow-2xl">
            <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>Entrar na conta</h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">Selecione seu perfil e faça login</p>

            {/* Role Selector */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 dark:bg-zinc-800/50 bg-slate-100 rounded-2xl">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative p-3 rounded-xl transition-all duration-300 ${
                      selectedRole === role.id
                        ? 'text-white shadow-lg scale-105'
                        : 'dark:text-zinc-500 text-slate-500 hover:dark:text-zinc-300 hover:text-slate-700'
                    }`}
                    style={selectedRole === role.id ? { background: role.gradient } : {}}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs" style={{ fontWeight: selectedRole === role.id ? 600 : 400 }}>
                      {role.label}
                    </p>
                  </button>
                );
              })}
            </div>

            <motion.p
              key={selectedRole}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs dark:text-zinc-500 text-slate-400 text-center mb-6"
            >
              {selectedRoleData.description}
            </motion.p>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="dark:text-zinc-400 text-slate-600">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                  className="dark:text-zinc-400 text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: selectedRoleData.gradient, fontWeight: 600 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t dark:border-zinc-800 border-slate-200 text-center">
              <p className="text-sm dark:text-zinc-500 text-slate-500">
                Não tem uma conta?{' '}
                <button
                  onClick={() => navigate('/cadastro')}
                  className="dark:text-zinc-300 text-slate-700 hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Cadastre-se grátis
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}