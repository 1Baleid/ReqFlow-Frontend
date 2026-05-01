import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Login sad path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
  })

  test('shows required errors when both fields are empty', async ({ page }) => {
    await page.locator('button.login__submit').click()

    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('shows invalid email format error', async ({ page }) => {
    await page.getByLabel('Email address').fill('user@domain')
    await page.locator('#password').fill('somePassword123')
    await page.locator('button.login__submit').click()

    await expect(page.getByText('Invalid email format')).toBeVisible()
  })

  test('shows generic error for wrong password and keeps session empty', async ({ page }) => {
    await page.getByLabel('Email address').fill('abdullah@kfupm.edu.sa')
    await page.locator('#password').fill('wrong-password')
    await page.locator('button.login__submit').click()

    await expect(page.getByText('Invalid email or password')).toBeVisible()

    const session = await page.evaluate(() => ({
      userEmail: localStorage.getItem('userEmail'),
      userRole: localStorage.getItem('userRole')
    }))

    expect(session.userEmail).toBeNull()
    expect(session.userRole).toBeNull()
  })

  test('shows generic error for unknown email and keeps session empty', async ({ page }) => {
    await page.getByLabel('Email address').fill('unknown@example.com')
    await page.locator('#password').fill('somePassword123')
    await page.locator('button.login__submit').click()

    await expect(page.getByText('Invalid email or password')).toBeVisible()

    const session = await page.evaluate(() => ({
      userEmail: localStorage.getItem('userEmail'),
      userRole: localStorage.getItem('userRole')
    }))

    expect(session.userEmail).toBeNull()
    expect(session.userRole).toBeNull()
  })
})
