-- SEC-002-AC-002-1: Enable RLS on 5 tables (message_outbox, shipper_profiles, payment_accounts, load_recommendations, carrier_cost_profiles)
-- SEC-002-AC-002-2: SELECT policy enforces tenant isolation
-- SEC-002-AC-002-3: Mutation policies (INSERT/UPDATE/DELETE) enforce ownership

DO $$ BEGIN

  -- ════════════════════════════════════════════════════════════════
  -- message_outbox — Phase 6 (In-App Messaging)
  -- ════════════════════════════════════════════════════════════════

  ALTER TABLE freightclub.message_outbox ENABLE ROW LEVEL SECURITY;

  -- SELECT policy: Users can only see messages from their tenant
  CREATE POLICY message_outbox_select ON freightclub.message_outbox
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  -- INSERT/UPDATE/DELETE policy: Users can only modify messages from their tenant
  CREATE POLICY message_outbox_write ON freightclub.message_outbox
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY message_outbox_update ON freightclub.message_outbox
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY message_outbox_delete ON freightclub.message_outbox
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  -- ════════════════════════════════════════════════════════════════
  -- shipper_profiles — Phase 7 (Carrier Management)
  -- ════════════════════════════════════════════════════════════════

  ALTER TABLE freightclub.shipper_profiles ENABLE ROW LEVEL SECURITY;

  CREATE POLICY shipper_profiles_select ON freightclub.shipper_profiles
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY shipper_profiles_insert ON freightclub.shipper_profiles
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY shipper_profiles_update ON freightclub.shipper_profiles
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY shipper_profiles_delete ON freightclub.shipper_profiles
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  -- ════════════════════════════════════════════════════════════════
  -- payment_accounts — Phase 5 (Payments & Settlement)
  -- ════════════════════════════════════════════════════════════════

  ALTER TABLE freightclub.payment_accounts ENABLE ROW LEVEL SECURITY;

  CREATE POLICY payment_accounts_select ON freightclub.payment_accounts
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY payment_accounts_insert ON freightclub.payment_accounts
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY payment_accounts_update ON freightclub.payment_accounts
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY payment_accounts_delete ON freightclub.payment_accounts
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  -- ════════════════════════════════════════════════════════════════
  -- load_recommendations — Phase 7 (Carrier Management)
  -- ════════════════════════════════════════════════════════════════

  ALTER TABLE freightclub.load_recommendations ENABLE ROW LEVEL SECURITY;

  CREATE POLICY load_recommendations_select ON freightclub.load_recommendations
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY load_recommendations_insert ON freightclub.load_recommendations
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY load_recommendations_update ON freightclub.load_recommendations
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY load_recommendations_delete ON freightclub.load_recommendations
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  -- ════════════════════════════════════════════════════════════════
  -- carrier_cost_profiles — Phase 7 (Carrier Management)
  -- ════════════════════════════════════════════════════════════════

  ALTER TABLE freightclub.carrier_cost_profiles ENABLE ROW LEVEL SECURITY;

  CREATE POLICY carrier_cost_profiles_select ON freightclub.carrier_cost_profiles
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY carrier_cost_profiles_insert ON freightclub.carrier_cost_profiles
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY carrier_cost_profiles_update ON freightclub.carrier_cost_profiles
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY carrier_cost_profiles_delete ON freightclub.carrier_cost_profiles
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS Policy Creation: %', SQLERRM;
END $$;
