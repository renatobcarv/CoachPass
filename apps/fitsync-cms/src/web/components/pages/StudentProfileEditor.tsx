import React, { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
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
  uploadProfilePhoto,
} from '../../lib/studentApi'
import { formatPhone } from '../../lib/phone'
import { parseHeightCm, parseWeightKg } from '../../lib/measures'
import { AuthedImage } from '../AuthedImage'
import { USERS_API, patchJson, PayloadApiError, extractPayloadMessage } from '@/lib/cms'

const card =
  'rounded-2xl border border-[#000326]/10 bg-white p-5 dark:border-white/10 dark:bg-[#000346]'
const inputCls =
  'w-full px-3 py-2.5 rounded-lg bg-[#f3f4f9] border border-[#000326]/10 text-[#000326] dark:bg-[#000137] dark:border-white/10 dark:text-white text-sm'

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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [avatarSrc, setAvatarSrc] = useState(user?.avatar || '')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.name || '',
    phone: formatPhone(user?.whatsapp || ''),
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
      setLoading(true)
      setLoadError(null)
      try {
        const doc = await fetchMyStudentProfile(user.id, user.accessToken)
        if (cancelled || !doc) return
        setProfileId(doc.id)
        setForm({
          displayName: doc.displayName || '',
          phone: formatPhone(doc.phone || ''),
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
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error && err.message
              ? `Não foi possível carregar seu perfil: ${err.message}`
              : 'Não foi possível carregar seu perfil.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.id])

  const handlePhoto = async (file: File) => {
    if (!user?.accessToken) {
      toast.error('Sessão expirada. Entre novamente.')
      return
    }
    setUploadingPhoto(true)
    try {
      const url = await uploadProfilePhoto(file, user.accessToken)
      await patchJson(`${USERS_API}/${user.id}`, { avatarUrl: url }, user.accessToken)
      updateUser({ avatar: url })
      setAvatarSrc(url)
      toast.success('Foto atualizada.')
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível enviar a foto.'
      toast.error(msg)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const toggleEquipment = (value: EquipmentAccess) => {
    setForm((prev) => ({
      ...prev,
      equipmentAccess: prev.equipmentAccess.includes(value)
        ? prev.equipmentAccess.filter((item) => item !== value)
        : [...prev.equipmentAccess, value],
    }))
  }

  const handleSave = async () => {
    if (loadError) {
      toast.error('Recarregue o perfil antes de salvar.')
      return
    }
    if (!user?.accessToken || !form.sex || !form.goal) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }
    const height = parseHeightCm(form.heightCm)
    const weight = parseWeightKg(form.weightKg)
    if (!height.ok) {
      toast.error(height.error)
      return
    }
    if (!weight.ok) {
      toast.error(weight.error)
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
          heightCm: height.value,
          weightKg: weight.value,
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
    return <div className="p-8 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">Carregando perfil…</div>
  }

  const age = ageFromBirthDate(form.birthDate)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#000326] dark:text-white">Meu perfil</h1>
        <p className="mt-1 text-sm text-[#6a6a7a] dark:text-[#C5C5CE]">
          Dados usados para personalizar treinos e orientações. E-mail da conta: {user?.email}
          {age != null ? ` · ${age} anos` : ''}
          {form.goal ? ` · ${goalLabel(form.goal)}` : ''}
          {profileId || loadError ? '' : ' · Perfil ainda não salvo'}
        </p>
      </div>

      {loadError && (
        <div role="alert" className={`${card} text-sm text-red-600 dark:text-red-300`}>
          {loadError}
        </div>
      )}

      <div className={`${card} flex items-center gap-4`}>
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#000326]/15 dark:ring-white/20 shrink-0">
          <AuthedImage
            src={avatarSrc || user?.avatar}
            token={user?.accessToken}
            alt={user?.name || 'Foto de perfil'}
            className="w-full h-full object-cover"
          />
        </div>
        <label className="text-sm space-y-1">
          <span className="font-semibold text-[#000326] dark:text-white">Foto</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploadingPhoto}
            className="block text-xs text-[#6a6a7a] dark:text-[#C5C5CE]"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void handlePhoto(file)
            }}
          />
          <span className="block text-xs text-[#8e8e9a]">JPG, PNG, WebP ou GIF, até 2 MB.</span>
        </label>
      </div>

      <div className={`${card} space-y-4`}>
        <h2 className="font-semibold text-[#000326] dark:text-white">Informações obrigatórias</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Nome</span>
            <input
              className={inputCls}
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Telefone</span>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              placeholder="(11) 99999-9999"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={15}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Nascimento</span>
            <input
              type="date"
              className={inputCls}
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Sexo</span>
            <select
              className={inputCls}
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value as StudentSex | '' })}
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
              <option value="undisclosed">Prefiro não informar</option>
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Altura (cm)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="175 ou 1,75"
              className={inputCls}
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Peso (kg)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="75,5"
              className={inputCls}
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
            />
          </label>
          <label className="text-sm space-y-1 sm:col-span-2">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Objetivo</span>
            <select
              className={inputCls}
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value as StudentGoal | '' })}
            >
              <option value="">Selecione</option>
              <option value="weight_loss">Emagrecimento</option>
              <option value="hypertrophy">Hipertrofia</option>
            </select>
          </label>
        </div>
      </div>

      <div className={`${card} space-y-4`}>
        <h2 className="font-semibold text-[#000326] dark:text-white">Complementares</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">% Gordura</span>
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={form.bodyFatPercent}
              onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Experiência</span>
            <select
              className={inputCls}
              value={form.experienceLevel}
              onChange={(e) =>
                setForm({ ...form, experienceLevel: e.target.value as ExperienceLevel | '' })
              }
            >
              <option value="">—</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Dias / semana</span>
            <input
              type="number"
              min={1}
              max={7}
              className={inputCls}
              value={form.trainingDaysPerWeek}
              onChange={(e) => setForm({ ...form, trainingDaysPerWeek: e.target.value })}
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">Minutos / treino</span>
            <input
              type="number"
              className={inputCls}
              value={form.sessionMinutes}
              onChange={(e) => setForm({ ...form, sessionMinutes: e.target.value })}
            />
          </label>
        </div>
        <div>
          <p className="text-sm text-[#6a6a7a] dark:text-[#C5C5CE] mb-2">Equipamentos</p>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((option) => {
              const active = form.equipmentAccess.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleEquipment(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    active
                      ? 'border-[#000326] bg-[#000326]/10 dark:border-white dark:bg-white/10'
                      : 'border-[#000326]/15 dark:border-white/10'
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
            ['foodAllergies', 'Alergias'],
            ['dietaryRestrictions', 'Restrições alimentares'],
            ['medicalConditions', 'Condições médicas'],
            ['injuries', 'Lesões'],
            ['medications', 'Medicamentos'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm space-y-1">
            <span className="text-[#6a6a7a] dark:text-[#C5C5CE]">{label}</span>
            <textarea
              className={`${inputCls} min-h-[72px]`}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={saving || Boolean(loadError)}
        onClick={handleSave}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#000326] text-white dark:bg-white dark:text-[#000326] font-medium disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Salvando…' : 'Salvar perfil'}
      </button>
    </div>
  )
}

/** Mantém tipagem para usos futuros sem forçar mock. */
export type { StudentProfile }
