import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true, service: 'coachpass', db: 'up' })
  } catch {
    return NextResponse.json({ ok: false, service: 'coachpass', db: 'down' }, { status: 503 })
  }
}
