ALTER TABLE loads
    ADD COLUMN origin_zip       VARCHAR(10) NOT NULL DEFAULT '' AFTER origin_address,
    ADD COLUMN destination_zip  VARCHAR(10) NOT NULL DEFAULT '' AFTER destination_address;
