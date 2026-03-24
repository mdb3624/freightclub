-- Add missing indexes for trucker load board filter patterns.
-- The primary trucker query filters by equipment_type + status, origin_state,
-- and pickup_from — none of these have selective composite indexes, causing
-- full tenant-scoped table scans on every load board page load.

-- Filter by equipment type + status (most common trucker filter combination)
CREATE INDEX idx_loads_tenant_equip_status
    ON loads (tenant_id, equipment_type, status);

-- Filter by origin state
CREATE INDEX idx_loads_tenant_origin_state
    ON loads (tenant_id, origin_state);

-- Filter by pickup date + status (pickup date filter on load board)
CREATE INDEX idx_loads_tenant_pickup_status
    ON loads (tenant_id, pickup_from, status);

-- Trucker's own active/history load lookup
CREATE INDEX idx_loads_trucker_status
    ON loads (trucker_id, status);
