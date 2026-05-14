# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-post-load.spec.ts >> Shipper post load >> origin city value matches saved profile default
- Location: e2e\shipper-post-load.spec.ts:23:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /dashboard\/shipper/
Received string:  "http://localhost:9090/login"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    13 × unexpected value "http://localhost:9090/login"

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "FreightClub" [level=1] [ref=e6]
    - paragraph [ref=e7]: Sign in to your account
  - generic [ref=e9]:
    - alert [ref=e10]: Login failed. Please try again.
    - generic [ref=e11]:
      - generic [ref=e12]: Email
      - textbox "Email" [ref=e13]: shipper@test.com
    - generic [ref=e14]:
      - generic [ref=e15]: Password
      - textbox "Password" [ref=e16]: N1kk101!
    - button "Sign in" [ref=e17] [cursor=pointer]
    - paragraph [ref=e18]:
      - text: Don't have an account?
      - link "Sign up" [ref=e19] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Shipper post load', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.getByLabel('Email').fill('shipper@test.com');
  7  |     await page.getByLabel('Password').fill('N1kk101!');
  8  |     await page.getByRole('button', { name: /sign in/i }).click();
> 9  |     await expect(page).toHaveURL(/dashboard\/shipper/, { timeout: 10000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  10 |     // Client-side navigation preserves Zustand auth state
  11 |     await page.getByRole('button', { name: /post a load/i }).click();
  12 |     await expect(page).toHaveURL(/shipper\/loads\/new/, { timeout: 5000 });
  13 |   });
  14 | 
  15 |   test('origin fields are pre-populated from shipper profile defaults', async ({ page }) => {
  16 |     const originCity = page.locator('input[name="originCity"]');
  17 |     await expect(originCity).toBeVisible({ timeout: 10000 });
  18 |     await expect(originCity).not.toHaveValue('');
  19 |     await expect(page.locator('input[name="originAddress1"]')).not.toHaveValue('');
  20 |     await expect(page.locator('input[name="originZip"]')).not.toHaveValue('');
  21 |   });
  22 | 
  23 |   test('origin city value matches saved profile default', async ({ page }) => {
  24 |     // Intercept the profile API call the form makes to get the expected value
  25 |     const profileResponsePromise = page.waitForResponse(
  26 |       (res) => res.url().includes('/api/v1/profile') && res.status() === 200,
  27 |       { timeout: 10000 }
  28 |     );
  29 | 
  30 |     // Navigate back and re-enter to trigger a fresh profile fetch we can intercept
  31 |     await page.goBack();
  32 |     await expect(page).toHaveURL(/dashboard\/shipper/);
  33 |     const profileResponse = await Promise.race([
  34 |       profileResponsePromise,
  35 |       page.waitForTimeout(5000).then(() => null),
  36 |     ]);
  37 | 
  38 |     await page.getByRole('button', { name: /post a load/i }).click();
  39 |     await expect(page).toHaveURL(/shipper\/loads\/new/);
  40 | 
  41 |     const originCity = page.locator('input[name="originCity"]');
  42 |     await expect(originCity).toBeVisible({ timeout: 10000 });
  43 | 
  44 |     if (!profileResponse) {
  45 |       test.skip(true, 'Could not capture profile response');
  46 |       return;
  47 |     }
  48 | 
  49 |     const profile = await (profileResponse as any).json();
  50 |     test.skip(!profile.defaultPickupCity, 'shipper@test.com has no defaultPickupCity set in profile');
  51 | 
  52 |     await expect(originCity).toHaveValue(profile.defaultPickupCity);
  53 |     await expect(page.locator('input[name="originZip"]')).toHaveValue(profile.defaultPickupZip ?? '');
  54 |     await expect(page.locator('input[name="originAddress1"]')).toHaveValue(profile.defaultPickupAddress1 ?? '');
  55 |   });
  56 | });
  57 | 
```