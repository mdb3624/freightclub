# FreightClub Design System — Codebase Integration Prompt

Use this prompt in Claude Code (or any AI coding assistant) to apply the FreightClub design system to the existing codebase.

---

## PROMPT

You are working on the FreightClub frontend — a React 18 + TypeScript + Vite app at `frontend/`. Read the design system at the root of this project before making any changes.

**Step 1 — Read these files first:**
- `readme.md` — full design guide, visual foundations, content rules
- `tokens/colors.css` — all color custom properties
- `tokens/typography.css` — Sora + Inter font stack, size/weight/spacing tokens
- `tokens/spacing.css` — 8px grid spacing tokens
- `tokens/shadows.css` — elevation + bronze button shadow system
- `tokens/borders.css` — radius + border shorthand tokens

**Step 2 — Open these UI kit references in a browser:**
- `ui_kits/shipper/index.html` — Shipper Dashboard (desktop, cream/bronze)
- `ui_kits/shipper/create-load.html` — Load Creation form
- `ui_kits/shipper/carrier-network.html` — Carrier Network / search
- `ui_kits/carrier/index.html` — Carrier mobile dashboard (375px dark)

---

## CONTEXT

FreightClub has **two user personas**, each with a distinct visual theme:

### Shipper / Administrator — "Classic Cream & Metallic Bronze" (desktop)
- Background canvas: `#EFEBE0`
- Panel/surface: `#FFFFFF`, `border: 1px solid #D0D0D0`, `border-radius: 8px`, `box-shadow: 0 2px 4px rgba(0,0,0,0.05)`, `padding: 24px`
- Primary text: `#1A1A1A` · Secondary: `#4A5568` · Tertiary/labels: `#636E72`
- Table header: `12px`, `font-weight: 600`, ALL CAPS, `color: #636E72`
- Table row height: exactly `48px` · Row border: `1px solid #E8E3D8`
- Form input: `height: 40px`, `border-radius: 4px`, `border: 1px solid #D0D0D0`, focus: `2px solid #B08D57`
- Primary CTA: bronze gradient button (see below)

### Carrier / Owner-Operator — "Luxury Industrial" dark mode (mobile 375px)
- Background: `#121212` · Surface/cards: `#1A1A1A`, `border: 1px solid #2A2A2A`
- Primary text: `#F5F5F5` · Muted/accent: `#C9A876` (metallic copper)
- All touch targets: `min-height: 48px`, `min-width: 48px` — non-negotiable
- Header height: `56px` fixed · Bottom tab bar: `48px`
- Primary CTA: same bronze gradient button

### Bronze CTA Button (both personas)
```css
background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
box-shadow: inset 0 1px 2px rgba(255,255,255,0.25),
            inset 0 -1px 2px rgba(0,0,0,0.2),
            0 2px 5px rgba(0,0,0,0.35);
border: 1px solid #7A5F3A;
color: #FFFFFF;
border-radius: 4px; /* shipper */ or 8px; /* carrier */
font-size: 14px; font-weight: 700; padding: 8px 16px;
```

### Secondary Button (both personas — clearly a button, not text)
```css
/* Shipper */
background: linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%);
border: 1px solid #C9A876; color: #7A5F3A;
box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.15);

/* Carrier */
background: transparent; border: 1px solid #3A3A3A; color: #C9A876;
```

### Semantic Status Colors (§6.1 — never deviate)
```
Success:  #27AE60  subtle: #DCFCE7  text: #15803D
Warning:  #F39C12  subtle: #FEF3C7  text: #B45309
Critical: #E74C3C  subtle: #FEE2E2  text: #B91C1C
Info:     #3498DB  subtle: #DBEAFE  text: #1D4ED8
```

### Load Status → Color mapping
```
DRAFT      → grey   (#F1F5F9 / #475569)
OPEN       → blue   (#DBEAFE / #1D4ED8)
CLAIMED    → amber  (#FEF3C7 / #B45309)
IN_TRANSIT → purple (#EDE9FE / #6D28D9)
DELIVERED  → green  (#DCFCE7 / #15803D)
SETTLED    → teal   (#CCFBF1 / #0F766E)
CANCELLED  → red    (#FEE2E2 / #B91C1C)
```

### RPM Profitability Bands
```
green  #22C55E — rpm >= minRpm * 1.2  (profitable)
yellow #F59E0B — rpm >= minRpm         (marginal)
red    #EF4444 — rpm < minRpm          (unprofitable)
```

### Spacing (8px grid — never use other values)
```
4px — icon/text pairs only
8px — related elements
16px — component-to-component (default gap)
24px — section separators, panel padding
32px — page-level shell padding
```
**Forbidden values:** 10, 12, 14, 18, 20, 22, 25, 28, 30px

### Typography
```
display:  'Sora', sans-serif    — headings, KPI numbers (56px/900)
body:     'Inter', sans-serif   — all UI, data, labels, inputs
Table headers: 12px, 600 weight, ALL CAPS, #636E72
Body minimum: 14px (desktop) · 13px (carrier mobile)
```

---

## SCREENS BUILT — USE AS REFERENCE

### Shipper (desktop, `ui_kits/shipper/`)

**`index.html` — Shipper Dashboard**
- 3 KPI cards: Active Shipments (black, with color-coded breakdown dots) · Est. Cost/Mile (with 7-day sparkline + amber trend badge) · On-Time Rate (green + progress bar)
- Shipment Status table: LOAD · ROUTE · STATUS · TRANSIT · EQUIPMENT · CARRIER RATING · ACTION · chevron
- Context-sensitive Action Zone (right panel):
  - Default: Quick Actions (bronze primary + cream secondary grid) + Preferred Carriers (list with × remove, "Manage →" link)
  - Load selected: Load summary + "Find Carriers for This Load →" (navigates with URL params) + Preferred Carriers with Assign buttons
- Clicking a load row selects it and transforms the Action Zone — no modal
- Row click affordance: `›` chevron highlights bronze on hover; selected row gets `border-left: 3px solid #B08D57`

**`create-load.html` — Create Load Form**
- 5 sections: Route · Schedule · Load Details · Pay & Terms · Additional Info
- **Estimated distance is calculated** from origin/destination state pair — NOT a user input (readonly display)
- **Dates use `datetime-local`** — both pickup and delivery have earliest + latest windows
- **Auto-populate latest from earliest**: when earliest date is set, latest auto-fills with same value; latest must be ≥ earliest
- **Dimensions**: ft + in fields for each of Length · Width · Height (separate inputs per unit)
- Live board preview updates as user types — shows exactly what carriers will see
- Form completion meter (0–100%) with contextual nudges
- Sticky footer: Cancel (ghost) · Save as Draft (secondary) · Publish to Board (primary, disabled until ≥40% complete)
- Pay rate: Per Mile / Flat Rate toggle; estimated total auto-calculates when distance is known

**`carrier-network.html` — Carrier Network**
- Left sidebar: Search Filters — Origin · Destination · Equipment · Min Rating (toggle buttons) · Min On-Time Rate (toggle buttons) · Preferred only checkbox
- Preferred Carriers strip at top of results — horizontal scroll, click to see profile
- Carrier cards grid: Avatar · name · Stars + rating + count · 3 stat boxes (On-Time %, Loads, Member Since) · Equipment + Lane tags · Get Quote (primary) + Add/Remove Preferred (secondary)
- Detail panel slides in from right when card selected — bio, stats, reviews, Assign + Request Quote CTAs
- URL params (`?origin=TX&dest=FL&equip=DRY_VAN`) pre-populate filters (passed from dashboard when load is selected)

### Carrier (mobile 375px, `ui_kits/carrier/`)

**`index.html` — Carrier Dashboard + full load flow**

**Screens (state machine):**
```
'main'   → board/stats/settings tabs
'detail' → load detail (full info, claim CTA)
'active' → active load management (pickup/delivery CTAs)
'pod'    → proof of delivery upload
```

**Business rules enforced in UI:**
1. **One equipment type per OO** — profile drives all load board queries; no equipment filter dropdown; board shows only loads matching OO's rig
2. **One active load at a time** — when a load is claimed, the board locks immediately. Shows: 🔒 "Load board locked · Complete your current load to claim another" + active load management view
3. **State-change actions return to dashboard** — after Claim, Confirm Pickup, and POD Complete, the app navigates back to main dashboard (never leaves user on a sub-screen after completing an action)
4. **All touch targets 48×48px minimum**
5. **Confirmation steps before every state-changing action** (Claim, Pickup, Delivery)

**Board tab:**
- Profile-driven equipment badge (read-only, not a filter): "YOUR EQUIPMENT · Dry Van 53ft · Loads matched to your rig"
- Origin/city text filter only
- Load cards: route, RPM badge (green/yellow/red), miles/pay/equip/pickup

**Load Detail screen:**
- Route hero, stats grid (Distance/Pay/Weight), map placeholder, schedule, shipper + call button, special instructions (amber highlight), profitability breakdown (gross − est. fuel = net), Claim CTA with confirmation

**Active Load (claimed/in-transit):**
- Status bar with phase label and progress track
- Key details grid, shipper contact with call button, instructions
- "Mark as Picked Up" → confirm → back to dashboard (phase: intransit)
- "Mark as Delivered" → confirm → POD screen

**POD Upload:**
- Tap to take photo / upload (file input with `capture="environment"`)
- Submit button disabled until photo is attached
- Completion → back to dashboard (board unlocks)

**My Stats tab:**
- Earnings hero (large, green, dominant)
- 4 stat grid: On-Time Rate · Avg RPM · Loads · Miles
- Single rig display (one equipment, not a list) with Edit button

**Settings tab:**
- Cost Profile · Payments · Load History · Notifications · Profile · Support

**Bottom tab bar:** Board (⊞) · My Stats (📊) · Settings (⚙) — 48px, border-top: 2px solid #B08D57 on active

---

## WHAT TO DO

### 1. Import the design tokens
Add to `frontend/src/index.css` (before Tailwind imports):
```css
@import '../../tokens/colors.css';
@import '../../tokens/typography.css';
@import '../../tokens/spacing.css';
@import '../../tokens/shadows.css';
@import '../../tokens/borders.css';
```

### 2. Fix the button system
Three tiers — every button must have a visible fill:
- **Primary**: bronze gradient (see above)
- **Secondary**: warm cream gradient + bronze border + 3D inset highlight
- **Destructive**: light red fill + red border (`background: #FEE2E2`)
- Never use fully transparent/ghost buttons as primary actions

### 3. Fix the input component (§6.3)
`height: 40px` · `border-radius: 4px` · `border: 1px solid #D0D0D0` · focus: `2px solid #B08D57`

### 4. Fix the Action Zone
The right panel on the shipper dashboard is context-sensitive:
- Default state: Quick Actions + Preferred Carriers shortlist
- Load selected: load summary + "Find Carriers" link + preferred carriers with Assign
- **Do NOT put a carrier search form on the dashboard** — that lives at `/carriers` (carrier-network.html)

### 5. Enforce carrier business rules
```typescript
// In TruckerDashboard / load board hooks:
// 1. Filter loads by user's equipment type from profile — no client-side equipment filter
// 2. If user has an active load, lock the board entirely
// 3. After every state mutation (claim, pickup, deliver), navigate back to dashboard
```

### 6. Clean up the .legacy-dark / !important system
Replace all `.legacy-dark` className overrides with the `carrier-*` CSS custom property tokens. The persona-aware theming should be done via CSS custom properties, not !important utility overrides.

### 7. Dates and form fields
- All date inputs use `datetime-local` — never plain `date`
- Pickup window: earliest + latest (latest auto-populates from earliest, must be ≥ earliest)
- Delivery window: same structure, mirroring pickup
- Estimated distance is calculated server-side or from a distance API — never a user input field

---

## RULES — NEVER BREAK THESE

- **No hardcoded hex colors** outside the token files
- **No spacing values** not a multiple of 8px (forbidden: 10, 12, 14, 18, 20, 22, 25, 28, 30px)
- **Carrier touch targets** ≥ 48×48px
- **Table row height** exactly 48px
- **Form input height** exactly 40px
- **Panel border-radius** exactly 8px
- **Status colors** must match §6.1 exactly — never substitute
- **Equipment filter** not shown on carrier load board — profile drives it
- **Load board locks** when OO has an active load
- **State-change actions** navigate back to dashboard on completion
- **Confirmation dialogs** required before: Claim, Pickup, Delivery, Cancel Load

---

## NAVIGATION STRUCTURE

### Shipper
```
/dashboard/shipper  (index.html)
  → /loads/create  (create-load.html)
  → /carriers      (carrier-network.html)
  → /profile
  → /documents
```

### Carrier
```
/dashboard/trucker  (index.html — state machine)
  main → detail → [back to main after claim]
  main → active → [back to main after pickup]
  active → pod → [back to main after POD submit]
```

---

## SOURCE FILES

- **GitHub:** https://github.com/mdb3624/freightclub
  - Design tokens: `frontend/tailwind.config.ts`, `frontend/src/index.css`
  - Style guides: `docs/standards/brand_assets/Carrier Style Guide.md`
  - Atomic specs: `docs/standards/brand_assets/Shipper & Administrator Style Guide.md` §6.1–6.5
- **Design System:** `readme.md` (this project) — full visual foundations reference
- **UI kit screens:** `ui_kits/shipper/` and `ui_kits/carrier/` — open in browser for pixel reference
