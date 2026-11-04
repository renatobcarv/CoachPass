import React, { useEffect, useState } from 'react'
import { Apple, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { FOODS_API, getJson, postJson, qs } from '@/lib/cms'
import type { FoodDoc } from '../../lib/studentApi'
import { CTAButton } from '../brand/Brand'
import { Badge, Card, EmptyState, Page, PageHeader, SectionTitle, Skeleton } from '../student/ui'
import { Segmented } from '../pro/ui'
import { Field, errorText, fmtNum, num } from '../pro/records'

const CATEGORIES: { value: FoodDoc['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'protein', label: 'Proteínas' },
  { value: 'carb', label: 'Carboidratos' },
  { value: 'fat', label: 'Gorduras' },
  { value: 'vegetable', label: 'Vegetais' },
  { value: 'fruit', label: 'Frutas' },
  { value: 'dairy', label: 'Laticínios' },
]
const SOURCE: Record<FoodDoc['source'], string> = { taco: 'TACO', tbca: 'TBCA', usda: 'USDA', manufacturer: 'Fabricante', manual: 'Cadastro próprio' }
const PAGE = 40
const EMPTY = { name: '', category: 'protein' as FoodDoc['category'], calories: '', protein: '', carbs: '', fat: '', fiber: '', portionLabel: '100g' }

/** Base de alimentos usada nos planos alimentares (valores por porção, em geral 100 g). */
export function NutritionistAlimentos() {
  const { user } = useAuth()
  const token = user?.accessToken
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<FoodDoc['category'] | 'all'>('all')
  const [foods, setFoods] = useState<FoodDoc[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!token) return
    let alive = true
    const t = window.setTimeout(async () => {
      const params: Record<string, string | number> = { limit: PAGE, page, sort: 'name', depth: 0 }
      let i = 0
      if (search.trim()) params[`where[and][${i++}][name][like]`] = search.trim()
      if (category !== 'all') params[`where[and][${i++}][category][equals]`] = category
      try {
        const res = await getJson<{ docs: FoodDoc[]; totalDocs: number }>(`${FOODS_API}${qs(params)}`, token)
        if (!alive) return
        setTotal(res.totalDocs)
        setFoods((prev) => (page === 1 ? res.docs : [...(prev ?? []), ...res.docs]))
      } catch (err) {
        if (alive) {
          setFoods([])
          toast.error(errorText(err, 'Não foi possível carregar os alimentos.'))
        }
      }
    }, 250)
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [token, search, category, page, reloadKey])

  const reset = (fn: () => void) => {
    fn()
    setPage(1)
    setFoods(null)
  }

  const save = async () => {
    if (!token) return
    const values = { calories: num(form.calories), protein: num(form.protein), carbs: num(form.carbs), fat: num(form.fat) }
    if (!form.name.trim()) return toast.error('Informe o nome do alimento.')
    if (Object.values(values).some((v) => v === undefined)) return toast.error('Preencha calorias, proteína, carboidrato e gordura.')
    setSaving(true)
    try {
      await postJson(
        FOODS_API,
        { name: form.name.trim(), category: form.category, ...values, fiber: num(form.fiber), unit: 'g', portionLabel: form.portionLabel.trim() || '100g', source: 'manual' },
        token,
      )
      toast.success('Alimento cadastrado.')
      setForm(EMPTY)
      setOpen(false)
      reset(() => setReloadKey((k) => k + 1))
    } catch (err) {
      toast.error(errorText(err, 'Não foi possível cadastrar.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page wide>
      <PageHeader
        kicker="Base de alimentos"
        title="Composição"
        accent="por porção."
        lead="Tabela usada para montar os planos alimentares. Cadastre alimentos que faltarem, como produtos industrializados."
        action={
          <CTAButton type="button" onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" /> Novo alimento
          </CTAButton>
        }
      />

      {open && (
        <Card className="mb-6 p-5 sm:p-6">
          <SectionTitle icon={Apple}>Cadastrar alimento</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Nome" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} className="sm:col-span-2" />
            <Field label="Porção" value={form.portionLabel} onChange={(v) => setForm((f) => ({ ...f, portionLabel: v }))} />
            <div>
              <p className="cp-mono mb-2 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Grupo</p>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FoodDoc['category'] }))} className="cp-field !h-12 !pl-4">
                {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Calorias" unit="kcal" type="number" value={form.calories} onChange={(v) => setForm((f) => ({ ...f, calories: v }))} />
            <Field label="Proteína" unit="g" type="number" value={form.protein} onChange={(v) => setForm((f) => ({ ...f, protein: v }))} />
            <Field label="Carboidrato" unit="g" type="number" value={form.carbs} onChange={(v) => setForm((f) => ({ ...f, carbs: v }))} />
            <Field label="Gordura" unit="g" type="number" value={form.fat} onChange={(v) => setForm((f) => ({ ...f, fat: v }))} />
            <Field label="Fibra" unit="g" type="number" value={form.fiber} onChange={(v) => setForm((f) => ({ ...f, fiber: v }))} />
          </div>
          <div className="mt-5 flex gap-3">
            <CTAButton type="button" onClick={() => void save()} disabled={saving}>
              {saving ? 'Salvando…' : 'Cadastrar'}
            </CTAButton>
            <button type="button" onClick={() => setOpen(false)} className="cp-btn-ghost">
              Cancelar
            </button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[360px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dim)]" />
          <input value={search} onChange={(e) => reset(() => setSearch(e.target.value))} placeholder="Buscar alimento" className="cp-field h-11" />
        </div>
        <Segmented size="sm" layoutId="food-cat" value={category} onChange={(v) => reset(() => setCategory(v))} options={CATEGORIES} />
      </div>
      <p className="mt-3 text-[13px] text-[var(--dim)]">{foods ? `${total} alimento(s)` : 'Carregando…'}</p>

      <div className="mt-4">
        {foods === null ? (
          <Skeleton className="h-72" />
        ) : foods.length === 0 ? (
          <EmptyState icon={Apple} title="Nada encontrado">
            Tente outro nome ou cadastre o alimento.
          </EmptyState>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="cp-mono border-b border-[var(--line)] text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  <th className="px-5 py-3 font-medium">Alimento</th>
                  <th className="px-3 py-3 font-medium">Porção</th>
                  <th className="px-3 py-3 text-right font-medium">kcal</th>
                  <th className="px-3 py-3 text-right font-medium">Prot.</th>
                  <th className="px-3 py-3 text-right font-medium">Carb.</th>
                  <th className="px-3 py-3 text-right font-medium">Gord.</th>
                  <th className="px-5 py-3 font-medium">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f) => (
                  <tr key={f.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-5 py-3 font-medium">{f.name}</td>
                    <td className="px-3 py-3 text-[var(--muted)]">{f.portionLabel || `100${f.unit}`}</td>
                    <td className="px-3 py-3 text-right">{fmtNum(f.calories, 0)}</td>
                    <td className="px-3 py-3 text-right">{fmtNum(f.protein)} g</td>
                    <td className="px-3 py-3 text-right">{fmtNum(f.carbs)} g</td>
                    <td className="px-3 py-3 text-right">{fmtNum(f.fat)} g</td>
                    <td className="px-5 py-3">
                      <Badge tone={f.source === 'manual' ? 'amber' : 'neutral'}>{SOURCE[f.source] ?? f.source}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        {foods && foods.length < total && (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setPage((p) => p + 1)} className="cp-btn-ghost">
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </Page>
  )
}
