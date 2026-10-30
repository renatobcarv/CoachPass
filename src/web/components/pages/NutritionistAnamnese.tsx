import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, ArrowLeft, Brain, Check, Heart, Moon, Sparkles, User, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { CTAButton } from '../brand/Brand';
import { Page, PageHeader, SoonButton } from '../student/ui';
import { FieldLabel, MobileActionBar, Segmented } from '../pro/ui';

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
    color: '#5a64b4',
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
  { id: 'webdiet', name: 'Modelo WebDiet Completo', sections: 6, color: '#5a64b4' },
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

  const [active, setActive] = useState(sections[0].id);
  const idx = sections.findIndex((s) => s.id === active);
  const section = sections[idx];
  const filledIn = (s: Section) => s.fields.filter((f) => (formData[f.id] ?? '').trim() !== '').length;
  const totalFilled = sections.reduce((n, s) => n + filledIn(s), 0);
  const totalFields = sections.reduce((n, s) => n + s.fields.length, 0);

  const goTo = (id: string) => {
    setActive(id);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveAndNext = () => {
    handleSaveSection(section.id);
    const next = sections[idx + 1];
    if (next) {
      toast.success(`${section.title} salvo`, { description: `Próximo: ${next.title}` });
      goTo(next.id);
    } else {
      toast.success('Anamnese concluída', { description: 'Todas as seções foram preenchidas.' });
    }
  };

  const finish = () => {
    setSavedSections(sections.map((s) => s.id));
    toast.success('Anamnese concluída', { description: `${totalFilled} de ${totalFields} respostas preenchidas.` });
    navigate('/nutritionist');
  };

  const SectionIcon = section.icon;

  return (
    <Page wide>
      <PageHeader
        kicker="Anamnese nutricional"
        title="Conheça o paciente"
        accent="antes do plano."
        lead="Histórico de saúde, hábitos, rotina e objetivos — preencha por etapas, na ordem que preferir."
        action={<SoonButton icon={Sparkles}>Preencher com IA</SoonButton>}
      />

      {/* Modelo */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="cp-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Modelo</span>
        <Segmented
          size="sm"
          layoutId="anamnese-template"
          value={selectedTemplate}
          onChange={(v) => setSelectedTemplate(v)}
          options={templates.map((t) => ({ value: t.id, label: t.name }))}
        />
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Navegação das seções */}
        <aside className="lg:sticky lg:top-6 rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
          <span aria-hidden className="cp-modal-bar" />
          <div className="p-5 border-b border-[var(--line)]">
            <div className="flex items-end justify-between">
              <div>
                <p className="cp-kicker">Progresso</p>
                <p className="cp-display mt-1 text-[34px] font-bold leading-none">
                  {completionPct}
                  <span className="text-[16px] text-[var(--muted)]">%</span>
                </p>
              </div>
              <p className="cp-mono text-[11px] text-[var(--dim)] text-right">
                {savedSections.length}/{sections.length} seções
                <br />
                {totalFilled}/{totalFields} respostas
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#2a14e0,#5546ff,#8c82ff)' }} animate={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <ol className="p-2 flex lg:block gap-1 overflow-x-auto">
            {sections.map((s, i) => {
              const Icon = s.icon;
              const on = s.id === active;
              const saved = savedSections.includes(s.id);
              const filled = filledIn(s);
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(s.id)}
                    aria-current={on ? 'step' : undefined}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                      on ? 'bg-[rgba(85,70,255,0.14)]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 shrink-0 rounded-xl grid place-items-center ${
                        saved ? 'bg-[rgba(46,230,200,0.12)] text-[var(--teal)]' : on ? 'cp-selected' : 'bg-white/[0.05] text-[var(--muted)]'
                      }`}
                    >
                      {saved ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                    </span>
                    <span className="min-w-0 hidden lg:block">
                      <span className={`block text-[14px] font-medium leading-tight ${on ? 'text-white' : 'text-[var(--cream)]'}`}>
                        <span className="cp-mono text-[11px] text-[var(--dim)] mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                        {s.title}
                      </span>
                      <span className="cp-mono text-[11px] text-[var(--dim)]">
                        {filled}/{s.fields.length} respondidas
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Seção ativa */}
        <AnimatePresence mode="wait">
          <motion.section
            key={section.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden"
          >
            <header className="p-5 sm:p-6 border-b border-[var(--line)] flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl grid place-items-center bg-[rgba(85,70,255,0.16)] border border-[rgba(140,130,255,0.3)]">
                <SectionIcon className="w-5 h-5 text-[var(--brand-300)]" />
              </span>
              <div className="min-w-0">
                <p className="cp-mono text-[11px] text-[var(--dim)]">
                  Etapa {idx + 1} de {sections.length}
                </p>
                <h2 className="cp-display text-[22px] font-bold leading-tight">{section.title}</h2>
              </div>
            </header>

            <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-x-5 gap-y-6">
              {section.fields.map((field) => {
                const value = formData[field.id] ?? '';
                const wide = field.type === 'textarea' || field.type === 'radio' || (field.options?.length ?? 0) > 4;
                const useChips = field.type === 'radio' || (field.type === 'select' && (field.options?.length ?? 0) <= 5);
                return (
                  <div key={field.id} className={wide ? 'md:col-span-2' : ''}>
                    <FieldLabel htmlFor={useChips ? undefined : `an-${field.id}`}>{field.label}</FieldLabel>
                    {useChips ? (
                      <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-2">
                        {field.options!.map((opt) => {
                          const on = value === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              onClick={() => handleChange(field.id, on ? '' : opt)}
                              className={`h-10 px-4 rounded-full border text-[13.5px] font-medium transition-colors ${
                                on ? 'cp-selected border-transparent' : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.04]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={`an-${field.id}`}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="cp-field cp-field-plain h-12"
                      >
                        <option value="">Selecione…</option>
                        {field.options!.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={`an-${field.id}`}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        maxLength={1000}
                        className="cp-field"
                      />
                    ) : (
                      <input
                        id={`an-${field.id}`}
                        type="text"
                        inputMode={field.type === 'number' ? 'decimal' : undefined}
                        value={value}
                        onChange={(e) =>
                          handleChange(field.id, field.type === 'number' ? e.target.value.replace(/[^\d.,]/g, '').slice(0, 6) : e.target.value)
                        }
                        placeholder={field.placeholder}
                        maxLength={field.type === 'number' ? 6 : 120}
                        className="cp-field cp-field-plain h-12"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <footer className="p-5 sm:p-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => idx > 0 && goTo(sections[idx - 1].id)}
                disabled={idx === 0}
                className="h-11 px-4 rounded-full inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              <div className="flex flex-wrap gap-3">
                {idx === sections.length - 1 ? (
                  <CTAButton type="button" onClick={finish}>
                    Concluir anamnese
                  </CTAButton>
                ) : (
                  <CTAButton type="button" onClick={saveAndNext}>
                    Salvar e continuar
                  </CTAButton>
                )}
              </div>
            </footer>
          </motion.section>
        </AnimatePresence>
      </div>

      <MobileActionBar>
        <p className="text-[13px] text-[var(--muted)]">
          <span className="text-white font-semibold">{idx + 1}</span>/{sections.length} · {section.title}
        </p>
        <button
          type="button"
          onClick={idx === sections.length - 1 ? finish : saveAndNext}
          className="cp-selected h-10 px-5 rounded-full text-[14px] font-semibold"
        >
          {idx === sections.length - 1 ? 'Concluir' : 'Próxima'}
        </button>
      </MobileActionBar>
    </Page>
  );
}
