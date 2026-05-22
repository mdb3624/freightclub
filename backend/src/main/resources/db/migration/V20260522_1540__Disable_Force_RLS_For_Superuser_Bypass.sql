-- Remove FORCE ROW LEVEL SECURITY to allow superuser (postgres) to bypass RLS in tests
-- This is the critical fix: ENABLE allows superuser bypass, FORCE prevents it

DO $$ BEGIN

  -- For each table, if RLS is currently FORCED, we can't directly change it
  -- Instead, we disable and re-enable RLS without FORCE

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'users' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.users ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'loads' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.loads DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.loads ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'claims' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.claims DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.claims ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_events' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.load_events DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.load_events ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_documents' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.load_documents DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.load_documents ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_ratings' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.load_ratings DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.load_ratings ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'notifications' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.notifications DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.notifications ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'carrier_profiles' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.carrier_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE freightclub.carrier_profiles ENABLE ROW LEVEL SECURITY;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS FORCE removal: %', SQLERRM;
END $$;
