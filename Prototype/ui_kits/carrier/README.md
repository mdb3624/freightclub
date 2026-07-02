# Carrier / Owner-Operator UI Kit

**Persona:** Carrier / Owner-Operator (trucker, solo or 1-3 truck operation)  
**Theme:** "Luxury Industrial" dark mode  
**Viewport:** 375px mobile (iPhone primary) — no horizontal scroll, no vertical scroll on hero

## Screens Covered
- `index.html` — Full Carrier Dashboard: header (56px), hero active-load section, tab bar, Load Board / My Stats / Quick Actions

## Design Language
- Background: `#121212` deep charcoal
- Surface/cards: `#1A1A1A` with `1px solid #2A2A2A` border
- Primary text: `#F5F5F5` off-white
- Accent/muted: `#C9A876` metallic copper
- CTA: Bronze gradient with tactile 3D inset shadow
- All touch targets: **48×48px minimum** (glove-friendly)
- Carrier header: **56px fixed** — logo + HOS chip + bell + avatar
- Tab bar: 44px — Load Board | My Stats | Quick Actions

## Key Carrier-Specific Rules
- No vertical scroll for the hero section — content fits above the fold
- Tap targets only — no swipe, no long-press
- WCAG AAA contrast (7:1+) — sunlight readability
- Profitability badge on every load card (green/yellow/red RPM tier)
- Bronze CLAIM button on every available load — primary action is always visible
