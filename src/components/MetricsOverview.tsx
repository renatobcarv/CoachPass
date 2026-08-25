'use client';

import React from 'react';
import { Users, AlertTriangle, TrendingUp, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics } from '@/types/coachpass';

interface MetricsOverviewProps {
  metrics: DashboardMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Card 1: Total Alunos */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Alunos</span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-white tracking-tight">{metrics.totalStudents}</span>
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {metrics.activeStudents} ativos
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Carteira total de personal</p>
      </div>

      {/* Card 2: Taxa Média de Adesão */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taxa Média de Adesão</span>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-white tracking-tight">{metrics.avgAdherenceRate}%</span>
          <span className="text-xs font-medium text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
            +4.2% vs mês anterior
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
            style={{ width: `${metrics.avgAdherenceRate}%` }}
          />
        </div>
      </div>

      {/* Card 3: Treinos do Mês */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sessões Registradas</span>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-white tracking-tight">{metrics.totalWorkoutsThisMonth}</span>
          <span className="text-xs font-medium text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
            Neste mês
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Cargas e repetições catalogadas</p>
      </div>

      {/* Card 4: Alertas de IA */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border-amber-500/20">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Alertas Inteligentes
          </span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-black text-amber-400 tracking-tight">{metrics.warningStudents} Alunos</span>
          <span className="text-xs font-semibold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            Ação Sugerida
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Frequência reduzida ou risco de evasão</p>
      </div>

    </div>
  );
};
