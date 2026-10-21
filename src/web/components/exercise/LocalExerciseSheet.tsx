import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Briefcase, ExternalLink, GraduationCap, Lightbulb, Play, Plus, ShieldCheck, Target, Wrench, X } from 'lucide-react'
import { Exercise } from '../../data/exerciseLibrary'
import { getExerciseDetail } from '../../data/exerciseData'
import { bodymapFor } from '../../lib/bodymap'
import { exercisePhotos } from '../../data/exercisePhotos'
import { PhotoLoop } from './PhotoLoop'
import { Badge } from '../student/ui'
import { Segmented } from '../pro/ui'

type Audience = 'aluno' | 'personal'

const difficultyTone: Record<string, 'teal' | 'blue' | 'amber'> = {
  Iniciante: 'teal',
  Intermediário: 'blue',
  Avançado: 'amber',
}

/** Prescrição de referência pela dificuldade (apoio ao personal, não regra). */
function prescription(difficulty: string) {
  if (difficulty === 'Avançado')
    return { volume: '3–5 séries de 6–8 repetições', rest: '2–3 min de descanso', note: 'Exige técnica consolidada: valide a execução antes de progredir carga.' }
  if (difficulty === 'Intermediário')
    return { volume: '3–4 séries de 8–12 repetições', rest: '60–90 s de descanso', note: 'Bom para a fase de hipertrofia; progrida carga quando todas as repetições saírem limpas.' }
  return { volume: '2–3 séries de 10–15 repetições', rest: '45–60 s de descanso', note: 'Ótimo para ensinar o padrão de movimento e criar base para variações mais difíceis.' }
}

/** Ficha de pré-visualização de um exercício da biblioteca CoachPass, antes de adicionar ao treino. */
export function LocalExerciseSheet({
  exercise,
  onClose,
  onAdd,
  addedCount = 0,
}: {
  exercise: Exercise | null
  onClose: () => void
  onAdd?: (ex: Exercise) => void
  addedCount?: number
}) {
  const [audience, setAudience] = useState<Audience>('personal')
  const [playing, setPlaying] = useState(false)
  useEffect(() => setPlaying(false), [exercise?.name])

  const detail = exercise ? getExerciseDetail(exercise.name) : null
  const photos = exercise ? exercisePhotos(exercise.name) : null
  const rx = exercise ? prescription(exercise.difficulty) : null
  const youtubeSearch = exercise
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} execução correta`)}`
    : '#'

  return (
    <AnimatePresence>
      {exercise && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={exercise.name}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="cp-modal fixed z-[61] inset-y-0 right-0 w-full sm:w-[520px] !rounded-none sm:!rounded-l-[28px] flex flex-col"
          >
            <span aria-hidden className="cp-modal-bar shrink-0" />
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[var(--line)] shrink-0">
              <div className="min-w-0">
                <p className="cp-kicker">Biblioteca CoachPass · {exercise.muscle}</p>
                <h2 className="cp-display mt-1 text-[24px] font-bold leading-tight">{exercise.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{exercise.equipment}</Badge>
                  <Badge tone={difficultyTone[exercise.difficulty] || 'neutral'}>{exercise.difficulty}</Badge>
                  {addedCount > 0 && <Badge tone="teal">Na ficha ×{addedCount}</Badge>}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="w-9 h-9 shrink-0 rounded-full grid place-items-center border border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Fotos reais da execução (início ↔ fim) */}
              {photos && (
                <figure>
                  <PhotoLoop
                    photos={photos}
                    alt={exercise.name}
                    mode="auto"
                    showLabels
                    className="aspect-[4/3] rounded-2xl border border-[var(--line)]"
                  />
                  <figcaption className="mt-2 text-[11.5px] text-[var(--dim)]">
                    Posição inicial e final do movimento · fotos: free-exercise-db (domínio público)
                  </figcaption>
                </figure>
              )}

              {/* Parte do corpo + mídia */}
              {/* com foto: só a foto; sem foto: ilustração da parte do corpo */}
              <div className={photos ? '' : 'grid grid-cols-[150px_1fr] gap-4'}>
                {!photos && (
                  <figure className="rounded-2xl overflow-hidden border border-[var(--line)] bg-[#f3f4f9]">
                    <img
                      src={bodymapFor(exercise.muscle)}
                      alt={`Parte do corpo trabalhada: ${exercise.muscle}`}
                      className="w-full h-[220px] object-contain"
                    />
                  </figure>
                )}
                <div className={photos ? 'grid sm:grid-cols-3 gap-3' : 'flex flex-col gap-3 min-w-0'}>
                  <div className="rounded-2xl border border-[var(--line)] p-3">
                    <p className="flex items-center gap-1.5 cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">
                      <Target className="w-3 h-3" /> Músculo alvo
                    </p>
                    <p className="mt-1 text-[16px] font-semibold">{detail?.muscle || exercise.muscle}</p>
                  </div>
                  {detail?.secondaryMuscles?.length ? (
                    <div className="rounded-2xl border border-[var(--line)] p-3">
                      <p className="cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">Auxiliares</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {detail.secondaryMuscles.map((m) => (
                          <Badge key={m}>{m}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-[var(--line)] p-3">
                    <p className="flex items-center gap-1.5 cp-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--dim)]">
                      <Wrench className="w-3 h-3" /> Equipamento
                    </p>
                    <p className="mt-1 text-[14px] font-medium">{detail?.equipment || exercise.equipment}</p>
                  </div>
                </div>
              </div>

              {detail?.videoId ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--line)] bg-black">
                  {playing ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${detail.videoId}?autoplay=1&rel=0`}
                      title={`Execução: ${exercise.name}`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 group" aria-label="Ver vídeo de execução">
                      <img
                        src={`https://i.ytimg.com/vi/${detail.videoId}/hqdefault.jpg`}
                        alt=""
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                      />
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="cp-selected w-16 h-16 rounded-full grid place-items-center">
                          <Play className="w-7 h-7 ml-1" fill="currentColor" />
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <a
                  href={youtubeSearch}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] px-4 py-3 text-[14px] hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-[var(--brand-300)]" /> Ver vídeos de execução no YouTube
                  </span>
                  <ExternalLink className="w-4 h-4 text-[var(--dim)]" />
                </a>
              )}

              {detail?.overview && <p className="text-[15px] leading-relaxed text-[var(--cream)]">{detail.overview}</p>}

              <div>
                <Segmented
                  layoutId="local-audience"
                  value={audience}
                  onChange={setAudience}
                  options={[
                    { value: 'personal', label: 'Para o personal', icon: Briefcase },
                    { value: 'aluno', label: 'Para o aluno', icon: GraduationCap },
                  ]}
                />

                {audience === 'aluno' ? (
                  <div className="mt-4 space-y-4">
                    {detail?.steps?.length ? (
                      <ol className="space-y-3">
                        {detail.steps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="cp-mono w-6 h-6 shrink-0 rounded-lg grid place-items-center text-[11px] cp-selected">{i + 1}</span>
                            <p className="text-[14.5px] leading-relaxed text-[var(--cream)]">{step}</p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-[14px] text-[var(--muted)]">
                        Execute {exercise.name.toLowerCase()} com controle na ida e na volta, mantendo o foco em {exercise.muscle.toLowerCase()}.
                        O seu personal explica os detalhes na primeira sessão.
                      </p>
                    )}
                    <div className="rounded-2xl border border-[rgba(46,230,200,0.28)] bg-[rgba(46,230,200,0.06)] p-4 flex gap-3">
                      <ShieldCheck className="w-5 h-5 shrink-0 text-[var(--teal)]" />
                      <ul className="space-y-1 text-[13.5px] text-[var(--muted)]">
                        <li>Comece com carga leve e aumente só quando a execução estiver firme.</li>
                        <li>Controle a descida; não use impulso para completar a repetição.</li>
                        <li>Sentiu dor articular (não o cansaço do músculo)? Pare e avise seu personal.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  rx && (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-[rgba(140,130,255,0.3)] bg-[rgba(85,70,255,0.08)] p-4">
                        <p className="cp-kicker mb-2">Sugestão de prescrição</p>
                        <p className="text-[15px] font-semibold">{rx.volume}</p>
                        <p className="mt-0.5 text-[14px] text-[var(--cream)]">{rx.rest}</p>
                        <p className="mt-2 text-[13px] text-[var(--muted)]">{rx.note}</p>
                        <p className="mt-2 text-[11.5px] text-[var(--dim)]">Referência geral — ajuste ao objetivo e à avaliação do aluno.</p>
                      </div>
                      {detail?.tips?.length ? (
                        <div className="rounded-2xl border border-[var(--line)] p-4">
                          <p className="flex items-center gap-2 font-semibold">
                            <Lightbulb className="w-4 h-4 text-[var(--amber)]" /> Pontos de atenção
                          </p>
                          <ul className="mt-3 space-y-2 text-[13.5px] text-[var(--muted)]">
                            {detail.tips.map((t) => (
                              <li key={t}>{t.replace(/^[^\p{L}\d]+/u, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )
                )}
              </div>
            </div>

            {onAdd && (
              <div className="p-5 border-t border-[var(--line)] shrink-0">
                <button
                  type="button"
                  onClick={() => onAdd(exercise)}
                  className="cp-selected w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <Plus className="w-4 h-4" /> {addedCount > 0 ? 'Adicionar mais uma vez' : 'Adicionar à ficha do treino'}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
