-- US-885: scoped, time-boxed Super User impersonation. No tenant_id/RLS — mirrors
-- refresh_tokens/password_reset_tokens (keyed purely by user ids), accessed exclusively through
-- freightclub_super_user_read (BYPASSRLS), same as every other Super User surface.
DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS freightclub.impersonation_sessions (
        id VARCHAR(36) PRIMARY KEY,
        super_user_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
        target_user_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
        started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ended_at TIMESTAMP WITH TIME ZONE,
        end_reason VARCHAR(20)
    );

    CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_target ON freightclub.impersonation_sessions(target_user_id);
    -- BR-1/AC-2: the timeout-reconciliation job's lookup of still-open, expired sessions.
    CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_open ON freightclub.impersonation_sessions(expires_at) WHERE ended_at IS NULL;

    GRANT SELECT, INSERT, UPDATE ON freightclub.impersonation_sessions TO freightclub_super_user_read;

    -- Needed to build a readable target summary (AC-1's banner-naming requirement) without
    -- widening the existing users grant beyond what's necessary — still never password_hash.
    GRANT SELECT (first_name, last_name) ON freightclub.users TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260902_1600 partial: %', SQLERRM;
END $$;
