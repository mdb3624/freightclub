-- Fix loads.trucker_id FK to use ON DELETE SET NULL.
-- V20260320_002 added fk_loads_trucker without an ON DELETE clause, which defaults to
-- RESTRICT — blocking deletion of any user who has ever been assigned a load.
-- The correct behaviour is SET NULL: a deleted user leaves the load unclaimed and
-- available, rather than preventing the user record from being removed.

-- Step 1: Clean any orphaned trucker_id values that reference non-existent users.
-- These would violate the FK on re-add and must be nulled out first.
UPDATE loads
SET trucker_id = NULL
WHERE trucker_id IS NOT NULL
  AND trucker_id NOT IN (SELECT id FROM users);

-- Step 2: Drop the existing FK (added without ON DELETE behaviour).
ALTER TABLE loads DROP FOREIGN KEY fk_loads_trucker;

-- Step 3: Re-add with ON DELETE SET NULL.
ALTER TABLE loads
    ADD CONSTRAINT fk_loads_trucker
        FOREIGN KEY (trucker_id) REFERENCES users (id)
        ON DELETE SET NULL;
