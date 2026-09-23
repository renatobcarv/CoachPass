import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

export const dynamic = 'force-dynamic'

type AuthUser = {
  id: string | number
  role?: string
  isSuperAdmin?: boolean
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const authUser = user as AuthUser
  const role = authUser.role
  if (role !== 'personal' && role !== 'nutritionist' && !authUser.isSuperAdmin) {
    return NextResponse.json(
      { error: 'Apenas personal ou nutricionista podem convidar alunos.' },
      { status: 403 },
    )
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
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
  if (!student) {
    return NextResponse.json(
      {
        error:
          'Nenhum aluno com este e-mail. O aluno precisa criar uma conta CoachPass antes do convite.',
        code: 'STUDENT_NOT_FOUND',
      },
      { status: 404 },
    )
  }

  if (String(student.id) === String(authUser.id)) {
    return NextResponse.json({ error: 'Você não pode vincular a si mesmo.' }, { status: 400 })
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
    const link = existing.docs[0]
    return NextResponse.json({
      ok: true,
      alreadyLinked: true,
      link,
      student: {
        id: student.id,
        name: (student as { name?: string }).name || email,
        email: (student as { email?: string }).email || email,
      },
    })
  }

  const link = await payload.create({
    collection: 'professional-links',
    data: {
      student: student.id,
      professional: authUser.id,
      professionalRole,
      status: 'pending',
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    alreadyLinked: false,
    link,
    student: {
      id: student.id,
      name: (student as { name?: string }).name || email,
      email: (student as { email?: string }).email || email,
    },
  })
}
