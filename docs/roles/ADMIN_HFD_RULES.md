# HFD Rules: Admin Stories (Super User + Tenant Admins)

**Role:** HFD (Human Factors Designer)
**Applies To:** US-750, US-751, US-752 (Super User) and US-875, US-876, US-877, US-878 (Shipper Admin / Carrier Admin)
**Authority:** Sequential Lock Protocol + `docs/standards/ADMIN_DESIGN_SYSTEM.md` (business rules only, not yet a locked visual standard)
**Status:** BUSINESS-RULE SCAFFOLDING ONLY — not the mandatory workflow checklist yet

---

## Why This File Exists Now

Same trigger as `docs/standards/ADMIN_DESIGN_SYSTEM.md`: the Admin persona previously had zero real precedent, so `SHIPPER_HFD_RULES.md`'s and `CARRIER_HFD_RULES.md`'s structural pattern was deliberately not copied for Admin ahead of real stories existing. US-750–752 and US-874–878 are now real, BA-approved-pending stories. This file is the BA-side handoff — the actual mandatory workflow checklist (mirroring `SHIPPER_HFD_RULES.md`'s Phase 1/2/3 structure) is HFD's to write once design work actually starts.

---

## Gate Check — What HFD Must Confirm Before Designing Any Admin Story

Per the standing rule ("HFD is PROHIBITED from finalizing a UI design until BA has provided Business Rules"), the business rules HFD needs are in each story doc plus the summary in `ADMIN_DESIGN_SYSTEM.md`. Before starting design on any of these 7 stories, HFD must confirm:

- [ ] `docs/business/stories/US-874_Role_Model_Foundation.md` is at least READY_FOR_DESIGN (all Admin stories below it are gated on the role model existing).
- [ ] Which of the two design tracks a given story belongs to: **Super User** (new, cross-tenant, no existing persona to inherit from) vs. **tenant Admin** (Shipper Admin inherits Shipper's locked system; Carrier Admin inherits Carrier's).
- [ ] For Super User stories specifically: device target is not yet decided (desktop-only ops tool has been assumed by BA as the default given every other admin-shaped tool in this codebase is desktop, but this has not been explicitly asked/confirmed — flag to BA/Director before locking layout if it matters to the design).

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

## Not Yet Defined

Full Phase 1/2/3 workflow checklist (mirroring `SHIPPER_HFD_RULES.md`), component inventory, exact viewport targets per track, and sign-off checklist — all TBD, to be written by HFD once design work on these stories actually begins. The UI-placement and mobile-degrade questions that would normally block this checklist have already been resolved above via `/council-review`.
