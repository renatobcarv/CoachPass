import type { CollectionConfig, PayloadRequest, Where } from 'payload'
import { ValidationError } from 'payload'

import { linkedStudentIds } from '../access/links'
import { isSuperUser } from '../access/isSuper'
import { userId, userRole } from '../access/roles'
import { getPasswordErrors, type PasswordContext } from '../lib/passwordPolicy'

const PASSWORD_OPERATIONS = new Set(['create', 'update', 'resetPassword'])
const SELF_SERVICE_ROLES = new Set(['student', 'personal', 'nutritionist'])
const PROFESSIONAL_ROLES = new Set(['personal', 'nutritionist'])

async function passwordContextFor(
  operation: string,
  args: { data?: Record<string, unknown>; id?: number | string },
  req: PayloadRequest,
): Promise<PasswordContext> {
  const data = args.data ?? {}
  const context: PasswordContext = {
    name: typeof data.name === 'string' ? data.name : undefined,
    email: typeof data.email === 'string' ? data.email : undefined,
  }
  if (context.name && context.email) return context

  let existing: { name?: string | null; email?: string | null } | null = null
  try {
    if (operation === 'update' && args.id !== undefined) {
      existing = await req.payload.findByID({
        collection: 'users',
        id: args.id,
        depth: 0,
        overrideAccess: true,
        req,
      })
    } else if (operation === 'resetPassword' && typeof data.token === 'string') {
      existing = (await req.payload.db.findOne({
        collection: 'users',
        where: { resetPasswordToken: { equals: data.token } },
        req,
      })) as typeof existing
    }
  } catch {
    existing = null
  }

  return {
    name: context.name ?? existing?.name ?? undefined,
    email: context.email ?? existing?.email ?? undefined,
  }
}

function frontendURL(req: PayloadRequest): string {
  const fromEnv = process.env.FITSYNC_FRONTEND_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const forwarded = req.headers.get('x-forwarded-proto')
  const host = req.headers.get('host') ?? 'localhost:3000'
  if (forwarded) return `${forwarded}://${host}`
  return `http://${host}`
}

async function readUsersAccess({ req }: { req: PayloadRequest }): Promise<boolean | Where> {
  if (isSuperUser(req)) return true
  const id = userId(req)
  if (!id) return false
  const role = userRole(req)
  if (role === 'personal' || role === 'nutritionist') {
    const studentIds = await linkedStudentIds(req, { status: 'active' })
    return {
      or: [{ id: { equals: id } }, ...(studentIds.length ? [{ id: { in: studentIds } }] : [])],
    }
  }
  return { id: { equals: id } }
}

const USER_DEPENDENTS = [
  { collection: 'ai-generations' as const, field: 'user' },
  { collection: 'student-profiles' as const, field: 'user' },
  { collection: 'professional-links' as const, field: 'student' },
  { collection: 'professional-links' as const, field: 'professional' },
  { collection: 'workouts' as const, field: 'student' },
  { collection: 'workouts' as const, field: 'author' },
  { collection: 'meal-plans' as const, field: 'student' },
  { collection: 'meal-plans' as const, field: 'author' },
  { collection: 'assessments' as const, field: 'student' },
  { collection: 'assessments' as const, field: 'professional' },
  { collection: 'sessions' as const, field: 'student' },
  { collection: 'sessions' as const, field: 'professional' },
  { collection: 'restrictions' as const, field: 'student' },
  { collection: 'restrictions' as const, field: 'professional' },
  { collection: 'anamneses' as const, field: 'student' },
  { collection: 'anamneses' as const, field: 'professional' },
  { collection: 'media' as const, field: 'owner' },
]

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    forgotPassword: {
      generateEmailSubject: () => 'CoachPass — Redefinir senha',
      generateEmailHTML: (args) => {
        const { req, token, user } = args ?? {}
        if (!req || !token || !user?.email) return ''
        const resetURL = `${frontendURL(req)}/redefinir-senha/${token}`
        return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>Olá,</p>
    <p>Recebemos um pedido para redefinir a senha da conta <strong>${user.email}</strong> no CoachPass.</p>
    <p><a href="${resetURL}" style="color: #1e3a5f;">Definir nova senha</a></p>
    <p style="color: #666; font-size: 14px;">Se você não solicitou isso, pode ignorar este e-mail.</p>
    <p style="color: #999; font-size: 12px; word-break: break-all;">${resetURL}</p>
  </body>
</html>`
      },
    },
  },
  access: {
    admin: ({ req }) => isSuperUser(req),
    create: () => true,
    read: readUsersAccess,
    update: ({ req, id }) =>
      isSuperUser(req) || Boolean(req.user && String(req.user.id) === String(id)),
    delete: ({ req, id }) =>
      isSuperUser(req) || Boolean(req.user && String(req.user.id) === String(id)),
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation, req, collection }) => {
        if (!PASSWORD_OPERATIONS.has(operation)) return args
        const target = args as { data?: Record<string, unknown>; id?: number | string }
        const password = target.data?.password
        if (password === undefined || password === null) return args

        const errors =
          typeof password === 'string'
            ? getPasswordErrors(password, await passwordContextFor(operation, target, req))
            : ['Senha inválida.']
        if (errors.length > 0) {
          throw new ValidationError({
            collection: collection?.slug,
            errors: errors.map((message) => ({ path: 'password', message })),
          })
        }
        if (target.data) target.data.passwordChangedAt = new Date().toISOString()
        return args
      },
    ],
    beforeValidate: [
      async ({ data, operation, req, collection, originalDoc }) => {
        const bypass =
          req.context?.allowMasterCreate === true || req.context?.seedMaster === true
        if (!data || bypass || isSuperUser(req)) return data

        if (operation === 'create') {
          if (data.role === 'master' || data.isSuperAdmin === true) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'role', message: 'Conta master não pode ser criada pelo cadastro público.' }],
            })
          }
          data.isSuperAdmin = false
          if (data.role && !SELF_SERVICE_ROLES.has(String(data.role))) {
            data.role = 'student'
          }
        }

        if (operation === 'update') {
          if (data.role === 'master' || data.isSuperAdmin === true) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [{ path: 'role', message: 'Não é permitido elevar a conta a master por aqui.' }],
            })
          }
          if ('isSuperAdmin' in data) delete data.isSuperAdmin

          if (data.role) {
            const currentRole = String(originalDoc?.role || userRole(req) || 'student')
            const nextRole = String(data.role)
            if (!SELF_SERVICE_ROLES.has(nextRole)) {
              delete data.role
            } else if (currentRole === 'student' && PROFESSIONAL_ROLES.has(nextRole)) {
              throw new ValidationError({
                collection: collection?.slug,
                errors: [
                  {
                    path: 'role',
                    message: 'Aluno não pode se tornar profissional por aqui. Crie a conta como profissional.',
                  },
                ],
              })
            }
          }
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const actorId = userId(req)
        if (!isSuperUser(req) && String(actorId) !== String(id)) {
          throw new ValidationError({
            errors: [{ path: 'id', message: 'Você só pode excluir a própria conta.' }],
          })
        }
      },
    ],
    afterDelete: [
      async ({ req, id, context }) => {
        if (context?.skipUserCascade) return
        for (const { collection, field } of USER_DEPENDENTS) {
          try {
            const related = await req.payload.find({
              collection,
              where: { [field]: { equals: id } },
              limit: 200,
              depth: 0,
              overrideAccess: true,
              req,
            })
            for (const doc of related.docs) {
              await req.payload.delete({
                collection,
                id: doc.id,
                overrideAccess: true,
                req,
                context: { skipUserCascade: true },
              })
            }
          } catch {
            // Collection pode ainda não existir em ambientes antigos.
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
      label: 'Nome completo',
    },
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      label: 'Super administrador (acesso total Payload + app)',
      defaultValue: false,
      admin: {
        description: 'Concede o mesmo poder do papel Master no CMS e libera todos os painéis no app.',
        position: 'sidebar',
      },
      saveToJWT: true,
    },
    {
      name: 'role',
      type: 'select',
      required: false,
      defaultValue: 'student',
      options: [
        { label: 'Super admin (master)', value: 'master' },
        { label: 'Aluno', value: 'student' },
        { label: 'Personal trainer', value: 'personal' },
        { label: 'Nutricionista', value: 'nutritionist' },
      ],
      saveToJWT: true,
    },
    {
      name: 'whatsapp',
      type: 'text',
      required: false,
    },
    {
      name: 'professionalId',
      type: 'text',
      label: 'CREF / CRN',
      required: false,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: false,
    },
    {
      name: 'specialties',
      type: 'array',
      required: false,
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'avatarUrl',
      type: 'text',
      required: false,
    },
    {
      name: 'city',
      type: 'text',
      required: false,
    },
    {
      name: 'instagram',
      type: 'text',
      required: false,
    },
    {
      name: 'plan',
      type: 'select',
      required: false,
      options: [
        { label: 'Gratuito', value: 'free' },
        { label: 'Mensal', value: 'monthly' },
        { label: 'Semestral', value: 'semester' },
        { label: 'Anual', value: 'annual' },
      ],
      defaultValue: 'free',
    },
    {
      name: 'consentAcceptedAt',
      type: 'date',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'consentVersion',
      type: 'text',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'healthDataConsentAt',
      type: 'date',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'passwordChangedAt',
      type: 'date',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'preferences',
      type: 'json',
      required: false,
    },
  ],
}
