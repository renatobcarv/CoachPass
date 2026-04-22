import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Users, UserPlus, TrendingUp, Dumbbell, BarChart3, Calendar,
  Search, ChevronRight, Sparkles, ClipboardList, DollarSign,
  Palette, BookOpen, ClipboardCheck, Target, Activity, Clock,
  Award, Zap, CheckCircle, AlertCircle, Star, Plus, FileText,
  ArrowUpRight, Flame, Timer, Heart, ArrowLeftRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AddPatientModal } from '../AddPatientModal';

interface Student {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  goal: string;
  workoutsThisWeek: number;
  totalWorkouts: number;
  adherence: number;
  lastWorkout: string;
  avatar: string;
  plan: string;
  nextSession: string;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Lucas Silva', email: 'lucas@email.com', status: 'active', goal: 'Hipertrofia', workoutsThisWeek: 4, totalWorkouts: 48, adherence: 87, lastWorkout: 'Hoje 14:30', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff', plan: 'Push/Pull/Legs', nextSession: 'Amanhã 7h' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', status: 'active', goal: 'Emagrecimento', workoutsThisWeek: 5, totalWorkouts: 62, adherence: 94, lastWorkout: 'Ontem 18:00', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff', plan: 'Funcional', nextSession: 'Hoje 19h' },
  { id: '3', name: 'Carlos Ramos', email: 'carlos@email.com', status: 'active', goal: 'Condicionamento', workoutsThisWeek: 3, totalWorkouts: 31, adherence: 72, lastWorkout: 'Há 2 dias', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff', plan: 'HIIT + Força', nextSession: 'Sex. 8h' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', status: 'active', goal: 'Flexibilidade', workoutsThisWeek: 2, totalWorkouts: 19, adherence: 65, lastWorkout: 'Há 3 dias', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff', plan: 'Mobilidade', nextSession: 'Seg. 10h' },
  { id: '5', name: 'João Pedro', email: 'joao@email.com', status: 'pending', goal: '—', workoutsThisWeek: 0, totalWorkouts: 0, adherence: 0, lastWorkout: 'Aguardando aceite', avatar: 'https://ui-avatars.com/api/?name=João+Pedro&background=6b7280&color=fff', plan: '—', nextSession: '—' },
];

const adherenceData = [
  { week: 'S1', adherence: 72 },
  { week: 'S2', adherence: 78 },
  { week: 'S3', adherence: 83 },
  { week: 'S4', adherence: 80 },
  { week: 'S5', adherence: 88 },
  { week: 'S6', adherence: 91 },
  { week: 'S7', adherence: 86 },
  { week: 'S8', adherence: 89 },
];

const weeklyWorkouts = [
  { day: 'Seg', treinos: 6 },
  { day: 'Ter', treinos: 4 },
  { day: 'Qua', treinos: 7 },
  { day: 'Qui', treinos: 5 },
  { day: 'Sex', treinos: 8 },
  { day: 'Sáb', treinos: 3 },
  { day: 'Dom', treinos: 1 },
];

const todaySessions = [
  { id: '1', student: 'Maria Santos', time: '19:00', type: 'Funcional', status: 'upcoming', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
  { id: '2', student: 'Lucas Silva', time: '14:30', type: 'Push/Pull/Legs', status: 'done', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '3', student: 'Carlos Ramos', time: '08:00', type: 'HIIT', status: 'done', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff' },
];

export function PersonalDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStudentAdded = (s: any) => {
    setStudents(prev => [...prev, {
      id: s.id, name: s.name, email: s.email, status: 'pending',
      goal: '—', workoutsThisWeek: 0, totalWorkouts: 0, adherence: 0,
      lastWorkout: 'Aguardando aceite',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=10b981&color=fff`,
      plan: '—', nextSession: '—',
    }]);
  };

  const active = students.filter(s => s.status === 'active');
  const pending = students.filter(s => s.status === 'pending');
  const totalWorkoutsWeek = active.reduce((s, a) => s + a.workoutsThisWeek, 0);
  const avgAdherence = active.length ? Math.round(active.reduce((s, a) => s + a.adherence, 0) / active.length) : 0;

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Dashboard Personal</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">Bem-vindo de volta! Você tem {todaySessions.filter(s => s.status === 'upcoming').length} sessão hoje.</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <button onClick={() => navigate('/selecionar-painel')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-100"
            style={{ fontWeight: 500 }}>
            <ArrowLeftRight className="w-4 h-4" /> Trocar Painel
          </button>
          <button onClick={() => navigate('/personal/criar-treino')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 }}>
            <Dumbbell className="w-4 h-4" /> Criar Treino
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 8px 20px rgba(59,130,246,0.3)', fontWeight: 600 }}>
            <UserPlus className="w-4 h-4" /> Adicionar Aluno
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Alunos Ativos', value: active.length, icon: Users, color: '#10b981', bg: 'from-emerald-500/10 to-teal-500/10', border: 'dark:border-emerald-500/20', sub: `${pending.length} aguardando`, path: null, scrollTo: 'students-list' },
          { label: 'Treinos na Semana', value: totalWorkoutsWeek, icon: Dumbbell, color: '#3b82f6', bg: 'from-blue-500/10 to-indigo-500/10', border: 'dark:border-blue-500/20', sub: 'total dos alunos', path: '/personal/agenda', scrollTo: null },
          { label: 'Taxa de Adesão', value: `${avgAdherence}%`, icon: TrendingUp, color: '#8b5cf6', bg: 'from-violet-500/10 to-purple-500/10', border: 'dark:border-violet-500/20', sub: 'média geral', path: '/personal/avaliacao', scrollTo: null },
          { label: 'Receita do Mês', value: 'R$ 4.800', icon: DollarSign, color: '#f59e0b', bg: 'from-amber-500/10 to-orange-500/10', border: 'dark:border-amber-500/20', sub: '+12% vs mês ant.', path: '/personal/financeiro', scrollTo: null },
        ].map(({ label, value, icon: Icon, color, bg, border, sub, path, scrollTo }) => (
          <motion.div key={label} whileHover={{ y: -2 }}
            onClick={() => {
              if (path) navigate(path);
              else if (scrollTo) {
                const el = document.getElementById(scrollTo);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={`dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200 bg-gradient-to-br ${bg} relative overflow-hidden cursor-pointer hover:dark:border-zinc-700 hover:border-slate-300 transition-colors`}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-5" style={{ backgroundColor: color }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 dark:text-zinc-600 text-slate-400" />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl mb-0.5" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
            <p className="text-xs mt-1" style={{ color, fontWeight: 600 }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Bento Grid Row 1 ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Agenda Hoje */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Agenda de Hoje</h3>
            </div>
            <button onClick={() => navigate('/personal/agenda')} className="text-xs text-blue-500 hover:underline" style={{ fontWeight: 600 }}>Ver tudo</button>
          </div>
          <div className="space-y-3">
            {todaySessions.map(s => (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${s.status === 'done' ? 'opacity-50 dark:bg-zinc-800/30 dark:border-zinc-700 border-slate-200' : 'dark:bg-blue-500/5 dark:border-blue-500/20 border-blue-200 bg-blue-50'}`}>
                <img src={s.avatar} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt={s.student} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs dark:text-white text-slate-900 truncate" style={{ fontWeight: 600 }}>{s.student}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{s.type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs" style={{ fontWeight: 700, color: s.status === 'done' ? '#10b981' : '#3b82f6' }}>{s.time}</p>
                  <p className="text-xs dark:text-zinc-600 text-slate-400">{s.status === 'done' ? '✓ Concluído' : '● Hoje'}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/personal/agenda')}
            className="w-full mt-3 py-2 rounded-xl text-xs border dark:border-dashed dark:border-zinc-700 border-dashed border-slate-300 dark:text-zinc-500 text-slate-400 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Agendar sessão
          </button>
        </div>

        {/* Adherence Chart */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Taxa de Adesão</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400" style={{ fontWeight: 700 }}>+4% mês</span>
          </div>
          <p className="text-xs dark:text-zinc-500 text-slate-400 mb-4">Últimas 8 semanas</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={adherenceData}>
              <defs>
                <linearGradient id="pd-adh-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis key="pd-adh-xaxis" dataKey="week" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis key="pd-adh-yaxis" domain={[60, 100]} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip key="pd-adh-tooltip" contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 11 }} formatter={(v: any) => [`${v}%`, 'Adesão']} />
              <Area key="pd-adh-area" type="monotone" dataKey="adherence" stroke="#8b5cf6" fill="url(#pd-adh-grad)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly workouts */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Treinos por Dia</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400" style={{ fontWeight: 700 }}>Esta semana</span>
          </div>
          <p className="text-xs dark:text-zinc-500 text-slate-400 mb-4">{weeklyWorkouts.reduce((s, d) => s + d.treinos, 0)} treinos realizados</p>
          <div className="flex items-end gap-1.5 h-32">
            {weeklyWorkouts.map((d) => {
              const max = Math.max(...weeklyWorkouts.map(x => x.treinos));
              const pct = (d.treinos / max) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs dark:text-zinc-600 text-slate-400" style={{ fontWeight: 600 }}>{d.treinos}</span>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${pct}%`, background: pct === 100 ? 'linear-gradient(180deg,#f97316,#ea580c)' : 'linear-gradient(180deg,#f97316aa,#ea580c66)' }} />
                  <span className="text-xs dark:text-zinc-500 text-slate-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Novo Treino', desc: 'Criar do zero ou com IA', icon: Dumbbell, color: '#10b981', action: () => navigate('/personal/criar-treino') },
          { label: 'Avaliação Física', desc: 'Registrar nova avaliação', icon: ClipboardList, color: '#3b82f6', action: () => navigate('/personal/avaliacao') },
          { label: 'Ver Agenda', desc: 'Sessões de hoje e semana', icon: Calendar, color: '#8b5cf6', action: () => navigate('/personal/agenda') },
          { label: 'Gerar com IA', desc: 'Treino personalizado', icon: Sparkles, color: '#f59e0b', action: () => navigate('/personal/criar-treino') },
        ].map(({ label, desc, icon: Icon, color, action }) => (
          <motion.button key={label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={action}
            className="flex flex-col items-start gap-3 p-5 rounded-3xl border text-left dark:bg-zinc-900 bg-white dark:border-zinc-800 border-slate-200 hover:dark:border-zinc-600 transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{label}</p>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Ferramentas do Personal ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="dark:text-white text-slate-900">Ferramentas Profissionais</h3>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">Tudo para um personal trainer de alto nível</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Avaliação Física – destaque */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/avaliacao')}
            className="sm:col-span-2 lg:col-span-1 flex flex-col p-6 rounded-3xl border text-left overflow-hidden relative group transition-all hover:dark:border-blue-500/40 hover:border-blue-300"
            style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(29,78,216,0.04))' }}>
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 bg-blue-500" />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <p className="text-base dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Avaliação Física</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-4">PAR-Q, anamnese completa, medidas corporais, bioimpedância e testes funcionais</p>
            <div className="flex items-center gap-1 text-xs text-blue-500" style={{ fontWeight: 600 }}>Acessar <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Agenda */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/agenda')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-blue-500/40 hover:border-blue-300 dark:bg-zinc-900 bg-white">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Agenda & Sessões</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">Gerencie horários, sessões presenciais e online</p>
            <div className="flex items-center gap-1 text-xs text-blue-500" style={{ fontWeight: 600 }}>Ver Agenda <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Periodização */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/periodizacao')}
            className="flex flex-col p-6 rounded-3xl border text-left overflow-hidden relative group transition-all hover:dark:border-orange-500/40 hover:border-orange-300"
            style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.08),rgba(234,88,12,0.04))' }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-orange-500" />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Periodização</p>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400" style={{ fontWeight: 600 }}>Pro</span>
            </div>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">Macro, meso e microciclos com controle de volume e intensidade</p>
            <div className="flex items-center gap-1 text-xs text-orange-400" style={{ fontWeight: 600 }}>Planejar <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Financeiro */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/financeiro')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-emerald-500/40 hover:border-emerald-300 dark:bg-zinc-900 bg-white">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Sistema Financeiro</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">Controle de mensalidades, recibos e comissões</p>
            <div className="flex items-center gap-1 text-xs text-emerald-500" style={{ fontWeight: 600 }}>Acessar <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Canvas */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/canvas')}
            className="flex flex-col p-6 rounded-3xl border text-left overflow-hidden relative group transition-all hover:dark:border-violet-500/40 hover:border-violet-300"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(109,40,217,0.06))' }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-violet-500" />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>FitSync Canvas</p>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-400" style={{ fontWeight: 600 }}>+100</span>
            </div>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">Crie artes, planilhas e materiais para seus alunos</p>
            <div className="flex items-center gap-1 text-xs text-violet-400" style={{ fontWeight: 600 }}>Criar Arte <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Cursos */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/cursos')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-cyan-500/40 hover:border-cyan-300 dark:bg-zinc-900 bg-white">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Cursos Completos</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">Mais de 60 cursos das maiores referências do fitness</p>
            <div className="flex items-center gap-1 text-xs text-cyan-400" style={{ fontWeight: 600 }}>Estudar <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Questionários */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/questionarios')}
            className="flex flex-col p-6 rounded-3xl border text-left dark:border-zinc-800 border-slate-200 group transition-all hover:dark:border-pink-500/40 hover:border-pink-300 dark:bg-zinc-900 bg-white">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Questionários</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">PAR-Q, histórico médico, pré-treino e satisfação</p>
            <div className="flex items-center gap-1 text-xs text-pink-400" style={{ fontWeight: 600 }}>Acessar <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>

          {/* Metas */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/personal/metas')}
            className="sm:col-span-2 lg:col-span-1 flex flex-col p-6 rounded-3xl border text-left overflow-hidden relative group transition-all hover:dark:border-emerald-500/40 hover:border-emerald-300"
            style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))' }}>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 bg-emerald-500" />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>Prescrição de Metas</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed mb-3">Defina metas SMART e acompanhe o progresso dos alunos</p>
            <div className="flex items-center gap-1 text-xs text-emerald-500" style={{ fontWeight: 600 }}>Gerenciar <ChevronRight className="w-3.5 h-3.5" /></div>
          </motion.button>
        </div>
      </div>

      {/* ── Students List ── */}
      <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 border dark:border-zinc-800 border-slate-200" id="students-list">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h3 className="dark:text-white text-slate-900">Meus Alunos</h3>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">{students.length} aluno{students.length !== 1 ? 's' : ''} no total · {active.length} ativos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
                className="pl-9 pr-4 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((student) => (
            <motion.div key={student.id} layout
              onClick={() => student.status === 'active' && navigate(`/personal/aluno/${student.id}`)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                student.status === 'pending'
                  ? 'dark:bg-zinc-800/30 dark:border-zinc-700 border-slate-200'
                  : 'dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border-slate-200 cursor-pointer hover:dark:border-blue-500/40 hover:border-blue-300'
              }`}>
              <div className="relative">
                <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                {student.status === 'active' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 dark:border-zinc-900 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{student.name}</p>
                  {student.status === 'pending' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 border dark:border-zinc-600">Pendente</span>
                  )}
                </div>
                <p className="text-xs dark:text-zinc-500 text-slate-400">{student.email}</p>
                {student.status === 'active' && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400" style={{ fontWeight: 600 }}>{student.goal}</span>
                    <span className="text-xs dark:text-zinc-600 text-slate-400">{student.plan}</span>
                  </div>
                )}
              </div>

              {student.status === 'active' && (
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs dark:text-zinc-500 text-slate-400 mb-0.5">Semana</p>
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{student.workoutsThisWeek}× treinos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs dark:text-zinc-500 text-slate-400 mb-0.5">Adesão</p>
                    <p className="text-sm" style={{ fontWeight: 700, color: student.adherence >= 80 ? '#10b981' : student.adherence >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {student.adherence}%
                    </p>
                  </div>
                  <div className="text-center hidden lg:block">
                    <p className="text-xs dark:text-zinc-500 text-slate-400 mb-0.5">Próxima sessão</p>
                    <p className="text-sm dark:text-zinc-300 text-slate-700" style={{ fontWeight: 500 }}>{student.nextSession}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                {student.status === 'active' && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/personal/aluno/${student.id}/medicao`); }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all">
                      <Activity className="w-3 h-3" /> Medição
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate('/personal/criar-treino'); }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:dark:text-emerald-400 transition-all">
                      <Dumbbell className="w-3 h-3" /> Treino
                    </button>
                    <ChevronRight className="w-5 h-5 dark:text-zinc-600 text-slate-400" />
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 mx-auto mb-3 dark:text-zinc-700 text-slate-300" />
              <p className="text-sm dark:text-zinc-500 text-slate-400">Nenhum aluno encontrado para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <AddPatientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} professionalType="personal" onSuccess={handleStudentAdded} />
    </div>
  );
}