import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Apple,
  ArrowRight,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  Flame,
  Scale,
  TrendingUp,
} from 'lucide-react';
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

const meals = [
  { name: 'Café da manhã', kcal: 420, done: true },
  { name: 'Almoço', kcal: 680, done: false },
  { name: 'Lanche', kcal: 220, done: false },
  { name: 'Jantar', kcal: 580, done: false },
];

function weekdayLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

const card =
  'rounded-2xl border border-[#000326]/10 bg-white p-5 transition duration-300 hover:border-[#000326]/20 dark:border-white/10 dark:bg-[#000346] dark:hover:border-white/20'
const quietCard =
  'rounded-2xl border border-[#000326]/10 bg-white px-4 py-3.5 transition duration-300 hover:border-[#000326]/20 dark:border-white/10 dark:bg-[#000346] dark:hover:border-white/20'

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercises, setExercises] = useState(todayExercises);
  const [cups, setCups] = useState(5);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);

  const done = exercises.filter((item) => item.completed).length;
  const progress = Math.round((done / exercises.length) * 100);
  const firstName = user?.name?.split(' ')[0] || 'Aluno';
  const nextExercise = exercises.find((item) => !item.completed);
  const nextMeal = meals.find((item) => !item.done);
  const caloriesEaten = meals.filter((item) => item.done).reduce((sum, item) => sum + item.kcal, 0);
  const waterLiters = (cups * 0.3).toFixed(1).replace('.', ',');
  const waterPct = Math.min(100, Math.round((cups / 10) * 100));
  const today = useMemo(() => weekdayLabel(), []);

  const toggle = (id: string) => {
    setExercises((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  return (
    <div className="relative p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6a6a7a] dark:text-[#C5C5CE]">
            {today}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#000326] dark:text-white">
            Olá, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
            {nextExercise
              ? `Próximo exercício: ${nextExercise.name}.`
              : 'Treino do dia concluído. Bom trabalho.'}{' '}
            {nextMeal ? `Próxima refeição: ${nextMeal.name}.` : ''}
          </p>
        </div>
        <div className={`flex items-center gap-3 ${quietCard}`}>
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" className="stroke-[#000326]/10 dark:stroke-white/15" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-[#000326] transition-all duration-500 dark:stroke-[#C5C5CE]"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progress * 0.94} 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#000326] dark:text-white">
              {progress}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#000326] dark:text-white">Treino de hoje</p>
            <p className="text-xs text-[#6a6a7a] dark:text-[#C5C5CE]">
              {done} de {exercises.length} feitos
            </p>
          </div>
        </div>
      </div>

      <div className="relative grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Treinos', hint: 'Ver fichas', icon: Dumbbell, to: '/app/treinos' },
          { label: 'Dieta', hint: 'Plano do dia', icon: Apple, to: '/app/dieta' },
          { label: 'Evolução', hint: 'Peso e medidas', icon: TrendingUp, to: '/app/evolucao' },
        ].map(({ label, hint, icon: Icon, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className={`group flex items-center gap-3 text-left ${quietCard} hover:-translate-y-0.5`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#f3f4f9] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#e8e9f0] dark:bg-[#000137] dark:group-hover:bg-[#0a0e42]">
              <Icon className="w-4 h-4 text-[#6a6a7a] transition-colors duration-300 group-hover:text-[#000326] dark:text-[#C5C5CE] dark:group-hover:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#000326] dark:text-white">{label}</p>
              <p className="text-xs text-[#6a6a7a] dark:text-[#C5C5CE]">{hint}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#c5c5ce] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#000326] dark:text-[#C5C5CE]/50 dark:group-hover:text-white" />
          </button>
        ))}
      </div>

      <div className="relative grid lg:grid-cols-5 gap-4">
        <section className={`lg:col-span-3 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#000326] dark:text-white">Treino de hoje · Push A</h2>
              <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE] mt-0.5">
                Toque no nome para ver a execução. Marque conforme fizer.
              </p>
            </div>
            <button
              onClick={() => navigate('/app/treinos')}
              className="group inline-flex items-center gap-1 text-sm font-medium text-[#6a6a7a] transition-colors hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
            >
              Ver tudo
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mb-4 h-1.5 rounded-full bg-[#000326]/10 overflow-hidden dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[#000326] transition-all duration-500 dark:bg-[#C5C5CE]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-1.5">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-200 hover:bg-[#f3f4f9] dark:hover:bg-white/[0.04]"
              >
                <button
                  onClick={() => toggle(exercise.id)}
                  className="shrink-0 transition-transform duration-200 hover:scale-110"
                  aria-label={exercise.completed ? 'Desmarcar exercício' : 'Marcar exercício'}
                >
                  {exercise.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#000326] dark:text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#c5c5ce] dark:text-white/25" />
                  )}
                </button>
                <button
                  onClick={() => {
                    const detail = getExerciseDetail(exercise.name);
                    if (detail) setSelectedExercise(detail);
                  }}
                  className="flex-1 text-left min-w-0"
                >
                  <p
                    className={`text-sm font-medium truncate ${
                      exercise.completed
                        ? 'line-through text-[#8e8e9a] dark:text-[#C5C5CE]/60'
                        : 'text-[#000326] dark:text-white'
                    }`}
                  >
                    {exercise.name}
                  </p>
                  <p className="text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                    {exercise.sets}×{exercise.reps} · {exercise.weight} · {exercise.muscle} · descanso {exercise.rest}
                  </p>
                </button>
                <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wide text-[#8e8e9a] dark:text-[#C5C5CE]/70">
                  {exercise.completed ? 'feito' : 'pendente'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="lg:col-span-2 space-y-4">
          <section className={card}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f3f4f9] flex items-center justify-center dark:bg-[#000137]">
                  <Flame className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#000326] dark:text-white">Dieta de hoje</h2>
                  <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
                    {caloriesEaten.toLocaleString('pt-BR')} / 2.200 kcal
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/app/dieta')}
                className="text-sm font-medium text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
              >
                Abrir
              </button>
            </div>

            <div className="mt-4 h-1.5 rounded-full bg-[#000326]/10 overflow-hidden dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#000326]/70 transition-all duration-500 dark:bg-[#C5C5CE]/80"
                style={{ width: `${Math.min(100, Math.round((caloriesEaten / 2200) * 100))}%` }}
              />
            </div>

            <ul className="mt-4 space-y-2">
              {meals.map((meal) => (
                <li
                  key={meal.name}
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors duration-200 hover:bg-[#f3f4f9] dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    {meal.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#000326] dark:text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#c5c5ce] dark:text-white/25" />
                    )}
                    <span
                      className={`text-sm ${
                        meal.done
                          ? 'text-[#8e8e9a] line-through dark:text-[#C5C5CE]/60'
                          : 'text-[#000326] dark:text-white'
                      }`}
                    >
                      {meal.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">{meal.kcal} kcal</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f3f4f9] flex items-center justify-center dark:bg-[#000137]">
                  <Droplets className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#000326] dark:text-white">Água</h2>
                  <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
                    {waterLiters} L de 3 L
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCups((value) => Math.max(0, value - 1))}
                  className="w-8 h-8 rounded-lg bg-[#f3f4f9] text-[#000326] transition duration-200 hover:bg-[#e8e9f0] active:scale-95 dark:bg-[#000137] dark:text-[#C5C5CE] dark:hover:bg-[#0a0e42]"
                  aria-label="Remover copo"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center text-[#000326] dark:text-white">{cups}</span>
                <button
                  onClick={() => setCups((value) => Math.min(10, value + 1))}
                  className="w-8 h-8 rounded-lg bg-[#f3f4f9] text-[#000326] transition duration-200 hover:bg-[#e8e9f0] active:scale-95 dark:bg-[#000137] dark:text-[#C5C5CE] dark:hover:bg-[#0a0e42]"
                  aria-label="Adicionar copo"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: 10 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCups(index + 1)}
                  aria-label={`Marcar ${index + 1} copos`}
                  className={`h-8 flex-1 rounded-md transition-all duration-200 ${
                    index < cups
                      ? 'bg-[#000326] hover:bg-[#000137] dark:bg-[#C5C5CE] dark:hover:bg-white'
                      : 'bg-[#f3f4f9] hover:bg-[#e8e9f0] dark:bg-[#000137] dark:hover:bg-[#0a0e42]'
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-[#8e8e9a] dark:text-[#C5C5CE]/70">{waterPct}% da meta diária</p>
          </section>

          <section className={card}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f3f4f9] flex items-center justify-center dark:bg-[#000137]">
                <Scale className="w-5 h-5 text-[#000326] dark:text-[#C5C5CE]" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-[#000326] dark:text-white">Peso da semana</h2>
                <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">78,4 kg · −0,3 kg vs. semana passada</p>
              </div>
              <button
                onClick={() => navigate('/app/evolucao')}
                className="text-sm font-medium text-[#6a6a7a] hover:text-[#000326] dark:text-[#C5C5CE] dark:hover:text-white"
              >
                Ver
              </button>
            </div>
          </section>
        </div>
      </div>

      {selectedExercise && (
        <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </div>
  );
}
