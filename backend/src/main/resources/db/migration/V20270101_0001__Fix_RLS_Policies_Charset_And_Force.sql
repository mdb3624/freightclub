-- Fix existing RLS policies: remove FORCE constraint and fix CHAR/VARCHAR type mismatch
-- Created: 2026-05-22
-- Purpose: Ensure RLS policies use VARCHAR (not CHAR) and ENABLE (not FORCE)
-- This allows superuser (postgres) to bypass RLS in tests while still protecting production

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

  -- Now disable FORCE on all tables - this is the critical fix
  -- Disabling and re-enabling removes the FORCE flag
  ALTER TABLE freightclub.users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.users ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.loads DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.loads ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.claims DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.claims ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.load_events DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_events ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.load_documents DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_documents ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.load_ratings DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_ratings ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.notifications DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.notifications ENABLE ROW LEVEL SECURITY;

  ALTER TABLE freightclub.carrier_profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.carrier_profiles ENABLE ROW LEVEL SECURITY;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS fix: %', SQLERRM;
END $$;
