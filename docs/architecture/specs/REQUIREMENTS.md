# Architecture Requirements Specification (REQ-xxx Registry)

**Scope:** All phases (1–9) with explicit VARCHAR(36) ID requirement and tenant isolation enforcement.  
**Last Updated:** 2026-04-26  
**Status:** Phase 1–4 complete; Phase 5–9 specification ready.

---

## ID & Tenancy Standards (Mandatory)

✅ **REQ-ALL-001:** All primary/foreign keys MUST be `VARCHAR(36)` (UUID standard).  
✅ **REQ-ALL-002:** Every table MUST enforce `tenant_id` isolation via PostgreSQL RLS policy.  
✅ **REQ-ALL-003:** All user-facing functions MUST use `TenantContextHolder` for implicit tenant scoping.  
✅ **REQ-ALL-004:** Soft-delete mandatory: `deleted_at TIMESTAMPTZ` on all core entities.

---

## Phase 5 — Payment Settlement & Financial Transactions

**Status:** ⚪ PENDING (US-501 READY_FOR_DESIGN)

| REQ ID | Feature | Dependency | Cross-Reference |
|--------|---------|------------|-----------------|
| 5.1 | Load settlement at DELIVERED state | — | US-501 AC-1 |
| 5.2 | 2% platform commission (or tenant override) | REQ-5.1 | US-501 AC-5 |
| 5.3 | Quick Pay next-day (1% fee) | REQ-5.1 | US-501 AC-2 |
| 5.4 | Ultra-Fast same-day (2% fee) | REQ-5.1 | US-501 AC-3 |
| 5.5 | `financial_transactions` immutable ledger | REQ-5.1, REQ-5.2 | US-501 AC-4 |
| 5.6 | `quick_pay_elections` audit table (VARCHAR(36) tenant_id) | REQ-5.3, REQ-5.4 | BA_AUDIT_PHASE7 |
| 5.7 | Payout method configuration (ACH/Wire) | REQ-5.1 | US-501 AC-6 |
| 5.8 | Dispute hold on settlement | REQ-5.1 | US-501 AC-7 |

**Schema Compliance:**
- `financial_transactions.id` (VARCHAR(36) PK)
- `financial_transactions.tenant_id` (VARCHAR(36), RLS policy enforced)
- `quick_pay_elections.tenant_id` (VARCHAR(36), RLS policy enforced)
- All timestamps: TIMESTAMPTZ
- Immutability: no UPDATE on amount_cents, transaction_type, commission_rate_percent

**US-501 Gate:** Architect must review and approve before Coder begins.

---

## Phase 7 — Advanced Carrier Management & Fleet Management

**Status:** ⚪ PLANNED (0% implementation, ready for design)

### Core Fleet Management (REQ-7.1 to REQ-7.6)

| REQ ID | Feature | Type | Acceptance Criteria |
|--------|---------|------|-------------------|
| 7.1 | Trucker equipment inventory profile | Data model | Trucker stores equipment types owned (type, capacity, dimensions); stored in `carrier_profiles` table (VARCHAR(36) tenant_id, user_id) |
| 7.2 | Trucker preferred lanes configuration | Data model | Origin/destination region pairs; stored in `preferred_lanes` table (tenant_id, user_id, VARCHAR(36) PK) |
| 7.3 | Trucker availability tracking | Data model | Days/hours available; stored in `availability_windows` table with TIMESTAMPTZ fields |
| 7.4 | Public trucker profile view (shipper perspective) | API endpoint | `GET /api/v1/trucker/{id}/public-profile` returns rating, equipment, history (RLS filters by tenant) |
| 7.5 | Advanced load board filters (weight, min rate, suggested) | API endpoint | `GET /api/v1/board?weight=5000-20000&minRate=2.50&suggestedOnly=true` |
| 7.6 | Suggested loads for trucker (lane-based) | API endpoint | `GET /api/v1/board/suggested` returns loads matching saved lanes (tenant-scoped) |

### Shipper Preferred Carrier Network (REQ-7.7 to REQ-7.10)

| REQ ID | Feature | Type | Acceptance Criteria |
|--------|---------|------|-------------------|
| 7.7 | Save preferred truckers | Data model | `preferred_carriers` table (VARCHAR(36) shipper_id, trucker_id, tenant_id) with RLS |
| 7.8 | Direct load assignment to preferred trucker | API endpoint | `POST /api/v1/loads/{id}/assign/{truckerUserId}` bypasses open board, notifies trucker |
| 7.9 | Block carrier from accessing loads | Data model | `blocked_carriers` table (shipper_id, trucker_id, tenant_id, deleted_at soft-delete) |
| 7.10 | Shipper preferred network management | API endpoint | `GET/POST/DELETE /api/v1/preferred-carriers` |

### Load Visibility & Engagement (REQ-7.11 to REQ-7.12)

| REQ ID | Feature | Type | Acceptance Criteria |
|--------|---------|------|-------------------|
| 7.11 | View count tracking per load | Data model | `load_views` table (load_id, trucker_id, tenant_id, viewed_at TIMESTAMPTZ) |
| 7.12 | Load interest signal on board cards | UI/API | Display view count on load board; analytics for shipper (which loads attract clicks) |

**Schema Compliance:**
- All tables: `id VARCHAR(36)`, `tenant_id VARCHAR(36)`, `created_at TIMESTAMPTZ`, `deleted_at TIMESTAMPTZ`
- RLS policy: `USING (tenant_id = current_setting('app.current_tenant')::uuid)`
- Foreign keys: User IDs are VARCHAR(36), not hardcoded integers

---

## Phase 7A — Carrier Logistics & Compliance

**Status:** ⚪ PLANNED (0% implementation, ready for design)

### USDOT & DOT Compliance (REQ-7A.1 to REQ-7A.3)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7A.1 | USDOT number verification against FMCSA | Integration | `POST /api/v1/carrier/usdot/{usdotNumber}/verify` → FMCSA API call, store result |
| 7A.2 | Authority status validation (ACTIVE/INACTIVE/EXPIRED) | Enforcement | Block load claims if status ≠ ACTIVE |
| 7A.3 | Compliance dashboard with unified status | API endpoint | `GET /api/v1/carrier/compliance-dashboard` returns all requirements (USDOT, insurance, CDL, equipment) |

**Schema:** `carrier_compliance` (id VARCHAR(36), tenant_id, user_id, usdot_number VARCHAR(10), authority_status ENUM, verified_at TIMESTAMPTZ, deleted_at)

### Insurance Certificate Tracking (REQ-7A.4 to REQ-7A.6)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7A.4 | Upload liability/physical damage/cargo insurance | API endpoint | `POST /api/v1/carrier/insurance/{certificateType}` stores expiry date |
| 7A.5 | Insurance expiry validation before claim | Enforcement | Block claim if any required insurance EXPIRED |
| 7A.6 | 30-day expiry warning to trucker | Notification | Email alert at T−30 days |

**Schema:** `insurance_certificates` (id VARCHAR(36), tenant_id, user_id, certificate_type ENUM, expiry_date DATE, document_id VARCHAR(36) FK, deleted_at)

### CDL & Medical Card Documentation (REQ-7A.7 to REQ-7A.8)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7A.7 | Upload CDL and medical card with expiry tracking | API endpoint | `POST /api/v1/carrier/credentials/{credentialType}` |
| 7A.8 | Expiry notification workflow | Notification | Alert 30 days before expiry; block claims if expired |

**Schema:** `driver_credentials` (id VARCHAR(36), tenant_id, user_id, credential_type ENUM, expiry_date DATE, document_id VARCHAR(36), deleted_at)

### Equipment Condition Monitoring (REQ-7A.9 to REQ-7A.10)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7A.9 | Equipment condition logging (OPERATIONAL/UNDER_MAINTENANCE/UNSAFE) | API endpoint | `POST /api/v1/carrier/equipment/{equipmentId}/condition` |
| 7A.10 | Block claims if equipment marked UNSAFE | Enforcement | Validate at claim time; fail with equipment condition error |

**Schema:** `equipment_condition_logs` (id VARCHAR(36), tenant_id, carrier_profile_id VARCHAR(36), equipment_id VARCHAR(36), condition_status ENUM, notes TEXT, created_at, created_by VARCHAR(36))

### Pre-Claim Validation Gate (REQ-7A.11)

| REQ ID | Feature | Type | Enforcement |
|--------|---------|------|------------|
| 7A.11 | Unified claim eligibility check | Business logic | Before `LoadService.claimLoad()`: validate USDOT ACTIVE, all insurances unexpired, CDL unexpired, medical card unexpired, all equipment OPERATIONAL |

---

## Phase 7b — Advanced Financial Intelligence

**Status:** ⚪ PLANNED (0% implementation) — **UNBLOCKED by Phase 5 completion**

### Per-Load Earnings & Profitability (REQ-7b.1 to REQ-7b.4)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7b.1 | Per-load earnings log (actual miles, fuel, net profit) | Data model | `earnings_log` table (load_id VARCHAR(36), actual_miles, fuel_used, fuel_cost, net_profit, created_at) |
| 7b.2 | Fuel cost calculation (diesel price × consumption) | Formula | Cost = diesel_price_per_gallon × (actual_miles / mpg) |
| 7b.3 | Net profit calculation (revenue − fuel − fixed − maintenance) | Formula | Profit = payout − fuel_cost − (fixed_per_day / miles) − (maint_per_mile × miles) |
| 7b.4 | P&L report (weekly/monthly/custom) | API endpoint | `GET /api/v1/reports/p-and-l?startDate=2026-01-01&endDate=2026-03-31` |

### IFTA & Tax Reporting (REQ-7b.5 to REQ-7b.7)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7b.5 | Mileage tracking by state (IFTA support) | Data model | Extract origin/destination states from load; aggregate miles per state |
| 7b.6 | Quarterly IFTA export | API endpoint | `GET /api/v1/reports/ifta?year=2026&quarter=Q1` returns mileage by state |
| 7b.7 | Annual tax summary export (PDF/CSV) | API endpoint | `GET /api/v1/reports/tax-summary?year=2026&format=pdf` includes gross income, deductible expenses |

### Deadhead & Fuel Surcharge (REQ-7b.8 to REQ-7b.9)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 7b.8 | Deadhead mileage estimation (current location → pickup) | API endpoint | `GET /api/v1/loads/{id}/deadhead-estimate?currentLocation=IL` |
| 7b.9 | Dynamic fuel surcharge (FSC) based on diesel price | Formula | FSC per mile = (diesel_price − baseline_price) × 0.04 [industry standard] |

---

## Phase 8 — Bidding System

**Status:** ⚪ PLANNED (0% implementation, depends on Phase 5)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 8.1 | Shipper post load open for bids vs FCFS | API endpoint | Load has `bid_mode ENUM('FCFS', 'BID')` field |
| 8.2 | Trucker submit bid with rate and message | API endpoint | `POST /api/v1/loads/{id}/bids` (load_id, trucker_id, bid_amount_cents, message) |
| 8.3 | Auto-award to lowest qualified bid | Business logic | Best bid = lowest rate + trucker rating ≥ 4.0 |
| 8.4 | Bid history and transparency | API endpoint | `GET /api/v1/loads/{id}/bids` shows all bids (shipper view only) |
| 8.5 | Bid appeal and extension | API endpoint | Shipper can extend bid period; trucker can appeal rejection |
| 8.6 | Bid persistence (VARCHAR(36) IDs) | Data model | `load_bids` table (id, load_id, trucker_id, bid_amount_cents, all VARCHAR(36)) |

---

## Phase 9 — Admin & Operations

**Status:** ⚪ PLANNED (0% implementation, depends on Phase 5)

| REQ ID | Feature | Type | Implementation |
|--------|---------|------|-----------------|
| 9.1 | Admin dashboard (user management, reporting) | UI/API | ADMIN-only role; view all tenants, users, disputes |
| 9.2 | Audit log with immutable trail | Data model | Append-only `audit_log` (action, user_id, tenant_id, resource_id, old_value, new_value, TIMESTAMPTZ) |
| 9.3 | Dispute resolution tools | API endpoint | `PATCH /api/v1/admin/disputes/{id}/resolve` with resolution type (FULL_PAYOUT, PARTIAL_REFUND, FULL_REFUND) |
| 9.4 | Compliance reporting (FMCSA, tax) | API endpoint | Exportable reports on carrier compliance status, settlement audit trail |
| 9.5 | Rate benchmarking tool | API endpoint | `GET /api/v1/admin/benchmarks?region=IL&equipment=FLATBED` shows average rates by region/equipment |
| 9.6 | Carrier scorecard (detailed metrics per trucker) | API endpoint | `GET /api/v1/admin/carriers/{id}/scorecard` includes delivery rate, rating, compliance score |
| 9.7 | Platform health metrics | API endpoint | `GET /api/v1/admin/metrics` (active loads, avg claim time, settlement volume, platform revenue) |
| 9.8 | Tenant-level financial reporting | API endpoint | `GET /api/v1/admin/tenants/{id}/financials` (commission revenue, settlement volume, dispute rate) |
| 9.9 | Admin can override tenant commission rates | API endpoint | `POST /api/v1/admin/tenants/{id}/commission-override` with approval audit trail |
| 9.10 | Bulk user management (suspend, ban, reactivate) | API endpoint | `PATCH /api/v1/admin/users/{id}/status` with reason and audit trail |

---

## Cross-Phase Dependencies

```
Phase 1 (DONE)
  ↓
Phase 1.1 (DONE)
  ↓
Phase 1.2 (DONE)
  ↓
Phase 2 (DONE)
  ↓
Phase 3 (PARTIAL: 60%)
  ↓
Phase 4 (PARTIAL: 50%)
  ↓
Phase 5 (PENDING: US-501 READY_FOR_DESIGN) ← CRITICAL PATH
  ↓
Phase 7 (PLANNED: 0%) ← Depends on Phase 4
Phase 7A (PLANNED: 0%)
Phase 7b (PLANNED: 0%) ← Depends on Phase 5
  ↓
Phase 8 (PLANNED: 0%) ← Depends on Phase 5
  ↓
Phase 9 (PLANNED: 0%) ← Depends on Phase 5
```

**Critical Path:** Phase 5 must complete before Phase 7b, 8, 9 can start.

---

## Enforcement Checklist

Every REQ must satisfy:
- ✅ Explicit `VARCHAR(36)` for all IDs (not auto-increment, not VARCHAR(255))
- ✅ Explicit `tenant_id VARCHAR(36)` on every table
- ✅ RLS policy: `USING (tenant_id = current_setting('app.current_tenant')::uuid)`
- ✅ Soft-delete: `deleted_at TIMESTAMPTZ` on core entities
- ✅ Immutability: core financial/audit records have no UPDATE after INSERT
- ✅ Audit trail: all changes logged with timestamp and user context
- ✅ Cross-reference: every implementation links to REQ-xxx and US-xxx

---

**Document Status:** ✅ COMPLETE  
**Spec Version:** 1.0  
**Next Review:** Post-Phase 5 architecture approval
