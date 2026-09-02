# US-750: Super User Dashboard (Users, Loads, Tenants)

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P1
**Persona:** ADMIN (Super User — platform-wide, cross-tenant)
**Scope:** FULL_STACK
**Depends On:** US-874 (Role Model Foundation)
**Jira:** [FREIG-135](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-135)

---

## User Story

As a **Super User**, I want a single dashboard showing platform-wide users, loads, and tenants, so that I can see what's happening across the whole platform without querying the database directly.

---

## Background

Phase 9 of `Story_Map.md` has carried this story as `MIGRATION_PENDING` since the platform's early planning; it was never built. The `ADMIN` role already exists in `UserRole` but has no UI or endpoints behind it today. This story is the first real Admin-facing surface — read-only visibility, not yet management actions (those are separate, narrower stories to keep this one small and reviewable).

---

## Business Rules

- BR-1: The dashboard is visible only to users with role `ADMIN` (Super User) — `SHIPPER_ADMIN`/`CARRIER_ADMIN` (tenant-scoped, US-874) must not see it; they get their own tenant-scoped admin views (US-875/US-877).
- BR-2: The dashboard shows counts and lists across **all tenants** — this is the one legitimate cross-tenant view on the platform, per the multi-tenancy rule's own carve-out for platform operators.
- BR-3: This story is **read-only**. No suspend/delete/edit action lives here — those are separate future stories once this visibility layer is validated.
- BR-4: Data shown: total users (by persona/role), total tenants, total loads (by status), each refreshed per the existing NFR-504 caching pattern already noted in `Story_Map.md` for this row (5-minute TTL).

---

## Acceptance Criteria

- AC-1: Given a user with role `ADMIN`, when they navigate to the Super User dashboard, then they see tenant count, user count (broken down by role), and load count (broken down by status) across the entire platform.
- AC-2: Given a user with role `SHIPPER`, `TRUCKER`, `SHIPPER_ADMIN`, or `CARRIER_ADMIN`, when they attempt to access the Super User dashboard route or its backing endpoint directly, then they receive a 403 and see no cross-tenant data.
- AC-3: Given the dashboard is loaded, when 5 minutes have not yet elapsed since the last fetch, then the dashboard serves the cached response rather than re-querying (per NFR-504, 5m TTL as already specified in `Story_Map.md`).
- AC-4: Given the dashboard's tenant list, when displayed, then each tenant row shows tenant name, plan, and member count only — no cross-tenant load/document content is exposed inline (avoids this becoming an unbounded data-browsing tool in v1).

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Tenant count tile | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| User count by role tile | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Load count by status tile | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Tenant list (name, plan, member count) | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |

---

## Platform Foundation Mapping

Super User visibility doesn't sit in the Load Board → Assign Load → Deliver sequence itself; it's the oversight layer that watches that sequence run correctly across every tenant. Actor: Super User (platform operator). Sequence: reviews aggregate platform health after Shippers post, Carriers claim, and loads deliver — no direct participation in the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends only on US-874 (role foundation), which is itself independent.
- [x] **Negotiable** — describes the *what* (cross-tenant read-only visibility), not specific chart libraries or query shapes.
- [x] **Valuable** — first real capability for the Super User persona, who currently has zero tooling.
- [x] **Estimable** — bounded to read-only aggregate views; ARCH has enough to size it.
- [x] **Small** — one dashboard, three data tiles, one list. Management actions explicitly deferred.
- [x] **Testable** — AC-1 through AC-4 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **Read-only scope for v1:** Bundling suspend/delete/edit actions into the first Admin surface ever built for this platform is a bigger blast radius than necessary to validate the concept. Narrowed to visibility only; management actions get their own story once this ships and is reviewed.
- **Tenant list shows only name/plan/member count, not tenant content:** Per-tenant load/document drill-down would make this a general-purpose cross-tenant data browser, which is a much larger security surface than "see platform health at a glance." Deferred pending a specific need.

---

## Approval

AC-1 through AC-4 and all Business Rules approved by Mike, 2026-09-01. Story proceeds to ARCHITECT.
