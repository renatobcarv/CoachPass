import React, { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { photoFallback } from '../../data/exercisePhotos'

/**
 * Alterna as fotos de início e fim do movimento (crossfade), dando a ideia da execução.
 * mode="hover": troca só ao passar o mouse (cards em lista); mode="auto": loop contínuo.
 */
export function PhotoLoop({
  photos,
  alt,
  mode = 'auto',
  interval = 1300,
  className = '',
  showLabels = false,
}: {
  photos: [string, string]
  alt: string
  mode?: 'auto' | 'hover'
  interval?: number
  className?: string
  showLabels?: boolean
}) {
  const reduce = useReducedMotion()
  const [frame, setFrame] = useState(0)
  const [hover, setHover] = useState(false)
  const running = !reduce && (mode === 'auto' || hover)

  useEffect(() => {
    if (!running) {
      setFrame(0)
      return
    }
    setFrame(1)
    const id = window.setInterval(() => setFrame((f) => (f ? 0 : 1)), interval)
    return () => window.clearInterval(id)
  }, [running, interval])

  return (
    <div
      // posição vem do className quando o pai já posiciona (ex.: "absolute inset-0"); senão, relative
      className={`${className.split(" ").some((c) => c === "absolute" || c === "fixed") ? "" : "relative"} overflow-hidden bg-white ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {photos.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? `${alt} — posição inicial` : `${alt} — posição final`}
          loading="lazy"
          onError={(e) => {
            const next = photoFallback(e.currentTarget.src)
            if (next) e.currentTarget.src = next
          }}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: frame === i ? 1 : 0 }}
        />
      ))}
      {showLabels && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 rounded-full bg-[#05060b]/80 p-1">
          {['Início', 'Fim'].map((l, i) => (
            <button
              key={l}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFrame(i)
              }}
              className={`h-6 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${
                frame === i ? 'bg-white text-[#05060b]' : 'text-white/70'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
