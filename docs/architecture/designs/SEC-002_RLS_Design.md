# SEC-002: PostgreSQL RLS Policies Design

**Story:** SEC-002 — Create PostgreSQL RLS Policies for 5 Tables  
**Designed By:** Architect  
**Date:** 2026-05-22

---

## Overview

Enforce tenant isolation at the database level using PostgreSQL Row-Level Security (RLS). Every table's SELECT, INSERT, UPDATE, DELETE operations filtered by `tenant_id = CURRENT_SETTING('app.current_tenant_id')`.

**Why:** If app-layer filtering is bypassed (SQL injection, misconfiguration), database-level RLS blocks cross-tenant access.

---

## Affected Tables

| Table | Phase | Role | Current Enforcement |
|---|---|---|---|
| message_outbox | Phase 6 | Messages | App-layer only |
| shipper_profiles | Phase 7 | Carrier Mgmt | App-layer only |
| payment_accounts | Phase 5 | Payments | App-layer only |
| load_recommendations | Phase 7 | Carrier Mgmt | App-layer only |
| carrier_cost_profiles | Phase 7 | Carrier Mgmt | App-layer only |

---

## RLS Policy Pattern

### Enable RLS on Table

```sql
ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;
```

### SELECT Policy (Read Protection)

```sql
CREATE POLICY tenant_isolation_select ON message_outbox
FOR SELECT
USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
```

### INSERT/UPDATE/DELETE Policy (Write Protection)

```sql
CREATE POLICY tenant_isolation_write ON message_outbox
FOR INSERT
WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_update ON message_outbox
FOR UPDATE
USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID)
WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_delete ON message_outbox
FOR DELETE
USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
```

---

## Multi-Tenancy Enforcement

```
Application Request
    ↓
JPA/Hibernate Interceptor
    ↓
TenantContextHolder.setTenantId(uuid)
    ↓
PostgreSQL set_config('app.current_tenant_id', uuid, false)
    ↓
SELECT/INSERT/UPDATE/DELETE
    ↓
RLS Policy: CURRENT_SETTING('app.current_tenant_id')
    ↓
Rows filtered by tenant_id match
```

---

## SQL Schema Changes

**No new columns required** — `tenant_id UUID` already present on all 5 tables (verified in migrations).

**No new indexes required** — Composite indexes on `(tenant_id, deleted_at)` already exist.

---

## Flyway Migration Structure

**File:** `V20260522_HHMM__CreateRLSPolicies_5Tables.sql`

**Idempotency pattern:**

```sql
DO $$ BEGIN
  -- Table 1: message_outbox
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'message_outbox' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    -- Table doesn't exist yet; skip
  ELSE
    -- Enable RLS if not already enabled
    ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;
    
    -- Create policies (IF NOT EXISTS on policies)
    CREATE POLICY tenant_isolation_select ON message_outbox
    FOR SELECT USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
    -- ... additional policies
  END IF;
  -- ... repeat for shipper_profiles, payment_accounts, load_recommendations, carrier_cost_profiles
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Policy already exists, idempotent, continue
END $$;
```

---

## Testing Strategy

### Test 1: Cross-Tenant SELECT Blocked

```
Setup: Message owned by Tenant A (id=tenant-a)
Act: Query as Tenant B (set_config('app.current_tenant_id', 'tenant-b'))
Expected: SELECT returns 0 rows (RLS filters)
```

### Test 2: Cross-Tenant INSERT Blocked

```
Setup: Prepare INSERT row for Tenant B
Act: Try INSERT as Tenant A (set_config to 'tenant-a')
Expected: INSERT fails with RLS violation (0 rows affected)
```

### Test 3: Cross-Tenant UPDATE Blocked

```
Setup: Profile owned by Tenant A
Act: Try UPDATE as Tenant B (set_config to 'tenant-b')
Expected: UPDATE fails (0 rows affected)
```

### Test 4: Cross-Tenant DELETE Blocked

```
Setup: Cost profile owned by Tenant A
Act: Try DELETE as Tenant B (set_config to 'tenant-b')
Expected: DELETE fails (0 rows affected)
```

---

## Deployment Sequence

1. **Flyway migration runs** (V20260522_*)
   - Enables RLS on 5 tables
   - Creates SELECT policy
   - Creates INSERT/UPDATE/DELETE policies
   - Idempotent (run multiple times safely)

2. **App-layer filtering MUST remain** (defense in depth)
   - RLS is a safety net, not a replacement
   - All queries still include `WHERE tenant_id = ?` in code
   - No app-layer filtering removal

3. **Integration tests verify**
   - Cross-tenant operations blocked
   - Same-tenant operations allowed

---

## Scope

**In Scope:**
- RLS on 5 specified tables
- SELECT, INSERT, UPDATE, DELETE policies
- Idempotent Flyway migration
- Integration tests (2-3 hours)

**Out of Scope:**
- Removing app-layer filtering
- Modifying table schema (tenant_id already present)
- Retroactive RLS on older tables (e.g., loads, users) — separate story if needed
- Dynamic policy rules (all policies static)

---

## Definition of Done (Architect Sign-Off)

- [ ] 5 affected tables identified and documented
- [ ] RLS policy SQL pattern defined (SELECT, INSERT, UPDATE, DELETE)
- [ ] Flyway migration pattern (DO block, IF NOT EXISTS, exception handling) specified
- [ ] Multi-tenancy enforcement flow documented
- [ ] 4 test scenarios defined (SELECT, INSERT, UPDATE, DELETE blocked)
- [ ] Deployment sequence documented
- [ ] Ready for Coder: write integration tests first, then migration

---

**Architect Approval:** READY FOR CODER  
**Next Phase:** Coder writes integration tests verifying RLS blocks cross-tenant operations
