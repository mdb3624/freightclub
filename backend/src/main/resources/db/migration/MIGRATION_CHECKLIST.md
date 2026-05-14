# Flyway Migration Checklist

Before committing any migration file, verify:

## Schema & Tables
- [ ] Table names use snake_case
- [ ] All tables have `id VARCHAR(36) PRIMARY KEY`
- [ ] Multi-tenant tables have `tenant_id VARCHAR(36) NOT NULL`
- [ ] All timestamps use `TIMESTAMPTZ` (not TIMESTAMP)
- [ ] All core entities have `deleted_at TIMESTAMPTZ` (soft deletes)
- [ ] Schema is explicitly set: `CREATE TABLE freightclub.table_name`

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
