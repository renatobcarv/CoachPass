import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Edit,
  FileText,
  Flame,
  Heart,
  Plus,
  Ruler,
  Scale,
  Target,
  User,
  Utensils,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CTAButton } from '../brand/Brand';
import { Badge, Page } from '../student/ui';
import { SectionCard, Segmented } from '../pro/ui';
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

const MACRO = { protein: '#8c82ff', carbs: '#ffb547', fat: '#2ee6c8' } as const;
const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(iso + 'T12:00').toLocaleDateString('pt-BR', opts);
const chartTooltip = {
  contentStyle: {
    backgroundColor: '#0d0f18',
    border: '1px solid rgba(232,236,255,0.14)',
    borderRadius: 12,
    fontSize: 12,
    color: '#f4f6fb',
  },
  labelStyle: { color: '#9aa0b8' },
  cursor: { stroke: 'rgba(232,236,255,0.15)' },
};
const axis = { stroke: '#5c627a', fontSize: 12, tickLine: false, axisLine: false } as const;

export function NutritionistPatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedMeal, setExpandedMeal] = useState<string | null>('m1');
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>('c1');

  const p = patientData;
  const proteinPct = Math.round((mockMealPlan.protein * 4 * 100) / mockMealPlan.calories);
  const carbsPct = Math.round((mockMealPlan.carbs * 4 * 100) / mockMealPlan.calories);
  const fatPct = Math.round((mockMealPlan.fat * 9 * 100) / mockMealPlan.calories);
  const startWeight = progressData[0].weight;
  const lost = +(startWeight - p.currentWeight).toFixed(1);
  const toGoal = +(p.currentWeight - p.goalWeight).toFixed(1);
  const goalPct = Math.max(0, Math.min(100, ((startWeight - p.currentWeight) / (startWeight - p.goalWeight)) * 100));
  const initials = p.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  const nextConsult = mockConsultations[0]?.nextConsultation;

  const tabs = [
    { value: 'overview' as Tab, label: 'Visão geral', icon: User },
    { value: 'diet' as Tab, label: 'Plano alimentar', icon: Utensils },
    { value: 'consultations' as Tab, label: 'Consultas', icon: FileText, count: mockConsultations.length },
    { value: 'progress' as Tab, label: 'Progresso', icon: BarChart3 },
  ];

  return (
    <Page wide>
      <button
        type="button"
        onClick={() => navigate('/nutritionist')}
        className="mb-6 inline-flex items-center gap-2 text-[13.5px] text-[var(--muted)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Meus pacientes
      </button>

      {/* Cabeçalho do paciente */}
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div className="flex items-center gap-5 min-w-0">
          <span className="cp-selected w-20 h-20 shrink-0 rounded-[24px] grid place-items-center cp-display text-[28px] font-bold">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="cp-kicker">Paciente desde {fmtDate(p.startDate, { month: 'long', year: 'numeric' })}</p>
            <h1 className="cp-display mt-1 text-[34px] sm:text-[42px] font-bold leading-[1.05] tracking-[-0.03em]">{p.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[var(--muted)]">
              <span>{p.age} anos</span>
              <span aria-hidden>·</span>
              <span>{p.height} cm</span>
              <span aria-hidden>·</span>
              <span className="text-[var(--brand-200)]">{p.goal}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate(`/nutritionist/criar-plano/${id}`)} className="cp-btn-ghost">
            <Edit className="w-4 h-4" /> Editar plano
          </button>
          <CTAButton type="button" onClick={() => navigate(`/nutritionist/consulta/${id}`)}>
            Nova consulta
          </CTAButton>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Peso atual', value: p.currentWeight.toLocaleString('pt-BR'), unit: 'kg', hint: `−${lost.toLocaleString('pt-BR')} kg desde o início`, tone: 'var(--teal)' },
          { label: 'Meta', value: p.goalWeight.toLocaleString('pt-BR'), unit: 'kg', hint: `faltam ${toGoal.toLocaleString('pt-BR')} kg`, tone: 'var(--muted)' },
          { label: 'Gordura corporal', value: p.bodyFat.toLocaleString('pt-BR'), unit: '%', hint: `IMC ${p.bmi.toLocaleString('pt-BR')}`, tone: 'var(--muted)' },
          { label: 'Adesão ao plano', value: String(p.adherence), unit: '%', hint: 'média das consultas', tone: 'var(--brand-200)' },
        ].map((k) => (
          <div key={k.label} className="cp-spot relative rounded-[20px] border border-[var(--line)] bg-white/[0.025] p-4 sm:p-5">
            <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{k.label}</p>
            <p className="mt-2 cp-display text-[30px] sm:text-[34px] font-bold leading-none">
              {k.value}
              <span className="ml-1 text-[14px] font-medium text-[var(--muted)]">{k.unit}</span>
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: k.tone }}>
              {k.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <Segmented layoutId="npd-tabs" value={activeTab} onChange={setActiveTab} options={tabs} />
      </div>

      <div className="grid xl:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="min-w-0 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              {/* ── VISÃO GERAL ── */}
              {activeTab === 'overview' && (
                <>
                  <SectionCard icon={Target} title="Rumo à meta" meta={<span className="cp-mono text-[12px] text-[var(--muted)]">{Math.round(goalPct)}%</span>}>
                    <div className="h-3 rounded-full bg-white/[0.08] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg,#2a14e0,#5546ff,#8c82ff)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${goalPct}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between cp-mono text-[11.5px] text-[var(--dim)]">
                      <span>Início {startWeight.toLocaleString('pt-BR')} kg</span>
                      <span className="text-white">Hoje {p.currentWeight.toLocaleString('pt-BR')} kg</span>
                      <span>Meta {p.goalWeight.toLocaleString('pt-BR')} kg</span>
                    </div>
                  </SectionCard>

                  <SectionCard icon={Ruler} title="Medidas atuais">
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        ['Altura', `${p.height} cm`],
                        ['IMC', p.bmi.toLocaleString('pt-BR')],
                        ['Massa muscular', `${p.muscleMass.toLocaleString('pt-BR')} kg`],
                        ['Cintura', `${p.waist} cm`],
                        ['Quadril', `${p.hip} cm`],
                        ['Cintura/quadril', (p.waist / p.hip).toFixed(2).replace('.', ',')],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-[var(--line)] p-3.5">
                          <dt className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">{label}</dt>
                          <dd className="mt-1 text-[18px] font-semibold">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </SectionCard>

                  <SectionCard icon={Heart} title="Saúde e restrições">
                    <div className="grid md:grid-cols-3 gap-5">
                      {[
                        { label: 'Condições', items: p.conditions, tone: 'blue' as const },
                        { label: 'Restrições', items: p.restrictions, tone: 'amber' as const },
                        { label: 'Alergias', items: p.allergies, tone: 'violet' as const },
                      ].map(({ label, items, tone }) => (
                        <div key={label}>
                          <p className="cp-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-2">{label}</p>
                          <div className="flex flex-wrap gap-2">
                            {items.map((it) => (
                              <Badge key={it} tone={tone}>
                                {it}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {p.allergies.length > 0 && (
                      <p className="mt-5 flex items-start gap-2 rounded-2xl border border-[rgba(255,181,71,0.3)] bg-[rgba(255,181,71,0.08)] px-4 py-3 text-[13px] text-[var(--amber)]">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        Alergia a {p.allergies.join(', ').toLowerCase()} — confira antes de incluir alimentos no plano.
                      </p>
                    )}
                  </SectionCard>
                </>
              )}

              {/* ── PLANO ALIMENTAR ── */}
              {activeTab === 'diet' && (
                <section className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
                  <header className="p-5 sm:p-6 border-b border-[var(--line)] flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="cp-kicker">Plano ativo</p>
                      <h2 className="cp-display mt-1 text-[22px] font-bold">{mockMealPlan.name}</h2>
                      <p className="mt-0.5 text-[13px] text-[var(--muted)]">
                        Atualizado em {fmtDate(mockMealPlan.updatedAt)} · {mockMealPlan.meals.length} refeições
                      </p>
                    </div>
                    <button type="button" onClick={() => navigate(`/nutritionist/criar-plano/${id}`)} className="cp-btn-sm">
                      <Edit className="w-4 h-4" /> Editar
                    </button>
                  </header>
                  <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[var(--line)]">
                    {[
                      ['Calorias', `${mockMealPlan.calories}`, 'kcal', '#f4f6fb'],
                      ['Proteína', `${mockMealPlan.protein}`, 'g', MACRO.protein],
                      ['Carboidrato', `${mockMealPlan.carbs}`, 'g', MACRO.carbs],
                      ['Gordura', `${mockMealPlan.fat}`, 'g', MACRO.fat],
                    ].map(([label, v, u, c]) => (
                      <div key={label}>
                        <p className="flex items-center gap-1.5 text-[12.5px] text-[var(--muted)]">
                          <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                          {label}
                        </p>
                        <p className="mt-1 cp-display text-[24px] font-bold leading-none">
                          {v}
                          <span className="ml-1 text-[12px] font-medium text-[var(--muted)]">{u}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <ul className="divide-y divide-[var(--line)]">
                    {mockMealPlan.meals.map((meal) => {
                      const open = expandedMeal === meal.id;
                      return (
                        <li key={meal.id}>
                          <button
                            type="button"
                            onClick={() => setExpandedMeal(open ? null : meal.id)}
                            aria-expanded={open}
                            className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 text-left hover:bg-white/[0.03] transition-colors"
                          >
                            <span className="cp-mono w-12 text-[12px] text-[var(--dim)]">{meal.time}</span>
                            <span className="flex-1 min-w-0">
                              <span className="block font-semibold">{meal.name}</span>
                              <span className="block text-[12.5px] text-[var(--muted)]">{meal.foods.length} itens</span>
                            </span>
                            <span className="cp-mono text-[13px]">{meal.calories} kcal</span>
                            <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden px-5 sm:px-6"
                              >
                                {meal.foods.map((f) => (
                                  <li key={f.id} className="flex items-center gap-3 py-2.5 pl-16 border-t border-dashed border-[var(--line)] first:border-t-0 text-[14px]">
                                    <span className="flex-1">{f.name}</span>
                                    <span className="text-[var(--muted)]">{f.quantity}</span>
                                    <span className="cp-mono w-16 text-right text-[12px] text-[var(--dim)]">{f.calories} kcal</span>
                                  </li>
                                ))}
                                <li className="h-3" aria-hidden />
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* ── CONSULTAS ── */}
              {activeTab === 'consultations' && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <p className="cp-mono text-[11.5px] text-[var(--dim)]">{mockConsultations.length} consultas registradas</p>
                    <button type="button" onClick={() => navigate(`/nutritionist/consulta/${id}`)} className="cp-btn-sm">
                      <Plus className="w-4 h-4" /> Nova consulta
                    </button>
                  </div>
                  <ol className="relative space-y-3 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-[var(--line-2)]">
                    {mockConsultations.map((c, i) => {
                      const open = expandedConsultation === c.id;
                      const prev = mockConsultations[i + 1];
                      const delta = prev ? +(c.weight - prev.weight).toFixed(1) : null;
                      return (
                        <li key={c.id} className="relative pl-12">
                          <span
                            className={`absolute left-2 top-5 w-[23px] h-[23px] rounded-full grid place-items-center border-4 border-[var(--ink)] ${
                              i === 0 ? 'cp-selected' : 'bg-[#1b1e2c]'
                            }`}
                            aria-hidden
                          />
                          <div className="rounded-[20px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedConsultation(open ? null : c.id)}
                              aria-expanded={open}
                              className="w-full flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 text-left hover:bg-white/[0.03]"
                            >
                              <span className="min-w-[150px]">
                                <span className="block font-semibold first-letter:uppercase">{fmtDate(c.date, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                <span className="block text-[12.5px] text-[var(--muted)]">
                                  {i === mockConsultations.length - 1 ? 'Consulta inicial' : 'Retorno'}
                                </span>
                              </span>
                              <span className="flex flex-wrap gap-2 flex-1">
                                <Badge>{c.weight.toLocaleString('pt-BR')} kg</Badge>
                                {delta != null && <Badge tone={delta <= 0 ? 'teal' : 'amber'}>{delta > 0 ? '+' : ''}{delta.toLocaleString('pt-BR')} kg</Badge>}
                                <Badge>{c.bodyFat.toLocaleString('pt-BR')}% gordura</Badge>
                                {c.adherence > 0 && <Badge tone="violet">adesão {c.adherence}%</Badge>}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence initial={false}>
                              {open && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 pb-5 pt-1 space-y-4">
                                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      {[
                                        ['Cintura', `${c.waist} cm`],
                                        ['Quadril', `${c.hip} cm`],
                                        ['Pressão', c.bloodPressure],
                                        ['Próxima', fmtDate(c.nextConsultation, { day: '2-digit', month: 'short' })],
                                      ].map(([l, v]) => (
                                        <div key={l} className="rounded-xl border border-[var(--line)] px-3 py-2.5">
                                          <dt className="cp-mono text-[10px] uppercase tracking-[0.12em] text-[var(--dim)]">{l}</dt>
                                          <dd className="mt-0.5 text-[14.5px] font-semibold">{v}</dd>
                                        </div>
                                      ))}
                                    </dl>
                                    <div>
                                      <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--muted)] mb-1">Observações</p>
                                      <p className="text-[14px] leading-relaxed text-[var(--cream)]">{c.notes}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[rgba(85,70,255,0.08)] border border-[rgba(140,130,255,0.22)] px-4 py-3">
                                      <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--brand-200)] mb-1">Recomendações</p>
                                      <p className="text-[14px] leading-relaxed">{c.recommendations}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* ── PROGRESSO ── */}
              {activeTab === 'progress' && (
                <>
                  <SectionCard icon={Scale} title="Evolução de peso" meta={<Badge tone="teal">−{lost.toLocaleString('pt-BR')} kg</Badge>}>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart id="npd-weight-chart" data={progressData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <defs>
                            <linearGradient id="npd-weight-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#5546ff" stopOpacity={0.45} />
                              <stop offset="100%" stopColor="#5546ff" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" {...axis} />
                          <YAxis {...axis} domain={['dataMin - 2', 'dataMax + 1']} />
                          <Tooltip {...chartTooltip} />
                          <Area type="monotone" dataKey="weight" name="Peso (kg)" stroke="#8c82ff" strokeWidth={3} fill="url(#npd-weight-grad)" dot={{ r: 4, fill: '#8c82ff', strokeWidth: 0 }} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>

                  <SectionCard icon={Activity} title="Gordura corporal e cintura">
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart id="npd-bodyfat-chart" data={progressData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <XAxis dataKey="month" {...axis} />
                          <YAxis {...axis} />
                          <Tooltip {...chartTooltip} />
                          <Legend wrapperStyle={{ fontSize: 12, color: '#9aa0b8' }} />
                          <Line type="monotone" dataKey="bodyFat" name="Gordura (%)" stroke={MACRO.fat} strokeWidth={3} dot={{ r: 4, fill: MACRO.fat, strokeWidth: 0 }} isAnimationActive={false} />
                          <Line type="monotone" dataKey="waist" name="Cintura (cm)" stroke={MACRO.carbs} strokeWidth={3} dot={{ r: 4, fill: MACRO.carbs, strokeWidth: 0 }} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </SectionCard>

                  <SectionCard icon={BarChart3} title="Início × hoje">
                    <ul className="space-y-4">
                      {[
                        { label: 'Peso', initial: 72.0, current: p.currentWeight, unit: 'kg', lowerIsBetter: true },
                        { label: 'Gordura corporal', initial: 32.0, current: p.bodyFat, unit: '%', lowerIsBetter: true },
                        { label: 'Cintura', initial: 88, current: p.waist, unit: 'cm', lowerIsBetter: true },
                        { label: 'Massa muscular', initial: 40.8, current: p.muscleMass, unit: 'kg', lowerIsBetter: false },
                      ].map(({ label, initial, current, unit, lowerIsBetter }) => {
                        const diff = +(current - initial).toFixed(1);
                        const good = lowerIsBetter ? diff < 0 : diff > 0;
                        return (
                          <li key={label} className="grid grid-cols-[110px_1fr_auto] sm:grid-cols-[150px_1fr_auto] items-center gap-4">
                            <span className="text-[14px] text-[var(--muted)]">{label}</span>
                            <span className="flex items-center gap-3 cp-mono text-[12px]">
                              <span className="text-[var(--dim)] w-14 text-right">{initial.toLocaleString('pt-BR')}</span>
                              <span className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                <span
                                  className="block h-full rounded-full"
                                  style={{ width: `${Math.min(100, (current / initial) * 100)}%`, background: good ? MACRO.fat : '#ff5d6c' }}
                                />
                              </span>
                              <span className="w-16">
                                {current.toLocaleString('pt-BR')} {unit}
                              </span>
                            </span>
                            <Badge tone={good ? 'teal' : 'amber'}>
                              {diff > 0 ? '+' : ''}
                              {diff.toLocaleString('pt-BR')}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </SectionCard>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ────── LATERAL ────── */}
        <aside className="xl:sticky xl:top-6 space-y-4">
          <section className="rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
            <span aria-hidden className="cp-modal-bar" />
            <div className="p-5">
              <p className="cp-kicker">Próxima consulta</p>
              <p className="cp-display mt-1 text-[22px] font-bold first-letter:uppercase">
                {nextConsult ? fmtDate(nextConsult, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Não agendada'}
              </p>
            </div>
            <div className="px-3 pb-3 space-y-1">
              {[
                { label: 'Registrar consulta', icon: Plus, action: () => navigate(`/nutritionist/consulta/${id}`) },
                { label: 'Editar plano alimentar', icon: Edit, action: () => navigate(`/nutritionist/criar-plano/${id}`) },
                { label: 'Preencher anamnese', icon: ClipboardList, action: () => navigate(`/nutritionist/anamnese/${id}`) },
                { label: 'Ver progresso', icon: BarChart3, action: () => setActiveTab('progress') },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl grid place-items-center bg-[rgba(85,70,255,0.14)]">
                    <Icon className="w-4 h-4 text-[var(--brand-300)]" />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold">
              <Flame className="w-4 h-4 text-[var(--amber)]" /> Meta calórica diária
            </p>
            <p className="mt-3 cp-display text-[36px] font-bold leading-none">
              {mockMealPlan.calories.toLocaleString('pt-BR')}
              <span className="ml-1 text-[13px] font-medium text-[var(--muted)]">kcal</span>
            </p>
            <div className="mt-4 flex h-2.5 rounded-full overflow-hidden bg-white/[0.06]">
              <span style={{ width: `${proteinPct}%`, background: MACRO.protein }} title={`Proteína ${proteinPct}%`} />
              <span style={{ width: `${carbsPct}%`, background: MACRO.carbs }} title={`Carboidrato ${carbsPct}%`} />
              <span style={{ width: `${fatPct}%`, background: MACRO.fat }} title={`Gordura ${fatPct}%`} />
            </div>
            <div className="mt-2 flex justify-between cp-mono text-[11.5px]">
              <span style={{ color: MACRO.protein }}>P {proteinPct}%</span>
              <span style={{ color: MACRO.carbs }}>C {carbsPct}%</span>
              <span style={{ color: MACRO.fat }}>G {fatPct}%</span>
            </div>
          </section>

          <section className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] p-5">
            <p className="text-[14px] font-semibold">Adesão ao plano</p>
            <div className="mt-3 flex items-center gap-4">
              <AdherenceRing value={p.adherence} />
              <p className="text-[13px] text-[var(--muted)] leading-relaxed">
                {p.adherence >= 80
                  ? `${p.name.split(' ')[0]} está seguindo bem o plano. Continue monitorando.`
                  : `Vale conversar com ${p.name.split(' ')[0]} sobre as dificuldades com o plano.`}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </Page>
  );
}

function AdherenceRing({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0" role="img" aria-label={`Adesão de ${value}%`}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
      <motion.circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#8c82ff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        transform="rotate(-90 38 38)"
      />
      <text x="38" y="43" textAnchor="middle" fill="#f4f6fb" fontSize="16" fontWeight="700">
        {value}%
      </text>
    </svg>
  );
}
