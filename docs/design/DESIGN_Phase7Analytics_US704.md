# HFD Design: US-704 Load Board Analytics & Insights

**Version:** 1.0  
**Created:** 2026-05-28  
**HFD Approval:** Pending review  
**Status:** DESIGN PHASE

---

## User Stories Addressed
- **US-704 AC-1:** Admin Views Load Board Analytics Dashboard
- **US-704 AC-2:** Shipper Views Performance Insights for Their Loads
- **US-704 AC-3:** Recommendation Matching Insights (backend tracking only)

---

## Design Constraints
- **Shipper Focus:** High-density data, rapid multi-load orchestration
- **Style Guide Compliance:** MANDATORY — see `docs/standards/STYLE_GUIDE.md`
- **Critical Paths:** Dashboard load <2 seconds
- **Accessibility:** WCAG 2.1 AA, keyboard navigation, dark mode support

---

## AC-1: Admin Load Board Analytics Dashboard

### Information Architecture
```
Admin Dashboard
├── Time Period Selector (Tabs: 7d | 30d | 90d)
├── Key Metrics Row
│   ├── Total Posted (large metric card)
│   ├── Claimed Count & % (large metric card)
│   └── Avg Time-to-Claim (large metric card)
├── Peak Hours Chart (Bar chart, 24-hour timeline)
├── Top Lanes Table (Origin → Destination, volume ranked)
└── Equipment Distribution (Pie chart)
```

### Visual Specification

**Time Period Tabs**
- Style: Secondary buttons (Border, no fill)
- Active tab: Blue-600 background, white text
- Inactive: Gray border, gray text
- Usage: `<button class="px-4 py-2 border border-gray-300 bg-white text-gray-900">`

**Metric Cards** (3 cards horizontally)
```html
<div class="bg-white rounded-lg shadow p-6 space-y-2">
  <p class="text-sm text-gray-600 font-medium">Total Posted</p>
  <p class="text-4xl font-bold text-gray-900">1,247</p>
  <p class="text-xs text-gray-500">Last 30 days</p>
</div>
```
- Background: White
- Shadow: Standard (rounded-lg)
- Padding: 24px (p-6)
- Metric label: 14px, medium weight, gray-600
- Number: 32px, bold, gray-900
- Context text: 12px, gray-500

**Peak Hours Bar Chart**
- Chart type: Horizontal bar chart
- X-axis: Hours 0-23 (24-hour cycle)
- Y-axis: Load count
- Bar color: Blue-600 (#4A86E8)
- Hover: Show tooltip with exact count
- High-glare safe: High contrast blue on white

**Top Lanes Table**
- Columns: Rank | Origin | Destination | Volume
- Row styling: Alternating white/gray-100 backgrounds
- Font: 16px body text
- Sorting: Descending by volume (default)

**Equipment Distribution Pie Chart**
- Legend below chart
- Color coding:
  - Flatbed: Green-600
  - Dry Van: Blue-600
  - Tanker: Orange-500
  - Specialized: Purple-600
- Hover: Highlight segment, show percentage

---

## AC-2: Shipper Performance Insights Dashboard

### Information Architecture
```
Shipper Performance (Last 30/90 days selector)
├── Summary Metrics (4 cards)
│   ├── Posted Count
│   ├── Claimed Count & %
│   ├── Avg Claim Time
│   └── Avg Match Score
├── Preferred vs Open Board Split (Bar chart)
├── Pricing Tier Analysis (Table)
└── Claim Reason Breakdown (Donut chart)
```

### Visual Specification

**Summary Metrics Row** (4 cards)
- Card size: Equal width, responsive grid
- Same styling as Admin dashboard metric cards
- Color accent on metric label (blue-500) for emphasis

**Preferred vs Open Board Chart**
- Type: Stacked horizontal bar or side-by-side bars
- Colors: 
  - Preferred: Green-600
  - Open Board: Blue-600
- Labels: Show percentage on hover

**Pricing Tier Analysis Table**
- Columns: Price/Mile | Posted | Claimed | Claim %
- RPM color coding (STYLE_GUIDE compliance):
  - ≥$1.50/mi: Green-600 (High Profit)
  - $0.80–1.49/mi: Yellow-400 (Neutral)
  - <$0.80/mi: Red-500 (Low Profit)
- Rows sortable by claim percentage (default)

**Claim Reason Breakdown**
- Type: Donut chart with legend
- Reasons: Equipment Match | Lane Match | Rate Match | Availability
- Segment colors: Distinct, accessible
- Center metric: Total claims percentage

---

## Playwright E2E Specifications

### Admin Dashboard Golden Path
```typescript
// test: admin-analytics-dashboard.spec.ts
test('Admin views Load Board Analytics (7-day view)', async ({ page }) => {
  await page.goto('/analytics');
  
  // Verify page loads <2s
  expect(page).toHaveTitle(/Analytics/);
  
  // Click 7-day tab
  await page.click('button:has-text("7d")');
  await page.waitForLoadState('networkidle');
  
  // Verify metric cards render
  expect(await page.locator('text=Total Posted').isVisible()).toBeTruthy();
  expect(await page.locator('text=Total Posted').locator('..').locator('text=/\\d+/')).toBeTruthy();
  
  // Verify charts render
  expect(await page.locator('canvas').count()).toBeGreaterThan(0); // Charts
  
  // Capture screenshot for visual validation
  await page.screenshot({ path: 'test-results/evidence/US-704-admin-dashboard.png' });
});
```

### Shipper Performance Golden Path
```typescript
test('Shipper views Performance Insights (30-day view)', async ({ page }) => {
  await page.goto('/analytics/shipper-performance');
  
  // Verify metric cards
  expect(await page.locator('text=Posted').isVisible()).toBeTruthy();
  expect(await page.locator('text=Claimed').isVisible()).toBeTruthy();
  
  // Hover over pricing tier row, verify color coding
  const highProfitRow = page.locator('text=$1.50');
  await highProfitRow.hover();
  expect(await highProfitRow.evaluate(el => window.getComputedStyle(el).backgroundColor)).toContain('green');
  
  // Capture screenshot
  await page.screenshot({ path: 'test-results/evidence/US-704-shipper-performance.png' });
});
```

---

## Accessibility Requirements

- **ARIA Labels:** Every metric card must have `aria-label="Total loads posted, 1247"`
- **Keyboard Navigation:** Tab through all metric cards, chart interactions accessible
- **Color Contrast:** All text meets WCAG AA (4.5:1 for body text)
- **Focus Indicators:** Blue-600 border on keyboard focus

---

## Handoff to CODER

CODER will implement:
1. Admin dashboard component with metric cards, charts, time-period tabs
2. Shipper performance dashboard with same structure
3. Ensure all components pass Playwright golden-path tests
4. Ensure screenshots match expected visual state

**UI Specifications locked. No backend changes required.**

---

**HFD Sign-Off:** Awaiting Style Guide compliance review and Playwright test execution.
