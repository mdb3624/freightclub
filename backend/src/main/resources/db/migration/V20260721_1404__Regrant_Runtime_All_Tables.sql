-- US-857: safety net found during Docker Pre-Test Protocol run — ThemeStateSeparationMigrationTest
-- expected freightclub_runtime to have grants on user_preferences and found none, after the
-- Docker test env stopped running freightclub_runtime as the Postgres bootstrap superuser
-- (V20260721_1403 test-env fix in docker-compose.test.yml). V20260603_1000's blanket GRANT +
-- ALTER DEFAULT PRIVILEGES should already cover every table, but re-asserting it here —
-- idempotent, harmless if already correct — is cheaper than root-causing exactly why one
-- table's default-privilege inheritance didn't take, and closes the gap regardless of cause.
DO $$
BEGIN
    GRANT ALL ON ALL TABLES IN SCHEMA freightclub TO freightclub_runtime;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA freightclub TO freightclub_runtime;
    ALTER DEFAULT PRIVILEGES IN SCHEMA freightclub GRANT ALL ON TABLES TO freightclub_runtime;
    ALTER DEFAULT PRIVILEGES IN SCHEMA freightclub GRANT ALL ON SEQUENCES TO freightclub_runtime;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1404 partial: %', SQLERRM;
END $$;
