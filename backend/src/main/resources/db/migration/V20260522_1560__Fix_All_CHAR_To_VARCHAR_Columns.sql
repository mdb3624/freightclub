-- Fix ALL CHAR(36) columns to VARCHAR(36) to prevent padding issues
-- CHAR(36) pads with spaces, causing mismatches in queries across all multi-tenancy filters
-- This migration converts all ID and tenant_id columns in all core entities

DO $$ BEGIN

  -- Claims table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'claims' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.claims ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.claims ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
    ALTER TABLE freightclub.claims ALTER COLUMN load_id TYPE VARCHAR(36) USING RTRIM(load_id);
    ALTER TABLE freightclub.claims ALTER COLUMN trucker_id TYPE VARCHAR(36) USING RTRIM(trucker_id);
  END IF;

  -- Load documents table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'load_documents' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.load_documents ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.load_documents ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
    ALTER TABLE freightclub.load_documents ALTER COLUMN load_id TYPE VARCHAR(36) USING RTRIM(load_id);
    ALTER TABLE freightclub.load_documents ALTER COLUMN uploaded_by TYPE VARCHAR(36) USING RTRIM(uploaded_by);
  END IF;

  -- Loads table (CRITICAL: was missing from original migration)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loads' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.loads ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.loads ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
    ALTER TABLE freightclub.loads ALTER COLUMN shipper_id TYPE VARCHAR(36) USING RTRIM(shipper_id);
    ALTER TABLE freightclub.loads ALTER COLUMN trucker_id TYPE VARCHAR(36) USING RTRIM(trucker_id);
  END IF;

  -- Load events table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'load_events' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.load_events ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.load_events ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
    ALTER TABLE freightclub.load_events ALTER COLUMN load_id TYPE VARCHAR(36) USING RTRIM(load_id);
    ALTER TABLE freightclub.load_events ALTER COLUMN actor_id TYPE VARCHAR(36) USING RTRIM(actor_id);
  END IF;

  -- Notifications table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.notifications ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.notifications ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
    ALTER TABLE freightclub.notifications ALTER COLUMN user_id TYPE VARCHAR(36) USING RTRIM(user_id);
    ALTER TABLE freightclub.notifications ALTER COLUMN load_id TYPE VARCHAR(36) USING RTRIM(load_id);
  END IF;

  -- Load ratings table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'load_ratings' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.load_ratings ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.load_ratings ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
    ALTER TABLE freightclub.load_ratings ALTER COLUMN load_id TYPE VARCHAR(36) USING RTRIM(load_id);
    ALTER TABLE freightclub.load_ratings ALTER COLUMN rater_id TYPE VARCHAR(36) USING RTRIM(rater_id);
    ALTER TABLE freightclub.load_ratings ALTER COLUMN ratee_id TYPE VARCHAR(36) USING RTRIM(ratee_id);
  END IF;

  -- Refresh tokens table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'refresh_tokens' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.refresh_tokens ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.refresh_tokens ALTER COLUMN user_id TYPE VARCHAR(36) USING RTRIM(user_id);
  END IF;

  -- Tenants table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.tenants ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
  END IF;

  -- Users table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'freightclub') THEN
    ALTER TABLE freightclub.users ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);
    ALTER TABLE freightclub.users ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'CHAR to VARCHAR fix (all tables): %', SQLERRM;
END $$;
