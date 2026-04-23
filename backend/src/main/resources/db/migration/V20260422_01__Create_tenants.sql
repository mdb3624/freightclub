-- Tenants table: Multi-tenancy root
CREATE TABLE freightclub.tenants (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    join_code VARCHAR(12) UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'FREE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tenants_join_code ON freightclub.tenants(join_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_deleted_at ON freightclub.tenants(deleted_at);

-- Enable RLS on tenants
ALTER TABLE freightclub.tenants ENABLE ROW LEVEL SECURITY;
