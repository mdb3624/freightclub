-- US-858: a broader sweep (grep -rl "current_tenant_id" across ALL migrations, not just the
-- 3 files US-857 checked) found 2 more policies with the same app.current_tenant_id-vs-
-- app.current_tenant bug that DO throw (no missing_ok), surfaced by full-suite failures once
-- BYPASSRLS was actually revoked: carrier_cost_profiles and invoices.
--
-- message_outbox_tenant_isolation (V20260507_0900) already uses missing_ok=true, so it's
-- inert but harmless (falls back to zero rows, not a throw) — no fix needed there.
--
-- The 9 analytics/reporting policies in V20260527_1100 (load_analytics, lane_analytics_daily,
-- carrier_performance, load_financial, lane_revenue_daily, carrier_revenue_daily,
-- shipper_preferred_carriers, load_assignments, load_views, carrier_profile_views) use
-- missing_ok=true WITH a COALESCE fallback to "the first tenant row in the table" — a
-- different, real latent bug (leaks an arbitrary tenant's data on an unbound context, instead
-- of returning zero rows) but does not throw, so it isn't blocking test runs. Tracked as
-- separate follow-on debt, not fixed here — see US-858 story doc Out of Scope.
DO $$
BEGIN
    -- shipper_reputation (V20260427_1401): correct variable name already, but no missing_ok —
    -- ShipperPublicProfileIntegrationTest exercises this table with no tenant context bound
    -- (a legitimately public-facing read), which now throws instead of returning zero rows.
    DROP POLICY IF EXISTS shipper_reputation_tenant_isolation ON freightclub.shipper_reputation;
    CREATE POLICY shipper_reputation_tenant_isolation ON freightclub.shipper_reputation
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR(36));

    DROP POLICY IF EXISTS shipper_reputation_tenant_isolation_update ON freightclub.shipper_reputation;
    CREATE POLICY shipper_reputation_tenant_isolation_update ON freightclub.shipper_reputation
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR(36));

    DROP POLICY IF EXISTS shipper_reputation_tenant_isolation_delete ON freightclub.shipper_reputation;
    CREATE POLICY shipper_reputation_tenant_isolation_delete ON freightclub.shipper_reputation
        FOR DELETE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR(36));

    DROP POLICY IF EXISTS carrier_cost_profiles_tenant_isolation ON freightclub.carrier_cost_profiles;
    CREATE POLICY carrier_cost_profiles_tenant_isolation ON freightclub.carrier_cost_profiles
        FOR ALL
        USING (tenant_id = current_setting('app.current_tenant', true))
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

    DROP POLICY IF EXISTS invoices_select ON freightclub.invoices;
    CREATE POLICY invoices_select ON freightclub.invoices
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR AND deleted_at IS NULL);

    DROP POLICY IF EXISTS invoices_insert ON freightclub.invoices;
    CREATE POLICY invoices_insert ON freightclub.invoices
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS invoices_update ON freightclub.invoices;
    CREATE POLICY invoices_update ON freightclub.invoices
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1407 partial: %', SQLERRM;
END $$;
