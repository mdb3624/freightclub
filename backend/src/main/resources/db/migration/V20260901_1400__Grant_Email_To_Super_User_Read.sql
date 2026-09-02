-- US-751: DisputeResolutionService.listOpenDisputes() joins freightclub.users to show who
-- raised each dispute (raised_by_email) — V20260901_1200's original grant on `users` for
-- freightclub_super_user_read omitted `email`, discovered via a real E2E run against the
-- disputes endpoint ("permission denied for table users"). New migration rather than editing
-- V20260901_1200 in place, per this project's standing convention for fixing an already-
-- committed migration (see V20260721_1403's relationship to V20260721_1401).
DO $$
BEGIN
    GRANT SELECT (id, tenant_id, role, email, deleted_at) ON freightclub.users TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260901_1400 partial: %', SQLERRM;
END $$;
