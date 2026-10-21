import React, { useState } from 'react';
import {
  ClipboardList, Plus, ChevronDown,
  Activity, Ruler, Heart, CheckCircle, AlertCircle,
  Search, BarChart3, Users, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { CTAButton } from '../brand/Brand';
import { Badge, Page, PageHeader } from '../student/ui';
import { FieldLabel, MobileActionBar, PersonChip, SectionCard, Segmented } from '../pro/ui';

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
    title: 'Dados básicos', icon: Users,
    fields: [
      { key: 'weight', label: 'Peso', unit: 'kg', type: 'number', step: 0.1, placeholder: '75.5' },
      { key: 'height', label: 'Altura', unit: 'cm', type: 'number', step: 1, placeholder: '175' },
    ],
  },
  {
    title: 'Composição corporal', icon: Activity,
    fields: [
      { key: 'bodyFat', label: 'Gordura corporal', unit: '%', type: 'number', step: 0.1, placeholder: '15.0' },
      { key: 'muscleMass', label: 'Massa muscular', unit: 'kg', type: 'number', step: 0.1, placeholder: '60.0' },
      { key: 'visceralFat', label: 'Gordura visceral', unit: 'nív.', type: 'number', step: 1, placeholder: '7' },
      { key: 'hydration', label: 'Hidratação', unit: '%', type: 'number', step: 0.1, placeholder: '58.5' },
    ],
  },
  {
    title: 'Medidas corporais', icon: Ruler,
    fields: [
      { key: 'chest', label: 'Peitoral', unit: 'cm', type: 'number', step: 0.5, placeholder: '100' },
      { key: 'waist', label: 'Cintura', unit: 'cm', type: 'number', step: 0.5, placeholder: '80' },
      { key: 'hip', label: 'Quadril', unit: 'cm', type: 'number', step: 0.5, placeholder: '95' },
      { key: 'thigh', label: 'Coxa', unit: 'cm', type: 'number', step: 0.5, placeholder: '55' },
      { key: 'arm', label: 'Braço', unit: 'cm', type: 'number', step: 0.5, placeholder: '35' },
      { key: 'calf', label: 'Panturrilha', unit: 'cm', type: 'number', step: 0.5, placeholder: '37' },
    ],
  },
  {
    title: 'Cardiovascular', icon: Heart,
    fields: [
      { key: 'restingHR', label: 'FC em repouso', unit: 'bpm', type: 'number', step: 1, placeholder: '65' },
      { key: 'bloodPressure', label: 'Pressão arterial', unit: 'mmHg', type: 'text', step: undefined, placeholder: '120/80' },
    ],
  },
];

const allFieldKeys = fieldSets.flatMap((f) => f.fields.map((x) => x.key));

function bmiBand(bmi: number) {
  if (bmi < 18.5) return { label: 'Abaixo', color: '#38d6f5' };
  if (bmi < 25) return { label: 'Adequado', color: '#2ee6c8' };
  if (bmi < 30) return { label: 'Sobrepeso', color: '#ffb547' };
  return { label: 'Obesidade', color: '#ff8a5c' };
}

export function PersonalAvaliacao() {
  const [activeTab, setActiveTab] = useState<'nova' | 'historico' | 'parq'>('nova');
  const [measurements, setMeasurements] = useState<Measurement[]>(mockMeasurements);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [parqAnswers, setParqAnswers] = useState<ParqAnswer[]>(
    parqQuestions.map((q) => ({ question: q, answer: null })),
  );
  const [parqStudent, setParqStudent] = useState('');
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
      const student = students.find((s) => s.id === selectedStudent);
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
      setMeasurements((prev) => [newM, ...prev]);
      setSaving(false);
      toast.success('Avaliação registrada com sucesso!', { description: student?.name });
      setActiveTab('historico');
      setExpandedId(newM.id);
    }, 1200);
  };

  const parqRisk = parqAnswers.some((a) => a.answer === true);
  const parqComplete = parqAnswers.every((a) => a.answer !== null);
  const parqAnswered = parqAnswers.filter((a) => a.answer !== null).length;

  const filteredHistory = measurements.filter((m) =>
    m.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filled = allFieldKeys.filter((k) => String(formData[k] ?? '').trim() !== '').length;
  const completion = Math.round((filled / allFieldKeys.length) * 100);
  const bmiNum = Number(bmi);
  const band = bmiNum ? bmiBand(bmiNum) : null;
  const bmiPos = bmiNum ? Math.min(100, Math.max(0, ((bmiNum - 15) / 25) * 100)) : 0;
  const whr = formData.waist && formData.hip ? (Number(formData.waist) / Number(formData.hip)).toFixed(2) : '—';
  const ring = 2 * Math.PI * 22;

  return (
    <Page wide>
      <PageHeader
        kicker="Avaliação física"
        title="Medir para"
        accent="acompanhar."
        lead="Registre composição corporal, medidas e o PAR-Q dos seus alunos."
      />

      <div className="mb-6">
        <Segmented
          layoutId="aval-tabs"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'nova', label: 'Nova avaliação', icon: Plus },
            { value: 'historico', label: 'Histórico', icon: BarChart3, count: measurements.length },
            { value: 'parq', label: 'PAR-Q', icon: ClipboardList },
          ]}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Nova avaliação */}
        {activeTab === 'nova' && (
          <motion.div
            key="nova"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid xl:grid-cols-[1fr_340px] gap-6 items-start"
          >
            <div className="space-y-5 min-w-0">
              <SectionCard icon={Users} title="Aluno avaliado" meta={selectedStudent ? <Badge tone="teal">Selecionado</Badge> : null}>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {students.map((s) => (
                    <PersonChip
                      key={s.id}
                      name={s.name}
                      avatar={s.avatar}
                      selected={selectedStudent === s.id}
                      onClick={() => setSelectedStudent(s.id)}
                    />
                  ))}
                </div>
              </SectionCard>

              {fieldSets.map(({ title, icon, fields }) => {
                const done = fields.filter((f) => String(formData[f.key] ?? '').trim() !== '').length;
                return (
                  <SectionCard
                    key={title}
                    icon={icon}
                    title={title}
                    meta={<Badge tone={done === fields.length ? 'teal' : 'neutral'}>{done}/{fields.length}</Badge>}
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {fields.map(({ key, label, unit, type, step, placeholder }) => (
                        <div key={key}>
                          <FieldLabel htmlFor={`f-${key}`}>{label}</FieldLabel>
                          <div className="relative">
                            <input
                              id={`f-${key}`}
                              type={type}
                              step={step}
                              inputMode={type === 'number' ? 'decimal' : undefined}
                              value={formData[key] || ''}
                              onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                              placeholder={placeholder}
                              className="cp-field pl-4 pr-14"
                            />
                            <span className="cp-mono absolute right-4 top-1/2 -translate-y-1/2 text-[11.5px] text-[var(--dim)] pointer-events-none">
                              {unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              })}
            </div>

            {/* Resumo ao vivo */}
            <aside className="xl:sticky xl:top-6 space-y-4">
              <section className="rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
                <span aria-hidden className="cp-modal-bar" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="cp-kicker">Resumo calculado</p>
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 52 52" className="w-11 h-11 -rotate-90">
                        <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                        <motion.circle
                          cx="26" cy="26" r="22" fill="none" stroke="#8c82ff" strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={ring}
                          animate={{ strokeDashoffset: ring * (1 - completion / 100) }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <span className="cp-mono text-[12px] text-[var(--muted)]">{completion}%</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="cp-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--dim)]">IMC</p>
                    <p className="cp-display mt-1 text-[44px] font-bold leading-none">
                      {bmi}
                      {band && (
                        <span className="ml-3 align-middle text-[14px] font-semibold" style={{ color: band.color }}>
                          {band.label}
                        </span>
                      )}
                    </p>
                    <div className="relative mt-4">
                      <div className="flex h-2 rounded-full overflow-hidden">
                        <span className="flex-[3.5] bg-[#38d6f5]/60" />
                        <span className="flex-[6.5] bg-[#2ee6c8]/60" />
                        <span className="flex-[5] bg-[#ffb547]/60" />
                        <span className="flex-[10] bg-[#ff8a5c]/60" />
                      </div>
                      {band && (
                        <motion.span
                          className="absolute -top-1.5 w-5 h-5 -ml-2.5 rounded-full bg-white border-4 border-[#0d0f18]"
                          animate={{ left: `${bmiPos}%` }}
                          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        />
                      )}
                    </div>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-2">
                    {[
                      { k: 'Peso', v: formData.weight ? `${formData.weight} kg` : '—' },
                      { k: '% Gordura', v: formData.bodyFat ? `${formData.bodyFat}%` : '—', warn: Number(formData.bodyFat) > 25 },
                      { k: 'Massa muscular', v: formData.muscleMass ? `${formData.muscleMass} kg` : '—' },
                      { k: 'Cintura/quadril', v: whr },
                    ].map(({ k, v, warn }) => (
                      <div key={k} className="rounded-xl px-3 py-2.5 border border-[var(--line)]">
                        <dt className="text-[11px] text-[var(--dim)]">{k}</dt>
                        <dd className={`mt-0.5 text-[15px] font-semibold ${warn ? 'text-[var(--amber)]' : ''}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5">
                    <FieldLabel htmlFor="aval-notes">Observações</FieldLabel>
                    <textarea
                      id="aval-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Recomendações, próximos passos…"
                      className="cp-field"
                    />
                  </div>

                  <div className="mt-5">
                    <CTAButton type="button" block onClick={handleSave} disabled={saving || !selectedStudent}>
                      {saving ? 'Salvando…' : 'Salvar avaliação'}
                    </CTAButton>
                    {!selectedStudent && (
                      <p className="mt-2 text-center text-[12px] text-[var(--dim)]">Selecione o aluno para salvar.</p>
                    )}
                  </div>
                </div>
              </section>
            </aside>

            <MobileActionBar>
              <p className="text-[13px] text-[var(--muted)]">
                IMC <span className="text-white font-semibold">{bmi}</span> · {completion}% preenchido
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedStudent}
                className="cp-selected h-10 px-5 rounded-full text-[14px] font-semibold disabled:opacity-40"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </MobileActionBar>
          </motion.div>
        )}

        {/* Histórico */}
        {activeTab === 'historico' && (
          <motion.div key="historico" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="relative max-w-xs mb-5">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aluno…"
                className="cp-field h-11"
              />
            </div>

            <div className="space-y-3">
              {filteredHistory.map((m) => {
                const open = expandedId === m.id;
                const b = m.bmi ? bmiBand(m.bmi) : null;
                return (
                  <div key={m.id} className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedId(open ? null : m.id)}
                      aria-expanded={open}
                    >
                      <span className="w-11 h-11 shrink-0 rounded-xl grid place-items-center bg-[rgba(85,70,255,0.14)]">
                        <ClipboardList className="w-5 h-5 text-[var(--brand-300)]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold">{m.studentName}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[var(--dim)]">
                          <Calendar className="w-3 h-3" />
                          {new Date(m.date + 'T12:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-6">
                        {[
                          { k: 'Peso', v: `${m.weight}kg` },
                          { k: 'IMC', v: String(m.bmi), color: b?.color },
                          { k: 'Gordura', v: `${m.bodyFat}%`, color: m.bodyFat > 25 ? '#ffb547' : undefined },
                        ].map(({ k, v, color }) => (
                          <div key={k} className="text-right">
                            <p className="cp-mono text-[10px] uppercase tracking-[0.1em] text-[var(--dim)]">{k}</p>
                            <p className="cp-display text-[17px] font-bold" style={color ? { color } : undefined}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[var(--dim)] transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-[var(--line)]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                              {[
                                { label: 'Massa muscular', value: `${m.muscleMass}kg` },
                                { label: 'Gordura visceral', value: m.visceralFat },
                                { label: 'Hidratação', value: `${m.hydration}%` },
                                { label: 'FC repouso', value: `${m.restingHR}bpm` },
                                { label: 'Peitoral', value: `${m.chest}cm` },
                                { label: 'Cintura', value: `${m.waist}cm` },
                                { label: 'Quadril', value: `${m.hip}cm` },
                                { label: 'Pressão', value: m.bloodPressure || '—' },
                              ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl px-3 py-2.5 border border-[var(--line)] bg-white/[0.02]">
                                  <p className="text-[11px] text-[var(--dim)]">{label}</p>
                                  <p className="mt-0.5 text-[15px] font-semibold">{value}</p>
                                </div>
                              ))}
                            </div>
                            {m.notes && (
                              <div className="mt-3 rounded-xl px-4 py-3 border border-[var(--line)] bg-white/[0.02]">
                                <p className="cp-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--dim)] mb-1">Observações</p>
                                <p className="text-[14px] text-[var(--cream)]">{m.notes}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {filteredHistory.length === 0 && (
                <div className="text-center py-16 rounded-[22px] border border-[var(--line)]">
                  <ClipboardList className="w-10 h-10 mx-auto text-[var(--dim)]" />
                  <p className="mt-3 text-[14px] text-[var(--muted)]">Nenhuma avaliação encontrada</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PAR-Q */}
        {activeTab === 'parq' && (
          <motion.div key="parq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
            <section className="rounded-[22px] border border-[var(--line)] bg-white/[0.025] overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[var(--line)]">
                <div className="flex items-start gap-4">
                  <span className="w-12 h-12 shrink-0 rounded-2xl grid place-items-center bg-[rgba(85,70,255,0.14)]">
                    <ClipboardList className="w-6 h-6 text-[var(--brand-300)]" />
                  </span>
                  <div>
                    <h3 className="cp-display text-[20px] font-bold">PAR-Q</h3>
                    <p className="mt-1 text-[13.5px] text-[var(--muted)] leading-relaxed">
                      Questionário de Prontidão para Atividade Física. Aplique antes de iniciar qualquer programa de treinamento.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <FieldLabel>Aluno avaliado</FieldLabel>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {students.map((s) => (
                      <PersonChip
                        key={s.id}
                        name={s.name}
                        avatar={s.avatar}
                        selected={parqStudent === s.id}
                        onClick={() => setParqStudent(s.id)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex-1 h-[3px] rounded-full bg-[var(--line-2)] overflow-hidden">
                    <motion.div
                      className="h-full cp-brand-bar"
                      animate={{ width: `${(parqAnswered / parqQuestions.length) * 100}%` }}
                    />
                  </div>
                  <span className="cp-mono text-[12px] text-[var(--muted)]">
                    {parqAnswered}/{parqQuestions.length}
                  </span>
                </div>
              </div>

              <ol>
                {parqAnswers.map((qa, idx) => (
                  <li
                    key={idx}
                    className={`p-5 sm:p-6 border-b border-[var(--line)] last:border-b-0 transition-colors ${
                      qa.answer === true ? 'bg-[rgba(255,93,108,0.05)]' : ''
                    }`}
                  >
                    <p className="text-[14.5px] leading-relaxed">
                      <span className="cp-mono mr-2 text-[12px] text-[var(--dim)]">{String(idx + 1).padStart(2, '0')}</span>
                      {qa.question}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[
                        { v: true, label: 'Sim', on: 'border-[#ff5d6c] bg-[rgba(255,93,108,0.14)] text-[#ff8a95]' },
                        { v: false, label: 'Não', on: 'border-[var(--teal)] bg-[rgba(46,230,200,0.12)] text-[var(--teal)]' },
                      ].map(({ v, label, on }) => (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={qa.answer === v}
                          onClick={() => setParqAnswers((prev) => prev.map((a, i) => (i === idx ? { ...a, answer: v } : a)))}
                          className={`h-10 px-6 rounded-full border text-[14px] font-semibold transition-colors ${
                            qa.answer === v ? on : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="p-5 sm:p-6 border-t border-[var(--line)] space-y-4">
                <AnimatePresence>
                  {parqComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl p-4 border flex items-start gap-3 ${
                        parqRisk
                          ? 'border-[rgba(255,93,108,0.35)] bg-[rgba(255,93,108,0.08)]'
                          : 'border-[rgba(46,230,200,0.3)] bg-[rgba(46,230,200,0.07)]'
                      }`}
                    >
                      {parqRisk ? (
                        <AlertCircle className="w-5 h-5 mt-0.5 text-[#ff8a95]" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mt-0.5 text-[var(--teal)]" />
                      )}
                      <div>
                        <p className={`font-semibold ${parqRisk ? 'text-[#ff8a95]' : 'text-[var(--teal)]'}`}>
                          {parqRisk ? 'Atenção: consulta médica recomendada' : 'Aprovado para treinamento'}
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--muted)]">
                          {parqRisk
                            ? 'O aluno respondeu SIM a uma ou mais perguntas. Recomende consulta médica antes de iniciar o programa de treinamento.'
                            : 'O aluno está apto para iniciar um programa de atividade física supervisionada.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <CTAButton type="button" block onClick={() => toast.success('PAR-Q salvo com sucesso!')} disabled={!parqComplete}>
                  Salvar PAR-Q
                </CTAButton>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
