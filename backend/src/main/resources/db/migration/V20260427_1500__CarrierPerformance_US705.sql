-- US-705: Carrier Performance Dashboard
-- Performance metrics and shipper ratings for carriers

DO $$ BEGIN
  CREATE TABLE freightclub.carrier_performance (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    carrier_id VARCHAR(36) NOT NULL,
    load_assigned BIGINT DEFAULT 0,
    load_accepted BIGINT DEFAULT 0,
    load_declined BIGINT DEFAULT 0,
    acceptance_rate NUMERIC(5, 2) DEFAULT 0,
    on_time_rate NUMERIC(5, 2) DEFAULT 0,
    avg_delivery_time_hours NUMERIC(10, 2),
    quality_score NUMERIC(5, 2) DEFAULT 0,
    rating_count BIGINT DEFAULT 0,
    preferred_by_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    UNIQUE(tenant_id, carrier_id)
  );

  CREATE INDEX idx_carrier_performance_tenant_deleted ON freightclub.carrier_performance(tenant_id, deleted_at);
  CREATE INDEX idx_carrier_performance_quality_score ON freightclub.carrier_performance(tenant_id, quality_score DESC);

  ALTER TABLE freightclub.carrier_performance ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "carrier_performance_tenant"
    ON freightclub.carrier_performance
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);

  -- Shipper-specific carrier ratings (immutable audit)
  CREATE TABLE freightclub.shipper_carrier_ratings (
    id VARCHAR(36) PRIMARY KEY,
    carrier_id VARCHAR(36) NOT NULL,
    shipper_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    feedback TEXT,
    criteria JSONB,
    rated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    CONSTRAINT unique_shipper_carrier_rating UNIQUE(tenant_id, carrier_id, shipper_id)
  );

  CREATE INDEX idx_ratings_carrier ON freightclub.shipper_carrier_ratings(tenant_id, carrier_id);
  CREATE INDEX idx_ratings_shipper ON freightclub.shipper_carrier_ratings(tenant_id, shipper_id);

  ALTER TABLE freightclub.shipper_carrier_ratings ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "shipper_carrier_ratings_tenant"
    ON freightclub.shipper_carrier_ratings
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
