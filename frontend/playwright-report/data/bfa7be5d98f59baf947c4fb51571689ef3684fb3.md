# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> unauthenticated user visiting protected route is redirected to login
- Location: e2e\smoke.spec.ts:8:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:9096/profile"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:9096/profile"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('home page loads with correct title', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   await expect(page).toHaveTitle('FreightClub');
  6  | });
  7  | 
  8  | test('unauthenticated user visiting protected route is redirected to login', async ({ page }) => {
  9  |   await page.goto('/profile');
> 10 |   await expect(page).toHaveURL(/\/login/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  11 | });
  12 | 
  13 | test('login page renders', async ({ page }) => {
  14 |   await page.goto('/login');
  15 |   await expect(page).toHaveURL(/\/login/);
  16 |   await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  17 | });
  18 | 
```