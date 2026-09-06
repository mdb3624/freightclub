# FreightClub PostgreSQL Native Standards

## 🔑 Primary Keys & Data Types
- **UUIDs:** Use `UUID` for all primary and foreign keys to ensure global uniqueness.
- **Timestamps:** Use `TIMESTAMPTZ` (OffsetDateTime in Java) for all date/time fields to prevent timezone drift.
- **Strings:** Favor `VARCHAR` or `TEXT` over `CHAR(36)` for IDs to support modern indexing.

## 🛡️ Multi-Tenancy & Isolation
- **Mandatory Filter:** EVERY query must include `tenant_id = ?` derived from `TenantContextHolder`.
- **Cross-Tenant Block:** Never perform joins across different `tenant_id` values unless specifically for public market data.

## 🕯️ Soft Delete Pattern
- **Logic:** Never use `DELETE` statements on core entities.
- **Filtering:** All `SELECT` queries must include `AND deleted_at IS NULL`.
- **Audit:** When "deleting," set `deleted_at = CURRENT_TIMESTAMP`.

## ⚡ Concurrency & Performance
- **Pessimistic Locking:** Use `SELECT FOR UPDATE` (via `@Lock` in JPA) for load claiming and refresh token rotation.
- **Indexes:** Ensure composite indexes exist for `(tenant_id, deleted_at)` on frequently scanned tables.

## 🔓 RLS Exemption: Session-Token Tables (codified 2026-09-06)

**Exception to REVIEWER.md's "any table without an RLS policy" hard gate:** auth-adjacent, non-tenant-scoped session/token tables (`refresh_tokens`, `password_reset_tokens`, `impersonation_sessions`) are RLS-exempt by design. They have no `tenant_id` column and are access-controlled by application-layer role checks (BYPASSRLS-role-only access), not row-level tenant isolation — there is no tenant dimension to isolate on a table that exists purely to track a short-lived server-side session artifact.

**Why this exists:** found during the 2026-09-06 retroactive REVIEWER audit of US-885 (Super User Scoped Impersonation) — `impersonation_sessions` (migration `V20260902_1600`) has no RLS policy, which reads as an automatic REJECT under the literal hard gate. On inspection it followed the same established shape as `refresh_tokens`/`password_reset_tokens`, so it wasn't a new violation — but nothing had ever written the exception down, meaning REVIEWER had to rediscover and re-justify it from first principles. Codifying it here so it doesn't need re-litigating on the next session-token table.

**When this does NOT apply:** any table that has a `tenant_id` column, or that stores data belonging to a specific tenant's business records (loads, profiles, documents, etc.) — RLS remains mandatory there without exception.