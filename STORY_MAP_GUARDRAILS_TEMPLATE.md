# Story Map: Technical Guardrails Update Template

**Purpose:** Template for adding Technical Guardrails section to every story in Phase 3–7b

**Instructions:**
1. Copy the section below for each story
2. Fill in story-specific values (endpoint URLs, cache keys, domain events)
3. Add to the STORY_MAP.md after the story description

---

## Template: Technical Guardrails (NFR-504, RLS, No-Lombok)

### For Phase 3 Stories (Document Management)

```markdown
## Technical Guardrails (NFR-504, RLS, No-Lombok)

### Caching (NFR-504)
- **GET Endpoints:** 
  - `GET /api/v1/documents/{loadId}` → Cache Key: `{tenantId}:documents:load:{loadId}` → TTL: 5 minutes
  - `GET /api/v1/documents/file/{documentId}` → Cache Key: `{tenantId}:documents:file:{documentId}` → TTL: 15 minutes
  - `GET /api/v1/documents/{loadId}/export` → Cache Key: `{tenantId}:documents:pdf:{loadId}` → TTL: 2 minutes
  
- **Cache Invalidation Events:**
  - `DocumentUploaded` → Evict `{tenantId}:documents:load:{loadId}`, `{tenantId}:documents:pdf:{loadId}`
  - `DocumentDeleted` → Evict `{tenantId}:documents:load:{loadId}`, `{tenantId}:documents:file:{documentId}`
  - `LoadStatusChanged` → Evict `{tenantId}:documents:load:{loadId}`

- **Tenant Isolation:** All cache keys include `TenantContextHolder.getTenantId()`
- **Stale Data Prevention:** Cache invalidated immediately on POST/PUT/DELETE via `@CacheEvict`

### Security (RLS & VARCHAR(36))
- **RLS Enabled:** `documents`, `document_audit_logs` tables have PostgreSQL RLS policies
- **Implicit Tenancy:** All queries use `TenantContextHolder.getTenantId()` (no manual WHERE clause)
- **Primary Keys:** All IDs are `VARCHAR(36)` (UUID format)
- **Soft Deletes:** `documents` table includes `deleted_at TIMESTAMPTZ` column

### Purity (No-Lombok, Java 21)
- **No Lombok:** Document entity uses manual POJO/Record with explicit getters/setters
- **Java 21 Features:** DocumentDTO uses sealed class (optional)
- **Cyclomatic Complexity:** No method exceeds complexity score of 10 (verified via SonarQube)
```

---

### For Phase 4 Stories (Ratings & Reviews)

```markdown
## Technical Guardrails (NFR-504, RLS, No-Lombok)

### Caching (NFR-504)
- **GET Endpoints:** 
  - `GET /api/v1/ratings/{userId}` → Cache Key: `{tenantId}:ratings:{userId}` → TTL: 1 hour
  - `GET /api/v1/shipper-reputation/{shipperId}` → Cache Key: `{tenantId}:reputation:shipper:{shipperId}` → TTL: 2 hours
  - `GET /api/v1/rating-history?userId={id}` → Cache Key: `{tenantId}:rating-history:{userId}` → TTL: 30 minutes

- **Cache Invalidation Events:**
  - `RatingCreated` → Evict `{tenantId}:ratings:*`, `{tenantId}:reputation:shipper:{shipperId}`
  - `RatingUpdated` → Evict `{tenantId}:ratings:{userId}`, `{tenantId}:reputation:shipper:{shipperId}`
  - `RatingDeleted` → Evict `{tenantId}:ratings:*`, `{tenantId}:reputation:shipper:{shipperId}`
  - `ReputationRecalculated` → Evict `{tenantId}:reputation:shipper:*`, `{tenantId}:loads:*:shipper-badge`

- **Tenant Isolation:** All cache keys include `TenantContextHolder.getTenantId()`
- **Stale Data Prevention:** Cache invalidated immediately via `@CacheEvict` on `RatingService` mutations

### Security (RLS & VARCHAR(36))
- **RLS Enabled:** `ratings` table has PostgreSQL RLS policies
- **Implicit Tenancy:** All queries use `TenantContextHolder.getTenantId()`
- **Primary Keys:** All IDs are `VARCHAR(36)` (UUID format)
- **Soft Deletes:** `ratings` table includes `deleted_at TIMESTAMPTZ` column

### Purity (No-Lombok, Java 21)
- **No Lombok:** Rating entity uses manual POJO/Record
- **Java 21 Features:** RatingDTO uses sealed class (optional)
- **Cyclomatic Complexity:** No method exceeds score of 10
```

---

### For Phase 5 Stories (Payments & Invoicing)

```markdown
## Technical Guardrails (NFR-504, RLS, No-Lombok)

### Caching (NFR-504)
- **GET Endpoints:** 
  - `GET /api/v1/invoices/{invoiceId}` → Cache Key: `{tenantId}:invoice:{invoiceId}` → TTL: 1 hour
  - `GET /api/v1/payment-history?userId={id}` → Cache Key: `{tenantId}:payment-history:{userId}` → TTL: 30 minutes
  - `GET /api/v1/receipts/{transactionId}` → Cache Key: `{tenantId}:receipt:{transactionId}` → TTL: 24 hours (immutable)
  - `GET /api/v1/settlements` → Cache Key: `{tenantId}:settlements:all` → TTL: 15 minutes

- **Cache Invalidation Events:**
  - `InvoiceGenerated` → Evict `{tenantId}:invoice:{invoiceId}`, `{tenantId}:payment-history:{userId}`
  - `PaymentProcessed` → Evict `{tenantId}:payment-history:*`, `{tenantId}:settlements:all`
  - `ReceiptGenerated` → Evict receipt cache (after 24-hr TTL expiry)
  - `SettlementCreated` / `SettlementDisputed` → Evict `{tenantId}:settlements:all`

- **Tenant Isolation:** All cache keys include `TenantContextHolder.getTenantId()`
- **Stale Data Prevention:** Cache invalidated via webhook handlers on external payment events

### Security (RLS & VARCHAR(36))
- **RLS Enabled:** `invoices`, `payments`, `receipts`, `settlements` tables have RLS policies
- **Implicit Tenancy:** All queries use `TenantContextHolder.getTenantId()`
- **Primary Keys:** All IDs are `VARCHAR(36)` (UUID format)
- **Soft Deletes:** All core tables include `deleted_at TIMESTAMPTZ` column

### Purity (No-Lombok, Java 21)
- **No Lombok:** Payment entities use manual POJOs/Records
- **Java 21 Features:** PaymentDTO uses sealed class (optional)
- **Cyclomatic Complexity:** No method exceeds score of 10
```

---

### For Phase 6 Stories (In-App Messaging)

```markdown
## Technical Guardrails (NFR-504, RLS, No-Lombok)

### Caching (NFR-504)
- **GET Endpoints:** 
  - `GET /api/v1/messages/load/{loadId}` → Cache Key: `{tenantId}:messages:load:{loadId}` → TTL: 1 minute (real-time)
  - `GET /api/v1/messages/{threadId}` → Cache Key: `{tenantId}:messages:thread:{threadId}` → TTL: 1 minute (real-time)
  - `GET /api/v1/messages/unread-count` → Cache Key: `{tenantId}:messages:unread-count` → TTL: 10 seconds (real-time)

- **Cache Invalidation Events:**
  - `MessagePosted` → Evict `{tenantId}:messages:load:{loadId}`, `{tenantId}:messages:unread-count` (real-time via WebSocket/SSE)
  - `MessageDeleted` → Evict `{tenantId}:messages:load:{loadId}` (real-time)
  - `MessageRead` → Evict `{tenantId}:messages:unread-count` (real-time)

- **Tenant Isolation:** All cache keys include `TenantContextHolder.getTenantId()`
- **Stale Data Prevention:** Cache invalidated in real-time via message broker (RabbitMQ/Kafka/CloudEvents)

### Security (RLS & VARCHAR(36))
- **RLS Enabled:** `messages`, `message_threads` tables have RLS policies
- **Implicit Tenancy:** All queries use `TenantContextHolder.getTenantId()`
- **Primary Keys:** All IDs are `VARCHAR(36)` (UUID format)
- **Soft Deletes:** `messages` table includes `deleted_at TIMESTAMPTZ` column

### Purity (No-Lombok, Java 21)
- **No Lombok:** Message entity uses manual POJO/Record
- **Java 21 Features:** MessageDTO uses sealed class (optional)
- **Cyclomatic Complexity:** No method exceeds score of 10
```

---

### For Phase 7 Stories (Carrier Management)

**Reference:** 700SERIES_MANDATORY_ADDENDUM.md (required section; extended template below)

```markdown
## API Caching & Cache Invalidation (NFR-504)

### GET Endpoints (Cached)

| Endpoint | Cache Key Template | TTL | Rationale |
|----------|-------------------|-----|-----------|
| `GET /api/v1/carriers/{id}` | `{tenantId}:carrier:{id}` | 1 hour | Carrier profile changes rarely; immutable after creation |
| `GET /api/v1/carriers/{id}/lanes` | `{tenantId}:carrier:{id}:lanes` | 30 minutes | Lanes can be updated; moderate TTL |
| `GET /api/v1/carriers/{id}/availability` | `{tenantId}:carrier:{id}:availability` | 5 minutes | Availability changes frequently |

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope |
|----------|------------------|-------|
| `POST /api/v1/carriers` | Evict `{tenantId}:carriers:all`, board recommendations | All carrier-related caches |
| `PUT /api/v1/carriers/{id}` | Evict `{tenantId}:carrier:{id}`, lanes, availability, board | Entity + dependent lists |
| `DELETE /api/v1/carriers/{id}` | Evict all carrier-related caches | All affected collections |

### Tenant Isolation

✅ **Verified:** Cache key template includes `TenantContextHolder.getTenantId()`

```
{tenantId}:carrier:carrier-123 ✅ CORRECT
carrier:carrier-123 ❌ WRONG (no tenant isolation)
```

### Testing Requirements

- [ ] Unit test: GET returns cached data on repeated calls
- [ ] Unit test: Cache evicted after POST/PUT/DELETE
- [ ] Integration test: Multi-tenant cache isolation (Tenant A cannot read Tenant B cache)
- [ ] Performance test: Cache hit ratio > 50%
```

---

### For Phase 7b Stories (Financial Intelligence)

```markdown
## API Caching & Cache Invalidation (NFR-504)

### GET Endpoints (Cached)

| Endpoint | Cache Key Template | TTL | Rationale |
|----------|-------------------|-----|-----------|
| `GET /api/v1/earnings/{loadId}` | `{tenantId}:earnings:{loadId}` | 1 hour | Earnings immutable after settlement |
| `GET /api/v1/reports/pnl?month=2026-04` | `{tenantId}:pnl:2026-04` | 6 hours | Monthly P&L report changes daily |
| `GET /api/v1/compliance/ifta-mileage` | `{tenantId}:ifta-mileage` | 24 hours | IFTA report rarely changes; long TTL |
| `GET /api/v1/mileage/deadhead-estimate` | `{tenantId}:deadhead-estimate` | 1 hour | Location-based; moderate TTL |

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope |
|----------|------------------|-------|
| `POST /api/v1/loads/{id}/claim` | Evict earnings, P&L, IFTA reports | All financial report caches |
| `PUT /api/v1/loads/{id}/deliver` | Evict earnings, IFTA mileage, P&L | Report + compliance caches |
| Settlement webhook from payment processor | Evict earnings, P&L, settlements | All financial caches |

### Dependencies

✅ **Phase 3 POD Upload (3.5):** Required for IFTA mileage calculation  
✅ **Phase 3 Document Audit Log (3.8):** Required for tax compliance audit trail  
✅ **Phase 5 Payments:** Required for settlement + earnings data

### Tenant Isolation

✅ **Verified:** Cache key template includes `TenantContextHolder.getTenantId()`

### Testing Requirements

- [ ] Unit test: GET returns cached financial data
- [ ] Unit test: Cache evicted after load delivery/settlement
- [ ] Integration test: Multi-tenant financial data isolation
- [ ] Compliance test: IFTA mileage report includes all deliveries
```

---

## How to Apply This Template

### Step 1: Update Story Map

For each story in Phase 3–7b, add the Technical Guardrails section AFTER the story description.

**Example (Phase 3 story):**

```markdown
| US-xxx | Document Upload & Storage | IN_PROGRESS | 3 | US-101 |

## Technical Guardrails (NFR-504, RLS, No-Lombok)
[Use Phase 3 template above]
```

### Step 2: Verify Compliance

- ✅ Caching section complete with endpoint URLs, cache keys, TTLs
- ✅ Invalidation events mapped to domain events
- ✅ Tenant isolation verified
- ✅ RLS policies documented
- ✅ No-Lombok compliance verified

### Step 3: Submit for Review

- Code review gate: REVIEWER.md validates caching implementation
- Architecture review gate: 700SERIES_MANDATORY_ADDENDUM validated
- Test gate: Cache isolation + invalidation tests included

---

## Summary of Changes

| Phase | Action | Template | Status |
|-------|--------|----------|--------|
| 3 | Add Technical Guardrails to all document-related stories | Phase 3 template | Ready |
| 4 | Add Technical Guardrails to all rating-related stories | Phase 4 template | Ready |
| 5 | Add Technical Guardrails to all payment-related stories | Phase 5 template | Ready (PENDING implementation) |
| 6 | Add Technical Guardrails to all messaging-related stories | Phase 6 template | Ready (PENDING implementation) |
| 7 | Add API Caching section to all 700-series designs | Phase 7 template | 700SERIES_MANDATORY_ADDENDUM |
| 7b | Add API Caching section to all financial intelligence designs | Phase 7b template | Mandatory |

---

**Status:** ✅ **TEMPLATE COMPLETE — READY FOR STORY MAP UPDATE**
