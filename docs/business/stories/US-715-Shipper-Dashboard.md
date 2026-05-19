# US-715: Shipper Dashboard

**Status:** DONE  
**Phase:** 7  
**Depends On:** US-101 (Core load registration), US-103 (Load CRUD)  
**Acceptance Criteria Basis:** Shipper persona (docs/business/personas/shipper.md, lines 58, 64)

---

## User Story

As a **shipper**, I want to **view all my posted loads at a glance with their statuses and a summary of active loads**, so that **I can quickly understand load progress and manage my active shipping workflow**.

---

## Acceptance Criteria

### AC1: Load Summary Strip
- [ ] Display summary counts above the load table:
  - Count of OPEN loads (awaiting claim)
  - Count of CLAIMED loads (awaiting pickup)
  - Count of IN_TRANSIT loads (picked up, en route)
  - Count of DELIVERED loads (completed this session)
- [ ] Show counts in easy-to-scan cards with green/yellow/blue color coding
- [ ] Update counts in real-time as load statuses change

### AC2: Load Table
- [ ] Display all shipper's loads in a sortable table with columns:
  - Load ID
  - Origin (city, state)
  - Destination (city, state)
  - Pickup Date/Time Window
  - Status (DRAFT, OPEN, CLAIMED, IN_TRANSIT, DELIVERED, CANCELLED)
  - Pay Rate (flat or per-mile)
  - Claimed by (trucker name and contact, if applicable)
- [ ] Loads sorted by pickup date (earliest first) by default
- [ ] Support secondary sorting by status, pay rate, or distance
- [ ] Pagination (10-20 loads per page)

### AC3: Quick Actions
- [ ] "Post New Load" button (prominent CTA) → navigates to `/shipper/loads/new`
- [ ] "Edit" button per row (enabled for DRAFT/OPEN/CLAIMED loads only)
- [ ] "Cancel" button per row (enabled for pre-DELIVERED loads, shows confirmation dialog)
- [ ] "View Details" link to full load record

### AC4: Filtering & Search (MVP scope)
- [ ] Filter by status (multi-select dropdown)
- [ ] Filter by date range (optional: "Last 7 days", "Last 30 days", "All time")
- [ ] Search by load ID or destination city

### AC5: Empty State
- [ ] If shipper has no loads, display empty state with:
  - "You haven't posted any loads yet"
  - "Post a Load" button to get started

### AC6: Performance & Caching
- [ ] Load list cached at 2-minute TTL (NFR-504)
- [ ] Cache invalidated on: load creation, status change, cancellation
- [ ] Pagination and filters preserved in URL query params

---

## Business Rules

1. **Load Status Visibility**: Shippers see only their own tenant's loads (RLS enforcement)
2. **Deleted Loads**: Soft-deleted loads (cancelled) remain visible in history but marked as CANCELLED
3. **Read-Only Statuses**: DELIVERED and CANCELLED statuses are not editable
4. **Claimed Load Info**: If a load is CLAIMED, display trucker's name, phone, and email for coordination

---

## Non-Functional Requirements

- **Caching:** GET `/api/v1/shipper/loads` cached at 2m TTL (NFR-504)
- **Test Coverage:** 80% branch coverage (JaCoCo)
- **Complexity:** No method > cyclomatic 10
- **Security:** RLS enforced; no cross-tenant data leakage
- **Soft Deletes:** All queries include `deleted_at IS NULL` filter

---

## Dependencies

- **Backend:** Load query service with RLS + soft-delete filtering
- **Frontend:** React Query for caching, React Router for navigation
- **API Endpoint:** GET `/api/v1/shipper/loads?page=0&status=OPEN&dateRange=7d` (to be designed)

---

## Scope Notes

- **OUT OF SCOPE (defer to later stories):**
  - Recurring load scheduling (US-759)
  - Bid acceptance/rejection UI (US-742)
  - Shipper preferred carrier list (US-707)
  - Analytics/reporting (US-753)

---

## Metrics

- **Success Metric:** Shipper can navigate to dashboard, see all loads, and perform CRUD in < 3 seconds (P95)
- **Adoption:** Shipper returns to dashboard within 5 minutes of posting first load

---

**Created:** 2026-05-19  
**Baseline:** Shipper persona (shipper.md, lines 58, 64); empty stub dashboard deployed but missing load list + summary UI
