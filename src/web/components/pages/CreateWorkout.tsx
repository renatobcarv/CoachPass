import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowDown, ArrowUp, Check, Circle, Dumbbell, Search, Trash2, Video } from 'lucide-react';
import { getExerciseDetail } from '../../data/exerciseData';
import { exercisePhotos } from '../../data/exercisePhotos';
import { exerciseLibrary, Exercise } from '../../data/exerciseLibrary';
import { toast } from 'sonner';
import { CTAButton } from '../brand/Brand';
import { Badge, Page, PageHeader } from '../student/ui';
import { FieldLabel, MobileActionBar, PersonChip, Segmented, Stepper } from '../pro/ui';
import { useAuth } from '../../context/AuthContext';
import { ExerciseSheet } from '../musclewiki/ExerciseSheet';
import { ExerciseCard } from '../exercise/ExerciseCard';
import { LocalExerciseSheet } from '../exercise/LocalExerciseSheet';
import { bodymapFor } from '../../lib/bodymap';
import {
  MW_DIFFICULTY,
  MW_GROUP_MUSCLES,
  MwError,
  MwExercise,
  mwCategoryPt,
  mwDifficultyPt,
  mwErrorHelp,
  mwList,
  mwMediaToken,
  mwSearch,
  mwVideoSrc,
} from '../../lib/musclewiki';

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  /** id do exercício na MuscleWiki, quando veio de lá (vídeo e passo a passo) */
  mwId?: number;
}

type MwCard = { id: number; name: string; category?: string; difficulty?: string | null; thumb?: string | null };

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

const muscleGroups = ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Abdômen'];

const difficultyTone: Record<string, 'teal' | 'blue' | 'amber'> = {
  Iniciante: 'teal',
  Intermediário: 'blue',
  Avançado: 'amber',
};

const repsOptions = ['6-8', '8-12', '10-12', '12-15', '15-20'];

export function CreateWorkout() {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Exercise | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState('Peito');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const { user } = useAuth();
  const [source, setSource] = useState<'local' | 'mw'>('local');
  const [mwItems, setMwItems] = useState<MwCard[]>([]);
  const [mwLoading, setMwLoading] = useState(false);
  const [mwError, setMwError] = useState<MwError | null>(null);
  const [sheetId, setSheetId] = useState<number | null>(null);
  const [sheetName, setSheetName] = useState<string>('');
  const [mwMedia, setMwMedia] = useState<string | null>(null);

  // Token de mídia só quando há miniaturas para mostrar (cada imagem conta na cota da API)
  useEffect(() => {
    if (source !== 'mw' || mwMedia || !user?.accessToken || !mwItems.some((i) => i.thumb)) return;
    mwMediaToken(user.accessToken).then(setMwMedia).catch(() => undefined);
  }, [source, mwItems, mwMedia, user?.accessToken]);

  // Biblioteca MuscleWiki: busca por texto ou lista por grupo/dificuldade (com pequeno debounce)
  useEffect(() => {
    if (source !== 'mw' || !user?.accessToken) return;
    let cancelled = false;
    const token = user.accessToken;
    const muscles = MW_GROUP_MUSCLES[selectedMuscle];
    const difficulty = difficultyFilter === 'all' ? undefined : MW_DIFFICULTY[difficultyFilter];
    const q = searchTerm.trim();
    const t = window.setTimeout(async () => {
      setMwLoading(true);
      setMwError(null);
      try {
        const items: MwCard[] =
          q.length >= 2
            ? (await mwSearch(token, q, { muscles, difficulty, limit: 18 })).map((e) => ({
                id: e.id,
                name: e.name,
                category: e.category,
                difficulty: e.difficulty,
                thumb: e.videos?.find((v) => v.og_image)?.og_image || null,
              }))
            : (await mwList(token, { muscles, difficulty, limit: 18 })).results;
        if (!cancelled) setMwItems(items);
      } catch (err) {
        if (!cancelled) {
          setMwItems([]);
          setMwError(err instanceof MwError ? err : new MwError('MW_ERROR', 'Falha'));
        }
      } finally {
        if (!cancelled) setMwLoading(false);
      }
    }, q ? 400 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [source, selectedMuscle, difficultyFilter, searchTerm, user?.accessToken]);

  const addFromMw = (ex: MwCard | MwExercise) => {
    const newExercise: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: ex.name,
      sets: 3,
      reps: '8-12',
      muscle: selectedMuscle,
      equipment: mwCategoryPt(ex.category) || 'MuscleWiki',
      difficulty: mwDifficultyPt(ex.difficulty) || 'Intermediário',
      mwId: ex.id,
    };
    setSelectedExercises((prev) => [...prev, newExercise]);
    toast.success('Exercício adicionado', { description: `${ex.name} · com vídeo da MuscleWiki` });
  };

  const openSheet = (id: number, name: string) => {
    setSheetName(name);
    setSheetId(id);
  };

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
    toast.success('Exercício adicionado', { description: exercise.name });
  };

  const handleRemoveExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: string, patch: Partial<WorkoutExercise>) => {
    setSelectedExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };

  const moveExercise = (index: number, dir: -1 | 1) => {
    setSelectedExercises((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
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

  const filteredExercises = (exerciseLibrary[selectedMuscle] || []).filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const addedCount = useMemo(() => {
    const map: Record<string, number> = {};
    selectedExercises.forEach((ex) => (map[ex.name] = (map[ex.name] || 0) + 1));
    return map;
  }, [selectedExercises]);

  const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const estMinutes = Math.round(totalSets * 2.5);
  const checklist = [
    { ok: Boolean(workoutName.trim()), label: 'Nome do treino' },
    { ok: Boolean(selectedStudent), label: 'Aluno' },
    { ok: Boolean(selectedDay), label: 'Dia da semana' },
    { ok: selectedExercises.length > 0, label: 'Ao menos 1 exercício' },
  ];
  const ready = checklist.every((c) => c.ok);
  const studentData = mockStudents.find((s) => s.id === selectedStudent);
  const dayData = weekDays.find((d) => d.id === selectedDay);

  return (
    <Page wide>
      <PageHeader
        kicker="Criar treino"
        title="Monte o treino"
        accent="do seu aluno."
        lead="Escolha aluno e dia, adicione exercícios da biblioteca e ajuste séries e repetições na ficha ao lado."
      />

      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* 1. Informações básicas */}
          <section className="cp-spot relative rounded-[22px] border border-[var(--line)] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="cp-mono w-7 h-7 rounded-lg grid place-items-center text-[12px] cp-selected">1</span>
              <h2 className="cp-display text-[18px] font-bold">Informações básicas</h2>
            </div>
            <FieldLabel htmlFor="workout-name">Nome do treino</FieldLabel>
            <input
              id="workout-name"
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Ex.: Push A — peito e tríceps"
              className="cp-field cp-field-lg !text-[20px] !h-14"
            />
            <div className="mt-5">
              <FieldLabel>Aluno</FieldLabel>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mockStudents.map((s) => (
                  <PersonChip
                    key={s.id}
                    name={s.name}
                    avatar={s.avatar}
                    selected={selectedStudent === s.id}
                    onClick={() => setSelectedStudent(s.id)}
                  />
                ))}
              </div>
            </div>
            <div className="mt-5">
              <FieldLabel>Dia da semana</FieldLabel>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {weekDays.map((day) => {
                  const active = selectedDay === day.id;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDay(day.id)}
                      aria-pressed={active}
                      title={day.label}
                      className={`shrink-0 w-14 h-12 rounded-2xl border cp-display text-[15px] font-semibold transition-[background,border-color,color] ${
                        active
                          ? 'cp-selected border-transparent'
                          : 'border-[var(--line-2)] bg-white/[0.025] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2. Biblioteca */}
          <section className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[var(--line)]">
              <div className="flex items-center gap-3 mb-5">
                <span className="cp-mono w-7 h-7 rounded-lg grid place-items-center text-[12px] cp-selected">2</span>
                <h2 className="cp-display text-[18px] font-bold">Biblioteca de exercícios</h2>
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Segmented
                  layoutId="cw-source"
                  value={source}
                  onChange={setSource}
                  options={[
                    { value: 'local', label: 'CoachPass' },
                    { value: 'mw', label: 'MuscleWiki · vídeos', icon: Video },
                  ]}
                />
                <p className="text-[12.5px] text-[var(--dim)]">
                  {source === 'mw'
                    ? 'Exercícios com vídeo de execução, passo a passo e explicação para você e para o aluno.'
                    : 'Biblioteca própria, organizada por grupo e dificuldade.'}
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {muscleGroups.map((group) => {
                  const active = selectedMuscle === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedMuscle(group)}
                      aria-pressed={active}
                      className={`shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full border text-[13.5px] font-medium transition-[background,border-color,color] ${
                        active
                          ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.16)] text-white'
                          : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {group}
                      {source === 'local' && (
                        <span className={`cp-mono text-[10.5px] ${active ? 'text-[var(--brand-200)]' : 'text-[var(--dim)]'}`}>
                          {exerciseLibrary[group]?.length || 0}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar exercício ou equipamento…"
                    className="cp-field h-11"
                  />
                </div>
                <Segmented
                  size="sm"
                  layoutId="cw-difficulty"
                  value={difficultyFilter}
                  onChange={setDifficultyFilter}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'Iniciante', label: 'Iniciante' },
                    { value: 'Intermediário', label: 'Intermediário' },
                    { value: 'Avançado', label: 'Avançado' },
                  ]}
                />
              </div>
            </div>

            {source === 'mw' ? (
              <div className="p-4 sm:p-5">
                {mwError ? (
                  <div className="rounded-2xl border border-[rgba(255,181,71,0.35)] bg-[rgba(255,181,71,0.07)] p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <AlertCircle className="w-6 h-6 shrink-0 text-[var(--amber)]" />
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--amber)]">MuscleWiki indisponível no momento</p>
                      <p className="mt-1 text-[13.5px] text-[var(--muted)]">{mwErrorHelp[mwError.code]}</p>
                    </div>
                    <button type="button" onClick={() => setSource('local')} className="cp-btn-sm shrink-0">
                      Usar biblioteca CoachPass
                    </button>
                  </div>
                ) : mwLoading ? (
                  <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-[260px] rounded-2xl bg-white/[0.04] animate-pulse" />
                    ))}
                  </div>
                ) : mwItems.length === 0 ? (
                  <div className="py-14 text-center">
                    <Search className="w-8 h-8 mx-auto text-[var(--dim)]" />
                    <p className="mt-3 text-[14px] text-[var(--muted)]">Nenhum exercício encontrado na MuscleWiki.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
                    {mwItems.map((item) => (
                      <ExerciseCard
                        key={item.id}
                        name={item.name}
                        image={(item.thumb && mwVideoSrc(item.thumb, mwMedia)) || bodymapFor(selectedMuscle)}
                        fallbackImage={bodymapFor(selectedMuscle)}
                        photo={Boolean(item.thumb && mwMedia)}
                        imageAlt={`Parte do corpo trabalhada: ${selectedMuscle}`}
                        muscle={selectedMuscle}
                        equipment={item.category ? mwCategoryPt(item.category) : undefined}
                        difficulty={item.difficulty ? mwDifficultyPt(item.difficulty) : undefined}
                        difficultyTone="amber"
                        hasVideo
                        count={addedCount[item.name] || 0}
                        onOpen={() => openSheet(item.id, item.name)}
                        onAdd={() => addFromMw(item)}
                      />
                    ))}
                  </div>
                )}
                <p className="mt-4 px-1 text-[11.5px] text-[var(--dim)]">Conteúdo e vídeos: MuscleWiki.</p>
              </div>
            ) : (
            <div className="p-4 sm:p-5">
              <p className="mb-3 px-1 text-[13px] text-[var(--muted)]">
                {filteredExercises.length} exercício{filteredExercises.length !== 1 ? 's' : ''} em{' '}
                <span className="text-white font-semibold">{selectedMuscle}</span>
              </p>
              {filteredExercises.length === 0 ? (
                <div className="py-14 text-center">
                  <Search className="w-8 h-8 mx-auto text-[var(--dim)]" />
                  <p className="mt-3 text-[14px] text-[var(--muted)]">Nenhum exercício encontrado para “{searchTerm}”.</p>
                </div>
              ) : (
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
                  {filteredExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.name}
                      name={exercise.name}
                      image={bodymapFor(exercise.muscle, selectedMuscle)}
                      photos={exercisePhotos(exercise.name)}
                      imageAlt={`Parte do corpo trabalhada: ${exercise.muscle}`}
                      muscle={exercise.muscle}
                      equipment={exercise.equipment}
                      difficulty={exercise.difficulty}
                      difficultyTone={difficultyTone[exercise.difficulty] || 'neutral'}
                      hasVideo={Boolean(getExerciseDetail(exercise.name)?.videoId)}
                      count={addedCount[exercise.name] || 0}
                      onOpen={() => setPreview(exercise)}
                      onAdd={() => handleAddExercise(exercise)}
                    />
                  ))}
                </div>
              )}
            </div>
            )}
          </section>
        </div>

        {/* 3. Ficha do treino (fixa) */}
        <aside className="xl:sticky xl:top-6 space-y-4">
          <section className="rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
            <span aria-hidden className="cp-modal-bar" />
            <div className="p-5 sm:p-6 border-b border-[var(--line)]">
              <div className="flex items-center gap-3">
                <span className="cp-mono w-7 h-7 rounded-lg grid place-items-center text-[12px] cp-selected">3</span>
                <h2 className="cp-display text-[18px] font-bold">Ficha do treino</h2>
              </div>
              <p className="cp-display mt-4 text-[22px] font-bold leading-tight break-words">
                {workoutName || <span className="text-[var(--dim)]">Treino sem nome</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {studentData && <Badge tone="blue">{studentData.name}</Badge>}
                {dayData && <Badge>{dayData.label}</Badge>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { k: 'Exercícios', v: selectedExercises.length },
                  { k: 'Séries', v: totalSets },
                  { k: 'Duração', v: estMinutes ? `${estMinutes} min` : '—' },
                ].map(({ k, v }) => (
                  <div key={k} className="rounded-xl px-3 py-2.5 border border-[var(--line)]">
                    <p className="cp-display text-[20px] font-bold leading-none">{v}</p>
                    <p className="mt-1 text-[11px] text-[var(--dim)]">{k}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-h-[46vh] overflow-y-auto">
              {selectedExercises.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Dumbbell className="w-8 h-8 mx-auto text-[var(--dim)]" />
                  <p className="mt-3 text-[14px] text-[var(--muted)]">Nenhum exercício adicionado</p>
                  <p className="mt-1 text-[12.5px] text-[var(--dim)]">Toque em + na biblioteca para montar a ficha.</p>
                </div>
              ) : (
                <ol>
                  <AnimatePresence initial={false}>
                    {selectedExercises.map((exercise, index) => (
                      <motion.li
                        key={exercise.id}
                        layout
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        className="group px-5 py-4 border-b border-[var(--line)] last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="cp-mono pt-0.5 w-6 text-[12px] text-[var(--dim)]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold leading-snug">{exercise.name}</p>
                            <p className="mt-0.5 flex items-center gap-2 text-[12px] text-[var(--dim)]">
                              {exercise.equipment}
                              {exercise.mwId && (
                                <button
                                  type="button"
                                  onClick={() => openSheet(exercise.mwId!, exercise.name)}
                                  className="inline-flex items-center gap-1 text-[var(--brand-300)] hover:underline"
                                >
                                  <Video className="w-3 h-3" /> vídeo
                                </button>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              aria-label="Mover para cima"
                              onClick={() => moveExercise(index, -1)}
                              disabled={index === 0}
                              className="w-7 h-7 rounded-full grid place-items-center text-[var(--muted)] hover:text-white disabled:opacity-25"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Mover para baixo"
                              onClick={() => moveExercise(index, 1)}
                              disabled={index === selectedExercises.length - 1}
                              className="w-7 h-7 rounded-full grid place-items-center text-[var(--muted)] hover:text-white disabled:opacity-25"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Remover ${exercise.name}`}
                              onClick={() => handleRemoveExercise(exercise.id)}
                              className="w-7 h-7 rounded-full grid place-items-center text-[var(--muted)] hover:text-[#ff8a95]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 ml-9 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-2">
                            <span className="cp-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--dim)]">Séries</span>
                            <Stepper
                              label="séries"
                              value={exercise.sets}
                              min={1}
                              max={10}
                              onChange={(v) => updateExercise(exercise.id, { sets: v })}
                            />
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="cp-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--dim)]">Reps</span>
                            <select
                              value={exercise.reps}
                              onChange={(e) => updateExercise(exercise.id, { reps: e.target.value })}
                              className="h-8 rounded-full border border-[var(--line-2)] bg-white/[0.03] px-3 text-[13px] text-white focus:outline-none"
                            >
                              {repsOptions.map((r) => (
                                <option key={r} value={r} className="bg-[#10131f]">
                                  {r}
                                </option>
                              ))}
                            </select>
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              )}
            </div>

            <div className="p-5 sm:p-6 border-t border-[var(--line)] space-y-4">
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {checklist.map(({ ok, label }) => (
                  <li key={label} className={`flex items-center gap-2 text-[12.5px] ${ok ? 'text-[var(--cream)]' : 'text-[var(--dim)]'}`}>
                    {ok ? (
                      <Check className="w-3.5 h-3.5 text-[var(--teal)]" strokeWidth={3} />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                    {label}
                  </li>
                ))}
              </ul>
              <CTAButton type="button" block onClick={handleSaveWorkout} disabled={saving || !ready}>
                {saving ? 'Salvando…' : 'Salvar e enviar ao aluno'}
              </CTAButton>
              <button
                type="button"
                onClick={() => navigate('/personal')}
                className="w-full h-10 rounded-full text-[13.5px] text-[var(--muted)] hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </section>
        </aside>
      </div>

      <MobileActionBar>
        <p className="text-[13px] text-[var(--muted)]">
          <span className="text-white font-semibold">{selectedExercises.length}</span> exercícios · {totalSets} séries
        </p>
        <button
          type="button"
          onClick={handleSaveWorkout}
          disabled={saving || !ready}
          className="cp-selected h-10 px-5 rounded-full text-[14px] font-semibold disabled:opacity-40"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </MobileActionBar>

      <LocalExerciseSheet
        exercise={preview}
        addedCount={preview ? addedCount[preview.name] || 0 : 0}
        onClose={() => setPreview(null)}
        onAdd={(ex) => {
          handleAddExercise(ex);
          setPreview(null);
        }}
      />

      <ExerciseSheet
        exerciseId={sheetId}
        initialName={sheetName}
        onClose={() => setSheetId(null)}
        onAdd={(ex) => {
          addFromMw(ex);
          setSheetId(null);
        }}
      />
    </Page>
  );
}
