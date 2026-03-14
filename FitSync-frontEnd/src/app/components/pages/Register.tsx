import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Briefcase,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Award,
  Heart,
  TrendingUp,
  Users,
  Zap,
  Shield,
  CreditCard,
  Check,
  Dumbbell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type UserType = 'student' | 'professional' | null;
type ProfessionalType = 'personal' | 'nutritionist' | null;

interface RegisterData {
  userType: UserType;
  professionalType: ProfessionalType;
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  professionalId: string; // CREF ou CRN
  plan?: 'monthly' | 'semester' | 'annual';
}

const plans = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 70,
    priceLabel: 'R$ 70',
    period: '/mês',
    savings: null,
    features: ['Acesso completo', 'Alunos ilimitados', 'Suporte por email'],
  },
  {
    id: 'semester',
    name: 'Semestral',
    price: 360,
    priceLabel: 'R$ 360',
    monthlyEquivalent: 'R$ 60/mês',
    period: 'a cada 6 meses',
    savings: 'Economize R$ 60',
    popular: true,
    features: ['Tudo do Mensal', '2 meses grátis', 'Suporte prioritário'],
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 600,
    priceLabel: 'R$ 600',
    monthlyEquivalent: 'R$ 50/mês',
    period: 'por ano',
    savings: 'Economize R$ 240',
    bestValue: true,
    features: ['Tudo do Semestral', '4 meses grátis', 'Suporte VIP', 'Acesso antecipado'],
  },
];

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    userType: null,
    professionalType: null,
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    professionalId: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Máscaras
  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatProfessionalId = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const handleInputChange = (field: keyof RegisterData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    if (!formData.whatsapp) newErrors.whatsapp = 'WhatsApp é obrigatório';
    else if (formData.whatsapp.replace(/\D/g, '').length !== 11) {
      newErrors.whatsapp = 'WhatsApp inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.professionalType) {
      newErrors.professionalType = 'Selecione sua área';
    }
    if (!formData.professionalId.trim()) {
      newErrors.professionalId = `${formData.professionalType === 'personal' ? 'CREF' : 'CRN'} é obrigatório`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && formData.userType === 'professional' && !validateStep3()) return;
    
    if (step === 2 && formData.userType === 'student') {
      // Aluno pula direto para finalizar
      await handleSubmit();
      return;
    }
    
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const role = formData.userType === 'student' 
      ? 'student' 
      : formData.professionalType === 'personal' 
        ? 'personal' 
        : 'nutritionist';

    try {
      await registerUser(
        formData.email,
        formData.password,
        role,
        {
          name: formData.name,
          whatsapp: formData.whatsapp,
          professionalId: formData.professionalId,
          plan: formData.plan,
        }
      );
      
      // Redirecionar para dashboard apropriado
      if (role === 'student') navigate('/');
      else if (role === 'personal') navigate('/personal');
      else navigate('/nutritionist');
    } catch (err) {
      console.error('Erro no cadastro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    handleInputChange('plan', planId);
    setStep(5); // Ir para checkout
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, formData.userType === 'professional' ? 3 : null, formData.userType === 'professional' ? 4 : null, formData.userType === 'professional' ? 5 : null].filter(Boolean).map((s, index, array) => {
              const stepNum = s as number;
              return (
                <div key={stepNum} className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${
                      step >= stepNum
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                        : 'dark:bg-zinc-800 bg-slate-200 dark:text-zinc-500 text-slate-400'
                    }`}
                    style={{ fontWeight: step >= stepNum ? 700 : 400 }}
                  >
                    {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  {index < array.length - 1 && (
                    <div className={`h-1 w-12 rounded-full transition-all ${step > stepNum ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'dark:bg-zinc-800 bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm dark:text-zinc-400 text-slate-500">
            {step === 1 && 'Escolha seu perfil'}
            {step === 2 && 'Dados básicos'}
            {step === 3 && 'Informações profissionais'}
            {step === 4 && 'Escolha seu plano'}
            {step === 5 && 'Finalizar pagamento'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {/* Aluno Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleInputChange('userType', 'student');
                  setStep(2);
                }}
                className="p-8 rounded-3xl border-2 dark:border-zinc-800 border-slate-200 hover:dark:border-blue-500 hover:border-blue-400 transition-all text-left dark:bg-zinc-900 bg-white group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                  Sou Aluno
                </h2>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">
                  Quero melhorar minha saúde, receber treinos e acompanhamento nutricional personalizado.
                </p>
                <div className="space-y-2">
                  {['Treinos personalizados', 'Acompanhamento profissional', 'Evolução detalhada'].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm dark:text-zinc-300 text-slate-600">
                      <Check className="w-4 h-4 text-blue-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-blue-500 group-hover:gap-3 transition-all">
                  <span className="text-sm" style={{ fontWeight: 600 }}>Começar gratuitamente</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>

              {/* Profissional Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleInputChange('userType', 'professional');
                  setStep(2);
                }}
                className="p-8 rounded-3xl border-2 dark:border-zinc-800 border-slate-200 hover:dark:border-emerald-500 hover:border-emerald-400 transition-all text-left dark:bg-zinc-900 bg-white group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                  Sou Profissional
                </h2>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">
                  Gerencie alunos, prescreva treinos e dietas, acompanhe resultados e faça seu negócio crescer.
                </p>
                <div className="space-y-2">
                  {['Gestão completa de alunos', 'Prescrição de treinos/dietas', 'Relatórios de evolução'].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm dark:text-zinc-300 text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-emerald-500 group-hover:gap-3 transition-all">
                  <span className="text-sm" style={{ fontWeight: 600 }}>Ver planos</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Basic Data */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto dark:bg-zinc-900 bg-white rounded-3xl p-8 border dark:border-zinc-800 border-slate-200"
            >
              <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                Dados Básicos
              </h2>
              <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">
                Preencha suas informações para criar sua conta
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite seu nome completo"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border ${
                        errors.name ? 'border-red-500' : 'dark:border-zinc-700 border-slate-200'
                      } dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border ${
                        errors.email ? 'border-red-500' : 'dark:border-zinc-700 border-slate-200'
                      } dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border ${
                        errors.password ? 'border-red-500' : 'dark:border-zinc-700 border-slate-200'
                      } dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', formatWhatsApp(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border ${
                        errors.whatsapp ? 'border-red-500' : 'dark:border-zinc-700 border-slate-200'
                      } dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    />
                  </div>
                  {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {formData.userType === 'student' ? 'Finalizar' : 'Continuar'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Professional Type & ID */}
          {step === 3 && formData.userType === 'professional' && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto dark:bg-zinc-900 bg-white rounded-3xl p-8 border dark:border-zinc-800 border-slate-200"
            >
              <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                Área de Atuação
              </h2>
              <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">
                Selecione sua especialidade profissional
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleInputChange('professionalType', 'personal')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.professionalType === 'personal'
                      ? 'border-emerald-500 dark:bg-emerald-500/10 bg-emerald-50'
                      : 'dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300'
                  }`}
                >
                  <Dumbbell className={`w-8 h-8 mx-auto mb-3 ${formData.professionalType === 'personal' ? 'text-emerald-500' : 'dark:text-zinc-500 text-slate-400'}`} />
                  <p className={`text-sm text-center ${formData.professionalType === 'personal' ? 'text-emerald-500' : 'dark:text-zinc-400 text-slate-500'}`} style={{ fontWeight: 600 }}>
                    Personal Trainer
                  </p>
                </button>

                <button
                  onClick={() => handleInputChange('professionalType', 'nutritionist')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.professionalType === 'nutritionist'
                      ? 'border-emerald-500 dark:bg-emerald-500/10 bg-emerald-50'
                      : 'dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300'
                  }`}
                >
                  <Award className={`w-8 h-8 mx-auto mb-3 ${formData.professionalType === 'nutritionist' ? 'text-emerald-500' : 'dark:text-zinc-500 text-slate-400'}`} />
                  <p className={`text-sm text-center ${formData.professionalType === 'nutritionist' ? 'text-emerald-500' : 'dark:text-zinc-400 text-slate-500'}`} style={{ fontWeight: 600 }}>
                    Nutricionista
                  </p>
                </button>
              </div>
              {errors.professionalType && <p className="text-xs text-red-500 mb-4">{errors.professionalType}</p>}

              <div>
                <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                  Registro Profissional {formData.professionalType === 'personal' ? '(CREF)' : '(CRN)'}
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                  <input
                    type="text"
                    value={formData.professionalId}
                    onChange={(e) => handleInputChange('professionalId', formatProfessionalId(e.target.value))}
                    placeholder={formData.professionalType === 'personal' ? 'Ex: CREF123456' : 'Ex: CRN123456'}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border ${
                      errors.professionalId ? 'border-red-500' : 'dark:border-zinc-700 border-slate-200'
                    } dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 uppercase`}
                  />
                </div>
                {errors.professionalId && <p className="text-xs text-red-500 mt-1">{errors.professionalId}</p>}
                <p className="text-xs dark:text-zinc-500 text-slate-400 mt-2">
                  Digite apenas letras e números. Este campo não poderá ser editado depois.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Plans */}
          {step === 4 && formData.userType === 'professional' && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                  Escolha seu Plano
                </h2>
                <p className="text-sm dark:text-zinc-400 text-slate-500">
                  Selecione o plano ideal para o seu negócio
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-6 rounded-3xl border-2 transition-all ${
                      plan.popular
                        ? 'border-emerald-500 dark:bg-emerald-500/5 bg-emerald-50'
                        : plan.bestValue
                        ? 'border-blue-500 dark:bg-blue-500/5 bg-blue-50'
                        : 'dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs" style={{ fontWeight: 700 }}>
                        MAIS POPULAR
                      </div>
                    )}
                    {plan.bestValue && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500 text-white text-xs" style={{ fontWeight: 700 }}>
                        MELHOR VALOR
                      </div>
                    )}

                    <h3 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="dark:text-white text-slate-900" style={{ fontSize: '2rem', fontWeight: 800 }}>
                          {plan.priceLabel}
                        </span>
                        <span className="text-sm dark:text-zinc-400 text-slate-500">{plan.period}</span>
                      </div>
                      {plan.monthlyEquivalent && (
                        <p className="text-sm text-emerald-500" style={{ fontWeight: 600 }}>
                          {plan.monthlyEquivalent}
                        </p>
                      )}
                      {plan.savings && (
                        <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1">
                          {plan.savings}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm dark:text-zinc-300 text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-3 rounded-xl transition-all ${
                        plan.popular || plan.bestValue
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90'
                          : 'border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50'
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      Selecionar Plano
                    </button>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="mx-auto mt-6 flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </motion.div>
          )}

          {/* Step 5: Checkout */}
          {step === 5 && formData.userType === 'professional' && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto dark:bg-zinc-900 bg-white rounded-3xl p-8 border dark:border-zinc-800 border-slate-200"
            >
              <h2 className="dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>
                Finalizar Pagamento
              </h2>
              <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">
                Complete seu cadastro realizando o pagamento
              </p>

              {/* Summary */}
              <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm dark:text-zinc-400 text-slate-500">Plano selecionado</p>
                    <p className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                      {plans.find((p) => p.id === formData.plan)?.name}
                    </p>
                  </div>
                  <p className="dark:text-white text-slate-900" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    {plans.find((p) => p.id === formData.plan)?.priceLabel}
                  </p>
                </div>
                {plans.find((p) => p.id === formData.plan)?.savings && (
                  <div className="flex items-center gap-2 text-sm text-emerald-500 dark:bg-emerald-500/10 bg-emerald-100 rounded-lg p-3">
                    <Zap className="w-4 h-4" />
                    {plans.find((p) => p.id === formData.plan)?.savings}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <button className="w-full p-4 rounded-xl border-2 border-emerald-500 dark:bg-emerald-500/10 bg-emerald-50 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>PIX</p>
                      <p className="text-xs dark:text-zinc-400 text-slate-500">Aprovação instantânea</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </button>

                <button className="w-full p-4 rounded-xl border dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 dark:text-zinc-400 text-slate-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Cartão de Crédito</p>
                      <p className="text-xs dark:text-zinc-400 text-slate-500">Parcelamento disponível</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-4"
                style={{ fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Finalizar Cadastro
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(4)}
                className="w-full py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Planos
              </button>

              <p className="text-xs dark:text-zinc-500 text-slate-400 text-center mt-4">
                Ao finalizar, você concorda com nossos Termos de Uso e Política de Privacidade
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}