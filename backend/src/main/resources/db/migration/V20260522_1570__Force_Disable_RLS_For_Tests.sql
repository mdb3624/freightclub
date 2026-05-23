-- Force RLS to be completely disabled for all test tables
-- This ensures PostgreSQL doesn't filter any rows based on tenant_id policies

DO $$ BEGIN

  -- Drop all RLS policies that might exist
  DROP POLICY IF EXISTS loads_tenant_isolation ON freightclub.loads;
  DROP POLICY IF EXISTS users_tenant_isolation ON freightclub.users;
  DROP POLICY IF EXISTS claims_tenant_isolation ON freightclub.claims;
  DROP POLICY IF EXISTS load_events_tenant_isolation ON freightclub.load_events;
  DROP POLICY IF EXISTS load_documents_tenant_isolation ON freightclub.load_documents;
  DROP POLICY IF EXISTS load_ratings_tenant_isolation ON freightclub.load_ratings;
  DROP POLICY IF EXISTS notifications_tenant_isolation ON freightclub.notifications;
  DROP POLICY IF EXISTS carrier_profiles_tenant_isolation ON freightclub.carrier_profiles;
  DROP POLICY IF EXISTS refresh_tokens_tenant_isolation ON freightclub.refresh_tokens;
  DROP POLICY IF EXISTS tenants_tenant_isolation ON freightclub.tenants;

  -- Disable RLS entirely on all tables (superuser bypass)
  ALTER TABLE freightclub.loads DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.claims DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_events DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_documents DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_ratings DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.notifications DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.carrier_profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.refresh_tokens DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.tenants DISABLE ROW LEVEL SECURITY;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Force Disable RLS: %', SQLERRM;
END $$;
