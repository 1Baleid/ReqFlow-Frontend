import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Login routing and session behavior', () => {
  test('redirects unauthenticated users from protected routes to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects authenticated manager away from login page', async ({ page }) => {
    await page.addInitScript(({ email, role }) => {
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userRole', role)
    }, { email: 'khalid@kfupm.edu.sa', role: 'manager' })

    await page.goto(`${BASE_URL}/login`)
    await expect(page).toHaveURL(/\/manager$/)
  })

  test('logout clears session and returns user to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email address').fill('abdullah@kfupm.edu.sa')
    await page.locator('#password').fill('abdullah123')
    await page.locator('button.login__submit').click()

    await expect(page).toHaveURL(/\/dashboard$/)

    await page.locator('button.sidebar__logout').click()
    await expect(page).toHaveURL(/\/login$/)
    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page).toHaveURL(/\/login$/)
  })
})
