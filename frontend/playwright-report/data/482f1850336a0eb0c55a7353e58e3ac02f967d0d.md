# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us-824-quick-actions.spec.ts >> US-824: Quick Actions Panel >> US-824 AC-1: renders all four quick action buttons
- Location: e2e/us-824-quick-actions.spec.ts:27:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[data-testid="quick-actions-track"]')
Expected substring: "Track Shipments"
Received string:    "Documents Portal"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('[data-testid="quick-actions-track"]')
    9 × locator resolved to <button data-testid="quick-actions-track" class="w-full px-3 py-2 rounded text-white text-sm font-medium btn-bronze hover:opacity-90">Documents Portal</button>
      - unexpected value "Documents Portal"

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - img "FreightClub" [ref=e8]
      - generic [ref=e9]:
        - heading "FreightClub" [level=1] [ref=e10]
        - paragraph [ref=e11]: Integrated Logistics
    - generic [ref=e12]:
      - paragraph [ref=e13]: Last updated
      - paragraph [ref=e14]: Jun 13, 2026, 05:47 PM
    - generic [ref=e15]:
      - button "Notifications" [ref=e17] [cursor=pointer]:
        - img [ref=e18]
      - button "QA" [ref=e22] [cursor=pointer]
  - generic [ref=e23]:
    - generic [ref=e26]:
      - heading "Business Health" [level=2] [ref=e27]
      - generic [ref=e28]:
        - generic [ref=e29]:
          - img [ref=e31]
          - generic [ref=e36]:
            - paragraph [ref=e37]: Active Shipments
            - generic [ref=e39]: "0"
        - generic [ref=e40]:
          - img [ref=e42]
          - generic [ref=e45]:
            - paragraph [ref=e46]: On-Time Rate
            - generic [ref=e47]:
              - generic [ref=e48]: No data
              - generic [ref=e49]: "%"
        - generic [ref=e50]:
          - img [ref=e52]
          - generic [ref=e54]:
            - paragraph [ref=e55]: Cost per Mile
            - generic [ref=e56]:
              - generic [ref=e57]: No data
              - generic [ref=e58]: $
    - generic [ref=e60]:
      - region "Shipment Status" [ref=e61]:
        - heading "Shipment Status" [level=2] [ref=e63]
      - region "Messages and Alerts" [ref=e65]:
        - region "Messages and Alerts" [ref=e66]:
          - paragraph [ref=e68]: No messages or alerts
    - region "Action Zone" [ref=e70]:
      - heading "Action Zone" [level=2] [ref=e71]
      - generic [ref=e72]:
        - region "Quick Action Panel" [ref=e73]:
          - heading "Quick Action Panel" [level=3] [ref=e74]
          - generic [ref=e75]:
            - button "Post Load" [ref=e76] [cursor=pointer]
            - button "Get A Quote" [ref=e77] [cursor=pointer]
            - button "Carrier Network" [ref=e78] [cursor=pointer]
            - button "Documents Portal" [ref=e79] [cursor=pointer]
        - region "Carrier Search Panel" [ref=e80]:
          - heading "Search For Available Carriers" [level=3] [ref=e81]
          - region "Carrier Search" [ref=e82]:
            - generic [ref=e84]:
              - generic [ref=e85]:
                - generic [ref=e86]: Origin
                - textbox "Origin" [ref=e87]:
                  - /placeholder: City, State, or Zip
              - generic [ref=e88]:
                - generic [ref=e89]: Destination
                - textbox "Destination" [ref=e90]:
                  - /placeholder: City, State, or Zip
              - generic [ref=e91]:
                - generic [ref=e92]: Equipment (Optional)
                - combobox "Equipment (Optional)" [ref=e93]:
                  - option "-- Select Equipment Type --" [selected]
                  - option "Dry Van"
                  - option "Flatbed"
                  - option "Refrigerated"
                  - option "Tanker"
                  - option "Box Truck"
                  - option "Sprinter Van"
              - button "Find Carriers" [ref=e94] [cursor=pointer]
```

# Test source

```ts
  1   | /**
  2   |  * Feature: US-824 (Quick Actions Panel)
  3   |  * AC-1: Renders all four quick action buttons (Post Load, Get A Quote, Track Shipments, Preferred Carriers)
  4   |  * AC-2: Post Load button navigates to /shipper/loads/new
  5   |  * AC-3: Get A Quote button navigates to /shipper/quote
  6   |  * AC-4: Track Shipments button navigates to /dashboard/shipper/loads
  7   |  * AC-5: Preferred Carriers button navigates to /settings/preferred-carriers
  8   |  * AC-6: Buttons are keyboard accessible (Tab + Enter)
  9   |  * AC-7: Responsive layout verified on desktop, tablet, mobile
  10  |  */
  11  | 
  12  | import { test, expect, APIRequestContext } from '@playwright/test';
  13  | import { TestDataSeeder } from './fixtures/test-data-seeder';
  14  | 
  15  | async function setUserAuth(page: any, user: any) {
  16  |   await page.goto('/', { waitUntil: 'domcontentloaded' });
  17  |   await page.evaluate((u: any) => {
  18  |     localStorage.setItem('freightclub_access_token', u.accessToken);
  19  |     localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }));
  20  |   }, user);
  21  | }
  22  | 
  23  | test.describe('US-824: Quick Actions Panel', () => {
  24  |   // ============================================================================
  25  |   // TEST 1: Renders all four quick action buttons
  26  |   // ============================================================================
  27  |   test('US-824 AC-1: renders all four quick action buttons', async ({ page, request }) => {
  28  |     const seeder = new TestDataSeeder(request);
  29  |     const user = await seeder.createTestUser({
  30  |       email: `shipper-quick-actions-${Date.now()}@test.com`,
  31  |       password: 'N1kk101!',
  32  |       role: 'SHIPPER',
  33  |       firstName: 'Quick',
  34  |       lastName: 'Actions',
  35  |       companyName: 'Test Shipper',
  36  |     });
  37  | 
  38  |     try {
  39  |       await setUserAuth(page, user);
  40  |       await page.goto('/dashboard/shipper');
  41  | 
  42  |       // Wait for Quick Actions Panel to be visible
  43  |       await expect(
  44  |         page.locator('[data-testid="dashboard-quick-actions-panel"]')
  45  |       ).toBeVisible({ timeout: 5000 });
  46  | 
  47  |       // Verify all four buttons exist
  48  |       await expect(page.locator('[data-testid="quick-actions-post-load"]')).toBeVisible();
  49  |       await expect(page.locator('[data-testid="quick-actions-quote"]')).toBeVisible();
  50  |       await expect(page.locator('[data-testid="quick-actions-track"]')).toBeVisible();
  51  |       await expect(page.locator('[data-testid="quick-actions-carriers"]')).toBeVisible();
  52  | 
  53  |       // Verify button labels
  54  |       const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
  55  |       const quoteBtn = page.locator('[data-testid="quick-actions-quote"]');
  56  |       const trackBtn = page.locator('[data-testid="quick-actions-track"]');
  57  |       const carriersBtn = page.locator('[data-testid="quick-actions-carriers"]');
  58  | 
  59  |       await expect(postLoadBtn).toContainText('Post Load');
  60  |       await expect(quoteBtn).toContainText('Get A Quote');
> 61  |       await expect(trackBtn).toContainText('Track Shipments');
      |                              ^ Error: expect(locator).toContainText(expected) failed
  62  |       await expect(carriersBtn).toContainText('Preferred Carriers');
  63  | 
  64  |       console.log('✅ All four quick action buttons rendered correctly');
  65  |     } finally {
  66  |       await seeder.cleanup();
  67  |     }
  68  |   });
  69  | 
  70  |   // ============================================================================
  71  |   // TEST 2: Post Load button navigates to /shipper/loads/new
  72  |   // ============================================================================
  73  |   test('US-824 AC-2: Post Load button navigates to /shipper/loads/new', async ({
  74  |     page,
  75  |     request,
  76  |   }) => {
  77  |     const seeder = new TestDataSeeder(request);
  78  |     const user = await seeder.createTestUser({
  79  |       email: `shipper-post-load-${Date.now()}@test.com`,
  80  |       password: 'N1kk101!',
  81  |       role: 'SHIPPER',
  82  |       firstName: 'Post',
  83  |       lastName: 'Load',
  84  |       companyName: 'Test Shipper',
  85  |     });
  86  | 
  87  |     try {
  88  |       await setUserAuth(page, user);
  89  |       await page.goto('/dashboard/shipper');
  90  | 
  91  |       // Wait for button to be visible and click it
  92  |       const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
  93  |       await expect(postLoadBtn).toBeVisible({ timeout: 5000 });
  94  |       await postLoadBtn.click();
  95  | 
  96  |       // Verify navigation to /shipper/loads/new
  97  |       await expect(page).toHaveURL(/\/shipper\/loads\/new/, { timeout: 5000 });
  98  |       console.log('✅ Post Load button navigates correctly');
  99  |     } finally {
  100 |       await seeder.cleanup();
  101 |     }
  102 |   });
  103 | 
  104 |   // ============================================================================
  105 |   // TEST 3: Get A Quote button navigates to /shipper/quote
  106 |   // ============================================================================
  107 |   test('US-824 AC-3: Get A Quote button navigates to /shipper/quote', async ({
  108 |     page,
  109 |     request,
  110 |   }) => {
  111 |     const seeder = new TestDataSeeder(request);
  112 |     const user = await seeder.createTestUser({
  113 |       email: `shipper-quote-${Date.now()}@test.com`,
  114 |       password: 'N1kk101!',
  115 |       role: 'SHIPPER',
  116 |       firstName: 'Quote',
  117 |       lastName: 'Test',
  118 |       companyName: 'Test Shipper',
  119 |     });
  120 | 
  121 |     try {
  122 |       await setUserAuth(page, user);
  123 |       await page.goto('/dashboard/shipper');
  124 | 
  125 |       const quoteBtn = page.locator('[data-testid="quick-actions-quote"]');
  126 |       await expect(quoteBtn).toBeVisible({ timeout: 5000 });
  127 |       await quoteBtn.click();
  128 | 
  129 |       await expect(page).toHaveURL(/\/shipper\/quote/, { timeout: 5000 });
  130 |       console.log('✅ Get A Quote button navigates correctly');
  131 |     } finally {
  132 |       await seeder.cleanup();
  133 |     }
  134 |   });
  135 | 
  136 |   // ============================================================================
  137 |   // TEST 4: Track Shipments button navigates to /dashboard/shipper/loads
  138 |   // ============================================================================
  139 |   test('US-824 AC-4: Track Shipments button navigates to /dashboard/shipper/loads', async ({
  140 |     page,
  141 |     request,
  142 |   }) => {
  143 |     const seeder = new TestDataSeeder(request);
  144 |     const user = await seeder.createTestUser({
  145 |       email: `shipper-track-${Date.now()}@test.com`,
  146 |       password: 'N1kk101!',
  147 |       role: 'SHIPPER',
  148 |       firstName: 'Track',
  149 |       lastName: 'Test',
  150 |       companyName: 'Test Shipper',
  151 |     });
  152 | 
  153 |     try {
  154 |       await setUserAuth(page, user);
  155 |       await page.goto('/dashboard/shipper');
  156 | 
  157 |       const trackBtn = page.locator('[data-testid="quick-actions-track"]');
  158 |       await expect(trackBtn).toBeVisible({ timeout: 5000 });
  159 |       await trackBtn.click();
  160 | 
  161 |       await expect(page).toHaveURL(/\/dashboard\/shipper\/loads/, { timeout: 5000 });
```