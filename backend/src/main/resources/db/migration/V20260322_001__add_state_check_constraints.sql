-- Add CHECK constraints enforcing 2-letter uppercase state codes.
-- V20260320_003 resized origin_state/destination_state to CHAR(2) and backfilled data,
-- but did not add CHECK constraints. Without them, any 2-char value (e.g. "XX", "99")
-- can still be inserted. The CHECK constrains the column to uppercase alpha pairs,
-- ensuring only well-formed state codes are accepted at the DB level.
--
-- MySQL 8.0+ enforces CHECK constraints on INSERT and UPDATE, and validates all
-- existing rows when the constraint is added via ALTER TABLE.

-- Step 1: Null out empty-string state values in users that would violate the constraint.
-- These were set to '' rather than NULL during initial registration (no state selected).
UPDATE users SET billing_state        = NULL WHERE billing_state        = '';
UPDATE users SET default_pickup_state = NULL WHERE default_pickup_state = '';

-- Step 2: Add CHECK constraints.
-- loads: origin and destination state (NOT NULL columns — no IS NULL needed)
ALTER TABLE loads
    ADD CONSTRAINT chk_loads_origin_state
        CHECK (origin_state REGEXP '^[A-Z]{2}$'),
    ADD CONSTRAINT chk_loads_destination_state
        CHECK (destination_state REGEXP '^[A-Z]{2}$');

-- users: billing state and default pickup state (nullable)
ALTER TABLE users
    ADD CONSTRAINT chk_users_billing_state
        CHECK (billing_state IS NULL OR billing_state REGEXP '^[A-Z]{2}$'),
    ADD CONSTRAINT chk_users_default_pickup_state
        CHECK (default_pickup_state IS NULL OR default_pickup_state REGEXP '^[A-Z]{2}$');
