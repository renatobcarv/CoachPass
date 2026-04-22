import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Briefcase,
  Mail,
  Lock,
  ChevronRight,
  Sparkles,
  Zap,
  Apple,
  Dumbbell,
  X,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { postJson, PayloadApiError, extractPayloadMessage, USERS_API } from '@/lib/cms';

// Define os papéis permitidos no login (Aluno ou Profissional)
type LoginRole = 'student' | 'professional';

// Configuração visual e de conteúdo para cada tipo de usuário
const roles: { id: LoginRole; label: string; icon: any; color: string; gradient: string; description: string }[] = [
  {
    id: 'student',
    label: 'Aluno',
    icon: User,
    color: '#10b981', // Verde esmeralda sutil para alunos
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Acompanhe seus treinos e dieta',
  },
  {
    id: 'professional',
    label: 'Profissional',
    icon: Briefcase,
    color: '#0f172a', // Azul escuro/ardósia premium para profissionais
    gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    description: 'Gerencie seus alunos e pacientes',
  },
];

export function Login() {
  // --- Estados do Componente ---
  // Guardam as informações digitadas e a aba selecionada
  const [selectedRole, setSelectedRole] = useState<LoginRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para o modal de "Esqueci a senha"
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  
  // Utiliza a função 'login' do nosso contexto de autenticação
  const { login } = useAuth();
  
  // Permite navegar para outras páginas (ex: Dashboard)
  const navigate = useNavigate();

  // Encontra os dados visuais (cor, ícone) baseados na aba logada
  const selectedRoleData = roles.find((r) => r.id === selectedRole)!;

  // --- Funções de Ação ---

  // Função disparada ao clicar em "Entrar"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarregar a página
    if (!email || !password) return; // Se vazio, não faz nada

    setLoading(true); // Ativa o estado de carregamento (mostra o spinner)
    
    try {
      // Dica visual de role para ajudar o AuthContext a rotear inicialmente
      const roleHint = selectedRole === 'student' ? 'student' : 'personal';
      
      // Tenta fazer o login no banco de dados
      const actualRole = await login(email, password, roleHint);

      // Depois do login validado, decide para onde levar o usuário
      if (actualRole === 'student') {
        navigate('/'); // Alunos vão direto para seu dashboard principal
      } else {
        // Profissionais (Personal ou Nutricionista) vão para a seleção de painel
        navigate('/selecionar-painel');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      // O toast (notificação) de erro já é tratado no AuthContext, então não repetimos aqui
    } finally {
      setLoading(false); // Desativa o spinner independente de sucesso ou erro
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

  // --- Renderização Visual (Interface do Usuário) ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-zinc-950 bg-slate-50">
      {/* Decoração de Fundo (brilhos sutis nos cantos) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-10" style={{ background: selectedRoleData.gradient }} />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-[100px] opacity-10" style={{ background: selectedRoleData.gradient }} />
      </div>

      {/* Modal de Recuperação de Senha */}
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
              className="w-full max-w-md dark:bg-zinc-900 bg-white rounded-2xl p-8 border dark:border-zinc-800 border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="dark:text-white text-slate-900 text-lg font-medium">Recuperar senha</h3>
                  <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">Enviaremos um link para seu e-mail</p>
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2 font-medium">
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
                        className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-light"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!forgotEmail || forgotLoading}
                    className="w-full py-3 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 font-medium"
                    style={{ background: selectedRoleData.gradient }}
                  >
                    {forgotLoading ? 'Enviando…' : 'Enviar link de recuperação'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="dark:text-white text-slate-900 mb-1 font-medium">Link enviado!</p>
                  <p className="text-sm dark:text-zinc-400 text-slate-500 font-light">Verifique sua caixa de entrada em {forgotEmail}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl relative"
      >
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Lado Esquerdo - Apresentação da Plataforma */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl dark:bg-zinc-900/50 bg-white/50 backdrop-blur-sm border dark:border-zinc-800 border-slate-200">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selectedRoleData.gradient }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm dark:text-white text-slate-900 font-bold tracking-wide">FITSYNC</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">Inteligência Estratégica</p>
              </div>
            </div>

            <div>
              <h1 className="dark:text-white text-slate-900 mb-3 tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1 }}>
                BEM VINDOS
              </h1>
              <p className="text-base dark:text-zinc-400 text-slate-600 font-light max-w-sm">
                Acesse o ambiente de alta performance. Gerenciamento profissional contínuo.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { icon: Zap, text: 'Personalização avançada via inteligência artifical' },
                { icon: Apple, text: 'Painel nutricional integrado e estruturado' },
                { icon: Dumbbell, text: 'Análises de métricas e performance' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded border dark:border-zinc-800 border-slate-200 flex items-center justify-center dark:bg-zinc-900 bg-white">
                    <Icon className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                  </div>
                  <p className="text-sm dark:text-zinc-300 text-slate-600 font-light">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lado Direito - Formulário de Login */}
          <div className="dark:bg-[#0a0a0a] bg-white rounded-2xl p-8 border dark:border-zinc-800/50 border-slate-200 shadow-lg">
            
            {/* Seletor de Perfil (Abas) */}
            <div className="flex border-b dark:border-zinc-800 border-slate-200 mb-8">
              {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex-1 pb-3 text-sm font-medium transition-all relative ${
                      isSelected 
                        ? 'dark:text-white text-slate-900' 
                        : 'dark:text-zinc-500 text-slate-400 hover:dark:text-zinc-300 hover:text-slate-600'
                    }`}
                  >
                    {role.label}
                    {isSelected && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: role.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Descrição sutil da aba */}
            <p className="text-xs dark:text-zinc-500 text-slate-400 mb-6 font-light">
              {selectedRoleData.description}
            </p>

            {/* Formulário Principal */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo: E-mail */}
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                  Credencial de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:border-zinc-500 transition-all font-light text-sm"
                    required
                  />
                </div>
              </div>

              {/* Campo: Senha */}
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-600 mb-2 uppercase tracking-wider font-semibold">
                  Código de Segurança
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full pl-10 pr-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:border-zinc-500 transition-all font-light text-sm"
                    required
                  />
                </div>
              </div>

              {/* Links Auxiliares */}
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-transparent text-slate-800 focus:ring-0 cursor-pointer" />
                  <span className="text-xs dark:text-zinc-500 text-slate-500 group-hover:dark:text-zinc-300 group-hover:text-slate-700 font-light transition-colors">Manter acesso</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                  className="text-xs dark:text-zinc-500 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors font-light"
                >
                  Recuperar credencial
                </button>
              </div>

              {/* Botão de Ação */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 text-sm font-medium"
                style={{ background: selectedRoleData.gradient }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Acessar Plataforma
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Rodapé: Novo Cadastro */}
            <div className="mt-8 pt-6 border-t dark:border-zinc-800/80 border-slate-200 text-center">
              <p className="text-xs dark:text-zinc-500 text-slate-500 font-light">
                Ainda não possui credencial?{' '}
                <button
                  onClick={() => navigate('/cadastro')}
                  className="dark:text-white text-slate-900 font-medium hover:underline"
                >
                  Criar acesso
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}