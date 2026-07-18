/**
 * Home Page Marketing Landing (design_handoff_home_page)
 * Public `/` route: hero, feature sections, and an in-page login modal that
 * wraps the existing LoginForm/useLogin flow (no separate auth logic).
 */

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('renders hero, header, and footer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /the only load board/i })).toBeVisible();
    await expect(page.locator('[data-testid="header-get-started-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer-login-btn"]')).toBeVisible();
  });

  test('clicking Log in opens the login modal with the real login form', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-testid="header-login-btn"]').click();

    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit-btn"]')).toBeVisible();
  });

  test('modal closes via the X button', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="header-login-btn"]').click();
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

    await page.locator('[data-testid="login-modal-close-btn"]').click();
    await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
  });

  test('modal closes on backdrop click', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="header-login-btn"]').click();
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

    // Click the backdrop outside the modal card
    await page.locator('[data-testid="login-modal-backdrop"]').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
  });

  test('invalid submit shows validation errors from the existing LoginForm', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="header-login-btn"]').click();

    await page.locator('[data-testid="login-submit-btn"]').click();

    await expect(page.locator('[data-testid="email-input-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input-error"]')).toBeVisible();
  });

  // FREIG-114-pattern regression guard: this page adds new image assets
  // (logo-full, logo-mobile, hero-truck) served from public/assets.
  test('produces no failed asset requests or console errors on load', async ({ page }) => {
    const failedRequests: string[] = [];
    const consoleErrors: string[] = [];
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const assetFailures = failedRequests.filter((url) => !url.includes('/api/'));

    expect(assetFailures, `Unexpected failed asset requests: ${assetFailures.join(', ')}`).toEqual([]);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(', ')}`).toEqual([]);
  });
});

test.describe('Relocated carrier tools (/carrier/tools)', () => {
  test('redirects unauthenticated users home with the login modal open', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/carrier/tools');
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });
});
