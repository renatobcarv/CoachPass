import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ClipboardList,
  User,
  Heart,
  Utensils,
  Activity,
  Moon,
  Brain,
  Save,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  AlertCircle,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  fields: Field[];
}

interface Field {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
  options?: string[];
  placeholder?: string;
}

const sections: Section[] = [
  {
    id: 'personal',
    title: 'Dados Pessoais',
    icon: User,
    color: '#3b82f6',
    fields: [
      { id: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Ex: Maria Silva' },
      { id: 'birthdate', label: 'Data de Nascimento', type: 'text', placeholder: 'DD/MM/AAAA' },
      { id: 'profession', label: 'Profissão', type: 'text', placeholder: 'Ex: Professora' },
      { id: 'marital', label: 'Estado Civil', type: 'select', options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'] },
      { id: 'education', label: 'Escolaridade', type: 'select', options: ['Fundamental', 'Médio', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação'] },
      { id: 'income', label: 'Renda Familiar', type: 'select', options: ['Até R$2.000', 'R$2.000–R$5.000', 'R$5.000–R$10.000', 'Acima de R$10.000'] },
    ],
  },
  {
    id: 'health',
    title: 'Histórico de Saúde',
    icon: Heart,
    color: '#ef4444',
    fields: [
      { id: 'pathologies', label: 'Patologias Atuais', type: 'textarea', placeholder: 'Ex: Diabetes tipo 2, Hipertensão, Hipotireoidismo...' },
      { id: 'medications', label: 'Medicamentos em Uso', type: 'textarea', placeholder: 'Liste os medicamentos e dosagens' },
      { id: 'supplements', label: 'Suplementos', type: 'textarea', placeholder: 'Ex: Whey Protein 30g/dia, Vitamina D 2000UI...' },
      { id: 'surgeries', label: 'Cirurgias Anteriores', type: 'textarea', placeholder: 'Liste cirurgias realizadas e datas aproximadas' },
      { id: 'family_history', label: 'Histórico Familiar', type: 'textarea', placeholder: 'Doenças prevalentes na família' },
      { id: 'blood_pressure', label: 'Pressão Arterial (mmHg)', type: 'text', placeholder: 'Ex: 120/80' },
      { id: 'fasting_glucose', label: 'Glicemia em Jejum (mg/dL)', type: 'number', placeholder: 'Ex: 90' },
      { id: 'cholesterol', label: 'Colesterol Total (mg/dL)', type: 'number', placeholder: 'Ex: 180' },
    ],
  },
  {
    id: 'diet',
    title: 'Hábitos Alimentares',
    icon: Utensils,
    color: '#f59e0b',
    fields: [
      { id: 'meals_per_day', label: 'Refeições por Dia', type: 'select', options: ['1-2 refeições', '3 refeições', '4-5 refeições', '6 ou mais'] },
      { id: 'appetite', label: 'Apetite', type: 'radio', options: ['Diminuído', 'Normal', 'Aumentado', 'Compulsivo'] },
      { id: 'water_intake', label: 'Ingestão de Água (L/dia)', type: 'select', options: ['Menos de 1L', '1-1,5L', '2L', 'Mais de 2L'] },
      { id: 'allergies', label: 'Alergias Alimentares', type: 'textarea', placeholder: 'Ex: Amendoim, Castanhas, Frutos do mar...' },
      { id: 'intolerances', label: 'Intolerâncias', type: 'textarea', placeholder: 'Ex: Lactose, Glúten, Frutose...' },
      { id: 'food_aversions', label: 'Aversões Alimentares', type: 'textarea', placeholder: 'Alimentos que não gosta' },
      { id: 'preferred_foods', label: 'Alimentos Preferidos', type: 'textarea', placeholder: 'Alimentos que mais gosta' },
      { id: 'restrictive_diet', label: 'Segue Alguma Dieta Específica?', type: 'radio', options: ['Não', 'Vegetariano', 'Vegano', 'Low Carb', 'Cetogênica', 'Outra'] },
      { id: 'alcohol', label: 'Consumo de Álcool', type: 'select', options: ['Não consome', 'Raramente', 'Fins de semana', 'Semanalmente', 'Diariamente'] },
      { id: 'smoking', label: 'Tabagismo', type: 'radio', options: ['Não fumante', 'Ex-fumante', 'Fumante ocasional', 'Fumante regular'] },
    ],
  },
  {
    id: 'physical',
    title: 'Atividade Física',
    icon: Activity,
    color: '#10b981',
    fields: [
      { id: 'exercises', label: 'Pratica Exercícios?', type: 'radio', options: ['Não', 'Sim – Aeróbico', 'Sim – Musculação', 'Sim – Ambos'] },
      { id: 'exercise_frequency', label: 'Frequência Semanal', type: 'select', options: ['Não pratica', '1-2x', '3-4x', '5-6x', 'Todos os dias'] },
      { id: 'exercise_duration', label: 'Duração das Sessões', type: 'select', options: ['30 min', '45 min', '1 hora', 'Mais de 1 hora'] },
      { id: 'activity_level', label: 'Nível de Atividade', type: 'select', options: ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'] },
      { id: 'work_type', label: 'Tipo de Trabalho', type: 'radio', options: ['Sentado', 'Em pé', 'Atividade física moderada', 'Atividade física intensa'] },
    ],
  },
  {
    id: 'sleep',
    title: 'Sono e Qualidade de Vida',
    icon: Moon,
    color: '#8b5cf6',
    fields: [
      { id: 'sleep_hours', label: 'Horas de Sono por Noite', type: 'select', options: ['Menos de 5h', '5-6h', '6-7h', '7-8h', 'Mais de 8h'] },
      { id: 'sleep_quality', label: 'Qualidade do Sono', type: 'radio', options: ['Ruim', 'Regular', 'Boa', 'Ótima'] },
      { id: 'stress_level', label: 'Nível de Estresse', type: 'radio', options: ['Baixo', 'Moderado', 'Alto', 'Muito alto'] },
      { id: 'bowel_habits', label: 'Hábito Intestinal', type: 'select', options: ['Diário normal', 'Constipado', 'Diarreia frequente', 'Irregular'] },
      { id: 'energy_level', label: 'Nível de Energia no Dia a Dia', type: 'radio', options: ['Muito baixo', 'Baixo', 'Normal', 'Alto'] },
    ],
  },
  {
    id: 'goals',
    title: 'Objetivos e Expectativas',
    icon: Brain,
    color: '#06b6d4',
    fields: [
      { id: 'main_goal', label: 'Objetivo Principal', type: 'select', options: ['Emagrecimento', 'Ganho de Massa Muscular', 'Manutenção do Peso', 'Saúde e Bem-estar', 'Controle de Patologia', 'Performance Esportiva', 'Outro'] },
      { id: 'goal_weight', label: 'Peso Desejado (kg)', type: 'number', placeholder: 'Ex: 65' },
      { id: 'motivation', label: 'Motivação para Mudança', type: 'textarea', placeholder: 'O que motivou a buscar acompanhamento nutricional?' },
      { id: 'previous_diets', label: 'Dietas Anteriores', type: 'textarea', placeholder: 'Já fez acompanhamento nutricional antes? Como foi?' },
      { id: 'expectations', label: 'Expectativas', type: 'textarea', placeholder: 'O que espera alcançar com o acompanhamento?' },
    ],
  },
];

const templates = [
  { id: 'webdiet', name: 'Modelo WebDiet Completo', sections: 6, color: '#10b981' },
  { id: 'emagrecimento', name: 'Foco em Emagrecimento', sections: 4, color: '#f59e0b' },
  { id: 'esportista', name: 'Atletas e Esportistas', sections: 5, color: '#3b82f6' },
  { id: 'patologia', name: 'Controle de Patologias', sections: 5, color: '#ef4444' },
];

export function NutritionistAnamnese() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['personal']);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [savedSections, setSavedSections] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('webdiet');

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveSection = (sectionId: string) => {
    setSavedSections((prev) => [...new Set([...prev, sectionId])]);
  };

  const completionPct = Math.round((savedSections.length / sections.length) * 100);

  return (
    <div className="p-4 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/nutritionist')}
        className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </button>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h1 className="dark:text-white text-slate-900">Anamnese Completa</h1>
          </div>
          <p className="text-sm dark:text-zinc-400 text-slate-500">
            Coleta completa do histórico de saúde e hábitos do paciente
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:border-zinc-500 transition-all"
          >
            <FileText className="w-4 h-4" />
            Modelos
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', fontWeight: 600 }}
          >
            <Sparkles className="w-4 h-4" />
            Preencher com IA
          </button>
        </div>
      </div>

      {/* Templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200"
          >
            <p className="text-sm dark:text-zinc-400 text-slate-500 mb-4" style={{ fontWeight: 600 }}>
              Selecione um modelo de anamnese
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setShowTemplates(false); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedTemplate === t.id
                      ? 'border-emerald-500/50 dark:bg-emerald-500/5 bg-emerald-50'
                      : 'dark:border-zinc-700 border-slate-200 dark:hover:border-zinc-500 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: `${t.color}20` }}>
                    <ClipboardList className="w-4 h-4" style={{ color: t.color }} />
                  </div>
                  <p className="text-xs dark:text-white text-slate-900 mb-1" style={{ fontWeight: 600 }}>{t.name}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{t.sections} seções</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="dark:bg-zinc-900 bg-white rounded-3xl p-5 dark:border-zinc-800 border border-slate-200 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>
            Progresso da Anamnese
          </p>
          <span className="text-sm text-emerald-500" style={{ fontWeight: 700 }}>{completionPct}%</span>
        </div>
        <div className="w-full h-2 dark:bg-zinc-800 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#10b981,#059669)' }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              {savedSections.includes(s.id) ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Circle className="w-3.5 h-3.5 dark:text-zinc-600 text-slate-300" />
              )}
              <span className="text-xs dark:text-zinc-400 text-slate-500">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);
          const isSaved = savedSections.includes(section.id);

          return (
            <div
              key={section.id}
              className="dark:bg-zinc-900 bg-white rounded-3xl dark:border-zinc-800 border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:dark:bg-zinc-800/30 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${section.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{section.title}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">{section.fields.length} campos</p>
                </div>
                {isSaved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-500 mr-2" style={{ fontWeight: 600 }}>
                    <CheckCircle className="w-3.5 h-3.5" /> Salvo
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 dark:text-zinc-500 text-slate-400 flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 border-t dark:border-zinc-800 border-slate-100 pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields.map((field) => (
                          <div
                            key={field.id}
                            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                          >
                            <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2" style={{ fontWeight: 500 }}>
                              {field.label}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                              />
                            ) : field.type === 'select' ? (
                              <select
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none"
                              >
                                <option value="">Selecione...</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : field.type === 'radio' ? (
                              <div className="flex flex-wrap gap-2">
                                {field.options?.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleChange(field.id, opt)}
                                    className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                                      formData[field.id] === opt
                                        ? 'text-white border-transparent'
                                        : 'dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:dark:border-zinc-500'
                                    }`}
                                    style={formData[field.id] === opt ? { backgroundColor: section.color, fontWeight: 600 } : {}}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <input
                                type={field.type}
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 dark:border-zinc-700 border border-slate-200 dark:text-zinc-200 text-slate-700 dark:placeholder:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-5">
                        <button
                          onClick={() => handleSaveSection(section.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
                          style={{ background: `linear-gradient(135deg,${section.color},${section.color}cc)`, fontWeight: 600 }}
                        >
                          <Save className="w-4 h-4" />
                          Salvar Seção
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Save All */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => navigate('/nutritionist')}
          className="px-6 py-3 rounded-xl text-sm border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:border-zinc-500 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={() => { setSavedSections(sections.map(s => s.id)); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)', fontWeight: 600 }}
        >
          <Save className="w-4 h-4" />
          Salvar Anamnese Completa
        </button>
      </div>
    </div>
  );
}
