import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Dumbbell,
  Plus,
  X,
  Save,
  Users,
  Calendar,
  Zap,
  Info,
  CheckCircle,
  ChevronRight,
  Search,
  Filter,
  Award,
} from 'lucide-react';
import { ExerciseModal } from '../ExerciseModal';
import { getExerciseDetail, ExerciseDetail } from '../../data/exerciseData';
import { exerciseLibrary, difficultyColors, Exercise } from '../../data/exerciseLibrary';
import { toast } from 'sonner';

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscle: string;
  equipment: string;
  difficulty: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Lucas Silva', email: 'lucas@email.com', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
];

const weekDays = [
  { id: 'seg', label: 'Segunda', short: 'Seg' },
  { id: 'ter', label: 'Terça', short: 'Ter' },
  { id: 'qua', label: 'Quarta', short: 'Qua' },
  { id: 'qui', label: 'Quinta', short: 'Qui' },
  { id: 'sex', label: 'Sexta', short: 'Sex' },
  { id: 'sab', label: 'Sábado', short: 'Sáb' },
  { id: 'dom', label: 'Domingo', short: 'Dom' },
];

const muscleGroups = [
  { name: 'Peito', color: '#10b981' },
  { name: 'Costas', color: '#3b82f6' },
  { name: 'Ombro', color: '#8b5cf6' },
  { name: 'Bíceps', color: '#ec4899' },
  { name: 'Tríceps', color: '#f59e0b' },
  { name: 'Pernas', color: '#eab308' },
  { name: 'Abdômen', color: '#06b6d4' },
];

export function CreateWorkout() {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseDetail | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState('Peito');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: exercise.name,
      sets: 3,
      reps: '8-12',
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleRemoveExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const handleViewExercise = (name: string) => {
    const detail = getExerciseDetail(name);
    if (detail) setSelectedExerciseDetail(detail);
  };

  const handleSaveWorkout = () => {
    if (!workoutName || !selectedDay || !selectedStudent || selectedExercises.length === 0) {
      toast.error('Preencha todos os campos e adicione ao menos um exercício');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Treino salvo e enviado para o aluno com sucesso!');
      navigate('/personal');
    }, 1500);
  };

  const studentData = mockStudents.find((s) => s.id === selectedStudent);

  // Filtrar exercícios
  const filteredExercises = (exerciseLibrary[selectedMuscle] || []).filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Agrupar por dificuldade
  const groupedByDifficulty = {
    Iniciante: filteredExercises.filter((ex) => ex.difficulty === 'Iniciante'),
    Intermediário: filteredExercises.filter((ex) => ex.difficulty === 'Intermediário'),
    Avançado: filteredExercises.filter((ex) => ex.difficulty === 'Avançado'),
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="dark:text-white text-slate-900 mb-2">Criar Novo Treino</h1>
        <p className="text-sm dark:text-zinc-400 text-slate-500">
          Monte um treino personalizado com vasta biblioteca de exercícios
        </p>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr,320px] gap-6">
        {/* Left Sidebar - Muscle Groups */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>
              Informações Básicas
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Nome do Treino</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Ex: Push A"
                  className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Aluno</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">Selecione...</option>
                  {mockStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Dia da Semana</label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={`p-2 rounded-lg text-xs transition-all ${
                        selectedDay === day.id
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 hover:bg-slate-200'
                      }`}
                      style={{ fontWeight: selectedDay === day.id ? 600 : 400 }}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Muscle Group Selector */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>
              Grupos Musculares
            </h3>
            <div className="space-y-2">
              {muscleGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setSelectedMuscle(group.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selectedMuscle === group.name
                      ? 'shadow-lg'
                      : 'dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border border-slate-200 hover:dark:border-zinc-600 hover:border-slate-300'
                  }`}
                  style={
                    selectedMuscle === group.name
                      ? { background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)`, color: 'white' }
                      : {}
                  }
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedMuscle === group.name ? 'white' : group.color }}
                  />
                  <span className={selectedMuscle === group.name ? 'text-white' : 'dark:text-zinc-300 text-slate-700'} style={{ fontWeight: selectedMuscle === group.name ? 600 : 400 }}>
                    {group.name}
                  </span>
                  <span className={`ml-auto text-xs ${selectedMuscle === group.name ? 'text-white/80' : 'dark:text-zinc-500 text-slate-400'}`}>
                    {exerciseLibrary[group.name]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Exercise Library */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar exercício ou equipamento..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="all">Todas Dificuldades</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm dark:text-zinc-400 text-slate-500">
                {filteredExercises.length} exercício{filteredExercises.length !== 1 ? 's' : ''} em <span className="text-emerald-500" style={{ fontWeight: 600 }}>{selectedMuscle}</span>
              </p>
            </div>
          </div>

          {/* Exercise List by Difficulty */}
          <div className="space-y-4">
            {Object.entries(groupedByDifficulty).map(([difficulty, exercises]) => {
              if (exercises.length === 0) return null;
              const colors = difficultyColors[difficulty as keyof typeof difficultyColors];
              
              return (
                <div key={difficulty} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className={`w-4 h-4 ${colors.text}`} />
                    <h3 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                      {difficulty}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} ml-auto`}>
                      {exercises.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exercises.map((exercise) => (
                      <motion.div
                        key={exercise.name}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-start gap-3 p-3 rounded-2xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200 hover:dark:border-emerald-500/50 hover:border-emerald-400/50 transition-all cursor-pointer group"
                        onClick={() => handleAddExercise(exercise)}
                      >
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <Dumbbell className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-white text-slate-900 mb-1 truncate" style={{ fontWeight: 600 }}>
                            {exercise.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs dark:text-zinc-500 text-slate-400">
                            <span className="truncate">{exercise.equipment}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewExercise(exercise.name);
                            }}
                            className="w-7 h-7 rounded-lg dark:bg-zinc-700 bg-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Info className="w-3 h-3 dark:text-zinc-400 text-slate-500" />
                          </button>
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredExercises.length === 0 && (
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-12 dark:border-zinc-800 border border-slate-200 text-center">
              <Search className="w-12 h-12 dark:text-zinc-700 text-slate-300 mx-auto mb-3" />
              <p className="dark:text-zinc-400 text-slate-500">
                Nenhum exercício encontrado para "{searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Selected Exercises */}
        <div className="space-y-6">
          {/* Student Preview */}
          {studentData && (
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider mb-3">
                Aluno Selecionado
              </p>
              <div className="flex items-center gap-3">
                <img src={studentData.avatar} alt={studentData.name} className="w-12 h-12 rounded-xl" />
                <div>
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                    {studentData.name}
                  </p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{studentData.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Exercises */}
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
                Exercícios
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-lg dark:bg-emerald-500/10 bg-emerald-50 text-emerald-500 border dark:border-emerald-500/20 border-emerald-200" style={{ fontWeight: 600 }}>
                {selectedExercises.length}
              </span>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 dark:text-zinc-700 text-slate-300 mx-auto mb-3" />
                <p className="text-sm dark:text-zinc-500 text-slate-400">
                  Nenhum exercício adicionado
                </p>
                <p className="text-xs dark:text-zinc-600 text-slate-400 mt-1">
                  Clique nos exercícios ao lado
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {selectedExercises.map((exercise, index) => {
                  const colors = difficultyColors[exercise.difficulty as keyof typeof difficultyColors];
                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 p-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200 group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs dark:text-white text-slate-900 truncate mb-1" style={{ fontWeight: 500 }}>
                          {exercise.name}
                        </p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400 truncate mb-1">
                          {exercise.equipment}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} border ${colors.border} inline-block`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="w-6 h-6 rounded-lg dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 hover:dark:bg-red-500/20 hover:bg-red-100 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 mt-4 pt-4 border-t dark:border-zinc-800 border-slate-200">
              <button
                onClick={handleSaveWorkout}
                disabled={saving || !workoutName || !selectedDay || !selectedStudent || selectedExercises.length === 0}
                className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600 }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Treino
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/personal')}
                className="w-full py-2.5 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExerciseDetail && (
        <ExerciseModal
          exercise={selectedExerciseDetail}
          onClose={() => setSelectedExerciseDetail(null)}
        />
      )}
    </div>
  );
}