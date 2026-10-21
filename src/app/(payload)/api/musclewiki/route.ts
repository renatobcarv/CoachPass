import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

/**
 * Proxy da API MuscleWiki (https://api.musclewiki.com).
 * A chave fica só no servidor (MUSCLEWIKI_API_KEY); o front chama esta rota autenticado.
 * Só operações de leitura liberadas abaixo; respostas em cache para poupar a cota mensal.
 */

export const dynamic = 'force-dynamic'

const BASE = 'https://api.musclewiki.com'
const DATA_TTL_MS = 12 * 60 * 60 * 1000
const MAX_LIMIT = 24

type CacheEntry = { exp: number; status: number; body: unknown }
const cache = new Map<string, CacheEntry>()
let mediaToken: { token: string; exp: number } | null = null

function apiKey() {
  return process.env.MUSCLEWIKI_API_KEY || ''
}

function lang() {
  return process.env.MUSCLEWIKI_LANG || 'pt-br'
}

function errorFor(status: number, body: unknown) {
  const message =
    body && typeof body === 'object' && 'message' in body ? String((body as { message: unknown }).message) : ''
  if (status === 403 && /basic tier|playground/i.test(message)) {
    return { code: 'MW_PLAN', error: 'A chave MuscleWiki está no plano BASIC (só Playground). É preciso o plano TESTING ou superior.' }
  }
  if (status === 429) return { code: 'MW_QUOTA', error: 'Cota mensal da MuscleWiki esgotada. Tente novamente mais tarde.' }
  if (status === 401 || status === 403) return { code: 'MW_AUTH', error: 'Chave MuscleWiki inválida ou sem permissão.' }
  if (status === 404) return { code: 'MW_NOT_FOUND', error: 'Exercício não encontrado na MuscleWiki.' }
  return { code: 'MW_ERROR', error: 'Falha ao consultar a MuscleWiki.' }
}

async function mwGet(path: string, params: Record<string, string | undefined>) {
  const build = (language: string) => {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (!v) continue
      // "muscles" aceita lista na API: "Quads,Glutes" → muscles=Quads&muscles=Glutes
      if (k === 'muscles') v.split(',').map((m) => m.trim()).filter(Boolean).forEach((m) => qs.append(k, m))
      else qs.set(k, v)
    }
    qs.set('lang', language)
    return `${BASE}${path}?${qs.toString()}`
  }

  const url = build(lang())
  const hit = cache.get(url)
  if (hit && hit.exp > Date.now()) return hit

  const call = async (target: string) => {
    const res = await fetch(target, { headers: { 'X-API-Key': apiKey(), Accept: 'application/json' }, cache: 'no-store' })
    const body = await res.json().catch(() => ({}))
    return { status: res.status, body }
  }

  let result = await call(url)
  // Idioma fora do plano (pt-br exige GROWTH): repete em inglês para não deixar a tela vazia
  const msg = JSON.stringify(result.body)
  if (result.status === 403 && /lang|language|growth/i.test(msg) && !/basic tier/i.test(msg) && lang() !== 'en-us') {
    result = await call(build('en-us'))
  }

  const entry = { exp: Date.now() + (result.status === 200 ? DATA_TTL_MS : 60_000), ...result }
  cache.set(url, entry)
  return entry
}

async function getMediaToken() {
  if (mediaToken && mediaToken.exp > Date.now() + 30_000) return { status: 200, body: { token: mediaToken.token } }
  const res = await fetch(`${BASE}/media/token`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey(), Accept: 'application/json' },
    cache: 'no-store',
  })
  const body = (await res.json().catch(() => ({}))) as { token?: string; expires_in?: number }
  if (res.ok && body.token) {
    mediaToken = { token: body.token, exp: Date.now() + (body.expires_in || 900) * 1000 }
  }
  return { status: res.status, body }
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  if (!apiKey()) {
    return NextResponse.json({ code: 'MW_NOKEY', error: 'MUSCLEWIKI_API_KEY não configurada no servidor.' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const op = searchParams.get('op')
  const str = (k: string) => searchParams.get(k)?.trim() || undefined
  const limit = String(Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get('limit')) || 12)))

  let result: { status: number; body: unknown }
  switch (op) {
    case 'search': {
      // Texto livre (nome ou instruções) → /search, que já devolve dados completos
      const q = str('q')
      if (!q || q.length < 2) return NextResponse.json({ error: 'Busca precisa de 2+ caracteres' }, { status: 400 })
      result = await mwGet('/search', {
        q,
        limit,
        muscles: str('muscles'),
        category: str('category'),
        difficulty: str('difficulty'),
      })
      break
    }
    case 'list': {
      // Navegação por filtros → /exercises (id + nome; detalhes vêm ao abrir o exercício)
      result = await mwGet('/exercises', {
        limit,
        offset: str('offset'),
        muscles: str('muscles'),
        category: str('category'),
        difficulty: str('difficulty'),
      })
      break
    }
    case 'exercise': {
      const id = searchParams.get('id')
      if (!id || !/^\d+$/.test(id)) return NextResponse.json({ error: 'id inválido' }, { status: 400 })
      result = await mwGet(`/exercises/${id}`, { detail: 'true', gender: str('gender') })
      break
    }
    case 'muscles':
      result = await mwGet('/muscles', {})
      break
    case 'categories':
      result = await mwGet('/categories', {})
      break
    case 'token':
      result = await getMediaToken()
      break
    default:
      return NextResponse.json({ error: 'Operação não suportada' }, { status: 400 })
  }

  if (result.status !== 200) {
    const err = errorFor(result.status, result.body)
    return NextResponse.json(err, { status: result.status === 429 ? 429 : 503 })
  }
  return NextResponse.json(result.body, {
    headers: { 'Cache-Control': op === 'token' ? 'no-store' : 'private, max-age=3600' },
  })
}
