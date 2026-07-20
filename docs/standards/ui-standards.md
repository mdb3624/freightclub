# FreightClub UI & Frontend Standards

**Authority:** CODER, REVIEWER, HFD  
**Status:** MANDATORY  
**Source:** Prototype design system (2026-07-03)  
**Applies To:** All frontend work across both personas

---

## Two-Persona System

FreightClub has two distinct UI themes. Every frontend file must serve one persona:

| Persona | Stories | Platform | Theme | Layout Entry |
|---|---|---|---|---|
| **Shipper** | US-820+ | Desktop (1280px+) | Classic Cream & Metallic Bronze | ShipperPageLayout |
| **Carrier / OO** | US-730+ | Mobile (375px primary) | Luxury Industrial dark | Fixed-shell standalone |

Full token specifications:
- Shipper: `docs/standards/SHIPPER_DESIGN_SYSTEM.md`
- Carrier: `docs/standards/CARRIER_DESIGN_SYSTEM.md`

---

## Color Rules

- **No hardcoded hex colors** outside token files — reference CSS custom properties or Tailwind tokens
- **No substitutions** — `#4A` grays, blue primaries, or `#fff` shorthand instead of exact token values are rejections
- **No mixing palettes** — shipper cream tokens must never appear in carrier dark components and vice versa
- **Semantic colors** (§6.1) are shared between both personas and must match exactly:

```
Success: #27AE60  subtle: #DCFCE7  text: #15803D
Warning: #F39C12  subtle: #FEF3C7  text: #B45309
Critical: #E74C3C subtle: #FEE2E2  text: #B91C1C
Info: #3498DB     subtle: #DBEAFE  text: #1D4ED8
```

---

## Spacing Rules (8px Grid — Both Personas)

Only these values are allowed:

| Token | Value | Use |
|---|---|---|
| `--space-xs` | 4px | Icon/text pairs only |
| `--space-sm` | 8px | Related elements |
| `--space-md` | 16px | Component-to-component |
| `--space-lg` | 24px | Section separators, panel padding |
| `--space-xl` | 32px | Page-level shell |

**Forbidden values:** 10, 12, 14, 18, 20, 22, 25, 28, 30px  
PR reviewer must check all `padding` and `margin` declarations for non-grid values.

---

## Shipper-Specific Rules

### ShipperPageLayout (MANDATORY)
- Every shipper-persona page **must** be wrapped in `<ShipperPageLayout>`
- No custom `<header>` or navigation structure permitted inside pages
- No layout style overrides (`padding`, `margin`, `background`) on the wrapper
- **Violation = automatic PR rejection (no exceptions)**

### Shipper Header Navigation Pattern
- NO text nav links in header (no "My Loads", "Profile" link text)
- Header contains: logo + notification bell + circular avatar badge only
- Profile + Sign out live in dropdown off the avatar badge
- "My Loads" lives in dashboard body as a bronze gradient button — NOT the header
- Carrier persona keeps standard nav links — this is shipper-only

### Shipper Component Specs

**Form inputs** (§6.3):
- `height: 40px` — exact, never deviate
- `border-radius: 4px` — exact (not 6px, not 8px)
- `border: 1px solid #D0D0D0`
- Focus: `border: 2px solid #B08D57`
- Readonly/calculated: `background: #F8F9FB`, `border: 1px solid #E8E3D8`

**Panels / Cards** (§6.5):
- `background: #FFFFFF`
- `border: 1px solid #D0D0D0` (not `#E8E3D8` — that's the row divider)
- `border-radius: 8px` — exact
- `box-shadow: 0 2px 4px rgba(0,0,0,0.05)`
- `padding: 24px`

**Table rows:**
- Row height: exactly `48px`
- Row border: `1px solid #E8E3D8`
- Header: `12px`, `font-weight: 600`, ALL CAPS, `color: #636E72`

**Shipper panel borders:** Use `border-shipper-accent` (`#B08D57`) for dashboard panels, NOT `border-shipper-border` (grey). The `surfaceClassName` token from `PersonaThemeContext` uses grey — override explicitly on Shipper dashboard components.

**Panel class pattern:** `rounded-md border border-shipper-accent bg-shipper-surface shadow-md`

### Bronze CTA Button (Shipper)
```css
background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
box-shadow: inset 0 1px 2px rgba(255,255,255,0.25),
            inset 0 -1px 2px rgba(0,0,0,0.2),
            0 2px 5px rgba(0,0,0,0.35);
border: 1px solid #7A5F3A;
border-radius: 4px;   /* Shipper: 4px */
color: #FFFFFF;
font-size: 14px;
font-weight: 700;
```

Inline `style` is required for bronze gradient (Tailwind cannot express arbitrary gradient stops). Standard pattern:
```ts
const bronzeButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)',
  border: '1px solid #7A5F3A',
}
```

---

## Carrier-Specific Rules

### Standalone Shell (MANDATORY — NO AppShell)
- Carrier pages must use `position: fixed; inset: 0` full-viewport standalone shell
- `<AppShell>` — including `fullBleed` prop — renders a sticky 56px header; it must not be used for carrier pages
- Shell structure: fixed header (56px) + scrollable main (flex: 1) + fixed tab bar (48px)

### Carrier Component Rules
- All touch targets: `min-height: 48px; min-width: 48px` — no exceptions
- Button border-radius: `8px` (carrier) — not 4px like shipper
- Equipment filter: **never shown** — profile drives board queries entirely
- Board lock: always shown when `activeLoad` is non-null
- Post-mutation: always navigate to `/dashboard/trucker` after Claim / Pickup / Deliver

---

## Feature-Sliced Architecture

- Feature modules: `src/features/{name}/` (pages, components, hooks, types)
- Shared atoms: `src/components/ui/` (Button, Input, Badge, Card, etc.)
- No circular imports: features import from `components/ui`, never from other features

---

## Security & State

- `accessToken`: stored ONLY in Zustand in-memory state — never `localStorage`
- Refresh flow: HTTP-only cookie only
- Every form must have a Zod schema for type-safe validation

---

## Data Fetching

- All API calls wrapped in custom React Query hooks (e.g., `useLoadBoard`)
- Use the global `ErrorBoundary` in `App.tsx` for component-level resilience
- All API paths: relative (e.g., `/api/v1/...`) — never hardcoded host
- `apiClient` already has `baseURL: '/api/v1'` — never include `/api/v1/` prefix in path args
- `@RequestParam` backend binding → `params: { key: val }` in axios (null body)
- `@RequestBody` backend binding → JSON body object in axios

---

## Locked HFD Spec Authority

The locked HFD design spec (e.g., `docs/hfd/US-843_Design_Spec.md`) is the authoritative implementation contract. HFE audit gap analysis docs are secondary — when values conflict, the locked spec wins. Style Guide design principles describe philosophy; the locked spec defines what is built.

---

## Load Status Color Mapping

```
DRAFT      → #F1F5F9 bg / #475569 text
OPEN       → #DBEAFE bg / #1D4ED8 text
CLAIMED    → #FEF3C7 bg / #B45309 text
IN_TRANSIT → #EDE9FE bg / #6D28D9 text
DELIVERED  → #DCFCE7 bg / #15803D text
SETTLED    → #CCFBF1 bg / #0F766E text
CANCELLED  → #FEE2E2 bg / #B91C1C text
```

---

## RPM Profitability Bands (Carrier)

```
Green  #22C55E — rpm >= minRpm * 1.2  (profitable)
Yellow #F59E0B — rpm >= minRpm         (marginal)
Red    #EF4444 — rpm < minRpm          (unprofitable)
```

---

## Tailwind Styling

- Use Tailwind utility classes for layout, spacing multiples of 8px
- Custom hex or inline style only for: bronze gradient (can't be expressed in Tailwind), carrier dark surface values not in Tailwind config
- Never override `ShipperPageLayout` or carrier shell via Tailwind `!important` utilities
