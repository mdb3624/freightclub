# [LOCAL OVERRIDE]

## 🛠 Database Roles
- **Admin (Flyway):** Use `neondb_owner` for schema migrations.
- **Runtime (App):** Use `freightclub_runtime` for standard API operations to enforce RLS.

## 🔐 Environment Variables Required
- `DB_ADMIN_USER`: neondb_owner
- `DB_ADMIN_PASSWORD`: (See .env)
- `DB_RUNTIME_USER`: freightclub_runtime
- `DB_RUNTIME_PASSWORD`: (See .env)
