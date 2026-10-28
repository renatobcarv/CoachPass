/**
 * Mantido por compatibilidade. Prefira `npm run seed:demo`.
 */
import 'dotenv/config'

if (!process.env.DEMO_PASSWORD) {
  console.error('[ensureDemoUsers] Defina DEMO_PASSWORD e rode npm run seed:demo')
  process.exit(1)
}

await import('./seedDemo.js')
