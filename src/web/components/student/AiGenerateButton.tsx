import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { generateMealPlanWithAi } from '../../lib/studentApi'
import { AiWorkoutQuiz } from './AiWorkoutQuiz'

/** Treino: abre o quiz antes de gerar. Refeição: gera direto. As duas contam na cota mensal do aluno. */
export function AiGenerateButton({
  kind,
  onDone,
  variant = 'ghost',
}: {
  kind: 'workout' | 'meal'
  onDone?: () => void
  variant?: 'ghost' | 'solid'
}) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [quiz, setQuiz] = useState(false)

  const run = async () => {
    if (kind === 'workout') {
      setQuiz(true)
      return
    }
    if (!user?.accessToken || busy) return
    setBusy(true)
    try {
      const res = await generateMealPlanWithAi(user.accessToken)
      toast.success(`Sugestão "${res.title}" gerada.`, {
        description: `Informativa, não substitui prescrição. Restantes no mês: ${res.remaining}.`,
      })
      onDone?.()
    } catch (err) {
      const msg = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : ''
      toast.error(msg || 'A IA não respondeu agora. Tente de novo em instantes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className={`${variant === 'solid' ? 'cp-btn-sm' : 'cp-btn-ghost'} disabled:opacity-60`}
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {busy ? 'Gerando…' : kind === 'workout' ? 'Gerar treino com IA' : 'Gerar sugestão com IA'}
      </button>
      {kind === 'workout' && (
        <AiWorkoutQuiz open={quiz} onClose={() => setQuiz(false)} onDone={onDone} />
      )}
    </>
  )
}
