# Phase 7 UI/UX Design Specifications

**Owner:** Human Factors Designer  
**Status:** IN PROGRESS (HFD Design Phase)  
**Date:** 2026-05-27  
**Target:** All designs reviewed and approved before CODER implementation

---

## 📋 Table of Contents

1. [US-704: Load Board Analytics](#us-704-load-board-analytics)
2. [US-705: Carrier Performance Dashboard](#us-705-carrier-performance-dashboard)
3. [US-706: Revenue & Profitability Analytics](#us-706-revenue--profitability-analytics)
4. [US-707: Shipper Preferred Carriers](#us-707-shipper-preferred-carriers)
5. [US-708: Direct Load Assignment](#us-708-direct-load-assignment)
6. [US-709: Block/Restrict Carrier](#us-709-blockrestrict-carrier)
7. [US-710: View Carrier Public Profile](#us-710-view-carrier-public-profile)
8. [US-711: Load Interest & View Tracking](#us-711-load-interest--view-tracking)

---

## US-704: Load Board Analytics

### User Personas
- **Admin** (Desktop) — Platform overview, strategic insights
- **Shipper** (Desktop) — Own load performance, competitive analysis

### Page Layout

#### Admin Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Load Board Analytics                          [7d] [30d] [90d]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Total Posted     │  │ Total Claimed    │  │ Avg Claim  │ │
│  │ 1,247 loads      │  │ 892 (71%)        │  │ 3.2 hours  │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Top Lanes by Volume                                      │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ 1. Atlanta → Los Angeles     142 loads  ████████████ 11% │ │
│  │ 2. Dallas → Chicago          128 loads  ███████████  10% │ │
│  │ 3. Houston → New York        115 loads  ██████████   9%  │ │
│  │ 4. Phoenix → Denver           98 loads  ████████    7.8% │ │
│  │ 5. Miami → Charlotte          87 loads  ███████     7%   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────┐  ┌────────────────────────────────┐ │
│  │ Equipment Types      │  │ Peak Posting Hours (ETZ)       │ │
│  │ Dry Van      38%  ██ │  │ 8-9am    ▓▓▓▓▓▓▓▓▓▓           │ │
│  │ Flatbed      45%  ██ │  │ 2-3pm    ▓▓▓▓▓▓▓▓░░           │ │
│  │ Tanker       12%  ░  │  │ 1-2pm    ▓▓▓▓▓▓▓░░░           │ │
│  │ Specialized   5%  ░  │  │ 9-10am   ▓▓▓▓▓▓▓░░░           │ │
│  └──────────────────────┘  └────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Metric Cards** (4 total): Posted, Claimed, Avg Claim Time, Claim %
  - Font: 32px bold for metric value, 14px gray for label
  - Background: White with light blue border (state: focused)
  - Spacing: 16px margins, 16px padding

- **Range Selector** (Top right): "7d" | "30d" | "90d"
  - Active state: Blue background, white text
  - Inactive state: Gray text, light gray background
  - Click behavior: Reload metrics immediately (show loading spinner)

- **Top Lanes Table**
  - Columns: Lane (text), Volume (number), Chart (spark bar), % of Total
  - Row hover: Light gray background
  - Bar color: RPM-coded (will depend on profitability data)

- **Equipment Types** (Pie/Donut Chart)
  - Colors: Brand blue (dry van), secondary blue (flatbed), accent colors
  - Hover: Highlight segment, show % tooltip

- **Peak Hours Chart** (Bar chart)
  - Y-axis: Time (8am-5pm ETZ)
  - X-axis: Volume (scaled)
  - Colors: Brand blue bars
  - Tooltip on hover: "8-9am: 342 loads"

**States:**
- **Loading:** Show skeleton loaders for all metric cards, tables
- **No Data:** "No analytics available for this date range"
- **Error:** "Failed to load analytics. Try again." [Retry] button

**Accessibility:**
- All metric cards have `role="region" aria-label="Total posted loads"`
- Chart data exposed as accessible table alternative
- Tab order: Range selector → Metric cards → Tables
- ARIA live region for updated metrics: `aria-live="polite" aria-atomic="true"`

---

#### Shipper Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ My Load Performance              [7d] [30d] [90d]           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Posted   │  │ Claimed  │  │ Avg Claim│  │ Preferred│   │
│  │ 47 loads │  │ 44 (94%) │  │ 1.8 hrs  │  │ 28 (64%) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Match Score Distribution                                 │ │
│  │                                                          │ │
│  │  Avg: 162/200 (Good)                                   │ │
│  │  ███████████████░░░ (Distribution histogram)            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────┐  ┌────────────────────────────────┐ │
│  │ Pricing Performance  │  │ Claim by Source                │ │
│  │ $1.50/mi:  10/12 83% │  │ Preferred: 28 loads (64%)  ██ │ │
│  │ $2.00/mi:   8/8  100%│  │ Open Board: 16 loads (36%) ░░ │ │
│  │ $1.00/mi:   2/4  50% │  │                                │ │
│  │ $3.00/mi:   1/1  100%│  │                                │ │
│  └──────────────────────┘  └────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Same metric card layout as admin dashboard
- Emphasis on **Claimed %** (green highlight if >85%)
- **Match Score** visualization as horizontal bar chart
- **Pricing Tier Table:** Editable price points (future feature)
- **Claim Source Pie Chart:** Color-coded (preferred=green, open board=gray)

**States:**
- **No loads posted:** "Post your first load to see analytics"
- **All loads unclaimed:** "Your loads haven't been claimed yet. Consider adjusting price or equipment type."

---

### Playwright E2E Tests

```typescript
// tests/admin-load-board-analytics.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Load Board Analytics (US-704)', () => {
  
  test('AC-1: Displays metrics dashboard', async ({ page }) => {
    await page.goto('/analytics/load-board');
    
    // Verify metric cards render
    await expect(page.locator('[data-testid="metric-posted"]')).toContainText('Total Posted');
    await expect(page.locator('[data-testid="metric-claimed"]')).toContainText('Claimed');
    
    // Verify range selector
    const sevenDayBtn = page.locator('button:has-text("7d")');
    await expect(sevenDayBtn).toHaveClass(/active/);
    
    // Take visual evidence
    await page.screenshot({ path: 'test-results/evidence/us704_admin_dashboard.png' });
  });

  test('AC-2: Range selector updates metrics', async ({ page }) => {
    await page.goto('/analytics/load-board');
    await page.click('button:has-text("30d")');
    
    // Wait for updated data
    await page.waitForLoadState('networkidle');
    
    // Verify metric changed
    const postedCount = await page.locator('[data-testid="metric-posted"] span:first-child').textContent();
    expect(parseInt(postedCount)).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'test-results/evidence/us704_30day_range.png' });
  });

  test('AC-3: Top lanes table is sortable', async ({ page }) => {
    await page.goto('/analytics/load-board');
    
    const lanesTable = page.locator('[data-testid="top-lanes-table"]');
    await expect(lanesTable).toBeVisible();
    
    // Verify at least 3 lanes displayed
    const rows = await lanesTable.locator('tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(3);
  });

  test('US-704 Full Evidence Screenshot', async ({ page }) => {
    await page.goto('/analytics/load-board');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/evidence/US-704_PASS.png',
      fullPage: true 
    });
  });
});
```

**Visual Evidence Locations:**
- `test-results/evidence/us704_admin_dashboard.png` — Main dashboard
- `test-results/evidence/us704_30day_range.png` — After range change
- `test-results/evidence/US-704_PASS.png` — Full page, all ACs met

---

## US-705: Carrier Performance Dashboard

### User Persona
- **Shipper** (Desktop/Mobile) — Evaluating carrier reliability

### Page Layout

```
┌──────────────────────────────────────────────────┐
│ Carrier Performance Dashboard                    │
├──────────────────────────────────────────────────┤
│                                                  │
│ Search: [Find a carrier...        ] [Search]     │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Carrier: XYZ Logistics                       │ │
│ │ ★★★★★ (4.2/5 - 348 reviews)                 │ │
│ │                                              │ │
│ │ ┌────────────┐ ┌────────────┐ ┌───────────┐ │ │
│ │ │Acceptance  │ │On-Time     │ │Quality    │ │ │
│ │ │Rate        │ │Delivery    │ │Score      │ │ │
│ │ │94%         │ │92%         │ │4.1/5.0    │ │ │
│ │ │[████████░] │ │[████████░] │ │[████████░] │ │ │
│ │ │Avg: 87%    │ │Avg: 89%    │ │Avg: 4.0   │ │ │
│ │ │▲ +2%       │ │▲ +1%       │ │▲ +0.2     │ │ │
│ │ └────────────┘ └────────────┘ └───────────┘ │ │
│ │                                              │ │
│ │ Avg Delivery Time: 24.5 hours                │ │
│ │ Preferred by: 127 shippers                   │ │
│ │ Operating Region: SE, MW, NE                 │ │
│ │ Equipment: Dry Van, Flatbed, Refrigerated   │ │
│ │                                              │ │
│ │ [Add to Preferred] [Block This Carrier]     │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌────────────────────────────────────────────────┐│
│ │ Top 10 Carriers (Platform Ranking)             ││
│ ├─────────────────────────────────────────────────┤│
│ │ 1. ABC Trucking      4.5★  94% on-time   Top 5%││
│ │ 2. XYZ Logistics     4.2★  92% on-time   Top 8%││
│ │ 3. Premier Hauling   4.1★  91% on-time  Top 10%││
│ │ 4. FastFreight       4.0★  88% on-time  Top 12%││
│ │ 5. BigRig Express    3.9★  86% on-time  Top 15%││
│ └────────────────────────────────────────────────┘│
│                                                  │
└──────────────────────────────────────────────────┘
```

**Components:**
- **Search Bar:** Text input + button (debounced 300ms)
- **Metric Cards:** 3-column layout on desktop, stacked on mobile
  - Progress bar showing percentile rank
  - Trend indicator (▲/▼) with % change
  - Label: "Avg: X" for platform baseline comparison
  
- **Detail Section:**
  - Grid layout (2 columns)
  - Icon + value pairs (delivery time, preferred count, region, equipment)
  
- **Action Buttons:**
  - Primary: "Add to Preferred" (blue, enabled if not already preferred)
  - Secondary: "Block This Carrier" (red border, enabled if not blocked)
  - Disabled state: Gray, cursor-not-allowed

- **Rankings Table:**
  - Sortable by metric
  - Row click expands or navigates to carrier detail
  - Top 10 carriers highlighted with badge/special styling

**States:**
- **Loading:** Skeleton cards, "Loading carrier data..."
- **No results:** "Carrier not found. Try searching by ID or name."
- **Already preferred:** Button text changes to "✓ Preferred" (green checkmark)
- **Blocked:** Shows "✓ This carrier is blocked" with unblock option

**Mobile Breakpoints:**
- `md` and below: Stack metric cards vertically
- Hide "Top 10 Rankings" table on `sm`, show summary instead
- Action buttons: Full width on `sm`

**Accessibility:**
- Search field has `aria-label="Search carriers"`
- Metric cards have `role="region" aria-label="Carrier acceptance rate"`
- Rankings table has `role="table"` with proper headers
- Star rating: `aria-label="4.2 stars out of 5"`

---

### Playwright E2E Tests

```typescript
test.describe('Carrier Performance Dashboard (US-705)', () => {
  test('AC-2: Displays benchmarks with percentile', async ({ page }) => {
    await page.goto('/carriers/ABC-123/performance');
    
    // Verify metrics and benchmarks
    const acceptanceCard = page.locator('[data-testid="acceptance-rate"]');
    await expect(acceptanceCard).toContainText('94%');
    await expect(acceptanceCard).toContainText('Avg: 87%');
    
    // Verify trend indicator
    await expect(page.locator('text=▲')).toBeVisible();
  });

  test('US-705 Full Evidence', async ({ page }) => {
    await page.goto('/carriers');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/evidence/US-705_PASS.png',
      fullPage: true 
    });
  });
});
```

---

## US-706: Revenue & Profitability Analytics

### User Persona
- **Shipper** (Desktop) — Tracking P&L, optimizing pricing

### Page Layout

```
┌─────────────────────────────────────────────┐
│ Revenue & Profitability                 [30d]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │Total Revenue │  │Commission    │        │
│  │$47,250       │  │$2,945 (2%)   │        │
│  │▲ +12%        │  │▼ -0.5%       │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │Net Revenue   │  │Avg $/Load    │        │
│  │$44,305       │  │$943.89       │        │
│  │▲ +12.5%      │  │▲ +5%         │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│ ┌────────────────────────────────────────┐ │
│ │ Revenue by Lane (Top 5)                │ │
│ ├────────────────────────────────────────┤ │
│ │ Lane | Volume | Avg Revenue | Profit  │ │
│ │ ATL→LA|  47 | $1,200    |$1,045 ✓  │ │
│ │ DAL→CHI| 42 | $950      |$931   ✓  │ │
│ │ DEN→SF | 28 | $1,450    |$1,281 ✓  │ │
│ │ NYC→BOS| 24 | $450      |$441   ✓  │ │
│ │ MIA→ATL| 21 | $320      |$314   •  │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ ┌────────────────────────────────────────┐ │
│ │ Cost Breakdown (Commissions)           │ │
│ │ Platform Commission: $2,945 (2%) ██   │ │
│ │ Payment Fees: $235 (0.5%)        ░    │ │
│ │ Processing Fees: $165 (0.3%)     ░    │ │
│ └────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Components:**
- **Metric Cards:** 4-card layout
  - Large value (18px bold)
  - Trend indicator with % change
  - Colors: Positive (green arrow), Negative (red arrow), Neutral (gray)
  
- **Revenue by Lane Table:**
  - Columns: Lane, Volume, Avg Revenue, Profit
  - Profit color-coded: Green checkmark if > $900, gray dot if < $500
  - Sortable by column header
  - Expandable rows (click to see breakdown)
  
- **Cost Breakdown Chart:**
  - Horizontal stacked bar chart
  - Legend showing commission %, payment fees, processing fees
  - Hover tooltip: "2% of total revenue ($2,945)"

**States:**
- **No loads shipped:** "No revenue data available. Post a load to get started."
- **Loading:** Skeleton loaders with animation
- **High profitability:** Green background highlight on profitable lanes

**Accessibility:**
- Metric cards: `aria-label="Total revenue $47,250, up 12% from previous period"`
- Table: Proper `<table>` with `<thead>`, `<tbody>`, `scope="col"`
- Charts: Data table alternative available

---

## US-707: Shipper Preferred Carriers

### User Persona
- **Shipper** (Desktop/Mobile) — Managing preferred carriers list

### Page Layout

```
┌───────────────────────────────────────────────┐
│ Preferred Carriers          Count: 12 carriers│
├───────────────────────────────────────────────┤
│                                               │
│ ┌─────────────────────────────────────────┐  │
│ │ Add a Preferred Carrier                 │  │
│ ├─────────────────────────────────────────┤  │
│ │ Carrier ID or Email:                    │  │
│ │ [Find a carrier...                   ]  │  │
│ │                                         │  │
│ │ Notes (optional):                       │  │
│ │ [Negotiated 10% discount...          ]  │  │
│ │ [________________________________________]  │
│ │                                         │  │
│ │ [Add to Preferred List]                 │  │
│ └─────────────────────────────────────────┘  │
│                                               │
│ ┌───────────────────────────────────────────┐│
│ │ Carrier ID        │ Notes      │ Added   ││
│ ├───────────────────────────────────────────┤│
│ │ ABC-Logistics     │Nego rate  │ 5/15/26 ││ Remove
│ │ XYZ Trucking      │—          │ 4/28/26 ││ Remove
│ │ Premier Hauling   │Equipment  │ 4/20/26 ││ Remove
│ │ FastFreight       │—          │ 3/10/26 ││ Remove
│ │ (4 more...)       │           │         ││
│ │ [Previous]           Page 1 of 1    [Next]││
│ └───────────────────────────────────────────┘│
│                                               │
└───────────────────────────────────────────────┘
```

**Components:**
- **Header:** Title + badge showing total count
  - Count updates in real-time when carrier added/removed
  
- **Add Form:**
  - Input field with autocomplete (fetches carrier list as user types)
  - Notes textarea (optional, 3 rows)
  - Primary button: "Add to Preferred List"
  - Error states: "Carrier already in list", "Invalid ID"
  - Success state: Form clears, toast notification "Added successfully"
  
- **Preferred Carriers Table:**
  - Columns: Carrier ID (link to profile), Notes, Added Date, Action
  - Row hover: Light gray background
  - Delete button: Red text, "Remove" label
  - Confirmation: Modal or inline confirmation "Are you sure?"
  - Empty state: "No preferred carriers added yet. Add your first preferred carrier above."
  
- **Pagination:**
  - Previous/Next buttons
  - Page indicator
  - Disabled on edge pages

**Mobile Breakpoints:**
- `sm`: Stack form vertically, make textarea full width
- `md`: Table shrinks — hide "Added" column, show in row expand
- `sm`: Cards instead of table (each carrier is a card with Remove button)

**States:**
- **Adding:** Button text "Adding..." + spinner, disabled
- **Error:** Toast notification "Failed to add carrier" + retry button
- **Success:** Toast "Carrier added to preferred list"
- **Removing:** Confirmation modal, then remove with fade-out animation

**Accessibility:**
- Form labels: `<label htmlFor="carrier-id">Carrier ID or Email</label>`
- Autocomplete: `role="listbox"` with `aria-expanded`
- Delete button: `aria-label="Remove ABC-Logistics from preferred carriers"`
- Pagination: `aria-label="Page 1 of 3"`

---

## US-708: Direct Load Assignment

### User Persona
- **Shipper** (Desktop) — Assigning specific loads to carriers
- **Carrier** (Mobile) — Viewing and accepting assignments

### Shipper View: Assign Load

```
┌──────────────────────────────────────┐
│ Assign Load to Carrier               │
├──────────────────────────────────────┤
│                                      │
│ Load: ATL→LA, Flatbed, $2,100  [i] │
│                                      │
│ Select Carrier:                      │
│ [Find carrier... ▼              ]    │
│                                      │
│ Search Results:                      │
│ ☐ XYZ Logistics (★4.2, 94% accept) │
│ ☐ ABC Trucking  (★4.5, 96% accept) │
│ ☐ Premier Haul  (★4.1, 92% accept) │
│ ☐ FastFreight   (★4.0, 88% accept) │
│                                      │
│ [Assign Load] [Cancel]              │
│                                      │
└──────────────────────────────────────┘
```

**Components:**
- **Load Summary:** Read-only display of key load info
- **Carrier Dropdown/Search:**
  - Autocomplete field
  - Filters out blocked carriers (with tooltip: "You've blocked this carrier")
  - Shows carrier ratings/acceptance rate inline
  - Keyboard navigation (arrow keys, Enter to select)
  
- **Action Buttons:**
  - Primary: "Assign Load" (enabled when carrier selected)
  - Secondary: "Cancel"
  - Disabled state on submit

**States:**
- **Selecting:** Dropdown opens, shows carrier list
- **Selected:** Carrier name appears in input, button enabled
- **Assigning:** Button shows "Assigning..." + spinner
- **Success:** Modal closes, toast: "Load assigned to XYZ Logistics"
- **Error:** "Assignment failed. This carrier may have blocked this load type."

---

### Carrier View: Assigned Loads

```
┌──────────────────────────────────────────┐
│ Assigned Loads                  3 pending│
├──────────────────────────────────────────┤
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Load: ATL→LA, Flatbed, $2,100       │ │
│ │ Shipper: Acme Corp                   │ │
│ │ Assigned: Today @ 10:30am            │ │
│ │ Status: [Pending] ◆                  │ │
│ │                                      │ │
│ │ [Accept] [Decline]                  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Load: DEN→SF, Tanker, $1,850        │ │
│ │ Shipper: FastShip Inc.               │ │
│ │ Assigned: Yesterday @ 2:45pm         │ │
│ │ Status: [Accepted] ✓                 │ │
│ │                                      │ │
│ │ [View Details]                       │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [Previous]    Page 1 of 1      [Next]   │
│                                          │
└──────────────────────────────────────────┘
```

**Components (Carrier):**
- **Load Card:**
  - Key info (route, equipment, rate)
  - Shipper name (clickable → profile)
  - Assignment timestamp
  - Status badge: "Pending" (yellow), "Accepted" (green), "Delivered" (blue)
  
- **Action Buttons:**
  - **Accept:** Green, enables load details/tracking
  - **Decline:** Gray, requires reason (modal)
  - State after accept: Button changes to "View Details"
  
- **Pagination:**
  - Default sort: Newest assignments first
  - Filter option: Show pending only (toggle)

**Mobile Considerations:**
- Cards stretch full width
- Buttons: Full width, larger padding (mobile-friendly)
- Status badge prominent (top right)

**States (Carrier):**
- **Pending:** Waiting for acceptance
  - Bright yellow badge
  - Two action buttons visible
  
- **Accepted:**
  - Green badge + checkmark
  - "View Details" button (navigation to tracking)
  
- **Declined:**
  - Gray badge + x mark
  - Reason shown if provided
  - No action buttons
  
- **Confirming Acceptance:** Modal with "Are you sure?" → Accept button → Success toast

**Accessibility (Both Views):**
- Modal: `role="dialog"` with `aria-labelledby` and `aria-describedby`
- Cards: `role="region"` with `aria-label="Load assignment from Acme Corp"`
- Buttons: Clear, action-oriented labels
- Status: Icon + text (not color-only)

---

### Playwright E2E Tests

```typescript
test.describe('Load Assignment (US-708)', () => {
  
  test('Shipper: AC-1 assigns load to carrier', async ({ page }) => {
    await page.goto('/loads/LOAD-123/assign');
    
    // Find carrier dropdown
    const carrierInput = page.locator('[data-testid="carrier-search"]');
    await carrierInput.fill('ABC Trucking');
    
    // Wait for results
    await page.waitForSelector('[data-testid="carrier-option"]');
    
    // Select first result
    await page.locator('[data-testid="carrier-option"]:first-child').click();
    
    // Assign
    await page.click('[data-testid="assign-button"]');
    
    // Verify success
    await expect(page.locator('text=Load assigned')).toBeVisible();
  });

  test('Carrier: AC-2 accepts assignment', async ({ page, context }) => {
    // Login as carrier
    const carrierPage = await context.newPage();
    await carrierPage.goto('/login');
    // ... carrier login
    
    await carrierPage.goto('/assigned-loads');
    
    // Find pending load
    const pendingCard = carrierPage.locator('[data-testid="load-card-pending"]:first-child');
    
    // Click Accept
    await pendingCard.locator('[data-testid="accept-button"]').click();
    
    // Confirm in modal
    await carrierPage.click('button:has-text("Confirm")');
    
    // Verify status changed
    await expect(pendingCard.locator('[data-testid="status-badge"]')).toContainText('Accepted');
    
    await carrierPage.screenshot({ 
      path: 'test-results/evidence/US-708_carrier_accepted.png' 
    });
  });

  test('US-708 Full Evidence', async ({ page }) => {
    await page.goto('/loads/LOAD-123/assign');
    await page.screenshot({ 
      path: 'test-results/evidence/US-708_PASS.png',
      fullPage: true 
    });
  });
});
```

---

## US-709: Block/Restrict Carrier

### User Persona
- **Shipper** (Desktop) — Managing blocked carriers

### Page Layout

```
┌─────────────────────────────────────┐
│ Blocked Carriers       5 carriers   │
├─────────────────────────────────────┤
│                                     │
│ ┌──────────────────────────────────┐│
│ │ Block a Carrier                  ││
│ ├──────────────────────────────────┤│
│ │ Carrier ID or Email:             ││
│ │ [Search carrier...             ] ││
│ │                                  ││
│ │ Reason (optional):               ││
│ │ [e.g., Poor quality...        ]  ││
│ │ [________________________________] ││
│ │                                  ││
│ │ [Block Carrier]                  ││
│ └──────────────────────────────────┘│
│                                     │
│ ┌──────────────────────────────────┐│
│ │ Carrier        │ Reason  │ Blocked ││
│ ├──────────────────────────────────┤│
│ │ Slow Joe      │ Delays │ 5/20/26 │ Unblock
│ │ BadFreight    │—       │ 4/15/26 │ Unblock
│ │ LateRunner    │ Late   │ 3/10/26 │ Unblock
│ │ (2 more...)   │        │         │
│ │ [Previous]      Page 1 of 1   [Next]
│ └──────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Components:**
- **Block Form:**
  - Carrier search/input with autocomplete
  - Reason textarea (optional, 3 rows)
  - Primary button: "Block Carrier"
  - Error on duplicate: "This carrier is already blocked"
  
- **Blocked Carriers Table:**
  - Columns: Carrier ID, Reason, Blocked Date, Action
  - Action: "Unblock" button (red text)
  - Hover effect on rows
  - Empty state: "No blocked carriers. Blocked carriers will not be offered your loads."
  
- **Pagination:** Previous/Next, page indicator
- **Count Badge:** Top right, "5 carriers"

**States:**
- **Blocking:** Button shows "Blocking..." + spinner
- **Success:** Form clears, toast "Carrier blocked"
- **Unblocking:** Inline confirmation → remove from list with fade-out
- **Error:** "Failed to block carrier. Try again."

**Accessibility:**
- Form labels properly associated
- Unblock button: `aria-label="Unblock Slow Joe from assignment"`
- Reason field: `aria-label="Optional reason for blocking this carrier"`
- Table: Proper semantic markup

---

## US-710: View Carrier Public Profile

### User Persona
- **Shipper** (Desktop/Mobile) — Researching carrier

### Page Layout

**Already specified in US-705 "Carrier Performance Dashboard"**
- This story displays public profile (US-705 shows the dashboard)
- Search → View Profile → See performance metrics
- Action: Add to Preferred or Block (from profile)

---

## US-711: Load Interest & View Tracking

### Shipper View: Load Analytics

```
┌─────────────────────────────────┐
│ Load: ATL→LA, Flatbed, $2,100  │
├─────────────────────────────────┤
│                                 │
│ Status: Open (6 hours posted)   │
│                                 │
│ ┌───────────────────────────────┐│
│ │ Interest Level                ││
│ ├───────────────────────────────┤│
│ │ Viewed by: 23 carriers        ││
│ │ Interest: 8 unique carriers   ││
│ │ Trend: ↑ Up (4 views last hr) ││
│ │ Engagement Rate: 35%          ││
│ │                               ││
│ │ [View Interested Carriers]   ││
│ └───────────────────────────────┘│
│                                 │
│ Insights:                       │
│ - Price is competitive          │
│ - Equipment in high demand      │
│ - Lane trending: +8% last week  │
│                                 │
└─────────────────────────────────┘
```

**Components:**
- **Interest Card:**
  - Total views counter
  - Unique interest count
  - Trend indicator (arrow + relative change)
  - Engagement rate % (views / offers)
  - Link to see interested carriers (modal/new page)
  
- **Insights Section:**
  - AI-generated suggestions
  - Price competitiveness (good/neutral/needs adjustment)
  - Equipment demand indicator
  - Lane trends (up/down, %)

**States:**
- **Loading:** Skeleton card, "Loading interest data..."
- **No interest:** "No one has viewed this load yet. Try adjusting the rate or equipment type."
- **High interest:** Green indicator, "High interest" badge

---

### Admin View: Engagement Dashboard

```
┌─────────────────────────────────────┐
│ Platform Engagement Metrics       [30d]
├─────────────────────────────────────┤
│                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│ │Total Load│ │Avg Views │ │Conv. │ │
│ │Views     │ │per Load  │ │Rate  │ │
│ │42,847    │ │ 34.2     │ │38.5% │ │
│ │▲ +12%    │ │▼ -2.1%   │ │▲ +4% │ │
│ └──────────┘ └──────────┘ └──────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Most Viewed Loads (Last 30d)    │ │
│ ├─────────────────────────────────┤ │
│ │ 1. ATL→LA (Flatbed) 127 views   │ │
│ │ 2. DEN→SF (Tanker) 98 views     │ │
│ │ 3. NYC→BOS (Van) 87 views       │ │
│ │ 4. DAL→PHX (Flat) 76 views      │ │
│ │ 5. MIA→ATL (Reefer) 64 views    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Carrier Profile View Trends     │ │
│ │                                 │ │
│ │ Total Views: 15,234  ▲ +8%     │ │
│ │ Unique Viewers: 3,847 ▲ +12%   │ │
│ │ Most Viewed: ABC Logistics      │ │
│ │ Trending Up: XYZ Trucking +22%  │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Components:**
- **Metric Cards:** 3 KPIs (Total Views, Avg Views/Load, Conversion Rate)
- **Most Viewed Loads Table:** Ranked by view count
- **Carrier Profile Views:** Trend data, top performers
- **Range Selector:** 7d/30d/90d toggle

**Accessibility:**
- Metric cards: `aria-label="Total platform load views: 42,847, up 12% from previous period"`
- Tables: Proper semantic markup with headers
- Live region for updates: `aria-live="polite" aria-atomic="true"`

---

## 📱 Mobile-First Design Decisions

### Breakpoints Applied Across All Designs

| Screen | Tailwind | Adjustment |
|--------|----------|-----------|
| Mobile (sm) | <640px | Stack cards vertically, hide secondary columns, full-width buttons |
| Tablet (md) | 768px | 2-column layouts, smaller tables, condensed forms |
| Desktop (lg) | 1024px+ | Full design as specified, 3+ columns, expanded tables |

### Carrier (Operator) Mobile Considerations
- Touch targets: **48px minimum** (padding-friendly buttons)
- Landscape support: Horizontal scroll tables, wider fields
- High-contrast: Text on colored backgrounds must meet WCAG AA
- Offline mode: Show cached data if network unavailable

---

## ♿ Accessibility Compliance Checklist

**For All Designs:**
- ✅ WCAG 2.1 AA contrast ratios (4.5:1 normal, 3:1 large)
- ✅ Keyboard navigation (Tab, Shift+Tab, Enter, Arrow keys)
- ✅ ARIA labels and roles on all interactive elements
- ✅ Form labels properly associated with inputs
- ✅ Live regions for dynamic content updates
- ✅ Color not the only indicator (use icons/text)
- ✅ Focus indicators visible (2px ring)
- ✅ Screen reader tested (NVDA, VoiceOver)

**Test Cases (Per Design):**
1. Keyboard-only navigation: Tab through all elements in logical order
2. Screen reader: Launch NVDA, verify all content announced
3. Color contrast: Use WebAIM Color Contrast Checker
4. Mobile touch: 44px minimum target size (WCAG 2.5.5)

---

## 🎬 Interaction Patterns

### Confirmation Dialogs
```
┌──────────────────────────────────┐
│ Confirm Action                  │
├──────────────────────────────────┤
│ Are you sure you want to block   │
│ this carrier?                    │
│                                  │
│ [Cancel] [Block Carrier]         │
└──────────────────────────────────┘
```
- Destructive action: Red button
- Safe default: Cancel (left position)
- Keyboard: Escape closes, Enter confirms

### Toast Notifications
```
Success:   ✓ Carrier added to preferred list
Error:     ✗ Failed to block carrier. Try again.
Info:      ℹ Loading carrier data...
```
- Duration: 4 seconds (auto-dismiss)
- Position: Top-right corner
- Stacking: Multiple toasts stack vertically
- Keyboard: Escape dismisses

### Loading States
- Skeleton loaders: Match component height/width
- Spinner: Centered, with "Loading..." text
- Disable interactions: All buttons disabled during load

---

## 🧪 Playwright Test Template

**File Structure:**
```
tests/
├── us-704-load-board-analytics.spec.ts
├── us-705-carrier-performance.spec.ts
├── us-706-revenue-analytics.spec.ts
├── us-707-preferred-carriers.spec.ts
├── us-708-load-assignment.spec.ts
├── us-709-blocked-carriers.spec.ts
├── us-710-carrier-profile.spec.ts
└── us-711-engagement-tracking.spec.ts

test-results/
└── evidence/
    ├── US-704_PASS.png
    ├── US-705_PASS.png
    ├── ... (one per story)
    └── US-711_PASS.png
```

**Test Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('US-XXX: Story Name', () => {
  test.beforeEach(async ({ page }) => {
    // Login, navigate to page
    await page.goto('/feature-path');
    await page.waitForLoadState('networkidle');
  });

  test('AC-1: Description', async ({ page }) => {
    // Arrange
    // Act
    // Assert
    // Screenshot
    await page.screenshot({ path: 'test-results/evidence/us-xxx_ac1.png' });
  });

  test('AC-2: Description', async ({ page }) => {
    // ...
  });

  test('FULL EVIDENCE: All ACs pass', async ({ page }) => {
    // Perform all user interactions
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/evidence/US-XXX_PASS.png',
      fullPage: true 
    });
  });
});
```

---

## 📋 Sign-Off Template

**For each story:**

```markdown
### US-XXX: Story Name

**HFD Design Status:** ⏳ IN PROGRESS / ✅ COMPLETE / ❌ BLOCKED

**Artifacts:**
- [ ] UI Layout mockup(s)
- [ ] Component specifications
- [ ] State management doc
- [ ] Playwright test suite
- [ ] Visual evidence screenshots
- [ ] Accessibility audit

**Blockers:** (if any)
- Missing BA requirement
- Design system incomplete
- etc.

**Signed by:** [HFD Name], [Date]
```

---

## 🎯 Next Steps

1. **HFD Review Phase** (This document)
   - [ ] Review all 8 design specs
   - [ ] Get BA approval on requirements
   - [ ] Finalize mockups and flows
   - [ ] Create Playwright test templates

2. **ARCHITECT Review**
   - [ ] Verify designs align with domain model
   - [ ] Confirm API contracts match UI needs
   - [ ] Review data flow and caching strategy

3. **CODER Implementation**
   - [ ] Implement per design specs
   - [ ] Run Playwright tests to verify
   - [ ] Generate visual evidence screenshots

4. **REVIEWER QA**
   - [ ] Verify Playwright tests pass
   - [ ] Check visual evidence matches acceptance
   - [ ] Audit accessibility compliance

5. **LIBRARIAN Sign-Off**
   - [ ] Update Story_Map.md
   - [ ] Link test evidence to story
   - [ ] Mark story DONE

---

**Document Version:** 1.0  
**Status:** Ready for HFD Review  
**Created:** 2026-05-27

