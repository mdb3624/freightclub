---
id: LOAD-202
title: Load Publishing & Transactional Outbox Integration
persona: Shipper
priority: High
status: 📝 Planned
---

# LOAD-202 — Load Publishing & Transactional Outbox Integration

**As a** Shipper,
**I want** to publish a drafted load so it becomes visible to truckers,
**so that** the state change and its downstream notification event are delivered reliably — even if the application crashes after the DB write.

## Acceptance Criteria
- [ ] `PUT /api/v2/loads/{id}/publish` transitions status from `DRAFT` → `PUBLISHED`; any other source status returns `409 Conflict`
- [ ] Within the same `@Transactional` boundary: aggregate state is saved, `LoadPublishedEvent` is drained from `load.pullDomainEvents()`, and one row is inserted into `message_outbox` with `status = 'PENDING'`
- [ ] `message_outbox` has `tenant_id` column and RLS enabled; the outbox relay query must include `tenant_id = app.current_tenant`
- [ ] If the application restarts before the relay fires, the `PENDING` outbox row survives and is re-processed on next poll — no event is lost
- [ ] Published load appears in trucker load board results (`GET /api/v1/board`) within one relay cycle (≤ 5 seconds in dev profile)
- [ ] `LoadPublishedEvent` payload includes `loadId`, `tenantId`, `equipmentType`, and `originCity` to support downstream auto-matching (MAT-302)

## Related Stories
- LOAD-201 (must be DRAFT before publishing)
- MAT-302 (published event triggers auto-match)
- OPS-401 (publish enables claiming)
- AUD-601 (state transition must be audit-logged)
