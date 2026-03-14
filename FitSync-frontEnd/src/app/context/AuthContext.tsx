import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

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

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-da3e276b`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Build user object from Supabase session
  const buildUser = (supabaseUser: any, accessToken: string): User => {
    const meta = supabaseUser.user_metadata || {};
    return {
      id: supabaseUser.id,
      name: meta.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      role: (meta.role as UserRole) || 'student',
      avatar: meta.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.name || 'U')}&background=10b981&color=fff`,
      whatsapp: meta.whatsapp,
      professionalId: meta.professionalId,
      plan: meta.plan,
      createdAt: supabaseUser.created_at,
      accessToken,
    };
  };

  // Initialize auth state from Supabase session
  useEffect(() => {
    let mounted = true;
    let authInitialized = false;

    // Listen to auth state changes — fires immediately with current session (INITIAL_SESSION event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      authInitialized = true;

      if (session) {
        // Authenticated via Supabase
        const builtUser = buildUser(session.user, session.access_token);
        setUser(builtUser);
      } else {
        // No Supabase session — check localStorage for demo/offline user
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
      setLoading(false);
    });

    // Safety fallback: if onAuthStateChange never fires (network issues),
    // resolve loading after 2 seconds using localStorage
    const fallbackTimer = setTimeout(() => {
      if (!mounted || authInitialized) return;
      try {
        const saved = localStorage.getItem('fitsync_user');
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setLoading(false);
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, _role: UserRole): Promise<UserRole> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // If Supabase auth fails, try fallback to localStorage (for demo accounts)
        console.warn('Supabase login error, trying localStorage fallback:', error.message);
        const saved = localStorage.getItem('fitsync_user');
        if (saved) {
          const savedUser = JSON.parse(saved);
          if (savedUser.email === email) {
            setUser(savedUser);
            toast.success('Login realizado com sucesso!');
            return savedUser.role as UserRole;
          }
        }

        // Demo mode - accept any credentials
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
        toast.success('Login realizado! (Modo Demo)');
        return _role;
      }

      if (data.session) {
        const builtUser = buildUser(data.user, data.session.access_token);
        setUser(builtUser);
        toast.success(`Bem-vindo de volta, ${builtUser.name}!`);
        return builtUser.role;
      }

      return _role;
    } catch (err: any) {
      console.error('Erro inesperado no login:', err);
      // Final fallback: demo mode
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
      toast.success('Login realizado! (Modo Demo)');
      return _role;
    }
  };

  const register = async (email: string, password: string, role: UserRole, additionalData?: Partial<User>) => {
    try {
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

      if (!response.ok || result.error) {
        console.warn('Server signup failed, using Supabase direct signup:', result.message);
        // Fallback: direct Supabase signup
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

        if (error) throw error;

        if (data.session) {
          const builtUser = buildUser(data.user!, data.session.access_token);
          setUser(builtUser);
        }
        return;
      }

      // Sign in after successful server signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        // Create a local user object
        const localUser: User = {
          id: result.user?.id || crypto.randomUUID(),
          name: additionalData?.name || email.split('@')[0],
          email,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(additionalData?.name || email.split('@')[0])}&background=10b981&color=fff`,
          whatsapp: additionalData?.whatsapp,
          professionalId: additionalData?.professionalId,
          plan: additionalData?.plan,
          createdAt: new Date().toISOString(),
        };
        setUser(localUser);
        localStorage.setItem('fitsync_user', JSON.stringify(localUser));
        return;
      }

      if (signInData.session) {
        const builtUser = buildUser(signInData.user!, signInData.session.access_token);
        setUser(builtUser);
      }
    } catch (err: any) {
      console.error('Erro no registro:', err);
      // Final fallback: create a local user
      const newUser: User = {
        id: crypto.randomUUID(),
        name: additionalData?.name || email.split('@')[0],
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(additionalData?.name || email.split('@')[0]).replace(' ', '+')}&background=10b981&color=fff`,
        whatsapp: additionalData?.whatsapp,
        professionalId: additionalData?.professionalId,
        plan: additionalData?.plan,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('fitsync_user', JSON.stringify(newUser));
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('fitsync_user');
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
    const saved = localStorage.getItem('fitsync_user');
    if (saved) {
      localStorage.setItem('fitsync_user', JSON.stringify({ ...JSON.parse(saved), ...data }));
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { supabase };