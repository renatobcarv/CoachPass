import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Target, Plus, X, Save, CheckCircle, Clock,
  TrendingUp, Users, Calendar, Flame, Star, BarChart3,
  ChevronRight, Dumbbell, Activity, Award, Edit3, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  title: string;
  category: 'composicao' | 'desempenho' | 'habito' | 'forca' | 'resistencia';
  target: string;
  current: string;
  unit: string;
  deadline: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  notes: string;
  checkIns: { date: string; value: string; note: string }[];
}

const students = [
  { id: '1', name: 'Lucas Silva', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '2', name: 'Maria Santos', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
  { id: '3', name: 'Carlos Ramos', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff' },
  { id: '4', name: 'Ana Oliveira', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff' },
];

const catConfig = {
  composicao: { label: 'Composição Corporal', icon: '⚖️', color: '#3b82f6' },
  desempenho: { label: 'Desempenho', icon: '🏆', color: '#f59e0b' },
  habito: { label: 'Hábito', icon: '🎯', color: '#10b981' },
  forca: { label: 'Força', icon: '💪', color: '#ef4444' },
  resistencia: { label: 'Resistência', icon: '🏃', color: '#8b5cf6' },
};

const mockGoals: Goal[] = [
  {
    id: '1', studentId: '1', studentName: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff',
    title: 'Agachamento 120kg', category: 'forca', target: '120', current: '100', unit: 'kg',
    deadline: '2025-06-30', progress: 83, status: 'active', notes: 'Progresso de 5kg/mês',
    checkIns: [
      { date: '2025-01-15', value: '80', note: 'Início da fase de força' },
      { date: '2025-02-15', value: '90', note: 'Excelente evolução' },
      { date: '2025-03-10', value: '100', note: 'Nova marca pessoal!' },
    ],
  },
  {
    id: '2', studentId: '2', studentName: 'Maria Santos', studentAvatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff',
    title: 'Reduzir 5kg de gordura', category: 'composicao', target: '5', current: '3.2', unit: 'kg',
    deadline: '2025-05-01', progress: 64, status: 'active', notes: 'Déficit calórico + HIIT',
    checkIns: [
      { date: '2025-01-20', value: '0.8', note: 'Primeiro mês de adaptação' },
      { date: '2025-02-20', value: '2.0', note: 'Ritmo acelerou' },
      { date: '2025-03-10', value: '3.2', note: 'Mantendo ritmo ótimo!' },
    ],
  },
  {
    id: '3', studentId: '3', studentName: 'Carlos Ramos', studentAvatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff',
    title: 'Correr 5km sem parar', category: 'resistencia', target: '5', current: '3.5', unit: 'km',
    deadline: '2025-04-30', progress: 70, status: 'active', notes: 'Treino progressivo',
    checkIns: [{ date: '2025-03-01', value: '3.5', note: 'Boa evolução!' }],
  },
  {
    id: '4', studentId: '1', studentName: 'Lucas Silva', studentAvatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff',
    title: 'Treinar 5x/semana por 3 meses', category: 'habito', target: '60', current: '60', unit: 'dias',
    deadline: '2025-03-31', progress: 100, status: 'completed', notes: 'Meta cumprida!',
    checkIns: [],
  },
];

const emptyForm = { studentId: '', title: '', category: 'composicao', target: '', unit: '', deadline: '', notes: '' };

export function PersonalMetas() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm });
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null);
  const [checkInValue, setCheckInValue] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');

  const handleAdd = () => {
    if (!form.studentId || !form.title || !form.target) { toast.error('Preencha os campos obrigatórios'); return; }
    const student = students.find(s => s.id === form.studentId)!;
    const newGoal: Goal = {
      id: Date.now().toString(), studentId: form.studentId, studentName: student.name,
      studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=10b981&color=fff`,
      title: form.title, category: form.category as any, target: form.target,
      current: '0', unit: form.unit, deadline: form.deadline, progress: 0,
      status: 'active', notes: form.notes, checkIns: [],
    };
    setGoals(prev => [newGoal, ...prev]);
    setShowModal(false);
    setForm({ ...emptyForm });
    toast.success('Meta criada!');
  };

  const handleCheckIn = () => {
    if (!checkInGoal || !checkInValue) return;
    const target = Number(checkInGoal.target);
    const current = Number(checkInValue);
    const progress = Math.min(100, Math.round((current / target) * 100));
    const status = progress >= 100 ? 'completed' : checkInGoal.status;
    setGoals(prev => prev.map(g => g.id === checkInGoal.id ? {
      ...g, current: checkInValue, progress, status,
      checkIns: [...g.checkIns, { date: new Date().toISOString().split('T')[0], value: checkInValue, note: checkInNote }],
    } : g));
    setCheckInGoal(null);
    setCheckInValue('');
    setCheckInNote('');
    toast.success('Check-in registrado!');
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Meta removida');
  };

  const filteredGoals = goals.filter(g => {
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchStudent = filterStudent === 'all' || g.studentId === filterStudent;
    return matchStatus && matchStudent;
  });

  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const avgProgress = goals.filter(g => g.status === 'active').reduce((s, g) => s + g.progress, 0) / Math.max(1, activeCount);

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Prescrição de Metas</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Defina metas SMART e acompanhe o progresso dos seus alunos</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Nova Meta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Metas Ativas', value: activeCount, color: '#10b981', icon: Target },
          { label: 'Concluídas', value: completedCount, color: '#3b82f6', icon: Award },
          { label: 'Progresso Médio', value: `${Math.round(avgProgress)}%`, color: '#f59e0b', icon: TrendingUp },
          { label: 'Total de Alunos', value: new Set(goals.map(g => g.studentId)).size, color: '#8b5cf6', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl dark:text-white text-slate-900 mb-0.5" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none">
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="completed">Concluídas</option>
          <option value="paused">Pausadas</option>
        </select>
        <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none">
          <option value="all">Todos os alunos</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredGoals.map(goal => {
          const cat = catConfig[goal.category];
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline + 'T12:00').getTime() - Date.now()) / 86400000) : null;
          return (
            <motion.div key={goal.id} layout className={`dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden ${goal.status === 'completed' ? 'opacity-80' : ''}`}>
              {/* Card header */}
              <div className="p-5 border-b dark:border-zinc-800 border-slate-200">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}15`, color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {goal.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    <button onClick={() => deleteGoal(goal.id)} className="w-6 h-6 rounded-lg flex items-center justify-center dark:text-zinc-600 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm dark:text-white text-slate-900 mb-2" style={{ fontWeight: 700 }}>{goal.title}</h4>

                <div className="flex items-center gap-2">
                  <img src={goal.studentAvatar} className="w-6 h-6 rounded-lg" alt={goal.studentName} />
                  <span className="text-xs dark:text-zinc-400 text-slate-500">{goal.studentName}</span>
                  {daysLeft !== null && daysLeft > 0 && (
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md ${daysLeft <= 14 ? 'bg-red-500/10 text-red-400' : 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-500 text-slate-500'}`} style={{ fontWeight: 600 }}>
                      {daysLeft}d restantes
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="p-5">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 mb-0.5">Atual / Meta</p>
                    <p className="text-lg dark:text-white text-slate-900" style={{ fontWeight: 800 }}>
                      {goal.current} <span className="text-xs dark:text-zinc-500 text-slate-400">/ {goal.target} {goal.unit}</span>
                    </p>
                  </div>
                  <p className="text-2xl" style={{ fontWeight: 800, color: goal.progress >= 100 ? '#10b981' : cat.color }}>{goal.progress}%</p>
                </div>

                <div className="w-full h-2.5 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 0.8 }}
                    style={{ background: goal.progress >= 100 ? 'linear-gradient(90deg,#10b981,#059669)' : `linear-gradient(90deg,${cat.color},${cat.color}cc)` }} />
                </div>

                {/* Recent check-ins */}
                {goal.checkIns.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2" style={{ fontWeight: 600 }}>Últimos check-ins</p>
                    <div className="space-y-1.5">
                      {goal.checkIns.slice(-2).map((ci, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="dark:text-zinc-600 text-slate-400 tabular-nums flex-shrink-0">{new Date(ci.date + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                          <span className="font-semibold" style={{ color: cat.color }}>{ci.value} {goal.unit}</span>
                          {ci.note && <span className="dark:text-zinc-500 text-slate-400 truncate">— {ci.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {goal.status === 'active' && (
                  <button onClick={() => setCheckInGoal(goal)}
                    className="w-full py-2.5 rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg,${cat.color},${cat.color}cc)`, fontWeight: 600 }}>
                    <Activity className="w-4 h-4" /> Registrar Check-in
                  </button>
                )}

                {goal.status === 'completed' && (
                  <div className="flex items-center justify-center gap-2 py-2 rounded-xl dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-500" style={{ fontWeight: 700 }}>Meta Concluída!</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full text-center py-16 dark:text-zinc-600 text-slate-400">
            <Target className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Nenhuma meta encontrada</p>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 w-full max-w-lg z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Nova Meta</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Aluno *</label>
                  <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                    <option value="">Selecione...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Título da meta *</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Agachamento 120kg"
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Categoria</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(catConfig).map(([k, v]) => (
                      <button key={k} onClick={() => setForm(f => ({ ...f, category: k }))}
                        className={`py-2 px-3 rounded-xl text-xs border transition-all ${form.category === k ? 'text-white border-transparent' : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                        style={form.category === k ? { backgroundColor: v.color, fontWeight: 600 } : {}}>
                        {v.icon} {v.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Valor alvo *</label>
                    <input type="text" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="120"
                      className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Unidade</label>
                    <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg, %, km, dias..."
                      className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Prazo</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Notas / estratégia</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Como atingir essa meta..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 text-sm">Cancelar</button>
                <button onClick={handleAdd} className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}>
                  <Plus className="w-4 h-4" /> Criar Meta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-in Modal */}
      <AnimatePresence>
        {checkInGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCheckInGoal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 p-6 w-full max-w-sm z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Registrar Check-in</h3>
                <button onClick={() => setCheckInGoal(null)} className="w-8 h-8 rounded-xl dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 mb-4 border dark:border-zinc-700 border-slate-200">
                <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{checkInGoal.title}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">{checkInGoal.studentName} · Meta: {checkInGoal.target} {checkInGoal.unit}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Valor atual ({checkInGoal.unit})</label>
                  <input type="text" value={checkInValue} onChange={e => setCheckInValue(e.target.value)} placeholder={`Ex: ${checkInGoal.current}`}
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Observação</label>
                  <input type="text" value={checkInNote} onChange={e => setCheckInNote(e.target.value)} placeholder="Ex: Nova marca pessoal!"
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setCheckInGoal(null)} className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 text-sm">Cancelar</button>
                <button onClick={handleCheckIn} className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}>
                  <CheckCircle className="w-4 h-4" /> Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
