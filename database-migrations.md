# Database Migration Guide

FreightClub uses **Flyway** for all database schema changes. This document is the team's authoritative guide for how to create, name, test, and deploy database migrations.

---

## Golden Rules

1. **Never modify a committed migration.** Flyway checksums every applied file. Editing one breaks all environments.
2. **Never let Hibernate manage schema in production.** Set `spring.jpa.hibernate.ddl-auto=validate` — Flyway owns all DDL.
3. **One logical change per file.** Easier to review, debug, and revert.
4. **Always test locally before pushing.** Run the app against a local MySQL instance and confirm the migration applies cleanly.
5. **Forward-only.** There is no rollback — fix mistakes with a new migration.

---

## Setup

### Dependencies (`pom.xml`)

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

### Application Config (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/freightclub
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate        # NEVER use create/update in production
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: false  # only set true when introducing Flyway to an existing DB
    out-of-order: true          # allows team members to merge migrations in any order
    validate-on-migrate: true   # fail fast if a committed file has been modified
```

---

## File Location

All migration files live in:

```
src/main/resources/db/migration/
```

---

## Naming Convention

```
V{YYYYMMDD}_{sequence}__{description}.sql
```

| Part | Example | Notes |
|------|---------|-------|
| `V` | `V` | Required Flyway prefix |
| `{YYYYMMDD}` | `20260311` | Date the migration was written |
| `_{sequence}` | `_001` | 3-digit sequence for same-day migrations |
| `__` | `__` | Double underscore separator (required by Flyway) |
| `{description}` | `create_users_table` | Snake case, descriptive, no spaces |
| `.sql` | `.sql` | Always SQL (not Java migrations unless absolutely necessary) |

### Examples

```
V20260311_001__create_tenants_table.sql
V20260311_002__create_users_table.sql
V20260311_003__create_loads_table.sql
V20260315_001__add_equipment_type_to_loads.sql
V20260320_001__add_rating_index.sql
```

### Why date-based versioning?

Sequential integers (`V1`, `V2`) cause merge conflicts on teams — two developers both create `V5__...` on different branches. Date + sequence avoids this entirely and is naturally ordered.

---

## Writing Migrations

### Creating a table

```sql
-- V20260311_001__create_loads_table.sql

CREATE TABLE loads (
    id          CHAR(36)        NOT NULL,
    tenant_id   CHAR(36)        NOT NULL,
    shipper_id  CHAR(36)        NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'OPEN',
    origin      VARCHAR(255)    NOT NULL,
    destination VARCHAR(255)    NOT NULL,
    weight_lbs  DECIMAL(10,2)   NOT NULL,
    pay_rate    DECIMAL(10,2)   NOT NULL,
    pickup_from DATETIME        NOT NULL,
    pickup_to   DATETIME        NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  DATETIME        NULL,
    PRIMARY KEY (id),
    INDEX idx_loads_tenant_id (tenant_id),
    INDEX idx_loads_status (status),
    INDEX idx_loads_tenant_status (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Adding a column

```sql
-- V20260315_001__add_equipment_type_to_loads.sql

ALTER TABLE loads
    ADD COLUMN equipment_type VARCHAR(50) NOT NULL DEFAULT 'DRY_VAN' AFTER destination;
```

### Adding an index

```sql
-- V20260320_001__add_rating_index.sql

CREATE INDEX idx_ratings_ratee_id ON ratings (tenant_id, ratee_id);
```

### Fixing a mistake (forward fix, not rollback)

```sql
-- V20260316_001__fix_equipment_type_default.sql
-- Reason: DEFAULT should be NULL not 'DRY_VAN' — shipper must explicitly choose

ALTER TABLE loads
    ALTER COLUMN equipment_type DROP DEFAULT;

UPDATE loads SET equipment_type = NULL WHERE equipment_type = 'DRY_VAN';

ALTER TABLE loads
    MODIFY COLUMN equipment_type VARCHAR(50) NULL;
```

---

## Standards for Every Migration

- **Character set:** Always use `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` on new tables
- **Primary keys:** `CHAR(36)` UUID, not `AUTO_INCREMENT INT`
- **tenant_id:** Every tenant-scoped table must have a `tenant_id CHAR(36) NOT NULL` column with an index
- **Timestamps:** Every table gets `created_at` and `updated_at` with defaults, and `deleted_at` nullable:
  ```sql
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  ```
- **Soft deletes:** Use `deleted_at` — never hard-delete rows from production tables
- **Foreign keys:** Every FK column must have a named `CONSTRAINT fk_... FOREIGN KEY ... REFERENCES ...`. An index alone is not sufficient.
- **State/province codes:** Always `CHAR(2)` — never `VARCHAR`. Free-text state storage breaks filter queries.
- **CHECK constraints:** Add `CHECK` constraints for all columns backed by a Java enum. MySQL 8.0.16+ enforces these at the DB level:
  ```sql
  CONSTRAINT chk_tablename_column CHECK (column IN ('VALUE_A', 'VALUE_B', ...))
  ```
- **Indexes:** Add indexes for all foreign keys and any column used in `WHERE`, `ORDER BY`, or `JOIN`. For multi-column filter patterns, add composite indexes that match the query's column order.
- **Comments:** Add a brief SQL comment at the top of each file explaining what it does and why

---

## Workflow

### Everyday flow (feature branch)

```
1. Create your branch
2. Write your migration file in src/main/resources/db/migration/
3. Start the app locally — Flyway applies it automatically on startup
4. Verify the schema looks correct
5. Write your JPA entity / repository changes
6. Commit migration file alongside the code that requires it
7. Open a PR — migration is reviewed as part of the code review
8. After merge, migration runs automatically in CI and then on deploy
```

### Resolving team conflicts

If two developers write migrations on the same day with the same sequence number:

1. One developer renumbers their sequence (`_001` → `_002`)
2. `out-of-order: true` in config means Flyway applies both in version order, regardless of merge order
3. Both migrations are checksum-validated on every subsequent startup

---

## Environment Strategy

| Environment | Flyway behavior | `ddl-auto` |
|-------------|----------------|-----------|
| Local dev | Auto-migrate on startup | `validate` |
| CI | Auto-migrate against fresh Docker MySQL | `validate` |
| Staging | Auto-migrate on deploy | `validate` |
| Production | Auto-migrate on deploy | `validate` |

> **Never** use `ddl-auto=create`, `create-drop`, or `update` in any shared environment.

---

## CI Integration

Add this step to the CI pipeline before running integration tests:

```yaml
# GitHub Actions example
- name: Run Flyway migrations
  run: |
    docker run -d \
      --name mysql-test \
      -e MYSQL_ROOT_PASSWORD=root \
      -e MYSQL_DATABASE=freightclub_test \
      -p 3306:3306 \
      mysql:8
    sleep 10  # wait for MySQL to be ready
    ./mvnw flyway:migrate -Dflyway.url=jdbc:mysql://localhost:3306/freightclub_test \
      -Dflyway.user=root -Dflyway.password=root
```

---

## Useful Flyway Commands (Maven)

| Command | What it does |
|---------|-------------|
| `./mvnw flyway:info` | Show status of all migrations (applied, pending, failed) |
| `./mvnw flyway:migrate` | Apply all pending migrations |
| `./mvnw flyway:validate` | Check checksums — fails if any applied migration was modified |
| `./mvnw flyway:repair` | Remove failed migration entries from the schema history table |
| `./mvnw flyway:baseline` | Mark existing schema as baseline (only when adding Flyway to an existing DB) |

---

## What Not to Do

| Don't | Do instead |
|-------|-----------|
| Edit a migration after it's been committed | Write a new migration to fix it |
| Use `V1__`, `V2__` sequential integers | Use date-based versioning `V20260311_001__` |
| Put multiple unrelated changes in one file | One logical change per file |
| Use `ddl-auto=update` in staging/prod | Use `ddl-auto=validate` and let Flyway own the schema |
| Hard-delete rows | Use `deleted_at` soft delete |
| Skip adding `tenant_id` to a new table | Every tenant-scoped table needs `tenant_id` + index |
| Add an index on a FK column without a named FK constraint | Add `CONSTRAINT fk_... FOREIGN KEY ... REFERENCES ...` |
| Use `VARCHAR` for state/province codes | Use `CHAR(2)` — filter correctness depends on exact matching |
| Add `created_at`/`updated_at` without `DEFAULT CURRENT_TIMESTAMP` | Always include the default; never rely on the application to supply timestamps |
| Skip `CHECK` constraints on enum-backed columns | Add `CONSTRAINT chk_...` for every column whose valid values are defined by a Java enum |
