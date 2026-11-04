import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Apple, ArrowLeftRight, Dumbbell, User } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'

type Panel = 'student' | 'personal' | 'nutritionist'

const LABEL: Record<Panel, string> = {
  student: 'conta de aluno',
  personal: 'painel do personal',
  nutritionist: 'painel da nutrição',
}
const ICON: Record<Panel, React.ComponentType<{ className?: string }>> = {
  student: User,
  personal: Dumbbell,
  nutritionist: Apple,
}

/** Painéis que a conta pode abrir além do atual. */
export function useOtherPanels(): Panel[] {
  const { user } = useAuth()
  if (!user || user.role === 'master') return []
  const roles = (user.roles ?? []) as Panel[]
  return roles.filter((r) => r !== user.role)
}

/**
 * Troca de conta: o personal usa o app como aluno (os próprios treinos, periodização e evolução)
 * e volta com um clique. Só aparece para quem tem mais de um painel liberado.
 */
export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { switchRole } = useAuth()
  const navigate = useNavigate()
  const others = useOtherPanels()
  const [busy, setBusy] = useState<Panel | null>(null)
  if (!others.length) return null

  const go = async (role: Panel) => {
    setBusy(role)
    try {
      const home = await switchRole(role)
      toast.success(`Você está na ${LABEL[role]}.`)
      navigate(home, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível trocar agora.')
    } finally {
      setBusy(null)
    }
  }

  if (compact) {
    const role = others[0]
    return (
      <button
        type="button"
        onClick={() => void go(role)}
        disabled={busy !== null}
        aria-label={`Trocar para ${LABEL[role]}`}
        className="h-9 rounded-full border border-[var(--line-2)] px-3 text-[12.5px] font-semibold text-[var(--muted)] transition hover:text-white disabled:opacity-50 inline-flex items-center gap-1.5"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        {role === 'student' ? 'Aluno' : role === 'personal' ? 'Personal' : 'Nutri'}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {others.map((role) => {
        const Icon = ICON[role]
        return (
          <button
            key={role}
            type="button"
            onClick={() => void go(role)}
            disabled={busy !== null}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--line-2)] bg-white/[0.025] p-3 text-left transition-colors hover:border-[var(--brand-400)] disabled:opacity-60"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(85,70,255,0.14)]">
              <Icon className="h-4 w-4 text-[var(--brand-300)]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold">
                {busy === role ? 'Trocando…' : `Trocar para ${LABEL[role]}`}
              </span>
              <span className="block text-[12px] text-[var(--muted)]">
                {role === 'student' ? 'Seus treinos, periodização e evolução' : 'Voltar ao painel profissional'}
              </span>
            </span>
            <ArrowLeftRight className="h-4 w-4 text-[var(--dim)] transition-colors group-hover:text-white" />
          </button>
        )
      })}
    </div>
  )
}
