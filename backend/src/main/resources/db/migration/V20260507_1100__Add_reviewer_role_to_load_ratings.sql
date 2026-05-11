-- Add reviewer_role column to load_ratings to support bidirectional rating queries
ALTER TABLE freightclub.load_ratings
    ADD COLUMN IF NOT EXISTS reviewer_role VARCHAR(10) NOT NULL DEFAULT 'TRUCKER';

-- Remove the default after backfilling existing rows (role is now required on insert)
ALTER TABLE freightclub.load_ratings
    ALTER COLUMN reviewer_role DROP DEFAULT;
