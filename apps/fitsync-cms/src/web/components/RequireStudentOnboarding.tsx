import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { fetchMyStudentProfile } from '../lib/studentApi'

/** Garante onboarding completo antes do painel do aluno. */
export function RequireStudentOnboarding() {
  const { user, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (authLoading) return
      if (!user?.accessToken || user.role !== 'student') {
        setChecking(false)
        setComplete(true)
        return
      }
      try {
        const profile = await fetchMyStudentProfile(user.id, user.accessToken)
        if (!cancelled) {
          setComplete(Boolean(profile?.onboardingCompleted))
        }
      } catch {
        if (!cancelled) setComplete(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, user?.accessToken, user?.id, user?.role])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f9] dark:bg-[#000326]">
        <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">Verificando perfil…</p>
      </div>
    )
  }

  if (user?.role === 'student' && !complete) {
    return <Navigate to="/onboarding/student" replace />
  }

  return <Outlet />
}
