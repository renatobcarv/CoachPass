import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Palette, Plus, Download, Eye, Star, Grid, List, Search, Sparkles, Dumbbell, Activity, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const categories = ['Todos', 'Treinos', 'Motivação', 'Cardápio', 'Progresso', 'Branding'];

const templates = [
  { id: '1', title: 'Ficha de Treino Minimalista', category: 'Treinos', preview: '#3b82f6', icon: '🏋️', premium: false, downloads: 1240, uses: 384 },
  { id: '2', title: 'Card de Evolução Física', category: 'Progresso', preview: '#10b981', icon: '📈', premium: false, downloads: 892, uses: 257 },
  { id: '3', title: 'Story de Motivação Dark', category: 'Motivação', preview: '#111827', icon: '⚡', premium: false, downloads: 2100, uses: 748 },
  { id: '4', title: 'Post Antes & Depois', category: 'Progresso', preview: '#8b5cf6', icon: '🔄', premium: true, downloads: 3400, uses: 1200 },
  { id: '5', title: 'Planilha Semanal de Treinos', category: 'Treinos', preview: '#f59e0b', icon: '📋', premium: false, downloads: 1560, uses: 520 },
  { id: '6', title: 'Logo Personal Trainer', category: 'Branding', preview: '#ef4444', icon: '✨', premium: true, downloads: 980, uses: 310 },
  { id: '7', title: 'Card de Resultados', category: 'Progresso', preview: '#06b6d4', icon: '🏆', premium: false, downloads: 1890, uses: 630 },
  { id: '8', title: 'Cardápio Fitness', category: 'Cardápio', preview: '#ec4899', icon: '🥗', premium: true, downloads: 2250, uses: 780 },
];

const myCreations = [
  { id: 'c1', title: 'Treino Lucas – Março', type: 'Ficha', createdAt: '2025-03-10', color: '#3b82f6' },
  { id: 'c2', title: 'Evolução Maria Santos', type: 'Progresso', createdAt: '2025-03-08', color: '#10b981' },
  { id: 'c3', title: 'Post Resultados – Semana 8', type: 'Motivação', createdAt: '2025-03-05', color: '#8b5cf6' },
];

export function PersonalCanvas() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'templates' | 'mine'>('templates');

  const filtered = templates.filter(t => {
    const matchCat = selectedCat === 'Todos' || t.category === selectedCat;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const gradients: Record<string, string> = {
    '#3b82f6': 'from-blue-500 to-indigo-600',
    '#10b981': 'from-emerald-500 to-teal-600',
    '#111827': 'from-zinc-800 to-zinc-950',
    '#8b5cf6': 'from-violet-500 to-purple-600',
    '#f59e0b': 'from-amber-400 to-orange-500',
    '#ef4444': 'from-red-500 to-rose-600',
    '#06b6d4': 'from-cyan-500 to-blue-500',
    '#ec4899': 'from-pink-500 to-rose-500',
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">FitSync Canvas</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Crie materiais profissionais para seus alunos em segundos</p>
          </div>
          <button onClick={() => toast.success('Abrindo editor...')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)', fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Criar do Zero
          </button>
        </div>
      </div>

      {/* AI Banner */}
      <div className="relative rounded-3xl p-6 mb-6 overflow-hidden" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed,#4f46e5)' }}>
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-32 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-5 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-lg mb-1" style={{ fontWeight: 700 }}>Criar com IA</h3>
            <p className="text-white/70 text-sm">Descreva o que você quer e a IA cria um material personalizado para você em segundos</p>
          </div>
          <button onClick={() => toast.success('Abrindo gerador de IA...')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-violet-700 text-sm hover:bg-white/90 transition-all flex-shrink-0" style={{ fontWeight: 700 }}>
            <Sparkles className="w-4 h-4" /> Gerar com IA
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex border dark:border-zinc-800 border-slate-200">
        {[{ id: 'templates', label: 'Modelos' }, { id: 'mine', label: 'Minhas Criações' }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', fontWeight: 600 } : {}}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <>
          {/* Search + Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar modelo..."
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-52" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setSelectedCat(c)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all ${selectedCat === c ? 'text-white border-transparent' : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                  style={selectedCat === c ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', fontWeight: 600 } : {}}>
                  {c}
                </button>
              ))}
            </div>
            <div className="ml-auto flex dark:bg-zinc-900 bg-white rounded-xl p-1 border dark:border-zinc-800 border-slate-200">
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`p-2 rounded-lg transition-all ${view === v ? 'bg-violet-500/20 text-violet-400' : 'dark:text-zinc-500 text-slate-400'}`}>
                  {v === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid gap-5 ${view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {filtered.map(tmpl => (
              <motion.div key={tmpl.id} whileHover={{ y: -3 }}
                className={`dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden ${view === 'list' ? 'flex gap-4 items-center p-4' : ''}`}>
                {view === 'grid' ? (
                  <>
                    <div className={`h-36 bg-gradient-to-br ${gradients[tmpl.preview] || 'from-zinc-800 to-zinc-900'} flex items-center justify-center text-4xl relative`}>
                      {tmpl.icon}
                      {tmpl.premium && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-violet-600 text-white" style={{ fontWeight: 700 }}>Pro</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>{tmpl.title}</p>
                      <div className="flex items-center gap-2 text-xs dark:text-zinc-500 text-slate-400 mb-3">
                        <span className="px-1.5 py-0.5 rounded-md dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600">{tmpl.category}</span>
                        <span>{tmpl.downloads} downloads</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => tmpl.premium ? toast.error('Upgrade necessário') : toast.success(`Usando: ${tmpl.title}`)}
                          className="flex-1 py-2 rounded-xl text-xs text-white flex items-center justify-center gap-1"
                          style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', fontWeight: 600 }}>
                          {tmpl.premium ? <Star className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {tmpl.premium ? 'Pro' : 'Usar'}
                        </button>
                        <button onClick={() => toast.success('Baixando...')} className="px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-violet-500 transition-all">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[tmpl.preview] || 'from-zinc-800 to-zinc-900'} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {tmpl.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{tmpl.title}</p>
                        {tmpl.premium && <span className="text-xs px-1.5 py-0.5 rounded-md bg-violet-600/20 text-violet-400" style={{ fontWeight: 600 }}>Pro</span>}
                      </div>
                      <p className="text-xs dark:text-zinc-500 text-slate-400">{tmpl.category} · {tmpl.downloads} downloads</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => toast.success(`Abrindo: ${tmpl.title}`)} className="px-3 py-2 rounded-xl text-xs text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', fontWeight: 600 }}>Usar</button>
                      <button onClick={() => toast.success('Baixando...')} className="px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-violet-500 transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'mine' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm dark:text-zinc-400 text-slate-500">{myCreations.length} criações</p>
            <button onClick={() => toast.success('Abrindo editor...')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border dark:border-violet-500/30 border-violet-300 dark:text-violet-400 text-violet-600 hover:dark:bg-violet-500/10 transition-all" style={{ fontWeight: 600 }}>
              <Plus className="w-3.5 h-3.5" /> Nova criação
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCreations.map(c => (
              <motion.div key={c.id} whileHover={{ y: -2 }}
                className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden cursor-pointer"
                onClick={() => toast.success(`Editando: ${c.title}`)}>
                <div className="h-32 flex items-center justify-center text-white text-4xl" style={{ background: `linear-gradient(135deg,${c.color},${c.color}cc)` }}>
                  🎨
                </div>
                <div className="p-4">
                  <p className="text-sm dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>{c.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs dark:text-zinc-500 text-slate-400">{c.type} · {new Date(c.createdAt + 'T12:00').toLocaleDateString('pt-BR')}</span>
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); toast.success('Baixando...'); }} className="w-7 h-7 rounded-lg dark:bg-zinc-800 bg-slate-100 flex items-center justify-center dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <motion.button whileHover={{ y: -2 }} onClick={() => toast.success('Abrindo editor...')}
              className="dark:bg-zinc-900 bg-white rounded-3xl border-2 border-dashed dark:border-zinc-700 border-slate-300 h-[200px] flex flex-col items-center justify-center gap-3 dark:text-zinc-600 text-slate-400 hover:dark:border-violet-500 hover:dark:text-violet-400 transition-all">
              <Plus className="w-8 h-8" />
              <span className="text-sm" style={{ fontWeight: 600 }}>Nova Criação</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
