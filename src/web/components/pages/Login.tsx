import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, ChevronRight, Lock, Mail, X, Zap } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { toast } from 'sonner';
import { postJson, PayloadApiError, extractPayloadMessage, USERS_API } from '@/lib/cms';

function pathForRole(role: UserRole) {
  if (role === 'student') return '/app';
  if (role === 'personal') return '/personal';
  if (role === 'nutritionist') return '/nutritionist';
  return '/selecionar-painel';
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const actualRole = await login(email, password, 'student');
      navigate(pathForRole(actualRole), { replace: true });
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || forgotLoading) return;
    setForgotLoading(true);
    try {
      await postJson(`${USERS_API}/forgot-password`, { email: forgotEmail.trim() });
      setForgotSent(true);
      toast.success(`Se o e-mail existir, enviamos o link de recuperação para ${forgotEmail}`);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSent(false);
        setForgotEmail('');
      }, 3000);
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data)
          : err instanceof Error
            ? err.message
            : 'Não foi possível enviar o e-mail';
      toast.error(msg || 'Tente novamente em instantes.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
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
              className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 text-lg font-medium">Recuperar senha</h3>
                  <p className="text-sm text-slate-500 mt-1">Enviaremos um link para seu e-mail</p>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!forgotEmail || forgotLoading}
                    className="w-full py-3 rounded-lg text-white bg-slate-900 disabled:opacity-50"
                  >
                    {forgotLoading ? 'Enviando…' : 'Enviar link de recuperação'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-900 font-medium">Link enviado</p>
                  <p className="text-sm text-slate-500 mt-1">Verifique {forgotEmail}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold">CoachPass</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use o e-mail da sua conta. O painel abre conforme o seu perfil.
          </p>
          {isAuthenticated && user && (
            <button
              type="button"
              onClick={() => navigate(pathForRole(user.role))}
              className="mt-4 text-sm font-semibold text-slate-900 underline"
            >
              Ir para o painel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-2">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotEmail(email);
              }}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Esqueci a senha
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl text-white bg-slate-900 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
          <p className="text-sm text-center text-slate-500">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-slate-900 hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
