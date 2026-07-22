-- US-857: users_tenant_isolation (V20260422_11) throws if app.current_tenant is unset —
-- current_setting('app.current_tenant') with no missing_ok arg raises an exception rather
-- than denying the row. Switch to the 2-arg form so an unbound tenant context on
-- freightclub_runtime (now that it's losing BYPASSRLS in V20260721_1403) fails closed
-- — zero rows, not a 500 — instead of throwing.
--
-- Scoped to `users` only: this is the one table on the actual login/auth path. Direct
-- migration audit found 60+ tenant-isolation policies platform-wide (not the 9 originally
-- assumed) — hardening all of them to this same pattern is real, separate follow-on work,
-- tracked in the US-857 story doc's Out of Scope section, not done here.
DO $$
BEGIN
    DROP POLICY IF EXISTS users_tenant_isolation ON freightclub.users;

    CREATE POLICY users_tenant_isolation ON freightclub.users
        FOR ALL
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1402 partial: %', SQLERRM;
END $$;
