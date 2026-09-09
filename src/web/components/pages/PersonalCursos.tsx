import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Play, Star, Clock, ChevronRight, Search, Lock, CheckCircle, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const categories = ['Todos', 'Musculação', 'Funcional', 'HIIT', 'Nutrição', 'Avaliação', 'Negócios'];

const courses = [
  { id: '1', title: 'Periodização Avançada para Hipertrofia', instructor: 'Prof. Bruno Moreira', category: 'Musculação', rating: 4.9, students: 2841, duration: '8h 30min', modules: 12, progress: 65, locked: false, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', badge: 'Top Rated' },
  { id: '2', title: 'Treinamento Funcional Completo', instructor: 'Prof. Carla Nunes', category: 'Funcional', rating: 4.8, students: 1920, duration: '6h 15min', modules: 9, progress: 100, locked: false, image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80', badge: 'Concluído' },
  { id: '3', title: 'HIIT Científico: Protocolos e Programação', instructor: 'Prof. Rafael Costa', category: 'HIIT', rating: 4.7, students: 3200, duration: '5h 00min', modules: 8, progress: 0, locked: false, image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=400&q=80', badge: 'Novo' },
  { id: '4', title: 'Avaliação Física e Composição Corporal', instructor: 'Prof. Ana Lima', category: 'Avaliação', rating: 4.9, students: 1540, duration: '7h 45min', modules: 11, progress: 30, locked: false, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', badge: '' },
  { id: '5', title: 'Personal Trainer Empreendedor', instructor: 'Prof. Diego Santos', category: 'Negócios', rating: 4.6, students: 2100, duration: '4h 30min', modules: 7, progress: 0, locked: true, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', badge: 'Pro' },
  { id: '6', title: 'Nutrição Básica para Personal Trainers', instructor: 'Dr. Paulo Mendes', category: 'Nutrição', rating: 4.8, students: 3800, duration: '6h 00min', modules: 10, progress: 0, locked: true, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', badge: 'Pro' },
];

export function PersonalCursos() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c => {
    const matchCat = selectedCat === 'Todos' || c.category === selectedCat;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const completed = courses.filter(c => c.progress === 100).length;
  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div>
          <h1 className="dark:text-white text-slate-900 mb-1">Cursos e Capacitação</h1>
          <p className="text-sm dark:text-zinc-400 text-slate-500">Aprimore suas habilidades com os melhores professores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Disponíveis', value: courses.length, color: '#06b6d4' },
          { label: 'Em Progresso', value: inProgress, color: '#3b82f6' },
          { label: 'Concluídos', value: completed, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
            <p className="text-2xl mb-0.5" style={{ fontWeight: 800, color }}>{value}</p>
            <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar curso..."
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 w-56" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs border transition-all ${selectedCat === cat ? 'text-white border-transparent' : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-zinc-500'}`}
              style={selectedCat === cat ? { background: 'linear-gradient(135deg,#06b6d4,#0891b2)', fontWeight: 600 } : {}}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(course => (
          <motion.div key={course.id} whileHover={{ y: -3 }}
            className={`dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden transition-all ${course.locked ? 'opacity-75' : 'cursor-pointer'}`}
            onClick={() => !course.locked && toast.success(`Abrindo: ${course.title}`)}>

            <div className="relative h-40 overflow-hidden">
              <img src={course.image} className="w-full h-full object-cover" alt={course.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {course.badge && (
                <div className="absolute top-3 left-3">
                  <span className={`text-xs px-2 py-0.5 rounded-lg text-white ${course.badge === 'Concluído' ? 'bg-emerald-500' : course.badge === 'Pro' ? 'bg-violet-600' : course.badge === 'Novo' ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ fontWeight: 700 }}>
                    {course.badge}
                  </span>
                </div>
              )}
              {course.locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
              {course.progress > 0 && course.progress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-blue-400 transition-all" style={{ width: `${course.progress}%` }} />
                </div>
              )}
              {course.progress === 100 && (
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400" style={{ fontWeight: 600 }}>{course.category}</span>
              </div>
              <h4 className="text-sm dark:text-white text-slate-900 mb-1 leading-tight" style={{ fontWeight: 700 }}>{course.title}</h4>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mb-3">{course.instructor}</p>

              <div className="flex items-center gap-3 text-xs dark:text-zinc-500 text-slate-400 mb-3">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{course.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                <span>{course.modules} módulos</span>
              </div>

              {course.progress > 0 && course.progress < 100 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="dark:text-zinc-500 text-slate-400">Progresso</span>
                    <span className="text-blue-400" style={{ fontWeight: 600 }}>{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              )}

              <button onClick={(e) => { e.stopPropagation(); !course.locked ? toast.success(`Continuando: ${course.title}`) : toast.error('Faça upgrade para acessar este curso'); }}
                className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${course.locked ? 'border dark:border-violet-500/30 dark:text-violet-400 dark:bg-violet-500/5 border-violet-200 text-violet-600' : course.progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border dark:border-emerald-500/20' : 'text-white'}`}
                style={(!course.locked && course.progress !== 100) ? { background: 'linear-gradient(135deg,#06b6d4,#0891b2)', fontWeight: 600 } : { fontWeight: 600 }}>
                {course.locked ? <><Lock className="w-3.5 h-3.5" /> Plano Pro</> : course.progress === 100 ? <><Award className="w-3.5 h-3.5" /> Revisar</> : course.progress > 0 ? <><Play className="w-3.5 h-3.5" /> Continuar ({course.progress}%)</> : <><Play className="w-3.5 h-3.5" /> Começar</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
