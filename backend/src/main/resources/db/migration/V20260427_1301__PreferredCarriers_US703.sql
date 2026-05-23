-- US-703: Shipper Preferred Carrier Network
-- Creates tables for preferred/blocked carrier relationships

DO $$ BEGIN
  CREATE TABLE freightclub.preferred_carriers (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    shipper_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_trucker FOREIGN KEY (trucker_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    CONSTRAINT unique_preferred_carrier UNIQUE(tenant_id, shipper_id, trucker_id)
  );

  CREATE TABLE freightclub.blocked_carriers (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    shipper_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,
    blocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_trucker FOREIGN KEY (trucker_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
  );

  -- Indexes for query performance
  CREATE INDEX idx_preferred_shipper ON freightclub.preferred_carriers(tenant_id, shipper_id, deleted_at);
  CREATE INDEX idx_blocked_shipper ON freightclub.blocked_carriers(tenant_id, shipper_id);

  -- Row-Level Security
  ALTER TABLE freightclub.preferred_carriers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.blocked_carriers ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "preferred_carriers_tenant"
    ON freightclub.preferred_carriers
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);

  CREATE POLICY "blocked_carriers_tenant"
    ON freightclub.blocked_carriers
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
