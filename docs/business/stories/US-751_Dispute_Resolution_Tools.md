# US-751: Dispute Resolution Tools (Super User)

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P2
**Persona:** ADMIN (Super User — platform-wide, cross-tenant)
**Scope:** FULL_STACK
**Depends On:** US-750 (Super User Dashboard), US-874 (Role Model Foundation)
**Jira:** [FREIG-136](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-136)

---

## User Story

As a **Super User**, I want to see and resolve disputes/claims raised between Shippers and Carriers on a load, so that the platform has a real escalation path instead of disputes being handled outside the product (email, phone).

---

## Background

`Story_Map.md` Phase 9 has carried this as `MIGRATION_PENDING` since early planning. A `Claim` domain entity already exists in the backend (`backend/src/main/java/com/freightclub/domain/Claim.java`), which is the natural data source this story surfaces — this story does not invent a new dispute concept, it gives Super Users a queue and resolution workflow against the existing claims model.

> **Scope note:** confirming `Claim`'s exact current fields/workflow is ARCHITECT's Input Acceptance Gate task, not BA's — per the Anti-Patterns rule (BA must not specify DB/query logic). If `Claim` turns out not to cover load-level shipper/carrier disputes, ARCHITECT escalates via CHG per the Sequential Lock Protocol rather than this story being implemented against the wrong model.

---

## Business Rules

- BR-1: Only `ADMIN` (Super User) can view or act on the dispute queue — not the Shipper or Carrier who raised it (they see their own claim's status via their existing persona views, not this tool), and not `SHIPPER_ADMIN`/`CARRIER_ADMIN` (tenant-scoped, no cross-tenant dispute visibility).
- BR-2: A dispute in the queue must show enough context to resolve it without leaving the tool: the load, both parties (Shipper tenant, Carrier tenant), and the claim's stated reason.
- BR-3: Resolving a dispute requires the Super User to record an outcome and a reason — silent/unexplained resolution is not allowed (audit trail requirement).
- BR-4: Resolution outcomes are constrained to a small fixed set (e.g., resolved in Shipper's favor, resolved in Carrier's favor, no action needed) — ARCHITECT/CODER define the exact enum; BA requires only that *some* outcome is always recorded, per BR-3.
- BR-5: This story does not implement any payment adjustment, refund, or fee waiver — if a dispute's resolution implies money changing hands, that is out of scope here and flagged Tier A (financial) for a separate story once Phase 5 payment processing exists.

---

## Acceptance Criteria

- AC-1: Given a user with role `ADMIN`, when they open the dispute queue, then they see all open disputes across every tenant, each showing the load, both parties, and the stated reason.
- AC-2: Given a user with any role other than `ADMIN`, when they attempt to access the dispute queue route or its backing endpoint, then they receive a 403.
- AC-3: Given an open dispute, when a Super User resolves it, then they must select an outcome and enter a reason before the resolution is accepted — an empty reason is rejected.
- AC-4: Given a resolved dispute, when viewed later, then the outcome, reason, resolving Super User's identity, and resolution timestamp are all visible (audit trail per BR-3).
- AC-5: Given a dispute involving a payment adjustment or refund, when a Super User attempts to resolve it through this tool, then the tool does not process any monetary change — it only records the resolution outcome/reason (per BR-5, out of scope).

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Dispute queue list (load, parties, reason) | *(ARCH fills)* | *(ARCH fills — likely `claims` table)* | *(ARCH fills)* | Yes |
| Resolution outcome selector | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Resolution reason input | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: sits downstream of the core Load Board → Assign Load → Deliver flow — activates only when a Shipper or Carrier flags something wrong with a specific load, giving the platform an escalation path outside that normal flow.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-750 (dashboard shell) and US-874 (role model); both are separately shippable ahead of this.
- [x] **Negotiable** — describes required outcomes (visibility, forced-reason resolution, audit trail), not implementation.
- [x] **Valuable** — gives the platform its first real dispute-handling path.
- [x] **Estimable** — bounded to viewing + resolving against an existing `Claim` entity.
- [x] **Small** — one queue view, one resolve action, no payment logic.
- [x] **Testable** — AC-1 through AC-5 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **No payment/refund logic in this story (BR-5):** Phase 5 (Payments & Invoicing) is still blocked on processor integration per `Story_Map.md`'s own Blocker Analysis. Bundling monetary resolution into a dispute tool ahead of real payment infrastructure existing would mean building against nothing. Flagged as future Tier A work once Phase 5 unblocks — a Director decision on fee/refund policy will be needed then, not now.

---

## Approval

AC-1 through AC-5 and all Business Rules approved by Mike, 2026-09-01. Story proceeds to ARCHITECT.
