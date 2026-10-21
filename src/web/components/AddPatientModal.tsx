import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Mail, AlertCircle, UserPlus } from 'lucide-react'
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
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-title"
              className="cp-modal w-full sm:max-w-md pointer-events-auto max-h-[92vh] flex flex-col"
            >
              <span aria-hidden className="cp-modal-bar" />
              <div className="flex items-start justify-between gap-4 p-6 pb-5">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl grid place-items-center bg-[rgba(85,70,255,0.16)] border border-[rgba(140,130,255,0.3)]">
                    <UserPlus className="w-5 h-5 text-[var(--brand-300)]" />
                  </span>
                  <div>
                    <h3 id="invite-title" className="cp-display text-[22px] font-bold leading-tight">
                      Convidar {patientLabel.toLowerCase()}
                    </h3>
                    <p className="text-[13.5px] text-[var(--muted)] mt-1">
                      O {patientLabel.toLowerCase()} precisa já ter conta CoachPass
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={step === 'loading'}
                  aria-label="Fechar"
                  className="w-9 h-9 shrink-0 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <AnimatePresence mode="wait">
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                        className="mx-auto w-20 h-20 rounded-full grid place-items-center cp-selected"
                      >
                        <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={2.6}>
                          <motion.path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                          />
                        </svg>
                      </motion.span>
                      <h4 className="cp-display mt-5 text-[22px] font-bold">Vínculo criado</h4>
                      <p className="mt-1.5 text-[14px] text-[var(--muted)]">
                        {patientLabel} encontrado e vinculado à sua conta.
                      </p>
                    </motion.div>
                  )}

                  {step === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <span className="mx-auto w-20 h-20 rounded-full grid place-items-center bg-[rgba(255,93,108,0.12)] border border-[rgba(255,93,108,0.35)]">
                        <AlertCircle className="w-9 h-9 text-[#ff8a95]" />
                      </span>
                      <h4 className="cp-display mt-5 text-[22px] font-bold">Não foi possível convidar</h4>
                      <p className="mt-1.5 mb-6 text-[14px] text-[var(--muted)]">{errorMessage}</p>
                      <button type="button" onClick={() => setStep('form')} className="cp-btn-sm mx-auto">
                        Tentar novamente
                      </button>
                    </motion.div>
                  )}

                  {(step === 'form' || step === 'loading') && (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="invite-email"
                          className="cp-mono block mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]"
                        >
                          E-mail do {patientLabel.toLowerCase()}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
                          <input
                            id="invite-email"
                            type="email"
                            autoFocus
                            {...register('email', {
                              required: 'E-mail é obrigatório',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'E-mail inválido',
                              },
                            })}
                            placeholder={isProfessionalPersonal ? 'aluno@email.com' : 'paciente@email.com'}
                            disabled={step === 'loading'}
                            aria-invalid={Boolean(errors.email)}
                            className="cp-field disabled:opacity-50"
                          />
                        </div>
                        {errors.email && <p className="text-[12.5px] text-[#ff8a95] mt-2">{errors.email.message}</p>}
                      </div>

                      <div className="rounded-2xl p-4 border border-[var(--line)] bg-white/[0.02]">
                        <p className="cp-kicker mb-3">Como funciona</p>
                        <ol className="space-y-2.5">
                          {[
                            `Buscamos um ${patientLabel.toLowerCase()} com este e-mail`,
                            'Se existir, criamos o vínculo profissional',
                            'Se não existir, peça para a pessoa se cadastrar no CoachPass primeiro',
                          ].map((t, i) => (
                            <li key={t} className="flex gap-3 text-[13.5px] text-[var(--muted)]">
                              <span className="cp-mono w-5 h-5 shrink-0 rounded-md grid place-items-center text-[10.5px] bg-white/[0.06] text-[var(--cream)]">
                                {i + 1}
                              </span>
                              {t}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={step === 'loading'}
                          className="cp-btn-ghost flex-1 justify-center h-12 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={step === 'loading'}
                          className="cp-selected flex-[1.3] h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:brightness-110 disabled:opacity-60"
                        >
                          {step === 'loading' ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
