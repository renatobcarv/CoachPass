import type { CollectionConfig, PayloadRequest } from 'payload'
import { formatAdminURL } from 'payload/shared'

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
    // Permite cadastro pelo app FitSync (sem sessão). Leitura/edição seguem o padrão do Payload (usuário logado).
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: false,
      label: 'Nome completo',
    },
    {
      name: 'role',
      type: 'select',
      required: false,
      defaultValue: 'student',
      options: [
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
        { label: 'Mensal', value: 'monthly' },
        { label: 'Semestral', value: 'semester' },
        { label: 'Anual', value: 'annual' },
      ],
    },
  ],
}
