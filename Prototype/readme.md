# FreightClub Design System

**Company:** MDB Integrated Logistics (branded as FreightClub)  
**Product:** Multi-tenant SaaS load board platform for the trucking industry  
**Audience:** Small owner-operator truckers (1–3 trucks) and shippers posting freight

**GitHub Source:** https://github.com/mdb3624/freightclub  
*(The frontend is a React 18 + TypeScript + Vite + Tailwind CSS app; explore the repo for component implementations and API details)*

---

## Company & Product Context

FreightClub connects **shippers** (companies with freight to move) with **owner-operator truckers** (carriers). Unlike large brokerage platforms, it focuses on the solo or small-fleet trucker: helping them find profitable loads, manage their cost profile, track hours of service, and build a reputation through ratings.

**Two distinct user personas drive two distinct UI themes:**

| Persona | Role | Platform | Theme |
|---|---|---|---|
| **Shipper / Administrator** | Posts loads, tracks shipments, manages invoices | Desktop browser | "Classic Cream & Metallic Bronze" |
| **Carrier / Owner-Operator** | Finds loads, claims, delivers, uploads POD | Mobile (iPhone 375px primary) | "Luxury Industrial" dark mode |

**Core load lifecycle:** `DRAFT → OPEN → CLAIMED → IN_TRANSIT → DELIVERED → SETTLED → CANCELLED`

**Key differentiator:** The RPM (Revenue Per Mile) profitability system — every load card shows a color-coded badge (green/yellow/red) based on the trucker's personal cost profile vs. the load's pay rate.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Direct and practical.** Truckers are professionals. Copy respects their time: "CLAIM" not "Click here to claim this load."
- **Action-first.** CTAs use imperative verbs in ALL CAPS: `CREATE NEW LOAD`, `SEARCH Carriers`, `PICKUP CONFIRMED`.
- **Data-dense.** Numbers are the hero — `$2.45/mi`, `97% on-time`, `265 mi`. Labels are secondary.
- **No emoji in the Shipper UI.** Clean and professional. The Carrier UI uses sparse emoji as functional icons (🚛, 🔔, ⚙).
- **Uppercase + letter-spacing** for section headers and table headers. Never sentence-case a heading.
- **Short field labels.** "Origin State" not "Enter the origin state for the load."
- **Status is always clear.** Every load has a visible status badge — ambiguity is never acceptable.

### Casing
- **Section headers:** ALL CAPS with letter-spacing (e.g., `ACTIVE LOADS`, `QUICK ACTION PANEL`)
- **Table column headers:** ALL CAPS, small, muted
- **CTA buttons:** ALL CAPS (Carrier), Title Case (Shipper secondary)
- **Body text / data:** Sentence case
- **Status badges:** ALL CAPS (e.g., `IN TRANSIT`, `DELIVERED`)

### Copywriting Examples
- *"No equipment type set — you're seeing all open loads. Update your profile to filter by your truck."*
- *"Set up your cost profile to see profitability ratings on loads."*
- *"Head to the pickup location and mark the load as picked up when you arrive."*
- *"Let's get your first load on the board in 2 minutes."*

---

## VISUAL FOUNDATIONS

### Color Philosophy
Two distinct palettes, one shared bronze accent:

**Shipper — "Classic Cream & Metallic Bronze"**
- Background canvas: warm cream `#EFEBE0` — reduces eye strain in office environments, evokes premium paper/linen
- Panel surfaces: pure white `#FFFFFF` — maximum contrast against cream, clearly separates content from background
- Primary text: dark charcoal `#1A1A1A` — near-black for maximum legibility
- CTA: metallic bronze gradient (`#C9A46A → #B08D57 → #8C6D3F`) — distinctive, premium, tactile

**Carrier — "Luxury Industrial"**
- Background: deep charcoal `#121212` — high contrast in sunlight, reduces eye strain at night
- Surface: `#1A1A1A` — slightly lifted from background for card separation
- Text: off-white `#F5F5F5` — soft on eyes against dark background
- Accent/muted text: metallic copper `#C9A876` — secondary labels, icons, tab labels
- CTA: same bronze gradient as shipper — brand consistency across both personas

**Shared semantic colors** (§6.1 — WCAG AA compliant, never deviated from):
- Success: `#27AE60` (5.2:1 contrast)
- Warning: `#F39C12` (4.5:1)
- Critical: `#E74C3C` (5.2:1)
- Info: `#3498DB` (5.4:1)

### Typography
- **Sora** — display/headings. Geometric, modern, slightly technical. Used for KPI numbers, section titles, hero text.
- **Inter** — body/UI. Maximum legibility for data tables, form labels, body copy.
- **Courier New** — monospace. Used sparingly for data strings (load IDs, prices in code contexts).
- KPI numbers use `font-size: 56px`, `font-weight: 900` (Sora heavy) — "number-first" hierarchy.
- Table headers: `12px`, `font-weight: 600`, ALL CAPS, `color: #636E72` — lightweight metadata treatment.
- Body minimum: `14px` (§6.2 data cell spec), `16px` for Carrier mobile.

### Spacing
Strict **8px grid rule** (§6.4). All margins, padding, and gaps must be multiples of 8:
- `4px` — icon/text pairs only
- `8px` — related elements (label → input)
- `16px` — component-to-component (default)
- `24px` — section separators, panel padding
- `32px` — page-level shell padding
- Forbidden: 10, 12, 14, 18, 20, 22, 25, 28, 30px

### Backgrounds & Layout
- **Shipper:** Cream canvas with white panels floating on top. Asymmetric 2/3 + 1/3 grid (content + action zone). Persistent redundancy: Quick Action Panel is duplicated in the action zone.
- **Carrier:** No-scroll mobile layout. Content split into tabs (Load Board / My Stats / Quick Actions). Hero section (active load) always visible above the tab bar.
- No background images, no full-bleed photography, no gradients as backgrounds (bronze gradient reserved for buttons only).

### Cards / Panels
- **Shipper (§6.5):** `background: #FFFFFF`, `border: 1px solid #D0D0D0`, `border-radius: 8px`, `box-shadow: 0 2px 4px rgba(0,0,0,0.05)`, `padding: 24px`
- **Carrier:** `background: #1A1A1A`, `border: 1px solid #2A2A2A`, `border-radius: 8px`, no shadow

### Buttons
- **Primary (both personas):** Bronze gradient with tactile 3D shadow system — inset highlights at top/bottom + outer elevation. Feels "physical."
- **Border radius:** `4px` for shipper CTAs (spec §6.4), `8px` for carrier (mobile-friendly larger target)
- **Carrier touch targets:** 48×48px minimum — non-negotiable for glove-friendly use
- **Hover:** `opacity: 0.9` + slightly darker gradient
- **Disabled:** `#D3D3D3` grey, `cursor: not-allowed`, no shadow

### Borders & Radius
- Panels: `8px` — soft but not bubbly
- Inputs: `4px` — subtly rounded
- Buttons: `6px` standard, `8px` carrier
- Badges/pills: `9999px` — fully rounded
- Avatars: `50%` — perfect circle

### Shadows
- Resting panel: `0 2px 4px rgba(0,0,0,0.05)` — barely there
- Hover/elevated: `0 4px 12px rgba(0,0,0,0.10)` — clearly lifted
- Button: `inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)` — the 3D tactile bronze effect
- Avatar ring (shipper): `0 0 0 2px #B08D57, 0 2px 6px rgba(176,141,87,0.4)` — bronze ring

### Animation
- Transitions: `150ms ease-in-out` for button hover/active states
- Panel shadow on hover: `200ms ease`
- Skeleton loading: shimmer animation (`background-size: 200% 100%`, `animation: 1.4s ease-in-out infinite`)
- No bounce, no spring, no decorative loops — strictly functional transitions
- Carrier mobile: no animations that slow down the primary task (claiming loads)

### Hover / Press States
- Buttons: `opacity: 0.9` on hover, `opacity: 0.8` on active
- Table rows: background → `#F8F9FB` (shipper), `border-color: #C9A876` (carrier)
- Cards with `hover=true`: box-shadow elevation increase
- Links: color unchanged, underline on hover

### Imagery & Color Vibe
- No decorative imagery — data is the content
- Logo: metallic copper/bronze semi-truck with motion blur. Warm, industrial, kinetic.
- Icon style: thin-line Lucide React icons — minimal stroke, geometric, no fills
- Never use emoji as decoration in shipper UI; sparse functional use in carrier UI

---

## ICONOGRAPHY

FreightClub uses **Lucide React** (`lucide-react ^1.17.0`) as its icon system. These are thin-stroke, geometric SVG icons.

**Usage rules:**
- Always thin-line stroke style (Lucide default)
- Never use filled icons — they read as too heavy against the data-dense layouts
- Icon size: `16px` for inline/badge, `20px` for navigation, `24px` for hero/actions
- Carrier UI: icons must be at least `20px` for touch-target legibility in sunlight
- Color: inherit from text color — never a custom color unless indicating status

**Common icons in use:**
- Navigation: Home, Truck, ClipboardList, User, Bell, Settings
- Actions: Plus, Edit, Trash2, Download, Upload, Search, Filter, RefreshCw
- Status: CheckCircle, AlertTriangle, XCircle, Clock, ArrowRight
- Business: DollarSign, MapPin, Calendar, Star, Package

**Available from CDN:**
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
```

**Logo:** `assets/logo.png` — use for headers (40–48px height). Dark backgrounds use `assets/logo-mobile.png`. Favicon: `assets/favicon.png`.

---

## File Index

```
styles.css                         ← Global entry point (import this)
tokens/
  colors.css                       ← All color custom properties
  typography.css                   ← Fonts + size/weight/spacing tokens
  spacing.css                      ← 8px grid spacing + layout dimensions
  shadows.css                      ← Elevation + button shadow system
  borders.css                      ← Radius + border shorthand tokens
assets/
  logo.png                         ← Primary MDB Integrated Logistics wordmark
  logo-mobile.png                  ← Compact version for mobile/carrier header
  favicon.png                      ← Browser favicon variant
  brand.png                        ← Brand reference image
  carrier-page-example.png         ← Carrier dark UI reference screenshot
  shipper-dashboard-prototype.png  ← Shipper desktop UI reference screenshot
components/core/
  Button.jsx / .d.ts / .prompt.md  ← Bronze-gradient CTA, persona-aware
  Input.jsx / .d.ts / .prompt.md   ← §6.3 form input (40px, 4px radius, bronze focus)
  Select.jsx / .d.ts               ← Dropdown matching Input spec
  Badge.jsx / .d.ts / .prompt.md   ← Semantic pill badge
  StatusBadge.jsx / .d.ts          ← Load lifecycle status badge
  Card.jsx / .d.ts / .prompt.md    ← §6.5 widget container
  StatCard.jsx / .d.ts             ← KPI "number-first" card
  Avatar.jsx / .d.ts               ← User initials circle (shipper/carrier)
  Skeleton.jsx / .d.ts             ← Loading placeholder shimmer
  ProfitabilityBadge.jsx / .d.ts   ← RPM tier badge (green/yellow/red)
  ErrorBanner.jsx / .d.ts          ← Inline error message
  core.card.html                   ← Component showcase card
  forms.card.html                  ← Form controls showcase card
guidelines/
  shipper-colors.card.html         ← Cream/white palette specimen
  bronze-colors.card.html          ← Bronze gradient swatch
  carrier-colors.card.html         ← Dark industrial palette specimen
  semantic-colors.card.html        ← Status color system with contrast ratios
  rpm-colors.card.html             ← RPM profitability band specimen
  type-display.card.html           ← Sora display type specimens
  type-body.card.html              ← Inter body/UI type specimens
  spacing.card.html                ← 8px grid spacing tokens
  shadows-borders.card.html        ← Elevation + radius system
  brand-logo.card.html             ← Logo variants
  brand-personas.card.html         ← Two-persona overview
  load-lifecycle.card.html         ← Status badge progression
ui_kits/shipper/
  index.html                       ← Shipper dashboard (desktop, interactive)
  README.md
ui_kits/carrier/
  index.html                       ← Carrier dashboard (mobile 375px, interactive)
  README.md
```

---

## Components

| Component | Purpose |
|---|---|
| `Button` | Bronze-gradient primary CTA; secondary (outlined); ghost; danger |
| `Input` | Form text input — §6.3: 40px height, 4px radius, bronze focus ring |
| `Select` | Dropdown matching Input spec |
| `Badge` | Generic semantic pill (success/warning/error/info/bronze/rpm tiers) |
| `StatusBadge` | Load lifecycle status (DRAFT/OPEN/CLAIMED/IN_TRANSIT/DELIVERED/SETTLED/CANCELLED) |
| `Card` | Widget container — §6.5: white bg, #D0D0D0 border, 8px radius, 24px padding |
| `StatCard` | KPI number-first display (56px Sora heavy + uppercase label) |
| `Avatar` | User initials circle — bronze ring (shipper) or bronze fill (carrier) |
| `Skeleton` | Shimmer loading placeholder (text/title/avatar/card/badge variants) |
| `ProfitabilityBadge` | RPM $/mi badge with green/yellow/red tier coloring |
| `ErrorBanner` | Inline error block with warning icon |

---

## Sources

- **GitHub:** https://github.com/mdb3624/freightclub — full-stack React + Spring Boot codebase
  - Frontend tokens: `frontend/tailwind.config.ts`, `frontend/src/index.css`
  - Style guides: `docs/standards/brand_assets/Carrier Style Guide.md`, `docs/standards/brand_assets/Shipper & Administrator Style Guide.md`
  - Atomic specs: `docs/standards/brand_assets/Shipper & Administrator Style Guide.md` §6.1–6.5
  - Brand reference: `docs/standards/brand_assets/` (logo files, prototype screenshots)
  - Component source: `frontend/src/components/`, `frontend/src/features/`
