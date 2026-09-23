import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Heart,
  Ruler,
  Target,
  Weight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import {
  EquipmentAccess,
  ExperienceLevel,
  StudentGoal,
  StudentSex,
  fetchMyStudentProfile,
  saveStudentProfile,
} from '../../lib/studentApi'
import { PayloadApiError, extractPayloadMessage } from '@/lib/cms'

type FormState = {
  displayName: string
  phone: string
  birthDate: string
  heightCm: string
  weightKg: string
  sex: StudentSex | ''
  goal: StudentGoal | ''
  bodyFatPercent: string
  experienceLevel: ExperienceLevel | ''
  trainingDaysPerWeek: string
  sessionMinutes: string
  equipmentAccess: EquipmentAccess[]
  foodAllergies: string
  dietaryRestrictions: string
  medicalConditions: string
  injuries: string
  medications: string
}

const equipmentOptions: { value: EquipmentAccess; label: string }[] = [
  { value: 'full_gym', label: 'Academia completa' },
  { value: 'basic_gym', label: 'Academia básica' },
  { value: 'home_weights', label: 'Halteres / elásticos em casa' },
  { value: 'bodyweight', label: 'Apenas peso corporal' },
  { value: 'outdoor', label: 'Ar livre' },
]

const inputCls =
  'w-full px-4 py-3 rounded-lg dark:bg-zinc-900/50 bg-slate-50/50 border dark:border-zinc-800 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:border-[#000346] dark:focus:border-[#C5C5CE] font-light text-sm'

export function StudentOnboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [form, setForm] = useState<FormState>({
    displayName: user?.name || '',
    phone: user?.whatsapp || '',
    birthDate: '',
    heightCm: '',
    weightKg: '',
    sex: '',
    goal: '',
    bodyFatPercent: '',
    experienceLevel: '',
    trainingDaysPerWeek: '',
    sessionMinutes: '',
    equipmentAccess: [],
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
        setBootstrapping(false)
        return
      }
      try {
        const existing = await fetchMyStudentProfile(user.id, user.accessToken)
        if (!cancelled && existing?.onboardingCompleted) {
          navigate('/app', { replace: true })
          return
        }
        if (!cancelled && existing) {
          setForm((prev) => ({
            ...prev,
            displayName: existing.displayName || prev.displayName,
            phone: existing.phone || prev.phone,
            birthDate: existing.birthDate ? existing.birthDate.slice(0, 10) : '',
            heightCm: existing.heightCm != null ? String(existing.heightCm) : '',
            weightKg: existing.weightKg != null ? String(existing.weightKg) : '',
            sex: existing.sex || '',
            goal: existing.goal || '',
            bodyFatPercent:
              existing.bodyFatPercent != null ? String(existing.bodyFatPercent) : '',
            experienceLevel: existing.experienceLevel || '',
            trainingDaysPerWeek:
              existing.trainingDaysPerWeek != null
                ? String(existing.trainingDaysPerWeek)
                : '',
            sessionMinutes:
              existing.sessionMinutes != null ? String(existing.sessionMinutes) : '',
            equipmentAccess: existing.equipmentAccess || [],
            foodAllergies: existing.foodAllergies || '',
            dietaryRestrictions: existing.dietaryRestrictions || '',
            medicalConditions: existing.medicalConditions || '',
            injuries: existing.injuries || '',
            medications: existing.medications || '',
          }))
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id, navigate])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleEquipment = (value: EquipmentAccess) => {
    setForm((prev) => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.includes(value)
        ? prev.equipmentAccess.filter((item) => item !== value)
        : [...prev.equipmentAccess, value],
    }))
  }

  const step1Valid = useMemo(() => {
    return Boolean(
      form.displayName.trim() &&
        form.phone.trim() &&
        form.birthDate &&
        form.heightCm &&
        form.weightKg &&
        form.sex &&
        form.goal,
    )
  }, [form])

  const handleComplete = async () => {
    if (!user?.accessToken) {
      toast.error('Sessão expirada. Entre novamente.')
      navigate('/login')
      return
    }
    if (!step1Valid || !form.sex || !form.goal) {
      toast.error('Preencha os campos obrigatórios.')
      setStep(1)
      return
    }

    setLoading(true)
    try {
      await saveStudentProfile(
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
      toast.success('Perfil salvo com sucesso.')
      navigate('/app', { replace: true })
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível salvar o perfil.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#000326] bg-[#f3f4f9]">
        <p className="text-sm dark:text-[#C5C5CE] text-[#6a6a7a]">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark:bg-[#000326] bg-[#f3f4f9]">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="dark:text-white text-[#000326] mb-2 tracking-tight text-2xl font-semibold">
            Complete seu perfil
          </h1>
          <p className="text-sm dark:text-[#C5C5CE] text-[#6a6a7a] font-light max-w-md mx-auto">
            Esses dados ficam no seu perfil e ajudam a personalizar treinos e orientações.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs dark:text-[#C5C5CE] text-[#8e8e9a]">
            <span className={step === 1 ? 'font-semibold text-[#000326] dark:text-white' : ''}>
              1. Obrigatórios
            </span>
            <span>·</span>
            <span className={step === 2 ? 'font-semibold text-[#000326] dark:text-white' : ''}>
              2. Complementares
            </span>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="dark:bg-[#000137] bg-white rounded-2xl p-6 sm:p-8 border dark:border-white/10 border-[#000326]/10 shadow-xl space-y-5"
        >
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  Nome completo *
                </label>
                <input
                  className={inputCls}
                  value={form.displayName}
                  onChange={(e) => setField('displayName', e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  E-mail
                </label>
                <input className={`${inputCls} opacity-70`} value={user?.email || ''} disabled />
              </div>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  Telefone *
                </label>
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  Data de nascimento *
                </label>
                <div className="relative">
                  <Heart className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                  <input
                    type="date"
                    className={`${inputCls} pl-10`}
                    value={form.birthDate}
                    onChange={(e) => setField('birthDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    Altura (cm) *
                  </label>
                  <div className="relative">
                    <Ruler className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="number"
                      className={`${inputCls} pl-10`}
                      value={form.heightCm}
                      onChange={(e) => setField('heightCm', e.target.value)}
                      placeholder="175"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    Peso (kg) *
                  </label>
                  <div className="relative">
                    <Weight className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-600 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      className={`${inputCls} pl-10`}
                      value={form.weightKg}
                      onChange={(e) => setField('weightKg', e.target.value)}
                      placeholder="75.5"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  Sexo *
                </label>
                <select
                  className={inputCls}
                  value={form.sex}
                  onChange={(e) => setField('sex', e.target.value as StudentSex | '')}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                  <option value="undisclosed">Prefiro não informar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  Objetivo principal *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: 'weight_loss', label: 'Emagrecimento' },
                      { value: 'hypertrophy', label: 'Hipertrofia' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField('goal', option.value)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        form.goal === option.value
                          ? 'border-[#000326] bg-[#000326] text-white dark:border-white dark:bg-white dark:text-[#000326]'
                          : 'border-[#000326]/15 dark:border-white/10 text-[#000326] dark:text-white'
                      }`}
                    >
                      <Target className="w-4 h-4 inline mr-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-lg bg-[#000326] text-white dark:bg-white dark:text-[#000326] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm dark:text-[#C5C5CE] text-[#6a6a7a]">
                Campos opcionais — preencha o que souber. Você pode editar depois no perfil.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    % Gordura
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className={inputCls}
                    value={form.bodyFatPercent}
                    onChange={(e) => setField('bodyFatPercent', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    Experiência
                  </label>
                  <select
                    className={inputCls}
                    value={form.experienceLevel}
                    onChange={(e) =>
                      setField('experienceLevel', e.target.value as ExperienceLevel | '')
                    }
                  >
                    <option value="">Opcional</option>
                    <option value="beginner">Iniciante</option>
                    <option value="intermediate">Intermediário</option>
                    <option value="advanced">Avançado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    Dias / semana
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    className={inputCls}
                    value={form.trainingDaysPerWeek}
                    onChange={(e) => setField('trainingDaysPerWeek', e.target.value)}
                    placeholder="Ex: 4"
                  />
                </div>
                <div>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    Minutos / treino
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    className={inputCls}
                    value={form.sessionMinutes}
                    onChange={(e) => setField('sessionMinutes', e.target.value)}
                    placeholder="Ex: 60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                  Equipamentos / ambiente
                </label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((option) => {
                    const active = form.equipmentAccess.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleEquipment(option.value)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition ${
                          active
                            ? 'border-[#000326] bg-[#000326]/10 text-[#000326] dark:border-white dark:bg-white/10 dark:text-white'
                            : 'border-[#000326]/15 dark:border-white/10 text-[#6a6a7a] dark:text-[#C5C5CE]'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {(
                [
                  ['foodAllergies', 'Alergias alimentares'],
                  ['dietaryRestrictions', 'Restrições alimentares'],
                  ['medicalConditions', 'Deficiências, limitações ou condições médicas'],
                  ['injuries', 'Lesões atuais ou anteriores'],
                  ['medications', 'Medicamentos ou acompanhamento médico'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs dark:text-[#C5C5CE] text-[#6a6a7a] mb-2 uppercase tracking-wider font-semibold">
                    {label}
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[72px] resize-y`}
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-lg border border-[#000326]/15 dark:border-white/10 text-[#000326] dark:text-white font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleComplete}
                  className="flex-[1.4] py-3.5 rounded-lg bg-[#000326] text-white dark:bg-white dark:text-[#000326] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Salvando…' : 'Concluir e ir ao painel'}
                  {!loading && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
