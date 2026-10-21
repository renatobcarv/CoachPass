import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, Dumbbell, Lock, Mail, Salad, TrendingUp, X } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { toast } from 'sonner';
import { postJson, PayloadApiError, extractPayloadMessage, USERS_API } from '@/lib/cms';
import { AuthShell, FieldLabel } from '../brand/AuthShell';
import { CTAButton, Reveal } from '../brand/Brand';

function pathForRole(role: UserRole) {
  if (role === 'student') return '/app';
  if (role === 'personal') return '/personal';
  if (role === 'nutritionist') return '/nutritionist';
  return '/selecionar-painel';
}

const iconCls = 'w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none';

export function Login() {
  const location = useLocation();
  // Vindo do cadastro com e-mail já existente: chega preenchido
  const [email, setEmail] = useState(
    () => ((location.state as { email?: string } | null)?.email ?? ''),
  );
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
    <AuthShell
      title="Bom te ver"
      accent="de volta."
      lead="Entre com o e-mail e a senha da sua conta. O painel certo abre sozinho pelo seu perfil: aluno, personal ou nutricionista."
      aside={
        <div className="mt-10 grid grid-cols-3 gap-3">
          {[
            { icon: Dumbbell, c: 'var(--blue-2)', k: 'Treino', v: 'Push A' },
            { icon: Salad, c: 'var(--amber)', k: 'Calorias', v: '1.420' },
            { icon: TrendingUp, c: 'var(--teal)', k: 'Carga', v: '+5 kg' },
          ].map(({ icon: Icon, c, k, v }) => (
            <div key={k} className="cp-card p-4">
              <Icon className="w-4 h-4" style={{ color: c }} />
              <p className="cp-mono mt-3 text-[10.5px] uppercase tracking-[0.12em] text-[var(--muted)]">{k}</p>
              <p className="cp-display text-[18px] font-bold">{v}</p>
            </div>
          ))}
        </div>
      }
    >
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-8 bg-[var(--ink-3)] border border-[var(--line-2)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="cp-display text-[24px] font-bold">Recuperar senha</h3>
                  <p className="text-[14px] text-[var(--muted)] mt-1">Enviaremos um link para seu e-mail</p>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  aria-label="Fechar"
                  className="w-9 h-9 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="relative">
                    <Mail className={iconCls} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      autoFocus
                      className="cp-field"
                      required
                    />
                  </div>
                  <CTAButton type="submit" block disabled={!forgotEmail || forgotLoading}>
                    {forgotLoading ? 'Enviando…' : 'Enviar link de recuperação'}
                  </CTAButton>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-9 h-9 text-[var(--teal)] mx-auto mb-3" />
                  <p className="font-semibold">Link enviado</p>
                  <p className="text-[14px] text-[var(--muted)] mt-1">Verifique {forgotEmail}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[440px]">
        <Reveal>
          <p className="cp-kicker">Acesso</p>
          <h2 className="cp-display mt-3 text-[40px] font-bold leading-none">Entrar</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
            Se for a primeira vez como aluno, o app pede o perfil completo (telefone, peso, altura, objetivo etc.) logo
            após o login.
          </p>
          {isAuthenticated && user && (
            <button
              type="button"
              onClick={() => navigate(pathForRole(user.role))}
              className="mt-4 text-[14px] font-semibold text-[var(--blue-2)] hover:underline"
            >
              Ir para o painel
            </button>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
              <div className="relative">
                <Mail className={iconCls} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="cp-field"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotEmail(email);
                  }}
                  className="mb-2 text-[13px] text-[var(--muted)] hover:text-white transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  id="login-password"
                  type="password"
                  autoFocus={Boolean(email)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className="cp-field"
                  required
                />
              </div>
            </div>
            <div className="pt-2">
              <CTAButton type="submit" block disabled={loading || !email || !password}>
                {loading ? 'Entrando...' : 'Entrar'}
              </CTAButton>
            </div>
            <p className="text-[14px] text-center text-[var(--muted)]">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="font-semibold text-white hover:underline">
                Criar conta
              </Link>
            </p>
            <div className="pt-5 border-t border-[var(--line)] flex justify-center gap-5 cp-mono text-[12px] text-[var(--dim)]">
              <Link to="/termos" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </form>
        </Reveal>
      </div>
    </AuthShell>
  );
}
