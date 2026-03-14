import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Apple,
  Activity,
  Calendar,
  Scale,
  Utensils,
  TrendingDown,
  TrendingUp,
  FileText,
  Plus,
  BarChart3,
  AlertCircle,
  Flame,
  Edit,
  CheckCircle,
  Droplets,
  Ruler,
  Target,
  Heart,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  MessageSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ────────────────────────── MOCK DATA ──────────────────────────
const patientData = {
  id: '1',
  name: 'Ana Costa',
  email: 'ana@email.com',
  avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
  age: 32,
  height: 165,
  currentWeight: 68.5,
  goalWeight: 63.0,
  bmi: 25.2,
  bodyFat: 28.5,
  muscleMass: 44.2,
  waist: 82,
  hip: 98,
  goal: 'Emagrecimento saudável',
  startDate: '2024-01-10',
  conditions: ['Hipertensão leve', 'Intolerância à lactose'],
  restrictions: ['Lactose', 'Glúten (preferência)'],
  allergies: ['Amendoim'],
  adherence: 82,
};

const mockMealPlan = {
  name: 'Plano Emagrecimento – Fase 1',
  calories: 1800,
  protein: 140,
  carbs: 180,
  fat: 55,
  updatedAt: '2024-03-01',
  meals: [
    {
      id: 'm1',
      name: 'Café da Manhã',
      time: '07:00',
      calories: 380,
      foods: [
        { id: 'f1', name: 'Omelete de claras (3 ovos)', quantity: '150g', calories: 190 },
        { id: 'f2', name: 'Tapioca', quantity: '40g', calories: 120 },
        { id: 'f3', name: 'Café preto sem açúcar', quantity: '200ml', calories: 5 },
        { id: 'f4', name: 'Mamão papaya', quantity: '100g', calories: 45 },
      ],
    },
    {
      id: 'm2',
      name: 'Lanche da Manhã',
      time: '10:00',
      calories: 180,
      foods: [
        { id: 'f5', name: 'Iogurte grego sem lactose', quantity: '170g', calories: 130 },
        { id: 'f6', name: 'Castanha-do-Pará', quantity: '15g', calories: 50 },
      ],
    },
    {
      id: 'm3',
      name: 'Almoço',
      time: '13:00',
      calories: 580,
      foods: [
        { id: 'f7', name: 'Frango grelhado', quantity: '150g', calories: 240 },
        { id: 'f8', name: 'Arroz integral', quantity: '120g', calories: 175 },
        { id: 'f9', name: 'Feijão cozido', quantity: '80g', calories: 90 },
        { id: 'f10', name: 'Salada verde com azeite', quantity: '200g', calories: 75 },
      ],
    },
    {
      id: 'm4',
      name: 'Lanche da Tarde',
      time: '16:00',
      calories: 200,
      foods: [
        { id: 'f11', name: 'Banana', quantity: '1 unidade', calories: 90 },
        { id: 'f12', name: 'Pasta de amendoim sem sal', quantity: '20g', calories: 110 },
      ],
    },
    {
      id: 'm5',
      name: 'Jantar',
      time: '19:30',
      calories: 380,
      foods: [
        { id: 'f13', name: 'Salmão grelhado', quantity: '150g', calories: 250 },
        { id: 'f14', name: 'Batata-doce cozida', quantity: '100g', calories: 86 },
        { id: 'f15', name: 'Brócolis no vapor', quantity: '150g', calories: 44 },
      ],
    },
    {
      id: 'm6',
      name: 'Ceia',
      time: '22:00',
      calories: 80,
      foods: [
        { id: 'f16', name: 'Chá de camomila', quantity: '200ml', calories: 2 },
        { id: 'f17', name: 'Amêndoas', quantity: '15g', calories: 88 },
      ],
    },
  ],
};

const mockConsultations = [
  {
    id: 'c1',
    date: '2024-03-05',
    weight: 68.5,
    bodyFat: 28.5,
    waist: 82,
    hip: 98,
    bloodPressure: '120/80',
    adherence: 85,
    notes:
      'Boa evolução desde o início do plano. Paciente relatou melhora na disposição e sono. Mantive o plano atual com ajuste no jantar para aumentar proteína.',
    recommendations: 'Aumentar ingestão hídrica para 2,5L/dia. Inserir chia no café da manhã.',
    nextConsultation: '2024-04-05',
  },
  {
    id: 'c2',
    date: '2024-02-03',
    weight: 70.2,
    bodyFat: 30.1,
    waist: 85,
    hip: 100,
    bloodPressure: '125/82',
    adherence: 70,
    notes:
      'Início do acompanhamento. Paciente com dificuldade de adaptação ao plano. Ajustei o plano para ser mais palatável, reduzindo restrições na primeira fase.',
    recommendations: 'Reduzir sal na dieta. Priorizar vegetais no almoço. Evitar produtos ultraprocessados.',
    nextConsultation: '2024-03-05',
  },
  {
    id: 'c3',
    date: '2024-01-10',
    weight: 72.0,
    bodyFat: 32.0,
    waist: 88,
    hip: 103,
    bloodPressure: '130/85',
    adherence: 0,
    notes: 'Consulta inicial de avaliação. Anamnese completa realizada. Objetivos definidos com a paciente.',
    recommendations: 'Reduzir consumo de açúcar simples. Aumentar ingestão de fibras.',
    nextConsultation: '2024-02-03',
  },
];

const progressData = [
  { month: 'Jan', weight: 72.0, bodyFat: 32.0, waist: 88 },
  { month: 'Fev', weight: 70.2, bodyFat: 30.1, waist: 85 },
  { month: 'Mar', weight: 68.5, bodyFat: 28.5, waist: 82 },
];

// ────────────────────────── COMPONENT ──────────────────────────
type Tab = 'overview' | 'diet' | 'consultations' | 'progress';

export function NutritionistPatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedMeal, setExpandedMeal] = useState<string | null>('m1');
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>('c1');

  const proteinPct = Math.round((mockMealPlan.protein * 4 * 100) / mockMealPlan.calories);
  const carbsPct = Math.round((mockMealPlan.carbs * 4 * 100) / mockMealPlan.calories);
  const fatPct = Math.round((mockMealPlan.fat * 9 * 100) / mockMealPlan.calories);

  const tabs = [
    { id: 'overview' as Tab, label: 'Visão Geral', icon: User },
    { id: 'diet' as Tab, label: 'Plano Alimentar', icon: Utensils },
    { id: 'consultations' as Tab, label: 'Consultas', icon: FileText },
    { id: 'progress' as Tab, label: 'Progresso', icon: BarChart3 },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/nutritionist')}
        className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Pacientes
      </button>

      {/* Patient Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <img
            src={patientData.avatar}
            alt={patientData.name}
            className="w-16 h-16 rounded-2xl ring-4 ring-amber-500/20"
          />
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">{patientData.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm dark:text-zinc-400 text-slate-500">
              <span>{patientData.age} anos</span>
              <span>•</span>
              <span>{patientData.height} cm</span>
              <span>•</span>
              <span className="text-amber-500">{patientData.goal}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate(`/nutritionist/consulta/${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 20px rgba(245,158,11,0.3)', fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            Nova Consulta
          </button>
          <button
            onClick={() => navigate(`/nutritionist/criar-plano/${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 }}
          >
            <Edit className="w-4 h-4" />
            Editar Plano
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Peso Atual', value: `${patientData.currentWeight} kg`, icon: Scale, color: '#f59e0b' },
          { label: 'Meta de Peso', value: `${patientData.goalWeight} kg`, icon: Target, color: '#10b981' },
          { label: 'Gordura Corp.', value: `${patientData.bodyFat}%`, icon: Activity, color: '#8b5cf6' },
          { label: 'IMC', value: patientData.bmi, icon: Heart, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-2xl p-4 dark:border-zinc-800 border border-slate-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="dark:text-white text-slate-900 text-xl mb-1" style={{ fontWeight: 700 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex flex-wrap dark:border-zinc-800 border border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontWeight: 600 } : { fontWeight: 400 }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── TAB: VISÃO GERAL ── */}
          {activeTab === 'overview' && (
            <>
              {/* Dados Pessoais */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-5">Dados Pessoais & Anamnese</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Idade', value: `${patientData.age} anos` },
                    { label: 'Altura', value: `${patientData.height} cm` },
                    { label: 'Peso Atual', value: `${patientData.currentWeight} kg` },
                    { label: 'Cintura', value: `${patientData.waist} cm` },
                    { label: 'Quadril', value: `${patientData.hip} cm` },
                    { label: 'Massa Muscular', value: `${patientData.muscleMass} kg` },
                  ].map(({ label, value }) => (
                    <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                      <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restrições e Condições */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-5 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Restrições Alimentares & Condições de Saúde
                </h3>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3">Alergias</p>
                    <div className="flex flex-wrap gap-2">
                      {patientData.allergies.map((a) => (
                        <span key={a} className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20" style={{ fontWeight: 600 }}>
                          ⚠ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3">Intolerâncias / Preferências</p>
                    <div className="flex flex-wrap gap-2">
                      {patientData.restrictions.map((r) => (
                        <span key={r} className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20" style={{ fontWeight: 500 }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3">Condições de Saúde</p>
                    <div className="space-y-2">
                      {patientData.conditions.map((c) => (
                        <div key={c} className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                          <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <p className="text-sm dark:text-zinc-200 text-slate-700">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Objetivos do Tratamento
                </h3>
                <div className="dark:bg-emerald-500/5 bg-emerald-50 rounded-2xl p-4 border dark:border-emerald-500/20 border-emerald-200">
                  <p className="text-sm dark:text-emerald-300 text-emerald-700 mb-2" style={{ fontWeight: 600 }}>
                    {patientData.goal}
                  </p>
                  <p className="text-xs dark:text-zinc-400 text-slate-500">
                    Redução de {(patientData.currentWeight - patientData.goalWeight).toFixed(1)} kg até a meta •
                    Redução de gordura corporal de {patientData.bodyFat}% para &lt;25%
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="dark:text-zinc-400 text-slate-500">Progresso até a meta</span>
                    <span className="text-amber-500" style={{ fontWeight: 600 }}>
                      {Math.round(((72 - patientData.currentWeight) / (72 - patientData.goalWeight)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round(((72 - patientData.currentWeight) / (72 - patientData.goalWeight)) * 100)}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TAB: PLANO ALIMENTAR ── */}
          {activeTab === 'diet' && (
            <>
              {/* Plan Header */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="dark:text-white text-slate-900 mb-1">{mockMealPlan.name}</h3>
                    <p className="text-sm dark:text-zinc-500 text-slate-400">
                      Atualizado em {mockMealPlan.updatedAt} • {mockMealPlan.calories} kcal/dia
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/nutritionist/criar-plano/${id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-amber-500 hover:border-amber-400 hover:dark:text-amber-400 hover:text-amber-600 transition-all"
                  >
                    <Edit className="w-3 h-3" />
                    Editar Plano
                  </button>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Proteína', value: `${mockMealPlan.protein}g`, pct: proteinPct, color: '#3b82f6' },
                    { label: 'Carboidrato', value: `${mockMealPlan.carbs}g`, pct: carbsPct, color: '#f59e0b' },
                    { label: 'Gordura', value: `${mockMealPlan.fat}g`, pct: fatPct, color: '#ec4899' },
                  ].map(({ label, value, pct, color }) => (
                    <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                      <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                      <p className="text-lg dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700, color }}>{value}</p>
                      <div className="w-full h-1.5 dark:bg-zinc-700 bg-slate-200 rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                      <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">{pct}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-3">
                {mockMealPlan.meals.map((meal) => (
                  <div key={meal.id} className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b22, #d97706aa)' }}>
                        <Utensils className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm dark:text-white text-slate-900 mb-0.5" style={{ fontWeight: 600 }}>{meal.name}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">
                          <Clock className="w-3 h-3 inline mr-1" />{meal.time} • {meal.foods.length} alimentos
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-amber-500" style={{ fontWeight: 700 }}>{meal.calories} kcal</span>
                        {expandedMeal === meal.id ? (
                          <ChevronUp className="w-4 h-4 dark:text-zinc-500 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 dark:text-zinc-500 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {expandedMeal === meal.id && (
                      <div className="px-5 pb-5 space-y-2">
                        {meal.foods.map((food) => (
                          <div key={food.id} className="flex items-center justify-between py-2 border-b dark:border-zinc-800 border-slate-100 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-amber-500/60 flex-shrink-0" />
                              <p className="text-sm dark:text-zinc-200 text-slate-700">{food.name}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs dark:text-zinc-500 text-slate-400">
                              <span>{food.quantity}</span>
                              <span className="dark:text-zinc-400 text-slate-600" style={{ fontWeight: 600 }}>{food.calories} kcal</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── TAB: CONSULTAS ── */}
          {activeTab === 'consultations' && (
            <>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => navigate(`/nutritionist/consulta/${id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontWeight: 600 }}
                >
                  <Plus className="w-4 h-4" />
                  Nova Consulta
                </button>
              </div>

              <div className="space-y-4">
                {mockConsultations.map((c, idx) => (
                  <div key={c.id} className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedConsultation(expandedConsultation === c.id ? null : c.id)}
                      className="w-full flex items-start gap-4 p-5 text-left hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#3b82f620' }}>
                          <FileText className={`w-5 h-5 ${idx === 0 ? 'text-white' : 'text-blue-400'}`} />
                        </div>
                        {idx === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                            Consulta {idx === 0 ? '(mais recente)' : `#${mockConsultations.length - idx}`}
                          </p>
                          <p className="text-xs dark:text-zinc-500 text-slate-400">{c.date}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="dark:text-zinc-400 text-slate-600">
                            <Scale className="w-3 h-3 inline mr-0.5" />{c.weight} kg
                          </span>
                          <span className="dark:text-zinc-400 text-slate-600">
                            Gordura: {c.bodyFat}%
                          </span>
                          <span className="dark:text-zinc-400 text-slate-600">
                            Cintura: {c.waist} cm
                          </span>
                          {c.adherence > 0 && (
                            <span className="text-emerald-500" style={{ fontWeight: 600 }}>
                              Adesão: {c.adherence}%
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedConsultation === c.id ? (
                        <ChevronUp className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0 mt-1" />
                      )}
                    </button>

                    {expandedConsultation === c.id && (
                      <div className="px-5 pb-5 space-y-4 border-t dark:border-zinc-800 border-slate-100 pt-4">
                        {/* Measurements */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Pressão Arterial', value: c.bloodPressure },
                            { label: 'Quadril', value: `${c.hip} cm` },
                            { label: 'Próxima Consulta', value: c.nextConsultation },
                          ].map(({ label, value }) => (
                            <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                              <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                              <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                          <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider mb-2">
                            <MessageSquare className="w-3 h-3 inline mr-1" />Observações
                          </p>
                          <p className="text-sm dark:text-zinc-300 text-slate-700 leading-relaxed">{c.notes}</p>
                        </div>

                        {/* Recommendations */}
                        <div className="dark:bg-amber-500/5 bg-amber-50 rounded-2xl p-4 border dark:border-amber-500/20 border-amber-200">
                          <p className="text-xs text-amber-500 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                            ✦ Recomendações
                          </p>
                          <p className="text-sm dark:text-zinc-300 text-slate-700 leading-relaxed">{c.recommendations}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── TAB: PROGRESSO ── */}
          {activeTab === 'progress' && (
            <>
              {/* Weight Chart */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="dark:text-white text-slate-900">Evolução de Peso</h3>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" style={{ fontWeight: 600 }}>
                    ↓ {(72 - patientData.currentWeight).toFixed(1)} kg perdidos
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart id="npd-weight-chart" data={progressData}>
                    <defs>
                      <linearGradient id="npd-weight-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} domain={[65, 75]} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="weight" stroke="#f59e0b" fillOpacity={1} fill="url(#npd-weight-grad)" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} isAnimationActive={false} name="Peso (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Body Fat Chart */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="dark:text-white text-slate-900">Gordura Corporal e Cintura</h3>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20" style={{ fontWeight: 600 }}>
                    ↓ {(32 - patientData.bodyFat).toFixed(1)}% de gordura
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart id="npd-bodyfat-chart" data={progressData}>
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="bodyFat" stroke="#8b5cf6" strokeWidth={3} name="Gordura (%)" dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="waist" stroke="#3b82f6" strokeWidth={3} name="Cintura (cm)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Comparison */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-white text-slate-900 mb-5">Comparativo Inicial × Atual</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Peso', initial: 72.0, current: patientData.currentWeight, unit: 'kg', invert: true },
                    { label: 'Gordura Corporal', initial: 32.0, current: patientData.bodyFat, unit: '%', invert: true },
                    { label: 'Cintura', initial: 88, current: patientData.waist, unit: 'cm', invert: true },
                    { label: 'Massa Muscular', initial: 40.8, current: patientData.muscleMass, unit: 'kg', invert: false },
                  ].map(({ label, initial, current, unit, invert }) => {
                    const diff = current - initial;
                    const isPositive = invert ? diff < 0 : diff > 0;
                    return (
                      <div key={label} className="flex items-center gap-4">
                        <div className="w-28 text-sm dark:text-zinc-400 text-slate-500 flex-shrink-0">{label}</div>
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-xs dark:text-zinc-500 text-slate-400 w-16 text-right">{initial}{unit}</span>
                          <div className="flex-1 h-2 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(current / initial) * 100}%`,
                                backgroundColor: isPositive ? '#10b981' : '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-xs dark:text-white text-slate-900 w-16" style={{ fontWeight: 700 }}>{current}{unit}</span>
                        </div>
                        <span className={`text-xs w-12 text-right ${isPositive ? 'text-emerald-500' : 'text-red-400'}`} style={{ fontWeight: 600 }}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ────── SIDEBAR ────── */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h4 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Ações Rápidas</h4>
            <div className="space-y-2">
              {[
                { label: 'Nova Consulta', icon: Plus, color: '#f59e0b', action: () => navigate(`/nutritionist/consulta/${id}`) },
                { label: 'Editar Plano Alimentar', icon: Edit, color: '#10b981', action: () => navigate(`/nutritionist/criar-plano/${id}`) },
                { label: 'Ver Progresso', icon: BarChart3, color: '#3b82f6', action: () => setActiveTab('progress') },
                { label: 'Histórico de Consultas', icon: FileText, color: '#8b5cf6', action: () => setActiveTab('consultations') },
              ].map(({ label, icon: Icon, color, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300 transition-all text-sm dark:text-zinc-300 text-slate-700 text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Summary */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-500" />
              <h4 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 600 }}>Resumo Calórico Hoje</h4>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl dark:text-white text-slate-900" style={{ fontWeight: 800 }}>
                {mockMealPlan.calories}
              </p>
              <p className="text-xs dark:text-zinc-500 text-slate-400">kcal / dia</p>
            </div>
            <div className="w-full h-3 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-500 rounded-l-full transition-all" style={{ width: `${proteinPct}%` }} title={`Proteína ${proteinPct}%`} />
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${carbsPct}%` }} title={`Carb ${carbsPct}%`} />
              <div className="h-full bg-pink-500 rounded-r-full transition-all" style={{ width: `${fatPct}%` }} title={`Gordura ${fatPct}%`} />
            </div>
            <div className="flex justify-between mt-2 text-xs dark:text-zinc-500 text-slate-400">
              <span className="text-blue-400">P {proteinPct}%</span>
              <span className="text-amber-400">C {carbsPct}%</span>
              <span className="text-pink-400">G {fatPct}%</span>
            </div>
          </div>

          {/* Adherence */}
          <div
            className="rounded-3xl p-5 border"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.08))', borderColor: 'rgba(245,158,11,0.2)' }}
          >
            <CheckCircle className="w-8 h-8 text-amber-500 mb-3" />
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>
              Adesão ao Plano
            </p>
            <p className="text-3xl text-amber-500 mb-2" style={{ fontWeight: 800 }}>{patientData.adherence}%</p>
            <p className="text-xs dark:text-zinc-400 text-slate-500">
              {patientData.name} está seguindo bem o plano alimentar. Continue monitorando.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}