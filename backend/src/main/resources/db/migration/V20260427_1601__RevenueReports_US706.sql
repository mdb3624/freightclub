-- US-706: Revenue & Profitability Reports
-- Financial tracking, commission calculation, profitability analysis

DO $$ BEGIN
  CREATE TABLE freightclub.load_financial (
    id VARCHAR(36) PRIMARY KEY,
    load_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    shipper_id VARCHAR(36) NOT NULL,
    carrier_id VARCHAR(36) NOT NULL,
    origin_region VARCHAR(50) NOT NULL,
    dest_region VARCHAR(50) NOT NULL,
    equipment_type VARCHAR(50),
    rate_per_mile DECIMAL(8,2) NOT NULL,
    estimated_miles INT,
    total_revenue DECIMAL(12,2) NOT NULL,
    commission DECIMAL(12,2) NOT NULL,
    net_revenue DECIMAL(12,2) NOT NULL,
    settled_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_load FOREIGN KEY (load_id) REFERENCES freightclub.loads(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES freightclub.users(id)
  );

  CREATE INDEX idx_financial_shipper ON freightclub.load_financial(tenant_id, shipper_id, settled_at);
  CREATE INDEX idx_financial_date ON freightclub.load_financial(recorded_at DESC);

  ALTER TABLE freightclub.load_financial ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "load_financial_tenant"
    ON freightclub.load_financial
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);

  -- Lane revenue aggregates (daily)
  CREATE TABLE freightclub.lane_revenue_daily (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    origin_region VARCHAR(50) NOT NULL,
    dest_region VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    load_count INT NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    total_commission DECIMAL(12,2) NOT NULL,
    net_revenue DECIMAL(12,2) NOT NULL,
    avg_rate DECIMAL(8,2),
    margin_percent DECIMAL(5,2),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    UNIQUE(tenant_id, origin_region, dest_region, date)
  );

  CREATE INDEX idx_lane_revenue_date ON freightclub.lane_revenue_daily(tenant_id, date DESC);

  -- Equipment revenue aggregates (daily)
  CREATE TABLE freightclub.equipment_revenue_daily (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    load_count INT NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    net_revenue DECIMAL(12,2) NOT NULL,
    avg_rate DECIMAL(8,2),
    margin_percent DECIMAL(5,2),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    UNIQUE(tenant_id, equipment_type, date)
  );

  ALTER TABLE freightclub.lane_revenue_daily ENABLE ROW LEVEL SECURITY;
  ALTER TABLE freightclub.equipment_revenue_daily ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "lane_revenue_tenant" ON freightclub.lane_revenue_daily
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);

  CREATE POLICY "equipment_revenue_tenant" ON freightclub.equipment_revenue_daily
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
