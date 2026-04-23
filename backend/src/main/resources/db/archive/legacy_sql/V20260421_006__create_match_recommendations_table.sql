-- Stores auto-match recommendations produced when a load is published.
-- Each row links one load to one eligible carrier within the same tenant.

CREATE TABLE IF NOT EXISTS match_recommendations (
    id          VARCHAR(36) PRIMARY KEY,
    load_id     VARCHAR(36) NOT NULL,
    tenant_id   VARCHAR(36) NOT NULL,
    carrier_id  VARCHAR(36) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE match_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_recommendations FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON match_recommendations
    USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE INDEX IF NOT EXISTS idx_match_recommendations_load
    ON match_recommendations (tenant_id, load_id);

GRANT SELECT, INSERT ON match_recommendations TO app_user;
