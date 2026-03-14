import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Heart,
  Check,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

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
  
  // Controle de qual etapa do cadastro o usuário está (1 ou 2)
  const [step, setStep] = useState(1);
  
  // Guardamos as respostas do formulário aqui
  const [formData, setFormData] = useState<RegisterData>({
    userType: null,
    name: '',
    email: '',
    password: '',
  });
  
  // Status de carregamento e mensagens de erro nos campos
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState<string | null>(null);

  // --- Funções Auxiliares ---

  // Ajuda a atualizar apenas um campo específico do estado formData
  const handleInputChange = (field: keyof RegisterData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa os erros logo que o usuário começa a digitar novamente
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setBackendError(null);
  };

  // Validação explícita dos dados inseridos no Passo 2
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail em formato inválido';
    }
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
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

    // Simplificamos o papel por enquanto. No caso de profissional, 
    // registramos como 'professional' genérico se a tabela aceitar,
    // mas o AuthContext atual requer 'personal' ou 'nutritionist'.
    // Portanto, vamos usar 'personal' como fallback temporário para passar na restrição do Supabase 
    // e o profissional vai definir o papel correto dele no Onboarding (ou o admin/onboarding corrige).
    // O mais interessante seria 'professional'. Para bater com o schema anterior, 
    // passamos `personal` e depois ajustamos no onboarding.
    const role = formData.userType === 'student' ? 'student' : 'personal';

    try {
      // Tenta registrar na base de dados Auth e na tabela de Perfis
      await registerUser(formData.email, formData.password, role, {
        name: formData.name,
        // Enviaremos os outros dados vazios/nulos por enquanto.
        // O Onboarding será responsável por preenchê-los.
      });

      // Sucesso no cadastro!
      toast.success('Conta criada em nossa plataforma.');
      
      // Iremos rotear o aluno ou profissional. 
      // Todo novo registro deve preencher o onboarding.
      if (role === 'student') {
        // Redireciona primeiramente pro root, o Guard de rota vai identificar perfil incompleto (passo futuro)
        navigate('/');
      } else {
        navigate('/selecionar-painel');
      }

    } catch (err: any) {
      console.error('Erro na criação de conta:', err);
      // Tratamento estático de erro para e-mail repetido / duplicidade
      if (err?.message?.includes('already registered') || err?.code === '23505' || err?.message?.includes('User already registered')) {
        setBackendError('Este e-mail já está cadastrado em nosso sistema. Faça o login.');
      } else {
        setBackendError('Não foi possível completar o cadastro. Verifique os dados forneidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 2;
  const progressPct = (step / totalSteps) * 100;

  // --- Renderização Visual (Interface do Usuário) ---
  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-slate-50 flex items-center justify-center p-4">
      {/* Decoração sutil de fundo premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] rounded-full blur-[120px] opacity-5 mix-blend-screen" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl dark:bg-zinc-900/50 bg-white/50 backdrop-blur-sm border dark:border-zinc-800 border-slate-200 mb-6">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm dark:text-zinc-300 text-slate-700 tracking-wide font-medium">FITSYNC</span>
          </div>
          <h1 className="dark:text-white text-slate-900 mb-3 tracking-tight" style={{ fontSize: '2rem', fontWeight: 600 }}>
            BEM VINDOS
          </h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 font-light">
            {step === 1 ? 'Selecione a modalidade de acesso' : 'Insira as credenciais para estabelecer sua conta'}
          </p>
        </div>

        {/* Barra de Progresso Minimalista */}
        <div className="mb-8 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-xs dark:text-zinc-500 text-slate-400 mb-3 uppercase tracking-wider">
            <span>Passo {step} de {totalSteps}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-0.5 dark:bg-zinc-800 bg-slate-200 rounded-full w-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Transições Suaves entre Etapas */}
        <AnimatePresence mode="wait">
          
          {/* --- Passo 1: Escolha do papel (Aluno / Profissional) --- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Card - Aluno */}
              <button
                onClick={() => { handleInputChange('userType', 'student'); setStep(2); }}
                className="group relative text-left p-8 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#0a0a0a] bg-white transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden block"
              >
                {/* Linha indicadora superior sutil ao passar o mouse */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-12 h-12 rounded border dark:border-zinc-800 border-slate-100 dark:bg-zinc-900 bg-slate-50 flex items-center justify-center mb-6">
                  <Heart className="w-5 h-5 dark:text-zinc-400 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                </div>
                
                <h2 className="dark:text-white text-slate-900 mb-3 font-medium text-lg">Acesso Estudante</h2>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mb-8 font-light leading-relaxed">
                  Gerenciamento de dieta e rotina de treinamento orientada, acompanhe seus resultados dinamicamente.
                </p>
                
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-500 font-semibold group-hover:gap-4 transition-all">
                  <span>Prosseguir</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card - Profissional */}
              <button
                onClick={() => { handleInputChange('userType', 'professional'); setStep(2); }}
                className="group relative text-left p-8 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#0a0a0a] bg-white transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 overflow-hidden block"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-12 h-12 rounded border dark:border-zinc-800 border-slate-100 dark:bg-zinc-900 bg-slate-50 flex items-center justify-center mb-6">
                  <Briefcase className="w-5 h-5 dark:text-zinc-400 text-slate-500 group-hover:text-blue-500 transition-colors" />
                </div>
                
                <h2 className="dark:text-white text-slate-900 mb-3 font-medium text-lg">Acesso Profissional</h2>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mb-8 font-light leading-relaxed">
                  Painel de gestão administrativa, prescrição clínica/esportiva e controle sistêmico de alunos e pacientes.
                </p>
                
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-blue-600 dark:text-blue-500 font-semibold group-hover:gap-4 transition-all">
                  <span>Prosseguir</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="md:col-span-2 text-center pt-8 border-t dark:border-zinc-800/80 border-slate-200 mt-2">
                <p className="text-xs dark:text-zinc-500 text-slate-500 font-light">
                  Conta já registrada?{' '}
                  <button onClick={() => navigate('/login')} className="dark:text-white text-slate-900 font-medium hover:underline">
                    Efetuar Autenticação
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* --- Passo 2: Coleta de Dados Básicos (Nome, E-mail, Senha) --- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="dark:bg-[#0a0a0a] bg-white rounded-2xl p-8 lg:p-10 border dark:border-zinc-800 border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b dark:border-zinc-800 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded border flex items-center justify-center ${formData.userType === 'student' ? 'dark:border-emerald-500/20 border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10' : 'dark:border-blue-500/20 border-blue-100 bg-blue-50/50 dark:bg-blue-900/10'}`}>
                    {formData.userType === 'student' ? <Heart className="w-4 h-4 text-emerald-600" /> : <Briefcase className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <h2 className="dark:text-white text-slate-900 font-medium tracking-tight text-lg">Requisitos de Segurança</h2>
                    <p className="text-xs dark:text-zinc-500 text-slate-500 font-light mt-1">
                      {formData.userType === 'student' ? 'Perfil: Estudante/Praticante' : 'Perfil: Especialista/Docente'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors uppercase tracking-wider font-semibold border dark:border-zinc-800 border-slate-200 py-2 px-4 rounded hover:bg-slate-50 dark:hover:bg-zinc-900"
                >
                  Alterar
                </button>
              </div>

              {/* Exibe erro devolvido pela integração com o banco (ex: Email duplicado) */}
              {backendError && (
                <div className="mb-6 p-4 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex gap-3 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-light">{backendError}</span>
                </div>
              )}

              <div className="space-y-6">
                
                {/* Nome Completo */}
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Identificação formal"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border ${errors.name ? 'border-red-500 dark:border-red-500/50' : 'dark:border-zinc-800 border-slate-200'} dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light text-sm`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-2 font-medium">{errors.name}</p>}
                </div>

                {/* E-mail Institucional / Pessoal */}
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                    Correio Eletrônico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Endereço de e-mail"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border ${errors.email ? 'border-red-500 dark:border-red-500/50' : 'dark:border-zinc-800 border-slate-200'} dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light text-sm`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-2 font-medium">{errors.email}</p>}
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                    Código Criptografado
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Exigência mínima de 6 caracteres"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border ${errors.password ? 'border-red-500 dark:border-red-500/50' : 'dark:border-zinc-800 border-slate-200'} dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-light text-sm`}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-2 font-medium">{errors.password}</p>}
                </div>
              </div>

              {/* Disclaimer de coleta progressiva (Informa o usuário o motivo da redução de tela) */}
              <div className="mt-6 p-4 rounded bg-slate-50 dark:bg-zinc-900/50 border dark:border-zinc-800 border-slate-100 flex gap-3 text-slate-600 dark:text-zinc-400 text-xs font-light">
                 <Shield className="w-4 h-4 flex-shrink-0" />
                 <p>Dados fisiológicos ou certificações profissionais serão solicitados em ambiente seguro posteriormente, visando simplificar sua entrada inicial.</p>
              </div>

              <div className="mt-8 pt-8 border-t dark:border-zinc-800/80 border-slate-100">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                  style={{ background: formData.userType === 'student' ? '#059669' : '#1e40af' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Estabelecendo conexão...
                    </>
                  ) : (
                    <>
                      Confirmar e Autenticar
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs dark:text-zinc-600 text-slate-400 text-center mt-6 font-light">
                Autenticando-se na infraestrutura, você valida as diretrizes de privacidade sistêmicas.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}