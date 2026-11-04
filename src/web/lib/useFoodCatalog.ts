import { useEffect, useState } from 'react'

import { FOODS_API, getJson, qs } from '@/lib/cms'
import { useAuth } from '../context/AuthContext'
import type { FoodDoc } from './studentApi'

/** Alimento no formato usado pelos editores de plano (valores por 100 g/ml). */
export type CatalogFood = {
  id: string
  name: string
  category: FoodDoc['category']
  calories: number
  protein: number
  carbs: number
  fat: number
  unit: string
}

// Uma busca por sessão: a tabela muda pouco e é usada em várias telas
let cache: { token: string; foods: CatalogFood[] } | null = null
let inflight: Promise<CatalogFood[]> | null = null

export function invalidateFoodCatalog() {
  cache = null
}

/** Tabela de alimentos do banco (TACO/TBCA e os cadastrados pela nutricionista). */
export function useFoodCatalog(): CatalogFood[] {
  const { user } = useAuth()
  const token = user?.accessToken
  const [foods, setFoods] = useState<CatalogFood[]>(() => (cache && cache.token === token ? cache.foods : []))

  useEffect(() => {
    if (!token) return
    if (cache?.token === token) {
      setFoods(cache.foods)
      return
    }
    let alive = true
    inflight ??= getJson<{ docs: FoodDoc[] }>(`${FOODS_API}${qs({ limit: 1000, sort: 'name', depth: 0 })}`, token)
      .then((r) =>
        r.docs.map((f) => ({
          id: String(f.id),
          name: f.name,
          category: f.category,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          unit: f.unit || 'g',
        })),
      )
      .finally(() => {
        inflight = null
      })
    inflight
      .then((list) => {
        cache = { token, foods: list }
        if (alive) setFoods(list)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [token])

  return foods
}
