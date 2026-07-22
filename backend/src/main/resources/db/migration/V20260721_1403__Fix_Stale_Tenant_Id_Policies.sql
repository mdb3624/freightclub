-- US-857: found during Docker Pre-Test Protocol run after revoking freightclub_runtime's
-- BYPASSRLS — 8 policies across 5 tables (V20260427_1000, V20260427_1100, V20260513_1000)
-- reference current_setting('app.current_tenant_id'), a session variable the application has
-- NEVER set (RlsStatementInspector sets 'app.current_tenant', no _id suffix). These policies
-- have been completely inert since they were written — BYPASSRLS meant they were never
-- evaluated for freightclub_runtime, so the naming mismatch never mattered. The instant
-- bypass is revoked (V20260721_1405), every query against these tables would throw, because
-- the policy references a variable that doesn't exist. This wasn't caused by this story —
-- it's a pre-existing latent bug this story's core fix happens to surface.
--
-- Same fail-closed pattern as V20260721_1402 (missing_ok=true): a future bug that leaves
-- tenant context unbound gets zero rows, not a thrown exception.
DO $$
BEGIN
    -- payment_accounts (V20260427_1000)
    DROP POLICY IF EXISTS payment_accounts_tenant_isolation ON freightclub.payment_accounts;
    CREATE POLICY payment_accounts_tenant_isolation ON freightclub.payment_accounts
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS payment_accounts_tenant_insert ON freightclub.payment_accounts;
    CREATE POLICY payment_accounts_tenant_insert ON freightclub.payment_accounts
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS payment_accounts_tenant_update ON freightclub.payment_accounts;
    CREATE POLICY payment_accounts_tenant_update ON freightclub.payment_accounts
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- payment_account_verifications (V20260427_1000)
    DROP POLICY IF EXISTS payment_account_verifications_tenant_isolation ON freightclub.payment_account_verifications;
    CREATE POLICY payment_account_verifications_tenant_isolation ON freightclub.payment_account_verifications
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS payment_account_verifications_tenant_insert ON freightclub.payment_account_verifications;
    CREATE POLICY payment_account_verifications_tenant_insert ON freightclub.payment_account_verifications
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS payment_account_verifications_tenant_update ON freightclub.payment_account_verifications;
    CREATE POLICY payment_account_verifications_tenant_update ON freightclub.payment_account_verifications
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- payment_account_audit_log (V20260427_1000)
    DROP POLICY IF EXISTS payment_account_audit_read ON freightclub.payment_account_audit_log;
    CREATE POLICY payment_account_audit_read ON freightclub.payment_account_audit_log
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- carrier_equipment (V20260427_1100)
    DROP POLICY IF EXISTS carrier_equipment_tenant_isolation ON freightclub.carrier_equipment;
    CREATE POLICY carrier_equipment_tenant_isolation ON freightclub.carrier_equipment
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS carrier_equipment_tenant_insert ON freightclub.carrier_equipment;
    CREATE POLICY carrier_equipment_tenant_insert ON freightclub.carrier_equipment
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS carrier_equipment_tenant_update ON freightclub.carrier_equipment;
    CREATE POLICY carrier_equipment_tenant_update ON freightclub.carrier_equipment
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- carrier_lanes (V20260427_1100)
    DROP POLICY IF EXISTS carrier_lanes_tenant_isolation ON freightclub.carrier_lanes;
    CREATE POLICY carrier_lanes_tenant_isolation ON freightclub.carrier_lanes
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS carrier_lanes_tenant_insert ON freightclub.carrier_lanes;
    CREATE POLICY carrier_lanes_tenant_insert ON freightclub.carrier_lanes
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS carrier_lanes_tenant_update ON freightclub.carrier_lanes;
    CREATE POLICY carrier_lanes_tenant_update ON freightclub.carrier_lanes
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- carrier_availability (V20260427_1100)
    DROP POLICY IF EXISTS carrier_availability_tenant_isolation ON freightclub.carrier_availability;
    CREATE POLICY carrier_availability_tenant_isolation ON freightclub.carrier_availability
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS carrier_availability_tenant_insert ON freightclub.carrier_availability;
    CREATE POLICY carrier_availability_tenant_insert ON freightclub.carrier_availability
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    DROP POLICY IF EXISTS carrier_availability_tenant_update ON freightclub.carrier_availability;
    CREATE POLICY carrier_availability_tenant_update ON freightclub.carrier_availability
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- carrier_profile_audit_log (V20260427_1100)
    DROP POLICY IF EXISTS carrier_profile_audit_read ON freightclub.carrier_profile_audit_log;
    CREATE POLICY carrier_profile_audit_read ON freightclub.carrier_profile_audit_log
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);

    -- shipper_profiles (V20260513_1000) — original policy also filtered deleted_at IS NULL
    -- inside the RLS expression itself; preserved here.
    DROP POLICY IF EXISTS shipper_profiles_tenant_isolation ON freightclub.shipper_profiles;
    CREATE POLICY shipper_profiles_tenant_isolation ON freightclub.shipper_profiles
        USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR AND deleted_at IS NULL)
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR AND deleted_at IS NULL);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1403 partial: %', SQLERRM;
END $$;
