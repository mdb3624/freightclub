# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us-824-quick-actions.spec.ts >> US-824: Quick Actions Panel >> US-824 AC-4: Track Shipments button navigates to /dashboard/shipper/loads
- Location: e2e/us-824-quick-actions.spec.ts:139:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard\/shipper\/loads/
Received string:  "http://localhost:9090/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:9090/"

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
      - generic [ref=e42]: Sat, Jun 13, 05:48 PM
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
  61  |       await expect(trackBtn).toContainText('Track Shipments');
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
> 161 |       await expect(page).toHaveURL(/\/dashboard\/shipper\/loads/, { timeout: 5000 });
      |                          ^ Error: expect(page).toHaveURL(expected) failed
  162 |       console.log('✅ Track Shipments button navigates correctly');
  163 |     } finally {
  164 |       await seeder.cleanup();
  165 |     }
  166 |   });
  167 | 
  168 |   // ============================================================================
  169 |   // TEST 5: Preferred Carriers button navigates to /settings/preferred-carriers
  170 |   // ============================================================================
  171 |   test('US-824 AC-5: Preferred Carriers button navigates to /settings/preferred-carriers', async ({
  172 |     page,
  173 |     request,
  174 |   }) => {
  175 |     const seeder = new TestDataSeeder(request);
  176 |     const user = await seeder.createTestUser({
  177 |       email: `shipper-carriers-${Date.now()}@test.com`,
  178 |       password: 'N1kk101!',
  179 |       role: 'SHIPPER',
  180 |       firstName: 'Carriers',
  181 |       lastName: 'Test',
  182 |       companyName: 'Test Shipper',
  183 |     });
  184 | 
  185 |     try {
  186 |       await setUserAuth(page, user);
  187 |       await page.goto('/dashboard/shipper');
  188 | 
  189 |       const carriersBtn = page.locator('[data-testid="quick-actions-carriers"]');
  190 |       await expect(carriersBtn).toBeVisible({ timeout: 5000 });
  191 |       await carriersBtn.click();
  192 | 
  193 |       await expect(page).toHaveURL(/\/settings\/preferred-carriers/, { timeout: 5000 });
  194 |       console.log('✅ Preferred Carriers button navigates correctly');
  195 |     } finally {
  196 |       await seeder.cleanup();
  197 |     }
  198 |   });
  199 | 
  200 |   // ============================================================================
  201 |   // TEST 6: Keyboard accessibility (Tab + Enter)
  202 |   // ============================================================================
  203 |   test('US-824 AC-6: buttons are keyboard accessible (Tab + Enter)', async ({
  204 |     page,
  205 |     request,
  206 |   }) => {
  207 |     const seeder = new TestDataSeeder(request);
  208 |     const user = await seeder.createTestUser({
  209 |       email: `shipper-keyboard-${Date.now()}@test.com`,
  210 |       password: 'N1kk101!',
  211 |       role: 'SHIPPER',
  212 |       firstName: 'Keyboard',
  213 |       lastName: 'Test',
  214 |       companyName: 'Test Shipper',
  215 |     });
  216 | 
  217 |     try {
  218 |       await setUserAuth(page, user);
  219 |       await page.goto('/dashboard/shipper');
  220 | 
  221 |       // Wait for Quick Actions Panel
  222 |       await expect(
  223 |         page.locator('[data-testid="dashboard-quick-actions-panel"]')
  224 |       ).toBeVisible({ timeout: 5000 });
  225 | 
  226 |       // Tab to the first button and press Enter
  227 |       const postLoadBtn = page.locator('[data-testid="quick-actions-post-load"]');
  228 |       await postLoadBtn.focus();
  229 |       await expect(postLoadBtn).toBeFocused();
  230 | 
  231 |       // Verify button is keyboard accessible by pressing Enter
  232 |       await postLoadBtn.press('Enter');
  233 | 
  234 |       // Verify navigation occurred
  235 |       await expect(page).toHaveURL(/\/shipper\/loads\/new/, { timeout: 5000 });
  236 |       console.log('✅ Buttons are keyboard accessible');
  237 |     } finally {
  238 |       await seeder.cleanup();
  239 |     }
  240 |   });
  241 | 
  242 |   // ============================================================================
  243 |   // TEST 7: Desktop responsive (1280x720)
  244 |   // ============================================================================
  245 |   test('US-824 AC-7a: responsive design (desktop 1280x720)', async ({
  246 |     page,
  247 |     request,
  248 |   }) => {
  249 |     const seeder = new TestDataSeeder(request);
  250 |     const user = await seeder.createTestUser({
  251 |       email: `shipper-desktop-${Date.now()}@test.com`,
  252 |       password: 'N1kk101!',
  253 |       role: 'SHIPPER',
  254 |       firstName: 'Desktop',
  255 |       lastName: 'Test',
  256 |       companyName: 'Test Shipper',
  257 |     });
  258 | 
  259 |     try {
  260 |       // Set desktop viewport
  261 |       await page.setViewportSize({ width: 1280, height: 720 });
```