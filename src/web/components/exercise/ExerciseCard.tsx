import React from 'react'
import { motion } from 'motion/react'
import { Check, Eye, Plus, Video } from 'lucide-react'
import { Badge } from '../student/ui'
import { PhotoLoop } from './PhotoLoop'

/** Card visual de exercício: parte do corpo em destaque, nome inteiro e ações de ver/adicionar. */
export function ExerciseCard({
  name,
  image,
  fallbackImage,
  photo,
  photos,
  imageAlt,
  muscle,
  equipment,
  difficulty,
  difficultyTone = 'neutral',
  hasVideo,
  count = 0,
  onOpen,
  onAdd,
}: {
  name: string
  image: string
  /** usado se a imagem principal falhar (ex.: plano/cota da MuscleWiki) */
  fallbackImage?: string
  /** foto real (ex.: miniatura do vídeo) — ocupa o card inteiro */
  photo?: boolean
  /** fotos reais [início, fim] do movimento; quando presentes, viram a imagem principal */
  photos?: [string, string] | null
  imageAlt: string
  muscle?: string
  equipment?: string
  difficulty?: string
  difficultyTone?: 'teal' | 'blue' | 'amber' | 'neutral'
  hasVideo?: boolean
  count?: number
  onOpen: () => void
  onAdd: () => void
}) {
  return (
    <motion.article
      layout
      className={`cp-spot group relative flex flex-col rounded-2xl border overflow-hidden transition-[border-color,background] ${
        count ? 'border-[rgba(140,130,255,0.55)] bg-[rgba(85,70,255,0.07)]' : 'border-[var(--line)] bg-white/[0.02] hover:border-[var(--line-2)]'
      }`}
    >
      <button type="button" onClick={onOpen} className="relative block text-left" aria-label={`Ver detalhes de ${name}`}>
        <div className="relative h-[150px] bg-[#f3f4f9] overflow-hidden">
          {photos ? (
            <PhotoLoop photos={photos} alt={name} mode="hover" className="absolute inset-0" />
          ) : (
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            onError={(e) => {
              if (fallbackImage && e.currentTarget.src !== new URL(fallbackImage, window.location.href).href) {
                e.currentTarget.src = fallbackImage
                e.currentTarget.classList.remove('object-cover')
                e.currentTarget.classList.add('object-contain')
              }
            }}
            className={`w-full h-full ${photo ? 'object-cover' : 'object-contain'} transition-transform duration-500 group-hover:scale-[1.04]`}
          />
          )}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {/* fundo escuro por trás da etiqueta para contrastar com a ilustração clara */}
            {difficulty && (
              <span className="rounded-full bg-[#05060b]/85">
                <Badge tone={difficultyTone}>{difficulty}</Badge>
              </span>
            )}
          </div>
          {hasVideo && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#05060b]/80 px-2 py-1 text-[10.5px] font-semibold text-white">
              <Video className="w-3 h-3" /> vídeo
            </span>
          )}
          {count > 0 && (
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full cp-selected px-2.5 py-1 text-[11px] font-semibold">
              <Check className="w-3 h-3" strokeWidth={3} /> Na ficha{count > 1 ? ` ×${count}` : ''}
            </span>
          )}
        </div>
        <div className="px-4 pt-3.5">
          <h3 className="text-[15px] font-semibold leading-snug">{name}</h3>
          <p className="mt-1 text-[12.5px] text-[var(--dim)]">{[muscle, equipment].filter(Boolean).join(' · ')}</p>
        </div>
      </button>
      <div className="mt-auto flex gap-2 p-3 pt-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 h-9 rounded-full border border-[var(--line-2)] text-[13px] font-medium text-[var(--cream)] inline-flex items-center justify-center gap-1.5 hover:bg-white/[0.05]"
        >
          <Eye className="w-3.5 h-3.5" /> Detalhes
        </button>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Adicionar ${name}`}
          className="flex-1 h-9 rounded-full cp-selected text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 hover:brightness-110"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
    </motion.article>
  )
}
