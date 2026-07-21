-- US-857: freightclub.tenants has ENABLE ROW LEVEL SECURITY (V20260422_01) but has NEVER
-- had a policy defined. With no policy, Postgres default-denies all access to any role
-- that doesn't bypass RLS. Today that's invisible because freightclub_runtime has BYPASSRLS.
-- Once that's revoked (V20260721_1403), every tenant read/write — including new-tenant
-- registration — would silently break without this migration.
DO $$
BEGIN
    -- New tenant creation (register with company name) has no tenant context yet by
    -- definition — this is the root of the multi-tenancy hierarchy, so an unconditional
    -- INSERT is correct, not a hole (it doesn't expose or scope any existing tenant's data).
    CREATE POLICY tenants_insert ON freightclub.tenants
        FOR INSERT
        WITH CHECK (true);

    -- Authenticated reads/writes to a tenant's own record (e.g. ProfileService) are scoped
    -- to that tenant only, same pattern as every other tenant-scoped table.
    CREATE POLICY tenants_select ON freightclub.tenants
        FOR SELECT
        USING (id = current_setting('app.current_tenant', true)::VARCHAR);

    CREATE POLICY tenants_update ON freightclub.tenants
        FOR UPDATE
        USING (id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (id = current_setting('app.current_tenant', true)::VARCHAR);

    -- Note: registration's join-code lookup (AuthService.register(), finding an EXISTING
    -- tenant by join code before the caller has any tenant context) is intentionally NOT
    -- covered by a policy here — a policy can't distinguish "looking up by join_code" from
    -- "looking up by id," so allowing it would mean any pre-auth caller can enumerate/read
    -- any tenant's row. That lookup goes through freightclub_login_lookup instead
    -- (V20260721_1400), which is scoped to exactly the columns registration needs.
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;
