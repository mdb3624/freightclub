-- US-881: suspend/reactivate + force-password-reset.
--
-- is_suspended is a new, distinct flag from deleted_at — orthogonal to tenant-level soft-delete
-- (US-881 BR-1). Granted UPDATE (is_suspended) to freightclub_super_user_read, same
-- column-grant pattern as V20260901_1300's dispute resolution and V20260902_1000's
-- is_tenant_admin grant — the Super User's suspend/reactivate action writes through this narrow
-- BYPASSRLS role, in the same transaction as its admin_audit_log entry (US-880).
--
-- password_reset_tokens mirrors refresh_tokens (V20260422_04): no tenant_id, no RLS — keyed
-- purely by user_id, same as refresh tokens already are. The Super User issues a token (via
-- freightclub_super_user_read); the user redeems it themselves via a public self-service
-- endpoint (via the normal freightclub_runtime/JPA path, ungated by RLS since this table has
-- none — same reasoning as refresh_tokens). BR-4 (corrected during implementation): no
-- password-reset-email flow exists in this codebase, so a token is issued and relayed
-- out-of-band by the Super User rather than emailed — the Super User sees/relays the token,
-- never the user's actual new password (AC-4).
DO $$
BEGIN
    ALTER TABLE freightclub.users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

    -- password_hash: force-password-reset invalidates the current password by overwriting it
    -- with a random, unusable hash (never a value the Super User chooses or can predict) —
    -- the user's only way back in is redeeming the reset token issued at the same time.
    GRANT UPDATE (is_suspended, password_hash) ON freightclub.users TO freightclub_super_user_read;

    CREATE TABLE IF NOT EXISTS freightclub.password_reset_tokens (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON freightclub.password_reset_tokens(user_id);

    GRANT SELECT, INSERT ON freightclub.password_reset_tokens TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260902_1300 partial: %', SQLERRM;
END $$;
