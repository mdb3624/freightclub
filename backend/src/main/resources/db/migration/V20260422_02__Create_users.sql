-- Users table: Authentication & profile data
DO $$ BEGIN
  CREATE TABLE freightclub.users (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      business_name VARCHAR(255),
      phone VARCHAR(20),
      billing_address_1 VARCHAR(500),
      billing_address_2 VARCHAR(500),
      billing_city VARCHAR(100),
      billing_state VARCHAR(2),
      billing_zip VARCHAR(10),
      default_pickup_address_1 VARCHAR(500),
      default_pickup_address_2 VARCHAR(500),
      default_pickup_city VARCHAR(100),
      default_pickup_state VARCHAR(2),
      default_pickup_zip VARCHAR(10),
      mc_number VARCHAR(20),
      dot_number VARCHAR(20),
      equipment_type VARCHAR(30),
      monthly_fixed_costs NUMERIC(10, 2),
      fuel_cost_per_gallon NUMERIC(6, 3),
      miles_per_gallon NUMERIC(6, 2),
      maintenance_cost_per_mile NUMERIC(6, 4),
      monthly_miles_target INTEGER,
      target_margin_per_mile NUMERIC(6, 4),
      notify_email BOOLEAN NOT NULL DEFAULT TRUE,
      notify_sms BOOLEAN NOT NULL DEFAULT FALSE,
      notify_in_app BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE,
      CONSTRAINT uc_email_per_tenant UNIQUE (tenant_id, email)
  );

  CREATE INDEX idx_users_tenant_id ON freightclub.users(tenant_id) WHERE deleted_at IS NULL;
  CREATE INDEX idx_users_email ON freightclub.users(email) WHERE deleted_at IS NULL;
  CREATE INDEX idx_users_deleted_at ON freightclub.users(deleted_at);

  -- Enable RLS on users
  ALTER TABLE freightclub.users ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
