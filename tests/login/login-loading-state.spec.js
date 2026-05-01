import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

test('shows loading state while login is in progress', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`)
  await page.getByLabel('Email address').fill('abdullah@kfupm.edu.sa')
  await page.locator('#password').fill('abdullah123')

  const submitButton = page.locator('button.login__submit')
  await submitButton.click()

  await expect(submitButton).toBeDisabled()
  await expect(submitButton).toContainText('Logging in...')
  await expect(page).toHaveURL(/\/dashboard$/)
})
