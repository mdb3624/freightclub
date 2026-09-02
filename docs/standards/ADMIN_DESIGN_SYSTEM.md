# Admin Design System

**Authority:** BA (business rules below) → HFD (visual tokens/layout, not yet filled)
**Applies To:** Super User stories (US-750, US-751, US-752) and tenant-admin stories (US-875, US-876, US-877, US-878)
**Status:** BUSINESS-RULE SCAFFOLDING ONLY — not a locked standard
**Depends On:** US-874 (Role Model Foundation)

---

## Why This File Exists Now

`CLAUDE.md`'s Known Doc/Reality Gaps section previously blocked creating this file preemptively — there was zero real Admin precedent (no components, no shipped stories, no BA business rules) to derive it from. That gate is satisfied as of 2026-09-01: US-750, US-751, US-752, US-874–878 are real, BA-drafted stories with real business rules. This file captures those rules so HFD has something to design against. **It intentionally contains no colors, spacing, typography, or component tokens** — those are HFD's Gate Check output, produced from these business rules, not invented ahead of them. Do not treat any placeholder below as a design decision.

---

## Actors This System Serves

Per US-874 (Role Model Foundation, revised 2026-09-01), "Admin" is not one persona — it's two, with materially different scope and mechanics:

| Actor | Underlying identity | Scope | Stories |
|---|---|---|---|
| **Super User** | `ADMIN` role (a distinct, unrelated role value) | Platform-wide, cross-tenant | US-750, US-751, US-752 |
| **Shipper Admin** | `SHIPPER` role + `is_tenant_admin = true` flag | Tenant-scoped (own Shipper org only) | US-875, US-876 |
| **Carrier Admin** | `TRUCKER` role + `is_tenant_admin = true` flag | Tenant-scoped (own Carrier org only) | US-877, US-878 |

**Important for HFD:** a Shipper Admin or Carrier Admin is *not* a separate role/identity — they are a regular Shipper or Trucker who additionally carries an admin flag within their own tenant. Design should reflect that continuity (e.g., an admin's own day-to-day screens are unchanged; they simply gain access to an additional team/settings area), not treat them as a wholesale different user type the way Super User genuinely is. Super User surfaces are a genuinely new cross-tenant tool with no prior art in this codebase; Shipper Admin/Carrier Admin surfaces are extensions *within* the existing Shipper and Carrier personas respectively.

---

## Business Rules HFD Must Design Against

**Super User (US-750/751/752):**
- Read-only visibility only in this sprint's scope — no destructive/management actions in v1 (US-750 BR-3). Design should not imply delete/suspend affordances that don't exist yet.
- Cross-tenant data is the one legitimate exception to the platform's tenant-isolation norm — the design should make that scope unmistakable to the Super User (this is not "my org," it's "the whole platform") to avoid confusion with the tenant-admin surfaces below.
- Dispute resolution (US-751) requires a forced reason field before an action commits (BR-3) — the flow cannot allow a silent/no-reason resolution.
- Platform health (US-752) refreshes on a 10-second TTL, materially tighter than the 5-minute dashboard TTL (US-750 BR-4) — this is a monitoring surface, expected to be glanced at repeatedly, not a static report.

**Shipper Admin / Carrier Admin (US-875/876/877/878):**
- **Reuses the existing persona's design system, not a new one.** A Shipper Admin is a Shipper; `docs/standards/SHIPPER_DESIGN_SYSTEM.md` already states it applies to Admin stories (line 4, predates this file). A Carrier Admin is a Carrier — should follow `CARRIER_HFD_RULES.md`'s existing dark/mobile system, not a new desktop-only pattern, unless HFD finds a concrete reason a fleet-management view can't work in that system.
- Team/seat management (US-875/877) must visually distinguish "admin" members from regular members in the list, and must surface the last-admin protection (US-874 BR-7) as an in-context disabled/explained state, not a dead-end error after the fact.
- Org settings/defaults (US-876/878) must make clear that a setting is an org-level *default*, distinct from a member's own individually-saved value, and must show when a member has already overridden the default (BR-3 in both stories: defaults never silently clobber a customized value) — **except** in a 1-seat tenant, where that distinction must be collapsed away entirely (US-876/878 BR-5) rather than shown as a meaningless choice.

---

## UI Placement — Merged, Contained, No Mode-Switch (decided via `/council-review`, 2026-09-01)

A 6-persona council evaluated exactly this question — "should tenant-admin get a completely separate workflow/UI, or merge into the existing persona dashboard?" — before HFD work started, specifically so this file wouldn't have to guess. **Verdict: GO, merged, reshaped.** Score: Contrarian 4/10 · Expansionist 7/10 · Logician 7/10 · Researcher 9/10 · Buyer 8/10 · Futurist 9/10. Full transcript lived in that session; this section is the durable summary HFD should design against.

- **No separate admin "mode."** No second login, no account/persona switcher, no "exit admin mode" banner, no distinct session semantics. A Shipper Admin is a Shipper who additionally sees one more entry point — same shell, same theme, same nav frame at all times (per US-874: `is_tenant_admin` is additive on an existing persona, not a fork).
- **But not scattered inline widgets either.** The Logician's sharpened distinction: the additive-flag data model entails identity continuity, not that admin controls should be sprinkled across the operational dashboard. Team management and org settings belong in one **contained section** (a "Settings"-style destination reachable from existing nav — e.g. profile/settings), not inline on the load board or KPI views.
- **Never competes with primary operational screens for space or attention.** No ambient badges, no notifications layered onto the load board/dashboard to advertise admin capability (per US-875/877 BR-7). The Buyer persona — role-playing an actual dual-hat fleet-owner-driver — was explicit that admin nagging while trying to claim a load is worse than either extreme design.
- **Carrier-side admin must degrade to mobile, not assume desktop.** The Buyer's working conditions (in-cab, gloved, low-signal) rule out a desktop-shaped console dropped into the dark mobile shell. Team management (invite/remove) must be usable in a few taps on a phone; heavier org-settings configuration can lean on a wider viewport if genuinely needed, but the entry point and core actions must work mobile-first.
- **Real-world precedent, not a house preference:** Linear, Notion, Shopify, Stripe, Slack, and QuickBooks all place tenant/workspace-admin settings inside the same app shell the user already lives in, gated by role — reserving a fully separate console only for the tier *above* a single tenant (multi-workspace/Enterprise-Grid-style org admin). That tier is already this platform's Super User dashboard (US-750–752); building a second separate console at the tenant level would duplicate a boundary that already exists correctly one level up.
- **This is a reversible choice, not a one-way door.** Route-level gating inside the existing shell today can graduate into a dedicated admin surface later if a tenant's needs genuinely outgrow it (industry-observed threshold: roughly 20+ seats, or the first real SSO/SCIM/audit-log requirement) — not before, and not speculatively.

---

## Reuse Warning for ARCHITECT — Do Not Duplicate US-875/877

The council's Contrarian flagged, and this file records as a standing warning: Team & Seat Management (US-875 Shipper-side, US-877 Carrier-side) shares identical mechanics — member listing, join-code display, remove, grant/revoke `is_tenant_admin`, last-admin protection. Only the persona theme and the `role` value being checked differ. ARCHITECT's Input Acceptance Gate on either story must evaluate one shared backend capability with persona-specific rendering before approving two independently-built implementations. This project has already paid for this exact mistake once (`project_us761_us820_duplicate_kpi_debt` in project memory) — this warning exists so it isn't paid twice.

---

## Not Yet Defined (HFD to produce)

- Color tokens / typography — TBD, pending HFD design pass. Default assumption per business rules above: Super User is new (no forced reuse); Shipper Admin/Carrier Admin should default to reusing their existing persona's locked system unless HFD documents a specific reason not to.
- Exact settings-section entry point and component inventory within `ShipperPageLayout`/the Carrier shell (confirmed merged per the council verdict above; specific nav/route/component shape is still HFD's to produce).
- Touch-target minimums, responsive breakpoints for the Carrier-side mobile admin surface — TBD; Super User's device target (desktop-only ops tool vs. also-mobile) is itself a separate open question, unaffected by this verdict.

---

## Next Step

HFD Gate Check (per `docs/roles/HUMAN_FACTORS_DESIGNER.md`) against these business rules, producing the visual/token decisions above and a matching `docs/roles/ADMIN_HFD_RULES.md` workflow document (companion file, also currently a business-rule-only stub — see that file).
