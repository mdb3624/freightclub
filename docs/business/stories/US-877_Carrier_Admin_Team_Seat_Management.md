# US-877: Carrier Admin — Team & Seat Management

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P1
**Persona:** TRUCKER with `is_tenant_admin = true` (tenant-scoped)
**Scope:** FULL_STACK
**Depends On:** US-874 (Role Model Foundation)
**Jira:** [FREIG-140](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-140)

---

## User Story

As a **Carrier Admin** (a small fleet's owner/dispatcher), I want to see everyone on my carrier account, invite new drivers by sharing my org's join code, and remove a driver who should no longer have access, so that I can manage my fleet's platform access myself instead of asking the platform operator to do it for me.

---

## Background

Mirrors US-875 on the Carrier side. Today's Carrier persona is modeled almost entirely around a single owner-operator (`User`'s equipment/CDL/insurance fields are per-user, matching one driver/one truck). A small-fleet Carrier tenant with multiple drivers already *can* exist via `joinCode` multi-seat signup, but — same gap as Shipper — no one can see who else is on the account or remove a departed driver's access.

> **Scope note:** this story is explicitly about *fleet account management* (who has login access), not fleet dispatch/assignment (which driver is on which load) — that's a distinct, larger capability and not part of this story. Per US-874, "Carrier Admin" is a `TRUCKER` user with `is_tenant_admin = true` — not a separate role value; a fleet's admin driver stays `TRUCKER` throughout.

**UX placement (per `/council-review`, 2026-09-01 — GO with reshape):** this surface lives as a contained section inside the existing Carrier dashboard shell, reachable from existing navigation (e.g. profile/settings) — not a separate admin workflow/mode-switch, and never competing with the load board for primary nav space or screen real estate. The council's Buyer persona (a fleet-owner driver working mobile, in-cab, gloved, time-pressured) was explicit: admin must be a "quiet corner" reachable in a few taps, never an ambient badge/notification while driving, and thin enough for mobile (invite/remove seats) rather than a desktop-shaped console crammed into the dark mobile shell — full org-settings-style configuration can lean on a wider viewport if needed, per `docs/roles/CARRIER_HFD_RULES.md`. See `docs/standards/ADMIN_DESIGN_SYSTEM.md` for full rationale.

**Reuse flag for ARCHITECT (mandatory Input Acceptance Gate item):** the mechanics in this story — member listing, join-code display, remove, grant/revoke `is_tenant_admin`, last-admin protection — are identical to US-875's Shipper-side version; only the persona's visual theme and the `role` value being checked differ. Before implementation starts, ARCHITECT must evaluate sharing this as one backend capability (one service, one set of endpoints) with persona-specific rendering, rather than building two independently duplicated implementations. This is the same failure shape already logged in project memory as the US-761/US-820 duplicate-KPI incident — flagged here specifically so it isn't repeated.

---

## Business Rules

- BR-1: Visible only to users with role `TRUCKER` and `is_tenant_admin = true`, scoped to their own `tenant_id`.
- BR-2: The member list shows every user in the admin's tenant (name, email, admin status, joined date) — admin and non-admin `TRUCKER` members alike. All members remain role `TRUCKER`; only the `is_tenant_admin` flag differs.
- BR-3: The join code shown to the admin is their tenant's existing `joinCode`, same mechanism as US-875 — no new invite system introduced.
- BR-4: A Carrier Admin can remove any member of their own tenant except when doing so would leave the tenant with zero `is_tenant_admin = true` users (per US-874 BR-7).
- BR-5: A Carrier Admin can grant `is_tenant_admin` to an existing `TRUCKER` member ("promote"), and revoke it from another admin ("demote") — subject to the same last-admin protection in BR-4. Neither action changes the member's `role`; both stay `TRUCKER` throughout.
- BR-6: "Removing" a member is a soft delete (`deleted_at`), never a hard `DELETE`, and revokes access without deleting their historical claimed-load/delivery records.
- BR-7: This surface must not appear on, or compete for space with, the Carrier's primary operational views (load board, active load tracking) — it lives behind existing settings/profile navigation, entered deliberately, not surfaced as an ambient badge or notification while driving.

---

## Acceptance Criteria

- AC-1: Given a `TRUCKER` user with `is_tenant_admin = true`, when they open the team management view, then they see every member of their own tenant with name, email, admin status, and joined date — and no members from any other tenant.
- AC-2: Given a Carrier Admin, when they view the page, then their tenant's join code is displayed clearly enough to copy and share.
- AC-3: Given a Carrier Admin removes a member who is not the tenant's last admin, when the removal completes, then that member's account is soft-deleted and they can no longer log in, while their historical claimed loads/deliveries remain intact and attributed to them.
- AC-4: Given a Carrier Admin attempts to remove or revoke admin status from the last remaining `is_tenant_admin = true` user in their tenant (possibly themselves), when they submit the action, then it is rejected with a clear message that a tenant must always have at least one admin.
- AC-5: Given a `TRUCKER` user with `is_tenant_admin = false`, when they attempt to access the team management view or its backing endpoints, then they receive a 403.
- AC-6: Given a Carrier Admin grants `is_tenant_admin` to a non-admin `TRUCKER` member, when the grant completes, then that member immediately gains access to this same team management view for their tenant, while their `role` remains `TRUCKER`.
- AC-7: Given any Carrier user (admin or not), when they view their load board or active-load tracking, then no team-management or org-settings control is visible there — the admin surface is reachable only via existing settings/profile navigation (per BR-7).
- AC-8: Given a Carrier Admin on a mobile viewport, when they open the team management view, then invite (join code) and remove actions are usable with standard touch targets in three taps or fewer from the settings entry point — this view must not require a desktop-width layout to complete its core actions.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Member list (name, email, admin status, joined date) | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Join code display | *(ARCH fills)* | `tenants.join_code` | *(ARCH fills)* | Yes |
| Remove member action | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Grant/revoke admin status action | *(ARCH fills)* | `users.is_tenant_admin` | *(ARCH fills)* | Yes |

---

## Platform Foundation Mapping

Actor: Carrier Admin. Sequence: sits upstream of Load Board → Assign Load → Deliver — controls which drivers on the Carrier side are authorized to claim/deliver loads at all, an enabling/gating step rather than part of the load lifecycle itself.

---

## INVEST Self-Check

- [x] **Independent** — depends only on US-874.
- [x] **Negotiable** — describes required capabilities, not implementation.
- [x] **Valuable** — first real self-service fleet-account management for multi-driver Carrier tenants.
- [x] **Estimable** — bounded CRUD-shaped surface, structurally identical to US-875.
- [x] **Small** — one view, four actions, one tenant.
- [x] **Testable** — AC-1 through AC-8 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **Explicitly excludes dispatch/load-assignment ("which driver takes which load"):** That's a materially larger capability (matching drivers to loads, availability, routing) deserving its own story once basic fleet account management exists. This story is scoped to login/access management only, mirroring US-875's scope discipline on the Shipper side.
- **Reuses existing `joinCode`, no new invite system:** Same reasoning as US-875 — the mechanism already exists, the gap is visibility/management, not invitation.
- **Admin status modeled as `is_tenant_admin` flag, not a role change (revised 2026-09-01, per US-874):** Director feedback corrected the original design — granting/revoking admin status must never change a member's persona role (`TRUCKER` stays `TRUCKER`). All ACs and business rules above updated to grant/revoke a flag rather than promote/demote between role values.
- **UX placement decided via `/council-review` (2026-09-01):** a 6-persona council evaluated "separate admin workflow" vs. "merged into persona dashboard," with a Buyer persona specifically role-playing this story's actual user (a fleet-owner driver, mobile, in-cab). Verdict: GO on merged placement, reshaped as a *contained*, mobile-usable settings-style section (not scattered inline widgets, not a mode-switch, not a desktop-only console) — 5 of 6 council members favored merging; the dissenting Contrarian's real concern was implementation duplication across US-875/877, not placement, which is why the Reuse Flag above was added. Full verdict available in session transcript; not separately filed as a design doc.

---

## Approval

AC-1 through AC-8, all Business Rules, and the council-review UX placement/reuse-flag additions approved by Mike, 2026-09-01. Story proceeds to ARCHITECT (Input Acceptance Gate must include the reuse evaluation against US-875 noted above).
