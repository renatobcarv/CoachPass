import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { generateMealPlanWithAi, generateWorkoutWithAi } from '../../lib/studentApi'

/** Gera treino ou sugestão alimentar com IA (conta na cota mensal do aluno). */
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

  const run = async () => {
    if (!user?.accessToken || busy) return
    setBusy(true)
    try {
      if (kind === 'workout') {
        const res = await generateWorkoutWithAi(user.accessToken)
        toast.success(res.count > 1 ? `${res.count} treinos gerados.` : 'Treino gerado.', {
          description: `Gerações restantes no mês: ${res.remaining}.`,
        })
      } else {
        const res = await generateMealPlanWithAi(user.accessToken)
        toast.success(`Sugestão "${res.title}" gerada.`, {
          description: `Informativa, não substitui prescrição. Restantes no mês: ${res.remaining}.`,
        })
      }
      onDone?.()
    } catch (err) {
      const msg = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : ''
      toast.error(msg || 'A IA não respondeu agora. Tente de novo em instantes.')
    } finally {
      setBusy(false)
    }
  }

  return (
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
  )
}
