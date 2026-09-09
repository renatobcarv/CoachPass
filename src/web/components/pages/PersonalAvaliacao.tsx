import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, ClipboardList, Plus, Save, X, Users, ChevronDown, ChevronUp,
  Activity, Ruler, Weight, Heart, Zap, Target, CheckCircle, AlertCircle,
  Calendar, Search, Eye, Dumbbell, BarChart3, FileText, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// ── Types ──
interface Measurement {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  arm: number;
  calf: number;
  visceralFat: number;
  hydration: number;
  restingHR: number;
  bloodPressure: string;
  notes: string;
}

interface ParqAnswer { question: string; answer: boolean | null }

const students = [
  { id: '1', name: 'Lucas Silva', avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff' },
  { id: '2', name: 'Maria Santos', avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=fff' },
  { id: '3', name: 'Carlos Ramos', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ramos&background=f59e0b&color=fff' },
  { id: '4', name: 'Ana Oliveira', avatar: 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=8b5cf6&color=fff' },
];

const parqQuestions = [
  'Seu médico já disse alguma vez que você possui algum problema cardíaco e que só deveria fazer atividade física supervisionada por médico?',
  'Você sente dor no peito quando pratica atividade física?',
  'No último mês, você sentiu dor no peito quando praticou atividade física?',
  'Você perdeu o equilíbrio por causa de tontura ou alguma vez perdeu a consciência?',
  'Você tem algum problema ósseo ou articular que poderia piorar com a prática de atividade física?',
  'Seu médico está prescrevendo medicamentos (ex: diuréticos) para sua pressão ou condição cardíaca?',
  'Você tem conhecimento de alguma outra razão pela qual não deveria praticar atividade física?',
];

const mockMeasurements: Measurement[] = [
  {
    id: '1', date: '2025-03-01', studentId: '1', studentName: 'Lucas Silva',
    weight: 78.5, height: 178, bmi: 24.8, bodyFat: 14.2, muscleMass: 65.8,
    chest: 102, waist: 82, hip: 97, thigh: 58, arm: 36, calf: 38,
    visceralFat: 7, hydration: 58.3, restingHR: 62, bloodPressure: '120/80',
    notes: 'Excelente composição corporal. Continuar protocolo de hipertrofia.',
  },
  {
    id: '2', date: '2025-02-01', studentId: '2', studentName: 'Maria Santos',
    weight: 64.2, height: 165, bmi: 23.6, bodyFat: 22.1, muscleMass: 48.3,
    chest: 91, waist: 71, hip: 93, thigh: 54, arm: 29, calf: 35,
    visceralFat: 4, hydration: 60.2, restingHR: 68, bloodPressure: '115/75',
    notes: 'Redução de 1.2kg de gordura no mês. Ótima evolução!',
  },
];

const fieldSets = [
  {
    title: 'Dados Básicos', icon: Users,
    fields: [
      { key: 'weight', label: 'Peso (kg)', type: 'number', step: 0.1, placeholder: '75.5' },
      { key: 'height', label: 'Altura (cm)', type: 'number', step: 1, placeholder: '175' },
    ],
  },
  {
    title: 'Composição Corporal', icon: Activity,
    fields: [
      { key: 'bodyFat', label: 'Gordura Corporal (%)', type: 'number', step: 0.1, placeholder: '15.0' },
      { key: 'muscleMass', label: 'Massa Muscular (kg)', type: 'number', step: 0.1, placeholder: '60.0' },
      { key: 'visceralFat', label: 'Gordura Visceral', type: 'number', step: 1, placeholder: '7' },
      { key: 'hydration', label: 'Hidratação (%)', type: 'number', step: 0.1, placeholder: '58.5' },
    ],
  },
  {
    title: 'Medidas Corporais (cm)', icon: Ruler,
    fields: [
      { key: 'chest', label: 'Peitoral', type: 'number', step: 0.5, placeholder: '100' },
      { key: 'waist', label: 'Cintura', type: 'number', step: 0.5, placeholder: '80' },
      { key: 'hip', label: 'Quadril', type: 'number', step: 0.5, placeholder: '95' },
      { key: 'thigh', label: 'Coxa', type: 'number', step: 0.5, placeholder: '55' },
      { key: 'arm', label: 'Braço', type: 'number', step: 0.5, placeholder: '35' },
      { key: 'calf', label: 'Panturrilha', type: 'number', step: 0.5, placeholder: '37' },
    ],
  },
  {
    title: 'Dados Cardiovasculares', icon: Heart,
    fields: [
      { key: 'restingHR', label: 'FC em Repouso (bpm)', type: 'number', step: 1, placeholder: '65' },
      { key: 'bloodPressure', label: 'Pressão Arterial', type: 'text', step: undefined, placeholder: '120/80' },
    ],
  },
];

export function PersonalAvaliacao() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'nova' | 'historico' | 'parq'>('nova');
  const [measurements, setMeasurements] = useState<Measurement[]>(mockMeasurements);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [parqAnswers, setParqAnswers] = useState<ParqAnswer[]>(
    parqQuestions.map(q => ({ question: q, answer: null }))
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const bmi = formData.weight && formData.height
    ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
    : '—';

  const handleSave = () => {
    if (!selectedStudent) { toast.error('Selecione um aluno'); return; }
    setSaving(true);
    setTimeout(() => {
      const student = students.find(s => s.id === selectedStudent);
      const newM: Measurement = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        studentId: selectedStudent,
        studentName: student?.name || '',
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
        bmi: Number(bmi) || 0,
        bodyFat: Number(formData.bodyFat) || 0,
        muscleMass: Number(formData.muscleMass) || 0,
        chest: Number(formData.chest) || 0,
        waist: Number(formData.waist) || 0,
        hip: Number(formData.hip) || 0,
        thigh: Number(formData.thigh) || 0,
        arm: Number(formData.arm) || 0,
        calf: Number(formData.calf) || 0,
        visceralFat: Number(formData.visceralFat) || 0,
        hydration: Number(formData.hydration) || 0,
        restingHR: Number(formData.restingHR) || 0,
        bloodPressure: formData.bloodPressure || '',
        notes,
      };
      setMeasurements(prev => [newM, ...prev]);
      setSaving(false);
      toast.success('Avaliação registrada com sucesso!');
      setActiveTab('historico');
    }, 1200);
  };

  const parqRisk = parqAnswers.some(a => a.answer === true);
  const parqComplete = parqAnswers.every(a => a.answer !== null);

  const filteredHistory = measurements.filter(m =>
    m.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/personal')} className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="dark:text-white text-slate-900 mb-1">Avaliação Física</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500">Registre avaliações completas dos seus alunos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dark:bg-zinc-900 bg-white rounded-2xl p-1 mb-6 inline-flex border dark:border-zinc-800 border-slate-200">
        {[
          { id: 'nova', label: 'Nova Avaliação', icon: Plus },
          { id: 'historico', label: 'Histórico', icon: BarChart3 },
          { id: 'parq', label: 'PAR-Q', icon: ClipboardList },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === id ? 'text-white shadow-lg' : 'dark:text-zinc-400 text-slate-600 hover:dark:text-white'}`}
            style={activeTab === id ? { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 } : {}}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Nova Avaliação */}
      {activeTab === 'nova' && (
        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          {/* Left: Student & Summary */}
          <div className="space-y-5">
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
              <h3 className="text-sm dark:text-white text-slate-900 mb-4" style={{ fontWeight: 600 }}>Selecionar Aluno</h3>
              <div className="space-y-2">
                {students.map(s => (
                  <button key={s.id} onClick={() => setSelectedStudent(s.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedStudent === s.id ? 'border-blue-500/50' : 'dark:border-zinc-700 border-slate-200 hover:dark:border-zinc-600'}`}
                    style={selectedStudent === s.id ? { background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(29,78,216,0.08))' } : {}}>
                    <img src={s.avatar} className="w-9 h-9 rounded-lg" alt={s.name} />
                    <span className="text-sm dark:text-white text-slate-900" style={{ fontWeight: selectedStudent === s.id ? 600 : 400 }}>{s.name}</span>
                    {selectedStudent === s.id && <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* BMI Preview */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
              <h3 className="text-sm dark:text-white text-slate-900 mb-4" style={{ fontWeight: 600 }}>Resumo Calculado</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs dark:text-zinc-500 text-slate-400">IMC</span>
                  <span className="text-sm text-blue-400" style={{ fontWeight: 700 }}>{bmi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs dark:text-zinc-500 text-slate-400">Peso</span>
                  <span className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{formData.weight || '—'} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs dark:text-zinc-500 text-slate-400">% Gordura</span>
                  <span className="text-sm" style={{ fontWeight: 600, color: Number(formData.bodyFat) > 25 ? '#f59e0b' : '#10b981' }}>{formData.bodyFat || '—'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs dark:text-zinc-500 text-slate-400">Massa Muscular</span>
                  <span className="text-sm text-blue-400" style={{ fontWeight: 600 }}>{formData.muscleMass || '—'} kg</span>
                </div>
              </div>
            </div>

            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 border dark:border-zinc-800 border-slate-200">
              <h3 className="text-sm dark:text-white text-slate-900 mb-3" style={{ fontWeight: 600 }}>Observações</h3>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                placeholder="Observações gerais, recomendações, próximos passos..."
                className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            </div>

            <button onClick={handleSave} disabled={saving || !selectedStudent}
              className="w-full py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', boxShadow: '0 8px 20px rgba(59,130,246,0.3)', fontWeight: 600 }}>
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</> : <><Save className="w-4 h-4" />Salvar Avaliação</>}
            </button>
          </div>

          {/* Right: Form */}
          <div className="space-y-5">
            {fieldSets.map(({ title, icon: Icon, fields }) => (
              <div key={title} className="dark:bg-zinc-900 bg-white rounded-3xl p-6 border dark:border-zinc-800 border-slate-200">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map(({ key, label, type, step, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-1.5">{label}</label>
                      <input type={type} step={step} value={formData[key] || ''} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      {activeTab === 'historico' && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar aluno..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.map(m => (
              <div key={m.id} className="dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 overflow-hidden">
                <button className="w-full flex items-center gap-4 p-5 text-left" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{m.studentName}</p>
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{m.date}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Peso</p>
                      <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 700 }}>{m.weight}kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs dark:text-zinc-500 text-slate-400">IMC</p>
                      <p className="text-sm text-blue-400" style={{ fontWeight: 700 }}>{m.bmi}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs dark:text-zinc-500 text-slate-400">Gordura</p>
                      <p className="text-sm" style={{ fontWeight: 700, color: m.bodyFat > 25 ? '#f59e0b' : '#10b981' }}>{m.bodyFat}%</p>
                    </div>
                  </div>
                  {expandedId === m.id ? <ChevronUp className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {expandedId === m.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 border-t dark:border-zinc-800 border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {[
                            { label: 'Massa Muscular', value: `${m.muscleMass}kg`, color: '#3b82f6' },
                            { label: 'Gordura Visceral', value: m.visceralFat, color: '#ef4444' },
                            { label: 'Hidratação', value: `${m.hydration}%`, color: '#06b6d4' },
                            { label: 'FC Repouso', value: `${m.restingHR}bpm`, color: '#ec4899' },
                            { label: 'Peitoral', value: `${m.chest}cm`, color: '#8b5cf6' },
                            { label: 'Cintura', value: `${m.waist}cm`, color: '#f59e0b' },
                            { label: 'Quadril', value: `${m.hip}cm`, color: '#10b981' },
                            { label: 'Pressão', value: m.bloodPressure, color: '#6b7280' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="dark:bg-zinc-800/50 bg-slate-50 rounded-xl p-3 border dark:border-zinc-700 border-slate-200">
                              <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">{label}</p>
                              <p className="text-sm" style={{ fontWeight: 700, color }}>{value}</p>
                            </div>
                          ))}
                        </div>
                        {m.notes && (
                          <div className="mt-3 p-3 dark:bg-zinc-800/50 bg-slate-50 rounded-xl border dark:border-zinc-700 border-slate-200">
                            <p className="text-xs dark:text-zinc-500 text-slate-400 mb-1">Observações</p>
                            <p className="text-sm dark:text-zinc-300 text-slate-700">{m.notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center py-16 dark:text-zinc-600 text-slate-400">
                <ClipboardList className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhuma avaliação encontrada</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAR-Q */}
      {activeTab === 'parq' && (
        <div className="max-w-3xl">
          <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 border dark:border-zinc-800 border-slate-200 mb-5">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="dark:text-white text-slate-900 mb-1" style={{ fontWeight: 700 }}>PAR-Q — Physical Activity Readiness Questionnaire</h3>
                <p className="text-xs dark:text-zinc-400 text-slate-500 leading-relaxed">
                  Questionário de Prontidão para Atividade Física. Deve ser aplicado antes de qualquer programa de treinamento.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Aluno avaliado</label>
              <select className="w-full px-3 py-2.5 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">Selecione o aluno...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {parqAnswers.map((qa, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border transition-all ${qa.answer === true ? 'dark:bg-red-500/5 dark:border-red-500/20 border-red-200 bg-red-50' : qa.answer === false ? 'dark:bg-zinc-800/50 dark:border-zinc-700 border-slate-200 bg-slate-50' : 'dark:border-zinc-700 border-slate-200'}`}>
                  <p className="text-sm dark:text-zinc-200 text-slate-700 mb-3 leading-relaxed" style={{ fontWeight: 500 }}>
                    <span className="text-xs dark:text-zinc-500 text-slate-400 mr-2">{idx + 1}.</span>
                    {qa.question}
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setParqAnswers(prev => prev.map((a, i) => i === idx ? { ...a, answer: true } : a))}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-all ${qa.answer === true ? 'bg-red-500 text-white border-red-500' : 'dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-red-500 hover:border-red-400'}`} style={{ fontWeight: 600 }}>
                      Sim
                    </button>
                    <button onClick={() => setParqAnswers(prev => prev.map((a, i) => i === idx ? { ...a, answer: false } : a))}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-all ${qa.answer === false ? 'bg-emerald-500 text-white border-emerald-500' : 'dark:border-zinc-600 border-slate-300 dark:text-zinc-400 text-slate-600 hover:dark:border-emerald-500 hover:border-emerald-400'}`} style={{ fontWeight: 600 }}>
                      Não
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {parqComplete && (
              <div className={`mt-5 p-4 rounded-2xl border ${parqRisk ? 'dark:bg-red-500/10 dark:border-red-500/30 bg-red-50 border-red-200' : 'dark:bg-emerald-500/10 dark:border-emerald-500/30 bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-start gap-3">
                  {parqRisk ? <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" /> : <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />}
                  <div>
                    <p className="text-sm" style={{ fontWeight: 700, color: parqRisk ? '#f87171' : '#34d399' }}>
                      {parqRisk ? 'Atenção: Consulta Médica Recomendada' : 'Aprovado para Treinamento'}
                    </p>
                    <p className="text-xs mt-1 dark:text-zinc-400 text-slate-500">
                      {parqRisk
                        ? 'O aluno respondeu SIM a uma ou mais perguntas. Recomende consulta médica antes de iniciar o programa de treinamento.'
                        : 'O aluno está apto para iniciar um programa de atividade física supervisionada.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => toast.success('PAR-Q salvo com sucesso!')} className="mt-5 w-full py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', fontWeight: 600 }}>
              <Save className="w-4 h-4" /> Salvar PAR-Q
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
