import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  USERS_API,
  postJson,
  getJson,
  PayloadApiError,
  extractPayloadMessage,
} from '@/lib/cms';

export type UserRole = 'master' | 'student' | 'personal' | 'nutritionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Super-admin no Payload (acesso total CMS + painéis no app) */
  isSuperAdmin?: boolean;
  avatar?: string;
  whatsapp?: string;
  professionalId?: string;
  plan?: 'free' | 'monthly' | 'semester' | 'annual';
  /** Painéis liberados na conta (o profissional sempre tem o de aluno) */
  roles?: Array<'student' | 'personal' | 'nutritionist'>;
  /** Área profissional principal (para voltar do painel do aluno) */
  primaryProRole?: 'personal' | 'nutritionist' | null;
  createdAt?: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<UserRole>;
  register: (email: string, password: string, role: UserRole, additionalData?: Partial<User>) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  /** Troca o painel ativo (ex.: personal → aluno) e devolve a rota inicial do novo painel */
  switchRole: (role: 'student' | 'personal' | 'nutritionist') => Promise<string>;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'fitsync_payload_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type PayloadUserDoc = {
  id: string | number;
  email: string;
  name?: string;
  role?: string;
  isSuperAdmin?: boolean;
  whatsapp?: string;
  professionalId?: string;
  plan?: User['plan'];
  roles?: User['roles'];
  primaryProRole?: User['primaryProRole'];
  avatarUrl?: string | null;
  createdAt?: string;
};

function buildUser(doc: PayloadUserDoc, accessToken: string): User {
  const name = doc.name || doc.email?.split('@')[0] || 'Usuário';
  const isSuper = doc.isSuperAdmin === true || doc.role === 'master';
  const role: UserRole = isSuper
    ? 'master'
    : ((doc.role as UserRole) || 'student');
  return {
    id: String(doc.id),
    name,
    email: doc.email || '',
    role,
    isSuperAdmin: doc.isSuperAdmin === true || doc.role === 'master',
    avatar: doc.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
    whatsapp: doc.whatsapp,
    professionalId: doc.professionalId,
    plan: doc.plan,
    roles: doc.roles ?? undefined,
    primaryProRole: doc.primaryProRole ?? null,
    createdAt: doc.createdAt,
    accessToken,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((next: User | null) => {
    if (next?.accessToken) {
      localStorage.setItem(TOKEN_KEY, next.accessToken);
      localStorage.setItem('fitsync_user', JSON.stringify(next));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('fitsync_user');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getJson<{ user: PayloadUserDoc | null }>(`${USERS_API}/me`, token);
        if (cancelled) return;
        if (data.user) {
          const u = buildUser(data.user, token);
          setUser(u);
          localStorage.setItem('fitsync_user', JSON.stringify(u));
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('fitsync_user');
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('fitsync_user');
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string, _roleHint: UserRole): Promise<UserRole> => {
    try {
      const data = await postJson<{
        user: PayloadUserDoc;
        token: string;
      }>(`${USERS_API}/login`, { email: email.trim().toLowerCase(), password });

      if (!data.token || !data.user) {
        throw new Error('Resposta de login inválida');
      }

      const built = buildUser(data.user, data.token);
      setUser(built);
      persistSession(built);
      toast.success('Login realizado com sucesso.');
      return built.role;
    } catch (e) {
      const raw =
        e instanceof PayloadApiError
          ? extractPayloadMessage(e.data) || e.message
          : e instanceof Error
            ? e.message
            : '';
      const msg = /locked/i.test(raw)
        ? 'Muitas tentativas. Por segurança, a conta foi bloqueada por 10 minutos.'
        : /incorrect|invalid|unauthorized/i.test(raw)
          ? 'E-mail ou senha incorretos.'
          : raw || 'E-mail ou senha incorretos.';
      toast.error(msg);
      throw e;
    }
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<User>,
  ) => {
    try {
      // Evita cookie/JWT residual bloquear o POST /api/users (403).
      try {
        const existing = localStorage.getItem(TOKEN_KEY);
        if (existing) {
          await postJson(`${USERS_API}/logout`, {}, existing).catch(() => undefined);
        }
      } catch {
        /* ignore */
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('fitsync_user');
      setUser(null);

      await postJson(`${USERS_API}`, {
        email: email.trim().toLowerCase(),
        password,
        name: additionalData?.name || email.split('@')[0],
        role,
        whatsapp: additionalData?.whatsapp,
        professionalId: additionalData?.professionalId,
        plan: additionalData?.plan,
      });

      const normalizedEmail = email.trim().toLowerCase()
      const data = await postJson<{
        user: PayloadUserDoc;
        token: string;
      }>(`${USERS_API}/login`, { email: normalizedEmail, password });

      if (!data.token || !data.user) {
        throw new Error('Conta criada, mas o login automático falhou. Tente entrar manualmente.');
      }

      const built = buildUser(data.user, data.token);
      setUser(built);
      persistSession(built);
      return built;
    } catch (e) {
      const msg =
        e instanceof PayloadApiError
          ? extractPayloadMessage(e.data) || e.message
          : e instanceof Error
            ? e.message
            : 'Falha no cadastro';
      if (e instanceof PayloadApiError && e.status === 400) {
        throw new Error(msg || 'Dados inválidos');
      }
      throw e instanceof Error ? e : new Error(msg);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      if (token) {
        await postJson(`${USERS_API}/logout`, {}, token);
      }
    } catch {
      /* sessão já pode estar inválida */
    } finally {
      setUser(null);
      persistSession(null);
    }
  };

  const switchRole = async (role: 'student' | 'personal' | 'nutritionist'): Promise<string> => {
    if (!user?.accessToken) throw new Error('Sessão expirada. Entre novamente.');
    try {
      const res = await postJson<{ token?: string | null }>('/api/me/switch-role', { role }, user.accessToken);
      const token = res.token || user.accessToken;
      const me = await getJson<{ user: PayloadUserDoc | null }>(`${USERS_API}/me`, token);
      if (!me.user) throw new Error('Não foi possível trocar de painel.');
      const built = buildUser(me.user, token);
      setUser(built);
      persistSession(built);
      return built.role === 'personal' ? '/personal' : built.role === 'nutritionist' ? '/nutritionist' : '/app';
    } catch (e) {
      const msg = e instanceof PayloadApiError ? extractPayloadMessage(e.data) || e.message : e instanceof Error ? e.message : '';
      throw new Error(msg || 'Não foi possível trocar de painel.');
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...data }
      persistSession(next)
      return next
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Use AuthProvider em volta da árvore de componentes.');
  }
  return context;
}
