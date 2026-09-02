/**
 * US-874/877/878 golden path: a Carrier (Trucker) who created their tenant navigates via the
 * real mobile Settings tab (not page.goto()) to Team & Fleet Settings, manages the team, and
 * saves a fleet cost default.
 */
import { test, expect } from '@playwright/test'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://localhost:9091'
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
test.use({ viewport: { width: 375, height: 812 } })

async function registerCarrierAdmin(companyPrefix: string) {
  const email = `carrier-admin-${companyPrefix}-${Date.now()}@freightclub.local`
  const res = await fetch(`${BACKEND}/api/test/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password: 'E2ETestPassword123!', firstName: 'Dave', lastName: 'Owner',
      role: 'TRUCKER', companyName: `${companyPrefix}-${Date.now()}`,
    }),
  })
  const body = await res.json()
  return { email, password: 'E2ETestPassword123!' as const, tenantId: body.user.tenantId as string }
}

async function loginViaUi(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto(`${FRONTEND}/`, { waitUntil: 'networkidle' })
  await page.click('[data-testid="mobile-menu-toggle"]')
  await page.click('[data-testid="mobile-nav-login-btn"]')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-submit-btn"]')
  await page.waitForURL(/\/dashboard\/trucker/, { timeout: 30000 })
}

test('carrier admin reaches Team & Fleet Settings from the mobile Settings tab and saves a fleet default', async ({ page, request }) => {
  // Static-asset failure guard (FREIG-114 pattern) — API 401s excluded, see
  // shipper-admin-team-settings.spec.ts for why.
  const failedRequests: string[] = []
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`) })

  const admin = await registerCarrierAdmin('fleetco')
  await loginViaUi(page, admin.email, admin.password)

  // Real UI navigation: bottom tab bar -> Settings tab -> Team & Fleet Settings item.
  await page.locator('[data-testid="bottom-tab-settings"]').click()
  await page.locator('[data-testid="settings-item-team-settings"]').click()
  await page.waitForURL(/\/carrier\/admin\/team/, { timeout: 10000 })

  await expect(page.locator('[data-testid="carrier-team-settings-page"]')).toBeVisible()
  await expect(page.locator('[data-testid="join-code-value"]')).toBeVisible()

  await expect(page.locator('[data-testid^="team-member-"]')).toHaveCount(1) // solo admin so far

  await page.locator('[data-testid="org-setting-fuelCostPerGallon"]').fill('4.25')
  await page.locator('[data-testid="save-org-settings"]').click()

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('[data-testid="org-setting-fuelCostPerGallon"]')).toHaveValue('4.25')

  const assetFailures = failedRequests.filter((url) => !url.includes('/api/'))
  expect(assetFailures, `Unexpected failed asset requests: ${assetFailures.join(', ')}`).toEqual([])
})
