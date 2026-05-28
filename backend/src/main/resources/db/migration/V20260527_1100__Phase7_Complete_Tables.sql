-- Phase 7: Carrier Management & Financial Intelligence - Complete Table Schema

-- US-704: Load Board Analytics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'load_analytics' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.load_analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      load_id UUID NOT NULL,
      posted_at TIMESTAMPTZ NOT NULL,
      claimed_at TIMESTAMPTZ,
      truck_id UUID,
      match_count INTEGER DEFAULT 0,
      avg_match_score NUMERIC(5, 2),
      claim_time_seconds INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_load_analytics_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
    );
    CREATE INDEX idx_load_analytics_tenant_deleted ON freightclub.load_analytics(tenant_id, deleted_at);
    CREATE INDEX idx_load_analytics_posted_at ON freightclub.load_analytics(posted_at);
    CREATE INDEX idx_load_analytics_claimed_at ON freightclub.load_analytics(claimed_at);
    ALTER TABLE freightclub.load_analytics ENABLE ROW LEVEL SECURITY;
    CREATE POLICY load_analytics_tenant_isolation ON freightclub.load_analytics
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-704: Lane Analytics Daily Aggregates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lane_analytics_daily' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.lane_analytics_daily (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      origin_zip VARCHAR(10) NOT NULL,
      destination_zip VARCHAR(10) NOT NULL,
      analytics_date DATE NOT NULL,
      loads_posted INTEGER DEFAULT 0,
      loads_claimed INTEGER DEFAULT 0,
      avg_claim_time_hours NUMERIC(10, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_lane_analytics_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, origin_zip, destination_zip, analytics_date)
    );
    CREATE INDEX idx_lane_analytics_tenant_date ON freightclub.lane_analytics_daily(tenant_id, analytics_date);
    ALTER TABLE freightclub.lane_analytics_daily ENABLE ROW LEVEL SECURITY;
    CREATE POLICY lane_analytics_tenant_isolation ON freightclub.lane_analytics_daily
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-705: Carrier Performance Metrics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrier_performance' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.carrier_performance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      carrier_id UUID NOT NULL,
      acceptance_rate NUMERIC(5, 2) DEFAULT 0,
      on_time_rate NUMERIC(5, 2) DEFAULT 0,
      avg_delivery_time_hours NUMERIC(10, 2),
      quality_score NUMERIC(5, 2) DEFAULT 0,
      preferred_by_count INTEGER DEFAULT 0,
      loads_accepted INTEGER DEFAULT 0,
      loads_completed INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_carrier_performance_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, carrier_id)
    );
    CREATE INDEX idx_carrier_performance_tenant_deleted ON freightclub.carrier_performance(tenant_id, deleted_at);
    CREATE INDEX idx_carrier_performance_quality_score ON freightclub.carrier_performance(tenant_id, quality_score DESC);
    ALTER TABLE freightclub.carrier_performance ENABLE ROW LEVEL SECURITY;
    CREATE POLICY carrier_performance_tenant_isolation ON freightclub.carrier_performance
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-706: Load Financial Data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'load_financial' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.load_financial (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      load_id UUID NOT NULL,
      total_revenue NUMERIC(12, 2) NOT NULL,
      commission NUMERIC(12, 2) NOT NULL,
      net_revenue NUMERIC(12, 2) NOT NULL,
      shipper_id UUID NOT NULL,
      carrier_id UUID,
      financial_date DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_load_financial_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, load_id)
    );
    CREATE INDEX idx_load_financial_tenant_deleted ON freightclub.load_financial(tenant_id, deleted_at);
    CREATE INDEX idx_load_financial_shipper ON freightclub.load_financial(tenant_id, shipper_id, financial_date);
    CREATE INDEX idx_load_financial_carrier ON freightclub.load_financial(tenant_id, carrier_id, financial_date);
    ALTER TABLE freightclub.load_financial ENABLE ROW LEVEL SECURITY;
    CREATE POLICY load_financial_tenant_isolation ON freightclub.load_financial
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-706: Lane Revenue Daily Aggregates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lane_revenue_daily' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.lane_revenue_daily (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      origin_zip VARCHAR(10) NOT NULL,
      destination_zip VARCHAR(10) NOT NULL,
      revenue_date DATE NOT NULL,
      total_revenue NUMERIC(12, 2) DEFAULT 0,
      total_commission NUMERIC(12, 2) DEFAULT 0,
      net_revenue NUMERIC(12, 2) DEFAULT 0,
      load_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_lane_revenue_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, origin_zip, destination_zip, revenue_date)
    );
    CREATE INDEX idx_lane_revenue_tenant_date ON freightclub.lane_revenue_daily(tenant_id, revenue_date);
    ALTER TABLE freightclub.lane_revenue_daily ENABLE ROW LEVEL SECURITY;
    CREATE POLICY lane_revenue_tenant_isolation ON freightclub.lane_revenue_daily
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-706: Carrier Revenue Daily Aggregates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrier_revenue_daily' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.carrier_revenue_daily (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      carrier_id UUID NOT NULL,
      revenue_date DATE NOT NULL,
      loads_completed INTEGER DEFAULT 0,
      total_revenue NUMERIC(12, 2) DEFAULT 0,
      avg_revenue_per_load NUMERIC(12, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_carrier_revenue_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, carrier_id, revenue_date)
    );
    CREATE INDEX idx_carrier_revenue_tenant_date ON freightclub.carrier_revenue_daily(tenant_id, revenue_date);
    ALTER TABLE freightclub.carrier_revenue_daily ENABLE ROW LEVEL SECURITY;
    CREATE POLICY carrier_revenue_tenant_isolation ON freightclub.carrier_revenue_daily
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-707: Shipper Preferred Carriers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipper_preferred_carriers' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.shipper_preferred_carriers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      shipper_id UUID NOT NULL,
      carrier_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_shipper_pref_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, shipper_id, carrier_id)
    );
    CREATE INDEX idx_shipper_pref_tenant_deleted ON freightclub.shipper_preferred_carriers(tenant_id, shipper_id, deleted_at);
    ALTER TABLE freightclub.shipper_preferred_carriers ENABLE ROW LEVEL SECURITY;
    CREATE POLICY shipper_pref_tenant_isolation ON freightclub.shipper_preferred_carriers
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-708: Load Assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'load_assignments' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.load_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      load_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      assigned_carrier_id UUID NOT NULL,
      assigned_by_shipper_id UUID NOT NULL,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      accepted_at TIMESTAMPTZ,
      accepted_by_carrier BOOLEAN,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_load_assignment_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, load_id)
    );
    CREATE INDEX idx_load_assignment_tenant_deleted ON freightclub.load_assignments(tenant_id, load_id, deleted_at);
    CREATE INDEX idx_load_assignment_carrier ON freightclub.load_assignments(tenant_id, assigned_carrier_id, deleted_at);
    CREATE INDEX idx_load_assignment_shipper ON freightclub.load_assignments(tenant_id, assigned_by_shipper_id, deleted_at);
    ALTER TABLE freightclub.load_assignments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY load_assignment_tenant_isolation ON freightclub.load_assignments
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-709: Blocked Carriers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_carriers' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.blocked_carriers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      shipper_id UUID NOT NULL,
      carrier_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ,
      CONSTRAINT fk_blocked_carrier_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
      UNIQUE(tenant_id, shipper_id, carrier_id)
    );
    CREATE INDEX idx_blocked_carrier_tenant_deleted ON freightclub.blocked_carriers(tenant_id, shipper_id, deleted_at);
    ALTER TABLE freightclub.blocked_carriers ENABLE ROW LEVEL SECURITY;
    CREATE POLICY blocked_carrier_tenant_isolation ON freightclub.blocked_carriers
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-711: Load Views (Engagement Tracking)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'load_views' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.load_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      load_id UUID NOT NULL,
      carrier_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      viewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_load_view_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
    );
    CREATE INDEX idx_load_view_tenant_load ON freightclub.load_views(tenant_id, load_id);
    CREATE INDEX idx_load_view_tenant_carrier ON freightclub.load_views(tenant_id, carrier_id);
    ALTER TABLE freightclub.load_views ENABLE ROW LEVEL SECURITY;
    CREATE POLICY load_view_tenant_isolation ON freightclub.load_views
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;

-- US-711: Carrier Profile Views (Engagement Tracking)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carrier_profile_views' AND table_schema = 'freightclub') THEN
    CREATE TABLE freightclub.carrier_profile_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      carrier_id UUID NOT NULL,
      shipper_id UUID NOT NULL,
      tenant_id UUID NOT NULL,
      viewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_carrier_profile_view_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
    );
    CREATE INDEX idx_carrier_profile_view_tenant_carrier ON freightclub.carrier_profile_views(tenant_id, carrier_id);
    CREATE INDEX idx_carrier_profile_view_tenant_shipper ON freightclub.carrier_profile_views(tenant_id, shipper_id);
    ALTER TABLE freightclub.carrier_profile_views ENABLE ROW LEVEL SECURITY;
    CREATE POLICY carrier_profile_view_tenant_isolation ON freightclub.carrier_profile_views
      USING (tenant_id = (SELECT COALESCE(current_setting('app.current_tenant_id', true)::uuid, (SELECT id FROM freightclub.tenants LIMIT 1))));
  END IF;
END $$;
