-- Resize all US state fields to CHAR(2).
-- VARCHAR(50)/VARCHAR(100) permits "Illinois" to be stored. Trucker load board filters
-- match against 2-letter codes ("IL"), so a long-form value causes zero filter matches —
-- the load becomes invisible to truckers filtering by state.
--
-- Backfill: truncate any non-2-char values to the first 2 uppercase characters.
-- MVP data is expected to be clean 2-letter codes; this guard handles edge cases.

-- loads: origin and destination state
UPDATE loads
SET origin_state = UPPER(LEFT(TRIM(origin_state), 2))
WHERE LENGTH(TRIM(origin_state)) != 2;

UPDATE loads
SET destination_state = UPPER(LEFT(TRIM(destination_state), 2))
WHERE LENGTH(TRIM(destination_state)) != 2;

ALTER TABLE loads
    MODIFY COLUMN origin_state      CHAR(2) NOT NULL,
    MODIFY COLUMN destination_state CHAR(2) NOT NULL;

-- users: billing state and default pickup state (nullable — not all users set these)
UPDATE users
SET billing_state = UPPER(LEFT(TRIM(billing_state), 2))
WHERE billing_state IS NOT NULL AND LENGTH(TRIM(billing_state)) != 2;

UPDATE users
SET default_pickup_state = UPPER(LEFT(TRIM(default_pickup_state), 2))
WHERE default_pickup_state IS NOT NULL AND LENGTH(TRIM(default_pickup_state)) != 2;

ALTER TABLE users
    MODIFY COLUMN billing_state        CHAR(2) NULL,
    MODIFY COLUMN default_pickup_state CHAR(2) NULL;
