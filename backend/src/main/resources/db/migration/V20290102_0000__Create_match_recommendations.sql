-- Match recommendations table: Suggested carrier matches for loads
DO $$ BEGIN
  CREATE TABLE freightclub.match_recommendations (
      id VARCHAR(36) PRIMARY KEY,
      load_id VARCHAR(36) NOT NULL REFERENCES freightclub.loads(id),
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      carrier_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
      match_score INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_match_recommendations_load ON freightclub.match_recommendations(load_id);
  CREATE INDEX idx_match_recommendations_carrier ON freightclub.match_recommendations(carrier_id);
  CREATE INDEX idx_match_recommendations_tenant ON freightclub.match_recommendations(tenant_id);

  ALTER TABLE freightclub.match_recommendations ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "match_recommendations_tenant"
    ON freightclub.match_recommendations
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
