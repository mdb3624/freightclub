# INF-001: Flyway Migration Idempotency Design

**Story:** INF-001 — Wrap 20 Flyway Migrations in DO/IF Idempotency Blocks  
**Designed By:** Architect  
**Date:** 2026-05-22

---

## Overview

Wrap all Flyway migrations in PL/pgSQL DO blocks with exception handling to ensure idempotency. Allows safe retry of migrations after partial failures (network timeout, out-of-memory, constraint violation).

**Why:** Current 20 non-idempotent migrations fail on retry with "already exists" errors, blocking redeployment.

---

## Idempotency Pattern

### Template: DO Block with Exception Handling

```sql
DO $$ BEGIN
  -- Your migration SQL here
  CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
EXCEPTION WHEN duplicate_table THEN
  NULL; -- Table already exists, idempotent
END $$;
```

---

## Exception Handling by Operation

| Operation | Exception Type | Handling |
|---|---|---|
| CREATE TABLE | duplicate_table | `EXCEPTION WHEN duplicate_table THEN NULL;` |
| CREATE INDEX | duplicate_object | `EXCEPTION WHEN duplicate_object THEN NULL;` |
| ALTER TABLE ADD COLUMN | duplicate_column | `EXCEPTION WHEN duplicate_column THEN NULL;` |
| ALTER TABLE ADD CONSTRAINT | duplicate_object | `EXCEPTION WHEN duplicate_object THEN NULL;` |
| INSERT (unique values) | unique_violation | Use UPSERT or IF NOT EXISTS check |
| DROP TABLE (if exists) | undefined_object | Use `IF EXISTS` clause, not exception |

---

## Common Patterns

### Pattern 1: CREATE TABLE Idempotent

```sql
DO $$ BEGIN
  CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
```

### Pattern 2: CREATE INDEX Idempotent

```sql
DO $$ BEGIN
  CREATE INDEX idx_users_tenant_id ON users(tenant_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
```

### Pattern 3: ALTER TABLE ADD COLUMN Idempotent

```sql
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;
```

### Pattern 4: INSERT with IF NOT EXISTS

```sql
DO $$ BEGIN
  INSERT INTO roles (id, name)
  SELECT 'role-shipper', 'Shipper'
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-shipper');
  
  INSERT INTO roles (id, name)
  SELECT 'role-carrier', 'Carrier'
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-carrier');
EXCEPTION WHEN unique_violation THEN
  NULL; -- Row already exists, idempotent
END $$;
```

### Pattern 5: ADD CONSTRAINT Idempotent

```sql
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT fk_users_tenant_id 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
```

---

## Migration Identification

**Target:** All V202604* and V202605* migrations lacking idempotency guards.

**Scan command:**
```bash
grep -L "DO \$\$" db/migration/V*.sql | grep -E "V202604|V202605" | wc -l
```

**Expected result:** ~20 files match (to be wrapped).

---

## Refactoring Process (Per Migration)

1. **Identify migration type** (CREATE TABLE, CREATE INDEX, INSERT, ALTER)
2. **Choose exception type** from table above
3. **Wrap in DO block** with appropriate `EXCEPTION WHEN`
4. **Test:** Run migration twice on schema → both succeed
5. **Verify Flyway history:** `SELECT version, success FROM flyway_schema_history` → version shows exactly once

---

## Testing Strategy

### Test 1: Idempotency (Run Twice)

```bash
# Fresh schema: import baseline (before V20260422_*)
psql -U neondb_owner freightclub < baseline.sql

# Run migration
psql -U neondb_owner freightclub < db/migration/V20260422_01__CreateTenants.sql

# Run again (should succeed, not fail)
psql -U neondb_owner freightclub < db/migration/V20260422_01__CreateTenants.sql

# Verify: check flyway_schema_history
SELECT version, installed_by, success FROM flyway_schema_history 
WHERE version = '20260422'
ORDER BY installed_by DESC;
# Expected: One row, success=true
```

### Test 2: Partial Failure Recovery

```bash
# Simulate: create table, interrupt before constraint
psql -U neondb_owner freightclub -c "CREATE TABLE test_recovery (id UUID PRIMARY KEY);" &
sleep 0.5
kill %1  # Interrupt

# Retry: should complete without "already exists" error
psql -U neondb_owner freightclub < db/migration/V20260422_01__CreateTenants.sql
# Expected: success
```

### Test 3: Flyway History Consistency

```sql
-- After wrapping all 20 migrations and running full suite:
SELECT version, installed_by, success, installed_on 
FROM flyway_schema_history 
WHERE version BETWEEN '20260401' AND '20260531'
ORDER BY version ASC;

-- Verify:
-- - Each version appears exactly once
-- - All success=true
-- - No NULL values in installed_on
```

---

## Scope

**In Scope:**
- 20 non-idempotent migrations in db/migration/
- Wrap each in PL/pgSQL DO block with appropriate exception handling
- No schema changes (columns, constraints unchanged)
- Idempotency testing (run twice, both succeed)

**Out of Scope:**
- Rollback migrations (Flyway doesn't support; not needed for idempotency)
- Rewriting migration logic (only add exception handling)
- Modifying checksums (migrations remain unchanged, checksums stable)

---

## Deployment Impact

**Zero breaking changes:**
- Existing Flyway history preserved (version numbers unchanged)
- Checksums stable (code unchanged, only wrapped)
- Safe to re-run on partial-failure schemas
- No schema-level changes

---

## Definition of Done (Architect Sign-Off)

- [ ] 20 affected migrations identified
- [ ] Exception handling pattern defined (5 common scenarios)
- [ ] DO block template documented
- [ ] Refactoring process (5 steps) defined
- [ ] Testing strategy (3 test scenarios) documented
- [ ] Flyway history verification queries provided
- [ ] Deployment impact assessment (zero breaking changes)
- [ ] Ready for Coder: wrap migrations, test idempotency

---

**Architect Approval:** READY FOR CODER  
**Next Phase:** Coder wraps 20 migrations in DO blocks and tests idempotency
