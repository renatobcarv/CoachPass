import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Apple,
  Search,
  Filter,
  Star,
  Flame,
  Droplets,
  Plus,
  Info,
  X,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const sourceColors = {
  TACO: '#10b981',
  TBCA: '#3b82f6',
  Fabricante: '#f59e0b',
  USDA: '#8b5cf6',
};

export function NutritionistAlimentos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(foods.filter(f => f.favorite).map(f => f.id)));
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

  const MacroBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="dark:text-zinc-500 text-slate-400">{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value}g</span>
      </div>
      <div className="h-1.5 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );

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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              <Apple className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Base de Alimentos</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Alimentos atualizados seguindo padrões TBCA/TACO e fabricantes brasileiros
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 20px rgba(245,158,11,0.3)', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Cadastrar Alimento
        </button>
      </div>

      {/* Source Legend */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-xs dark:text-zinc-500 text-slate-400" style={{ fontWeight: 500 }}>Fontes:</span>
        {Object.entries(sourceColors).map(([source, color]) => (
          <span key={source} className="flex items-center gap-1.5 text-xs dark:text-zinc-400 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {source}
          </span>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar alimento..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs dark:text-zinc-500 text-slate-400">Ordenar:</span>
          {[
            { id: 'name', label: 'Nome' },
            { id: 'calories', label: 'Calorias' },
            { id: 'protein', label: 'Proteína' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSortBy(id as typeof sortBy)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${sortBy === id ? 'text-white' : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'}`}
              style={sortBy === id ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', fontWeight: 600 } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all ${activeCategory === cat.id ? 'text-white' : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border border-slate-200 dark:text-zinc-400 text-slate-600'}`}
            style={activeCategory === cat.id ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', fontWeight: 600 } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-zinc-800 border-slate-200">
                <th className="text-left px-5 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Alimento / Porção</th>
                <th className="text-right px-4 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Kcal</th>
                <th className="text-right px-4 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>PTN</th>
                <th className="text-right px-4 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>CHO</th>
                <th className="text-right px-4 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>GOR</th>
                <th className="text-right px-4 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Fibras</th>
                <th className="text-center px-4 py-4 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Fonte</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800 divide-slate-100">
              {filtered.map((food) => {
                const isFav = favorites.has(food.id);
                return (
                  <tr
                    key={food.id}
                    className="hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFood(food)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 500 }}>{food.name}</p>
                      <p className="text-xs dark:text-zinc-600 text-slate-400">{food.portion}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-amber-500" style={{ fontWeight: 700 }}>{food.calories}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-blue-400" style={{ fontWeight: 600 }}>{food.protein}g</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm dark:text-zinc-400 text-slate-600">{food.carbs}g</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm dark:text-zinc-400 text-slate-600">{food.fat}g</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm dark:text-zinc-400 text-slate-600">{food.fiber}g</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sourceColors[food.source]}20`, color: sourceColors[food.source], fontWeight: 600 }}>
                        {food.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFav(food.id); }}
                          className="p-1.5 rounded-lg hover:dark:bg-zinc-700 hover:bg-slate-100 transition-colors"
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={isFav ? '#f59e0b' : 'none'}
                            style={{ color: isFav ? '#f59e0b' : '#71717a' }}
                          />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedFood(food); }}
                          className="p-1.5 rounded-lg hover:dark:bg-zinc-700 hover:bg-slate-100 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5 dark:text-zinc-500 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 dark:text-zinc-600 text-slate-400">
            <Apple className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum alimento encontrado</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200 w-full max-w-md"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="dark:text-white text-slate-900 mb-1">{selectedFood.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs dark:text-zinc-500 text-slate-400">{selectedFood.portion}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sourceColors[selectedFood.source]}20`, color: sourceColors[selectedFood.source], fontWeight: 600 }}>
                      {selectedFood.source}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedFood(null)} className="p-2 rounded-xl dark:hover:bg-zinc-800 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 dark:text-zinc-400 text-slate-500" />
                </button>
              </div>

              {/* Calories */}
              <div className="text-center py-5 dark:bg-zinc-800/50 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200 mb-5">
                <p className="text-3xl text-amber-500 mb-1" style={{ fontWeight: 800 }}>{selectedFood.calories}</p>
                <p className="text-xs dark:text-zinc-500 text-slate-400">kcal por {selectedFood.portion}</p>
              </div>

              {/* Macros */}
              <div className="space-y-3 mb-5">
                <MacroBar label="Proteína" value={selectedFood.protein} max={30} color="#3b82f6" />
                <MacroBar label="Carboidrato" value={selectedFood.carbs} max={50} color="#f59e0b" />
                <MacroBar label="Gordura" value={selectedFood.fat} max={20} color="#ec4899" />
                <MacroBar label="Fibras" value={selectedFood.fiber} max={10} color="#10b981" />
              </div>

              {/* Extra */}
              <div className="grid grid-cols-2 gap-3">
                <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">Sódio</p>
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{selectedFood.sodium} mg</p>
                </div>
                <div className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">Categoria</p>
                  <p className="text-sm dark:text-white text-slate-900 capitalize" style={{ fontWeight: 600 }}>{selectedFood.category}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFood(null)}
                className="w-full mt-5 py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', fontWeight: 600 }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Adicionar ao Plano
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
