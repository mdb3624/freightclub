-- Add pickup and delivery timestamps to loads table
ALTER TABLE freightclub.loads ADD COLUMN picked_up_at TIMESTAMPTZ;
ALTER TABLE freightclub.loads ADD COLUMN delivered_at TIMESTAMPTZ;

-- Ensure constraints (optional, status check)
COMMENT ON COLUMN freightclub.loads.picked_up_at IS 'Timestamp when the trucker marked the load as picked up (en route)';
COMMENT ON COLUMN freightclub.loads.delivered_at IS 'Timestamp when the trucker marked the load as delivered';
