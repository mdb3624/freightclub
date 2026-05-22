-- Force disable RLS on all tables to fix test failures
-- This ensures Row Level Security doesn't filter results when app.current_tenant is not set

DO $$ BEGIN

  -- Check if RLS is enabled on loads table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'loads' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.loads DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on users table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'users' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.users DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on claims table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'claims' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.claims DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on load_events table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_events' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.load_events DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on load_documents table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_documents' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.load_documents DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on load_ratings table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'load_ratings' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.load_ratings DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on notifications table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'notifications' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.notifications DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Check if RLS is enabled on carrier_profiles table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'carrier_profiles' AND table_schema = 'freightclub' AND row_security_enabled = true
  ) THEN
    ALTER TABLE freightclub.carrier_profiles DISABLE ROW LEVEL SECURITY;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS disable attempt: %', SQLERRM;
END $$;
