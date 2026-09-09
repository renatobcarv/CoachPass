import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Baby,
  Heart,
  Calendar,
  Scale,
  TrendingUp,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Star,
  Ruler,
  ChevronDown,
  ChevronUp,
  User,
  Droplets,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type PatientType = 'gestante' | 'lactante' | 'crianca' | 'adolescente';

interface MaternalPatient {
  id: string;
  name: string;
  avatar: string;
  type: PatientType;
  age: string;
  gestationalAge?: string;
  weight: number;
  height: number;
  preGestationalWeight?: number;
  trimester?: number;
  lastConsultation: string;
  risks: string[];
  supplementation: string[];
  imc: number;
}

const patients: MaternalPatient[] = [
  {
    id: 'm1',
    name: 'Carla Pereira',
    avatar: 'https://ui-avatars.com/api/?name=Carla+Pereira&background=ec4899&color=fff',
    type: 'gestante',
    age: '28 anos',
    gestationalAge: '24 semanas',
    weight: 72.0,
    height: 162,
    preGestationalWeight: 65.0,
    trimester: 2,
    lastConsultation: 'Há 2 semanas',
    risks: ['Ganho excessivo de peso'],
    supplementation: ['Ácido Fólico 400mcg', 'Ferro 40mg', 'Vitamina D 1000UI'],
    imc: 27.4,
  },
  {
    id: 'm2',
    name: 'Beatriz Silva',
    avatar: 'https://ui-avatars.com/api/?name=Beatriz+Silva&background=a78bfa&color=fff',
    type: 'lactante',
    age: '32 anos',
    weight: 68.0,
    height: 165,
    lastConsultation: 'Há 5 dias',
    risks: [],
    supplementation: ['Vitamina D 2000UI', 'Ômega-3 1g', 'Cálcio 500mg'],
    imc: 24.9,
  },
  {
    id: 'm3',
    name: 'Lucas Ferreira',
    avatar: 'https://ui-avatars.com/api/?name=Lucas+Ferreira&background=3b82f6&color=fff',
    type: 'crianca',
    age: '3 anos',
    weight: 14.2,
    height: 95,
    lastConsultation: 'Há 1 mês',
    risks: ['Risco de desnutrição leve'],
    supplementation: ['Vitamina D 600UI', 'Zinco 5mg'],
    imc: 15.7,
  },
  {
    id: 'm4',
    name: 'Sofia Andrade',
    avatar: 'https://ui-avatars.com/api/?name=Sofia+Andrade&background=f59e0b&color=fff',
    type: 'adolescente',
    age: '15 anos',
    weight: 52.0,
    height: 160,
    lastConsultation: 'Há 3 semanas',
    risks: ['Baixa ingestão de cálcio', 'Comportamento restritivo'],
    supplementation: ['Ferro 30mg', 'Cálcio 1000mg'],
    imc: 20.3,
  },
];

const weightGainData = [
  { week: 'S8', weight: 65.0, p10: 0.5, p50: 1.0, p90: 1.8 },
  { week: 'S12', weight: 66.2, p10: 1.5, p50: 2.5, p90: 3.8 },
  { week: 'S16', weight: 67.8, p10: 3.0, p50: 4.5, p90: 6.5 },
  { week: 'S20', weight: 69.5, p10: 5.0, p50: 7.0, p90: 9.5 },
  { week: 'S24', weight: 72.0, p10: 7.0, p50: 9.5, p90: 12.5 },
];

const typeConfig: Record<PatientType, { label: string; color: string; icon: React.ElementType }> = {
  gestante: { label: 'Gestante', color: '#ec4899', icon: Heart },
  lactante: { label: 'Lactante', color: '#8b5cf6', icon: Baby },
  crianca: { label: 'Criança', color: '#3b82f6', icon: Star },
  adolescente: { label: 'Adolescente', color: '#f59e0b', icon: User },
};

const trimesterInfo = [
  { t: 1, weeks: '1–12 sem', focus: 'Ácido fólico, ferro, controle de náuseas', kcal: '+0-100 kcal' },
  { t: 2, weeks: '13–27 sem', focus: 'Ganho de peso monitorado, DHA, cálcio', kcal: '+340 kcal' },
  { t: 3, weeks: '28–40 sem', focus: 'Proteína aumentada, vitamina K, ferro', kcal: '+450 kcal' },
];

export function NutritionistMaternoInfantil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'patients' | 'references' | 'gestante'>('patients');
  const [expandedPatient, setExpandedPatient] = useState<string | null>('m1');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = patients.filter(p => filterType === 'all' || p.type === filterType);

  return (
    <div className="p-4 lg:p-8 max-w-[1300px] mx-auto">
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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
              <Baby className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Avaliação Materno-Infantil</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Acompanhamento completo de gestantes, lactantes, crianças e adolescentes com referências atualizadas
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', boxShadow: '0 8px 20px rgba(236,72,153,0.3)', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Novo Acompanhamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gestantes', value: patients.filter(p => p.type === 'gestante').length, icon: Heart, color: '#ec4899' },
          { label: 'Lactantes', value: patients.filter(p => p.type === 'lactante').length, icon: Baby, color: '#8b5cf6' },
          { label: 'Crianças', value: patients.filter(p => p.type === 'crianca').length, icon: Star, color: '#3b82f6' },
          { label: 'Adolescentes', value: patients.filter(p => p.type === 'adolescente').length, icon: User, color: '#f59e0b' },
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

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex flex-wrap dark:border-zinc-800 border border-slate-200">
        {[
          { id: 'patients', label: 'Pacientes', icon: Users },
          { id: 'gestante', label: 'Curvas Gestacionais', icon: TrendingUp },
          { id: 'references', label: 'Referências Nutricionais', icon: Star },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#ec4899,#be185d)', fontWeight: 600 } : {}}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            {[{ id: 'all', label: 'Todos' }, ...Object.entries(typeConfig).map(([k, v]) => ({ id: k, label: v.label }))].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterType(id)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all ${filterType === id ? 'text-white' : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                style={filterType === id ? { background: 'linear-gradient(135deg,#ec4899,#be185d)', fontWeight: 600 } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((patient) => {
              const typeCfg = typeConfig[patient.type];
              const TypeIcon = typeCfg.icon;
              const isExpanded = expandedPatient === patient.id;

              return (
                <div key={patient.id} className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden">
                  <div
                    className="flex items-start gap-4 p-5 cursor-pointer hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedPatient(isExpanded ? null : patient.id)}
                  >
                    <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-2xl flex-shrink-0 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{patient.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${typeCfg.color}20`, color: typeCfg.color, fontWeight: 600 }}>
                          <TypeIcon className="w-2.5 h-2.5" /> {typeCfg.label}
                        </span>
                        {patient.risks.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> Risco
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs dark:text-zinc-500 text-slate-400">
                        <span>{patient.age}</span>
                        {patient.gestationalAge && <span>· {patient.gestationalAge}</span>}
                        <span>· {patient.weight} kg</span>
                        <span>· {patient.height} cm</span>
                        <span>· IMC {patient.imc}</span>
                        <span>· Última consulta: {patient.lastConsultation}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t dark:border-zinc-800 border-slate-200"
                      >
                        <div className="p-5 grid md:grid-cols-2 gap-5">
                          {/* Left */}
                          <div className="space-y-4">
                            {patient.risks.length > 0 && (
                              <div className="dark:bg-amber-500/5 bg-amber-50 rounded-2xl p-4 border dark:border-amber-500/20 border-amber-200">
                                <p className="text-xs text-amber-500 uppercase tracking-wider mb-2" style={{ fontWeight: 700 }}>
                                  <AlertCircle className="w-3 h-3 inline mr-1" />Riscos Identificados
                                </p>
                                {patient.risks.map(r => (
                                  <p key={r} className="text-sm dark:text-amber-300 text-amber-800">{r}</p>
                                ))}
                              </div>
                            )}

                            <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
                                Suplementação Prescrita
                              </p>
                              <div className="space-y-2">
                                {patient.supplementation.map(s => (
                                  <div key={s} className="flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-sm dark:text-zinc-300 text-slate-700">{s}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Peso Atual', value: `${patient.weight} kg`, icon: Scale, color: typeCfg.color },
                                { label: 'Altura', value: `${patient.height} cm`, icon: Ruler, color: typeCfg.color },
                                { label: 'IMC', value: patient.imc, icon: Activity, color: typeCfg.color },
                                ...(patient.preGestationalWeight ? [{ label: 'Peso Pré-gestacional', value: `${patient.preGestationalWeight} kg`, icon: Scale, color: typeCfg.color }] : []),
                                ...(patient.trimester ? [{ label: 'Trimestre', value: `${patient.trimester}º Trimestre`, icon: Calendar, color: typeCfg.color }] : []),
                              ].map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                                  <p className="text-sm dark:text-white text-slate-900" style={{ color, fontWeight: 700 }}>{String(value)}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <button
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs text-white transition-all hover:opacity-90"
                                style={{ background: `linear-gradient(135deg,${typeCfg.color},${typeCfg.color}cc)`, fontWeight: 600 }}
                              >
                                <Plus className="w-3 h-3" /> Nova Avaliação
                              </button>
                              <button
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-zinc-500 transition-all"
                              >
                                <TrendingUp className="w-3 h-3" /> Ver Evolução
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Gestante Tab */}
      {activeTab === 'gestante' && (
        <div className="space-y-6">
          {/* Trimester Guide */}
          <div className="grid md:grid-cols-3 gap-4">
            {trimesterInfo.map(({ t, weeks, focus, kcal }) => (
              <div key={t} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <span className="text-sm text-pink-500" style={{ fontWeight: 700 }}>{t}°</span>
                  </div>
                  <div>
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{t}º Trimestre</p>
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{weeks}</p>
                  </div>
                </div>
                <p className="text-xs dark:text-zinc-400 text-slate-500 mb-3 leading-relaxed">{focus}</p>
                <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20" style={{ fontWeight: 600 }}>
                  {kcal}
                </span>
              </div>
            ))}
          </div>

          {/* Weight Gain Chart */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-2">Curva de Ganho de Peso Gestacional – Carla Pereira</h3>
            <p className="text-xs dark:text-zinc-500 text-slate-400 mb-5">Comparação com percentis 10, 50 e 90 (IOM 2009)</p>

            <div className="flex gap-4 mb-4 flex-wrap">
              {[
                { label: 'Ganho Total', value: '+7,0 kg', color: '#ec4899' },
                { label: 'Ganho Esperado P50', value: '+9,5 kg', color: '#8b5cf6' },
                { label: 'Peso Pré-gestacional', value: '65,0 kg', color: '#6b7280' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs dark:text-zinc-400 text-slate-500">{label}: <span style={{ color, fontWeight: 700 }}>{value}</span></span>
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weightGainData}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 16]} tickFormatter={(v) => `${v}kg`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  formatter={(val: number, name: string) => [`${val} kg`, name]}
                />
                <Line type="monotone" dataKey="p90" stroke="#6b7280" strokeWidth={1} strokeDasharray="4 4" dot={false} name="P90" />
                <Line type="monotone" dataKey="p50" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="P50" />
                <Line type="monotone" dataKey="p10" stroke="#6b7280" strokeWidth={1} strokeDasharray="4 4" dot={false} name="P10" />
                <Line
                  type="monotone"
                  dataKey={(d) => d.weight - 65}
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  dot={{ fill: '#ec4899', r: 4 }}
                  name="Paciente"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* References Tab */}
      {activeTab === 'references' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Necessidades Proteicas na Gestação',
              content: 'Adicional de 25g/dia a partir do 2º trimestre (OMS). Total recomendado: 71g/dia. Priorizar fontes de alto valor biológico.',
              color: '#ec4899', icon: Heart,
            },
            {
              title: 'Suplementação Padrão – Gestante',
              content: 'Ácido Fólico 400–800mcg/dia (início antes da concepção). Ferro 30–60mg/dia a partir do 2º trimestre. Vitamina D 600–2000UI/dia. Cálcio 1000mg/dia.',
              color: '#8b5cf6', icon: Star,
            },
            {
              title: 'Ganho de Peso Recomendado (IOM 2009)',
              content: 'IMC < 18,5: Ganhar 12,5–18 kg. IMC 18,5–24,9: Ganhar 11,5–16 kg. IMC 25–29,9: Ganhar 7–11,5 kg. IMC ≥ 30: Ganhar 5–9 kg.',
              color: '#f59e0b', icon: Scale,
            },
            {
              title: 'Alimentos a Evitar na Gestação',
              content: 'Carnes cruas ou mal cozidas. Ovos crus. Peixes de alto teor de mercúrio (cação, tubarão). Queijos moles não pasteurizados. Bebidas alcoólicas. Cafeína > 200mg/dia.',
              color: '#ef4444', icon: AlertCircle,
            },
            {
              title: 'Avaliação Nutricional Infantil (OMS)',
              content: 'Usar curvas de crescimento OMS 2006 (0–5 anos) e OMS 2007 (5–19 anos). Indicadores: Peso/Idade, Estatura/Idade, IMC/Idade, Peso/Estatura.',
              color: '#3b82f6', icon: Baby,
            },
            {
              title: 'Amamentação – Necessidades Nutricionais',
              content: 'Adicional de 500 kcal/dia. Proteína: +25g/dia. DHA: 200–300mg/dia. Vitamina D: 600UI/dia. Manter hidratação adequada (≥2L água/dia). Evitar dietas restritivas.',
              color: '#10b981', icon: Droplets,
            },
          ].map(({ title, content, color, icon: Icon }) => (
            <div key={title} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <p className="text-sm dark:text-white text-slate-900 leading-snug" style={{ fontWeight: 600 }}>{title}</p>
              </div>
              <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Dummy Users icon for the tab (it's just used inline)
function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
