const PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * Na Vercel, sem PAYLOAD_PUBLIC_SERVER_URL definido, usa o domínio do deploy:
 * produção → domínio do projeto; preview → URL do deploy. Assim todo o app (CORS, links de e-mail,
 * volta do pagamento) enxerga o mesmo endereço.
 */
if (!process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim()) {
  const host =
    process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL
  if (host) process.env.PAYLOAD_PUBLIC_SERVER_URL = `https://${host}`
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} é obrigatório. Defina no .env antes de iniciar o CoachPass.`)
  }
  return value
}

export function hasSmtpConfig(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

/** Homologação sem e-mail: os e-mails só vão para o log. Nunca use em produção com usuários reais. */
export function smtpOptional(): boolean {
  return process.env.ALLOW_MISSING_SMTP === 'true'
}

export function assertRequiredEnv(): void {
  required('PAYLOAD_SECRET')
  required('DATABASE_URL')
  if (PRODUCTION) {
    required('PAYLOAD_PUBLIC_SERVER_URL')
    if (!hasSmtpConfig() && !smtpOptional()) {
      throw new Error(
        'SMTP_HOST, SMTP_USER e SMTP_PASS são obrigatórios em produção. O fallback Ethereal está desligado.',
      )
    }
  }
}

export const env = {
  isProduction: PRODUCTION,
  payloadSecret: () => required('PAYLOAD_SECRET'),
  databaseUrl: () => required('DATABASE_URL'),
  publicServerUrl: () => process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  frontendUrl: () => process.env.FITSYNC_FRONTEND_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  databasePush: process.env.PAYLOAD_DATABASE_PUSH !== 'false',
}
