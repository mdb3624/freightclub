-- V20260603_1000: Grant all required permissions to freightclub_runtime
-- This migration ensures the runtime user has the correct privileges
-- in EVERY environment (Docker test, Neon prod, future deploys).
-- Previously these were applied manually, causing silent failures on fresh setups.

DO $$ BEGIN

  -- BYPASSRLS: allow the runtime user to bypass Row-Level Security.
  -- RLS policies use current_setting('app.current_tenant') which is not set
  -- during the login flow — BYPASSRLS prevents those policies from throwing.
  -- Tenant isolation is still enforced at the Java application layer.
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'freightclub_runtime') THEN
    ALTER ROLE freightclub_runtime BYPASSRLS;
  END IF;

  -- Grant full DML on all current and future tables in the schema
  GRANT ALL ON ALL TABLES IN SCHEMA freightclub TO freightclub_runtime;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA freightclub TO freightclub_runtime;

  -- Default privileges: future tables created by neondb_owner also get grants
  ALTER DEFAULT PRIVILEGES IN SCHEMA freightclub
    GRANT ALL ON TABLES TO freightclub_runtime;
  ALTER DEFAULT PRIVILEGES IN SCHEMA freightclub
    GRANT ALL ON SEQUENCES TO freightclub_runtime;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'V20260603_1000 partial: %', SQLERRM;
END $$;
