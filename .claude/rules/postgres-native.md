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