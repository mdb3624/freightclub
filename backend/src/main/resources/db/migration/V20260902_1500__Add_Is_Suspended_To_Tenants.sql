-- US-884: tenant-level suspend/reactivate — independent of US-881's user-level is_suspended
-- flag (BR-1: a tenant lock blocks every user in that tenant without touching their individual
-- flags). Same column-grant pattern as V20260902_1300's users.is_suspended grant: the Super
-- User's suspend/reactivate action writes through freightclub_super_user_read (BYPASSRLS), in
-- the same transaction as its admin_audit_log entry (US-880).
DO $$
BEGIN
    ALTER TABLE freightclub.tenants ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

    GRANT SELECT (is_suspended) ON freightclub.tenants TO freightclub_super_user_read;
    GRANT UPDATE (is_suspended) ON freightclub.tenants TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260902_1500 partial: %', SQLERRM;
END $$;
