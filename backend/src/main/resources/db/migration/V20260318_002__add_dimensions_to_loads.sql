ALTER TABLE loads
    ADD COLUMN length_ft DECIMAL(8, 2) NULL AFTER weight_lbs,
    ADD COLUMN width_ft  DECIMAL(8, 2) NULL AFTER length_ft,
    ADD COLUMN height_ft DECIMAL(8, 2) NULL AFTER width_ft;
