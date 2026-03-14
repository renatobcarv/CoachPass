import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Sparkles, Brain, UtensilsCrossed, Dumbbell, Flame, Droplets,
  RefreshCw, CheckCircle2, Circle, Bell, ChevronRight, Zap,
  Target, Clock, TrendingUp, Apple, Info, Activity, Award,
  Calendar, BarChart3, Heart, ArrowUpRight, Star, Users,
  AlertCircle, CheckCircle, X,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { ExerciseModal } from '../ExerciseModal';
import { getExerciseDetail, ExerciseDetail } from '../../data/exerciseData';
import { dailyNutrition } from '../../data/foodData';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

// ── types ──────────────────────────────────────────────────────────────────
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  muscle: string;
  rest: string;
  completed: boolean;
}

// ── data ───────────────────────────────────────────────────────────────────
const todayExercises: Exercise[] = [
  { id: '1', name: 'Supino Reto com Barra', sets: 4, reps: '8-10', weight: '80kg', muscle: 'Peito', rest: '90s', completed: true },
  { id: '2', name: 'Crucifixo com Halteres', sets: 3, reps: '12-15', weight: '18kg', muscle: 'Peito', rest: '60s', completed: true },
  { id: '3', name: 'Desenvolvimento Militar', sets: 4, reps: '8-10', weight: '50kg', muscle: 'Ombro', rest: '90s', completed: false },
  { id: '4', name: 'Elevação Lateral', sets: 3, reps: '15-20', weight: '10kg', muscle: 'Ombro', rest: '60s', completed: false },
  { id: '5', name: 'Tríceps Pulley', sets: 4, reps: '10-12', weight: '30kg', muscle: 'Tríceps', rest: '60s', completed: false },
];

const weeklyAdherence = [
  { week: 'S1', treinos: 3, meta: 4 },
  { week: 'S2', treinos: 4, meta: 4 },
  { week: 'S3', treinos: 5, meta: 4 },
  { week: 'S4', treinos: 4, meta: 4 },
  { week: 'S5', treinos: 4, meta: 4 },
  { week: 'S6', treinos: 5, meta: 4 },
  { week: 'S7', treinos: 4, meta: 4 },
  { week: 'S8', treinos: 4, meta: 4 },
];

const muscleColors: Record<string, string> = {
  Peito: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Ombro: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Tríceps: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Costas: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Bíceps: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Pernas: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
};

const weekPlan = [
  { day: 'Seg', label: 'Push A', muscles: 'Peito · Ombro · Tríceps', done: true, color: '#10b981' },
  { day: 'Ter', label: 'Pull A', muscles: 'Costas · Bíceps', done: false, today: true, color: '#3b82f6' },
  { day: 'Qua', label: 'Legs A', muscles: 'Quadríceps · Posterior', done: false, color: '#8b5cf6' },
  { day: 'Qui', label: 'Push B', muscles: 'Peito · Ombro', done: false, color: '#10b981' },
  { day: 'Sex', label: 'Pull B', muscles: 'Costas · Bíceps', done: false, color: '#3b82f6' },
  { day: 'Sáb', label: 'Descanso', muscles: 'Recuperação ativa', done: false, rest: true, color: '#6b7280' },
  { day: 'Dom', label: 'Descanso', muscles: 'Recuperação completa', done: false, rest: true, color: '#6b7280' },
];

const notifications = [
  { id: '1', text: 'Carlos Pereira enviou um novo treino para você', time: 'Há 10 min', read: false, icon: Dumbbell, color: '#3b82f6' },
  { id: '2', text: 'Lembrete: Push B amanhã às 7h', time: 'Há 1h', read: false, icon: Calendar, color: '#10b981' },
  { id: '3', text: 'Dra. Paula atualizou seu plano alimentar', time: 'Há 3h', read: true, icon: Apple, color: '#f59e0b' },
  { id: '4', text: 'Meta de hidratação atingida hoje!', time: 'Há 4h', read: true, icon: CheckCircle2, color: '#10b981' },
];

// Circular progress SVG
function CircularProgress({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="5" fill="none" className="dark:stroke-zinc-800 stroke-slate-200" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="5" fill="none" stroke={color}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}

// ── component ──────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState(todayExercises);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [generatingDiet, setGeneratingDiet] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);
  const [cups, setCups] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const totalCups = 8;

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  const toggle = (id: string) => setExercises(p => p.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  const completedCount = exercises.filter(e => e.completed).length;

  const caloriesConsumed = 1840;
  const caloriesGoal = 2800;
  const protein = 142; const proteinGoal = 200;
  const carbs = 220; const carbsGoal = 300;
  const fat = 58; const fatGoal = 80;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Mirrored stats (same values personal trainer sees)
  const adherencePct = 87;
  const workoutsWeek = 4;
  const totalWorkouts = 48;
  const streak = 12;

  return (
    <div className="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs dark:text-zinc-500 text-slate-400 capitalize mb-0.5">{dateStr}</p>
          <h1 className="dark:text-white text-slate-900">{greeting}, Lucas! 👋</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            <span className="text-emerald-500" style={{ fontWeight: 700 }}>{streak} dias</span> de sequência · programa PPL · Semana 4 de 12
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative w-10 h-10 rounded-xl dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 flex items-center justify-center dark:text-zinc-400 text-slate-500 hover:text-emerald-500 transition-colors">
              <Bell className="w-5 h-5" />
              {notifList.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 dark:bg-zinc-900 bg-white border dark:border-zinc-800 border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800 border-slate-100">
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Notificações</p>
                  <button
                    onClick={() => { setNotifList(prev => prev.map(n => ({ ...n, read: true }))); }}
                    className="text-xs text-emerald-500 hover:underline" style={{ fontWeight: 600 }}>
                    Marcar todas como lidas
                  </button>
                </div>
                <div className="divide-y dark:divide-zinc-800 divide-slate-100 max-h-72 overflow-y-auto">
                  {notifList.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className={`flex items-start gap-3 p-4 transition-colors hover:dark:bg-zinc-800/50 hover:bg-slate-50 cursor-pointer ${!n.read ? 'dark:bg-zinc-800/30 bg-blue-50/50' : ''}`}
                        onClick={() => setNotifList(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${n.color}20` }}>
                          <Icon className="w-4 h-4" style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs dark:text-zinc-200 text-slate-700 leading-snug" style={{ fontWeight: n.read ? 400 : 600 }}>{n.text}</p>
                          <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t dark:border-zinc-800 border-slate-100">
                  <button onClick={() => setShowNotifications(false)} className="w-full py-2 text-xs dark:text-zinc-500 text-slate-400 hover:dark:text-zinc-300 hover:text-slate-600 transition-colors">
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Treinos na Semana', value: `${workoutsWeek}×`, sub: 'meta: 4×/sem', icon: Dumbbell, color: '#10b981', path: '/treinos' },
          { label: 'Taxa de Adesão', value: `${adherencePct}%`, sub: '+4% esse mês', icon: TrendingUp, color: '#8b5cf6', path: '/evolucao' },
          { label: 'Total de Treinos', value: totalWorkouts, sub: 'desde o início', icon: Award, color: '#3b82f6', path: '/evolucao' },
          { label: 'Sequência Atual', value: `${streak}d`, sub: 'dias consecutivos', icon: Flame, color: '#f97316', path: '/evolucao' },
        ].map(({ label, value, sub, icon: Icon, color, path }) => (
          <motion.div key={label} whileHover={{ y: -2 }}
            onClick={() => navigate(path)}
            className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200 relative overflow-hidden cursor-pointer hover:dark:border-zinc-700 hover:border-slate-300 transition-colors">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-5" style={{ backgroundColor: color }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 dark:text-zinc-700 text-slate-300" />
            </div>
            <p className="text-2xl dark:text-white text-slate-900 mb-0.5" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
            <p className="text-xs mt-1" style={{ color, fontWeight: 600 }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Bento Row 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* AI Gerar Treino */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            setGeneratingWorkout(true);
            setTimeout(() => { setGeneratingWorkout(false); navigate('/treinos'); }, 2500);
          }}
          disabled={generatingWorkout}
          className="relative overflow-hidden rounded-3xl p-6 text-left"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 20px 60px rgba(16,185,129,0.3)' }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              {generatingWorkout ? <RefreshCw className="w-6 h-6 text-white animate-spin" /> : <Dumbbell className="w-6 h-6 text-white" />}
            </div>
            <h3 className="text-white mb-1" style={{ fontWeight: 700 }}>{generatingWorkout ? 'Gerando Treino...' : 'Gerar Treino com IA'}</h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {generatingWorkout ? 'Analisando histórico e objetivos' : 'Treino personalizado baseado nos seus objetivos e histórico'}
            </p>
            {!generatingWorkout && (
              <div className="flex items-center gap-1.5 mt-4 text-white/90">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm" style={{ fontWeight: 500 }}>Powered by FitSync</span>
              </div>
            )}
            {generatingWorkout && (
              <div className="mt-4 flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="h-1 rounded-full bg-white/50 animate-pulse flex-1" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
        </motion.button>

        {/* AI Montar Dieta */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            setGeneratingDiet(true);
            setTimeout(() => { setGeneratingDiet(false); navigate('/dieta'); }, 2500);
          }}
          disabled={generatingDiet}
          className="relative overflow-hidden rounded-3xl p-6 text-left"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 20px 60px rgba(59,130,246,0.3)' }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              {generatingDiet ? <RefreshCw className="w-6 h-6 text-white animate-spin" /> : <UtensilsCrossed className="w-6 h-6 text-white" />}
            </div>
            <h3 className="text-white mb-1" style={{ fontWeight: 700 }}>{generatingDiet ? 'Montando Dieta...' : 'Montar Dieta com IA'}</h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {generatingDiet ? 'Calculando macros e montando cardápio' : 'Plano alimentar personalizado com base nas suas metas calóricas'}
            </p>
            {!generatingDiet && (
              <div className="flex items-center gap-1.5 mt-4 text-white/90">
                <Brain className="w-4 h-4" />
                <span className="text-sm" style={{ fontWeight: 500 }}>Nutrição inteligente</span>
              </div>
            )}
            {generatingDiet && (
              <div className="mt-4 flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="h-1 rounded-full bg-white/50 animate-pulse flex-1" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
        </motion.button>

        {/* Adherence mini-chart */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Adesão aos Treinos</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400" style={{ fontWeight: 700 }}>{adherencePct}%</span>
          </div>
          <p className="text-xs dark:text-zinc-500 text-slate-400 mb-3">Últimas 8 semanas</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={weeklyAdherence} barCategoryGap="20%">
              <XAxis dataKey="week" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 10, fontSize: 11 }}
                formatter={(v: any, name: string) => [v, name === 'treinos' ? 'Treinos' : 'Meta']} />
              <Bar dataKey="meta" fill="#27272a" radius={[4, 4, 0, 0]} maxBarSize={14} />
              <Bar dataKey="treinos" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bento Row 2: Treino Hoje + Macros + Hidratação ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Treino do Dia */}
        <div className="lg:col-span-1 dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden flex flex-col">
          {/* Cover */}
          <div className="relative h-32 flex-shrink-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"
              alt="treino"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-white text-base" style={{ fontWeight: 700 }}>Push Day A</p>
                <p className="text-white/70 text-xs">Peito · Ombro · Tríceps</p>
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Clock className="w-3 h-3" /><span>~65 min</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="dark:text-zinc-400 text-slate-500">Progresso</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{completedCount}/{exercises.length} exercícios</span>
            </div>
            <div className="w-full h-2 rounded-full dark:bg-zinc-800 bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / exercises.length) * 100}%`, background: 'linear-gradient(90deg,#10b981,#3b82f6)' }} />
            </div>
          </div>

          {/* Exercise checklist */}
          <div className="px-4 pb-4 space-y-2 flex-1 overflow-y-auto max-h-56">
            {exercises.map(ex => (
              <div key={ex.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${ex.completed ? 'dark:bg-emerald-500/5 dark:border-emerald-500/20 border-emerald-200 bg-emerald-50' : 'dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border-slate-200'}`}>
                <button onClick={() => toggle(ex.id)} className="flex-shrink-0">
                  {ex.completed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <Circle className="w-4 h-4 dark:text-zinc-600 text-slate-300 hover:text-emerald-500 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => { const d = getExerciseDetail(ex.name); if (d) setSelectedExercise(d); }}
                    className={`text-xs text-left hover:underline transition-colors ${ex.completed ? 'line-through dark:text-zinc-500 text-slate-400' : 'dark:text-white text-slate-900'}`}
                    style={{ fontWeight: 500 }}>
                    {ex.name}
                  </button>
                  <p className="text-xs dark:text-zinc-600 text-slate-400">{ex.sets}× · {ex.reps} reps · {ex.weight}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-md border flex-shrink-0 ${muscleColors[ex.muscle] || ''}`} style={{ fontWeight: 500 }}>
                  {ex.muscle}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 pt-0">
            <button onClick={() => navigate('/treinos')}
              className="w-full py-2.5 rounded-xl text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)', fontWeight: 600 }}>
              <Dumbbell className="w-4 h-4" /> Ver treino completo
            </button>
          </div>
        </div>

        {/* Macros */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest" style={{ fontWeight: 600 }}>Nutrição Hoje</p>
              <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                {caloriesConsumed.toLocaleString('pt-BR')}
                <span className="text-sm dark:text-zinc-500 text-slate-400" style={{ fontWeight: 400 }}> / {caloriesGoal.toLocaleString('pt-BR')} kcal</span>
              </h3>
            </div>
            <div className="relative w-16 h-16">
              <CircularProgress value={caloriesConsumed} max={caloriesGoal} color="#f97316" size={64} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs dark:text-white text-slate-900" style={{ fontWeight: 800 }}>{Math.round((caloriesConsumed / caloriesGoal) * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {[
              { label: 'Proteína', value: protein, max: proteinGoal, color: '#3b82f6', unit: 'g' },
              { label: 'Carboidratos', value: carbs, max: carbsGoal, color: '#10b981', unit: 'g' },
              { label: 'Gordura', value: fat, max: fatGoal, color: '#f97316', unit: 'g' },
            ].map(({ label, value, max, color, unit }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="dark:text-zinc-400 text-slate-500">{label}</span>
                  <span className="dark:text-zinc-200 text-slate-700" style={{ fontWeight: 600 }}>
                    {value}{unit} <span className="dark:text-zinc-500 text-slate-400" style={{ fontWeight: 400 }}>/ {max}{unit}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full dark:bg-zinc-800 bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Micro vitamins preview */}
          <div className="mt-4 pt-4 border-t dark:border-zinc-800 border-slate-200">
            <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>Vitaminas · % VD</p>
            <div className="grid grid-cols-4 gap-2">
              {dailyNutrition.vitamins.slice(0, 4).map(v => (
                <div key={v.label} className="text-center">
                  <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center text-white mb-1"
                    style={{ backgroundColor: v.dv >= 100 ? '#10b981' : '#8b5cf6', fontSize: '9px', fontWeight: 800 }}>
                    {v.shortLabel}
                  </div>
                  <p className="text-xs" style={{ fontWeight: 700, color: v.dv >= 100 ? '#10b981' : '#6b7280' }}>{v.dv}%</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/dieta')}
            className="mt-4 w-full py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all flex items-center justify-center gap-1.5" style={{ fontWeight: 600 }}>
            <Apple className="w-3.5 h-3.5" /> Ver plano alimentar completo
          </button>
        </div>

        {/* Hidratação + Semana */}
        <div className="space-y-4 flex flex-col">
          {/* Hydration */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest" style={{ fontWeight: 600 }}>Hidratação</p>
                <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                  {(cups * 0.3).toFixed(1)}L
                  <span className="text-sm dark:text-zinc-500 text-slate-400" style={{ fontWeight: 400 }}> / 3L</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: totalCups }).map((_, i) => (
                <button key={i} onClick={() => setCups(i < cups ? i : i + 1)}
                  className={`flex-1 h-9 rounded-lg transition-all hover:opacity-80 ${i < cups ? 'bg-cyan-500' : 'dark:bg-zinc-800 bg-slate-100'}`} />
              ))}
            </div>
            <p className="text-xs dark:text-zinc-500 text-slate-400 text-center">
              {cups >= totalCups ? '🎉 Meta atingida!' : `Faltam ${((totalCups - cups) * 0.3).toFixed(1)}L para a meta`}
            </p>
          </div>

          {/* Semana visual */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Semana Atual</h3>
              <button onClick={() => navigate('/treinos')} className="text-xs text-emerald-500 hover:underline" style={{ fontWeight: 600 }}>Ver tudo</button>
            </div>
            <div className="space-y-1.5">
              {weekPlan.map(day => (
                <div key={day.day} className={`flex items-center gap-2 p-2 rounded-xl transition-all ${day.today ? 'dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/20 border-blue-200' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${day.done ? 'bg-emerald-500 text-white' : day.today ? '' : day.rest ? 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-600 text-slate-400' : 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-500 text-slate-500'}`}
                    style={day.today ? { background: 'linear-gradient(135deg,#10b981,#3b82f6)' } : {}}>
                    {day.done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <span style={{ fontWeight: 700, color: day.today ? 'white' : undefined }}>{day.day}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${day.rest ? 'dark:text-zinc-600 text-slate-400' : 'dark:text-zinc-200 text-slate-700'}`} style={{ fontWeight: day.today ? 600 : 400 }}>{day.label}</p>
                    <p className="text-xs dark:text-zinc-600 text-slate-400 truncate">{day.muscles}</p>
                  </div>
                  {day.today && <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 flex-shrink-0" style={{ fontWeight: 600 }}>Hoje</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bento Row 3: Evolução + Metas + Profissionais ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Evolução rápida */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Composição Corporal</h3>
            </div>
            <button onClick={() => navigate('/evolucao')} className="text-xs text-emerald-500 hover:underline" style={{ fontWeight: 600 }}>Detalhes</button>
          </div>
          <p className="text-xs dark:text-zinc-500 text-slate-400 mb-4">Última avaliação: 01/03/2025</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Peso', value: '78.5 kg', prev: '80.2 kg', color: '#10b981', down: true },
              { label: 'IMC', value: '24.8', prev: '25.3', color: '#3b82f6', down: true },
              { label: '% Gordura', value: '14.2%', prev: '15.8%', color: '#f59e0b', down: true },
              { label: 'Massa Musc.', value: '65.8 kg', prev: '62.3 kg', color: '#8b5cf6', down: false },
            ].map(({ label, value, prev, color, down }) => (
              <motion.div key={label} whileHover={{ scale: 1.03 }} onClick={() => navigate('/evolucao')}
                className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-3 border dark:border-zinc-700 border-slate-200 cursor-pointer hover:dark:border-emerald-500/30 transition-colors">
                <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                <p className="text-sm" style={{ fontWeight: 800, color }}>{value}</p>
                <p className="text-xs dark:text-zinc-600 text-slate-400 flex items-center gap-0.5 mt-0.5">
                  {down
                    ? <span className="text-emerald-400">↓</span>
                    : <span className="text-blue-400">↑</span>}
                  {prev}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Metas ativas */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Minhas Metas</h3>
            </div>
            <button onClick={() => navigate('/evolucao')} className="text-xs text-blue-500 hover:underline" style={{ fontWeight: 600 }}>Ver todas</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Agachamento 120kg', cat: 'Força 💪', progress: 83, current: '100kg', target: '120kg', color: '#ef4444' },
              { title: 'Treinar 5× por 3 meses', cat: 'Hábito 🎯', progress: 100, current: '60 dias', target: '60 dias', color: '#10b981' },
              { title: 'Reduzir para 76kg', cat: 'Composição ⚖️', progress: 62, current: '78.5kg', target: '76kg', color: '#3b82f6' },
            ].map(({ title, cat, progress, current, target, color }) => (
              <div key={title} className="p-3 dark:bg-zinc-800/50 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs dark:text-white text-slate-900 leading-snug" style={{ fontWeight: 600 }}>{title}</p>
                  {progress >= 100 && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="dark:text-zinc-500 text-slate-400">{cat}</span>
                  <span style={{ fontWeight: 700, color }}>{progress}%</span>
                </div>
                <div className="w-full h-1.5 dark:bg-zinc-700 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">{current} / {target}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meus Profissionais */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Meus Profissionais</h3>
          </div>

          {/* Personal */}
          <div className="p-3 dark:bg-zinc-800/50 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <img src="https://ui-avatars.com/api/?name=Carlos+Pereira&background=3b82f6&color=fff"
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt="Personal" />
              <div className="flex-1 min-w-0">
                <p className="text-xs dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Carlos Pereira</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">Personal Trainer</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" title="Online" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { label: 'Plano', value: 'PPL', color: '#3b82f6' },
                { label: 'Adesão', value: '87%', color: '#10b981' },
                { label: 'Próx.', value: 'Amanhã 7h', color: '#f59e0b' },
              ].map(({ label, value, color }) => (
                <div key={label} className="dark:bg-zinc-700/50 bg-white rounded-xl p-1.5 border dark:border-zinc-600 border-slate-200">
                  <p className="text-xs truncate" style={{ fontWeight: 700, color }}>{value}</p>
                  <p className="text-xs dark:text-zinc-600 text-slate-400" style={{ fontSize: 9 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nutri */}
          <div className="p-3 dark:bg-zinc-800/50 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <img src="https://ui-avatars.com/api/?name=Dra+Paula+Lima&background=10b981&color=fff"
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt="Nutricionista" />
              <div className="flex-1 min-w-0">
                <p className="text-xs dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Dra. Paula Lima</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">Nutricionista</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-500 flex-shrink-0" title="Offline" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { label: 'Plano', value: 'Bulking', color: '#10b981' },
                { label: 'Adesão', value: '91%', color: '#10b981' },
                { label: 'Última', value: 'Há 3 dias', color: '#8b5cf6' },
              ].map(({ label, value, color }) => (
                <div key={label} className="dark:bg-zinc-700/50 bg-white rounded-xl p-1.5 border dark:border-zinc-600 border-slate-200">
                  <p className="text-xs truncate" style={{ fontWeight: 700, color }}>{value}</p>
                  <p className="text-xs dark:text-zinc-600 text-slate-400" style={{ fontSize: 9 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => navigate('/treinos')}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:dark:text-emerald-400 transition-all" style={{ fontWeight: 600 }}>
              <Dumbbell className="w-3.5 h-3.5" /> Treinos
            </button>
            <button onClick={() => navigate('/dieta')}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all" style={{ fontWeight: 600 }}>
              <Apple className="w-3.5 h-3.5" /> Dieta
            </button>
          </div>
        </div>
      </div>

      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </div>
  );
}