# HFD Design: US-710 — View Carrier Public Profile

**Story:** US-710  
**Phase:** 7  
**Status:** HFD_APPROVED  
**Created:** 2026-05-29  
**Designer:** Human Factors Team  

---

## User Flow

```
1. Shipper browses load board or searches for carriers
2. Shipper clicks on carrier name or [View Profile] link
3. Browser navigates to /carriers/{carrierId}
4. Page loads showing:
   - Carrier header (name, years in business, logo)
   - Performance metrics (4 cards)
   - Benchmark comparison (visual indicators)
   - Social proof (views + preferred count)
   - Service areas & equipment types
   - [Add to Preferred] button (prominent)
5. Shipper scrolls to review all metrics
6. Shipper clicks [Add to Preferred] button
7. Success toast: "Added to preferred carriers"
8. Button changes to [Added ✓] (disabled state)
```

---

## Page Layout: Carrier Performance Profile

```
┌─────────────────────────────────────────────────┐
│  FreightClub Load Board                   [↩️]  │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ FedEx Freight Leasing         Est. 1984  │   │
│  │ fedex-freight                             │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  ┌────────────┬────────────┬────────────────┐   │
│  │📊 Acceptance│📦 On-Time  │📈 Quality     │   │
│  │ Rate        │ Delivery   │ Score         │   │
│  │ 96.5%       │ 98.2%      │ 94/100        │   │
│  │🟢 Top 2%   │🟢 Top 1%   │🟢 Top 3%      │   │
│  │ vs 85.3%   │ vs 92.1%   │ vs 78         │   │
│  └────────────┴────────────┴────────────────┘   │
│                                                   │
│  📌 Service Areas: CA, NV, AZ, UT               │
│  🚛 Equipment: Dry Van | Flatbed | Reefer      │
│                                                   │
│  ✨ Social Proof                                │
│  👁️  Viewed by 156 shippers (last 30d)         │
│  ❤️  Preferred by 312 shippers                 │
│  📈 Trending: ↑ (up 15% from last week)        │
│                                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ Average Delivery Time: 42 hours           │  │
│  │ Loads Accepted: 5,420 | Completed: 5,401 │  │
│  └──────────────────────────────────────────┘  │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │        [❤️ Add to Preferred Carriers]   │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Performance Metrics Card Design

```
┌──────────────────┐
│ 📊 Acceptance    │
│ Rate             │
│                  │
│ 96.5%            │
│                  │
│ 🟢 Top 2%        │
│ (vs 85.3% avg)   │
│                  │
│ Platform avg:    │
│ 85.3%            │
└──────────────────┘
```

**Card Elements:**
- Icon (metric-specific)
- Metric name
- Large value (metric-specific formatting)
- Color indicator (🟢 green, 🟡 yellow, 🔴 red)
- Percentile rank ("Top X%")
- Platform average for comparison
- Subtle background color based on performance

---

## Color Coding Strategy

### Performance Indicator Colors

**Green (Above Average):**
- Metric > platform_average
- Text: "🟢 Top X%" 
- Background: light green tint (#E6F7E6)

**Yellow (At Average):**
- Metric within ±5% of platform_average
- Text: "🟡 Average"
- Background: light yellow tint (#FFF8E6)

**Red (Below Average):**
- Metric < (platform_average × 0.95)
- Text: "🔴 Below Average"
- Background: light red tint (#FFE6E6)

---

## Benchmark Comparison Section

```
Performance vs. Platform Average

Acceptance Rate:        96.5% ▰▰▰▰▰▰▰▰▰▰ Platform: 85.3%
On-Time Delivery:      98.2% ▰▰▰▰▰▰▰▰▰▰ Platform: 92.1%
Quality Score:            94 ▰▰▰▰▰▰▰▰▰▰ Platform:    78

Legend:
🟢 Above average (+2% or more)
🟡 At average (within 2%)
🔴 Below average (-2% or less)
```

---

## Social Proof Display

```
✨ Carrier Popularity & Reputation

👁️ Viewed by 156 shippers (last 30 days)
   📈 Up 12% from previous period

❤️ Preferred by 312 shippers
   Across all loads & industries

Quick Stats:
• Acceptance rate puts them in top 2% of carriers
• 98% of shippers rate on-time performance as "excellent"
• No quality complaints in last 30 days
```

---

## Component Specifications

### CarrierProfile Component

**Props:**
```typescript
interface CarrierProfileProps {
  carrierId: string;
}
```

**State:**
- `carrier`: CarrierPerformance | null
- `isLoading`: boolean
- `error`: ErrorType | null
- `isPreferred`: boolean (from preferred carriers list)
- `isAddingToPreferred`: boolean

**Interactions:**
- Load on mount: GET /api/v1/carriers/{carrierId}/performance
- Click [Add to Preferred]: POST /api/v1/shippers/preferred-carriers
- Show loading spinner while fetching
- Show error banner if load fails
- Disable [Add to Preferred] button if already preferred

**Accessibility:**
- `role="main" aria-label="Carrier profile"`
- Metric cards: semantic HTML <section>
- Social proof: `aria-label="Social proof metrics"`
- Button: `aria-label="Add {carrierName} to your preferred carriers list"`
- Benchmark comparison: `role="region" aria-label="Performance benchmarks"`

---

### PerformanceMetricCard Component

**Props:**
```typescript
interface PerformanceMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  percentile: number;
  platformAverage: number;
  indicator: 'green' | 'yellow' | 'red';
  icon: React.ReactNode;
}
```

**Display Logic:**
- Value rendered in large font (48px)
- Percentile as "Top X%" with color indicator
- Platform average shown below for context
- Card background color based on indicator

---

### BenchmarkComparison Component

**Props:**
```typescript
interface BenchmarkComparisonProps {
  acceptanceRate: number;
  platformAcceptanceRate: number;
  onTimeRate: number;
  platformOnTimeRate: number;
  qualityScore: number;
  platformQualityScore: number;
}
```

**Visual:**
- Horizontal bar charts (Tailwind progress bars)
- Each metric shows:
  - Carrier value (left)
  - Colored bar
  - Platform average (right)
  - Percentile rank
- Color-coded: green/yellow/red

---

### SocialProofMetrics Component

**Props:**
```typescript
interface SocialProofMetricsProps {
  viewedByCount: number;
  preferredByCount: number;
  trendingDirection: 'up' | 'down' | 'stable';
}
```

**Display:**
- Metric cards showing:
  - Count (large number)
  - Description ("Viewed by X shippers")
  - Trend indicator (📈 ↑ 12%)
- Eye icon for views, heart icon for preferred

---

## Empty State (Carrier Not Found)

```
┌─────────────────────────┐
│                          │
│        🚚❌              │
│                          │
│   Carrier Not Found      │
│                          │
│   This carrier is not    │
│   available in your      │
│   region or has been     │
│   removed.               │
│                          │
│   [← Back to Board]      │
│                          │
└─────────────────────────┘
```

---

## Loading State

```
┌────────────────────────┐
│  [Skeleton Header]      │
│                         │
│  ▭▭▭▭▭▭▭▭▭ ▭▭▭▭▭▭▭▭▭  │
│  ▭▭▭▭▭▭▭▭▭ ▭▭▭▭▭▭▭▭▭  │
│  ▭▭▭▭▭▭▭▭▭ ▭▭▭▭▭▭▭▭▭  │
│                         │
│  ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  │
│                         │
└────────────────────────┘
```

---

## Error State

```
┌────────────────────────┐
│ ⚠️ Failed to load      │
│ carrier profile        │
│                        │
│ Unable to connect to   │
│ server. Try again.     │
│                        │
│ [Retry]                │
└────────────────────────┘
```

---

## Responsive Design

### Desktop (≥1024px)
- 2x2 grid for metrics cards
- Benchmark section full-width below
- Social proof sidebar or centered below
- [Add to Preferred] button full-width at bottom

### Tablet (768-1023px)
- 2x2 grid for metrics (responsive sizing)
- Benchmark section scrollable horizontally if needed
- All sections stack vertically

### Mobile (≤767px)
- 1x4 stack for metric cards (full-width)
- Benchmark section: one metric at a time (carousel or accordion)
- Social proof: stacked vertically
- [Add to Preferred] button: sticky at bottom (iOS safe area)
- Font sizes reduced for readability on small screens

---

## Playwright Test Specifications

### Test File Location
`frontend/e2e/carrier-public-profile.spec.ts`

### Test Cases with Visual Evidence

**Test 1: AC-1 - View Performance Profile**
```typescript
test('AC-1: Shipper views carrier performance profile', async ({ page }) => {
  // Setup: Navigate to /carriers/fedex-freight
  
  // Verify page loads
  await expect(page).toHaveURL(/fedex-freight/);
  
  // Verify header
  await expect(page.locator('h1:has-text("FedEx")')).toBeVisible();
  
  // Verify performance metrics
  await expect(page.locator('text=Acceptance Rate')).toBeVisible();
  await expect(page.locator('text=On-Time Delivery')).toBeVisible();
  await expect(page.locator('text=Quality Score')).toBeVisible();
  
  // Verify metric values (percentages)
  const acceptanceRate = page.locator('text=/\\d+%/').first();
  await expect(acceptanceRate).toBeVisible();
  
  // Verify Add to Preferred button
  const addBtn = page.locator('button:has-text("Add to Preferred")');
  await expect(addBtn).toBeVisible();
  await expect(addBtn).toBeEnabled();
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-710-profile.png' });
});
```

**Test 2: AC-2 - Benchmark Comparison**
```typescript
test('AC-2: Benchmark comparison displays correctly', async ({ page }) => {
  // Setup: On carrier profile
  
  // Verify benchmark section
  await expect(page.locator('text=Benchmark Comparison')).toBeVisible();
  
  // Verify comparison shows carrier vs platform avg
  await expect(page.locator('text=vs .* avg')).toBeDefined();
  
  // Verify progress bars or visual comparison
  const benchmarkMetrics = page.locator('[role="progressbar"]');
  expect(await benchmarkMetrics.count()).toBeGreaterThan(0);
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-710-benchmark.png' });
});
```

**Test 3: AC-3 - Social Proof**
```typescript
test('AC-3: Carrier interest count displays social proof', async ({ page }) => {
  // Setup: On carrier profile
  
  // Verify Viewed by metric
  await expect(page.locator('text=Viewed by')).toBeVisible();
  
  // Verify Preferred by metric
  await expect(page.locator('text=Preferred by')).toBeVisible();
  
  // Verify numbers display
  const viewedText = await page.locator('text=Viewed by').locator('..').textContent();
  expect(viewedText).toMatch(/\\d+/);
  
  const preferredText = await page.locator('text=Preferred by').locator('..').textContent();
  expect(preferredText).toMatch(/\\d+/);
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-710-social-proof.png' });
});
```

**Test 4: AC-4 - Multi-Tenancy Isolation**
```typescript
test('AC-4: Multi-tenancy isolation enforced', async ({ page }) => {
  // Setup: Shipper A views carrier profile
  
  // Verify metrics shown (should be for shipper A's tenant only)
  await expect(page.locator('text=Acceptance Rate')).toBeVisible();
  
  // Metrics should NOT include cross-tenant data
  // (Verified via API mock in test setup)
  
  // Verify preferred-by count is tenant-specific
  const preferredCount = await page.locator('text=Preferred by').locator('..').textContent();
  expect(preferredCount).toMatch(/\\d+/);
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-710-isolation.png' });
});
```

**Test 5: Add to Preferred Button**
```typescript
test('Shipper can add carrier to preferred list from profile', async ({ page }) => {
  // Setup: On carrier profile, not yet preferred
  
  // Click Add to Preferred
  const addBtn = page.locator('button:has-text("Add to Preferred")');
  await addBtn.click();
  
  // Verify success
  await expect(page.locator('text=added to preferred')).toBeVisible();
  
  // Verify button changes to Added state
  const addedBtn = page.locator('button:has-text("Added")');
  await expect(addedBtn).toBeVisible();
  await expect(addedBtn).toBeDisabled();
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-710-add-preferred.png' });
});
```

---

## Handed Off To

**Next Phase:** CODER implements the UI components following TDD:
1. CarrierProfile component (main page)
2. PerformanceMetricCard component (reusable)
3. BenchmarkComparison component
4. SocialProofMetrics component
5. useCarrierProfile custom hook
6. API integration via axios
7. Routing: `/carriers/{carrierId}`

**CODER Must Provide:**
- React components in `src/features/carriers/components/`
- Custom hooks in `src/features/carriers/hooks/`
- Route configuration in App.tsx
- Playwright tests with visual evidence
- ≥80% branch coverage
