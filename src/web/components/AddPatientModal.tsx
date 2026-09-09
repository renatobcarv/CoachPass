import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Mail,
  User,
  Phone,
  Calendar,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Scale,
  Ruler,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/lib/supabase/info';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalType: 'personal' | 'nutritionist';
  onSuccess?: (patient: any) => void;
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  goal: string;
  medicalNotes?: string;
}

export function AddPatientModal({
  isOpen,
  onClose,
  professionalType,
  onSuccess,
}: AddPatientModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>();

  const handleClose = () => {
    if (step !== 'loading') {
      reset();
      setStep('form');
      setErrorMessage('');
      onClose();
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    setStep('loading');
    setErrorMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-da3e276b/add-patient`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...data,
            professionalType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar paciente');
      }

      const result = await response.json();

      setStep('success');
      
      if (onSuccess) {
        onSuccess(result.patient);
      }

      toast.success('Convite enviado com sucesso!');

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao adicionar paciente:', error);
      setErrorMessage(error.message || 'Erro ao enviar convite. Tente novamente.');
      setStep('error');
      toast.error('Erro ao enviar convite');
    }
  };

  const isProfessionalPersonal = professionalType === 'personal';
  const patientLabel = isProfessionalPersonal ? 'Aluno' : 'Paciente';
  const accentColor = isProfessionalPersonal ? '#3b82f6' : '#f59e0b';
  const accentGradient = isProfessionalPersonal
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    : 'linear-gradient(135deg, #f59e0b, #d97706)';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 border-slate-200">
                <div>
                  <h3 className="dark:text-white text-slate-900 text-xl" style={{ fontWeight: 700 }}>
                    Adicionar {patientLabel}
                  </h3>
                  <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
                    Preencha os dados e envie um convite por e-mail
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === 'loading'}
                  className="w-10 h-10 rounded-xl dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:dark:bg-zinc-700 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {step === 'success' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h4 className="dark:text-white text-slate-900 text-lg mb-2" style={{ fontWeight: 600 }}>
                      Convite Enviado com Sucesso!
                    </h4>
                    <p className="text-sm dark:text-zinc-400 text-slate-500">
                      {isProfessionalPersonal
                        ? 'O aluno receberá um e-mail com o convite para se juntar à sua equipe.'
                        : 'O paciente receberá um e-mail com o convite para acessar o plano nutricional.'}
                    </p>
                  </div>
                )}

                {step === 'error' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h4 className="dark:text-white text-slate-900 text-lg mb-2" style={{ fontWeight: 600 }}>
                      Erro ao Enviar Convite
                    </h4>
                    <p className="text-sm dark:text-zinc-400 text-slate-500 mb-4">{errorMessage}</p>
                    <button
                      onClick={() => setStep('form')}
                      className="px-4 py-2 rounded-xl text-sm transition-all hover:opacity-90"
                      style={{ background: accentGradient, color: 'white', fontWeight: 600 }}
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {(step === 'form' || step === 'loading') && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Informações Pessoais */}
                    <div>
                      <h4 className="dark:text-white text-slate-900 text-sm mb-4" style={{ fontWeight: 600 }}>
                        Informações Pessoais
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome Completo */}
                        <div className="md:col-span-2">
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Nome Completo *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="text"
                              {...register('name', { required: 'Nome é obrigatório' })}
                              placeholder="Nome completo"
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
                            />
                          </div>
                          {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        {/* E-mail */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            E-mail *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="email"
                              {...register('email', {
                                required: 'E-mail é obrigatório',
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: 'E-mail inválido',
                                },
                              })}
                              placeholder="email@exemplo.com"
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Telefone */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Telefone *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="tel"
                              {...register('phone', { required: 'Telefone é obrigatório' })}
                              placeholder="(00) 00000-0000"
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                        {/* Data de Nascimento */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Data de Nascimento *
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="date"
                              {...register('birthDate', { required: 'Data de nascimento é obrigatória' })}
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 disabled:opacity-50"
                            />
                          </div>
                          {errors.birthDate && (
                            <p className="text-xs text-red-500 mt-1">{errors.birthDate.message}</p>
                          )}
                        </div>

                        {/* Sexo */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Sexo *
                          </label>
                          <select
                            {...register('gender', { required: 'Sexo é obrigatório' })}
                            disabled={step === 'loading'}
                            className="w-full px-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 disabled:opacity-50"
                          >
                            <option value="">Selecione</option>
                            <option value="male">Masculino</option>
                            <option value="female">Feminino</option>
                            <option value="other">Outro</option>
                          </select>
                          {errors.gender && (
                            <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dados Físicos */}
                    <div>
                      <h4 className="dark:text-white text-slate-900 text-sm mb-4" style={{ fontWeight: 600 }}>
                        Dados Físicos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Altura */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Altura (cm)
                          </label>
                          <div className="relative">
                            <Ruler className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="number"
                              {...register('height', { min: 100, max: 250 })}
                              placeholder="170"
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Peso */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Peso (kg)
                          </label>
                          <div className="relative">
                            <Scale className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="number"
                              step="0.1"
                              {...register('weight', { min: 30, max: 300 })}
                              placeholder="70.5"
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Objetivo e Observações */}
                    <div>
                      <h4 className="dark:text-white text-slate-900 text-sm mb-4" style={{ fontWeight: 600 }}>
                        Objetivo e Observações
                      </h4>
                      <div className="space-y-4">
                        {/* Objetivo */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Objetivo Principal *
                          </label>
                          <div className="relative">
                            <Target className="w-4 h-4 absolute left-3 top-3 dark:text-zinc-500 text-slate-400" />
                            <input
                              type="text"
                              {...register('goal', { required: 'Objetivo é obrigatório' })}
                              placeholder={
                                isProfessionalPersonal
                                  ? 'Ex: Ganhar massa muscular, perder peso, melhorar condicionamento'
                                  : 'Ex: Reeducação alimentar, controle de diabetes, emagrecimento'
                              }
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                            />
                          </div>
                          {errors.goal && (
                            <p className="text-xs text-red-500 mt-1">{errors.goal.message}</p>
                          )}
                        </div>

                        {/* Observações Médicas */}
                        <div>
                          <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2" style={{ fontWeight: 500 }}>
                            Observações Médicas / Restrições
                          </label>
                          <div className="relative">
                            <FileText className="w-4 h-4 absolute left-3 top-3 dark:text-zinc-500 text-slate-400" />
                            <textarea
                              {...register('medicalNotes')}
                              placeholder="Alergias, restrições alimentares, condições médicas, lesões, etc."
                              rows={4}
                              disabled={step === 'loading'}
                              className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div
                      className="rounded-xl p-4 border"
                      style={{
                        backgroundColor: isProfessionalPersonal
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                        borderColor: isProfessionalPersonal
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Activity
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{ color: accentColor }}
                        />
                        <div className="text-sm">
                          <p className="mb-1" style={{ fontWeight: 600, color: accentColor }}>
                            Como funciona:
                          </p>
                          <ul className="space-y-1 text-xs" style={{ color: accentColor, opacity: 0.8 }}>
                            <li>• Se o e-mail já existir no sistema, o {patientLabel.toLowerCase()} será vinculado automaticamente</li>
                            <li>• Caso contrário, será criado um registro pendente de ativação</li>
                            <li>• {isProfessionalPersonal ? 'O aluno' : 'O paciente'} receberá um e-mail com instruções de acesso</li>
                            <li>• Você poderá acompanhar o status do convite no dashboard</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={step === 'loading'}
                        className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 hover:dark:bg-zinc-800 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        style={{ fontWeight: 600 }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={step === 'loading'}
                        className="flex-1 py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: accentGradient, fontWeight: 600 }}
                      >
                        {step === 'loading' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando convite...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Enviar Convite
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}