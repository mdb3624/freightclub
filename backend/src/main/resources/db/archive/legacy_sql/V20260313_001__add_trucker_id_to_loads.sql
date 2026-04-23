ALTER TABLE loads
    ADD COLUMN trucker_id CHAR(36) NULL AFTER shipper_id;

CREATE INDEX idx_loads_trucker_id ON loads (trucker_id);
