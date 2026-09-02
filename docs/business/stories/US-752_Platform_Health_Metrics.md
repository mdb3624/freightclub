# US-752: Platform Health Metrics (Real-Time)

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P2
**Persona:** ADMIN (Super User — platform-wide, cross-tenant)
**Scope:** FULL_STACK
**Depends On:** US-750 (Super User Dashboard), US-874 (Role Model Foundation)
**Jira:** [FREIG-137](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-137)

---

## User Story

As a **Super User**, I want a real-time view of platform health (active sessions, error rates, backend availability), so that I can notice a problem while it's happening instead of waiting for a customer complaint.

---

## Background

Carried in `Story_Map.md` Phase 9 as `MIGRATION_PENDING`. The billing outage postmortem (`project_production_billing_outage_2026-08-03` in project memory) is a concrete example of exactly the gap this story closes — that incident was discovered externally, not via any in-product signal. `/actuator/health` already exists on the backend and is the natural first data source.

---

## Business Rules

- BR-1: Visible only to `ADMIN` (Super User) — same gate as US-750/US-751.
- BR-2: The view surfaces, at minimum: backend health (`/actuator/health` status), and a rolling error-rate/request-volume signal — exact metric set is ARCHITECT's technical design call within this scope.
- BR-3: Per `Story_Map.md`'s existing guardrail note for this row, this view refreshes on a 10-second TTL (materially tighter than US-750's 5-minute dashboard TTL) — this is a monitoring surface, not a periodic report.
- BR-4: This story surfaces signals; it does not send alerts/pages (e.g., no Slack/email/SMS notification on threshold breach) — that is a larger, separate initiative (alerting infrastructure) and explicitly out of scope here.

---

## Acceptance Criteria

- AC-1: Given a user with role `ADMIN`, when they open the platform health view, then they see current backend health status and a recent error-rate/request-volume signal.
- AC-2: Given a user with any other role, when they attempt to access the platform health view or its backing endpoint, then they receive a 403.
- AC-3: Given the view is open, when 10 seconds elapse, then the displayed data refreshes automatically without a manual reload (per BR-3's 10s TTL).
- AC-4: Given the backend health check itself is failing or unreachable, when the Super User views this page, then the page still renders and clearly shows the health check as failing/unknown — it does not itself crash or blank out because the thing it's monitoring is unhealthy.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Backend health status indicator | *(ARCH fills)* | *(ARCH fills — likely proxies `/actuator/health`)* | *(ARCH fills)* | Yes |
| Error rate / request volume signal | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: operates alongside, not inside, the Load Board → Assign Load → Deliver flow — a continuous background signal the Super User checks in on, rather than a step any Shipper/Carrier action passes through.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-750/US-874, both separately shippable first.
- [x] **Negotiable** — describes the outcome (see health/error signal in near-real-time), not the metrics backend.
- [x] **Valuable** — closes a real, previously-incident-causing visibility gap.
- [x] **Estimable** — bounded to read-only monitoring against an existing health endpoint.
- [x] **Small** — one view, two signal types, no alerting.
- [x] **Testable** — AC-1 through AC-4 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **No alerting/paging in this story (BR-4):** Alerting is genuinely separate infrastructure (who gets paged, escalation policy, on-call rotation) and deserves its own scoped story rather than being folded silently into a dashboard. This story only makes the signal visible to a human who checks it.

---

## Approval

AC-1 through AC-4 and all Business Rules approved by Mike, 2026-09-01. Story proceeds to ARCHITECT.
