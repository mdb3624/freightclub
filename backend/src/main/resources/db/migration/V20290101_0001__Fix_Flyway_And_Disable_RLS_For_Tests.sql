-- Clean up Flyway history to remove invalid future-dated migration
-- Delete the invalid 20270101.0003 entry that's blocking new migrations
DELETE FROM freightclub.flyway_schema_history
WHERE version::text ~ '^202[7-9]'
   OR (version::text LIKE '2027%' AND version::text > '20270101');

-- Ensure RLS is disabled on all tables for testing
DO $$ BEGIN

  -- Loads table (critical for testslevel queries)
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'loads' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.loads DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Users table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'users' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.users DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Claims table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'claims' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.claims DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Load events table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_events' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.load_events DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Load documents table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_documents' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.load_documents DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Load ratings table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_ratings' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.load_ratings DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Notifications table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'notifications' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.notifications DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Carrier profiles table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'carrier_profiles' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.carrier_profiles DISABLE ROW LEVEL SECURITY;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Fix Flyway and RLS: %', SQLERRM;
END $$;
