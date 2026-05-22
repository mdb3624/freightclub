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

-- Enable RLS policies (using VARCHAR not CHAR to match column type)
CREATE POLICY users_tenant_isolation ON freightclub.users
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY loads_tenant_isolation ON freightclub.loads
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY claims_tenant_isolation ON freightclub.claims
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY load_events_tenant_isolation ON freightclub.load_events
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY load_documents_tenant_isolation ON freightclub.load_documents
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY load_ratings_tenant_isolation ON freightclub.load_ratings
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY notifications_tenant_isolation ON freightclub.notifications
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

CREATE POLICY carrier_profiles_tenant_isolation ON freightclub.carrier_profiles
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::VARCHAR)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::VARCHAR);

-- Enable RLS on all tables (but do NOT force it - allows superuser bypass for tests)
ALTER TABLE freightclub.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.load_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.load_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.load_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE freightclub.carrier_profiles ENABLE ROW LEVEL SECURITY;
