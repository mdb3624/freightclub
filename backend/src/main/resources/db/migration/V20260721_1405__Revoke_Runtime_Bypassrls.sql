-- US-857: freightclub_runtime was granted blanket BYPASSRLS in V20260603_1000 to solve
-- one narrow problem (the login-flow lookup throwing on unset app.current_tenant). That
-- bypassed RLS for the entire role, for every query, permanently — since then, tenant
-- isolation for ALL authenticated traffic has depended solely on application-layer
-- tenant_id filtering, with zero database-level backstop.
--
-- Must run LAST, after V20260721_1400 (login_lookup role exists for the pre-auth reads
-- that legitimately need cross-tenant access) and V20260721_1401/1402 (tenants + users
-- have real policies) — otherwise revoking bypass here would break registration and login
-- before their replacement paths exist.
DO $$
BEGIN
    ALTER ROLE freightclub_runtime NOBYPASSRLS;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1403 partial: %', SQLERRM;
END $$;
