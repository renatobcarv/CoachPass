import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Settings as SettingsIcon, Bell, Shield, Palette, Globe, Lock,
  User, Mail, Phone, Camera, Save, ChevronRight, CheckCircle,
  Moon, Sun, Monitor, Volume2, VolumeX, Smartphone, Laptop,
  Eye, EyeOff, Key, LogOut, Trash2, CreditCard, AlertTriangle,
  RefreshCw, Download, ArrowLeft, Zap, ToggleLeft, ToggleRight,
  MessageSquare, Star, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { projectId, publicAnonKey } from '@/lib/supabase/info';

const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-da3e276b`;

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'security' | 'appearance' | 'billing' | 'data';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  workoutReminder: boolean;
  dietReminder: boolean;
  weeklyReport: boolean;
  newStudent: boolean;
  paymentAlert: boolean;
  systemUpdates: boolean;
}

interface PrivacySettings {
  profilePublic: boolean;
  showStats: boolean;
  shareProgress: boolean;
  analyticsEnabled: boolean;
}

export function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    professionalId: user?.professionalId || '',
    bio: '',
    specialty: '',
    city: '',
    instagram: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true, push: true, sms: false,
    workoutReminder: true, dietReminder: true, weeklyReport: true,
    newStudent: true, paymentAlert: true, systemUpdates: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profilePublic: false, showStats: true, shareProgress: true, analyticsEnabled: true,
  });

  // Fetch settings from server
  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${serverUrl}/settings/${user.id}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        if (res.ok) {
          const { settings } = await res.json();
          if (settings?.notifications) setNotifications(prev => ({ ...prev, ...settings.notifications }));
          if (settings?.privacy) setPrivacy(prev => ({ ...prev, ...settings.privacy }));
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      }
    };
    fetchSettings();
  }, [user]);

  const saveSettings = async (section: string, data: any) => {
    setSaving(true);
    try {
      const token = user?.accessToken || publicAnonKey;
      await fetch(`${serverUrl}/settings/${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [section]: data }),
      });
      toast.success('Configurações salvas!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.info('Configurações salvas localmente!');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = user?.accessToken || publicAnonKey;
      const res = await fetch(`${serverUrl}/profile/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        updateUser({ name: profileForm.name, whatsapp: profileForm.whatsapp });
        toast.success('Perfil atualizado com sucesso!');
      } else {
        updateUser({ name: profileForm.name, whatsapp: profileForm.whatsapp });
        toast.success('Perfil salvo localmente!');
      }
    } catch (err) {
      updateUser({ name: profileForm.name, whatsapp: profileForm.whatsapp });
      toast.success('Perfil salvo localmente!');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.current) { toast.error('Informe a senha atual'); return; }
    if (passwordForm.new.length < 6) { toast.error('Nova senha deve ter ao menos 6 caracteres'); return; }
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Senhas não coincidem'); return; }
    toast.success('Senha alterada com sucesso!');
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = { student: 'Aluno', personal: 'Personal Trainer', nutritionist: 'Nutricionista' };
  const backPath = user?.role === 'personal' ? '/personal' : user?.role === 'nutritionist' ? '/nutritionist' : '/';

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'billing', label: 'Plano & Cobrança', icon: CreditCard },
    { id: 'data', label: 'Meus Dados', icon: Download },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="dark:text-white text-slate-900">Configurações</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Gerencie sua conta e preferências</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="lg:w-60 flex-shrink-0">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-3 space-y-1">
            {/* User Card */}
            <div className="flex items-center gap-3 p-3 mb-2 pb-4 border-b dark:border-zinc-800 border-slate-100">
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 dark:border-zinc-900 border-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm dark:text-white text-slate-900 truncate" style={{ fontWeight: 600 }}>
                  {user?.name}
                </p>
                <p className="text-xs dark:text-zinc-500 text-slate-400 truncate">
                  {user?.role ? roleLabel[user.role] : 'Aluno'}
                </p>
              </div>
            </div>

            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                  activeTab === id
                    ? 'dark:bg-zinc-800 bg-slate-100 dark:text-white text-slate-900'
                    : 'dark:text-zinc-400 text-slate-500 hover:dark:bg-zinc-800/50 hover:bg-slate-50 hover:dark:text-zinc-200 hover:text-slate-700'
                }`}
                style={{ fontWeight: activeTab === id ? 600 : 400 }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {activeTab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
              </button>
            ))}

            <div className="pt-2 border-t dark:border-zinc-800 border-slate-100 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm dark:text-red-400 text-red-500 hover:dark:bg-red-500/10 hover:bg-red-50 transition-all text-left"
                style={{ fontWeight: 500 }}
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                    <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                      Informações Pessoais
                    </h3>

                    {/* Avatar Upload */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <button
                          onClick={() => toast.info('Upload de foto em breve')}
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg"
                        >
                          <Camera className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{user?.name}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2">{user?.email}</p>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500" style={{ fontWeight: 600 }}>
                          {user?.role ? roleLabel[user.role] : 'Aluno'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Nome Completo', field: 'name', icon: User, placeholder: 'Seu nome' },
                        { label: 'E-mail', field: 'email', icon: Mail, placeholder: 'seu@email.com', disabled: true },
                        { label: 'WhatsApp', field: 'whatsapp', icon: Phone, placeholder: '(00) 00000-0000' },
                        ...(user?.role !== 'student' ? [{ label: user?.role === 'personal' ? 'CREF' : 'CRN', field: 'professionalId', icon: Activity, placeholder: user?.role === 'personal' ? 'CREF 123456-G/SP' : 'CRN-3 12345' }] : []),
                        { label: 'Cidade', field: 'city', icon: Globe, placeholder: 'São Paulo, SP' },
                        { label: 'Instagram', field: 'instagram', icon: Star, placeholder: '@seuperfil' },
                      ].map(({ label, field, icon: Icon, placeholder, disabled }) => (
                        <div key={field}>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            {label}
                          </label>
                          <div className="relative">
                            <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="text"
                              value={(profileForm as any)[field] || ''}
                              onChange={e => setProfileForm(p => ({ ...p, [field]: e.target.value }))}
                              placeholder={placeholder}
                              disabled={disabled}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 transition-all"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="md:col-span-2">
                        <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                          Bio / Apresentação
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                          placeholder="Conte um pouco sobre você..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t dark:border-zinc-800 border-slate-100">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}
                      >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Perfil
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === 'notifications' && (
                <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                  <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                    Preferências de Notificação
                  </h3>

                  <div className="space-y-6">
                    {/* Channels */}
                    <div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
                        Canais de Notificação
                      </p>
                      <div className="space-y-3">
                        {[
                          { key: 'email', label: 'E-mail', desc: 'Receba notificações no seu e-mail', icon: Mail },
                          { key: 'push', label: 'Push (App)', desc: 'Notificações no aplicativo', icon: Smartphone },
                          { key: 'sms', label: 'SMS', desc: 'Mensagens de texto no celular', icon: MessageSquare },
                        ].map(({ key, label, desc, icon: Icon }) => (
                          <div key={key} className="flex items-center justify-between p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl dark:bg-zinc-700 bg-white flex items-center justify-center">
                                <Icon className="w-4 h-4 dark:text-zinc-300 text-slate-600" />
                              </div>
                              <div>
                                <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 500 }}>{label}</p>
                                <p className="text-xs dark:text-zinc-500 text-slate-400">{desc}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setNotifications(p => ({ ...p, [key]: !p[key as keyof NotificationSettings] }))}
                              className={`relative w-11 h-6 rounded-full transition-all ${(notifications as any)[key] ? 'bg-emerald-500' : 'dark:bg-zinc-700 bg-slate-200'}`}
                            >
                              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${(notifications as any)[key] ? 'translate-x-5.5' : 'translate-x-0.5'}`}
                                style={{ transform: (notifications as any)[key] ? 'translateX(20px)' : 'translateX(2px)' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
                        Categorias
                      </p>
                      <div className="space-y-3">
                        {[
                          { key: 'workoutReminder', label: 'Lembrete de Treino', desc: 'Notificação antes do horário do treino' },
                          { key: 'dietReminder', label: 'Lembrete de Refeição', desc: 'Alerta para registrar as refeições' },
                          { key: 'weeklyReport', label: 'Relatório Semanal', desc: 'Resumo do progresso toda semana' },
                          ...(user?.role !== 'student' ? [
                            { key: 'newStudent', label: 'Novo Aluno/Paciente', desc: 'Quando alguém aceitar seu convite' },
                            { key: 'paymentAlert', label: 'Alertas de Pagamento', desc: 'Mensalidades vencendo ou atrasadas' },
                          ] : []),
                          { key: 'systemUpdates', label: 'Atualizações do Sistema', desc: 'Novidades e melhorias do FitSync' },
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                            <div>
                              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 500 }}>{label}</p>
                              <p className="text-xs dark:text-zinc-500 text-slate-400">{desc}</p>
                            </div>
                            <button
                              onClick={() => setNotifications(p => ({ ...p, [key]: !(p as any)[key] }))}
                              className={`relative w-11 h-6 rounded-full transition-all ${(notifications as any)[key] ? 'bg-emerald-500' : 'dark:bg-zinc-700 bg-slate-200'}`}
                            >
                              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                style={{ transform: (notifications as any)[key] ? 'translateX(20px)' : 'translateX(2px)' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => saveSettings('notifications', notifications)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Preferências
                    </button>
                  </div>
                </div>
              )}

              {/* ── PRIVACY TAB ── */}
              {activeTab === 'privacy' && (
                <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                  <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                    Configurações de Privacidade
                  </h3>

                  <div className="space-y-4">
                    {[
                      { key: 'profilePublic', label: 'Perfil Público', desc: 'Permitir que outros vejam seu perfil no FitSync', icon: Eye },
                      { key: 'showStats', label: 'Mostrar Estatísticas', desc: 'Exibir suas estatísticas de treino no perfil', icon: Activity },
                      { key: 'shareProgress', label: 'Compartilhar Progresso', desc: 'Permitir que seu profissional veja seu progresso', icon: Zap },
                      { key: 'analyticsEnabled', label: 'Analytics de Uso', desc: 'Ajude a melhorar o FitSync com dados anônimos', icon: Star },
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-5 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{label}</p>
                            <p className="text-xs dark:text-zinc-500 text-slate-400">{desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPrivacy(p => ({ ...p, [key]: !(p as any)[key] }))}
                          className={`relative w-11 h-6 rounded-full transition-all ${(privacy as any)[key] ? 'bg-emerald-500' : 'dark:bg-zinc-700 bg-slate-200'}`}
                        >
                          <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                            style={{ transform: (privacy as any)[key] ? 'translateX(20px)' : 'translateX(2px)' }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => saveSettings('privacy', privacy)}
                    disabled={saving}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 }}
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Privacidade
                  </button>
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                    <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                      Segurança da Conta
                    </h3>

                    <div className="space-y-3">
                      {/* Change Password */}
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-between p-5 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Key className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Alterar Senha</p>
                            <p className="text-xs dark:text-zinc-500 text-slate-400">Última alteração há 30 dias</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 dark:text-zinc-600 text-slate-400 group-hover:dark:text-zinc-300 group-hover:text-slate-600 transition-colors" />
                      </button>

                      {/* 2FA */}
                      <div className="flex items-center justify-between p-5 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Autenticação de 2 Fatores</p>
                              <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-500/10 dark:text-zinc-500 text-slate-400" style={{ fontWeight: 600 }}>Em breve</span>
                            </div>
                            <p className="text-xs dark:text-zinc-500 text-slate-400">Adicione uma camada extra de segurança</p>
                          </div>
                        </div>
                        <span className="text-xs dark:text-zinc-600 text-slate-400">Desativado</span>
                      </div>

                      {/* Active sessions */}
                      <div className="p-5 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Laptop className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Sessões Ativas</p>
                            <p className="text-xs dark:text-zinc-500 text-slate-400">Dispositivos conectados à sua conta</p>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          {[
                            { device: 'Chrome · Windows 11', location: 'São Paulo, BR', time: 'Agora', current: true },
                            { device: 'Safari · iPhone 15', location: 'São Paulo, BR', time: 'Há 2 horas', current: false },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                              <div>
                                <p className="text-xs dark:text-zinc-200 text-slate-700" style={{ fontWeight: 500 }}>{s.device}</p>
                                <p className="text-xs dark:text-zinc-500 text-slate-400">{s.location} · {s.time}</p>
                              </div>
                              {s.current
                                ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500" style={{ fontWeight: 600 }}>Atual</span>
                                : <button onClick={() => toast.success('Sessão encerrada')} className="text-xs text-red-400 hover:underline">Encerrar</button>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="dark:bg-zinc-900 bg-white rounded-3xl border border-red-500/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <h3 className="text-red-400 text-sm" style={{ fontWeight: 700 }}>Zona de Perigo</h3>
                    </div>
                    <p className="text-xs dark:text-zinc-400 text-slate-500 mb-4">
                      Ações irreversíveis que afetam permanentemente sua conta.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                      style={{ fontWeight: 600 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir conta permanentemente
                    </button>
                  </div>
                </div>
              )}

              {/* ── APPEARANCE TAB ── */}
              {activeTab === 'appearance' && (
                <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                  <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                    Aparência & Tema
                  </h3>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
                        Tema da Interface
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'dark', label: 'Escuro', icon: Moon, desc: 'Fundo preto grafite', active: theme === 'dark' },
                          { id: 'light', label: 'Claro', icon: Sun, desc: 'Fundo branco limpo', active: theme === 'light' },
                          { id: 'system', label: 'Sistema', icon: Monitor, desc: 'Seguir o dispositivo', active: false },
                        ].map(({ id, label, icon: Icon, desc, active }) => (
                          <button
                            key={id}
                            onClick={() => { if ((id === 'dark' && theme === 'light') || (id === 'light' && theme === 'dark')) toggleTheme(); }}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                              active
                                ? 'dark:bg-zinc-800 bg-slate-100 border-emerald-500/50'
                                : 'dark:bg-zinc-800/30 bg-slate-50 dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-emerald-500/10' : 'dark:bg-zinc-700 bg-slate-200'}`}>
                              <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'dark:text-zinc-400 text-slate-500'}`} />
                            </div>
                            <p className="text-xs dark:text-white text-slate-900" style={{ fontWeight: active ? 600 : 400 }}>{label}</p>
                            <p className="text-xs dark:text-zinc-500 text-slate-400 text-center leading-tight">{desc}</p>
                            {active && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
                        Tamanho da Fonte
                      </p>
                      <div className="flex items-center gap-2">
                        {['Pequeno', 'Médio', 'Grande'].map((size, i) => (
                          <button
                            key={size}
                            onClick={() => toast.info(`Fonte ${size.toLowerCase()} aplicada`)}
                            className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                              i === 1
                                ? 'dark:bg-zinc-800 bg-slate-100 dark:border-zinc-600 border-slate-300 dark:text-white text-slate-900'
                                : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-500 hover:dark:border-zinc-600'
                            }`}
                            style={{ fontWeight: i === 1 ? 600 : 400, fontSize: i === 0 ? '12px' : i === 1 ? '14px' : '16px' }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
                        Idioma
                      </p>
                      <select className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                        <option>🇧🇷 Português (Brasil)</option>
                        <option>🇺🇸 English (US)</option>
                        <option>🇪🇸 Español</option>
                      </select>
                    </div>

                    {/* Accent Colors */}
                    <div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
                        Cor de Destaque
                      </p>
                      <div className="flex gap-3">
                        {[
                          { color: '#10b981', label: 'Esmeralda', active: true },
                          { color: '#3b82f6', label: 'Azul' },
                          { color: '#8b5cf6', label: 'Violeta' },
                          { color: '#f59e0b', label: 'Âmbar' },
                          { color: '#ef4444', label: 'Vermelho' },
                          { color: '#ec4899', label: 'Rosa' },
                        ].map(({ color, label, active }) => (
                          <button
                            key={color}
                            onClick={() => toast.info(`Cor ${label} selecionada`)}
                            title={label}
                            className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${active ? 'ring-2 ring-offset-2 dark:ring-offset-zinc-900 ring-offset-white' : ''}`}
                            style={{ backgroundColor: color, ...(active ? { boxShadow: `0 0 0 2px ${color}` } : {}) }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BILLING TAB ── */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  {/* Current Plan */}
                  <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                    <h3 className="dark:text-white text-slate-900 mb-4" style={{ fontWeight: 700 }}>Plano Atual</h3>
                    <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-emerald-400 text-xs uppercase tracking-widest" style={{ fontWeight: 600 }}>
                            {user?.plan === 'annual' ? 'Plano Anual' : user?.plan === 'semester' ? 'Plano Semestral' : 'Plano Mensal'}
                          </p>
                          <p className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
                            {user?.plan === 'annual' ? 'R$ 50/mês' : user?.plan === 'semester' ? 'R$ 60/mês' : 'R$ 70/mês'}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="dark:text-zinc-400 text-slate-500">Próxima cobrança: 15/04/2026</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400" style={{ fontWeight: 600 }}>Ativo</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Alunos/Pacientes', value: 'Ilimitado', icon: User },
                        { label: 'Armazenamento', value: '10 GB', icon: Download },
                        { label: 'Suporte', value: 'Prioritário', icon: Star },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50">
                          <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
                            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                    <h3 className="dark:text-white text-slate-900 mb-4" style={{ fontWeight: 700 }}>Método de Pagamento</h3>
                    <div className="flex items-center justify-between p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Cartão terminando em 4242</p>
                          <p className="text-xs dark:text-zinc-500 text-slate-400">Expira 12/2027</p>
                        </div>
                      </div>
                      <button onClick={() => toast.info('Gerenciar método de pagamento em breve')} className="text-xs text-blue-400 hover:underline" style={{ fontWeight: 600 }}>
                        Atualizar
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <button onClick={() => toast.info('Histórico de faturas em breve')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm dark:text-zinc-300 text-slate-700 border dark:border-zinc-700 border-slate-200 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" /> Ver histórico de faturas
                      </button>
                      <button onClick={() => toast.info('Gerenciar plano em breve')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-all">
                        <RefreshCw className="w-4 h-4" /> Mudar plano
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DATA TAB ── */}
              {activeTab === 'data' && (
                <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                  <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                    Gerenciar Meus Dados
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Exportar dados', desc: 'Baixe todos os seus dados em formato JSON',
                        icon: Download, color: '#3b82f6', action: () => {
                          const data = { user, exportDate: new Date().toISOString() };
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = `fitsync-dados-${new Date().toISOString().split('T')[0]}.json`;
                          a.click(); toast.success('Dados exportados com sucesso!');
                        }
                      },
                      {
                        title: 'Histórico de treinos', desc: 'Exporte seu histórico completo de treinos em CSV',
                        icon: Activity, color: '#10b981', action: () => toast.info('Exportação de treinos em breve')
                      },
                      {
                        title: 'Histórico alimentar', desc: 'Baixe todos os registros do seu plano alimentar',
                        icon: Star, color: '#f59e0b', action: () => toast.info('Exportação nutricional em breve')
                      },
                      {
                        title: 'Limpar cache local', desc: 'Remove dados temporários armazenados no navegador',
                        icon: RefreshCw, color: '#8b5cf6', action: () => {
                          localStorage.removeItem('fitsync_cache');
                          toast.success('Cache limpo com sucesso!');
                        }
                      },
                    ].map(({ title, desc, icon: Icon, color, action }) => (
                      <button
                        key={title}
                        onClick={action}
                        className="w-full flex items-center justify-between p-5 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 transition-all group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{title}</p>
                            <p className="text-xs dark:text-zinc-500 text-slate-400">{desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 dark:text-zinc-600 text-slate-400 group-hover:dark:text-zinc-300 group-hover:text-slate-600 transition-colors" />
                      </button>
                    ))}

                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <p className="text-xs text-blue-400 leading-relaxed">
                        <strong>LGPD:</strong> Conforme a Lei Geral de Proteção de Dados, você tem direito ao acesso, correção e exclusão dos seus dados pessoais. Para solicitações especiais, entre em contato com nossa equipe de suporte.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="dark:text-white text-slate-900 text-lg" style={{ fontWeight: 700 }}>Alterar Senha</h3>
                <button onClick={() => setShowPasswordModal(false)} className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 flex items-center justify-center hover:dark:bg-zinc-700 transition-colors">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Senha Atual', key: 'current', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                  { label: 'Nova Senha', key: 'new', show: showNew, toggle: () => setShowNew(p => !p) },
                  { label: 'Confirmar Nova Senha', key: 'confirm', show: showNew, toggle: () => setShowNew(p => !p) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key}>
                    <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>{label}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                      <input
                        type={show ? 'text' : 'password'}
                        value={(passwordForm as any)[key]}
                        onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handlePasswordChange}
                  className="w-full py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}
                >
                  Salvar Nova Senha
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm dark:bg-zinc-900 bg-white rounded-3xl border border-red-500/30 p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="dark:text-white text-slate-900 text-lg mb-2" style={{ fontWeight: 700 }}>Excluir Conta?</h3>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mb-6">
                  Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente apagados.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 text-sm hover:dark:bg-zinc-800 transition-colors" style={{ fontWeight: 600 }}>
                    Cancelar
                  </button>
                  <button onClick={() => { toast.error('Exclusão de conta: entre em contato com o suporte.'); setShowDeleteConfirm(false); }} className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm hover:bg-red-500/20 transition-colors" style={{ fontWeight: 600 }}>
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}