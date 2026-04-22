import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Scale,
  Activity,
  Award,
  Target,
  Calendar,
  Download,
  Share2,
  Flame,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { toast } from 'sonner';

// ─── Mock Data ───
const studentData = {
  name: 'Lucas Silva',
  avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff',
  age: 28,
  goal: 'Ganho de Massa Muscular',
  startDate: '2024-01-15',
  program: 'PPL – Push/Pull/Legs',
  totalWeeks: 12,
};

const weightProgress = [
  { month: 'Jan', weight: 76.2, muscle: 62.3, fat: 15.8 },
  { month: 'Fev', weight: 77.1, muscle: 63.9, fat: 15.1 },
  { month: 'Mar', weight: 78.5, muscle: 65.8, fat: 14.2 },
];

const weeklyWorkouts = [
  { week: 'S1', done: 3, target: 5 },
  { week: 'S2', done: 4, target: 5 },
  { week: 'S3', done: 5, target: 5 },
  { week: 'S4', done: 4, target: 5 },
  { week: 'S5', done: 5, target: 5 },
  { week: 'S6', done: 5, target: 5 },
  { week: 'S7', done: 4, target: 5 },
  { week: 'S8', done: 5, target: 5 },
];

const muscleGroupVolume = [
  { group: 'Peito', volume: 85 },
  { group: 'Costas', volume: 90 },
  { group: 'Ombro', volume: 72 },
  { group: 'Bíceps', volume: 78 },
  { group: 'Tríceps', volume: 80 },
  { group: 'Pernas', volume: 68 },
];

const strengthProgress = [
  { exercise: 'Supino', start: 70, current: 87.5, unit: 'kg' },
  { exercise: 'Agachamento', start: 80, current: 100, unit: 'kg' },
  { exercise: 'Remada', start: 60, current: 75, unit: 'kg' },
  { exercise: 'Desenvolvimento', start: 40, current: 52.5, unit: 'kg' },
  { exercise: 'Barra Fixa', start: 0, current: 8, unit: 'reps' },
];

const measurements = [
  { label: 'Peso', start: '76.2 kg', current: '78.5 kg', change: '+2.3 kg', positive: true },
  { label: '% Gordura', start: '15.8%', current: '14.2%', change: '-1.6%', positive: true },
  { label: 'Massa Muscular', start: '62.3 kg', current: '65.8 kg', change: '+3.5 kg', positive: true },
  { label: 'Cintura', start: '83 cm', current: '81 cm', change: '-2 cm', positive: true },
  { label: 'Peitoral', start: '98 cm', current: '103 cm', change: '+5 cm', positive: true },
  { label: 'Braço D', start: '35 cm', current: '38 cm', change: '+3 cm', positive: true },
];

const highlights = [
  { label: 'Total de Treinos', value: '35', icon: Dumbbell, color: '#10b981' },
  { label: 'Taxa de Adesão', value: '87%', icon: Target, color: '#3b82f6' },
  { label: 'Maior Sequência', value: '18 dias', icon: Flame, color: '#f59e0b' },
  { label: 'Metas Atingidas', value: '4/5', icon: Award, color: '#8b5cf6' },
];

const aiAnalysis = [
  { type: 'positive', text: 'Excelente ganho de massa muscular de 3.5 kg em 3 meses, acima da média para o nível intermediário.' },
  { type: 'positive', text: 'Taxa de adesão de 87% demonstra comprometimento consistente com o programa.' },
  { type: 'positive', text: 'Redução de gordura corporal simultânea ao ganho muscular indica dieta e periodização eficientes.' },
  { type: 'alert', text: 'Volume de pernas abaixo do ideal. Recomendo aumentar frequência para 2x por semana.' },
  { type: 'alert', text: 'Atenção à restrição no joelho esquerdo ao progredir cargas no agachamento e leg press.' },
];

type Period = '1M' | '3M' | '6M';

export function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('3M');

  const handleExport = () => toast.success('Relatório exportado como PDF!');
  const handleShare = () => toast.success('Link do relatório copiado!');

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(`/personal/aluno/${id}`)}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Perfil
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <img src={studentData.avatar} alt={studentData.name} className="w-14 h-14 rounded-2xl ring-4 ring-purple-500/20" />
            <div>
              <h1 className="dark:text-white text-slate-900">Relatório de Progresso</h1>
              <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">
                {studentData.name} · {studentData.program} · Semana {studentData.totalWeeks}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex dark:bg-zinc-900 bg-white rounded-xl p-1 dark:border-zinc-800 border border-slate-200">
              {(['1M', '3M', '6M'] as Period[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    period === p ? 'text-white' : 'dark:text-zinc-500 text-slate-500 hover:dark:text-zinc-300'
                  }`}
                  style={period === p ? { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', fontWeight: 600 } : {}}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:text-purple-400 hover:text-purple-600 transition-colors">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', fontWeight: 600 }}>
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Highlight Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {highlights.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Weight & Composition */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="dark:text-white text-slate-900">Evolução Corporal</h3>
                <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">Peso, Massa Muscular e Gordura</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm" style={{ fontWeight: 600 }}>+3.5 kg músculo</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart id="sr-evolution-chart" data={weightProgress}>
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} name="Peso (kg)" dot={{ fill: '#f59e0b', r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="muscle" stroke="#3b82f6" strokeWidth={2.5} name="Músculo (kg)" dot={{ fill: '#3b82f6', r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="fat" stroke="#ef4444" strokeWidth={2.5} name="Gordura (%)" dot={{ fill: '#ef4444', r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Workouts */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="dark:text-white text-slate-900">Frequência Semanal</h3>
                <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">Treinos realizados × meta</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" style={{ fontWeight: 600 }}>
                Média: 4.4/5
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart id="sr-frequency-chart" data={weeklyWorkouts} barGap={4}>
                <XAxis dataKey="week" stroke="#71717a" fontSize={12} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} domain={[0, 5]} axisLine={{ stroke: '#27272a' }} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="target" fill="#3f3f46" radius={[4, 4, 0, 0]} name="Meta" isAnimationActive={false} />
                <Bar dataKey="done" fill="#10b981" radius={[4, 4, 0, 0]} name="Feito" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Strength Progress */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-5">Evolução de Força</h3>
            <div className="space-y-4">
              {strengthProgress.map(({ exercise, start, current, unit }) => {
                const gain = current - start;
                const pct = start > 0 ? Math.round((gain / start) * 100) : 0;
                return (
                  <div key={exercise}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm dark:text-zinc-300 text-slate-700" style={{ fontWeight: 500 }}>{exercise}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs dark:text-zinc-500 text-slate-400">{start}{unit}</span>
                        <ChevronRight className="w-3 h-3 dark:text-zinc-600 text-slate-400" />
                        <span className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{current}{unit}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" style={{ fontWeight: 600 }}>
                          +{gain}{unit} {pct > 0 ? `(${pct}%)` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, (current / (current * 1.2)) * 100)}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Measurements Table */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="dark:text-white text-slate-900">Medidas Comparativas</h3>
              <Calendar className="w-4 h-4 dark:text-zinc-500 text-slate-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-zinc-800 border-slate-100">
                    <th className="text-left py-2 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Medida</th>
                    <th className="text-right py-2 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Início</th>
                    <th className="text-right py-2 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Atual</th>
                    <th className="text-right py-2 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.label} className="border-b dark:border-zinc-800/50 border-slate-50 last:border-0">
                      <td className="py-3 dark:text-zinc-300 text-slate-700">{m.label}</td>
                      <td className="py-3 text-right dark:text-zinc-500 text-slate-400">{m.start}</td>
                      <td className="py-3 text-right dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{m.current}</td>
                      <td className="py-3 text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${m.positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`} style={{ fontWeight: 600 }}>
                          {m.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Muscle Radar */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h4 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Volume por Grupo Muscular</h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart id="sr-radar-chart" data={muscleGroupVolume}>
                <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="group" tick={{ fontSize: 10, fill: '#71717a' }} />
                <Radar dataKey="volume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Analysis */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h4 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 600 }}>Análise da IA</h4>
            </div>
            <div className="space-y-3">
              {aiAnalysis.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                  item.type === 'positive'
                    ? 'dark:bg-emerald-500/5 bg-emerald-50 dark:border-emerald-500/20 border border-emerald-200'
                    : 'dark:bg-amber-500/5 bg-amber-50 dark:border-amber-500/20 border border-amber-200'
                }`}>
                  {item.type === 'positive'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                  <p className={`text-xs leading-relaxed ${item.type === 'positive' ? 'dark:text-emerald-300 text-emerald-700' : 'dark:text-amber-300 text-amber-700'}`}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Period Summary */}
          <div
            className="rounded-3xl p-5 border"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))', borderColor: 'rgba(139,92,246,0.2)' }}
          >
            <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>
              Período: {period}
            </p>
            <p className="text-xs dark:text-zinc-400 text-slate-500">
              {studentData.name} está em evolução consistente. Continue com o programa atual e ajuste progressividade nas pernas.
            </p>
            <button onClick={() => navigate(`/personal/aluno/${id}/medicao`)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-colors" style={{ fontWeight: 600 }}>
              Registrar Nova Medição
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}