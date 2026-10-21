import React, { useEffect, useState } from 'react'
import { Check, Dumbbell, Flame } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  EquipmentAccess,
  ExperienceLevel,
  StudentGoal,
  StudentProfile,
  StudentSex,
  ageFromBirthDate,
  fetchMyStudentProfile,
  goalLabel,
  saveStudentProfile,
} from '../../lib/studentApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { CTAButton } from '../brand/Brand'
import { Badge, Card, LoadingPage, Page, PageHeader } from '../student/ui'

const equipmentOptions: { value: EquipmentAccess; label: string }[] = [
  { value: 'full_gym', label: 'Academia completa' },
  { value: 'basic_gym', label: 'Academia básica' },
  { value: 'home_weights', label: 'Casa / elásticos' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'outdoor', label: 'Ar livre' },
]

export function StudentProfileEditor() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState({
    displayName: user?.name || '',
    phone: user?.whatsapp || '',
    birthDate: '',
    heightCm: '',
    weightKg: '',
    sex: '' as StudentSex | '',
    goal: '' as StudentGoal | '',
    bodyFatPercent: '',
    experienceLevel: '' as ExperienceLevel | '',
    trainingDaysPerWeek: '',
    sessionMinutes: '',
    equipmentAccess: [] as EquipmentAccess[],
    foodAllergies: '',
    dietaryRestrictions: '',
    medicalConditions: '',
    injuries: '',
    medications: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.accessToken) {
        setLoading(false)
        return
      }
      try {
        const doc = await fetchMyStudentProfile(user.id, user.accessToken)
        if (cancelled || !doc) return
        setProfileId(doc.id)
        setForm({
          displayName: doc.displayName || '',
          phone: doc.phone || '',
          birthDate: doc.birthDate ? doc.birthDate.slice(0, 10) : '',
          heightCm: String(doc.heightCm ?? ''),
          weightKg: String(doc.weightKg ?? ''),
          sex: doc.sex || '',
          goal: doc.goal || '',
          bodyFatPercent: doc.bodyFatPercent != null ? String(doc.bodyFatPercent) : '',
          experienceLevel: doc.experienceLevel || '',
          trainingDaysPerWeek:
            doc.trainingDaysPerWeek != null ? String(doc.trainingDaysPerWeek) : '',
          sessionMinutes: doc.sessionMinutes != null ? String(doc.sessionMinutes) : '',
          equipmentAccess: doc.equipmentAccess || [],
          foodAllergies: doc.foodAllergies || '',
          dietaryRestrictions: doc.dietaryRestrictions || '',
          medicalConditions: doc.medicalConditions || '',
          injuries: doc.injuries || '',
          medications: doc.medications || '',
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id])

  const toggleEquipment = (value: EquipmentAccess) => {
    setForm((prev) => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.includes(value)
        ? prev.equipmentAccess.filter((item) => item !== value)
        : [...prev.equipmentAccess, value],
    }))
  }

  const handleSave = async () => {
    if (!user?.accessToken || !form.sex || !form.goal) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }
    setSaving(true)
    try {
      const saved = await saveStudentProfile(
        user.id,
        {
          displayName: form.displayName.trim(),
          phone: form.phone.trim(),
          birthDate: form.birthDate,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          sex: form.sex,
          goal: form.goal,
          bodyFatPercent: form.bodyFatPercent ? Number(form.bodyFatPercent) : null,
          experienceLevel: form.experienceLevel || null,
          trainingDaysPerWeek: form.trainingDaysPerWeek
            ? Number(form.trainingDaysPerWeek)
            : null,
          sessionMinutes: form.sessionMinutes ? Number(form.sessionMinutes) : null,
          equipmentAccess: form.equipmentAccess.length ? form.equipmentAccess : null,
          foodAllergies: form.foodAllergies.trim() || null,
          dietaryRestrictions: form.dietaryRestrictions.trim() || null,
          medicalConditions: form.medicalConditions.trim() || null,
          injuries: form.injuries.trim() || null,
          medications: form.medications.trim() || null,
          onboardingCompleted: true,
        },
        user.accessToken,
      )
      setProfileId(saved.id)
      updateUser({ name: saved.displayName, whatsapp: saved.phone })
      toast.success('Perfil atualizado.')
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao salvar'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  const age = ageFromBirthDate(form.birthDate)
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm({ ...form, [key]: value })

  return (
    <Page>
      <PageHeader kicker="Perfil" title="Seu perfil," accent="do seu jeito." />

      {/* Cartão de identidade */}
      <Card className="p-6 sm:p-7 mb-6 overflow-hidden">
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="w-16 h-16 rounded-2xl grid place-items-center bg-[var(--ink-4)] border border-[var(--line-2)] text-[22px] font-bold">
            {(form.displayName || user?.name || 'A')
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="cp-display text-[26px] font-bold leading-tight truncate">{form.displayName || 'Seu nome'}</p>
            <p className="mt-1 text-[14px] text-[var(--muted)] truncate">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {age != null && <Badge>{age} anos</Badge>}
            {form.goal && <Badge tone="blue">{goalLabel(form.goal)}</Badge>}
            {!profileId && <Badge tone="amber">Perfil ainda não salvo</Badge>}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <FormCard title="Dados pessoais" kicker="Obrigatório">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome">
              <input className="cp-field pl-4" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} />
            </Field>
            <Field label="Telefone">
              <input className="cp-field pl-4" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <Field label="Nascimento">
              <input type="date" className="cp-field pl-4" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
            </Field>
            <Field label="Sexo">
              <select
                className="cp-field pl-4"
                value={form.sex}
                onChange={(e) => set('sex', e.target.value as StudentSex | '')}
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="undisclosed">Prefiro não informar</option>
              </select>
            </Field>
          </div>
        </FormCard>

        <FormCard title="Corpo e objetivo" kicker="Obrigatório">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Altura (cm)">
              <input type="number" className="cp-field pl-4" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} />
            </Field>
            <Field label="Peso (kg)">
              <input type="number" step="0.1" className="cp-field pl-4" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} />
            </Field>
          </div>
          <p className="cp-mono mt-6 mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]">Objetivo</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(
              [
                { value: 'weight_loss', label: 'Emagrecimento', icon: Flame, color: 'var(--amber)' },
                { value: 'hypertrophy', label: 'Hipertrofia', icon: Dumbbell, color: 'var(--blue-2)' },
              ] as const
            ).map(({ value, label, icon: Icon, color }) => (
              <Choice key={value} active={form.goal === value} onClick={() => set('goal', value)}>
                <Icon className="w-5 h-5" style={{ color }} />
                {label}
              </Choice>
            ))}
          </div>
        </FormCard>

        <FormCard title="Treino" kicker="Opcional">
          <p className="cp-mono mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]">Experiência</p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ['beginner', 'Iniciante'],
                ['intermediate', 'Intermediário'],
                ['advanced', 'Avançado'],
              ] as const
            ).map(([value, label]) => (
              <Choice
                key={value}
                active={form.experienceLevel === value}
                onClick={() => set('experienceLevel', form.experienceLevel === value ? '' : value)}
              >
                {label}
              </Choice>
            ))}
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <Field label="% Gordura">
              <input type="number" step="0.1" className="cp-field pl-4" value={form.bodyFatPercent} onChange={(e) => set('bodyFatPercent', e.target.value)} />
            </Field>
            <Field label="Dias / semana">
              <input type="number" min={1} max={7} className="cp-field pl-4" value={form.trainingDaysPerWeek} onChange={(e) => set('trainingDaysPerWeek', e.target.value)} />
            </Field>
            <Field label="Minutos / treino">
              <input type="number" className="cp-field pl-4" value={form.sessionMinutes} onChange={(e) => set('sessionMinutes', e.target.value)} />
            </Field>
          </div>
          <p className="cp-mono mt-6 mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]">Equipamentos</p>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((option) => {
              const active = form.equipmentAccess.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleEquipment(option.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[13.5px] border transition-colors ${
                    active
                      ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)] text-white'
                      : 'border-[var(--line-2)] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-[var(--blue-2)]" strokeWidth={3} />}
                  {option.label}
                </button>
              )
            })}
          </div>
        </FormCard>

        <FormCard title="Saúde e alimentação" kicker="Visível só para você e seus profissionais">
          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ['foodAllergies', 'Alergias'],
                ['dietaryRestrictions', 'Restrições alimentares'],
                ['medicalConditions', 'Condições médicas'],
                ['injuries', 'Lesões'],
                ['medications', 'Medicamentos'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label} className={key === 'medications' ? 'sm:col-span-2' : ''}>
                <textarea className="cp-field" value={form[key]} onChange={(e) => set(key, e.target.value)} />
              </Field>
            ))}
          </div>
        </FormCard>
      </div>

      {/* Barra de salvar fixa */}
      <div className="sticky bottom-[84px] lg:bottom-6 z-20 mt-8">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line-2)] bg-[rgba(16,19,31,0.85)] backdrop-blur-xl px-4 sm:px-5 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
          <p className="hidden sm:block text-[13.5px] text-[var(--muted)]">Alterações são salvas no seu perfil.</p>
          <CTAButton type="button" onClick={handleSave} disabled={saving} className="ml-auto">
            {saving ? 'Salvando…' : 'Salvar perfil'}
          </CTAButton>
        </div>
      </div>
    </Page>
  )
}

function FormCard({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <h2 className="cp-display text-[20px] font-bold">{title}</h2>
        {kicker && <span className="cp-mono text-[11px] uppercase tracking-[0.12em] text-[var(--dim)]">{kicker}</span>}
      </div>
      {children}
    </Card>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="cp-mono block mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</span>
      {children}
    </label>
  )
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-14 rounded-2xl border flex items-center justify-center gap-2.5 text-[15px] font-semibold transition-[background,border-color,box-shadow] duration-300 ${
        active
          ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)] text-white'
          : 'border-[var(--line-2)] bg-white/[0.025] text-[var(--muted)] hover:text-white hover:bg-white/[0.05]'
      }`}
    >
      {children}
    </button>
  )
}

/** Mantém tipagem para usos futuros sem forçar mock. */
export type { StudentProfile }
