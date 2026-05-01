import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

const demoUsers = [
  {
    label: 'client',
    email: 'abdullah@kfupm.edu.sa',
    password: 'abdullah123',
    role: 'client',
    redirect: '/dashboard'
  },
  {
    label: 'manager',
    email: 'khalid@kfupm.edu.sa',
    password: 'khalid123',
    role: 'manager',
    redirect: '/manager'
  },
  {
    label: 'member',
    email: 'omar@kfupm.edu.sa',
    password: 'omar123',
    role: 'member',
    redirect: '/dashboard'
  }
]

test.describe('Login happy path', () => {
  for (const user of demoUsers) {
    test(`logs in as ${user.label} and redirects correctly`, async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await page.getByLabel('Email address').fill(user.email)
      await page.locator('#password').fill(user.password)
      await page.locator('button.login__submit').click()

      await expect(page).toHaveURL(new RegExp(`${user.redirect}$`))

      const session = await page.evaluate(() => ({
        userEmail: localStorage.getItem('userEmail'),
        userRole: localStorage.getItem('userRole')
      }))

      expect(session.userEmail).toBe(user.email.toLowerCase())
      expect(session.userRole).toBe(user.role)
    })
  }
})
