-- Adds search/filter fields to load_aggregates for the Load Board query feature.
-- All columns are nullable to preserve backward compatibility with existing rows.

ALTER TABLE load_aggregates
    ADD COLUMN IF NOT EXISTS origin_city  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS equipment_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS pay_rate     NUMERIC(10, 2);

-- Partial index covering the most common load-board query pattern
CREATE INDEX IF NOT EXISTS idx_load_aggregates_search
    ON load_aggregates (tenant_id, status, equipment_type)
    WHERE deleted_at IS NULL AND status = 'PUBLISHED';
