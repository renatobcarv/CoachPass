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

async function callGeminiJson(prompt: string): Promise<{ ok: true; raw: string } | { ok: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'GEMINI_API_KEY ausente' }
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
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
