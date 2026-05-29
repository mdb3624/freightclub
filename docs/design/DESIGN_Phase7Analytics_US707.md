# HFD Design: US-707 Shipper Preferred Carrier List

**Version:** 1.0  
**Created:** 2026-05-28  
**HFD Approval:** Pending review  
**Status:** DESIGN PHASE

---

## User Stories Addressed
- **US-707 AC-1:** Shipper adds carriers to preferred list
- **US-707 AC-2:** Shipper views preferred carriers list
- **US-707 AC-3:** Shipper removes from preferred list

---

## Design Constraints
- **Shipper Focus:** Quick add/remove, dense table, minimal clicks
- **Style Guide Compliance:** MANDATORY
- **Mobile Safe:** Table responsive, buttons oversized on mobile

---

## Information Architecture

```
Shipper Settings > Preferred Carriers
├── "Add Carrier" Primary Button
├── Preferred Carriers Table
│   ├── Carrier Name | Email | Date Added | Notes | Action (Remove)
│   └── Empty state: "No preferred carriers yet"
└── Pagination (if >20 carriers)
```

---

## Visual Specification

### Page Header
```html
<div class="space-y-6">
  <h1 class="text-3xl font-bold text-gray-900">Preferred Carriers</h1>
  <p class="text-gray-600">Manage carriers you prefer to work with and negotiate rates</p>
</div>
```
- H1: 32px, bold, gray-900
- Description: 16px body text, gray-600

### "Add Carrier" Button
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  + Add Carrier
</button>
```
- Style: Primary button (blue-600)
- Position: Top-left of table
- Hover: Blue-700
- Click action: Opens modal or form

### Preferred Carriers Table
- Columns: Name (30%) | Email (30%) | Date Added (20%) | Notes (15%) | Action (5%)
- Row height: 48px (comfortable for touch)
- Alternating row backgrounds: White, gray-100
- Border: Light gray-300 between rows
- Font: 16px body text

**Column Styling:**
- **Name:** Gray-900, bold (500 weight)
- **Email:** Gray-600, monospace for clarity (14px, Courier)
- **Date Added:** Gray-500, 14px
- **Notes:** Gray-600, italic, max 40 chars truncated
- **Action:** Remove button (red-600, danger style)

### Remove Button (Per-Row)
```html
<button class="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
  Remove
</button>
```
- Style: Danger button (red-600)
- Size: Smaller than primary (sm)
- Hover: Red-700
- Click action: Confirm before delete

### Empty State
```html
<div class="text-center py-12 bg-gray-50 rounded-lg">
  <p class="text-gray-500">No preferred carriers yet</p>
  <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
    Add Your First Carrier
  </button>
</div>
```
- Background: Gray-50
- Text: Gray-500, centered
- Button: Primary blue-600

### Add Carrier Modal/Form
```html
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-900">Carrier Name or Email</label>
    <input type="text" placeholder="Search by name or email" 
           class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
  
  <div>
    <label class="block text-sm font-medium text-gray-900">Notes (optional)</label>
    <textarea placeholder="e.g., Negotiated 10% discount" 
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
  </div>
  
  <div class="flex gap-2">
    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
      Add Carrier
    </button>
    <button type="button" class="px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-md hover:bg-gray-50">
      Cancel
    </button>
  </div>
</form>
```

---

## Interaction Flows

### Add Carrier Flow
1. User clicks "+ Add Carrier" button
2. Modal opens with form (Name/Email search, Notes textarea)
3. User types carrier name/email, form shows matching results
4. User selects carrier
5. User adds optional notes
6. User clicks "Add Carrier" button
7. Success toast: "Carrier added to preferred list"
8. Table refreshes, new carrier appears at top

### Remove Carrier Flow
1. User finds carrier in table
2. User clicks "Remove" button
3. Confirmation dialog: "Are you sure you want to remove [Carrier Name]?"
4. User confirms
5. Success toast: "Carrier removed"
6. Table refreshes, carrier disappears

---

## Playwright E2E Specifications

### Add Carrier Golden Path
```typescript
test('Shipper adds carrier to preferred list', async ({ page }) => {
  await page.goto('/settings/preferred-carriers');
  
  // Click "Add Carrier" button
  await page.click('button:has-text("Add Carrier")');
  
  // Fill carrier search (type first few chars)
  await page.fill('input[placeholder*="Search"]', 'FedEx');
  
  // Wait for autocomplete results
  await page.waitForSelector('li:has-text("FedEx Freight")');
  
  // Select from dropdown
  await page.click('li:has-text("FedEx Freight")');
  
  // Add notes
  await page.fill('textarea[placeholder*="Negotiated"]', 'Negotiated 10% discount');
  
  // Submit form
  await page.click('button:has-text("Add Carrier")');
  
  // Verify success toast
  expect(await page.locator('text=Carrier added').isVisible()).toBeTruthy();
  
  // Verify table updated
  expect(await page.locator('text=FedEx Freight').isVisible()).toBeTruthy();
  
  // Screenshot for evidence
  await page.screenshot({ path: 'test-results/evidence/US-707-add-carrier.png' });
});
```

### View & Remove Carrier Golden Path
```typescript
test('Shipper removes carrier from preferred list', async ({ page }) => {
  await page.goto('/settings/preferred-carriers');
  
  // Verify table displays
  expect(await page.locator('text=Preferred Carriers').isVisible()).toBeTruthy();
  
  // Find carrier row
  const carrierRow = page.locator('tr:has-text("FedEx")');
  expect(await carrierRow.isVisible()).toBeTruthy();
  
  // Click Remove button in that row
  await carrierRow.locator('button:has-text("Remove")').click();
  
  // Confirm dialog
  expect(await page.locator('text=Are you sure').isVisible()).toBeTruthy();
  await page.click('button:has-text("Confirm")');
  
  // Verify success toast
  expect(await page.locator('text=Carrier removed').isVisible()).toBeTruthy();
  
  // Screenshot
  await page.screenshot({ path: 'test-results/evidence/US-707-remove-carrier.png' });
});
```

---

## Accessibility Requirements

- **Form Labels:** Every input has associated `<label>` with `for` attribute
- **Buttons:** All buttons have clear text labels (no icon-only buttons)
- **Keyboard Navigation:** Tab through form inputs, buttons, table rows
- **Error Messages:** Red-600 text, `role="alert"` for focus
- **Empty State:** Descriptive message, action button available

---

## Handoff to CODER

CODER will implement:
1. Preferred Carriers settings page with table
2. "Add Carrier" modal with form and autocomplete
3. "Remove Carrier" confirmation and deletion flow
4. Toast notifications for success/error
5. Responsive table (mobile-safe)
6. All Playwright tests passing

**UI Specifications locked. No backend API changes required.**

---

**HFD Sign-Off:** Awaiting Playwright test execution and visual validation.
