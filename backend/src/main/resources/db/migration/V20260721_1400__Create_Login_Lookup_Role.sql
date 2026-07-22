-- US-857: Minimal-privilege role for pre-authentication lookups.
-- freightclub_runtime is about to lose BYPASSRLS (V20260721_1403). Before that happens,
-- give the two genuinely pre-tenant-context reads (login email lookup, registration
-- join-code lookup) a narrowly-scoped role instead of relying on a blanket bypass.
-- SELECT-only, named columns only, two tables only.
--
-- Password comes from a Flyway placeholder (spring.flyway.placeholders.login_lookup_password,
-- bound to the DB_LOGIN_PASSWORD env var) rather than being hardcoded here — this migration
-- re-applying on every deploy also means rotating DB_LOGIN_PASSWORD and redeploying rotates
-- this role's credential automatically.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'freightclub_login_lookup') THEN
        CREATE ROLE freightclub_login_lookup WITH LOGIN BYPASSRLS PASSWORD '${login_lookup_password}';
    ELSE
        ALTER ROLE freightclub_login_lookup PASSWORD '${login_lookup_password}';
    END IF;

    GRANT USAGE ON SCHEMA freightclub TO freightclub_login_lookup;
    -- deleted_at must be granted too: it's not projected in the SELECT list, but it IS
    -- referenced in the WHERE clause (soft-delete filter), and Postgres column-level
    -- privileges apply to every column a query touches anywhere, not just SELECTed ones —
    -- omitting it here denies the whole query with a generic "permission denied for table".
    GRANT SELECT (id, tenant_id, email, password_hash, role, deleted_at) ON freightclub.users TO freightclub_login_lookup;
    GRANT SELECT (id, join_code, name, plan, deleted_at) ON freightclub.tenants TO freightclub_login_lookup;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1400 partial: %', SQLERRM;
END $$;
