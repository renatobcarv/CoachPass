import { setDefaultResultOrder } from 'node:dns'
import { z } from 'zod'

try {
  setDefaultResultOrder('ipv4first')
} catch {
  /* Node em alguns runtimes não expõe a ordem DNS */
}

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

type GeminiCall =
  | { ok: true; raw: string }
  | { ok: false; error: string; code?: 'NO_KEY' | 'TIMEOUT' | 'PROVIDER'; retryable?: boolean }

function retryableStatus(status: number): boolean {
  return status === 404 || status === 429 || status === 502 || status === 503
}

function modelsToTry(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim()
  const models = ['gemini-2.0-flash', preferred, 'gemini-2.5-flash'].filter(
    (model): model is string => Boolean(model),
  )
  return [...new Set(models)].slice(0, 2)
}

async function callGeminiOnce(args: {
  contents: GeminiContent[]
  system?: string
  temperature: number
  json?: boolean
  apiKey: string
  model: string
}): Promise<GeminiCall> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent`
  const generationConfig: Record<string, unknown> = { temperature: args.temperature }
  if (args.json) generationConfig.responseMimeType = 'application/json'

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': args.apiKey,
      },
      body: JSON.stringify({
        ...(args.system ? { systemInstruction: { parts: [{ text: args.system }] } } : {}),
        contents: args.contents,
        generationConfig,
      }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
    return {
      ok: false,
      code: timedOut ? 'TIMEOUT' : 'PROVIDER',
      retryable: true,
      error: timedOut
        ? 'O assistente demorou demais para responder. Tente de novo em instantes.'
        : 'O assistente não conseguiu responder agora. Tente de novo em instantes.',
    }
  }

  if (!res.ok) {
    await res.text().catch(() => '')
    return {
      ok: false,
      code: 'PROVIDER',
      retryable: retryableStatus(res.status),
      error: 'O assistente não conseguiu responder agora. Tente de novo em instantes.',
    }
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) {
    return {
      ok: false,
      code: 'PROVIDER',
      error: 'O assistente não conseguiu responder agora. Tente de novo em instantes.',
    }
  }
  return { ok: true, raw }
}

async function callGemini(args: {
  contents: GeminiContent[]
  system?: string
  temperature: number
  json?: boolean
}): Promise<GeminiCall> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, code: 'NO_KEY', error: MISSING_GEMINI_KEY }
  }

  const models = modelsToTry()
  let last: GeminiCall | null = null
  for (let index = 0; index < models.length; index += 1) {
    const result = await callGeminiOnce({ ...args, apiKey, model: models[index] })
    if (result.ok) return result
    last = result
    if (!result.retryable) return result
    if (index < models.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }
  return last || { ok: false, code: 'PROVIDER', error: 'O assistente não conseguiu responder agora. Tente de novo em instantes.' }
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
}): Promise<{ ok: true; text: string } | { ok: false; error: string; code?: 'NO_KEY' | 'TIMEOUT' | 'PROVIDER' }> {
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
  if (!call.ok) return { ok: false, error: call.error, code: call.code }
  const text = call.raw.trim()
  if (!text) {
    return {
      ok: false,
      code: 'PROVIDER',
      error: 'O assistente não conseguiu responder agora. Tente de novo em instantes.',
    }
  }
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

export const generatedMealPlanSchema = z.object({
  title: z.string().min(3).max(120),
  observations: z.string().max(2000).optional().default(''),
  meals: z
    .array(
      z.object({
        name: z.string().min(2).max(80),
        time: z.string().max(10).optional().default(''),
        calories: z.number().min(0).max(2000).optional().default(0),
        items: z
          .array(
            z.object({
              name: z.string().min(2),
              quantity: z.string().min(1).max(40).optional().default('100g'),
              calories: z.number().min(0).max(1500).optional().default(0),
            }),
          )
          .min(1)
          .max(8),
      }),
    )
    .min(3)
    .max(6),
})

export type GeneratedMealPlan = z.infer<typeof generatedMealPlanSchema>

export async function generateMealPlanWithGemini(
  prompt: string,
): Promise<{ ok: true; data: GeneratedMealPlan; provider: 'gemini' } | { ok: false; error: string }> {
  const call = await callGeminiJson(prompt)
  if (!call.ok) return call
  try {
    return { ok: true, data: generatedMealPlanSchema.parse(JSON.parse(call.raw)), provider: 'gemini' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'JSON inválido do Gemini (plano)' }
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
