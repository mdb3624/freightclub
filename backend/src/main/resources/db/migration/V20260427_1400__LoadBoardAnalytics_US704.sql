-- US-704: Load Board Analytics & Insights
-- Immutable analytics for load posting, matching, and claiming behavior

DO $$ BEGIN
  CREATE TABLE freightclub.load_analytics (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    load_id VARCHAR(36) NOT NULL,
    shipper_id VARCHAR(36),
    posted_at TIMESTAMPTZ NOT NULL,
    claimed_at TIMESTAMPTZ,
    claim_time_seconds INT,
    match_count INT NOT NULL,
    avg_match_score INT,
    match_reason JSONB,
    claimed_by_trucker_id VARCHAR(36),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_load FOREIGN KEY (load_id) REFERENCES freightclub.loads(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
  );

  CREATE INDEX idx_analytics_tenant_date ON freightclub.load_analytics(tenant_id, posted_at DESC);
  CREATE INDEX idx_analytics_claimed ON freightclub.load_analytics(claimed_at DESC, deleted_at);

  ALTER TABLE freightclub.load_analytics ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "load_analytics_tenant"
    ON freightclub.load_analytics
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);

  -- Pre-computed lane aggregates (daily)
  CREATE TABLE freightclub.lane_analytics_daily (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    origin_region VARCHAR(50) NOT NULL,
    dest_region VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    post_count INT NOT NULL,
    claimed_count INT NOT NULL,
    claim_rate DECIMAL(5,2) NOT NULL,
    avg_claim_time_seconds INT,
    avg_rate DECIMAL(8,2),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    UNIQUE(tenant_id, origin_region, dest_region, date)
  );

  CREATE INDEX idx_lane_daily_tenant_date ON freightclub.lane_analytics_daily(tenant_id, date DESC);

  ALTER TABLE freightclub.lane_analytics_daily ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "lane_analytics_tenant"
    ON freightclub.lane_analytics_daily
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
