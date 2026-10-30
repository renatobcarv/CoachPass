import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Apple, Search, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CTAButton } from '../brand/Brand';
import { Badge, EmptyState, Page, PageHeader } from '../student/ui';
import { Segmented } from '../pro/ui';

interface Food {
  id: string;
  name: string;
  category: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  source: 'TACO' | 'TBCA' | 'Fabricante' | 'USDA';
  favorite?: boolean;
}

const foods: Food[] = [
  { id: 'f1', name: 'Frango grelhado (peito)', category: 'proteinas', portion: '100g', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, source: 'TACO' },
  { id: 'f2', name: 'Arroz branco cozido', category: 'cereais', portion: '100g', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 0.8, sodium: 1, source: 'TACO' },
  { id: 'f3', name: 'Feijão carioca cozido', category: 'leguminosas', portion: '100g', calories: 77, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5, sodium: 2, source: 'TACO' },
  { id: 'f4', name: 'Batata-doce cozida', category: 'tuberculos', portion: '100g', calories: 77, protein: 1.4, carbs: 18.4, fat: 0.1, fiber: 2.2, sodium: 37, source: 'TACO' },
  { id: 'f5', name: 'Salmão grelhado', category: 'proteinas', portion: '100g', calories: 208, protein: 20.5, carbs: 0, fat: 13.4, fiber: 0, sodium: 59, source: 'TACO', favorite: true },
  { id: 'f6', name: 'Azeite de oliva extra virgem', category: 'gorduras', portion: '10ml (1 col. sopa)', calories: 88, protein: 0, carbs: 0, fat: 10.0, fiber: 0, sodium: 0, source: 'Fabricante' },
  { id: 'f7', name: 'Banana nanica', category: 'frutas', portion: '100g', calories: 92, protein: 1.3, carbs: 23.8, fat: 0.1, fiber: 1.9, sodium: 1, source: 'TACO', favorite: true },
  { id: 'f8', name: 'Ovos inteiros (cozido)', category: 'proteinas', portion: '50g (1 unid.)', calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, fiber: 0, sodium: 70, source: 'TACO' },
  { id: 'f9', name: 'Aveia em flocos', category: 'cereais', portion: '30g', calories: 113, protein: 3.8, carbs: 19.6, fat: 2.0, fiber: 2.4, sodium: 1, source: 'Fabricante' },
  { id: 'f10', name: 'Whey Protein (Integral Médica)', category: 'suplementos', portion: '30g', calories: 117, protein: 22.0, carbs: 3.5, fat: 2.0, fiber: 0, sodium: 100, source: 'Fabricante' },
  { id: 'f11', name: 'Brócolis cozido', category: 'vegetais', portion: '100g', calories: 35, protein: 2.3, carbs: 7.2, fat: 0.2, fiber: 2.6, sodium: 27, source: 'TACO' },
  { id: 'f12', name: 'Iogurte grego integral', category: 'laticinios', portion: '170g', calories: 131, protein: 11.5, carbs: 5.0, fat: 7.0, fiber: 0, sodium: 56, source: 'Fabricante' },
  { id: 'f13', name: 'Castanha-do-Pará', category: 'oleaginosas', portion: '5g (1 unid.)', calories: 33, protein: 0.7, carbs: 0.6, fat: 3.4, fiber: 0.3, sodium: 0, source: 'TBCA' },
  { id: 'f14', name: 'Arroz integral cozido', category: 'cereais', portion: '100g', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7, sodium: 2, source: 'TACO' },
  { id: 'f15', name: 'Abacate', category: 'frutas', portion: '100g', calories: 160, protein: 1.5, carbs: 8.8, fat: 14.6, fiber: 6.7, sodium: 7, source: 'TACO' },
  { id: 'f16', name: 'Atum em água (lata)', category: 'proteinas', portion: '100g', calories: 128, protein: 28.0, carbs: 0, fat: 1.5, fiber: 0, sodium: 324, source: 'Fabricante' },
];

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'proteinas', label: 'Proteínas' },
  { id: 'cereais', label: 'Cereais' },
  { id: 'leguminosas', label: 'Leguminosas' },
  { id: 'frutas', label: 'Frutas' },
  { id: 'vegetais', label: 'Vegetais' },
  { id: 'laticinios', label: 'Laticínios' },
  { id: 'oleaginosas', label: 'Oleaginosas' },
  { id: 'gorduras', label: 'Gorduras' },
  { id: 'tuberculos', label: 'Tubérculos' },
  { id: 'suplementos', label: 'Suplementos' },
];

export function NutritionistAlimentos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(foods.filter(f => f.favorite).map(f => f.id)));
  const [onlyFav, setOnlyFav] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'protein'>('name');

  const filtered = foods
    .filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === 'all' || f.category === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'calories') return a.calories - b.calories;
      if (sortBy === 'protein') return b.protein - a.protein;
      return a.name.localeCompare(b.name);
    });

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const favCount = favorites.size;
  const shown = onlyFav ? filtered.filter((f) => favorites.has(f.id)) : filtered;
  const countFor = (id: string) => (id === 'all' ? foods.length : foods.filter((f) => f.category === id).length);
  const catLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <Page wide>
      <PageHeader
        kicker="Base de alimentos"
        title="Tabela nutricional"
        accent="na palma da mão."
        lead={`${foods.length} alimentos com valores das tabelas TACO, TBCA e de fabricantes. Toque em um item para ver todos os nutrientes.`}
        action={
          <CTAButton type="button" onClick={() => navigate('/nutritionist/criar-plano')}>
            Montar plano alimentar
          </CTAButton>
        }
      />

      {/* Busca + ordenação */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar alimento… ex.: frango, aveia, banana"
            aria-label="Buscar alimento"
            className="cp-field h-12"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            size="sm"
            layoutId="food-sort"
            value={sortBy}
            onChange={(v) => setSortBy(v)}
            options={[
              { value: 'name', label: 'A–Z' },
              { value: 'calories', label: 'Menos kcal' },
              { value: 'protein', label: 'Mais proteína' },
            ]}
          />
          <button
            type="button"
            onClick={() => setOnlyFav((v) => !v)}
            aria-pressed={onlyFav}
            className={`h-10 px-4 rounded-full border inline-flex items-center gap-2 text-[13px] font-medium transition-colors ${
              onlyFav ? 'border-[rgba(255,181,71,0.5)] bg-[rgba(255,181,71,0.12)] text-[var(--amber)]' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
            }`}
          >
            <Star className={`w-4 h-4 ${onlyFav ? 'fill-current' : ''}`} />
            Favoritos
            <span className="cp-mono text-[11px] opacity-70">{favCount}</span>
          </button>
        </div>
      </div>

      {/* Categorias */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {categories.map((cat) => {
          const on = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={on}
              className={`shrink-0 h-9 px-3.5 rounded-full border inline-flex items-center gap-2 text-[13px] font-medium transition-colors ${
                on ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.16)] text-white' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
              }`}
            >
              {cat.label}
              <span className={`cp-mono text-[10.5px] ${on ? 'text-white/70' : 'text-[var(--dim)]'}`}>{countFor(cat.id)}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 mb-3 cp-mono text-[11.5px] text-[var(--dim)]">
        {shown.length} {shown.length === 1 ? 'alimento' : 'alimentos'}
      </p>

      {shown.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="Nenhum alimento encontrado"
        >
          {onlyFav ? 'Você ainda não favoritou alimentos nesta busca.' : 'Tente outro nome ou outra categoria.'}
        </EmptyState>
      ) : (
        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {shown.map((food, i) => {
            const fav = favorites.has(food.id);
            const kcalMacro = food.protein * 4 + food.carbs * 4 + food.fat * 9 || 1;
            return (
              <motion.li
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.025 }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setSelectedFood(food)}
                  className="cp-spot relative w-full h-full text-left rounded-[20px] border border-[var(--line)] bg-white/[0.025] p-4 hover:bg-white/[0.05] transition-colors"
                >
                  <span className="flex items-center gap-2 pr-9">
                    <Badge>{catLabel(food.category)}</Badge>
                    <span className="cp-mono text-[10.5px] text-[var(--dim)]">{food.source}</span>
                  </span>
                  <span className="mt-3 block font-semibold text-[15.5px] leading-snug">{food.name}</span>
                  <span className="mt-0.5 block text-[12.5px] text-[var(--muted)]">Porção: {food.portion}</span>
                  <span className="mt-4 flex items-baseline gap-1">
                    <span className="cp-display text-[28px] font-bold leading-none">{food.calories}</span>
                    <span className="text-[12px] text-[var(--muted)]">kcal</span>
                  </span>
                  {/* barra de composição calórica */}
                  <span className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-white/[0.06]" aria-hidden>
                    <span style={{ width: `${((food.protein * 4) / kcalMacro) * 100}%`, background: MACRO.protein }} />
                    <span style={{ width: `${((food.carbs * 4) / kcalMacro) * 100}%`, background: MACRO.carbs }} />
                    <span style={{ width: `${((food.fat * 9) / kcalMacro) * 100}%`, background: MACRO.fat }} />
                  </span>
                  <span className="mt-2.5 grid grid-cols-3 gap-2 cp-mono text-[11px]">
                    <span><span style={{ color: MACRO.protein }}>P</span> {food.protein}g</span>
                    <span><span style={{ color: MACRO.carbs }}>C</span> {food.carbs}g</span>
                    <span><span style={{ color: MACRO.fat }}>G</span> {food.fat}g</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFav(food.id)}
                  aria-pressed={fav}
                  aria-label={fav ? `Remover ${food.name} dos favoritos` : `Favoritar ${food.name}`}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center transition-colors ${
                    fav ? 'text-[var(--amber)]' : 'text-[var(--dim)] hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {/* Detalhe do alimento */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setSelectedFood(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="food-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="cp-modal relative z-10 w-full sm:max-w-md max-h-[92vh] flex flex-col"
            >
              <span aria-hidden className="cp-modal-bar" />
              <div className="flex items-start justify-between gap-4 p-6 pb-4">
                <div className="min-w-0">
                  <span className="flex items-center gap-2">
                    <Badge>{catLabel(selectedFood.category)}</Badge>
                    <span className="cp-mono text-[11px] text-[var(--dim)]">Fonte: {selectedFood.source}</span>
                  </span>
                  <h3 id="food-title" className="cp-display mt-2 text-[22px] font-bold leading-tight">
                    {selectedFood.name}
                  </h3>
                  <p className="text-[13.5px] text-[var(--muted)] mt-0.5">Porção de {selectedFood.portion}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  aria-label="Fechar"
                  className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-[var(--muted)] hover:text-white hover:bg-white/[0.06]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 pb-6 overflow-y-auto space-y-5">
                <div className="flex items-baseline gap-2">
                  <span className="cp-display text-[48px] font-bold leading-none">{selectedFood.calories}</span>
                  <span className="text-[14px] text-[var(--muted)]">kcal por porção</span>
                </div>

                <div className="space-y-3">
                  {(
                    [
                      ['Proteína', selectedFood.protein, 40, MACRO.protein],
                      ['Carboidrato', selectedFood.carbs, 40, MACRO.carbs],
                      ['Gordura', selectedFood.fat, 20, MACRO.fat],
                    ] as const
                  ).map(([label, value, max, color]) => (
                    <div key={label}>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[var(--muted)]">{label}</span>
                        <span className="cp-mono font-semibold">{value} g</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--line)] p-3.5">
                    <dt className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Fibras</dt>
                    <dd className="mt-1 text-[18px] font-semibold">{selectedFood.fiber} g</dd>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] p-3.5">
                    <dt className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Sódio</dt>
                    <dd className="mt-1 text-[18px] font-semibold">{selectedFood.sodium} mg</dd>
                  </div>
                </dl>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleFav(selectedFood.id)}
                    aria-pressed={favorites.has(selectedFood.id)}
                    className={`h-12 px-4 rounded-full border inline-flex items-center gap-2 text-[14px] font-medium ${
                      favorites.has(selectedFood.id)
                        ? 'border-[rgba(255,181,71,0.5)] text-[var(--amber)]'
                        : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(selectedFood.id) ? 'fill-current' : ''}`} />
                    {favorites.has(selectedFood.id) ? 'Favorito' : 'Favoritar'}
                  </button>
                  <CTAButton type="button" block onClick={() => navigate('/nutritionist/criar-plano')}>
                    Usar em um plano
                  </CTAButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Page>
  );
}

const MACRO = { protein: '#8c82ff', carbs: '#ffb547', fat: '#2ee6c8' } as const;
