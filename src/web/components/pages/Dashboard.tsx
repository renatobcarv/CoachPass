import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Apple, CheckCircle2, Circle, Droplets, Dumbbell, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ExerciseModal } from '../ExerciseModal';
import { getExerciseDetail, ExerciseDetail } from '../../data/exerciseData';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  muscle: string;
  rest: string;
  completed: boolean;
}

const todayExercises: Exercise[] = [
  { id: '1', name: 'Supino Reto com Barra', sets: 4, reps: '8-10', weight: '80kg', muscle: 'Peito', rest: '90s', completed: true },
  { id: '2', name: 'Crucifixo com Halteres', sets: 3, reps: '12-15', weight: '18kg', muscle: 'Peito', rest: '60s', completed: true },
  { id: '3', name: 'Desenvolvimento Militar', sets: 4, reps: '8-10', weight: '50kg', muscle: 'Ombro', rest: '90s', completed: false },
  { id: '4', name: 'Elevação Lateral', sets: 3, reps: '15-20', weight: '10kg', muscle: 'Ombro', rest: '60s', completed: false },
  { id: '5', name: 'Tríceps Pulley', sets: 4, reps: '10-12', weight: '30kg', muscle: 'Tríceps', rest: '60s', completed: false },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercises, setExercises] = useState(todayExercises);
  const [cups, setCups] = useState(5);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);
  const done = exercises.filter((item) => item.completed).length;
  const firstName = user?.name?.split(' ')[0] || 'Aluno';

  const toggle = (id: string) => {
    setExercises((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">Olá, {firstName}</h1>
        <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">Treino de hoje, refeição e água.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Treinos', icon: Dumbbell, to: '/app/treinos' },
          { label: 'Dieta', icon: Apple, to: '/app/dieta' },
          { label: 'Evolução', icon: TrendingUp, to: '/app/evolucao' },
        ].map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex items-center gap-3 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white px-4 py-3 text-left hover:border-emerald-500/40"
          >
            <Icon className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium dark:text-white text-slate-900">{label}</span>
          </button>
        ))}
      </div>

      <section className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold dark:text-white text-slate-900">Treino de hoje</h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500">{done} de {exercises.length} feitos</p>
          </div>
          <button onClick={() => navigate('/app/treinos')} className="text-sm text-emerald-500">
            Ver tudo
          </button>
        </div>
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="flex items-center gap-3">
              <button onClick={() => toggle(exercise.id)} className="shrink-0" aria-label="Marcar exercício">
                {exercise.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 dark:text-zinc-600 text-slate-300" />
                )}
              </button>
              <button
                onClick={() => {
                  const detail = getExerciseDetail(exercise.name);
                  if (detail) setSelectedExercise(detail);
                }}
                className="flex-1 text-left"
              >
                <p className={`text-sm font-medium ${exercise.completed ? 'line-through dark:text-zinc-500 text-slate-400' : 'dark:text-white text-slate-900'}`}>
                  {exercise.name}
                </p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">
                  {exercise.sets}×{exercise.reps} · {exercise.weight}
                </p>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold dark:text-white text-slate-900">Dieta de hoje</h2>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">1.420 / 2.200 kcal</p>
            <p className="text-sm dark:text-zinc-300 text-slate-700 mt-2">Próxima refeição: Almoço</p>
          </div>
          <button onClick={() => navigate('/app/dieta')} className="text-sm text-emerald-500">
            Abrir plano
          </button>
        </div>
      </section>

      <section className="rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-zinc-900 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="font-semibold dark:text-white text-slate-900">Água</h2>
              <p className="text-sm dark:text-zinc-400 text-slate-500">{(cups * 0.3).toFixed(1).replace('.', ',')} L de 3 L</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCups((value) => Math.max(0, value - 1))}
              className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100"
            >
              −
            </button>
            <span className="text-sm font-semibold w-6 text-center dark:text-white">{cups}</span>
            <button
              onClick={() => setCups((value) => Math.min(10, value + 1))}
              className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {selectedExercise && (
        <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </div>
  );
}
