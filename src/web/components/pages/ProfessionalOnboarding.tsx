import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import {
  Apple,
  ArrowLeft,
  Check,
  CornerDownLeft,
  CreditCard,
  Dumbbell,
  Pencil,
  Phone,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth, UserRole } from '../../context/AuthContext'
import { USERS_API, patchJson, postJson, PayloadApiError, extractPayloadMessage } from '@/lib/cms'
import { saveProProfile } from '../../lib/proProfile'
import { Backdrop, BrandLogo, CTAButton, Grain } from '../brand/Brand'

type ProfessionalType = 'personal' | 'nutritionist'

type StepId = 'area' | 'credential' | 'phone' | 'specialties' | 'experience' | 'clients' | 'workplaces' | 'priorities' | 'review'

const SPECIALTIES: Record<ProfessionalType, string[]> = {
  personal: [
    'Hipertrofia',
    'Emagrecimento',
    'Força / powerlifting',
    'Treino funcional',
    'Reabilitação e pós-lesão',
    'Terceira idade',
    'Gestantes',
    'Performance esportiva',
    'Mobilidade e flexibilidade',
    'Corrida e endurance',
  ],
  nutritionist: [
    'Emagrecimento',
    'Ganho de massa',
    'Nutrição esportiva',
    'Nutrição clínica',
    'Materno-infantil',
    'Vegetariana / vegana',
    'Comportamental',
    'Intolerâncias e alergias',
  ],
}

const EXPERIENCE = ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', '5 a 10 anos', 'Mais de 10 anos']
const CLIENTS = ['Estou começando', '1 a 10', '11 a 30', '31 a 60', 'Mais de 60']

const WORKPLACES: Record<ProfessionalType, string[]> = {
  personal: ['Academia', 'Estúdio próprio', 'Domicílio', 'Online', 'Ao ar livre', 'Empresas'],
  nutritionist: ['Consultório', 'Clínica', 'Online', 'Academia', 'Domicílio', 'Empresas'],
}

const PRIORITIES: Record<ProfessionalType, string[]> = {
  personal: ['Montar treinos', 'Avaliação física', 'Agenda de sessões', 'Acompanhar evolução', 'Captar alunos', 'Financeiro'],
  nutritionist: ['Planos alimentares', 'Anamnese', 'Consultas', 'Acompanhar evolução', 'Captar pacientes', 'Financeiro'],
}

export function ProfessionalOnboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    professionalType: '' as ProfessionalType | '',
    credential: '',
    phone: '',
  })
  const [extra, setExtra] = useState({
    specialties: [] as string[],
    experience: '',
    clients: '',
    workplaces: [] as string[],
    priorities: [] as string[],
  })

  const handleComplete = async () => {
    if (!user?.accessToken || !user.id) {
      toast.error('Sessão expirada. Faça login novamente.')
      navigate('/login', { replace: true })
      return
    }
    if (!data.professionalType || !data.credential.trim()) return

    setLoading(true)
    try {
      const role: UserRole = data.professionalType
      const updated = await patchJson<{
        id: string | number
        role?: string
        professionalId?: string
        whatsapp?: string
        name?: string
        email?: string
      }>(
        `${USERS_API}/${user.id}`,
        {
          role,
          professionalId: data.credential.trim(),
          whatsapp: data.phone.trim() || undefined,
        },
        user.accessToken,
      )

      // Tenta renovar o JWT para o papel novo entrar no token.
      let token = user.accessToken
      try {
        const refreshed = await postJson<{ token?: string; user?: { role?: string } }>(
          `${USERS_API}/refresh-token`,
          {},
          user.accessToken,
        )
        if (refreshed.token) token = refreshed.token
      } catch {
        /* refresh opcional — o estado local já cobre a navegação */
      }

      updateUser({
        role: (updated.role as UserRole) || role,
        professionalId: updated.professionalId || data.credential.trim(),
        whatsapp: updated.whatsapp || data.phone.trim() || user.whatsapp,
        accessToken: token,
      })

      // Respostas complementares do quiz (sem campo no backend ainda): personalizam o painel
      saveProProfile(user.id, extra)

      toast.success('Validação profissional concluída.')
      navigate(role === 'nutritionist' ? '/nutritionist' : '/personal', { replace: true })
    } catch (err) {
      const msg =
        err instanceof PayloadApiError
          ? extractPayloadMessage(err.data) || err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível salvar suas credenciais.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const type = (data.professionalType || 'personal') as ProfessionalType
  const isNutri = type === 'nutritionist'
  const who = isNutri ? 'pacientes' : 'alunos'

  const STEPS: { id: StepId; kicker: string; title: string; hint?: string; optional?: boolean }[] = [
    { id: 'area', kicker: 'Área de atuação', title: 'Qual é a sua área?', hint: 'Isso define para qual painel você será levado.' },
    {
      id: 'credential',
      kicker: 'Registro profissional',
      title: `Qual é o seu ${isNutri ? 'CRN' : 'CREF'}?`,
      hint: 'O número do conselho fica vinculado à sua conta e aparece no seu painel.',
    },
    { id: 'phone', kicker: 'Contato', title: `WhatsApp para os seus ${who}`, hint: 'Opcional. Você pode adicionar depois.', optional: true },
    { id: 'specialties', kicker: 'Especialidades', title: 'Em que você é especialista?', hint: 'Marque todas que se aplicam. Elas aparecem no seu painel.', optional: true },
    { id: 'experience', kicker: 'Experiência', title: 'Há quanto tempo você atua?', optional: true },
    { id: 'clients', kicker: 'Carteira', title: `Quantos ${who} você acompanha hoje?`, optional: true },
    { id: 'workplaces', kicker: 'Atendimento', title: 'Onde você atende?', hint: 'Marque todos que se aplicam.', optional: true },
    { id: 'priorities', kicker: 'Objetivo no CoachPass', title: 'O que você quer organizar primeiro?', hint: 'Usamos isso para destacar o que importa no seu painel.', optional: true },
    { id: 'review', kicker: 'Revisão', title: 'Tudo certo por aqui?' },
  ]

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const current = STEPS[step]

  const valid = (id: StepId) =>
    id === 'area' ? Boolean(data.professionalType) : id === 'credential' || id === 'review' ? Boolean(data.professionalType && data.credential.trim()) : true

  const hasValue = (id: StepId) => {
    switch (id) {
      case 'phone':
        return Boolean(data.phone.trim())
      case 'specialties':
        return extra.specialties.length > 0
      case 'experience':
        return Boolean(extra.experience)
      case 'clients':
        return Boolean(extra.clients)
      case 'workplaces':
        return extra.workplaces.length > 0
      case 'priorities':
        return extra.priorities.length > 0
      default:
        return true
    }
  }

  const goTo = useCallback(
    (next: number) => {
      window.clearTimeout(timer.current)
      setDirection(next > step ? 1 : -1)
      setStep(Math.max(0, Math.min(STEPS.length - 1, next)))
    },
    [step, STEPS.length],
  )

  const next = () => {
    if (!valid(current.id)) return
    if (current.id === 'review') void handleComplete()
    else goTo(step + 1)
  }

  // Trocar de área zera as escolhas que dependem dela (especialidades, locais, prioridades)
  const chooseArea = (value: ProfessionalType) => {
    if (value !== data.professionalType) setExtra((x) => ({ ...x, specialties: [], workplaces: [], priorities: [] }))
    setData((d) => ({ ...d, professionalType: value }))
  }

  const pickAndAdvance = (apply: () => void) => {
    apply()
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setDirection(1)
      setStep((s) => Math.min(STEPS.length - 1, s + 1))
    }, 360)
  }

  const toggle = (field: 'specialties' | 'workplaces' | 'priorities', value: string) =>
    setExtra((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }))

  // Teclado: Enter avança; números escolhem a opção
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (loading) return
      if (e.key === 'Enter') {
        e.preventDefault()
        next()
        return
      }
      if (e.target instanceof HTMLInputElement) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1) return
      if (current.id === 'area' && n <= 2) pickAndAdvance(() => chooseArea(n === 1 ? 'personal' : 'nutritionist'))
      if (current.id === 'experience' && EXPERIENCE[n - 1]) pickAndAdvance(() => setExtra((x) => ({ ...x, experience: EXPERIENCE[n - 1] })))
      if (current.id === 'clients' && CLIENTS[n - 1]) pickAndAdvance(() => setExtra((x) => ({ ...x, clients: CLIENTS[n - 1] })))
      if (current.id === 'specialties' && SPECIALTIES[type][n - 1]) toggle('specialties', SPECIALTIES[type][n - 1])
      if (current.id === 'workplaces' && WORKPLACES[type][n - 1]) toggle('workplaces', WORKPLACES[type][n - 1])
      if (current.id === 'priorities' && PRIORITIES[type][n - 1]) toggle('priorities', PRIORITIES[type][n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const renderStep = () => {
    switch (current.id) {
      case 'area':
        return (
          <div className="grid sm:grid-cols-2 gap-3">
            {(
              [
                { value: 'personal', label: 'Personal Trainer', desc: 'Treinos, avaliação física e agenda.', icon: Dumbbell },
                { value: 'nutritionist', label: 'Nutricionista', desc: 'Clínica ou esportiva: planos e consultas.', icon: Apple },
              ] as const
            ).map(({ value, label, desc, icon: Icon }, i) => {
              const selected = data.professionalType === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pickAndAdvance(() => chooseArea(value))}
                  aria-pressed={selected}
                  className={`cp-spot relative text-left rounded-2xl border p-5 transition-[background,border-color] duration-300 ${
                    selected ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)]' : 'border-[var(--line-2)] bg-white/[0.025] hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="cp-mono absolute top-4 right-4 w-6 h-6 rounded-md grid place-items-center text-[11px] border border-[var(--line-2)] text-[var(--muted)]">
                    {selected ? <Check className="w-3.5 h-3.5 text-[var(--brand-300)]" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="w-11 h-11 rounded-xl grid place-items-center bg-[rgba(85,70,255,0.14)]">
                    <Icon className="w-5 h-5 text-[var(--brand-300)]" />
                  </span>
                  <p className="cp-display mt-4 text-[19px] font-semibold">{label}</p>
                  <p className="mt-1 text-[13.5px] text-[var(--muted)]">{desc}</p>
                </button>
              )
            })}
          </div>
        )
      case 'credential':
        return (
          <div className="relative">
            <CreditCard className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={data.credential}
              onChange={(e) => setData({ ...data, credential: e.target.value })}
              placeholder={isNutri ? '12345/SP' : '123456-G/SP'}
              className="cp-field cp-field-lg pl-14"
            />
          </div>
        )
      case 'phone':
        return (
          <div className="relative">
            <Phone className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
            <input
              autoFocus
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="cp-field cp-field-lg pl-14"
            />
          </div>
        )
      case 'specialties':
      case 'workplaces':
      case 'priorities': {
        const field = current.id
        const options = field === 'specialties' ? SPECIALTIES[type] : field === 'workplaces' ? WORKPLACES[type] : PRIORITIES[type]
        return (
          <div className="flex flex-wrap gap-2.5">
            {options.map((o, i) => {
              const active = extra[field].includes(o)
              return (
                <motion.button
                  key={o}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggle(field, o)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2.5 h-12 pl-2 pr-4 rounded-full border text-[14.5px] font-medium transition-[background,border-color,color] ${
                    active ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.14)] text-white' : 'border-[var(--line-2)] bg-white/[0.025] text-[var(--muted)] hover:text-white'
                  }`}
                >
                  <span
                    className={`cp-mono w-8 h-8 rounded-full grid place-items-center text-[11px] ${
                      active ? 'cp-selected' : 'border border-[var(--line-2)]'
                    }`}
                  >
                    {active ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {o}
                </motion.button>
              )
            })}
          </div>
        )
      }
      case 'experience':
      case 'clients': {
        const field = current.id
        const options = field === 'experience' ? EXPERIENCE : CLIENTS
        return (
          <div className="grid sm:grid-cols-2 gap-3">
            {options.map((o, i) => {
              const selected = extra[field] === o
              return (
                <motion.button
                  key={o}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => pickAndAdvance(() => setExtra((x) => ({ ...x, [field]: o })))}
                  aria-pressed={selected}
                  className={`flex items-center gap-4 rounded-2xl border px-5 h-16 text-left transition-[background,border-color] ${
                    selected ? 'border-[var(--brand-400)] bg-[rgba(85,70,255,0.12)]' : 'border-[var(--line-2)] bg-white/[0.025] hover:bg-white/[0.05]'
                  }`}
                >
                  <span className={`cp-mono w-7 h-7 rounded-lg grid place-items-center text-[12px] ${selected ? 'cp-selected' : 'border border-[var(--line-2)] text-[var(--muted)]'}`}>
                    {selected ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="cp-display text-[17px] font-semibold">{o}</span>
                </motion.button>
              )
            })}
          </div>
        )
      }
      case 'review': {
        const at = (id: StepId) => () => goTo(STEPS.findIndex((s) => s.id === id))
        const rows: [string, string, StepId][] = [
          ['Área', isNutri ? 'Nutricionista' : 'Personal Trainer', 'area'],
          [isNutri ? 'CRN' : 'CREF', data.credential || '—', 'credential'],
          ['WhatsApp', data.phone || '—', 'phone'],
          ['Especialidades', extra.specialties.join(', ') || '—', 'specialties'],
          ['Experiência', extra.experience || '—', 'experience'],
          [isNutri ? 'Pacientes' : 'Alunos', extra.clients || '—', 'clients'],
          ['Atende em', extra.workplaces.join(', ') || '—', 'workplaces'],
          ['Prioridades', extra.priorities.join(', ') || '—', 'priorities'],
        ]
        return (
          <div className="rounded-3xl border border-[var(--line-2)] bg-white/[0.025] px-5 sm:px-7 py-2">
            {rows.map(([label, value, id]) => (
              <button
                key={label}
                type="button"
                onClick={at(id)}
                className="group w-full flex items-center justify-between gap-4 py-3.5 border-b border-[var(--line)] last:border-b-0 text-left"
              >
                <span className="text-[14px] text-[var(--muted)] shrink-0">{label}</span>
                <span className="flex items-center gap-3 min-w-0">
                  <span className={`text-right text-[15px] ${value === '—' ? 'text-[var(--dim)]' : 'text-white font-medium'}`}>{value}</span>
                  <Pencil className="w-3.5 h-3.5 shrink-0 text-[var(--dim)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
        )
      }
    }
  }

  const firstName = user?.name?.split(' ')[0]

  return (
    <MotionConfig reducedMotion="user">
      <div className="cp-brand relative min-h-screen flex flex-col overflow-hidden">
        <Grain />
        <Backdrop variant="auth" />

        <header className="relative z-10 px-4 sm:px-8 pt-5">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between">
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
                  transition={{ duration: 0.5 }}
                />
              </button>
            ))}
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-[680px] mx-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 36 : -36 }),
                  center: { opacity: 1, y: 0 },
                  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -36 : 36 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <p className="cp-kicker flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
                  {current.kicker}
                  {current.optional && <span className="text-[var(--dim)]">· opcional</span>}
                </p>
                <h1 className="cp-display mt-4 text-[clamp(30px,4.4vw,50px)] font-bold leading-[1.04]">
                  {step === 0 ? (
                    <>
                      {firstName ? `${firstName}, vamos` : 'Vamos'} montar seu perfil.{' '}
                      <span className="cp-accent">{current.title}</span>
                    </>
                  ) : current.id === 'review' ? (
                    <>
                      Pronto{firstName ? `, ${firstName}` : ''}. <span className="cp-accent">Tudo certo por aqui?</span>
                    </>
                  ) : (
                    current.title
                  )}
                </h1>
                <p className="mt-3 text-[16px] text-[var(--muted)]">
                  {current.id === 'review'
                    ? 'Toque em qualquer linha para ajustar. Área, registro e WhatsApp ficam na sua conta; o restante personaliza o seu painel.'
                    : current.hint}
                </p>

                <div className="mt-9">{renderStep()}</div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <CTAButton type="button" onClick={next} disabled={!valid(current.id) || loading}>
                    {loading
                      ? 'Salvando…'
                      : current.id === 'review'
                        ? 'Continuar para o painel'
                        : current.optional && !hasValue(current.id)
                          ? 'Pular'
                          : 'Continuar'}
                  </CTAButton>
                  {current.id === 'review' ? (
                    <span className="inline-flex items-center gap-2 text-[13px] text-[var(--dim)]">
                      <Shield className="w-4 h-4" />
                      Seus dados de registro ficam vinculados à conta.
                    </span>
                  ) : (
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

        <footer className="relative z-10 px-4 sm:px-8 pb-6">
          <div className="max-w-[1100px] mx-auto">
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-[14px] text-[var(--muted)] hover:text-white disabled:opacity-0 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
