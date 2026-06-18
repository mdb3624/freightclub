# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-dashboard-home.spec.ts >> Shipper Dashboard Home Golden Path (US-760/US-761/US-762) >> US-760: dashboard home requires authentication
- Location: e2e\shipper-dashboard-home.spec.ts:90:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:9090/dashboard/shipper"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    14 × unexpected value "http://localhost:9090/dashboard/shipper"

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - button "Already on dashboard" [disabled] [ref=e7]:
      - img "FreightClub" [ref=e8]
      - generic [ref=e9]:
        - heading "FreightClub" [level=1] [ref=e10]
        - paragraph [ref=e11]: Integrated Logistics
    - generic [ref=e12]:
      - paragraph [ref=e13]: Last updated
      - paragraph [ref=e14]: Jun 18, 2026, 09:04 AM
    - generic [ref=e15]:
      - button "Notifications" [ref=e17] [cursor=pointer]:
        - img [ref=e18]
      - button "ET" [ref=e22] [cursor=pointer]
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
        - generic [ref=e62]:
          - generic [ref=e64]:
            - heading "SHIPMENT STATUS" [level=2] [ref=e65]
            - generic [ref=e66]:
              - link "Manage/Save Drafts" [ref=e67] [cursor=pointer]:
                - /url: "#"
              - link "Track Shipments" [ref=e68] [cursor=pointer]:
                - /url: "#"
          - textbox "Search by Load ID, destination, or carrier..." [ref=e70]
          - generic [ref=e71]:
            - paragraph [ref=e72]: No active shipments
            - paragraph [ref=e73]: Post a load to get started
      - region "Messages and Alerts" [ref=e74]:
        - region "Messages and Alerts" [ref=e75]:
          - paragraph [ref=e77]: No messages or alerts
    - region "Action Zone" [ref=e79]:
      - heading "Action Zone" [level=2] [ref=e80]
      - generic [ref=e81]:
        - region "Quick Actions" [ref=e82]:
          - heading "Quick Actions" [level=3] [ref=e83]
          - generic [ref=e85]:
            - button "Create Load" [ref=e86] [cursor=pointer]
            - button "Get Quote" [ref=e87] [cursor=pointer]
            - button "Track Shipments" [ref=e88] [cursor=pointer]
            - button "My Carriers" [ref=e89] [cursor=pointer]
        - region "Carrier Search" [ref=e90]:
          - heading "Search Carriers" [level=3] [ref=e91]
          - region "Carrier Search" [ref=e92]:
            - generic [ref=e94]:
              - generic [ref=e95]:
                - generic [ref=e96]: Origin
                - textbox "Origin" [ref=e97]:
                  - /placeholder: City, State, or Zip
              - generic [ref=e98]:
                - generic [ref=e99]: Destination
                - textbox "Destination" [ref=e100]:
                  - /placeholder: City, State, or Zip
              - generic [ref=e101]:
                - generic [ref=e102]: Equipment (Optional)
                - combobox "Equipment (Optional)" [ref=e103]:
                  - option "-- Select Equipment Type --" [selected]
                  - option "Dry Van"
                  - option "Flatbed"
                  - option "Refrigerated"
                  - option "Tanker"
                  - option "Box Truck"
                  - option "Sprinter Van"
              - button "Find Carriers" [ref=e104] [cursor=pointer]
```

# Test source

```ts
  1  | /**
  2  |  * Shipper Dashboard Home — Golden Path Tests (US-760, US-761, US-762)
  3  |  *
  4  |  * Feature: US-760 (Shipper Dashboard Home: KPI Tiles, Carrier Search Panel)
  5  |  * AC-1 (US-761): Dashboard displays activeShipments / estimatedCostPerMile / onTimeCarrierPct KPI tiles
  6  |  * AC-1 (US-762): Shipper can search carriers by lane (origin/destination) from the dashboard panel
  7  |  *
  8  |  * Resolves CHG-508 (missing E2E golden-path evidence) per LIBRARIAN standing authorization 2026-06-08.
  9  |  * Trace files stored in: test-results/trace-{test-name}-{timestamp}.zip (see playwright.config.ts)
  10 |  */
  11 | 
  12 | import { test, expect } from '@playwright/test'
  13 | import { TestDataSeeder } from './fixtures/test-data-seeder'
  14 | import { ShipperDashboardHomePageObject } from './page-objects/ShipperDashboardHomePageObject'
  15 | 
  16 | async function setUserAuth(page: any, user: any) {
  17 |   await page.goto('/', { waitUntil: 'domcontentloaded' })
  18 |   await page.evaluate((u: any) => {
  19 |     localStorage.setItem('freightclub_access_token', u.accessToken)
  20 |     localStorage.setItem('freightclub_user', JSON.stringify({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, tenantId: u.tenantId }))
  21 |   }, user)
  22 | }
  23 | 
  24 | test.describe('Shipper Dashboard Home Golden Path (US-760/US-761/US-762)', () => {
  25 |   test.beforeEach(async ({ context }) => {
  26 |     await context.clearCookies()
  27 |   })
  28 | 
  29 |   // US-761 AC-1: KPI strip renders activeShipments, estimatedCostPerMile, onTimeCarrierPct from /shipper/dashboard-summary
  30 |   test('US-761 AC-1: dashboard home displays KPI tiles backed by the summary endpoint', async ({ page, request }) => {
  31 |     const seeder = new TestDataSeeder(request)
  32 |     const user = await seeder.createTestUser({
  33 |       email: `shipper-home-${Date.now()}@test.com`,
  34 |       role: 'SHIPPER',
  35 |       firstName: 'Dash',
  36 |       lastName: 'Home',
  37 |       companyName: 'Dash Home Corp',
  38 |     })
  39 | 
  40 |     try {
  41 |       await setUserAuth(page, user)
  42 |       const dashboard = new ShipperDashboardHomePageObject(page)
  43 |       await dashboard.goto()
  44 |       await dashboard.waitForGridReady()
  45 | 
  46 |       await expect(dashboard.kpiActiveShipments).toBeVisible({ timeout: 10000 })
  47 |       await expect(dashboard.kpiActiveShipments).toContainText('Active Shipments')
  48 |       await expect(dashboard.kpiEstimatedCostPerMile).toBeVisible()
  49 |       await expect(dashboard.kpiEstimatedCostPerMile).toContainText('Est. Cost/Mile')
  50 |       await expect(dashboard.kpiOnTimeCarrierPct).toBeVisible()
  51 |       await expect(dashboard.kpiOnTimeCarrierPct).toContainText('On-Time Carriers')
  52 | 
  53 |       await page.screenshot({ path: 'test-results/evidence/us-761-ac1-kpi-tiles.png', fullPage: true })
  54 |     } finally {
  55 |       await seeder.cleanup()
  56 |     }
  57 |   })
  58 | 
  59 |   // US-762 AC-1: shipper submits an origin/destination lane search and the carrier-search panel reacts (loading -> results/empty state)
  60 |   test('US-762 AC-1: carrier search panel performs a lane search and renders results state', async ({ page, request }) => {
  61 |     const seeder = new TestDataSeeder(request)
  62 |     const user = await seeder.createTestUser({
  63 |       email: `shipper-lane-${Date.now()}@test.com`,
  64 |       role: 'SHIPPER',
  65 |       firstName: 'Lane',
  66 |       lastName: 'Search',
  67 |       companyName: 'Lane Search Corp',
  68 |     })
  69 | 
  70 |     try {
  71 |       await setUserAuth(page, user)
  72 |       const dashboard = new ShipperDashboardHomePageObject(page)
  73 |       await dashboard.goto()
  74 |       await dashboard.waitForGridReady()
  75 | 
  76 |       await expect(dashboard.carrierSearchPanel).toBeVisible({ timeout: 10000 })
  77 |       await dashboard.searchLane('Chicago, IL', 'Detroit, MI')
  78 | 
  79 |       // The empty-state <li> renders nested inside the results <ul>, so asserting the results
  80 |       // container alone proves the lane-search round-trip completed (populated or empty)
  81 |       await expect(dashboard.searchResults).toBeVisible({ timeout: 10000 })
  82 | 
  83 |       await page.screenshot({ path: 'test-results/evidence/us-762-ac1-carrier-lane-search.png', fullPage: true })
  84 |     } finally {
  85 |       await seeder.cleanup()
  86 |     }
  87 |   })
  88 | 
  89 |   // US-760: unauthenticated access is blocked (golden-path auth boundary for the new route)
  90 |   test('US-760: dashboard home requires authentication', async ({ page }) => {
  91 |     await page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })
> 92 |     await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  93 |   })
  94 | })
  95 | 
```