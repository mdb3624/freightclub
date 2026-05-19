-- Add 11 cost profile fields for Cost Per Mile (CPM) Calculator (US-757)
-- All fields are nullable to allow gradual adoption

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'truck_payment_lease') THEN
    ALTER TABLE freightclub.users ADD COLUMN truck_payment_lease NUMERIC(10, 2) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'insurance') THEN
    ALTER TABLE freightclub.users ADD COLUMN insurance NUMERIC(10, 2) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ifta_irp_permits') THEN
    ALTER TABLE freightclub.users ADD COLUMN ifta_irp_permits NUMERIC(10, 2) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_eld_misc') THEN
    ALTER TABLE freightclub.users ADD COLUMN phone_eld_misc NUMERIC(10, 2) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'per_diem_daily_rate') THEN
    ALTER TABLE freightclub.users ADD COLUMN per_diem_daily_rate NUMERIC(10, 2) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'per_diem_days_per_month') THEN
    ALTER TABLE freightclub.users ADD COLUMN per_diem_days_per_month INTEGER NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'fuel_cost_per_gallon') THEN
    ALTER TABLE freightclub.users ADD COLUMN fuel_cost_per_gallon NUMERIC(6, 3) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'miles_per_gallon') THEN
    ALTER TABLE freightclub.users ADD COLUMN miles_per_gallon NUMERIC(6, 2) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'maintenance_cost_per_mile') THEN
    ALTER TABLE freightclub.users ADD COLUMN maintenance_cost_per_mile NUMERIC(6, 4) NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'monthly_miles_target') THEN
    ALTER TABLE freightclub.users ADD COLUMN monthly_miles_target INTEGER NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'target_margin_per_mile') THEN
    ALTER TABLE freightclub.users ADD COLUMN target_margin_per_mile NUMERIC(6, 4) NULL;
  END IF;
END $$;
