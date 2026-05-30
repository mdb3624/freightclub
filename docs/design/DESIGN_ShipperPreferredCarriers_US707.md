# ARCHITECT Design: US-707 — Shipper Preferred Carrier List

**Story:** US-707  
**Phase:** 7  
**Status:** ARCHITECT_APPROVED  
**Created:** 2026-05-29  

---

## Database Schema

### shipper_preferred_carriers Table

```sql
CREATE TABLE IF NOT EXISTS shipper_preferred_carriers (
  id VARCHAR(36) PRIMARY KEY,
  shipper_id VARCHAR(36) NOT NULL,
  carrier_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  UNIQUE (shipper_id, carrier_id, tenant_id) WHERE deleted_at IS NULL,
  FOREIGN KEY (shipper_id) REFERENCES users(id),
  FOREIGN KEY (carrier_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_shipper_preferred_carriers_shipper ON shipper_preferred_carriers(shipper_id, deleted_at);
CREATE INDEX idx_shipper_preferred_carriers_tenant ON shipper_preferred_carriers(tenant_id, deleted_at);

ENABLE ROW LEVEL SECURITY ON shipper_preferred_carriers;

-- RLS Policy: Shippers can only see their own preferred carriers
CREATE POLICY rls_shipper_preferred_carriers_isolation ON shipper_preferred_carriers
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
```

---

## Domain Model

### ShipperPreferredCarrier Entity

```
ShipperPreferredCarrier (Aggregate Root)
├── id: UUID (PK)
├── shipperId: UUID (FK to User)
├── carrierId: UUID (FK to User)
├── tenantId: UUID (FK to Tenant)
├── notes: Optional[String] (max 500 chars)
├── createdAt: OffsetDateTime
└── deletedAt: Optional[OffsetDateTime] (soft delete)

Invariants:
- shipperId ≠ carrierId (cannot prefer self)
- Only one active entry per shipper-carrier-tenant triple
- notes length ≤ 500 characters
- createdAt ≤ now()
```

---

## API Contracts

### POST /api/v1/shippers/preferred-carriers

**Request:**
```json
{
  "carrierId": "uuid",
  "notes": "Negotiated 10% discount"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "carrierId": "uuid",
  "carrierName": "string",
  "notes": "string",
  "createdAt": "2026-05-29T10:00:00Z"
}
```

**Errors:**
- 400: carrierId missing or invalid format
- 404: Carrier not found
- 409: Already preferred (UNIQUE constraint)
- 401: Unauthorized (not shipper role)

---

### GET /api/v1/shippers/preferred-carriers

**Query Parameters:**
- `page`: int (default 1)
- `limit`: int (default 20, max 100)
- `sort`: string (default: "createdAt:DESC")

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "carrierId": "uuid",
      "carrierName": "string",
      "carrierEmail": "string",
      "notes": "string",
      "createdAt": "2026-05-29T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### DELETE /api/v1/shippers/preferred-carriers/{carrierId}

**Response (204 No Content)**

**Errors:**
- 404: Preferred carrier not found
- 401: Unauthorized

---

### GET /api/v1/shippers/preferred-carriers/count

**Response (200 OK):**
```json
{
  "count": 12
}
```

---

## Caching Strategy

### Cache Configuration
- **Cache Name:** `preferredCarriers`
- **TTL:** 1 hour
- **Key Pattern:** `preferredCarriers:{shipperId}:{tenantId}`
- **Eviction:** On add/remove

### Implementation
- Use Spring `@Cacheable("preferredCarriers")` on list method
- Use Spring `@CacheEvict("preferredCarriers")` on add/remove methods
- Configure `CacheConfig` to register cache name

---

## Multi-Tenancy & RLS

### Tenant Isolation
1. All queries filter by `TenantContextHolder.getTenantId()`
2. Service layer enforces tenant context before DB access
3. RLS policy blocks cross-tenant access at DB level
4. Cache key includes tenantId to prevent leakage

### Implementation Pattern
```
1. Get tenant from TenantContextHolder
2. Validate shipper belongs to tenant
3. Execute query with tenant_id filter
4. RLS policy provides defense-in-depth
```

---

## Validation Rules

### ShipperPreferredCarrier Constraints
- `carrierId` must be valid UUID format
- `carrierId` must exist in users table (FK)
- `carrierId` ≠ `shipperId` (no self-preference)
- `notes` max 500 characters
- Only one active entry per (shipper, carrier, tenant)

---

## Soft Delete Behavior

### Deletion Logic
- Never physically delete from DB
- On remove request: `UPDATE shipper_preferred_carriers SET deleted_at = NOW() WHERE ...`
- All queries include implicit `WHERE deleted_at IS NULL`
- Allows auditing and recovery

---

## Transaction Boundaries

### Add Carrier (Atomic)
```
BEGIN TRANSACTION
  INSERT INTO shipper_preferred_carriers (...)
  EVICT CACHE[preferredCarriers:{shipperId}:{tenantId}]
COMMIT
```

### Remove Carrier (Atomic)
```
BEGIN TRANSACTION
  UPDATE shipper_preferred_carriers SET deleted_at = NOW() WHERE ...
  EVICT CACHE[preferredCarriers:{shipperId}:{tenantId}]
COMMIT
```

---

## Test Strategy

### Unit Tests (Service Layer)
- Add carrier: success, duplicate prevention, invalid carrier ID
- List carriers: pagination, sorting, empty list
- Remove carrier: success, idempotency, not found
- Cache behavior: hits, misses, eviction

### Integration Tests
- Multi-tenant isolation: shipper A cannot see shipper B's carriers
- RLS enforcement at DB level
- Soft delete behavior: deleted entries not returned
- Concurrent modifications: race condition handling

### Coverage Target
**JaCoCo Branch Coverage ≥80%**

---

## Design Decisions

### Why UUID for IDs?
- Global uniqueness across systems
- Supports distributed deployments
- No collision risk

### Why Soft Delete?
- Enables audit trail
- Allows recovery if needed
- Maintains referential integrity

### Why Cache 1 Hour?
- Preferred carrier list changes infrequently
- Reduces DB load significantly
- 1 hour is safe window for eventual consistency

### Why RLS + Service-Layer Filter?
- Defense-in-depth approach
- RLS catches bugs at DB level
- Service layer provides explicit intent

---

## Handed Off To

**Next Step:** HFD designs the UI pages for:
1. Preferred Carriers list page
2. Add Carrier form/modal
3. Confirmation dialog for removal

**HFD Inputs Needed:**
- Page layout (table vs. card view)
- Form field arrangement
- Error message styles
- Empty state design
- Loading states
