-- US-820: Create index for KPI summary queries
-- Composite index on (tenant_id, deleted_at, status) for fast filtering

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'loads'
        AND indexname = 'idx_loads_tenant_deleted_status'
    ) THEN
        CREATE INDEX idx_loads_tenant_deleted_status
        ON loads(tenant_id, deleted_at, status);
    END IF;
END $$;
