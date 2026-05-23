-- US-705: Carrier Performance Dashboard
-- Performance metrics and shipper ratings for carriers

DO $$ BEGIN
  CREATE TABLE freightclub.carrier_performance (
    id VARCHAR(36) PRIMARY KEY,
    carrier_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    load_assigned INT NOT NULL,
    load_accepted INT NOT NULL,
    load_declined INT NOT NULL,
    acceptance_rate DECIMAL(5,2) NOT NULL,
    on_time_count INT NOT NULL,
    late_count INT NOT NULL,
    on_time_rate DECIMAL(5,2) NOT NULL,
    avg_delivery_time INT,
    quality_score DECIMAL(3,2),
    rating_count INT DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
  );

  CREATE INDEX idx_performance_carrier ON freightclub.carrier_performance(tenant_id, carrier_id);
  CREATE INDEX idx_performance_date ON freightclub.carrier_performance(recorded_at DESC);

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
