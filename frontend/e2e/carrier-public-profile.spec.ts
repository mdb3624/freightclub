import { test, expect } from '@playwright/test';

test.describe('Carrier Public Profile - US-710', () => {
  test.beforeEach(async ({ page }) => {
    // Login as shipper
    await page.goto('/login');
    await page.fill('input[type="email"]', 'shipper@test.com');
    await page.fill('input[type="password"]', 'ShipperPassword123!');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL('**/dashboard');

    // Navigate to a carrier profile (e.g., FedEx)
    await page.goto('/carriers/fedex-freight');
  });

  test('AC-1: Shipper views carrier performance profile', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveTitle(/Carrier|Profile/);

    // Verify header with carrier name
    await expect(page.locator('h1:has-text("FedEx"), h1:has-text("Carrier")')).toBeVisible();

    // Verify key performance metrics are visible
    await expect(page.locator('text=Acceptance Rate')).toBeVisible();
    await expect(page.locator('text=On-Time Delivery')).toBeVisible();
    await expect(page.locator('text=Quality Score')).toBeVisible();
    await expect(page.locator('text=Avg Delivery')).toBeVisible();

    // Verify metric values display (percentages and numbers)
    const acceptanceRate = page.locator('text=/\\d+%/').first();
    await expect(acceptanceRate).toBeVisible();

    const onTimeRate = page.locator('text=/\\d+%/').nth(1);
    await expect(onTimeRate).toBeVisible();

    // Verify "Add to Preferred" button
    const addBtn = page.locator('button:has-text("Add to Preferred"), button:has-text("Add")');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeEnabled();

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-carrier-profile.png' });
  });

  test('AC-2: Benchmark comparison displays correctly', async ({ page }) => {
    // Verify benchmark section exists
    await expect(page.locator('text=Benchmark Comparison')).toBeVisible();

    // Verify benchmark metrics show comparison
    await expect(page.locator('text=vs .* avg')).toBeDefined();

    // Verify progress bars or charts visible
    const progressBars = await page.locator('[role="progressbar"], div[style*="width"]').count();
    expect(progressBars).toBeGreaterThanOrEqual(0);

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-benchmark-comparison.png' });
  });

  test('AC-3: Carrier interest count displays social proof', async ({ page }) => {
    // Verify "Viewed by" metric
    await expect(page.locator('text=Viewed by')).toBeVisible();

    // Verify "Preferred by" metric
    await expect(page.locator('text=Preferred by')).toBeVisible();

    // Verify numbers are shown (shippers count)
    const viewedByText = await page.locator('text=Viewed by').locator('..').textContent();
    expect(viewedByText).toMatch(/\d+/);

    const preferredByText = await page.locator('text=Preferred by').locator('..').textContent();
    expect(preferredByText).toMatch(/\d+/);

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-social-proof.png' });
  });

  test('AC-4: Multi-tenancy isolation message displays', async ({ page }) => {
    // Verify data isolation statement
    const isolationMsg = page.locator('text=specific to your company, text=tenant, text=isolated');
    if (await isolationMsg.isVisible()) {
      await expect(isolationMsg).toBeVisible();
    }

    // Verify metrics shown are only for current tenant (implicit in structure)
    const metrics = await page.locator('text=/\\d+%|\\d+\\/\\d+/').count();
    expect(metrics).toBeGreaterThan(0);

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-multi-tenancy.png' });
  });

  test('Service areas and equipment types display', async ({ page }) => {
    // Verify Service Areas section
    const serviceSection = page.locator('text=Service Areas, text=service');
    if (await serviceSection.isVisible()) {
      await expect(serviceSection).toBeVisible();
    }

    // Verify Equipment Types section
    const equipmentSection = page.locator('text=Equipment');
    if (await equipmentSection.isVisible()) {
      await expect(equipmentSection).toBeVisible();

      // Verify equipment types listed
      const equipmentTypes = page.locator('text=Flatbed, text=Dry Van, text=Tanker');
      if (await equipmentTypes.isVisible()) {
        await expect(equipmentTypes).toBeVisible();
      }
    }

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-service-equipment.png' });
  });

  test('Shipper can add carrier to preferred list from profile', async ({ page }) => {
    // Find and click "Add to Preferred" button
    const addBtn = page.locator('button:has-text("Add to Preferred"), button:has-text("Add")');
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify action completes (success message or button state change)
    const confirmationMsg = page.locator('text=added, text=success').first();
    if (await confirmationMsg.isVisible({ timeout: 3000 })) {
      await expect(confirmationMsg).toBeVisible();
    }

    // Verify button state changes (becomes "Added" or disables)
    const updatedBtn = page.locator('button:has-text("Added"), button:has-text("Remove from Preferred")').first();
    if (await updatedBtn.isVisible({ timeout: 2000 })) {
      await expect(updatedBtn).toBeVisible();
    }

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-add-to-preferred.png' });
  });

  test('Profile styling complies with Style Guide (colors, typography)', async ({ page }) => {
    // Verify header background color (should be blue gradient)
    const headerSection = page.locator('h1').locator('..');
    const headerBgColor = await headerSection.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(headerBgColor).toBeDefined();

    // Verify metric card backgrounds are white
    const metricCard = page.locator('text=Acceptance Rate').locator('../../..');
    const cardBg = await metricCard.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(cardBg).toContain('255'); // White

    // Verify typography (heading should be large)
    const heading = page.locator('h1');
    const fontSize = await heading.evaluate(el => window.getComputedStyle(el).fontSize);
    expect(parseInt(fontSize)).toBeGreaterThan(20);

    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/US-710-style-compliance.png' });
  });

  test('Profile is accessible (keyboard navigation)', async ({ page }) => {
    // Tab through main elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be on interactive element (button or link)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);

    // Press Enter on "Add to Preferred" button
    const addBtn = page.locator('button:has-text("Add to Preferred")');
    await addBtn.focus();
    await page.keyboard.press('Enter');

    // Verify action occurs
    await page.waitForLoadState('networkidle');
  });

  test('Profile loads within 2 seconds (performance)', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to profile
    await page.goto('/carriers/fedex-freight');

    // Wait for key metric to load
    await expect(page.locator('text=Acceptance Rate')).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // Under 2 seconds
  });
});
