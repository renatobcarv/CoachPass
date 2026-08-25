'use client';

import React, { useState } from 'react';
import { Student } from '@/types/coachpass';
import { User, Activity, AlertCircle, Dumbbell, Calendar, ChevronRight, Plus } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenAddWorkoutForStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  onOpenAddWorkoutForStudent,
  onOpenAddStudent,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'active'>('all');

  const filteredStudents = students.filter((std) => {
    if (filterStatus === 'warning') return std.status === 'warning';
    if (filterStatus === 'active') return std.status === 'active';
    return true;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Carteira de Alunos ({students.length})
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento em tempo real de frequência, adesão e cargas
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              filterStatus === 'warning'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Em Alerta ({students.filter((s) => s.status === 'warning').length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'active'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alta Adesão
          </button>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const isWarning = student.status === 'warning';
          return (
            <div
              key={student.id}
              className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isWarning
                  ? 'border-amber-500/30 bg-slate-900/60 hover:border-amber-500/60'
                  : 'border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onSelectStudent(student)}>
                        {student.name}
                      </h3>
                      <span className="text-xs text-emerald-400/90 font-medium block mt-0.5">
                        {student.goal}
                      </span>
                    </div>
                  </div>

                  {isWarning ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      Alerta
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shrink-0">
                      Ativo
                    </span>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Adesão Mensal</span>
                    <span className={`font-black text-sm ${isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {student.adherencePercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Frequência Semanal</span>
                    <span className="font-bold text-slate-200 text-sm">
                      {student.frequencyPerWeek}x <span className="text-slate-500 text-xs">/ {student.expectedFrequencyPerWeek}x meta</span>
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block text-[11px]">Peso Atual</span>
                    <span className="font-semibold text-slate-300">{student.currentWeightKg} kg</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block text-[11px]">Treinos no Mês</span>
                    <span className="font-semibold text-slate-300">{student.workoutsCompletedThisMonth} sessões</span>
                  </div>
                </div>

                {/* Progress Bar for Adherence */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Nível de Frequência</span>
                    <span>{student.frequencyPerWeek} de {student.expectedFrequencyPerWeek} dias</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isWarning
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                      }`}
                      style={{ width: `${(student.frequencyPerWeek / student.expectedFrequencyPerWeek) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onSelectStudent(student)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Ver Histórico
                </button>
                <button
                  onClick={() => onOpenAddWorkoutForStudent(student)}
                  className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  title="Registrar treino para este aluno"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  + Treino
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">Nenhum aluno encontrado com este filtro.</p>
          <button
            onClick={onOpenAddStudent}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Cadastrar Novo Aluno
          </button>
        </div>
      )}

    </div>
  );
};
