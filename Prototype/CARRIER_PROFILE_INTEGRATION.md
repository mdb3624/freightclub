# Carrier Profile & Cost Profile — Integration Plan

## What we're adding
Two new carrier-side screens to the existing React/TypeScript frontend:

1. **Carrier Profile** (`ui_kits/carrier/carrier-profile.html`) — Identity, Equipment (single type, drives load board queries), Credentials (CDL/insurance/med card with expiry warnings), Preferred Lanes
2. **Cost Profile** (`ui_kits/carrier/cost-profile.html`) — Variable CPM, Fixed CPM, Target margin → live Min RPM calculator that drives load card color coding

Reference the HTML files above in a browser to see the exact target visual/UX.

---

## Step 1 — Routing
Add two new protected routes under the carrier route group:

```tsx
// Wherever carrier routes are defined (e.g. src/routes/carrier.tsx or App.tsx)
<Route path="/carrier/profile" element={<CarrierProfile />} />
<Route path="/carrier/cost-profile" element={<CostProfile />} />
```

Both require the carrier role — gate with the same auth guard already used on `/carrier/dashboard`.

---

## Step 2 — Settings screen
The carrier Settings screen already has a list of rows. Add/update these two entries:

```tsx
{ icon: '👤', label: 'Profile',      sub: 'Name, DOT, CDL, insurance, equipment', href: '/carrier/profile' },
{ icon: '⚙️', label: 'Cost Profile', sub: 'CPM, fuel cost & min RPM calculator',  href: '/carrier/cost-profile' },
```

---

## Step 3 — CarrierProfile page

### Data shape
```ts
interface CarrierProfileData {
  // Identity
  firstName: string;
  lastName: string;
  phone: string;       // stored as digits; displayed as (XXX) XXX-XXXX
  email: string;

  // Equipment — ONE type only; drives load board filter queries
  equipmentType: string;   // 'Dry Van' | 'Flatbed' | 'Reefer' | 'Box Truck' | 'Step Deck' | 'Tanker' | 'Power Only'
  equipmentYear: string;
  equipmentMake: string;
  equipmentModel: string;
  licensePlate: string;
  vin?: string;

  // Credentials
  dotNumber: string;
  mcNumber: string;
  cdlClass: 'Class A' | 'Class B' | 'Class C';
  cdlExpiry: string;           // ISO date
  insuranceCarrier: string;
  insuranceExpiry: string;     // ISO date
  medCardExpiry: string;       // ISO date

  // Preferred lanes (up to 3)
  preferredLanes: Array<{ origin: string; destination: string }>;
}
```

### API endpoints needed
```
GET  /api/carrier/profile          → CarrierProfileData
PUT  /api/carrier/profile          → CarrierProfileData (full replace or partial)
```

### Key business rules (enforce on frontend AND backend)
- `equipmentType` is a single value — changing it re-queries the load board immediately (invalidate load board cache/query on save)
- `phone` stored as 10 digits; format as `(XXX) XXX-XXXX` on display using a `formatPhone()` helper
- `email` validated with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` before submit
- Expiry warnings: `< 90 days` → amber; `< 30 days` → red; show a banner at top of page if any credential is in warning state
- Max 3 preferred lanes; origin + destination are US state codes

### Credential expiry helper (copy from design system reference)
```ts
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
function expiryStatus(iso: string): 'ok' | 'warn' | 'critical' | 'expired' {
  const d = daysUntil(iso);
  if (d < 0)   return 'expired';
  if (d <= 30)  return 'critical';
  if (d <= 90)  return 'warn';
  return 'ok';
}
```

### Equipment change UX
When the carrier changes `equipmentType`, show a confirmation bottom sheet before saving:
> "Changing from **Dry Van** to **Flatbed** will update your load board to only show Flatbed loads."
On confirm → save → invalidate load board query so the board re-fetches filtered by new equipment type.

---

## Step 4 — CostProfile page

### Data shape
```ts
interface CostProfileData {
  variableCostPerMile: number;  // fuel, oil, tires
  fixedCostPerMile: number;     // truck payment, insurance amortized
  targetMarginPerMile: number;  // desired profit above costs
}
```

Derived values (compute on frontend, never store):
```ts
const breakevenRpm = variableCostPerMile + fixedCostPerMile;
const minRpm       = breakevenRpm + targetMarginPerMile;
const targetRpm    = minRpm * 1.2;
```

### API endpoints needed
```
GET  /api/carrier/cost-profile     → CostProfileData
PUT  /api/carrier/cost-profile     → CostProfileData
```

### Load card RPM color coding
These thresholds must match whatever the load board already uses for the RPM badge color. After saving a new cost profile, invalidate the load board so cards re-render with updated colors:

```ts
function rpmColor(rpm: number, minRpm: number): 'green' | 'yellow' | 'red' {
  if (rpm >= minRpm * 1.2) return 'green';   // #22C55E
  if (rpm >= minRpm)       return 'yellow';  // #F59E0B
  return 'red';                               // #EF4444
}
```

The cost profile page should show a **live preview** of these thresholds updating as the user types — no save required to see the effect on example loads.

### Diesel ticker (optional enhancement)
The design shows a regional diesel price ticker at the top of the cost profile page. If you have a fuel price API or static weekly data, render it as a horizontal scroll strip. If not, omit it for now.

---

## Step 5 — Header standard (carrier screens)

All carrier screens use this header pattern — enforce it on these two new pages:

```
[Logo — taps to /carrier/dashboard]   [Page subtitle]   [Avatar]
```

- Logo is tappable and navigates back to the carrier dashboard (no separate back arrow)
- Avatar shows carrier's initials in the bronze gradient circle
- Sub-screens that have a Save action: Save button sits **left of the avatar**
- No notification bell on sub-screens (main dashboard only)

---

## Step 6 — Gloved-hand UX requirements

These apply to ALL carrier-side screens and must be enforced on the new pages:

| Element | Min size |
|---|---|
| All tap targets | 56px tall |
| Primary CTA buttons | 64px tall |
| Tab bar | 60px tall |
| Text inputs | 52px tall |
| Body text | 16px min |
| Label text | 14px min |

---

## Step 7 — Completeness indicator

The carrier profile page shows a completeness percentage bar. Tie it to the same fields listed in the design reference. Once the profile is 100% complete, dismiss the "incomplete profile" notice on the dashboard if one exists.

---

## Files to reference
- `ui_kits/carrier/carrier-profile.html` — full working reference implementation
- `ui_kits/carrier/cost-profile.html` — full working reference implementation
- `ui_kits/carrier/index.html` — existing dashboard (Settings tab, load card RPM badges)
- `tokens/colors.css` — all color tokens
- `tokens/typography.css` — font stack
