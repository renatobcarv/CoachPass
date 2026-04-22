import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  USERS_API,
  postJson,
  getJson,
  PayloadApiError,
  extractPayloadMessage,
} from '@/lib/cms';

export type UserRole = 'student' | 'personal' | 'nutritionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  whatsapp?: string;
  professionalId?: string;
  plan?: 'monthly' | 'semester' | 'annual';
  createdAt?: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<UserRole>;
  register: (email: string, password: string, role: UserRole, additionalData?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'fitsync_payload_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type PayloadUserDoc = {
  id: string | number;
  email: string;
  name?: string;
  role?: UserRole;
  whatsapp?: string;
  professionalId?: string;
  plan?: User['plan'];
  createdAt?: string;
};

function buildUser(doc: PayloadUserDoc, accessToken: string): User {
  const name = doc.name || doc.email?.split('@')[0] || 'Usuário';
  return {
    id: String(doc.id),
    name,
    email: doc.email || '',
    role: (doc.role as UserRole) || 'student',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
    whatsapp: doc.whatsapp,
    professionalId: doc.professionalId,
    plan: doc.plan,
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
      }>(`${USERS_API}/login`, { email, password });

      if (!data.token || !data.user) {
        throw new Error('Resposta de login inválida');
      }

      const built = buildUser(data.user, data.token);
      setUser(built);
      persistSession(built);
      toast.success('Login realizado com sucesso.');
      return built.role;
    } catch (e) {
      const msg =
        e instanceof PayloadApiError
          ? extractPayloadMessage(e.data) || e.message
          : e instanceof Error
            ? e.message
            : 'Falha no login';
      toast.error(msg || 'E-mail ou senha incorretos.');
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
      await postJson(`${USERS_API}`, {
        email,
        password,
        name: additionalData?.name || email.split('@')[0],
        role,
        whatsapp: additionalData?.whatsapp,
        professionalId: additionalData?.professionalId,
        plan: additionalData?.plan,
      });

      const data = await postJson<{
        user: PayloadUserDoc;
        token: string;
      }>(`${USERS_API}/login`, { email, password });

      if (!data.token || !data.user) {
        throw new Error('Conta criada, mas o login automático falhou. Tente entrar manualmente.');
      }

      const built = buildUser(data.user, data.token);
      setUser(built);
      persistSession(built);
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

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
    const saved = localStorage.getItem('fitsync_user');
    if (saved) {
      try {
        localStorage.setItem('fitsync_user', JSON.stringify({ ...JSON.parse(saved), ...data }));
      } catch {
        /* ignore */
      }
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Use AuthProvider em volta da árvore de componentes.');
  }
  return context;
}
