# HFD Design Spec: US-848 — Carrier Network Page

**Status:** LOCKED
**Source:** `Prototype/ui_kits/shipper/carrier-network.html`
**Route:** `/carriers`
**Date:** 2026-07-03

---

## 1. Page Shell

- **Wrapper:** `ShipperPageLayout` (mandatory — REVIEWER rejects without it)
- **Layout:** Two-column flex row inside `slotB` (full width, `!w-full`): `FilterSidebar` (240px fixed) + `<main>` (flex-1)
- **Canvas:** `var(--color-canvas)` background (`#F5F0E8`)
- **Max-width:** 1400px centered, `padding: 24px`
- **Detail panel open:** main content area right-padding shifts to 424px (400px panel + 24px gap), `transition: padding-right 300ms ease`

---

## 2. Breadcrumb / Navigation (inside ShipperPageHeader)

The `ShipperPageHeader` renders the standard header. Below it, a breadcrumb nav renders inside the page body:

```
[Logo]  Dashboard › Carrier Network          [← Back to Dashboard]
```

- "Dashboard" link → `navigate('/shipper/dashboard')`; color `#B08D57`, fontWeight 600
- "Carrier Network" label: color `#1A1A1A`, fontWeight 600
- Back button: `btn-secondary` style, `padding: 7px 16px`, `fontSize: 13px`
- `data-testid="breadcrumb-dashboard-link"`, `data-testid="back-to-dashboard-btn"`

---

## 3. Filter Sidebar

**Container:** `panel` class (bg `#fff`, border `1px solid #D0D0D0`, radius 8px, shadow), `padding: 20px`, gap 16px, width 240px.

### Fields (top to bottom)

| Field | Type | testid |
|---|---|---|
| Origin state | `<select>` | `filter-origin` |
| Destination state | `<select>` | `filter-dest` |
| Equipment type | `<select>` | `filter-equip` |
| Min Rating toggle group | 4 buttons: Any / 3★ / 4★ / 4.5★ | `filter-rating-{0\|3\|4\|4.5}` |
| Min On-Time Rate toggle group | 4 buttons: Any / 90%+ / 95%+ / 99%+ | `filter-ontime-{0\|90\|95\|99}` |
| Preferred only | Checkbox + label | `filter-preferred-only` |
| Search Carriers | `btn-primary`, full-width, `padding: 10px 0` | `search-carriers-btn` |
| Clear filters | `btn-ghost`, full-width | `clear-filters-btn` |

**Section title:** Sora, 16px, fontWeight 700, color `#1A1A1A`

**Label style:** 11px, fontWeight 600, uppercase, `#9C8060`, `letterSpacing: 0.05em`

**Selects:** height 36px, border `1px solid #D0D0D0`, radius 4px, focus: `2px solid #B08D57` + `box-shadow: 0 0 0 3px rgba(176,141,87,0.1)`

**Toggle buttons (rating / on-time):** `flex: 1`, `padding: 5px 0`, radius 4px, fontSize 12px, fontWeight 600
- Active: `background: linear-gradient(180deg,#FAF6EE,#F0E9D8)`, border `#B08D57`, color `#7A5F3A`
- Inactive: bg `#fff`, border `#D0D0D0`, color `#636E72`

**Origin/Dest state options:** TX, CA, FL, IL, AZ, CO, OR, NY, TN, PA (origin); TX, CA, FL, IL, AZ, CO, WA, NY, GA, TN (dest)
**Equipment options:** Dry Van, Flatbed, Reefer, Box Truck, Step Deck

---

## 4. Preferred Carriers Strip

**Visible when:** at least 1 preferred carrier exists.

**Container:** `panel` class, `padding: 16px`, marginBottom 20px.

**Header row:** "YOUR PREFERRED CARRIERS" (11px, 700, uppercase, `#636E72`) + "{n} saved" count (12px, `#9CA3AF`)

**Carrier chips:** horizontal flex row, `overflowX: auto`, gap 10px, `paddingBottom: 4px`
- Each chip: `padding: 8px 12px`, bg `#FAF6EE`, border `1px solid #C9A876`, radius 8px, cursor pointer
- Selected chip border: `#B08D57`
- Contents: Avatar (sm 32px) + name (13px, 600, `#1A1A1A`) + on-time % or `—` (11px, `#636E72`)
- `data-testid="preferred-strip-{carrierId}"`

---

## 5. Results Grid

**Header row:** "Available Carriers" (Sora, 20px, 700) + "{n} results" count (13px, `#9CA3AF`) + sort `<select>` (auto width, height 32px)

**Sort options:** "Sort: Highest rated", "Sort: Most loads", "Sort: On-time rate", "Sort: Newest"
**Sort select testid:** `sort-carriers-select`

**Grid:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px`

**Empty state:** full-width cell, centered, `padding: 48px`, `color: #9CA3AF`, "No carriers match your filters. Try widening your search." — `data-testid="carriers-empty-state"`

---

## 6. Carrier Card

**Container class:** bg `#fff`, border `1px solid #D0D0D0`, radius 8px, shadow `0 2px 4px rgba(0,0,0,.05)`, `padding: 16px`, cursor pointer, transition 150ms
- Hover: border `#B08D57`, shadow `0 4px 12px rgba(176,141,87,.15)`, `transform: translateY(-1px)`
- Selected: border `#B08D57` 2px, shadow `0 4px 12px rgba(176,141,87,.2)`
- `data-testid="carrier-card-{id}"`

**Preferred badge** (if preferred): absolute top 10px right 10px, gradient `135deg #C9A46A → #8C6D3F`, white, 10px, 700, `padding: 2px 8px`, pill radius
- `data-testid="preferred-badge-{id}"`

**Row 1:** Avatar (md 44px) + [Name (Sora 15px 700 `#1A1A1A`) / Stars row]
**Stars:** filled `★` color `#F59E0B`, empty `★` color `#E8E3D8`, fontSize 13px. Rating number 13px 600 `#1A1A1A`. Count 12px `#9CA3AF`. If rating absent: render 5 empty stars.

**Row 2 (stat boxes grid, 3 cols):** `display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px`
- Each stat-box: bg `#FAF6EE`, radius 6px, border `1px solid #E8E3D8`, padding 10px, text-center
- Stat number: Sora 20px 900 `#1A1A1A`; On-Time number color `#27AE60`
- Stat label: 10px 600 uppercase `#9C8060`, `letterSpacing: 0.06em`
- Boxes: [On-Time % | Loads | Member Since]
- If value absent: show `—`
- `data-testid="stat-ontime-{id}"`, `data-testid="stat-loads-{id}"`, `data-testid="stat-member-{id}"`

**Row 3 (tags):** `display: flex; flex-wrap: wrap; gap: 4px; marginBottom: 12px`
- Equipment tag: bg `#F5F0E8`, border `1px solid #C9A876`, color `#7A5F3A`, 11px 600, pill radius `data-testid="equip-tag-{type}"`
- Lane tag: bg `#F1F5F9`, border `1px solid #CBD5E1`, color `#475569`, 11px 500, pill radius

**Row 4 (actions):** two buttons side by side, `gap: 8px`
- "Get Quote": `btn-primary`, `flex: 1`, `padding: 8px 0`, 13px — `data-testid="get-quote-btn-{id}"`; onClick stops propagation, navigates to `/shipper/quote?carrierId={id}`
- "☆ Add Preferred" / "★ Preferred": `btn-secondary`, `flex: 1`, `padding: 8px 0`, 13px — `data-testid="toggle-preferred-btn-{id}"`; onClick stops propagation, toggles preferred

---

## 7. Detail Panel

**Position:** `position: fixed; right: 0; top: 64px; bottom: 0; width: 400px; background: #fff; border-left: 1px solid #D0D0D0; box-shadow: -4px 0 20px rgba(0,0,0,.08); overflow-y: auto; z-index: 20`
- Open: `transform: translateX(0)`; Closed: `transform: translateX(100%)`; transition 300ms ease
- `data-testid="carrier-detail-panel"`

**Sticky header** (bg `#FAF6EE`, border-bottom `1px solid #E8E3D8`, padding 20px, z-index 1):
- Row 1: "✕ Close" ghost button (left, `data-testid="close-detail-panel-btn"`) + Add/Remove Preferred secondary button (right, `data-testid="detail-preferred-btn"`)
- Row 2: Avatar (lg 56px) + [Name Sora 18px 700 / Stars row / DOT + member since 12px `#636E72`]

**Body** (padding 20px, gap 20px):
- Bio paragraph: 13px `#4A5568` lineHeight 1.6
- 2×2 stats grid: On-Time Rate, Loads Completed, Avg. Rating, Total Reviews
- Equipment & Lanes section label + tags
- Recent Reviews section label + review items (author, date, stars, text, `border-bottom: 1px solid #F0EBE0`)
- CTA footer (`border-top: 1px solid #E8E3D8`, gap 8px):
  - "Assign to Load" `btn-primary` full-width `data-testid="assign-to-load-btn"` → navigates to `/carriers/{id}`
  - "Request Quote" `btn-secondary` full-width `data-testid="request-quote-btn"` → navigates to `/shipper/quote?carrierId={id}`

---

## 8. AC-to-UI Mapping

| AC | UI Element |
|---|---|
| AC-1 | ShipperPageLayout wrapper; `useEffect` reads URL params on mount and calls search |
| AC-2 | `search-carriers-btn` triggers mutation; `clear-filters-btn` resets state |
| AC-3 | Preferred strip renders when `preferredCarriers.length > 0`; chip onClick sets selected carrier |
| AC-4 | CarrierCard displays companyName, equipment tags, on-time stat box, action buttons |
| AC-5 | Card onClick (outside buttons) sets `selectedCarrier`; panel slides in; close button clears it |
| AC-6 | Toggle preferred button calls `useAddPreferredCarrier` / `useRemovePreferredCarrier`; local state updated optimistically |
| AC-7 | `carriers-empty-state` testid renders when `carriers.length === 0` |
| AC-8 | breadcrumb link + back button navigate to `/shipper/dashboard` |

---

## 9. Tokens Used

From `SHIPPER_DESIGN_SYSTEM.md`:
- `--color-canvas: #F5F0E8`
- `--color-text-primary: #1A1A1A`
- `--color-text-secondary: #636E72`
- `--color-border: #D0D0D0`
- `--color-brand-bronze: #B08D57`
- `--color-success: #27AE60`

Avatar: bg `#fff`, color `#1A1A1A`, border `2px solid #B08D57`, box-shadow ring `0 0 0 2px #B08D57`

**Design is LOCKED. No changes during CODER phase. Escalate to LIBRARIAN via CHG if infeasible.**
