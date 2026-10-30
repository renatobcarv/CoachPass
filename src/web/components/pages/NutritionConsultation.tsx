import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { Activity, Check, Circle, FileText, Heart, Ruler, Scale, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { CTAButton } from '../brand/Brand';
import { Page, PageHeader } from '../student/ui';
import { FieldLabel, MobileActionBar, PersonChip, SectionCard } from '../pro/ui';

// ────────────── TYPES ──────────────
interface ConsultationForm {
  patientId: string;
  date: string;
  // Medidas Antropométricas
  weight: number;
  bodyFat: number;
  muscleMass: number;
  visceralFat: number;
  bmr: number;
  hydration: number;
  // Circunferências
  waist: number;
  hip: number;
  abdomen: number;
  arm: number;
  thigh: number;
  // Sinais Vitais
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  glucoseFasting: number;
  // Avaliação
  adherence: number;
  energyLevel: number;
  sleepQuality: number;
  // Textuais
  clinicalNotes: string;
  recommendations: string;
  dietAdjustments: string;
  supplementation: string;
  nextConsultation: string;
}

const mockPatients = [
  { id: '1', name: 'Ana Costa', avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff', weight: 68.5 },
  { id: '2', name: 'Roberto Lima', avatar: 'https://ui-avatars.com/api/?name=Roberto+Lima&background=3b82f6&color=fff', weight: 92.3 },
];

// ────────────── COMPONENT ──────────────
export function NutritionConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<ConsultationForm>({
    defaultValues: {
      patientId: patientId || '',
      date: new Date().toISOString().split('T')[0],
      weight: undefined as unknown as number,
      bodyFat: undefined as unknown as number,
      muscleMass: undefined as unknown as number,
      visceralFat: undefined as unknown as number,
      bmr: undefined as unknown as number,
      hydration: undefined as unknown as number,
      waist: undefined as unknown as number,
      hip: undefined as unknown as number,
      abdomen: undefined as unknown as number,
      arm: undefined as unknown as number,
      thigh: undefined as unknown as number,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 70,
      glucoseFasting: 90,
      adherence: 7,
      energyLevel: 7,
      sleepQuality: 7,
      clinicalNotes: '',
      recommendations: '',
      dietAdjustments: '',
      supplementation: '',
      nextConsultation: '',
    },
  });

  const watchedPatient = watch('patientId');
  const watchedAdherence = watch('adherence');
  const watchedEnergy = watch('energyLevel');
  const watchedSleep = watch('sleepQuality');
  const selectedPatient = mockPatients.find((p) => p.id === watchedPatient);

  const onSubmit = (data: ConsultationForm) => {
    setStep('loading');
    setTimeout(() => {
      setStep('success');
      toast.success('Consulta registrada com sucesso!');
      setTimeout(() => {
        navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist');
      }, 2000);
    }, 1500);
  };

  const backTo = patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist';
  const wWeight = Number(watch('weight')) || 0;
  const wWaist = Number(watch('waist')) || 0;
  const wHip = Number(watch('hip')) || 0;
  const wNotes = watch('clinicalNotes') || '';
  const weightDelta = selectedPatient && wWeight > 0 ? +(wWeight - selectedPatient.weight).toFixed(1) : null;
  const rcq = wWaist > 0 && wHip > 0 ? +(wWaist / wHip).toFixed(2) : null;
  const num = { valueAsNumber: true, min: { value: 0, message: 'Valor inválido' } } as const;

  if (step === 'success') {
    return (
      <Page>
        <div className="min-h-[60vh] grid place-items-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
            <span className="mx-auto w-20 h-20 rounded-full grid place-items-center cp-selected">
              <Check className="w-9 h-9" strokeWidth={3} />
            </span>
            <h2 className="cp-display mt-6 text-[28px] font-bold">
              Consulta <span className="cp-accent">registrada.</span>
            </h2>
            <p className="mt-2 text-[14.5px] text-[var(--muted)]">Voltando para {selectedPatient ? selectedPatient.name : 'o painel'}…</p>
          </motion.div>
        </div>
      </Page>
    );
  }

  return (
    <Page wide>
      <PageHeader
        kicker="Consulta nutricional"
        title="Registre o retorno"
        accent="em poucos minutos."
        lead="Medidas, sinais vitais, como o paciente está se sentindo e as condutas da consulta."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid xl:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <SectionCard icon={Users} title="Paciente e data">
            <Controller
              name="patientId"
              control={control}
              rules={{ required: 'Selecione o paciente' }}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {mockPatients.map((p) => (
                    <PersonChip key={p.id} name={p.name} selected={field.value === p.id} onClick={() => field.onChange(p.id)} />
                  ))}
                </div>
              )}
            />
            {errors.patientId && <p className="mt-2 text-[12.5px] text-[#ff8a95]">{errors.patientId.message}</p>}
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="c-date">Data da consulta</FieldLabel>
                <input id="c-date" type="date" {...register('date', { required: 'Data obrigatória' })} className="cp-field cp-field-plain h-12" />
                {errors.date && <p className="mt-1.5 text-[12.5px] text-[#ff8a95]">{errors.date.message}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="c-next">Próxima consulta</FieldLabel>
                <input id="c-next" type="date" {...register('nextConsultation')} className="cp-field cp-field-plain h-12" />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Scale} title="Composição corporal">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  ['weight', 'Peso', 'kg', '68,5'],
                  ['bodyFat', 'Gordura corporal', '%', '28,5'],
                  ['muscleMass', 'Massa muscular', 'kg', '44,2'],
                  ['visceralFat', 'Gordura visceral', 'nível', '7'],
                  ['bmr', 'TMB', 'kcal', '1500'],
                  ['hydration', 'Hidratação', '%', '55'],
                ] as const
              ).map(([name, label, unit, ph]) => (
                <UnitInput key={name} id={`c-${name}`} label={label} unit={unit} placeholder={ph} {...register(name, num)} />
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Ruler} title="Circunferências" meta={<span className="cp-mono text-[11px] text-[var(--dim)]">em cm</span>}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {(
                [
                  ['waist', 'Cintura', '82'],
                  ['hip', 'Quadril', '98'],
                  ['abdomen', 'Abdômen', '85'],
                  ['arm', 'Braço', '30'],
                  ['thigh', 'Coxa', '55'],
                ] as const
              ).map(([name, label, ph]) => (
                <UnitInput key={name} id={`c-${name}`} label={label} unit="cm" placeholder={ph} {...register(name, num)} />
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Heart} title="Sinais vitais">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <UnitInput id="c-sys" label="Pressão sistólica" unit="mmHg" {...register('bloodPressureSystolic', num)} />
              <UnitInput id="c-dia" label="Pressão diastólica" unit="mmHg" {...register('bloodPressureDiastolic', num)} />
              <UnitInput id="c-hr" label="Freq. cardíaca" unit="bpm" {...register('heartRate', num)} />
              <UnitInput id="c-glu" label="Glicemia jejum" unit="mg/dL" {...register('glucoseFasting', num)} />
            </div>
          </SectionCard>

          <SectionCard icon={Activity} title="Como o paciente está">
            <div className="space-y-6">
              {(
                [
                  ['adherence', 'Adesão ao plano alimentar'],
                  ['energyLevel', 'Energia e disposição'],
                  ['sleepQuality', 'Qualidade do sono'],
                ] as const
              ).map(([name, label]) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => <ScoreScale label={label} value={Number(field.value)} onChange={field.onChange} />}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={FileText} title="Condutas">
            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="c-notes">Observações clínicas *</FieldLabel>
                <textarea
                  id="c-notes"
                  rows={4}
                  maxLength={2000}
                  placeholder="Queixas, evolução desde a última consulta, achados relevantes…"
                  {...register('clinicalNotes', {
                    required: 'Observações são obrigatórias',
                    validate: (v) => v.trim().length >= 10 || 'Escreva ao menos 10 caracteres',
                  })}
                  className="cp-field"
                />
                {errors.clinicalNotes && <p className="mt-1.5 text-[12.5px] text-[#ff8a95]">{errors.clinicalNotes.message}</p>}
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <FieldLabel htmlFor="c-rec">Recomendações</FieldLabel>
                  <textarea id="c-rec" rows={3} maxLength={1500} placeholder="Orientações para o próximo período" {...register('recommendations')} className="cp-field" />
                </div>
                <div>
                  <FieldLabel htmlFor="c-adj">Ajustes no plano</FieldLabel>
                  <textarea id="c-adj" rows={3} maxLength={1500} placeholder="O que muda na dieta" {...register('dietAdjustments')} className="cp-field" />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="c-sup">Suplementação</FieldLabel>
                <textarea id="c-sup" rows={2} maxLength={1000} placeholder="Ex.: Vitamina D 2.000 UI/dia" {...register('supplementation')} className="cp-field" />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Resumo */}
        <aside className="xl:sticky xl:top-6 rounded-[22px] border border-[var(--line-2)] bg-[#0d0f18] overflow-hidden">
          <span aria-hidden className="cp-modal-bar" />
          <div className="p-5 sm:p-6 border-b border-[var(--line)]">
            <p className="cp-kicker">Resumo da consulta</p>
            <p className="cp-display mt-1 text-[22px] font-bold">
              {selectedPatient ? selectedPatient.name : <span className="text-[var(--dim)]">Selecione o paciente</span>}
            </p>
            {selectedPatient && (
              <p className="mt-0.5 text-[13px] text-[var(--muted)]">Último peso registrado: {selectedPatient.weight.toLocaleString('pt-BR')} kg</p>
            )}
          </div>
          <dl className="p-5 sm:p-6 grid grid-cols-2 gap-3 border-b border-[var(--line)]">
            <div className="rounded-2xl border border-[var(--line)] p-3.5">
              <dt className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Peso atual</dt>
              <dd className="mt-1 cp-display text-[24px] font-bold">{wWeight > 0 ? wWeight.toLocaleString('pt-BR') : '—'}</dd>
              {weightDelta != null && (
                <dd className={`cp-mono text-[11.5px] ${weightDelta <= 0 ? 'text-[var(--teal)]' : 'text-[var(--amber)]'}`}>
                  {weightDelta > 0 ? '+' : ''}
                  {weightDelta.toLocaleString('pt-BR')} kg
                </dd>
              )}
            </div>
            <div className="rounded-2xl border border-[var(--line)] p-3.5">
              <dt className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Cintura/quadril</dt>
              <dd className="mt-1 cp-display text-[24px] font-bold">{rcq != null ? rcq.toLocaleString('pt-BR') : '—'}</dd>
              <dd className="cp-mono text-[11.5px] text-[var(--dim)]">{rcq != null ? 'RCQ calculada' : 'preencha cintura e quadril'}</dd>
            </div>
            {(
              [
                ['Adesão', watchedAdherence],
                ['Energia', watchedEnergy],
                ['Sono', watchedSleep],
              ] as const
            ).map(([label, v]) => (
              <div key={label} className="col-span-2 flex items-center gap-3">
                <span className="w-16 text-[12.5px] text-[var(--muted)]">{label}</span>
                <span className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: scoreColor(Number(v)) }}
                    animate={{ width: `${Number(v) * 10}%` }}
                  />
                </span>
                <span className="cp-mono text-[12px] w-9 text-right">{v}/10</span>
              </div>
            ))}
          </dl>
          <div className="p-5 sm:p-6 space-y-3">
            <ul className="space-y-1.5">
              {[
                { ok: Boolean(selectedPatient), label: 'Paciente selecionado' },
                { ok: wWeight > 0, label: 'Peso registrado' },
                { ok: wNotes.trim().length >= 10, label: 'Observações clínicas' },
              ].map(({ ok, label }) => (
                <li key={label} className={`flex items-center gap-2 text-[12.5px] ${ok ? 'text-[var(--cream)]' : 'text-[var(--dim)]'}`}>
                  {ok ? <Check className="w-3.5 h-3.5 text-[var(--teal)]" strokeWidth={3} /> : <Circle className="w-3.5 h-3.5" />}
                  {label}
                </li>
              ))}
            </ul>
            <CTAButton type="submit" block disabled={step === 'loading'}>
              {step === 'loading' ? 'Registrando…' : 'Registrar consulta'}
            </CTAButton>
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="w-full h-10 rounded-full text-[13.5px] text-[var(--muted)] hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </aside>

        <MobileActionBar>
          <p className="text-[13px] text-[var(--muted)] truncate">{selectedPatient ? selectedPatient.name : 'Sem paciente'}</p>
          <button type="submit" disabled={step === 'loading'} className="cp-selected h-10 px-5 rounded-full text-[14px] font-semibold disabled:opacity-40">
            {step === 'loading' ? 'Registrando…' : 'Registrar'}
          </button>
        </MobileActionBar>
      </form>
    </Page>
  );
}

function scoreColor(v: number) {
  return v >= 8 ? '#2ee6c8' : v >= 5 ? '#8c82ff' : '#ffb547';
}

function ScoreScale({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="text-[14px] font-medium">{label}</span>
        <span className="cp-mono text-[13px] font-semibold" style={{ color: scoreColor(value) }}>
          {value}/10
        </span>
      </div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => {
          const on = v <= value;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={v === value}
              aria-label={`${v} de 10`}
              onClick={() => onChange(v)}
              className={`h-9 rounded-lg cp-mono text-[12px] transition-colors ${
                on ? 'text-[#05060b] font-semibold' : 'bg-white/[0.05] text-[var(--dim)] hover:bg-white/[0.09] hover:text-white'
              }`}
              style={on ? { background: scoreColor(value) } : undefined}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const UnitInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; unit: string }
>(function UnitInput({ id, label, unit, ...rest }, ref) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          max={9999}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          className="cp-field cp-field-plain h-12 pr-14"
          {...rest}
        />
        <span className="cp-mono absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[var(--dim)] pointer-events-none">{unit}</span>
      </div>
    </div>
  );
});
