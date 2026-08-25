'use client';

import React, { useState } from 'react';
import { Student } from '@/types/coachpass';
import { X, Dumbbell, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  preselectedStudentId?: string;
  onSaveWorkout: (studentId: string, workoutData: any) => void;
}

export const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({
  isOpen,
  onClose,
  students,
  preselectedStudentId,
  onSaveWorkout,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || students[0]?.id || '');
  const [workoutTitle, setWorkoutTitle] = useState('Treino A - Peitoral & Tríceps');
  const [duration, setDuration] = useState(50);
  const [rpe, setRpe] = useState(8);

  const [exercises, setExercises] = useState([
    { id: '1', name: 'Supino Reto c/ Barra', muscleGroup: 'Peitoral', sets: 4, reps: 10, weightKg: 85 },
    { id: '2', name: 'Tríceps Teste c/ Barra H', muscleGroup: 'Tríceps', sets: 3, reps: 12, weightKg: 32 },
  ]);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: 'Agachamento Livre', muscleGroup: 'Pernas', sets: 4, reps: 8, weightKg: 90 },
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWorkout(selectedStudentId, {
      title: workoutTitle,
      date: new Date().toLocaleDateString('pt-BR'),
      durationMinutes: duration,
      rpe,
      exercises,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Registrar Novo Treino</h2>
              <p className="text-xs text-slate-400">Catálogo de cargas, séries, repetições e RPE</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Select Student */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Selecione o Aluno
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-900 text-sm text-slate-200 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} — {std.goal}
                </option>
              ))}
            </select>
          </div>

          {/* Workout Title & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nome da Ficha / Treino
              </label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="w-full bg-slate-900 text-sm text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="Ex: Treino A - Peito e Tríceps"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Percepção Esforço (RPE 1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full bg-slate-900 text-sm text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Exercises List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Exercícios & Cargas Registradas
              </label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Exercício
              </button>
            </div>

            <div className="space-y-2">
              {exercises.map((ex, index) => (
                <div key={ex.id} className="grid grid-cols-12 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[index].name = e.target.value;
                        setExercises(updated);
                      }}
                      className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800"
                      placeholder="Nome do exercício"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[index].sets = Number(e.target.value);
                        setExercises(updated);
                      }}
                      className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 text-center"
                      placeholder="Séries"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={ex.reps}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[index].reps = Number(e.target.value);
                        setExercises(updated);
                      }}
                      className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 text-center"
                      placeholder="Reps"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      value={ex.weightKg}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[index].weightKg = Number(e.target.value);
                        setExercises(updated);
                      }}
                      className="w-full bg-slate-950 text-xs font-bold text-emerald-400 p-2 rounded-lg border border-slate-800 text-center"
                      placeholder="Carga kg"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-opacity flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Treino
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
