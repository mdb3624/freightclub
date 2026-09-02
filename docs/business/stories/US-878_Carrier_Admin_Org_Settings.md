# US-878: Carrier Admin — Org Settings & Defaults

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P2
**Persona:** TRUCKER with `is_tenant_admin = true` (tenant-scoped)
**Scope:** FULL_STACK
**Depends On:** US-874 (Role Model Foundation), US-877 (Team & Seat Management)
**Jira:** [FREIG-141](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-141)

---

## User Story

As a **Carrier Admin**, I want to set fleet-level defaults for cost-per-mile inputs (fuel cost, maintenance cost, monthly fixed costs) and notification preferences, so that every driver I add doesn't have to independently research and enter the same fleet-wide operating costs.

---

## Background

`User` already carries a full set of per-driver cost-basis fields (`monthlyFixedCosts`, `fuelCostPerGallon`, `milesPerGallon`, `maintenanceCostPerMile`, `targetMarginPerMile`, etc.) used for the Trucker's cost-per-mile calculations. In a small fleet (multi-seat Carrier tenant, enabled by US-877), these figures are typically set by the fleet owner/dispatcher for the whole operation, not independently guessed at by each driver. This mirrors US-876 on the Shipper side, applied to the Carrier persona's actual fields.

**UX placement (per `/council-review`, 2026-09-01 — GO with reshape):** lives in the same contained settings section as US-877's team management, inside the existing Carrier shell — see that story's UX placement note (mobile-usable, never competing with the load board) and `docs/standards/ADMIN_DESIGN_SYSTEM.md`.

---

## Business Rules

- BR-1: Visible only to `TRUCKER` users with `is_tenant_admin = true` (per US-874), scoped to their own tenant.
- BR-2: Org-level defaults cover the existing per-user cost-basis fields already on `User` (fuel cost/gallon, maintenance cost/mile, monthly fixed costs, target margin/mile) and notification preferences — set once at the tenant level.
- BR-3: A new driver joining the tenant (via join code, per US-877) inherits the org cost defaults at signup. An existing driver's own saved values, if already customized, are **not** silently overwritten when the admin changes the org default (same non-clobbering rule as US-876 BR-3).
- BR-4: A `TRUCKER` member can still override any of these fields for themselves individually (e.g., a driver with a different truck/fuel economy than the fleet average) — org defaults are a starting point, not a lock.
- BR-5: For a tenant with exactly one member (the owner-operator admin themselves, before any driver joins), the UI must **not** present "org default" and "your value" as two distinct concepts — that distinction is meaningless noise until a second driver exists. Show a single set of cost-basis fields; the org-default framing (and non-clobbering behavior in BR-3) only becomes visible once the tenant has 2+ members. Same rule as US-876 BR-5, surfaced by the council-review Contrarian and Buyer personas (2026-09-01) — most Carrier tenants are a solo owner-operator wearing both hats.

---

## Acceptance Criteria

- AC-1: Given a `TRUCKER` user with `is_tenant_admin = true`, when they set org-level default fuel cost, maintenance cost, monthly fixed costs, target margin, or notification preferences, then the setting is saved at the tenant level.
- AC-2: Given a tenant has org cost defaults set, when a new driver joins via join code, then their initial cost-per-mile inputs are pre-filled from the org defaults rather than blank.
- AC-3: Given an existing driver has already customized their own fuel cost or other cost-basis field, when the Carrier Admin later changes the org default, then that driver's own saved value is unchanged.
- AC-4: Given a `TRUCKER` (non-admin) member, when they view their own profile, then they can still edit their individual cost-basis fields independently of the org default.
- AC-5: Given a user with role `TRUCKER` (not admin), when they attempt to access the org settings view or its backing endpoints, then they receive a 403.
- AC-6: Given a tenant with exactly one member, when that member (the admin) views the settings view, then they see a single set of cost-basis fields with no "org default vs. your value" distinction shown (per BR-5); once a second driver joins, the distinction becomes visible for both.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Org default fuel cost/gallon | *(ARCH fills)* | *(ARCH fills — new tenant-level field)* | *(ARCH fills)* | No |
| Org default maintenance cost/mile | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | No |
| Org default monthly fixed costs | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | No |
| Org default target margin/mile | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | No |
| Org default notification preferences | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | No |

---

## Platform Foundation Mapping

Actor: Carrier Admin. Sequence: upstream configuration step that reduces per-driver setup friction before claiming/delivering loads — not part of Load Board → Assign Load → Deliver itself, but reduces repeated data entry for every driver who does participate in it.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874/US-877, both otherwise separately shippable.
- [x] **Negotiable** — describes desired behavior, not schema shape.
- [x] **Valuable** — removes repeated cost-basis entry across a multi-driver fleet.
- [x] **Estimable** — bounded to a known, existing set of fields being promoted to a tenant-level default.
- [x] **Small** — one settings view, inherit-on-join logic, structurally identical to US-876.
- [x] **Testable** — AC-1 through AC-6 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **Cost-basis defaults treated as operational configuration, not pricing/financial policy:** These are the fleet's own internal cost inputs (fuel, maintenance) used for the Trucker's own cost-per-mile visibility (`US-873`), not platform pricing, fees, or payment terms — so this stays Tier B rather than Tier A. If this ever feeds into a platform-facing rate/fee calculation, that linkage would need its own Tier A review.
- **Non-clobbering rule mirrors US-876 BR-3** for the same reason: an admin-level default change should never silently overwrite a driver's own deliberately-entered numbers.
- **1-seat collapse rule added (BR-5, AC-6) via `/council-review` (2026-09-01):** same reasoning as US-876 — a solo owner-operator tenant makes "org default vs. your value" a distinction over one row of data. UX placement (merged into the Carrier shell as a contained, mobile-usable section) affirmed by the council's Researcher (9/10) and Buyer (8/10, explicitly role-playing this persona's fleet-owner-driver user) — full verdict in session transcript.

---

## Approval

AC-1 through AC-6, all Business Rules, and the council-review 1-seat collapse addition approved by Mike, 2026-09-01. Story proceeds to ARCHITECT.
