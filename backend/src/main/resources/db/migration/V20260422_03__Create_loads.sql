-- Loads table: Freight loads to be transported
CREATE TABLE freightclub.loads (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
    shipper_id CHAR(36) NOT NULL REFERENCES freightclub.users(id),
    trucker_id CHAR(36) REFERENCES freightclub.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    origin_city VARCHAR(100) NOT NULL,
    origin_state CHAR(2) NOT NULL,
    origin_zip VARCHAR(10) NOT NULL,
    origin_address_1 VARCHAR(500) NOT NULL,
    origin_address_2 VARCHAR(500),
    destination_city VARCHAR(100) NOT NULL,
    destination_state CHAR(2) NOT NULL,
    destination_zip VARCHAR(10) NOT NULL,
    destination_address_1 VARCHAR(500) NOT NULL,
    destination_address_2 VARCHAR(500),
    distance_miles NUMERIC(10, 2),
    pickup_from TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_to TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_from TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_to TIMESTAMP WITH TIME ZONE NOT NULL,
    commodity VARCHAR(255) NOT NULL,
    weight_lbs NUMERIC(12, 2) NOT NULL,
    length_ft NUMERIC(8, 2),
    width_ft NUMERIC(8, 2),
    height_ft NUMERIC(8, 2),
    equipment_type VARCHAR(20) NOT NULL,
    pay_rate NUMERIC(12, 2) NOT NULL,
    pay_rate_type VARCHAR(20) NOT NULL,
    payment_terms VARCHAR(20),
    special_requirements TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_origin_state CHECK (origin_state ~ '^[A-Z]{2}$'),
    CONSTRAINT check_dest_state CHECK (destination_state ~ '^[A-Z]{2}$'),
    CONSTRAINT check_weight_positive CHECK (weight_lbs > 0),
    CONSTRAINT check_pay_rate_positive CHECK (pay_rate >= 0)
);

CREATE INDEX idx_loads_tenant_status ON freightclub.loads(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_shipper ON freightclub.loads(shipper_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_trucker ON freightclub.loads(trucker_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_loads_deleted_at ON freightclub.loads(deleted_at);

-- Enable RLS on loads
ALTER TABLE freightclub.loads ENABLE ROW LEVEL SECURITY;
