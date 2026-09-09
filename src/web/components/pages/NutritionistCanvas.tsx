import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Palette,
  Grid3X3,
  Download,
  Share2,
  Eye,
  Star,
  Sparkles,
  Search,
  Filter,
  Image,
  Type,
  Layout,
  Layers,
  ChevronRight,
  Heart,
  BookOpen,
  Apple,
  Activity,
  Utensils,
  Flame,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: string;
  color: string;
  gradient: string;
  icon: React.ElementType;
  tags: string[];
  likes: number;
  premium?: boolean;
}

const templates: Template[] = [
  { id: 't1', name: 'Cardápio Semanal Moderno', category: 'cardapio', color: '#10b981', gradient: 'from-emerald-500 to-teal-600', icon: Utensils, tags: ['Cardápio', 'Semanal'], likes: 342 },
  { id: 't2', name: 'Story – Dica Nutricional', category: 'social', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500', icon: Sparkles, tags: ['Instagram', 'Dica'], likes: 518 },
  { id: 't3', name: 'Post – Prato Saudável', category: 'social', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600', icon: Apple, tags: ['Post', 'Receita'], likes: 229 },
  { id: 't4', name: 'Plano Alimentar PDF', category: 'documento', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600', icon: BookOpen, tags: ['PDF', 'Plano'], likes: 401, premium: true },
  { id: 't5', name: 'Receita Illustrada', category: 'receita', color: '#ec4899', gradient: 'from-pink-500 to-rose-500', icon: Image, tags: ['Receita', 'Arte'], likes: 287 },
  { id: 't6', name: 'Tabela de Macros', category: 'documento', color: '#06b6d4', gradient: 'from-cyan-500 to-sky-600', icon: Grid3X3, tags: ['Tabela', 'Macros'], likes: 195 },
  { id: 't7', name: 'Story – Alimento do Dia', category: 'social', color: '#f97316', gradient: 'from-orange-500 to-red-500', icon: Flame, tags: ['Instagram', 'Alimento'], likes: 633, premium: true },
  { id: 't8', name: 'Guia de Substituições', category: 'documento', color: '#14b8a6', gradient: 'from-teal-500 to-emerald-600', icon: Layers, tags: ['Guia', 'Substituições'], likes: 312 },
  { id: 't9', name: 'Evolução do Paciente', category: 'relatorio', color: '#6366f1', gradient: 'from-indigo-500 to-violet-600', icon: Activity, tags: ['Gráfico', 'Evolução'], likes: 178, premium: true },
  { id: 't10', name: 'Post – Mito vs Verdade', category: 'social', color: '#d946ef', gradient: 'from-fuchsia-500 to-pink-600', icon: Type, tags: ['Post', 'Conteúdo'], likes: 445 },
  { id: 't11', name: 'Cardápio Minimalista', category: 'cardapio', color: '#64748b', gradient: 'from-slate-500 to-zinc-600', icon: Layout, tags: ['Cardápio', 'Clean'], likes: 256 },
  { id: 't12', name: 'Receituário Profissional', category: 'documento', color: '#dc2626', gradient: 'from-red-500 to-rose-600', icon: BookOpen, tags: ['PDF', 'Receituário'], likes: 389, premium: true },
];

const categories = [
  { id: 'all', label: 'Todos', count: templates.length },
  { id: 'social', label: 'Redes Sociais', count: templates.filter(t => t.category === 'social').length },
  { id: 'cardapio', label: 'Cardápios', count: templates.filter(t => t.category === 'cardapio').length },
  { id: 'documento', label: 'Documentos', count: templates.filter(t => t.category === 'documento').length },
  { id: 'receita', label: 'Receitas', count: templates.filter(t => t.category === 'receita').length },
  { id: 'relatorio', label: 'Relatórios', count: templates.filter(t => t.category === 'relatorio').length },
];

export function NutritionistCanvas() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const toggleLike = (id: string) => {
    setLikedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">FitSync Canvas</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Crie e edite artes incríveis com mais de 100 modelos exclusivos
          </p>
        </div>
      </div>

      {/* Banner */}
      <div
        className="relative rounded-3xl p-8 mb-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5,#1d4ed8)' }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${-20 + i * 15}px`,
                right: `${-10 + i * 60}px`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm text-yellow-300" style={{ fontWeight: 600 }}>Incluso na Assinatura</span>
          </div>
          <h2 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
            Crie conteúdo profissional em minutos
          </h2>
          <p className="text-sm text-white/70 mb-5 max-w-xl">
            Mais de 100 modelos prontos para cardápios, posts, receitas, documentos e muito mais. Edite, personalize e compartilhe diretamente com seus pacientes.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => toast.success('Abrindo editor em branco...')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm bg-white text-violet-700 hover:bg-white/90 transition-all" style={{ fontWeight: 600 }}>
              <Palette className="w-4 h-4" />
              Criar do Zero
            </button>
            <button
              onClick={() => toast.success('Abrindo tutoriais...')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white border border-white/30 hover:bg-white/10 transition-all" style={{ fontWeight: 500 }}>
              Ver Tutoriais
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar modelos..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs transition-all ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'
              }`}
              style={activeCategory === cat.id ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', fontWeight: 600 } : {}}
            >
              {cat.label} <span className="opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((tpl) => {
          const Icon = tpl.icon;
          const isHovered = hoveredTemplate === tpl.id;
          const isLiked = likedTemplates.has(tpl.id);

          return (
            <motion.div
              key={tpl.id}
              layout
              onMouseEnter={() => setHoveredTemplate(tpl.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden group cursor-pointer hover:dark:border-violet-500/30 hover:border-violet-300 transition-all"
            >
              {/* Preview */}
              <div
                className={`relative h-36 bg-gradient-to-br ${tpl.gradient} flex items-center justify-center overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white" />
                  <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white" />
                </div>
                <Icon className="w-10 h-10 text-white relative z-10" />
                {tpl.premium && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/90 text-yellow-900 text-xs" style={{ fontWeight: 700 }}>
                    <Star className="w-2.5 h-2.5" fill="currentColor" /> PRO
                  </div>
                )}

                {/* Hover Overlay */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
                  >
                    <button
                      onClick={() => toast.success(`Prévia: ${tpl.name}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs" style={{ fontWeight: 600 }}>
                      <Eye className="w-3 h-3" /> Prévia
                    </button>
                    <button
                      onClick={() => tpl.premium ? toast.error('Upgrade para Pro necessário') : toast.success(`Usando modelo: ${tpl.name}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white border border-white/50 text-xs" style={{ fontWeight: 600 }}>
                      {tpl.premium ? <Star className="w-3 h-3" /> : null}
                      {tpl.premium ? 'Upgrade' : 'Usar'}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs dark:text-white text-slate-900 leading-snug" style={{ fontWeight: 600 }}>
                    {tpl.name}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(tpl.id); }}
                    className="flex-shrink-0"
                  >
                    <Heart
                      className="w-3.5 h-3.5 transition-colors"
                      fill={isLiked ? '#ef4444' : 'none'}
                      style={{ color: isLiked ? '#ef4444' : '#71717a' }}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs dark:text-zinc-600 text-slate-400 flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5" /> {tpl.likes + (isLiked ? 1 : 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 dark:text-zinc-600 text-slate-400">
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Nenhum modelo encontrado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}