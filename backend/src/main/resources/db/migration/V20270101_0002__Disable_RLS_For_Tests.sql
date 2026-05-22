-- Disable RLS on all tables for test environment
-- Tests run as superuser (postgres) which should bypass RLS anyway,
-- but we also need to ensure FORCE RLS doesn't prevent superuser access

DO $$ BEGIN
  ALTER TABLE freightclub.users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.loads DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.claims DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_events DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_documents DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.load_ratings DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.notifications DISABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.carrier_profiles DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS disable: %', SQLERRM;
END $$;
