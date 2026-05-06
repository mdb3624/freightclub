-- Sprint 1: Create carrier_cost_profiles table with RLS
-- Supports [OO-CRIT-3] Cost profile / CPM formula (US-702, US-730)

CREATE TABLE IF NOT EXISTS carrier_cost_profiles (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  trucker_id VARCHAR(36) NOT NULL,
  monthly_fixed_costs DECIMAL(10, 2) NOT NULL CHECK (monthly_fixed_costs > 0),
  fuel_cost_per_gallon DECIMAL(5, 2) NOT NULL CHECK (fuel_cost_per_gallon > 0),
  miles_per_gallon DECIMAL(4, 1) NOT NULL CHECK (miles_per_gallon >= 3.0 AND miles_per_gallon <= 12.0),
  maintenance_cost_per_mile DECIMAL(4, 2) NOT NULL CHECK (maintenance_cost_per_mile > 0),
  monthly_miles_target INT NOT NULL CHECK (monthly_miles_target > 0),
  target_margin_per_mile DECIMAL(5, 2) NOT NULL CHECK (target_margin_per_mile > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_carrier_cost_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_carrier_cost_profiles_trucker FOREIGN KEY (trucker_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_carrier_cost_profiles_tenant_id ON carrier_cost_profiles(tenant_id);
CREATE INDEX idx_carrier_cost_profiles_trucker_id ON carrier_cost_profiles(trucker_id);
CREATE INDEX idx_carrier_cost_profiles_tenant_deleted ON carrier_cost_profiles(tenant_id, deleted_at);
CREATE INDEX idx_carrier_cost_profiles_active ON carrier_cost_profiles(tenant_id, trucker_id, deleted_at);
CREATE UNIQUE INDEX idx_carrier_cost_profiles_unique_active
  ON carrier_cost_profiles(tenant_id, trucker_id) WHERE deleted_at IS NULL;

-- Row-Level Security (RLS)
ALTER TABLE carrier_cost_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Restrict to current tenant
CREATE POLICY carrier_cost_profiles_tenant_isolation ON carrier_cost_profiles
  FOR ALL
  USING (tenant_id = CURRENT_SETTING('app.current_tenant_id'))
  WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id'));

