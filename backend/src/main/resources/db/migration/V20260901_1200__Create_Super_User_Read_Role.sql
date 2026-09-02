-- US-750/751/752 (Super User): freightclub_runtime lost BYPASSRLS (V20260721_1403) and RLS
-- now genuinely blocks cross-tenant reads for it — correct for every other persona, but the
-- Super User dashboard/dispute-queue/health view are the one legitimate cross-tenant surface
-- on the platform (US-750 BR-2). Rather than punching a hole in the tenant-isolation policies
-- themselves, this mirrors the freightclub_login_lookup pattern (V20260721_1400): a narrowly-
-- scoped, read-only role used only by this one surface, via its own DataSource/JdbcTemplate,
-- never through the tenant-scoped JPA path.
--
-- Password comes from a Flyway placeholder (super_user_read_password, bound to the
-- DB_SUPER_USER_READ_PASSWORD env var), same rotation mechanism as V20260721_1400/1406.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'freightclub_super_user_read') THEN
        CREATE ROLE freightclub_super_user_read WITH LOGIN BYPASSRLS PASSWORD '${super_user_read_password}';
    ELSE
        ALTER ROLE freightclub_super_user_read PASSWORD '${super_user_read_password}';
    END IF;

    GRANT USAGE ON SCHEMA freightclub TO freightclub_super_user_read;
    -- Read-only, and only the columns the dashboard/dispute/health surfaces actually need —
    -- never password_hash or other sensitive columns, even though this role bypasses RLS.
    GRANT SELECT (id, name, plan, join_code, deleted_at) ON freightclub.tenants TO freightclub_super_user_read;
    GRANT SELECT (id, tenant_id, role, deleted_at) ON freightclub.users TO freightclub_super_user_read;
    GRANT SELECT (id, tenant_id, status, deleted_at) ON freightclub.loads TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260901_1200 partial: %', SQLERRM;
END $$;
