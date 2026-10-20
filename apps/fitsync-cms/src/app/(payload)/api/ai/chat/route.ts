import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { generateChatWithGemini, type ChatTurn } from '@/services/ai/geminiProvider'

export const dynamic = 'force-dynamic'

const MAX_MESSAGES = 12
const MAX_CHARS = 2000

const GOAL_LABEL: Record<string, string> = {
  weight_loss: 'emagrecimento',
  hypertrophy: 'hipertrofia',
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'iniciante',
  intermediate: 'intermediário',
  advanced: 'avançado',
}

const EQUIPMENT_LABEL: Record<string, string> = {
  full_gym: 'academia completa',
  basic_gym: 'academia básica',
  home_weights: 'halteres ou elásticos em casa',
  bodyweight: 'peso corporal',
  outdoor: 'ar livre',
}

type ProfileDoc = {
  displayName?: string | null
  goal?: string | null
  experienceLevel?: string | null
  trainingDaysPerWeek?: number | null
  sessionMinutes?: number | null
  equipmentAccess?: string[] | null
  heightCm?: number | null
  weightKg?: number | null
  foodAllergies?: string | null
  dietaryRestrictions?: string | null
  medicalConditions?: string | null
  injuries?: string | null
  medications?: string | null
}

function label(map: Record<string, string>, value?: string | null): string {
  if (!value) return 'não informado'
  return map[value] || value
}

function profileContext(name: string, profile: ProfileDoc | null): string {
  if (!profile) {
    return `Nome: ${name}. Perfil de aluno ainda não preenchido. Peça para completar o cadastro antes de personalizar treino ou alimentação. Dúvidas gerais podem ser respondidas.`
  }
  const equipment = (profile.equipmentAccess || [])
    .map((item) => EQUIPMENT_LABEL[item] || item)
    .filter(Boolean)
  return [
    `Nome: ${profile.displayName || name}`,
    `Objetivo: ${label(GOAL_LABEL, profile.goal)}`,
    `Experiência: ${label(LEVEL_LABEL, profile.experienceLevel)}`,
    `Dias por semana: ${profile.trainingDaysPerWeek ?? 'não informado'}`,
    `Minutos por sessão: ${profile.sessionMinutes ?? 'não informado'}`,
    `Equipamentos: ${equipment.length ? equipment.join(', ') : 'não informado'}`,
    `Altura (cm): ${profile.heightCm ?? 'não informado'}`,
    `Peso (kg): ${profile.weightKg ?? 'não informado'}`,
    `Alergias alimentares: ${profile.foodAllergies?.trim() || 'não informado'}`,
    `Restrições alimentares: ${profile.dietaryRestrictions?.trim() || 'não informado'}`,
    `Condições: ${profile.medicalConditions?.trim() || 'não informado'}`,
    `Lesões: ${profile.injuries?.trim() || 'não informado'}`,
    `Medicamentos: ${profile.medications?.trim() || 'não informado'}`,
  ].join('\n')
}

function systemPrompt(role: string, name: string, profile: ProfileDoc | null): string {
  const who =
    role === 'student'
      ? `Aluno autenticado.\n${profileContext(name, profile)}`
      : `Profissional autenticado (${role || 'conta'}): ${name}. Não invente dados de alunos. Responda dúvidas gerais de treino e alimentação.`

  return `Você é o CoachPass Assistant, assistente de treino e alimentação.
Responda em português do Brasil, de forma curta e prática.
Use apenas o contexto abaixo. Não invente medidas, treinos salvos nem metas calóricas que não estejam nele.
Não afirme que alterou calorias, treinos ou planos no aplicativo. Para gravar uma semana de treinos, oriente a usar o botão "Gerar semana com IA" na página Treinos.
Não faça diagnóstico médico nem prescrição clínica. Se houver lesão, condição ou medicamento relevante, sugira procurar personal, nutricionista ou médico.
Orientações alimentares são informativas e não substituem um plano publicado.

${who}`
}

function parseMessages(body: unknown): ChatTurn[] | { error: string } {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) {
    return { error: 'Envie a lista de mensagens.' }
  }
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_MESSAGES)
  const turns: ChatTurn[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return { error: 'Mensagem inválida.' }
    const role = (item as { role?: unknown }).role
    const text = (item as { text?: unknown }).text
    if (typeof text !== 'string' || !text.trim()) continue
    if (text.length > MAX_CHARS) return { error: `Cada mensagem pode ter no máximo ${MAX_CHARS} caracteres.` }
    if (role !== 'user' && role !== 'ai' && role !== 'assistant') {
      return { error: 'Papel de mensagem inválido.' }
    }
    turns.push({ role: role === 'user' ? 'user' : 'model', text: text.trim() })
  }
  if (!turns.some((turn) => turn.role === 'user')) {
    return { error: 'Envie ao menos uma mensagem.' }
  }
  return turns
}

async function getAuthUser() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  return { payload, user }
}

export async function POST(request: Request) {
  const { payload, user } = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const messages = parseMessages(body)
  if ('error' in messages) {
    return NextResponse.json({ error: messages.error }, { status: 400 })
  }

  const role = (user as { role?: string }).role || ''
  const name = (user as { name?: string }).name || 'usuário'
  let profile: ProfileDoc | null = null

  if (role === 'student') {
    const profiles = await payload.find({
      collection: 'student-profiles',
      where: { user: { equals: user.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    profile = (profiles.docs[0] as ProfileDoc | undefined) ?? null
  }

  const result = await generateChatWithGemini({
    system: systemPrompt(role, name, profile),
    messages,
  })

  if (!result.ok) {
    if (result.code === 'NO_KEY') {
      return NextResponse.json({ error: result.error }, { status: 503 })
    }
    console.error('Falha no chat IA:', result.error)
    return NextResponse.json(
      { error: 'Não consegui responder agora. Tente de novo em instantes.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ reply: result.text })
}
