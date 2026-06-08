-- Theme-State Schema Separation (Carrier vs Shipper)
-- Decouples user theme/preference state and role-specific telemetry to prevent
-- cross-persona data blending. See docs/plans/theme-state-separation.md.

-- ════════════════════════════════════════════════════════════════
-- user_preferences — shared theme/UI state, isolated per user
-- ════════════════════════════════════════════════════════════════
CREATE TABLE freightclub.user_preferences (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  theme_mode VARCHAR(20) NOT NULL DEFAULT 'SYSTEM' CHECK (theme_mode IN ('LIGHT', 'DARK', 'SYSTEM')),
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  dashboard_layout JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES freightclub.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_preferences_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_preferences_user UNIQUE (user_id)
);

CREATE INDEX idx_user_preferences_tenant ON freightclub.user_preferences(tenant_id, deleted_at);

-- ════════════════════════════════════════════════════════════════
-- carrier_telemetry — carrier-only operational telemetry
-- ════════════════════════════════════════════════════════════════
CREATE TABLE freightclub.carrier_telemetry (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  carrier_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  last_known_location public.geometry(Point, 4326),
  active_hours_today INTEGER NOT NULL DEFAULT 0,
  fuel_efficiency_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_carrier_telemetry_carrier FOREIGN KEY (carrier_id) REFERENCES freightclub.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_carrier_telemetry_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id) ON DELETE CASCADE,
  CONSTRAINT uq_carrier_telemetry_carrier UNIQUE (carrier_id)
);

CREATE INDEX idx_carrier_telemetry_tenant ON freightclub.carrier_telemetry(tenant_id, deleted_at);
CREATE INDEX idx_carrier_telemetry_location ON freightclub.carrier_telemetry USING GIST (last_known_location);

-- ════════════════════════════════════════════════════════════════
-- shipper_telemetry — shipper-only operational telemetry
-- ════════════════════════════════════════════════════════════════
CREATE TABLE freightclub.shipper_telemetry (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  shipper_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  load_posting_velocity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  preferred_carrier_engagement DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_shipper_telemetry_shipper FOREIGN KEY (shipper_id) REFERENCES freightclub.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_shipper_telemetry_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id) ON DELETE CASCADE,
  CONSTRAINT uq_shipper_telemetry_shipper UNIQUE (shipper_id)
);

CREATE INDEX idx_shipper_telemetry_tenant ON freightclub.shipper_telemetry(tenant_id, deleted_at);

-- ════════════════════════════════════════════════════════════════
-- Row-Level Security: tenant isolation on all three new tables
-- ════════════════════════════════════════════════════════════════
DO $$ BEGIN

  ALTER TABLE freightclub.user_preferences ENABLE ROW LEVEL SECURITY;

  CREATE POLICY user_preferences_select ON freightclub.user_preferences
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY user_preferences_insert ON freightclub.user_preferences
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY user_preferences_update ON freightclub.user_preferences
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY user_preferences_delete ON freightclub.user_preferences
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  ALTER TABLE freightclub.carrier_telemetry ENABLE ROW LEVEL SECURITY;

  CREATE POLICY carrier_telemetry_select ON freightclub.carrier_telemetry
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY carrier_telemetry_insert ON freightclub.carrier_telemetry
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY carrier_telemetry_update ON freightclub.carrier_telemetry
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY carrier_telemetry_delete ON freightclub.carrier_telemetry
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  ALTER TABLE freightclub.shipper_telemetry ENABLE ROW LEVEL SECURITY;

  CREATE POLICY shipper_telemetry_select ON freightclub.shipper_telemetry
    FOR SELECT
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY shipper_telemetry_insert ON freightclub.shipper_telemetry
    FOR INSERT
    WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY shipper_telemetry_update ON freightclub.shipper_telemetry
    FOR UPDATE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

  CREATE POLICY shipper_telemetry_delete ON freightclub.shipper_telemetry
    FOR DELETE
    USING (tenant_id = CURRENT_SETTING('app.current_tenant', true)::VARCHAR(36));

END $$;

-- Grant permissions to runtime role (RLS enforces row visibility)
GRANT SELECT, INSERT, UPDATE ON freightclub.user_preferences TO freightclub_runtime;
GRANT SELECT, INSERT, UPDATE ON freightclub.carrier_telemetry TO freightclub_runtime;
GRANT SELECT, INSERT, UPDATE ON freightclub.shipper_telemetry TO freightclub_runtime;
