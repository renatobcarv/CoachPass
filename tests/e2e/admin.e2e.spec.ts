import { test, expect } from '@playwright/test'
import { login } from '../helpers/login'

const masterEmail = process.env.MASTER_EMAIL || ''
const masterPassword = process.env.MASTER_PASSWORD || ''
const demoPassword = process.env.DEMO_PASSWORD || ''

test.describe('Admin só master', () => {
  test('aluno demo não entra no dashboard Payload', async ({ page }) => {
    test.skip(!demoPassword, 'DEMO_PASSWORD ausente')
    await page.goto('/admin/login')
    const email = page.locator('#field-email')
    if (await email.count()) {
      await email.fill('aluno@coachpass.app')
      await page.locator('#field-password').fill(demoPassword)
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(1500)
    }
    await expect(page.locator('span[title="Dashboard"]')).toHaveCount(0)
    await expect(page).not.toHaveURL(/\/admin\/collections\/users$/)
  })

  test('master entra no admin', async ({ page }) => {
    test.skip(!masterEmail || !masterPassword, 'MASTER_EMAIL/MASTER_PASSWORD ausentes')
    await login({
      page,
      user: { email: masterEmail, password: masterPassword },
    })
    await expect(page.locator('span[title="Dashboard"]').first()).toBeVisible()
  })
})
