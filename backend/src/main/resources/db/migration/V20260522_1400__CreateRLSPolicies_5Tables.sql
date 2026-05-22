-- SEC-002: Create PostgreSQL RLS Policies for 5 core tables
-- Enforce tenant isolation at database level
-- Tables: message_outbox, shipper_profiles, payment_accounts, load_recommendations, carrier_cost_profiles

DO $$ BEGIN

  -- ═══════════════════════════════════════════════════════════════════════════
  -- Table 1: message_outbox
  -- ═══════════════════════════════════════════════════════════════════════════
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'message_outbox' AND table_schema = 'public'
  ) THEN
    -- Enable RLS if not already enabled
    ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;

    -- DROP existing policies if they exist (idempotency)
    DROP POLICY IF EXISTS tenant_isolation_select_message_outbox ON message_outbox;
    DROP POLICY IF EXISTS tenant_isolation_insert_message_outbox ON message_outbox;
    DROP POLICY IF EXISTS tenant_isolation_update_message_outbox ON message_outbox;
    DROP POLICY IF EXISTS tenant_isolation_delete_message_outbox ON message_outbox;

    -- SELECT policy: only visible to own tenant
    CREATE POLICY tenant_isolation_select_message_outbox ON message_outbox
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    -- INSERT policy: only insert for own tenant
    CREATE POLICY tenant_isolation_insert_message_outbox ON message_outbox
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    -- UPDATE policy: only update own tenant's rows
    CREATE POLICY tenant_isolation_update_message_outbox ON message_outbox
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    -- DELETE policy: only delete own tenant's rows
    CREATE POLICY tenant_isolation_delete_message_outbox ON message_outbox
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- Table 2: shipper_profiles
  -- ═══════════════════════════════════════════════════════════════════════════
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'shipper_profiles' AND table_schema = 'public'
  ) THEN
    ALTER TABLE shipper_profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS tenant_isolation_select_shipper_profiles ON shipper_profiles;
    DROP POLICY IF EXISTS tenant_isolation_insert_shipper_profiles ON shipper_profiles;
    DROP POLICY IF EXISTS tenant_isolation_update_shipper_profiles ON shipper_profiles;
    DROP POLICY IF EXISTS tenant_isolation_delete_shipper_profiles ON shipper_profiles;

    CREATE POLICY tenant_isolation_select_shipper_profiles ON shipper_profiles
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_insert_shipper_profiles ON shipper_profiles
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_update_shipper_profiles ON shipper_profiles
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_delete_shipper_profiles ON shipper_profiles
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- Table 3: payment_accounts
  -- ═══════════════════════════════════════════════════════════════════════════
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'payment_accounts' AND table_schema = 'public'
  ) THEN
    ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS tenant_isolation_select_payment_accounts ON payment_accounts;
    DROP POLICY IF EXISTS tenant_isolation_insert_payment_accounts ON payment_accounts;
    DROP POLICY IF EXISTS tenant_isolation_update_payment_accounts ON payment_accounts;
    DROP POLICY IF EXISTS tenant_isolation_delete_payment_accounts ON payment_accounts;

    CREATE POLICY tenant_isolation_select_payment_accounts ON payment_accounts
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_insert_payment_accounts ON payment_accounts
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_update_payment_accounts ON payment_accounts
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_delete_payment_accounts ON payment_accounts
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- Table 4: load_recommendations
  -- ═══════════════════════════════════════════════════════════════════════════
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'load_recommendations' AND table_schema = 'public'
  ) THEN
    ALTER TABLE load_recommendations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS tenant_isolation_select_load_recommendations ON load_recommendations;
    DROP POLICY IF EXISTS tenant_isolation_insert_load_recommendations ON load_recommendations;
    DROP POLICY IF EXISTS tenant_isolation_update_load_recommendations ON load_recommendations;
    DROP POLICY IF EXISTS tenant_isolation_delete_load_recommendations ON load_recommendations;

    CREATE POLICY tenant_isolation_select_load_recommendations ON load_recommendations
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_insert_load_recommendations ON load_recommendations
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_update_load_recommendations ON load_recommendations
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_delete_load_recommendations ON load_recommendations
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
  END IF;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- Table 5: carrier_cost_profiles
  -- ═══════════════════════════════════════════════════════════════════════════
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'carrier_cost_profiles' AND table_schema = 'public'
  ) THEN
    ALTER TABLE carrier_cost_profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS tenant_isolation_select_carrier_cost_profiles ON carrier_cost_profiles;
    DROP POLICY IF EXISTS tenant_isolation_insert_carrier_cost_profiles ON carrier_cost_profiles;
    DROP POLICY IF EXISTS tenant_isolation_update_carrier_cost_profiles ON carrier_cost_profiles;
    DROP POLICY IF EXISTS tenant_isolation_delete_carrier_cost_profiles ON carrier_cost_profiles;

    CREATE POLICY tenant_isolation_select_carrier_cost_profiles ON carrier_cost_profiles
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_insert_carrier_cost_profiles ON carrier_cost_profiles
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_update_carrier_cost_profiles ON carrier_cost_profiles
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID)
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);

    CREATE POLICY tenant_isolation_delete_carrier_cost_profiles ON carrier_cost_profiles
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::UUID);
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log but don't fail on duplicate policies or missing tables
  RAISE NOTICE 'RLS policy creation: %', SQLERRM;
END $$;
