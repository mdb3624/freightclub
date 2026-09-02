# HFD Rules: Admin Stories (Super User + Tenant Admins)

**Role:** HFD (Human Factors Designer)
**Applies To:** US-750, US-751, US-752 (Super User) and US-875, US-876, US-877, US-878 (Shipper Admin / Carrier Admin)
**Authority:** Sequential Lock Protocol + `docs/standards/ADMIN_DESIGN_SYSTEM.md` (LOCKED STANDARD as of 2026-09-02)
**Status:** Workflow checklist below is the mandatory reference for any future Admin-surface changes

---

## Why This File Exists Now

Same trigger as `docs/standards/ADMIN_DESIGN_SYSTEM.md`: the Admin persona previously had zero real precedent, so `SHIPPER_HFD_RULES.md`'s and `CARRIER_HFD_RULES.md`'s structural pattern was deliberately not copied for Admin ahead of real stories existing. US-750–752 and US-874–878 shipped 2026-09-02, and the visual tokens below were locked the same day via `/council-review`, using the real, deployed screens as evidence rather than inventing a system ahead of them.

---

## Gate Check — What HFD Must Confirm Before Touching Any Admin Screen

- [ ] Which of the two design tracks a given change belongs to: **Super User** ("Ops Dark" system, `docs/standards/ADMIN_DESIGN_SYSTEM.md`'s dedicated section) vs. **tenant Admin** (Shipper Admin inherits Shipper's locked system via `ShipperPageLayout`; Carrier Admin inherits Carrier's locked tokens).
- [ ] For Super User work: confirmed desktop-only (office/laptop use, per the council review that settled the Ops Dark palette decision) — no mobile-responsive requirement unless that assumption changes.
- [ ] Read `SuperUserDashboardPage.tsx` directly for current component patterns (stat tiles, tab nav, forced-reason resolve flow) before adding new ones — don't invent a parallel pattern for something already solved there.

---

## Persona-Specific Constraints (from BA business rules)

**Super User (US-750/751/752):**
- No destructive-action affordances in v1 — the dashboard and dispute tools are read-mostly (one forced-reason "resolve" action in US-751; everything else is display).
- Must be visually unmistakable as *cross-tenant* — a Super User looking at this screen should never be able to confuse it with their own org's data, because there is no "their own org" for this role.
- US-752's health view refreshes every 10 seconds — design for a live-updating surface (no jarring full-page reload/flash on each refresh), not a static report page.

**Shipper Admin (US-875/876):**
- Lives inside the existing Shipper persona — start from `SHIPPER_DESIGN_SYSTEM.md` (which already claims to cover Admin stories) and `ShipperPageLayout`, not a new shell, unless a concrete constraint forces otherwise.
- **Placement resolved via `/council-review` (2026-09-01):** a contained settings-style section reachable from existing nav, never inline on the load board/KPI views, never a mode-switch. See `ADMIN_DESIGN_SYSTEM.md`'s "UI Placement" section for the full verdict — this is no longer an open HFD judgment call, it's a decided input.
- Team list must distinguish admin vs. regular members at a glance (an `is_tenant_admin` flag, not a different role label), and the "can't remove/revoke the last admin" rule (US-874 BR-7) needs an in-context explained-disabled state, not a raw error toast after the fact.
- Org-defaults UI (US-876) must clearly separate "org default" from "this member's own saved value" and indicate when a member's value diverges from the org default — **except** collapse that distinction entirely for a 1-seat tenant (US-876 BR-5/AC-6); showing "org vs. mine" over one row of data is noise, not clarity.

**Carrier Admin (US-877/878):**
- Lives inside the existing Carrier persona — start from `CARRIER_HFD_RULES.md`'s dark/mobile system, not a new desktop-only pattern. **Resolved via `/council-review` (2026-09-01):** the earlier open question here ("desktop task vs. in-cab" — HFD judgment call) is decided. The council's Buyer persona, role-playing an actual fleet-owner-driver working in-cab/gloved/low-signal, was explicit that team management (invite/remove) must work mobile-first, in a few taps, without a desktop-shaped console. Heavier org-settings configuration (US-878) may lean on a wider viewport if genuinely needed, but the entry point and core actions must work on a phone.
- Same last-admin-protection and org-default-vs-individual-override treatment as Shipper Admin (including the 1-seat collapse rule, US-878 BR-5/AC-6), applied to the Carrier persona's actual fields (fuel cost, maintenance cost, etc. — see US-878).
- Placement must never compete with the load board or active-load tracking for space/attention — no ambient badges or notifications advertising admin capability while a driver is working (US-877 BR-7).

---

## Reuse Warning

Before designing US-875 and US-877 as two separate screens, check `ADMIN_DESIGN_SYSTEM.md`'s "Reuse Warning for ARCHITECT" section — their mechanics are identical (member list, join-code, remove, grant/revoke admin, last-admin protection), differing only in persona theme. HFD's component design should anticipate one shared component tree with persona-themed rendering, not two independently designed screens that happen to look similar.

---

## Phase 1: Track Identification

1. Confirm which track (Super User / Shipper Admin / Carrier Admin) per the Gate Check above.
2. For Super User: no persona inheritance — read `ADMIN_DESIGN_SYSTEM.md`'s Ops Dark token table directly.
3. For Shipper/Carrier Admin: confirm the change fits inside the existing `ShipperPageLayout`/Carrier shell without new tokens; if it genuinely can't, that's an escalation (CHG-### per the Sequential Lock Protocol), not a silent new-token decision.

## Phase 2: Design Against Locked Tokens

1. Pull exact hex/spacing values from `ADMIN_DESIGN_SYSTEM.md` — no ad-hoc colors, no "close enough" spacing.
2. Check every new/changed field against `docs/roles/HUMAN_FACTORS_DESIGNER.md`'s Information Architecture & Data Entry Efficiency standard (minimize typing, group related fields as adjacent units).
3. For Super User specifically: any new status/alert state must be checked for legibility against the dark `--admin-bg`/`--admin-surface` canvas — this system exists specifically because alert-color legibility was the deciding factor in locking it (see `ADMIN_DESIGN_SYSTEM.md`'s council-review rationale); don't erode that with a new low-contrast addition.

## Phase 3: Sign-Off

- [ ] Colors/spacing/typography sourced from the locked tokens, not invented
- [ ] Information Architecture checklist applied to any new form/multi-field surface
- [ ] For Carrier Admin work: touch targets ≥48×48px per `CARRIER_HFD_RULES.md` (inherited, not re-derived)
- [ ] Reuse Warning (both this file and `ADMIN_DESIGN_SYSTEM.md`) checked — US-875/877's shared mechanics must not be reimplemented separately
