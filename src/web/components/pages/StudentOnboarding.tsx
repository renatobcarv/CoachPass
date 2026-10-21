import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import {
  ArrowLeft,
  Building2,
  Check,
  CornerDownLeft,
  Dumbbell,
  Flame,
  Home as HomeIcon,
  Pencil,
  PersonStanding,
  Sprout,
  Trees,
  TrendingUp,
  Trophy,
  Warehouse,
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
import { Backdrop, BrandLogo, CTAButton, Grain } from '../brand/Brand'

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

type IconType = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

const sexOptions: { value: StudentSex; label: string }[] = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
  { value: 'undisclosed', label: 'Prefiro não informar' },
]

const goalOptions: { value: StudentGoal; label: string; desc: string; icon: IconType; color: string }[] = [
  {
    value: 'weight_loss',
    label: 'Emagrecimento',
    desc: 'Reduzir gordura com treino e alimentação que cabem na rotina.',
    icon: Flame,
    color: 'var(--amber)',
  },
  {
    value: 'hypertrophy',
    label: 'Hipertrofia',
    desc: 'Ganhar massa muscular com progressão de carga consistente.',
    icon: Dumbbell,
    color: 'var(--blue-2)',
  },
]

const experienceOptions: { value: ExperienceLevel; label: string; desc: string; icon: IconType }[] = [
  { value: 'beginner', label: 'Iniciante', desc: 'Comecei agora ou voltei depois de muito tempo.', icon: Sprout },
  { value: 'intermediate', label: 'Intermediário', desc: 'Treino com frequência há alguns meses.', icon: TrendingUp },
  { value: 'advanced', label: 'Avançado', desc: 'Treino há anos e conheço bem os exercícios.', icon: Trophy },
]

const equipmentOptions: { value: EquipmentAccess; label: string; icon: IconType }[] = [
  { value: 'full_gym', label: 'Academia completa', icon: Building2 },
  { value: 'basic_gym', label: 'Academia básica', icon: Warehouse },
  { value: 'home_weights', label: 'Halteres / elásticos em casa', icon: HomeIcon },
  { value: 'bodyweight', label: 'Apenas peso corporal', icon: PersonStanding },
  { value: 'outdoor', label: 'Ar livre', icon: Trees },
]

const minutesOptions = ['30', '45', '60', '75', '90', '120']

type StepId =
  | 'name'
  | 'phone'
  | 'birth'
  | 'sex'
  | 'body'
  | 'goal'
  | 'experience'
  | 'days'
  | 'minutes'
  | 'equipment'
  | 'bodyfat'
  | 'food'
  | 'health'
  | 'review'

type StepDef = { id: StepId; section: string; title: string; hint?: string; optional?: boolean }

const STEPS: StepDef[] = [
  { id: 'name', section: 'Sobre você', title: 'Como podemos te chamar?' },
  { id: 'phone', section: 'Sobre você', title: 'Qual é o seu WhatsApp?', hint: 'Seu profissional usa para combinar treinos e consultas.' },
  { id: 'birth', section: 'Sobre você', title: 'Quando você nasceu?' },
  { id: 'sex', section: 'Sobre você', title: 'Qual é o seu sexo?', hint: 'Ajuda a calcular gasto calórico e referências de medidas.' },
  { id: 'body', section: 'Seu corpo', title: 'Qual sua altura e seu peso hoje?', hint: 'Não precisa ser exato. Você atualiza a cada semana.' },
  { id: 'goal', section: 'Objetivo', title: 'Qual é o seu objetivo principal?' },
  { id: 'experience', section: 'Treino', title: 'Como está sua experiência com treino?', optional: true },
  { id: 'days', section: 'Treino', title: 'Quantos dias por semana você pode treinar?', optional: true },
  { id: 'minutes', section: 'Treino', title: 'Quanto tempo você tem por treino?', optional: true },
  { id: 'equipment', section: 'Treino', title: 'Onde você vai treinar?', hint: 'Marque todos que se aplicam.', optional: true },
  { id: 'bodyfat', section: 'Seu corpo', title: 'Sabe seu percentual de gordura?', hint: 'Se não souber, pode pular. O profissional mede na avaliação.', optional: true },
  { id: 'food', section: 'Alimentação', title: 'Alguma alergia ou restrição alimentar?', hint: 'O nutricionista vê isso antes de montar seu plano.', optional: true },
  { id: 'health', section: 'Saúde', title: 'Algo sobre sua saúde que devemos saber?', hint: 'Fica visível só para você e os profissionais vinculados.', optional: true },
  { id: 'review', section: 'Revisão', title: 'Tudo certo por aqui?' },
]

function isTextTarget(el: EventTarget | null) {
  return el instanceof HTMLTextAreaElement
}

/* ---------- Peças do quiz ---------- */

function OptionCard({
  index,
  selected,
  onClick,
  icon: Icon,
  color = 'var(--blue-2)',
  label,
  desc,
  multi,
}: {
  index: number
  selected: boolean
  onClick: () => void
  icon?: IconType
  color?: string
  label: string
  desc?: string
  multi?: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className={`group relative w-full text-left rounded-2xl border px-5 py-4 flex items-center gap-4 transition-[background,border-color,box-shadow] duration-300 ${
        selected
          ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)]'
          : 'border-[var(--line-2)] bg-white/[0.025] hover:bg-white/[0.06] hover:border-[rgba(232,236,255,0.28)]'
      }`}
    >
      <span
        className={`cp-mono w-7 h-7 shrink-0 rounded-lg grid place-items-center text-[12px] border transition-colors ${
          selected ? 'cp-selected border-transparent' : 'border-[var(--line-2)] text-[var(--muted)]'
        }`}
      >
        {selected && multi ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : index + 1}
      </span>
      {Icon && (
        <span
          className="w-11 h-11 shrink-0 rounded-xl grid place-items-center"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="cp-display block text-[18px] font-semibold leading-tight">{label}</span>
        {desc && <span className="block mt-1 text-[14px] leading-snug text-[var(--muted)]">{desc}</span>}
      </span>
      {selected && !multi && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--blue-2)]">
          <Check className="w-5 h-5" strokeWidth={2.5} />
        </motion.span>
      )}
    </motion.button>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`cp-display h-16 min-w-16 px-5 rounded-2xl border text-[22px] font-semibold transition-[background,border-color,color] duration-300 ${
        selected
          ? 'cp-selected border-transparent'
          : 'border-[var(--line-2)] bg-white/[0.025] text-[var(--cream)] hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </motion.button>
  )
}

function FieldCaption({ children }: { children: React.ReactNode }) {
  return <p className="cp-mono mb-2 text-[11.5px] uppercase tracking-[0.12em] text-[var(--muted)]">{children}</p>
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      disabled={!onEdit}
      className="group w-full flex items-center justify-between gap-4 py-3.5 border-b border-[var(--line)] last:border-b-0 text-left disabled:cursor-default"
    >
      <span className="text-[14px] text-[var(--muted)] shrink-0">{label}</span>
      <span className="flex items-center gap-3 min-w-0">
        <span className={`truncate text-[15px] ${value === '—' ? 'text-[var(--dim)]' : 'text-white font-medium'}`}>{value}</span>
        {onEdit && (
          <Pencil className="w-3.5 h-3.5 shrink-0 text-[var(--dim)] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </span>
    </button>
  )
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/* ---------- Página ---------- */

export function StudentOnboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
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
  const advanceTimer = useRef<number | undefined>(undefined)

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

  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

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

  const current = STEPS[step]

  const stepValid = useCallback(
    (id: StepId) => {
      switch (id) {
        case 'name':
          return Boolean(form.displayName.trim())
        case 'phone':
          return Boolean(form.phone.trim())
        case 'birth':
          return Boolean(form.birthDate)
        case 'sex':
          return Boolean(form.sex)
        case 'body':
          return Boolean(form.heightCm && form.weightKg)
        case 'goal':
          return Boolean(form.goal)
        case 'review':
          return step1Valid
        default:
          return true
      }
    },
    [form, step1Valid],
  )

  const goTo = useCallback(
    (next: number) => {
      window.clearTimeout(advanceTimer.current)
      setDirection(next > step ? 1 : -1)
      setStep(Math.max(0, Math.min(STEPS.length - 1, next)))
    },
    [step],
  )

  const next = useCallback(() => {
    if (!stepValid(current.id)) return
    goTo(step + 1)
  }, [current.id, goTo, step, stepValid])

  const back = () => goTo(step - 1)

  /** Escolha única: marca e avança sozinho, no ritmo de quiz. */
  const pickAndAdvance = (apply: () => void) => {
    apply()
    window.clearTimeout(advanceTimer.current)
    advanceTimer.current = window.setTimeout(() => {
      setDirection(1)
      setStep((s) => Math.min(STEPS.length - 1, s + 1))
    }, 380)
  }

  const handleComplete = async () => {
    if (!user?.accessToken) {
      toast.error('Sessão expirada. Entre novamente.')
      navigate('/login')
      return
    }
    if (!step1Valid || !form.sex || !form.goal) {
      toast.error('Preencha os campos obrigatórios.')
      const firstInvalid = STEPS.findIndex((s) => !stepValid(s.id))
      goTo(firstInvalid === -1 ? 0 : firstInvalid)
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

  // Teclado: Enter avança; números escolhem a opção nas perguntas de escolha.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (bootstrapping || loading) return
      if (e.key === 'Enter' && !e.shiftKey && !isTextTarget(e.target)) {
        e.preventDefault()
        if (current.id === 'review') void handleComplete()
        else next()
        return
      }
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if (typing) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1) return
      if (current.id === 'sex' && sexOptions[n - 1]) pickAndAdvance(() => setField('sex', sexOptions[n - 1].value))
      if (current.id === 'goal' && goalOptions[n - 1]) pickAndAdvance(() => setField('goal', goalOptions[n - 1].value))
      if (current.id === 'experience' && experienceOptions[n - 1])
        pickAndAdvance(() => setField('experienceLevel', experienceOptions[n - 1].value))
      if (current.id === 'days' && n <= 7) pickAndAdvance(() => setField('trainingDaysPerWeek', String(n)))
      if (current.id === 'equipment' && equipmentOptions[n - 1]) toggleEquipment(equipmentOptions[n - 1].value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const firstName = form.displayName.trim().split(' ')[0]
  const bmi = useMemo(() => {
    const h = Number(form.heightCm) / 100
    const w = Number(form.weightKg)
    if (!h || !w || h < 1 || h > 2.5) return null
    return w / (h * h)
  }, [form.heightCm, form.weightKg])

  if (bootstrapping) {
    return (
      <div className="cp-brand min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-5">
          <BrandLogo size={30} />
          <div className="w-40 h-[3px] rounded-full bg-[var(--line-2)] overflow-hidden">
            <motion.div
              className="h-full w-1/3 cp-brand-bar"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    )
  }

  const valid = stepValid(current.id)
  const sectionSteps = STEPS.filter((s) => s.section === current.section)
  const sectionPos = sectionSteps.findIndex((s) => s.id === current.id) + 1
  const isReview = current.id === 'review'

  const renderStep = () => {
    switch (current.id) {
      case 'name':
        return (
          <input
            autoFocus
            className="cp-field cp-field-lg"
            value={form.displayName}
            onChange={(e) => setField('displayName', e.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
          />
        )
      case 'phone':
        return (
          <input
            autoFocus
            type="tel"
            inputMode="tel"
            className="cp-field cp-field-lg"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="(11) 99999-9999"
            autoComplete="tel"
          />
        )
      case 'birth':
        return (
          <input
            autoFocus
            type="date"
            className="cp-field cp-field-lg"
            value={form.birthDate}
            onChange={(e) => setField('birthDate', e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        )
      case 'sex':
        return (
          <div className="grid sm:grid-cols-2 gap-3">
            {sexOptions.map((o, i) => (
              <OptionCard
                key={o.value}
                index={i}
                label={o.label}
                selected={form.sex === o.value}
                onClick={() => pickAndAdvance(() => setField('sex', o.value))}
              />
            ))}
          </div>
        )
      case 'body':
        return (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <FieldCaption>Altura</FieldCaption>
                <div className="relative">
                  <input
                    autoFocus
                    type="number"
                    inputMode="numeric"
                    className="cp-field cp-field-lg pr-14"
                    value={form.heightCm}
                    onChange={(e) => setField('heightCm', e.target.value)}
                    placeholder="175"
                  />
                  <span className="cp-mono absolute right-5 top-1/2 -translate-y-1/2 text-[14px] text-[var(--dim)]">cm</span>
                </div>
              </label>
              <label className="block">
                <FieldCaption>Peso</FieldCaption>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    className="cp-field cp-field-lg pr-14"
                    value={form.weightKg}
                    onChange={(e) => setField('weightKg', e.target.value)}
                    placeholder="75.5"
                  />
                  <span className="cp-mono absolute right-5 top-1/2 -translate-y-1/2 text-[14px] text-[var(--dim)]">kg</span>
                </div>
              </label>
            </div>
            <AnimatePresence>
              {bmi && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 cp-mono text-[13px] text-[var(--muted)]"
                >
                  IMC estimado: <span className="text-white">{bmi.toFixed(1).replace('.', ',')}</span> · é só uma
                  referência, a avaliação física é com o profissional.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )
      case 'goal':
        return (
          <div className="grid gap-3">
            {goalOptions.map((o, i) => (
              <OptionCard
                key={o.value}
                index={i}
                icon={o.icon}
                color={o.color}
                label={o.label}
                desc={o.desc}
                selected={form.goal === o.value}
                onClick={() => pickAndAdvance(() => setField('goal', o.value))}
              />
            ))}
          </div>
        )
      case 'experience':
        return (
          <div className="grid gap-3">
            {experienceOptions.map((o, i) => (
              <OptionCard
                key={o.value}
                index={i}
                icon={o.icon}
                label={o.label}
                desc={o.desc}
                selected={form.experienceLevel === o.value}
                onClick={() => pickAndAdvance(() => setField('experienceLevel', o.value))}
              />
            ))}
          </div>
        )
      case 'days':
        return (
          <div className="flex flex-wrap gap-3">
            {['1', '2', '3', '4', '5', '6', '7'].map((d) => (
              <Chip
                key={d}
                selected={form.trainingDaysPerWeek === d}
                onClick={() => pickAndAdvance(() => setField('trainingDaysPerWeek', d))}
              >
                {d}
              </Chip>
            ))}
          </div>
        )
      case 'minutes':
        return (
          <div>
            <div className="flex flex-wrap gap-3">
              {minutesOptions.map((m) => (
                <Chip
                  key={m}
                  selected={form.sessionMinutes === m}
                  onClick={() => pickAndAdvance(() => setField('sessionMinutes', m))}
                >
                  {m}
                  <span className="text-[13px] font-normal opacity-70 ml-1">min</span>
                </Chip>
              ))}
            </div>
            <label className="mt-6 flex items-center gap-3 text-[14px] text-[var(--muted)]">
              Outro valor:
              <input
                type="number"
                min={15}
                max={180}
                className="cp-field h-11 w-28 pl-4"
                value={minutesOptions.includes(form.sessionMinutes) ? '' : form.sessionMinutes}
                onChange={(e) => setField('sessionMinutes', e.target.value)}
                placeholder="min"
              />
            </label>
          </div>
        )
      case 'equipment':
        return (
          <div className="grid sm:grid-cols-2 gap-3">
            {equipmentOptions.map((o, i) => (
              <OptionCard
                key={o.value}
                index={i}
                multi
                icon={o.icon}
                label={o.label}
                selected={form.equipmentAccess.includes(o.value)}
                onClick={() => toggleEquipment(o.value)}
              />
            ))}
          </div>
        )
      case 'bodyfat':
        return (
          <div className="relative max-w-[260px]">
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              step="0.1"
              className="cp-field cp-field-lg pr-12"
              value={form.bodyFatPercent}
              onChange={(e) => setField('bodyFatPercent', e.target.value)}
              placeholder="18"
            />
            <span className="cp-mono absolute right-5 top-1/2 -translate-y-1/2 text-[14px] text-[var(--dim)]">%</span>
          </div>
        )
      case 'food':
        return (
          <div className="space-y-5">
            <label className="block">
              <FieldCaption>Alergias alimentares</FieldCaption>
              <textarea
                autoFocus
                className="cp-field"
                value={form.foodAllergies}
                onChange={(e) => setField('foodAllergies', e.target.value)}
                placeholder="Ex.: amendoim, frutos do mar"
              />
            </label>
            <label className="block">
              <FieldCaption>Restrições alimentares</FieldCaption>
              <textarea
                className="cp-field"
                value={form.dietaryRestrictions}
                onChange={(e) => setField('dietaryRestrictions', e.target.value)}
                placeholder="Ex.: vegetariano, sem lactose, sem glúten"
              />
            </label>
          </div>
        )
      case 'health':
        return (
          <div className="space-y-5">
            {(
              [
                ['medicalConditions', 'Deficiências, limitações ou condições médicas', 'Ex.: hipertensão, asma, diabetes'],
                ['injuries', 'Lesões atuais ou anteriores', 'Ex.: dor no joelho direito, cirurgia no ombro'],
                ['medications', 'Medicamentos ou acompanhamento médico', 'Ex.: uso contínuo de ...'],
              ] as const
            ).map(([key, label, placeholder], i) => (
              <label key={key} className="block">
                <FieldCaption>{label}</FieldCaption>
                <textarea
                  autoFocus={i === 0}
                  className="cp-field min-h-[76px]"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder={placeholder}
                />
              </label>
            ))}
          </div>
        )
      case 'review': {
        const at = (id: StepId) => () => goTo(STEPS.findIndex((s) => s.id === id))
        const join = (...v: string[]) => v.filter(Boolean).join(' · ') || '—'
        return (
          <div className="rounded-3xl border border-[var(--line-2)] bg-white/[0.025] px-5 sm:px-7 py-3">
            <ReviewRow label="Nome" value={form.displayName || '—'} onEdit={at('name')} />
            <ReviewRow label="E-mail" value={user?.email || '—'} />
            <ReviewRow label="WhatsApp" value={form.phone || '—'} onEdit={at('phone')} />
            <ReviewRow label="Nascimento" value={formatDate(form.birthDate)} onEdit={at('birth')} />
            <ReviewRow label="Sexo" value={sexOptions.find((o) => o.value === form.sex)?.label || '—'} onEdit={at('sex')} />
            <ReviewRow
              label="Altura e peso"
              value={form.heightCm && form.weightKg ? `${form.heightCm} cm · ${form.weightKg} kg` : '—'}
              onEdit={at('body')}
            />
            <ReviewRow label="Objetivo" value={goalOptions.find((o) => o.value === form.goal)?.label || '—'} onEdit={at('goal')} />
            <ReviewRow
              label="Treino"
              value={join(
                experienceOptions.find((o) => o.value === form.experienceLevel)?.label || '',
                form.trainingDaysPerWeek ? `${form.trainingDaysPerWeek}x/semana` : '',
                form.sessionMinutes ? `${form.sessionMinutes} min` : '',
              )}
              onEdit={at('experience')}
            />
            <ReviewRow
              label="Local"
              value={join(...form.equipmentAccess.map((v) => equipmentOptions.find((o) => o.value === v)?.label || ''))}
              onEdit={at('equipment')}
            />
            <ReviewRow
              label="Alimentação"
              value={join(form.foodAllergies.trim(), form.dietaryRestrictions.trim())}
              onEdit={at('food')}
            />
            <ReviewRow
              label="Saúde"
              value={join(form.medicalConditions.trim(), form.injuries.trim(), form.medications.trim())}
              onEdit={at('health')}
            />
          </div>
        )
      }
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand relative min-h-screen flex flex-col overflow-hidden">
        <Grain />
        <Backdrop variant="auth" />

        {/* Topo: logo, progresso, contador */}
        <header className="relative z-10 px-4 sm:px-8 pt-5">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4">
            <BrandLogo size={24} />
            <span className="cp-mono text-[12px] text-[var(--muted)]">
              {String(step + 1).padStart(2, '0')} <span className="text-[var(--dim)]">/ {String(STEPS.length).padStart(2, '0')}</span>
            </span>
          </div>
          <div className="max-w-[1100px] mx-auto mt-5 flex gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Ir para: ${s.title}`}
                onClick={() => (i < step ? goTo(i) : undefined)}
                className={`h-[3px] flex-1 rounded-full overflow-hidden bg-[var(--line-2)] ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <motion.span
                  className="block h-full cp-brand-bar"
                  initial={false}
                  animate={{ width: i < step ? '100%' : i === step ? '45%' : '0%' }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </button>
            ))}
          </div>
        </header>

        {/* Pergunta */}
        <main className="relative z-10 flex-1 flex items-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-[680px] mx-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 40 : -40 }),
                  center: { opacity: 1, y: 0 },
                  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -40 : 40 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <p className="cp-kicker flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
                  {current.section}
                  {current.optional && <span className="text-[var(--dim)]">· opcional</span>}
                </p>
                <h1 className="cp-display mt-4 text-[clamp(30px,4.4vw,52px)] font-bold leading-[1.04]">
                  {step === 0 ? (
                    <>
                      Bem-vindo ao CoachPass.{' '}
                      <span className="cp-accent">{current.title}</span>
                    </>
                  ) : isReview && firstName ? (
                    <>
                      {firstName}, <span className="cp-accent">tudo certo por aqui?</span>
                    </>
                  ) : (
                    current.title
                  )}
                </h1>
                {(current.hint || isReview) && (
                  <p className="mt-3 text-[16px] text-[var(--muted)]">
                    {isReview ? 'Toque em qualquer linha para ajustar. Tudo pode ser editado depois no perfil.' : current.hint}
                  </p>
                )}

                <div className="mt-9">{renderStep()}</div>

                {/* Ações */}
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  {isReview ? (
                    <CTAButton type="button" onClick={handleComplete} disabled={loading || !step1Valid}>
                      {loading ? 'Salvando…' : 'Concluir e ir ao painel'}
                    </CTAButton>
                  ) : (
                    <CTAButton type="button" onClick={next} disabled={!valid}>
                      {current.optional && !stepHasValue(current.id, form) ? 'Pular' : 'Continuar'}
                    </CTAButton>
                  )}
                  {!isReview && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 cp-mono text-[12px] text-[var(--dim)]">
                      ou pressione <kbd className="px-1.5 py-0.5 rounded-md border border-[var(--line-2)] text-[var(--muted)]">Enter</kbd>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Rodapé: voltar + seções */}
        <footer className="relative z-10 px-4 sm:px-8 pb-6">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white disabled:opacity-0 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <p className="hidden sm:block cp-mono text-[11.5px] text-[var(--dim)]">
              {current.section} · pergunta {sectionPos} de {sectionSteps.length}
            </p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}

function stepHasValue(id: StepId, form: FormState) {
  switch (id) {
    case 'experience':
      return Boolean(form.experienceLevel)
    case 'days':
      return Boolean(form.trainingDaysPerWeek)
    case 'minutes':
      return Boolean(form.sessionMinutes)
    case 'equipment':
      return form.equipmentAccess.length > 0
    case 'bodyfat':
      return Boolean(form.bodyFatPercent)
    case 'food':
      return Boolean(form.foodAllergies.trim() || form.dietaryRestrictions.trim())
    case 'health':
      return Boolean(form.medicalConditions.trim() || form.injuries.trim() || form.medications.trim())
    default:
      return true
  }
}
