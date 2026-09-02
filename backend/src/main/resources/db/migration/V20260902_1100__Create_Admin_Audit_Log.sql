-- US-880 (Super User Audit Log Foundation): precondition for US-881/882/884/885/886's write
-- actions. Append-only enforced at the DB grant level, not just application logic — no UPDATE
-- or DELETE is granted to any role, not even freightclub_super_user_read (BYPASSRLS), so there
-- is no code path, accidental or deliberate, that can modify or remove an entry once written.
--
-- No RLS: this table is cross-tenant by nature (a Super User action can target any tenant) and
-- deliberately inaccessible to freightclub_runtime entirely — the gate is the GRANT itself
-- (only freightclub_super_user_read has any privilege here), not a policy that could be
-- misconfigured. freightclub_runtime is never granted anything on this table.
DO $$
BEGIN
    CREATE TABLE freightclub.admin_audit_log (
        id VARCHAR(36) PRIMARY KEY,
        actor_user_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
        action_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(36) NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_admin_audit_log_target_id ON freightclub.admin_audit_log(target_id);
    CREATE INDEX idx_admin_audit_log_created_at ON freightclub.admin_audit_log(created_at DESC);

    GRANT SELECT, INSERT ON freightclub.admin_audit_log TO freightclub_super_user_read;
EXCEPTION WHEN duplicate_table THEN
    NULL;
END $$;
