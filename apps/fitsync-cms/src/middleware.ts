import { NextResponse, type NextRequest } from 'next/server'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function middleware(request: NextRequest) {
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
