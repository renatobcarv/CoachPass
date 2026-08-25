'use client';

import React from 'react';
import { Student } from '@/types/coachpass';
import { X, Dumbbell, Calendar, Flame, Weight, Target, Phone, Mail, Sparkles, TrendingUp } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onOpenAddWorkout: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onOpenAddWorkout,
}) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-3xl w-full rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden my-8 animate-pulse-subtle">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-slate-700/80 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{student.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  {student.status === 'warning' ? 'Em Alerta' : 'Ativo'}
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <Target className="w-4 h-4" />
                Objetivo: {student.goal}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{student.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{student.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-xs block mb-1 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Adesão Geral
              </span>
              <span className="text-xl font-extrabold text-emerald-400">{student.adherencePercentage}%</span>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-xs block mb-1 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Frequência
              </span>
              <span className="text-xl font-extrabold text-slate-200">
                {student.frequencyPerWeek}x <span className="text-xs font-normal text-slate-500">/sem</span>
              </span>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-xs block mb-1 flex items-center justify-center gap-1">
                <Weight className="w-3.5 h-3.5 text-purple-400" />
                Peso Atual
              </span>
              <span className="text-xl font-extrabold text-slate-200">{student.currentWeightKg} kg</span>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 text-xs block mb-1 flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Meta de Peso
              </span>
              <span className="text-xl font-extrabold text-emerald-400">{student.targetWeightKg} kg</span>
            </div>
          </div>

          {/* AI Diagnostic Banner */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-purple-200">Diagnóstico Inteligente do Aluno</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {student.status === 'warning'
                  ? 'A IA detectou uma redução na assiduidade nas últimas 2 semanas. Recomendado alinhamento de rotina e ajuste no volume de treino.'
                  : 'Desempenho constante e excelente adesão ao plano. Cargas em progressão contínua sem sinais de fadiga excessiva.'}
              </p>
            </div>
          </div>

          {/* Workout History & Log Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                Histórico de Treinos e Cargas Catalogadas
              </h3>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddWorkout(student);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1"
              >
                + Registrar Treino
              </button>
            </div>

            <div className="space-y-4">
              {student.recentWorkouts.map((workout) => (
                <div key={workout.id} className="glass-card p-4 rounded-2xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{workout.title}</h4>
                      <span className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Data: {workout.date}</span>
                        <span>•</span>
                        <span>Duração: {workout.durationMinutes} min</span>
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Percepção Esforço (RPE): {workout.rpe}/10
                    </span>
                  </div>

                  {/* Exercises Table */}
                  <div className="space-y-2">
                    {workout.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{ex.name}</span>
                          <span className="text-slate-400">{ex.muscleGroup}</span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Séries x Reps</span>
                            <span className="font-semibold text-slate-200">{ex.sets} x {ex.reps}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Carga Registrada</span>
                            <span className="font-bold text-emerald-400 text-sm flex items-center justify-end gap-1">
                              {ex.weightKg} kg
                              {ex.previousWeightKg && ex.weightKg > ex.previousWeightKg && (
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
