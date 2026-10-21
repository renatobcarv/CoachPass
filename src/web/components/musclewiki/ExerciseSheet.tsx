import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Briefcase, GraduationCap, Play, Plus, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  MwError,
  MwExercise,
  mwCategoryPt,
  mwDifficultyPt,
  mwErrorHelp,
  mwExercise,
  mwForcePt,
  mwMechanicPt,
  mwMediaToken,
  mwMusclePt,
  mwBodymapSrc,
  mwVideoSrc,
} from '../../lib/musclewiki'
import { bodymapFor } from '../../lib/bodymap'
import { Badge } from '../student/ui'
import { Segmented } from '../pro/ui'

type Audience = 'aluno' | 'personal'

/** Sugestão de prescrição a partir da mecânica/dificuldade (apoio, não regra). */
function coachingHint(ex: MwExercise) {
  const compound = /compound/i.test(ex.mechanic || '')
  const advanced = /advanced/i.test(ex.difficulty || '')
  return {
    role: compound ? 'Exercício principal do treino' : 'Exercício acessório / de isolamento',
    volume: compound ? '3–5 séries de 6–10 repetições' : '2–4 séries de 10–15 repetições',
    rest: compound ? '90–150 s de descanso' : '45–75 s de descanso',
    note: advanced
      ? 'Exige boa técnica: prefira para alunos intermediários/avançados e valide a execução antes de progredir carga.'
      : 'Boa opção para ensinar o padrão de movimento; progrida carga só com execução estável.',
  }
}

export function ExerciseSheet({
  exerciseId,
  initialName,
  onClose,
  onAdd,
  defaultAudience = 'personal',
}: {
  exerciseId: number | null
  initialName?: string
  onClose: () => void
  onAdd?: (ex: MwExercise) => void
  defaultAudience?: Audience
}) {
  const { user } = useAuth()
  const [ex, setEx] = useState<MwExercise | null>(null)
  const [error, setError] = useState<MwError | null>(null)
  const [loading, setLoading] = useState(false)
  const [audience, setAudience] = useState<Audience>(defaultAudience)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [angle, setAngle] = useState<string>('front')
  const [playing, setPlaying] = useState(false)
  const [mediaToken, setMediaToken] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [view, setView] = useState<'front' | 'back'>('front')
  const [mapFailed, setMapFailed] = useState(false)

  useEffect(() => {
    if (!exerciseId || !user?.accessToken) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setEx(null)
    setPlaying(false)
    setMapFailed(false)
    mwExercise(user.accessToken, exerciseId)
      .then((data) => {
        if (cancelled) return
        setEx(data)
        // token de mídia para bodymap/poster (o vídeo só carrega no play)
        mwMediaToken(user.accessToken!).then((t) => !cancelled && setMediaToken(t)).catch(() => setMapFailed(true))
      })
      .catch((err) => !cancelled && setError(err instanceof MwError ? err : new MwError('MW_ERROR', 'Falha')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [exerciseId, user?.accessToken])

  const videos = ex?.videos || []
  const angles = useMemo(() => Array.from(new Set(videos.map((v) => v.angle))), [videos])
  const genders = useMemo(() => Array.from(new Set(videos.map((v) => v.gender))), [videos])
  const current =
    videos.find((v) => v.angle === angle && v.gender === gender) ||
    videos.find((v) => v.gender === gender) ||
    videos[0]

  const play = async () => {
    if (!user?.accessToken || !current) return
    try {
      const needsToken = !!current.url && (current.url.includes('/stream/') || !current.url.startsWith('http'))
      if (needsToken && !mediaToken) setMediaToken(await mwMediaToken(user.accessToken))
      setPlaying(true)
      setTimeout(() => videoRef.current?.play().catch(() => undefined), 50)
    } catch (err) {
      setError(err instanceof MwError ? err : new MwError('MW_ERROR', 'Falha ao carregar o vídeo'))
    }
  }

  const src = playing ? mwVideoSrc(current?.url, mediaToken) : null
  const hint = ex ? coachingHint(ex) : null
  const muscles = [
    ...(ex?.primary_muscles || []).map((m) => ({ m, tone: 'blue' as const })),
    ...(ex?.secondary_muscles || []).map((m) => ({ m, tone: 'neutral' as const })),
  ]

  return (
    <AnimatePresence>
      {exerciseId && (
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
            aria-label={ex?.name || initialName || 'Exercício'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="cp-modal fixed z-[61] inset-y-0 right-0 w-full sm:w-[520px] !rounded-none sm:!rounded-l-[28px] flex flex-col"
          >
            <span aria-hidden className="cp-modal-bar shrink-0" />
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[var(--line)] shrink-0">
              <div className="min-w-0">
                <p className="cp-kicker">Biblioteca MuscleWiki</p>
                <h2 className="cp-display mt-1 text-[24px] font-bold leading-tight">{ex?.name || initialName || 'Carregando…'}</h2>
                {ex && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ex.category && <Badge>{mwCategoryPt(ex.category)}</Badge>}
                    {ex.difficulty && <Badge tone="amber">{mwDifficultyPt(ex.difficulty)}</Badge>}
                  </div>
                )}
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

            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-6 space-y-3">
                  <div className="aspect-video rounded-2xl bg-white/[0.04] animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-white/[0.04] animate-pulse" />
                </div>
              )}

              {error && (
                <div className="m-6 rounded-2xl border border-[rgba(255,181,71,0.35)] bg-[rgba(255,181,71,0.07)] p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-[var(--amber)]" />
                  <div>
                    <p className="font-semibold text-[var(--amber)]">MuscleWiki indisponível</p>
                    <p className="mt-1 text-[13.5px] text-[var(--muted)]">{mwErrorHelp[error.code]}</p>
                  </div>
                </div>
              )}

              {ex && (
                <div className="p-6 space-y-6">
                  {/* Vídeo */}
                  <div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--line)] bg-[#05060b]">
                      {src ? (
                        <video
                          ref={videoRef}
                          key={src}
                          src={src}
                          className="w-full h-full object-contain"
                          poster={mwVideoSrc(current?.og_image, mediaToken) || undefined}
                          controls
                          playsInline
                          loop
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={play}
                          disabled={!current}
                          className="absolute inset-0 grid place-items-center group"
                          aria-label="Reproduzir demonstração"
                        >
                          <span className="cp-selected w-16 h-16 rounded-full grid place-items-center transition-transform group-hover:scale-105">
                            <Play className="w-7 h-7 ml-1" fill="currentColor" />
                          </span>
                          <span className="absolute bottom-4 text-[12.5px] text-[var(--muted)]">
                            {current ? 'Toque para ver a execução' : 'Sem vídeo para este exercício'}
                          </span>
                        </button>
                      )}
                    </div>
                    {videos.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {angles.length > 1 && (
                          <Segmented
                            size="sm"
                            layoutId="mw-angle"
                            value={angle}
                            onChange={(v) => setAngle(v)}
                            options={angles.map((a) => ({ value: a, label: /side/i.test(a) ? 'Lateral' : /front/i.test(a) ? 'Frente' : a }))}
                          />
                        )}
                        {genders.length > 1 && (
                          <Segmented
                            size="sm"
                            layoutId="mw-gender"
                            value={gender}
                            onChange={(v) => setGender(v as 'male' | 'female')}
                            options={genders.map((g) => ({ value: g, label: g === 'female' ? 'Modelo feminina' : 'Modelo masculino' }))}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mapa do corpo (MuscleWiki) com reserva local */}
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <figure className="relative rounded-2xl overflow-hidden border border-[var(--line)] bg-[#f3f4f9]">
                      {!mapFailed && mediaToken ? (
                        <img
                          src={mwBodymapSrc(ex.id, mediaToken, { gender, view }) || ''}
                          alt={`Músculos trabalhados — vista ${view === 'front' ? 'frontal' : 'posterior'}`}
                          onError={() => setMapFailed(true)}
                          className="w-full h-[200px] object-contain"
                        />
                      ) : (
                        <img
                          src={bodymapFor(...(ex.primary_muscles || []))}
                          alt="Parte do corpo trabalhada"
                          className="w-full h-[200px] object-contain"
                        />
                      )}
                    </figure>
                    <div className="space-y-3">
                      {!mapFailed && mediaToken && (
                        <Segmented
                          size="sm"
                          layoutId="mw-view"
                          value={view}
                          onChange={setView}
                          options={[
                            { value: 'front', label: 'Frente' },
                            { value: 'back', label: 'Costas' },
                          ]}
                        />
                      )}
                      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                        {mapFailed || !mediaToken
                          ? 'Ilustração da região trabalhada. O mapa detalhado da MuscleWiki aparece quando o plano da conta inclui imagens.'
                          : 'Mapa da MuscleWiki com os músculos ativados neste exercício.'}
                      </p>
                    </div>
                  </div>

                  {/* Músculos */}
                  {muscles.length > 0 && (
                    <div>
                      <p className="cp-kicker mb-2">Músculos trabalhados</p>
                      <div className="flex flex-wrap gap-2">
                        {muscles.map(({ m, tone }) => (
                          <Badge key={m} tone={tone}>
                            {mwMusclePt(m)}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-[12px] text-[var(--dim)]">Em destaque: principais · em cinza: auxiliares.</p>
                    </div>
                  )}

                  {/* Explicação por público */}
                  <div>
                    <Segmented
                      layoutId="mw-audience"
                      value={audience}
                      onChange={setAudience}
                      options={[
                        { value: 'aluno', label: 'Para o aluno', icon: GraduationCap },
                        { value: 'personal', label: 'Para o personal', icon: Briefcase },
                      ]}
                    />

                    {audience === 'aluno' ? (
                      <div className="mt-4 space-y-4">
                        <ol className="space-y-3">
                          {(ex.steps || []).map((step, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="cp-mono w-6 h-6 shrink-0 rounded-lg grid place-items-center text-[11px] cp-selected">{i + 1}</span>
                              <p className="text-[14.5px] leading-relaxed text-[var(--cream)]">{step}</p>
                            </li>
                          ))}
                          {(ex.steps || []).length === 0 && (
                            <p className="text-[14px] text-[var(--muted)]">Sem passo a passo para este exercício.</p>
                          )}
                        </ol>
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
                      hint && (
                        <div className="mt-4 space-y-4">
                          <dl className="grid grid-cols-2 gap-2">
                            {[
                              { k: 'Mecânica', v: mwMechanicPt(ex.mechanic) || '—' },
                              { k: 'Força', v: mwForcePt(ex.force) || '—' },
                              { k: 'Equipamento', v: mwCategoryPt(ex.category) || '—' },
                              { k: 'Pegadas', v: (ex.grips || []).join(', ') || '—' },
                            ].map(({ k, v }) => (
                              <div key={k} className="rounded-xl px-3 py-2.5 border border-[var(--line)]">
                                <dt className="text-[11px] text-[var(--dim)]">{k}</dt>
                                <dd className="mt-0.5 text-[14px] font-semibold">{v}</dd>
                              </div>
                            ))}
                          </dl>
                          <div className="rounded-2xl border border-[rgba(140,130,255,0.3)] bg-[rgba(85,70,255,0.08)] p-4">
                            <p className="cp-kicker mb-2">Sugestão de prescrição</p>
                            <p className="font-semibold">{hint.role}</p>
                            <p className="mt-1 text-[14px] text-[var(--cream)]">
                              {hint.volume} · {hint.rest}
                            </p>
                            <p className="mt-2 text-[13px] text-[var(--muted)]">{hint.note}</p>
                            <p className="mt-2 text-[11.5px] text-[var(--dim)]">Referência geral — ajuste ao objetivo e à avaliação do aluno.</p>
                          </div>
                          {(ex.steps || []).length > 0 && (
                            <details className="rounded-2xl border border-[var(--line)] p-4 group">
                              <summary className="cursor-pointer text-[14px] font-semibold list-none flex items-center justify-between">
                                Pontos de execução para corrigir
                                <span className="text-[var(--dim)] group-open:rotate-45 transition-transform">+</span>
                              </summary>
                              <ol className="mt-3 space-y-2 list-decimal pl-5 text-[13.5px] text-[var(--muted)]">
                                {(ex.steps || []).map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ol>
                            </details>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {onAdd && ex && (
              <div className="p-5 border-t border-[var(--line)] shrink-0">
                <button
                  type="button"
                  onClick={() => onAdd(ex)}
                  className="cp-selected w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <Plus className="w-4 h-4" /> Adicionar à ficha do treino
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
