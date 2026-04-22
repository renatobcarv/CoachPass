import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  UserPlus,
  Apple,
  Activity,
  Clock,
  FileText,
  TrendingDown,
  Search,
  ChevronRight,
  Utensils,
  Plus,
  BarChart3,
  Scale,
  Sparkles,
  ClipboardList,
  DollarSign,
  Palette,
  BookOpen,
  ClipboardCheck,
  Target,
  Baby,
  Star,
  ArrowLeftRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AddPatientModal } from '../AddPatientModal';

interface Patient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  lastConsultation: string;
  currentWeight: number;
  goalWeight: number;
  avatar: string;
  adherence?: number;
  bodyFat?: number;
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Costa',
    email: 'ana@email.com',
    status: 'active',
    lastConsultation: 'Há 3 dias',
    currentWeight: 68.5,
    goalWeight: 63.0,
    adherence: 82,
    bodyFat: 28.5,
    avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
  },
  {
    id: '2',
    name: 'Roberto Lima',
    email: 'roberto@email.com',
    status: 'active',
    lastConsultation: 'Há 1 semana',
    currentWeight: 92.3,
    goalWeight: 85.0,
    adherence: 75,
    bodyFat: 24.1,
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Lima&background=3b82f6&color=fff',
  },
  {
    id: '3',
    name: 'Juliana Mendes',
    email: 'juliana@email.com',
    status: 'pending',
    lastConsultation: 'Aguardando aceite',
    currentWeight: 0,
    goalWeight: 0,
    avatar: 'https://ui-avatars.com/api/?name=Juliana+Mendes&background=8b5cf6&color=fff',
  },
];

export function NutritionistDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePatientAdded = (patient: any) => {
    const newPatient: Patient = {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      status: 'pending',
      lastConsultation: 'Aguardando aceite',
      currentWeight: patient.weight || 0,
      goalWeight: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=f59e0b&color=fff`,
    };
    setPatients([...patients, newPatient]);
  };

  const activePatients = patients.filter((p) => p.status === 'active').length;
  const pendingPatients = patients.filter((p) => p.status === 'pending').length;
  const avgWeightLoss = patients
    .filter((p) => p.currentWeight > 0)
    .reduce((sum, p) => sum + (p.currentWeight - p.goalWeight), 0) / (activePatients || 1);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="dark:text-white text-slate-900">Dashboard Nutricionista</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            Gerencie seus pacientes e planos alimentares
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <button
            onClick={() => navigate('/selecionar-painel')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-100"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Trocar Painel
          </button>
          <button
            onClick={() => navigate('/nutritionist/criar-plano')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 }}
          >
            <Utensils className="w-4 h-4" />
            Criar Plano
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.35)', fontWeight: 600 }}
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Paciente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pacientes Ativos', value: activePatients, icon: Users, color: '#10b981', bg: 'bg-emerald-500/10', path: null, scrollTo: 'patients-list' },
          { label: 'Aguardando', value: pendingPatients, icon: Clock, color: '#8b5cf6', bg: 'bg-purple-500/10', path: null, scrollTo: 'patients-list' },
          { label: 'Consultas Mês', value: 24, icon: FileText, color: '#f59e0b', bg: 'bg-orange-500/10', path: '/nutritionist/anamnese', scrollTo: null },
          { label: 'Perda Média', value: `${avgWeightLoss.toFixed(1)}kg`, icon: TrendingDown, color: '#3b82f6', bg: 'bg-blue-500/10', path: '/nutritionist/metas', scrollTo: null },
        ].map(({ label, value, icon: Icon, color, bg, path, scrollTo }) => (
          <div key={label}
            onClick={() => {
              if (path) navigate(path);
              else if (scrollTo) {
                const el = document.getElementById(scrollTo);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200 cursor-pointer hover:dark:border-zinc-700 hover:border-slate-300 transition-colors">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Novo Plano Alimentar',
            desc: 'Criar do zero ou com IA',
            icon: Utensils,
            color: '#f59e0b',
            action: () => navigate('/nutritionist/criar-plano'),
          },
          {
            label: 'Nova Consulta',
            desc: 'Registrar avaliação',
            icon: FileText,
            color: '#10b981',
            action: () => navigate('/nutritionist/consulta/1'),
          },
          {
            label: 'Ver Progresso',
            desc: 'Evolução dos pacientes',
            icon: BarChart3,
            color: '#3b82f6',
            action: () => navigate('/nutritionist/paciente/1'),
          },
          {
            label: 'Gerar com IA',
            desc: 'Plano personalizado',
            icon: Sparkles,
            color: '#8b5cf6',
            action: () => navigate('/nutritionist/criar-plano'),
          },
        ].map(({ label, desc, icon: Icon, color, action }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action}
            className="flex flex-col items-start gap-3 p-5 rounded-3xl border text-left dark:bg-zinc-900 bg-white dark:border-zinc-800 border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm dark:text-white text-slate-900 group-hover:dark:text-white" style={{ fontWeight: 600 }}>{label}</p>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── FERRAMENTAS DO NUTRICIONISTA ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="dark:text-white text-slate-900">Ferramentas do Consultório</h3>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">Tudo que você precisa para um consultório de sucesso</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Anamnese – Destaque */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/anamnese')}
            className="sm:col-span-2 lg:col-span-1 flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 overflow-hidden relative group transition-all hover:dark:border-emerald-500/40 hover:border-emerald-300"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))' }}
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 bg-emerald-500" />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <p className="text-base dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Anamnese Completa</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-4">
              Anamnese completa com modelos WebDiet, nunca perca um detalhe do paciente
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-500" style={{ fontWeight: 600 }}>
              Acessar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Sistema Financeiro */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/financeiro')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-emerald-500/40 hover:border-emerald-300 dark:bg-zinc-900 bg-white"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Sistema Financeiro</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              Planejamento financeiro e emissão de recibos
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-500" style={{ fontWeight: 600 }}>
              Acessar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Canvas */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/canvas')}
            className="flex flex-col p-6 rounded-3xl border text-left overflow-hidden relative group transition-all hover:dark:border-violet-500/40 hover:border-violet-300"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(109,40,217,0.06))' }}
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-violet-500" />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>FitSync Canvas</p>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-400" style={{ fontWeight: 600 }}>+100</span>
            </div>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              Crie artes e materiais incríveis para seus pacientes
            </p>
            <div className="flex items-center gap-1 text-xs text-violet-400" style={{ fontWeight: 600 }}>
              Criar Arte <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Cursos */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/cursos')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-blue-500/40 hover:border-blue-300 dark:bg-zinc-900 bg-white"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Cursos Completos</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              Mais de 50 cursos das maiores referências da Nutrição
            </p>
            <div className="flex items-center gap-1 text-xs text-blue-400" style={{ fontWeight: 600 }}>
              Estudar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Questionários */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/questionarios')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-cyan-500/40 hover:border-cyan-300 dark:bg-zinc-900 bg-white"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)' }}>
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Questionários</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              Rastreamento metabólico, sono, pré-consulta e mais
            </p>
            <div className="flex items-center gap-1 text-xs text-cyan-400" style={{ fontWeight: 600 }}>
              Acessar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Base de Alimentos */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/alimentos')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-amber-500/40 hover:border-amber-300 dark:bg-zinc-900 bg-white"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              <Apple className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Base de Alimentos</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              TBCA/TACO e fabricantes brasileiros sempre atualizados
            </p>
            <div className="flex items-center gap-1 text-xs text-amber-500" style={{ fontWeight: 600 }}>
              Consultar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Metas */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/metas')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-emerald-500/40 hover:border-emerald-300 dark:bg-zinc-900 bg-white"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Prescrição de Metas</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              Crie metas e acompanhe a evolução via check-in no app
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-500" style={{ fontWeight: 600 }}>
              Gerenciar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Materno-Infantil */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/nutritionist/materno-infantil')}
            className="sm:col-span-2 lg:col-span-1 flex flex-col p-6 rounded-3xl border text-left overflow-hidden relative group transition-all hover:dark:border-pink-500/40 hover:border-pink-300"
            style={{ background: 'linear-gradient(135deg,rgba(236,72,153,0.08),rgba(190,24,93,0.04))' }}
          >
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 bg-pink-500" />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
              <Baby className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Avaliação Materno-Infantil</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">
              Gestantes, lactantes e crianças com referências atualizadas
            </p>
            <div className="flex items-center gap-1 text-xs text-pink-400" style={{ fontWeight: 600 }}>
              Acessar <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Patients List */}
      <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200" id="patients-list">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="dark:text-white text-slate-900">Meus Pacientes</h3>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-64"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              layout
              onClick={() => patient.status === 'active' && navigate(`/nutritionist/paciente/${patient.id}`)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                patient.status === 'pending'
                  ? 'dark:bg-purple-500/5 bg-purple-50 dark:border-purple-500/20 border-purple-200'
                  : 'dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border-slate-200 cursor-pointer hover:dark:border-amber-500/40 hover:border-amber-300'
              }`}
            >
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                    {patient.name}
                  </p>
                  {patient.status === 'pending' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Pendente
                    </span>
                  )}
                </div>
                <p className="text-xs dark:text-zinc-500 text-slate-400">{patient.email}</p>
              </div>

              <div className="hidden md:flex items-center gap-6">
                {patient.status === 'active' && (
                  <>
                    <div className="text-right">
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Peso Atual</p>
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                        {patient.currentWeight} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Meta</p>
                      <p className="text-sm text-emerald-500" style={{ fontWeight: 700 }}>
                        {patient.goalWeight} kg
                      </p>
                    </div>
                    {patient.adherence !== undefined && (
                      <div className="text-right">
                        <p className="text-xs dark:text-zinc-500 text-slate-400">Adesão</p>
                        <p className={`text-sm ${patient.adherence >= 80 ? 'text-emerald-500' : 'text-amber-500'}`} style={{ fontWeight: 700 }}>
                          {patient.adherence}%
                        </p>
                      </div>
                    )}
                  </>
                )}
                <div className="text-right">
                  <p className="text-xs dark:text-zinc-500 text-slate-400">Última consulta</p>
                  <p className="text-sm dark:text-zinc-300 text-slate-700">{patient.lastConsultation}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {patient.status === 'active' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/nutritionist/consulta/${patient.id}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-amber-500 hover:border-amber-400 hover:dark:text-amber-400 hover:text-amber-600 transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="hidden sm:inline">Consulta</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/nutritionist/criar-plano/${patient.id}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:border-emerald-400 hover:dark:text-emerald-400 hover:text-emerald-600 transition-all"
                    >
                      <Apple className="w-3 h-3" />
                      <span className="hidden sm:inline">Ver Dieta</span>
                    </button>
                    <ChevronRight className="w-5 h-5 dark:text-zinc-600 text-slate-400" />
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-10 dark:text-zinc-600 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum paciente encontrado para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        professionalType="nutritionist"
        onSuccess={handlePatientAdded}
      />
    </div>
  );
}