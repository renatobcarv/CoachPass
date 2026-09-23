import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, ChevronRight, Lock, Mail, X, Zap, ArrowLeft } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { toast } from 'sonner';
import { postJson, PayloadApiError, extractPayloadMessage, USERS_API } from '@/lib/cms';

function pathForRole(role: UserRole) {
  if (role === 'student') return '/app';
  if (role === 'personal') return '/personal';
  if (role === 'nutritionist') return '/nutritionist';
  return '/selecionar-painel';
}

const inputCls =
  'w-full pl-10 pr-4 py-3 rounded-lg bg-[#f3f4f9] border border-[#000326]/10 text-[#000326] placeholder:text-[#8e8e9a] focus:outline-none focus:ring-1 focus:ring-[#000346] dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-[#C5C5CE]';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f3f4f9] dark:bg-[#000326]">
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
              className="w-full max-w-md bg-white rounded-2xl p-8 border border-[#000326]/10 shadow-xl dark:bg-[#000137] dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[#000326] text-lg font-medium dark:text-white">Recuperar senha</h3>
                  <p className="text-sm text-[#6a6a7a] mt-1 dark:text-[#C5C5CE]">
                    Enviaremos um link para seu e-mail
                  </p>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-8 h-8 rounded-lg bg-[#f3f4f9] flex items-center justify-center text-[#6a6a7a] dark:bg-white/5 dark:text-[#C5C5CE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e9a]" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      autoFocus
                      className={inputCls}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!forgotEmail || forgotLoading}
                    className="w-full py-3 rounded-lg text-white bg-[#000326] hover:bg-[#000137] disabled:opacity-50 dark:bg-white dark:text-[#000326] dark:hover:bg-[#C5C5CE]"
                  >
                    {forgotLoading ? 'Enviando…' : 'Enviar link de recuperação'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-[#000326] mx-auto mb-3 dark:text-white" />
                  <p className="text-[#000326] font-medium dark:text-white">Link enviado</p>
                  <p className="text-sm text-[#6a6a7a] mt-1 dark:text-[#C5C5CE]">Verifique {forgotEmail}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a home
          </Link>
        </div>
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#000326] to-[#000346] dark:from-white dark:to-[#C5C5CE]">
              <Zap className="w-5 h-5 text-white dark:text-[#000326]" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#000326] dark:text-white">CoachPass</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[#000326] dark:text-white">Entrar</h1>
          <p className="mt-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            Use o e-mail e a senha da sua conta. Se for a primeira vez como aluno, o app pede o
            perfil completo (telefone, peso, altura, objetivo etc.) logo após o login.
          </p>
          {isAuthenticated && user && (
            <button
              type="button"
              onClick={() => navigate(pathForRole(user.role))}
              className="mt-4 text-sm font-semibold text-[#000326] underline dark:text-white"
            >
              Ir para o painel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 border border-[#000326]/10 space-y-4 dark:bg-[#000137] dark:border-white/10"
        >
          <div>
            <label className="block text-sm text-[#000326] mb-2 dark:text-[#C5C5CE]">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e9a]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className={inputCls}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#000326] mb-2 dark:text-[#C5C5CE]">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e9a]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                className={inputCls}
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
              className="text-sm text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
            >
              Esqueci a senha
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl text-white bg-[#000326] hover:bg-[#000137] disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-white dark:text-[#000326] dark:hover:bg-[#C5C5CE]"
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
          <p className="text-sm text-center text-[#6a6a7a] dark:text-[#C5C5CE]">
            Ainda não tem conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-[#000326] hover:underline dark:text-white"
            >
              Criar conta
            </Link>
          </p>
          <div className="pt-2 border-t border-[#000326]/10 dark:border-white/10">
            <a
              href="/politica-de-privacidade.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-[#000326] border border-[#000326]/15 hover:bg-[#f3f4f9] dark:text-[#C5C5CE] dark:border-white/15 dark:hover:bg-white/5 transition-colors"
            >
              Termos e Política de Privacidade
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
