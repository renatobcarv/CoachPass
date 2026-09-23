import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Mail, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { PROFESSIONAL_LINKS_INVITE_API, extractPayloadMessage } from '@/lib/cms'

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  professionalType: 'personal' | 'nutritionist'
  onSuccess?: (patient: { id: string; name: string; email: string; status?: string }) => void
}

interface InviteFormData {
  email: string
}

export function AddPatientModal({
  isOpen,
  onClose,
  professionalType,
  onSuccess,
}: AddPatientModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>()

  const handleClose = () => {
    if (step !== 'loading') {
      reset()
      setStep('form')
      setErrorMessage('')
      onClose()
    }
  }

  const onSubmit = async (data: InviteFormData) => {
    if (!user?.accessToken) {
      setErrorMessage('Faça login novamente para enviar o convite.')
      setStep('error')
      return
    }

    setStep('loading')
    setErrorMessage('')

    try {
      const response = await fetch(PROFESSIONAL_LINKS_INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${user.accessToken}`,
        },
        body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          (typeof result?.error === 'string' && result.error) ||
          extractPayloadMessage(result) ||
          'Erro ao enviar convite'
        throw new Error(message)
      }

      setStep('success')
      onSuccess?.({
        id: String(result.student?.id ?? result.link?.id ?? ''),
        name: String(result.student?.name || data.email),
        email: String(result.student?.email || data.email),
        status: result.link?.status || 'pending',
      })

      toast.success(
        result.alreadyLinked
          ? 'Este aluno já está vinculado a você.'
          : 'Vínculo criado. O aluno aparece como pendente.',
      )

      setTimeout(() => {
        handleClose()
      }, 1800)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao enviar convite. Tente novamente.'
      setErrorMessage(message)
      setStep('error')
      toast.error('Erro ao enviar convite')
    }
  }

  const isProfessionalPersonal = professionalType === 'personal'
  const patientLabel = isProfessionalPersonal ? 'Aluno' : 'Paciente'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md dark:bg-zinc-900 bg-white rounded-3xl border dark:border-zinc-800 border-slate-200 shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800 border-slate-200">
                <div>
                  <h3 className="dark:text-white text-slate-900 text-xl font-bold">
                    Convidar {patientLabel}
                  </h3>
                  <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1">
                    O {patientLabel.toLowerCase()} precisa já ter conta CoachPass
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={step === 'loading'}
                  className="w-10 h-10 rounded-xl dark:bg-zinc-800 bg-slate-100 dark:text-zinc-400 text-slate-500 hover:dark:bg-zinc-700 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {step === 'success' && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-[#000326]/10 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[#000326] dark:text-white" />
                    </div>
                    <h4 className="dark:text-white text-slate-900 text-lg font-semibold mb-2">
                      Vínculo criado
                    </h4>
                    <p className="text-sm dark:text-zinc-400 text-slate-500">
                      {patientLabel} encontrado e vinculado à sua conta.
                    </p>
                  </div>
                )}

                {step === 'error' && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="dark:text-white text-slate-900 text-lg font-semibold mb-2">
                      Não foi possível convidar
                    </h4>
                    <p className="text-sm dark:text-zinc-400 text-slate-500 mb-4">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#000326] dark:bg-white dark:text-[#000326]"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                {(step === 'form' || step === 'loading') && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <label className="block text-sm dark:text-zinc-300 text-slate-700 mb-2 font-medium">
                        E-mail do {patientLabel.toLowerCase()} *
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
                          placeholder="aluno@email.com"
                          disabled={step === 'loading'}
                          className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white text-slate-900 placeholder:dark:text-zinc-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000326]/20 disabled:opacity-50"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="rounded-xl p-4 border border-[#000326]/15 bg-[#000326]/5 dark:border-white/15 dark:bg-white/5">
                      <p className="text-sm font-semibold text-[#000326] dark:text-white mb-1">
                        Como funciona
                      </p>
                      <ul className="space-y-1 text-xs text-[#000326]/80 dark:text-[#C5C5CE]">
                        <li>
                          • Buscamos um usuário com role aluno e este e-mail
                        </li>
                        <li>• Se existir, criamos o vínculo profissional</li>
                        <li>
                          • Se não existir, peça para a pessoa se cadastrar no CoachPass primeiro
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={step === 'loading'}
                        className="flex-1 py-3 rounded-xl border dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 font-semibold hover:dark:bg-zinc-800 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={step === 'loading'}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#000326] dark:bg-white dark:text-[#000326] transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {step === 'loading' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-[#000326]/30 dark:border-t-[#000326] rounded-full animate-spin" />
                            Vinculando…
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Convidar
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
  )
}
