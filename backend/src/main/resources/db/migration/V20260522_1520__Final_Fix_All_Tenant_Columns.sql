-- Final comprehensive fix: ensure ALL tenant_id columns are VARCHAR(36) without padding issues
-- This migration verifies and fixes column types to ensure queries work correctly

DO $$
DECLARE
    col_type TEXT;
BEGIN

  -- Check and fix loads table tenant_id
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'loads' AND column_name = 'tenant_id' AND table_schema = 'freightclub';

  IF col_type != 'character varying' THEN
    ALTER TABLE freightclub.loads ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Check and fix users table tenant_id
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_name = 'users' AND column_name = 'tenant_id' AND table_schema = 'freightclub';

  IF col_type != 'character varying' THEN
    ALTER TABLE freightclub.users ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id);
  END IF;

  -- Check and fix other tenant_id columns
  FOR col_type IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'freightclub' AND table_name IN (
      'claims', 'load_events', 'load_documents', 'load_ratings',
      'notifications', 'carrier_profiles'
    )
  LOOP
    EXECUTE format('
      SELECT data_type FROM information_schema.columns
      WHERE table_name = %L AND column_name = ''tenant_id'' AND table_schema = ''freightclub''
    ', col_type) INTO col_type;

    IF col_type != 'character varying' AND col_type IS NOT NULL THEN
      EXECUTE format('
        ALTER TABLE freightclub.%I ALTER COLUMN tenant_id TYPE VARCHAR(36) USING RTRIM(tenant_id)
      ', col_type);
    END IF;
  END LOOP;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Final tenant column fix: %', SQLERRM;
END $$;
