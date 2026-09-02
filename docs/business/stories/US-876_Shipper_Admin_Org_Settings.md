# US-876: Shipper Admin — Org Settings & Defaults

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P2
**Persona:** SHIPPER with `is_tenant_admin = true` (tenant-scoped)
**Scope:** FULL_STACK
**Depends On:** US-874 (Role Model Foundation), US-875 (Team & Seat Management)
**Jira:** [FREIG-139](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-139)

---

## User Story

As a **Shipper Admin**, I want to set my organization's default pickup address, billing details, and notification preferences once at the org level, so that every member of my team doesn't have to re-enter the same information individually.

---

## Background

`User` today carries default pickup address, billing address, and notification preference fields (`defaultPickupAddress*`, `billingAddress*`, `notify*`) per-row, with no org-level default. In a multi-seat tenant (enabled by US-875), each new member starts blank and has to fill these in themselves even though, in practice, they're almost always the same for everyone at one company. This story does not remove the per-user fields (an individual can still override); it adds an org-level default a new/existing member inherits.

**UX placement (per `/council-review`, 2026-09-01 — GO with reshape):** lives in the same contained settings section as US-875's team management, inside the existing Shipper shell — see that story's UX placement note and `docs/standards/ADMIN_DESIGN_SYSTEM.md`.

---

## Business Rules

- BR-1: Visible only to `SHIPPER` users with `is_tenant_admin = true` (per US-874), scoped to their own tenant.
- BR-2: Org-level defaults cover: default pickup address, billing address, and default notification preferences (email/SMS/in-app) — the same fields that already exist per-user on `User`, just settable once at the tenant level.
- BR-3: A new member joining the tenant (via join code, per US-875) inherits the org defaults at signup. An existing member's own saved values, if they've already set something different, are **not** silently overwritten when the admin changes the org default — this only affects new members and anyone who hasn't yet customized their own values (exact mechanics for "hasn't customized" are ARCHITECT's call — BA requires only that an existing member's deliberate customization is never clobbered).
- BR-4: A regular `SHIPPER` member can still override any of these fields for themselves individually — org defaults are a starting point, not a lock.
- BR-5: For a tenant with exactly one member (the admin themselves, before any other member joins), the UI must **not** present "org default" and "your value" as two distinct concepts — that distinction is meaningless noise until a second member exists. Show a single set of fields; the org-default framing (and the non-clobbering behavior in BR-3) only becomes visible once the tenant has 2+ members. Surfaced by the council-review Contrarian and Buyer personas (2026-09-01): most tenants are a single owner wearing both the Shipper and admin hat, and a premature "org vs. mine" UI would confuse rather than help that majority case.

---

## Acceptance Criteria

- AC-1: Given a `SHIPPER` user with `is_tenant_admin = true`, when they set an org default pickup address, billing address, or notification preference, then the setting is saved at the tenant level.
- AC-2: Given a tenant has org defaults set, when a new member joins via join code, then their initial pickup address, billing address, and notification preferences are pre-filled from the org defaults rather than blank.
- AC-3: Given an existing member has already customized their own pickup address, when the Shipper Admin later changes the org default, then that member's own saved value is unchanged.
- AC-4: Given a `SHIPPER` (non-admin) member, when they view their own profile, then they can still edit their individual pickup address/billing/notification settings independently of the org default.
- AC-5: Given a user with role `SHIPPER` (not admin), when they attempt to access the org settings view or its backing endpoints, then they receive a 403.
- AC-6: Given a tenant with exactly one member, when that member (the admin) views the settings view, then they see a single set of fields with no "org default vs. your value" distinction shown (per BR-5); once a second member joins, the distinction becomes visible for both.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Org default pickup address | *(ARCH fills)* | *(ARCH fills — new tenant-level field)* | *(ARCH fills)* | No |
| Org default billing address | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | No |
| Org default notification preferences | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | No |

---

## Platform Foundation Mapping

Actor: Shipper Admin. Sequence: upstream configuration step that reduces friction before a Shipper posts a load — not part of Load Board → Assign Load → Deliver itself, but reduces repeated data entry for every member who does participate in it.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874/US-875 (needs the admin role and multi-seat visibility to be meaningful), both otherwise separately shippable.
- [x] **Negotiable** — describes desired behavior (org defaults, inherit-on-join, no clobbering), not schema shape.
- [x] **Valuable** — removes repeated data entry across a multi-seat Shipper org.
- [x] **Estimable** — bounded to a known, existing set of fields being promoted to a tenant-level default.
- [x] **Small** — one settings view, inherit-on-join logic, no new field types.
- [x] **Testable** — AC-1 through AC-6 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **Org defaults never overwrite an already-customized member value (BR-3):** Silently overwriting a team member's individually-saved data because the admin changed an unrelated org default would be a surprising, trust-eroding behavior. Defaults apply going forward (new members) and as a fallback, not retroactively.
- **1-seat collapse rule added (BR-5, AC-6) via `/council-review` (2026-09-01):** the council's Contrarian scored this design 4/10 specifically because a solo-owner tenant makes "org default vs. your value" a distinction over one row of data. Rather than deferring the story, the fix is a display rule: collapse to one field set until a second member exists. UX placement (merged into the Shipper shell as a contained section, not a separate workflow) affirmed 9/10 and 8/10 by the council's Researcher and Buyer respectively — full verdict in session transcript.

---

## Approval

AC-1 through AC-6, all Business Rules, and the council-review 1-seat collapse addition approved by Mike, 2026-09-01. Story proceeds to ARCHITECT.
