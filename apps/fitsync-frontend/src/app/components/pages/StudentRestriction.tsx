import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  X,
  CheckCircle,
  ShieldAlert,
  Activity,
  Calendar,
  FileText,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface RestrictionForm {
  type: 'injury' | 'limitation' | 'contraindication';
  title: string;
  description: string;
  affectedExercises: string;
  severity: 'low' | 'medium' | 'high';
  startDate: string;
  expectedRecovery: string;
  medicalClearance: boolean;
  notes: string;
}

const existingRestrictions = [
  { id: '1', type: 'injury', title: 'Dor no Joelho Esquerdo', description: 'Evitar agachamento profundo e saltos', severity: 'medium', date: '2024-02-20', active: true },
  { id: '2', type: 'limitation', title: 'Mobilidade de Ombro Limitada', description: 'Fazer aquecimento antes de treinos de empurrar', severity: 'low', date: '2024-01-10', active: true },
];

const severityColors = {
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Leve' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Moderada' },
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Grave' },
};

const typeLabels = {
  injury: { label: 'Lesão', icon: Flame, color: '#ef4444' },
  limitation: { label: 'Limitação', icon: Activity, color: '#f59e0b' },
  contraindication: { label: 'Contraindicação', icon: ShieldAlert, color: '#8b5cf6' },
};

const studentData = {
  name: 'Lucas Silva',
  avatar: 'https://ui-avatars.com/api/?name=Lucas+Silva&background=10b981&color=fff',
};

export function StudentRestriction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'list' | 'form' | 'loading' | 'success'>('list');
  const [restrictions, setRestrictions] = useState(existingRestrictions);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<RestrictionForm>({
    defaultValues: {
      type: 'injury',
      severity: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      medicalClearance: false,
    },
  });

  const watchedType = watch('type');
  const watchedSeverity = watch('severity');

  const onSubmit = (data: RestrictionForm) => {
    setStep('loading');
    setTimeout(() => {
      const newRestriction = {
        id: String(Date.now()),
        type: data.type,
        title: data.title,
        description: data.description,
        severity: data.severity,
        date: data.startDate,
        active: true,
      };
      setRestrictions((prev) => [newRestriction, ...prev]);
      setStep('success');
      toast.success('Restrição adicionada com sucesso!');
      setTimeout(() => {
        setStep('list');
        reset();
      }, 1500);
    }, 1500);
  };

  const deactivateRestriction = (restrictionId: string) => {
    setRestrictions((prev) => prev.map((r) => r.id === restrictionId ? { ...r, active: false } : r));
    toast.success('Restrição desativada');
  };

  if (step === 'success') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="dark:text-white text-slate-900 mb-2">Restrição Adicionada!</h2>
          <p className="dark:text-zinc-400 text-slate-500 text-sm">Retornando à lista...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => step === 'form' ? setStep('list') : navigate(`/personal/aluno/${id}`)}
          className="flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          {step === 'form' ? 'Voltar à Lista' : 'Voltar ao Perfil'}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={studentData.avatar} alt={studentData.name} className="w-14 h-14 rounded-2xl ring-4 ring-orange-500/20" />
            <div>
              <h1 className="dark:text-white text-slate-900">Restrições e Limitações</h1>
              <p className="text-sm dark:text-zinc-400 text-slate-500 mt-0.5">{studentData.name}</p>
            </div>
          </div>
          {step === 'list' && (
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 20px rgba(245,158,11,0.3)', fontWeight: 600 }}>
              <Plus className="w-4 h-4" />
              Nova Restrição
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* LIST VIEW */}
        {step === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {/* Active */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <div className="flex items-center gap-2 mb-5">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="dark:text-white text-slate-900">Restrições Ativas</h3>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20" style={{ fontWeight: 600 }}>
                  {restrictions.filter((r) => r.active).length}
                </span>
              </div>
              <div className="space-y-3">
                {restrictions.filter((r) => r.active).map((r) => {
                  const sev = severityColors[r.severity as keyof typeof severityColors];
                  const type = typeLabels[r.type as keyof typeof typeLabels];
                  const TypeIcon = type.icon;
                  return (
                    <div key={r.id} className={`p-4 rounded-2xl border ${sev.bg} ${sev.border}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${type.color}20` }}>
                            <TypeIcon className="w-4 h-4" style={{ color: type.color }} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className={`text-sm ${sev.text}`} style={{ fontWeight: 600 }}>{r.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-lg ${sev.bg} ${sev.text} border ${sev.border}`}>
                                {sev.label}
                              </span>
                              <span className="text-xs dark:text-zinc-500 text-slate-400">{type.label}</span>
                            </div>
                            <p className="text-xs dark:text-zinc-400 text-slate-500 mb-1">{r.description}</p>
                            <p className="text-xs dark:text-zinc-600 text-slate-400">Desde {r.date}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deactivateRestriction(r.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs dark:bg-zinc-800/80 bg-white border dark:border-zinc-700 border-slate-200 dark:text-zinc-400 text-slate-600 hover:text-red-400 dark:hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                          Desativar
                        </button>
                      </div>
                    </div>
                  );
                })}
                {restrictions.filter((r) => r.active).length === 0 && (
                  <div className="text-center py-8 dark:text-zinc-600 text-slate-400">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500/40" />
                    <p className="text-sm">Nenhuma restrição ativa</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inactive */}
            {restrictions.filter((r) => !r.active).length > 0 && (
              <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
                <h3 className="dark:text-zinc-500 text-slate-400 mb-4 text-sm">Restrições Inativas / Superadas</h3>
                <div className="space-y-2">
                  {restrictions.filter((r) => !r.active).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl dark:bg-zinc-800/30 bg-slate-50 opacity-60">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-sm dark:text-zinc-400 text-slate-500 line-through">{r.title}</p>
                      <span className="ml-auto text-xs dark:text-zinc-600 text-slate-400">Desde {r.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* FORM VIEW */}
        {(step === 'form' || step === 'loading') && (
          <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Tipo e Severidade */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <h3 className="dark:text-white text-slate-900 mb-5 text-base" style={{ fontWeight: 600 }}>Tipo e Severidade</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-3" style={{ fontWeight: 500 }}>Tipo de Restrição *</label>
                  <div className="space-y-2">
                    {(Object.entries(typeLabels) as [string, { label: string; icon: any; color: string }][]).map(([value, { label, icon: Icon, color }]) => (
                      <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        watchedType === value ? 'dark:border-zinc-500 border-slate-400' : 'dark:border-zinc-700 border-slate-200 dark:bg-zinc-800/30 bg-slate-50'
                      }`} style={watchedType === value ? { borderColor: color, backgroundColor: `${color}10` } : {}}>
                        <input type="radio" {...register('type')} value={value} className="sr-only" />
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                        <span className="text-sm dark:text-zinc-200 text-slate-700" style={{ fontWeight: watchedType === value ? 600 : 400 }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-3" style={{ fontWeight: 500 }}>Severidade *</label>
                  <div className="space-y-2">
                    {(Object.entries(severityColors) as [string, { label: string; bg: string; text: string; border: string }][]).map(([value, { label, bg, text, border }]) => (
                      <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        watchedSeverity === value ? `${bg} ${border}` : 'dark:border-zinc-700 border-slate-200 dark:bg-zinc-800/30 bg-slate-50'
                      }`}>
                        <input type="radio" {...register('severity')} value={value} className="sr-only" />
                        <div className={`w-3 h-3 rounded-full ${watchedSeverity === value ? text.replace('text-', 'bg-') : 'dark:bg-zinc-600 bg-slate-300'}`} />
                        <span className={`text-sm ${watchedSeverity === value ? text : 'dark:text-zinc-400 text-slate-600'}`} style={{ fontWeight: watchedSeverity === value ? 600 : 400 }}>
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div className="dark:bg-zinc-900 bg-white rounded-3xl p-6 dark:border-zinc-800 border border-slate-200">
              <h3 className="dark:text-white text-slate-900 mb-5 text-base" style={{ fontWeight: 600 }}>Detalhes da Restrição</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>Título / Nome *</label>
                  <input type="text" {...register('title', { required: 'Título obrigatório' })}
                    placeholder="Ex: Dor lombar aguda, Tendinite no ombro..."
                    className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm" />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>Descrição e Orientações *</label>
                  <textarea {...register('description', { required: 'Descrição obrigatória' })}
                    rows={3}
                    placeholder="Descreva a restrição e quais exercícios ou movimentos devem ser evitados..."
                    className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none text-sm" />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>Exercícios Afetados</label>
                  <input type="text" {...register('affectedExercises')}
                    placeholder="Ex: Agachamento, Leg Press, Saltos, Corrida..."
                    className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>Data de Início</label>
                    <input type="date" {...register('startDate')}
                      className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>Previsão de Recuperação</label>
                    <input type="date" {...register('expectedRecovery')}
                      className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-sm" />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('medicalClearance')} className="w-4 h-4 rounded accent-amber-500" />
                  <span className="text-sm dark:text-zinc-300 text-slate-700">Liberação médica necessária para retomar atividade</span>
                </label>

                <div>
                  <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>Observações Adicionais</label>
                  <textarea {...register('notes')} rows={2}
                    placeholder="Informações extras relevantes..."
                    className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none text-sm" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pb-8">
              <button type="button" onClick={() => setStep('list')}
                className="flex-1 py-4 rounded-2xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-colors text-sm" style={{ fontWeight: 600 }}>
                Cancelar
              </button>
              <button type="submit" disabled={step === 'loading'}
                className="flex-[2] py-4 rounded-2xl text-white transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.35)', fontWeight: 600 }}>
                {step === 'loading'
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</>
                  : <><Save className="w-5 h-5" />Adicionar Restrição</>}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
