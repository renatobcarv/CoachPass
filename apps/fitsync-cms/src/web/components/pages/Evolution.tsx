import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Activity,
  Target,
  Calendar,
  BarChart2,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const ranges = ['1M', '3M', '6M', '1A'];

const allWeightData = {
  '1M': [
    { id: 'w1', date: 'Sem 1', weight: 80.2 },
    { id: 'w2', date: 'Sem 2', weight: 79.8 },
    { id: 'w3', date: 'Sem 3', weight: 79.5 },
    { id: 'w4', date: 'Sem 4', weight: 79.1 },
  ],
  '3M': [
    { id: 'w1', date: 'Jan', weight: 81.5 },
    { id: 'w2', date: 'Fev', weight: 80.3 },
    { id: 'w3', date: 'Mar', weight: 79.5 },
  ],
  '6M': [
    { id: 'jan-w', date: 'Jan', weight: 84.2 },
    { id: 'fev-w', date: 'Fev', weight: 83.5 },
    { id: 'mar-w', date: 'Mar', weight: 82.8 },
    { id: 'abr-w', date: 'Abr', weight: 82.1 },
    { id: 'mai-w', date: 'Mai', weight: 81.6 },
    { id: 'jun-w', date: 'Jun', weight: 80.9 },
  ],
  '1A': [
    { id: 'jan-w', date: 'Jan', weight: 87.2 },
    { id: 'fev-w', date: 'Fev', weight: 86.1 },
    { id: 'mar-w', date: 'Mar', weight: 85.0 },
    { id: 'abr-w', date: 'Abr', weight: 84.2 },
    { id: 'mai-w', date: 'Mai', weight: 83.5 },
    { id: 'jun-w', date: 'Jun', weight: 82.8 },
    { id: 'jul-w', date: 'Jul', weight: 82.1 },
    { id: 'ago-w', date: 'Ago', weight: 81.6 },
    { id: 'set-w', date: 'Set', weight: 80.9 },
    { id: 'out-w', date: 'Out', weight: 80.2 },
    { id: 'nov-w', date: 'Nov', weight: 79.8 },
    { id: 'dez-w', date: 'Dez', weight: 79.5 },
  ],
};

const allBodyFatData = {
  '1M': [
    { id: 'f1', date: 'Sem 1', fat: 18.1 },
    { id: 'f2', date: 'Sem 2', fat: 17.9 },
    { id: 'f3', date: 'Sem 3', fat: 17.8 },
    { id: 'f4', date: 'Sem 4', fat: 17.6 },
  ],
  '3M': [
    { id: 'f1', date: 'Jan', fat: 20.2 },
    { id: 'f2', date: 'Fev', fat: 19.1 },
    { id: 'f3', date: 'Mar', fat: 17.8 },
  ],
  '6M': [
    { id: 'jan-f', date: 'Jan', fat: 22.1 },
    { id: 'fev-f', date: 'Fev', fat: 21.5 },
    { id: 'mar-f', date: 'Mar', fat: 20.8 },
    { id: 'abr-f', date: 'Abr', fat: 20.2 },
    { id: 'mai-f', date: 'Mai', fat: 19.7 },
    { id: 'jun-f', date: 'Jun', fat: 19.1 },
  ],
  '1A': [
    { id: 'jan-f', date: 'Jan', fat: 25.0 },
    { id: 'fev-f', date: 'Fev', fat: 24.2 },
    { id: 'mar-f', date: 'Mar', fat: 23.5 },
    { id: 'abr-f', date: 'Abr', fat: 22.8 },
    { id: 'mai-f', date: 'Mai', fat: 22.1 },
    { id: 'jun-f', date: 'Jun', fat: 21.5 },
    { id: 'jul-f', date: 'Jul', fat: 20.8 },
    { id: 'ago-f', date: 'Ago', fat: 20.2 },
    { id: 'set-f', date: 'Set', fat: 19.5 },
    { id: 'out-f', date: 'Out', fat: 18.9 },
    { id: 'nov-f', date: 'Nov', fat: 18.3 },
    { id: 'dez-f', date: 'Dez', fat: 17.8 },
  ],
};

const workoutsPerWeek = [
  { id: 's1', week: 'S1', count: 3 },
  { id: 's2', week: 'S2', count: 4 },
  { id: 's3', week: 'S3', count: 5 },
  { id: 's4', week: 'S4', count: 4 },
  { id: 's5', week: 'S5', count: 5 },
  { id: 's6', week: 'S6', count: 5 },
  { id: 's7', week: 'S7', count: 4 },
  { id: 's8', week: 'S8', count: 5 },
];

const muscleGroupData = [
  { id: 'peito', group: 'Peito', volume: 85 },
  { id: 'costas', group: 'Costas', volume: 90 },
  { id: 'ombro', group: 'Ombro', volume: 70 },
  { id: 'biceps', group: 'Bíceps', volume: 75 },
  { id: 'triceps', group: 'Tríceps', volume: 80 },
  { id: 'pernas', group: 'Pernas', volume: 65 },
];

const measurements = [
  { label: 'Peso', current: '79.5 kg', start: '84.2 kg', change: '-4.7 kg', positive: true },
  { label: '% Gordura', current: '17.8%', start: '22.1%', change: '-4.3%', positive: true },
  { label: 'Peito', current: '102 cm', start: '98 cm', change: '+4 cm', positive: true },
  { label: 'Cintura', current: '81 cm', start: '87 cm', change: '-6 cm', positive: true },
  { label: 'Braço (D)', current: '38 cm', start: '35 cm', change: '+3 cm', positive: true },
  { label: 'Coxa (D)', current: '57 cm', start: '54 cm', change: '+3 cm', positive: true },
];

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
  unit?: string;
};

function CustomTooltip({ active, payload, label, unit = '' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="dark:bg-zinc-800 bg-white dark:border-zinc-700 border border-slate-200 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">{label}</p>
        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
          {payload[0].value}{unit}
        </p>
      </div>
    );
  }
  return null;
}

export function Evolution() {
  const [activeRange, setActiveRange] = useState('6M');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#27272a' : '#e2e8f0';
  const axisColor = isDark ? '#52525b' : '#94a3b8';
  const textColor = isDark ? '#71717a' : '#64748b';

  const weightData = allWeightData[activeRange as keyof typeof allWeightData];
  const bodyFatData = allBodyFatData[activeRange as keyof typeof allBodyFatData];

  const rangeStats: Record<string, { weightLost: string; fatLost: string; workouts: number; goalRate: string }> = {
    '1M': { weightLost: '1.1 kg', fatLost: '0.5%', workouts: 16, goalRate: '82%' },
    '3M': { weightLost: '2.0 kg', fatLost: '2.4%', workouts: 35, goalRate: '86%' },
    '6M': { weightLost: '4.7 kg', fatLost: '4.3%', workouts: 68, goalRate: '89%' },
    '1A': { weightLost: '7.7 kg', fatLost: '7.2%', workouts: 132, goalRate: '91%' },
  };
  const stats = rangeStats[activeRange];

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="dark:text-white text-slate-900">Evolução</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
            Acompanhe seu progresso ao longo do tempo
          </p>
        </div>
        {/* Range selector */}
        <div className="flex gap-1 dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 rounded-xl p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                activeRange === r
                  ? 'text-white'
                  : 'dark:text-zinc-500 text-slate-500 dark:hover:text-zinc-300 hover:text-slate-700'
              }`}
              style={
                activeRange === r
                  ? { background: 'linear-gradient(135deg, #10b981, #3b82f6)', fontWeight: 600 }
                  : { fontWeight: 400 }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Peso perdido', value: stats.weightLost, trend: '↓', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Scale },
          { label: 'Gordura reduzida', value: stats.fatLost, trend: '↓', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Activity },
          { label: 'Treinos feitos', value: String(stats.workouts), trend: '↑', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: BarChart2 },
          { label: 'Metas batidas', value: stats.goalRate, trend: '↑', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Target },
        ].map(({ label, value, trend, color, bg, icon: Icon }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl" style={{ fontWeight: 800 }}>
              {trend} {value}
            </p>
            <p className="text-xs dark:text-zinc-500 text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Chart */}
        <div className="lg:col-span-2 dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="dark:text-white text-slate-900">Peso Corporal</h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">
                Tendência de redução — Meta: 75 kg
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 600 }}>-{stats.weightLost}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220} key={`weight-${activeRange}`}>
            <AreaChart
              data={weightData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12, fill: axisColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                tickFormatter={(v) => `${v}kg`}
              />
              <Tooltip content={<CustomTooltip unit=" kg" />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#weightGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Body Fat Chart */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="dark:text-white text-slate-900">% Gordura</h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">Meta: 12%</p>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 600 }}>-{stats.fatLost}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220} key={`bodyfat-${activeRange}`}>
            <LineChart
              data={bodyFatData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Line
                type="monotone"
                dataKey="fat"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workouts per Week */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="dark:text-white text-slate-900">Frequência</h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">Treinos por semana</p>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 600 }}>+33%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200} key="workouts-container">
            <BarChart 
              data={workoutsPerWeek} 
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }} 
              barSize={20}
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" />
                  <stop offset="95%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: axisColor }} 
                axisLine={{ stroke: gridColor }} 
                tickLine={false}
              />
              <YAxis 
                domain={[0, 6]} 
                tick={{ fontSize: 12, fill: axisColor }} 
                axisLine={{ stroke: gridColor }} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip unit=" treinos" />} />
              <Bar 
                dataKey="count" 
                fill="url(#barGrad)" 
                radius={[6, 6, 0, 0]} 
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Muscle Group Radar */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="mb-4">
            <h3 className="dark:text-white text-slate-900">Volume por Grupo</h3>
            <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">Distribuição muscular do mês</p>
          </div>
          <ResponsiveContainer width="100%" height={200} key="muscle-container">
            <RadarChart 
              data={muscleGroupData} 
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <PolarGrid stroke={gridColor} strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="group" 
                tick={{ fontSize: 11, fill: textColor }}
              />
              <Radar
                name="Volume"
                dataKey="volume"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Measurements Table */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="dark:text-white text-slate-900">Medidas</h3>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-0.5">Evolução desde o início</p>
            </div>
            <Calendar className="w-4 h-4 dark:text-zinc-500 text-slate-400" />
          </div>
          <div className="space-y-3">
            {measurements.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between p-3 rounded-2xl dark:bg-zinc-800/50 bg-slate-50"
              >
                <span className="text-sm dark:text-zinc-400 text-slate-500">{m.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs dark:text-zinc-600 text-slate-400">{m.start}</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${m.positive ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <span className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                    {m.current}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      m.positive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-red-400 bg-red-500/10'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {m.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}