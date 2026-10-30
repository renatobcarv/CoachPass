import type { Payload } from 'payload'

import type { User } from '@/payload-types'
import { TACO_FOODS } from '@/data/tacoFoods'
import { generateMealPlanWithGemini, type GeneratedMealPlan } from './geminiProvider'
import { getAiQuota } from './quota'

type ProfileDoc = {
  goal?: string | null
  foodAllergies?: string | null
  dietaryRestrictions?: string | null
  weightKg?: number | null
  heightCm?: number | null
}

type FoodRow = {
  name: string
  category: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

function pick(foods: FoodRow[], category: string, fallback: string): FoodRow {
  return (
    foods.find((item) => item.category === category) || {
      name: fallback,
      category,
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 3,
    }
  )
}

function localPlan(profile: ProfileDoc, foods: FoodRow[]): GeneratedMealPlan {
  const loss = profile.goal === 'weight_loss'
  const chicken = pick(foods, 'protein', 'Frango grelhado (peito)')
  const rice = pick(foods, 'carb', 'Arroz integral cozido')
  const veg = pick(foods, 'vegetable', 'Brócolis cozido')
  const fruit = pick(foods, 'fruit', 'Banana-prata')
  const dairy = pick(foods, 'dairy', 'Iogurte natural integral')
  const qty = loss ? 80 : 120
  const item = (food: FoodRow, grams: number) => ({
    name: food.name,
    quantity: `${grams}g`,
    calories: Math.round((food.calories * grams) / 100),
  })
  return {
    title: loss ? 'Plano de reorganização (IA)' : 'Plano de recomposição (IA)',
    observations: 'Sugestão gerada automaticamente. Não é prescrição clínica.',
    meals: [
      {
        name: 'Café da manhã',
        time: '08:00',
        calories: 0,
        items: [item(dairy, 150), item(fruit, 80)],
      },
      {
        name: 'Almoço',
        time: '12:30',
        calories: 0,
        items: [item(chicken, qty), item(rice, qty), item(veg, 100)],
      },
      {
        name: 'Jantar',
        time: '19:30',
        calories: 0,
        items: [item(chicken, Math.round(qty * 0.8)), item(veg, 120)],
      },
    ].map((meal) => ({
      ...meal,
      calories: meal.items.reduce((sum, row) => sum + (row.calories || 0), 0),
    })),
  }
}

export async function createAiMealPlanForStudent(args: {
  payload: Payload
  userId: User['id']
  profile: ProfileDoc
}): Promise<
  | { ok: true; mealPlanId: string | number; title: string; remaining: number; provider: string }
  | { ok: false; code: string; message: string; remaining?: number }
> {
  const { payload, userId, profile } = args
  const quota = await getAiQuota(payload, userId, 'meal_plan')
  if (quota.blocked) {
    return {
      ok: false,
      code: 'QUOTA_EXCEEDED',
      message: 'Você atingiu o limite de 2 gerações de plano neste mês.',
      remaining: 0,
    }
  }

  const catalog = await payload.find({
    collection: 'foods',
    limit: 80,
    depth: 0,
    overrideAccess: true,
  })
  const foods: FoodRow[] =
    catalog.docs.length > 0
      ? catalog.docs.map((doc) => ({
          name: String(doc.name),
          category: String(doc.category),
          calories: Number(doc.calories) || 0,
          protein: Number(doc.protein) || 0,
          carbs: Number(doc.carbs) || 0,
          fat: Number(doc.fat) || 0,
        }))
      : TACO_FOODS

  const pending = await payload.create({
    collection: 'ai-generations',
    data: { user: userId, type: 'meal_plan', status: 'pending', provider: 'pending' },
    overrideAccess: true,
  })

  const reserved = await getAiQuota(payload, userId, 'meal_plan')
  if (reserved.used > reserved.limit) {
    await payload.update({
      collection: 'ai-generations',
      id: pending.id,
      data: { status: 'failed', provider: 'quota', errorMessage: 'QUOTA_EXCEEDED' },
      overrideAccess: true,
    })
    return {
      ok: false,
      code: 'QUOTA_EXCEEDED',
      message: 'Você atingiu o limite de 2 gerações de plano neste mês.',
      remaining: 0,
    }
  }

  const foodList = foods
    .slice(0, 40)
    .map((food) => `${food.name} (${food.category}, ${food.calories} kcal/100g)`)
    .join('\n')

  const prompt = `Você é um assistente nutricional do CoachPass. Gere UM plano alimentar diário em JSON válido.
Regras:
- Use APENAS alimentos desta lista (campo name idêntico).
- 3 a 5 refeições.
- Respeite alergias: ${profile.foodAllergies || 'nenhuma'} e restrições: ${profile.dietaryRestrictions || 'nenhuma'}.
- Objetivo: ${profile.goal || 'não informado'}.
- Não é prescrição clínica. Sem dados pessoais.
- Resposta SOMENTE:
{"title":"...","observations":"...","meals":[{"name":"Almoço","time":"12:30","calories":600,"items":[{"name":"...","quantity":"120g","calories":190}]}]}

Alimentos:
${foodList}
`

  const gemini = await generateMealPlanWithGemini(prompt)
  const plan = gemini.ok ? gemini.data : localPlan(profile, foods)
  const provider = gemini.ok
    ? 'gemini'
    : process.env.GEMINI_API_KEY
      ? `local-fallback:${gemini.error}`
      : 'local-catalog'

  const disclaimer =
    'Sugestão gerada por IA com base em valores de referência (TACO/TBCA). Não substitui consulta com nutricionista.'

  try {
    const created = await payload.create({
      collection: 'meal-plans',
      data: {
        title: plan.title,
        student: userId,
        author: userId,
        status: 'published',
        source: 'ai',
        isInformational: true,
        observations: [plan.observations, disclaimer].filter(Boolean).join('\n\n'),
        publishedAt: new Date().toISOString(),
        meals: plan.meals,
      },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'ai-generations',
      id: pending.id,
      data: { status: 'succeeded', provider, resultId: String(created.id) },
      overrideAccess: true,
    })
    const after = await getAiQuota(payload, userId, 'meal_plan')
    return {
      ok: true,
      mealPlanId: created.id,
      title: created.title,
      remaining: after.remaining,
      provider,
    }
  } catch (err) {
    await payload.update({
      collection: 'ai-generations',
      id: pending.id,
      data: {
        status: 'failed',
        provider,
        errorMessage: err instanceof Error ? err.message : 'Falha ao salvar plano',
      },
      overrideAccess: true,
    })
    return {
      ok: false,
      code: 'SAVE_FAILED',
      message: 'Não foi possível salvar o plano alimentar.',
      remaining: quota.remaining,
    }
  }
}
