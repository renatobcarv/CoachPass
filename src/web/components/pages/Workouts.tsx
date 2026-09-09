import React, { useState } from 'react';
import {
  Dumbbell,
  Zap,
  Clock,
  Flame,
  ChevronRight,
  CheckCircle2,
  Circle,
  RefreshCw,
  Plus,
  Filter,
  Calendar,
  MoreHorizontal,
  Info,
  X,
  Search,
  Share2,
  Download,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ExerciseModal } from '../ExerciseModal';
import { getExerciseDetail, ExerciseDetail } from '../../data/exerciseData';
import { toast } from 'sonner';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const todayIndex = 1; // Tuesday

const weekPlan = [
  { day: 'Seg', label: 'Push A', muscles: 'Peito · Ombro · Tríceps', done: true, color: '#10b981' },
  { day: 'Ter', label: 'Pull A', muscles: 'Costas · Bíceps', done: false, current: true, color: '#3b82f6' },
  { day: 'Qua', label: 'Legs A', muscles: 'Quadríceps · Posterior', done: false, color: '#8b5cf6' },
  { day: 'Qui', label: 'Push B', muscles: 'Peito · Ombro · Tríceps', done: false, color: '#10b981' },
  { day: 'Sex', label: 'Pull B', muscles: 'Costas · Bíceps', done: false, color: '#3b82f6' },
  { day: 'Sáb', label: 'Descanso', muscles: 'Recuperação ativa', done: false, rest: true, color: '#6b7280' },
  { day: 'Dom', label: 'Descanso', muscles: 'Recuperação completa', done: false, rest: true, color: '#6b7280' },
];

interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  muscle: string;
  rest: string;
  completed: boolean;
  swapping?: boolean;
}

const todayExercises: ExerciseItem[] = [
  { id: '1', name: 'Barra Fixa Pronada', sets: 4, reps: '6-8', weight: 'Peso corporal', muscle: 'Costas', rest: '90s', completed: false },
  { id: '2', name: 'Remada Curvada', sets: 4, reps: '8-10', weight: '70kg', muscle: 'Costas', rest: '90s', completed: false },
  { id: '3', name: 'Remada Unilateral', sets: 3, reps: '10-12', weight: '30kg', muscle: 'Costas', rest: '60s', completed: false },
  { id: '4', name: 'Rosca Direta', sets: 3, reps: '10-12', weight: '20kg', muscle: 'Bíceps', rest: '60s', completed: false },
  { id: '5', name: 'Rosca Martelo', sets: 3, reps: '12-15', weight: '16kg', muscle: 'Bíceps', rest: '60s', completed: false },
  { id: '6', name: 'Rosca Concentrada', sets: 2, reps: '15-20', weight: '12kg', muscle: 'Bíceps', rest: '45s', completed: false },
];

const muscleColors: Record<string, string> = {
  Costas: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Bíceps: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Peito: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Ombro: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Tríceps: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Pernas: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
};

export function Workouts() {
  const [exercises, setExercises] = useState(todayExercises);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(todayIndex);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterMuscle, setFilterMuscle] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10-12');
  const [newExWeight, setNewExWeight] = useState('');
  const [showWorkoutMenu, setShowWorkoutMenu] = useState(false);

  const handleOpenExercise = (name: string) => {
    const detail = getExerciseDetail(name);
    if (detail) setSelectedExercise(detail);
  };

  const handleSwap = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, swapping: true } : ex))
    );
    setTimeout(() => {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === id
            ? { ...ex, swapping: false, name: ex.name.includes('(IA)') ? ex.name.replace(' (IA)', '') : ex.name + ' (IA)' }
            : ex
        )
      );
    }, 1500);
  };

  const toggleDone = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const muscles = ['Todos', 'Costas', 'Bíceps', 'Peito', 'Ombro', 'Tríceps', 'Pernas'];

  const addExercise = () => {
    if (!newExName.trim()) return;
    const newEx: ExerciseItem = {
      id: String(Date.now()),
      name: newExName.trim(),
      sets: Number(newExSets) || 3,
      reps: newExReps || '10-12',
      weight: newExWeight || 'Corporal',
      muscle: 'Costas',
      rest: '60s',
      completed: false,
    };
    setExercises((prev) => [...prev, newEx]);
    setNewExName('');
    setNewExSets('3');
    setNewExReps('10-12');
    setNewExWeight('');
    setShowAddForm(false);
  };

  const filteredExercises = filterMuscle === 'Todos'
    ? exercises
    : exercises.filter((ex) => ex.muscle === filterMuscle);

  const completed = filteredExercises.filter((e) => e.completed).length;

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="dark:text-white text-slate-900">Meus Treinos</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            Programa PPL · Semana 4 de 12
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 text-sm transition-colors ${
              showFilter || filterMuscle !== 'Todos'
                ? 'text-emerald-500 dark:border-emerald-500/40 border-emerald-300'
                : 'dark:text-zinc-400 text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            {filterMuscle !== 'Todos' ? filterMuscle : 'Filtrar'}
          </button>
          <button
            onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2500); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {generating ? 'Gerando...' : 'Gerar com IA'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="dark:bg-zinc-900 bg-white rounded-2xl p-4 dark:border-zinc-800 border border-slate-200 mb-4 flex flex-wrap gap-2">
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => { setFilterMuscle(m); setShowFilter(false); }}
              className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                filterMuscle === m
                  ? 'text-white'
                  : 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700'
              }`}
              style={filterMuscle === m ? { background: 'linear-gradient(135deg, #10b981, #3b82f6)', fontWeight: 600 } : {}}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Weekly Schedule */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="dark:text-white text-slate-900">Semana Atual</h3>
              <Calendar className="w-4 h-4 dark:text-zinc-500 text-slate-400" />
            </div>
            <div className="space-y-2">
              {weekPlan.map((day, i) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                    activeDay === i
                      ? 'ring-2 ring-emerald-500/30 dark:bg-emerald-500/10 bg-emerald-50'
                      : 'dark:hover:bg-zinc-800 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      day.done
                        ? 'bg-emerald-500'
                        : day.current
                        ? ''
                        : day.rest
                        ? 'dark:bg-zinc-800 bg-slate-100'
                        : 'dark:bg-zinc-800 bg-slate-100'
                    }`}
                    style={day.current ? { background: 'linear-gradient(135deg, #10b981, #3b82f6)' } : {}}
                  >
                    {day.done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-xs ${day.rest ? 'dark:text-zinc-600 text-slate-400' : day.current ? 'text-white' : 'dark:text-zinc-500 text-slate-500'}`} style={{ fontWeight: 700 }}>
                        {day.day}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      day.rest ? 'dark:text-zinc-500 text-slate-400' : 'dark:text-zinc-200 text-slate-700'
                    }`} style={{ fontWeight: day.current ? 600 : 400 }}>
                      {day.label}
                    </p>
                    <p className="text-xs dark:text-zinc-600 text-slate-400 truncate">{day.muscles}</p>
                  </div>
                  {day.current && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0" style={{ fontWeight: 600 }}>
                      Hoje
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Workout Stats */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Volume total', value: '~8.5t', icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Duração', value: '~60min', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Calorias', value: '~420', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { label: 'Exercícios', value: `${completed}/${exercises.length}`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-3`}>
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 700 }}>{value}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Image */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl overflow-hidden dark:border-zinc-800 border border-slate-200 h-48 relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656774950529-44a6153521ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
              alt="Weight lifting"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-zinc-900 from-white/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="text-sm dark:text-white text-slate-800" style={{ fontWeight: 600 }}>Pull Day A</p>
              <p className="text-xs dark:text-zinc-400 text-slate-600">Costas · Bíceps</p>
            </div>
          </div>
        </div>

        {/* Right Column - Exercise List */}
        <div className="lg:col-span-2">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="dark:text-white text-slate-900">Pull Day A</h3>
                <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">
                  Terça-feira · Costas & Bíceps
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowWorkoutMenu(v => !v)}
                  className="w-9 h-9 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-500 hover:dark:text-zinc-200 hover:text-slate-700 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showWorkoutMenu && (
                  <div className="absolute right-0 top-11 w-48 dark:bg-zinc-800 bg-white border dark:border-zinc-700 border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                    {[
                      { label: 'Compartilhar treino', icon: Share2, action: () => { toast.success('Link de compartilhamento copiado!'); setShowWorkoutMenu(false); } },
                      { label: 'Exportar PDF', icon: Download, action: () => { toast.success('Exportando treino em PDF...'); setShowWorkoutMenu(false); } },
                      { label: 'Imprimir', icon: Printer, action: () => { window.print(); setShowWorkoutMenu(false); } },
                    ].map(({ label, icon: Icon, action }) => (
                      <button key={label} onClick={action}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm dark:text-zinc-300 text-slate-600 hover:dark:bg-zinc-700 hover:bg-slate-50 transition-colors text-left">
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl dark:bg-zinc-800/50 bg-slate-50">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1.5 dark:text-zinc-400 text-slate-500">
                  <span>Progresso do treino · <span className="text-emerald-500" style={{ fontWeight: 500 }}>Clique no nome para ver execução</span></span>
                  <span style={{ fontWeight: 600 }}>{completed}/{exercises.length}</span>
                </div>
                <div className="h-2 rounded-full dark:bg-zinc-700 bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(completed / exercises.length) * 100}%`,
                      background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                    }}
                  />
                </div>
              </div>
              <div className="text-sm" style={{ fontWeight: 700, color: '#10b981' }}>
                {Math.round((completed / exercises.length) * 100)}%
              </div>
            </div>

            <div className="space-y-3">
              {filteredExercises.map((ex, i) => (
                <motion.div
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-4 transition-all ${
                    ex.completed
                      ? 'dark:bg-emerald-500/5 bg-emerald-50 dark:border-emerald-500/20 border-emerald-200'
                      : 'dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleDone(ex.id)} className="mt-0.5 flex-shrink-0">
                      {ex.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 dark:text-zinc-600 text-slate-300 hover:text-emerald-500 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <button
                          onClick={() => handleOpenExercise(ex.name)}
                          className={`text-sm text-left group flex items-center gap-1 hover:underline transition-colors ${
                            ex.completed
                              ? 'line-through dark:text-zinc-500 text-slate-400'
                              : 'dark:text-white text-slate-900 dark:hover:text-emerald-400 hover:text-emerald-600'
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {ex.name}
                          <Info className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity dark:text-zinc-500 text-slate-400" />
                        </button>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            muscleColors[ex.muscle] || ''
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {ex.muscle}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs dark:text-zinc-500 text-slate-400">
                        <span className="flex items-center gap-1">
                          <span style={{ fontWeight: 600 }} className="dark:text-zinc-300 text-slate-600">{ex.sets}×</span> séries
                        </span>
                        <span className="flex items-center gap-1">
                          <span style={{ fontWeight: 600 }} className="dark:text-zinc-300 text-slate-600">{ex.reps}</span> reps
                        </span>
                        <span className="flex items-center gap-1">
                          <span style={{ fontWeight: 600 }} className="dark:text-zinc-300 text-slate-600">{ex.weight}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{ex.rest} descanso</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSwap(ex.id)}
                      disabled={ex.swapping}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all hover:scale-105 disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
                        borderColor: 'rgba(16,185,129,0.3)',
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    >
                      {ex.swapping ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      {ex.swapping ? 'Buscando...' : 'IA: Trocar'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add Exercise Form */}
            {showAddForm ? (
              <div className="mt-4 p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>Novo Exercício</p>
                  <button onClick={() => setShowAddForm(false)} className="dark:text-zinc-500 text-slate-400 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="Nome do exercício"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-700 bg-white border dark:border-zinc-600 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs dark:text-zinc-500 text-slate-400 mb-1 block">Séries</label>
                    <input type="number" value={newExSets} onChange={(e) => setNewExSets(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-sm dark:bg-zinc-700 bg-white border dark:border-zinc-600 border-slate-200 dark:text-white text-slate-900 focus:outline-none text-center" />
                  </div>
                  <div>
                    <label className="text-xs dark:text-zinc-500 text-slate-400 mb-1 block">Reps</label>
                    <input type="text" value={newExReps} onChange={(e) => setNewExReps(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-sm dark:bg-zinc-700 bg-white border dark:border-zinc-600 border-slate-200 dark:text-white text-slate-900 focus:outline-none text-center" />
                  </div>
                  <div>
                    <label className="text-xs dark:text-zinc-500 text-slate-400 mb-1 block">Carga</label>
                    <input type="text" value={newExWeight} onChange={(e) => setNewExWeight(e.target.value)}
                      placeholder="kg"
                      className="w-full px-2 py-1.5 rounded-lg text-sm dark:bg-zinc-700 bg-white border dark:border-zinc-600 border-slate-200 dark:text-white text-slate-900 focus:outline-none text-center" />
                  </div>
                </div>
                <button
                  onClick={addExercise}
                  disabled={!newExName.trim()}
                  className="w-full py-2 rounded-xl text-sm text-white disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', fontWeight: 600 }}
                >
                  Adicionar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed dark:border-zinc-700 border-slate-300 dark:text-zinc-500 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar exercício
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </div>
  );
}