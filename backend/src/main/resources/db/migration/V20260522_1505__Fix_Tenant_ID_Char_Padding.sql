-- Fix CHAR(36) column padding issues with tenant_id queries
-- CHAR auto-pads to 36 chars, but VARCHAR parameters don't, causing mismatches in comparisons
-- Convert all tenant_id columns from CHAR(36) to VARCHAR(36)

DO $$ BEGIN

  -- Alter loads table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'loads' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.loads ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter users table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.users ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter claims table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'claims' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.claims ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter load_events table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'load_events' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.load_events ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter load_documents table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'load_documents' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.load_documents ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter load_ratings table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'load_ratings' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.load_ratings ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter notifications table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.notifications ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Alter carrier_profiles table
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'carrier_profiles' AND column_name = 'tenant_id' AND table_schema = 'freightclub'
  ) THEN
    ALTER TABLE freightclub.carrier_profiles ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tenant ID column conversion: %', SQLERRM;
END $$;
