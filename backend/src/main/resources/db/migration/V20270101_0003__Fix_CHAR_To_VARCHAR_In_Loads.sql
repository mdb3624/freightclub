-- Fix CHAR(36) columns to VARCHAR(36) to prevent padding issues
-- CHAR(36) pads with spaces, causing mismatches in queries
-- This affects id, shipper_id, and trucker_id columns

DO $$ BEGIN
  -- Fix loads table
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'loads' AND table_schema = 'freightclub'
  ) THEN
    -- Convert id from CHAR to VARCHAR
    ALTER TABLE freightclub.loads ALTER COLUMN id TYPE VARCHAR(36) USING RTRIM(id);

    -- Convert shipper_id from CHAR to VARCHAR
    ALTER TABLE freightclub.loads ALTER COLUMN shipper_id TYPE VARCHAR(36) USING RTRIM(shipper_id);

    -- Convert trucker_id from CHAR to VARCHAR
    ALTER TABLE freightclub.loads ALTER COLUMN trucker_id TYPE VARCHAR(36) USING RTRIM(trucker_id);
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'CHAR to VARCHAR fix: %', SQLERRM;
END $$;
