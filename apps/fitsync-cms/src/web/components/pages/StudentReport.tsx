import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

export function StudentReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(id ? `/personal/aluno/${id}` : '/personal', { replace: true })
  }, [id, navigate])

  return <p className="p-8 text-sm dark:text-zinc-400">Abrindo ficha do aluno…</p>
}
