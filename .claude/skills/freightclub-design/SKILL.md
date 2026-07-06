---
name: freightclub-design
description: Use this skill to generate well-branded interfaces and assets for FreightClub (MDB Integrated Logistics), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping both the Shipper (desktop cream/bronze) and Carrier (dark mobile) personas.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

Key things to know before starting any design:
- FreightClub has TWO personas: Shipper (desktop, cream #EFEBE0 canvas, white panels, bronze CTAs) and Carrier (mobile 375px, dark #121212 bg, copper accents, 48px touch targets)
- Bronze gradient is the primary CTA for both: `linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)`
- The font stack is Sora (display/headings) + Inter (body/UI) — load from Google Fonts
- Spacing follows a strict 8px grid: 4, 8, 16, 24, 32px only
- Load statuses: DRAFT → OPEN → CLAIMED → IN_TRANSIT → DELIVERED → SETTLED → CANCELLED
- RPM profitability tiers: green (#22C55E) ≥ 120% min, yellow (#F59E0B) 100-120%, red (#EF4444) below min
- Shipper panel spec (§6.5): white bg, 1px #D0D0D0 border, 8px radius, 0 2px 4px rgba(0,0,0,0.05) shadow, 24px padding
- Carrier touch targets: 48×48px minimum — non-negotiable

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions about which persona (shipper or carrier), and act as an expert designer who outputs HTML artifacts or production code, depending on the need.
