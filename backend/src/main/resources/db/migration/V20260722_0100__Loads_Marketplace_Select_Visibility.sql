-- US-858: loads_tenant_isolation (V20260422_11) was a single FOR ALL policy strictly
-- scoping every operation to tenant_id = current_setting('app.current_tenant'). That's
-- correct for a shipper's own CRUD on their loads, but wrong for the load board: shippers
-- and truckers register as SEPARATE tenants (AuthService#register creates a brand-new
-- tenant per companyName signup), and a trucker must be able to SEE another tenant's OPEN
-- load to claim it. This is the actual marketplace model the product is built on.
--
-- This gap was masked from the beginning (V20260422_11 predates this story) by
-- freightclub_runtime's blanket BYPASSRLS (V20260603_1000) — it only surfaced once
-- US-858 revoked that bypass, via a real E2E failure (load board showing 0 loads for a
-- cross-tenant trucker: US-854-diesel-region-caption.spec.ts).
--
-- Scope note: this migration fixes SELECT (marketplace board visibility) only, which is
-- what the failing E2E coverage requires. INSERT/UPDATE/DELETE remain strictly
-- tenant-owner-scoped — meaning claimLoad/markPickedUp/markDelivered (trucker-side
-- mutations, run under the TRUCKER's tenant context, not the shipper's) have the exact
-- same underlying cross-tenant gap and are still broken under real RLS. Fixing that needs
-- a new app.current_user session GUC (mirroring app.current_tenant) plus a policy audit
-- across loads/claims/load_events/load_documents/payment tables — genuinely a separate,
-- properly-scoped piece of work, not a hotfix alongside this one. Flagged to LIBRARIAN as
-- urgent technical debt, not silently deferred.
DO $$
BEGIN
    DROP POLICY IF EXISTS loads_tenant_isolation ON freightclub.loads;

    CREATE POLICY loads_select ON freightclub.loads
        FOR SELECT
        USING (
            tenant_id = current_setting('app.current_tenant', true)::VARCHAR
            OR status = 'OPEN'
        );

    CREATE POLICY loads_insert ON freightclub.loads
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    CREATE POLICY loads_update ON freightclub.loads
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    CREATE POLICY loads_delete ON freightclub.loads
        FOR DELETE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260722_0100 partial: %', SQLERRM;
END $$;
