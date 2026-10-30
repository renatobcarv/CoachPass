import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Circle, Minus, Plus, Printer, Search, ShoppingCart, Sparkles, Utensils, X, User } from 'lucide-react';
import { toast } from 'sonner';
import { CTAButton } from '../brand/Brand';
import { Badge, Page, PageHeader, SoonButton } from '../student/ui';
import { FieldLabel, MobileActionBar, PersonChip, Segmented } from '../pro/ui';
import { useAuth } from '../../context/AuthContext';
import { fetchNutriPatients, createMealPlan, type NutriPatient, type PlanMeal } from '../../lib/nutriApi';

// ────────────────── DATA ──────────────────
export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
}

export const foodDatabase: FoodItem[] = [
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


const categoryLabels: Record<string, string> = {
  protein: 'Proteínas',
  carb: 'Carboidratos',
  fat: 'Gorduras e Oleaginosas',
  vegetable: 'Vegetais e Legumes',
  fruit: 'Frutas',
  dairy: 'Laticínios e Suplementos',
};

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

export const defaultMeals = [
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
  const { user } = useAuth();

  const [patients, setPatients] = useState<NutriPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

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

  useEffect(() => {
    let cancelled = false;
    async function loadPatients() {
      if (!user?.id || !user?.accessToken) {
        setLoadingPatients(false);
        return;
      }
      try {
        const list = await fetchNutriPatients(user.id, user.accessToken);
        if (!cancelled) {
          setPatients(list);
          if (patientId && list.some(p => String(p.id) === String(patientId))) {
            setSelectedPatient(patientId);
          } else if (list.length > 0 && !selectedPatient) {
            setSelectedPatient(list[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          toast.error('Erro ao carregar pacientes', {
            description: err instanceof Error ? err.message : 'Tente recarregar a página.'
          });
        }
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }
    loadPatients();
    return () => { cancelled = true; };
  }, [user?.id, user?.accessToken, patientId]);

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

  const handleSave = async () => {
    if (!planName.trim()) {
      toast.error('Preencha o nome do plano');
      return;
    }
    if (!selectedPatient || selectedPatient === '0') {
      toast.error('Selecione um paciente ativo para este plano');
      return;
    }
    if (!user?.accessToken) {
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }

    setSaving(true);
    try {
      // Converte refeições para formato do Payload
      const mappedMeals: PlanMeal[] = meals.map((m) => ({
        name: m.name,
        time: m.time,
        calories: Math.round(getMealCalories(m)),
        items: m.foods.map((f) => ({
          name: f.food.name,
          quantity: `${f.quantity}${f.food.unit}`,
          calories: Math.round((f.food.calories * f.quantity) / 100),
        })),
      }));

      await createMealPlan(
        {
          title: planName.trim(),
          student: selectedPatient,
          status: 'published',
          observations: notes.trim(),
          meals: mappedMeals,
        },
        user.accessToken
      );

      toast.success('Plano alimentar salvo com sucesso!');
      navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist');
    } catch (err) {
      toast.error('Erro ao salvar plano alimentar', {
        description: err instanceof Error ? err.message : 'Verifique os dados e tente novamente.'
      });
    } finally {
      setSaving(false);
    }
  };

  const proteinTarget = Math.round((targetCalories * proteinPct) / 100 / 4);
  const carbsTarget = Math.round((targetCalories * carbsPct) / 100 / 4);
  const fatTarget = Math.round((targetCalories * fatPct) / 100 / 9);

  const macroSum = proteinPct + carbsPct + fatPct;
  const backTo = patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist';
  const active = meals.find((m) => m.id === activeMeal) || null;
  const patientData = patients.find((p) => String(p.id) === String(selectedPatient));
  const filledMeals = meals.filter((m) => m.foods.length > 0).length;
  const checklist = [
    { ok: Boolean(planName.trim()), label: 'Nome do plano' },
    { ok: Boolean(selectedPatient) && selectedPatient !== '0', label: 'Paciente' },
    { ok: macroSum === 100, label: 'Macros somam 100%' },
    { ok: filledMeals > 0, label: 'Ao menos 1 refeição' },
  ];
  const kcalPct = targetCalories ? Math.min(140, (totals.calories / targetCalories) * 100) : 0;
  const macroRows = [
    { label: 'Proteína', value: totals.protein, target: proteinTarget, color: '#8c82ff' },
    { label: 'Carboidrato', value: totals.carbs, target: carbsTarget, color: '#ffb547' },
    { label: 'Gordura', value: totals.fat, target: fatTarget, color: '#2ee6c8' },
  ];
  const catTone: Record<string, 'blue' | 'amber' | 'teal' | 'violet' | 'neutral'> = {
    protein: 'blue',
    carb: 'amber',
    fat: 'violet',
    vegetable: 'teal',
    fruit: 'amber',
    dairy: 'neutral',
  };
  const shortCat: Record<string, string> = {
    protein: 'Proteína',
    carb: 'Carboidrato',
    fat: 'Gordura',
    vegetable: 'Vegetal',
    fruit: 'Fruta',
    dairy: 'Laticínio',
  };

  return (
    <Page wide>
      <PageHeader
        kicker="Plano alimentar"
        title="Monte o plano"
        accent="do seu paciente."
        lead="Defina metas, monte as refeições com a base de alimentos e acompanhe os macros em tempo real."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowShoppingList((v) => !v)}
              className={`cp-btn-ghost ${showShoppingList ? '!border-[var(--brand-400)] !bg-[rgba(85,70,255,0.14)]' : ''}`}
            >
              <ShoppingCart className="w-4 h-4" />
              Lista de compras
              {totalFoodItems > 0 && <span className="cp-mono text-[11px] text-[var(--brand-200)]">{totalFoodItems}</span>}
            </button>
            <SoonButton icon={Sparkles}>Gerar com IA</SoonButton>
          </div>
        }
      />

      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* 1. Informações */}
          <section className="cp-spot relative rounded-[22px] border border-[var(--line)] bg-white/[0.025] p-5 sm:p-6">
            <StepTitle n={1}>Informações do plano</StepTitle>
            <FieldLabel htmlFor="plan-name">Nome do plano</FieldLabel>
            <input
              id="plan-name"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              maxLength={80}
              placeholder="Ex.: Emagrecimento — fase 1"
              className="cp-field cp-field-lg !text-[20px] !h-14"
            />
            <div className="mt-5 grid 2xl:grid-cols-2 gap-5">
              <div>
                <FieldLabel>Paciente</FieldLabel>
                {loadingPatients ? (
                  <p className="text-[13px] text-[var(--muted)]">Carregando pacientes vinculados...</p>
                ) : patients.length === 0 ? (
                  <div className="rounded-xl border border-[var(--line-2)] p-3 text-[13px] text-[var(--amber)]">
                    Nenhum paciente vinculado com status ativo ou pendente.{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/nutritionist')}
                      className="underline font-semibold text-white ml-1"
                    >
                      Convidar paciente
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {patients.map((p) => (
                      <PersonChip
                        key={p.id}
                        name={p.name}
                        selected={String(selectedPatient) === String(p.id)}
                        onClick={() => setSelectedPatient(p.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <FieldLabel>Duração</FieldLabel>
                <Segmented
                  layoutId="diet-duration"
                  value={String(duration)}
                  onChange={(v) => setDuration(Number(v))}
                  options={[2, 4, 6, 8].map((w) => ({ value: String(w), label: `${w} semanas` }))}
                  size="sm"
                />
              </div>
            </div>
          </section>

          {/* 2. Metas */}
          <section className="cp-spot relative rounded-[22px] border border-[var(--line)] bg-white/[0.025] p-5 sm:p-6">
            <StepTitle n={2}>Metas diárias</StepTitle>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
              <div>
                <FieldLabel htmlFor="target-calories-input">Calorias (meta diária)</FieldLabel>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Diminuir 50 kcal"
                    onClick={() => setTargetCalories((v) => Math.max(500, v - 50))}
                    className="w-11 h-11 rounded-full border border-[var(--line-2)] grid place-items-center text-[var(--muted)] hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-center min-w-[150px]">
                    <input
                      id="target-calories-input"
                      type="number"
                      min={500}
                      max={10000}
                      step={10}
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(Math.max(0, Number(e.target.value) || 0))}
                      className="cp-display text-[36px] font-bold leading-none w-28 text-center bg-transparent border-b border-[var(--line-2)] focus:border-[var(--brand-400)] focus:outline-none"
                    />
                    <span className="ml-1 text-[14px] font-medium text-[var(--muted)]">kcal</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Aumentar 50 kcal"
                    onClick={() => setTargetCalories((v) => Math.min(10000, v + 50))}
                    className="w-11 h-11 rounded-full border border-[var(--line-2)] grid place-items-center text-[var(--muted)] hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="range"
                  min={800}
                  max={6000}
                  step={25}
                  value={Math.min(6000, Math.max(800, targetCalories))}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  aria-label="Meta de calorias"
                  className="cp-range mt-5 w-full"
                />
                <div className="mt-1 flex justify-between cp-mono text-[11px] text-[var(--dim)]">
                  <span>800</span>
                  <span>6.000</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Proteína', value: proteinPct, setter: setProteinPct, color: '#8c82ff', gram: proteinTarget },
                  { label: 'Carboidrato', value: carbsPct, setter: setCarbsPct, color: '#ffb547', gram: carbsTarget },
                  { label: 'Gordura', value: fatPct, setter: setFatPct, color: '#2ee6c8', gram: fatTarget },
                ].map(({ label, value, setter, color, gram }) => (
                  <div key={label}>
                    <div className="flex items-baseline justify-between">
                      <span className="flex items-center gap-2 text-[14px] font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        {label}
                      </span>
                      <span className="cp-mono text-[12px] text-[var(--muted)]">
                        <span className="text-white text-[14px] font-semibold">{value}%</span> · {gram} g
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
                      aria-label={`${label} em %`}
                      className="cp-range mt-2 w-full"
                      style={{ ['--cp-range-color' as string]: color }}
                    />
                  </div>
                ))}
                <p className={`text-[12.5px] ${macroSum === 100 ? 'text-[var(--teal)]' : 'text-[var(--amber)]'}`}>
                  {macroSum === 100 ? 'Distribuição fechada em 100%.' : `Os macros somam ${macroSum}% — ajuste para 100%.`}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Refeições */}
          <section className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[var(--line)]">
              <StepTitle n={3}>Refeições do dia</StepTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-2">
                {meals.map((meal) => {
                  const on = activeMeal === meal.id;
                  const kcal = Math.round(getMealCalories(meal));
                  return (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => setActiveMeal(meal.id)}
                      aria-pressed={on}
                      className={`text-left rounded-2xl border px-3.5 py-3 transition-[background,border-color] ${
                        on ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)]' : 'border-[var(--line)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-[18px]" aria-hidden>{meal.icon}</span>
                        <span className="cp-mono text-[11px] text-[var(--dim)]">{meal.time}</span>
                      </span>
                      <span className="mt-1.5 block text-[13.5px] font-semibold leading-tight">{meal.name}</span>
                      <span className="mt-1 block cp-mono text-[11px] text-[var(--muted)]">
                        {meal.foods.length ? `${kcal} kcal · ${meal.foods.length} itens` : 'vazia'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {active && (
              <div className="grid 2xl:grid-cols-[1.25fr_1fr]">
                {/* base de alimentos */}
                <div className="p-5 sm:p-6 border-b 2xl:border-b-0 2xl:border-r border-[var(--line)] min-w-0">
                  <p className="cp-kicker mb-3">Adicionar em {active.name}</p>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
                    <input
                      type="text"
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      placeholder="Buscar alimento…"
                      className="cp-field h-11"
                    />
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {['all', ...Object.keys(categoryLabels)].map((c) => {
                      const on = categoryFilter === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategoryFilter(c)}
                          aria-pressed={on}
                          className={`shrink-0 h-8 px-3 rounded-full border text-[12.5px] font-medium transition-colors ${
                            on ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.16)] text-white' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                          }`}
                        >
                          {c === 'all' ? 'Todos' : shortCat[c]}
                        </button>
                      );
                    })}
                  </div>
                  <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1">
                    {filteredFoods.map((food) => (
                      <li key={food.id}>
                        <button
                          type="button"
                          onClick={() => {
                            addFoodToMeal(active.id, food);
                            toast.success('Alimento adicionado', { description: `${food.name} · ${active.name}` });
                          }}
                          className="cp-spot group relative w-full text-left rounded-2xl border border-[var(--line)] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors"
                        >
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-[14px] font-semibold leading-snug">{food.name}</span>
                            <span className="w-7 h-7 shrink-0 rounded-full grid place-items-center border border-[var(--line-2)] text-white group-hover:bg-[rgba(85,70,255,0.2)]">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <Badge tone={catTone[food.category]}>{shortCat[food.category]}</Badge>
                            <span className="cp-mono text-[11px] text-[var(--dim)] whitespace-nowrap">
                              {food.calories} kcal/100{food.unit}
                            </span>
                          </span>
                          <span className="mt-2 block cp-mono text-[10.5px] text-[var(--muted)]">
                            P {food.protein}g · C {food.carbs}g · G {food.fat}g
                          </span>
                        </button>
                      </li>
                    ))}
                    {filteredFoods.length === 0 && (
                      <li className="col-span-full py-10 text-center text-[14px] text-[var(--muted)]">Nenhum alimento encontrado.</li>
                    )}
                  </ul>
                </div>

                {/* itens da refeição */}
                <div className="p-5 sm:p-6 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 font-semibold">
                      <span aria-hidden>{active.icon}</span> {active.name}
                    </p>
                    <span className="cp-mono text-[12px] text-[var(--muted)]">{Math.round(getMealCalories(active))} kcal</span>
                  </div>
                  {active.foods.length === 0 ? (
                    <div className="py-12 text-center">
                      <Utensils className="w-8 h-8 mx-auto text-[var(--dim)]" />
                      <p className="mt-3 text-[14px] text-[var(--muted)]">Refeição vazia</p>
                      <p className="mt-1 text-[12.5px] text-[var(--dim)]">Toque em um alimento ao lado para adicionar.</p>
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      <AnimatePresence initial={false}>
                        {active.foods.map((mf) => (
                          <motion.li
                            key={mf.id}
                            layout
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            className="flex items-center gap-3 rounded-2xl border border-[var(--line)] px-3.5 py-2.5"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-medium leading-snug">{mf.food.name}</p>
                              <p className="cp-mono text-[11px] text-[var(--dim)]">
                                {Math.round((mf.food.calories * mf.quantity) / 100)} kcal
                              </p>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                max={2000}
                                value={mf.quantity}
                                onChange={(e) => updateQuantity(active.id, mf.id, Math.max(0, Math.min(2000, Number(e.target.value) || 0)))}
                                aria-label={`Quantidade de ${mf.food.name}`}
                                className="w-24 h-9 rounded-full border border-[var(--line-2)] bg-white/[0.03] pl-3 pr-8 text-[13px] text-white focus:outline-none focus:border-[var(--brand-400)]"
                              />
                              <span className="cp-mono absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--dim)]">{mf.food.unit}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFoodFromMeal(active.id, mf.id)}
                              aria-label={`Remover ${mf.food.name}`}
                              className="w-8 h-8 rounded-full grid place-items-center text-[var(--muted)] hover:text-[#ff8a95]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Lista de compras */}
          <AnimatePresence>
            {showShoppingList && (
              <motion.section
                id="shopping-section"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="cp-print-area rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden"
              >
                <span aria-hidden className="cp-modal-bar" />
                <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)]">
                  <div>
                    <p className="cp-kicker">Lista de compras</p>
                    <h2 className="cp-display mt-1 text-[22px] font-bold">
                      {planName || 'Plano alimentar'}
                      {patientData ? ` · ${patientData.name}` : ''}
                    </h2>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">
                      {totalFoodItems} itens · quantidades para {shoppingDays} dias
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 cp-no-print">
                    <Segmented
                      size="sm"
                      layoutId="shop-days"
                      value={String(shoppingDays)}
                      onChange={(v) => setShoppingDays(Number(v))}
                      options={[7, 15, 30, 60].map((d) => ({ value: String(d), label: `${d} dias` }))}
                    />
                    <button type="button" onClick={() => window.print()} disabled={totalFoodItems === 0} className="cp-btn-sm disabled:opacity-40">
                      <Printer className="w-4 h-4" /> Imprimir / PDF
                    </button>
                  </div>
                </div>
                {totalFoodItems === 0 ? (
                  <p className="px-6 py-10 text-center text-[14px] text-[var(--muted)]">Adicione alimentos às refeições para gerar a lista.</p>
                ) : (
                  <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-5">
                    {Object.entries(shoppingByCategory).map(([cat, items]) => (
                      <div key={cat} className="rounded-2xl border border-[var(--line)] p-4">
                        <p className="flex items-center gap-2 font-semibold">
                          <Badge tone={catTone[cat]}>{categoryLabels[cat]}</Badge>
                        </p>
                        <ul className="mt-3 divide-y divide-[var(--line)]">
                          {items.map((it) => (
                            <li key={it.foodId} className="flex items-center justify-between gap-3 py-2 text-[14px]">
                              <span>{it.name}</span>
                              <span className="text-right">
                                <span className="font-semibold">{it.displayMonthly}</span>
                                <span className="block cp-mono text-[10.5px] text-[var(--dim)]">{it.displayDaily}/dia</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Resumo fixo */}
        <aside className="xl:sticky xl:top-6">
          <section className="rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
            <span aria-hidden className="cp-modal-bar" />
            <div className="p-5 sm:p-6 border-b border-[var(--line)]">
              <StepTitle n={4}>Resumo do plano</StepTitle>
              <p className="cp-display text-[22px] font-bold leading-tight break-words">
                {planName || <span className="text-[var(--dim)]">Plano sem nome</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {patientData && <Badge tone="blue">{patientData.name}</Badge>}
                <Badge>{duration} semanas</Badge>
              </div>
              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <p className="cp-display text-[34px] font-bold leading-none">
                    {Math.round(totals.calories).toLocaleString('pt-BR')}
                    <span className="ml-1 text-[13px] font-medium text-[var(--muted)]">/ {targetCalories.toLocaleString('pt-BR')} kcal</span>
                  </p>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: kcalPct > 110 ? '#ff5d6c' : 'linear-gradient(90deg,#2a14e0,#5546ff,#8c82ff)' }}
                    animate={{ width: `${Math.min(100, kcalPct)}%` }}
                  />
                </div>
                <p className="mt-1.5 cp-mono text-[11px] text-[var(--dim)]">
                  {kcalPct > 110 ? 'Acima da meta' : `${Math.round(kcalPct)}% da meta diária`}
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {macroRows.map(({ label, value, target, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-[var(--muted)]">{label}</span>
                      <span className="cp-mono">
                        {Math.round(value)} / {target} g
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${target ? Math.min(100, (value / target) * 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-6 border-b border-[var(--line)]">
              <FieldLabel htmlFor="diet-notes">Orientações ao paciente</FieldLabel>
              <textarea
                id="diet-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={800}
                placeholder="Substituições permitidas, hidratação, restrições…"
                className="cp-field"
              />
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {checklist.map(({ ok, label }) => (
                  <li key={label} className={`flex items-center gap-2 text-[12.5px] ${ok ? 'text-[var(--cream)]' : 'text-[var(--dim)]'}`}>
                    {ok ? <Check className="w-3.5 h-3.5 text-[var(--teal)]" strokeWidth={3} /> : <Circle className="w-3.5 h-3.5" />}
                    {label}
                  </li>
                ))}
              </ul>
              <CTAButton type="button" block onClick={handleSave} disabled={saving || !planName || !selectedPatient}>
                {saving ? 'Salvando…' : 'Salvar plano alimentar'}
              </CTAButton>
              <button
                type="button"
                onClick={() => navigate(backTo)}
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
          <span className="text-white font-semibold">{Math.round(totals.calories)}</span> / {targetCalories} kcal
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !planName || !selectedPatient}
          className="cp-selected h-10 px-5 rounded-full text-[14px] font-semibold disabled:opacity-40"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </MobileActionBar>
    </Page>
  );
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="cp-mono w-7 h-7 rounded-lg grid place-items-center text-[12px] cp-selected">{n}</span>
      <h2 className="cp-display text-[18px] font-bold">{children}</h2>
    </div>
  );
}
