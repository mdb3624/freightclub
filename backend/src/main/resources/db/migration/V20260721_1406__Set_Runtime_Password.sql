-- US-857: Docker test env previously ran freightclub_runtime as the Postgres bootstrap
-- superuser (POSTGRES_USER), so it never needed a password set via SQL — the postgres
-- image handled that directly. Fixing the test-env RLS gap (freightclub_runtime must be a
-- real, non-superuser role there, mirroring prod) means it now needs a password set here,
-- same placeholder mechanism as freightclub_login_lookup (V20260721_1400).
--
-- In prod this is a no-op change of mechanism, not intent: freightclub_runtime's password
-- was previously set out-of-band on Neon; this migration makes it Flyway-managed instead,
-- via DB_RUNTIME_PASSWORD (already an existing env var per CLAUDE.local.md) — which also
-- means rotating DB_RUNTIME_PASSWORD and redeploying now rotates this role's credential
-- automatically, closing the previously-deferred credential-rotation gap as a side effect.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'freightclub_runtime') THEN
        ALTER ROLE freightclub_runtime PASSWORD '${runtime_password}';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260721_1404 partial: %', SQLERRM;
END $$;
