---
id: LOAD-201
title: Load Drafting & Multi-Tenant Isolation (Enon RLS)
persona: Shipper
priority: High
status: 📝 Planned
---

# LOAD-201 — Load Drafting & Multi-Tenant Isolation (Enon RLS)

**As a** Shipper,
**I want** to create a draft load with full freight details,
**so that** my loads are stored in isolation from other tenants and cannot be read, modified, or claimed by users belonging to a different tenant.

## Acceptance Criteria
- [ ] `POST /api/v2/loads` creates a `LoadAggregate` in `DRAFT` status; `tenant_id` is sourced exclusively from the verified JWT `tenantId` claim via `TenantContextHolder` — never from a request body field
- [ ] `JpaLoadAdapter.save()` executes `SET app.current_tenant = :tenantId` (transaction-local via `set_config(..., true)`) before any DML, satisfying the Enon RLS policy
- [ ] RLS policy `loads_isolation` on the `loads` table enforces `tenant_id = current_setting('app.current_tenant')::uuid`; a direct SQL query without the session variable returns zero rows
- [ ] `Weight` value object rejects `null` or non-positive values with a `LoadDomainException`; controller maps this to `400 Bad Request`
- [ ] Draft loads are not visible on the public load board (`/api/v1/board/**`) until published
- [ ] Flyway migration includes `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` on the `loads` table

## Related Stories
- LOAD-202 (draft → published transition)
- OPS-401 (claiming requires published status)
- SYS-102 (tenant_id originates from the role established at invitation)
