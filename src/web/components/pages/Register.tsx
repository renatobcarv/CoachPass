import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Briefcase,
  Mail,
  ArrowRight,
  Heart,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms';
import { AuthShell, FieldLabel } from '../brand/AuthShell';
import { CTAButton } from '../brand/Brand';
import { PasswordInput, PasswordStrength } from '../forms/PasswordInput';
import { isStrongEnough, isValidEmail, nameError } from '../../lib/validation';
import { SignupPlanPicker, signupNeedsPayment, signupPlanLabel } from '../pricing/SignupPlanPicker';
import { saveSignupPlan, subscribeProPlan, subscribeStudentPlan, type SignupPlan } from '../../lib/proPlanApi';
import { isProTier } from '@/lib/proPlans';
import { isStudentCycle } from '@/lib/studentPlans';

/** Lê ?perfil= e ?plano= (links da home e da página de planos). */
function planFromParams(params: URLSearchParams): { type: UserType; plan: SignupPlan | null } {
  const perfil = params.get('perfil');
  const plano = params.get('plano');
  const type: UserType = perfil === 'aluno' ? 'student' : perfil === 'profissional' ? 'professional' : null;
  if (type === 'student' && (plano === 'free' || isStudentCycle(plano))) {
    return { type, plan: { audience: 'student', choice: plano } };
  }
  if (type === 'professional' && isProTier(plano)) {
    return { type, plan: { audience: 'professional', choice: plano, action: plano === 'free' ? 'free' : 'subscribe' } };
  }
  return { type, plan: null };
}

// Tipos permitidos no cadastro inicial
type UserType = 'student' | 'professional' | null;

// Os dados que precisamos para criar a conta na Auth.
// O restante dos dados (WhatsApp, CREF/CRN) será coletado no Onboarding.
interface RegisterData {
  userType: UserType;
  name: string;
  email: string;
  password: string;
}

export function Register() {
  const navigate = useNavigate();
  // Pega a função 'register' de dentro do nosso contexto de autenticação
  const { register: registerUser } = useAuth();
  const [params] = useSearchParams();
  const [initial] = useState(() => planFromParams(params));

  // Etapas: 1 tipo de conta, 2 plano, 3 dados de acesso
  const [step, setStep] = useState(initial.type ? 2 : 1);
  const [plan, setPlan] = useState<SignupPlan | null>(initial.plan);

  // Guardamos as respostas do formulário aqui
  const [formData, setFormData] = useState<RegisterData>({
    userType: initial.type,
    name: '',
    email: '',
    password: '',
  });

  // Status de carregamento e mensagens de erro nos campos
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  // E-mail já cadastrado: em vez de só avisar, oferece entrar com ele
  const [emailTaken, setEmailTaken] = useState(false);

  // --- Funções Auxiliares ---

  // Ajuda a atualizar apenas um campo específico do estado formData
  const handleInputChange = (field: keyof RegisterData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa os erros logo que o usuário começa a digitar novamente
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setBackendError(null);
    setEmailTaken(false);
  };

  const goToLoginWithEmail = () => {
    navigate('/login', { state: { email: formData.email.trim().toLowerCase() } });
  };

  // Validação explícita dos dados inseridos no Passo 2
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    const nameProblem = nameError(formData.name);
    if (nameProblem) newErrors.name = nameProblem;
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!isValidEmail(formData.email)) {
      newErrors.email = 'E-mail em formato inválido';
    }
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (!isStrongEnough(formData.password)) {
      newErrors.password = 'A senha precisa de 8+ caracteres, com pelo menos uma letra e um número.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Função principal disparada no Finalização (Passo 2) ---
  const handleSubmit = async () => {
    // Se a validação não passar, interrompemos aqui
    if (!validateStep2()) return;

    setLoading(true);
    setBackendError(null);

    // Profissional começa como personal; no onboarding escolhe personal ou nutricionista e o role é atualizado.
    const role = formData.userType === 'student' ? 'student' : 'personal';

    try {
      const created = await registerUser(formData.email.trim().toLowerCase(), formData.password, role, {
        name: formData.name,
      });
      const onboarding = role === 'student' ? '/onboarding/student' : '/onboarding/professional';
      if (plan) saveSignupPlan(plan);

      // Plano pago escolhido: abre o pagamento logo depois de criar a conta
      if (plan && signupNeedsPayment(plan) && created?.accessToken) {
        try {
          const res =
            plan.audience === 'student'
              ? await subscribeStudentPlan(plan.choice as 'monthly' | 'semester' | 'annual', created.accessToken, onboarding)
              : await subscribeProPlan(plan.choice as 'pro' | 'elite', created.accessToken, onboarding);
          if (res.url) {
            toast.success('Conta criada. Abrindo o pagamento…');
            window.location.href = res.url;
            return;
          }
        } catch (err) {
          const m = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : '';
          toast.warning(
            m || 'Conta criada, mas o pagamento não abriu agora. Você pode assinar em Configurações › Plano e cobrança.',
          );
        }
      } else {
        toast.success('Conta criada.');
      }

      navigate(onboarding, { replace: true });

    } catch (err: unknown) {
      console.error('Erro na criação de conta:', err);
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : '';
      const lower = msg.toLowerCase();
      if (
        lower.includes('already') ||
        lower.includes('registered') ||
        lower.includes('duplicate') ||
        lower.includes('unique') ||
        lower.includes('já existe')
      ) {
        setEmailTaken(true);
        setBackendError(
          formData.userType === 'professional'
            ? 'Este e-mail já tem conta no CoachPass. Entre com ele para acessar o seu painel profissional.'
            : 'Este e-mail já está cadastrado. Faça o login.',
        );
      } else if (
        lower.includes('valid email') ||
        lower.includes('e-mail em formato') ||
        lower.includes('please enter a valid')
      ) {
        setBackendError('E-mail inválido. Use o endereço completo, como nome@gmail.com.');
      } else {
        setBackendError(msg || 'Não foi possível completar o cadastro. Verifique os dados fornecidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progressPct = (step / totalSteps) * 100;

  // --- Renderização Visual (Interface do Usuário) ---
  const isStudent = formData.userType === 'student';
  const iconCls = 'w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none';

  return (
    <AuthShell
      title="Comece em"
      accent="três passos."
      lead="Escolha como vai usar o CoachPass, o plano e crie o acesso. Telefone, medidas, objetivo ou registro profissional ficam para depois, já dentro do app."
      aside={
        <ol className="mt-10 space-y-3">
          {['Escolha o tipo de acesso', 'Escolha o plano', 'Nome, e-mail e senha', 'Complete o perfil no app'].map((t, i) => (
            <li key={t} className="flex items-center gap-4">
              <span
                className={`cp-mono w-8 h-8 rounded-full grid place-items-center text-[12px] border ${
                  i < step ? 'border-transparent cp-selected' : 'border-[var(--line-2)] text-[var(--muted)]'
                }`}
              >
                0{i + 1}
              </span>
              <span className={i < step ? 'text-white' : 'text-[var(--muted)]'}>{t}</span>
            </li>
          ))}
        </ol>
      }
    >
      <div className="w-full max-w-[560px]">
        <div className="mb-8">
          <p className="cp-kicker">Criar conta</p>
          <h2 className="cp-display mt-3 text-[40px] font-bold leading-none">
            {step === 1 ? 'Como você vai usar?' : step === 2 ? 'Escolha o seu plano' : 'Seus dados de acesso'}
          </h2>
          <p className="mt-3 text-[15px] text-[var(--muted)]">
            {step === 1
              ? 'Selecione a modalidade de acesso.'
              : step === 2
                ? isStudent
                  ? 'Comece grátis ou já libere o Aluno Pro. Dá para mudar depois em Configurações.'
                  : 'Pague pelo tamanho da carteira. Dá para mudar depois em Configurações.'
                : 'Nome, e-mail e senha. Depois você completa o perfil.'}
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="mb-8">
          <div className="cp-mono flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-[var(--dim)] mb-3">
            <span>
              Passo {step} de {totalSteps}
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-[3px] rounded-full w-full overflow-hidden bg-[var(--line-2)]">
            <motion.div
              className="h-full cp-brand-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* --- Passo 1: Escolha do papel (Aluno / Profissional) --- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {[
                {
                  type: 'student' as const,
                  icon: Heart,
                  color: 'var(--blue-2)',
                  title: 'Sou aluno',
                  text: 'Treino e dieta do dia, registros rápidos e a sua evolução em gráfico.',
                },
                {
                  type: 'professional' as const,
                  icon: Briefcase,
                  color: 'var(--amber)',
                  title: 'Sou profissional',
                  text: 'Personal ou nutricionista: prescreva, acompanhe e organize sua carteira.',
                },
              ].map(({ type, icon: Icon, color, title, text }) => (
                <button
                  key={type}
                  onClick={() => {
                    if (formData.userType !== type) setPlan(null);
                    handleInputChange('userType', type);
                    setStep(2);
                  }}
                  className="cp-card group text-left p-6 overflow-hidden"
                >
                  <div
                    aria-hidden
                    className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ background: color }}
                  />
                  <span
                    className="relative w-11 h-11 rounded-2xl grid place-items-center"
                    style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </span>
                  <h3 className="relative cp-display mt-5 text-[22px] font-bold">{title}</h3>
                  <p className="relative mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{text}</p>
                  <span className="relative cp-mono mt-6 inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.14em] text-white transition-[gap] duration-300 group-hover:gap-3.5">
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              ))}

              <p className="sm:col-span-2 text-center pt-6 text-[14px] text-[var(--muted)]">
                Já tem conta?{' '}
                <button onClick={() => navigate('/login')} className="font-semibold text-white hover:underline">
                  Entrar
                </button>
              </p>
            </motion.div>
          )}

          {/* --- Passo 2: Plano --- */}
          {step === 2 && formData.userType && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SignupPlanPicker audience={formData.userType} value={plan} onChange={setPlan} />
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep(1)} className="cp-btn-ghost h-12 justify-center px-6 text-[14px]">
                  Voltar
                </button>
                <CTAButton type="button" block onClick={() => plan && setStep(3)} disabled={!plan}>
                  {plan ? 'Continuar' : 'Escolha um plano'}
                </CTAButton>
              </div>
            </motion.div>
          )}

          {/* --- Passo 3: Coleta de Dados Básicos (Nome, E-mail, Senha) --- */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between gap-4 p-4 mb-6 rounded-2xl border border-[var(--line)] bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-xl grid place-items-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {isStudent ? (
                      <Heart className="w-4 h-4 text-[var(--blue-2)]" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-[var(--amber)]" />
                    )}
                  </span>
                  <div>
                    <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Perfil</p>
                    <p className="font-semibold">{isStudent ? 'Aluno' : 'Profissional'}</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="cp-btn-ghost h-9 px-4 text-[13px]">
                  Alterar
                </button>
              </div>
              <div className="-mt-3 mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-4">
                <div>
                  <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Plano</p>
                  <p className="font-semibold">{signupPlanLabel(plan)}</p>
                </div>
                <button onClick={() => setStep(2)} className="cp-btn-ghost h-9 px-4 text-[13px]">
                  Alterar
                </button>
              </div>

              {/* Exibe erro devolvido pela integração com o banco (ex: Email duplicado) */}
              {backendError && emailTaken && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[rgba(85,70,255,0.1)] border border-[rgba(140,130,255,0.35)] flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex gap-3 text-[14px] text-[var(--cream)]">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-[var(--brand-300)]" />
                    <span>{backendError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={goToLoginWithEmail}
                    className="cp-btn-sm shrink-0 sm:ml-auto justify-center"
                  >
                    Fazer login
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              {backendError && !emailTaken && (
                <div className="mb-6 p-4 rounded-2xl bg-[rgba(255,93,108,0.08)] border border-[rgba(255,93,108,0.3)] flex gap-3 text-[#ff8a95] text-[14px]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{backendError}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Nome Completo */}
                <div>
                  <FieldLabel htmlFor="reg-name">Nome completo</FieldLabel>
                  <div className="relative">
                    <User className={iconCls} />
                    <input
                      id="reg-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      maxLength={120}
                      placeholder="Como você quer ser chamado"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      className="cp-field"
                    />
                  </div>
                  {errors.name && <p className="text-[12.5px] text-[#ff8a95] mt-2">{errors.name}</p>}
                </div>

                {/* E-mail */}
                <div>
                  <FieldLabel htmlFor="reg-email">E-mail</FieldLabel>
                  <div className="relative">
                    <Mail className={iconCls} />
                    <input
                      id="reg-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      maxLength={254}
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="seu@gmail.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      className="cp-field"
                    />
                  </div>
                  {errors.email && <p className="text-[12.5px] text-[#ff8a95] mt-2">{errors.email}</p>}
                </div>

                {/* Senha */}
                <div>
                  <FieldLabel htmlFor="reg-password">Senha</FieldLabel>
                  <PasswordInput
                    id="reg-password"
                    value={formData.password}
                    onChange={(v) => handleInputChange('password', v)}
                    placeholder="8+ caracteres, com letra e número"
                    autoComplete="new-password"
                    invalid={Boolean(errors.password)}
                  />
                  <PasswordStrength value={formData.password} />
                  {errors.password && <p className="text-[12.5px] text-[#ff8a95] mt-2">{errors.password}</p>}
                </div>
              </div>

              {/* Disclaimer de coleta progressiva */}
              <div className="mt-6 p-4 rounded-2xl border border-[var(--line)] bg-white/[0.02] flex gap-3 text-[13px] text-[var(--muted)]">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--teal)]" />
                <p>
                  Dados físicos ou registro profissional (CREF/CRN) são pedidos depois, já dentro do app, para deixar a
                  entrada mais rápida.
                </p>
              </div>

              <div className="mt-8">
                <CTAButton type="button" block onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : signupNeedsPayment(plan) ? (
                    'Criar conta e ir para o pagamento'
                  ) : (
                    'Criar conta'
                  )}
                </CTAButton>
              </div>

              <p className="text-[12.5px] text-[var(--dim)] text-center mt-6">
                Ao criar a conta, você concorda com os{' '}
                <a
                  href="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-white underline-offset-2 hover:underline"
                >
                  Termos de Uso
                </a>{' '}
                e a{' '}
                <a
                  href="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--muted)] hover:text-white underline-offset-2 hover:underline"
                >
                  Política de Privacidade
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthShell>
  );
}
