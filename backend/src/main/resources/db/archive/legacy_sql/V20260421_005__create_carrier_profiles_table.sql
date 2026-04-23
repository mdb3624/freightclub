-- Carrier profiles used by the auto-match engine.
-- service_area stores a single primary city; multi-area support is future work (see debt ledger).

CREATE TABLE IF NOT EXISTS carrier_profiles (
    id                  VARCHAR(36)  PRIMARY KEY,
    tenant_id           VARCHAR(36)  NOT NULL,
    preferred_equipment VARCHAR(20)  NOT NULL,
    service_area        VARCHAR(100) NOT NULL,
    deleted_at          TIMESTAMPTZ
);

ALTER TABLE carrier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON carrier_profiles
    USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE INDEX IF NOT EXISTS idx_carrier_profiles_match
    ON carrier_profiles (tenant_id, preferred_equipment, service_area)
    WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON carrier_profiles TO app_user;
