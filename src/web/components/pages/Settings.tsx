import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BillingPanel } from '../pricing/BillingPanel';
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
import { USERS_API, PayloadApiError, extractPayloadMessage, patchJson, postJson } from '@/lib/cms';
import { deleteCurrentUser, exportMyData, fetchMeUser } from '../../lib/professionalApi';
import { uploadProfilePhoto } from '../../lib/studentApi';
import { AuthedImage } from '../AuthedImage';
import { PasswordStrength } from '../forms/PasswordInput';
import { credentialError, isStrongEnough, maskPhoneBR, nameError, phoneError } from '../../lib/validation';

const errMsg = (err: unknown, fallback: string) =>
  err instanceof PayloadApiError
    ? extractPayloadMessage(err.data) || err.message
    : err instanceof Error
      ? err.message
      : fallback;

type SettingsTab = 'profile' | 'security' | 'appearance' | 'billing' | 'data';

function SettingsToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000326]/40 ${
        checked ? 'bg-[#000326] dark:bg-[#C5C5CE]' : 'bg-slate-200 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ${
          checked
            ? 'translate-x-5 bg-white dark:bg-[#000326]'
            : 'translate-x-0 bg-white'
        }`}
      />
    </button>
  )
}

export function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [searchParams] = useSearchParams();
  // ?aba=cobranca abre direto o plano; a volta do pagamento também
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    searchParams.get('aba') === 'cobranca' || searchParams.get('assinatura') ? 'billing' : 'profile',
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Exclusão definitiva (LGPD): a API apaga a conta e os dados ligados a ela
  const handleDeleteAccount = async () => {
    if (!user?.accessToken || !user.id) return;
    setDeleting(true);
    try {
      await deleteCurrentUser(String(user.id), user.accessToken);
      setShowDeleteConfirm(false);
      toast.success('Sua conta e seus dados foram excluídos.');
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : '';
      toast.error(msg || 'Não foi possível excluir a conta agora. Tente de novo.');
    } finally {
      setDeleting(false);
    }
  };

  // Exportação real (LGPD): busca no servidor tudo o que está ligado à conta
  const handleExportData = async () => {
    if (!user?.accessToken) return;
    setExporting(true);
    try {
      const data = await exportMyData(user.accessToken);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coachpass-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Seus dados foram exportados.');
    } catch {
      toast.error('Não foi possível exportar agora. Tente de novo.');
    } finally {
      setExporting(false);
    }
  };
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
    city: '',
    instagram: '',
  });
  const [uploading, setUploading] = useState(false);
  const photoInput = React.useRef<HTMLInputElement>(null);

  // Bio, cidade e Instagram ficam na conta: carrega do servidor
  useEffect(() => {
    if (!user?.accessToken) return;
    fetchMeUser(user.accessToken)
      .then((me) => {
        if (!me) return;
        setProfileForm((p) => ({ ...p, bio: me.bio || '', city: me.city || '', instagram: me.instagram || '' }));
        if (me.avatarUrl && me.avatarUrl !== user.avatar) updateUser({ avatar: me.avatarUrl });
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]);

  const handlePhoto = async (file?: File | null) => {
    if (!file || !user?.accessToken) return;
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(file, user.accessToken);
      await patchJson(`${USERS_API}/${user.id}`, { avatarUrl: url }, user.accessToken);
      updateUser({ avatar: url });
      toast.success('Foto atualizada.');
    } catch (err) {
      toast.error('Não foi possível enviar a foto', { description: errMsg(err, 'Tente outra imagem.') });
    } finally {
      setUploading(false);
      if (photoInput.current) photoInput.current.value = '';
    }
  };

  const saveProfile = async () => {
    if (!user?.accessToken) return;
    const isPro = user.role === 'personal' || user.role === 'nutritionist';
    const problem =
      nameError(profileForm.name) ||
      phoneError(profileForm.whatsapp, false) ||
      (isPro ? credentialError(profileForm.professionalId, user.role === 'nutritionist' ? 'nutritionist' : 'personal') : null);
    if (problem) {
      toast.error('Confira os dados do perfil', { description: problem });
      return;
    }
    setSaving(true);
    try {
      // Nome, WhatsApp e registro vão para a conta (API do CoachPass)
      await patchJson(
        `${USERS_API}/${user.id}`,
        {
          name: profileForm.name.trim(),
          whatsapp: profileForm.whatsapp.trim() || null,
          bio: profileForm.bio.trim() || null,
          city: profileForm.city.trim() || null,
          instagram: profileForm.instagram.trim().replace(/^@?/, profileForm.instagram.trim() ? '@' : '') || null,
          ...(isPro ? { professionalId: profileForm.professionalId.trim().toUpperCase() } : {}),
        },
        user.accessToken,
      );
      updateUser({
        name: profileForm.name.trim(),
        whatsapp: profileForm.whatsapp.trim(),
        ...(isPro ? { professionalId: profileForm.professionalId.trim().toUpperCase() } : {}),
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error('Não foi possível salvar o perfil', { description: errMsg(err, 'Tente novamente.') });
    } finally {
      setSaving(false);
    }
  };

  const [changingPassword, setChangingPassword] = useState(false);
  const handlePasswordChange = async () => {
    if (!user?.accessToken || !user.email) return;
    if (!passwordForm.current) { toast.error('Informe a senha atual'); return; }
    if (!isStrongEnough(passwordForm.new)) {
      toast.error('Senha fraca', { description: 'Use 8+ caracteres, com pelo menos uma letra e um número.' });
      return;
    }
    if (passwordForm.new === passwordForm.current) { toast.error('A nova senha precisa ser diferente da atual'); return; }
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Senhas não coincidem'); return; }
    setChangingPassword(true);
    try {
      // 1) confirma a senha atual (evita troca por alguém com o aparelho desbloqueado)
      try {
        await postJson(`${USERS_API}/login`, { email: user.email, password: passwordForm.current });
      } catch (err) {
        const raw = errMsg(err, '');
        toast.error(/locked/i.test(raw) ? 'Muitas tentativas. Aguarde 10 minutos.' : 'Senha atual incorreta.');
        return;
      }
      // 2) grava a nova senha na conta
      await patchJson(`${USERS_API}/${user.id}`, { password: passwordForm.new }, user.accessToken);
      toast.success('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error('Não foi possível alterar a senha', { description: errMsg(err, 'Tente novamente.') });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel: Record<string, string> = {
    master: 'Master',
    student: 'Aluno',
    personal: 'Personal Trainer',
    nutritionist: 'Nutricionista',
  };
  const backPath = user?.role === 'personal' ? '/personal' : user?.role === 'nutritionist' ? '/nutritionist' : '/app';

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'billing', label: 'Plano e cobrança', icon: CreditCard },
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
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#000326] dark:bg-white border-2 dark:border-zinc-900 border-white" />
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
                {activeTab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#000326] dark:text-white" />}
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
                        <AuthedImage
                          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10b981&color=fff`}
                          alt={user?.name || 'Foto de perfil'}
                          token={user?.accessToken}
                          className={`w-20 h-20 rounded-2xl object-cover ${uploading ? 'opacity-50' : ''}`}
                        />
                        <input
                          ref={photoInput}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => void handlePhoto(e.target.files?.[0])}
                        />
                        <button
                          type="button"
                          aria-label="Trocar foto de perfil"
                          disabled={uploading}
                          onClick={() => photoInput.current?.click()}
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#000326] text-white dark:bg-white dark:text-[#000326] flex items-center justify-center shadow-lg"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{user?.name}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2">{user?.email}</p>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#000326] text-white dark:bg-white/15 dark:text-white" style={{ fontWeight: 600 }}>
                          {user?.role ? roleLabel[user.role] : 'Aluno'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Nome Completo', field: 'name', icon: User, placeholder: 'Seu nome' },
                        { label: 'E-mail', field: 'email', icon: Mail, placeholder: 'seu@gmail.com', disabled: true },
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
                              onChange={e =>
                                setProfileForm(p => ({
                                  ...p,
                                  [field]: field === 'whatsapp' ? maskPhoneBR(e.target.value) : e.target.value,
                                }))
                              }
                              placeholder={field === 'whatsapp' ? '(11) 98765-4321' : placeholder}
                              disabled={disabled}
                              maxLength={field === 'whatsapp' ? 15 : 120}
                              inputMode={field === 'whatsapp' ? 'numeric' : undefined}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000326]/30 dark:ring-white/30 disabled:opacity-50 transition-all"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="md:col-span-2">
                        <label htmlFor="settings-bio" className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                          Bio / apresentação
                        </label>
                        <textarea
                          id="settings-bio"
                          value={profileForm.bio}
                          maxLength={600}
                          onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                          placeholder="Conte um pouco sobre você..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000326]/30 dark:ring-white/30 resize-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t dark:border-zinc-800 border-slate-100">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#5a64b4,#000346)', fontWeight: 600 }}
                      >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Perfil
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
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
                                ? <span className="text-xs px-2 py-0.5 rounded-full bg-[#000326] text-white dark:bg-white/15 dark:text-white" style={{ fontWeight: 600 }}>Atual</span>
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
                                ? 'dark:bg-zinc-800 bg-slate-100 border-[#000326]/40 dark:border-white/40'
                                : 'dark:bg-zinc-800/30 bg-slate-50 dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-[#000326] dark:bg-white/10' : 'dark:bg-zinc-700 bg-slate-200'}`}>
                              <Icon className={`w-5 h-5 ${active ? 'text-[#5a64b4] dark:text-[#C5C5CE]' : 'dark:text-zinc-400 text-slate-500'}`} />
                            </div>
                            <p className="text-xs dark:text-white text-slate-900" style={{ fontWeight: active ? 600 : 400 }}>{label}</p>
                            <p className="text-xs dark:text-zinc-500 text-slate-400 text-center leading-tight">{desc}</p>
                            {active && <CheckCircle className="w-4 h-4 text-[#000326] dark:text-white" />}
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
                          { color: '#5a64b4', label: 'Marinho', active: true },
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
              {activeTab === 'billing' && <BillingPanel />}

              {/* ── DATA TAB ── */}
              {activeTab === 'data' && (
                <div className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6">
                  <h3 className="dark:text-white text-slate-900 mb-6" style={{ fontWeight: 700 }}>
                    Gerenciar Meus Dados
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        title: exporting ? 'Exportando…' : 'Exportar meus dados',
                        desc: 'Perfil, treinos, registros, dietas, avaliações e vínculos em um arquivo JSON',
                        icon: Download, color: '#3b82f6', action: () => { if (!exporting) void handleExportData(); }
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
                        maxLength={128}
                        autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                        spellCheck={false}
                        className="w-full pl-10 pr-10 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#000326]/30 dark:ring-white/30"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={toggle} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {key === 'new' && <PasswordStrength value={passwordForm.new} />}
                    {key === 'confirm' && passwordForm.confirm && passwordForm.confirm !== passwordForm.new && (
                      <p className="mt-2 text-[12.5px] text-[#ff8a95]">As senhas não coincidem.</p>
                    )}
                  </div>
                ))}
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="cp-selected w-full py-3 rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  {changingPassword ? 'Alterando…' : 'Salvar nova senha'}
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
                  <button onClick={() => void handleDeleteAccount()} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm hover:bg-red-500/20 transition-colors disabled:opacity-60" style={{ fontWeight: 600 }}>
                    {deleting ? 'Excluindo…' : 'Excluir'}
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