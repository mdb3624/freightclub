# Carrier Design System (Owner-Operator)

**Authority:** HFD (Human Factors Designer)  
**Applies To:** All Owner-Operator (OO) stories (US-730+)  
**Status:** LOCKED STANDARD  
**Source:** `Prototype/` — authoritative design system (2026-07-03)  
**Theme:** "Luxury Industrial" dark mode

---

## Persona Overview

| Attribute | Value |
|---|---|
| Platform | Mobile (iPhone 375px primary; desktop optional) |
| Theme | Luxury Industrial dark mode |
| Shell | `position: fixed; inset: 0` standalone (NO AppShell) |
| Spacing | 8px grid only |
| Typography | Sora (display) + Inter (body) |

---

## Core Principles (Non-Negotiable)

### 1. NO-SCROLL Paradigm
- All dashboard content fits within 100vh viewport
- Tabbed interfaces to switch content — not page navigation
- Internal scroll only within modals or tab content areas
- **Why:** Truck cab operation requires single-screen visibility

### 2. Mobile-First Mandatory
- Primary device: iPhone SE/12/13 (375px minimum width)
- Design and test at 375px; tablet/desktop secondary
- Test on real device in sunlight before sign-off
- **Why:** Owner-operators use phones in truck cab 95% of the time

### 3. Luxury Industrial Aesthetic
- Deep charcoal background (`#121212`) — sunlight readable, reduces glare
- Metallic bronze/copper accent (`#B08D57` / `#C9A876`)
- Sora (bold uppercase headers) + Inter (body 14px minimum)
- WCAG AAA contrast (7:1+) in direct sunlight
- **Why:** Readable in high-glare cab environment

### 4. Glove-Friendly Interaction
- All touch targets: min `48×48px` — NO 44px, NO 40px
- Minimum `8px` spacing between interactive elements
- Tap-only — NO swipe, NO long-press, NO complex gestures
- Single-hand operation (one hand on wheel)
- **Why:** Gloved hands + moving vehicle = safety critical

### 5. Performance Critical
- LCP (Largest Contentful Paint) < 2s on 4G LTE
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

---

## Color Tokens (Copy-Paste Authoritative)

```css
/* ── Backgrounds ────────────────────────────────────────── */
--carrier-bg:          #121212;   /* Page / shell background */
--carrier-surface:     #1A1A1A;   /* Cards, panels */
--carrier-surface-2:   #242424;   /* Nested / elevated surface */
--carrier-overlay:     rgba(0, 0, 0, 0.70);  /* Modal backdrop */

/* ── Borders ────────────────────────────────────────────── */
--carrier-border:      #2A2A2A;   /* Default card/panel border */
--carrier-border-glow: #3A3A3A;   /* Elevated / hover border */

/* ── Text ───────────────────────────────────────────────── */
--carrier-text-primary: #F5F5F5;  /* Body text, data */
--carrier-text-accent:  #C9A876;  /* Muted labels, tab icons, secondary text */

/* ── Bronze Accent ──────────────────────────────────────── */
--color-bronze:         #B08D57;  /* Primary bronze */
--color-bronze-light:   #C9A46A;  /* Gradient top */
--color-bronze-dark:    #8C6D3F;  /* Gradient bottom */
--color-bronze-border:  #7A5F3A;  /* Button border */
--color-bronze-muted:   #C9A876;  /* Muted/accent text */

/* ── Semantic Status ────────────────────────────────────── */
--color-success:        #27AE60;   /* bg: #DCFCE7 | text: #15803D */
--color-success-subtle: #DCFCE7;
--color-success-text:   #15803D;
--color-warning:        #F39C12;   /* bg: #FEF3C7 | text: #B45309 */
--color-warning-subtle: #FEF3C7;
--color-warning-text:   #B45309;
--color-critical:       #E74C3C;   /* bg: #FEE2E2 | text: #B91C1C */
--color-critical-subtle:#FEE2E2;
--color-critical-text:  #B91C1C;
--color-info:           #3498DB;   /* bg: #DBEAFE | text: #1D4ED8 */
--color-info-subtle:    #DBEAFE;
--color-info-text:      #1D4ED8;

/* ── RPM Profitability Bands ────────────────────────────── */
--color-rpm-high:    #22C55E;   /* rpm >= minRpm * 1.2 (profitable) */
--color-rpm-neutral: #F59E0B;   /* rpm >= minRpm (marginal) */
--color-rpm-low:     #EF4444;   /* rpm < minRpm (unprofitable) */
```

### RPM Band Logic
```typescript
function getRpmColor(rpm: number, minRpm: number): string {
  if (rpm >= minRpm * 1.2) return '#22C55E'  // high (green)
  if (rpm >= minRpm)       return '#F59E0B'  // neutral (yellow)
  return '#EF4444'                            // low (red)
}
```

---

## Typography Tokens

```css
--font-display: 'Sora', sans-serif;
--font-body:    'Inter', sans-serif;

/* Sizes */
--font-size-xs:   11px;
--font-size-sm:   12px;   /* Tab labels, badge labels */
--font-size-md:   14px;   /* Body minimum (carrier) */
--font-size-base: 16px;
--font-size-lg:   18px;
--font-size-xl:   24px;
--font-size-kpi:  40px;
--font-size-hero: 56px;   /* Earnings hero */

/* Weights */
--font-weight-regular:  400;
--font-weight-semibold: 600;
--font-weight-bold:     700;
--font-weight-black:    900;

/* Letter Spacing */
--letter-wide:   0.05em;
--letter-wider:  0.1em;
```

### Typography Rules
- **Section headers:** Sora, ALL CAPS, `letter-spacing: 0.05em+`, `color: #F5F5F5`
- **Tab labels:** Inter, `12px`, `font-weight: 600`, ALL CAPS, `color: #C9A876` (active: `#B08D57`)
- **Body text:** Inter, `14px`, `color: #F5F5F5`
- **Muted labels:** Inter, `10–12px`, `color: #C9A876`
- **Earnings hero:** Sora, `56px` (`var(--font-size-hero)`), `font-weight: 900`, `color: #27AE60`

---

## Spacing Tokens (8px Grid — Non-Negotiable)

```css
--space-xs: 4px;   /* Icon/text pairs only */
--space-sm: 8px;   /* Related elements */
--space-md: 16px;  /* Component-to-component */
--space-lg: 24px;  /* Section separators */
--space-xl: 32px;  /* Shell-level padding */
```

**FORBIDDEN values:** 10, 12, 14, 18, 20, 22, 25, 28, 30px

### Layout Dimensions
```css
--carrier-header-height:   56px;   /* Fixed top header */
--carrier-tab-bar-height:  48px;   /* Fixed bottom tab bar */
--carrier-touch-target:    48px;   /* Minimum — non-negotiable */
--carrier-button-height:   48px;   /* Primary CTA height */
--carrier-pill-height:     36px;   /* Compact secondary action */
```

---

## Border & Radius Tokens

```css
--radius-input:  4px;      /* Form inputs (shared with shipper) */
--radius-button: 8px;      /* Carrier buttons (larger than shipper's 4px) */
--radius-widget: 8px;      /* Cards, panels */
--radius-pill:   9999px;   /* Badges, tags, pill buttons */
--radius-full:   50%;      /* Avatars */

--carrier-border-default: 1px solid #2A2A2A;
--carrier-border-accent:  1px solid #7A5F3A;
```

---

## Shadow Tokens

```css
/* Carrier uses no resting shadow — dark surface separation via border only */
--shadow-btn: inset 0 1px 2px rgba(255, 255, 255, 0.25),
              inset 0 -1px 2px rgba(0, 0, 0, 0.20),
              0 2px 5px rgba(0, 0, 0, 0.35);
```

---

## Component Specifications

### Shell Structure (Mandatory)
```tsx
// Carrier dashboard MUST use standalone fixed shell — NOT AppShell
<div
  style={{ position: 'fixed', inset: 0, background: '#121212',
           display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
  data-persona="carrier"
>
  <header style={{ height: 56, flexShrink: 0 }}>...</header>
  <main style={{ flex: 1, overflow: 'hidden' }}>...</main>
  <nav style={{ height: 48, flexShrink: 0 }}>...</nav>
</div>
```

### Header (Fixed, 56px)
```
Height: 56px
Background: #1A1A1A
Border-bottom: 1px solid #2A2A2A

Layout (left → right):
├─ Logo: 40×40px (use logo-mobile.png for dark bg)
├─ [FLEX SPACE]
├─ HOS Chip: ~120px, color-coded (green/amber/red)
├─ [FLEX SPACE]
├─ Notification Bell: 48×48px touch target, red badge if unread
└─ Avatar: 48×48px circular, bronze bg (#B08D57), white initials
```

### Bottom Tab Bar (Fixed, 48px)
```
Height: 48px
Background: #1A1A1A
Border-top: 1px solid #2A2A2A

Active tab: border-top: 2px solid #B08D57; color: #B08D57
Inactive tab: color: #C9A876
Tab label: 12px, font-weight: 600, uppercase

Tabs: Board (⊞) · My Stats (📊) · Settings (⚙)
```

### Primary Button (Bronze Gradient)
```css
height: 48px;
padding: 12px 24px;
background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
border: 1px solid #7A5F3A;
border-radius: 8px;   /* Carrier: 8px (not 4px like shipper) */
box-shadow: inset 0 1px 2px rgba(255,255,255,0.25),
            inset 0 -1px 2px rgba(0,0,0,0.2),
            0 2px 5px rgba(0,0,0,0.35);
color: #FFFFFF;
font-size: 14px;
font-weight: 700;
```

### Secondary Button
> **Note (2026-07-03):** CHG-US730-002 (2026-06-25) retired the transparent variant in favour of bronze-gradient fill. The prototype design system (the authoritative source per 2026-07-03 design system update) specifies transparent secondary. This reinstates the prototype spec. Existing carrier components using `variant="secondary"` should be audited against this updated standard.

```css
height: 48px;
padding: 12px 24px;
background: transparent;
border: 1px solid #3A3A3A;
border-radius: 8px;
color: #C9A876;
font-size: 14px;
font-weight: 600;
```

### Pill Button (Compact Actions)
```css
height: 36px;
padding: 8px 16px;
background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
border: 1px solid #7A5F3A;
border-radius: 9999px;   /* pill — matches --radius-pill token */
color: #FFFFFF;
font-size: 12px;
font-weight: 600;
```

### Card / Panel
```css
background: #1A1A1A;
border: 1px solid #2A2A2A;
border-radius: 8px;
padding: 16px;
/* No box-shadow on carrier — border provides separation */
```

### Load Card (Compact, 90px height)
```
Padding: 12px
Border: 1px solid #2A2A2A
Border-radius: 8px
Background: #1A1A1A

Row hover: border-color: #C9A876

Contents:
├─ Route: 14px bold #F5F5F5
├─ Rate + RPM Badge: 14px semibold + rpm tier color
└─ Actions: [Details] [Claim] pill buttons (36px)
```

### RPM Badge (Profitability)
```
Height: 28px (pill shape, border-radius: 9999px)
Font: 12px bold
Colors:
  Green  #22C55E — rpm >= minRpm * 1.2
  Yellow #F59E0B — rpm >= minRpm
  Red    #EF4444 — rpm < minRpm
Placement: Right side of load card rate line
```

### Equipment Badge (Read-Only, Profile-Driven)
```
Pattern: [YOUR EQUIPMENT label] [equipment pill] [count label right-aligned]

Container:
  background: #161616
  border: 1px solid #2A2A2A
  border-radius: 8px
  padding: 8px

Label: 11px, font-weight: 700, uppercase, letter-spacing: 0.07em, color: #636E72
Pill: background: rgba(201,168,118,0.1), border: 1px solid #C9A876,
      color: #C9A876, font-size: 12px, font-weight: 700, border-radius: 9999px

No filter dropdown — profile drives board queries entirely
```

### Board Lock Banner (Active Load)
```
border: 1px solid #C9A876   /* rgb(201, 168, 118) */
border-radius: 8px
background: rgba(201, 168, 118, 0.08)
padding: 12px 16px

Icon: 🔒
Text primary: "Load board locked" (14px, #F5F5F5)
Text secondary: "Complete your current load to claim another" (12px, #C9A876)
```

### Stat Grid (My Stats Tab)
```
Earnings hero: Sora, 56px (--font-size-hero), font-weight: 900, color: #27AE60

4-stat grid (2×2):
  Cell size: min 80×80px
  Background: #1A1A1A
  Border: 1px solid #2A2A2A
  Border-radius: 8px
  Value: 24px bold #F5F5F5
  Label: 10px #C9A876, uppercase
```

---

## Viewport Math (All OO Stories)

```
iPhone 12 safe area:
├─ Top notch:       44px
├─ Bottom bar:      34px
└─ Usable height:   734px (812 - 44 - 34)

Mandatory layout:
├─ Header (fixed):        56px
├─ Content / Tab area:   630px  (fills remaining space)
└─ Tab bar (fixed):       48px

Total: 56 + 630 + 48 = 734px ✓
```

Every OO story must verify content fits without page-level scroll.

---

## Business Rules Enforced in UI

1. **One equipment type per OO** — profile drives all load board queries; no equipment filter dropdown shown
2. **One active load at a time** — when a load is claimed, board locks immediately with banner
3. **State-change actions return to dashboard** — after Claim, Pickup, POD Complete → navigate back to main (`/dashboard/trucker`)
4. **Confirmation dialogs** required before: Claim, Mark Pickup, Mark Delivered, Cancel Load

---

## Settings Tab Items (6 items)
```
Cost Profile · Payments · Load History · Notifications · Profile · Support
```

---

## Interaction Patterns

### Tabbed Navigation
- 3 tabs maximum: Board · My Stats · Settings
- Tab bar: 48px fixed, bottom of screen
- Tap to switch content (no page navigation)
- Active tab: `border-top: 2px solid #B08D57`

### Confirmation Dialogs
```
Overlay: rgba(0,0,0,0.70) backdrop
Dialog: centered, max-width 320px, background: #1A1A1A, border: 1px solid #2A2A2A
Buttons: [Cancel] secondary + [Confirm] bronze gradient primary
```

### Toast Notifications
```
Position: bottom-center, 24px from safe area
Width: full-width minus 16px sides
Height: 60px
Duration: 5s auto-dismiss or tap
One toast at a time
```

---

## Mobile Verification Checklist (Every OO Story)

Before PR:
- [ ] Fits 100vh viewport — no page-level vertical scroll
- [ ] Tested on real iPhone at 375px in direct sunlight
- [ ] All touch targets ≥ 48×48px (measured with browser tools)
- [ ] No horizontal overflow at 320px (adversarial test)
- [ ] One-handed operation: primary CTA reachable with thumb
- [ ] Colors pass WCAG AAA (7:1+) in sunlight
- [ ] LCP < 2s on 4G LTE (Lighthouse verified)
- [ ] Bronze gradient matches exactly
- [ ] No AppShell header rendered (standalone shell)
- [ ] Equipment filter absent from board tab
- [ ] Board lock banner appears when active load exists

---

## Enforcement

**REVIEWER rejects any PR that:**
- Uses AppShell for carrier pages
- Touch targets < 48px
- Colors outside this palette
- Equipment filter dropdown shown on board
- Board doesn't lock when active load exists
- Post-mutation navigation doesn't return to `/dashboard/trucker`
- Spacing not a multiple of 8px
- Design deviations without CHG ticket + LIBRARIAN approval

---

**Status:** LOCKED STANDARD  
**Version:** 2.0 (2026-07-03) — rewritten from prototype authoritative source  
**Source:** `Prototype/tokens/`, `Prototype/readme.md`, `Prototype/INTEGRATION_PROMPT.md`
