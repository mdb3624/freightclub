
# AD-[ID]: [Technical_Feature_Name]
**Reference Story:** [[US-xxx]]
**Status:** DRAFT | APPROVED | SUPERSEDED

---
## 1. 🏗️ Domain Model & Logic
*Visual and verbal explanation of the business logic and entity relationships.*

```mermaid
classDiagram
    class EntityName {
        +VARCHAR(36) id
        +VARCHAR(36) tenant_id
        +TIMESTAMPTZ created_at
        +TIMESTAMPTZ deleted_at
    }
    %% Example Relationship
    EntityName "1" --> "*" ChildEntity : owns
````

---

## 2. 🗄️ Database Schema Map (Postgres 17)

_Mandatory mapping for the Coder. This is EMBEDDED here for single-source-of-truth._

|**Column Name**|**PostgreSQL Type**|**Java (Spring Boot) Type**|**Constraints**|
|---|---|---|---|
|`id`|`VARCHAR(36)`|`String`|PK, Not Null|
|`tenant_id`|`VARCHAR(36)`|`String`|FK, Indexed, Not Null|
|`created_at`|`TIMESTAMPTZ`|`OffsetDateTime`|Default: NOW()|
|`updated_at`|`TIMESTAMPTZ`|`OffsetDateTime`|Default: NOW()|
|`deleted_at`|`TIMESTAMPTZ`|`OffsetDateTime`|Nullable (Soft Delete)|
|`[CustomCol]`|`[Type]`|`[JavaType]`|[Notes/Enums]|

---

## 🛡️ 3. Row Level Security (RLS) Policy

_The exact SQL required to enforce the multi-tenant boundary._

-- Enable security for the new table
ALTER TABLE freightclub.[table_name] ENABLE ROW LEVEL SECURITY;

-- Define the isolation policy
CREATE POLICY [table_name]_tenant_isolation ON freightclub.[table_name]
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR(36));
---

## ⚙️ 4. Implementation Directives

_Specific instructions for the Coder and Reviewer to ensure architectural integrity._

1. **Persistence:** Use `TenantContextHolder` to resolve tenant context.
2. **Repositories:** All queries must filter by `deleted_at IS NULL`.
3. **Java Standards:** Use standard Java POJOs/Records; No-Lombok permitted.
4. **Validation:** Ensure 80% branch coverage on all new logic.
5. **Naming:** Flyway migrations must follow `VYYYYMMDD_HHmm__[Description].sql`.