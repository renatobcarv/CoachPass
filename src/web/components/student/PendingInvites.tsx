import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Apple, Check, Dumbbell, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { fetchPendingProfessionalLinks, respondProfessionalLink, type ProfessionalLink } from '../../lib/studentApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { Badge, Card } from './ui'

/** Convites de personal/nutricionista esperando resposta do aluno. Some quando não há nenhum. */
export function PendingInvites({ onAccepted }: { onAccepted?: () => void }) {
  const { user } = useAuth()
  const [invites, setInvites] = useState<ProfessionalLink[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user?.accessToken || !user.id) return
    try {
      setInvites(await fetchPendingProfessionalLinks(user.id, user.accessToken))
    } catch {
      /* sem convites visíveis não bloqueia o painel */
    }
  }, [user?.accessToken, user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const respond = async (invite: ProfessionalLink, status: 'active' | 'revoked') => {
    if (!user?.accessToken) return
    setBusy(invite.id)
    try {
      await respondProfessionalLink(invite.id, status, user.accessToken)
      setInvites((list) => list.filter((i) => i.id !== invite.id))
      if (status === 'active') {
        toast.success('Convite aceito. Os treinos e planos publicados aparecem no seu painel.')
        onAccepted?.()
      } else {
        toast('Convite recusado.')
      }
    } catch (err) {
      const msg = err instanceof PayloadApiError ? extractPayloadMessage(err.data) : ''
      toast.error(msg || 'Não foi possível responder ao convite. Tente de novo.')
    } finally {
      setBusy(null)
    }
  }

  if (invites.length === 0) return null

  return (
    <Card className="mb-4 p-5 sm:p-6">
      <Badge tone="amber">
        {invites.length === 1 ? '1 convite novo' : `${invites.length} convites novos`}
      </Badge>
      <ul className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {invites.map((invite) => {
            const isNutri = invite.professionalRole === 'nutritionist'
            const Icon = isNutri ? Apple : Dumbbell
            const name = invite.professionalName || 'Um profissional'
            return (
              <motion.li
                key={invite.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--line-2)] p-4 sm:flex-row sm:items-center"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgba(85,70,255,0.14)]">
                  <Icon className="h-5 w-5 text-[var(--brand-300)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">
                    {name} quer acompanhar você como {isNutri ? 'nutricionista' : 'personal trainer'}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[var(--muted)]">
                    Ao aceitar, essa pessoa vê seu perfil e publica {isNutri ? 'seus planos alimentares' : 'seus treinos'}. Você pode encerrar o vínculo quando quiser.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void respond(invite, 'revoked')}
                    disabled={busy === invite.id}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[var(--line-2)] px-4 text-[14px] font-semibold text-[var(--muted)] transition hover:text-white disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                  <button
                    type="button"
                    onClick={() => void respond(invite, 'active')}
                    disabled={busy === invite.id}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[var(--paper)] px-5 text-[14px] font-semibold text-[var(--paper-ink)] transition hover:bg-white active:scale-[0.98] disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    {busy === invite.id ? 'Salvando…' : 'Aceitar'}
                  </button>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </Card>
  )
}
