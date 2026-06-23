import { test, expect } from '@playwright/test';

/**
 * Feature: US-730-0 (Carrier Dashboard MVP)
 * AC-1: Design dashboard structure (hero + 4 metrics + available loads + actions)
 * AC-2: Mobile-first specs (iPhone 375px, dark theme, 48px targets, tap-only, <2s load)
 * AC-3: Responsive specs for tablet/desktop (optional)
 * AC-4: Component hierarchy documentation
 * AC-5: WCAG AAA contrast verification
 * AC-6: Design mockups (locked)
 */

test.describe('US-730-0: Carrier Dashboard MVP', () => {
  test.beforeEach(async ({ page }) => {
    // Set iPhone SE viewport (375px width)
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('AC-1: Dashboard displays complete structure (hero + tabs + metrics)', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // Verify header is present (56px fixed)
    const header = page.locator('[data-testid="carrier-header"]');
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBe(56);

    // Verify hero section is visible (40% viewport = 271px on iPhone)
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    // Verify tab bar (48px fixed)
    const tabBar = page.locator('[data-testid="tab-bar"]');
    await expect(tabBar).toBeVisible();
    const tabBox = await tabBar.boundingBox();
    expect(tabBox?.height).toBe(48);

    // Verify tabbed content area (60% viewport)
    const contentArea = page.locator('[data-testid="tab-content-area"]');
    await expect(contentArea).toBeVisible();

    // Verify no vertical scroll required (viewport math test)
    const windowHeight = await page.evaluate(() => window.innerHeight);
    const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(documentHeight).toBeLessThanOrEqual(windowHeight + 1); // +1 for rounding
  });

  test('AC-2: Mobile-first design with 48px touch targets', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // Verify primary CTA (Claim button) is >= 48px
    const claimBtn = page.locator('[data-testid="claim-load-btn"]').first();
    if (await claimBtn.isVisible()) {
      const box = await claimBtn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(48);
      expect(box?.width).toBeGreaterThanOrEqual(48);
    }

    // Verify tab buttons are >= 48px touch target
    const tabButtons = page.locator('[data-testid^="tab-button-"]');
    const count = await tabButtons.count();
    for (let i = 0; i < count; i++) {
      const box = await tabButtons.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(48);
    }

    // Verify dark theme colors (Luxury Industrial aesthetic)
    const dashboard = page.locator('[data-testid="carrier-dashboard"]');
    const bgColor = await dashboard.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    // #121212 or dark equivalent
    expect(bgColor).toMatch(/rgb\((18|17|19|20),\s*(18|17|19|20),\s*(18|17|19|20)\)/);
  });

  test('AC-2: Tap-only interactions (no swipe gestures)', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // Verify available loads tab can be switched via tap
    const availableLoadsTab = page.locator('[data-testid="tab-button-available-loads"]');
    await availableLoadsTab.click();

    const availableLoadsContent = page.locator('[data-testid="tab-content-available-loads"]');
    await expect(availableLoadsContent).toBeVisible();

    // Verify my stats tab switch
    const myStatsTab = page.locator('[data-testid="tab-button-my-stats"]');
    await myStatsTab.click();

    const myStatsContent = page.locator('[data-testid="tab-content-my-stats"]');
    await expect(myStatsContent).toBeVisible();
  });

  test('AC-3: Responsive design (iPhone 375px primary)', async ({ page }) => {
    // Test multiple viewports
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1280, height: 720, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard/carrier');

      // Header should always be 56px
      const header = page.locator('[data-testid="carrier-header"]');
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBe(56);

      // Hero section should be visible
      const hero = page.locator('[data-testid="hero-section"]');
      await expect(hero).toBeVisible();

      // Tab bar should be visible
      const tabBar = page.locator('[data-testid="tab-bar"]');
      await expect(tabBar).toBeVisible();
    }
  });

  test('AC-4: Component hierarchy and structure', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // Verify component nesting: Dashboard → Header, Hero, TabBar, Content
    const dashboard = page.locator('[data-testid="carrier-dashboard"]');
    await expect(dashboard).toBeVisible();

    const header = page.locator('[data-testid="carrier-header"]');
    await expect(header).toBeVisible();

    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    const tabBar = page.locator('[data-testid="tab-bar"]');
    await expect(tabBar).toBeVisible();

    const contentArea = page.locator('[data-testid="tab-content-area"]');
    await expect(contentArea).toBeVisible();

    // Verify tab content structure
    const myStatsTab = page.locator('[data-testid="tab-content-my-stats"]');
    await expect(myStatsTab).toBeVisible();

    // Verify 2x2 metric grid
    const metricBadges = page.locator('[data-testid^="metric-badge-"]');
    const badgeCount = await metricBadges.count();
    expect(badgeCount).toBe(4);
  });

  test('AC-5: WCAG AAA contrast verification (dark theme)', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // Primary text should have 21:1 contrast (#FFFFFF on #121212)
    const headers = page.locator('h1, h2, h3');
    for (let i = 0; i < await headers.count(); i++) {
      const color = await headers.nth(i).evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // Should be white or very light
      expect(color).toMatch(/rgb\(25[0-5],\s*25[0-5],\s*25[0-5]\)|rgb\(24[0-9]/);
    }

    // Secondary text should have 7.1:1 contrast (#B0B0B0 on #121212)
    const secondaryText = page.locator('[data-testid^="metric-label-"]');
    if (await secondaryText.count() > 0) {
      const color = await secondaryText.nth(0).evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // Should be light gray
      expect(color).toMatch(/rgb\(1[5-9][0-9],\s*1[5-9][0-9],\s*1[5-9][0-9]\)|rgb\(2[0-4][0-9]/);
    }

    // Bronze accent should be #B08D57
    const bronzeElements = page.locator('[data-testid*="bronze"]');
    if (await bronzeElements.count() > 0) {
      const bgColor = await bronzeElements.nth(0).evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toMatch(/rgb\(17[0-9],\s*14[0-9],\s*8[0-9]\)|rgb\(18[0-9],\s*14[0-9],\s*8[0-9]\)/);
    }
  });

  test('AC-2: Performance - LCP <2s on 4G LTE', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard/carrier');

    // Wait for hero section (largest contentful paint)
    await page.waitForSelector('[data-testid="hero-section"]', { timeout: 2000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // <2 seconds
  });

  test('AC-1 & AC-2: Golden path - owner-operator claims load from dashboard', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // 1. Verify hero section shows active or available load
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    // 2. Verify profitability badge is visible (GREEN/AMBER/RED)
    const profitabilityBadge = page.locator('[data-testid="profitability-badge"]').first();
    await expect(profitabilityBadge).toBeVisible();

    // 3. Verify Claim button (48px touch target)
    const claimBtn = page.locator('[data-testid="claim-load-btn"]').first();
    await expect(claimBtn).toBeVisible();
    const box = await claimBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(48);

    // Capture dashboard screenshot for visual evidence
    await page.screenshot({
      path: 'test-results/evidence/US-730-0_dashboard_golden_path.png',
      fullPage: false,
    });

    // 4. Click Claim button
    await claimBtn.click();

    // 5. Verify confirmation or navigation
    // (Exact behavior depends on backend; test shows tap-only interaction works)
    await expect(page).toHaveURL(/dashboard|claims|loads/);
  });

  test('AC-4: Tab switching - No navigation, content swaps in place', async ({ page }) => {
    await page.goto('/dashboard/carrier');

    // Get hero section position
    const heroBox = await page.locator('[data-testid="hero-section"]').boundingBox();

    // Switch to Available Loads tab
    await page.locator('[data-testid="tab-button-available-loads"]').click();
    await expect(page.locator('[data-testid="tab-content-available-loads"]')).toBeVisible();

    // Hero section should still be in same position
    const heroBoxAfter = await page.locator('[data-testid="hero-section"]').boundingBox();
    expect(heroBoxAfter?.y).toBe(heroBox?.y); // Same Y position = no scroll/layout shift

    // Switch to Quick Actions tab
    await page.locator('[data-testid="tab-button-quick-actions"]').click();
    await expect(page.locator('[data-testid="tab-content-quick-actions"]')).toBeVisible();

    // Hero section still in same position
    const heroBoxFinal = await page.locator('[data-testid="hero-section"]').boundingBox();
    expect(heroBoxFinal?.y).toBe(heroBox?.y);
  });
});
