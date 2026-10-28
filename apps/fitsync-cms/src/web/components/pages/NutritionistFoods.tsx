import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { fetchFoods, type FoodDoc } from '../../lib/studentApi'

const card = 'rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white p-5'

const sourceLabel: Record<FoodDoc['source'], string> = {
  taco: 'TACO',
  tbca: 'TBCA',
  usda: 'USDA',
  manufacturer: 'Fabricante',
  manual: 'Manual',
}

export function NutritionistFoods() {
  const { user } = useAuth()
  const [foods, setFoods] = useState<FoodDoc[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.accessToken) return
    fetchFoods(user.accessToken, search)
      .then(setFoods)
      .catch(() => toast.error('Não foi possível carregar os alimentos.'))
      .finally(() => setLoading(false))
  }, [user?.accessToken, search])

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Alimentos</h1>
        <p className="text-sm dark:text-zinc-400 mt-1">
          Base de referência TACO/TBCA (por 100 g). Não é a tabela oficial completa.
        </p>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar alimento"
        aria-label="Buscar alimento"
        className="w-full px-3 py-2 rounded-xl text-sm dark:bg-zinc-800 bg-slate-50 border dark:border-zinc-700 border-slate-200 dark:text-white"
      />
      {loading && <p className="text-sm dark:text-zinc-400">Carregando…</p>}
      <section className={card}>
        {foods.length === 0 && !loading ? (
          <p className="text-sm dark:text-zinc-400">Nenhum alimento. Rode o seed demo.</p>
        ) : (
          <ul className="divide-y dark:divide-zinc-800">
            {foods.map((food) => (
              <li key={food.id} className="py-3 text-sm dark:text-white">
                <p className="font-medium">{food.name}</p>
                <p className="text-xs dark:text-zinc-400">
                  {food.calories} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g ·{' '}
                  {sourceLabel[food.source]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
