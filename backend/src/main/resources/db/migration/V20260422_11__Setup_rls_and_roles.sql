-- Create application role with parameterized password
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'freightclub_runtime') THEN
        -- Password will be set via environment variable at connection time
        CREATE ROLE freightclub_runtime WITH LOGIN;
    END IF;
END
$$;

-- Grant schema access
GRANT USAGE ON SCHEMA freightclub TO freightclub_runtime;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA freightclub TO freightclub_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA freightclub TO freightclub_runtime;

-- Set default search path for the role
ALTER ROLE freightclub_runtime SET search_path TO freightclub, public;

-- Enable RLS policies
CREATE POLICY users_tenant_isolation ON freightclub.users
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY loads_tenant_isolation ON freightclub.loads
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY claims_tenant_isolation ON freightclub.claims
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY load_events_tenant_isolation ON freightclub.load_events
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY load_documents_tenant_isolation ON freightclub.load_documents
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY load_ratings_tenant_isolation ON freightclub.load_ratings
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY notifications_tenant_isolation ON freightclub.notifications
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

CREATE POLICY carrier_profiles_tenant_isolation ON freightclub.carrier_profiles
    FOR ALL TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant')::CHAR(36))
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::CHAR(36));

-- Force RLS on all tables
ALTER TABLE freightclub.users FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.loads FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.claims FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.load_events FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.load_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.load_ratings FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE freightclub.carrier_profiles FORCE ROW LEVEL SECURITY;
