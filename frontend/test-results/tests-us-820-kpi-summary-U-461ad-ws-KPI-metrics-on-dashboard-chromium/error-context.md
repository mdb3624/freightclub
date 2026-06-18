# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\us-820-kpi-summary.spec.ts >> US-820: KPI Summary Display >> AC-1,2,3: Shipper views KPI metrics on dashboard
- Location: e2e\tests\us-820-kpi-summary.spec.ts:25:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="email-input"]')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]: MARKET LIVE
    - generic [ref=e8]:
      - generic [ref=e9]: "DIESEL NATL AVG: $3.89/gal"
      - generic [ref=e10]: "DRY VAN SPOT: $2.14 RPM"
      - generic [ref=e11]: "REEFER SPOT: $2.76 RPM"
      - generic [ref=e12]: "FLATBED SPOT: $2.38 RPM"
      - generic [ref=e13]: "DIESEL EAST: --"
      - generic [ref=e14]: "DIESEL MIDWEST: --"
      - generic [ref=e15]: "DIESEL SOUTH: --"
      - generic [ref=e16]: "DIESEL ROCKY: --"
      - generic [ref=e17]: "DIESEL WEST: --"
      - generic [ref=e18]: "LOAD-TO-TRUCK RATIO: 3.2:1"
      - generic [ref=e19]: "CA→TX CORRIDOR: HIGH VOLUME"
      - generic [ref=e20]: "MIDWEST REEFER: SEASONAL +12%"
      - generic [ref=e21]: "FMCSA HOS: 11HR DRIVE / 14HR DUTY"
      - generic [ref=e22]: "DATA: U.S. EIA"
      - generic [ref=e23]: "DIESEL NATL AVG: $3.89/gal"
      - generic [ref=e24]: "DRY VAN SPOT: $2.14 RPM"
      - generic [ref=e25]: "REEFER SPOT: $2.76 RPM"
      - generic [ref=e26]: "FLATBED SPOT: $2.38 RPM"
      - generic [ref=e27]: "DIESEL EAST: --"
      - generic [ref=e28]: "DIESEL MIDWEST: --"
      - generic [ref=e29]: "DIESEL SOUTH: --"
      - generic [ref=e30]: "DIESEL ROCKY: --"
      - generic [ref=e31]: "DIESEL WEST: --"
      - generic [ref=e32]: "LOAD-TO-TRUCK RATIO: 3.2:1"
      - generic [ref=e33]: "CA→TX CORRIDOR: HIGH VOLUME"
      - generic [ref=e34]: "MIDWEST REEFER: SEASONAL +12%"
      - generic [ref=e35]: "FMCSA HOS: 11HR DRIVE / 14HR DUTY"
      - generic [ref=e36]: "DATA: U.S. EIA"
  - banner [ref=e37]:
    - generic [ref=e38]: HAULER.
    - generic [ref=e39]:
      - generic [ref=e40]: FMCSA Compliant · HOS Tracking
      - generic [ref=e42]: Thu, Jun 18, 09:05 AM
  - navigation [ref=e43]:
    - generic [ref=e44] [cursor=pointer]: 📦 Load Analyzer
    - generic [ref=e45] [cursor=pointer]: 💰 CPM Calculator
    - generic [ref=e46] [cursor=pointer]: 📋 Broker Comms
    - generic [ref=e47] [cursor=pointer]: 📊 Load Log
  - generic [ref=e49]:
    - generic [ref=e50]: Load Profitability Analyzer
    - generic [ref=e51]: Enter load details to get full RPM analysis, deadhead cost, and GO / NO-GO verdict
    - generic [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]: Load Details
        - generic [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e57]: Origin City, State
            - textbox "e.g. Chicago, IL" [ref=e58]
          - generic [ref=e59]:
            - generic [ref=e60]: Destination City, State
            - textbox "e.g. Dallas, TX" [ref=e61]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: Loaded Miles
            - spinbutton [ref=e65]
          - generic [ref=e66]:
            - generic [ref=e67]: Deadhead (DH) Miles
            - spinbutton [ref=e68]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]: Broker Offered Rate ($)
            - spinbutton [ref=e72]
          - generic [ref=e73]:
            - generic [ref=e74]: Equipment Type
            - combobox [ref=e75]:
              - option "Dry Van" [selected]
              - option "Reefer"
              - option "Flatbed"
              - option "Step Deck"
        - generic [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]: Your CPM ($)
            - spinbutton [ref=e79]
          - generic [ref=e80]:
            - generic [ref=e81]: Fuel Surcharge ($)
            - spinbutton [ref=e82]: "0"
          - generic [ref=e83]:
            - generic [ref=e84]: Accessorials ($)
            - spinbutton [ref=e85]: "0"
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]: Estimated Transit Days
            - spinbutton [ref=e89]: "1"
          - generic [ref=e90]:
            - generic [ref=e91]: Market RPM for Lane ($)
            - spinbutton [ref=e92]
        - button "ANALYZE LOAD →" [ref=e93] [cursor=pointer]
      - generic [ref=e94]:
        - generic [ref=e95]: 🚛
        - generic [ref=e96]: Enter load details to begin analysis
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Feature: US-820 KPI Summary Display
  5   |  * AC-1: Shipper views active shipment count
  6   |  * AC-2: Shipper views on-time delivery percentage
  7   |  * AC-3: Shipper views cost per mile metric
  8   |  * AC-4: Metrics display within 2 seconds
  9   |  * AC-5: Empty state when no delivered loads
  10  |  */
  11  | 
  12  | test.describe('US-820: KPI Summary Display', () => {
  13  |   test.beforeEach(async ({ page, context }) => {
  14  |     // Login as shipper
  15  |     await page.goto('/');
> 16  |     await page.fill('[data-testid="email-input"]', 'shipper@test.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  17  |     await page.fill('[data-testid="password-input"]', 'N1kk101!');
  18  |     await page.click('[data-testid="login-submit-btn"]');
  19  | 
  20  |     // Wait for redirect to dashboard
  21  |     await page.waitForURL('/dashboard/shipper');
  22  |     await page.waitForLoadState('networkidle');
  23  |   });
  24  | 
  25  |   test('AC-1,2,3: Shipper views KPI metrics on dashboard', async ({ page }) => {
  26  |     // Navigate to dashboard
  27  |     await page.goto('/dashboard/shipper');
  28  | 
  29  |     // Wait for KPI panel to load
  30  |     const kpiPanel = page.locator('[data-testid="kpi-summary-panel"]');
  31  |     await kpiPanel.waitFor({ state: 'visible', timeout: 5000 });
  32  | 
  33  |     // Verify "Business Health" header
  34  |     const header = page.locator('text=Business Health');
  35  |     await expect(header).toBeVisible();
  36  | 
  37  |     // Verify all three KPI tiles are present
  38  |     const activeLoadsTile = page.locator('[data-testid="kpi-tile-active-loads"]');
  39  |     const onTimeTile = page.locator('[data-testid="kpi-tile-ontime"]');
  40  |     const costPerMileTile = page.locator('[data-testid="kpi-tile-cost-per-mile"]');
  41  | 
  42  |     await expect(activeLoadsTile).toBeVisible();
  43  |     await expect(onTimeTile).toBeVisible();
  44  |     await expect(costPerMileTile).toBeVisible();
  45  | 
  46  |     // Verify tile labels
  47  |     await expect(page.locator('text=Active Shipments')).toBeVisible();
  48  |     await expect(page.locator('text=On-Time Rate')).toBeVisible();
  49  |     await expect(page.locator('text=Cost per Mile')).toBeVisible();
  50  | 
  51  |     // Verify values are populated (not loading)
  52  |     const activeLoadsValue = activeLoadsTile.locator('[data-testid="kpi-tile-active-loads-value"]');
  53  |     const onTimeValue = onTimeTile.locator('[data-testid="kpi-tile-ontime-value"]');
  54  |     const costValue = costPerMileTile.locator('[data-testid="kpi-tile-cost-per-mile-value"]');
  55  | 
  56  |     // All should have numeric text (not "—")
  57  |     const activeLoadsText = await activeLoadsValue.textContent();
  58  |     expect(activeLoadsText).not.toBe('—');
  59  |   });
  60  | 
  61  |   test('AC-4: KPI metrics load within 2 seconds', async ({ page }) => {
  62  |     const startTime = Date.now();
  63  | 
  64  |     await page.goto('/dashboard/shipper');
  65  | 
  66  |     // Wait for KPI panel to render
  67  |     const kpiPanel = page.locator('[data-testid="kpi-summary-panel"]');
  68  |     await kpiPanel.waitFor({ state: 'visible', timeout: 5000 });
  69  | 
  70  |     // Verify tiles are fully loaded (not showing "—")
  71  |     const activeTile = page.locator('[data-testid="kpi-tile-active-loads"]');
  72  |     const activeValue = activeTile.locator('[data-testid="kpi-tile-active-loads-value"]');
  73  | 
  74  |     // Wait for value to be populated
  75  |     await expect(activeValue).not.toContainText('—');
  76  | 
  77  |     const loadTime = Date.now() - startTime;
  78  | 
  79  |     // AC-4: Performance requirement met (< 2000ms)
  80  |     expect(loadTime).toBeLessThan(2000);
  81  |   });
  82  | 
  83  |   test('AC-5: Empty state displays when no delivered loads', async ({ page }) => {
  84  |     // Assume fresh account with no loads
  85  |     await page.goto('/dashboard/shipper');
  86  | 
  87  |     // Check for either KPI panel with data or empty state
  88  |     const emptyState = page.locator('[data-testid="kpi-summary-empty"]');
  89  |     const kpiPanel = page.locator('[data-testid="kpi-summary-panel"]');
  90  | 
  91  |     // One of these should be visible
  92  |     const emptyVisible = await emptyState.isVisible().catch(() => false);
  93  |     const panelVisible = await kpiPanel.isVisible().catch(() => false);
  94  | 
  95  |     if (emptyVisible) {
  96  |       // Empty state case
  97  |       await expect(page.locator('text=No Delivered Loads Yet')).toBeVisible();
  98  |       await expect(page.locator('[data-testid="kpi-empty-cta-button"]')).toBeVisible();
  99  |     } else if (panelVisible) {
  100 |       // Has metrics
  101 |       await expect(kpiPanel).toBeVisible();
  102 |     }
  103 |   });
  104 | 
  105 |   test('Responsive layout: KPI tiles stack on mobile', async ({ page }) => {
  106 |     // Set mobile viewport
  107 |     await page.setViewportSize({ width: 375, height: 667 });
  108 | 
  109 |     await page.goto('/dashboard/shipper');
  110 | 
  111 |     const grid = page.locator('[data-testid="kpi-tiles-grid"]');
  112 |     await grid.waitFor({ state: 'visible' });
  113 | 
  114 |     // On mobile, verify grid exists (CSS handles stacking)
  115 |     await expect(grid).toBeVisible();
  116 |   });
```