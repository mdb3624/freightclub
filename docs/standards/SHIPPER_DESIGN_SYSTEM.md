# Shipper Design System

**Authority:** HFD (Human Factors Designer)  
**Applies To:** All Shipper stories (US-820+) and Admin stories  
**Status:** LOCKED STANDARD  
**Source:** `Prototype/` — authoritative design system (2026-07-03)  
**Theme:** "Classic Cream & Metallic Bronze"

---

## Persona Overview

| Attribute | Value |
|---|---|
| Platform | Desktop browser (1280px+ primary) |
| Theme | Classic Cream & Metallic Bronze |
| Layout | ShipperPageLayout (mandatory wrapper) |
| Spacing | 8px grid only |
| Typography | Sora (display) + Inter (body) |

---

## Color Tokens (Copy-Paste Authoritative)

```css
/* ── Canvas & Surfaces ──────────────────────────────────── */
--color-canvas:         #EFEBE0;   /* Page background (warm cream) */
--color-surface-white:  #FFFFFF;   /* Panels, cards, modals */
--color-surface-light:  #F8F9FB;   /* Readonly inputs, row hovers */

/* ── Text Hierarchy ─────────────────────────────────────── */
--color-text-primary:   #1A1A1A;   /* Body, data cells */
--color-text-secondary: #4A5568;   /* Supporting text */
--color-text-tertiary:  #636E72;   /* Table headers, labels, muted */

/* ── Bronze Accent (CTA, focus, borders) ────────────────── */
--color-bronze:         #B08D57;   /* Primary bronze */
--color-bronze-light:   #C9A46A;   /* Gradient top / hover */
--color-bronze-dark:    #8C6D3F;   /* Gradient bottom */
--color-bronze-border:  #7A5F3A;   /* Button border */
--color-bronze-muted:   #C9A876;   /* Muted accent, preferred badge */

/* ── Borders ────────────────────────────────────────────── */
--color-border-primary:   #D0D0D0;   /* Panel, input, table borders */
--color-border-secondary: #E8E3D8;   /* Table row dividers (softer) */
--color-divider-light:    #D0CCC4;   /* Section dividers */

/* ── Semantic Status ────────────────────────────────────── */
--color-success:          #27AE60;   /* bg: #DCFCE7 | text: #15803D */
--color-success-subtle:   #DCFCE7;
--color-success-text:     #15803D;
--color-warning:          #F39C12;   /* bg: #FEF3C7 | text: #B45309 */
--color-warning-subtle:   #FEF3C7;
--color-warning-text:     #B45309;
--color-critical:         #E74C3C;   /* bg: #FEE2E2 | text: #B91C1C */
--color-critical-subtle:  #FEE2E2;
--color-critical-text:    #B91C1C;
--color-info:             #3498DB;   /* bg: #DBEAFE | text: #1D4ED8 */
--color-info-subtle:      #DBEAFE;
--color-info-text:        #1D4ED8;

/* ── RPM Profitability Bands ────────────────────────────── */
--color-rpm-high:    #22C55E;   /* rpm >= minRpm * 1.2 (profitable) */
--color-rpm-neutral: #F59E0B;   /* rpm >= minRpm (marginal) */
--color-rpm-low:     #EF4444;   /* rpm < minRpm (unprofitable) */
```

### Load Status → Badge Colors

| Status | Background | Text |
|---|---|---|
| DRAFT | `#F1F5F9` | `#475569` |
| OPEN | `#DBEAFE` | `#1D4ED8` |
| CLAIMED | `#FEF3C7` | `#B45309` |
| IN_TRANSIT | `#EDE9FE` | `#6D28D9` |
| DELIVERED | `#DCFCE7` | `#15803D` |
| SETTLED | `#CCFBF1` | `#0F766E` |
| CANCELLED | `#FEE2E2` | `#B91C1C` |

---

## Typography Tokens

```css
--font-display: 'Sora', sans-serif;   /* Headings, KPI numbers */
--font-body:    'Inter', sans-serif;  /* All UI, data, labels, inputs */

/* Sizes (only these — no others) */
--font-size-xs:   11px;
--font-size-sm:   12px;
--font-size-md:   14px;
--font-size-base: 16px;
--font-size-lg:   18px;
--font-size-xl:   24px;
--font-size-kpi:  40px;
--font-size-hero: 56px;

/* Weights */
--font-weight-regular:   400;
--font-weight-medium:    500;
--font-weight-semibold:  600;
--font-weight-bold:      700;
--font-weight-black:     900;

/* Letter Spacing */
--letter-tight:  -0.02em;
--letter-normal:  0em;
--letter-wide:    0.05em;
--letter-wider:   0.1em;
```

### Typography Rules
- **Section headers:** Sora, ALL CAPS, `letter-spacing: 0.05em` or wider
- **Table headers:** `12px`, `font-weight: 600`, ALL CAPS, `color: #636E72`
- **Body minimum:** `14px` (desktop)
- **KPI numbers:** Sora, `font-size: 56px`, `font-weight: 900`
- **Data cells:** Inter, `14px`, `color: #1A1A1A`

---

## Spacing Tokens (8px Grid — Non-Negotiable)

```css
--space-xs: 4px;   /* Icon/text pairs only */
--space-sm: 8px;   /* Related elements (label → input) */
--space-md: 16px;  /* Component-to-component (default gap) */
--space-lg: 24px;  /* Section separators, panel padding */
--space-xl: 32px;  /* Page-level shell padding */
```

**FORBIDDEN spacing values:** 10, 12, 14, 18, 20, 22, 25, 28, 30px  
**All padding and margin must be multiples of 8px (4px allowed only for icon/text pairs).**

### Layout Dimensions
```css
--header-height:    64px;   /* AppShell sticky header */
--table-row-height: 48px;   /* Exact — never deviate */
--input-height:     40px;   /* Form inputs — exact */
--touch-target-min: 44px;   /* Desktop minimum */
```

---

## Border & Radius Tokens

```css
--radius-input:  4px;      /* Form inputs — exact (§6.3) */
--radius-button: 6px;      /* Standard button */
--radius-widget: 8px;      /* Cards, panels — exact (§6.5) */
--radius-pill:   9999px;   /* Badges, tags, chips */
--radius-full:   50%;      /* Avatars */

--border-widget:  1px solid #D0D0D0;
--border-divider: 1px solid #E8E3D8;
--border-focus:   2px solid #B08D57;
--border-subtle:  1px dashed #D0CCC4;
```

---

## Shadow Tokens

```css
--shadow-subtle:   0 2px 4px rgba(0, 0, 0, 0.05);    /* Resting panel */
--shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.10);   /* Hover, dropdown */
--shadow-header:   0 1px 3px rgba(0, 0, 0, 0.05);    /* Sticky header */

/* Bronze button 3D tactile shadow */
--shadow-btn: inset 0 1px 2px rgba(255, 255, 255, 0.25),
              inset 0 -1px 2px rgba(0, 0, 0, 0.20),
              0 2px 5px rgba(0, 0, 0, 0.35);

/* Avatar bronze ring */
--shadow-avatar: 0 0 0 2px #B08D57, 0 2px 6px rgba(176, 141, 87, 0.40);
```

---

## Component Specifications

### Primary Button (Bronze Gradient CTA)
```css
background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
box-shadow: inset 0 1px 2px rgba(255,255,255,0.25),
            inset 0 -1px 2px rgba(0,0,0,0.2),
            0 2px 5px rgba(0,0,0,0.35);
border: 1px solid #7A5F3A;
border-radius: 4px;           /* Shipper: 4px (not 6px, not 8px) */
color: #FFFFFF;
font-size: 14px;
font-weight: 700;
padding: 8px 16px;
min-height: 44px;
```

### Secondary Button
```css
background: linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%);
border: 1px solid #C9A876;
color: #7A5F3A;
box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.15);
border-radius: 6px;
font-size: 14px;
font-weight: 600;
min-height: 44px;
```

### Form Input (§6.3)
```css
height: 40px;               /* Exact — never deviate */
border-radius: 4px;         /* Exact — never deviate */
border: 1px solid #D0D0D0;
background: #FFFFFF;
font-size: 14px;
color: #1A1A1A;
padding: 0 12px;

/* Focus state */
border: 2px solid #B08D57;
outline: none;

/* Readonly/calculated */
background: #F8F9FB;
border: 1px solid #E8E3D8;
color: #636E72;
cursor: not-allowed;
```

### Card / Panel (§6.5)
```css
background: #FFFFFF;
border: 1px solid #D0D0D0;
border-radius: 8px;         /* Exact */
box-shadow: 0 2px 4px rgba(0,0,0,0.05);
padding: 24px;
```

### Data Table
```css
/* Header row */
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
color: #636E72;
letter-spacing: 0.05em;

/* Data row */
height: 48px;               /* Exact */
border-bottom: 1px solid #E8E3D8;
font-size: 14px;
color: #1A1A1A;

/* Row hover */
background: #F8F9FB;

/* Selected row */
border-left: 3px solid #B08D57;
```

### Status Badge (Pill)
```css
border-radius: 9999px;
padding: 2px 8px;
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.04em;
```

---

## Layout Rules

### ShipperPageLayout (MANDATORY)
- **Every** shipper page MUST be wrapped in `<ShipperPageLayout>`
- No custom header/navigation structures permitted
- No layout styling overrides without documented exception
- Violation = automatic PR rejection

### Header (AppShell)
```
Height: 64px (fixed, sticky)
Background: #FFFFFF
Border-bottom: 1px solid #D0D0D0
Box-shadow: 0 1px 3px rgba(0,0,0,0.05)

Contents: Logo (left) · Navigation (hidden for shipper) · Bell icon · Avatar badge (right)
Avatar: Bronze ring — box-shadow: 0 0 0 2px #B08D57, 0 2px 6px rgba(176,141,87,0.4)
```

### Shipper Header Navigation Pattern
- NO text nav links (no "My Loads", "Profile" in header)
- Only: logo + notification bell + circular avatar badge
- Profile + Sign out in dropdown off avatar badge
- "My Loads" lives in dashboard body as bronze button — NOT in header

### Page Canvas
```
Background: #EFEBE0 (warm cream)
Content max-width: 1280px (centered)
Page padding: 32px (left/right)
Section gap: 24px
```

### Dashboard Grid
```
Layout: 2/3 content + 1/3 action zone (asymmetric)
Content area gap: 16px
KPI cards: 3-column row
```

---

## Responsive Breakpoints
```
Desktop primary:  ≥ 1280px — full 2/3 + 1/3 layout
Tablet fallback:  768–1279px — graceful column stacking
Mobile:           ≤ 767px — acceptable (not primary for shipper persona)
```

---

## Design Checklist (Every Shipper Story)

Before PR:
- [ ] ShipperPageLayout wrapper verified
- [ ] Tested on desktop (1280px) browser
- [ ] Colors match this design system exactly (zero custom hex values)
- [ ] All spacing multiples of 8px (verify no 10/12/14/20px values)
- [ ] Input height exactly 40px, border-radius exactly 4px
- [ ] Panel border-radius exactly 8px, border exactly `1px solid #D0D0D0`
- [ ] Table row height exactly 48px
- [ ] Button bronze gradient matches exactly (no alternative grays or blues)
- [ ] Focus ring exactly `2px solid #B08D57`
- [ ] All AC from design spec satisfied
- [ ] Zero deviations without CHG ticket

---

## Enforcement

**REVIEWER rejects any PR that:**
- Missing ShipperPageLayout wrapper
- Uses colors outside this palette (any `#4A` grays, blue primaries, etc.)
- Spacing not a multiple of 8px
- Input height ≠ 40px or border-radius ≠ 4px
- Panel border-radius ≠ 8px
- Table row height ≠ 48px
- Design deviations without CHG ticket + LIBRARIAN approval

---

**Status:** LOCKED STANDARD  
**Version:** 2.0 (2026-07-03) — rewritten from prototype authoritative source  
**Source:** `Prototype/tokens/`, `Prototype/readme.md`, `Prototype/INTEGRATION_PROMPT.md`
