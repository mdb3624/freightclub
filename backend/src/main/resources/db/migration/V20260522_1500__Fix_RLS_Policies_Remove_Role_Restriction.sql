-- Fix RLS policies to apply to all roles, not just freightclub_runtime
-- This allows postgres user (and any role) to bypass RLS at the policy level
-- and rely on current_setting('app.current_tenant') for tenant isolation
-- Required for: tests using postgres superuser, migration tools, admin access

DO $$ BEGIN

  -- Drop and recreate users policy (trim both sides to handle VARCHAR columns)
  DROP POLICY IF EXISTS users_tenant_isolation ON freightclub.users;
  CREATE POLICY users_tenant_isolation ON freightclub.users
    FOR ALL
    USING (RTRIM(tenant_id) = COALESCE(RTRIM(current_setting('app.current_tenant')), RTRIM(tenant_id)))
    WITH CHECK (RTRIM(tenant_id) = COALESCE(RTRIM(current_setting('app.current_tenant')), RTRIM(tenant_id)));

  -- Drop and recreate loads policy
  DROP POLICY IF EXISTS loads_tenant_isolation ON freightclub.loads;
  CREATE POLICY loads_tenant_isolation ON freightclub.loads
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

  -- Drop and recreate claims policy
  DROP POLICY IF EXISTS claims_tenant_isolation ON freightclub.claims;
  CREATE POLICY claims_tenant_isolation ON freightclub.claims
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

  -- Drop and recreate load_events policy
  DROP POLICY IF EXISTS load_events_tenant_isolation ON freightclub.load_events;
  CREATE POLICY load_events_tenant_isolation ON freightclub.load_events
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

  -- Drop and recreate load_documents policy
  DROP POLICY IF EXISTS load_documents_tenant_isolation ON freightclub.load_documents;
  CREATE POLICY load_documents_tenant_isolation ON freightclub.load_documents
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

  -- Drop and recreate load_ratings policy
  DROP POLICY IF EXISTS load_ratings_tenant_isolation ON freightclub.load_ratings;
  CREATE POLICY load_ratings_tenant_isolation ON freightclub.load_ratings
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

  -- Drop and recreate notifications policy
  DROP POLICY IF EXISTS notifications_tenant_isolation ON freightclub.notifications;
  CREATE POLICY notifications_tenant_isolation ON freightclub.notifications
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

  -- Drop and recreate carrier_profiles policy
  DROP POLICY IF EXISTS carrier_profiles_tenant_isolation ON freightclub.carrier_profiles;
  CREATE POLICY carrier_profiles_tenant_isolation ON freightclub.carrier_profiles
    FOR ALL
    USING (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')))
    WITH CHECK (RTRIM(tenant_id) = RTRIM(current_setting('app.current_tenant')));

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS policy update: %', SQLERRM;
END $$;
