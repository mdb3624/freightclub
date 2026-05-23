-- US-702: Load Recommendation Engine
-- Creates table for suggested loads based on equipment/lane matching

DO $$ BEGIN
  CREATE TABLE freightclub.load_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    load_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,
    match_score INT NOT NULL CHECK (match_score >= 1 AND match_score <= 200),
    match_reason JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_load FOREIGN KEY (load_id) REFERENCES freightclub.loads(id),
    CONSTRAINT fk_trucker FOREIGN KEY (trucker_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id),
    CONSTRAINT unique_recommendation UNIQUE(tenant_id, load_id, trucker_id)
  );

  -- Indexes for query performance
  CREATE INDEX idx_recommendations_trucker ON freightclub.load_recommendations(tenant_id, trucker_id, deleted_at);
  CREATE INDEX idx_recommendations_load ON freightclub.load_recommendations(load_id, deleted_at);
  CREATE INDEX idx_recommendations_score ON freightclub.load_recommendations(match_score DESC);

  -- Row-Level Security
  ALTER TABLE freightclub.load_recommendations ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "load_recommendations_tenant"
    ON freightclub.load_recommendations
    USING (tenant_id = current_setting('app.current_tenant')::varchar)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::varchar);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
