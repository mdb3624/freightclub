/**
 * Feature: US-730a-v2 (Cost Profile Wizard Redesign)
 * AC: first-time wizard completion shows Summary with correct derived RPM values
 * AC: load board RPM query is invalidated after save (US-705 integration)
 * AC: all interactive elements meet the 48px+ glove-friendly touch target minimum
 */
import { test, expect } from '@playwright/test'
import { CostProfilePageObject } from './page-objects/CostProfilePageObject'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'

async function loginAsTrucker(page: any, email: string) {
  await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password: 'E2ETestPassword123!', firstName: 'Test', lastName: 'Trucker',
      role: 'TRUCKER', companyName: `TestTruck-${Date.now()}`,
    }),
  })
  await page.goto(`${FRONTEND}/`)
  // header-login-btn is desktop-only (hidden below Tailwind's md breakpoint);
  // at narrow viewports login is reachable only via the hamburger menu (CHG-862).
  const desktopLogin = page.locator('[data-testid="header-login-btn"]')
  if (await desktopLogin.isVisible().catch(() => false)) {
    await desktopLogin.click()
  } else {
    await page.click('[data-testid="mobile-menu-toggle"]')
    await page.click('[data-testid="mobile-nav-login-btn"]')
  }
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', 'E2ETestPassword123!')
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  await page.waitForLoadState('networkidle')
}

test.describe('US-730a-v2: Cost Profile Wizard', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  test.setTimeout(60000)

  test('US-730a-v2 AC: first-time wizard completion shows correct summary + touch targets', async ({ page }) => {
    await loginAsTrucker(page, `cost-profile-wizard-${Date.now()}@freightclub.local`)
    const costProfilePage = new CostProfilePageObject(page)

    await costProfilePage.goto()
    await expect(costProfilePage.root).toBeVisible({ timeout: 10000 })

    await costProfilePage.assertAllButtonsAreGloveFriendly()
    await costProfilePage.completeWizard()

    // Expected values assume no EIA API key is configured in this test environment
    // (app.eia.enabled defaults to false with no key set anywhere in application*.yml
    // or docker-compose.test.yml), so resolveDieselPrice() deterministically returns
    // $0.00/gal -> fuelCpm=0, varCpm=0.08, fixedCpm=0.195, breakeven=0.275,
    // marginCpm=0.8, minRpm=1.075, targetRpm=1.29. minRpm displays as "$1.07" not
    // "$1.08" because 1.075 has no exact binary floating-point representation, and
    // JS's (1.075).toFixed(2) rounds down to "1.07" as a result.
    await expect(costProfilePage.breakevenValue).toHaveText('$0.28')
    await expect(costProfilePage.minRpmValue).toHaveText('$1.07')
    await expect(costProfilePage.targetValue).toHaveText('$1.29')

    // Sweep the summary view's buttons too (e.g. "Update Cost Profile") — every
    // rendered view of this page must pass the touch-target gate, not just the wizard.
    await costProfilePage.assertAllButtonsAreGloveFriendly()

    await page.screenshot({ path: 'test-results/evidence/US-730a-v2-cost-profile-summary.png', fullPage: true })
  })
})
