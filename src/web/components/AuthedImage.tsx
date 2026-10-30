import React, { useEffect, useState } from 'react'

const FALLBACK = 'https://ui-avatars.com/api/?name=User&background=000326&color=fff'

function needsAuth(src: string): boolean {
  return src.includes('/api/media/')
}

export function AuthedImage({
  src,
  alt,
  className,
  token,
}: {
  src?: string | null
  alt: string
  className?: string
  token?: string | null
}) {
  const [shown, setShown] = useState(FALLBACK)

  useEffect(() => {
    const next = src?.trim()
    if (!next) {
      setShown(FALLBACK)
      return
    }
    if (!needsAuth(next) || !token) {
      setShown(next)
      return
    }

    const holder = { url: null as string | null }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(next, { headers: { Authorization: `JWT ${token}` } })
        if (!res.ok || cancelled) {
          if (!cancelled) setShown(FALLBACK)
          return
        }
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)
        holder.url = objectUrl
        if (!cancelled) setShown(objectUrl)
      } catch {
        if (!cancelled) setShown(FALLBACK)
      }
    })()

    return () => {
      cancelled = true
      if (holder.url) URL.revokeObjectURL(holder.url)
    }
  }, [src, token])

  return <img src={shown} alt={alt} className={className} />
}
