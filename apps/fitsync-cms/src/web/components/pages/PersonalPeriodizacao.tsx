import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, BarChart3, Plus, X, Save, ChevronDown, ChevronUp,
  Dumbbell, Target, Zap, TrendingUp, Users, Calendar, Flame,
  CheckCircle, Clock, Activity, MoreVertical, Trash2, Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Block {
  id: string;
  name: string;
  objective: 'adaptacao' | 'hipertrofia' | 'forca' | 'potencia' | 'resistencia' | 'definicao';
  weeks: number;
  sessionsPerWeek: number;
  volumeLevel: 'low' | 'medium' | 'high' | 'very_high';
  intensityLevel: 'low' | 'medium' | 'high' | 'very_high';
  restDays: number;
  notes: string;
  color: string;
}

interface Plan {
  id: string;
  name: string;
  studentId: string;
  studentName: string;
  startDate: string;
  blocks: Block[];
  notes: string;
  status: 'active' | 'draft' | 'completed';
}

const students = [
  { id: '1', name: 'Lucas Silva', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '2', name: 'Maria Santos', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
  { id: '3', name: 'Carlos Ramos', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff' },
  { id: '4', name: 'Ana Oliveira', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff' },
];

const objectiveConfig = {
  adaptacao: { label: 'Adaptação', color: '#06b6d4', icon: '🌱' },
  hipertrofia: { label: 'Hipertrofia', color: '#3b82f6', icon: '💪' },
  forca: { label: 'Força Máxima', color: '#ef4444', icon: '🏋️' },
  potencia: { label: 'Potência', color: '#f59e0b', icon: '⚡' },
  resistencia: { label: 'Resistência', color: '#10b981', icon: '🏃' },
  definicao: { label: 'Definição', color: '#8b5cf6', icon: '🔥' },
};

const levelConfig = {
  low: { label: 'Baixo', w: '25%' },
  medium: { label: 'Médio', w: '50%' },
  high: { label: 'Alto', w: '75%' },
  very_high: { label: 'Muito Alto', w: '100%' },
};

const blockColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];

const mockPlans: Plan[] = [
  {
    id: '1', name: 'Macrociclo Hipertrofia – Lucas', studentId: '1', studentName: 'Lucas Silva',
    startDate: '2025-01-06', status: 'active', notes: 'Foco em ganho de massa. Progredir cargas semanalmente.',
    blocks: [
      { id: 'b1', name: 'Fase 1 – Adaptação', objective: 'adaptacao', weeks: 3, sessionsPerWeek: 3, volumeLevel: 'low', intensityLevel: 'low', restDays: 4, notes: 'Aprender os padrões de movimento', color: '#06b6d4' },
      { id: 'b2', name: 'Fase 2 – Hipertrofia Base', objective: 'hipertrofia', weeks: 6, sessionsPerWeek: 4, volumeLevel: 'high', intensityLevel: 'medium', restDays: 3, notes: 'Volume elevado para estímulo hipertrófico', color: '#3b82f6' },
      { id: 'b3', name: 'Fase 3 – Força', objective: 'forca', weeks: 4, sessionsPerWeek: 4, volumeLevel: 'medium', intensityLevel: 'very_high', restDays: 3, notes: 'Intensidade máxima, menos volume', color: '#ef4444' },
      { id: 'b4', name: 'Deload', objective: 'adaptacao', weeks: 1, sessionsPerWeek: 3, volumeLevel: 'low', intensityLevel: 'low', restDays: 4, notes: 'Recuperação ativa', color: '#10b981' },
    ],
  },
];

const defaultBlock = (): Block => ({
  id: Date.now().toString(), name: '', objective: 'hipertrofia', weeks: 4,
  sessionsPerWeek: 4, volumeLevel: 'medium', intensityLevel: 'medium', restDays: 3,
  notes: '', color: blockColors[Math.floor(Math.random() * blockColors.length)],
});

export function PersonalPeriodizacao() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [activeTab, setActiveTab] = useState<'plans' | 'new'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(mockPlans[0] || null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // New plan form
  const [newPlan, setNewPlan] = useState({ name: '', studentId: '', startDate: '', notes: '' });
  const [newBlocks, setNewBlocks] = useState<Block[]>([defaultBlock()]);

  const totalWeeks = (blocks: Block[]) => blocks.reduce((s, b) => s + b.weeks, 0);
  const totalSessions = (blocks: Block[]) => blocks.reduce((s, b) => s + b.sessionsPerWeek * b.weeks, 0);

  const addBlock = () => setNewBlocks(prev => [...prev, defaultBlock()]);
  const removeBlock = (id: string) => setNewBlocks(prev => prev.filter(b => b.id !== id));
  const updateBlock = (id: string, updates: Partial<Block>) =>
    setNewBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

  const savePlan = () => {
    if (!newPlan.name || !newPlan.studentId) { toast.error('Preencha nome e aluno'); return; }
    const student = students.find(s => s.id === newPlan.studentId)!;
    const plan: Plan = {
      id: Date.now().toString(), name: newPlan.name, studentId: newPlan.studentId,
      studentName: student.name, startDate: newPlan.startDate, blocks: newBlocks,
      notes: newPlan.notes, status: 'active',
    };
    setPlans(prev => [plan, ...prev]);
    setSelectedPlan(plan);
    setActiveTab('plans');
    toast.success('Periodização salva!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Periodização</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Planejamento de macrociclos, mesociclos e microciclos</p>
          </div>
          <button onClick={() => setActiveTab('new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Nova Periodização
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex border dark:border-zinc-800 border-slate-200">
        {[
          { id: 'plans', label: 'Meus Planos' },
          { id: 'new', label: 'Novo Macrociclo' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#f97316,#ea580c)', fontWeight: 600 } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Plans view */}
      {activeTab === 'plans' && (
        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          {/* Plan list */}
          <div className="space-y-3">
            {plans.map(plan => (
              <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedPlan?.id === plan.id ? 'border-orange-500/50' : 'dark:bg-zinc-900 bg-white dark:border-zinc-800 border-slate-200 hover:dark:border-zinc-600'}`}
                style={selectedPlan?.id === plan.id ? { background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(234,88,12,0.06))' } : {}}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{plan.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : plan.status === 'draft' ? 'bg-zinc-500/10 text-zinc-400' : 'bg-blue-500/10 text-blue-400'}`} style={{ fontWeight: 600 }}>
                    {plan.status === 'active' ? 'Ativo' : plan.status === 'draft' ? 'Rascunho' : 'Concluído'}
                  </span>
                </div>
                <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2">{plan.studentName}</p>
                <div className="flex items-center gap-3 text-xs dark:text-zinc-600 text-slate-400">
                  <span>{plan.blocks.length} blocos</span>
                  <span>·</span>
                  <span>{totalWeeks(plan.blocks)} semanas</span>
                </div>
              </button>
            ))}
            {plans.length === 0 && (
              <div className="text-center py-10 dark:text-zinc-600 text-slate-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum plano criado</p>
              </div>
            )}
          </div>

          {/* Plan detail */}
          {selectedPlan ? (
            <div className="space-y-5">
              {/* Summary */}
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 border dark:border-zinc-800 border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>{selectedPlan.name}</h3>
                    <p className="text-sm dark:text-zinc-400 text-slate-500">{selectedPlan.studentName}</p>
                  </div>
                  <div className="flex gap-3 text-center">
                    {[
                      { label: 'Semanas', value: totalWeeks(selectedPlan.blocks), color: '#f97316' },
                      { label: 'Blocos', value: selectedPlan.blocks.length, color: '#3b82f6' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-3 border dark:border-zinc-700 border-slate-200 min-w-[60px]">
                        <p className="text-xl" style={{ fontWeight: 800, color }}>{value}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline visualization */}
                <div className="mb-4">
                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>Timeline do Macrociclo</p>
                  <div className="flex rounded-xl overflow-hidden h-10">
                    {selectedPlan.blocks.map(block => {
                      const total = totalWeeks(selectedPlan.blocks);
                      const pct = (block.weeks / total) * 100;
                      return (
                        <div key={block.id} className="flex items-center justify-center text-white text-xs overflow-hidden" style={{ width: `${pct}%`, backgroundColor: block.color, fontWeight: 600 }}>
                          {pct > 10 ? `${block.weeks}s` : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex mt-2 flex-wrap gap-2">
                    {selectedPlan.blocks.map(block => (
                      <div key={block.id} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: block.color }} />
                        <span className="text-xs dark:text-zinc-400 text-slate-500">{block.name} ({block.weeks}s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blocks */}
              <div className="space-y-4">
                {selectedPlan.blocks.map((block, idx) => (
                  <div key={block.id} className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4" style={{ borderLeft: `4px solid ${block.color}` }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        {objectiveConfig[block.objective].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{block.name}</p>
                        <p className="text-xs dark:text-zinc-500 text-slate-400">{objectiveConfig[block.objective].label} · {block.weeks} semana{block.weeks !== 1 ? 's' : ''} · {block.sessionsPerWeek}× / semana</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden md:flex items-center gap-4">
                          <div>
                            <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">Volume</p>
                            <div className="w-16 h-1.5 dark:bg-zinc-700 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: levelConfig[block.volumeLevel].w, backgroundColor: block.color }} />
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: block.color, fontWeight: 600 }}>{levelConfig[block.volumeLevel].label}</p>
                          </div>
                          <div>
                            <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">Intensidade</p>
                            <div className="w-16 h-1.5 dark:bg-zinc-700 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: levelConfig[block.intensityLevel].w, backgroundColor: block.color }} />
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: block.color, fontWeight: 600 }}>{levelConfig[block.intensityLevel].label}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {block.notes && (
                      <div className="px-5 pb-4">
                        <p className="text-xs dark:text-zinc-500 text-slate-400">{block.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedPlan.notes && (
                <div className="dark:bg-zinc-900 bg-white rounded-2xl p-4 border dark:border-zinc-800 border-slate-200">
                  <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">Observações</p>
                  <p className="text-sm dark:text-zinc-300 text-slate-700">{selectedPlan.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 dark:text-zinc-600 text-slate-400">
              <BarChart3 className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Selecione um plano para visualizar</p>
            </div>
          )}
        </div>
      )}

      {/* New plan */}
      {activeTab === 'new' && (
        <div className="grid lg:grid-cols-[300px,1fr] gap-6">
          {/* Config */}
          <div className="space-y-5">
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
              <h3 className="text-sm dark:text-white text-slate-900 mb-4" style={{ fontWeight: 600 }}>Informações do Plano</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Nome do macrociclo *</label>
                  <input type="text" value={newPlan.name} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Macrociclo Hipertrofia – Fase 1"
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Aluno *</label>
                  <select value={newPlan.studentId} onChange={e => setNewPlan(p => ({ ...p, studentId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                    <option value="">Selecione...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Data de início</label>
                  <input type="date" value={newPlan.startDate} onChange={e => setNewPlan(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Observações</label>
                  <textarea value={newPlan.notes} onChange={e => setNewPlan(p => ({ ...p, notes: e.target.value }))} rows={3}
                    placeholder="Objetivos gerais, contexto do atleta..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none resize-none" />
                </div>
              </div>
            </div>

            <div className="dark:bg-orange-500/5 bg-orange-50 rounded-2xl p-4 border dark:border-orange-500/20 border-orange-200">
              <p className="text-xs dark:text-orange-400 text-orange-600 mb-1" style={{ fontWeight: 700 }}>Resumo</p>
              <p className="text-2xl text-orange-500 mb-1" style={{ fontWeight: 800 }}>{totalWeeks(newBlocks)} semanas</p>
              <p className="text-xs dark:text-zinc-400 text-slate-500">{newBlocks.length} blocos planejados</p>
            </div>

            <button onClick={savePlan}
              className="w-full py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', fontWeight: 600 }}>
              <Save className="w-4 h-4" /> Salvar Periodização
            </button>
          </div>

          {/* Blocks editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="dark:text-white text-slate-900" style={{ fontWeight: 700 }}>Blocos de Treinamento</h3>
              <button onClick={addBlock}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:border-orange-500 hover:dark:text-orange-400 transition-all" style={{ fontWeight: 600 }}>
                <Plus className="w-3.5 h-3.5" /> Adicionar Bloco
              </button>
            </div>

            {/* Timeline preview */}
            {newBlocks.length > 0 && (
              <div className="dark:bg-zinc-900 bg-white rounded-2xl p-4 border dark:border-zinc-800 border-slate-200">
                <p className="text-xs dark:text-zinc-500 text-slate-400 mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>Preview do Macrociclo</p>
                <div className="flex rounded-xl overflow-hidden h-8">
                  {newBlocks.map(block => {
                    const total = Math.max(1, totalWeeks(newBlocks));
                    return (
                      <div key={block.id} className="flex items-center justify-center text-white text-xs" style={{ width: `${(block.weeks / total) * 100}%`, backgroundColor: block.color, fontWeight: 600, minWidth: 2 }}>
                        {(block.weeks / total) * 100 > 8 ? `${block.weeks}s` : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {newBlocks.map((block, idx) => (
                <div key={block.id} className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b dark:border-zinc-800 border-slate-200">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${block.color}20` }}>
                      <span className="text-sm">{objectiveConfig[block.objective].icon}</span>
                    </div>
                    <p className="text-sm dark:text-zinc-400 text-slate-500 flex-1">Bloco {idx + 1}</p>
                    <div className="flex gap-1">
                      {blockColors.map(c => (
                        <button key={c} onClick={() => updateBlock(block.id, { color: c })}
                          className={`w-4 h-4 rounded-full border-2 ${block.color === c ? 'border-white scale-125' : 'border-transparent'} transition-transform`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <button onClick={() => removeBlock(block.id)} className="w-7 h-7 rounded-lg dark:bg-red-500/10 bg-red-50 flex items-center justify-center text-red-400 hover:dark:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Nome do bloco</label>
                      <input type="text" value={block.name} onChange={e => updateBlock(block.id, { name: e.target.value })}
                        placeholder="Ex: Fase 1 – Adaptação"
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                    </div>

                    <div>
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Objetivo</label>
                      <select value={block.objective} onChange={e => updateBlock(block.id, { objective: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                        {Object.entries(objectiveConfig).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Semanas</label>
                      <input type="number" min={1} max={16} value={block.weeks} onChange={e => updateBlock(block.id, { weeks: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                    </div>

                    <div>
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Sessões / semana</label>
                      <div className="flex gap-1">
                        {[2,3,4,5,6].map(n => (
                          <button key={n} onClick={() => updateBlock(block.id, { sessionsPerWeek: n })}
                            className={`flex-1 py-2 rounded-lg text-xs border transition-all ${block.sessionsPerWeek === n ? 'text-white border-transparent' : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600'}`}
                            style={block.sessionsPerWeek === n ? { backgroundColor: block.color, fontWeight: 700 } : {}}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Volume</label>
                      <select value={block.volumeLevel} onChange={e => updateBlock(block.id, { volumeLevel: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                        <option value="low">Baixo</option><option value="medium">Médio</option><option value="high">Alto</option><option value="very_high">Muito Alto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Intensidade</label>
                      <select value={block.intensityLevel} onChange={e => updateBlock(block.id, { intensityLevel: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none">
                        <option value="low">Baixo</option><option value="medium">Médio</option><option value="high">Alto</option><option value="very_high">Muito Alto</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">Notas do bloco</label>
                      <input type="text" value={block.notes} onChange={e => updateBlock(block.id, { notes: e.target.value })}
                        placeholder="Estratégia, progressão de cargas..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addBlock}
              className="w-full py-3 rounded-2xl border-2 border-dashed dark:border-zinc-700 border-slate-300 dark:text-zinc-500 text-slate-400 hover:dark:border-orange-500 hover:dark:text-orange-400 transition-all text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar Bloco
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
