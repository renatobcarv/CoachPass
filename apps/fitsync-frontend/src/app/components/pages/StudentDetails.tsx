import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Activity,
  Calendar,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Heart,
  Ruler,
  Weight,
  Zap,
  AlertCircle,
  Droplet,
  Wind,
  Target,
  Award,
  BarChart3,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data - em produção viria do backend
const studentData = {
  id: '1',
  name: 'Lucas Silva',
  email: 'lucas@email.com',
  avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff',
  age: 28,
  height: 178,
  startDate: '2024-01-15',
  goal: 'Ganho de Massa Muscular',
  workoutsThisWeek: 4,
  totalWorkouts: 48,
  adherence: 87,
};

const bioimpedanceData = {
  date: '2024-03-01',
  weight: 78.5,
  bodyFat: 14.2,
  muscleMass: 65.8,
  visceralFat: 7,
  bmr: 1840,
  hydration: 58.3,
  boneMass: 3.2,
  bmi: 24.8,
};

const restrictions = [
  { id: '1', type: 'injury', title: 'Dor no Joelho Esquerdo', description: 'Evitar agachamento profundo e saltos', severity: 'medium', date: '2024-02-20' },
  { id: '2', type: 'limitation', title: 'Mobilidade de Ombro Limitada', description: 'Fazer aquecimento antes de treinos de empurrar', severity: 'low', date: '2024-01-10' },
];

const characteristics = [
  { label: 'Biotipo', value: 'Mesomorfo' },
  { label: 'Nível', value: 'Intermediário' },
  { label: 'Frequência', value: '5× semana' },
  { label: 'Experiência', value: '2 anos' },
];

const weightProgress = [
  { id: 'jan', month: 'Jan', weight: 76.2 },
  { id: 'fev', month: 'Fev', weight: 77.1 },
  { id: 'mar', month: 'Mar', weight: 78.5 },
];

const bodyComposition = [
  { id: 'jan', month: 'Jan', fat: 15.8, muscle: 62.3 },
  { id: 'fev', month: 'Fev', fat: 15.1, muscle: 63.9 },
  { id: 'mar', month: 'Mar', fat: 14.2, muscle: 65.8 },
];

const workoutHistory = [
  { id: '1', name: 'Push A', date: 'Hoje', completed: true, exercises: 6 },
  { id: '2', name: 'Pull B', date: 'Ontem', completed: true, exercises: 5 },
  { id: '3', name: 'Legs A', date: '2 dias atrás', completed: true, exercises: 7 },
  { id: '4', name: 'Push B', date: '3 dias atrás', completed: true, exercises: 6 },
];

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bioimpedance' | 'progress' | 'workouts'>('overview');

  const severityColors = {
    low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    medium: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/personal')}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Alunos
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={studentData.avatar}
              alt={studentData.name}
              className="w-16 h-16 rounded-2xl ring-4 ring-emerald-500/20"
            />
            <div>
              <h1 className="dark:text-white text-slate-900 mb-1">{studentData.name}</h1>
              <div className="flex items-center gap-3 text-sm dark:text-zinc-400 text-slate-500">
                <span>{studentData.age} anos</span>
                <span>•</span>
                <span>{studentData.height}cm</span>
                <span>•</span>
                <span className="text-emerald-500">{studentData.goal}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/personal/criar-treino`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 transition-all shadow-lg">
            <Plus className="w-4 h-4" />
            Criar Treino
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Treinos na Semana', value: studentData.workoutsThisWeek, icon: Dumbbell, color: '#10b981' },
          { label: 'Total de Treinos', value: studentData.totalWorkouts, icon: Award, color: '#3b82f6' },
          { label: 'Taxa de Adesão', value: `${studentData.adherence}%`, icon: TrendingUp, color: '#8b5cf6' },
          { label: 'Peso Atual', value: `${bioimpedanceData.weight}kg`, icon: Weight, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-2xl p-4 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <p className="dark:text-white text-slate-900 text-xl mb-1" style={{ fontWeight: 700 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex dark:border-zinc-800 border border-slate-200">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Activity },
          { id: 'bioimpedance', label: 'Bioimpedância', icon: Zap },
          { id: 'progress', label: 'Progresso', icon: BarChart3 },
          { id: 'workouts', label: 'Treinos', icon: Dumbbell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                  : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
              style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Characteristics */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-4">Características Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  {characteristics.map(({ label, value }) => (
                    <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                      <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrictions */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Restrições e Limitações
                </h3>
                <div className="space-y-3">
                  {restrictions.map((restriction) => {
                    const colors = severityColors[restriction.severity as keyof typeof severityColors];
                    return (
                      <div
                        key={restriction.id}
                        className={`p-4 rounded-2xl border ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className={`text-sm ${colors.text}`} style={{ fontWeight: 600 }}>
                            {restriction.title}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {restriction.type === 'injury' ? 'Lesão' : 'Limitação'}
                          </span>
                        </div>
                        <p className="text-xs dark:text-zinc-400 text-slate-500 mb-2">{restriction.description}</p>
                        <p className="text-xs dark:text-zinc-600 text-slate-400">Registrado em {restriction.date}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'bioimpedance' && (
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="dark:text-white text-slate-900">Análise Corporal Completa</h3>
                <span className="text-xs dark:text-zinc-500 text-slate-400">Última medição: {bioimpedanceData.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Peso', value: `${bioimpedanceData.weight} kg`, icon: Weight, color: '#10b981' },
                  { label: 'Gordura Corporal', value: `${bioimpedanceData.bodyFat}%`, icon: Droplet, color: '#f59e0b' },
                  { label: 'Massa Muscular', value: `${bioimpedanceData.muscleMass} kg`, icon: Dumbbell, color: '#3b82f6' },
                  { label: 'Gordura Visceral', value: bioimpedanceData.visceralFat, icon: Target, color: '#ef4444' },
                  { label: 'TMB', value: `${bioimpedanceData.bmr} kcal`, icon: Zap, color: '#8b5cf6' },
                  { label: 'Hidratação', value: `${bioimpedanceData.hydration}%`, icon: Wind, color: '#06b6d4' },
                  { label: 'Massa Óssea', value: `${bioimpedanceData.boneMass} kg`, icon: Ruler, color: '#6b7280' },
                  { label: 'IMC', value: bioimpedanceData.bmi, icon: Activity, color: '#ec4899' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
                    </div>
                    <p className="dark:text-white text-slate-900 text-xl" style={{ fontWeight: 700 }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 dark:bg-blue-500/10 bg-blue-50 dark:border-blue-500/20 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1" style={{ fontWeight: 600 }}>
                      Análise Geral
                    </p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                      Composição corporal dentro dos padrões saudáveis. Massa muscular em evolução positiva.
                      Continue com treino de hipertrofia e dieta com superávit calórico de 200-300 kcal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <>
              {/* Weight Progress */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-4">Evolução de Peso</h3>
                <ResponsiveContainer width="100%" height={200} key="student-weight-container">
                  <AreaChart 
                    id="sd-weight-chart"
                    data={weightProgress}
                   >
                    <defs>
                      <linearGradient id="sd-weight-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      stroke="#71717a" 
                      fontSize={12} 
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#71717a" 
                      fontSize={12} 
                      domain={[74, 80]} 
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#sd-weight-grad)" 
                      strokeWidth={3} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Body Composition */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-4">Composição Corporal</h3>
                <ResponsiveContainer width="100%" height={200} key="student-composition-container">
                  <LineChart 
                    id="sd-composition-chart"
                    data={bodyComposition}
                   >
                    <XAxis 
                      dataKey="month" 
                      stroke="#71717a" 
                      fontSize={12} 
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#71717a" 
                      fontSize={12} 
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="muscle" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      name="Massa Muscular (kg)" 
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fat" 
                      stroke="#f59e0b" 
                      strokeWidth={3} 
                      name="Gordura (%)" 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'workouts' && (
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <h3 className="dark:text-white text-slate-900 mb-4">Histórico de Treinos</h3>
              <div className="space-y-3">
                {workoutHistory.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center gap-4 p-4 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>
                        {workout.name}
                      </p>
                      <p className="text-xs dark:text-zinc-500 text-slate-400">
                        {workout.exercises} exercícios • {workout.date}
                      </p>
                    </div>
                    {workout.completed && (
                      <div className="flex items-center gap-1 text-emerald-500 text-xs">
                        <Activity className="w-3 h-3" />
                        Concluído
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 dark:text-zinc-600 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h4 className="dark:text-white text-slate-900 mb-4" style={{ fontWeight: 600 }}>Ações Rápidas</h4>
            <div className="space-y-2">
              {[
                { label: 'Criar Novo Treino', icon: Plus, color: '#10b981', action: () => navigate('/personal/criar-treino') },
                { label: 'Registrar Medição', icon: Activity, color: '#3b82f6', action: () => navigate(`/personal/aluno/${id}/medicao`) },
                { label: 'Adicionar Restrição', icon: AlertCircle, color: '#f59e0b', action: () => navigate(`/personal/aluno/${id}/restricao`) },
                { label: 'Ver Relatório', icon: BarChart3, color: '#8b5cf6', action: () => navigate(`/personal/aluno/${id}/relatorio`) },
              ].map(({ label, icon: Icon, color, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 transition-all text-sm dark:text-zinc-300 text-slate-700 text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="dark:bg-gradient-to-br dark:from-emerald-500/10 dark:to-blue-500/10 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-5 border dark:border-emerald-500/20 border-emerald-200">
            <Zap className="w-8 h-8 text-emerald-500 mb-3" />
            <p className="text-sm dark:text-white text-slate-900 mb-2" style={{ fontWeight: 600 }}>
              Aluno Consistente
            </p>
            <p className="text-xs dark:text-zinc-400 text-slate-600">
              {studentData.name} mantém {studentData.adherence}% de adesão aos treinos. Continue motivando!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}