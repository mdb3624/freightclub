-- US-730a-v2: Cost Profile Wizard Redesign (CHG-US730-007)
-- Additive columns for the new wizard model; relaxes legacy NOT NULL
-- constraints so a wizard-only row (no legacy fields) can be created.

ALTER TABLE carrier_cost_profiles
  ADD COLUMN diesel_region VARCHAR(20),
  ADD COLUMN additional_cost_per_mile DECIMAL(10, 4),
  ADD COLUMN truck_payment_monthly DECIMAL(10, 2),
  ADD COLUMN insurance_monthly DECIMAL(10, 2),
  ADD COLUMN permits_monthly DECIMAL(10, 2),
  ADD COLUMN annual_miles INT,
  ADD COLUMN weekly_income_goal DECIMAL(10, 2),
  ADD COLUMN weeks_worked_per_year SMALLINT;

ALTER TABLE carrier_cost_profiles
  ADD CONSTRAINT chk_diesel_region
  CHECK (diesel_region IS NULL OR diesel_region IN ('EAST', 'MIDWEST', 'SOUTH', 'ROCKY', 'WEST'));

-- Legacy columns become nullable so a wizard-only profile (no legacy
-- inputs) can be inserted. Existing CHECK constraints on these columns
-- already pass automatically for NULL values in Postgres.
ALTER TABLE carrier_cost_profiles ALTER COLUMN monthly_fixed_costs DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN fuel_cost_per_gallon DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN maintenance_cost_per_mile DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN monthly_miles_target DROP NOT NULL;
ALTER TABLE carrier_cost_profiles ALTER COLUMN target_margin_per_mile DROP NOT NULL;
