# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-preferred-carriers.spec.ts >> Shipper Preferred Carrier List - US-707 >> US-707 AC-4: Form is accessible via keyboard navigation
- Location: e2e\shipper-preferred-carriers.spec.ts:133:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="carrier-search-input"]')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for locator('[data-testid="carrier-search-input"]')

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
      - alert [ref=e13]: Email is required
    - generic [ref=e14]:
      - generic [ref=e15]: Password
      - textbox "Password" [active] [ref=e16]
      - alert [ref=e17]: Password is required
    - button "Sign in" [ref=e18] [cursor=pointer]
    - paragraph [ref=e19]:
      - text: Don't have an account?
      - link "Sign up" [ref=e20] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  48  |       // Verify form appears
  49  |       await expect(page.locator('[data-testid="carrier-search-input"]')).toBeVisible({ timeout: 3000 });
  50  | 
  51  |       // Type carrier name
  52  |       await page.fill('[data-testid="carrier-search-input"]', 'FedEx');
  53  | 
  54  |       // Wait for and select from dropdown
  55  |       await expect(page.locator('[data-testid="carrier-option-fedex"]')).toBeVisible({ timeout: 5000 });
  56  |       await page.click('[data-testid="carrier-option-fedex"]');
  57  | 
  58  |       // Add notes if field exists
  59  |       const notesField = page.locator('[data-testid="carrier-notes-textarea"]');
  60  |       if (await notesField.isVisible({ timeout: 2000 })) {
  61  |         await notesField.fill('Negotiated 10% discount');
  62  |       }
  63  | 
  64  |       // Submit form
  65  |       await page.click('[data-testid="save-carrier-btn"]');
  66  | 
  67  |       // Verify success message or carrier appears in list
  68  |       await expect(page.locator('[data-testid="carrier-list-container"]')).toBeVisible({ timeout: 5000 });
  69  |     } finally {
  70  |       await seeder.cleanup();
  71  |     }
  72  |   });
  73  | 
  74  |   test('US-707 AC-2: Shipper can view preferred carriers list', async ({ page, request }) => {
  75  |     const seeder = new TestDataSeeder(request);
  76  |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  77  | 
  78  |     try {
  79  |       await page.goto('/settings/preferred-carriers', { waitUntil: 'networkidle' });
  80  | 
  81  |       // Verify list page loads
  82  |       await expect(page.locator('[data-testid="preferred-carriers-page"]')).toBeVisible({ timeout: 5000 });
  83  | 
  84  |       // Verify table header or list container visible
  85  |       await expect(page.locator('[data-testid="carrier-list-header"]')).toBeVisible();
  86  | 
  87  |       // Check if carriers exist or empty state shows
  88  |       const carrierRows = await page.locator('[data-testid^="carrier-row-"]').count();
  89  |       if (carrierRows > 0) {
  90  |         // Verify first carrier row has remove button
  91  |         await expect(page.locator('[data-testid="remove-carrier-btn"]').first()).toBeVisible();
  92  |       } else {
  93  |         // Verify empty state message
  94  |         await expect(page.locator('[data-testid="empty-carriers-message"]')).toBeVisible();
  95  |       }
  96  |     } finally {
  97  |       await seeder.cleanup();
  98  |     }
  99  |   });
  100 | 
  101 |   test('US-707 AC-3: Shipper can remove carrier from preferred list', async ({ page, request }) => {
  102 |     const seeder = new TestDataSeeder(request);
  103 |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  104 | 
  105 |     try {
  106 |       await page.goto('/settings/preferred-carriers', { waitUntil: 'networkidle' });
  107 | 
  108 |       // Wait for page to load
  109 |       await expect(page.locator('[data-testid="preferred-carriers-page"]')).toBeVisible({ timeout: 5000 });
  110 | 
  111 |       const carrierRows = await page.locator('[data-testid^="carrier-row-"]').count();
  112 | 
  113 |       if (carrierRows > 0) {
  114 |         // Click first remove button
  115 |         const removeBtn = page.locator('[data-testid="remove-carrier-btn"]').first();
  116 |         await expect(removeBtn).toBeVisible();
  117 |         await removeBtn.click();
  118 | 
  119 |         // Verify confirmation if applicable
  120 |         const confirmBtn = page.locator('[data-testid="confirm-remove-btn"]');
  121 |         if (await confirmBtn.isVisible({ timeout: 3000 })) {
  122 |           await confirmBtn.click();
  123 |         }
  124 | 
  125 |         // Verify removal (either success or back to empty state)
  126 |         await expect(page.locator('[data-testid="empty-carriers-message"]')).toBeVisible({ timeout: 5000 });
  127 |       }
  128 |     } finally {
  129 |       await seeder.cleanup();
  130 |     }
  131 |   });
  132 | 
  133 |   test('US-707 AC-4: Form is accessible via keyboard navigation', async ({ page, request }) => {
  134 |     const seeder = new TestDataSeeder(request);
  135 |     const user = await seeder.createTestUser({ role: 'SHIPPER' });
  136 | 
  137 |     try {
  138 |       await page.goto('/settings/preferred-carriers', { waitUntil: 'networkidle' });
  139 | 
  140 |       // Tab to Add Carrier button
  141 |       await page.keyboard.press('Tab');
  142 |       await page.keyboard.press('Tab');
  143 | 
  144 |       // Press Enter to open modal
  145 |       await page.keyboard.press('Enter');
  146 | 
  147 |       // Verify form opened with search input
> 148 |       await expect(page.locator('[data-testid="carrier-search-input"]')).toBeVisible({ timeout: 3000 });
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  149 |     } finally {
  150 |       await seeder.cleanup();
  151 |     }
  152 |   });
  153 | });
  154 | 
```