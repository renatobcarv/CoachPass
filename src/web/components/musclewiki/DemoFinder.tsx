import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, PlayCircle, Video, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { MwError, MwExercise, mwCategoryPt, mwDifficultyPt, mwErrorHelp, mwSearch } from '../../lib/musclewiki'
import { ExerciseSheet } from './ExerciseSheet'

/**
 * Botão "Ver demonstração" para um exercício do treino: procura o nome na MuscleWiki,
 * deixa o aluno escolher o resultado certo e abre a ficha com vídeo e passo a passo.
 */
export function DemoFinder({ exerciseName }: { exerciseName: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<MwExercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<MwError | null>(null)
  const [sheet, setSheet] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    if (!open || !user?.accessToken) return
    let cancelled = false
    setLoading(true)
    setError(null)
    mwSearch(user.accessToken, exerciseName, { limit: 6 })
      .then((list) => {
        if (cancelled) return
        setResults(list)
        // Um resultado só: abre direto o vídeo
        if (list.length === 1) {
          setOpen(false)
          setSheet({ id: list[0].id, name: list[0].name })
        }
      })
      .catch((err) => !cancelled && setError(err instanceof MwError ? err : new MwError('MW_ERROR', 'Falha')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [open, exerciseName, user?.accessToken])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[rgba(140,130,255,0.35)] text-[12.5px] font-medium text-[var(--brand-300)] hover:bg-[rgba(85,70,255,0.1)] transition-colors"
      >
        <Video className="w-3.5 h-3.5" />
        Ver demonstração
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Escolha a demonstração"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="cp-modal relative z-10 w-full sm:max-w-md max-h-[80vh] flex flex-col"
            >
              <span aria-hidden className="cp-modal-bar" />
              <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--line)]">
                <div>
                  <p className="cp-kicker">Demonstração</p>
                  <p className="cp-display mt-1 text-[19px] font-bold">{exerciseName}</p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">Escolha o vídeo que corresponde ao seu exercício.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="w-9 h-9 shrink-0 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {loading && (
                  <div className="space-y-2 p-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 rounded-2xl bg-white/[0.04] animate-pulse" />
                    ))}
                  </div>
                )}
                {error && (
                  <div className="m-2 rounded-2xl border border-[rgba(255,181,71,0.35)] bg-[rgba(255,181,71,0.07)] p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-[var(--amber)]" />
                    <p className="text-[13.5px] text-[var(--muted)]">{mwErrorHelp[error.code]}</p>
                  </div>
                )}
                {!loading && !error && results.length === 0 && (
                  <p className="p-6 text-center text-[14px] text-[var(--muted)]">
                    Não encontramos uma demonstração para este exercício. Peça ajuda ao seu personal.
                  </p>
                )}
                {!loading &&
                  results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        setSheet({ id: r.id, name: r.name })
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl text-left hover:bg-white/[0.04] transition-colors"
                    >
                      <PlayCircle className="w-8 h-8 shrink-0 text-[var(--brand-300)]" />
                      <span className="min-w-0">
                        <span className="block text-[14.5px] font-semibold leading-snug">{r.name}</span>
                        <span className="block text-[12px] text-[var(--dim)]">
                          {[mwCategoryPt(r.category), mwDifficultyPt(r.difficulty)].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExerciseSheet
        exerciseId={sheet?.id ?? null}
        initialName={sheet?.name}
        onClose={() => setSheet(null)}
        defaultAudience="aluno"
      />
    </>
  )
}
