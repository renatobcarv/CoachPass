import React from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'

import { Page, PageHeader } from '../student/ui'
import { RestrictionsPanel } from '../pro/RestrictionsPanel'

/** Restrições de um aluno (lesões, condições médicas, alimentares). */
export function StudentRestriction() {
  const { id = '' } = useParams()
  return (
    <Page>
      <PageHeader
        kicker="Restrições"
        title="O que evitar"
        accent="no treino."
        lead="Lesões, condições médicas e restrições alimentares do aluno. Encerre quando não valer mais."
        action={
          <Link to={`/personal/aluno/${id}/evolucao`} className="cp-btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Voltar ao aluno
          </Link>
        }
      />
      <RestrictionsPanel studentId={id} />
    </Page>
  )
}
