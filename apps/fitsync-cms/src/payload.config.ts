import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { StudentProfiles } from './collections/StudentProfiles'
import { ProfessionalLinks } from './collections/ProfessionalLinks'
import { Workouts } from './collections/Workouts'
import { MealPlans } from './collections/MealPlans'
import { AiGenerations } from './collections/AiGenerations'
import { Assessments } from './collections/Assessments'
import { Sessions } from './collections/Sessions'
import { Restrictions } from './collections/Restrictions'
import { Anamneses } from './collections/Anamneses'
import { WorkoutLogs } from './collections/WorkoutLogs'
import { Foods } from './collections/Foods'
import { Transactions } from './collections/Transactions'
import { assertRequiredEnv, env, hasSmtpConfig } from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

assertRequiredEnv()

const publicServerURL = env.publicServerUrl()
const frontendOrigin = env.frontendUrl()

function vercelOrigin(): string {
  const host = process.env.VERCEL_URL?.trim()
  if (!host) return ''
  return host.startsWith('http') ? host : `https://${host}`
}

const allowedOrigins = [frontendOrigin, publicServerURL, vercelOrigin()].filter(
  (value, index, list) => Boolean(value) && list.indexOf(value) === index,
)

function emailAdapter() {
  if (hasSmtpConfig()) {
    return nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@coachpass.app',
      defaultFromName: process.env.SMTP_FROM_NAME || 'CoachPass',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  }
  if (env.isProduction) {
    throw new Error('SMTP não configurado. Recuperação de senha não pode usar Ethereal em produção.')
  }
  return nodemailerAdapter()
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  cors: allowedOrigins,
  csrf: allowedOrigins,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    StudentProfiles,
    ProfessionalLinks,
    Workouts,
    MealPlans,
    AiGenerations,
    Assessments,
    Sessions,
    Restrictions,
    Anamneses,
    WorkoutLogs,
    Foods,
    Transactions,
  ],
  editor: lexicalEditor(),
  secret: env.payloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.databaseUrl(),
    },
    push: env.databasePush,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: emailAdapter(),
  graphQL: {
    disablePlaygroundInProduction: true,
  },
  sharp,
  plugins: [],
})
