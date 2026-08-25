'use client';

import React from 'react';
import { Sparkles, AlertCircle, Award, TrendingUp, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import { AIInsight } from '@/types/coachpass';

interface AIInsightsSectionProps {
  insights: AIInsight[];
  onSelectStudent: (studentId: string) => void;
}

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({ insights, onSelectStudent }) => {
  const getBadgeStyle = (type: AIInsight['type'], severity: AIInsight['severity']) => {
    switch (type) {
      case 'risk':
        return {
          bg: 'bg-rose-950/70 border-rose-500/40 text-rose-400',
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          label: 'Alerta de Risco',
        };
      case 'achievement':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400',
          icon: <Award className="w-4 h-4 text-emerald-400" />,
          label: 'Recorde de Carga (PR)',
        };
      case 'retention':
        return {
          bg: 'bg-amber-950/70 border-amber-500/40 text-amber-400',
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          label: 'Atenção de Frequência',
        };
      case 'suggestion':
        return {
          bg: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-400',
          icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
          label: 'Sugestão de Carga',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: <Sparkles className="w-4 h-4 text-slate-400" />,
          label: 'Insight',
        };
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 mb-8 relative overflow-hidden">
      
      {/* Background Neon Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Assistente de IA — Insights e Diagnósticos
            </h2>
            <p className="text-xs text-slate-400">
              Análise preditiva de padrões de treino, queda de adesão e sugestões técnicas de carga
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          4 Novos Insights Hoje
        </span>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const badge = getBadgeStyle(insight.type, insight.severity);
          return (
            <div
              key={insight.id}
              className="glass-card p-4 rounded-xl border hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Student & Badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={insight.studentAvatar}
                      alt={insight.studentName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <span className="text-sm font-bold text-white block">{insight.studentName}</span>
                      <span className="text-[11px] text-slate-400">{insight.date}</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                {/* Insight Title & Description */}
                <h3 className="text-sm font-semibold text-slate-200 mb-1.5">{insight.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{insight.description}</p>

                {/* Action Required Box */}
                {insight.actionRequired && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 mb-3 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-purple-300 block mb-0.5">Sugestão de Ação:</span>
                      {insight.actionRequired}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectStudent(insight.studentId)}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  Ver Ficha do Aluno
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`https://wa.me/5511999999999?text=Olá%20${encodeURIComponent(insight.studentName)},%20tudo%20bem?%20Notei%20seu%20desempenho...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-900/80 transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Contato Direto
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
