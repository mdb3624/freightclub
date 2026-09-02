# Admin Design System

**Authority:** BA (business rules) + HFD (visual tokens/layout, locked below)
**Applies To:** Super User stories (US-750, US-751, US-752) and tenant-admin stories (US-875, US-876, US-877, US-878)
**Status:** LOCKED STANDARD (visual tokens finalized 2026-09-02)
**Depends On:** US-874 (Role Model Foundation)

---

## Why This File Exists Now

`CLAUDE.md`'s Known Doc/Reality Gaps section previously blocked creating this file preemptively — there was zero real Admin precedent (no components, no shipped stories, no BA business rules) to derive it from. That gate was satisfied 2026-09-01 (US-750, US-751, US-752, US-874–878 shipped as real, BA-drafted stories with real business rules and working screens), and the visual token decisions below were finalized 2026-09-02 via `/council-review` after real screens existed to evaluate — not invented ahead of them.

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

## Visual System: Tenant Admin (Shipper Admin / Carrier Admin) — CONFIRMED

Not a default assumption anymore — verified against the actual shipped code (`ShipperTeamSettingsPage.tsx`, `CarrierTeamSettingsPage.tsx`):

- **Shipper Admin** genuinely reuses `ShipperPageLayout` and `SHIPPER_DESIGN_SYSTEM.md`'s CSS custom properties (`var(--color-text-secondary)`, `.panel`/`.panel-title` classes) — zero new tokens invented. No further action needed.
- **Carrier Admin** genuinely reuses `CARRIER_DESIGN_SYSTEM.md`'s locked tokens — its local `C = {...}` palette object is byte-identical to the locked values (`bg: #121212`, `surface: #1A1A1A`, `border: #2A2A2A`, `text: #F5F5F5`, `accent: #C9A876`). **Hygiene note for CODER (not a design deviation):** this is redeclared as a local JS object instead of referencing the CSS custom properties directly — low but real drift risk if the locked tokens change later and this file isn't updated in lockstep. Fix opportunistically, not urgent.

## Visual System: Super User — "Ops Dark" (LOCKED, formalized via `/council-review` 2026-09-02)

The Super User dashboard shipped with a one-off, undocumented dark palette borrowed wholesale from GitHub's dark theme (`#58A6FF` blue accent). A council review considered three options — reuse Shipper's light cream/bronze theme, keep/formalize the existing dark palette, or something else — specifically prompted by the fact that Super User operates from an office laptop, not a truck cab (i.e., Carrier's sunlight-glare rationale for dark mode doesn't apply here). **Verdict: keep dark, but own it.** Score: Contrarian 2/10 · Expansionist 7/10 · Logician 2/10 · Researcher 2/10 · Buyer 2/10 · Futurist 2/10 (all scored toward the light/Shipper-reuse option — 5 of 6 rejected it).

**Why dark, if not for glare:** this dashboard's actual job is dense cross-tenant tabular data reviewed in long monitoring sessions, plus a 10-second-refresh live health monitor and a disputes queue whose entire value depends on red/amber/green status states reading unambiguously. Status-color legibility is measurably better against a dark canvas than a light one, and Shipper's own bronze accent already occupies visual space adjacent to "warning" amber — reusing that palette here risked exactly the alert states this screen exists to surface becoming hard to distinguish. Industry convention for this exact job (Datadog, Grafana, GitHub, Linear, PagerDuty) converges on dark for the same reason. This is a genuinely different design problem from Carrier's — justified by density and alert legibility, not readability-under-glare — which is why it's documented as its own system rather than treated as "Carrier's palette, reused."

**Why not the borrowed GitHub-blue as-is:** it had no FreightClub identity behind it and was never a considered decision — just whatever a component default happened to be. Locked tokens below replace the blue accent with FreightClub's own bronze/copper (already proven to work on a dark background — it's Carrier's accent color too), so this reads as *this platform's* control-plane tool, not a generic dev-console skin.

```css
/* ── Ops Dark (Super User only) ────────────────────────────── */
--admin-bg:            #0E1116;   /* Page background */
--admin-surface:       #161B22;   /* Cards, tiles, table rows */
--admin-border:        #2D333B;   /* Panel/table/input borders */
--admin-text-primary:  #E6EDF3;   /* Body text, data */
--admin-text-dim:      #8B949E;   /* Labels, secondary text */
--admin-accent:        #C9A876;   /* FreightClub bronze — active tab, CTA, links (was #58A6FF blue — replaced) */
--admin-danger:        #F85149;   /* Error/unhealthy status */
--admin-success:       #3FB950;   /* Healthy status */

/* Typography: system-ui, sans-serif (no custom display font — this is a utility surface, not a
   branded customer-facing one). Sizes in use: 11px (labels) / 12-13px (body, table) / 14-16px
   (headers) / 20-24px (stat tiles). Spacing: 8px grid, consistent with the rest of the app.
   Border-radius: 6px (buttons/inputs), 8px (cards/tiles). */
```

**Component patterns already in use** (reference, not aspirational — read `SuperUserDashboardPage.tsx` directly): stat tiles (label + large number), tab navigation (active tab = filled accent background), data tables with `--admin-border` row dividers, and a forced-reason resolution pattern (a text field that must be non-empty before the confirming action is enabled — see `DisputesTab`, matching US-751 BR-3).

## Information Architecture (applies here too)

The Org Settings form (US-876/878) and dispute-resolution flow (US-751) are both multi-field/data-entry surfaces and must follow `docs/roles/HUMAN_FACTORS_DESIGNER.md`'s Information Architecture & Data Entry Efficiency standard (added 2026-09-02): minimize typing where a default/autofill/reuse is available, group semantically-related fields (e.g., a dispute's outcome selection and its required reason) as adjacent units.

---

## Next Step

Full `docs/roles/ADMIN_HFD_RULES.md` workflow checklist (mirroring `SHIPPER_HFD_RULES.md`'s Phase 1/2/3 structure) using the now-locked decisions above.
