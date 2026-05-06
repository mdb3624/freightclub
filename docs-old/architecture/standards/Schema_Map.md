# # Database Schema Map: Resilience Logistics Platform
**Owner:** Solution Architect
**Default Schema:** `freightclub`

## 1. Data Type Reference (The Translation Key)
Mandatory mappings to synchronize the Spring Boot backend with Neon Postgres.

| Entity Concept | PostgreSQL Type | Java (Spring Boot) Type | Why? |
| :--- | :--- | :--- | :--- |
| **Primary/Foreign Keys** | `VARCHAR(36)` | `String` | Prevents `bpchar` mismatches. |
| **Tenant Identifiers** | `VARCHAR(36)` | `String` | Required for RLS isolation. |
| **Timestamps** | `TIMESTAMPTZ` | `OffsetDateTime` | Timezone accuracy for logs. |
| **Monetary/Rates** | `NUMERIC(19,4)` | `BigDecimal` | Accuracy for Phase 7b Financials. |

---

## 2. Core Entity Relationships
Standardized `VARCHAR(36)` identifiers linking primary modules.

### 🏗️ Tenant & Security Layer
- **tenants**: Root of the multi-tenant hierarchy.
    - `id` (PK, VARCHAR(36))
- **users**: Identity management linked to specific tenants.
    - `id` (PK, VARCHAR(36))
    - `tenant_id` (FK, VARCHAR(36)) -> tenants(id)

### 🚛 Logistics & Equipment Layer
- **carrier_profiles**: Fleet specifications and capacity tracking.
    - `id` (PK, VARCHAR(36))
    - `tenant_id` (FK, VARCHAR(36))
    - `preferred_equipment`: VARCHAR(20)

### 💰 Transactional & Financial Layer
- **loads**: Central record for load orchestration.
    - `id` (PK, VARCHAR(36))
    - `tenant_id` (FK, VARCHAR(36))
- **claims**: Financial dispute and resolution records.
    - `id` (PK, VARCHAR(36))
    - `tenant_id` (FK, VARCHAR(36))

---

## 🛡️ Row Level Security (RLS) Policy
Every transactional table must implement this baseline security:

```sql
ALTER TABLE freightclub.[table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY [table_name]_tenant_isolation ON freightclub.[table_name]
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR(36));