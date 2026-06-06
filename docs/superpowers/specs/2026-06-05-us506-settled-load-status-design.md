# Design Spec: US-506 — SETTLED Load Status & Workflow

**Date:** 2026-06-05  
**Story:** US-506  
**Phase:** 5 — Payment Settlement & Financial Transactions  
**Depends On:** US-105 (DELIVERED status), US-502 (payment accounts)  
**Blocks:** US-507 (Payment Dispute Flow & Resolution)  
**Status:** DESIGN_APPROVED

---

## Summary

When a load reaches `DELIVERED` status (set by the trucker), the shipper must actively confirm or dispute the delivery. Confirming moves the load to `SETTLED` (approved for payout; actual disbursement is separate). Disputing moves the load to `DISPUTED` and hands off to US-507.

---

## State Machine

```
DELIVERED
    │
    ├─ Shipper confirms → SETTLED   (approved for payout; disbursement handled separately)
    │
    └─ Shipper disputes → DISPUTED  (US-507 owns resolution; no payment released)
```

**Guards (both transitions):**
- Load must be in `DELIVERED` status
- Caller must have `SHIPPER` role
- Caller's `tenant_id` must match the load's `tenant_id`
- The trucker assigned to the load cannot call either endpoint

---

## API

### Confirm Delivery
```
PATCH /api/v1/loads/{id}/settle
Authorization: SHIPPER role only
Pre-conditions:
  - Load status == DELIVERED
  - tenant_id matches caller's tenant
Effects:
  - status → SETTLED
  - settled_at = now()
  - Publishes LoadStatusChangedEvent(SETTLED)
Response: 200 OK with updated LoadResponse
```

### Dispute Delivery
```
PATCH /api/v1/loads/{id}/dispute
Authorization: SHIPPER role only
Request Body: { "reason": "string (required)" }
Pre-conditions:
  - Load status == DELIVERED
  - tenant_id matches caller's tenant
Effects:
  - status → DISPUTED
  - disputed_at = now()
  - dispute_reason = body.reason
  - Publishes LoadStatusChangedEvent(DISPUTED)
Response: 200 OK with updated LoadResponse
```

Both endpoints follow the existing verb-per-action pattern established by `/pickup` and `/deliver` (US-105).

---

## Service Layer

Two new methods on `LoadService`:

- `settleLoad(UUID loadId)` — validates pre-conditions, updates status + timestamp, publishes event. Wrapped in a single transaction.
- `disputeLoad(UUID loadId, String reason)` — validates pre-conditions, updates status + timestamps + reason, publishes event. Wrapped in a single transaction.

Fetch uses existing `loadRepository.findByIdAndTenantId(id, tenantId)` — no new queries needed.

The existing `LoadStatusChangedEvent` from US-105 is reused. Phase 2 notification consumers will handle `SETTLED` and `DISPUTED` events with no new wiring.

---

## Database Migration

File: `V20260605_HHMM__AddLoadSettledDisputedFields.sql`

```sql
-- Extend LoadStatus enum
ALTER TYPE load_status ADD VALUE IF NOT EXISTS 'SETTLED';
ALTER TYPE load_status ADD VALUE IF NOT EXISTS 'DISPUTED';

-- Add columns to loads table
ALTER TABLE loads ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMPTZ;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS dispute_reason TEXT;
```

No new tables. Existing `loads` RLS policy covers the new columns. No RLS changes required.

---

## Frontend

On the load detail page, when `status == DELIVERED` and current user has `SHIPPER` role:

- **"Confirm Delivery" button** — calls `PATCH /loads/{id}/settle` on click
- **"Dispute Delivery" button** — reveals an inline form with a required `reason` text field; calls `PATCH /loads/{id}/dispute` on submit

After either action:
- Status badge updates to `SETTLED` or `DISPUTED`
- Both action buttons are removed (transition is one-way)
- Trucker receives an in-app notification via existing `LoadStatusChangedEvent` → Phase 2 consumer

No new pages. Addition to the existing load detail view only.

---

## Testing Strategy

**Backend unit tests:**
- `settleLoad` succeeds from `DELIVERED` with SHIPPER role
- `settleLoad` throws 403 if caller is TRUCKER
- `settleLoad` throws 400 if status is not `DELIVERED`
- `disputeLoad` succeeds from `DELIVERED` with reason
- `disputeLoad` throws 400 if reason is blank
- `disputeLoad` throws 403 if caller is TRUCKER
- Tenant isolation: SHIPPER from tenant B cannot settle a load belonging to tenant A

**Frontend:**
- Confirm/Dispute buttons appear only when `status == DELIVERED` and role is `SHIPPER`
- Dispute form requires non-empty reason before submit
- Buttons disappear after action completes

---

## Out of Scope

- Dispute resolution flow — owned by US-507
- ACH payout disbursement — separate scheduled process
- Auto-settle timeout — not in this story (shipper must act)
