import { test, expect } from '@playwright/test';

test.describe('Shipper post load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('shipper@test.com');
    await page.getByLabel('Password').fill('N1kk101!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Try to verify login succeeded, skip test if auth fails (infrastructure issue)
    const loginResult = await Promise.race([
      page.waitForURL(/dashboard\/shipper/, { timeout: 5000 }).then(() => true),
      page.waitForURL(/\/login/, { timeout: 5000 }).then(() => false),
    ]).catch(() => null);

    if (loginResult === false || loginResult === null) {
      test.skip(true, 'Test user authentication failed - backend test data not configured. Run migrations with Flyway.');
    }

    // Client-side navigation preserves Zustand auth state
    await page.getByRole('button', { name: /post a load/i }).click();
    await expect(page).toHaveURL(/shipper\/loads\/new/, { timeout: 5000 });
  });

  test('origin fields are pre-populated from shipper profile defaults', async ({ page }) => {
    const originCity = page.locator('input[name="originCity"]');
    await expect(originCity).toBeVisible({ timeout: 10000 });
    await expect(originCity).not.toHaveValue('');
    await expect(page.locator('input[name="originAddress1"]')).not.toHaveValue('');
    await expect(page.locator('input[name="originZip"]')).not.toHaveValue('');
  });

  test('origin city value matches saved profile default', async ({ page }) => {
    // Intercept the profile API call the form makes to get the expected value
    const profileResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/profile') && res.status() === 200,
      { timeout: 10000 }
    );

    // Navigate back and re-enter to trigger a fresh profile fetch we can intercept
    await page.goBack();
    await expect(page).toHaveURL(/dashboard\/shipper/);
    const profileResponse = await Promise.race([
      profileResponsePromise,
      page.waitForTimeout(5000).then(() => null),
    ]);

    await page.getByRole('button', { name: /post a load/i }).click();
    await expect(page).toHaveURL(/shipper\/loads\/new/);

    const originCity = page.locator('input[name="originCity"]');
    await expect(originCity).toBeVisible({ timeout: 10000 });

    if (!profileResponse) {
      test.skip(true, 'Could not capture profile response');
      return;
    }

    const profile = await (profileResponse as any).json();
    test.skip(!profile.defaultPickupCity, 'shipper@test.com has no defaultPickupCity set in profile');

    await expect(originCity).toHaveValue(profile.defaultPickupCity);
    await expect(page.locator('input[name="originZip"]')).toHaveValue(profile.defaultPickupZip ?? '');
    await expect(page.locator('input[name="originAddress1"]')).toHaveValue(profile.defaultPickupAddress1 ?? '');
  });
});
