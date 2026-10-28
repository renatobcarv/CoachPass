import { test, expect, type Page } from '@playwright/test'

const demoPassword = process.env.DEMO_PASSWORD || ''

async function spaLogin(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.locator('form button[type="submit"]').click()
}

test.describe('SPA CoachPass', () => {
  test('home mostra CoachPass e atalho de login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CoachPass/)
    await expect(page.getByText('CoachPass').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entrar' }).first()).toBeVisible()
  })

  test('cadastro usa copy real, sem jargão de protótipo', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.getByText('Acesso Estudante')).toBeVisible()
    await page.getByRole('button', { name: /Acesso Estudante/i }).click()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Nome Completo')).toBeVisible()
    await expect(page.getByText('Correio Eletrônico')).toHaveCount(0)
    await expect(page.getByText('Identificação formal')).toHaveCount(0)
  })

  test('login e recuperação de senha estão visíveis', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Esqueci a senha' })).toBeVisible()
  })

  test('reset abre /redefinir-senha/:token', async ({ page }) => {
    await page.goto('/redefinir-senha/token-homolog')
    await expect(page.getByRole('heading', { name: 'Nova senha' })).toBeVisible()
    await expect(page.locator('#reset-password')).toBeVisible()
  })
})

test.describe('Fluxos demo aluno / personal / nutri', () => {
  test.skip(!demoPassword, 'DEMO_PASSWORD ausente')

  test('aluno entra e não acessa o admin', async ({ page }) => {
    await spaLogin(page, 'aluno@coachpass.app', demoPassword)
    await expect(page).toHaveURL(/\/app/)
    await page.goto('/admin')
    await expect(page.locator('span[title="Dashboard"]')).toHaveCount(0)
  })

  test('personal entra no painel', async ({ page }) => {
    await spaLogin(page, 'personal@coachpass.app', demoPassword)
    await expect(page).toHaveURL(/\/personal/)
    await expect(page.getByText(/aluno|treino|personal/i).first()).toBeVisible()
  })

  test('nutri entra no painel', async ({ page }) => {
    await spaLogin(page, 'nutri@coachpass.app', demoPassword)
    await expect(page).toHaveURL(/\/nutritionist/)
  })
})

test.describe('Mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('home e login cabem no mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('CoachPass').first()).toBeVisible()
    await page.goto('/login')
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    const emailBox = await page.locator('#login-email').boundingBox()
    expect(emailBox).toBeTruthy()
    expect(emailBox!.width).toBeLessThan(360)
  })

  test('cadastro no mobile não usa copy de protótipo', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByRole('button', { name: /Acesso Estudante/i }).click()
    await expect(page.getByLabel('E-mail')).toBeVisible()
  })
})
