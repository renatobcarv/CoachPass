import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Activity,
  Scale,
  Ruler,
  Zap,
  Droplets,
  Heart,
  Target,
  Calendar,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface MeasurementForm {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  visceralFat: number;
  bmr: number;
  hydration: number;
  boneMass: number;
  bmi: number;
  chest: number;
  waist: number;
  hip: number;
  rightArm: number;
  leftArm: number;
  rightThigh: number;
  leftThigh: number;
  rightCalf: number;
  leftCalf: number;
  notes: string;
}

const studentData = {
  name: 'Lucas Silva',
  avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff',
  lastMeasurement: {
    date: '2024-03-01',
    weight: 77.1,
    bodyFat: 15.1,
    muscleMass: 63.9,
    visceralFat: 7,
    bmr: 1820,
    hydration: 57.5,
    boneMass: 3.1,
    bmi: 24.3,
    chest: 100,
    waist: 81,
    hip: 96,
    rightArm: 37,
    leftArm: 36,
    rightThigh: 57,
    leftThigh: 56,
    rightCalf: 36,
    leftCalf: 35,
  },
};

export function StudentMeasurement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');

  const { register, handleSubmit, watch } = useForm<MeasurementForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      bodyFat: 0,
      muscleMass: 0,
      visceralFat: 0,
      bmr: 0,
      hydration: 0,
      boneMass: 0,
      bmi: 0,
      chest: 0,
      waist: 0,
      hip: 0,
      rightArm: 0,
      leftArm: 0,
      rightThigh: 0,
      leftThigh: 0,
      rightCalf: 0,
      leftCalf: 0,
      notes: '',
    },
  });

  const watchedWeight = watch('weight');
  const prev = studentData.lastMeasurement;

  const onSubmit = () => {
    setStep('loading');
    setTimeout(() => {
      setStep('success');
      toast.success('Medição registrada com sucesso!');
      setTimeout(() => navigate(`/personal/aluno/${id}`), 2000);
    }, 1500);
  };

  const DiffBadge = ({ current, prev, unit = '', invert = false }: { current: number; prev: number; unit?: string; invert?: boolean }) => {
    if (!current || current === 0) return null;
    const diff = current - prev;
    const isGood = invert ? diff < 0 : diff > 0;
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded-md ${isGood ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`} style={{ fontWeight: 600 }}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
      </span>
    );
  };

  if (step === 'success') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="dark:text-white text-slate-900 mb-2">Medição Registrada!</h2>
          <p className="dark:text-zinc-400 text-slate-500 text-sm">Redirecionando para o perfil do aluno...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(`/personal/aluno/${id}`)}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Perfil do Aluno
        </button>
        <div className="flex items-center gap-4">
          <img src={studentData.avatar} alt={studentData.name} className="w-14 h-14 rounded-2xl ring-4 ring-emerald-500/20" />
          <div>
            <h1 className="dark:text-white text-slate-900">Registrar Medição</h1>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">
              {studentData.name} · Última medição em {prev.date}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Data */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>Data da Medição</h3>
          </div>
          <input type="date" {...register('date')}
            className="px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
        </div>

        {/* Bioimpedância */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>Bioimpedância</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'weight' as const, label: 'Peso (kg)', prev: prev.weight, icon: Scale, color: '#f59e0b', unit: 'kg', invert: false },
              { name: 'bodyFat' as const, label: 'Gordura (%)', prev: prev.bodyFat, icon: Activity, color: '#ef4444', unit: '%', invert: true },
              { name: 'muscleMass' as const, label: 'Massa Muscular (kg)', prev: prev.muscleMass, icon: Zap, color: '#3b82f6', unit: 'kg', invert: false },
              { name: 'visceralFat' as const, label: 'Gord. Visceral', prev: prev.visceralFat, icon: Target, color: '#ec4899', unit: '', invert: true },
              { name: 'bmr' as const, label: 'TMB (kcal)', prev: prev.bmr, icon: Zap, color: '#8b5cf6', unit: '', invert: false },
              { name: 'hydration' as const, label: 'Hidratação (%)', prev: prev.hydration, icon: Droplets, color: '#06b6d4', unit: '%', invert: false },
              { name: 'boneMass' as const, label: 'Massa Óssea (kg)', prev: prev.boneMass, icon: Ruler, color: '#6b7280', unit: 'kg', invert: false },
              { name: 'bmi' as const, label: 'IMC', prev: prev.bmi, icon: Heart, color: '#10b981', unit: '', invert: false },
            ].map(({ name, label, prev: prevVal, icon: Icon, color, unit, invert }) => (
              <div key={name} className="dark:bg-zinc-800/50 bg-slate-50 rounded-2xl p-4 border dark:border-zinc-700 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <p className="text-xs dark:text-zinc-500 text-slate-400">{label}</p>
                  </div>
                </div>
                <input
                  type="number" step="0.1"
                  {...register(name, { min: 0 })}
                  placeholder={String(prevVal)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm dark:bg-zinc-700 bg-white border dark:border-zinc-600 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-center"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs dark:text-zinc-600 text-slate-400">Ant: {prevVal}{unit}</span>
                  <DiffBadge current={watch(name) as number} prev={prevVal} unit={unit} invert={invert} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circunferências */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="dark:text-white text-slate-900 text-base" style={{ fontWeight: 600 }}>Circunferências (cm)</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'chest' as const, label: 'Peitoral', prev: prev.chest },
              { name: 'waist' as const, label: 'Cintura', prev: prev.waist },
              { name: 'hip' as const, label: 'Quadril', prev: prev.hip },
              { name: 'rightArm' as const, label: 'Braço D', prev: prev.rightArm },
              { name: 'leftArm' as const, label: 'Braço E', prev: prev.leftArm },
              { name: 'rightThigh' as const, label: 'Coxa D', prev: prev.rightThigh },
              { name: 'leftThigh' as const, label: 'Coxa E', prev: prev.leftThigh },
              { name: 'rightCalf' as const, label: 'Panturrilha D', prev: prev.rightCalf },
              { name: 'leftCalf' as const, label: 'Panturrilha E', prev: prev.leftCalf },
            ].map(({ name, label, prev: prevVal }) => (
              <div key={name}>
                <label className="block text-xs dark:text-zinc-400 text-slate-500 mb-2">{label}</label>
                <input
                  type="number" step="0.1"
                  {...register(name)}
                  placeholder={String(prevVal)}
                  className="w-full px-3 py-2.5 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm text-center"
                />
                <p className="text-xs dark:text-zinc-600 text-slate-400 text-center mt-1">Ant: {prevVal}cm</p>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
          <h3 className="dark:text-white text-slate-900 mb-4 text-base" style={{ fontWeight: 600 }}>Observações</h3>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Observações sobre a medição, evolução percebida, recomendações para o próximo período..."
            className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <button type="button" onClick={() => navigate(`/personal/aluno/${id}`)}
            className="flex-1 py-4 rounded-2xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-colors text-sm" style={{ fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="submit" disabled={step === 'loading'}
            className="flex-[2] py-4 rounded-2xl text-white transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
            style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', boxShadow: '0 8px 24px rgba(16,185,129,0.35)', fontWeight: 600 }}>
            {step === 'loading'
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</>
              : <><Save className="w-5 h-5" />Salvar Medição</>}
          </button>
        </div>
      </form>
    </div>
  );
}
