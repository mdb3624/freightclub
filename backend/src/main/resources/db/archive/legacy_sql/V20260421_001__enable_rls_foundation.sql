-- RLS Security Foundation
-- Enables Row Level Security on all tenant-scoped tables.
-- The app_user role must NOT have BYPASSRLS; only the owner role (used by Flyway) may bypass.
-- Persistence adapters must SET app.current_tenant = '<uuid>' before each transaction
-- and clear it in a finally block to prevent connection pool leakage.

-- Step 1: Application role (no BYPASSRLS)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'change_me_in_prod';
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Step 2: Enable RLS — FORCE ensures the table owner is also subject to the policy
ALTER TABLE loads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads          FORCE ROW LEVEL SECURITY;

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          FORCE ROW LEVEL SECURITY;

ALTER TABLE claims         ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims         FORCE ROW LEVEL SECURITY;

ALTER TABLE load_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_events    FORCE ROW LEVEL SECURITY;

ALTER TABLE load_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_documents FORCE ROW LEVEL SECURITY;

ALTER TABLE load_ratings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_ratings   FORCE ROW LEVEL SECURITY;

ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  FORCE ROW LEVEL SECURITY;

-- Step 3: Tenant isolation policies (true = return empty string when variable unset, not error)
CREATE POLICY tenant_isolation ON loads
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON users
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON claims
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON load_events
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON load_documents
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON load_ratings
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY tenant_isolation ON notifications
  USING (tenant_id::text = current_setting('app.current_tenant', true));

-- Step 4: Composite indexes — tenant_id leads every index per ARCHITECTURE.md §2
CREATE INDEX IF NOT EXISTS idx_loads_tenant_status
  ON loads (tenant_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_loads_tenant_created
  ON loads (tenant_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_tenant_email
  ON users (tenant_id, email) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_claims_tenant_load
  ON claims (tenant_id, load_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user
  ON notifications (tenant_id, user_id) WHERE deleted_at IS NULL;

-- Step 5: carriers table (new module — ARCHITECTURE.md §3, Carrier module)
CREATE TABLE IF NOT EXISTS carriers (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID         NOT NULL REFERENCES tenants(id),
  mc_number    VARCHAR(20)  NOT NULL,
  dot_number   VARCHAR(20),
  company_name VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at   TIMESTAMPTZ
);

ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON carriers
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE INDEX idx_carriers_tenant_mc
  ON carriers (tenant_id, mc_number) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON carriers TO app_user;
