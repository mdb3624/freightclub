-- Carrier profiles table: Extended trucker profile data
DO $$ BEGIN
  CREATE TABLE freightclub.carrier_profiles (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      preferred_equipment VARCHAR(20) NOT NULL,
      service_area VARCHAR(100) NOT NULL,
      deleted_at TIMESTAMPTZ
  );

  CREATE INDEX idx_carrier_profiles_tenant_id ON freightclub.carrier_profiles(tenant_id);
  ALTER TABLE freightclub.carrier_profiles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "carrier_profiles_tenant"
    ON freightclub.carrier_profiles
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
