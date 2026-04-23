-- Adds cancel_reason column and enables RLS on the new load_aggregates table.
-- Mirrors the tenant isolation pattern from V20260421_001.

ALTER TABLE load_aggregates
    ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- RLS enforcement
ALTER TABLE load_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_aggregates FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON load_aggregates
    USING (tenant_id::text = current_setting('app.current_tenant', true));

-- Composite indexes — tenant_id leads per ARCHITECTURE.md §2
CREATE INDEX IF NOT EXISTS idx_load_aggregates_tenant_status
    ON load_aggregates (tenant_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_load_aggregates_tenant_created
    ON load_aggregates (tenant_id, created_at DESC) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON load_aggregates TO app_user;
