import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Leaf,
  Tag,
  ChevronRight,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { FoodNutrition } from '../data/foodData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FoodModalProps {
  food: FoodNutrition | null;
  onClose: () => void;
}

function MiniBar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 rounded-full dark:bg-zinc-800 bg-slate-200 overflow-hidden flex-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function MacroCircle({ label, value, unit, color, icon: Icon }: {
  label: string; value: number; unit: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>
        {value}{unit}
      </p>
      <p className="text-xs dark:text-zinc-500 text-slate-400 text-center">{label}</p>
    </div>
  );
}

const scoreConfig = {
  A: { label: 'Excelente', bg: '#10b981', text: 'white' },
  B: { label: 'Bom', bg: '#84cc16', text: 'white' },
  C: { label: 'Regular', bg: '#f59e0b', text: 'white' },
  D: { label: 'Ruim', bg: '#f97316', text: 'white' },
  E: { label: 'Evitar', bg: '#ef4444', text: 'white' },
};

export function FoodModal({ food, onClose }: FoodModalProps) {
  useEffect(() => {
    if (food) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [food]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!food) return null;

  const sc = scoreConfig[food.score];

  return (
    <AnimatePresence>
      {food && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col pointer-events-auto dark:bg-zinc-900 bg-white shadow-2xl border dark:border-zinc-800 border-slate-200"
            >
              {/* Header with image */}
              <div className="relative h-40 flex-shrink-0 overflow-hidden">
                <ImageWithFallback
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Nutriscore badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div
                    className="px-3 py-1 rounded-full flex items-center gap-1.5"
                    style={{ backgroundColor: sc.bg }}
                  >
                    <span className="text-white text-xs" style={{ fontWeight: 800 }}>
                      Nutriscore {food.score}
                    </span>
                    <span className="text-white/80 text-xs">· {sc.label}</span>
                  </div>
                </div>

                {/* Food name */}
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-white" style={{ fontWeight: 700 }}>{food.name}</h2>
                  <p className="text-white/70 text-sm mt-0.5">{food.serving}</p>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-5 space-y-5">

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {food.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-600 border dark:border-zinc-700 border-slate-200"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Calories + 4 main macros */}
                <div className="dark:bg-zinc-800/60 bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <p className="text-sm dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                      Informação Nutricional
                    </p>
                    <span className="ml-auto text-orange-500" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {food.calories} <span className="text-sm dark:text-zinc-500 text-slate-400" style={{ fontWeight: 400 }}>kcal</span>
                    </span>
                  </div>
                  <div className="flex items-stretch gap-2 justify-around">
                    <MacroCircle label="Proteína" value={food.protein} unit="g" color="#3b82f6" icon={Beef} />
                    <div className="w-px dark:bg-zinc-700 bg-slate-200" />
                    <MacroCircle label="Carboidratos" value={food.carbs} unit="g" color="#10b981" icon={Wheat} />
                    <div className="w-px dark:bg-zinc-700 bg-slate-200" />
                    <MacroCircle label="Gordura" value={food.fat} unit="g" color="#f97316" icon={Droplet} />
                    <div className="w-px dark:bg-zinc-700 bg-slate-200" />
                    <MacroCircle label="Fibra" value={food.fiber} unit="g" color="#8b5cf6" icon={Leaf} />
                  </div>
                </div>

                {/* Detailed macros */}
                <div>
                  <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 700 }}>
                    Macros detalhados
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Açúcar', value: food.sugar, unit: 'g', color: '#f59e0b', note: food.sugar > 10 ? '⚠ Alto' : undefined },
                      { label: 'Gordura saturada', value: food.saturatedFat, unit: 'g', color: '#ef4444', note: food.saturatedFat > 5 ? '⚠ Moderar' : undefined },
                      { label: 'Gordura insaturada', value: food.unsaturatedFat, unit: 'g', color: '#10b981' },
                      { label: 'Colesterol', value: food.cholesterol, unit: 'mg', color: '#f97316', max: 300, note: food.cholesterol > 200 ? '⚠ Alto' : undefined },
                      { label: 'Sódio', value: food.sodium, unit: 'mg', color: '#8b5cf6', max: 2300 },
                    ].map(({ label, value, unit, color, note, max = 30 }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs dark:text-zinc-400 text-slate-500 w-36 flex-shrink-0">{label}</span>
                        <MiniBar value={value} color={color} max={max} />
                        <div className="flex items-center gap-1.5 flex-shrink-0 w-28 justify-end">
                          <span className="text-xs dark:text-zinc-300 text-slate-700" style={{ fontWeight: 600 }}>
                            {value}{unit}
                          </span>
                          {note && (
                            <span className="text-xs text-orange-400" style={{ fontWeight: 600 }}>
                              {note}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two columns: Vitamins + Minerals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Vitamins */}
                  <div>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 700 }}>
                      Vitaminas · % VD
                    </p>
                    <div className="space-y-2.5">
                      {food.vitamins.map((v) => (
                        <div key={v.label} className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                            style={{ backgroundColor: v.dv >= 100 ? '#10b981' : v.dv >= 50 ? '#3b82f6' : v.dv >= 20 ? '#8b5cf6' : '#6b7280', fontSize: '9px', fontWeight: 800 }}
                          >
                            {v.shortLabel}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="dark:text-zinc-400 text-slate-500 truncate">{v.label}</span>
                              <span style={{ fontWeight: 700, color: v.dv >= 100 ? '#10b981' : v.dv >= 50 ? '#3b82f6' : 'inherit' }}
                                className="dark:text-zinc-300 text-slate-700 flex-shrink-0 ml-1">
                                {v.dv}%
                              </span>
                            </div>
                            <MiniBar
                              value={v.dv}
                              color={v.dv >= 100 ? '#10b981' : v.dv >= 50 ? '#3b82f6' : v.dv >= 20 ? '#8b5cf6' : '#6b7280'}
                              max={150}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minerals */}
                  <div>
                    <p className="text-xs dark:text-zinc-500 text-slate-400 uppercase tracking-widest mb-3" style={{ fontWeight: 700 }}>
                      Minerais · % VD
                    </p>
                    <div className="space-y-2.5">
                      {food.minerals.map((m) => (
                        <div key={m.label} className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                            style={{ backgroundColor: m.dv >= 30 ? '#f97316' : m.dv >= 15 ? '#f59e0b' : '#6b7280', fontSize: '9px', fontWeight: 800 }}
                          >
                            {m.label.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="dark:text-zinc-400 text-slate-500 truncate">{m.label}</span>
                              <span className="dark:text-zinc-300 text-slate-700 flex-shrink-0 ml-1" style={{ fontWeight: 700 }}>
                                {m.value}{m.unit} <span className="dark:text-zinc-600 text-slate-400" style={{ fontWeight: 400 }}>({m.dv}%)</span>
                              </span>
                            </div>
                            <MiniBar
                              value={m.dv}
                              color={m.dv >= 30 ? '#f97316' : m.dv >= 15 ? '#f59e0b' : '#6b7280'}
                              max={50}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info footer */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                  <Info className="w-3.5 h-3.5 dark:text-zinc-500 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs dark:text-zinc-500 text-slate-400 leading-relaxed">
                    Valores nutricionais aproximados baseados em tabelas de composição de alimentos (TACO/IBGE). % VD = % do Valor Diário com base em uma dieta de 2.000 kcal.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t dark:border-zinc-800 border-slate-200 flex items-center justify-between flex-shrink-0">
                <p className="text-xs dark:text-zinc-500 text-slate-400">
                  Pressione <kbd className="px-1.5 py-0.5 rounded dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-600 text-xs">Esc</kbd> para fechar
                </p>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', fontWeight: 500 }}
                >
                  Entendido
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
