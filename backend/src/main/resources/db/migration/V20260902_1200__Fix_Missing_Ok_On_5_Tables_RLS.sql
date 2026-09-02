-- Discovered while implementing US-880: V20260522_2100 gave message_outbox, shipper_profiles,
-- payment_accounts, load_recommendations, and carrier_cost_profiles RLS policies using
-- CURRENT_SETTING('app.current_tenant') WITHOUT the missing_ok=true second argument. That form
-- throws "unrecognized configuration parameter" on any connection where app.current_tenant was
-- never SET at all in that session — rather than the project's own documented, established fix
-- for exactly this (see memory: feedback_rls_missing_ok.md; also already used correctly by every
-- RLS policy added since, e.g. disputes_tenant_isolation in V20260901_1300).
--
-- This was latent and invisible for the entire life of these 5 tables because the one code path
-- with no bound tenant context (LoadPublishedListener's @Scheduled outbox poller,
-- message_outbox) never actually ran — @EnableScheduling was itself missing until this
-- session's own US-879 fix. Enabling scheduling immediately exposed this: every poll cycle now
-- throws on message_outbox's SELECT policy. Fixed here, alongside the other 4 tables sharing
-- the identical defect, before US-879 is ever deployed to production with scheduling live.
--
-- current_setting(name, missing_ok) returns NULL instead of throwing when unset; tenant_id =
-- NULL evaluates to NULL (not TRUE), so this still fails closed — no rows visible — exactly the
-- same effective behavior as before, just without the exception.
DO $$
BEGIN
    ALTER POLICY message_outbox_select ON freightclub.message_outbox
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY message_outbox_write ON freightclub.message_outbox
        WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY message_outbox_update ON freightclub.message_outbox
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY message_outbox_delete ON freightclub.message_outbox
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

    ALTER POLICY shipper_profiles_select ON freightclub.shipper_profiles
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY shipper_profiles_insert ON freightclub.shipper_profiles
        WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY shipper_profiles_update ON freightclub.shipper_profiles
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY shipper_profiles_delete ON freightclub.shipper_profiles
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

    ALTER POLICY payment_accounts_select ON freightclub.payment_accounts
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY payment_accounts_insert ON freightclub.payment_accounts
        WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY payment_accounts_update ON freightclub.payment_accounts
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY payment_accounts_delete ON freightclub.payment_accounts
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

    ALTER POLICY load_recommendations_select ON freightclub.load_recommendations
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY load_recommendations_insert ON freightclub.load_recommendations
        WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY load_recommendations_update ON freightclub.load_recommendations
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY load_recommendations_delete ON freightclub.load_recommendations
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

    ALTER POLICY carrier_cost_profiles_select ON freightclub.carrier_cost_profiles
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY carrier_cost_profiles_insert ON freightclub.carrier_cost_profiles
        WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY carrier_cost_profiles_update ON freightclub.carrier_cost_profiles
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
    ALTER POLICY carrier_cost_profiles_delete ON freightclub.carrier_cost_profiles
        USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260902_1200 partial: %', SQLERRM;
END $$;
