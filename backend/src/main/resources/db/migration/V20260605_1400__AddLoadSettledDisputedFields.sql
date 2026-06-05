-- US-506: Add settled_at, disputed_at, dispute_reason to loads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'loads' AND column_name = 'settled_at'
    ) THEN
        ALTER TABLE loads ADD COLUMN settled_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'loads' AND column_name = 'disputed_at'
    ) THEN
        ALTER TABLE loads ADD COLUMN disputed_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'loads' AND column_name = 'dispute_reason'
    ) THEN
        ALTER TABLE loads ADD COLUMN dispute_reason TEXT;
    END IF;
END $$;
