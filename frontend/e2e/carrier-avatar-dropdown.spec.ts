/**
 * Bug fix: carrier header avatar navigated directly to the retired /profile
 * page instead of showing a dropdown. Fixed to show a dropdown with exactly
 * one item ("Sign out"), reusing the same useLogout() mechanism already
 * used by the Settings tab's sign-out button.
 */
import { test, expect } from '@playwright/test'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
test.use({ viewport: { width: 375, height: 812 } })

async function registerAndLogin(page: import('@playwright/test').Page, emailPrefix: string) {
  const email = `${emailPrefix}-${Date.now()}@freightclub.local`
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker', role: 'TRUCKER', companyName: `TestTruck-${Date.now()}` }),
  })
  await page.goto(`${FRONTEND}/`)
  await page.click('[data-testid="mobile-menu-toggle"]')
  await page.click('[data-testid="mobile-nav-login-btn"]')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
}

test('dashboard header avatar shows a sign-out-only dropdown, does not navigate to old profile page', async ({ page }) => {
  await registerAndLogin(page, 'avatar-dashboard')

  await expect(page.locator('[data-testid="carrier-avatar-menu"]')).not.toBeVisible()
  await page.locator('[data-testid="carrier-avatar"]').click()
  await expect(page.locator('[data-testid="carrier-avatar-menu"]')).toBeVisible()
  expect(page.url()).toContain('/dashboard/trucker')

  const items = page.locator('[data-testid="carrier-avatar-menu"] [role="menuitem"]')
  await expect(items).toHaveCount(1)
  await expect(items.first()).toHaveText('Sign out')

  // click-outside closes without navigating
  await page.mouse.click(10, 10)
  await expect(page.locator('[data-testid="carrier-avatar-menu"]')).not.toBeVisible()

  // sign out actually logs out
  await page.locator('[data-testid="carrier-avatar"]').click()
  await page.locator('[data-testid="carrier-avatar-signout"]').click()
  await page.waitForURL(/^http:\/\/[^/]+\/$/, { timeout: 10000 })
})

test('CostProfilePage header avatar shows the same sign-out-only dropdown', async ({ page }) => {
  await registerAndLogin(page, 'avatar-costprofile')
  await page.goto(`${FRONTEND}/carrier/cost-profile`, { waitUntil: 'networkidle' })

  await page.locator('[data-testid="header-avatar"]').click()
  await expect(page.locator('[data-testid="header-avatar-menu"]')).toBeVisible()
  expect(page.url()).toContain('/carrier/cost-profile')

  const items = page.locator('[data-testid="header-avatar-menu"] [role="menuitem"]')
  await expect(items).toHaveCount(1)
  await expect(items.first()).toHaveText('Sign out')

  await page.locator('[data-testid="header-avatar-signout"]').click()
  await page.waitForURL(/^http:\/\/[^/]+\/$/, { timeout: 10000 })
})
