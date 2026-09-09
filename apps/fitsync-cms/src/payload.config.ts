import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const publicServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
const frontendOrigin = process.env.FITSYNC_FRONTEND_URL || publicServerURL

function emailAdapter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (host && user && pass) {
    return nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM_EMAIL || user,
      defaultFromName: process.env.SMTP_FROM_NAME || 'FitSync',
      transportOptions: {
        host,
        port: Number(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      },
    })
  }
  return nodemailerAdapter()
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  cors: [frontendOrigin, publicServerURL].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i),
  csrf: [frontendOrigin, publicServerURL].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email: emailAdapter(),
  sharp,
  plugins: [],
})
