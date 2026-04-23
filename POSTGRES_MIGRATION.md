# PostgreSQL Migration - Complete

## Summary
Successfully migrated from MySQL to PostgreSQL with complete schema redesign:

### ✅ Completed
- 11 complete Flyway migrations (V20260422_00 through V20260422_11) 
- All entity tables created with proper constraints and indexes
- Row-level security (RLS) policies configured for all tenant-scoped tables
- Role-based access control with `freightclub_runtime` application user
- Parameterized configuration in `pom.xml` and `application.yml`
- Dev profile with local PostgreSQL defaults
- `.env.example` template for environment variables

### Migration Files
1. **V20260422_00__Initialize_schema.sql** - Create schema and extensions
2. **V20260422_01__Create_tenants.sql** - Multi-tenancy root table
3. **V20260422_02__Create_users.sql** - User authentication and profiles
4. **V20260422_03__Create_loads.sql** - Freight load records
5. **V20260422_04__Create_refresh_tokens.sql** - Session management
6. **V20260422_05__Create_claims.sql** - Load claims by truckers
7. **V20260422_06__Create_load_events.sql** - Audit trail
8. **V20260422_07__Create_load_documents.sql** - Attachments (BOL, POD, etc.)
9. **V20260422_08__Create_load_ratings.sql** - User ratings
10. **V20260422_09__Create_notifications.sql** - In-app notifications
11. **V20260422_10__Create_carrier_profiles.sql** - Extended trucker profiles
12. **V20260422_11__Setup_rls_and_roles.sql** - RLS policies and permissions

### Configuration Updates
- **pom.xml**: Flyway Maven plugin now uses environment variables
- **application.yml**: All database config parameterized for Neon PostgreSQL
- **application-dev.yml**: Local PostgreSQL defaults with dev overrides
- Passwords no longer hardcoded; use environment variables (`.env` or system vars)

### Environment Variables Required
Development:
- `DB_USERNAME`, `DB_PASSWORD`, `FLYWAY_USER`, `FLYWAY_PASSWORD`, `JWT_SECRET`

Production (Neon):
- Neon connection details in `DB_HOST`, `FLYWAY_HOST`
- All other vars same as dev pattern

### Next Steps
1. **Local Testing** (if running locally):
   ```bash
   # Copy .env.example to .env and fill in your local Postgres credentials
   cp .env.example .env
   
   # Create local database
   psql -U postgres -c "CREATE DATABASE freightclub;"
   
   # Build and let Flyway run migrations
   /c/tools/apache-maven-3.9.9/bin/mvn clean package
   
   # Start backend
   "$JAVA_HOME/bin/java" -jar backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
   ```

2. **Neon Deployment**:
   - Set environment variables pointing to your Neon PostgreSQL connection
   - Flyway will run migrations automatically on startup
   - Ensure `FLYWAY_USER` has superuser privileges for DDL

3. **Verify**:
   - Check database logs: `SELECT * FROM freightclub.tenants;`
   - Confirm RLS is working by testing isolation between tenant queries
   - Run backend tests: `mvn test`

### Security Notes
- All UUIDs stored as CHAR(36) for compatibility with Java entity strings
- RLS policies use `current_setting('app.current_tenant')` - backend must set this
- `freightclub_runtime` role has minimal permissions (SELECT/INSERT/UPDATE/DELETE only)
- Flyway credentials must be superuser to handle DDL and role creation

### Compatibility
- PostgreSQL 12+
- Java 21 + Spring Boot 3.2.5
- Hibernate dialect: `PostgreSQLDialect`
- JPA: `hibernate.ddl-auto: validate` (schema managed by Flyway)
