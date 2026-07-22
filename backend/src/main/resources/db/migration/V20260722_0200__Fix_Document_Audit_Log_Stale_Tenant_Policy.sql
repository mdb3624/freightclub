-- Pre-existing production bug, discovered via US-858's production smoke test (load creation
-- 500'd with "unrecognized configuration parameter app.tenant_id").
--
-- V20260427_1300__DocumentAuditLog_US308.sql originally created document_audit_log's SELECT/
-- INSERT policies using current_setting('app.tenant_id') (the wrong/stale GUC name — the app
-- has only ever set app.current_tenant). That was fixed in the migration FILE on 2026-05-22
-- (commit 315569ee, "Fixed RLS setting names from app.current_tenant_id to app.current_tenant"),
-- but Flyway does not re-run an already-applied migration when its file content changes
-- (validate-on-migrate: false means it does not even detect the checksum drift) — so any
-- environment that had already run V20260427_1300 before that fix (production, deployed
-- 2026-05-06 per git history) kept the original broken policy forever, while every
-- freshly-migrated environment (Docker test, this session's CI fix) got the corrected version
-- for free and never surfaced the bug. Same root pattern as V20260721_1403/V20260721_1407.
DO $$
BEGIN
    DROP POLICY IF EXISTS document_audit_log_select_isolation ON freightclub.document_audit_log;
    CREATE POLICY document_audit_log_select_isolation ON freightclub.document_audit_log
        AS PERMISSIVE FOR SELECT TO freightclub_runtime
        USING (tenant_id = current_setting('app.current_tenant', true));

    DROP POLICY IF EXISTS document_audit_log_insert ON freightclub.document_audit_log;
    CREATE POLICY document_audit_log_insert ON freightclub.document_audit_log
        AS PERMISSIVE FOR INSERT TO freightclub_runtime
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true));
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260722_0200 partial: %', SQLERRM;
END $$;
