# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-preferred-carriers.spec.ts >> Shipper Preferred Carrier List - US-707 >> AC-707-1: Shipper can add carrier to preferred list
- Location: e2e\shipper-preferred-carriers.spec.ts:39:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Preferred Carriers')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Preferred Carriers')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "FreightClub" [level=1] [ref=e6]
    - paragraph [ref=e7]: Sign in to your account
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]
    - generic [ref=e13]:
      - generic [ref=e14]: Password
      - textbox "Password" [ref=e15]
    - button "Sign in" [ref=e16] [cursor=pointer]
    - paragraph [ref=e17]:
      - text: Don't have an account?
      - link "Sign up" [ref=e18] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | 
  4   | test.describe('Shipper Preferred Carrier List - US-707', () => {
  5   |   test.beforeEach(async ({ page, context }) => {
  6   |     // Force-inject refreshToken cookie before navigating
  7   |     // This bypasses any Playwright storageState issues with cookie domain/path/secure flags
  8   |     const authJsonPath = 'auth.json';
  9   |     const authJson = JSON.parse(fs.readFileSync(authJsonPath, 'utf-8'));
  10  |     const refreshTokenCookie = authJson.cookies.find((c: any) => c.name === 'refreshToken');
  11  | 
  12  |     if (refreshTokenCookie && refreshTokenCookie.value) {
  13  |       try {
  14  |         await context.addCookies([{
  15  |           name: 'refreshToken',
  16  |           value: refreshTokenCookie.value,
  17  |           url: 'http://localhost:9090/'
  18  |         }]);
  19  |         console.log('✓ Injected refreshToken cookie into context');
  20  |       } catch (e) {
  21  |         console.log('⚠ Failed to inject cookie:', e);
  22  |       }
  23  |     } else {
  24  |       console.log('⚠ No refreshToken found in auth.json');
  25  |     }
  26  | 
  27  |     // Navigate to home first to trigger AuthInitializer
  28  |     await page.goto('/');
  29  |     await page.waitForLoadState('networkidle');
  30  | 
  31  |     // Wait for auth to be initialized
  32  |     await page.waitForTimeout(500);
  33  | 
  34  |     // Now navigate to the feature page
  35  |     await page.goto('/settings/preferred-carriers');
  36  |     await page.waitForLoadState('networkidle');
  37  |   });
  38  | 
  39  |   test('AC-707-1: Shipper can add carrier to preferred list', async ({ page }) => {
  40  |     // Verify page loads
> 41  |     await expect(page.locator('text=Preferred Carriers')).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  42  |     await expect(page.locator('text=Manage carriers')).toBeVisible();
  43  | 
  44  |     // Click "Add Carrier" button
  45  |     const addButton = page.locator('button:has-text("Add Carrier"), button:has-text("+ Add")');
  46  |     await expect(addButton).toBeVisible();
  47  |     await expect(addButton).toBeEnabled();
  48  |     await addButton.click();
  49  | 
  50  |     // Verify form appears
  51  |     await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Carrier"]')).toBeVisible();
  52  | 
  53  |     // Type carrier name
  54  |     await page.fill('input[placeholder*="Search"], input[placeholder*="Carrier"]', 'FedEx');
  55  |     await page.waitForLoadState('networkidle');
  56  | 
  57  |     // Select from dropdown
  58  |     const dropdownOption = page.locator('text=FedEx Freight').first();
  59  |     if (await dropdownOption.isVisible()) {
  60  |       await dropdownOption.click();
  61  |     }
  62  | 
  63  |     // Add notes
  64  |     const notesField = page.locator('textarea[placeholder*="Negotiated"], textarea[placeholder*="Notes"]');
  65  |     if (await notesField.isVisible()) {
  66  |       await notesField.fill('Negotiated 10% discount');
  67  |     }
  68  | 
  69  |     // Submit
  70  |     const submitBtn = page.locator('button:has-text("Add Carrier"), button:has-text("Save")').last();
  71  |     await submitBtn.click();
  72  | 
  73  |     // Verify success
  74  |     await expect(page.locator('text=FedEx')).toBeVisible({ timeout: 5000 });
  75  |   });
  76  | 
  77  |   test('AC-707-2: Shipper can view preferred carriers list', async ({ page }) => {
  78  |     // Verify table header
  79  |     await expect(page.locator('text=Carrier Name')).toBeVisible();
  80  |     await expect(page.locator('text=Email')).toBeVisible();
  81  |     await expect(page.locator('text=Date Added')).toBeVisible();
  82  | 
  83  |     // Verify table rows exist or show empty state
  84  |     const carrierRows = await page.locator('tr:has(td)').count();
  85  |     const emptyState = page.locator('text=No Preferred Carriers');
  86  | 
  87  |     if (carrierRows > 0) {
  88  |       const firstRow = page.locator('tr:has(td)').first();
  89  |       await expect(firstRow.locator('button:has-text("Remove")')).toBeVisible();
  90  |     } else {
  91  |       await expect(emptyState).toBeVisible();
  92  |     }
  93  |   });
  94  | 
  95  |   test('AC-707-3: Shipper can remove carrier from preferred list', async ({ page }) => {
  96  |     const carrierRows = await page.locator('tr:has(td)').count();
  97  | 
  98  |     if (carrierRows > 0) {
  99  |       // Click Remove button
  100 |       const removeBtn = page.locator('tr:has(td)').first().locator('button:has-text("Remove")');
  101 |       await expect(removeBtn).toBeVisible();
  102 |       await removeBtn.click();
  103 | 
  104 |       // Verify confirmation dialog
  105 |       const confirmBtn = page.locator('button:has-text("Remove"), button:has-text("Confirm")').last();
  106 |       if (await confirmBtn.isVisible({ timeout: 3000 })) {
  107 |         await confirmBtn.click();
  108 |       }
  109 | 
  110 |       // Verify removal (either success message or back to empty state)
  111 |       await expect(page.locator('text=No Preferred Carriers')).toBeVisible({ timeout: 5000 });
  112 |     }
  113 |   });
  114 | 
  115 |   test('Form is accessible (keyboard navigation)', async ({ page }) => {
  116 |     // Tab to Add Carrier button
  117 |     await page.keyboard.press('Tab');
  118 |     await page.keyboard.press('Tab');
  119 | 
  120 |     // Press Enter to open modal
  121 |     await page.keyboard.press('Enter');
  122 |     await page.waitForLoadState('networkidle');
  123 | 
  124 |     // Verify form opened
  125 |     const form = page.locator('input[placeholder*="Search"], input[placeholder*="Carrier"]');
  126 |     await expect(form).toBeVisible({ timeout: 3000 });
  127 |   });
  128 | });
  129 | 
```