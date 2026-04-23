-- Carrier profiles table: Extended trucker profile data
CREATE TABLE freightclub.carrier_profiles (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
    user_id CHAR(36) NOT NULL UNIQUE REFERENCES freightclub.users(id),
    usdot_number VARCHAR(20) UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carrier_profiles_tenant_id ON freightclub.carrier_profiles(tenant_id);
CREATE INDEX idx_carrier_profiles_user_id ON freightclub.carrier_profiles(user_id);
CREATE INDEX idx_carrier_profiles_usdot ON freightclub.carrier_profiles(usdot_number);
