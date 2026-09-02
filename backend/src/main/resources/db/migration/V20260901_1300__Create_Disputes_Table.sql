-- US-751 (Dispute Resolution Tools): a Shipper or Carrier flags a problem with a specific
-- load; a Super User (ADMIN) resolves it. Per CHG-869, `claims` (load-claiming) does not
-- cover this concept — this is a new, dedicated table.
DO $$
BEGIN
    CREATE TABLE freightclub.disputes (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
        load_id VARCHAR(36) NOT NULL REFERENCES freightclub.loads(id),
        raised_by_user_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
        resolution_outcome VARCHAR(30),
        resolution_reason TEXT,
        resolved_by_user_id VARCHAR(36) REFERENCES freightclub.users(id),
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

    CREATE INDEX idx_disputes_tenant_id ON freightclub.disputes(tenant_id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_disputes_status ON freightclub.disputes(status) WHERE deleted_at IS NULL;

    ALTER TABLE freightclub.disputes ENABLE ROW LEVEL SECURITY;

    -- Standard tenant-scoped policy: a tenant's own members can raise and see their own
    -- disputes through the normal freightclub_runtime/JPA path (BR-1 in US-751 only restricts
    -- the Super User *resolution queue*, not a tenant seeing its own raised disputes).
    CREATE POLICY disputes_tenant_isolation ON freightclub.disputes
        USING (tenant_id = current_setting('app.current_tenant', true))
        WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

    -- Cross-tenant queue/resolution for the Super User surface — same narrow, read-mostly
    -- BYPASSRLS role as the dashboard (V20260901_1200), extended here with the one write this
    -- surface needs (recording a resolution). Never INSERT/DELETE — disputes are only ever
    -- raised through the tenant-scoped path above.
    GRANT SELECT, UPDATE (status, resolution_outcome, resolution_reason, resolved_by_user_id, resolved_at, updated_at)
        ON freightclub.disputes TO freightclub_super_user_read;
EXCEPTION WHEN duplicate_table THEN
    NULL;
END $$;
