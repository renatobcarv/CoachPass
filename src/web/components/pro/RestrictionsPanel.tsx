import React, { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { createRestriction, fetchRestrictionsForStudent, type RestrictionDoc } from '../../lib/professionalApi'
import { RESTRICTIONS_API, patchJson } from '@/lib/cms'
import { CTAButton } from '../brand/Brand'
import { Badge, Card, SectionTitle, Skeleton } from '../student/ui'
import { Choice, Field, TextArea, dateToApi, errorText, fmtDate } from './records'

const TYPE: Record<RestrictionDoc['type'], string> = { injury: 'Lesão', medical: 'Médica', dietary: 'Alimentar', other: 'Outra' }
const SEVERITY: Record<RestrictionDoc['severity'], { label: string; tone: 'neutral' | 'amber' | 'violet' }> = {
  low: { label: 'Baixa', tone: 'neutral' },
  moderate: { label: 'Moderada', tone: 'amber' },
  high: { label: 'Alta', tone: 'violet' },
}

const EMPTY = {
  type: 'injury' as RestrictionDoc['type'],
  severity: 'moderate' as RestrictionDoc['severity'],
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  medicalClearance: false,
}

/** Restrições do aluno/paciente: o que evitar no treino ou na dieta. Ativas aparecem primeiro. */
export function RestrictionsPanel({ studentId, compact }: { studentId: string; compact?: boolean }) {
  const { user } = useAuth()
  const token = user?.accessToken
  const [list, setList] = useState<RestrictionDoc[] | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!token || !studentId) return
    try {
      const docs = await fetchRestrictionsForStudent(studentId, token)
      setList(docs.sort((a, b) => Number(Boolean(b.active)) - Number(Boolean(a.active))))
    } catch (err) {
      setList([])
      toast.error(errorText(err, 'Não foi possível carregar as restrições.'))
    }
  }, [token, studentId])

  useEffect(() => {
    setList(null)
    void load()
  }, [load])

  const save = async () => {
    if (!token) return
    if (!form.title.trim()) return toast.error('Dê um nome à restrição, por exemplo "Dor no ombro direito".')
    setSaving(true)
    try {
      await createRestriction(
        {
          student: studentId,
          type: form.type,
          severity: form.severity,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          startDate: dateToApi(form.startDate),
          endDate: dateToApi(form.endDate),
          medicalClearance: form.medicalClearance,
          active: true,
        },
        token,
      )
      toast.success('Restrição registrada.')
      setForm(EMPTY)
      setOpen(false)
      await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível salvar.'))
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (r: RestrictionDoc) => {
    if (!token) return
    try {
      await patchJson(`${RESTRICTIONS_API}/${r.id}`, { active: !r.active }, token)
      await load()
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível atualizar.'))
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <SectionTitle
        icon={AlertTriangle}
        action={
          !open && (
            <button type="button" onClick={() => setOpen(true)} className="cp-btn-sm h-9 px-3 text-[13px]">
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          )
        }
      >
        Restrições
      </SectionTitle>

      {open && (
        <div className="mb-5 space-y-4 rounded-2xl border border-[var(--line-2)] p-4">
          <Field label="Nome" placeholder="Ex.: dor no ombro direito, intolerância à lactose" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
          <Choice label="Tipo" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={(Object.keys(TYPE) as RestrictionDoc['type'][]).map((v) => ({ value: v, label: TYPE[v] }))} />
          <Choice
            label="Gravidade"
            value={form.severity}
            onChange={(v) => setForm((f) => ({ ...f, severity: v }))}
            options={(Object.keys(SEVERITY) as RestrictionDoc['severity'][]).map((v) => ({ value: v, label: SEVERITY[v].label }))}
          />
          <TextArea label="O que evitar / orientações" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Desde" type="date" value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} />
            <Field label="Até (se temporária)" type="date" value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} />
          </div>
          <label className="flex items-center gap-3 text-[14px]">
            <input type="checkbox" checked={form.medicalClearance} onChange={(e) => setForm((f) => ({ ...f, medicalClearance: e.target.checked }))} className="h-4 w-4" />
            Tem liberação médica
          </label>
          <div className="flex gap-3">
            <CTAButton type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </CTAButton>
            <button type="button" onClick={() => setOpen(false)} className="cp-btn-ghost">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {list === null ? (
        <Skeleton className="h-20" />
      ) : list.length === 0 ? (
        <p className="text-[14px] text-[var(--muted)]">Nenhuma restrição registrada.</p>
      ) : (
        <ul className="space-y-2">
          {list.slice(0, compact ? 4 : undefined).map((r) => (
            <li key={r.id} className={`rounded-2xl border border-[var(--line)] p-4 ${r.active ? '' : 'opacity-55'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.title}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge>{TYPE[r.type]}</Badge>
                  <Badge tone={SEVERITY[r.severity].tone}>{SEVERITY[r.severity].label}</Badge>
                  {!r.active && <Badge>Encerrada</Badge>}
                </div>
              </div>
              {r.description && <p className="mt-1.5 text-[13.5px] text-[var(--muted)]">{r.description}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--dim)]">
                <span>
                  {r.startDate ? `Desde ${fmtDate(r.startDate)}` : ''}
                  {r.endDate ? ` · até ${fmtDate(r.endDate)}` : ''}
                  {r.medicalClearance ? ' · com liberação médica' : ''}
                </span>
                <button type="button" onClick={() => void toggle(r)} className="text-[12px] text-[var(--muted)] underline-offset-2 hover:text-white hover:underline">
                  {r.active ? 'Encerrar' : 'Reativar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
