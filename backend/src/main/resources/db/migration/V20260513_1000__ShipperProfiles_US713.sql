-- Create shipper_profiles table for US-713: Shipper Company Profile Setup
CREATE TABLE shipper_profiles (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  company_name VARCHAR(120) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(5) NOT NULL,
  mc_number VARCHAR(8),
  usdot_number VARCHAR(8),
  logo_url VARCHAR(500),
  completeness_pct INTEGER DEFAULT 0 CHECK (completeness_pct >= 0 AND completeness_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_shipper_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id) ON DELETE CASCADE
);

-- Indexes for multi-tenant filtering and publishing gate
CREATE INDEX idx_shipper_profiles_tenant ON shipper_profiles(tenant_id, deleted_at);
CREATE INDEX idx_shipper_profiles_completeness ON shipper_profiles(tenant_id, deleted_at, completeness_pct);

-- Enable RLS
ALTER TABLE shipper_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Implicit tenant_id filter via application layer
CREATE POLICY shipper_profiles_tenant_isolation ON shipper_profiles
  USING (tenant_id = current_setting('app.current_tenant_id') AND deleted_at IS NULL)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id') AND deleted_at IS NULL);

-- Grant permissions to runtime role
GRANT SELECT, INSERT, UPDATE ON shipper_profiles TO freightclub_runtime;
