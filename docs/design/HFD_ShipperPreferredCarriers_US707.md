# HFD Design: US-707 — Shipper Preferred Carrier List

**Story:** US-707  
**Phase:** 7  
**Status:** HFD_APPROVED  
**Created:** 2026-05-29  
**Designer:** Human Factors Team  

---

## User Flows

### Flow 1: Add Carrier to Preferred List

```
1. Shipper navigates to /settings/preferred-carriers
2. Page loads with existing preferred carriers list (empty or populated)
3. Shipper clicks "Add Carrier" button
4. Modal/form opens with fields:
   - Carrier search (autocomplete)
   - Optional notes field
   - Add button + Cancel button
5. Shipper selects carrier from dropdown
6. Shipper optionally adds notes
7. Shipper clicks "Add Carrier"
8. Success toast appears: "Carrier added to preferred list"
9. Modal closes, list refreshes with new carrier
10. New carrier appears in table with remove button
```

### Flow 2: View Preferred Carriers

```
1. Shipper navigates to /settings/preferred-carriers
2. Page loads showing:
   - Header: "Preferred Carriers"
   - Subtitle: "Manage carriers who can access your loads"
   - Add Carrier button (prominent)
   - Table with:
     - Carrier Name (column)
     - Email (column)
     - Date Added (column)
     - Remove button (each row)
   - Pagination (if >20 carriers)
3. Empty state shown if no carriers
   - Icon + text: "No preferred carriers yet"
   - Call-to-action: "Add your first carrier"
```

### Flow 3: Remove Carrier

```
1. Shipper viewing preferred carriers list
2. Shipper clicks "Remove" button on carrier row
3. Confirmation modal appears:
   - Title: "Remove carrier from preferred list?"
   - Message: "Carrier will no longer have priority access"
   - Cancel button
   - Confirm button (destructive red)
4. Shipper confirms removal
5. Modal closes
6. Success toast: "Carrier removed"
7. Carrier disappears from table immediately
```

---

## Page Layout: Preferred Carriers Settings Page

```
┌─────────────────────────────────────────────────┐
│  FreightClub Settings                    [↩️]   │
├─────────────────────────────────────────────────┤
│                                                   │
│  📌 Preferred Carriers                           │
│                                                   │
│  Manage carriers who can access your loads      │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │  + Add Carrier          [Sort ▼] [Filter] │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │ Carrier Name    │ Email    │ Added  │ [×] │   │
│  ├──────────────────────────────────────────┤   │
│  │ FedEx Freight   │ ...@fx.. │ May 15 │ ▌  │   │
│  │ XPO Logistics   │ ...@xpo. │ May 10 │ ▌  │   │
│  │ J.B. Hunt       │ ...@jbh. │ May 5  │ ▌  │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
│  Page 1 of 3  [< 1 2 3 >]                       │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Add Carrier Modal

```
┌────────────────────────────────┐
│ Add Carrier to Preferred List  │  [×]
├────────────────────────────────┤
│                                 │
│  Search by carrier name or ID  │
│  ┌──────────────────────────┐  │
│  │ 🔍 Type to search...     │  │
│  │ Suggestions:             │  │
│  │ • FedEx Freight          │  │
│  │ • XPO Logistics          │  │
│  │ • J.B. Hunt              │  │
│  └──────────────────────────┘  │
│                                 │
│  Notes (optional)              │
│  ┌──────────────────────────┐  │
│  │ Negotiated rate info...  │  │
│  │                          │  │
│  └──────────────────────────┘  │
│  180 / 500 characters          │
│                                 │
│  ┌──────────┐    ┌──────────┐  │
│  │ Cancel   │    │ Add ✓    │  │
│  └──────────┘    └──────────┘  │
│                                 │
└────────────────────────────────┘
```

---

## Component Specifications

### PreferredCarriersList Component

**Props:**
```typescript
interface PreferredCarriersListProps {
  shipperId: string;
  onCarrierAdded?: () => void;
  onCarrierRemoved?: () => void;
}
```

**State:**
- `carriers`: ShipperPreferredCarrier[] (from API)
- `isLoading`: boolean
- `error`: ErrorType | null
- `page`: number (pagination)
- `pageSize`: number (20)
- `showAddModal`: boolean

**Interactions:**
- Click "Add Carrier" → Open AddCarrierModal
- Click "Remove" → Show ConfirmRemovalDialog
- Click pagination arrows → Fetch next/prev page
- Auto-refresh after add/remove (5s delay for UX feedback)

**Accessibility:**
- `role="region" aria-label="Preferred carriers list"`
- Table marked as `role="table"`
- Remove buttons: `aria-label="Remove {carrierName} from preferred list"`
- Pagination: `role="navigation" aria-label="Preferred carriers pagination"`

---

### AddCarrierModal Component

**Props:**
```typescript
interface AddCarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (carrier: ShipperPreferredCarrier) => void;
  onError?: (error: Error) => void;
}
```

**State:**
- `searchTerm`: string
- `selectedCarrier`: Carrier | null
- `notes`: string (max 500 chars)
- `suggestions`: Carrier[]
- `isSubmitting`: boolean
- `error`: ErrorType | null

**Validation (Zod Schema):**
```typescript
const addCarrierSchema = z.object({
  carrierId: z.string().uuid('Invalid carrier ID'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional()
})
```

**Interactions:**
- Type in search → Autocomplete dropdown (debounced 300ms)
- Select carrier → Show in field
- Type notes → Show char count (180/500)
- Submit → POST /api/v1/shippers/preferred-carriers
- Cancel → Close modal (discard unsaved)

**Accessibility:**
- `role="dialog" aria-labelledby="add-carrier-title"`
- Search input: `aria-label="Search for carrier by name or ID"`
- Submit button: `aria-label="Add selected carrier to preferred list"`
- Error messages: `role="alert" aria-live="polite"`

---

### ConfirmRemovalDialog Component

**Props:**
```typescript
interface ConfirmRemovalDialogProps {
  carrierName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Copy:**
- Title: "Remove carrier from preferred list?"
- Message: "{{carrierName}} will no longer have priority access to your loads."
- Cancel button: "Cancel"
- Confirm button: "Remove" (destructive)

**Accessibility:**
- `role="alertdialog" aria-label="Confirm carrier removal"`
- Confirm button: danger styling + `aria-label="Confirm removal of {{carrierName}}"`
- Focus trap on dialog
- Escape key closes dialog (Cancel action)

---

## Empty State Design

```
┌─────────────────────────────────────────┐
│                                           │
│              📭                           │
│                                           │
│      No Preferred Carriers Yet            │
│                                           │
│   Build your preferred network to        │
│   control load distribution and          │
│   negotiate better rates                 │
│                                           │
│      [+ Add Your First Carrier]          │
│                                           │
└─────────────────────────────────────────┘
```

**Copy:**
- Heading: "No Preferred Carriers Yet"
- Body: "Build your preferred network to control load distribution and negotiate better rates"
- CTA: "+ Add Your First Carrier" (button, links to modal)

---

## Loading & Error States

### Loading State
```
Skeleton loaders for:
- Table header
- 5 row placeholders (animated)
```

### Error State (Failed to Load)
```
┌────────────────────────────────┐
│ ⚠️ Failed to load carriers     │
│                                │
│ Unable to connect to server.   │
│                                │
│ [Retry]                        │
└────────────────────────────────┘
```

### Error State (Add Failed)
```
Toast (top-right):
❌ Failed to add carrier
Could not add FedEx Freight. Try again.
[Retry] [Dismiss]
```

---

## Toast Notifications

### Success: Carrier Added
```
✅ Carrier added to preferred list
FedEx Freight is now preferred
[Undo] [Dismiss]
```
Duration: 5 seconds auto-dismiss

### Success: Carrier Removed
```
✅ Carrier removed from preferred list
FedEx Freight removed
[Undo for 10s] [Dismiss]
```

### Error: Duplicate Preferred
```
⚠️ Already preferred
FedEx Freight is already in your preferred list
[Dismiss]
```

---

## Responsive Design Strategy

### Desktop (≥1024px)
- Modal centered on screen (max-width: 500px)
- Table with 4 columns (Name, Email, Date, Actions)
- Side navigation visible

### Tablet (768-1023px)
- Modal full-width with padding
- Table with scrollable overflow for small screens
- Email column hidden if space-constrained

### Mobile (≤767px)
- Modal full-screen
- Table converted to card list format:
  ```
  ┌─ FedEx Freight ─┐
  │ email@fx.com    │
  │ Added: May 15   │
  │ [Remove →]      │
  └─────────────────┘
  ```
- Single-column layout
- Touch-friendly remove buttons (44px min height)

---

## Playwright Test Specifications

### Test File Location
`frontend/e2e/shipper-preferred-carriers.spec.ts`

### Test Cases with Visual Evidence

**Test 1: AC-707-1 - Add Carrier**
```typescript
test('AC-707-1: Shipper can add carrier to preferred list', async ({ page }) => {
  // Setup: Register shipper, navigate to /settings/preferred-carriers
  
  // Step 1: Verify page loads
  await expect(page.locator('text=Preferred Carriers')).toBeVisible();
  
  // Step 2: Click Add Carrier
  await page.click('button:has-text("Add Carrier")');
  
  // Step 3: Modal appears
  await expect(page.locator('text=Add Carrier to Preferred List')).toBeVisible();
  
  // Step 4: Search and select carrier
  await page.fill('input[placeholder*="Search"]', 'FedEx');
  await page.click('text=FedEx Freight');
  
  // Step 5: Add notes (optional)
  await page.fill('textarea[placeholder*="Notes"]', 'Negotiated 10% discount');
  
  // Step 6: Submit
  await page.click('button:has-text("Add")');
  
  // Verify: Success toast
  await expect(page.locator('text=Carrier added')).toBeVisible();
  
  // Verify: Carrier in table
  await expect(page.locator('text=FedEx Freight')).toBeVisible();
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-707-add-carrier.png' });
});
```

**Test 2: AC-707-2 - View List**
```typescript
test('AC-707-2: Shipper can view preferred carriers list', async ({ page }) => {
  // Setup: Shipper with 3 preferred carriers
  
  // Verify table headers
  await expect(page.locator('text=Carrier Name')).toBeVisible();
  await expect(page.locator('text=Email')).toBeVisible();
  await expect(page.locator('text=Date Added')).toBeVisible();
  
  // Verify carriers display
  const rows = page.locator('tr:has(td)');
  expect(await rows.count()).toBe(3);
  
  // Verify remove buttons present
  await expect(rows.first().locator('button:has-text("Remove")')).toBeVisible();
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-707-view-list.png' });
});
```

**Test 3: AC-707-3 - Remove Carrier**
```typescript
test('AC-707-3: Shipper can remove carrier', async ({ page }) => {
  // Setup: Shipper with preferred carriers
  
  // Click Remove
  await page.click('button:has-text("Remove")');
  
  // Verify confirmation dialog
  await expect(page.locator('text=Remove carrier from preferred list')).toBeVisible();
  
  // Confirm removal
  await page.click('button:has-text("Remove")');
  
  // Verify success
  await expect(page.locator('text=Carrier removed')).toBeVisible();
  
  // Verify carrier removed from table
  const carrierCount = await page.locator('tr:has(td)').count();
  expect(carrierCount).toBeLessThan(initialCount);
  
  // Evidence
  await page.screenshot({ path: 'test-results/evidence/US-707-remove-carrier.png' });
});
```

---

## Handed Off To

**Next Phase:** CODER implements the UI components following TDD:
1. PreferredCarriersList component (with hooks)
2. AddCarrierModal component (with validation)
3. ConfirmRemovalDialog component
4. usePreferredCarriers custom hook
5. API integration via axios

**CODER Must Provide:**
- React components in `src/features/shippers/components/`
- Custom hooks in `src/features/shippers/hooks/`
- Zod schemas in `src/features/shippers/validation/`
- Playwright tests with visual evidence
- ≥80% branch coverage
