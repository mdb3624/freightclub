ALTER TABLE loads
    ADD COLUMN origin_address      VARCHAR(500)   NOT NULL DEFAULT '' AFTER origin,
    ADD COLUMN destination_address VARCHAR(500)   NOT NULL DEFAULT '' AFTER destination,
    ADD COLUMN distance_miles      DECIMAL(8,2)   NULL     AFTER destination_address;
