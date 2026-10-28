import { NextResponse, type NextRequest } from 'next/server'

import { clientIp, consumeRateLimit } from './lib/rateLimit'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

const RATE_LIMITS: Array<{ match: (pathname: string, method: string) => boolean; limit: number; name: string }> = [
  {
    name: 'login',
    limit: 10,
    match: (pathname, method) => method === 'POST' && pathname === '/api/users/login',
  },
  {
    name: 'forgot',
    limit: 5,
    match: (pathname, method) => method === 'POST' && pathname === '/api/users/forgot-password',
  },
  {
    name: 'invite',
    limit: 10,
    match: (pathname, method) => method === 'POST' && pathname === '/api/professional-links/invite',
  },
  {
    name: 'ai',
    limit: 20,
    match: (pathname, method) => method === 'POST' && pathname.startsWith('/api/ai/'),
  },
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()
  const ip = clientIp(request.headers)

  for (const rule of RATE_LIMITS) {
    if (!rule.match(pathname, method)) continue
    const result = consumeRateLimit(`${rule.name}:${ip}`, rule.limit)
    if (!result.ok) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um minuto e tente de novo.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfterSec) },
        },
      )
    }
  }

  if (process.env.NODE_ENV !== 'production') return NextResponse.next()

  const hostname = request.nextUrl.hostname
  if (LOCAL_HOSTS.has(hostname)) return NextResponse.next()

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const protocol = forwardedProto || request.nextUrl.protocol.replace(':', '')
  if (protocol === 'http') {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.port = ''
    return NextResponse.redirect(url, 308)
  }

  const response = NextResponse.next()
  response.headers.set('Strict-Transport-Security', 'max-age=31536000')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
