import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { z } from 'zod'

import { reqHasStudentPro } from '@/access/entitlements'
import { hasActiveLink } from '@/access/links'
import { generateJsonWithGemini } from '@/services/ai/geminiProvider'
import { CYCLE_TEMPLATES } from '@/lib/periodization/templates'
import { totalWeeks } from '@/lib/periodization/calc'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const phaseSchema = z.object({
  name: z.string().max(60),
  kind: z.enum(['adaptation', 'accumulation', 'hypertrophy', 'strength', 'intensification', 'power', 'realization', 'deload', 'transition', 'cutting']),
  weeks: z.number().int().min(1).max(8),
  repRange: z.string().max(12).optional(),
  rirStart: z.number().min(0).max(5).optional(),
  rirEnd: z.number().min(0).max(5).optional(),
  intensityMin: z.number().min(40).max(100).optional(),
  intensityMax: z.number().min(40).max(100).optional(),
  setsStart: z.number().min(4).max(25).optional(),
  setsEnd: z.number().min(4).max(25).optional(),
  cardioMin: z.number().min(0).max(600).optional(),
  dietPhase: z.enum(['deficit', 'maintenance', 'surplus', 'diet_break']).optional(),
  kcalDelta: z.number().min(-800).max(800).optional(),
  proteinGPerKg: z.number().min(1.2).max(3).optional(),
})
const proposalSchema = z.object({ title: z.string().max(80), phases: z.array(phaseSchema).min(1).max(12) })

const GOALS = ['hypertrophy', 'strength', 'fat_loss', 'recomposition', 'conditioning', 'performance'] as const
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

/**
 * Proposta de ciclo pela IA (rascunho editável; nada é salvo aqui).
 * Sem IA disponível, devolve o modelo pronto mais próximo do objetivo.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const goal = GOALS.includes(body.goal as never) ? (body.goal as (typeof GOALS)[number]) : 'hypertrophy'
  const level = LEVELS.includes(body.level as never) ? (body.level as (typeof LEVELS)[number]) : 'beginner'
  const weeks = Math.min(24, Math.max(4, Number(body.weeks) || 12))
  const sessions = Math.min(7, Math.max(2, Number(body.sessionsPerWeek) || 4))

  // Quem pode pedir: personal para aluno vinculado; aluno Pro (ou profissional no modo aluno) para si
  const role = (user as { role?: string }).role
  let studentId = Number(body.studentId) || null
  if (role === 'student') {
    const req = { user, payload } as never
    if (!reqHasStudentPro(req)) {
      return NextResponse.json({ error: 'Recurso do Aluno Pro.', code: 'STUDENT_PRO_REQUIRED' }, { status: 402 })
    }
    studentId = Number(user.id)
  } else if (role === 'personal') {
    if (!studentId) return NextResponse.json({ error: 'Escolha o aluno.' }, { status: 400 })
    const ok = await hasActiveLink({ req: { payload, user } as never, studentId, professionalId: user.id, professionalRole: 'personal' })
    if (!ok) return NextResponse.json({ error: 'Aluno sem vínculo ativo.' }, { status: 403 })
  } else {
    return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
  }

  const profile = await payload.find({ collection: 'student-profiles', where: { user: { equals: studentId } }, limit: 1, depth: 0, overrideAccess: true })
  const p = profile.docs[0]
  const restrictions = await payload.find({
    collection: 'restrictions',
    where: { and: [{ student: { equals: studentId } }, { active: { equals: true } }] },
    depth: 0,
    limit: 10,
    overrideAccess: true,
  })

  const fallback = CYCLE_TEMPLATES.find((t) => t.goal === goal) ?? CYCLE_TEMPLATES[0]
  const prompt = `Você é um treinador com base em evidências. Monte a periodização (macrociclo) em JSON.
Objetivo: ${goal}. Nível: ${level}. Duração total: ${weeks} semanas. Sessões por semana: ${sessions}.
Perfil: sexo ${p?.sex ?? 'n/d'}, peso ${p?.weightKg ?? 'n/d'} kg, experiência ${p?.experienceLevel ?? level}.
Restrições: ${restrictions.docs.map((r) => r.title).join('; ') || 'nenhuma'}.
Regras: 10–20 séries por músculo/semana; RIR caindo dentro do bloco (3 → 0–1); deload a cada 4–6 semanas (volume −40 a −60%, RIR 4);
força em blocos: acumulação 65–75%, intensificação 75–85%, realização 85–95% do 1RM; perda de peso 0,5–1%/semana com proteína 2–2,4 g/kg;
ganho com superávit pequeno (+150 a +300 kcal). A soma de "weeks" deve ser exatamente ${weeks}.
Responda SOMENTE: {"title":"...","phases":[{"name":"...","kind":"accumulation|hypertrophy|strength|intensification|realization|deload|adaptation|power|transition|cutting","weeks":3,"repRange":"8-12","rirStart":3,"rirEnd":1,"setsStart":10,"setsEnd":14,"intensityMin":65,"intensityMax":75,"cardioMin":0,"dietPhase":"surplus|deficit|maintenance|diet_break","kcalDelta":250,"proteinGPerKg":1.8}]}`

  const ai = await generateJsonWithGemini(prompt)
  if (ai.ok) {
    const parsed = proposalSchema.safeParse(ai.data)
    if (parsed.success && totalWeeks(parsed.data.phases) === weeks) {
      return NextResponse.json({ provider: 'gemini', goal, level, sessionsPerWeek: sessions, ...parsed.data })
    }
  }
  return NextResponse.json({
    provider: 'template',
    goal,
    level,
    sessionsPerWeek: fallback.sessionsPerWeek,
    title: fallback.name,
    phases: fallback.phases,
    note: 'A IA não respondeu no formato esperado; usamos o modelo pronto mais próximo.',
  })
}
