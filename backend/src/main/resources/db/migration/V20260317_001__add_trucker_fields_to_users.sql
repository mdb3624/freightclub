ALTER TABLE users
    ADD COLUMN mc_number    VARCHAR(20)  NULL AFTER default_pickup_zip,
    ADD COLUMN dot_number   VARCHAR(20)  NULL AFTER mc_number,
    ADD COLUMN equipment_type VARCHAR(30) NULL AFTER dot_number;
