# Flyway Migration Checklist

Before committing any migration file, verify:

## Schema & Tables
- [ ] Table names use snake_case
- [ ] All tables have `id VARCHAR(36) PRIMARY KEY`
- [ ] Multi-tenant tables have `tenant_id VARCHAR(36) NOT NULL`
- [ ] All timestamps use `TIMESTAMPTZ` (not TIMESTAMP)
- [ ] All core entities have `deleted_at TIMESTAMPTZ` (soft deletes)
- [ ] Schema is explicitly set: `CREATE TABLE freightclub.table_name`
- [ ] **IDEMPOTENCY**: All DDL wrapped in PL/pgSQL `DO $$BEGIN ... IF NOT EXISTS ... END $$;` block

## Foreign Keys
- [ ] **CRITICAL**: Target column has a UNIQUE or PRIMARY KEY constraint
- [ ] For tenant references: use `REFERENCES freightclub.tenants(id)`, NOT `users(tenant_id)`
- [ ] For user references: use `REFERENCES freightclub.users(id)` (users.id is PK, unique)
- [ ] All FK references include schema name: `REFERENCES freightclub.table_name(column)`

## Row-Level Security (RLS)
- [ ] `ALTER TABLE freightclub.table_name ENABLE ROW LEVEL SECURITY`
- [ ] RLS policy exists and filters by `tenant_id = current_setting('app.current_tenant_id')`
- [ ] RLS policy includes `AND deleted_at IS NULL` for soft-deleted rows
- [ ] Grant permissions: `GRANT SELECT, INSERT, UPDATE ON table_name TO freightclub_runtime`

## Indexes
- [ ] Composite index exists for `(tenant_id, deleted_at)` on multi-tenant tables
- [ ] Performance-critical columns are indexed
- [ ] Foreign key columns are indexed

## Testing
- [ ] Run `mvn clean test` locally with Docker PostgreSQL running
- [ ] All 328 backend tests must pass (integration tests included)
- [ ] No Spring context initialization errors
- [ ] No Flyway constraint violations

## Common Mistakes to Avoid
- ❌ `REFERENCES users(tenant_id)` — not unique, will fail at migration time
- ❌ Using TIMESTAMP instead of TIMESTAMPTZ — timezone issues
- ❌ Forgetting schema prefix: `REFERENCES table_name` instead of `REFERENCES freightclub.table_name`
- ❌ RLS policy without `deleted_at IS NULL` — returns soft-deleted rows
- ❌ Not granting permissions to `freightclub_runtime` role
- ❌ Creating tables outside the `freightclub` schema
- ❌ **BARE DDL**: `ALTER TABLE ADD COLUMN` or `CREATE TABLE` without IF NOT EXISTS — fails on partial state from previous failed run, breaks all 100+ tests via Spring context error

## Idempotent Migration Templates

**For ALTER TABLE ADD COLUMN:**
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'fuel_cost_per_gallon') THEN
    ALTER TABLE freightclub.users ADD COLUMN fuel_cost_per_gallon NUMERIC(6, 3) NULL;
  END IF;
END $$;
```

**For CREATE TABLE:**
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'freightclub' AND table_name = 'new_table') THEN
    CREATE TABLE freightclub.new_table (id UUID PRIMARY KEY, ...);
  END IF;
END $$;
```

**For CREATE INDEX:**
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'freightclub' AND indexname = 'idx_name') THEN
    CREATE INDEX idx_name ON freightclub.table_name (column);
  END IF;
END $$;
```

## Validation Script
```bash
# Before pushing, run locally:
cd backend
docker run -d --name test-db -e POSTGRES_PASSWORD=test -p 5432:5432 postgres:15-alpine
sleep 5
mvn clean test
docker stop test-db && docker rm test-db
```

If all tests pass, migration is safe to commit.
