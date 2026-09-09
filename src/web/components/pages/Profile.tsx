import React, { useState, useRef } from 'react';
import {
  Edit3,
  Plus,
  X,
  Target,
  Scale,
  Ruler,
  Activity,
  Camera,
  Shield,
  ChevronRight,
  Star,
  Award,
  Zap,
  CheckCircle2,
  Mail,
  Phone,
  CreditCard,
  User,
  Briefcase,
  Save,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuth } from '../../context/AuthContext';
import { ProfessionalProfile } from '../ProfessionalProfile';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const progressPhotos = [
  {
    src: 'https://images.unsplash.com/photo-1758875569399-99a7d80ace43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300',
    label: 'Início',
    date: 'Jan 2024',
  },
  {
    src: 'https://images.unsplash.com/photo-1769876457918-1871f21d63bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300',
    label: '3 meses',
    date: 'Abr 2024',
  },
  {
    src: 'https://images.unsplash.com/photo-1635545999375-057ee4013deb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300',
    label: 'Atual',
    date: 'Ago 2024',
  },
];

const initialRestrictions = [
  'Lactose',
  'Exercícios de impacto no joelho',
  'Agachamento com barra',
  'Alimentos com glúten',
];

const badges = [
  { label: '12 dias seguidos', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Meta semanal', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: '35 treinos', icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Consistência', icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restrictions, setRestrictions] = useState(initialRestrictions);
  const [newRestriction, setNewRestriction] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    'Nome completo': 'Lucas Mendes',
    'Idade': '28 anos',
    'Email': 'lucas@email.com',
    'Telefone': '+55 11 99999-9999',
    'Nível de atividade': 'Avançado',
    'Programa': 'PPL 6x/semana',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Foto "${file.name}" enviada com sucesso!`);
    }
    e.target.value = '';
  };

  const handleSaveProfile = () => {
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const addRestriction = () => {
    if (newRestriction.trim()) {
      setRestrictions((prev) => [...prev, newRestriction.trim()]);
      setNewRestriction('');
      setAdding(false);
    }
  };

  const removeRestriction = (idx: number) => {
    setRestrictions((prev) => prev.filter((_, i) => i !== idx));
  };

  const bodyStats = [
    { label: 'Peso atual', value: '79.5', unit: 'kg', icon: Scale, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Altura', value: '1.82', unit: 'm', icon: Ruler, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: '% Gordura', value: '17.8', unit: '%', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'IMC', value: '24.0', unit: 'kg/m²', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const roleLabels: Record<string, string> = {
    master: 'Master',
    student: 'Aluno',
    personal: 'Personal Trainer',
    nutritionist: 'Nutricionista',
  };

  const planLabels = {
    monthly: 'Plano Mensal - R$ 70/mês',
    semester: 'Plano Semestral - R$ 360 (R$ 60/mês)',
    annual: 'Plano Anual - R$ 600 (R$ 50/mês)',
  };

  // Define se o usuário é profissional
  const isProfessional = user?.role === 'personal' || user?.role === 'nutritionist';

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="dark:text-white text-slate-900">Meu Perfil</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            Gerencie seus dados e preferências
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const settingsPath = user?.role === 'personal' ? '/personal/configuracoes' : user?.role === 'nutritionist' ? '/nutritionist/configuracoes' : '/app/configuracoes';
              navigate(settingsPath);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
          {!isProfessional && (
            <button
              onClick={() => editing ? handleSaveProfile() : setEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                editing
                  ? 'text-white'
                  : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600 hover:text-emerald-500'
              }`}
              style={editing ? { background: 'linear-gradient(135deg, #10b981, #3b82f6)' } : {}}
            >
              {editing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {editing ? 'Salvar alterações' : 'Editar perfil'}
            </button>
          )}
        </div>
      </div>

      {/* Account Information - For all users */}
      <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200 mb-6">
        <h2 className="dark:text-white text-slate-900 mb-4" style={{ fontWeight: 700 }}>
          Informações da Conta
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider">Nome Completo</p>
            </div>
            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
              {user?.name || 'Não informado'}
            </p>
          </div>

          {/* Email */}
          <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider">E-mail</p>
            </div>
            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
              {user?.email || 'Não informado'}
            </p>
          </div>

          {/* WhatsApp */}
          {user?.whatsapp && (
            <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider">WhatsApp</p>
              </div>
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                {user.whatsapp}
              </p>
            </div>
          )}

          {/* Tipo de Conta (Read-only) */}
          <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200 relative">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider">Tipo de Conta</p>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-md dark:bg-zinc-700 bg-slate-200 dark:text-zinc-400 text-slate-500">
                Somente leitura
              </span>
            </div>
            <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
              {user?.role ? roleLabels[user.role] : 'Não definido'}
            </p>
          </div>

          {/* Registro Profissional (Read-only) */}
          {user?.professionalId && (
            <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200 relative">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider">
                  {user.role === 'personal' ? 'CREF' : 'CRN'}
                </p>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-md dark:bg-zinc-700 bg-slate-200 dark:text-zinc-400 text-slate-500">
                  Somente leitura
                </span>
              </div>
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                {user.professionalId}
              </p>
            </div>
          )}

          {/* Plano Ativo */}
          {user?.plan && (
            <div className="md:col-span-2 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:to-blue-500/10 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-4 border dark:border-emerald-500/20 border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Plano Ativo</p>
              </div>
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                {planLabels[user.plan]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seções específicas para ALUNOS - Dados de evolução e treinos */}
      {!isProfessional && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-3xl overflow-hidden mx-auto ring-4 ring-emerald-500/30">
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff'}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handlePhotoUpload}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                  <Camera className="w-4 h-4" />
                </button>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 dark:border-zinc-900 border-white" />
              </div>
              <h2 className="dark:text-white text-slate-900 mb-0.5" style={{ fontWeight: 700 }}>
                {user?.name || 'Usuário'}
              </h2>
              <p className="text-sm dark:text-zinc-400 text-slate-500 mb-3">
                {user?.email ? `@${user.email.split('@')[0]}` : '@user'} · Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400" style={{ fontWeight: 600 }}>Ganho de Massa</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t dark:border-zinc-800 border-slate-100">
                {[
                  { label: 'Treinos', value: '35' },
                  { label: 'Semanas', value: '8' },
                  { label: 'Sequência', value: '12d' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="dark:text-white text-slate-900 text-xl" style={{ fontWeight: 800 }}>{value}</p>
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <h3 className="dark:text-white text-slate-900 mb-4">Conquistas</h3>
              <div className="grid grid-cols-2 gap-2">
                {badges.map(({ label, icon: Icon, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center text-center gap-1.5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                    <p className="text-xs dark:text-zinc-300 text-slate-600" style={{ fontWeight: 500 }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Restrictions / AI Preferences */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                  <h3 className="dark:text-white text-slate-900">Restrições para IA</h3>
                </div>
                <button
                  onClick={() => setAdding(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:text-emerald-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mb-3">
                A IA não irá sugerir estes itens nos seus planos
              </p>
              <div className="flex flex-wrap gap-2">
                {restrictions.map((r, i) => (
                  <motion.div
                    key={r}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-700 dark:border-zinc-700 border border-slate-200"
                    style={{ fontWeight: 500 }}
                  >
                    {r}
                    <button
                      onClick={() => removeRestriction(i)}
                      className="dark:text-zinc-500 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
              {adding && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newRestriction}
                    onChange={(e) => setNewRestriction(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRestriction()}
                    placeholder="Nova restrição..."
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-200 text-slate-800 focus:outline-none dark:focus:ring-1 focus:ring-1 dark:focus:ring-emerald-500/50 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={addRestriction}
                    className="px-3 py-1.5 rounded-xl text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Body Stats */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900">Dados Corporais</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" style={{ fontWeight: 600 }}>
                  Atualizado hoje
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {bodyStats.map(({ label, value, unit, icon: Icon, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-4`}>
                    <Icon className={`w-5 h-5 ${color} mb-3`} />
                    <p className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
                      {value}
                    </p>
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{unit}</p>
                    <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1" style={{ fontWeight: 500 }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <h3 className="dark:text-white text-slate-900 mb-5">Objetivos Ativos</h3>
              <div className="space-y-4">
                {[
                  { label: 'Peso alvo', current: 79.5, target: 75, unit: 'kg', color: '#10b981' },
                  { label: '% Gordura alvo', current: 17.8, target: 12, unit: '%', color: '#3b82f6' },
                  { label: 'Massa muscular', current: 65, target: 75, unit: 'kg', color: '#8b5cf6' },
                ].map(({ label, current, target, unit, color }) => {
                  const progress = Math.max(0, Math.min(100, ((current - target) / (85 - target)) * 100));
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="dark:text-zinc-300 text-slate-700" style={{ fontWeight: 500 }}>{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="dark:text-zinc-400 text-slate-500 text-xs">
                            Atual: <span className="dark:text-zinc-200 text-slate-700" style={{ fontWeight: 600 }}>{current}{unit}</span>
                          </span>
                          <span className="dark:text-zinc-400 text-slate-500 text-xs">
                            Meta: <span style={{ fontWeight: 600, color }}>{target}{unit}</span>
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full dark:bg-zinc-800 bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - progress}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Gallery */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900">Galeria de Progresso</h3>
                <button
                  onClick={handleGalleryUpload}
                  className="flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
                  <Camera className="w-4 h-4" />
                  Adicionar foto
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {progressPhotos.map((photo) => (
                  <motion.div
                    key={photo.label}
                    whileHover={{ scale: 1.03 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <ImageWithFallback
                      src={photo.src}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-zinc-900/90 from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs" style={{ fontWeight: 700 }}>{photo.label}</p>
                      <p className="text-white/70 text-xs">{photo.date}</p>
                    </div>
                    {photo.label === 'Atual' && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white" style={{ fontWeight: 700 }}>
                          Atual
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <h3 className="dark:text-white text-slate-900 mb-5">Informações Pessoais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(formValues) as Array<keyof typeof formValues>).map((label) => (
                  <div key={label} className="group">
                    <label className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest" style={{ fontWeight: 600 }}>
                      {label}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formValues[label]}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [label]: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-100 dark:text-zinc-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    ) : (
                      <p className="mt-1 text-sm dark:text-zinc-200 text-slate-700" style={{ fontWeight: 500 }}>
                        {formValues[label]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Perfil Profissional - Apenas para Personal e Nutricionista */}
      {isProfessional && (
        <div className="mt-8">
          <ProfessionalProfile />
        </div>
      )}
    </div>
  );
}