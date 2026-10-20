import { z } from 'zod'

export const generatedWorkoutSchema = z.object({
  title: z.string().min(3).max(120),
  observations: z.string().max(2000).optional().default(''),
  weekday: z.string().max(20).optional(),
  splitLabel: z.string().max(80).optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().min(2),
        sets: z.number().int().min(1).max(10).optional().default(3),
        reps: z.string().min(1).max(40).optional().default('8-12'),
        weight: z.string().max(40).optional().default('Ajustar'),
        rest: z.string().max(40).optional().default('60-90s'),
        muscle: z.string().max(40).optional().default(''),
        notes: z.string().max(200).optional().default(''),
        instructions: z.string().max(800).optional().default(''),
        youtubeUrl: z.string().max(500).optional().default(''),
        muscleImage: z.string().max(200).optional().default(''),
      }),
    )
    .min(4)
    .max(14),
})

export type GeneratedWorkout = z.infer<typeof generatedWorkoutSchema>

export const generatedWeekSchema = z.object({
  days: z.array(generatedWorkoutSchema).min(3).max(7),
})

export type GeneratedWeek = z.infer<typeof generatedWeekSchema>

type GeminiResult =
  | { ok: true; data: GeneratedWorkout; provider: 'gemini' }
  | { ok: false; error: string }

type GeminiWeekResult =
  | { ok: true; data: GeneratedWeek; provider: 'gemini' }
  | { ok: false; error: string }

type GeminiContent = { role: 'user' | 'model'; parts: Array<{ text: string }> }

const MISSING_GEMINI_KEY =
  'O assistente de conversa precisa da chave Gemini no servidor (GEMINI_API_KEY). Enquanto isso, a semana de treinos ainda pode ser gerada pelo catálogo na página Treinos.'

async function callGemini(args: {
  contents: GeminiContent[]
  system?: string
  temperature: number
  json?: boolean
}): Promise<{ ok: true; raw: string } | { ok: false; error: string; code?: 'NO_KEY' }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, code: 'NO_KEY', error: MISSING_GEMINI_KEY }
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const generationConfig: Record<string, unknown> = {
    temperature: args.temperature,
  }
  if (args.json) generationConfig.responseMimeType = 'application/json'

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(args.system ? { systemInstruction: { parts: [{ text: args.system }] } } : {}),
      contents: args.contents,
      generationConfig,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, error: `Gemini HTTP ${res.status}: ${text.slice(0, 200)}` }
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) {
    return { ok: false, error: 'Resposta vazia do Gemini' }
  }
  return { ok: true, raw }
}

async function callGeminiJson(prompt: string) {
  return callGemini({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    temperature: 0.4,
    json: true,
  })
}

export type ChatTurn = { role: 'user' | 'model'; text: string }

export async function generateChatWithGemini(args: {
  system: string
  messages: ChatTurn[]
}): Promise<{ ok: true; text: string } | { ok: false; error: string; code?: 'NO_KEY' }> {
  const contents: GeminiContent[] = []
  for (const message of args.messages) {
    const text = message.text.trim()
    if (!text) continue
    const last = contents[contents.length - 1]
    if (last && last.role === message.role) {
      last.parts[0].text = `${last.parts[0].text}\n${text}`
    } else {
      contents.push({ role: message.role, parts: [{ text }] })
    }
  }
  while (contents[0]?.role === 'model') contents.shift()
  if (!contents.length || contents.every((item) => item.role !== 'user')) {
    return { ok: false, error: 'Nenhuma mensagem do usuário para responder.' }
  }

  const call = await callGemini({
    contents,
    system: args.system,
    temperature: 0.6,
  })
  if (!call.ok) return call
  const text = call.raw.trim()
  if (!text) return { ok: false, error: 'Resposta vazia do Gemini' }
  return { ok: true, text }
}

export async function generateWorkoutWithGemini(prompt: string): Promise<GeminiResult> {
  const call = await callGeminiJson(prompt)
  if (!call.ok) return call
  try {
    const parsed = generatedWorkoutSchema.parse(JSON.parse(call.raw))
    return { ok: true, data: parsed, provider: 'gemini' }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'JSON inválido do Gemini',
    }
  }
}

export async function generateWeekWithGemini(prompt: string): Promise<GeminiWeekResult> {
  const call = await callGeminiJson(prompt)
  if (!call.ok) return call
  try {
    const parsed = generatedWeekSchema.parse(JSON.parse(call.raw))
    return { ok: true, data: parsed, provider: 'gemini' }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'JSON inválido do Gemini (semana)',
    }
  }
}
