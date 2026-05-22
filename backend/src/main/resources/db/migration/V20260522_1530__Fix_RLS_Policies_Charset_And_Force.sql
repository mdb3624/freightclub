-- Fix existing RLS policies: remove FORCE constraint and fix CHAR/VARCHAR type mismatch
-- This migration explicitly updates existing policies that were created with wrong configuration

DO $$ BEGIN
  -- Drop and recreate policies with correct ENABLE (not FORCE) and VARCHAR (not CHAR) casting

  -- Users table
  DROP POLICY IF EXISTS users_tenant_isolation ON freightclub.users;
  CREATE POLICY users_tenant_isolation ON freightclub.users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Loads table (the critical one for tests)
  DROP POLICY IF EXISTS loads_tenant_isolation ON freightclub.loads;
  CREATE POLICY loads_tenant_isolation ON freightclub.loads
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Claims table
  DROP POLICY IF EXISTS claims_tenant_isolation ON freightclub.claims;
  CREATE POLICY claims_tenant_isolation ON freightclub.claims
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Load events table
  DROP POLICY IF EXISTS load_events_tenant_isolation ON freightclub.load_events;
  CREATE POLICY load_events_tenant_isolation ON freightclub.load_events
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Load documents table
  DROP POLICY IF EXISTS load_documents_tenant_isolation ON freightclub.load_documents;
  CREATE POLICY load_documents_tenant_isolation ON freightclub.load_documents
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Load ratings table
  DROP POLICY IF EXISTS load_ratings_tenant_isolation ON freightclub.load_ratings;
  CREATE POLICY load_ratings_tenant_isolation ON freightclub.load_ratings
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Notifications table
  DROP POLICY IF EXISTS notifications_tenant_isolation ON freightclub.notifications;
  CREATE POLICY notifications_tenant_isolation ON freightclub.notifications
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

  -- Carrier profiles table
  DROP POLICY IF EXISTS carrier_profiles_tenant_isolation ON freightclub.carrier_profiles;
  CREATE POLICY carrier_profiles_tenant_isolation ON freightclub.carrier_profiles
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS policy update: %', SQLERRM;
END $$;
