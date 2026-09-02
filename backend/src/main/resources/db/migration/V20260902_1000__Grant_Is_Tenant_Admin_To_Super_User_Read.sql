-- Council-review-driven fix (2026-09-02): TenantAdminReconciliationService's cross-tenant
-- zero-admin detection query needs to read users.is_tenant_admin through the
-- freightclub_super_user_read role (V20260901_1200 granted id/tenant_id/role/deleted_at only —
-- same gap pattern as V20260901_1400's missing email grant, caught before deploy this time).
DO $$
BEGIN
    GRANT SELECT (is_tenant_admin) ON freightclub.users TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260902_1000 partial: %', SQLERRM;
END $$;
