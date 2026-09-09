import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Scale,
  Activity,
  Calendar,
  FileText,
  Target,
  Ruler,
  Heart,
  Droplets,
  CheckCircle,
  Users,
  Clock,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

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
      weight: 0,
      bodyFat: 0,
      muscleMass: 0,
      visceralFat: 0,
      bmr: 0,
      hydration: 0,
      waist: 0,
      hip: 0,
      abdomen: 0,
      arm: 0,
      thigh: 0,
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

  const ScoreSlider = ({ value, onChange, label, color }: { value: number; onChange: (v: number) => void; label: string; color: string }) => (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-xs dark:text-zinc-400 text-slate-500">{label}</span>
        <span className="text-xs" style={{ fontWeight: 700, color }}>{value}/10</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 h-7 rounded-lg text-xs transition-all ${
              v <= value ? 'text-white' : 'dark:bg-zinc-800 bg-slate-100 dark:text-zinc-500 text-slate-400 hover:dark:bg-zinc-700'
            }`}
            style={v <= value ? { backgroundColor: color, fontWeight: 600 } : {}}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  if (step === 'success') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="dark:text-white text-slate-900 mb-2">Consulta Registrada!</h2>
          <p className="dark:text-zinc-400 text-slate-500 text-sm">
            Os dados foram salvos com sucesso. Redirecionando...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist')}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="dark:text-white text-slate-900">Nova Consulta Nutricional</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">
              Registre os dados da consulta de forma completa
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ─── Dados Básicos ─── */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>
              Informações Básicas
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Paciente */}
            <div>
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Paciente *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                <select
                  {...register('patientId', { required: 'Selecione o paciente' })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="">Selecione...</option>
                  {mockPatients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {errors.patientId && (
                <p className="text-xs text-red-500 mt-1">{errors.patientId.message}</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Data da Consulta *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                <input
                  type="date"
                  {...register('date', { required: 'Data obrigatória' })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Próxima Consulta */}
            <div>
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Próxima Consulta
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                <input
                  type="date"
                  {...register('nextConsultation')}
                  className="w-full pl-9 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Patient preview */}
            {selectedPatient && (
              <div className="flex items-center gap-3 p-4 rounded-xl dark:bg-zinc-800/50 bg-slate-50 border dark:border-zinc-700 border-slate-200">
                <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-10 h-10 rounded-xl" />
                <div>
                  <p className="text-sm dark:text-white text-slate-900" style={{ fontWeight: 600 }}>{selectedPatient.name}</p>
                  <p className="text-xs dark:text-zinc-500 text-slate-400">Peso anterior: {selectedPatient.weight} kg</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bioimpedância / Medidas Corporais ─── */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>
              Composição Corporal (Bioimpedância)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'weight' as const, label: 'Peso (kg)', placeholder: '68.5', icon: Scale, color: '#f59e0b' },
              { name: 'bodyFat' as const, label: 'Gordura Corporal (%)', placeholder: '28.5', icon: Droplets, color: '#ef4444' },
              { name: 'muscleMass' as const, label: 'Massa Muscular (kg)', placeholder: '44.2', icon: Activity, color: '#3b82f6' },
              { name: 'visceralFat' as const, label: 'Gordura Visceral', placeholder: '7', icon: Heart, color: '#ec4899' },
              { name: 'bmr' as const, label: 'TMB (kcal)', placeholder: '1500', icon: Zap, color: '#8b5cf6' },
              { name: 'hydration' as const, label: 'Hidratação (%)', placeholder: '55.0', icon: Droplets, color: '#06b6d4' },
            ].map(({ name, label, placeholder, icon: Icon, color }) => (
              <div key={name}>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color }} />
                  <input
                    type="number"
                    step="0.1"
                    {...register(name, { min: 0 })}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Circunferências ─── */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>
              Circunferências (cm)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'waist' as const, label: 'Cintura', placeholder: '82' },
              { name: 'hip' as const, label: 'Quadril', placeholder: '98' },
              { name: 'abdomen' as const, label: 'Abdômen', placeholder: '85' },
              { name: 'arm' as const, label: 'Braço', placeholder: '30' },
              { name: 'thigh' as const, label: 'Coxa', placeholder: '55' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">{label}</label>
                <input
                  type="number"
                  step="0.1"
                  {...register(name, { min: 0 })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Sinais Vitais ─── */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>
              Sinais Vitais e Exames
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Pressão Sistólica (mmHg)</label>
              <input
                type="number"
                {...register('bloodPressureSystolic')}
                placeholder="120"
                className="w-full px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Pressão Diastólica (mmHg)</label>
              <input
                type="number"
                {...register('bloodPressureDiastolic')}
                placeholder="80"
                className="w-full px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Freq. Cardíaca (bpm)</label>
              <input
                type="number"
                {...register('heartRate')}
                placeholder="70"
                className="w-full px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">Glicemia em Jejum (mg/dL)</label>
              <input
                type="number"
                {...register('glucoseFasting')}
                placeholder="90"
                className="w-full px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ─── Avaliação Subjetiva ─── */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>
              Avaliação Subjetiva do Paciente
            </h3>
          </div>

          <div className="space-y-5">
            <Controller
              name="adherence"
              control={control}
              render={({ field }) => (
                <ScoreSlider
                  value={field.value}
                  onChange={field.onChange}
                  label="Adesão ao Plano Alimentar"
                  color="#10b981"
                />
              )}
            />
            <Controller
              name="energyLevel"
              control={control}
              render={({ field }) => (
                <ScoreSlider
                  value={field.value}
                  onChange={field.onChange}
                  label="Nível de Energia / Disposição"
                  color="#f59e0b"
                />
              )}
            />
            <Controller
              name="sleepQuality"
              control={control}
              render={({ field }) => (
                <ScoreSlider
                  value={field.value}
                  onChange={field.onChange}
                  label="Qualidade do Sono"
                  color="#8b5cf6"
                />
              )}
            />

            {/* Summary chips */}
            <div className="flex flex-wrap gap-3 pt-2 border-t dark:border-zinc-800 border-slate-100">
              {[
                { label: `Adesão: ${watchedAdherence}/10`, color: '#10b981' },
                { label: `Energia: ${watchedEnergy}/10`, color: '#f59e0b' },
                { label: `Sono: ${watchedSleep}/10`, color: '#8b5cf6' },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10`, fontWeight: 600 }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Anotações Clínicas ─── */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>
              Anotações e Recomendações
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Observações Clínicas *
              </label>
              <textarea
                {...register('clinicalNotes', { required: 'Observações são obrigatórias' })}
                rows={4}
                placeholder="Descreva as observações da consulta, queixas relatadas pelo paciente, análise geral do estado nutricional..."
                className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none text-sm"
              />
              {errors.clinicalNotes && (
                <p className="text-xs text-red-500 mt-1">{errors.clinicalNotes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Recomendações Gerais
              </label>
              <textarea
                {...register('recommendations')}
                rows={3}
                placeholder="Oriente o paciente sobre hábitos alimentares, hidratação, estilo de vida..."
                className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Ajustes no Plano Alimentar
              </label>
              <textarea
                {...register('dietAdjustments')}
                rows={3}
                placeholder="Descreva as alterações feitas no plano alimentar desta consulta..."
                className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                Suplementação Prescrita
              </label>
              <input
                type="text"
                {...register('supplementation')}
                placeholder="Ex: Ômega-3 2g/dia, Vitamina D 2000UI/dia, Magnésio 300mg/noite..."
                className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => navigate(patientId ? `/nutritionist/paciente/${patientId}` : '/nutritionist')}
            className="flex-1 py-4 rounded-2xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-colors text-sm"
            style={{ fontWeight: 600 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={step === 'loading'}
            className="flex-2 flex-1 py-4 rounded-2xl text-white transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.35)', fontWeight: 600 }}
          >
            {step === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando consulta...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Consulta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}