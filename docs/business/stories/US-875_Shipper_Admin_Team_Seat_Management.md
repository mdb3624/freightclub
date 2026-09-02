# US-875: Shipper Admin — Team & Seat Management

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P1
**Persona:** SHIPPER with `is_tenant_admin = true` (tenant-scoped)
**Scope:** FULL_STACK
**Depends On:** US-874 (Role Model Foundation)
**Jira:** [FREIG-138](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-138)

---

## User Story

As a **Shipper Admin**, I want to see everyone on my organization's account, invite new members by sharing my org's join code, and remove a member who should no longer have access, so that I can manage who can post and manage loads on my company's behalf without asking the platform operator to do it for me.

---

## Background

Tenants already support multi-seat signup via `Tenant.joinCode` (`AuthService`/`RegisterRequest`), but no one currently has visibility into *who else* is on their tenant, and there's no way to remove a member's access short of a database operation. US-874 introduces the `is_tenant_admin` flag this story is gated on — a "Shipper Admin" is simply a `SHIPPER` user with that flag set, not a different role.

**UX placement (per `/council-review`, 2026-09-01 — GO with reshape):** this surface lives as a contained section inside the existing Shipper dashboard shell (`ShipperPageLayout`), reachable from existing navigation (e.g. profile/settings) — not a separate admin workflow/mode-switch, and not controls scattered inline across the operational dashboard. Every comparable product surveyed (Linear, Notion, Shopify, Stripe, Slack, QuickBooks) gates tenant-admin as a "Settings" section inside the same shell the user already lives in; a separate console is reserved for the cross-tenant tier, which this platform already has as the Super User dashboard (US-750–752). See `docs/standards/ADMIN_DESIGN_SYSTEM.md` for the full rationale.

**Reuse flag for ARCHITECT (mandatory Input Acceptance Gate item):** the mechanics in this story — member listing, join-code display, remove, grant/revoke `is_tenant_admin`, last-admin protection — are identical to US-877's Carrier-side version; only the persona's visual theme and the `role` value being checked differ. Before implementation starts, ARCHITECT must evaluate sharing this as one backend capability (one service, one set of endpoints) with persona-specific rendering, rather than building two independently duplicated implementations. This is the same failure shape already logged in project memory as the US-761/US-820 duplicate-KPI incident — flagged here specifically so it isn't repeated.

---

## Business Rules

- BR-1: Visible only to users with role `SHIPPER` and `is_tenant_admin = true`, scoped to their own `tenant_id` — standard RLS, no exception.
- BR-2: The member list shows every user in the admin's tenant (name, email, admin status, joined date) — admin and non-admin `SHIPPER` members alike. All members remain role `SHIPPER`; only the `is_tenant_admin` flag differs.
- BR-3: The join code shown to the admin is their tenant's existing `joinCode` — this story does not introduce a new invite mechanism, it surfaces the one that already exists so the admin can actually find and share it (today it has no UI at all).
- BR-4: A Shipper Admin can remove any member of their own tenant except themselves if they are the last remaining `is_tenant_admin = true` user in that tenant (per US-874 BR-7 — a tenant can never be left with zero admins).
- BR-5: A Shipper Admin can grant `is_tenant_admin` to an existing `SHIPPER` member ("promote"), and revoke it from another admin ("demote") — subject to the same last-admin protection in BR-4. Neither action changes the member's `role`; both stay `SHIPPER` throughout.
- BR-6: "Removing" a member is a soft delete (`deleted_at`), per the platform's standing soft-delete rule — never a hard `DELETE`, and it revokes their access (existing session/token handling — ARCHITECT's call on exact mechanics) without deleting their historical load/document records.
- BR-7: This surface must not appear on, or compete for space with, the Shipper's primary operational views (load board, dashboard KPIs) — it lives behind existing settings/profile navigation, entered deliberately, not surfaced as an ambient badge or notification.

---

## Acceptance Criteria

- AC-1: Given a `SHIPPER` user with `is_tenant_admin = true`, when they open the team management view, then they see every member of their own tenant with name, email, admin status, and joined date — and no members from any other tenant.
- AC-2: Given a Shipper Admin, when they view the page, then their tenant's join code is displayed clearly enough to copy and share.
- AC-3: Given a Shipper Admin removes a member who is not the tenant's last admin, when the removal completes, then that member's account is soft-deleted and they can no longer log in, while their historical loads/documents remain intact and attributed to them.
- AC-4: Given a Shipper Admin attempts to remove or revoke admin status from the last remaining `is_tenant_admin = true` user in their tenant (possibly themselves), when they submit the action, then it is rejected with a clear message that a tenant must always have at least one admin.
- AC-5: Given a `SHIPPER` user with `is_tenant_admin = false`, when they attempt to access the team management view or its backing endpoints, then they receive a 403.
- AC-6: Given a Shipper Admin grants `is_tenant_admin` to a non-admin `SHIPPER` member, when the grant completes, then that member immediately gains access to this same team management view for their tenant, while their `role` remains `SHIPPER`.
- AC-7: Given any Shipper user (admin or not), when they view their primary dashboard/load board, then no team-management or org-settings control is visible there — the admin surface is reachable only via existing settings/profile navigation (per BR-7).

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

Actor: Shipper Admin. Sequence: sits upstream of Load Board → Assign Load → Deliver — it controls *who* on the Shipper side is authorized to post loads at all, so it's an enabling/gating step, not part of the load lifecycle itself.

---

## INVEST Self-Check

- [x] **Independent** — depends only on US-874.
- [x] **Negotiable** — describes required capabilities (view, invite via existing join code, remove, promote/demote), not implementation.
- [x] **Valuable** — first real self-service org management for Shipper tenants; today this requires a manual DB fix.
- [x] **Estimable** — bounded CRUD-shaped surface over existing `users`/`tenants` tables.
- [x] **Small** — one view, four actions (list, invite-code display, remove, promote/demote), all within one tenant.
- [x] **Testable** — AC-1 through AC-6 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **Reuse existing `joinCode` rather than build a new invite-link/email-invite system:** The join-code mechanism already exists and works; this story's gap is purely that no one can *see* it or manage who's used it. Building a parallel invite-email system would be new infrastructure for a problem the platform already has half the answer to. If email-based invites are wanted later, that's a separate, larger story.
- **Soft-delete on removal, not a hard revoke-and-purge:** Matches the platform's standing `deleted_at` convention (`.claude/rules/postgres-native.md`) and preserves historical load/document attribution — removing a team member shouldn't rewrite the load history they were involved in.
- **Admin status modeled as `is_tenant_admin` flag, not a role change (revised 2026-09-01, per US-874):** Director feedback corrected the original design — granting/revoking admin status must never change a member's persona role (`SHIPPER` stays `SHIPPER`). All ACs and business rules above updated to grant/revoke a flag rather than promote/demote between role values.
- **UX placement decided via `/council-review` (2026-09-01):** a 6-persona council evaluated "separate admin workflow" vs. "merged into persona dashboard." Verdict: GO on merged placement, reshaped as a *contained* settings-style section (not scattered inline widgets, not a mode-switch) — 5 of 6 council members favored merging; the dissenting Contrarian's real concern was implementation duplication across US-875/877, not placement, which is why the Reuse Flag above was added. Full verdict available in session transcript; not separately filed as a design doc.

---

## Approval

AC-1 through AC-7, all Business Rules, and the council-review UX placement/reuse-flag additions approved by Mike, 2026-09-01. Story proceeds to ARCHITECT (Input Acceptance Gate must include the reuse evaluation against US-877 noted above).
