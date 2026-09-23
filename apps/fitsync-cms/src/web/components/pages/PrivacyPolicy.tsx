import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react'

const POLICY_URL = '/politica-de-privacidade.html'

export function PrivacyPolicy() {
  useEffect(() => {
    window.location.replace(POLICY_URL)
  }, [])

  return (
    <div className="min-h-screen bg-[#f3f4f9] dark:bg-[#000326] px-4 py-10">
      <div className="mx-auto max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#000326] dark:bg-white/10 mb-4">
          <Shield className="w-6 h-6 text-white dark:text-[#C5C5CE]" />
        </div>
        <h1 className="text-xl font-bold text-[#000326] dark:text-white">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
          Abrindo o documento completo…
        </p>
        <a
          href={POLICY_URL}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#000326] text-white dark:bg-white dark:text-[#000326]"
        >
          Abrir política completa
          <ExternalLink className="w-4 h-4" />
        </a>
        <div className="mt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-[#000326] dark:text-white hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
