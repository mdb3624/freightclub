-- Split loads.origin/destination into city+state; rename address → address_1; add address_2
-- Split users.billing_address / default_pickup_address into address_1 + address_2

-- ============================================================
-- LOADS
-- ============================================================

ALTER TABLE loads
    ADD COLUMN origin_city       VARCHAR(100) NULL,
    ADD COLUMN origin_state      VARCHAR(50)  NULL,
    ADD COLUMN origin_address_1  VARCHAR(500) NULL,
    ADD COLUMN origin_address_2  VARCHAR(500) NULL,
    ADD COLUMN destination_city      VARCHAR(100) NULL,
    ADD COLUMN destination_state     VARCHAR(50)  NULL,
    ADD COLUMN destination_address_1 VARCHAR(500) NULL,
    ADD COLUMN destination_address_2 VARCHAR(500) NULL;

-- Migrate: split "Chicago, IL" → city + state (last token after last comma)
UPDATE loads SET
    origin_city      = TRIM(SUBSTRING_INDEX(origin, ',', 1)),
    origin_state     = TRIM(SUBSTRING_INDEX(origin, ',', -1)),
    origin_address_1 = origin_address,
    destination_city      = TRIM(SUBSTRING_INDEX(destination, ',', 1)),
    destination_state     = TRIM(SUBSTRING_INDEX(destination, ',', -1)),
    destination_address_1 = destination_address;

ALTER TABLE loads
    MODIFY COLUMN origin_city       VARCHAR(100) NOT NULL,
    MODIFY COLUMN origin_state      VARCHAR(50)  NOT NULL,
    MODIFY COLUMN origin_address_1  VARCHAR(500) NOT NULL,
    MODIFY COLUMN destination_city      VARCHAR(100) NOT NULL,
    MODIFY COLUMN destination_state     VARCHAR(50)  NOT NULL,
    MODIFY COLUMN destination_address_1 VARCHAR(500) NOT NULL;

ALTER TABLE loads
    DROP COLUMN origin,
    DROP COLUMN origin_address,
    DROP COLUMN destination,
    DROP COLUMN destination_address;

-- ============================================================
-- USERS
-- ============================================================

ALTER TABLE users
    ADD COLUMN billing_address_1        VARCHAR(500) NULL,
    ADD COLUMN billing_address_2        VARCHAR(500) NULL,
    ADD COLUMN default_pickup_address_1 VARCHAR(500) NULL,
    ADD COLUMN default_pickup_address_2 VARCHAR(500) NULL;

UPDATE users SET
    billing_address_1        = billing_address,
    default_pickup_address_1 = default_pickup_address;

ALTER TABLE users
    DROP COLUMN billing_address,
    DROP COLUMN default_pickup_address;
