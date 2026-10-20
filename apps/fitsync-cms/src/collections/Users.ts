import type { CollectionConfig, PayloadRequest } from 'payload'
import { ValidationError } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { isSuperUser } from '../access/isSuper'
import { getPasswordErrors, type PasswordContext } from '../lib/passwordPolicy'

const PASSWORD_OPERATIONS = new Set(['create', 'update', 'resetPassword'])

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

function adminServerURL(req: PayloadRequest): string {
  const config = req.payload.config
  if (config.serverURL && config.serverURL !== '') {
    return config.serverURL
  }
  const forwarded = req.headers.get('x-forwarded-proto')
  const host = req.headers.get('host') ?? 'localhost:3000'
  if (forwarded) {
    return `${forwarded}://${host}`
  }
  return `http://${host}`
}

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
      generateEmailSubject: () => 'FitSync — Redefinir senha do painel',
      generateEmailHTML: (args) => {
        const { req, token, user } = args ?? {}
        if (!req || !token || !user?.email) {
          return ''
        }
        const config = req.payload.config
        const serverURL = adminServerURL(req)
        const resetURL = formatAdminURL({
          adminRoute: config.routes.admin,
          path: `${config.admin.routes.reset}/${token}`,
          serverURL,
        })
        return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>Olá,</p>
    <p>Recebemos um pedido para redefinir a senha da conta <strong>${user.email}</strong> no painel administrativo FitSync.</p>
    <p><a href="${resetURL}" style="color: #2563eb;">Definir nova senha</a></p>
    <p style="color: #666; font-size: 14px;">Se você não solicitou isso, pode ignorar este e-mail.</p>
    <p style="color: #999; font-size: 12px; word-break: break-all;">${resetURL}</p>
  </body>
</html>`
      },
    },
  },
  access: {
    // Cadastro público precisa funcionar mesmo com cookie/sessão residual no navegador.
    // Elevação a master/super continua bloqueada no beforeValidate.
    create: () => true,
    read: ({ req }) => {
      if (isSuperUser(req)) return true
      if (!req.user) return false
      // Autenticado só lê a própria conta (vínculos usam collections dedicadas).
      return { id: { equals: req.user.id } }
    },
    update: ({ req, id }) =>
      isSuperUser(req) || Boolean(req.user && String(req.user.id) === String(id)),
    delete: ({ req }) => isSuperUser(req),
  },
  hooks: {
    // Cobre cadastro, PATCH de senha e /reset-password (que não passa pela validação de campos).
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
        return args
      },
    ],
    beforeValidate: [
      ({ data, operation, req, collection }) => {
        const bypass =
          req.context?.allowMasterCreate === true || req.context?.seedMaster === true
        if (!data || bypass || isSuperUser(req)) return data

        if (operation === 'create') {
          if (data.role === 'master' || data.isSuperAdmin === true) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [
                {
                  path: 'role',
                  message: 'Conta master não pode ser criada pelo cadastro público.',
                },
              ],
            })
          }
          data.isSuperAdmin = false
          if (data.role && !['student', 'personal', 'nutritionist'].includes(String(data.role))) {
            data.role = 'student'
          }
        }

        // No update, usuário comum não sobe para master/super; pode só ajustar personal/nutritionist/student.
        if (operation === 'update') {
          if (data.role === 'master' || data.isSuperAdmin === true) {
            throw new ValidationError({
              collection: collection?.slug,
              errors: [
                {
                  path: 'role',
                  message: 'Não é permitido elevar a conta a master por aqui.',
                },
              ],
            })
          }
          if (data.role && !['student', 'personal', 'nutritionist'].includes(String(data.role))) {
            delete data.role
          }
          if ('isSuperAdmin' in data) {
            delete data.isSuperAdmin
          }
        }

        return data
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
  ],
}
