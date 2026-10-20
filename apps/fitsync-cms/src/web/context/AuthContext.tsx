import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  USERS_API,
  postJson,
  getJson,
  patchJson,
  PayloadApiError,
  extractPayloadMessage,
  assertSecureTransport,
  onSessionInvalid,
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
  createdAt?: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<UserRole>;
  register: (email: string, password: string, role: UserRole, additionalData?: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'fitsync_payload_token';
const USER_KEY = 'fitsync_user';
const AUTH_TOAST_ID = 'auth-session';

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
  const userRef = useRef<User | null>(null);
  const verifyingTokenRef = useRef<string | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistSession = useCallback((next: User | null) => {
    if (next?.accessToken) {
      localStorage.setItem(TOKEN_KEY, next.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  // O localStorage pode já guardar o token de outra conta (login em outra aba); não apagá-lo.
  const endDeadSession = useCallback((deadToken: string) => {
    if (userRef.current?.accessToken !== deadToken) return;
    if (localStorage.getItem(TOKEN_KEY) === deadToken) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    userRef.current = null;
    setUser(null);
    toast.error('Sua sessão foi encerrada. Entre novamente.', { id: AUTH_TOAST_ID });
  }, []);

  useEffect(() => {
    return onSessionInvalid((kind, token) => {
      if (userRef.current?.accessToken !== token) return;
      if (kind === 'unauthorized') {
        endDeadSession(token);
        return;
      }
      if (verifyingTokenRef.current === token) return;
      verifyingTokenRef.current = token;
      getJson<{ user: PayloadUserDoc | null }>(`${USERS_API}/me`, token)
        .then((data) => {
          if (!data.user) endDeadSession(token);
        })
        .catch(() => {
          /* falha de rede não derruba a sessão; 401 já é tratado pelo próprio aviso */
        })
        .finally(() => {
          verifyingTokenRef.current = null;
        });
    });
  }, [endDeadSession]);

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
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
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

  // O evento storage só dispara nas outras abas; a aba que fez login/logout já atualizou o estado.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== TOKEN_KEY && event.key !== null) return;

      const nextToken = localStorage.getItem(TOKEN_KEY);
      if (nextToken === (userRef.current?.accessToken ?? null)) return;

      if (!nextToken) {
        if (userRef.current) {
          userRef.current = null;
          setUser(null);
          toast.info('Você saiu da conta em outra aba.', { id: AUTH_TOAST_ID });
        }
        return;
      }

      getJson<{ user: PayloadUserDoc | null }>(`${USERS_API}/me`, nextToken)
        .then((data) => {
          if (localStorage.getItem(TOKEN_KEY) !== nextToken) return;
          if (!data.user) {
            userRef.current = null;
            setUser(null);
            return;
          }
          const next = buildUser(data.user, nextToken);
          const previousId = userRef.current?.id;
          userRef.current = next;
          setUser(next);
          if (previousId !== next.id) {
            toast.info(`Conta trocada em outra aba: ${next.email}`, { id: AUTH_TOAST_ID });
          }
        })
        .catch(() => {
          if (localStorage.getItem(TOKEN_KEY) !== nextToken) return;
          userRef.current = null;
          setUser(null);
        });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email: string, password: string, _roleHint: UserRole): Promise<UserRole> => {
    try {
      assertSecureTransport();
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
        ? 'Conta bloqueada temporariamente por excesso de tentativas. Aguarde alguns minutos.'
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
      assertSecureTransport();
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
      localStorage.removeItem(USER_KEY);
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Sessão expirada. Entre novamente.');
    assertSecureTransport();

    // O PATCH do Payload não confere a senha atual, então ela é validada via login antes.
    let token: string;
    try {
      const data = await postJson<{ token: string }>(`${USERS_API}/login`, {
        email: user.email,
        password: currentPassword,
      });
      token = data.token;
    } catch (e) {
      const raw = e instanceof PayloadApiError ? extractPayloadMessage(e.data) || e.message : '';
      if (/locked/i.test(raw)) {
        throw new Error('Conta bloqueada temporariamente por excesso de tentativas. Aguarde alguns minutos.');
      }
      throw new Error('Senha atual incorreta.');
    }

    try {
      await patchJson(`${USERS_API}/${user.id}`, { password: newPassword }, token);
    } catch (e) {
      const msg = e instanceof PayloadApiError ? extractPayloadMessage(e.data) || e.message : '';
      throw new Error(msg || 'Não foi possível alterar a senha.');
    }

    const next = { ...user, accessToken: token };
    setUser(next);
    persistSession(next);
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
        changePassword,
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
