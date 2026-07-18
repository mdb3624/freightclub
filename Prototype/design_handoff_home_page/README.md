# Handoff: FreightClub Home Page

## Overview
Marketing/home page for FreightClub (MDB Integrated Logistics), a profitability-first load board. Includes hero, feature cards, "how it works", carrier/shipper split, comparison table, final CTA, footer, and an in-page login modal (replaces linking out to a separate /login page).

## About the Design Files
The files in this bundle are **design references built in HTML** — they show intended look, copy, and interaction, not production code to copy directly. Recreate this design in your existing FreightClub codebase's stack (React components, routing, auth), reusing your existing Button/Input/Card/ProfitabilityBadge components rather than the inline markup here.

## Fidelity
High-fidelity: final colors, typography, spacing, and copy are intentional. Recreate pixel-close using your codebase's component library.

## Screens / Views
**Home page** (single scrolling page)
- Sticky header: logo, nav (Product/How It Works/Pricing), Log in, Get Started Free CTA. Collapses to logo + Get Started + hamburger menu under 720px.
- Hero: headline, subcopy, two CTAs, truck photo with a translucent/blurred "RPM Badge" glass card (top-right) showing 3 ProfitabilityBadge examples.
- Feature cards (3-up grid): RPM Profitability Badge, Trucker Cost Profile Engine, 30-Day Earnings Insights.
- How It Works (3-step, white band, bordered top/bottom).
- Carrier/Shipper persona cards (2-up).
- Comparison table (FreightClub vs. two generic boards), horizontally scrollable on narrow screens.
- Final CTA card.
- Footer: logo, blurb, Product/Company/Account link columns, copyright bar.
- Login modal: overlays the page, triggered by any "Log in"/"Get Started" CTA. Email + password fields, Sign In button, link to create an account.

## Interactions & Behavior
- Any "Log in" / "Get Started" CTA opens the login modal (state, not navigation).
- Modal closes on backdrop click or the X button.
- Submitting the form shows a loading state on the button, then a placeholder message (needs real auth wiring).
- Header switches to a mobile layout (hamburger + collapapsible nav) below 720px width via a resize listener.
- Comparison table scrolls horizontally instead of breaking layout on small screens.

## State Management
- `loginOpen`, `email`, `password`, `isLoading`, `loginMessage` — modal/form state.
- `isMobile`, `mobileMenuOpen` — responsive nav state.
- Real implementation should replace the mocked submit handler with an actual auth call and redirect/session handling.

## Design Tokens
Sourced from the FreightClub design system (see `_ds/` folder copied into this project):
- Background: `#EFEBE0` (page), `#FFFFFF` (cards/header)
- Primary/bronze accent: `#8C6D3F` (hover `#6B5230`), gradient `#C9A46A → #B08D57 → #8C6D3F`
- Text: `#1A1A1A` (primary), `#4A5568` (secondary), `#636E72` (muted)
- Footer: `#1A1A1A` background, `#C9C1AF` / `#8C8578` text
- Fonts: `var(--font-display)` for headings, `var(--font-body)` for body — see `tokens/typography.css`
- Border radius: 8px standard on cards/buttons
- Shadows: `0 2px 4px rgba(0,0,0,0.05)` (cards), `0 4px 12px rgba(0,0,0,0.15)` (modal/floating elements)
- Full token set: `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`, `tokens/shadows.css`, `tokens/borders.css`

## Assets
- `assets/logo-full.png`, `assets/logo-mobile.png` — MDB/FreightClub logos
- `assets/hero-truck.png` — hero truck image (user-provided)
- Icons are inline SVG (feather-style outline icons), no icon font dependency

## Screenshots
See `screenshots/` — desktop hero, feature cards, how-it-works + personas, comparison table + final CTA, footer, and the login modal.

## Files
- `FreightClub Home.dc.html` — full source (structure + inline logic) for the design
- `assets/` — images used
- `_ds/` — copied FreightClub design system tokens/components for reference (Button, Card, ProfitabilityBadge, Input source read from the DS repo)
