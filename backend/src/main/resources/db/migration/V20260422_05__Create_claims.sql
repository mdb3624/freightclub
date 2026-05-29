-- Claims table: Load claims by truckers
DO $$ BEGIN
  CREATE TABLE freightclub.claims (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      load_id VARCHAR(36) NOT NULL REFERENCES freightclub.loads(id),
      trucker_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      claimed_at TIMESTAMP WITH TIME ZONE NOT NULL,
      released_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_claims_tenant_id ON freightclub.claims(tenant_id);
  CREATE INDEX idx_claims_load_id ON freightclub.claims(load_id);
  CREATE INDEX idx_claims_trucker_id ON freightclub.claims(trucker_id);
  CREATE INDEX idx_claims_status ON freightclub.claims(status);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
