-- US-712: Shipper Public Profile (Payment Speed, Rating)
-- Creates shipper_reputation table with RLS policies

DO $$ BEGIN
  CREATE TABLE freightclub.shipper_reputation (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL,
      shipper_id VARCHAR(36) NOT NULL,
      average_payment_speed_days NUMERIC(5, 1),
      completed_load_count INT NOT NULL DEFAULT 0,
      cancelled_load_count INT NOT NULL DEFAULT 0,
      open_dispute_count INT NOT NULL DEFAULT 0,
      last_calculated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_shipper_reputation_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
  );

  CREATE INDEX idx_shipper_reputation_tenant_shipper ON freightclub.shipper_reputation(tenant_id, shipper_id) WHERE deleted_at IS NULL;
  CREATE INDEX idx_shipper_reputation_deleted_at ON freightclub.shipper_reputation(deleted_at);

  -- Row-Level Security: shipper_reputation visible only to users in same tenant
  ALTER TABLE freightclub.shipper_reputation ENABLE ROW LEVEL SECURITY;

  CREATE POLICY shipper_reputation_tenant_isolation ON freightclub.shipper_reputation
      USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY shipper_reputation_tenant_isolation_update ON freightclub.shipper_reputation
      FOR UPDATE
      USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));

  CREATE POLICY shipper_reputation_tenant_isolation_delete ON freightclub.shipper_reputation
      FOR DELETE
      USING (tenant_id = CURRENT_SETTING('app.current_tenant')::VARCHAR(36));
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
