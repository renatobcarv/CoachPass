import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Target,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  X,
  Edit,
  Trash2,
  ChevronRight,
  Flame,
  Droplets,
  Scale,
  Activity,
  Apple,
  Calendar,
  Star,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Goal {
  id: string;
  patientId: string;
  patient: string;
  avatar: string;
  title: string;
  description: string;
  category: 'peso' | 'nutricional' | 'habito' | 'hidratacao' | 'exercicio';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'active' | 'achieved' | 'paused';
  checkIns: { date: string; value: number; note?: string }[];
}

const goals: Goal[] = [
  {
    id: 'g1',
    patientId: '1',
    patient: 'Ana Costa',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
    title: 'Reduzir peso corporal',
    description: 'Reduzir 5kg de forma gradual e saudável com deficit calórico moderado',
    category: 'peso',
    target: 63,
    current: 68.5,
    unit: 'kg',
    deadline: '2025-06-01',
    status: 'active',
    checkIns: [
      { date: '2025-03-01', value: 70.2, note: 'Início do acompanhamento' },
      { date: '2025-03-08', value: 69.8 },
      { date: '2025-03-12', value: 68.5, note: 'Boa adesão ao plano' },
    ],
  },
  {
    id: 'g2',
    patientId: '1',
    patient: 'Ana Costa',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
    title: 'Ingestão hídrica diária',
    description: 'Aumentar consumo de água para 2,5L por dia',
    category: 'hidratacao',
    target: 2.5,
    current: 2.1,
    unit: 'L/dia',
    deadline: '2025-04-01',
    status: 'active',
    checkIns: [
      { date: '2025-03-10', value: 1.8 },
      { date: '2025-03-11', value: 2.0 },
      { date: '2025-03-12', value: 2.1, note: 'Melhorando gradualmente' },
    ],
  },
  {
    id: 'g3',
    patientId: '2',
    patient: 'Roberto Lima',
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Lima&background=3b82f6&color=fff',
    title: 'Ingestão proteica diária',
    description: 'Atingir 2g de proteína por kg de peso corporal',
    category: 'nutricional',
    target: 180,
    current: 155,
    unit: 'g/dia',
    deadline: '2025-05-01',
    status: 'active',
    checkIns: [
      { date: '2025-03-08', value: 130 },
      { date: '2025-03-10', value: 148 },
      { date: '2025-03-12', value: 155 },
    ],
  },
  {
    id: 'g4',
    patientId: '2',
    patient: 'Roberto Lima',
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Lima&background=3b82f6&color=fff',
    title: 'Reduzir gordura corporal',
    description: 'Reduzir percentual de gordura de 24% para 18%',
    category: 'peso',
    target: 18,
    current: 24.1,
    unit: '%',
    deadline: '2025-08-01',
    status: 'active',
    checkIns: [
      { date: '2025-02-01', value: 26.0 },
      { date: '2025-03-01', value: 24.8 },
      { date: '2025-03-12', value: 24.1 },
    ],
  },
  {
    id: 'g5',
    patientId: '1',
    patient: 'Ana Costa',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
    title: 'Eliminar açúcar refinado',
    description: 'Reduzir consumo de açúcar refinado a zero por 30 dias',
    category: 'habito',
    target: 30,
    current: 30,
    unit: 'dias',
    deadline: '2025-03-01',
    status: 'achieved',
    checkIns: [],
  },
];

const categoryConfig = {
  peso: { label: 'Peso / Composição', icon: Scale, color: '#f59e0b' },
  nutricional: { label: 'Nutricional', icon: Apple, color: '#10b981' },
  habito: { label: 'Hábito Alimentar', icon: Star, color: '#8b5cf6' },
  hidratacao: { label: 'Hidratação', icon: Droplets, color: '#3b82f6' },
  exercicio: { label: 'Atividade Física', icon: Activity, color: '#ef4444' },
};

const statusConfig = {
  active: { label: 'Ativa', color: '#10b981' },
  achieved: { label: 'Concluída', color: '#f59e0b' },
  paused: { label: 'Pausada', color: '#6b7280' },
};

export function NutritionistMetas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'goals' | 'checkins'>('goals');
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ patient: '', title: '', description: '', category: 'peso', target: '', unit: '', deadline: '' });

  const filtered = goals.filter(g =>
    filterStatus === 'all' || g.status === filterStatus
  );

  const activeGoals = goals.filter(g => g.status === 'active').length;
  const achievedGoals = goals.filter(g => g.status === 'achieved').length;

  const GoalProgress = ({ goal }: { goal: Goal }) => {
    const isReduction = goal.target < goal.checkIns[0]?.value || goal.target < goal.current;
    const start = goal.checkIns[0]?.value || goal.current;
    let pct: number;
    if (isReduction) {
      pct = Math.min(100, Math.max(0, ((start - goal.current) / (start - goal.target)) * 100));
    } else {
      pct = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
    }
    return Math.round(pct);
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      <button
        onClick={() => navigate('/nutritionist')}
        className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Prescrição de Metas</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Crie e acompanhe metas e objetivos para seus pacientes via check-in no app
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Metas Ativas', value: activeGoals, icon: Target, color: '#10b981' },
          { label: 'Concluídas', value: achievedGoals, icon: CheckCircle, color: '#f59e0b' },
          { label: 'Pacientes com Metas', value: new Set(goals.map(g => g.patientId)).size, icon: Users, color: '#3b82f6' },
          { label: 'Check-ins esta Semana', value: goals.reduce((s, g) => s + g.checkIns.length, 0), icon: Calendar, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl mb-1" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 inline-flex dark:border-zinc-800 border border-slate-200">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'active', label: 'Ativas' },
            { id: 'achieved', label: 'Concluídas' },
            { id: 'paused', label: 'Pausadas' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterStatus(id)}
              className={`px-4 py-2 rounded-xl text-xs transition-all ${filterStatus === id ? 'text-white' : 'dark:text-zinc-400 text-slate-600'}`}
              style={filterStatus === id ? { background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-4">
        {filtered.map((goal) => {
          const catCfg = categoryConfig[goal.category];
          const stsCfg = statusConfig[goal.status];
          const Icon = catCfg.icon;
          const pct = GoalProgress({ goal });
          const isExpanded = expandedGoal === goal.id;

          return (
            <div
              key={goal.id}
              className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden"
            >
              <div
                className="flex items-start gap-4 p-5 cursor-pointer hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              >
                {/* Avatar */}
                <img src={goal.avatar} alt={goal.patient} className="w-10 h-10 rounded-xl flex-shrink-0 object-cover" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{goal.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catCfg.color}20`, color: catCfg.color, fontWeight: 600 }}>
                      {catCfg.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${stsCfg.color}20`, color: stsCfg.color, fontWeight: 600 }}>
                      {stsCfg.label}
                    </span>
                  </div>
                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-3">{goal.patient} · prazo: {goal.deadline}</p>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: catCfg.color }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      <span style={{ color: catCfg.color, fontWeight: 700 }}>{pct}%</span>
                      <span className="dark:text-zinc-500 text-slate-400">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {goal.status === 'achieved' && (
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <ChevronRight className={`w-4 h-4 dark:text-zinc-500 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t dark:border-zinc-800 border-slate-200"
                  >
                    <div className="p-5 space-y-4">
                      <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                        <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2" style={{ fontWeight: 600 }}>DESCRIÇÃO</p>
                        <p className="text-sm dark:text-zinc-300 text-slate-700 leading-relaxed">{goal.description}</p>
                      </div>

                      {/* Check-ins */}
                      {goal.checkIns.length > 0 && (
                        <div>
                          <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
                            Histórico de Check-ins
                          </p>
                          <div className="space-y-2">
                            {goal.checkIns.slice().reverse().map((ci, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                                <Calendar className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs dark:text-zinc-400 text-slate-500">{ci.date}</p>
                                  {ci.note && <p className="text-xs dark:text-zinc-500 text-slate-400 italic mt-0.5">{ci.note}</p>}
                                </div>
                                <span style={{ color: catCfg.color, fontWeight: 700 }} className="text-sm">
                                  {ci.value} {goal.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:border-emerald-400 hover:dark:text-emerald-400 transition-all"
                        >
                          <Calendar className="w-3 h-3" /> Registrar Check-in
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:border-blue-400 hover:dark:text-blue-400 transition-all"
                        >
                          <Send className="w-3 h-3" /> Notificar Paciente
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-amber-500 hover:border-amber-400 hover:dark:text-amber-400 transition-all"
                        >
                          <Edit className="w-3 h-3" /> Editar Meta
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Remover
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* New Goal Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="dark:text-white text-slate-900">Nova Meta para Paciente</h3>
                <button onClick={() => setShowNewModal(false)} className="p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Paciente', key: 'patient', type: 'select', options: ['Ana Costa', 'Roberto Lima', 'Carlos Souza'] },
                  { label: 'Categoria', key: 'category', type: 'select', options: Object.entries(categoryConfig).map(([k, v]) => ({ value: k, label: v.label })) },
                  { label: 'Título da Meta', key: 'title', type: 'text', placeholder: 'Ex: Atingir 2L de água por dia' },
                  { label: 'Descrição', key: 'description', type: 'textarea', placeholder: 'Descreva a meta e como ela será acompanhada' },
                  { label: 'Valor Alvo', key: 'target', type: 'number', placeholder: 'Ex: 65' },
                  { label: 'Unidade', key: 'unit', type: 'text', placeholder: 'Ex: kg, %, L/dia, dias' },
                  { label: 'Prazo', key: 'deadline', type: 'date' },
                ].map(({ label, key, type, placeholder, options }) => (
                  <div key={key}>
                    <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2" style={{ fontWeight: 500 }}>{label}</label>
                    {type === 'textarea' ? (
                      <textarea
                        rows={3}
                        placeholder={placeholder}
                        value={newGoal[key as keyof typeof newGoal]}
                        onChange={(e) => setNewGoal(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                      />
                    ) : type === 'select' && Array.isArray(options) ? (
                      <select
                        value={newGoal[key as keyof typeof newGoal]}
                        onChange={(e) => setNewGoal(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="">Selecione...</option>
                        {(options as any[]).map((o: any) =>
                          typeof o === 'string'
                            ? <option key={o} value={o}>{o}</option>
                            : <option key={o.value} value={o.value}>{o.label}</option>
                        )}
                      </select>
                    ) : (
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={newGoal[key as keyof typeof newGoal]}
                        onChange={(e) => setNewGoal(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-3 rounded-xl text-sm border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700">
                  Cancelar
                </button>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}
                >
                  <Target className="w-4 h-4" />
                  Prescrever Meta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
