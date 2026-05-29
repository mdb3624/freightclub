# HFD Design: US-710 View Carrier Public Profile

**Version:** 1.0  
**Created:** 2026-05-28  
**HFD Approval:** Pending review  
**Status:** DESIGN PHASE

---

## User Stories Addressed
- **US-710 AC-1:** Shipper views carrier performance profile
- **US-710 AC-2:** Benchmark comparison against industry
- **US-710 AC-3:** Carrier interest count (social proof)
- **US-710 AC-4:** Multi-tenancy isolation

---

## Design Constraints
- **Shipper Focus:** Quick assessment of carrier quality
- **Mobile Safe:** Readable on mobile, large touch targets
- **Style Guide Compliance:** MANDATORY
- **Social Proof:** Emphasize "Viewed by X shippers" and "Preferred by Y shippers"

---

## Information Architecture

```
Carrier Profile Page
├── Carrier Header
│   ├── Carrier Name & Photo
│   ├── Years in Business
│   ├── Rating (Stars: 1-5)
│   └── "Add to Preferred" / "Remove from Preferred" Button
├── Key Performance Metrics (4-5 cards)
│   ├── Acceptance Rate
│   ├── On-Time Delivery Rate
│   ├── Quality Score (1-100)
│   ├── Avg Delivery Time
│   └── Social Proof Metrics
├── Service Areas Map
├── Equipment Available
├── Benchmark Comparison Chart
└── Footer: Viewed by X shippers, Preferred by Y shippers
```

---

## Visual Specification

### Carrier Header
```html
<div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 space-y-4">
  <div class="flex items-center gap-4">
    <img src="logo.png" alt="Carrier Logo" class="w-16 h-16 rounded-full bg-white p-1" />
    <div>
      <h1 class="text-3xl font-bold">FedEx Freight</h1>
      <p class="text-blue-100">Est. 2005 • 19 years in business</p>
    </div>
  </div>
  
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold">4.7</span>
    <div class="text-yellow-300">★ ★ ★ ★ ☆</div>
  </div>
  
  <button class="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 font-medium">
    + Add to Preferred
  </button>
</div>
```

- Background: Blue gradient (blue-600 to blue-700)
- Text: White
- Logo: 16x16, rounded, white background with 4px padding
- Company name: H1 (32px, bold)
- Years in business: Small text, blue-100
- Rating: Large number (24px, bold), yellow stars (gold)
- Button: White background, blue-600 text, hover blue-50

### Performance Metrics Cards (4-5 cards)
```html
<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
  <!-- Acceptance Rate -->
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <p class="text-xs text-gray-600 font-medium">Acceptance Rate</p>
    <p class="text-3xl font-bold text-green-600">92%</p>
    <p class="text-xs text-gray-500">Loads accepted vs offered</p>
  </div>
  
  <!-- On-Time Delivery -->
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <p class="text-xs text-gray-600 font-medium">On-Time Delivery</p>
    <p class="text-3xl font-bold text-green-600">88%</p>
    <p class="text-xs text-gray-500">Delivered by promise date</p>
  </div>
  
  <!-- Quality Score -->
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <p class="text-xs text-gray-600 font-medium">Quality Score</p>
    <p class="text-3xl font-bold text-blue-600">87/100</p>
    <p class="text-xs text-gray-500">Damage/theft/compliance</p>
  </div>
  
  <!-- Avg Delivery Time -->
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <p class="text-xs text-gray-600 font-medium">Avg Delivery</p>
    <p class="text-3xl font-bold text-blue-600">38h</p>
    <p class="text-xs text-gray-500">Pickup to delivery</p>
  </div>
  
  <!-- Social Proof -->
  <div class="bg-white rounded-lg shadow p-4 space-y-2">
    <p class="text-xs text-gray-600 font-medium">Preferred By</p>
    <p class="text-3xl font-bold text-purple-600">124</p>
    <p class="text-xs text-gray-500">Shippers on platform</p>
  </div>
</div>
```

- Card background: White
- Metric label: 12px, gray-600, medium weight
- Metric value: 32px, bold, color-coded:
  - Green-600 for high performance (>85%)
  - Blue-600 for neutral/informational
  - Purple-600 for social proof
- Context: 12px, gray-500

**Color Coding for Metrics:**
- Acceptance Rate > 85%: Green-600
- On-Time Delivery > 85%: Green-600
- Quality Score > 80: Blue-600
- Quality Score < 70: Orange-500 (warning)
- Preferred count: Purple-600 (social proof emphasis)

### Service Areas & Equipment

**Service Areas Section**
```html
<div class="space-y-4">
  <h2 class="text-2xl font-semibold text-gray-900">Service Areas</h2>
  <div class="bg-white rounded-lg shadow p-4 h-80">
    <!-- Map visualization (Google Maps or similar) -->
    <div id="service-map" class="w-full h-full rounded"></div>
  </div>
  <p class="text-sm text-gray-600">Operates primarily in Northeast and Midwest regions</p>
</div>
```

**Equipment Available**
```html
<div class="space-y-4">
  <h2 class="text-2xl font-semibold text-gray-900">Equipment Types</h2>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    <div class="bg-blue-50 rounded-lg p-4 text-center">
      <p class="font-semibold text-gray-900">Flatbed</p>
      <p class="text-sm text-gray-600">23 units</p>
    </div>
    <div class="bg-blue-50 rounded-lg p-4 text-center">
      <p class="font-semibold text-gray-900">Dry Van</p>
      <p class="text-sm text-gray-600">45 units</p>
    </div>
    <div class="bg-blue-50 rounded-lg p-4 text-center">
      <p class="font-semibold text-gray-900">Tanker</p>
      <p class="text-sm text-gray-600">12 units</p>
    </div>
    <div class="bg-blue-50 rounded-lg p-4 text-center">
      <p class="font-semibold text-gray-900">Specialized</p>
      <p class="text-sm text-gray-600">8 units</p>
    </div>
  </div>
</div>
```

### Benchmark Comparison Chart
```html
<div class="space-y-4">
  <h2 class="text-2xl font-semibold text-gray-900">Benchmark Comparison</h2>
  <p class="text-sm text-gray-600">How this carrier compares to industry average</p>
  
  <!-- Horizontal bar chart -->
  <div class="space-y-4">
    <div>
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium text-gray-900">On-Time Delivery</span>
        <span class="text-sm text-gray-600">88% vs 82% avg</span>
      </div>
      <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="bg-green-600 h-full" style="width: 88%;"></div>
      </div>
    </div>
    
    <div>
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium text-gray-900">Acceptance Rate</span>
        <span class="text-sm text-gray-600">92% vs 78% avg</span>
      </div>
      <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="bg-green-600 h-full" style="width: 92%;"></div>
      </div>
    </div>
    
    <div>
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium text-gray-900">Quality Score</span>
        <span class="text-sm text-gray-600">87 vs 75 avg</span>
      </div>
      <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="bg-blue-600 h-full" style="width: 87%;"></div>
      </div>
    </div>
  </div>
</div>
```

### Footer: Social Proof
```html
<div class="bg-blue-50 rounded-lg p-6 text-center space-y-2 mt-8">
  <p class="text-sm text-gray-600">
    👁️ Viewed by <strong>247 shippers</strong> in the last 30 days
  </p>
  <p class="text-sm text-gray-600">
    ⭐ Preferred by <strong>124 shippers</strong> on FreightClub
  </p>
  <p class="text-xs text-gray-500">This data is specific to your company's operations</p>
</div>
```

---

## Playwright E2E Specifications

### Carrier Profile Golden Path
```typescript
test('Shipper views carrier performance profile with benchmarks', async ({ page }) => {
  // Navigate to carrier profile
  await page.goto('/carriers/fedex-freight');
  
  // Verify header loads
  expect(await page.locator('h1:has-text("FedEx")').isVisible()).toBeTruthy();
  
  // Verify metric cards render
  expect(await page.locator('text=Acceptance Rate').isVisible()).toBeTruthy();
  expect(await page.locator('text=On-Time Delivery').isVisible()).toBeTruthy();
  expect(await page.locator('text=Quality Score').isVisible()).toBeTruthy();
  
  // Verify performance percentages are displayed
  expect(await page.locator('text=92%').isVisible()).toBeTruthy(); // Acceptance rate
  expect(await page.locator('text=88%').isVisible()).toBeTruthy(); // On-time delivery
  
  // Verify social proof metrics
  expect(await page.locator('text=Viewed by').isVisible()).toBeTruthy();
  expect(await page.locator('text=Preferred by').isVisible()).toBeTruthy();
  
  // Verify "Add to Preferred" button is clickable
  const addButton = page.locator('button:has-text("Add to Preferred")');
  expect(await addButton.isEnabled()).toBeTruthy();
  
  // Verify benchmark chart visible
  expect(await page.locator('text=Benchmark Comparison').isVisible()).toBeTruthy();
  
  // Screenshot for visual validation
  await page.screenshot({ path: 'test-results/evidence/US-710-carrier-profile.png' });
});
```

### Multi-Tenancy Isolation Verification
```typescript
test('Carrier metrics are isolated by tenant (multi-tenancy)', async ({ page }) => {
  // Note: This requires logging in as shipper from different tenant
  
  // Shipper A views carrier profile
  await page.goto('/carriers/fedex-freight');
  const metricsA = await page.locator('text=Preferred by').textContent();
  
  // Would need separate test context for different tenant
  // Verify: metrics shown are for THIS shipper's tenant only
  expect(await page.locator('text=This data is specific to your company').isVisible()).toBeTruthy();
});
```

---

## Accessibility Requirements

- **Header:** Logo has alt text, semantic heading hierarchy (H1, H2)
- **Metrics:** Each card has `aria-label` describing metric (e.g., "Acceptance Rate: 92%")
- **Map:** Map has fallback text description of service areas
- **Charts:** Bar charts have accessible labels, tooltip on hover
- **Buttons:** "Add to Preferred" button has clear action label
- **Colors:** Metric colors used WITH text/icons, not color-only indicators

---

## Handoff to CODER

CODER will implement:
1. Carrier profile header with rating and "Add to Preferred" button
2. Performance metrics cards (5 cards) with color-coded values
3. Service areas map (Google Maps or similar)
4. Equipment type grid with unit counts
5. Benchmark comparison bar charts
6. Social proof footer with view/preferred counts
7. Multi-tenancy enforcement (show only requesting shipper's metrics)
8. All Playwright tests passing

**UI Specifications locked. Backend analytics queries will provide metric data.**

---

**HFD Sign-Off:** Awaiting Playwright test execution and visual validation.
