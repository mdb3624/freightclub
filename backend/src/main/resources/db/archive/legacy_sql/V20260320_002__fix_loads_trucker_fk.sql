-- Add missing FK constraint from loads.trucker_id to users.id.
-- V20260313_001 added the column and an index but no FK constraint, leaving
-- referential integrity unenforced at the DB level. Compare: loads.shipper_id
-- already has fk_loads_shipper. This closes the same gap for trucker_id.

ALTER TABLE loads
    ADD CONSTRAINT fk_loads_trucker FOREIGN KEY (trucker_id) REFERENCES users (id);
