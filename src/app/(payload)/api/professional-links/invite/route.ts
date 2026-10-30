import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'

const GENERIC_INVITE =
  'Se o e-mail pertencer a um aluno CoachPass, ele receberá o convite.'

type AuthUser = {
  id: User['id']
  role?: string
  isSuperAdmin?: boolean
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const authUser = user as AuthUser
  const role = authUser.role
  if (role !== 'personal' && role !== 'nutritionist' && !authUser.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Apenas personal ou nutricionista podem convidar alunos.', code: 'FORBIDDEN' },
      { status: 403 },
    )
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido', code: 'INVALID_JSON' }, { status: 400 })
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Informe um e-mail válido.', code: 'INVALID_EMAIL' }, { status: 400 })
  }

  const professionalRole: 'personal' | 'nutritionist' =
    role === 'nutritionist' ? 'nutritionist' : 'personal'

  const students = await payload.find({
    collection: 'users',
    where: {
      and: [{ email: { equals: email } }, { role: { equals: 'student' } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const student = students.docs[0]
  if (!student || String(student.id) === String(authUser.id)) {
    return NextResponse.json({ ok: true, queued: true, message: GENERIC_INVITE })
  }

  const existing = await payload.find({
    collection: 'professional-links',
    where: {
      and: [
        { student: { equals: student.id } },
        { professional: { equals: authUser.id } },
        { professionalRole: { equals: professionalRole } },
        { status: { in: ['pending', 'active'] } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return NextResponse.json({
      ok: true,
      alreadyLinked: true,
      message: GENERIC_INVITE,
    })
  }

  await payload.create({
    collection: 'professional-links',
    data: {
      student: student.id,
      professional: authUser.id,
      professionalRole,
      status: 'pending',
    },
    overrideAccess: true,
  })

  const appUrl = (
    process.env.FITSYNC_FRONTEND_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
  const roleLabel = professionalRole === 'nutritionist' ? 'nutricionista' : 'personal trainer'
  const professionalName = String((user as { name?: string }).name || roleLabel)
  try {
    await payload.sendEmail({
      to: email,
      subject: 'CoachPass — convite de vínculo',
      html: `<p>Olá,</p><p>${professionalName} convidou você como ${roleLabel} no CoachPass.</p><p><a href="${appUrl}/login">Entrar e aceitar o convite</a></p>`,
    })
  } catch {
    /* o vínculo já existe; Ethereal/SMTP ausente não deve enumerar o aluno */
  }

  return NextResponse.json({
    ok: true,
    alreadyLinked: false,
    message: GENERIC_INVITE,
  })
}
