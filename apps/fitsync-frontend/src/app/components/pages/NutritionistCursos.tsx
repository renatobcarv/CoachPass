import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Play,
  Clock,
  Star,
  Users,
  Search,
  Filter,
  CheckCircle,
  Lock,
  Flame,
  Award,
  ChevronRight,
  BarChart3,
  Utensils,
  Activity,
  Heart,
  Baby,
  Dumbbell,
  Brain,
} from 'lucide-react';
import { motion } from 'motion/react';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
  progress?: number;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  new?: boolean;
  featured?: boolean;
  tags: string[];
}

const courses: Course[] = [
  {
    id: 'c1', title: 'Nutrição Clínica Funcional Avançada',
    instructor: 'Dr. Carlos Mendes', category: 'clinica', duration: '32h', lessons: 48,
    rating: 4.9, students: 2840, icon: Heart, color: '#ef4444', gradient: 'from-red-500 to-rose-600',
    progress: 65, level: 'Avançado', featured: true, tags: ['Funcional', 'Clínica'],
  },
  {
    id: 'c2', title: 'Avaliação Nutricional Completa',
    instructor: 'Dra. Ana Ribeiro', category: 'avaliacao', duration: '18h', lessons: 24,
    rating: 4.8, students: 1920, icon: BarChart3, color: '#10b981', gradient: 'from-emerald-500 to-teal-600',
    progress: 100, level: 'Intermediário', tags: ['Avaliação', 'Composição Corporal'],
  },
  {
    id: 'c3', title: 'Nutrição Esportiva e Performance',
    instructor: 'Dr. Felipe Santos', category: 'esportiva', duration: '24h', lessons: 36,
    rating: 4.7, students: 3210, icon: Dumbbell, color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600',
    level: 'Intermediário', new: true, tags: ['Esportiva', 'Suplementação'],
  },
  {
    id: 'c4', title: 'Nutrição Materno-Infantil',
    instructor: 'Dra. Juliana Costa', category: 'materno', duration: '20h', lessons: 30,
    rating: 4.9, students: 1540, icon: Baby, color: '#f59e0b', gradient: 'from-amber-500 to-orange-500',
    progress: 30, level: 'Intermediário', tags: ['Gestante', 'Pediatria'],
  },
  {
    id: 'c5', title: 'Diabetes e Síndrome Metabólica',
    instructor: 'Dr. Pedro Lima', category: 'clinica', duration: '28h', lessons: 40,
    rating: 4.8, students: 2180, icon: Activity, color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600',
    level: 'Avançado', tags: ['Diabetes', 'Metabólica'],
  },
  {
    id: 'c6', title: 'Comportamento Alimentar e Mindful Eating',
    instructor: 'Dra. Marina Alves', category: 'comportamento', duration: '16h', lessons: 20,
    rating: 4.6, students: 987, icon: Brain, color: '#06b6d4', gradient: 'from-cyan-500 to-sky-600',
    level: 'Iniciante', new: true, tags: ['Comportamento', 'Mindful'],
  },
  {
    id: 'c7', title: 'Dietas Terapêuticas e Restritivas',
    instructor: 'Dr. Ricardo Neves', category: 'terapeutica', duration: '22h', lessons: 32,
    rating: 4.7, students: 1380, icon: Utensils, color: '#ec4899', gradient: 'from-pink-500 to-rose-500',
    level: 'Avançado', tags: ['Low Carb', 'Cetogênica', 'Vegana'],
  },
  {
    id: 'c8', title: 'Suplementação Baseada em Evidências',
    instructor: 'Dr. André Campos', category: 'suplementacao', duration: '14h', lessons: 18,
    rating: 4.5, students: 2670, icon: Flame, color: '#f97316', gradient: 'from-orange-500 to-red-500',
    level: 'Intermediário', tags: ['Suplementos', 'Evidências'],
  },
];

const categories = [
  { id: 'all', label: 'Todos os Cursos' },
  { id: 'clinica', label: 'Nutrição Clínica' },
  { id: 'esportiva', label: 'Esportiva' },
  { id: 'materno', label: 'Materno-Infantil' },
  { id: 'avaliacao', label: 'Avaliação' },
  { id: 'comportamento', label: 'Comportamento' },
  { id: 'suplementacao', label: 'Suplementação' },
];

export function NutritionistCursos() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'inprogress' | 'completed'>('all');

  const filtered = courses.filter((c) => {
    const matchCat = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'inprogress' && c.progress !== undefined && c.progress > 0 && c.progress < 100) ||
      (activeTab === 'completed' && c.progress === 100);
    return matchCat && matchSearch && matchTab;
  });

  const completed = courses.filter(c => c.progress === 100).length;
  const inProgress = courses.filter(c => c.progress !== undefined && c.progress > 0 && c.progress < 100).length;
  const totalHours = courses.reduce((s, c) => s + parseInt(c.duration), 0);

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <button
        onClick={() => navigate('/nutritionist')}
        className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Área de Estudos</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Mais de 50 cursos completos das maiores referências da Nutrição
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Cursos Disponíveis', value: courses.length, icon: BookOpen, color: '#3b82f6' },
          { label: 'Em Andamento', value: inProgress, icon: Play, color: '#f59e0b' },
          { label: 'Concluídos', value: completed, icon: CheckCircle, color: '#10b981' },
          { label: 'Horas de Conteúdo', value: `+${totalHours}h`, icon: Clock, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="dark:text-white text-slate-900 text-2xl mb-1" style={{ fontWeight: 800 }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Featured Course */}
      {courses.find(c => c.featured) && (
        <div
          className="relative rounded-3xl p-8 mb-8 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626,#b91c1c)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-yellow-300" />
                <span className="text-xs text-yellow-300" style={{ fontWeight: 700 }}>DESTAQUE</span>
              </div>
              <h2 className="text-xl text-white mb-2" style={{ fontWeight: 700 }}>
                {courses.find(c => c.featured)?.title}
              </h2>
              <p className="text-sm text-white/70 mb-4">
                {courses.find(c => c.featured)?.instructor} · {courses.find(c => c.featured)?.lessons} aulas · {courses.find(c => c.featured)?.duration}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-300" fill={s <= 4 ? 'currentColor' : 'none'} />)}
                  <span className="text-xs text-white/80 ml-1">4.9</span>
                </div>
                <span className="text-xs text-white/60">{courses.find(c => c.featured)?.students.toLocaleString()} alunos</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Progresso</span>
                  <span className="text-yellow-300" style={{ fontWeight: 700 }}>65%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden w-48">
                  <div className="h-full rounded-full bg-yellow-300" style={{ width: '65%' }} />
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-700 text-sm hover:bg-white/90 transition-all" style={{ fontWeight: 600 }}>
                <Play className="w-4 h-4" fill="currentColor" />
                Continuar Assistindo
              </button>
            </div>
            <div className="w-32 h-32 rounded-2xl bg-white/10 flex items-center justify-center">
              <Heart className="w-16 h-16 text-white/60" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 inline-flex dark:border-zinc-800 border border-slate-200">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'inprogress', label: 'Em Andamento' },
            { id: 'completed', label: 'Concluídos' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs transition-all ${activeTab === id ? 'text-white' : 'dark:text-zinc-400 text-slate-600'}`}
              style={activeTab === id ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'
              }`}
              style={activeCategory === cat.id ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((course) => {
          const Icon = course.icon;
          return (
            <motion.div
              key={course.id}
              layout
              whileHover={{ y: -2 }}
              className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden hover:dark:border-zinc-600 hover:border-slate-300 transition-all cursor-pointer"
            >
              {/* Thumbnail */}
              <div className={`relative h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white" />
                </div>
                <Icon className="w-10 h-10 text-white relative z-10" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {course.new && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900" style={{ fontWeight: 700 }}>NOVO</span>
                  )}
                </div>
                {course.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div className="h-full bg-white/80" style={{ width: `${course.progress}%` }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500">
                    {course.level}
                  </span>
                  {course.progress === 100 && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>

                <h4 className="text-sm dark:text-white text-slate-900 leading-snug mb-1" style={{ fontWeight: 600 }}>
                  {course.title}
                </h4>
                <p className="text-xs dark:text-zinc-500 text-slate-400 mb-3">{course.instructor}</p>

                <div className="flex items-center justify-between text-xs dark:text-zinc-500 text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {course.lessons} aulas</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                    <span className="text-xs dark:text-zinc-300 text-slate-600" style={{ fontWeight: 600 }}>{course.rating}</span>
                    <span className="text-xs dark:text-zinc-600 text-slate-400">({course.students.toLocaleString()})</span>
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl text-white transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg,${course.color},${course.color}cc)`, fontWeight: 600 }}
                  >
                    {course.progress === 100 ? 'Rever' : course.progress ? 'Continuar' : 'Iniciar'}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {course.progress !== undefined && course.progress < 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="dark:text-zinc-500 text-slate-400">Progresso</span>
                      <span style={{ color: course.color, fontWeight: 600 }}>{course.progress}%</span>
                    </div>
                    <div className="h-1.5 dark:bg-zinc-800 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 dark:text-zinc-600 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum curso encontrado</p>
        </div>
      )}
    </div>
  );
}
