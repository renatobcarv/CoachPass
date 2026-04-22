import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Utensils,
  Search,
  Sparkles,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Clock,
  Users,
  BarChart3,
  ShoppingCart,
  Package,
  Download,
  Printer,
  Tag,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

// ────────────────── DATA ──────────────────
interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
}

const foodDatabase: FoodItem[] = [
  // Proteínas
  { id: 'f1', name: 'Frango grelhado', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: 'g' },
  { id: 'f2', name: 'Carne bovina magra', category: 'protein', calories: 215, protein: 26, carbs: 0, fat: 12, unit: 'g' },
  { id: 'f3', name: 'Salmão', category: 'protein', calories: 208, protein: 20, carbs: 0, fat: 13, unit: 'g' },
  { id: 'f4', name: 'Atum em água', category: 'protein', calories: 116, protein: 26, carbs: 0, fat: 1, unit: 'g' },
  { id: 'f5', name: 'Ovo inteiro cozido', category: 'protein', calories: 155, protein: 13, carbs: 1, fat: 11, unit: 'g' },
  { id: 'f6', name: 'Clara de ovo', category: 'protein', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, unit: 'g' },
  { id: 'f7', name: 'Peito de peru', category: 'protein', calories: 135, protein: 29, carbs: 2, fat: 1.5, unit: 'g' },
  { id: 'f8', name: 'Tilápia', category: 'protein', calories: 96, protein: 20, carbs: 0, fat: 2, unit: 'g' },
  // Carboidratos
  { id: 'c1', name: 'Arroz integral cozido', category: 'carb', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: 'g' },
  { id: 'c2', name: 'Batata-doce cozida', category: 'carb', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: 'g' },
  { id: 'c3', name: 'Aveia em flocos', category: 'carb', calories: 389, protein: 17, carbs: 66, fat: 7, unit: 'g' },
  { id: 'c4', name: 'Feijão cozido', category: 'carb', calories: 132, protein: 8.7, carbs: 24, fat: 0.5, unit: 'g' },
  { id: 'c5', name: 'Macarrão integral', category: 'carb', calories: 124, protein: 5, carbs: 23, fat: 1, unit: 'g' },
  { id: 'c6', name: 'Tapioca', category: 'carb', calories: 358, protein: 0.2, carbs: 88, fat: 0.2, unit: 'g' },
  { id: 'c7', name: 'Quinoa cozida', category: 'carb', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, unit: 'g' },
  { id: 'c8', name: 'Pão integral', category: 'carb', calories: 247, protein: 8, carbs: 41, fat: 3.5, unit: 'g' },
  // Gorduras
  { id: 'g1', name: 'Azeite de oliva', category: 'fat', calories: 884, protein: 0, carbs: 0, fat: 100, unit: 'ml' },
  { id: 'g2', name: 'Abacate', category: 'fat', calories: 160, protein: 2, carbs: 9, fat: 15, unit: 'g' },
  { id: 'g3', name: 'Castanha-do-Pará', category: 'fat', calories: 659, protein: 14, carbs: 12, fat: 67, unit: 'g' },
  { id: 'g4', name: 'Pasta de amendoim', category: 'fat', calories: 588, protein: 25, carbs: 20, fat: 50, unit: 'g' },
  { id: 'g5', name: 'Amêndoas', category: 'fat', calories: 579, protein: 21, carbs: 22, fat: 50, unit: 'g' },
  // Vegetais
  { id: 'v1', name: 'Brócolis', category: 'vegetable', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: 'g' },
  { id: 'v2', name: 'Espinafre', category: 'vegetable', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: 'g' },
  { id: 'v3', name: 'Abobrinha', category: 'vegetable', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, unit: 'g' },
  { id: 'v4', name: 'Cenoura', category: 'vegetable', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, unit: 'g' },
  { id: 'v5', name: 'Alface', category: 'vegetable', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, unit: 'g' },
  // Frutas
  { id: 'fr1', name: 'Banana', category: 'fruit', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: 'g' },
  { id: 'fr2', name: 'Maçã', category: 'fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: 'g' },
  { id: 'fr3', name: 'Morango', category: 'fruit', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, unit: 'g' },
  { id: 'fr4', name: 'Mamão papaya', category: 'fruit', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, unit: 'g' },
  // Laticínios
  { id: 'd1', name: 'Iogurte grego sem lactose', category: 'dairy', calories: 73, protein: 9, carbs: 3.6, fat: 3, unit: 'g' },
  { id: 'd2', name: 'Queijo cottage', category: 'dairy', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, unit: 'g' },
  { id: 'd3', name: 'Whey protein', category: 'dairy', calories: 373, protein: 78, carbs: 6, fat: 5, unit: 'g' },
];

const categoryColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  protein: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <Beef className="w-3 h-3" /> },
  carb: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <Wheat className="w-3 h-3" /> },
  fat: { bg: 'bg-pink-500/10', text: 'text-pink-400', icon: <Droplets className="w-3 h-3" /> },
  vegetable: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <Apple className="w-3 h-3" /> },
  fruit: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: <Apple className="w-3 h-3" /> },
  dairy: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: <Droplets className="w-3 h-3" /> },
};

const categoryLabels: Record<string, string> = {
  protein: 'Proteínas',
  carb: 'Carboidratos',
  fat: 'Gorduras e Oleaginosas',
  vegetable: 'Vegetais e Legumes',
  fruit: 'Frutas',
  dairy: 'Laticínios e Suplementos',
};

const categoryGradients: Record<string, string> = {
  protein: 'from-blue-500 to-indigo-600',
  carb: 'from-amber-500 to-orange-500',
  fat: 'from-pink-500 to-rose-500',
  vegetable: 'from-emerald-500 to-teal-600',
  fruit: 'from-orange-400 to-amber-500',
  dairy: 'from-violet-500 to-purple-600',
};

const categoryIconsLg: Record<string, React.ReactNode> = {
  protein: <Beef className="w-4 h-4" />,
  carb: <Wheat className="w-4 h-4" />,
  fat: <Droplets className="w-4 h-4" />,
  vegetable: <Apple className="w-4 h-4" />,
  fruit: <Apple className="w-4 h-4" />,
  dairy: <Package className="w-4 h-4" />,
};

function getCategoryColors(category: string): [string, string] {
  const map: Record<string, [string, string]> = {
    protein: ['#3b82f6', '#4338ca'],
    carb: ['#f59e0b', '#d97706'],
    fat: ['#ec4899', '#be185d'],
    vegetable: ['#10b981', '#059669'],
    fruit: ['#f97316', '#ea580c'],
    dairy: ['#8b5cf6', '#7c3aed'],
  };
  return map[category] || ['#6b7280', '#4b5563'];
}

function formatQuantity(qty: number, unit: string): string {
  if (unit === 'g') {
    if (qty >= 1000) {
      const kg = qty / 1000;
      return `${Number.isInteger(kg) ? kg : kg.toFixed(2).replace(/\.?0+$/, '')} kg`;
    }
    return `${Math.round(qty)} g`;
  }
  if (unit === 'ml') {
    if (qty >= 1000) {
      const l = qty / 1000;
      return `${Number.isInteger(l) ? l : l.toFixed(2).replace(/\.?0+$/, '')} L`;
    }
    return `${Math.round(qty)} ml`;
  }
  return `${Math.round(qty)} ${unit}`;
}

const defaultMeals = [
  { id: 'meal1', name: 'Café da Manhã', time: '07:00', icon: '☀️' },
  { id: 'meal2', name: 'Lanche da Manhã', time: '10:00', icon: '🍎' },
  { id: 'meal3', name: 'Almoço', time: '13:00', icon: '🍽️' },
  { id: 'meal4', name: 'Lanche da Tarde', time: '16:00', icon: '🥗' },
  { id: 'meal5', name: 'Jantar', time: '19:30', icon: '🌙' },
  { id: 'meal6', name: 'Ceia', time: '22:00', icon: '🫖' },
];

interface MealFood {
  id: string;
  food: FoodItem;
  quantity: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  icon: string;
  foods: MealFood[];
}

interface ShoppingItem {
  foodId: string;
  name: string;
  category: string;
  dailyQty: number;
  monthlyQty: number;
  unit: string;
  displayDaily: string;
  displayMonthly: string;
}

const mockPatients = [
  { id: '1', name: 'Ana Costa' },
  { id: '2', name: 'Roberto Lima' },
];

// ────────────────── COMPONENT ──────────────────
export function CreateDietPlan() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [planName, setPlanName] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [targetCalories, setTargetCalories] = useState(1800);
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(45);
  const [fatPct, setFatPct] = useState(25);
  const [duration, setDuration] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingDays, setShoppingDays] = useState(30);

  const [meals, setMeals] = useState<Meal[]>(
    defaultMeals.map((m) => ({ ...m, foods: [] }))
  );
  const [activeMeal, setActiveMeal] = useState<string | null>('meal1');
  const [foodSearch, setFoodSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredFoods = foodDatabase.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(foodSearch.toLowerCase());
    const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const addFoodToMeal = (mealId: string, food: FoodItem) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? { ...m, foods: [...m.foods, { id: `${mealId}-${food.id}-${Date.now()}`, food, quantity: 100 }] }
          : m
      )
    );
  };

  const removeFoodFromMeal = (mealId: string, foodId: string) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) } : m
      )
    );
  };

  const updateQuantity = (mealId: string, foodId: string, quantity: number) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? { ...m, foods: m.foods.map((f) => (f.id === foodId ? { ...f, quantity } : f)) }
          : m
      )
    );
  };

  const getMealCalories = (meal: Meal) =>
    meal.foods.reduce((sum, mf) => sum + (mf.food.calories * mf.quantity) / 100, 0);

  const getTotals = () => {
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    meals.forEach((meal) => meal.foods.forEach((mf) => {
      const f = mf.quantity / 100;
      t.calories += mf.food.calories * f;
      t.protein += mf.food.protein * f;
      t.carbs += mf.food.carbs * f;
      t.fat += mf.food.fat * f;
    }));
    return t;
  };

  // ── SHOPPING LIST ──
  const getShoppingList = (): ShoppingItem[] => {
    const map = new Map<string, ShoppingItem>();
    meals.forEach((meal) => {
      meal.foods.forEach((mf) => {
        const key = mf.food.id;
        if (map.has(key)) {
          const ex = map.get(key)!;
          ex.dailyQty += mf.quantity;
          ex.monthlyQty = ex.dailyQty * shoppingDays;
          ex.displayDaily = formatQuantity(ex.dailyQty, mf.food.unit);
          ex.displayMonthly = formatQuantity(ex.monthlyQty, mf.food.unit);
        } else {
          map.set(key, {
            foodId: key,
            name: mf.food.name,
            category: mf.food.category,
            dailyQty: mf.quantity,
            monthlyQty: mf.quantity * shoppingDays,
            unit: mf.food.unit,
            displayDaily: formatQuantity(mf.quantity, mf.food.unit),
            displayMonthly: formatQuantity(mf.quantity * shoppingDays, mf.food.unit),
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
  };

  const shoppingList = getShoppingList();
  const totalFoodItems = shoppingList.length;

  const shoppingByCategory = Object.keys(categoryLabels).reduce<Record<string, ShoppingItem[]>>((acc, cat) => {
    const items = shoppingList.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const totals = getTotals();

  const handleGenerateAI = () => {
    setGeneratingAI(true);
    setTimeout(() => { setGeneratingAI(false); toast.success('Plano alimentar gerado pela IA com sucesso!'); }, 2000);
  };

  const handleSave = () => {
    if (!planName || !selectedPatient) { toast.error('Preencha o nome do plano e selecione um paciente'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Plano alimentar salvo com sucesso!');
      navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist');
    }, 1500);
  };

  const proteinTarget = Math.round((targetCalories * proteinPct) / 100 / 4);
  const carbsTarget = Math.round((targetCalories * carbsPct) / 100 / 4);
  const fatTarget = Math.round((targetCalories * fatPct) / 100 / 9);

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist')}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Criar Plano Alimentar</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Monte um plano nutricional completo e personalizado</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Shopping List toggle */}
            <button
              onClick={() => setShowShoppingList(!showShoppingList)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all border ${
                showShoppingList
                  ? 'text-white border-transparent shadow-lg'
                  : 'dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:border-emerald-500/50 hover:border-emerald-400'
              }`}
              style={showShoppingList ? { background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 } : { fontWeight: 500 }}
            >
              <ShoppingCart className="w-4 h-4" />
              Lista de Compras
              {totalFoodItems > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${showShoppingList ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-500'}`}
                  style={{ fontWeight: 700 }}
                >
                  {totalFoodItems}
                </span>
              )}
            </button>
            <button
              onClick={handleGenerateAI}
              disabled={generatingAI}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', boxShadow: '0 8px 20px rgba(139,92,246,0.3)', fontWeight: 600 }}
            >
              {generatingAI ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gerando...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Gerar com IA</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px,1fr,320px] gap-6">

        {/* ──── LEFT: Plan Config ──── */}
        <div className="space-y-5">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Informações do Plano</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Nome do Plano *</label>
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Ex: Plano Emagrecimento – Fase 1"
                  className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Paciente *</label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                  <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                    <option value="">Selecione...</option>
                    {mockPatients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Duração (semanas)</label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8].map((w) => (
                    <button key={w} onClick={() => setDuration(w)}
                      className={`flex-1 py-2 rounded-xl text-xs transition-all ${duration === w ? 'text-white shadow-lg' : 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700'}`}
                      style={duration === w ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', fontWeight: 600 } : {}}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Meta Calórica Diária</h3>
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setTargetCalories((v) => Math.max(1200, v - 50))}
                  className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 flex items-center justify-center text-xl transition-colors">−</button>
                <div>
                  <p className="text-3xl text-amber-500" style={{ fontWeight: 800 }}>{targetCalories}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">kcal / dia</p>
                </div>
                <button onClick={() => setTargetCalories((v) => Math.min(4000, v + 50))}
                  className="w-8 h-8 rounded-lg dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 hover:dark:bg-zinc-700 flex items-center justify-center text-xl transition-colors">+</button>
              </div>
            </div>
            <input type="range" min={1200} max={4000} step={50} value={targetCalories} onChange={(e) => setTargetCalories(Number(e.target.value))} className="w-full accent-amber-500" />
            <div className="flex justify-between text-xs dark:text-zinc-600 text-slate-400 mt-1"><span>1200</span><span>4000</span></div>
          </div>

          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Distribuição de Macros</h3>
            <div className="space-y-4">
              {[
                { label: 'Proteína', value: proteinPct, setter: setProteinPct, color: '#3b82f6', gram: proteinTarget },
                { label: 'Carboidrato', value: carbsPct, setter: setCarbsPct, color: '#f59e0b', gram: carbsTarget },
                { label: 'Gordura', value: fatPct, setter: setFatPct, color: '#ec4899', gram: fatTarget },
              ].map(({ label, value, setter, color, gram }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs dark:text-zinc-400 text-slate-500">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs dark:text-zinc-500 text-slate-400">{gram}g</span>
                      <span className="text-xs" style={{ fontWeight: 600, color }}>{value}%</span>
                    </div>
                  </div>
                  <input type="range" min={10} max={60} value={value} onChange={(e) => setter(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: color }} />
                </div>
              ))}
            </div>
            <div className="flex h-3 rounded-full overflow-hidden mt-4">
              <div className="bg-blue-500 transition-all" style={{ width: `${proteinPct}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${carbsPct}%` }} />
              <div className="bg-pink-500 transition-all" style={{ width: `${fatPct}%` }} />
            </div>
          </div>

          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Observações do Plano</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Orientações gerais, restrições, substituições permitidas..."
              className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
          </div>
        </div>

        {/* ──── CENTER: Meal Builder ──── */}
        <div className="space-y-5">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
            <h3 className="dark:text-white text-slate-900 mb-4 text-sm" style={{ fontWeight: 600 }}>Refeições do Dia</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {meals.map((meal) => {
                const cal = Math.round(getMealCalories(meal));
                return (
                  <button key={meal.id} onClick={() => setActiveMeal(activeMeal === meal.id ? null : meal.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                      activeMeal === meal.id ? 'border-amber-500/50 shadow-lg' : 'dark:bg-zinc-800/50 bg-slate-50 dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600'
                    }`}
                    style={activeMeal === meal.id ? { background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.15))', borderColor: '#f59e0b55' } : {}}>
                    <span className="text-xl">{meal.icon}</span>
                    <span className="text-xs dark:text-zinc-300 text-slate-700 text-center leading-tight" style={{ fontWeight: activeMeal === meal.id ? 600 : 400 }}>
                      {meal.name.split(' ')[0]}
                    </span>
                    {cal > 0 && <span className="text-xs text-amber-500" style={{ fontWeight: 700 }}>{cal}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {activeMeal && (
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                  {meals.find((m) => m.id === activeMeal)?.icon} {meals.find((m) => m.id === activeMeal)?.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs dark:text-zinc-500 text-slate-400">
                  <Clock className="w-3 h-3" />{meals.find((m) => m.id === activeMeal)?.time}
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                  <input type="text" value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} placeholder="Buscar alimento..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                  <option value="all">Todos</option>
                  <option value="protein">Proteína</option>
                  <option value="carb">Carboidrato</option>
                  <option value="fat">Gordura</option>
                  <option value="vegetable">Vegetal</option>
                  <option value="fruit">Fruta</option>
                  <option value="dairy">Laticínio</option>
                </select>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {filteredFoods.map((food) => {
                  const cat = categoryColors[food.category];
                  return (
                    <motion.div key={food.id} whileHover={{ scale: 1.01 }} onClick={() => addFoodToMeal(activeMeal, food)}
                      className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200 hover:dark:border-amber-500/40 hover:border-amber-400/40 transition-all cursor-pointer group">
                      <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center flex-shrink-0 ${cat.text}`}>{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm dark:text-white text-slate-900 truncate" style={{ fontWeight: 500 }}>{food.name}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">{food.calories} kcal / 100{food.unit} • P {food.protein}g C {food.carbs}g G {food.fat}g</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Plus className="w-4 h-4 text-amber-500" />
                      </div>
                    </motion.div>
                  );
                })}
                {filteredFoods.length === 0 && <div className="text-center py-8 dark:text-zinc-600 text-slate-400 text-sm">Nenhum alimento encontrado</div>}
              </div>
            </div>
          )}

          {activeMeal && (
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 600 }}>Alimentos na Refeição</h3>
                <span className="text-amber-500 text-sm" style={{ fontWeight: 700 }}>
                  {Math.round(getMealCalories(meals.find((m) => m.id === activeMeal)!))} kcal
                </span>
              </div>
              {(meals.find((m) => m.id === activeMeal)?.foods || []).length === 0 ? (
                <div className="text-center py-6 dark:text-zinc-600 text-slate-400 text-sm">
                  <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Adicione alimentos da lista acima
                </div>
              ) : (
                <div className="space-y-2">
                  {(meals.find((m) => m.id === activeMeal)?.foods || []).map((mf) => (
                    <div key={mf.id} className="flex items-center gap-3 p-3 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs dark:text-white text-slate-900 mb-1 truncate" style={{ fontWeight: 500 }}>{mf.food.name}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">{Math.round((mf.food.calories * mf.quantity) / 100)} kcal</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" value={mf.quantity} onChange={(e) => updateQuantity(activeMeal, mf.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-lg text-xs dark:bg-zinc-700 bg-white border dark:border-zinc-600 border-slate-200 dark:text-white text-slate-900 text-center focus:outline-none" />
                        <span className="text-xs dark:text-zinc-500 text-slate-400">{mf.food.unit}</span>
                      </div>
                      <button onClick={() => removeFoodFromMeal(activeMeal, mf.id)}
                        className="w-7 h-7 rounded-lg dark:bg-red-500/10 bg-red-50 flex items-center justify-center text-red-400 hover:dark:bg-red-500/20 hover:bg-red-100 transition-colors flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ──── RIGHT: Summary & Save ──── */}
        <div className="space-y-5">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200 sticky top-4">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <h3 className="dark:text-white text-slate-900 text-sm" style={{ fontWeight: 600 }}>Resumo do Plano</h3>
            </div>

            <div className="text-center mb-5 p-4 dark:bg-zinc-800/50 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200">
              <p className="text-4xl text-amber-500" style={{ fontWeight: 800 }}>{Math.round(totals.calories)}</p>
              <p className="text-xs dark:text-zinc-500 text-slate-400 mt-1">kcal totais / {targetCalories} meta</p>
              <div className="w-full h-2 dark:bg-zinc-700 bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totals.calories / targetCalories) * 100)}%`, background: totals.calories > targetCalories * 1.05 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#f59e0b,#d97706)' }} />
              </div>
              <p className="text-xs mt-2" style={{ color: totals.calories > targetCalories ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                {totals.calories > targetCalories ? `+${Math.round(totals.calories - targetCalories)} kcal acima` : `${Math.round(targetCalories - totals.calories)} kcal restantes`}
              </p>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'Proteína', current: totals.protein, target: proteinTarget, color: '#3b82f6' },
                { label: 'Carboidrato', current: totals.carbs, target: carbsTarget, color: '#f59e0b' },
                { label: 'Gordura', current: totals.fat, target: fatTarget, color: '#ec4899' },
              ].map(({ label, current, target, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="dark:text-zinc-400 text-slate-500">{label}</span>
                    <span style={{ fontWeight: 600, color }}>{Math.round(current)}g / {target}g</span>
                  </div>
                  <div className="w-full h-1.5 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (current / target) * 100)}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-5">
              <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider">Por Refeição</p>
              {meals.map((meal) => {
                const cal = Math.round(getMealCalories(meal));
                return (
                  <div key={meal.id} className="flex items-center gap-2">
                    <span className="text-xs dark:text-zinc-500 text-slate-400 w-4">{meal.icon}</span>
                    <span className="text-xs dark:text-zinc-400 text-slate-500 flex-1 truncate">{meal.name}</span>
                    <span className="text-xs dark:text-zinc-300 text-slate-700" style={{ fontWeight: cal > 0 ? 600 : 400 }}>{cal > 0 ? `${cal} kcal` : '—'}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick shopping list access */}
            {totalFoodItems > 0 && (
              <button
                onClick={() => { setShowShoppingList(true); setTimeout(() => document.getElementById('shopping-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mb-3 border dark:border-emerald-500/30 border-emerald-300 dark:bg-emerald-500/5 bg-emerald-50 dark:text-emerald-400 text-emerald-700 hover:dark:bg-emerald-500/10 hover:bg-emerald-100 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="flex-1 text-left">Ver Lista de Compras</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20" style={{ fontWeight: 700 }}>{totalFoodItems} itens</span>
              </button>
            )}

            <div className="space-y-2">
              <button onClick={handleSave} disabled={saving || !planName || !selectedPatient}
                className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 20px rgba(245,158,11,0.3)', fontWeight: 600 }}>
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</> : <><Save className="w-4 h-4" />Salvar Plano</>}
              </button>
              <button onClick={() => navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist')}
                className="w-full py-2.5 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-all text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────── SHOPPING LIST ──────────────────────── */}
      <AnimatePresence>
        {showShoppingList && (
          <motion.div
            id="shopping-section"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-8"
          >
            <div className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden">

              {/* ── Banner ── */}
              <div className="relative p-6 lg:p-8 overflow-hidden" style={{ background: 'linear-gradient(135deg,#10b981,#059669,#047857)' }}>
                <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
                <div className="absolute bottom-0 right-32 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute top-4 left-1/2 w-16 h-16 rounded-full bg-white/5" />

                <div className="relative flex items-start justify-between flex-wrap gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-white text-xl" style={{ fontWeight: 700 }}>Lista de Compras</h2>
                        <p className="text-white/70 text-sm">Totalização dos alimentos do plano alimentar</p>
                      </div>
                    </div>

                    {/* Summary chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[
                        { label: 'Itens', value: totalFoodItems, icon: Tag },
                        { label: 'Categorias', value: Object.keys(shoppingByCategory).length, icon: Package },
                        { label: 'Período', value: `${shoppingDays} dias`, icon: Calendar },
                        { label: 'Refeições', value: `${meals.filter(m => m.foods.length > 0).length}/${meals.length}`, icon: Utensils },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm">
                          <Icon className="w-3.5 h-3.5 text-white/80" />
                          <span className="text-xs text-white/80">{label}:</span>
                          <span className="text-xs text-white" style={{ fontWeight: 700 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Period selector */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                      <Calendar className="w-4 h-4 text-white/80" />
                      <span className="text-xs text-white/80 mr-1">Período:</span>
                      {[7, 15, 30, 60].map((d) => (
                        <button key={d} onClick={() => setShoppingDays(d)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${shoppingDays === d ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/70 hover:bg-white/15'}`}
                          style={{ fontWeight: shoppingDays === d ? 700 : 400 }}>
                          {d === 7 ? '7d' : d === 15 ? '15d' : d === 30 ? '1 mês' : '2 meses'}
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => toast.success('Lista exportada em PDF!')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs hover:bg-white/25 transition-all" style={{ fontWeight: 600 }}>
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button onClick={() => toast.success('Enviando para impressão...')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs hover:bg-white/25 transition-all" style={{ fontWeight: 600 }}>
                        <Printer className="w-3.5 h-3.5" /> Imprimir
                      </button>
                      <button onClick={() => setShowShoppingList(false)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 text-xs hover:bg-white/20 transition-all">
                        <X className="w-3.5 h-3.5" /> Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Empty state ── */}
              {totalFoodItems === 0 && (
                <div className="text-center py-20">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 dark:text-zinc-700 text-slate-300 opacity-60" />
                  <p className="text-sm dark:text-zinc-500 text-slate-400" style={{ fontWeight: 500 }}>Adicione alimentos às refeições para gerar a lista</p>
                  <p className="text-xs dark:text-zinc-600 text-slate-300 mt-1">A soma mensal será calculada automaticamente</p>
                </div>
              )}

              {totalFoodItems > 0 && (
                <div className="p-6 lg:p-8">

                  {/* ── Category summary bar ── */}
                  <div className="flex flex-wrap gap-3 mb-8 p-4 dark:bg-zinc-800/40 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200">
                    <p className="text-xs dark:text-zinc-500 text-slate-400 w-full" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>RESUMO POR CATEGORIA</p>
                    {Object.entries(shoppingByCategory).map(([cat, items]) => {
                      const [c1] = getCategoryColors(cat);
                      return (
                        <div key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-slate-200 dark:bg-zinc-800/50 bg-white">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${c1}20` }}>
                            <span style={{ color: c1 }}>{categoryIconsLg[cat]}</span>
                          </div>
                          <span className="text-xs dark:text-zinc-300 text-slate-600">{categoryLabels[cat]}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${c1}20`, color: c1, fontWeight: 700 }}>{items.length}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Category cards grid ── */}
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                    {Object.entries(shoppingByCategory).map(([cat, items]) => {
                      const [c1, c2] = getCategoryColors(cat);
                      return (
                        <div key={cat} className="dark:bg-zinc-800/30 bg-slate-50 rounded-2xl border dark:border-zinc-700 border-slate-200 overflow-hidden">
                          {/* Category header */}
                          <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${categoryGradients[cat]}`}>
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                              {categoryIconsLg[cat]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white" style={{ fontWeight: 700 }}>{categoryLabels[cat]}</p>
                              <p className="text-xs text-white/70">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-lg bg-white/20 text-white" style={{ fontWeight: 700 }}>{shoppingDays}d</span>
                          </div>

                          {/* Items list */}
                          <div className="divide-y dark:divide-zinc-700/60 divide-slate-200">
                            {items.map((item, idx) => (
                              <div key={item.foodId} className="flex items-center gap-3 px-4 py-3 hover:dark:bg-zinc-700/20 hover:bg-slate-100 transition-colors">
                                {/* Index badge */}
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xs"
                                  style={{ background: `linear-gradient(135deg,${c1},${c2})`, fontWeight: 700 }}>
                                  {idx + 1}
                                </div>

                                {/* Name + daily */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm dark:text-white text-slate-900 truncate" style={{ fontWeight: 500 }}>{item.name}</p>
                                  <p className="text-xs dark:text-zinc-500 text-slate-400">
                                    {item.displayDaily}/dia × {shoppingDays} dias
                                  </p>
                                </div>

                                {/* Monthly total */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm" style={{ color: c1, fontWeight: 700 }}>{item.displayMonthly}</p>
                                  <p className="text-xs dark:text-zinc-600 text-slate-400">total</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Category total footer */}
                          <div className="px-4 py-2.5 dark:bg-zinc-800/60 bg-slate-100/80 border-t dark:border-zinc-700 border-slate-200 flex items-center justify-between">
                            <span className="text-xs dark:text-zinc-500 text-slate-400">
                              {items.length} produto{items.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs" style={{ color: c1, fontWeight: 600 }}>
                              {categoryLabels[cat].split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Full table ── */}
                  <div className="dark:bg-zinc-800/30 bg-white rounded-2xl border dark:border-zinc-700 border-slate-200 overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b dark:border-zinc-700 border-slate-200">
                      <ShoppingCart className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h4 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
                          Lista Completa — {shoppingDays === 7 ? '1 semana' : shoppingDays === 30 ? '1 mês' : shoppingDays === 60 ? '2 meses' : `${shoppingDays} dias`}
                        </h4>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">Quantidade diária × {shoppingDays} dias</p>
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" style={{ fontWeight: 700 }}>
                          {totalFoodItems} itens
                        </span>
                        <button onClick={() => toast.success('Lista exportada!')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:dark:text-emerald-400 transition-all" style={{ fontWeight: 600 }}>
                          <Download className="w-3.5 h-3.5" /> Exportar
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b dark:border-zinc-700 border-slate-200">
                            <th className="text-left px-6 py-3 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider w-10" style={{ fontWeight: 600 }}>#</th>
                            <th className="text-left px-4 py-3 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Alimento</th>
                            <th className="text-center px-4 py-3 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider hidden md:table-cell" style={{ fontWeight: 600 }}>Categoria</th>
                            <th className="text-right px-4 py-3 text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Qtd / dia</th>
                            <th className="text-right px-6 py-3 text-xs text-emerald-500 uppercase tracking-wider" style={{ fontWeight: 700 }}>Total {shoppingDays} dias</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shoppingList.map((item, idx) => {
                            const [c1] = getCategoryColors(item.category);
                            const cat = categoryColors[item.category];
                            return (
                              <tr key={item.foodId} className={`border-b dark:border-zinc-800 border-slate-100 hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors ${idx === shoppingList.length - 1 ? 'border-0' : ''}`}>
                                <td className="px-6 py-3.5">
                                  <span className="text-xs dark:text-zinc-600 text-slate-400" style={{ fontWeight: 600 }}>{String(idx + 1).padStart(2, '0')}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center ${cat.text} flex-shrink-0`}>
                                      {cat.icon}
                                    </div>
                                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 500 }}>{item.name}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-center hidden md:table-cell">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`} style={{ fontWeight: 600 }}>
                                    {categoryLabels[item.category]}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <span className="text-xs dark:text-zinc-400 text-slate-600 tabular-nums" style={{ fontWeight: 500 }}>{item.displayDaily}</span>
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                  <span className="text-sm tabular-nums" style={{ color: c1, fontWeight: 700 }}>{item.displayMonthly}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer note */}
                    <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 dark:bg-zinc-800/50 bg-slate-50 border-t dark:border-zinc-700 border-slate-200">
                      <p className="text-xs dark:text-zinc-500 text-slate-400">
                        ✦ Quantidades calculadas com base na soma de todas as refeições diárias × {shoppingDays} dias.
                        Conversão automática: g → kg (≥ 1.000g) · ml → L (≥ 1.000ml).
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => toast.success('PDF gerado!')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:dark:text-emerald-400 transition-all" style={{ fontWeight: 600 }}>
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button onClick={() => toast.success('Imprimindo...')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-blue-500 hover:dark:text-blue-400 transition-all" style={{ fontWeight: 600 }}>
                          <Printer className="w-3.5 h-3.5" /> Imprimir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
