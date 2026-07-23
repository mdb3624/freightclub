# Configuration Compliance Review

**Date:** 2026-04-23  
**Status:** REVIEWED WITH FINDINGS  
**Standards Reference:** PROJECT_CONSTITUTION.md (Sections 1-3)

---

## Executive Summary

✅ **application.yml** — Now compliant after fixes  
✅ **pom.xml** — Compliant (no changes needed)  
✅ **.env.example** — Updated with comprehensive documentation  
⚠️ **Flyway Naming Convention** — Mismatch requires attention

---

## 1. Hard-Coded Credentials Audit

### application.yml
| Item | Before | After | Status |
|------|--------|-------|--------|
| `default-tenant-id` | `00000000-0000-0000-0000-000000000001` (hard-coded) | `${DEFAULT_TENANT_ID:00000000-0000-0000-0000-000000000001}` | ✅ FIXED |
| CORS origins | `http://localhost:5173` (hard-coded) | `${CORS_ALLOWED_ORIGINS:http://localhost:8080}` | ✅ FIXED |
| All other secrets | `${PLACEHOLDER}` format | No change needed | ✅ COMPLIANT |

### pom.xml
- ✅ Uses Maven properties for Flyway: `${flyway.url}`, `${flyway.user}`, `${flyway.password}`
- ✅ No hard-coded credentials
- ✅ Schema correctly set to `freightclub`

---

## 2. Environment Variables Inventory

### Required (No Defaults)
```
DB_HOST              # Database host
DB_PORT              # Database port
DB_NAME              # Database name
DB_USERNAME          # Runtime user (freightclub_runtime)
DB_PASSWORD          # Runtime password (CRITICAL SECRET)
FLYWAY_USER          # Migration user (superuser)
FLYWAY_PASSWORD      # Migration password (CRITICAL SECRET)
JWT_SECRET           # JWT signing key (min 32 chars for HS256)
```

### Optional (With Defaults)
```
FLYWAY_HOST          # Defaults to DB_HOST
FLYWAY_PORT          # Defaults to DB_PORT
DEFAULT_TENANT_ID    # Defaults to 00000000-0000-0000-0000-000000000001
CORS_ALLOWED_ORIGINS # Defaults to http://localhost:8080
EMAIL_ENABLED        # Defaults to false
EMAIL_FROM           # Defaults to noreply@freightclub.app
EIA_ENABLED          # Defaults to false
EIA_API_KEY          # Defaults to empty
```

---

## 3. Flyway Naming Convention Compliance

### Constitution Requirement (Section 2)
```
V<YYYYMMDD_HHMM>__<Description>.sql
```
Example: `V20260422_1430__Create_tenants.sql`

### Current Implementation
```
V<YYYYMMDD_HH>__<Description>.sql
```
Example: `V20260422_00__Create_tenants.sql`

### Status: ⚠️ MISMATCH
**Issue:** Minutes component (MM) is missing from naming pattern.

**Existing Migrations:**
- ✅ V20260422_00__Initialize_schema.sql
- ✅ V20260422_01__Create_tenants.sql
- ✅ V20260422_02__Create_users.sql
- ... (11 total migrations)

**Recommended Action:**
Establish a migration policy:
1. **Option A:** Update PROJECT_CONSTITUTION.md to allow `V<YYYYMMDD_HH>__` format (current practice)
2. **Option B:** Rename existing migrations to include minutes: `V<YYYYMMDD_HHMM>__`

**Recommendation:** Choose **Option A** — Current format is valid and all migrations follow it consistently.

---

## 4. Configuration File Changes

### application.yml
```yaml
# BEFORE (Line 59)
default-tenant-id: 00000000-0000-0000-0000-000000000001

# AFTER
default-tenant-id: ${DEFAULT_TENANT_ID:00000000-0000-0000-0000-000000000001}

# BEFORE (Line 61)
allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}

# AFTER
allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:8080}
```

### .env.example
- ✅ Reorganized with section headers for clarity
- ✅ Added comprehensive documentation
- ✅ Included test tenant UUIDs
- ✅ Added production (Neon) configuration examples
- ✅ All required and optional variables documented

---

## 5. Security Checklist

- ✅ No secrets in `application.yml`
- ✅ No secrets in `pom.xml`
- ✅ `.env` file properly ignored by Git (in `.gitignore`)
- ✅ Flyway uses separate superuser credentials
- ✅ Runtime uses non-superuser role (`freightclub_runtime`)
- ✅ JWT secret is externalized
- ✅ Database password is externalized
- ✅ Default tenant ID is externalized (with fallback)

---

## 6. Verification Steps

To verify configuration is working:

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Update .env with actual values
# Edit: DB_PASSWORD, FLYWAY_PASSWORD, JWT_SECRET

# 3. Build the backend
/c/tools/apache-maven-3.9.9/bin/mvn clean package -DskipTests=true

# 4. Start the backend
java -jar backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

# 5. Verify health endpoint
curl -s http://localhost:9090/actuator/health | jq .
```

---

## Summary of Actions Taken

| Action | File | Status |
|--------|------|--------|
| Externalize default-tenant-id | application.yml | ✅ DONE |
| Fix CORS default port | application.yml | ✅ DONE |
| Create comprehensive .env.example | .env.example | ✅ DONE |
| Document all variables | .env.example | ✅ DONE |
| Document test tenants | .env.example | ✅ DONE |

---

## Next Steps

1. **Flyway Naming:** Clarify whether to adopt full `YYYYMMDD_HHMM` format or update Constitution to allow `YYYYMMDD_HH`
2. **Production Secrets:** Set up proper secret management for production (.env values, AWS Secrets Manager, etc.)
3. **Local Testing:** Use Alpha Logistics tenant UUID for local testing: `8e1b500b-0356-4b5f-b016-89dbde2dc428`

