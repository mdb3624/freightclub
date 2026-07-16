-- US-302-v2: BOL Pickup Attestation (CHG-855)
-- Adds a carrier/OO-side pickup attestation record that locks the
-- platform-generated BOL as canonical, per /roast council recommendation.

DO $$ BEGIN
  CREATE TABLE freightclub.bol_attestations (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      load_id VARCHAR(36) NOT NULL UNIQUE REFERENCES freightclub.loads(id),
      trucker_id VARCHAR(36) NOT NULL,
      confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      exception_notes TEXT,
      exception_photo_document_id VARCHAR(36) REFERENCES freightclub.load_documents(id),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE
  );

  CREATE INDEX idx_bol_attestations_tenant_id ON freightclub.bol_attestations(tenant_id);
  CREATE INDEX idx_bol_attestations_load_id ON freightclub.bol_attestations(load_id);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE freightclub.load_documents ADD COLUMN locked BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE freightclub.load_documents ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE freightclub.bol_attestations ENABLE ROW LEVEL SECURITY;

  CREATE POLICY bol_attestations_tenant_isolation ON freightclub.bol_attestations
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant', true)::VARCHAR)
      WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::VARCHAR);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
