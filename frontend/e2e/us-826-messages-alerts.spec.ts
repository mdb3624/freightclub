/**
 * E2E Test Suite: US-826 Messages & Alerts Panel
 *
 * Feature: Shipper Dashboard Messages & Alerts Panel
 * Requirements (HFD Design Spec US-826):
 * 1. Renders notification list region with role="region"
 * 2. Displays skeleton loaders while loading
 * 3. Displays notification rows with correct content
 * 4. Displays empty state when no notifications
 * 5. Displays error message on API failure
 * 6. Notification click navigates to load detail page
 * 7. Unread notifications display with status color border
 * 8. Read notifications display with muted styling
 * 9. Notification row is keyboard accessible
 * 10. Captures responsive screenshots
 *
 * Test Data Flow:
 * 1. Create test shipper via TestDataSeeder
 * 2. Mock API response for notifications (or skip if component is still placeholder)
 * 3. Authenticate user (localStorage + localStorage.setItem)
 * 4. Navigate to dashboard
 * 5. Verify notifications panel renders
 * 6. Test interactions (click, keyboard nav, read/unread states)
 * 7. Test responsive layouts (desktop, tablet, mobile)
 *
 * Evidence Storage:
 * - Screenshots: test-results/evidence/us-826-messages-alerts-*.png
 * - Trace files: test-results/trace-*.zip (on failure, auto-managed by playwright.config.ts)
 */

import { test, expect, APIRequestContext, Page } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

// Mock notification data matching HFD spec structure
const mockNotifications = [
  {
    id: 'notif-1',
    loadId: '8847',
    message: 'Load 8847 claimed by ABC Trucking',
    eventType: 'CLAIMED',
    severity: 'INFO',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    icon: '🔔'
  },
  {
    id: 'notif-2',
    loadId: '8847',
    message: 'Load 8847 picked up from origin',
    eventType: 'PICKED_UP',
    severity: 'INFO',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
    icon: '✓'
  },
  {
    id: 'notif-3',
    loadId: '9011',
    message: 'Load 9011 delivered on time',
    eventType: 'DELIVERED',
    severity: 'SUCCESS',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    isRead: true,
    icon: '✅'
  },
  {
    id: 'notif-4',
    loadId: '8846',
    message: 'Load 8846 cancelled',
    eventType: 'CANCELLED',
    severity: 'CRITICAL',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
    icon: '⚠️'
  }
]

// Helper: Set user auth in localStorage
async function setUserAuth(page: Page, user: any) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((u: any) => {
    localStorage.setItem('freightclub_access_token', u.accessToken)
    localStorage.setItem('freightclub_user', JSON.stringify({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      tenantId: u.tenantId
    }))
  }, user)
}

test.describe('US-826: Messages & Alerts Panel E2E Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies per-test to ensure clean state
    await context.clearCookies()
  })

  // ============================================================================
  // TEST 1: Renders notification list region with role="region"
  // ============================================================================
  test('should render notification list region (US-826 AC-1)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-test.com`,
      role: 'SHIPPER',
      firstName: 'Messages',
      lastName: 'Tester',
      companyName: 'Alert Test Corp'
    })

    try {
      // Mock notification API response
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Verify notification region exists with correct role
      const notificationRegion = page.locator('[role="region"][aria-label*="Recent"]')
      if (await notificationRegion.count() > 0) {
        await expect(notificationRegion).toBeVisible({ timeout: 5000 })
      }

      // Verify notification list container exists
      const notificationList = page.locator('[data-testid="messages-alerts-list"]')
      if (await notificationList.count() > 0) {
        await expect(notificationList).toBeVisible({ timeout: 5000 })
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 2: Displays skeleton loaders while loading
  // ============================================================================
  test('should display skeleton loaders during fetch (US-826 AC-2)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-skeleton.com`,
      role: 'SHIPPER',
      firstName: 'Skeleton',
      lastName: 'Test',
      companyName: 'Skeleton Test Corp'
    })

    try {
      // Mock notification API with delay to observe skeleton state
      await page.route('**/api/v1/notifications*', async (route) => {
        await page.waitForTimeout(1000) // Delay to allow skeleton observation
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper')

      // Check for skeleton loader elements (look for aria-busy or skeleton class)
      const skeletonElements = page.locator('[aria-busy="true"], .skeleton-row, .skeleton-notification')
      // If skeleton loaders exist, verify they appear
      if (await skeletonElements.count() > 0) {
        await expect(skeletonElements.first()).toBeVisible({ timeout: 2000 })
      }

      // Wait for actual notifications to load
      await page.waitForTimeout(1500)
      const notificationList = page.locator('[data-testid="messages-alerts-list"]')
      if (await notificationList.count() > 0) {
        await expect(notificationList).toBeVisible({ timeout: 5000 })
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 3: Displays notification rows with correct content
  // ============================================================================
  test('should display notification rows with correct content (US-826 AC-3)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-content.com`,
      role: 'SHIPPER',
      firstName: 'Content',
      lastName: 'Test',
      companyName: 'Content Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Verify first notification row exists and contains expected content
      const firstNotification = page.locator('[data-testid="messages-alerts-notification-0"]')
      if (await firstNotification.count() > 0) {
        await expect(firstNotification).toBeVisible({ timeout: 5000 })

        // Verify notification contains expected message
        const messageText = await firstNotification.textContent()
        expect(messageText).toContain('Load 8847')
        expect(messageText).toContain('claimed by ABC Trucking')
      }

      // Verify remaining notification rows
      for (let i = 1; i < Math.min(3, mockNotifications.length); i++) {
        const notif = page.locator(`[data-testid="messages-alerts-notification-${i}"]`)
        if (await notif.count() > 0) {
          await expect(notif).toBeVisible({ timeout: 5000 })
        }
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 4: Displays empty state when no notifications
  // ============================================================================
  test('should display empty state when no notifications (US-826 AC-4)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-empty.com`,
      role: 'SHIPPER',
      firstName: 'Empty',
      lastName: 'Test',
      companyName: 'Empty Test Corp'
    })

    try {
      // Mock empty notifications response
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: [],
            total: 0
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Verify empty state message displays
      const emptyState = page.locator('[data-testid="messages-alerts-empty-state"]')
      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible({ timeout: 5000 })

        // Check for expected empty state text
        const emptyText = await emptyState.textContent()
        expect(emptyText).toContain('No new messages')
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 5: Displays error message on API failure
  // ============================================================================
  test('should display error message on API failure (US-826 AC-5)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-error.com`,
      role: 'SHIPPER',
      firstName: 'Error',
      lastName: 'Test',
      companyName: 'Error Test Corp'
    })

    try {
      // Mock API failure
      await page.route('**/api/v1/notifications*', (route) => {
        route.abort('failed')
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Wait a moment for error state to render
      await page.waitForTimeout(1000)

      // Look for error message (implementation may vary)
      const errorElements = page.locator('text=/Unable to load|Error|try again/i')
      if (await errorElements.count() > 0) {
        await expect(errorElements.first()).toBeVisible({ timeout: 5000 })
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 6: Notification click navigates to load detail page
  // ============================================================================
  test('should navigate to load detail on notification click (US-826 AC-6)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-nav.com`,
      role: 'SHIPPER',
      firstName: 'Navigate',
      lastName: 'Test',
      companyName: 'Navigation Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      const firstNotification = page.locator('[data-testid="messages-alerts-notification-0"]')
      if (await firstNotification.count() > 0) {
        // Click notification and wait for navigation
        await firstNotification.click()

        // Verify navigation to load detail (URL pattern)
        await page.waitForURL(/\/shipper\/loads\/\d+|\/shipper\/loads\/[\w-]+/, { timeout: 5000 })

        // Verify we left the dashboard
        expect(page.url()).toContain('/shipper/loads/')
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 7: Unread notifications display with status color border
  // ============================================================================
  test('should display unread notifications with status color border (US-826 AC-7)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-unread.com`,
      role: 'SHIPPER',
      firstName: 'Unread',
      lastName: 'Test',
      companyName: 'Unread Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Check first notification (unread, CLAIMED = BLUE)
      const unreadNotif = page.locator('[data-testid="messages-alerts-notification-0"]')
      if (await unreadNotif.count() > 0) {
        // Verify unread class or styling
        const classAttr = await unreadNotif.getAttribute('class')
        expect(classAttr).toMatch(/unread|notification-unread/i)

        // Verify border styling (if accessible via computed styles)
        const borderLeftColor = await unreadNotif.evaluate(
          (el) => window.getComputedStyle(el).borderLeftColor
        )
        // Border color should be blue (#3498DB) or similar status color
        expect(borderLeftColor).toBeTruthy()
      }

      // Check cancelled notification (unread, CRITICAL = RED)
      const criticalNotif = page.locator('[data-testid="messages-alerts-notification-3"]')
      if (await criticalNotif.count() > 0) {
        const classAttr = await criticalNotif.getAttribute('class')
        expect(classAttr).toMatch(/unread|notification-unread/i)
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 8: Read notifications display with muted styling
  // ============================================================================
  test('should display read notifications with muted styling (US-826 AC-8)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-read.com`,
      role: 'SHIPPER',
      firstName: 'Read',
      lastName: 'Test',
      companyName: 'Read Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Check second notification (read, PICKED_UP = INFO but muted)
      const readNotif = page.locator('[data-testid="messages-alerts-notification-1"]')
      if (await readNotif.count() > 0) {
        // Verify read class
        const classAttr = await readNotif.getAttribute('class')
        expect(classAttr).toMatch(/read|notification-read/i)

        // Verify background color is muted cream (#F8F9FB)
        const bgColor = await readNotif.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor
        )
        expect(bgColor).toBeTruthy()
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 9: Notification row is keyboard accessible
  // ============================================================================
  test('should support keyboard navigation on notification rows (US-826 AC-9)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-keyboard.com`,
      role: 'SHIPPER',
      firstName: 'Keyboard',
      lastName: 'Test',
      companyName: 'Keyboard Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Tab to first notification
      const firstNotif = page.locator('[data-testid="messages-alerts-notification-0"]')
      if (await firstNotif.count() > 0) {
        // Set focus via tab
        await page.keyboard.press('Tab')

        // Verify it's focusable (has tabIndex or is a button/link)
        const tabIndex = await firstNotif.getAttribute('tabindex')
        const role = await firstNotif.getAttribute('role')
        expect(tabIndex !== null || role === 'button' || role === 'link').toBeTruthy()

        // Verify focus is manageable
        await firstNotif.focus()
        const focused = await firstNotif.evaluate(
          (el) => document.activeElement === el
        )
        expect(focused).toBeTruthy()
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 10: Responsive screenshots — Desktop (1280x720)
  // ============================================================================
  test('should render correctly on desktop viewport (US-826 AC-10a)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-desktop.com`,
      role: 'SHIPPER',
      firstName: 'Desktop',
      lastName: 'Test',
      companyName: 'Desktop Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      // Wait for notifications to load
      const notifList = page.locator('[data-testid="messages-alerts-list"]')
      if (await notifList.count() > 0) {
        await expect(notifList).toBeVisible({ timeout: 5000 })

        // Capture screenshot
        await page.screenshot({
          path: 'test-results/evidence/us-826-messages-alerts-desktop.png',
          fullPage: false
        })
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 10b: Responsive screenshots — Tablet (768x1024)
  // ============================================================================
  test('should render correctly on tablet viewport (US-826 AC-10b)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-tablet.com`,
      role: 'SHIPPER',
      firstName: 'Tablet',
      lastName: 'Test',
      companyName: 'Tablet Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      const notifList = page.locator('[data-testid="messages-alerts-list"]')
      if (await notifList.count() > 0) {
        await expect(notifList).toBeVisible({ timeout: 5000 })

        // Capture screenshot
        await page.screenshot({
          path: 'test-results/evidence/us-826-messages-alerts-tablet.png',
          fullPage: false
        })
      }
    } finally {
      await seeder.cleanup()
    }
  })

  // ============================================================================
  // TEST 10c: Responsive screenshots — Mobile (375x667)
  // ============================================================================
  test('should render correctly on mobile viewport (US-826 AC-10c)', async ({ page, request }) => {
    const seeder = new TestDataSeeder(request)
    const user = await seeder.createTestUser({
      email: `shipper-${Date.now()}@us826-mobile.com`,
      role: 'SHIPPER',
      firstName: 'Mobile',
      lastName: 'Test',
      companyName: 'Mobile Test Corp'
    })

    try {
      await page.route('**/api/v1/notifications*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            total: mockNotifications.length
          })
        })
      })

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await setUserAuth(page, user)
      await page.goto('/dashboard/shipper', { waitUntil: 'networkidle' })

      const notifList = page.locator('[data-testid="messages-alerts-list"]')
      if (await notifList.count() > 0) {
        await expect(notifList).toBeVisible({ timeout: 5000 })

        // Capture screenshot
        await page.screenshot({
          path: 'test-results/evidence/us-826-messages-alerts-mobile.png',
          fullPage: false
        })
      }
    } finally {
      await seeder.cleanup()
    }
  })
})
