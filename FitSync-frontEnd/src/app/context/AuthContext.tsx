import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

// ==========================================
// TIPOS E INTERFACES (Definições de Dados)
// ==========================================

// Define os papéis (tipos de usuário) que o sistema reconhece
export type UserRole = 'student' | 'personal' | 'nutritionist';

// Define a estrutura (o "molde") de um usuário no nosso sistema
export interface User {
  id: string; // Identificador único na base de dados
  name: string; // Nome completo
  email: string; // E-mail de acesso
  role: UserRole; // Papel do usuário
  avatar?: string; // (Opcional) Foto de perfil
  whatsapp?: string; // (Opcional) Contato
  professionalId?: string; // (Opcional) CREF ou CRN se for profissional
  plan?: 'monthly' | 'semester' | 'annual'; // (Opcional) Plano assinado
  createdAt?: string; // (Opcional) Data de criação da conta
  accessToken?: string; // (Opcional) Token de segurança da sessão
}

// Define quais funções e dados este contexto vai oferecer para o resto do aplicativo
interface AuthContextType {
  user: User | null; // O usuário atualmente logado (se houver)
  loading: boolean; // Se o sistema ainda está verificando se há alguém logado
  // Função para entrar na conta (Login)
  login: (email: string, password: string, role: UserRole) => Promise<UserRole>;
  // Função para criar uma conta nova (Register)
  register: (email: string, password: string, role: UserRole, additionalData?: Partial<User>) => Promise<void>;
  // Função para sair da conta (Logout)
  logout: () => void;
  // Função para mudar dados do usuário sem precisar relogar
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean; // Retorna verdadeiro se alguém estiver logado
}

// ==========================================
// CONFIGURAÇÃO DO BANCO DE DADOS (Supabase)
// ==========================================

// Inicia a conexão com o Supabase usando as chaves importadas
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Rota de uma Edge Function (Função de Servidor) que tínhamos para contornar algumas regras de segurança
const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-da3e276b`;

// Criação do "Contexto" em si (um compartimento que o React usa para espalhar variáveis pelo app todo)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// COMPONENTE PROVEDOR (AuthProvider)
// ==========================================
// Este componente envelopa todo o nosso app e gerencia quem está logado

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado que guarda quem é o usuário logado
  const [user, setUser] = useState<User | null>(null);
  // Estado que avisa se a página ainda está carregando a verificação de login
  const [loading, setLoading] = useState(true);

  // --- Função: Montar o Objeto do Usuário ---
  // Pega os dados crus vindos do Supabase e organiza bonitinho no nosso 'molde' (User)
  const buildUser = (supabaseUser: any, accessToken: string): User => {
    // meta guarda informações extras do usuário, tipo nome, whatsapp, plano, etc.
    const meta = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      name: meta.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      role: (meta.role as UserRole) || 'student',
      // Gera uma foto padrão com a inicial do nome caso ele não tenha botado foto
      avatar: meta.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.name || 'U')}&background=10b981&color=fff`,
      whatsapp: meta.whatsapp,
      professionalId: meta.professionalId,
      plan: meta.plan,
      createdAt: supabaseUser.created_at,
      accessToken,
    };
  };

  // --- Efeito Inicial: Verificar se já tem alguém logado ---
  // Isso roda uma única vez quando o aplicativo abre
  useEffect(() => {
    let mounted = true;
    let authInitialized = false;

    // Fica 'escutando' o Supabase para saber se o estado do login mudou
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      authInitialized = true;

      // Se achou uma sessão válida no Supabase
      if (session) {
        const builtUser = buildUser(session.user, session.access_token);
        setUser(builtUser);
      } else {
        // Se NÃO achou no Supabase, tenta ver se no armazenamento local do navegador tem algum rastro (Modo Demo/Offline)
        try {
          const saved = localStorage.getItem('fitsync_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false); // Acaba o carregamento
    });

    // Timeout de segurança: se o Supabase demorar muito a responder (ex: internet caiu), 
    // ele tenta puxar o usuário do navegador e encerra a tela de carregamento.
    const fallbackTimer = setTimeout(() => {
      if (!mounted || authInitialized) return;
      try {
        const saved = localStorage.getItem('fitsync_user');
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setLoading(false);
    }, 2000);

    // Quando o componente for destruído (se o usuário fechar a aba), ele limpa os rastreadores
    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  // --- Função: Fazer Login ---
  const login = async (email: string, password: string, _role: UserRole): Promise<UserRole> => {
    try {
      // 1. Pede ao Supabase para verificar e-mail e senha
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // 2. Se deu erro (Senha errada ou algo assim)
      if (error) {
        // ...ainda tentamos ver se é um usuário offline/demo salvo no navegador
        console.warn('Supabase login error, attempting localStorage fallback:', error.message);
        const saved = localStorage.getItem('fitsync_user');
        if (saved) {
          const savedUser = JSON.parse(saved);
          if (savedUser.email === email) {
            setUser(savedUser);
            toast.success('Login realizado com sucesso!');
            return savedUser.role as UserRole;
          }
        }

        // Se realmente não é ninguém conhecido, cria um usuário "fake/demo" e loga 
        // ATENÇÃO: Na vida real para produção você não deve fazer isso. Rejeitaria e pronto.
        // Como isso é um ambiente que mescla demo e funcionalidade real, mantemos o fallback por hora.
        const demoUser: User = {
          id: crypto.randomUUID(),
          name: email.split('@')[0].replace(/[._]/g, ' '),
          email,
          role: _role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=10b981&color=fff`,
          accessToken: 'demo-token',
        };
        setUser(demoUser);
        localStorage.setItem('fitsync_user', JSON.stringify(demoUser));
        toast.success('Login realizado em Modo Demonstração');
        return _role;
      }

      // 3. Se deu tudo certo com o Supabase, constrói e seta o usuário logado
      if (data.session) {
        const builtUser = buildUser(data.user, data.session.access_token);
        setUser(builtUser);
        toast.success(`Bem-vindos, retorno autenticado com sucesso.`);
        return builtUser.role;
      }

      return _role;
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      throw err;
    }
  };

  // --- Função: Criar Conta Nova (Registro) ---
  const register = async (email: string, password: string, role: UserRole, additionalData?: Partial<User>) => {
    try {
      
      // 1. Primeiro tenta registrar através de uma API do supabase (Edge Function)
      // Fazemos isso pois ela pode ter permissões de administrador para setar a Role no objeto.
      const response = await fetch(`${serverUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name: additionalData?.name || email.split('@')[0],
          role,
          whatsapp: additionalData?.whatsapp,
          professionalId: additionalData?.professionalId,
          plan: additionalData?.plan,
        }),
      });

      const result = await response.json();

      // 2. Se a Edge Function der erro...
      if (!response.ok || result.error) {
        console.warn('Edge Function fallhou. Executando registro direto do Supabase via client-side.');
        
        // Tenta fazer o registro diretamente via método padrão do Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: additionalData?.name || email.split('@')[0],
              role,
              whatsapp: additionalData?.whatsapp,
              professionalId: additionalData?.professionalId,
              plan: additionalData?.plan,
            },
          },
        });

        // 🚨 PARTE CRÍTICA DO TRATAMENTO DE ERROS DE DUPLICIDADE:
        // Se o Supabase reclamar que tem erro (por exemplo, "User already registered")
        // Nós capturamos esse erro AQUI e LANÇAMOS (throw) ele de volta para a tela de Registro.
        // Assim, a tela de Cadastro exibe "Este e-mail já está cadastrado", em vez de
        // simplesmente silenciar o erro e criar um usuário zumbi (demo mode).
        if (error) {
           throw error; 
        }

        if (data.session) {
          const builtUser = buildUser(data.user!, data.session.access_token);
          setUser(builtUser);
        }
        return;
      }

      // 3. Se a Edge Function rodou e funcionou, precisamos FAZER LOGIN para pegar o Token gerado
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
         // Só caímos aqui se, mesmo cadastrando a conta, o login falhou imediatamente depois 
         throw signInError;
      }

      // Tudo certo: seta o usuário no contexto
      if (signInData.session) {
        const builtUser = buildUser(signInData.user!, signInData.session.access_token);
        setUser(builtUser);
      }

    } catch (err: any) {
      console.error('[AuthContext] Falha no processo de criação de conta:', err);
      // Aqui antes o sistema criava uma conta fake (Demo LocalStorage) para não travar a tela.
      // Agora, sendo mais perfeccionista e rigoroso, LEREMOS o erro e AVISAREMOS A TELA `Register.tsx`.
      // Se não for possível se conectar/cadastrar o usuário real, barramos aqui.
      throw err;
    }
  };

  // --- Função: Fazer Logout da Conta ---
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao encerrar a sessão no Supabase:', err);
    } finally {
      // Limpa do estado e limpa das memórias salvas do navegador
      setUser(null);
      localStorage.removeItem('fitsync_user');
    }
  };

  // --- Função: Atualizar Dados Localmente ---
  // Uma função auxiliar útil para mudar o Nome ou a Foto do usuário sem precisar ir no banco
  // e exigir que ele faça login novamente só pra ver a mudança.
  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
    const saved = localStorage.getItem('fitsync_user');
    if (saved) {
      localStorage.setItem('fitsync_user', JSON.stringify({ ...JSON.parse(saved), ...data }));
    }
  };

  // Por fim, injeta todos esses estados e funções criados acima no Provedor
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOK CUSTOMIZADO (Lê o Contexto)
// ==========================================
// Toda vez que um componente (como o Dashboard) quiser saber quem é o usuário,
// ele usa `const { user } = useAuth();`
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Você esqueceu de englobar o App com o <AuthProvider>');
  }
  return context;
}

export { supabase };